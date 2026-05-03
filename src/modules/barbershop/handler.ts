import { Elysia } from 'elysia'
import { rateLimit } from 'elysia-rate-limit'

import { BarbershopService } from './service'
import { BarbershopModel } from './model'
import {
	formatResponse,
	FormatResponseSchema
} from '../../core/format-response'
import { authMiddleware } from '../../middleware/auth-middleware'
import { auth } from '../../lib/auth'
import { env } from '../../lib/env'

export const barbershopHandler = new Elysia({
	prefix: '/barbershop',
	tags: ['Barbershop']
})
	.use(authMiddleware)

	// GET /barbershop — retrieve active org profile
	.get(
		'/',
		async ({ path, activeOrganizationId }) => {
			const data =
				await BarbershopService.getSettings(activeOrganizationId)
			return formatResponse({ path, data })
		},
		{
			requireOrganization: true,
			response: FormatResponseSchema(BarbershopModel.BarbershopResponse)
		}
	)

	// POST /barbershop — create a new barbershop organization
	// @deprecatedHandler , it will change to better auth instead fully
	.post(
		'/',
		async ({ body, path, user, set, request }) => {
			const orgData = await auth.api.createOrganization({
				body: {
					name: body.name,
					slug: body.slug,
					userId: user.id,
					keepCurrentActiveOrganization: true
				},
				headers: request.headers
			})

			await BarbershopService.ensureSettingsRow(orgData.id)

			if (body.description !== undefined || body.address !== undefined) {
				await BarbershopService.updateSettings(orgData.id, user.id, {
					description: body.description,
					address: body.address
				})
			}

			const data = await BarbershopService.getSettings(orgData.id)

			set.status = 201
			return formatResponse({
				path,
				data,
				status: 201,
				message: 'Barbershop created successfully'
			})
		},
		{
			requireAuth: true,
			body: BarbershopModel.CreateBarbershopInput,
			response: FormatResponseSchema(BarbershopModel.BarbershopResponse)
		}
	)

	// PATCH /barbershop/settings — partial update of profile fields
	.patch(
		'/settings',
		async ({ body, path, user, activeOrganizationId }) => {
			const data = await BarbershopService.updateSettings(
				activeOrganizationId,
				user.id,
				body
			)
			return formatResponse({ path, data, message: 'Settings updated' })
		},
		{
			requireAuth: true,
			requireOrganization: true,
			body: BarbershopModel.BarbershopSettingsInput,
			response: FormatResponseSchema(BarbershopModel.BarbershopResponse)
		}
	)

	// DELETE /barbershop/:orgId/leave — leave an organization
	.delete(
		'/:orgId/leave',
		async ({ params, path, user }) => {
			const data = await BarbershopService.leaveBarbershop(
				user.id,
				params.orgId
			)
			return formatResponse({ path, data })
		},
		{
			requireAuth: true,
			params: BarbershopModel.OrgIdParam,
			response: FormatResponseSchema(BarbershopModel.LeaveOrgResponse)
		}
	)

	// POST /barbershop/logo — upload barbershop logo
	.post(
		'/logo',
		async ({ body, path, user, activeOrganizationId }) => {
			const data = await BarbershopService.uploadLogo(
				activeOrganizationId,
				user.id,
				body.file
			)
			return formatResponse({
				path,
				data,
				message: 'Logo uploaded successfully'
			})
		},
		{
			requireAuth: true,
			requireOrganization: true,
			body: BarbershopModel.LogoUploadInput,
			response: FormatResponseSchema(BarbershopModel.LogoUploadResponse)
		}
	)

	// GET /barbershop/slug-check — real-time slug availability (60 req/IP/min)
	.group('/slug-check', (app) =>
		app
			.use(
				rateLimit({
					max: 60,
					duration: 60000,
					skip: () => env.NODE_ENV === 'test'
				})
			)
			.get(
				'/',
				async ({ query, path }) => {
					const data = await BarbershopService.checkSlug(query.slug)
					return formatResponse({ path, data })
				},
				{
					query: BarbershopModel.SlugCheckQuery,
					response: FormatResponseSchema(
						BarbershopModel.SlugCheckResponse
					)
				}
			)
	)
