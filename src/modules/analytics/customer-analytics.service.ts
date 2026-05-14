import { and, eq, gte, inArray, lt, sql } from 'drizzle-orm'

import { db } from '../../lib/database'
import { PaginatedResult, normalizePagination } from '../../core/pagination'
import { booking, bookingService, customer } from '../bookings/schema'
import { AnalyticsModel } from './model'
import { buildTimeWindows } from './time-windows'

type AnalyticsRange = AnalyticsModel.AnalyticsRange
type CustomerAnalyticsStats = AnalyticsModel.CustomerAnalyticsStats
type CustomerAnalyticsListItem = AnalyticsModel.CustomerAnalyticsListItem
type CustomerStatusFilter = AnalyticsModel.CustomerStatusFilter
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

interface CustomerAgg {
	totalCustomers: number
	totalWalkIn: number
	totalAppointment: number
	totalNew: number
	totalReturn: number
}

async function queryCustomerPeriodAgg(
	organizationId: string,
	periodStart: Date,
	periodEnd: Date
): Promise<CustomerAgg> {
	const periodWhere = and(
		eq(booking.organizationId, organizationId),
		eq(booking.status, 'completed'),
		gte(booking.completedAt, periodStart),
		lt(booking.completedAt, periodEnd)
	)

	const [statsRows, customerRows] = await Promise.all([
		db
			.select({
				totalCustomers: sql<string>`COUNT(DISTINCT ${booking.customerId})`,
				totalWalkIn: sql<string>`COUNT(DISTINCT ${booking.id}) FILTER (WHERE ${booking.type} = 'walk_in')`,
				totalAppointment: sql<string>`COUNT(DISTINCT ${booking.id}) FILTER (WHERE ${booking.type} = 'appointment')`
			})
			.from(booking)
			.where(periodWhere),
		db
			.select({ customerId: booking.customerId })
			.from(booking)
			.where(periodWhere)
			.groupBy(booking.customerId)
	])

	const customerIds = customerRows.map((r) => r.customerId)
	let totalNew = 0
	let totalReturn = 0

	if (customerIds.length > 0) {
		// Customer = "new" jika kunjungan pertama mereka (MIN completedAt) ada di
		// periode ini. Customer = "return" jika kunjungan pertama mereka sebelum
		// periode ini — berapapun jumlah kunjungan mereka di periode ini.
		const firstVisitRows = await db
			.select({
				customerId: booking.customerId,
				firstVisitAt: sql<string>`MIN(${booking.completedAt})`
			})
			.from(booking)
			.where(
				and(
					eq(booking.organizationId, organizationId),
					eq(booking.status, 'completed'),
					inArray(booking.customerId, customerIds)
				)
			)
			.groupBy(booking.customerId)

		for (const row of firstVisitRows) {
			if (new Date(row.firstVisitAt) < periodStart) {
				totalReturn++
			} else {
				totalNew++
			}
		}
	}

	const row = statsRows[0]
	return {
		totalCustomers: parseInt(row.totalCustomers ?? '0', 10),
		totalWalkIn: parseInt(row.totalWalkIn ?? '0', 10),
		totalAppointment: parseInt(row.totalAppointment ?? '0', 10),
		totalNew,
		totalReturn
	}
}

async function queryCustomerCount(
	organizationId: string,
	start: Date,
	end: Date
): Promise<number> {
	const rows = await db
		.select({
			customers: sql<string>`COUNT(DISTINCT ${booking.customerId})`
		})
		.from(booking)
		.where(
			and(
				eq(booking.organizationId, organizationId),
				eq(booking.status, 'completed'),
				gte(booking.completedAt, start),
				lt(booking.completedAt, end)
			)
		)
	return parseInt(rows[0].customers ?? '0', 10)
}

