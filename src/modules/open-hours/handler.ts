import { Elysia } from 'elysia'

import {
	formatResponse,
	FormatResponseSchema
} from '../../core/format-response'
import { authMiddleware } from '../../middleware/auth-middleware'
import { OpenHoursModel } from './model'
import { OpenHoursService } from './service'

export const openHoursHandler = new Elysia({
	prefix: '/open-hours',
	tags: ['Open Hours']
})
	.use(authMiddleware)
	.onError(({ code, error, request }) => {
		if (code !== 'VALIDATION') {
			return
		}

		return OpenHoursModel.validationErrorResponse(
			new URL(request.url).pathname,
			error
		)
	})
	.get(
		'/',
		async ({ path, activeOrganizationId }) => {
			const data =
				await OpenHoursService.getWeeklySchedule(activeOrganizationId)

			return formatResponse({ path, data })
		},
		{
			requireAuth: true,
			requireOrganization: true,
			response: FormatResponseSchema(OpenHoursModel.OpenHoursWeekResponse)
		}
	)
	.put(
		'/',
		async ({ body, path, activeOrganizationId, user }) => {
			const data = await OpenHoursService.replaceWeeklySchedule(
				activeOrganizationId,
				user.id,
				body
			)

			return formatResponse({
				path,
				data,
				message: 'Open hours updated successfully'
			})
		},
		{
			requireAuth: true,
			requireOrganization: true,
			body: OpenHoursModel.UpdateOpenHoursBody,
			response: FormatResponseSchema(OpenHoursModel.OpenHoursWeekResponse)
		}
	)
