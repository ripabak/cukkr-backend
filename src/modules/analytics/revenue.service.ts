import { and, count, eq, gte, inArray, lt, sql } from 'drizzle-orm'

import { db } from '../../lib/database'
import { PaginatedResult, normalizePagination } from '../../core/pagination'
import { booking, bookingService, customer } from '../bookings/schema'
import { AnalyticsModel } from './model'
import { buildTimeWindows } from './time-windows'

type AnalyticsRange = AnalyticsModel.AnalyticsRange
type RevenueStats = AnalyticsModel.RevenueStats
type RevenueBookingItem = AnalyticsModel.RevenueBookingItem
type BookingTypeFilter = AnalyticsModel.BookingTypeFilter
type StatCard = AnalyticsModel.StatCard

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

interface RevenueAgg {
	totalBookings: number
	totalRevenue: number
	totalDuration: number
}

async function queryRevenueAgg(
	organizationId: string,
	start: Date,
	end: Date
): Promise<RevenueAgg> {
	const rows = await db
		.select({
			totalBookings: sql<string>`COUNT(DISTINCT ${booking.id})`,
			totalRevenue: sql<string>`COALESCE(SUM(${bookingService.price}), 0)`,
			totalDuration: sql<string>`COALESCE(SUM(${bookingService.duration}), 0)`
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
	const totalBookings = parseInt(row.totalBookings ?? '0', 10)
	const totalRevenue = parseInt(row.totalRevenue ?? '0', 10)
	const totalDuration = parseInt(row.totalDuration ?? '0', 10)
	return { totalBookings, totalRevenue, totalDuration }
}

export abstract class RevenueAnalyticsService {
	static async getRevenueStats(
		organizationId: string,
		range: AnalyticsRange
	): Promise<RevenueStats> {
		const windows = buildTimeWindows(range, new Date())

		const [currentAgg, previousAgg, chartBuckets] = await Promise.all([
			queryRevenueAgg(
				organizationId,
				windows.currentStart,
				windows.currentEnd
			),
			queryRevenueAgg(
				organizationId,
				windows.previousStart,
				windows.previousEnd
			),
			Promise.all(
				windows.buckets.map(async (b) => {
					const agg = await queryRevenueAgg(
						organizationId,
						b.start,
						b.end
					)
					return { label: b.label, value: agg.totalRevenue }
				})
			)
		])

		const currentAvgRev =
			currentAgg.totalBookings > 0
				? Math.round(currentAgg.totalRevenue / currentAgg.totalBookings)
				: 0
		const previousAvgRev =
			previousAgg.totalBookings > 0
				? Math.round(
						previousAgg.totalRevenue / previousAgg.totalBookings
					)
				: 0

		const currentAvgTime =
			currentAgg.totalBookings > 0
				? Math.round(
						currentAgg.totalDuration / currentAgg.totalBookings
					)
				: 0
		const previousAvgTime =
			previousAgg.totalBookings > 0
				? Math.round(
						previousAgg.totalDuration / previousAgg.totalBookings
					)
				: 0

		return {
			range,
			stats: {
				totalBookings: computeStatCard(
					currentAgg.totalBookings,
					previousAgg.totalBookings
				),
				avgRevenuePerBooking: computeStatCard(
					currentAvgRev,
					previousAvgRev
				),
				avgTime: computeStatCard(currentAvgTime, previousAvgTime)
			},
			chart: chartBuckets
		}
	}

	static async getBookingsList(
		organizationId: string,
		range: AnalyticsRange,
		typeFilter: BookingTypeFilter,
		query: { page?: number; limit?: number }
	): Promise<PaginatedResult<RevenueBookingItem>> {
		const pagination = normalizePagination(query)
		const { currentStart, currentEnd } = buildTimeWindows(range, new Date())

		const periodWhere = and(
			eq(booking.organizationId, organizationId),
			eq(booking.status, 'completed'),
			gte(booking.completedAt, currentStart),
			lt(booking.completedAt, currentEnd),
			typeFilter !== 'all' ? eq(booking.type, typeFilter) : undefined
		)

		const [[countResult], rows] = await Promise.all([
			db.select({ total: count() }).from(booking).where(periodWhere),
			db
				.select({
					bookingId: booking.id,
					customerId: booking.customerId,
					customerName: customer.name,
					completedAt: booking.completedAt,
					type: booking.type,
					revenue: sql<string>`COALESCE(SUM(${bookingService.price}), 0)`
				})
				.from(booking)
				.innerJoin(customer, eq(customer.id, booking.customerId))
				.leftJoin(
					bookingService,
					eq(bookingService.bookingId, booking.id)
				)
				.where(periodWhere)
				.groupBy(
					booking.id,
					booking.customerId,
					customer.name,
					booking.completedAt,
					booking.type
				)
				.orderBy(sql`${booking.completedAt} DESC NULLS LAST`)
				.limit(pagination.take)
				.offset(pagination.skip)
		])

		const bookingIds = rows.map((r) => r.bookingId)
		const serviceRows =
			bookingIds.length > 0
				? await db
						.select({
							bookingId: bookingService.bookingId,
							serviceName: bookingService.serviceName
						})
						.from(bookingService)
						.where(inArray(bookingService.bookingId, bookingIds))
				: []

		const servicesByBooking = new Map<string, string[]>()
		for (const s of serviceRows) {
			if (!servicesByBooking.has(s.bookingId))
				servicesByBooking.set(s.bookingId, [])
			servicesByBooking.get(s.bookingId)!.push(s.serviceName)
		}

		return {
			data: rows.map((r) => ({
				bookingId: r.bookingId,
				customerId: r.customerId,
				customerName: r.customerName,
				completedAt: r.completedAt?.toISOString() ?? '',
				type: r.type as 'walk_in' | 'appointment',
				services: servicesByBooking.get(r.bookingId) ?? [],
				revenue: parseInt(r.revenue, 10)
			})),
			totalItems: countResult?.total ?? 0,
			pagination
		}
	}
}
