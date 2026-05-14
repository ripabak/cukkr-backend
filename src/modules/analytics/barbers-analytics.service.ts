import { and, eq, gte, lt, sql } from 'drizzle-orm'

import { db } from '../../lib/database'
import { member, user } from '../auth/schema'
import { booking, bookingService } from '../bookings/schema'
import { AnalyticsModel } from './model'
import { buildTimeWindows } from './time-windows'

type AnalyticsRange = AnalyticsModel.AnalyticsRange
type BarberChartItem = AnalyticsModel.BarberChartItem
type BarberListItem = AnalyticsModel.BarberListItem

export abstract class BarberAnalyticsService {
	static async getBarberChart(
		organizationId: string,
		range: AnalyticsRange
	): Promise<{ chart: BarberChartItem[] }> {
		const { currentStart, currentEnd } = buildTimeWindows(range, new Date())

		const rows = await db
			.select({
				memberId: member.id,
				barberName: user.name,
				revenue: sql<string>`COALESCE(SUM(${bookingService.price}), 0)`
			})
			.from(member)
			.innerJoin(user, eq(user.id, member.userId))
			.leftJoin(
				booking,
				and(
					eq(booking.handledByBarberId, member.id),
					eq(booking.organizationId, organizationId),
					eq(booking.status, 'completed'),
					gte(booking.completedAt, currentStart),
					lt(booking.completedAt, currentEnd)
				)
			)
			.leftJoin(bookingService, eq(bookingService.bookingId, booking.id))
			.where(eq(member.organizationId, organizationId))
			.groupBy(member.id, user.name)
			.orderBy(sql`COALESCE(SUM(${bookingService.price}), 0) DESC`)

		return {
			chart: rows.map((r) => ({
				barberId: r.memberId,
				barberName: r.barberName,
				value: parseInt(r.revenue, 10)
			}))
		}
	}

	static async getBarberList(
		organizationId: string,
		range: AnalyticsRange
	): Promise<BarberListItem[]> {
		const { currentStart, currentEnd } = buildTimeWindows(range, new Date())

		const rows = await db
			.select({
				memberId: member.id,
				barberName: user.name,
				barberImageUrl: user.image,
				totalCustomers: sql<string>`COUNT(DISTINCT ${booking.customerId})`,
				totalRevenue: sql<string>`COALESCE(SUM(${bookingService.price}), 0)`
			})
			.from(member)
			.innerJoin(user, eq(user.id, member.userId))
			.leftJoin(
				booking,
				and(
					eq(booking.handledByBarberId, member.id),
					eq(booking.organizationId, organizationId),
					eq(booking.status, 'completed'),
					gte(booking.completedAt, currentStart),
					lt(booking.completedAt, currentEnd)
				)
			)
			.leftJoin(bookingService, eq(bookingService.bookingId, booking.id))
			.where(eq(member.organizationId, organizationId))
			.groupBy(member.id, user.name, user.image)
			.orderBy(sql`COALESCE(SUM(${bookingService.price}), 0) DESC`)

		return rows.map((r) => ({
			barberId: r.memberId,
			name: r.barberName,
			imageUrl: r.barberImageUrl ?? null,
			totalCustomers: parseInt(r.totalCustomers, 10),
			totalRevenue: parseInt(r.totalRevenue, 10)
		}))
	}
}
