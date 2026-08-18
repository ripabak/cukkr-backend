// Service handles business logic, decoupled from Elysia controller
import { and, eq, lt } from 'drizzle-orm'
import { nanoid } from 'nanoid'

import { AppError } from '../../core/error'
import { db } from '../../lib/database'
import { XenditService } from '../../lib/xendit'
import { user } from '../auth/schema'
import { PLANS_CATALOG, type PlanCatalogEntry } from './catalog'
import { BillingModel } from './model'
import { subscription, subscriptionPayment } from './schema'

// Channels enabled for sandbox MVP. Extend this list to enable more
// channels — labels map 1:1 to Xendit Invoice API `payment_methods`.
export const ENABLED_PAYMENT_METHODS = ['QRIS'] as const
export type PaymentMethod = (typeof ENABLED_PAYMENT_METHODS)[number]

// Invoice QRIS kedaluwarsa setelah 1 jam (sinkron dengan INVOICE_DURATION_MINUTES
// di src/lib/xendit.ts).
const INVOICE_VALIDITY_HOURS = 1

function addMonths(date: Date, months: number): Date {
	const d = new Date(date)
	d.setMonth(d.getMonth() + months)
	return d
}

function toIso(date: Date | null): string | null {
	return date ? date.toISOString() : null
}

function catalogPlan(planId: string): PlanCatalogEntry | undefined {
	return PLANS_CATALOG.find((p) => p.id === planId)
}

function toPlanResponse(plan: PlanCatalogEntry): BillingModel.PlanResponse {
	return {
		id: plan.id,
		name: plan.name,
		price: plan.price,
		currency: plan.currency,
		interval: plan.interval,
		maxBarbershops: plan.maxBarbershops,
		features: [...plan.features],
		requiresContact: Boolean(plan.requiresContact)
	}
}

export abstract class BillingService {
	// ---------------------------------------------------------------------------
	// Plan catalog (public, single source of truth)
	// ---------------------------------------------------------------------------
	static getPlans(): BillingModel.PlanResponse[] {
		return PLANS_CATALOG.map(toPlanResponse)
	}

	// ---------------------------------------------------------------------------
	// Checkout — create a pending payment + Xendit hosted invoice (QRIS)
	// ---------------------------------------------------------------------------
	static async startCheckout(
		userId: string,
		input: BillingModel.CheckoutInput
	): Promise<BillingModel.CheckoutResponse> {
		const plan = catalogPlan(input.planId)
		if (!plan || plan.price <= 0) {
			throw new AppError('Plan is not purchasable', 'BAD_REQUEST')
		}
		if (plan.requiresContact) {
			throw new AppError(
				'Business plan is available via direct contact only — please reach out to hello@cukkr.com',
				'BAD_REQUEST'
			)
		}

		const method = (input.paymentMethod ?? 'QRIS').toUpperCase()
		if (!ENABLED_PAYMENT_METHODS.includes(method as PaymentMethod)) {
			throw new AppError(
				`Payment method "${input.paymentMethod}" is not enabled yet`,
				'BAD_REQUEST'
			)
		}

		const [userRow] = await db
			.select({ id: user.id, email: user.email, name: user.name })
			.from(user)
			.where(eq(user.id, userId))
			.limit(1)
		if (!userRow) throw new AppError('Unauthorized', 'UNAUTHORIZED')

		// Anti-penumpukan: kalau masih ada invoice PENDING untuk plan ini,
		// user TIDAK boleh punya 2 tagihan sekaligus — yang lama di-expire
		// otomatis dulu (sampai ke sisi Xendit), baru dibuatkan yang baru.
		const existingPending = await db.query.subscriptionPayment.findFirst({
			where: and(
				eq(subscriptionPayment.userId, userId),
				eq(subscriptionPayment.planId, plan.id),
				eq(subscriptionPayment.status, 'pending')
			),
			orderBy: (t, { desc }) => [desc(t.createdAt)]
		})

		if (existingPending) {
			// Non-blocking: matikan QRIS lama di Xendit, lalu tutup row lokal.
			// Kalau call expire gagal, tidak apa — row lokal tetap ditutup &
			// webhook invoice.expired yang tiba kemudian jadi no-op (idempotent).
			if (existingPending.xenditInvoiceId) {
				await XenditService.expireInvoice(
					existingPending.xenditInvoiceId
				).catch(() => {})
			}
			await db
				.update(subscriptionPayment)
				.set({ status: 'expired', updatedAt: new Date() })
				.where(eq(subscriptionPayment.id, existingPending.id))
		}

		const referenceId = `cukkr_${nanoid(24)}`
		const now = new Date()
		const expiresAt = new Date(
			now.getTime() + INVOICE_VALIDITY_HOURS * 60 * 60 * 1000
		)

		// 1. Persist the pending payment BEFORE talking to Xendit, so a webhook
		//    that arrives early can still be matched by reference_id.
		const [paymentRow] = await db
			.insert(subscriptionPayment)
			.values({
				id: nanoid(),
				userId,
				planId: plan.id,
				amount: plan.price,
				currency: plan.currency,
				status: 'pending',
				referenceId,
				paymentMethod: method,
				expiresAt
			})
			.returning()

		let invoice: Awaited<ReturnType<typeof XenditService.createInvoice>>
		try {
			invoice = await XenditService.createInvoice({
				externalId: referenceId,
				amount: plan.price,
				currency: plan.currency,
				description: `Langganan Cukkr ${plan.name} — 1 bulan`,
				payerEmail: userRow.email,
				payerName: userRow.name,
				paymentMethods: [method],
				metadata: { userId: userRow.id, planId: plan.id }
			})
		} catch (err) {
			// Mark failed so orphan rows can be audited, then rethrow.
			await db
				.update(subscriptionPayment)
				.set({ status: 'failed' })
				.where(eq(subscriptionPayment.id, paymentRow.id))
			throw err
		}

		// 2. Simpan xendit invoice id + invoice url untuk dedupe webhook & UI "Belum dibayar".
		await db
			.update(subscriptionPayment)
			.set({
				xenditInvoiceId: invoice.id,
				invoiceUrl: invoice.invoiceUrl
			})
			.where(eq(subscriptionPayment.id, paymentRow.id))

		return {
			invoiceId: paymentRow.id,
			xenditInvoiceId: invoice.id,
			invoiceUrl: invoice.invoiceUrl,
			planId: plan.id,
			amount: plan.price,
			currency: plan.currency
		}
	}

