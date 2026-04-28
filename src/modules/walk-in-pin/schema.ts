import { relations } from 'drizzle-orm'
import { boolean, index, pgTable, text, timestamp } from 'drizzle-orm/pg-core'

import { organization, user } from '../auth/schema'

export const walkInPin = pgTable(
	'walk_in_pin',
	{
		id: text('id').primaryKey(),
		organizationId: text('organization_id')
			.notNull()
			.references(() => organization.id, { onDelete: 'cascade' }),
		generatedByUserId: text('generated_by_user_id')
			.notNull()
			.references(() => user.id, { onDelete: 'restrict' }),
		pinHash: text('pin_hash').notNull(),
		isUsed: boolean('is_used').notNull().default(false),
		expiresAt: timestamp('expires_at').notNull(),
		usedAt: timestamp('used_at'),
		tokenConsumedAt: timestamp('token_consumed_at'),
		createdAt: timestamp('created_at').defaultNow().notNull()
	},
	(table) => [
		index('wip_org_active_idx').on(
			table.organizationId,
			table.isUsed,
			table.expiresAt
		),
		index('wip_org_created_idx').on(table.organizationId, table.createdAt)
	]
)

export const walkInPinRelations = relations(walkInPin, ({ one }) => ({
	organization: one(organization, {
		fields: [walkInPin.organizationId],
		references: [organization.id]
	}),
	generatedByUser: one(user, {
		fields: [walkInPin.generatedByUserId],
		references: [user.id]
	})
}))

export type WalkInPin = typeof walkInPin.$inferSelect
export type NewWalkInPin = typeof walkInPin.$inferInsert
