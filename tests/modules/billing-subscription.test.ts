import { afterAll, beforeAll, describe, expect, it } from 'bun:test'
import { treaty } from '@elysiajs/eden'

// Configure gateway vars BEFORE the app (and env.ts) is imported.
process.env.XENDIT_SECRET_API_KEY = 'xnd_development_test_key'
process.env.XENDIT_WEBHOOK_TOKEN = 'test-webhook-token'

// Stub the thin Xendit layer — tests must never hit the real gateway.
// Invoice ids are unique PER RUN so reruns never collide on the DB's
// unique constraint (xendit_invoice_id) with rows left by earlier runs.
const RUN_SEED = `r${Date.now()}`
let invoiceCounter = 0
const mockXendit = {
	XenditService: {
		createInvoice: async ({ amount }: { amount: number }) => ({
			id: `inv_mock_${RUN_SEED}_${++invoiceCounter}`,
			invoiceUrl: 'https://checkout.xendit.co/web/mock',
			status: 'PENDING',
			externalId: `cukkr_mock_${RUN_SEED}`,
			amount,
			currency: 'IDR'
		}),
		verifyWebhookToken: (token: string | null | undefined) =>
			token === process.env.XENDIT_WEBHOOK_TOKEN,
		expireInvoice: async (invoiceId: string) => {
			expiredInvoices.push(invoiceId)
			return true
		}
	}
}
// Track invoices force-expired via XenditService.expireInvoice during tests.
const expiredInvoices: string[] = []

const { app } = await import('../../src/app')
const { XenditService } = await import('../../src/lib/xendit')
Object.assign(XenditService, mockXendit.XenditService)

const { BillingService } = await import('../../src/modules/billing/service')
const { db } = await import('../../src/lib/database')
const { subscription, subscriptionPayment } =
	await import('../../src/modules/billing/schema')
const { and, eq } = await import('drizzle-orm')

const tClient = treaty(app)

