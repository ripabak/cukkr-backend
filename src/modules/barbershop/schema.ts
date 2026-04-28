import {
	pgTable,
	text,
	boolean,
	timestamp,
	uniqueIndex
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { organization } from '../auth/schema'

export const barbershopSettings = pgTable(
	'barbershop_settings',
	{
		id: text('id').primaryKey(),
		organizationId: text('organization_id')
			.notNull()
			.references(() => organization.id, { onDelete: 'cascade' }),
		description: text('description'),
		address: text('address'),
		logoUrl: text('logo_url'),
		onboardingCompleted: boolean('onboarding_completed')
			.default(false)
			.notNull(),
		createdAt: timestamp('created_at').defaultNow().notNull(),
		updatedAt: timestamp('updated_at')
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull()
	},
	(table) => [
		uniqueIndex('barbershop_settings_organizationId_uidx').on(
			table.organizationId
		)
	]
)

export const barbershopSettingsRelations = relations(
	barbershopSettings,
	({ one }) => ({
		organization: one(organization, {
			fields: [barbershopSettings.organizationId],
			references: [organization.id]
		})
	})
)
