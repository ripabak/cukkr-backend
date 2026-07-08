import {
	and,
	eq,
	gte,
	inArray,
	isNotNull,
	isNull,
	lt,
	ne,
	or,
	sql
} from 'drizzle-orm'
import { customAlphabet, nanoid } from 'nanoid'

import { AppError } from '../../core/error'
import { bookingEventBus } from './event-bus'
import { db } from '../../lib/database'
import { env } from '../../lib/env'
import {
	sendBookingAcceptedEmail,
	sendBookingDeclinedEmail,
	sendBookingExpiredEmail,
	sendIdentityVerificationEmail
} from '../../lib/mail'
import {
	getDateKey,
	getDayOfWeek,
	getTimeString,
	startOfDay,
	toLocalDate
} from '../../lib/timezone'
import { fetchOrgTimezone } from '../auth/organization-metadata'
import { member, organization, user } from '../auth/schema'
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
	handledByBarber: (MemberRow & { user: UserRow }) | null
	services: BookingServiceRow[]
	createdBy: UserRow | null
}

const CHECKSUM_ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const createReferenceChecksum = customAlphabet(CHECKSUM_ALPHABET, 2)
const ASSIGNABLE_MEMBER_ROLES = new Set(['owner', 'admin', 'member'])
const WALK_IN_TRANSITIONS: Partial<Record<BookingStatus, BookingStatus[]>> = {
	waiting: ['in_progress', 'cancelled'],
	in_progress: ['completed', 'waiting', 'cancelled']
}

const APPOINTMENT_TRANSITIONS: Partial<Record<BookingStatus, BookingStatus[]>> =
	{
		requested: ['waiting', 'cancelled'],
		waiting: ['in_progress', 'cancelled'],
		in_progress: ['completed', 'waiting', 'cancelled']
	}

export abstract class BookingService {
	private static buildDayRange(
		date: string,
		timezone?: string
	): {
		start: Date
		end: Date
	} {
		const datePattern = /^\d{4}-\d{2}-\d{2}$/
		if (!datePattern.test(date)) {
			throw new AppError('Invalid booking date', 'BAD_REQUEST')
		}

		if (!timezone) {
			const start = new Date(`${date}T00:00:00.000Z`)
			const end = new Date(start)
			end.setUTCDate(end.getUTCDate() + 1)

			return { start, end }
		}

		const [year, month, day] = date.split('-').map(Number)
		const noonUts = Date.UTC(year, month - 1, day, 12, 0, 0)
		const start = startOfDay(new Date(noonUts), timezone)
		const end = startOfDay(
			new Date(noonUts + 24 * 60 * 60 * 1000),
			timezone
		)

		return { start, end }
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
		input: BookingCreateInput,
		timezone: string
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

		await BookingService.validateOpenHours(
			organizationId,
			scheduledAt,
			timezone
		)

		return scheduledAt
	}

	public static async validateOpenHours(
		organizationId: string,
		scheduledAt: Date,
		timezone?: string
	): Promise<void> {
		const tz = timezone ?? (await fetchOrgTimezone(organizationId))
		const schedule =
			await OpenHoursService.getWeeklyScheduleForOrganization(
				organizationId
			)
		const daySchedule = schedule[getDayOfWeek(scheduledAt, tz)]
		const timeValue = getTimeString(scheduledAt, tz)

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
		type: string,
		currentStatus: BookingStatus,
		nextStatus: BookingStatus
	): void {
		if (currentStatus === nextStatus) {
			throw new AppError(
				'Booking is already in the requested status',
				'BAD_REQUEST'
			)
		}

		const transitions =
			type === 'appointment'
				? APPOINTMENT_TRANSITIONS
				: WALK_IN_TRANSITIONS

		if (!transitions[currentStatus]?.includes(nextStatus)) {
			throw new AppError(
				`Cannot transition booking from ${currentStatus} to ${nextStatus}`,
				'BAD_REQUEST'
			)
		}
	}

