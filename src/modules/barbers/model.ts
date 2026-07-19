import { t } from 'elysia'

export namespace BarberModel {
	export const BarberListStatus = t.Union([
		t.Literal('active'),
		t.Literal('pending')
	])
	export type BarberListStatus = typeof BarberListStatus.static

	export const BarberListItem = t.Object({
		id: t.String(),
		userId: t.Nullable(t.String()),
		name: t.String(),
		email: t.String(),
		avatarUrl: t.Nullable(t.String()),
		role: t.String(),
		status: BarberListStatus,
		createdAt: t.Date(),
		expiresAt: t.Optional(t.Nullable(t.Date())),
		expired: t.Optional(t.Boolean())
	})
	export type BarberListItem = typeof BarberListItem.static

	export const BarberListQuery = t.Object(
		{
			search: t.Optional(t.String({ minLength: 1 })),
			status: t.Optional(BarberListStatus)
		},
		{ additionalProperties: false }
	)
	export type BarberListQuery = typeof BarberListQuery.static
}
