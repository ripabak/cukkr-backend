import { t } from 'elysia'

export namespace BarbershopModel {
	export const BarbershopResponse = t.Object({
		id: t.String(),
		name: t.String(),
		slug: t.String(),
		description: t.Nullable(t.String()),
		address: t.Nullable(t.String()),
		logoUrl: t.Nullable(t.String()),
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

	export const CreateBarbershopInput = t.Object({
		name: t.String({ minLength: 2, maxLength: 100 }),
		slug: t.String({ minLength: 3, maxLength: 60 }),
		description: t.Optional(t.Nullable(t.String({ maxLength: 500 }))),
		address: t.Optional(t.Nullable(t.String({ maxLength: 300 })))
	})
	export type CreateBarbershopInput = typeof CreateBarbershopInput.static

	export const BarbershopListItem = t.Object({
		id: t.String(),
		name: t.String(),
		slug: t.String(),
		description: t.Nullable(t.String()),
		address: t.Nullable(t.String()),
		logoUrl: t.Nullable(t.String()),
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
		file: t.File()
	})
	export type LogoUploadInput = typeof LogoUploadInput.static

	export const LogoUploadResponse = t.Object({
		logoUrl: t.String()
	})
	export type LogoUploadResponse = typeof LogoUploadResponse.static

	export const LeaveOrgResponse = t.Object({
		message: t.String()
	})
	export type LeaveOrgResponse = typeof LeaveOrgResponse.static
}
