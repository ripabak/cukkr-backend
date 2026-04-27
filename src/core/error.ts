import Elysia from 'elysia'
import { formatErrorResponse } from './format-response'

export const ERROR_CODES = {
	NOT_FOUND: 404,
	BAD_REQUEST: 400,
	UNAUTHORIZED: 401,
	FORBIDDEN: 403,
	UNPROCESSABLE_ENTITY: 422,
	CONFLICT: 409,
	TOO_MANY_REQUESTS: 429,
	INTERNAL_ERROR: 500
} as const

export type ErrorCode = keyof typeof ERROR_CODES

export class AppError extends Error {
	status: number

	constructor(
		public message: string,
		public code: ErrorCode = 'INTERNAL_ERROR'
	) {
		super(message)
		this.status = ERROR_CODES[code]
	}

	toResponse(path: string = '/') {
		return Response.json(
			formatErrorResponse({
				path,
				message: this.message,
				status: this.status
			}),
			{ status: this.status }
		)
	}
}

export const CustomError = new Elysia()
	.error({ AppError })
	.onError(({ error, set, request }) => {
		if (error instanceof AppError) {
			const path = new URL(request.url).pathname
			return error.toResponse(path)
		}
		set.status = ERROR_CODES['INTERNAL_ERROR']
		return formatErrorResponse({
			path: new URL(request.url).pathname,
			message: 'Internal Server Error',
			status: ERROR_CODES['INTERNAL_ERROR']
		})
	})
