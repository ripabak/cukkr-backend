import { relations, sql } from 'drizzle-orm'
import {
	boolean,
	index,
	pgTable,
	text,
	timestamp,
	uniqueIndex
} from 'drizzle-orm/pg-core'

import { organization, user } from '../auth/schema'

export const notification = pgTable(
	'notification',
	{
		id: text('id').primaryKey(),
		organizationId: text('organization_id')
			.notNull()
			.references(() => organization.id, { onDelete: 'cascade' }),
		recipientUserId: text('recipient_user_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		type: text('type').notNull(),
		title: text('title').notNull(),
		body: text('body').notNull(),
		referenceId: text('reference_id'),
		referenceType: text('reference_type'),
		isRead: boolean('is_read').default(false).notNull(),
		createdAt: timestamp('created_at').defaultNow().notNull(),
		updatedAt: timestamp('updated_at')
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull()
	},
	(table) => [
		index('notification_recipientUserId_createdAt_idx').on(
			table.recipientUserId,
			sql`${table.createdAt} desc`
		),
		index('notification_recipientUserId_isRead_createdAt_idx').on(
			table.recipientUserId,
			table.isRead,
			sql`${table.createdAt} desc`
		),
		index('notification_organizationId_type_createdAt_idx').on(
			table.organizationId,
			table.type,
			sql`${table.createdAt} desc`
		),
		index('notification_referenceType_referenceId_idx').on(
			table.referenceType,
			table.referenceId
		)
	]
)

export const notificationPushToken = pgTable(
	'notification_push_token',
	{
		id: text('id').primaryKey(),
		userId: text('user_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		token: text('token').notNull(),
		isActive: boolean('is_active').default(true).notNull(),
		lastRegisteredAt: timestamp('last_registered_at')
			.defaultNow()
			.notNull(),
		invalidatedAt: timestamp('invalidated_at'),
		createdAt: timestamp('created_at').defaultNow().notNull(),
		updatedAt: timestamp('updated_at')
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull()
	},
	(table) => [
		index(
			'notification_push_token_userId_isActive_lastRegisteredAt_idx'
		).on(table.userId, table.isActive, sql`${table.lastRegisteredAt} desc`),
		uniqueIndex('notification_push_token_token_uidx').on(table.token)
	]
)

export const notificationRelations = relations(notification, ({ one }) => ({
	organization: one(organization, {
		fields: [notification.organizationId],
		references: [organization.id]
	}),
	recipientUser: one(user, {
		fields: [notification.recipientUserId],
		references: [user.id]
	})
}))

export const notificationPushTokenRelations = relations(
	notificationPushToken,
	({ one }) => ({
		user: one(user, {
			fields: [notificationPushToken.userId],
			references: [user.id]
		})
	})
)

export type Notification = typeof notification.$inferSelect
export type NewNotification = typeof notification.$inferInsert

export type NotificationPushToken = typeof notificationPushToken.$inferSelect
export type NewNotificationPushToken = typeof notificationPushToken.$inferInsert
