import { relations } from 'drizzle-orm'
import { pgTable, text, timestamp } from 'drizzle-orm/pg-core'

import { organization, user } from '../auth/schema'

export const walkInPin = pgTable('organization_walk_in_pin', {
	organizationId: text('organization_id')
		.primaryKey()
		.references(() => organization.id, { onDelete: 'cascade' }),
	pin: text('pin').notNull(),
	updatedByUserId: text('updated_by_user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'restrict' }),
	updatedAt: timestamp('updated_at', { withTimezone: true })
		.defaultNow()
		.notNull()
})

export const walkInPinRelations = relations(walkInPin, ({ one }) => ({
	organization: one(organization, {
		fields: [walkInPin.organizationId],
		references: [organization.id]
	}),
	updatedByUser: one(user, {
		fields: [walkInPin.updatedByUserId],
		references: [user.id]
	})
}))

export type WalkInPin = typeof walkInPin.$inferSelect
export type NewWalkInPin = typeof walkInPin.$inferInsert
