import { t } from 'elysia'

export namespace AnalyticsModel {
	export const AnalyticsRangeEnum = t.Union([
		t.Literal('24h'),
		t.Literal('week'),
		t.Literal('month'),
		t.Literal('6m'),
		t.Literal('1y')
	])
	export type AnalyticsRange = typeof AnalyticsRangeEnum.static

	export const AnalyticsQueryParam = t.Object({
		range: AnalyticsRangeEnum
	})
	export type AnalyticsQueryParam = typeof AnalyticsQueryParam.static

	export const StatCardSchema = t.Object({
		current: t.Number(),
		previous: t.Number(),
		change: t.Nullable(t.Number()),
		direction: t.Union([
			t.Literal('up'),
			t.Literal('down'),
			t.Literal('neutral')
		])
	})
	export type StatCard = typeof StatCardSchema.static

	export const ChartBucketSchema = t.Object({
		label: t.String(),
		sales: t.Number(),
		bookings: t.Number()
	})
	export type ChartBucket = typeof ChartBucketSchema.static

	export const AnalyticsResponseSchema = t.Object({
		range: AnalyticsRangeEnum,
		stats: t.Object({
			totalSales: StatCardSchema,
			totalBookings: StatCardSchema,
			appointments: StatCardSchema,
			walkIns: StatCardSchema
		}),
		chart: t.Object({
			sales: t.Array(ChartBucketSchema),
			bookings: t.Array(ChartBucketSchema)
		})
	})
	export type AnalyticsResponse = typeof AnalyticsResponseSchema.static
}
