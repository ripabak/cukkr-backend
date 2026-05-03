import { and, count, desc, eq, inArray } from 'drizzle-orm'
import { nanoid } from 'nanoid'

import { AppError } from '../../core/error'
import { PaginatedResult } from '../../core/pagination'
import { db } from '../../lib/database'
import {
	expoPushClient,
	isExpoPushToken,
	type ExpoPushMessage
} from '../../lib/push'
import { member } from '../auth/schema'
import { BookingService } from '../bookings/service'
import { NotificationModel } from './model'
import {
	notification,
	notificationPushToken,
	type Notification as NotificationRow
} from './schema'

type NotificationListItem = NotificationModel.NotificationListItem
type NotificationListQuery = NotificationModel.NotificationListQuery
type NotificationMarkReadResponse =
	NotificationModel.NotificationMarkReadResponse
type NotificationRegisterPushTokenResponse =
	NotificationModel.NotificationRegisterPushTokenResponse

type NotificationPagination =
	PaginatedResult<NotificationListItem>['pagination']

export type CreateNotificationsForRecipientsInput = {
	organizationId: string
	recipientUserIds: string[]
	type: NotificationListItem['type']
	title: string
	body: string
	referenceId?: string | null
	referenceType?: NotificationListItem['referenceType']
}

export abstract class NotificationService {
	private static toNotificationListItem(
		row: NotificationRow
	): NotificationListItem {
		return {
			id: row.id,
			organizationId: row.organizationId,
			type: row.type as NotificationListItem['type'],
			title: row.title,
			body: row.body,
			referenceId: row.referenceId,
			referenceType:
				row.referenceType as NotificationListItem['referenceType'],
			actionType: NotificationService.deriveActionType(row.type),
			isRead: row.isRead,
			createdAt: row.createdAt,
			updatedAt: row.updatedAt
		}
	}

	private static deriveActionType(
		type: string
	): NotificationListItem['actionType'] {
		if (type === 'appointment_requested')
			return 'accept_decline_appointment'
		if (type === 'barbershop_invitation') return 'accept_decline_invite'
		return null
	}

	private static async dispatchPushNotifications(
		notifications: NotificationRow[]
	): Promise<void> {
		const recipientUserIds = Array.from(
			new Set(notifications.map((row) => row.recipientUserId))
		)

		if (recipientUserIds.length === 0) {
			return
		}

		const tokenRows = await db.query.notificationPushToken.findMany({
			where: and(
				inArray(notificationPushToken.userId, recipientUserIds),
				eq(notificationPushToken.isActive, true)
			),
			orderBy: desc(notificationPushToken.lastRegisteredAt)
		})

		if (tokenRows.length === 0) {
			return
		}

		const tokensByUserId = new Map<string, string[]>()

		for (const row of tokenRows) {
			const existingTokens = tokensByUserId.get(row.userId) ?? []
			if (!existingTokens.includes(row.token)) {
				tokensByUserId.set(row.userId, [...existingTokens, row.token])
			}
		}

		const messages: ExpoPushMessage[] = notifications.flatMap((row) =>
			(tokensByUserId.get(row.recipientUserId) ?? []).map((token) => ({
				to: token,
				title: row.title,
				body: row.body,
				data: {
					notificationId: row.id,
					organizationId: row.organizationId,
					referenceId: row.referenceId,
					referenceType: row.referenceType,
					type: row.type
				}
			}))
		)

		if (messages.length === 0) {
			return
		}

		const outcomes = await expoPushClient.sendMessages(messages)
		const failedOutcomes = outcomes.filter(
			(outcome) => outcome.status === 'error'
		)

		if (failedOutcomes.length > 0) {
			console.error(
				'[Notifications] Expo push delivery failed',
				failedOutcomes
			)
		}

		const invalidTokens = Array.from(
			new Set(
				failedOutcomes
					.filter((outcome) => outcome.isPermanentFailure)
					.map((outcome) => outcome.token)
			)
		)

		if (invalidTokens.length === 0) {
			return
		}

		const now = new Date()

		await db
			.update(notificationPushToken)
			.set({
				isActive: false,
				invalidatedAt: now,
				updatedAt: now
			})
			.where(inArray(notificationPushToken.token, invalidTokens))
	}

	private static normalizePagination(
		query: NotificationListQuery
	): NotificationPagination {
		const page = Math.max(1, query.page ?? 1)
		const limit = Math.min(100, Math.max(1, query.pageSize ?? 20))

		return {
			page,
			limit,
			skip: (page - 1) * limit,
			take: limit
		}
	}

	private static async getOwnedNotification(
		recipientUserId: string,
		notificationId: string
	) {
		const row = await db.query.notification.findFirst({
			where: and(
				eq(notification.id, notificationId),
				eq(notification.recipientUserId, recipientUserId)
			)
		})

		if (!row) {
			throw new AppError('Notification not found', 'NOT_FOUND')
		}

		return row
	}

	static async listNotifications(
		recipientUserId: string,
		query: NotificationListQuery
	): Promise<PaginatedResult<NotificationListItem>> {
		const pagination = NotificationService.normalizePagination(query)
		const where = and(
			eq(notification.recipientUserId, recipientUserId),
			query.unreadOnly === true
				? eq(notification.isRead, false)
				: undefined
		)

		const [data, countResult] = await Promise.all([
			db.query.notification.findMany({
				where,
				limit: pagination.take,
				offset: pagination.skip,
				orderBy: desc(notification.createdAt)
			}),
			db.select({ count: count() }).from(notification).where(where)
		])

		return {
			data: data.map((row) =>
				NotificationService.toNotificationListItem(row)
			),
			totalItems: countResult[0]?.count ?? 0,
			pagination
		}
	}

