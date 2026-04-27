import { and, eq, gte, inArray, isNotNull, lt, ne, or, sql } from 'drizzle-orm'
import { customAlphabet, nanoid } from 'nanoid'

import { AppError } from '../../core/error'
import { db } from '../../lib/database'
import { member, user } from '../auth/schema'
import { OpenHoursService } from '../open-hours/service'
import { service as serviceTable } from '../services/schema'
import { BookingModel } from './model'
import {
	booking,
	bookingDailyCounter,
	bookingService,
	customer,
	type Booking as BookingRow,
	type BookingService as BookingServiceRow,
	type Customer as CustomerRow
} from './schema'

type MemberRow = typeof member.$inferSelect
type UserRow = typeof user.$inferSelect
type ServiceRow = typeof serviceTable.$inferSelect
type BookingStatus = BookingModel.BookingStatus
type BookingCreateInput = BookingModel.BookingCreateInput
type DatabaseTransaction = Parameters<Parameters<typeof db.transaction>[0]>[0]

type BookingReadRow = BookingRow & {
	customer: CustomerRow
	barber: (MemberRow & { user: UserRow }) | null
	services: BookingServiceRow[]
}

const WIB_OFFSET_MS = 7 * 60 * 60 * 1000
const CHECKSUM_ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const createReferenceChecksum = customAlphabet(CHECKSUM_ALPHABET, 2)
const ASSIGNABLE_MEMBER_ROLES = new Set(['owner', 'barber'])
const STATUS_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
	pending: ['waiting'],
	waiting: ['in_progress', 'cancelled'],
	in_progress: ['completed', 'waiting', 'cancelled'],
	completed: [],
	cancelled: []
}

export abstract class BookingService {
	private static toWibDate(date: Date): Date {
		return new Date(date.getTime() + WIB_OFFSET_MS)
	}

	private static getWibDateKey(date: Date): string {
		const wibDate = BookingService.toWibDate(date)
		const year = wibDate.getUTCFullYear()
		const month = String(wibDate.getUTCMonth() + 1).padStart(2, '0')
		const day = String(wibDate.getUTCDate()).padStart(2, '0')

		return `${year}${month}${day}`
	}

	private static getWibDayOfWeek(date: Date): number {
		return BookingService.toWibDate(date).getUTCDay()
	}

	private static getWibTime(date: Date): string {
		const wibDate = BookingService.toWibDate(date)
		const hours = String(wibDate.getUTCHours()).padStart(2, '0')
		const minutes = String(wibDate.getUTCMinutes()).padStart(2, '0')

		return `${hours}:${minutes}`
	}

	private static buildDayRange(date: string): {
		start: Date
		end: Date
	} {
		const start = new Date(`${date}T00:00:00.000Z`)
		if (Number.isNaN(start.getTime())) {
			throw new AppError('Invalid booking date', 'BAD_REQUEST')
		}

		const end = new Date(start)
		end.setUTCDate(end.getUTCDate() + 1)

		return { start, end }
	}

	private static normalizePhone(phone?: string | null): string | null {
		if (!phone) return null

		const trimmed = phone.trim()
		if (!trimmed) return null

		if (trimmed.startsWith('+')) {
			const digits = trimmed.slice(1).replace(/\D/g, '')
			return digits ? `+${digits}` : null
		}

		const digits = trimmed.replace(/\D/g, '')
		if (!digits) return null
		if (digits.startsWith('0')) return `+62${digits.slice(1)}`
		if (digits.startsWith('62')) return `+${digits}`

		return `+${digits}`
	}

	private static normalizeEmail(email?: string | null): string | null {
		const normalized = email?.trim().toLowerCase() ?? ''
		return normalized || null
	}

	private static calculateDiscountedPrice(serviceRow: ServiceRow): number {
		return Math.max(
			0,
			Math.round(serviceRow.price * ((100 - serviceRow.discount) / 100))
		)
	}

	private static async validateBarberAssignment(
		organizationId: string,
		barberId: string | null | undefined
	): Promise<string | null> {
		if (!barberId) return null

		const barberRow = await db.query.member.findFirst({
			where: and(
				eq(member.id, barberId),
				eq(member.organizationId, organizationId)
			)
		})

		if (!barberRow || !ASSIGNABLE_MEMBER_ROLES.has(barberRow.role)) {
			throw new AppError(
				'Assigned barber must be an owner or barber in the active organization',
				'BAD_REQUEST'
			)
		}

		return barberRow.id
	}

