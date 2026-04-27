import { relations } from 'drizzle-orm'
import {
	boolean,
	index,
	integer,
	pgTable,
	primaryKey,
	text,
	timestamp,
	uniqueIndex
} from 'drizzle-orm/pg-core'

import { member, organization, user } from '../auth/schema'
import { service } from '../services/schema'

export const customer = pgTable(
	'customer',
	{
		id: text('id').primaryKey(),
		organizationId: text('organization_id')
			.notNull()
			.references(() => organization.id, { onDelete: 'cascade' }),
		name: text('name').notNull(),
		phone: text('phone'),
		email: text('email'),
		isVerified: boolean('is_verified').default(false).notNull(),
		notes: text('notes'),
		createdAt: timestamp('created_at').defaultNow().notNull(),
		updatedAt: timestamp('updated_at')
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull()
	},
	(table) => [
		index('customer_organizationId_phone_idx').on(
			table.organizationId,
			table.phone
		),
		index('customer_organizationId_email_idx').on(
			table.organizationId,
			table.email
		),
		index('customer_organizationId_name_idx').on(
			table.organizationId,
			table.name
		)
	]
)

export const booking = pgTable(
	'booking',
	{
		id: text('id').primaryKey(),
		organizationId: text('organization_id')
			.notNull()
			.references(() => organization.id, { onDelete: 'cascade' }),
		referenceNumber: text('reference_number').notNull(),
		type: text('type').notNull(),
		status: text('status').notNull(),
		customerId: text('customer_id')
			.notNull()
			.references(() => customer.id, { onDelete: 'restrict' }),
		barberId: text('barber_id').references(() => member.id, {
			onDelete: 'set null'
		}),
		scheduledAt: timestamp('scheduled_at'),
		notes: text('notes'),
		startedAt: timestamp('started_at'),
		completedAt: timestamp('completed_at'),
		cancelledAt: timestamp('cancelled_at'),
		createdById: text('created_by_id')
			.notNull()
			.references(() => user.id, { onDelete: 'restrict' }),
		createdAt: timestamp('created_at').defaultNow().notNull(),
		updatedAt: timestamp('updated_at')
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull()
	},
	(table) => [
		index('booking_organizationId_createdAt_idx').on(
			table.organizationId,
			table.createdAt
		),
		index('booking_organizationId_scheduledAt_idx').on(
			table.organizationId,
			table.scheduledAt
		),
		index('booking_organizationId_status_idx').on(
			table.organizationId,
			table.status
		),
		index('booking_organizationId_barberId_scheduledAt_idx').on(
			table.organizationId,
			table.barberId,
			table.scheduledAt
		),
		uniqueIndex('booking_organizationId_referenceNumber_uidx').on(
			table.organizationId,
			table.referenceNumber
		),
		index('booking_organizationId_customerId_createdAt_idx').on(
			table.organizationId,
			table.customerId,
			table.createdAt
		)
	]
)

export const bookingService = pgTable(
	'booking_service',
	{
		id: text('id').primaryKey(),
		bookingId: text('booking_id')
			.notNull()
			.references(() => booking.id, { onDelete: 'cascade' }),
		serviceId: text('service_id')
			.notNull()
			.references(() => service.id, { onDelete: 'restrict' }),
		serviceName: text('service_name').notNull(),
		price: integer('price').notNull(),
		originalPrice: integer('original_price').notNull(),
		discount: integer('discount').notNull(),
		duration: integer('duration').notNull()
	},
	(table) => [index('booking_service_bookingId_idx').on(table.bookingId)]
)

export const bookingDailyCounter = pgTable(
	'booking_daily_counter',
	{
		organizationId: text('organization_id')
			.notNull()
			.references(() => organization.id, { onDelete: 'cascade' }),
		bookingDate: text('booking_date').notNull(),
		lastSequence: integer('last_sequence').notNull(),
		updatedAt: timestamp('updated_at')
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull()
	},
	(table) => [
		primaryKey({
			name: 'booking_daily_counter_org_date_pk',
			columns: [table.organizationId, table.bookingDate]
		})
	]
)

export const customerRelations = relations(customer, ({ many, one }) => ({
	organization: one(organization, {
		fields: [customer.organizationId],
		references: [organization.id]
	}),
	bookings: many(booking)
}))

export const bookingRelations = relations(booking, ({ many, one }) => ({
	organization: one(organization, {
		fields: [booking.organizationId],
		references: [organization.id]
	}),
	customer: one(customer, {
		fields: [booking.customerId],
		references: [customer.id]
	}),
	barber: one(member, {
		fields: [booking.barberId],
		references: [member.id]
	}),
	createdBy: one(user, {
		fields: [booking.createdById],
		references: [user.id]
	}),
	services: many(bookingService)
}))

export const bookingServiceRelations = relations(bookingService, ({ one }) => ({
	booking: one(booking, {
		fields: [bookingService.bookingId],
		references: [booking.id]
	}),
	service: one(service, {
		fields: [bookingService.serviceId],
		references: [service.id]
	})
}))

export const bookingDailyCounterRelations = relations(
	bookingDailyCounter,
	({ one }) => ({
		organization: one(organization, {
			fields: [bookingDailyCounter.organizationId],
			references: [organization.id]
		})
	})
)

export type Customer = typeof customer.$inferSelect
export type NewCustomer = typeof customer.$inferInsert

export type Booking = typeof booking.$inferSelect
export type NewBooking = typeof booking.$inferInsert

export type BookingService = typeof bookingService.$inferSelect
export type NewBookingService = typeof bookingService.$inferInsert

export type BookingDailyCounter = typeof bookingDailyCounter.$inferSelect
export type NewBookingDailyCounter = typeof bookingDailyCounter.$inferInsert
