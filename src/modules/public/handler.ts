import { Elysia } from 'elysia'

import {
	formatResponse,
	FormatResponseSchema
} from '../../core/format-response'
import { PublicModel } from './model'
import { PublicService } from './service'

export const publicHandler = new Elysia({
	prefix: '/public',
	tags: ['Public']
})
	.get(
		'/barbershop/:slug',
		async ({ params: { slug }, path }) => {
			const data = await PublicService.getPublicBarbershop(slug)
			return formatResponse({ path, data })
		},
		{
			params: PublicModel.Schemas.PublicSlugParam,
			response: FormatResponseSchema(
				PublicModel.Schemas.PublicBarbershopResponse
			)
		}
	)
	.get(
		'/barbershop/:slug/availability',
		async ({ params: { slug }, query: { date }, path }) => {
			const data = await PublicService.getAvailability(slug, date)
			return formatResponse({ path, data })
		},
		{
			params: PublicModel.Schemas.PublicSlugParam,
			query: PublicModel.Schemas.PublicAvailabilityQuery,
			response: FormatResponseSchema(
				PublicModel.Schemas.PublicAvailabilityResponse
			)
		}
	)
	.post(
		'/barbershop/:slug/appointment',
		async ({ params: { slug }, body, path, set }) => {
			const data = await PublicService.createPublicAppointment(slug, body)
			set.status = 201
			return formatResponse({
				path,
				data,
				message: 'Appointment created successfully'
			})
		},
		{
			params: PublicModel.Schemas.PublicSlugParam,
			body: PublicModel.Schemas.PublicAppointmentCreateInput,
			response: FormatResponseSchema(
				PublicModel.Schemas.PublicAppointmentCreatedResponse
			)
		}
	)
