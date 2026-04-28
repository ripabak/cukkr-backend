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
}).get(
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
