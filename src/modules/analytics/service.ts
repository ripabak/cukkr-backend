import { and, eq, gte, lt, sql } from 'drizzle-orm'

import { AppError } from '../../core/error'
import { db } from '../../lib/database'
import { booking, bookingService } from '../bookings/schema'
import { AnalyticsModel } from './model'

type AnalyticsRange = AnalyticsModel.AnalyticsRange
type StatCard = AnalyticsModel.StatCard
type ChartBucket = AnalyticsModel.ChartBucket
type AnalyticsResponse = AnalyticsModel.AnalyticsResponse

const WIB_OFFSET_MS = 7 * 60 * 60 * 1000

interface BucketDef {
	label: string
	start: Date
	end: Date
}

interface TimeWindows {
	currentStart: Date
	currentEnd: Date
	previousStart: Date
	previousEnd: Date
	buckets: BucketDef[]
}

interface AggregateResult {
	sales: number
	bookings: number
	appointments: number
	walkIns: number
}

const cache = new Map<string, { data: AnalyticsResponse; expiresAt: number }>()

const MONTH_NAMES = [
	'Jan',
	'Feb',
	'Mar',
	'Apr',
	'May',
	'Jun',
	'Jul',
	'Aug',
	'Sep',
	'Oct',
	'Nov',
	'Dec'
]
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export abstract class AnalyticsService {
	private static toWib(date: Date): Date {
		return new Date(date.getTime() + WIB_OFFSET_MS)
	}

	private static startOfDayWib(date: Date): Date {
		const wib = AnalyticsService.toWib(date)
		const utc = Date.UTC(
			wib.getUTCFullYear(),
			wib.getUTCMonth(),
			wib.getUTCDate()
		)
		return new Date(utc - WIB_OFFSET_MS)
	}

	private static startOfMonthWib(date: Date): Date {
		const wib = AnalyticsService.toWib(date)
		const utc = Date.UTC(wib.getUTCFullYear(), wib.getUTCMonth(), 1)
		return new Date(utc - WIB_OFFSET_MS)
	}

	private static buildTimeWindows(
		range: AnalyticsRange,
		now: Date
	): TimeWindows {
		switch (range) {
			case '24h': {
				const currentEnd = now
				const currentStart = new Date(
					now.getTime() - 24 * 60 * 60 * 1000
				)
				const previousEnd = currentStart
				const previousStart = new Date(
					now.getTime() - 48 * 60 * 60 * 1000
				)

				const buckets: BucketDef[] = []
				for (let i = 23; i >= 0; i--) {
					const start = new Date(
						now.getTime() - (i + 1) * 60 * 60 * 1000
					)
					const end = new Date(now.getTime() - i * 60 * 60 * 1000)
					const wibStart = AnalyticsService.toWib(start)
					const hour = String(wibStart.getUTCHours()).padStart(2, '0')
					buckets.push({ label: `${hour}:00`, start, end })
				}

				return {
					currentStart,
					currentEnd,
					previousStart,
					previousEnd,
					buckets
				}
			}

			case 'week': {
				const todayStart = AnalyticsService.startOfDayWib(now)
				const currentStart = new Date(
					todayStart.getTime() - 6 * 24 * 60 * 60 * 1000
				)
				const currentEnd = new Date(
					todayStart.getTime() + 24 * 60 * 60 * 1000
				)
				const previousStart = new Date(
					currentStart.getTime() - 7 * 24 * 60 * 60 * 1000
				)
				const previousEnd = currentStart

				const buckets: BucketDef[] = []
				for (let i = 0; i < 7; i++) {
					const start = new Date(
						currentStart.getTime() + i * 24 * 60 * 60 * 1000
					)
					const end = new Date(start.getTime() + 24 * 60 * 60 * 1000)
					const wibStart = AnalyticsService.toWib(start)
					const label = DAY_NAMES[wibStart.getUTCDay()]
					buckets.push({ label, start, end })
				}

				return {
					currentStart,
					currentEnd,
					previousStart,
					previousEnd,
					buckets
				}
			}

			case 'month': {
				const currentStart = AnalyticsService.startOfMonthWib(now)
				const wibNow = AnalyticsService.toWib(now)
				const nextMonthUtc = Date.UTC(
					wibNow.getUTCFullYear(),
					wibNow.getUTCMonth() + 1,
					1
				)
				const currentEnd = new Date(nextMonthUtc - WIB_OFFSET_MS)

				const prevMonthWibUtc = Date.UTC(
					wibNow.getUTCFullYear(),
					wibNow.getUTCMonth() - 1,
					1
				)
				const previousStart = new Date(prevMonthWibUtc - WIB_OFFSET_MS)
				const previousEnd = currentStart

				const buckets: BucketDef[] = []
				const wibCurrent = AnalyticsService.toWib(currentStart)
				const year = wibCurrent.getUTCFullYear()
				const month = wibCurrent.getUTCMonth()
				const daysInMonth = new Date(
					Date.UTC(year, month + 1, 0)
				).getUTCDate()

				for (let d = 1; d <= daysInMonth; d++) {
					const startUtc = Date.UTC(year, month, d)
					const start = new Date(startUtc - WIB_OFFSET_MS)
					const end = new Date(start.getTime() + 24 * 60 * 60 * 1000)
					buckets.push({
						label: String(d).padStart(2, '0'),
						start,
						end
					})
				}

				return {
					currentStart,
					currentEnd,
					previousStart,
					previousEnd,
					buckets
				}
			}

			case '6m': {
				const wibNow = AnalyticsService.toWib(now)
				const sixMonthsAgoUtc = Date.UTC(
					wibNow.getUTCFullYear(),
					wibNow.getUTCMonth() - 6,
					1
				)
				const currentStart = new Date(sixMonthsAgoUtc - WIB_OFFSET_MS)
				const currentEnd = now

				const twelveMonthsAgoUtc = Date.UTC(
					wibNow.getUTCFullYear(),
					wibNow.getUTCMonth() - 12,
					1
				)
				const previousStart = new Date(
					twelveMonthsAgoUtc - WIB_OFFSET_MS
				)
				const previousEnd = currentStart

				const buckets: BucketDef[] = []
				for (let i = 5; i >= 0; i--) {
					const startUtc = Date.UTC(
						wibNow.getUTCFullYear(),
						wibNow.getUTCMonth() - i,
						1
					)
					const endUtc = Date.UTC(
						wibNow.getUTCFullYear(),
						wibNow.getUTCMonth() - i + 1,
						1
					)
					const start = new Date(startUtc - WIB_OFFSET_MS)
					const end = new Date(endUtc - WIB_OFFSET_MS)
					const wibStart = AnalyticsService.toWib(start)
					const label = MONTH_NAMES[wibStart.getUTCMonth()]
					buckets.push({ label, start, end })
				}

				return {
					currentStart,
					currentEnd,
					previousStart,
					previousEnd,
					buckets
				}
			}

			case '1y': {
				const wibNow = AnalyticsService.toWib(now)
				const twelveMonthsAgoUtc = Date.UTC(
					wibNow.getUTCFullYear(),
					wibNow.getUTCMonth() - 12,
					1
				)
				const currentStart = new Date(
					twelveMonthsAgoUtc - WIB_OFFSET_MS
				)
				const currentEnd = now

				const twentyFourMonthsAgoUtc = Date.UTC(
					wibNow.getUTCFullYear(),
					wibNow.getUTCMonth() - 24,
					1
				)
				const previousStart = new Date(
					twentyFourMonthsAgoUtc - WIB_OFFSET_MS
				)
				const previousEnd = currentStart

				const buckets: BucketDef[] = []
				for (let i = 11; i >= 0; i--) {
					const startUtc = Date.UTC(
						wibNow.getUTCFullYear(),
						wibNow.getUTCMonth() - i,
						1
					)
					const endUtc = Date.UTC(
						wibNow.getUTCFullYear(),
						wibNow.getUTCMonth() - i + 1,
						1
					)
					const start = new Date(startUtc - WIB_OFFSET_MS)
					const end = new Date(endUtc - WIB_OFFSET_MS)
					const wibStart = AnalyticsService.toWib(start)
					const label = MONTH_NAMES[wibStart.getUTCMonth()]
					buckets.push({ label, start, end })
				}

				return {
					currentStart,
					currentEnd,
					previousStart,
					previousEnd,
					buckets
				}
			}

			default: {
				throw new AppError('Invalid analytics range', 'BAD_REQUEST')
			}
		}
	}

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
				walkIns: sql<string>`COUNT(DISTINCT ${booking.id}) FILTER (WHERE ${booking.type} = 'walk_in')`
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
			walkIns: parseInt(row.walkIns ?? '0', 10)
		}
	}

	private static async queryChartBuckets(
		organizationId: string,
		buckets: BucketDef[]
	): Promise<ChartBucket[]> {
		const results = await Promise.all(
			buckets.map(async (bucket) => {
				const agg = await AnalyticsService.queryAggregates(
					organizationId,
					bucket.start,
					bucket.end
				)
				return {
					label: bucket.label,
					sales: agg.sales,
					bookings: agg.bookings
				}
			})
		)
		return results
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

		const windows = AnalyticsService.buildTimeWindows(range, new Date())

		const [currentAgg, previousAgg] = await Promise.all([
			AnalyticsService.queryAggregates(
				organizationId,
				windows.currentStart,
				windows.currentEnd
			),
			AnalyticsService.queryAggregates(
				organizationId,
				windows.previousStart,
				windows.previousEnd
			)
		])

		const chartBuckets = await AnalyticsService.queryChartBuckets(
			organizationId,
			windows.buckets
		)

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
				sales: chartBuckets.map((b) => ({
					label: b.label,
					sales: b.sales,
					bookings: 0
				})),
				bookings: chartBuckets.map((b) => ({
					label: b.label,
					sales: 0,
					bookings: b.bookings
				}))
			}
		}

		cache.set(cacheKey, { data: response, expiresAt: Date.now() + 60_000 })

		return response
	}
}
