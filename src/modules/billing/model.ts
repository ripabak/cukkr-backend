// Model defines the data structure and validation for request and response
import { t } from 'elysia'

export namespace BillingModel {
	export const PlanResponse = t.Object({
		id: t.String(),
		name: t.String(),
		price: t.Number(),
		currency: t.String(),
		interval: t.String(),
		maxBarbershops: t.Union([t.Number(), t.Null()]),
		features: t.Array(t.String()),
		requiresContact: t.Boolean()
	})
	export type PlanResponse = typeof PlanResponse.static

	// POST /api/billing/subscription/checkout
	export const CheckoutInput = t.Object({
		planId: t.Union([t.Literal('premium'), t.Literal('business')]),
		paymentMethod: t.Optional(t.String())
	})
	export type CheckoutInput = typeof CheckoutInput.static

	export const CheckoutResponse = t.Object({
		invoiceId: t.String(),
		xenditInvoiceId: t.String(),
		invoiceUrl: t.String(),
		planId: t.String(),
		amount: t.Number(),
		currency: t.String()
	})
	export type CheckoutResponse = typeof CheckoutResponse.static

	// GET /api/billing/subscription — effective plan for the current user
	export const SubscriptionResponse = t.Object({
		planId: t.String(),
		plan: t.Nullable(PlanResponse),
		status: t.String(), // active | expired | free
		currentPeriodStart: t.Nullable(t.String()),
		currentPeriodEnd: t.Nullable(t.String())
	})
	export type SubscriptionResponse = typeof SubscriptionResponse.static

	// GET /api/billing/payments — riwayat pembayaran user (pending/paid/expired/failed)
	export const PaymentResponse = t.Object({
		id: t.String(),
		planId: t.String(),
		amount: t.Number(),
		currency: t.String(),
		status: t.String(), // pending | paid | expired | failed
		paymentMethod: t.String(),
		invoiceUrl: t.Nullable(t.String()),
		xenditInvoiceId: t.Nullable(t.String()),
		paidAt: t.Nullable(t.String()),
		expiresAt: t.String(),
		createdAt: t.String()
	})
	export type PaymentResponse = typeof PaymentResponse.static

	// POST /api/billing/webhook/xendit — Xendit invoice webhook
	// Body is intentionally loose: Xendit payloads evolve; we validate
	// the fields we depend on inside the service.
	export const WebhookInput = t.Any()
	export const WebhookResponse = t.Object({
		received: t.Boolean(),
		paymentStatus: t.String()
	})
	export type WebhookResponse = typeof WebhookResponse.static
}