export abstract class CustomerAnalyticsService {
	static async getCustomerStats(
		organizationId: string,
		range: AnalyticsRange
	): Promise<CustomerAnalyticsStats> {
		const windows = buildTimeWindows(range, new Date())

		const [currentAgg, previousAgg, chartBuckets] = await Promise.all([
			queryCustomerPeriodAgg(
				organizationId,
				windows.currentStart,
				windows.currentEnd
			),
			queryCustomerPeriodAgg(
				organizationId,
				windows.previousStart,
				windows.previousEnd
			),
			Promise.all(
				windows.buckets.map(async (b) => {
					const value = await queryCustomerCount(
						organizationId,
						b.start,
						b.end
					)
					return { label: b.label, value }
				})
			)
		])

		return {
			range,
			stats: {
				totalCustomers: computeStatCard(
					currentAgg.totalCustomers,
					previousAgg.totalCustomers
				),
				totalWalkIn: computeStatCard(
					currentAgg.totalWalkIn,
					previousAgg.totalWalkIn
				),
				totalAppointment: computeStatCard(
					currentAgg.totalAppointment,
					previousAgg.totalAppointment
				),
				totalNew: computeStatCard(
					currentAgg.totalNew,
					previousAgg.totalNew
				),
				totalReturn: computeStatCard(
					currentAgg.totalReturn,
					previousAgg.totalReturn
				)
			},
			chart: chartBuckets
		}
	}

	static async getCustomerList(
		organizationId: string,
		range: AnalyticsRange,
		status: CustomerStatusFilter,
		query: { page?: number; limit?: number }
	): Promise<PaginatedResult<CustomerAnalyticsListItem>> {
		const pagination = normalizePagination(query)
		const { currentStart, currentEnd } = buildTimeWindows(range, new Date())

		const periodWhere = and(
			eq(booking.organizationId, organizationId),
			eq(booking.status, 'completed'),
			gte(booking.completedAt, currentStart),
			lt(booking.completedAt, currentEnd)
		)

		// All customers with their period stats
		const allRows = await db
			.select({
				customerId: customer.id,
				customerName: customer.name,
				totalVisits: sql<string>`COUNT(DISTINCT ${booking.id})`,
				lastVisitDate: sql<Date | null>`MAX(${booking.completedAt})`,
				totalRevenue: sql<string>`COALESCE(SUM(${bookingService.price}), 0)`
			})
			.from(booking)
			.leftJoin(bookingService, eq(bookingService.bookingId, booking.id))
			.innerJoin(customer, eq(customer.id, booking.customerId))
			.where(periodWhere)
			.groupBy(customer.id, customer.name)
			.orderBy(sql`COUNT(DISTINCT ${booking.id}) DESC`)

		// Determine returning customers (had bookings before this period)
		const customerIds = allRows.map((r) => r.customerId)
		let returningIds = new Set<string>()

		if (customerIds.length > 0) {
			const prevRows = await db
				.select({ customerId: booking.customerId })
				.from(booking)
				.where(
					and(
						eq(booking.organizationId, organizationId),
						eq(booking.status, 'completed'),
						lt(booking.completedAt, currentStart),
						inArray(booking.customerId, customerIds)
					)
				)
				.groupBy(booking.customerId)
			returningIds = new Set(prevRows.map((r) => r.customerId))
		}

		const withStatus = allRows.map((r) => ({
			customerId: r.customerId,
			customerName: r.customerName,
			totalVisits: parseInt(r.totalVisits, 10),
			lastVisitDate: r.lastVisitDate
				? new Date(r.lastVisitDate).toISOString()
				: null,
			status: (returningIds.has(r.customerId) ? 'return' : 'new') as
				| 'new'
				| 'return',
			totalRevenue: parseInt(r.totalRevenue, 10)
		}))

		const filtered =
			status === 'all'
				? withStatus
				: withStatus.filter((r) => r.status === status)

		return {
			data: filtered.slice(
				pagination.skip,
				pagination.skip + pagination.take
			),
			totalItems: filtered.length,
			pagination
		}
	}
}
