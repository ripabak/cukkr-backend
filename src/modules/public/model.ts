import { t } from 'elysia'

const PublicBarberItem = t.Object({
	id: t.String(),
	name: t.String(),
	avatarUrl: t.Nullable(t.String()),
	avatarThumb: t.Nullable(t.String()),
	bio: t.Nullable(t.String())
})

const PublicServiceItem = t.Object({
	id: t.String(),
	name: t.String(),
	description: t.Nullable(t.String()),
	price: t.Number(),
	duration: t.Number(),
	discount: t.Number(),
	imageUrl: t.Nullable(t.String()),
	imageThumb: t.Nullable(t.String()),
	isDefault: t.Boolean()
})

const PublicOpenHoursDay = t.Object({
	dayOfWeek: t.Integer({ minimum: 0, maximum: 6 }),
	isOpen: t.Boolean(),
	openTime: t.Nullable(t.String()),
	closeTime: t.Nullable(t.String())
})

const BookingWindowSchema = t.Object({
	minAdvanceHours: t.Number(),
	maxAdvanceDays: t.Number()
})

const PublicBarbershopResponse = t.Object({
	id: t.String(),
	name: t.String(),
	slug: t.String(),
	description: t.Nullable(t.String()),
	address: t.Nullable(t.String()),
	logoUrl: t.Nullable(t.String()),
	logoThumb: t.Nullable(t.String()),
	logoMed: t.Nullable(t.String()),
	logoFull: t.Nullable(t.String()),
	timezone: t.String(),
	services: t.Array(PublicServiceItem),
	barbers: t.Array(PublicBarberItem),
	openHours: t.Array(PublicOpenHoursDay),
	bookingWindow: BookingWindowSchema
})

const WalkInFormDataResponse = t.Object({
	services: t.Array(PublicServiceItem),
	barbers: t.Array(PublicBarberItem)
})

const PublicSlugParam = t.Object({
	slug: t.String({ minLength: 1 })
})

const PublicAvailabilityQuery = t.Object({
	date: t.String({ pattern: '^\\d{4}-\\d{2}-\\d{2}$' })
})

const PublicAvailabilityResponse = t.Object({
	date: t.String(),
	isOpen: t.Boolean(),
	openTime: t.Nullable(t.String()),
	closeTime: t.Nullable(t.String())
})

const PublicRequestedBarberItem = t.Object({
	memberId: t.String(),
	name: t.String()
})

const PublicAppointmentCreateInput = t.Object(
	{
		customerName: t.String({ minLength: 1, maxLength: 100 }),
		customerEmail: t.String({ format: 'email', maxLength: 254 }),
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

const PublicAppointmentCreatedResponse = t.Object({
	id: t.String(),
	referenceNumber: t.String(),
	type: t.Literal('appointment'),
	status: t.Literal('requested'),
	scheduledAt: t.Date(),
	customerName: t.String(),
	serviceNames: t.Array(t.String()),
	requestedBarber: t.Nullable(PublicRequestedBarberItem)
})

export namespace PublicModel {
	export type PublicBarberItem = typeof PublicBarberItem.static
	export type PublicServiceItem = typeof PublicServiceItem.static
	export type PublicBarbershopResponse =
		typeof PublicBarbershopResponse.static
	export type PublicOpenHoursDay = typeof PublicOpenHoursDay.static
	export type BookingWindowSchema = typeof BookingWindowSchema.static
	export type WalkInFormDataResponse = typeof WalkInFormDataResponse.static
	export type PublicSlugParam = typeof PublicSlugParam.static
	export type PublicAvailabilityQuery = typeof PublicAvailabilityQuery.static
	export type PublicAvailabilityResponse =
		typeof PublicAvailabilityResponse.static
	export type PublicAppointmentCreateInput =
		typeof PublicAppointmentCreateInput.static
	export type PublicAppointmentCreatedResponse =
		typeof PublicAppointmentCreatedResponse.static

	export const Schemas = {
		PublicBarberItem,
		PublicServiceItem,
		PublicBarbershopResponse,
		PublicOpenHoursDay,
		BookingWindowSchema,
		WalkInFormDataResponse,
		PublicSlugParam,
		PublicAvailabilityQuery,
		PublicAvailabilityResponse,
		PublicAppointmentCreateInput,
		PublicAppointmentCreatedResponse
	}
}