	private static async validateServices(
		organizationId: string,
		serviceIds: string[]
	): Promise<ServiceRow[]> {
		const rows = await db.query.service.findMany({
			where: and(
				eq(serviceTable.organizationId, organizationId),
				inArray(serviceTable.id, serviceIds)
			)
		})

		if (rows.length !== serviceIds.length) {
			throw new AppError(
				'One or more services are invalid for the active organization',
				'BAD_REQUEST'
			)
		}

		const serviceById = new Map(rows.map((row) => [row.id, row]))
		const orderedRows = serviceIds.map((serviceId) =>
			serviceById.get(serviceId)
		)

		if (orderedRows.some((row) => !row)) {
			throw new AppError(
				'One or more services are invalid for the active organization',
				'BAD_REQUEST'
			)
		}

		if (orderedRows.some((row) => !row!.isActive)) {
			throw new AppError(
				'All selected services must be active',
				'BAD_REQUEST'
			)
		}

		return orderedRows as ServiceRow[]
	}

	private static async validateScheduledAt(
		organizationId: string,
		input: BookingCreateInput
	): Promise<Date | null> {
		if (input.type === 'walk_in') {
			if (input.scheduledAt) {
				throw new AppError(
					'Walk-in bookings cannot include scheduledAt',
					'BAD_REQUEST'
				)
			}

			return null
		}

		const scheduledAt = new Date(input.scheduledAt)
		if (Number.isNaN(scheduledAt.getTime())) {
			throw new AppError(
				'Invalid appointment scheduledAt value',
				'BAD_REQUEST'
			)
		}

		if (scheduledAt.getTime() <= Date.now()) {
			throw new AppError(
				'Appointment scheduledAt must be in the future',
				'BAD_REQUEST'
			)
		}

		await BookingService.validateOpenHours(organizationId, scheduledAt)

		return scheduledAt
	}

	private static async validateOpenHours(
		organizationId: string,
		scheduledAt: Date
	): Promise<void> {
		const schedule =
			await OpenHoursService.getWeeklyScheduleForOrganization(
				organizationId
			)
		const daySchedule =
			schedule[BookingService.getWibDayOfWeek(scheduledAt)]
		const timeValue = BookingService.getWibTime(scheduledAt)

		if (
			!daySchedule ||
			!daySchedule.isOpen ||
			!daySchedule.openTime ||
			!daySchedule.closeTime ||
			timeValue < daySchedule.openTime ||
			timeValue >= daySchedule.closeTime
		) {
			throw new AppError(
				'Appointment scheduledAt must fall within open hours',
				'BAD_REQUEST'
			)
		}
	}

	private static validateStatusTransition(
		currentStatus: BookingStatus,
		nextStatus: BookingStatus
	): void {
		if (currentStatus === nextStatus) {
			throw new AppError(
				'Booking is already in the requested status',
				'BAD_REQUEST'
			)
		}

		if (!STATUS_TRANSITIONS[currentStatus].includes(nextStatus)) {
			throw new AppError(
				`Cannot transition booking from ${currentStatus} to ${nextStatus}`,
				'BAD_REQUEST'
			)
		}
	}

	private static async checkSingleInProgress(
		tx: DatabaseTransaction,
		organizationId: string,
		barberId: string | null,
		excludedBookingId: string
	): Promise<void> {
		if (!barberId) return

		const existingInProgress = await tx.query.booking.findFirst({
			where: and(
				eq(booking.organizationId, organizationId),
				eq(booking.barberId, barberId),
				eq(booking.status, 'in_progress'),
				ne(booking.id, excludedBookingId)
			)
		})

		if (existingInProgress) {
			throw new AppError(
				'Barber already has a booking in progress',
				'CONFLICT'
			)
		}
	}

	private static buildStatusUpdate(
		current: BookingRow,
		nextStatus: BookingStatus,
		now: Date
	): Partial<BookingRow> {
		if (nextStatus === 'in_progress') {
			return {
				status: nextStatus,
				startedAt: now,
				completedAt: null,
				cancelledAt: null,
				updatedAt: now
			}
		}

		if (nextStatus === 'completed') {
			return {
				status: nextStatus,
				startedAt: current.startedAt ?? now,
				completedAt: now,
				cancelledAt: null,
				updatedAt: now
			}
		}

		if (nextStatus === 'cancelled') {
			return {
				status: nextStatus,
				startedAt: current.startedAt,
				completedAt: current.completedAt,
				cancelledAt: now,
				updatedAt: now
			}
		}

		return {
			status: nextStatus,
			startedAt:
				current.status === 'in_progress' && nextStatus === 'waiting'
					? null
					: current.startedAt,
			completedAt: current.completedAt,
			cancelledAt: current.cancelledAt,
			updatedAt: now
		}
	}

