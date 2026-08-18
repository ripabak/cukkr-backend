/**
 * LIVE Xendit sandbox verification — uses REAL test credentials from .env.
 *
 * NOT part of the hermetic suite: run manually with
 *   bun --env-file=.env run scripts/xendit-live-test.ts
 *
 * It exercises the real path: create invoice on Xendit (QRIS), verify the
 * secret key works for reads, deliver a webhook with the REAL callback token,
 * and confirm the subscription activates (user data changes on payment).
 */
// Mark file as a module so top-level await is valid TypeScript.
export {}

process.env.NODE_ENV = 'test' // skip email verification so signup yields a session

const { treaty } = await import('@elysiajs/eden')
const { app } = await import('../src/app')
const { db } = await import('../src/lib/database')
const { subscription, subscriptionPayment } =
	await import('../src/modules/billing/schema')
const { eq } = await import('drizzle-orm')
const { env } = await import('../src/lib/env')

const tClient = treaty(app)
const XENDIT_SECRET = env.XENDIT_SECRET_API_KEY
const XENDIT_TOKEN = env.XENDIT_WEBHOOK_TOKEN

const log = (label: string, value: unknown) =>
	console.log(`\n▶ ${label}\n  ${JSON.stringify(value, null, 2)}`)

function check(cond: boolean, label: string) {
	const mark = cond ? '✅' : '❌'
	console.log(`${mark} ${label}`)
	if (!cond) process.exitCode = 1
}

if (!XENDIT_SECRET || !XENDIT_TOKEN) {
	console.error(
		'❌ XENDIT_SECRET_API_KEY / XENDIT_WEBHOOK_TOKEN missing in .env'
	)
	process.exit(1)
}

const email = `live_${Date.now()}@example.com`
const res = await (tClient as any).auth.api['sign-up'].email.post({
	email,
	password: 'password123',
	name: 'Live Xendit Tester'
})
const setCookie = res.response?.headers.get('set-cookie') ?? ''
const cookie = `${setCookie.split(';')[0].split('=')[0]}=${setCookie
	.split(';')[0]
	.split('=')
	.slice(1)
	.join('=')}`
const userId = res.data?.user?.id ?? ''
check(Boolean(userId) && Boolean(cookie), 'sign-up + session cookie')