	// ---------------------------------------------------------------------------
	// Webhook handling — idempotent, verified in the handler (x-callback-token)
	// ---------------------------------------------------------------------------
	static async handleInvoiceWebhook(payload: {
		id?: string
		external_id?: string
		status?: string
		amount?: number
		paid_at?: string | null
		payment_id?: string | null
	}): Promise<BillingModel.WebhookResponse> {
		const xenditInvoiceId = payload.id
		const status = (payload.status ?? '').toUpperCase()

		// Locate the payment row: prefer xendit_invoice_id, fall back to
		// reference_id (external_id) to survive early-arriving webhooks.
		let paymentRow = null
		if (xenditInvoiceId) {
			paymentRow = await db.query.subscriptionPayment.findFirst({
				where: eq(subscriptionPayment.xenditInvoiceId, xenditInvoiceId)
			})
		}
		if (!paymentRow && payload.external_id) {
			paymentRow = await db.query.subscriptionPayment.findFirst({
				where: eq(subscriptionPayment.referenceId, payload.external_id)
			})
		}

		// Unknown invoice → acknowledge (2xx). Xendit must not retry forever.
		if (!paymentRow) return { received: true, paymentStatus: 'unknown' }

		// Idempotency: already final → no-op.
		if (paymentRow.status !== 'pending') {
			return { received: true, paymentStatus: paymentRow.status }
		}

		if (status === 'PAID') {
			const plan = catalogPlan(paymentRow.planId)
			if (!plan) {
				throw new AppError(
					`Subscription plan "${paymentRow.planId}" not found in catalog`,
					'INTERNAL_ERROR'
				)
			}

			// Amount must match the plan price (IDs are exact integers).
			const paidAmount = Math.round(Number(payload.amount ?? 0))
			if (paidAmount !== plan.price) {
				await db
					.update(subscriptionPayment)
					.set({ status: 'failed' })
					.where(eq(subscriptionPayment.id, paymentRow.id))
				throw new AppError(
					`Paid amount ${paidAmount} does not match plan price ${plan.price}`,
					'BAD_REQUEST'
				)
			}

			const paidAt = payload.paid_at
				? new Date(payload.paid_at)
				: new Date()

			await BillingService.activateOrRenew(
				paymentRow.userId,
				plan.id,
				paidAt
			)

			await db
				.update(subscriptionPayment)
				.set({
					status: 'paid',
					paidAt,
					xenditPaymentId: payload.payment_id ?? null
				})
				.where(eq(subscriptionPayment.id, paymentRow.id))

			return { received: true, paymentStatus: 'paid' }
		}

		if (status === 'EXPIRED') {
			await db
				.update(subscriptionPayment)
				.set({ status: 'expired' })
				.where(eq(subscriptionPayment.id, paymentRow.id))
			return { received: true, paymentStatus: 'expired' }
		}

		// PENDING / other statuses → acknowledged, nothing to do.
		return { received: true, paymentStatus: status.toLowerCase() }
	}

