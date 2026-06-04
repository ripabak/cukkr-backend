import { Elysia, sse, t } from 'elysia'

import {
	formatResponse,
	FormatResponseSchema
} from '../../core/format-response'
import { authMiddleware } from '../../middleware/auth-middleware'
import { bookingEventBus } from './event-bus'
import { BookingModel } from './model'
import { BookingService } from './service'
import { NotificationService } from '../notifications/service'

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

			await NotificationService.createBookingNotifications(data)

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
		'/summary',
		async ({ query, path, activeOrganizationId }) => {
			const data = await BookingService.getHomeSummary(
				activeOrganizationId,
				query
			)

			return formatResponse({ path, data })
		},
		{
			requireAuth: true,
			requireOrganization: true,
			query: BookingModel.BookingHomeSummaryQuery,
			response: FormatResponseSchema(
				BookingModel.BookingHomeSummaryResponse
			)
		}
	)
	.get(
		'/requests',
		async ({ query, path, activeOrganizationId }) => {
			const data = await BookingService.listRequestedBookings(
				activeOrganizationId,
				query
			)

			return formatResponse({ path, data })
		},
		{
			requireAuth: true,
			requireOrganization: true,
			query: BookingModel.BookingRequestListQuery,
			response: FormatResponseSchema(
				t.Array(BookingModel.BookingSummaryResponse)
			)
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
		'/events',
		async function* ({ request, activeOrganizationId }) {
			let pendingResolve: (() => void) | null = null
			const pendingEvents: string[] = []

			const notify = () => {
				pendingEvents.push('booking_updated')
				pendingResolve?.()
				pendingResolve = null
			}

			const unsubscribe = bookingEventBus.subscribe(
				activeOrganizationId,
				notify
			)

			const wait = (ms: number) =>
				new Promise<void>((resolve) => {
					const timer = setTimeout(() => resolve(), ms)
					pendingResolve = () => {
						clearTimeout(timer)
						resolve()
					}
				})

			try {
				while (!request.signal.aborted) {
					await wait(30000)
					if (request.signal.aborted) break

					if (pendingEvents.length > 0) {
						while (pendingEvents.length > 0) {
							yield sse({ data: pendingEvents.shift()! })
						}
					} else {
						yield sse({ data: 'ping' })
					}
				}
			} finally {
				unsubscribe()
			}
		},
		{
			requireAuth: true,
			requireOrganization: true
		}
	)
	.get(
		'/in-progress',
		async ({ path, activeOrganizationId, user }) => {
			const data = await BookingService.getInProgressBooking(
				activeOrganizationId,
				user.id
			)
			return formatResponse({ path, data })
		},
		{
			requireAuth: true,
			requireOrganization: true,
			response: FormatResponseSchema(
				t.Nullable(BookingModel.BookingDetailResponse)
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
		async ({ params: { id }, body, path, activeOrganizationId, user }) => {
			const data = await BookingService.updateBookingStatus(
				activeOrganizationId,
				id,
				body,
				user.id
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