	private static mapBarber(
		barberRow: BookingReadRow['barber']
	): BookingModel.BarberSummaryResponse | null {
		if (!barberRow) return null

		return {
			memberId: barberRow.id,
			userId: barberRow.userId,
			name: barberRow.user.name,
			email: barberRow.user.email,
			role: barberRow.role
		}
	}

	private static mapSummary(
		row: BookingReadRow
	): BookingModel.BookingSummaryResponse {
		return {
			id: row.id,
			referenceNumber: row.referenceNumber,
			type: row.type as BookingModel.BookingType,
			status: row.status as BookingModel.BookingStatus,
			customerName: row.customer.name,
			serviceNames: row.services.map((item) => item.serviceName),
			barber: BookingService.mapBarber(row.barber),
			scheduledAt: row.scheduledAt,
			createdAt: row.createdAt
		}
	}

	private static mapDetail(
		row: BookingReadRow
	): BookingModel.BookingDetailResponse {
		return {
			id: row.id,
			organizationId: row.organizationId,
			referenceNumber: row.referenceNumber,
			type: row.type as BookingModel.BookingType,
			status: row.status as BookingModel.BookingStatus,
			customer: {
				id: row.customer.id,
				name: row.customer.name,
				phone: row.customer.phone,
				email: row.customer.email,
				isVerified: row.customer.isVerified,
				notes: row.customer.notes,
				createdAt: row.customer.createdAt,
				updatedAt: row.customer.updatedAt
			},
			barber: BookingService.mapBarber(row.barber),
			services: row.services.map((item) => ({
				id: item.id,
				serviceId: item.serviceId,
				serviceName: item.serviceName,
				price: item.price,
				originalPrice: item.originalPrice,
				discount: item.discount,
				duration: item.duration
			})),
			scheduledAt: row.scheduledAt,
			notes: row.notes,
			startedAt: row.startedAt,
			completedAt: row.completedAt,
			cancelledAt: row.cancelledAt,
			createdById: row.createdById,
			createdAt: row.createdAt,
			updatedAt: row.updatedAt
		}
	}

	static async listBookings(
		organizationId: string,
		query: BookingModel.BookingListQuery
	): Promise<BookingModel.BookingSummaryResponse[]> {
		const { start, end } = BookingService.buildDayRange(query.date)

		const dayCondition = or(
			and(
				eq(booking.type, 'appointment'),
				isNotNull(booking.scheduledAt),
				gte(booking.scheduledAt, start),
				lt(booking.scheduledAt, end)
			),
			and(
				eq(booking.type, 'walk_in'),
				gte(booking.createdAt, start),
				lt(booking.createdAt, end)
			)
		)

		const conditions = [
			eq(booking.organizationId, organizationId),
			dayCondition
		]
		if (query.status && query.status !== 'all') {
			conditions.push(eq(booking.status, query.status))
		}
		if (query.barberId) {
			conditions.push(eq(booking.barberId, query.barberId))
		}

		const rows = await db.query.booking.findMany({
			where: and(...conditions),
			with: {
				customer: true,
				barber: {
					with: {
						user: true
					}
				},
				services: true
			}
		})

		return rows
			.sort((left, right) => {
				const leftTime = (left.scheduledAt ?? left.createdAt).getTime()
				const rightTime = (
					right.scheduledAt ?? right.createdAt
				).getTime()
				return leftTime - rightTime
			})
			.map((row) => BookingService.mapSummary(row as BookingReadRow))
	}

