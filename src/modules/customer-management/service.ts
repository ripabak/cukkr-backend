import { and, count, desc, eq, ilike, or, sql } from 'drizzle-orm'

import { AppError } from '../../core/error'
import { db } from '../../lib/database'
import { PaginatedResult, normalizePagination } from '../../core/pagination'
import { booking, bookingService, customer } from '../bookings/schema'
import { CustomerManagementModel } from './model'

type CustomerListQuery = CustomerManagementModel.CustomerListQuery
type CustomerListItemResponse = CustomerManagementModel.CustomerListItemResponse
type CustomerDetailResponse = CustomerManagementModel.CustomerDetailResponse
type CustomerBookingItemResponse =
	CustomerManagementModel.CustomerBookingItemResponse

export abstract class CustomerManagementService {
	private static buildAggregateQuery(orgId: string, customerId?: string) {
		const activeStatuses = ['waiting', 'in_progress', 'completed'] as const
		const completedStatus = 'completed'

		const baseWhere = customerId
			? and(
					eq(customer.organizationId, orgId),
					eq(customer.id, customerId)
				)
			: eq(customer.organizationId, orgId)

		return { baseWhere, activeStatuses, completedStatus }
	}

	static async listCustomers(
		orgId: string,
		query: CustomerListQuery
	): Promise<PaginatedResult<CustomerListItemResponse>> {
		const pagination = normalizePagination(query)
		const sort = query.sort ?? 'recent'

		const searchConditions = query.search
			? or(
					ilike(customer.name, `%${query.search}%`),
					ilike(customer.email, `%${query.search}%`),
					ilike(customer.phone, `%${query.search}%`)
				)
			: undefined

		const whereClause = and(
			eq(customer.organizationId, orgId),
			searchConditions
		)

		const totalBookingsSql = sql<number>`
			COUNT(DISTINCT CASE WHEN ${booking.status} IN ('waiting', 'in_progress', 'completed') THEN ${booking.id} END)
		`
		const totalSpendSql = sql<number>`
			COALESCE(SUM(CASE WHEN ${booking.status} = 'completed' THEN ${bookingService.price} ELSE 0 END), 0)
		`
		const lastVisitAtSql = sql<Date | null>`
			MAX(CASE WHEN ${booking.status} != 'cancelled' THEN ${booking.createdAt} END)
		`

		const orderByClause = (() => {
			switch (sort) {
				case 'bookings_desc':
					return desc(totalBookingsSql)
				case 'spend_desc':
					return desc(totalSpendSql)
				case 'name_asc':
					return customer.name
				default:
					return sql`MAX(CASE WHEN ${booking.status} != 'cancelled' THEN ${booking.createdAt} END) DESC NULLS LAST`
			}
		})()

		const [rows, countResult] = await Promise.all([
			db
				.select({
					id: customer.id,
					name: customer.name,
					email: customer.email,
					phone: customer.phone,
					isVerified: customer.isVerified,
					totalBookings: totalBookingsSql,
					totalSpend: totalSpendSql,
					lastVisitAt: lastVisitAtSql
				})
				.from(customer)
				.leftJoin(booking, eq(booking.customerId, customer.id))
				.leftJoin(
					bookingService,
					eq(bookingService.bookingId, booking.id)
				)
				.where(whereClause)
				.groupBy(
					customer.id,
					customer.name,
					customer.email,
					customer.phone,
					customer.isVerified
				)
				.orderBy(orderByClause)
				.limit(pagination.take)
				.offset(pagination.skip),
			db.select({ count: count() }).from(customer).where(whereClause)
		])

		const data: CustomerListItemResponse[] = rows.map((row) => ({
			id: row.id,
			name: row.name,
			email: row.email,
			phone: row.phone,
			isVerified: row.isVerified,
			totalBookings: Number(row.totalBookings),
			totalSpend: Number(row.totalSpend),
			lastVisitAt: row.lastVisitAt
		}))

		return {
			data,
			totalItems: countResult[0]?.count ?? 0,
			pagination
		}
	}

