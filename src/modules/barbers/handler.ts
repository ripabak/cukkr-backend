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
		async ({ query, path, activeOrganizationId }) => {
			const data = await BarberService.listBarbers(
				activeOrganizationId,
				query.search
			)

			return formatResponse({ path, data })
		},
		{
			requireAuth: true,
			requireOrganization: true,
			query: BarberModel.BarberListQuery,
			response: FormatResponseSchema(t.Array(BarberModel.BarberListItem))
		}
	)

	.post(
		'/bulk-invite',
		async ({ body, path, user, activeOrganizationId, set }) => {
			set.status = 201
			const data = await BarberService.bulkInviteBarbers(
				activeOrganizationId,
				user.id,
				body
			)
			return formatResponse({
				path,
				data,
				status: 201,
				message: `${data.count} barber(s) invited successfully`
			})
		},
		{
			requireAuth: true,
			requireOrganization: true,
			body: BarberModel.BulkInviteInput,
			response: FormatResponseSchema(BarberModel.BulkInviteResponse)
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

	.post(
		'/invitations/:invitationId/accept',
		async ({ params: { invitationId }, path, user }) => {
			const data = await BarberService.acceptInvitation(
				user.id,
				invitationId
			)
			return formatResponse({ path, data, message: data.message })
		},
		{
			requireAuth: true,
			params: BarberModel.InvitationIdParam,
			response: FormatResponseSchema(BarberModel.InvitationActionResponse)
		}
	)

	.post(
		'/invitations/:invitationId/decline',
		async ({ params: { invitationId }, path, user }) => {
			const data = await BarberService.declineInvitation(
				user.id,
				invitationId
			)
			return formatResponse({ path, data, message: data.message })
		},
		{
			requireAuth: true,
			params: BarberModel.InvitationIdParam,
			response: FormatResponseSchema(BarberModel.InvitationActionResponse)
		}
	)
