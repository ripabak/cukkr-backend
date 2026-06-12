import { t } from 'elysia'
import { BookingModel } from '../bookings/model'

const SlugParam = t.Object(
	{ slug: t.String({ minLength: 3, maxLength: 60 }) },
	{ additionalProperties: false }
)

const BarberItem = t.Object({
	id: t.String(),
	name: t.String(),
	avatarUrl: t.Nullable(t.String())
})

const ServiceItem = t.Object({
	id: t.String(),
	name: t.String(),
	description: t.Nullable(t.String()),
	price: t.Number(),
	duration: t.Number(),
	discount: t.Number(),
	imageUrl: t.Nullable(t.String()),
	isDefault: t.Boolean()
})

const FormDataResponse = t.Object({
	services: t.Array(ServiceItem),
	barbers: t.Array(BarberItem)
})

const ValidatePinBody = t.Object(
	{ pin: t.String({ pattern: '^\\d{4}$' }) },
	{ additionalProperties: false }
)

const ValidatePinResponse = t.Object({ validationToken: t.String() })

const WalkInBookingBody = t.Object(
	{
		validationToken: t.String({ minLength: 1 }),
		customerName: t.String({ minLength: 1, maxLength: 100 }),
		customerEmail: t.Optional(
			t.Nullable(t.String({ format: 'email', maxLength: 254 }))
		),
		serviceIds: t.Array(t.String({ minLength: 1 }), {
			minItems: 1,
			uniqueItems: true
		}),
		barberId: t.Optional(t.Nullable(t.String({ minLength: 1 }))),
		notes: t.Optional(t.Nullable(t.String({ maxLength: 500 })))
	},
	{ additionalProperties: false }
)

const AppointmentCreateInput = t.Object(
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

const AppointmentCreatedResponse = t.Object({
	id: t.String(),
	referenceNumber: t.String(),
	type: t.Literal('appointment'),
	status: t.Literal('requested'),
	scheduledAt: t.Date(),
	customerName: t.String(),
	serviceNames: t.Array(t.String()),
	requestedBarber: t.Nullable(
		t.Object({ memberId: t.String(), name: t.String() })
	)
})

export namespace PublicBookingModel {
	export type SlugParam = typeof SlugParam.static
	export type FormDataResponse = typeof FormDataResponse.static
	export type ValidatePinBody = typeof ValidatePinBody.static
	export type ValidatePinResponse = typeof ValidatePinResponse.static
	export type WalkInBookingBody = typeof WalkInBookingBody.static
	export type AppointmentCreateInput = typeof AppointmentCreateInput.static
	export type AppointmentCreatedResponse =
		typeof AppointmentCreatedResponse.static

	export const Schemas = {
		SlugParam,
		FormDataResponse,
		ValidatePinBody,
		ValidatePinResponse,
		WalkInBookingBody,
		AppointmentCreateInput,
		AppointmentCreatedResponse,
		WalkInBookingDetailResponse: BookingModel.BookingDetailResponse
	}
}
