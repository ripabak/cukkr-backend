import { Elysia, t } from 'elysia'

import {
	formatResponse,
	FormatResponseSchema
} from '../../core/format-response'
import { buildPaginationMeta } from '../../core/pagination'
import { authMiddleware } from '../../middleware/auth-middleware'
import { NotificationModel } from './model'
import { NotificationService } from './service'

export const notificationsHandler = new Elysia({
	prefix: '/notifications',
	tags: ['Notifications']
})
	.use(authMiddleware)
	.get(
		'/',
		async ({ query, path, user }) => {
			const { data, totalItems, pagination } =
				await NotificationService.listNotifications(user.id, query)

			return formatResponse({
				path,
				data,
				meta: buildPaginationMeta(pagination, totalItems)
			})
		},
		{
			requireAuth: true,
			query: NotificationModel.NotificationListQuery,
			response: FormatResponseSchema(
				t.Array(NotificationModel.NotificationListItem)
			)
		}
	)
	.get(
		'/unread-count',
		async ({ path, user }) => {
			const data = await NotificationService.getUnreadCount(user.id)
			return formatResponse({ path, data })
		},
		{
			requireAuth: true,
			response: FormatResponseSchema(
				NotificationModel.NotificationUnreadCountResponse
			)
		}
	)
	.patch(
		'/read-all',
		async ({ path, user }) => {
			const data = await NotificationService.markAllAsRead(user.id)
			return formatResponse({
				path,
				data,
				message: 'Notifications marked as read'
			})
		},
		{
			requireAuth: true,
			response: FormatResponseSchema(
				NotificationModel.NotificationMarkAllReadResponse
			)
		}
	)
	.patch(
		'/:id/read',
		async ({ params: { id }, path, user }) => {
			const data = await NotificationService.markAsRead(user.id, id)
			return formatResponse({
				path,
				data,
				message: 'Notification marked as read'
			})
		},
		{
			requireAuth: true,
			params: NotificationModel.NotificationIdParam,
			response: FormatResponseSchema(
				NotificationModel.NotificationMarkReadResponse
			)
		}
	)
	.post(
		'/register-token',
		async ({ body, path, user }) => {
			const data = await NotificationService.registerPushToken(
				user.id,
				body.token
			)

			return formatResponse({
				path,
				data,
				message: 'Push token registered successfully'
			})
		},
		{
			requireAuth: true,
			body: NotificationModel.NotificationRegisterPushTokenInput,
			response: FormatResponseSchema(
				NotificationModel.NotificationRegisterPushTokenResponse
			)
		}
	)
	.post(
		'/:id/actions/accept',
		async ({ params: { id }, path, user }) => {
			const data = await NotificationService.executeAcceptAction(
				user.id,
				id
			)
			return formatResponse({ path, data })
		},
		{
			requireAuth: true,
			params: NotificationModel.NotificationIdParam,
			response: FormatResponseSchema(
				NotificationModel.NotificationActionResponse
			)
		}
	)
	.post(
		'/:id/actions/decline',
		async ({ params: { id }, body, path, user }) => {
			const data = await NotificationService.executeDeclineAction(
				user.id,
				id,
				body.reason
			)
			return formatResponse({ path, data })
		},
		{
			requireAuth: true,
			params: NotificationModel.NotificationIdParam,
			body: NotificationModel.NotificationDeclineActionInput,
			response: FormatResponseSchema(
				NotificationModel.NotificationActionResponse
			)
		}
	)
