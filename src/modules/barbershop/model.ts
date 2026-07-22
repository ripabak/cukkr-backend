import { t } from 'elysia'

export namespace BarbershopModel {
	export const BarbershopResponse = t.Object({
		id: t.String(),
		name: t.String(),
		slug: t.String(),
		description: t.Nullable(t.String()),
		address: t.Nullable(t.String()),
		logoUrl: t.Nullable(t.String()),
		logoThumb: t.Nullable(t.String()),
		logoMed: t.Nullable(t.String()),
		logoFull: t.Nullable(t.String()),
		onboardingCompleted: t.Boolean(),
		timezone: t.String(),
		minAdvanceHours: t.Number(),
		maxAdvanceDays: t.Number(),
		lastSlugChangedAt: t.Nullable(t.String())
	})
	export type BarbershopResponse = typeof BarbershopResponse.static

	export const BookingWindowInput = t.Object(
		{
			minAdvanceHours: t.Number({ minimum: 1, maximum: 168 }),
			maxAdvanceDays: t.Number({ minimum: 1, maximum: 365 })
		},
		{ additionalProperties: false }
	)
	export type BookingWindowInput = typeof BookingWindowInput.static

	export const BookingWindowResponse = t.Object({
		minAdvanceHours: t.Number(),
		maxAdvanceDays: t.Number()
	})
	export type BookingWindowResponse = typeof BookingWindowResponse.static

	export const TimezoneInput = t.Object({
		timezone: t.String({ minLength: 1, maxLength: 100 })
	})
	export type TimezoneInput = typeof TimezoneInput.static

	export const TimezoneResponse = t.Object({
		timezone: t.String()
	})
	export type TimezoneResponse = typeof TimezoneResponse.static

	export const BarbershopSettingsInput = t.Object({
		name: t.Optional(t.String({ minLength: 2, maxLength: 100 })),
		description: t.Optional(t.Nullable(t.String({ maxLength: 500 }))),
		address: t.Optional(t.Nullable(t.String({ maxLength: 300 }))),
		slug: t.Optional(t.String()),
		onboardingCompleted: t.Optional(t.Boolean())
	})
	export type BarbershopSettingsInput = typeof BarbershopSettingsInput.static

	export const SlugCheckQuery = t.Object({
		slug: t.String()
	})
	export type SlugCheckQuery = typeof SlugCheckQuery.static

	export const SlugCheckResponse = t.Object({
		available: t.Boolean()
	})
	export type SlugCheckResponse = typeof SlugCheckResponse.static

	export const BarbershopListItem = t.Object({
		id: t.String(),
		name: t.String(),
		slug: t.String(),
		description: t.Nullable(t.String()),
		address: t.Nullable(t.String()),
		logoUrl: t.Nullable(t.String()),
		logoThumb: t.Nullable(t.String()),
		logoMed: t.Nullable(t.String()),
		logoFull: t.Nullable(t.String()),
		onboardingCompleted: t.Boolean(),
		role: t.String()
	})
	export type BarbershopListItem = typeof BarbershopListItem.static

	export const BarbershopListResponse = t.Array(BarbershopListItem)
	export type BarbershopListResponse = typeof BarbershopListResponse.static

	export const OrgIdParam = t.Object({
		orgId: t.String()
	})
	export type OrgIdParam = typeof OrgIdParam.static

	export const LogoUploadInput = t.Object({
		file: t.File({ format: 'image/*' })
	})
	export type LogoUploadInput = typeof LogoUploadInput.static

	export const LogoUploadResponse = t.Object({
		logoUrl: t.String(),
		logoThumb: t.String(),
		logoMed: t.String(),
		logoFull: t.String()
	})
	export type LogoUploadResponse = typeof LogoUploadResponse.static

	export const LeaveOrgResponse = t.Object({
		message: t.String()
	})
	export type LeaveOrgResponse = typeof LeaveOrgResponse.static
}
