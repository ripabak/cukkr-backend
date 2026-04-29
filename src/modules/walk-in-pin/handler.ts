import { Elysia } from 'elysia'

import {
	formatResponse,
	FormatResponseSchema
} from '../../core/format-response'
import { authMiddleware } from '../../middleware/auth-middleware'
import { BookingModel } from '../bookings/model'
import { PublicModel } from '../public/model'
import { PublicService } from '../public/service'
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
		'/active-count',
		async ({ path, activeOrganizationId }) => {
			const data =
				await WalkInPinService.getActivePinCount(activeOrganizationId)
			return formatResponse({ path, data })
		},
		{
			requireAuth: true,
			requireOrganization: true,
			response: FormatResponseSchema(WalkInPinModel.ActiveCountResponse)
		}
	)

export const publicWalkInHandler = new Elysia({
	prefix: '/public/:slug',
	tags: ['Public Walk-In']
})
	.get(
		'/form-data',
		async ({ params, path }) => {
			const data = await PublicService.getWalkInFormData(params.slug)
			return formatResponse({ path, data })
		},
		{
			params: WalkInPinModel.SlugParam,
			response: FormatResponseSchema(
				PublicModel.Schemas.WalkInFormDataResponse
			)
		}
	)

	.post(
		'/pin/validate',
		async ({ params, body, path, request, server }) => {
			const ip =
				request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
				server?.requestIP(request)?.address ??
				'0.0.0.0'

			const organizationId =
				await WalkInPinService.resolveOrganizationBySlug(params.slug)

			const data = await WalkInPinService.validatePin(
				organizationId,
				body.pin,
				ip
			)

			return formatResponse({ path, data })
		},
		{
			params: WalkInPinModel.SlugParam,
			body: WalkInPinModel.ValidatePinBody,
			response: FormatResponseSchema(WalkInPinModel.ValidatePinResponse)
		}
	)

	.post(
		'/walk-in',
		async ({ params, body, path, set }) => {
			set.status = 201

			const { validationToken, ...input } = body

			const organizationId =
				await WalkInPinService.resolveOrganizationBySlug(params.slug)

			const data = await WalkInPinService.createWalkInBooking(
				organizationId,
				validationToken,
				input
			)

			return formatResponse({
				path,
				data,
				status: 201,
				message: 'Walk-in booking created successfully'
			})
		},
		{
			params: WalkInPinModel.SlugParam,
			body: WalkInPinModel.WalkInBookingBody,
			response: FormatResponseSchema(BookingModel.BookingDetailResponse)
		}
	)
