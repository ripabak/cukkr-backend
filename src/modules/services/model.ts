import { t } from 'elysia'

export namespace ServiceModel {
	export const ServiceCreateInput = t.Object({
		name: t.String(),
		price: t.Number(),
		duration: t.Number(),
		description: t.Optional(t.Nullable(t.String())),
		discount: t.Optional(t.Number())
	})
	export type ServiceCreateInput = typeof ServiceCreateInput.static

	export const ServiceResponse = t.Object({
		id: t.String(),
		name: t.String(),
		description: t.Nullable(t.String()),
		price: t.Number(),
		duration: t.Number(),
		discount: t.Number(),
		isActive: t.Boolean(),
		isDefault: t.Boolean(),
		createdAt: t.Date(),
		updatedAt: t.Date()
	})
	export type ServiceResponse = typeof ServiceResponse.static
}