describe('Billing Subscription (Xendit sandbox flow)', () => {
	let testUser = ''
	let authCookie = ''
	let premiumInvoiceId = ''
	let businessInvoiceId = ''

	beforeAll(async () => {
		const email = `billing_${Date.now()}@example.com`
		const res = await (tClient as any).auth.api['sign-up'].email.post({
			email,
			password: 'password123',
			name: 'Billing Tester'
		})

		const setCookie = res.response?.headers.get('set-cookie')
		if (setCookie) {
			const cookieName = setCookie.split(';')[0].split('=')[0]
			const cookieValue = setCookie
				.split(';')[0]
				.split('=')
				.slice(1)
				.join('=')
			authCookie = `${cookieName}=${cookieValue}`
		}
		testUser = res.data?.user?.id ?? ''
		expect(authCookie).not.toBe('')
		expect(testUser).not.toBe('')
	})

	afterAll(async () => {
		if (testUser) {
			await db
				.delete(subscriptionPayment)
				.where(eq(subscriptionPayment.userId, testUser))
				.catch(() => {})
			await db
				.delete(subscription)
				.where(eq(subscription.userId, testUser))
				.catch(() => {})
		}
	})

	it('rejects checkout without auth', async () => {
		const { status } = await tClient.api.billing.subscription.checkout.post(
			{
				planId: 'premium',
				paymentMethod: 'QRIS'
			}
		)
		expect(status).toBe(401)
	})

	it('starts a checkout and returns a hosted invoice URL', async () => {
		const { status, data } =
			await tClient.api.billing.subscription.checkout.post(
				{ planId: 'premium', paymentMethod: 'QRIS' },
				{ fetch: { headers: { cookie: authCookie } } }
			)
		expect(status).toBe(200)
		expect(data?.data.invoiceUrl).toContain('checkout.xendit.co')
		expect(data?.data.amount).toBe(99_000)
		expect(data?.data.planId).toBe('premium')
		premiumInvoiceId = data?.data.xenditInvoiceId ?? ''
		expect(premiumInvoiceId).not.toBe('')
	})

	it('rejects a payment method that is not enabled yet', async () => {
		const { status } = await tClient.api.billing.subscription.checkout.post(
			{ planId: 'premium', paymentMethod: 'DANA' },
			{ fetch: { headers: { cookie: authCookie } } }
		)
		expect(status).toBe(400)
	})

	it('rejects business plan checkout — contact sales only', async () => {
		const { status } = await tClient.api.billing.subscription.checkout.post(
			{ planId: 'business' },
			{ fetch: { headers: { cookie: authCookie } } }
		)
		expect(status).toBe(400)
	})

	it('marks business plan as requiresContact in the catalog', async () => {
		const { data } = await tClient.api.billing.plans.get()
		const business = data?.data.find((p) => p.id === 'business')
		expect(business?.requiresContact).toBe(true)
		const premium = data?.data.find((p) => p.id === 'premium')
		expect(premium?.requiresContact).toBe(false)
	})

	it('new user has free as the effective plan', async () => {
		const { data } = await tClient.api.billing.subscription.get({
			fetch: { headers: { cookie: authCookie } }
		})
		expect(data?.data.planId).toBe('free')
		expect(data?.data.status).toBe('free')
	})

	it('activates the subscription on a PAID webhook (invoice.paid)', async () => {
		const { status, data } = await tClient.api.billing.webhook.xendit.post(
			{
				id: premiumInvoiceId,
				external_id: 'cukkr_mock',
				status: 'PAID',
				amount: 99_000,
				paid_at: new Date().toISOString(),
				payment_id: 'pay_mock_1'
			},
			{ fetch: { headers: { 'x-callback-token': 'test-webhook-token' } } }
		)
		expect(status).toBe(200)
		expect(data?.data.paymentStatus).toBe('paid')

		const sub = await tClient.api.billing.subscription.get({
			fetch: { headers: { cookie: authCookie } }
		})
		expect(sub.data?.data.planId).toBe('premium')
		expect(sub.data?.data.status).toBe('active')
		expect(sub.data?.data.plan?.name).toBe('Premium')
		expect(sub.data?.data.currentPeriodEnd).not.toBeNull()
	})

	it('is idempotent — duplicate PAID webhook does not extend the period twice', async () => {
		const before = await tClient.api.billing.subscription.get({
			fetch: { headers: { cookie: authCookie } }
		})

		const { data } = await tClient.api.billing.webhook.xendit.post(
			{
				id: premiumInvoiceId,
				external_id: 'cukkr_mock',
				status: 'PAID',
				amount: 99_000
			},
			{ fetch: { headers: { 'x-callback-token': 'test-webhook-token' } } }
		)
		expect(data?.data.paymentStatus).toBe('paid')

		const after = await tClient.api.billing.subscription.get({
			fetch: { headers: { cookie: authCookie } }
		})
		// Treaty decodes ISO strings into Date objects in-process, so compare
		// normalized instants (same instant ⇒ the period was NOT extended twice).
		const norm = (d: unknown) =>
			d ? new Date(d as string).getTime() : null
		expect(norm(after.data?.data.currentPeriodEnd)).toBe(
			norm(before.data?.data.currentPeriodEnd)
		)
		expect(after.data?.data.planId).toBe('premium')
	})

	it('rejects webhooks with an invalid callback token (401)', async () => {
		const res = await tClient.api.billing.webhook.xendit.post(
			{ id: premiumInvoiceId, status: 'PAID', amount: 99_000 },
			{ fetch: { headers: { 'x-callback-token': 'wrong-token' } } }
		)
		expect(res.status).toBe(401)
	})

	it('EXPIRED webhook marks the payment expired without touching the active subscription', async () => {
		// Business tidak bisa checkout (contact sales) — pakai premium untuk tes EXPIRED.
		const checkout = await tClient.api.billing.subscription.checkout.post(
			{ planId: 'premium' },
			{ fetch: { headers: { cookie: authCookie } } }
		)
		businessInvoiceId = checkout.data?.data.xenditInvoiceId ?? ''
		expect(businessInvoiceId).not.toBe('')

		await tClient.api.billing.webhook.xendit.post(
			{
				id: businessInvoiceId,
				external_id: 'cukkr_mock',
				status: 'EXPIRED',
				amount: 299_000
			},
			{ fetch: { headers: { 'x-callback-token': 'test-webhook-token' } } }
		)

		const sub = await tClient.api.billing.subscription.get({
			fetch: { headers: { cookie: authCookie } }
		})
		// Still on premium from the earlier successful payment.
		expect(sub.data?.data.planId).toBe('premium')
		expect(sub.data?.data.status).toBe('active')
	})

	it('rejects a PAID webhook whose amount does not match the plan price', async () => {
		const checkout = await tClient.api.billing.subscription.checkout.post(
			{ planId: 'premium' },
			{ fetch: { headers: { cookie: authCookie } } }
		)
		const mismatchInvoiceId = checkout.data?.data.xenditInvoiceId ?? ''

		const res = await tClient.api.billing.webhook.xendit.post(
			{
				id: mismatchInvoiceId,
				external_id: 'cukkr_mock',
				status: 'PAID',
				amount: 1
			},
			{ fetch: { headers: { 'x-callback-token': 'test-webhook-token' } } }
		)
		expect(res.status).toBe(400)
	})

	it('expires overdue subscriptions (expire date)', async () => {
		// Reset the user's subscription, then backdate activation so the period
		// is already over and the daily cron logic must flip it to EXPIRED.
		await db.delete(subscription).where(eq(subscription.userId, testUser))
		await BillingService.activateOrRenew(
			testUser,
			'premium',
			new Date(Date.now() - 40 * 24 * 60 * 60 * 1000)
		)
		const expiredCount = await BillingService.expireOverdueSubscriptions()
		expect(expiredCount).toBeGreaterThanOrEqual(1)

		const sub = await tClient.api.billing.subscription.get({
			fetch: { headers: { cookie: authCookie } }
		})
		expect(sub.data?.data.planId).toBe('free')
		expect(sub.data?.data.status).toBe('expired')
	})

	it('does not stack unpaid invoices — expires the old pending and creates a fresh one', async () => {
		// Tidak ada pending → invoice baru A dibuat
		const first = await tClient.api.billing.subscription.checkout.post(
			{ planId: 'premium' },
			{ fetch: { headers: { cookie: authCookie } } }
		)
		expect(first.status).toBe(200)
		expect(first.data?.data.invoiceUrl).toContain('checkout.xendit.co')

		// Checkout lagi sebelum membayar → yang lama di-expire otomatis,
		// dibuatkan invoice BARU (bukan menumpuk, bukan reuse URL lama)
		const second = await tClient.api.billing.subscription.checkout.post(
			{ planId: 'premium' },
			{ fetch: { headers: { cookie: authCookie } } }
		)
		expect(second.status).toBe(200)
		expect(second.data?.data.xenditInvoiceId).not.toBe(
			first.data?.data.xenditInvoiceId
		)
		expect(second.data?.data.invoiceId).not.toBe(first.data?.data.invoiceId)

		// Invoice lama benar-benar di-expire (tercatat di mock + row jadi expired)
		expect(expiredInvoices).toContain(
			first.data?.data.xenditInvoiceId ?? ''
		)
		const [oldAfter] = await db
			.select({ status: subscriptionPayment.status })
			.from(subscriptionPayment)
			.where(eq(subscriptionPayment.id, first.data?.data.invoiceId ?? ''))
		expect(oldAfter?.status).toBe('expired')

		// Hanya SATU pending yang tersisa untuk user+plan ini (yang baru)
		const pendingRows = await db
			.select({ id: subscriptionPayment.id })
			.from(subscriptionPayment)
			.where(
				and(
					eq(subscriptionPayment.userId, testUser),
					eq(subscriptionPayment.planId, 'premium'),
					eq(subscriptionPayment.status, 'pending')
				)
			)
		expect(pendingRows).toHaveLength(1)
		expect(pendingRows[0]?.id).toBe(second.data?.data.invoiceId ?? '')
	})

	it('expires a stale pending invoice and creates a new one', async () => {
		const [old] = await db
			.select({
				id: subscriptionPayment.id,
				xenditInvoiceId: subscriptionPayment.xenditInvoiceId
			})
			.from(subscriptionPayment)
			.where(
				and(
					eq(subscriptionPayment.userId, testUser),
					eq(subscriptionPayment.planId, 'premium'),
					eq(subscriptionPayment.status, 'pending')
				)
			)
		expect(old).toBeDefined()

		// Backdate expiry past 24h so the pending invoice is stale
		await db
			.update(subscriptionPayment)
			.set({ expiresAt: new Date(Date.now() - 60_000) })
			.where(eq(subscriptionPayment.id, old!.id))

		const checkout = await tClient.api.billing.subscription.checkout.post(
			{ planId: 'premium' },
			{ fetch: { headers: { cookie: authCookie } } }
		)
		expect(checkout.status).toBe(200)
		// Different invoice than the stale one
		expect(checkout.data?.data.xenditInvoiceId).not.toBe(
			old!.xenditInvoiceId
		)

		// Old row flipped to expired, new pending row created
		const [oldAfter] = await db
			.select({ status: subscriptionPayment.status })
			.from(subscriptionPayment)
			.where(eq(subscriptionPayment.id, old!.id))
		expect(oldAfter?.status).toBe('expired')

		const [fresh] = await db
			.select({ id: subscriptionPayment.id })
			.from(subscriptionPayment)
			.where(
				and(
					eq(subscriptionPayment.userId, testUser),
					eq(subscriptionPayment.planId, 'premium'),
					eq(subscriptionPayment.status, 'pending')
				)
			)
		expect(fresh?.id).toBe(checkout.data?.data.invoiceId ?? '')
	})

	it('GET /payments lists pending invoices with their invoice URL', async () => {
		const { data } = await tClient.api.billing.payments.get({
			fetch: { headers: { cookie: authCookie } }
		})
		const pending = data?.data.filter((p) => p.status === 'pending') ?? []
		expect(pending.length).toBeGreaterThanOrEqual(1)
		const latest = pending[0]!
		expect(latest.invoiceUrl).toContain('checkout.xendit.co')
		expect(latest.planId).toBe('premium')
		expect(latest.expiresAt).not.toBeNull()
	})

	it('rejects GET /payments without auth', async () => {
		const { status } = await tClient.api.billing.payments.get()
		expect(status).toBe(401)
	})

	it('reconciliation expires stale pending payments', async () => {
		const staleId = `stale_${Date.now()}`
		await db.insert(subscriptionPayment).values({
			id: staleId,
			userId: testUser,
			planId: 'premium',
			amount: 99_000,
			currency: 'IDR',
			status: 'pending',
			referenceId: `cukkr_stale_${Date.now()}`,
			paymentMethod: 'QRIS',
			expiresAt: new Date(Date.now() - 60_000)
		})

		const expiredCount = await BillingService.expireStalePendingPayments()
		expect(expiredCount).toBeGreaterThanOrEqual(1)

		const [row] = await db
			.select({ status: subscriptionPayment.status })
			.from(subscriptionPayment)
			.where(eq(subscriptionPayment.id, staleId))
		expect(row?.status).toBe('expired')
	})
})
