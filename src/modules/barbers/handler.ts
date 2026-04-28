import { Elysia, t } from 'elysia'

import { BarberService } from './service'
import { BarberModel } from './model'
import {
	formatResponse,
	FormatResponseSchema
} from '../../core/format-response'
import { authMiddleware } from '../../middleware/auth-middleware'

export const barbersHandler = new Elysia({
	prefix: '/barbers',
	tags: ['Barbers']
})
	.use(authMiddleware)

	.get(
		'/',
		async ({ path, activeOrganizationId }) => {
			const data = await BarberService.listBarbers(activeOrganizationId)

			return formatResponse({ path, data })
		},
		{
			requireAuth: true,
			requireOrganization: true,
			response: FormatResponseSchema(t.Array(BarberModel.BarberListItem))
		}
	)

	.post(
		'/invite',
		async ({ body, path, user, activeOrganizationId, set }) => {
			set.status = 201
			const data = await BarberService.inviteBarber(
				activeOrganizationId,
				user.id,
				body
			)
			return formatResponse({
				path,
				data,
				status: 201,
				message: 'Barber invited successfully'
			})
		},
		{
			requireAuth: true,
			requireOrganization: true,
			body: BarberModel.BarberInviteInput,
			response: FormatResponseSchema(BarberModel.BarberInviteResponse)
		}
	)

	.delete(
		'/invite/:invitationId',
		async ({
			params: { invitationId },
			path,
			user,
			activeOrganizationId
		}) => {
			const data = await BarberService.cancelInvitation(
				activeOrganizationId,
				user.id,
				invitationId
			)

			return formatResponse({
				path,
				data,
				message: data.message
			})
		},
		{
			requireAuth: true,
			requireOrganization: true,
			params: BarberModel.InvitationIdParam,
			response: FormatResponseSchema(BarberModel.CancelInviteResponse)
		}
	)

	.delete(
		'/:memberId',
		async ({ params: { memberId }, path, user, activeOrganizationId }) => {
			const data = await BarberService.removeBarber(
				activeOrganizationId,
				user.id,
				memberId
			)

			return formatResponse({
				path,
				data,
				message: data.message
			})
		},
		{
			requireAuth: true,
			requireOrganization: true,
			params: BarberModel.MemberIdParam,
			response: FormatResponseSchema(BarberModel.BarberRemoveResponse)
		}
	)
