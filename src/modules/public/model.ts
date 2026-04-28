import { t } from 'elysia'

const PublicBarberItem = t.Object({
	id: t.String(),
	name: t.String(),
	avatarUrl: t.Nullable(t.String())
})

const PublicServiceItem = t.Object({
	id: t.String(),
	name: t.String(),
	description: t.Nullable(t.String()),
	price: t.Number(),
	duration: t.Number(),
	discount: t.Number(),
	imageUrl: t.Nullable(t.String()),
	isDefault: t.Boolean()
})

const PublicBarbershopResponse = t.Object({
	id: t.String(),
	name: t.String(),
	slug: t.String(),
	description: t.Nullable(t.String()),
	address: t.Nullable(t.String()),
	logoUrl: t.Nullable(t.String()),
	services: t.Array(PublicServiceItem),
	barbers: t.Array(PublicBarberItem)
})

const WalkInFormDataResponse = t.Object({
	services: t.Array(PublicServiceItem),
	barbers: t.Array(PublicBarberItem)
})

const PublicSlugParam = t.Object({
	slug: t.String({ minLength: 1 })
})

export namespace PublicModel {
	export type PublicBarberItem = typeof PublicBarberItem.static
	export type PublicServiceItem = typeof PublicServiceItem.static
	export type PublicBarbershopResponse =
		typeof PublicBarbershopResponse.static
	export type WalkInFormDataResponse = typeof WalkInFormDataResponse.static
	export type PublicSlugParam = typeof PublicSlugParam.static

	export const Schemas = {
		PublicBarberItem,
		PublicServiceItem,
		PublicBarbershopResponse,
		WalkInFormDataResponse,
		PublicSlugParam
	}
}