try {
	// 1. Initial subscription = free
	const before = await tClient.api.billing.subscription.get({
		fetch: { headers: { cookie } }
	})
	check(
		before.data?.data.planId === 'free',
		`initial plan is free (got ${before.data?.data.planId})`
	)

	// 2. Real checkout → Xendit creates a hosted QRIS invoice
	const checkout = await tClient.api.billing.subscription.checkout.post(
		{ planId: 'premium', paymentMethod: 'QRIS' },
		{ fetch: { headers: { cookie } } }
	)
	check(
		checkout.status === 200,
		`checkout returns 200 (got ${checkout.status})`
	)
	const { invoiceUrl, xenditInvoiceId, amount } = checkout.data?.data ?? {}
	log('checkout result', checkout.data?.data)
	check(
		Boolean(String(invoiceUrl ?? '').includes('xendit.co')),
		'invoiceUrl points to Xendit hosted page (staging)'
	)
	check(amount === 99_000, 'amount matches catalog price')

	// 3. Secret key works for reads — fetch the invoice from Xendit API directly
	const fetchRes = await fetch(
		`${env.XENDIT_API_URL}/v2/invoices/${xenditInvoiceId}`,
		{
			headers: {
				Authorization: `Basic ${Buffer.from(`${XENDIT_SECRET}:`).toString('base64')}`
			}
		}
	)
	const xInvoice = (await fetchRes.json()) as Record<string, unknown>
	check(
		fetchRes.status === 200,
		`GET /v2/invoices from Xendit (status ${fetchRes.status})`
	)
	log('xendit invoice state', {
		id: xInvoice.id,
		external_id: xInvoice.external_id,
		status: xInvoice.status,
		currency: xInvoice.currency,
		amount: xInvoice.amount
	})
	check(
		xInvoice.status === 'PENDING',
		`invoice is PENDING on Xendit (got ${xInvoice.status})`
	)
	check(
		String(xInvoice.external_id ?? '').startsWith('cukkr_'),
		'external_id = our reference_id (idempotency key)'
	)

	// 4. Deliver the invoice.paid webhook ourselves with the REAL callback token
	//    (simulates exactly what Xendit posts; also proves token verification).
	const w = await tClient.api.billing.webhook.xendit.post(
		{
			id: xenditInvoiceId,
			external_id: xInvoice.external_id,
			status: 'PAID',
			amount: 99_000,
			paid_at: new Date().toISOString(),
			payment_id: 'pay_test_live',
			payment_channel: 'QRIS'
		},
		{ fetch: { headers: { 'x-callback-token': XENDIT_TOKEN } } }
	)
	check(
		w.status === 200 && w.data?.data.paymentStatus === 'paid',
		`webhook PAID accepted with real token (${w.data?.data.paymentStatus})`
	)

	// 5. Subscription must now be ACTIVE — user data changed because of payment
	const after = await tClient.api.billing.subscription.get({
		fetch: { headers: { cookie } }
	})
	const sub = after.data?.data
	log('subscription after payment', sub)
	check(
		sub?.planId === 'premium',
		`plan upgraded to premium (got ${sub?.planId})`
	)
	check(sub?.status === 'active', `status active (got ${sub?.status})`)
	check(sub?.plan?.name === 'Premium', 'plan payload resolves')
	const periodEnd = sub?.currentPeriodEnd
		? new Date(sub.currentPeriodEnd).getTime()
		: 0
	const inOneMonth = Date.now() + 30 * 24 * 60 * 60 * 1000
	check(
		Math.abs(periodEnd - inOneMonth) < 3 * 24 * 60 * 60 * 1000,
		'period end ≈ +1 month'
	)

	// 6. Duplicate webhook → idempotent, no double extension
	const beforeDup = sub?.currentPeriodEnd
	await tClient.api.billing.webhook.xendit.post(
		{ id: xenditInvoiceId, status: 'PAID', amount: 99_000 },
		{ fetch: { headers: { 'x-callback-token': XENDIT_TOKEN } } }
	)
	const afterDup = (
		await tClient.api.billing.subscription.get({
			fetch: { headers: { cookie } }
		})
	).data?.data.currentPeriodEnd
	check(
		new Date(String(afterDup)).getTime() ===
			new Date(String(beforeDup)).getTime(),
		'duplicate PAID webhook did not extend the period'
	)

	// 7. Wrong token → 401
	const bad = await tClient.api.billing.webhook.xendit.post(
		{ id: xenditInvoiceId, status: 'PAID', amount: 99_000 },
		{ fetch: { headers: { 'x-callback-token': 'wrong-token' } } }
	)
	check(
		bad.status === 401,
		`bad callback token rejected (status ${bad.status})`
	)

	// 8. OPTIONAL — ask Xendit to simulate the real payment (then THEIR webhook
	//    fires to the configured URL; our handler dedupes it).
	try {
		const sim = await fetch(
			`${env.XENDIT_API_URL}/v2/invoices/${xenditInvoiceId}/simulate!`,
			{
				method: 'POST',
				headers: {
					Authorization: `Basic ${Buffer.from(`${XENDIT_SECRET}:`).toString('base64')}`,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({})
			}
		)
		const simBody = await sim.text()
		console.log(
			sim.status === 200
				? '\nℹ️ Xendit simulate-payment called — if your dashboard webhook URL is reachable, the REAL webhook will arrive (handler is idempotent).'
				: `\nℹ️ simulate endpoint skipped/unsupported at this env (${sim.status} ${simBody.slice(0, 120)})`
		)
	} catch {
		console.log('\nℹ️ simulate endpoint unavailable — skipping')
	}

	console.log('\n──────────────────────────────────────────────')
	console.log('OPEN THE INVOICE URL TO SEE THE QRIS CHECKOUT:')
	console.log(invoiceUrl)
	console.log('──────────────────────────────────────────────')
} finally {
	// Hermetic cleanup — remove test rows so reruns stay clean.
	await db
		.delete(subscriptionPayment)
		.where(eq(subscriptionPayment.userId, userId))
		.catch(() => {})
	await db
		.delete(subscription)
		.where(eq(subscription.userId, userId))
		.catch(() => {})
	console.log('\n🧹 test rows cleaned up')
}
