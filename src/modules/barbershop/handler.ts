import { Elysia } from 'elysia'
import { rateLimit } from 'elysia-rate-limit'

import { BarbershopService } from './service'
import { BarbershopModel } from './model'
import {
	formatResponse,
	FormatResponseSchema
} from '../../core/format-response'
import { authMiddleware } from '../../middleware/auth-middleware'
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
	// @deprecatedHandler use organization better auth api instread
	.post(
		'/',
		async ({ body, path, user, set }) => {
			set.status = 201
			const data = await BarbershopService.createBarbershop(user.id, body)
			return formatResponse({ path, data, status: 201 })
		},
		{
			requireAuth: true,
			body: BarbershopModel.CreateBarbershopInput,
			response: FormatResponseSchema(BarbershopModel.BarbershopResponse)
		}
	)

	// GET /barbershop/list — list all orgs for the authenticated user
	.get(
		'/list',
		async ({ path, user }) => {
			const data = await BarbershopService.listBarbershops(user.id)
			return formatResponse({ path, data })
		},
		{
			requireAuth: true,
			response: FormatResponseSchema(
				BarbershopModel.BarbershopListResponse
			)
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
