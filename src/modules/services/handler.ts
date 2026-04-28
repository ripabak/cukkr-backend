import { Elysia, t } from 'elysia'

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
		async ({ body, path, activeOrganizationId, set }) => {
			set.status = 201
			const data = await ServiceService.createService(
				activeOrganizationId,
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

	// GET /services — list services with optional filters
	.get(
		'/',
		async ({ query, path, activeOrganizationId }) => {
			const data = await ServiceService.listServices(
				activeOrganizationId,
				query
			)
			return formatResponse({ path, data })
		},
		{
			requireOrganization: true,
			query: ServiceModel.ServiceListQuery,
			response: FormatResponseSchema(
				t.Array(ServiceModel.ServiceResponse)
			)
		}
	)

	// GET /services/:id — get a single service
	.get(
		'/:id',
		async ({ params: { id }, path, activeOrganizationId }) => {
			const data = await ServiceService.getService(
				activeOrganizationId,
				id
			)
			return formatResponse({ path, data })
		},
		{
			requireOrganization: true,
			params: ServiceModel.ServiceIdParam,
			response: FormatResponseSchema(ServiceModel.ServiceResponse)
		}
	)

	// PATCH /services/:id — partial update
	.patch(
		'/:id',
		async ({ params: { id }, body, path, activeOrganizationId }) => {
			const data = await ServiceService.updateService(
				activeOrganizationId,
				id,
				body
			)
			return formatResponse({
				path,
				data,
				message: 'Service updated successfully'
			})
		},
		{
			requireAuth: true,
			requireOrganization: true,
			params: ServiceModel.ServiceIdParam,
			body: ServiceModel.ServiceUpdateInput,
			response: FormatResponseSchema(ServiceModel.ServiceResponse)
		}
	)

	// DELETE /services/:id — delete a service
	.delete(
		'/:id',
		async ({ params: { id }, path, activeOrganizationId }) => {
			const data = await ServiceService.deleteService(
				activeOrganizationId,
				id
			)
			return formatResponse({
				path,
				data,
				message: 'Service deleted successfully'
			})
		},
		{
			requireAuth: true,
			requireOrganization: true,
			params: ServiceModel.ServiceIdParam,
			response: FormatResponseSchema(ServiceModel.ServiceResponse)
		}
	)

	// PATCH /services/:id/toggle-active — flip isActive
	.patch(
		'/:id/toggle-active',
		async ({ params: { id }, path, activeOrganizationId }) => {
			const data = await ServiceService.toggleActive(
				activeOrganizationId,
				id
			)
			return formatResponse({
				path,
				data,
				message: 'Service active status toggled'
			})
		},
		{
			requireAuth: true,
			requireOrganization: true,
			params: ServiceModel.ServiceIdParam,
			response: FormatResponseSchema(ServiceModel.ServiceResponse)
		}
	)

	// PATCH /services/:id/set-default — set as default (transactional)
	.patch(
		'/:id/set-default',
		async ({ params: { id }, path, activeOrganizationId }) => {
			const data = await ServiceService.setDefault(
				activeOrganizationId,
				id
			)
			return formatResponse({
				path,
				data,
				message: 'Default service updated successfully'
			})
		},
		{
			requireAuth: true,
			requireOrganization: true,
			params: ServiceModel.ServiceIdParam,
			response: FormatResponseSchema(ServiceModel.ServiceResponse)
		}
	)
