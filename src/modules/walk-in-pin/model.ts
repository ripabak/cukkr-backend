import { t } from 'elysia'

export namespace WalkInPinModel {
	export const GeneratePinResponse = t.Object({
		pin: t.String(),
		expiresAt: t.Date(),
		activeCount: t.Number()
	})
	export type GeneratePinResponse = typeof GeneratePinResponse.static

	export const ActiveCountResponse = t.Object({
		activeCount: t.Number(),
		limit: t.Number()
	})
	export type ActiveCountResponse = typeof ActiveCountResponse.static

	export const ValidatePinBody = t.Object(
		{
			pin: t.String({ pattern: '^\\d{4}$' })
		},
		{ additionalProperties: false }
	)
	export type ValidatePinBody = typeof ValidatePinBody.static

	export const ValidatePinResponse = t.Object({
		validationToken: t.String()
	})
	export type ValidatePinResponse = typeof ValidatePinResponse.static

	export const WalkInBookingBody = t.Object(
		{
			validationToken: t.String({ minLength: 1 }),
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
			notes: t.Optional(t.Nullable(t.String({ maxLength: 500 })))
		},
		{ additionalProperties: false }
	)
	export type WalkInBookingBody = typeof WalkInBookingBody.static

	export const SlugParam = t.Object(
		{
			slug: t.String({ minLength: 3, maxLength: 60 })
		},
		{ additionalProperties: false }
	)
	export type SlugParam = typeof SlugParam.static
}
