import { t } from 'elysia'

export const ServiceSortEnum = t.Union([
	t.Literal('name_asc'),
	t.Literal('name_desc'),
	t.Literal('price_asc'),
	t.Literal('price_desc'),
	t.Literal('recent')
])

export namespace ServiceModel {
	export const ServiceCreateInput = t.Object({
		name: t.String({ minLength: 1, maxLength: 100 }),
		description: t.Optional(t.Nullable(t.String({ maxLength: 500 }))),
		price: t.Integer({ minimum: 0 }),
		duration: t.Integer({ minimum: 1 }),
		discount: t.Optional(t.Integer({ minimum: 0, maximum: 100 })),
		isActive: t.Optional(t.Boolean())
	})
	export type ServiceCreateInput = typeof ServiceCreateInput.static

	export const ServiceUpdateInput = t.Object({
		name: t.Optional(t.String({ minLength: 1, maxLength: 100 })),
		description: t.Optional(t.Nullable(t.String({ maxLength: 500 }))),
		price: t.Optional(t.Integer({ minimum: 0 })),
		duration: t.Optional(t.Integer({ minimum: 1 })),
		discount: t.Optional(t.Integer({ minimum: 0, maximum: 100 })),
		isDefault: t.Optional(t.Boolean())
	})
	export type ServiceUpdateInput = typeof ServiceUpdateInput.static

	export const ServiceListQuery = t.Object({
		search: t.Optional(t.String()),
		sort: t.Optional(ServiceSortEnum),
		activeOnly: t.Optional(t.BooleanString())
	})
	export type ServiceListQuery = typeof ServiceListQuery.static

	export const ServiceIdParam = t.Object({
		id: t.String()
	})
	export type ServiceIdParam = typeof ServiceIdParam.static

	export const ServiceImageUploadInput = t.Object({
		file: t.File()
	})
	export type ServiceImageUploadInput = typeof ServiceImageUploadInput.static

	export const ServiceImageUploadResponse = t.Object({
		imageUrl: t.String()
	})
	export type ServiceImageUploadResponse =
		typeof ServiceImageUploadResponse.static

	export const ServiceResponse = t.Object({
		id: t.String(),
		organizationId: t.String(),
		name: t.String(),
		description: t.Nullable(t.String()),
		price: t.Number(),
		duration: t.Number(),
		discount: t.Number(),
		imageUrl: t.Nullable(t.String()),
		isActive: t.Boolean(),
		isDefault: t.Boolean(),
		createdAt: t.Date(),
		updatedAt: t.Date()
	})
	export type ServiceResponse = typeof ServiceResponse.static
}
