import {
	pgTable,
	text,
	integer,
	boolean,
	timestamp,
	index,
	uniqueIndex
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { organization } from '../auth/schema'

export const openHour = pgTable(
	'open_hour',
	{
		id: text('id').primaryKey(),
		organizationId: text('organization_id')
			.notNull()
			.references(() => organization.id, { onDelete: 'cascade' }),
		dayOfWeek: integer('day_of_week').notNull(),
		isOpen: boolean('is_open').default(false).notNull(),
		openTime: text('open_time'),
		closeTime: text('close_time'),
		createdAt: timestamp('created_at').defaultNow().notNull(),
		updatedAt: timestamp('updated_at')
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull()
	},
	(table) => [
		uniqueIndex('open_hour_organizationId_dayOfWeek_uidx').on(
			table.organizationId,
			table.dayOfWeek
		),
		index('open_hour_organizationId_idx').on(table.organizationId)
	]
)

export const openHourRelations = relations(openHour, ({ one }) => ({
	organization: one(organization, {
		fields: [openHour.organizationId],
		references: [organization.id]
	})
}))

export type OpenHour = typeof openHour.$inferSelect
export type NewOpenHour = typeof openHour.$inferInsert
