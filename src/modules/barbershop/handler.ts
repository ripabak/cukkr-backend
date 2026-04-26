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
