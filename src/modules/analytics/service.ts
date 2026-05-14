import { and, eq, gte, isNotNull, lt, sql } from 'drizzle-orm'

import { db } from '../../lib/database'
import { member } from '../auth/schema'
import { booking, bookingService } from '../bookings/schema'
import { service } from '../services/schema'
import { BucketDef, TimeWindows, buildTimeWindows } from './time-windows'
import { AnalyticsModel } from './model'

type AnalyticsRange = AnalyticsModel.AnalyticsRange
type StatCard = AnalyticsModel.StatCard
type AnalyticsResponse = AnalyticsModel.AnalyticsResponse
type HighlightItem = AnalyticsModel.HighlightItem

interface AggregateResult {
	sales: number
	bookings: number
	appointments: number
	walkIns: number
	customers: number
}

interface ChartBucketResult {
	label: string
	revenue: number
	customers: number
}

const cache = new Map<string, { data: AnalyticsResponse; expiresAt: number }>()

export abstract class AnalyticsService {
	private static async queryAggregates(
		organizationId: string,
		start: Date,
		end: Date
	): Promise<AggregateResult> {
		const rows = await db
			.select({
				sales: sql<string>`COALESCE(SUM(${bookingService.price}), 0)`,
				bookings: sql<string>`COUNT(DISTINCT ${booking.id})`,
				appointments: sql<string>`COUNT(DISTINCT ${booking.id}) FILTER (WHERE ${booking.type} = 'appointment')`,
				walkIns: sql<string>`COUNT(DISTINCT ${booking.id}) FILTER (WHERE ${booking.type} = 'walk_in')`,
				customers: sql<string>`COUNT(DISTINCT ${booking.customerId})`
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
			sales: parseInt(row.sales ?? '0', 10),
			bookings: parseInt(row.bookings ?? '0', 10),
			appointments: parseInt(row.appointments ?? '0', 10),
			walkIns: parseInt(row.walkIns ?? '0', 10),
			customers: parseInt(row.customers ?? '0', 10)
		}
	}

	private static async queryChartBuckets(
		organizationId: string,
		buckets: BucketDef[]
	): Promise<ChartBucketResult[]> {
		return Promise.all(
			buckets.map(async (bucket) => {
				const agg = await AnalyticsService.queryAggregates(
					organizationId,
					bucket.start,
					bucket.end
				)
				return {
					label: bucket.label,
					revenue: agg.sales,
					customers: agg.customers
				}
			})
		)
	}

	private static async queryTopBarber(
		organizationId: string,
		start: Date,
		end: Date
	): Promise<HighlightItem | null> {
		const topRows = await db
			.select({
				barberId: booking.handledByBarberId,
				cuts: sql<string>`COUNT(DISTINCT ${booking.id})`,
				revenue: sql<string>`COALESCE(SUM(${bookingService.price}), 0)`
			})
			.from(booking)
			.leftJoin(bookingService, eq(bookingService.bookingId, booking.id))
			.where(
				and(
					eq(booking.organizationId, organizationId),
					eq(booking.status, 'completed'),
					gte(booking.completedAt, start),
					lt(booking.completedAt, end),
					isNotNull(booking.handledByBarberId)
				)
			)
			.groupBy(booking.handledByBarberId)
			.orderBy(
				sql`COALESCE(SUM(${bookingService.price}), 0) DESC`,
				sql`COUNT(DISTINCT ${booking.id}) DESC`
			)
			.limit(1)

		if (topRows.length === 0 || !topRows[0].barberId) return null

		const { barberId, cuts, revenue } = topRows[0]

		const memberRow = await db.query.member.findFirst({
			where: eq(member.id, barberId),
			with: { user: true }
		})

		if (!memberRow) return null

		return {
			id: barberId,
			name: memberRow.user.name,
			imageUrl: memberRow.user.image ?? null,
			count: parseInt(cuts, 10),
			revenue: parseInt(revenue, 10)
		}
	}

	private static async queryTopService(
		organizationId: string,
		start: Date,
		end: Date
	): Promise<HighlightItem | null> {
		const topRows = await db
			.select({
				serviceId: bookingService.serviceId,
				books: sql<string>`COUNT(${bookingService.id})`,
				revenue: sql<string>`COALESCE(SUM(${bookingService.price}), 0)`
			})
			.from(bookingService)
			.innerJoin(booking, eq(booking.id, bookingService.bookingId))
			.where(
				and(
					eq(booking.organizationId, organizationId),
					eq(booking.status, 'completed'),
					gte(booking.completedAt, start),
					lt(booking.completedAt, end)
				)
			)
			.groupBy(bookingService.serviceId)
			.orderBy(
				sql`COALESCE(SUM(${bookingService.price}), 0) DESC`,
				sql`COUNT(${bookingService.id}) DESC`
			)
			.limit(1)

		if (topRows.length === 0) return null

		const { serviceId, books, revenue } = topRows[0]

		const serviceRow = await db.query.service.findFirst({
			where: eq(service.id, serviceId)
		})

		if (!serviceRow) return null

		return {
			id: serviceId,
			name: serviceRow.name,
			imageUrl: serviceRow.imageUrl ?? null,
			count: parseInt(books, 10),
			revenue: parseInt(revenue, 10)
		}
	}

	private static computeStatCard(
		current: number,
		previous: number
	): StatCard {
		let change: number | null = null
		let direction: 'up' | 'down' | 'neutral' = 'neutral'

		if (previous !== 0) {
			change = Math.round(((current - previous) / previous) * 1000) / 10
			if (current > previous) {
				direction = 'up'
			} else if (current < previous) {
				direction = 'down'
			}
		}

		return { current, previous, change, direction }
	}

	static async getAnalytics(
		organizationId: string,
		range: AnalyticsRange
	): Promise<AnalyticsResponse> {
		const cacheKey = `${organizationId}:${range}`
		const cached = cache.get(cacheKey)

		if (cached) {
			if (Date.now() < cached.expiresAt) {
				return cached.data
			}
			cache.delete(cacheKey)
		}

		const windows = buildTimeWindows(range, new Date())

		const [currentAgg, previousAgg, chartBuckets, topBarber, topService] =
			await Promise.all([
				AnalyticsService.queryAggregates(
					organizationId,
					windows.currentStart,
					windows.currentEnd
				),
				AnalyticsService.queryAggregates(
					organizationId,
					windows.previousStart,
					windows.previousEnd
				),
				AnalyticsService.queryChartBuckets(
					organizationId,
					windows.buckets
				),
				AnalyticsService.queryTopBarber(
					organizationId,
					windows.currentStart,
					windows.currentEnd
				),
				AnalyticsService.queryTopService(
					organizationId,
					windows.currentStart,
					windows.currentEnd
				)
			])

		const response: AnalyticsResponse = {
			range,
			stats: {
				totalSales: AnalyticsService.computeStatCard(
					currentAgg.sales,
					previousAgg.sales
				),
				totalBookings: AnalyticsService.computeStatCard(
					currentAgg.bookings,
					previousAgg.bookings
				),
				totalCustomers: AnalyticsService.computeStatCard(
					currentAgg.customers,
					previousAgg.customers
				),
				appointments: AnalyticsService.computeStatCard(
					currentAgg.appointments,
					previousAgg.appointments
				),
				walkIns: AnalyticsService.computeStatCard(
					currentAgg.walkIns,
					previousAgg.walkIns
				)
			},
			chart: {
				revenue: chartBuckets.map((b) => ({
					label: b.label,
					value: b.revenue
				})),
				customers: chartBuckets.map((b) => ({
					label: b.label,
					value: b.customers
				}))
			},
			highlights: {
				topBarber,
				topService
			}
		}

		cache.set(cacheKey, {
			data: response,
			expiresAt: Date.now() + 60_000
		})

		return response
	}
}