	/**
	 * Activate or extend the user's subscription.
	 * - Active & not expired → extend the current period by 1 month (renewal).
	 * - Otherwise → start a fresh 1-month period from `paidAt`.
	 * This is the single place where "user data changes after a successful
	 * payment" lives.
	 */
	static async activateOrRenew(
		userId: string,
		planId: string,
		paidAt: Date
	): Promise<void> {
		const existing = await db.query.subscription.findFirst({
			where: eq(subscription.userId, userId)
		})

		if (
			existing &&
			existing.status === 'active' &&
			existing.currentPeriodEnd > paidAt
		) {
			await db
				.update(subscription)
				.set({
					planId,
					status: 'active',
					currentPeriodEnd: addMonths(existing.currentPeriodEnd, 1),
					updatedAt: new Date()
				})
				.where(eq(subscription.id, existing.id))
			return
		}

		const start = paidAt
		const end = addMonths(paidAt, 1)

		await db
			.insert(subscription)
			.values({
				id: nanoid(),
				userId,
				planId,
				status: 'active',
				currentPeriodStart: start,
				currentPeriodEnd: end,
				autoRenew: false
			})
			.onConflictDoUpdate({
				target: subscription.userId,
				set: {
					planId,
					status: 'active',
					currentPeriodStart: start,
					currentPeriodEnd: end,
					updatedAt: new Date()
				}
			})
	}

	// ---------------------------------------------------------------------------
	// Payments history — riwayat tagihan user (pending/paid/expired/failed).
	// Dipakai UI untuk menampilkan invoice yang belum dibayar + tombol lanjut bayar.
	// ---------------------------------------------------------------------------
	static async getPayments(
		userId: string
	): Promise<BillingModel.PaymentResponse[]> {
		const rows = await db.query.subscriptionPayment.findMany({
			where: eq(subscriptionPayment.userId, userId),
			orderBy: (t, { desc }) => [desc(t.createdAt)]
		})

		return rows.map((row) => ({
			id: row.id,
			planId: row.planId,
			amount: row.amount,
			currency: row.currency,
			status: row.status,
			paymentMethod: row.paymentMethod,
			invoiceUrl: row.invoiceUrl,
			xenditInvoiceId: row.xenditInvoiceId,
			paidAt: toIso(row.paidAt),
			expiresAt: row.expiresAt.toISOString(),
			createdAt: row.createdAt.toISOString()
		}))
	}

	// ---------------------------------------------------------------------------
	// Read side — effective plan for a user
	// ---------------------------------------------------------------------------
	static async getSubscription(
		userId: string
	): Promise<BillingModel.SubscriptionResponse> {
		const sub = await db.query.subscription.findFirst({
			where: eq(subscription.userId, userId)
		})

		const now = new Date()
		const isActive =
			sub && sub.status === 'active' && sub.currentPeriodEnd > now
		const planId = isActive ? sub!.planId : 'free'
		const plan = catalogPlan(planId)

		if (!plan) throw new AppError('Plan not found', 'INTERNAL_ERROR')

		return {
			planId,
			plan: isActive && sub ? toPlanResponse(plan) : null,
			status: isActive ? 'active' : sub ? 'expired' : 'free',
			currentPeriodStart:
				isActive && sub ? toIso(sub.currentPeriodStart) : null,
			currentPeriodEnd:
				isActive && sub ? toIso(sub.currentPeriodEnd) : null
		}
	}

	/** Returns the user's effective plan id ('free' when none / expired). */
	static async getEffectivePlanId(userId: string): Promise<string> {
		const sub = await BillingService.getSubscription(userId)
		return sub.planId
	}

	// ---------------------------------------------------------------------------
	// Reconciliation — tutup invoice PENDING yang lewat expires_at tanpa menunggu
	// webhook Xendit (webhook bisa hilang). Dipanggil cron harian + saat checkout
	// menemukan pending basi.
	// ---------------------------------------------------------------------------
	static async expireStalePendingPayments(): Promise<number> {
		const result = await db
			.update(subscriptionPayment)
			.set({ status: 'expired', updatedAt: new Date() })
			.where(
				and(
					eq(subscriptionPayment.status, 'pending'),
					lt(subscriptionPayment.expiresAt, new Date())
				)
			)
			.returning({ id: subscriptionPayment.id })

		if (result.length > 0) {
			console.log(
				`[billing] expired ${result.length} stale pending payment(s)`
			)
		}
		return result.length
	}

	// ---------------------------------------------------------------------------
	// Cron — expire overdue subscriptions
	// ---------------------------------------------------------------------------
	static async expireOverdueSubscriptions(): Promise<number> {
		const result = await db
			.update(subscription)
			.set({ status: 'expired', updatedAt: new Date() })
			.where(
				and(
					eq(subscription.status, 'active'),
					lt(subscription.currentPeriodEnd, new Date())
				)
			)
			.returning({ id: subscription.id })

		if (result.length > 0) {
			console.log(
				`[billing] expired ${result.length} overdue subscription(s)`
			)
		}
		return result.length
	}

	// Convenience for the org-creation enforcement in auth.ts
	static async getMaxBarbershops(userId: string): Promise<number | null> {
		const planId = await BillingService.getEffectivePlanId(userId)
		const plan = catalogPlan(planId)
		return plan?.maxBarbershops ?? 1
	}
}
