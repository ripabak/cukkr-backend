import { t } from 'elysia'

export namespace BarberModel {
	export const BarberInviteInput = t.Object(
		{
			email: t.Optional(t.String({ format: 'email', maxLength: 254 })),
			phone: t.Optional(t.String({ pattern: '^\\+[1-9]\\d{1,14}$' }))
		},
		{ additionalProperties: false }
	)
	export type BarberInviteInput = typeof BarberInviteInput.static

	export const BarberInviteResponse = t.Object({
		id: t.String(),
		email: t.String(),
		phone: t.Nullable(t.String()),
		role: t.String(),
		status: t.String(),
		expiresAt: t.Date()
	})
	export type BarberInviteResponse = typeof BarberInviteResponse.static

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
		phone: t.Nullable(t.String()),
		avatarUrl: t.Nullable(t.String()),
		role: t.String(),
		status: BarberListStatus,
		createdAt: t.Date()
	})
	export type BarberListItem = typeof BarberListItem.static

	export const InvitationIdParam = t.Object(
		{
			invitationId: t.String({ minLength: 1 })
		},
		{ additionalProperties: false }
	)
	export type InvitationIdParam = typeof InvitationIdParam.static

	export const MemberIdParam = t.Object(
		{
			memberId: t.String({ minLength: 1 })
		},
		{ additionalProperties: false }
	)
	export type MemberIdParam = typeof MemberIdParam.static

	export const CancelInviteResponse = t.Object({
		message: t.String()
	})
	export type CancelInviteResponse = typeof CancelInviteResponse.static

	export const BarberRemoveResponse = t.Object({
		message: t.String()
	})
	export type BarberRemoveResponse = typeof BarberRemoveResponse.static
}
