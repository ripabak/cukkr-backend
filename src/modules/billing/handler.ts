import { Elysia, t } from 'elysia'

import { BillingService } from './service'
import { BillingModel } from './model'
import {
	formatResponse,
	FormatResponseSchema
} from '../../core/format-response'

/**
 * Public billing endpoints — no auth required.
 * The plan catalog is consumed by the public landing site (cukkr-web)
 * and the mobile/web app (cukkr-frontend).
 */
export const billingHandler = new Elysia({
	prefix: '/billing',
	tags: ['Billing']
})

	// GET /api/billing/plans — plan catalog (single source of truth)
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
