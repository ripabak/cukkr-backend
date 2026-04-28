import { t } from 'elysia'

import { formatErrorResponse } from '../../core/format-response'

const DAY_COUNT = 7
const TIME_PATTERN = '^(?:[01]\\d|2[0-3]):[0-5]\\d$'

export namespace OpenHoursModel {
	export const OpenHoursDay = t.Object({
		dayOfWeek: t.Integer({ minimum: 0, maximum: 6 }),
		isOpen: t.Boolean(),
		openTime: t.Nullable(t.String({ pattern: TIME_PATTERN })),
		closeTime: t.Nullable(t.String({ pattern: TIME_PATTERN }))
	})
	export type OpenHoursDay = typeof OpenHoursDay.static

	export const OpenHoursWeekResponse = t.Array(OpenHoursDay, {
		minItems: DAY_COUNT,
		maxItems: DAY_COUNT
	})
	export type OpenHoursWeekResponse = typeof OpenHoursWeekResponse.static

	export const UpdateOpenHoursBody = t.Object({
		days: OpenHoursWeekResponse
	})
	export type UpdateOpenHoursBody = typeof UpdateOpenHoursBody.static

	export function validationErrorResponse(path: string, error: Error) {
		const message = error.message || 'Invalid open-hours payload'

		return Response.json(
			formatErrorResponse({
				path,
				message,
				status: 400
			}),
			{ status: 400 }
		)
	}
}
