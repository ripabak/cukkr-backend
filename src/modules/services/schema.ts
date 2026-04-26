import {
	pgTable,
	text,
	integer,
	boolean,
	timestamp,
	index
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { organization } from '../auth/schema'

export const service = pgTable(
	'service',
	{
		id: text('id').primaryKey(),
		organizationId: text('organization_id')
			.notNull()
			.references(() => organization.id, { onDelete: 'cascade' }),
		name: text('name').notNull(),
		description: text('description'),
		price: integer('price').notNull(),
		duration: integer('duration').notNull(),
		discount: integer('discount').default(0).notNull(),
		isActive: boolean('is_active').default(true).notNull(),
		isDefault: boolean('is_default').default(false).notNull(),
		createdAt: timestamp('created_at').defaultNow().notNull(),
		updatedAt: timestamp('updated_at')
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull()
	},
	(table) => [
		index('service_organizationId_idx').on(table.organizationId),
		index('service_organizationId_isDefault_idx').on(
			table.organizationId,
			table.isDefault
		)
	]
)

export const serviceRelations = relations(service, ({ one }) => ({
	organization: one(organization, {
		fields: [service.organizationId],
		references: [organization.id]
	})
}))
