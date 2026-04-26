import { t } from 'elysia'

export namespace BarbershopModel {
	export const BarbershopResponse = t.Object({
		id: t.String(),
		name: t.String(),
		slug: t.String(),
		description: t.Nullable(t.String()),
		address: t.Nullable(t.String()),
		onboardingCompleted: t.Boolean()
	})
	export type BarbershopResponse = typeof BarbershopResponse.static

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
}