	private static async checkSingleInProgress(
		tx: DatabaseTransaction,
		organizationId: string,
		handledByBarberId: string | null,
		excludedBookingId: string
	): Promise<void> {
		if (!handledByBarberId) return

		const existingInProgress = await tx.query.booking.findFirst({
			where: and(
				eq(booking.organizationId, organizationId),
				or(
					eq(booking.handledByBarberId, handledByBarberId),
					and(
						isNull(booking.handledByBarberId),
						eq(booking.barberId, handledByBarberId)
					)
				),
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
		now: Date,
		actorMemberId?: string | null,
		cancelReason?: string | null
	): Partial<BookingRow> {
		if (nextStatus === 'in_progress') {
			return {
				status: nextStatus,
				handledByBarberId:
					actorMemberId ??
					current.handledByBarberId ??
					current.barberId,
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
				notes: cancelReason ?? current.notes,
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
		barberRow: (MemberRow & { user: UserRow }) | null
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
			totalDuration: row.services.reduce(
				(sum, item) => sum + item.duration,
				0
			),
			barber: BookingService.mapBarber(row.barber),
			scheduledAt: row.scheduledAt,
			createdAt: row.createdAt,
			source: row.source as 'customer' | 'staff'
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
				emailVerified: row.customer.emailVerified,
				phoneVerified: row.customer.phoneVerified,
				emailVerifiedAt: row.customer.emailVerifiedAt,
				phoneVerifiedAt: row.customer.phoneVerifiedAt,
				notes: row.customer.notes,
				createdAt: row.customer.createdAt,
				updatedAt: row.customer.updatedAt
			},
			requestedBarber: BookingService.mapBarber(row.barber),
			handledByBarber: BookingService.mapBarber(row.handledByBarber),
			services: row.services.map((item) => ({
				id: item.id,
				serviceId: item.serviceId,
				serviceName: item.serviceName,
				price: item.price,
				originalPrice: item.originalPrice,
				discount: item.discount,
				duration: item.duration
			})),
			totalDuration: row.services.reduce(
				(sum, item) => sum + item.duration,
				0
			),
			scheduledAt: row.scheduledAt,
			notes: row.notes,
			startedAt: row.startedAt,
			completedAt: row.completedAt,
			cancelledAt: row.cancelledAt,
			source: row.source as 'customer' | 'staff',
			createdByName: row.createdBy?.name ?? null,
			createdById: row.createdById,
			createdAt: row.createdAt,
			updatedAt: row.updatedAt
		}
	}

	static async listBookings(
		organizationId: string,
		query: BookingModel.BookingListQuery
	): Promise<BookingModel.BookingSummaryResponse[]> {
		const timezone = await fetchOrgTimezone(organizationId)
		const { start, end } = BookingService.buildDayRange(
			query.date,
			timezone
		)

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
			dayCondition,
			isNotNull(booking.verifiedAt)
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
				handledByBarber: {
					with: {
						user: true
					}
				},
				services: true,
				createdBy: true
			}
		})

		return rows
			.sort((left, right) => {
				const leftTime = (left.scheduledAt ?? left.createdAt).getTime()
				const rightTime = (
					right.scheduledAt ?? right.createdAt
				).getTime()
				return query.sort === 'recently_added'
					? rightTime - leftTime
					: leftTime - rightTime
			})
			.map((row) => BookingService.mapSummary(row as BookingReadRow))
	}

	static async listRequestedBookings(
		organizationId: string,
		query: BookingModel.BookingRequestListQuery
	): Promise<BookingModel.BookingSummaryResponse[]> {
		const today = new Date().toISOString().slice(0, 10)
		const dateFrom = query.dateFrom ?? today
		const dateTo =
			query.dateTo ??
			(() => {
				const d = new Date(`${dateFrom}T00:00:00.000Z`)
				d.setUTCDate(d.getUTCDate() + 6)
				return d.toISOString().slice(0, 10)
			})()

		if (dateTo < dateFrom) {
			throw new AppError(
				'dateTo must be greater than or equal to dateFrom',
				'BAD_REQUEST'
			)
		}

		const timezone = await fetchOrgTimezone(organizationId)
		const { start } = BookingService.buildDayRange(dateFrom, timezone)
		const { end } = BookingService.buildDayRange(dateTo, timezone)

		const conditions = [
			eq(booking.organizationId, organizationId),
			eq(booking.status, 'requested'),
			eq(booking.type, 'appointment'),
			isNotNull(booking.verifiedAt),
			isNotNull(booking.scheduledAt),
			gte(booking.scheduledAt, start),
			lt(booking.scheduledAt, end)
		]

		if (query.barberId) {
			conditions.push(eq(booking.barberId, query.barberId))
		}

		const rows = await db.query.booking.findMany({
			where: and(...conditions),
			with: {
				customer: true,
				barber: { with: { user: true } },
				handledByBarber: { with: { user: true } },
				services: true,
				createdBy: true
			}
		})

		return rows
			.sort(
				(a, b) =>
					(a.scheduledAt ?? a.createdAt).getTime() -
					(b.scheduledAt ?? b.createdAt).getTime()
			)
			.map((row) => BookingService.mapSummary(row as BookingReadRow))
	}

