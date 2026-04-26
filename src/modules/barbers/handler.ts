import { Elysia } from 'elysia'

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

	// POST /barbers/invite — invite a barber by email
	.post(
		'/invite',
		async ({ body, path, user, activeOrganizationId, set }) => {
			set.status = 201
			const data = await BarberService.inviteBarber(
				activeOrganizationId,
				user.id,
				body.email
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
