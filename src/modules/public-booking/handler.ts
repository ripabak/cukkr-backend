import { Elysia } from 'elysia'

import {
	formatResponse,
	FormatResponseSchema
} from '../../core/format-response'
import { PublicBookingModel } from './model'
import { PublicBookingService } from './service'
import { t } from 'elysia'

const VerifyAppointmentQuery = t.Object({
	token: t.String({ minLength: 1 })
})

const VerifyAppointmentResponse = t.Object({
	verified: t.Boolean(),
	bookingId: t.Nullable(t.String()),
	status: t.Union([
		t.Literal('verified'),
		t.Literal('already_verified'),
		t.Literal('invalid')
	])
})

export const publicBookingHandler = new Elysia({
	prefix: '/public/booking',
	tags: ['Public Booking']
})
	.get(
		'/:slug/form-data',
		async ({ params: { slug }, path }) => {
			const data = await PublicBookingService.getFormData(slug)
			return formatResponse({ path, data })
		},
		{
			params: PublicBookingModel.Schemas.SlugParam,
			response: FormatResponseSchema(
				PublicBookingModel.Schemas.FormDataResponse
			)
		}
	)
	.post(
		'/:slug/pin/validate',
		async ({ params: { slug }, body, path, request, server }) => {
			const ip =
				request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
				server?.requestIP(request)?.address ??
				'0.0.0.0'

			const data = await PublicBookingService.validatePin(
				slug,
				body.pin,
				ip
			)
			return formatResponse({ path, data })
		},
		{
			params: PublicBookingModel.Schemas.SlugParam,
			body: PublicBookingModel.Schemas.ValidatePinBody,
			response: FormatResponseSchema(
				PublicBookingModel.Schemas.ValidatePinResponse
			)
		}
	)
	.post(
		'/:slug/walk-in',
		async ({ params: { slug }, body, path, set }) => {
			set.status = 201
			const { validationToken, ...input } = body
			const data = await PublicBookingService.createWalkIn(
				slug,
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
			params: PublicBookingModel.Schemas.SlugParam,
			body: PublicBookingModel.Schemas.WalkInBookingBody,
			response: FormatResponseSchema(
				PublicBookingModel.Schemas.WalkInBookingDetailResponse
			)
		}
	)
	.post(
		'/:slug/appointment',
		async ({ params: { slug }, body, path, set }) => {
			set.status = 201
			const data = await PublicBookingService.createAppointment(
				slug,
				body
			)
			return formatResponse({
				path,
				data: data.appointment,
				status: 201,
				message:
					'Appointment created. Please check your email to confirm.'
			})
		},
		{
			params: PublicBookingModel.Schemas.SlugParam,
			body: PublicBookingModel.Schemas.AppointmentCreateInput,
			response: FormatResponseSchema(
				PublicBookingModel.Schemas.AppointmentCreatedResponse
			)
		}
	)
	.get(
		'/:slug/appointment/verify',
		async ({ params: { slug }, query: { token }, path }) => {
			await PublicBookingService.getOrgIdBySlug(slug)

			const result = await PublicBookingService.verifyAppointment(token)

			return formatResponse({
				path,
				data: result,
				message:
					result.status === 'verified'
						? 'Appointment confirmed successfully'
						: result.status === 'already_verified'
							? 'Appointment has already been confirmed'
							: 'Invalid or expired verification link'
			})
		},
		{
			params: PublicBookingModel.Schemas.SlugParam,
			query: VerifyAppointmentQuery,
			response: FormatResponseSchema(VerifyAppointmentResponse)
		}
	)
	.get(
		'/:slug/identity/verify',
		async ({ params: { slug }, query: { token }, path }) => {
			await PublicBookingService.getOrgIdBySlug(slug)

			const result = await PublicBookingService.verifyIdentity(token)

			return formatResponse({
				path,
				data: result,
				message:
					result.status === 'verified'
						? 'Identity verified successfully'
						: result.status === 'already_verified'
							? 'Identity has already been verified'
							: 'Invalid or expired verification link'
			})
		},
		{
			params: PublicBookingModel.Schemas.SlugParam,
			query: t.Object({ token: t.String({ minLength: 1 }) }),
			response: FormatResponseSchema(VerifyAppointmentResponse)
		}
	)
