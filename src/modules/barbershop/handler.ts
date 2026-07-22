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

	// GET /barbershop/list — list all barbershops for current user
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
		async ({ body, path, activeOrganizationId }) => {
			const data = await BarbershopService.updateSettings(
				activeOrganizationId,
				body
			)
			return formatResponse({ path, data, message: 'Settings updated' })
		},
		{
			requireRoles: ['owner'],
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

	// PATCH /barbershop/settings/booking-window — update booking window limits
	.patch(
		'/settings/booking-window',
		async ({ body, path, activeOrganizationId }) => {
			const data = await BarbershopService.updateBookingWindow(
				activeOrganizationId,
				body
			)
			return formatResponse({
				path,
				data,
				message: 'Booking window updated'
			})
		},
		{
			requireRoles: ['owner', 'admin'],
			body: BarbershopModel.BookingWindowInput,
			response: FormatResponseSchema(
				BarbershopModel.BookingWindowResponse
			)
		}
	)

	// PATCH /barbershop/timezone — update org timezone
	.patch(
		'/timezone',
		async ({ body, path, activeOrganizationId }) => {
			const data = await BarbershopService.updateTimezone(
				activeOrganizationId,
				body.timezone
			)
			return formatResponse({ path, data, message: 'Timezone updated' })
		},
		{
			requireRoles: ['owner'],
			body: BarbershopModel.TimezoneInput,
			response: FormatResponseSchema(BarbershopModel.TimezoneResponse)
		}
	)

	// POST /barbershop/logo — upload barbershop logo
	.post(
		'/logo',
		async ({ body, path, activeOrganizationId }) => {
			const data = await BarbershopService.uploadLogo(
				activeOrganizationId,
				body.file
			)
			return formatResponse({
				path,
				data,
				message: 'Logo uploaded successfully'
			})
		},
		{
			requireRoles: ['owner'],
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
