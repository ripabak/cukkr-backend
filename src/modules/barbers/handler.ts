import { Elysia, t } from 'elysia'

import { BarberService } from './service'
import { BarberModel } from './model'
import {
	formatResponse,
	FormatResponseSchema
} from '../../core/format-response'
import { authMiddleware } from '../../middleware/auth-middleware'

export const barbersHandler = new Elysia({
	prefix: '/barbers',
	tags: ['Barbers']
})
	.use(authMiddleware)

	.get(
		'/',
		async ({ query, path, activeOrganizationId }) => {
			const data = await BarberService.listBarbers(
				activeOrganizationId,
				query
			)

			return formatResponse({ path, data })
		},
		{
			requireAuth: true,
			requireOrganization: true,
			query: BarberModel.BarberListQuery,
			response: FormatResponseSchema(t.Array(BarberModel.BarberListItem))
		}
	)
