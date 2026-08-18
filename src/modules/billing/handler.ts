import { Elysia, t } from 'elysia'

import { BillingService } from './service'
import { BillingModel } from './model'
import {
	formatResponse,
	FormatResponseSchema
} from '../../core/format-response'
import { authMiddleware } from '../../middleware/auth-middleware'
import { XenditService } from '../../lib/xendit'

/**
 * Billing endpoints.
 * - Public: GET /plans (catalog), POST /webhook/xendit (Xendit callbacks).
 * - Auth: POST /subscription/checkout, GET /subscription.
 */
export const billingHandler = new Elysia({
	prefix: '/billing',
	tags: ['Billing']
})
	// ---- Public: plan catalog (consumed by cukkr-web + cukkr-frontend) ----
	.get(
		'/plans',
		async ({ path }) => {
			const data = BillingService.getPlans()
			return formatResponse({ path, data })
		},
		{
			response: FormatResponseSchema(t.Array(BillingModel.PlanResponse))
		}
	)

	// ---- Public: Xendit webhook (verified via x-callback-token) ----
	.post(
		'/webhook/xendit',
		async ({ body, headers, path, set }) => {
			// Security: reject before touching state when the token is invalid.
			const token = headers['x-callback-token']
			if (!XenditService.verifyWebhookToken(token)) {
				set.status = 401
				return formatResponse({
					path,
					data: { received: false, paymentStatus: 'rejected' },
					message: 'Invalid callback token'
				})
			}

			const payload = (body ?? {}) as Record<string, unknown>
			const result = await BillingService.handleInvoiceWebhook({
				id: typeof payload.id === 'string' ? payload.id : undefined,
				external_id:
					typeof payload.external_id === 'string'
						? payload.external_id
						: undefined,
				status:
					typeof payload.status === 'string'
						? payload.status
						: undefined,
				amount:
					typeof payload.amount === 'number'
						? payload.amount
						: Number(payload.amount) || undefined,
				paid_at:
					typeof payload.paid_at === 'string'
						? payload.paid_at
						: null,
				payment_id:
					typeof payload.payment_id === 'string'
						? payload.payment_id
						: null
			})

			return formatResponse({
				path,
				data: result,
				message: 'Webhook received'
			})
		},
		{
			body: BillingModel.WebhookInput,
			response: FormatResponseSchema(BillingModel.WebhookResponse)
		}
	)

	// ---- Auth: subscription checkout + status + payment history ----
	.use(authMiddleware)
	.post(
		'/subscription/checkout',
		async ({ body, path, user }) => {
			const data = await BillingService.startCheckout(user.id, body)
			return formatResponse({ path, data, message: 'Invoice created' })
		},
		{
			requireAuth: true,
			body: BillingModel.CheckoutInput,
			response: FormatResponseSchema(BillingModel.CheckoutResponse)
		}
	)
	.get(
		'/payments',
		async ({ path, user }) => {
			const data = await BillingService.getPayments(user.id)
			return formatResponse({ path, data })
		},
		{
			requireAuth: true,
			response: FormatResponseSchema(
				t.Array(BillingModel.PaymentResponse)
			)
		}
	)
	.get(
		'/subscription',
		async ({ path, user }) => {
			const data = await BillingService.getSubscription(user.id)
			return formatResponse({ path, data })
		},
		{
			requireAuth: true,
			response: FormatResponseSchema(BillingModel.SubscriptionResponse)
		}
	)