	private static async doCreateBooking(
		organizationId: string,
		createdById: string,
		input: BookingModel.BookingCreateInput,
		status: BookingStatus,
		source: 'customer' | 'staff'
	): Promise<BookingModel.BookingDetailResponse> {
		const timezone = await fetchOrgTimezone(organizationId)
		const scheduledAt = await BookingService.validateScheduledAt(
			organizationId,
			input,
			timezone
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
			const normalizedEmail = BookingService.normalizeEmail(
				input.customerEmail ?? null
			)

			const existingCustomer = normalizedEmail
				? await tx.query.customer.findFirst({
						where: and(
							eq(customer.organizationId, organizationId),
							eq(customer.email, normalizedEmail)
						)
					})
				: null

			if (
				existingCustomer &&
				existingCustomer.name !== input.customerName
			) {
				await tx
					.update(customer)
					.set({
						name: input.customerName,
						updatedAt: now
					})
					.where(eq(customer.id, existingCustomer.id))
			}

			const customerRow =
				existingCustomer ??
				(
					await tx
						.insert(customer)
						.values({
							id: nanoid(),
							organizationId,
							name: input.customerName,
							phone: null,
							email: normalizedEmail,
							emailVerified: false,
							phoneVerified: false,
							notes: null
						})
						.returning()
				)[0]

			const isAppointment = input.type === 'appointment'
			const isPublicAppointment = isAppointment && status === 'requested'
			const verificationToken = isPublicAppointment ? nanoid(32) : null
			const verifiedAt = isPublicAppointment ? null : now

			const bookingDate = getDateKey(now, timezone)
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
				status,
				source,
				customerId: customerRow.id,
				barberId,
				scheduledAt,
				notes: input.notes ?? null,
				verifiedAt,
				verificationToken,
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

		const bookingDetail = await BookingService.getBooking(
			organizationId,
			bookingId
		)

		const custEmail = bookingDetail.customer.email
		const custEmailVerified = bookingDetail.customer.emailVerified
		const isPublicAppointment =
			source === 'customer' && input.type === 'appointment'

		if (!isPublicAppointment && custEmail && !custEmailVerified) {
			const token = nanoid(32)
			await db
				.update(customer)
				.set({
					emailVerificationToken: token,
					updatedAt: new Date()
				})
				.where(eq(customer.id, bookingDetail.customer.id))

			const orgInfo = await db.query.organization.findFirst({
				where: eq(organization.id, organizationId),
				columns: { name: true, slug: true }
			})

			const verifyUrl = `${env.WEB_URL}/${orgInfo?.slug}/identity/verify?token=${token}`
			await sendIdentityVerificationEmail({
				to: custEmail,
				customerName: bookingDetail.customer.name,
				barbershopName: orgInfo?.name ?? 'the barbershop',
				verifyUrl
			}).catch((err) => {
				console.error(
					'Failed to send identity verification email:',
					err
				)
			})
		}

		bookingEventBus.notify(organizationId)

		return bookingDetail
	}

	static async createBooking(
		organizationId: string,
		createdById: string,
		input: BookingModel.BookingCreateInput,
		source: 'customer' | 'staff' = 'staff'
	): Promise<BookingModel.BookingDetailResponse> {
		return BookingService.doCreateBooking(
			organizationId,
			createdById,
			input,
			'waiting',
			source
		)
	}

	static async createAppointmentRequest(
		organizationId: string,
		createdById: string,
		input: BookingModel.AppointmentBookingCreateInput
	): Promise<BookingModel.BookingDetailResponse> {
		return BookingService.doCreateBooking(
			organizationId,
			createdById,
			input,
			'requested',
			'customer'
		)
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
				handledByBarber: {
					with: {
						user: true
					}
				},
				services: true,
				createdBy: true
			}
		})

		if (!row) {
			throw new AppError('Booking not found', 'NOT_FOUND')
		}

		return BookingService.mapDetail(row as BookingReadRow)
	}

	static async getInProgressBooking(
		organizationId: string,
		userId: string
	): Promise<BookingModel.BookingDetailResponse | null> {
		const actorMember = await db.query.member.findFirst({
			where: and(
				eq(member.userId, userId),
				eq(member.organizationId, organizationId)
			)
		})

		if (!actorMember || !ASSIGNABLE_MEMBER_ROLES.has(actorMember.role)) {
			return null
		}

		const row = await db.query.booking.findFirst({
			where: and(
				eq(booking.organizationId, organizationId),
				or(
					eq(booking.handledByBarberId, actorMember.id),
					and(
						isNull(booking.handledByBarberId),
						eq(booking.barberId, actorMember.id)
					)
				),
				eq(booking.status, 'in_progress')
			),
			with: {
				customer: true,
				barber: { with: { user: true } },
				handledByBarber: { with: { user: true } },
				services: true,
				createdBy: true
			}
		})

		return row ? BookingService.mapDetail(row as BookingReadRow) : null
	}

	static async updateBookingStatus(
		organizationId: string,
		id: string,
		input: BookingModel.BookingStatusUpdateInput,
		userId: string
	): Promise<BookingModel.BookingDetailResponse> {
		await db.transaction(async (tx) => {
			const [existing] = await tx
				.select()
				.from(booking)
				.where(
					and(
						eq(booking.id, id),
						eq(booking.organizationId, organizationId)
					)
				)
				.for('update')

			if (!existing) {
				throw new AppError('Booking not found', 'NOT_FOUND')
			}

			BookingService.validateStatusTransition(
				existing.type,
				existing.status as BookingStatus,
				input.status
			)

			let actorMemberId: string | null = null
			if (input.status === 'in_progress') {
				const actorMember = await tx.query.member.findFirst({
					where: and(
						eq(member.userId, userId),
						eq(member.organizationId, organizationId)
					)
				})

				if (
					actorMember &&
					ASSIGNABLE_MEMBER_ROLES.has(actorMember.role)
				) {
					actorMemberId = actorMember.id
				}

				await BookingService.checkSingleInProgress(
					tx,
					organizationId,
					actorMemberId ??
						existing.handledByBarberId ??
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
						now,
						actorMemberId,
						input.cancelReason
					)
				)
				.where(
					and(
						eq(booking.id, id),
						eq(booking.organizationId, organizationId)
					)
				)
		})

		const result = await BookingService.getBooking(organizationId, id)
		bookingEventBus.notify(organizationId)
		return result
	}

	static async acceptBooking(
		organizationId: string,
		id: string
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
				existing.type,
				existing.status as BookingStatus,
				'waiting'
			)

			const now = new Date()
			await tx
				.update(booking)
				.set({ status: 'waiting', updatedAt: now })
				.where(
					and(
						eq(booking.id, id),
						eq(booking.organizationId, organizationId)
					)
				)
		})

		const result = await BookingService.getBooking(organizationId, id)
		bookingEventBus.notify(organizationId)

		if (result.customer.email) {
			const [orgRow] = await db
				.select({ name: organization.name })
				.from(organization)
				.where(eq(organization.id, organizationId))
				.limit(1)

			sendBookingAcceptedEmail({
				to: result.customer.email,
				customerName: result.customer.name,
				barbershopName: orgRow?.name ?? 'the barbershop',
				referenceNumber: result.referenceNumber
			}).catch(console.error)
		}

		return result
	}

	static async declineBooking(
		organizationId: string,
		id: string,
		input: BookingModel.BookingDeclineInput
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
				existing.type,
				existing.status as BookingStatus,
				'cancelled'
			)

			const now = new Date()
			await tx
				.update(booking)
				.set({
					status: 'cancelled',
					cancelledAt: now,
					notes: input.reason ?? null,
					updatedAt: now
				})
				.where(
					and(
						eq(booking.id, id),
						eq(booking.organizationId, organizationId)
					)
				)
		})

		const result = await BookingService.getBooking(organizationId, id)
		bookingEventBus.notify(organizationId)

		if (result.customer.email) {
			const [orgRow] = await db
				.select({ name: organization.name })
				.from(organization)
				.where(eq(organization.id, organizationId))
				.limit(1)

			sendBookingDeclinedEmail({
				to: result.customer.email,
				customerName: result.customer.name,
				barbershopName: orgRow?.name ?? 'the barbershop',
				referenceNumber: result.referenceNumber,
				reason: input.reason ?? null
			}).catch(console.error)
		}

		return result
	}

	static async reassignBooking(
		organizationId: string,
		id: string,
		input: BookingModel.BookingReassignInput
	): Promise<BookingModel.BookingDetailResponse> {
		const existing = await db.query.booking.findFirst({
			where: and(
				eq(booking.id, id),
				eq(booking.organizationId, organizationId)
			)
		})

		if (!existing) {
			throw new AppError('Booking not found', 'NOT_FOUND')
		}

		if (
			existing.status === 'completed' ||
			existing.status === 'cancelled'
		) {
			throw new AppError(
				'Cannot reassign a booking in terminal state',
				'BAD_REQUEST'
			)
		}

		await BookingService.validateBarberAssignment(
			organizationId,
			input.handledByMemberId
		)

		const now = new Date()
		await db
			.update(booking)
			.set({ handledByBarberId: input.handledByMemberId, updatedAt: now })
			.where(
				and(
					eq(booking.id, id),
					eq(booking.organizationId, organizationId)
				)
			)

		const result = await BookingService.getBooking(organizationId, id)
		bookingEventBus.notify(organizationId)
		return result
	}

	static async getHomeSummary(
		organizationId: string,
		query: BookingModel.BookingHomeSummaryQuery
	): Promise<BookingModel.BookingHomeSummaryResponse> {
		const timezone = await fetchOrgTimezone(organizationId)
		const today = new Date()
		const localToday = toLocalDate(today, timezone)
		const year = localToday.getUTCFullYear()
		const month = String(localToday.getUTCMonth() + 1).padStart(2, '0')
		const day = String(localToday.getUTCDate()).padStart(2, '0')
		const defaultDate = `${year}-${month}-${day}`

		const dateFrom = query.dateFrom ?? defaultDate
		const dateTo = query.dateTo ?? defaultDate

		if (dateTo < dateFrom) {
			throw new AppError(
				'dateTo must be greater than or equal to dateFrom',
				'BAD_REQUEST'
			)
		}

		const { start } = BookingService.buildDayRange(dateFrom, timezone)
		const { end } = BookingService.buildDayRange(dateTo, timezone)

		const rangeCondition = or(
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

		const rows = await db
			.select({
				type: booking.type,
				status: booking.status
			})
			.from(booking)
			.where(
				and(
					eq(booking.organizationId, organizationId),
					rangeCondition,
					sql`${booking.status} NOT IN ('cancelled')`,
					isNotNull(booking.verifiedAt)
				)
			)

		let walkIn = 0
		let appointment = 0
		let inProgress = 0
		let waiting = 0

		for (const row of rows) {
			if (row.type === 'walk_in') walkIn++
			else if (row.type === 'appointment') appointment++

			if (row.status === 'in_progress') inProgress++
			else if (row.status === 'waiting') waiting++
		}

		return {
			dateFrom,
			dateTo,
			total: rows.length,
			walkIn,
			appointment,
			inProgress,
			waiting
		}
	}

	static async getDateMarkers(
		organizationId: string,
		query: BookingModel.BookingDateMarkersQuery
	): Promise<BookingModel.BookingDateMarkersResponse> {
		const timezone = await fetchOrgTimezone(organizationId)

		const today = new Date()
		const localToday = toLocalDate(today, timezone)
		const year = localToday.getUTCFullYear()
		const month = String(localToday.getUTCMonth() + 1).padStart(2, '0')
		const day = String(localToday.getUTCDate()).padStart(2, '0')
		const defaultDate = `${year}-${month}-${day}`

		const dateFrom = query.dateFrom ?? defaultDate
		const dateTo = query.dateTo ?? defaultDate

		if (dateTo < dateFrom) {
			throw new AppError(
				'dateTo must be greater than or equal to dateFrom',
				'BAD_REQUEST'
			)
		}

		const { start } = BookingService.buildDayRange(dateFrom, timezone)
		const { end } = BookingService.buildDayRange(dateTo, timezone)

		const rangeCondition = or(
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

		const rows = await db
			.select({
				status: booking.status,
				type: booking.type,
				scheduledAt: booking.scheduledAt,
				createdAt: booking.createdAt
			})
			.from(booking)
			.where(
				and(
					eq(booking.organizationId, organizationId),
					rangeCondition,
					sql`${booking.status} IN ('requested', 'waiting')`,
					isNotNull(booking.verifiedAt)
				)
			)

		const markers: Record<
			string,
			{ requested: boolean; waiting: boolean }
		> = {}

		for (const row of rows) {
			const refDate =
				row.type === 'appointment' && row.scheduledAt
					? row.scheduledAt
					: row.createdAt

			const localDate = toLocalDate(refDate, timezone)
			const y = localDate.getUTCFullYear()
			const m = String(localDate.getUTCMonth() + 1).padStart(2, '0')
			const d = String(localDate.getUTCDate()).padStart(2, '0')
			const dateKey = `${y}-${m}-${d}`

			if (!markers[dateKey]) {
				markers[dateKey] = { requested: false, waiting: false }
			}

			if (row.status === 'requested') {
				markers[dateKey].requested = true
			} else if (row.status === 'waiting') {
				markers[dateKey].waiting = true
			}
		}

		return { markers }
	}

	static async verifyAppointmentEmail(token: string): Promise<{
		verified: boolean
		bookingId: string | null
		status: 'verified' | 'already_verified' | 'invalid'
	}> {
		const existing = await db.query.booking.findFirst({
			where: eq(booking.verificationToken, token)
		})

		if (!existing) {
			return { verified: false, bookingId: null, status: 'invalid' }
		}

		if (existing.verifiedAt) {
			return {
				verified: true,
				bookingId: existing.id,
				status: 'already_verified'
			}
		}

		const now = new Date()
		await db
			.update(booking)
			.set({
				verifiedAt: now,
				updatedAt: now
			})
			.where(eq(booking.id, existing.id))

		await db
			.update(customer)
			.set({
				emailVerified: true,
				emailVerifiedAt: now,
				emailVerificationToken: null,
				updatedAt: now
			})
			.where(eq(customer.id, existing.customerId))

		bookingEventBus.notify(existing.organizationId)

		return { verified: true, bookingId: existing.id, status: 'verified' }
	}

	static async getBookingVerificationToken(
		bookingId: string
	): Promise<string | null> {
		const row = await db.query.booking.findFirst({
			where: eq(booking.id, bookingId),
			columns: { verificationToken: true }
		})

		return row?.verificationToken ?? null
	}

	static async cancelStaleBookings(): Promise<{ cancelled: number }> {
		const now = new Date()
		const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)

		const staleBookings = await db
			.update(booking)
			.set({
				status: 'cancelled',
				cancelledAt: now,
				notes: 'Booking expired — appointment time has passed without action',
				updatedAt: now
			})
			.where(
				and(
					inArray(booking.status, ['requested', 'waiting']),
					lt(booking.scheduledAt, oneHourAgo),
					isNotNull(booking.scheduledAt)
				)
			)
			.returning({
				id: booking.id,
				organizationId: booking.organizationId,
				customerId: booking.customerId,
				referenceNumber: booking.referenceNumber
			})

		if (staleBookings.length === 0) {
			return { cancelled: 0 }
		}

		// Group by organizationId for SSE events
		const orgBookings = new Map<string, typeof staleBookings>()
		for (const row of staleBookings) {
			const existing = orgBookings.get(row.organizationId) ?? []
			existing.push(row)
			orgBookings.set(row.organizationId, existing)
		}

		for (const orgId of orgBookings.keys()) {
			bookingEventBus.notify(orgId)
		}

		// Batch fetch customer emails and organization names
		const customerIds = [...new Set(staleBookings.map((b) => b.customerId))]
		const orgIds = [...new Set(staleBookings.map((b) => b.organizationId))]

		const [customers, orgs] = await Promise.all([
			db.query.customer.findMany({
				where: inArray(customer.id, customerIds),
				columns: { id: true, email: true, name: true }
			}),
			db.query.organization.findMany({
				where: inArray(organization.id, orgIds),
				columns: { id: true, name: true }
			})
		])

		const customerMap = new Map(customers.map((c) => [c.id, c]))
		const orgMap = new Map(orgs.map((o) => [o.id, o]))

		for (const row of staleBookings) {
			const customerRow = customerMap.get(row.customerId)
			const orgRow = orgMap.get(row.organizationId)

			if (customerRow?.email && orgRow?.name) {
				sendBookingExpiredEmail({
					to: customerRow.email,
					customerName: customerRow.name,
					barbershopName: orgRow.name,
					referenceNumber: row.referenceNumber
				}).catch(console.error)
			}
		}

		return { cancelled: staleBookings.length }
	}
}
