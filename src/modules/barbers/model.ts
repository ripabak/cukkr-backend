import { t } from 'elysia'

export namespace BarberModel {
	export const BarberInviteInput = t.Object({
		email: t.String()
	})
	export type BarberInviteInput = typeof BarberInviteInput.static

	export const BarberInviteResponse = t.Object({
		id: t.String(),
		email: t.String(),
		role: t.String(),
		status: t.String(),
		expiresAt: t.Date()
	})
	export type BarberInviteResponse = typeof BarberInviteResponse.static
}