	static async getCustomer(
		orgId: string,
		id: string
	): Promise<CustomerDetailResponse> {
		const totalBookingsSql = sql<number>`
			COUNT(DISTINCT CASE WHEN ${booking.status} IN ('waiting', 'in_progress', 'completed') THEN ${booking.id} END)
		`
		const totalSpendSql = sql<number>`
			COALESCE(SUM(CASE WHEN ${booking.status} = 'completed' THEN ${bookingService.price} ELSE 0 END), 0)
		`
		const lastVisitAtSql = sql<Date | null>`
			MAX(CASE WHEN ${booking.status} != 'cancelled' THEN ${booking.createdAt} END)
		`
		const appointmentCountSql = sql<number>`
			COUNT(DISTINCT CASE WHEN ${booking.type} = 'appointment' AND ${booking.status} IN ('waiting', 'in_progress', 'completed') THEN ${booking.id} END)
		`
		const walkInCountSql = sql<number>`
			COUNT(DISTINCT CASE WHEN ${booking.type} = 'walk_in' AND ${booking.status} IN ('waiting', 'in_progress', 'completed') THEN ${booking.id} END)
		`
		const completedCountSql = sql<number>`
			COUNT(DISTINCT CASE WHEN ${booking.status} = 'completed' THEN ${booking.id} END)
		`
		const cancelledCountSql = sql<number>`
			COUNT(DISTINCT CASE WHEN ${booking.status} = 'cancelled' THEN ${booking.id} END)
		`

		const rows = await db
			.select({
				id: customer.id,
				name: customer.name,
				email: customer.email,
				phone: customer.phone,
				isVerified: customer.isVerified,
				notes: customer.notes,
				createdAt: customer.createdAt,
				totalBookings: totalBookingsSql,
				totalSpend: totalSpendSql,
				lastVisitAt: lastVisitAtSql,
				appointmentCount: appointmentCountSql,
				walkInCount: walkInCountSql,
				completedCount: completedCountSql,
				cancelledCount: cancelledCountSql
			})
			.from(customer)
			.leftJoin(booking, eq(booking.customerId, customer.id))
			.leftJoin(bookingService, eq(bookingService.bookingId, booking.id))
			.where(and(eq(customer.organizationId, orgId), eq(customer.id, id)))
			.groupBy(
				customer.id,
				customer.name,
				customer.email,
				customer.phone,
				customer.isVerified,
				customer.notes,
				customer.createdAt
			)

		if (rows.length === 0) {
			throw new AppError('Customer not found', 'NOT_FOUND')
		}

		const row = rows[0]

		return {
			id: row.id,
			name: row.name,
			email: row.email,
			phone: row.phone,
			isVerified: row.isVerified,
			notes: row.notes,
			createdAt: row.createdAt,
			totalBookings: Number(row.totalBookings),
			totalSpend: Number(row.totalSpend),
			lastVisitAt: row.lastVisitAt,
			appointmentCount: Number(row.appointmentCount),
			walkInCount: Number(row.walkInCount),
			completedCount: Number(row.completedCount),
			cancelledCount: Number(row.cancelledCount)
		}
	}

	static async updateNotes(
		orgId: string,
		id: string,
		notes: string
	): Promise<CustomerDetailResponse> {
		const existing = await db.query.customer.findFirst({
			where: and(eq(customer.id, id), eq(customer.organizationId, orgId))
		})

		if (!existing) {
			throw new AppError('Customer not found', 'NOT_FOUND')
		}

		await db
			.update(customer)
			.set({ notes: notes === '' ? null : notes })
			.where(eq(customer.id, id))

		return CustomerManagementService.getCustomer(orgId, id)
	}

	static async getCustomerBookings(
		orgId: string,
		customerId: string,
		query: { page?: number; limit?: number; type?: string }
	): Promise<PaginatedResult<CustomerBookingItemResponse>> {
		const pagination = normalizePagination(query)

		const existing = await db.query.customer.findFirst({
			where: and(
				eq(customer.id, customerId),
				eq(customer.organizationId, orgId)
			)
		})

		if (!existing) {
			throw new AppError('Customer not found', 'NOT_FOUND')
		}

		const typeCondition =
			query.type && query.type !== 'all'
				? eq(booking.type, query.type)
				: undefined

		const whereCondition = and(
			eq(booking.customerId, customerId),
			eq(booking.organizationId, orgId),
			typeCondition
		)

		const [bookings, countResult] = await Promise.all([
			db.query.booking.findMany({
				where: whereCondition,
				orderBy: desc(booking.createdAt),
				limit: pagination.take,
				offset: pagination.skip,
				with: {
					services: true
				}
			}),
			db.select({ count: count() }).from(booking).where(whereCondition)
		])

		const data: CustomerBookingItemResponse[] = bookings.map((b) => ({
			id: b.id,
			referenceNumber: b.referenceNumber,
			createdAt: b.createdAt,
			status: b.status,
			type: b.type,
			services: b.services.map((s) => ({
				name: s.serviceName,
				price: s.price
			})),
			totalAmount: b.services.reduce((sum, s) => sum + s.price, 0)
		}))

		return {
			data,
			totalItems: countResult[0]?.count ?? 0,
			pagination
		}
	}
}
