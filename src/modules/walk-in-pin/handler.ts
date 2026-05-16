import { Elysia } from 'elysia'

import {
	formatResponse,
	FormatResponseSchema
} from '../../core/format-response'
import { authMiddleware } from '../../middleware/auth-middleware'
import { WalkInPinModel } from './model'
import { WalkInPinService } from './service'

export const walkInPinHandler = new Elysia({
	prefix: '/pin',
	tags: ['Walk-In PIN']
})
	.use(authMiddleware)

	.post(
		'/generate',
		async ({ path, user, activeOrganizationId, set }) => {
			set.status = 200
			const data = await WalkInPinService.generatePin(
				activeOrganizationId,
				user.id
			)
			return formatResponse({ path, data })
		},
		{
			requireAuth: true,
			requireOrganization: true,
			response: FormatResponseSchema(WalkInPinModel.GeneratePinResponse)
		}
	)

	.get(
		'/current',
		async ({ path, activeOrganizationId }) => {
			const data =
				await WalkInPinService.getCurrentPin(activeOrganizationId)
			return formatResponse({ path, data })
		},
		{
			requireAuth: true,
			requireOrganization: true,
			response: FormatResponseSchema(WalkInPinModel.CurrentPinResponse)
		}
	)
