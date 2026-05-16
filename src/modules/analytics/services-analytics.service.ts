import { and, count, eq, gte, lt, sql } from 'drizzle-orm'

import { db } from '../../lib/database'
import { PaginatedResult, normalizePagination } from '../../core/pagination'
import { fetchOrgTimezone } from '../auth/organization-metadata'
import { booking, bookingService } from '../bookings/schema'
import { service } from '../services/schema'
import { AnalyticsModel } from './model'
import { buildTimeWindows } from './time-windows'

type AnalyticsRange = AnalyticsModel.AnalyticsRange
type ServiceAnalyticsStats = AnalyticsModel.ServiceAnalyticsStats
type ServiceListItem = AnalyticsModel.ServiceListItem
type StatCard = AnalyticsModel.StatCard
type ChartPoint = AnalyticsModel.ChartPoint

function computeStatCard(current: number, previous: number): StatCard {
	let change: number | null = null
	let direction: 'up' | 'down' | 'neutral' = 'neutral'
	if (previous !== 0) {
		change = Math.round(((current - previous) / previous) * 1000) / 10
		direction =
			current > previous ? 'up' : current < previous ? 'down' : 'neutral'
	}
	return { current, previous, change, direction }
}

interface ServicePeriodAgg {
	totalBookings: number
	totalRevenue: number
}

async function queryServicePeriodAgg(
	organizationId: string,
	start: Date,
	end: Date
): Promise<ServicePeriodAgg> {
	const rows = await db
		.select({
			totalBookings: sql<string>`COUNT(DISTINCT ${booking.id})`,
			totalRevenue: sql<string>`COALESCE(SUM(${bookingService.price}), 0)`
		})
		.from(booking)
		.leftJoin(bookingService, eq(bookingService.bookingId, booking.id))
		.where(
			and(
				eq(booking.organizationId, organizationId),
				eq(booking.status, 'completed'),
				gte(booking.completedAt, start),
				lt(booking.completedAt, end)
			)
		)
	const row = rows[0]
	return {
		totalBookings: parseInt(row.totalBookings ?? '0', 10),
		totalRevenue: parseInt(row.totalRevenue ?? '0', 10)
	}
}

export abstract class ServiceAnalyticsService {
	static async getServiceStats(
		organizationId: string,
		range: AnalyticsRange
	): Promise<ServiceAnalyticsStats> {
		const timezone = await fetchOrgTimezone(organizationId)
		const windows = buildTimeWindows(range, new Date(), timezone)

		const [currentAgg, previousAgg, serviceChart] = await Promise.all([
			queryServicePeriodAgg(
				organizationId,
				windows.currentStart,
				windows.currentEnd
			),
			queryServicePeriodAgg(
				organizationId,
				windows.previousStart,
				windows.previousEnd
			),
			// Chart: top services by revenue then count in current period
			db
				.select({
					serviceName: bookingService.serviceName,
					totalBookings: sql<string>`COUNT(${bookingService.id})`
				})
				.from(bookingService)
				.innerJoin(booking, eq(booking.id, bookingService.bookingId))
				.where(
					and(
						eq(booking.organizationId, organizationId),
						eq(booking.status, 'completed'),
						gte(booking.completedAt, windows.currentStart),
						lt(booking.completedAt, windows.currentEnd)
					)
				)
				.groupBy(bookingService.serviceId, bookingService.serviceName)
				.orderBy(
					sql`COALESCE(SUM(${bookingService.price}), 0) DESC`,
					sql`COUNT(${bookingService.id}) DESC`
				)
		])

		const chart: ChartPoint[] = serviceChart.map((r) => ({
			label: r.serviceName,
			value: parseInt(r.totalBookings, 10)
		}))

		return {
			range,
			stats: {
				totalBookings: computeStatCard(
					currentAgg.totalBookings,
					previousAgg.totalBookings
				),
				totalRevenue: computeStatCard(
					currentAgg.totalRevenue,
					previousAgg.totalRevenue
				)
			},
			chart
		}
	}

	static async getServiceList(
		organizationId: string,
		range: AnalyticsRange,
		query: { page?: number; limit?: number }
	): Promise<PaginatedResult<ServiceListItem>> {
		const pagination = normalizePagination(query)
		const timezone = await fetchOrgTimezone(organizationId)
		const { currentStart, currentEnd } = buildTimeWindows(
			range,
			new Date(),
			timezone
		)

		const periodWhere = and(
			eq(booking.organizationId, organizationId),
			eq(booking.status, 'completed'),
			gte(booking.completedAt, currentStart),
			lt(booking.completedAt, currentEnd)
		)

		// Total completed bookings in period (denominator for percentage)
		const [[totalResult], serviceRows, countRows] = await Promise.all([
			db.select({ total: count() }).from(booking).where(periodWhere),
			db
				.select({
					serviceId: bookingService.serviceId,
					serviceName: service.name,
					totalBookings: sql<string>`COUNT(${bookingService.id})`,
					revenue: sql<string>`COALESCE(SUM(${bookingService.price}), 0)`
				})
				.from(bookingService)
				.innerJoin(booking, eq(booking.id, bookingService.bookingId))
				.innerJoin(service, eq(service.id, bookingService.serviceId))
				.where(periodWhere)
				.groupBy(bookingService.serviceId, service.name)
				.orderBy(
					sql`COALESCE(SUM(${bookingService.price}), 0) DESC`,
					sql`COUNT(${bookingService.id}) DESC`
				)
				.limit(pagination.take)
				.offset(pagination.skip),
			db
				.select({ id: bookingService.serviceId })
				.from(bookingService)
				.innerJoin(booking, eq(booking.id, bookingService.bookingId))
				.where(periodWhere)
				.groupBy(bookingService.serviceId)
		])

		const totalBookings = totalResult?.total ?? 0

		return {
			data: serviceRows.map((r) => {
				const bookingCount = parseInt(r.totalBookings, 10)
				return {
					serviceId: r.serviceId,
					serviceName: r.serviceName,
					totalBookings: bookingCount,
					percentage:
						totalBookings > 0
							? Math.round(
									(bookingCount / totalBookings) * 1000
								) / 10
							: 0,
					revenue: parseInt(r.revenue, 10)
				}
			}),
			totalItems: countRows.length,
			pagination
		}
	}
}
