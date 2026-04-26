import { t } from 'elysia'

export const BOOKING_TYPES = ['walk_in', 'appointment'] as const
export const BOOKING_STATUSES = [
	'pending',
	'waiting',
	'in_progress',
	'completed',
	'cancelled'
] as const
export const BOOKING_LIST_STATUSES = ['all', ...BOOKING_STATUSES] as const

export const BookingTypeEnum = t.Union([
	t.Literal('walk_in'),
	t.Literal('appointment')
])

export const BookingStatusEnum = t.Union([
	t.Literal('pending'),
	t.Literal('waiting'),
	t.Literal('in_progress'),
	t.Literal('completed'),
	t.Literal('cancelled')
])

export const BookingListStatusEnum = t.Union([
	t.Literal('all'),
	t.Literal('pending'),
	t.Literal('waiting'),
	t.Literal('in_progress'),
	t.Literal('completed'),
	t.Literal('cancelled')
])

export namespace BookingModel {
	export const WalkInBookingCreateInput = t.Object(
		{
			type: t.Literal('walk_in'),
			customerName: t.String({ minLength: 1, maxLength: 100 }),
			customerPhone: t.Optional(
				t.Nullable(t.String({ minLength: 1, maxLength: 20 }))
			),
			customerEmail: t.Optional(
				t.Nullable(t.String({ format: 'email', maxLength: 254 }))
			),
			serviceIds: t.Array(t.String({ minLength: 1 }), {
				minItems: 1,
				uniqueItems: true
			}),
			barberId: t.Optional(t.Nullable(t.String({ minLength: 1 }))),
			scheduledAt: t.Optional(
				t.Nullable(t.String({ format: 'date-time' }))
			),
			notes: t.Optional(t.Nullable(t.String({ maxLength: 500 })))
		},
		{ additionalProperties: false }
	)
	export type WalkInBookingCreateInput =
		typeof WalkInBookingCreateInput.static

	export const AppointmentBookingCreateInput = t.Object(
		{
			type: t.Literal('appointment'),
			customerName: t.String({ minLength: 1, maxLength: 100 }),
			customerPhone: t.Optional(
				t.Nullable(t.String({ minLength: 1, maxLength: 20 }))
			),
			customerEmail: t.Optional(
				t.Nullable(t.String({ format: 'email', maxLength: 254 }))
			),
			serviceIds: t.Array(t.String({ minLength: 1 }), {
				minItems: 1,
				uniqueItems: true
			}),
			barberId: t.Optional(t.Nullable(t.String({ minLength: 1 }))),
			scheduledAt: t.String({ format: 'date-time' }),
			notes: t.Optional(t.Nullable(t.String({ maxLength: 500 })))
		},
		{ additionalProperties: false }
	)
	export type AppointmentBookingCreateInput =
		typeof AppointmentBookingCreateInput.static

	export const BookingIdParam = t.Object(
		{
			id: t.String({ minLength: 1 })
		},
		{ additionalProperties: false }
	)
	export type BookingIdParam = typeof BookingIdParam.static

	export const BookingCreateInput = t.Union([
		WalkInBookingCreateInput,
		AppointmentBookingCreateInput
	])
	export type BookingCreateInput = typeof BookingCreateInput.static

	export const BookingStatusUpdateInput = t.Object(
		{
			status: BookingStatusEnum
		},
		{ additionalProperties: false }
	)
	export type BookingStatusUpdateInput =
		typeof BookingStatusUpdateInput.static

	export const BookingListQuery = t.Object(
		{
			date: t.String({ pattern: '^\\d{4}-\\d{2}-\\d{2}$' }),
			status: t.Optional(BookingListStatusEnum),
			barberId: t.Optional(t.String({ minLength: 1 }))
		},
		{ additionalProperties: false }
	)
	export type BookingListQuery = typeof BookingListQuery.static

	export const BookingServiceLineItemResponse = t.Object({
		id: t.String(),
		serviceId: t.String(),
		serviceName: t.String(),
		price: t.Number(),
		originalPrice: t.Number(),
		discount: t.Number(),
		duration: t.Number()
	})
	export type BookingServiceLineItemResponse =
		typeof BookingServiceLineItemResponse.static

	export const CustomerResponse = t.Object({
		id: t.String(),
		name: t.String(),
		phone: t.Nullable(t.String()),
		email: t.Nullable(t.String()),
		isVerified: t.Boolean(),
		notes: t.Nullable(t.String()),
		createdAt: t.Date(),
		updatedAt: t.Date()
	})
	export type CustomerResponse = typeof CustomerResponse.static

	export const BarberSummaryResponse = t.Object({
		memberId: t.String(),
		userId: t.String(),
		name: t.String(),
		email: t.String(),
		role: t.String()
	})
	export type BarberSummaryResponse = typeof BarberSummaryResponse.static

	export const BookingSummaryResponse = t.Object({
		id: t.String(),
		referenceNumber: t.String(),
		type: BookingTypeEnum,
		status: BookingStatusEnum,
		customerName: t.String(),
		serviceNames: t.Array(t.String()),
		barber: t.Nullable(BarberSummaryResponse),
		scheduledAt: t.Nullable(t.Date()),
		createdAt: t.Date()
	})
	export type BookingSummaryResponse = typeof BookingSummaryResponse.static

	export const BookingDetailResponse = t.Object({
		id: t.String(),
		organizationId: t.String(),
		referenceNumber: t.String(),
		type: BookingTypeEnum,
		status: BookingStatusEnum,
		customer: CustomerResponse,
		barber: t.Nullable(BarberSummaryResponse),
		services: t.Array(BookingServiceLineItemResponse),
		scheduledAt: t.Nullable(t.Date()),
		notes: t.Nullable(t.String()),
		startedAt: t.Nullable(t.Date()),
		completedAt: t.Nullable(t.Date()),
		cancelledAt: t.Nullable(t.Date()),
		createdById: t.String(),
		createdAt: t.Date(),
		updatedAt: t.Date()
	})
	export type BookingDetailResponse = typeof BookingDetailResponse.static
}

export type BookingType = (typeof BOOKING_TYPES)[number]
export type BookingStatus = (typeof BOOKING_STATUSES)[number]
export type BookingListStatus = (typeof BOOKING_LIST_STATUSES)[number]