	static async createBooking(
		organizationId: string,
		createdById: string,
		input: BookingModel.BookingCreateInput
	): Promise<BookingModel.BookingDetailResponse> {
		const scheduledAt = await BookingService.validateScheduledAt(
			organizationId,
			input
		)
		const selectedServices = await BookingService.validateServices(
			organizationId,
			input.serviceIds
		)
		const barberId = await BookingService.validateBarberAssignment(
			organizationId,
			input.barberId
		)
		const bookingId = await db.transaction(async (tx) => {
			const now = new Date()
			const normalizedPhone = BookingService.normalizePhone(
				input.customerPhone
			)
			const normalizedEmail = BookingService.normalizeEmail(
				input.customerEmail
			)
			const matchers = [
				normalizedPhone
					? eq(customer.phone, normalizedPhone)
					: undefined,
				normalizedEmail
					? eq(customer.email, normalizedEmail)
					: undefined
			].filter(Boolean)

			const existingCustomer =
				matchers.length > 0
					? await tx.query.customer.findFirst({
							where: and(
								eq(customer.organizationId, organizationId),
								matchers.length === 1
									? matchers[0]!
									: or(...matchers)
							)
						})
					: null

			const customerRow =
				existingCustomer ??
				(
					await tx
						.insert(customer)
						.values({
							id: nanoid(),
							organizationId,
							name: input.customerName,
							phone: normalizedPhone,
							email: normalizedEmail,
							isVerified: Boolean(
								normalizedPhone || normalizedEmail
							),
							notes: null
						})
						.returning()
				)[0]

			const bookingDate = BookingService.getWibDateKey(now)
			const [counterRow] = await tx
				.insert(bookingDailyCounter)
				.values({
					organizationId,
					bookingDate,
					lastSequence: 1,
					updatedAt: now
				})
				.onConflictDoUpdate({
					target: [
						bookingDailyCounter.organizationId,
						bookingDailyCounter.bookingDate
					],
					set: {
						lastSequence: sql`${bookingDailyCounter.lastSequence} + 1`,
						updatedAt: now
					}
				})
				.returning()

			const referenceNumber = `BK-${bookingDate}-${String(
				counterRow.lastSequence
			).padStart(3, '0')}-${createReferenceChecksum()}`
			const nextBookingId = nanoid()

			await tx.insert(booking).values({
				id: nextBookingId,
				organizationId,
				referenceNumber,
				type: input.type,
				status: 'waiting',
				customerId: customerRow.id,
				barberId,
				scheduledAt,
				notes: input.notes ?? null,
				startedAt: null,
				completedAt: null,
				cancelledAt: null,
				createdById,
				createdAt: now,
				updatedAt: now
			})

			await tx.insert(bookingService).values(
				selectedServices.map((serviceRow) => ({
					id: nanoid(),
					bookingId: nextBookingId,
					serviceId: serviceRow.id,
					serviceName: serviceRow.name,
					price: BookingService.calculateDiscountedPrice(serviceRow),
					originalPrice: serviceRow.price,
					discount: serviceRow.discount,
					duration: serviceRow.duration
				}))
			)

			return nextBookingId
		})

		return BookingService.getBooking(organizationId, bookingId)
	}

	static async getBooking(
		organizationId: string,
		id: string
	): Promise<BookingModel.BookingDetailResponse> {
		const row = await db.query.booking.findFirst({
			where: and(
				eq(booking.id, id),
				eq(booking.organizationId, organizationId)
			),
			with: {
				customer: true,
				barber: {
					with: {
						user: true
					}
				},
				services: true
			}
		})

		if (!row) {
			throw new AppError('Booking not found', 'NOT_FOUND')
		}

		return BookingService.mapDetail(row as BookingReadRow)
	}

	static async updateBookingStatus(
		organizationId: string,
		id: string,
		input: BookingModel.BookingStatusUpdateInput
	): Promise<BookingModel.BookingDetailResponse> {
		await db.transaction(async (tx) => {
			const existing = await tx.query.booking.findFirst({
				where: and(
					eq(booking.id, id),
					eq(booking.organizationId, organizationId)
				)
			})

			if (!existing) {
				throw new AppError('Booking not found', 'NOT_FOUND')
			}

			BookingService.validateStatusTransition(
				existing.status as BookingStatus,
				input.status
			)

			if (input.status === 'in_progress') {
				await BookingService.checkSingleInProgress(
					tx,
					organizationId,
					existing.barberId,
					id
				)
			}

			const now = new Date()
			await tx
				.update(booking)
				.set(
					BookingService.buildStatusUpdate(
						existing,
						input.status,
						now
					)
				)
				.where(
					and(
						eq(booking.id, id),
						eq(booking.organizationId, organizationId)
					)
				)
		})

		return BookingService.getBooking(organizationId, id)
	}
}