	static async getUnreadCount(
		recipientUserId: string
	): Promise<NotificationModel.NotificationUnreadCountResponse> {
		const [result] = await db
			.select({ count: count() })
			.from(notification)
			.where(
				and(
					eq(notification.recipientUserId, recipientUserId),
					eq(notification.isRead, false)
				)
			)

		return {
			count: result?.count ?? 0
		}
	}

	static async markAsRead(
		recipientUserId: string,
		notificationId: string
	): Promise<NotificationMarkReadResponse> {
		const row = await NotificationService.getOwnedNotification(
			recipientUserId,
			notificationId
		)

		if (row.isRead) {
			return {
				id: row.id,
				isRead: row.isRead,
				updatedAt: row.updatedAt
			}
		}

		const [updated] = await db
			.update(notification)
			.set({
				isRead: true,
				updatedAt: new Date()
			})
			.where(
				and(
					eq(notification.id, notificationId),
					eq(notification.recipientUserId, recipientUserId)
				)
			)
			.returning()

		return {
			id: updated.id,
			isRead: updated.isRead,
			updatedAt: updated.updatedAt
		}
	}

	static async markAllAsRead(
		recipientUserId: string
	): Promise<NotificationModel.NotificationMarkAllReadResponse> {
		const updatedRows = await db
			.update(notification)
			.set({
				isRead: true,
				updatedAt: new Date()
			})
			.where(
				and(
					eq(notification.recipientUserId, recipientUserId),
					eq(notification.isRead, false)
				)
			)
			.returning({ id: notification.id })

		return {
			updatedCount: updatedRows.length
		}
	}

	static async createNotificationsForRecipients(
		input: CreateNotificationsForRecipientsInput
	): Promise<NotificationRow[]> {
		const uniqueRecipientUserIds = Array.from(
			new Set(input.recipientUserIds.filter(Boolean))
		)

		if (uniqueRecipientUserIds.length === 0) {
			return []
		}

		const createdNotifications = await db
			.insert(notification)
			.values(
				uniqueRecipientUserIds.map((recipientUserId) => ({
					id: nanoid(),
					organizationId: input.organizationId,
					recipientUserId,
					type: input.type,
					title: input.title,
					body: input.body,
					referenceId: input.referenceId ?? null,
					referenceType: input.referenceType ?? null
				}))
			)
			.returning()

		void NotificationService.dispatchPushNotifications(
			createdNotifications
		).catch((error) => {
			console.error(
				'[Notifications] Failed to dispatch Expo pushes',
				error
			)
		})

		return createdNotifications
	}

	static async getOrganizationRecipientUserIds(
		organizationId: string
	): Promise<string[]> {
		const members = await db.query.member.findMany({
			where: and(
				eq(member.organizationId, organizationId),
				inArray(member.role, ['owner', 'barber'])
			)
		})

		return Array.from(new Set(members.map((row) => row.userId)))
	}

	static async registerPushToken(
		userId: string,
		token: string
	): Promise<NotificationRegisterPushTokenResponse> {
		if (!isExpoPushToken(token)) {
			throw new AppError('Invalid Expo push token', 'BAD_REQUEST')
		}

		const now = new Date()

		await db
			.insert(notificationPushToken)
			.values({
				id: nanoid(),
				userId,
				token,
				isActive: true,
				lastRegisteredAt: now,
				invalidatedAt: null,
				createdAt: now,
				updatedAt: now
			})
			.onConflictDoUpdate({
				target: notificationPushToken.token,
				set: {
					userId,
					isActive: true,
					lastRegisteredAt: now,
					invalidatedAt: null,
					updatedAt: now
				}
			})

		return {
			tokenRegistered: true
		}
	}

	static async executeAcceptAction(
		userId: string,
		notificationId: string
	): Promise<NotificationModel.NotificationActionResponse> {
		const notif = await NotificationService.getOwnedNotification(
			userId,
			notificationId
		)

		if (!notif.referenceId) {
			throw new AppError('Notification has no reference', 'BAD_REQUEST')
		}

		const referenceType = notif.referenceType

		if (
			referenceType === 'booking' &&
			notif.type === 'appointment_requested'
		) {
			await BookingService.acceptBooking(
				notif.organizationId,
				notif.referenceId
			)
		} else {
			throw new AppError(
				'Action not supported for this notification type',
				'BAD_REQUEST'
			)
		}

		return {
			notificationId,
			action: 'accepted',
			referenceType: referenceType as 'booking' | 'invitation',
			referenceId: notif.referenceId
		}
	}

	static async executeDeclineAction(
		userId: string,
		notificationId: string,
		reason?: string
	): Promise<NotificationModel.NotificationActionResponse> {
		const notif = await NotificationService.getOwnedNotification(
			userId,
			notificationId
		)

		if (!notif.referenceId) {
			throw new AppError('Notification has no reference', 'BAD_REQUEST')
		}

		const referenceType = notif.referenceType

		if (
			referenceType === 'booking' &&
			notif.type === 'appointment_requested'
		) {
			if (!reason) {
				throw new AppError(
					'reason is required to decline an appointment',
					'BAD_REQUEST'
				)
			}
			await BookingService.declineBooking(
				notif.organizationId,
				notif.referenceId,
				{ reason }
			)
		} else {
			throw new AppError(
				'Action not supported for this notification type',
				'BAD_REQUEST'
			)
		}

		return {
			notificationId,
			action: 'declined',
			referenceType: referenceType as 'booking' | 'invitation',
			referenceId: notif.referenceId
		}
	}
}
