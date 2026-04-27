import { Elysia } from 'elysia'

import {
	formatResponse,
	FormatResponseSchema
} from '../../core/format-response'
import { authMiddleware } from '../../middleware/auth-middleware'
import { AnalyticsModel } from './model'
import { AnalyticsService } from './service'

export const analyticsHandler = new Elysia({
	prefix: '/analytics',
	tags: ['Analytics']
})
	.use(authMiddleware)
	.get(
		'/',
		async ({ query, path, activeOrganizationId }) => {
			const data = await AnalyticsService.getAnalytics(
				activeOrganizationId,
				query.range
			)
			return formatResponse({ path, data })
		},
		{
			requireAuth: true,
			requireOrganization: true,
			query: AnalyticsModel.AnalyticsQueryParam,
			response: FormatResponseSchema(
				AnalyticsModel.AnalyticsResponseSchema
			)
		}
	)
