import { relations } from 'drizzle-orm'
import {
	boolean,
	index,
	integer,
	pgTable,
	text,
	timestamp,
	uniqueIndex
} from 'drizzle-orm/pg-core'

import { user } from '../auth/schema'

/**
 * Current subscription — ONE ROW PER USER (upserted on each successful payment).
 * `planId` references billing catalog ids (free/premium/business).
 * `currentPeriodEnd` is the expiry date; the daily cron flips
 * overdue ACTIVE rows to EXPIRED.
 */
export const subscription = pgTable(
	'subscription',
	{
		id: text('id').primaryKey(),
		userId: text('user_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		planId: text('plan_id').notNull(),
		status: text('status').notNull().default('active'), // active | canceled | expired
		currentPeriodStart: timestamp('current_period_start', {
			withTimezone: true
		}).notNull(),
		currentPeriodEnd: timestamp('current_period_end', {
			withTimezone: true
		}).notNull(),
		autoRenew: boolean('auto_renew').default(false).notNull(),
		createdAt: timestamp('created_at', { withTimezone: true })
			.defaultNow()
			.notNull(),
		updatedAt: timestamp('updated_at', { withTimezone: true })
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull()
	},
	(table) => [uniqueIndex('subscription_userId_uidx').on(table.userId)]
)

/**
 * Payment attempts — audit log + idempotency for webhooks.
 * `referenceId` is our merchant key (sent as Xendit `external_id`),
 * `xenditInvoiceId` is the Xendit invoice id used to dedupe webhooks.
 */
export const subscriptionPayment = pgTable(
	'subscription_payment',
	{
		id: text('id').primaryKey(),
		userId: text('user_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		planId: text('plan_id').notNull(),
		amount: integer('amount').notNull(), // IDR
		currency: text('currency').notNull().default('IDR'),
		status: text('status').notNull().default('pending'), // pending | paid | expired | failed
		referenceId: text('reference_id').notNull().unique(),
		/** Hosted invoice URL — disimpan supaya invoice pending bisa di-reuse (tanpa panggil Xendit lagi). */
		invoiceUrl: text('invoice_url'),
		xenditInvoiceId: text('xendit_invoice_id').unique(),
		xenditPaymentId: text('xendit_payment_id'),
		paymentMethod: text('payment_method').notNull().default('QRIS'),
		paidAt: timestamp('paid_at', { withTimezone: true }),
		expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
		createdAt: timestamp('created_at', { withTimezone: true })
			.defaultNow()
			.notNull(),
		updatedAt: timestamp('updated_at', { withTimezone: true })
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull()
	},
	(table) => [index('subscriptionPayment_userId_idx').on(table.userId)]
)

export const subscriptionRelations = relations(subscription, ({ one }) => ({
	user: one(user, {
		fields: [subscription.userId],
		references: [user.id]
	})
}))

export const subscriptionPaymentRelations = relations(
	subscriptionPayment,
	({ one }) => ({
		user: one(user, {
			fields: [subscriptionPayment.userId],
			references: [user.id]
		})
	})
)

export type Subscription = typeof subscription.$inferSelect
export type NewSubscription = typeof subscription.$inferInsert
export type SubscriptionPayment = typeof subscriptionPayment.$inferSelect
export type NewSubscriptionPayment = typeof subscriptionPayment.$inferInsert
