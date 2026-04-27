import { t } from 'elysia'

export const NotificationTypeEnum = t.Union([
	t.Literal('appointment_requested'),
	t.Literal('walk_in_arrival'),
	t.Literal('barbershop_invitation')
])

export const NotificationReferenceTypeEnum = t.Union([
	t.Literal('booking'),
	t.Literal('invitation')
])

export namespace NotificationModel {
	export const NotificationListQuery = t.Object({
		page: t.Optional(t.Numeric({ minimum: 1, default: 1 })),
		pageSize: t.Optional(
			t.Numeric({ minimum: 1, maximum: 100, default: 20 })
		),
		unreadOnly: t.Optional(t.BooleanString())
	})
	export type NotificationListQuery = typeof NotificationListQuery.static

	export const NotificationIdParam = t.Object({
		id: t.String({ minLength: 1 })
	})
	export type NotificationIdParam = typeof NotificationIdParam.static

	export const NotificationListItem = t.Object({
		id: t.String(),
		organizationId: t.String(),
		type: NotificationTypeEnum,
		title: t.String(),
		body: t.String(),
		referenceId: t.Nullable(t.String()),
		referenceType: t.Nullable(NotificationReferenceTypeEnum),
		isRead: t.Boolean(),
		createdAt: t.Date(),
		updatedAt: t.Date()
	})
	export type NotificationListItem = typeof NotificationListItem.static

	export const NotificationListResponse = t.Array(NotificationListItem)
	export type NotificationListResponse =
		typeof NotificationListResponse.static

	export const NotificationUnreadCountResponse = t.Object({
		count: t.Number()
	})
	export type NotificationUnreadCountResponse =
		typeof NotificationUnreadCountResponse.static

	export const NotificationMarkReadResponse = t.Object({
		id: t.String(),
		isRead: t.Boolean(),
		updatedAt: t.Date()
	})
	export type NotificationMarkReadResponse =
		typeof NotificationMarkReadResponse.static

	export const NotificationMarkAllReadResponse = t.Object({
		updatedCount: t.Number()
	})
	export type NotificationMarkAllReadResponse =
		typeof NotificationMarkAllReadResponse.static

	export const NotificationRegisterPushTokenInput = t.Object({
		token: t.String({ minLength: 1, maxLength: 255 })
	})
	export type NotificationRegisterPushTokenInput =
		typeof NotificationRegisterPushTokenInput.static

	export const NotificationRegisterPushTokenResponse = t.Object({
		tokenRegistered: t.Literal(true)
	})
	export type NotificationRegisterPushTokenResponse =
		typeof NotificationRegisterPushTokenResponse.static
}
