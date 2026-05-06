import { Elysia, t } from 'elysia'

import {
	formatResponse,
	FormatResponseSchema
} from '../../core/format-response'
import { authMiddleware } from '../../middleware/auth-middleware'
import { BookingModel } from './model'
import { BookingService } from './service'

export const bookingsHandler = new Elysia({
	prefix: '/bookings',
	tags: ['Bookings']
})
	.use(authMiddleware)
	.post(
		'/',
		async ({ body, path, activeOrganizationId, user, set }) => {
			set.status = 201
			const data = await BookingService.createBooking(
				activeOrganizationId,
				user.id,
				body
			)

			return formatResponse({
				path,
				data,
				status: 201,
				message: 'Booking created successfully'
			})
		},
		{
			requireAuth: true,
			requireOrganization: true,
			body: BookingModel.BookingCreateInput,
			response: FormatResponseSchema(BookingModel.BookingDetailResponse)
		}
	)
	.get(
		'/',
		async ({ query, path, activeOrganizationId }) => {
			const data = await BookingService.listBookings(
				activeOrganizationId,
				query
			)

			return formatResponse({ path, data })
		},
		{
			requireAuth: true,
			requireOrganization: true,
			query: BookingModel.BookingListQuery,
			response: FormatResponseSchema(
				t.Array(BookingModel.BookingSummaryResponse)
			)
		}
	)
	.get(
		'/:id',
		async ({ params: { id }, path, activeOrganizationId }) => {
			const data = await BookingService.getBooking(
				activeOrganizationId,
				id
			)
			return formatResponse({ path, data })
		},
		{
			requireAuth: true,
			requireOrganization: true,
			params: BookingModel.BookingIdParam,
			response: FormatResponseSchema(BookingModel.BookingDetailResponse)
		}
	)
	.patch(
		'/:id/status',
		async ({ params: { id }, body, path, activeOrganizationId }) => {
			const data = await BookingService.updateBookingStatus(
				activeOrganizationId,
				id,
				body
			)

			return formatResponse({
				path,
				data,
				message: 'Booking status updated successfully'
			})
		},
		{
			requireAuth: true,
			requireOrganization: true,
			params: BookingModel.BookingIdParam,
			body: BookingModel.BookingStatusUpdateInput,
			response: FormatResponseSchema(BookingModel.BookingDetailResponse)
		}
	)
	.get(
		'/active',
		async ({ query, path, activeOrganizationId }) => {
			const data = await BookingService.listActiveBookings(
				activeOrganizationId,
				query
			)

			return formatResponse({ path, data })
		},
		{
			requireAuth: true,
			requireOrganization: true,
			query: BookingModel.ActiveBookingListQuery,
			response: FormatResponseSchema(
				t.Array(BookingModel.BookingSummaryResponse)
			)
		}
	)
	.post(
		'/:id/accept',
		async ({ params: { id }, path, activeOrganizationId }) => {
			const data = await BookingService.acceptBooking(
				activeOrganizationId,
				id
			)
			return formatResponse({
				path,
				data,
				message: 'Booking accepted successfully'
			})
		},
		{
			requireAuth: true,
			requireOrganization: true,
			params: BookingModel.BookingIdParam,
			response: FormatResponseSchema(BookingModel.BookingDetailResponse)
		}
	)
	.post(
		'/:id/decline',
		async ({ params: { id }, body, path, activeOrganizationId }) => {
			const data = await BookingService.declineBooking(
				activeOrganizationId,
				id,
				body
			)
			return formatResponse({
				path,
				data,
				message: 'Booking declined successfully'
			})
		},
		{
			requireAuth: true,
			requireOrganization: true,
			params: BookingModel.BookingIdParam,
			body: BookingModel.BookingDeclineInput,
			response: FormatResponseSchema(BookingModel.BookingDetailResponse)
		}
	)
	.patch(
		'/:id/reassign',
		async ({ params: { id }, body, path, activeOrganizationId }) => {
			const data = await BookingService.reassignBooking(
				activeOrganizationId,
				id,
				body
			)
			return formatResponse({
				path,
				data,
				message: 'Booking reassigned successfully'
			})
		},
		{
			requireAuth: true,
			requireOrganization: true,
			params: BookingModel.BookingIdParam,
			body: BookingModel.BookingReassignInput,
			response: FormatResponseSchema(BookingModel.BookingDetailResponse)
		}
	)
