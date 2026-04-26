import { Elysia } from 'elysia'

import { ServiceService } from './service'
import { ServiceModel } from './model'
import {
	formatResponse,
	FormatResponseSchema
} from '../../core/format-response'
import { authMiddleware } from '../../middleware/auth-middleware'

export const servicesHandler = new Elysia({
	prefix: '/services',
	tags: ['Services']
})
	.use(authMiddleware)

	// POST /services — create a new service
	.post(
		'/',
		async ({ body, path, user, activeOrganizationId, set }) => {
			set.status = 201
			const data = await ServiceService.createService(
				activeOrganizationId,
				user.id,
				body
			)
			return formatResponse({
				path,
				data,
				status: 201,
				message: 'Service created successfully'
			})
		},
		{
			requireAuth: true,
			requireOrganization: true,
			body: ServiceModel.ServiceCreateInput,
			response: FormatResponseSchema(ServiceModel.ServiceResponse)
		}
	)
