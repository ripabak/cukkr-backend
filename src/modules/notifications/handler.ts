import { Elysia, t } from 'elysia'

import {
	formatResponse,
	FormatResponseSchema
} from '../../core/format-response'
import { buildPaginationMeta } from '../../core/pagination'
import { env } from '../../lib/env'
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
		async ({ query, path, user, session }) => {
			const { data, totalItems, pagination } =
				await NotificationService.listNotifications(
					user.id,
					query,
					session?.activeOrganizationId ?? undefined
				)

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
		async ({ path, user, session }) => {
			const data = await NotificationService.getUnreadCount(
				user.id,
				session?.activeOrganizationId ?? undefined
			)
			return formatResponse({ path, data })
		},
		{
			requireAuth: true,
			response: FormatResponseSchema(
				NotificationModel.NotificationUnreadCountResponse
			)
		}
	)
	.get(
		'/unread-count-by-org',
		async ({ path, user }) => {
			const data = await NotificationService.getUnreadCountByOrg(user.id)
			return formatResponse({ path, data })
		},
		{
			requireAuth: true,
			response: FormatResponseSchema(
				NotificationModel.NotificationUnreadByOrgResponse
			)
		}
	)
	.patch(
		'/read-all',
		async ({ path, user, session }) => {
			const data = await NotificationService.markAllAsRead(
				user.id,
				session?.activeOrganizationId ?? undefined
			)
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
	.get(
		'/vapid-public-key',
		async ({ path }) => {
			return formatResponse({
				path,
				data: { publicKey: env.VAPID_PUBLIC_KEY }
			})
		},
		{
			response: FormatResponseSchema(
				NotificationModel.NotificationVapidPublicKeyResponse
			)
		}
	)
	.post(
		'/web-push/subscribe',
		async ({ body, path, user }) => {
			await NotificationService.registerWebPushSubscription(user.id, body)
			return formatResponse({
				path,
				data: { subscribed: true as const },
				message: 'Web push subscription registered'
			})
		},
		{
			requireAuth: true,
			body: NotificationModel.NotificationWebPushSubscribeInput,
			response: FormatResponseSchema(
				NotificationModel.NotificationWebPushSubscribeResponse
			)
		}
	)
	.delete(
		'/web-push/unsubscribe',
		async ({ body, path, user }) => {
			await NotificationService.unregisterWebPushSubscription(
				user.id,
				body.endpoint
			)
			return formatResponse({
				path,
				data: { unsubscribed: true as const },
				message: 'Web push subscription removed'
			})
		},
		{
			requireAuth: true,
			body: NotificationModel.NotificationWebPushUnsubscribeInput,
			response: FormatResponseSchema(
				NotificationModel.NotificationWebPushUnsubscribeResponse
			)
		}
	)
