import { Elysia, t } from 'elysia'

import {
	formatResponse,
	FormatResponseSchema
} from '../../core/format-response'
import {
	buildPaginationMeta,
	PaginationQuerySchema
} from '../../core/pagination'
import { authMiddleware } from '../../middleware/auth-middleware'
import { BarberAnalyticsService } from './barbers-analytics.service'
import { CustomerAnalyticsService } from './customer-analytics.service'
import { RevenueAnalyticsService } from './revenue.service'
import { ServiceAnalyticsService } from './services-analytics.service'
import { AnalyticsModel } from './model'
import { AnalyticsService } from './service'

export const analyticsHandler = new Elysia({
	prefix: '/analytics',
	tags: ['Analytics']
})
	.use(authMiddleware)

	// ─── Overview ────────────────────────────────────────────────────────────────

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

	// ─── Revenue detail ──────────────────────────────────────────────────────────

	.get(
		'/revenue',
		async ({ query, path, activeOrganizationId }) => {
			const data = await RevenueAnalyticsService.getRevenueStats(
				activeOrganizationId,
				query.range
			)
			return formatResponse({ path, data })
		},
		{
			requireAuth: true,
			requireOrganization: true,
			query: AnalyticsModel.AnalyticsQueryParam,
			response: FormatResponseSchema(AnalyticsModel.RevenueStatsSchema)
		}
	)

	.get(
		'/revenue/bookings',
		async ({ query, path, activeOrganizationId }) => {
			const { data, totalItems, pagination } =
				await RevenueAnalyticsService.getBookingsList(
					activeOrganizationId,
					query.range,
					query.type ?? 'all',
					query
				)
			return formatResponse({
				path,
				data,
				meta: buildPaginationMeta(pagination, totalItems)
			})
		},
		{
			requireAuth: true,
			requireOrganization: true,
			query: t.Composite([
				AnalyticsModel.AnalyticsQueryParam,
				PaginationQuerySchema,
				t.Object({
					type: t.Optional(AnalyticsModel.BookingTypeFilterEnum)
				})
			]),
			response: FormatResponseSchema(
				t.Array(AnalyticsModel.RevenueBookingItemSchema)
			)
		}
	)

	// ─── Customer detail ─────────────────────────────────────────────────────────

	.get(
		'/customers',
		async ({ query, path, activeOrganizationId }) => {
			const data = await CustomerAnalyticsService.getCustomerStats(
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
				AnalyticsModel.CustomerAnalyticsStatsSchema
			)
		}
	)

	.get(
		'/customers/list',
		async ({ query, path, activeOrganizationId }) => {
			const { data, totalItems, pagination } =
				await CustomerAnalyticsService.getCustomerList(
					activeOrganizationId,
					query.range,
					query.status ?? 'all',
					query
				)
			return formatResponse({
				path,
				data,
				meta: buildPaginationMeta(pagination, totalItems)
			})
		},
		{
			requireAuth: true,
			requireOrganization: true,
			query: t.Composite([
				AnalyticsModel.AnalyticsQueryParam,
				PaginationQuerySchema,
				t.Object({
					status: t.Optional(AnalyticsModel.CustomerStatusFilterEnum)
				})
			]),
			response: FormatResponseSchema(
				t.Array(AnalyticsModel.CustomerAnalyticsListItemSchema)
			)
		}
	)

	// ─── Barbers analytics ───────────────────────────────────────────────────────

	.get(
		'/barbers',
		async ({ query, path, activeOrganizationId }) => {
			const data = await BarberAnalyticsService.getBarberChart(
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
				AnalyticsModel.BarberAnalyticsResponseSchema
			)
		}
	)

	.get(
		'/barbers/list',
		async ({ query, path, activeOrganizationId }) => {
			const data = await BarberAnalyticsService.getBarberList(
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
				t.Array(AnalyticsModel.BarberListItemSchema)
			)
		}
	)

	// ─── Services analytics ──────────────────────────────────────────────────────

	.get(
		'/services',
		async ({ query, path, activeOrganizationId }) => {
			const data = await ServiceAnalyticsService.getServiceStats(
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
				AnalyticsModel.ServiceAnalyticsStatsSchema
			)
		}
	)

	.get(
		'/services/list',
		async ({ query, path, activeOrganizationId }) => {
			const { data, totalItems, pagination } =
				await ServiceAnalyticsService.getServiceList(
					activeOrganizationId,
					query.range,
					query
				)
			return formatResponse({
				path,
				data,
				meta: buildPaginationMeta(pagination, totalItems)
			})
		},
		{
			requireAuth: true,
			requireOrganization: true,
			query: t.Composite([
				AnalyticsModel.AnalyticsQueryParam,
				PaginationQuerySchema
			]),
			response: FormatResponseSchema(
				t.Array(AnalyticsModel.ServiceListItemSchema)
			)
		}
	)
