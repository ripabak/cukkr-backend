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

	export const ChartPointSchema = t.Object({
		label: t.String(),
		value: t.Number()
	})
	export type ChartPoint = typeof ChartPointSchema.static

	export const HighlightItemSchema = t.Object({
		id: t.String(),
		name: t.String(),
		imageUrl: t.Nullable(t.String()),
		count: t.Number(),
		revenue: t.Number()
	})
	export type HighlightItem = typeof HighlightItemSchema.static

	// ─── Revenue analytics ──────────────────────────────────────────────────────

	export const RevenueStatsSchema = t.Object({
		range: AnalyticsRangeEnum,
		stats: t.Object({
			totalBookings: StatCardSchema,
			avgRevenuePerBooking: StatCardSchema,
			avgTime: StatCardSchema
		}),
		chart: t.Array(ChartPointSchema)
	})
	export type RevenueStats = typeof RevenueStatsSchema.static

	export const BookingTypeFilterEnum = t.Union([
		t.Literal('all'),
		t.Literal('walk_in'),
		t.Literal('appointment')
	])
	export type BookingTypeFilter = typeof BookingTypeFilterEnum.static

	export const RevenueBookingItemSchema = t.Object({
		bookingId: t.String(),
		customerId: t.String(),
		customerName: t.String(),
		completedAt: t.String(),
		type: t.Union([t.Literal('walk_in'), t.Literal('appointment')]),
		services: t.Array(t.String()),
		revenue: t.Number()
	})
	export type RevenueBookingItem = typeof RevenueBookingItemSchema.static

	// ─── Customer analytics ─────────────────────────────────────────────────────

	export const CustomerAnalyticsStatsSchema = t.Object({
		range: AnalyticsRangeEnum,
		stats: t.Object({
			totalCustomers: StatCardSchema,
			totalWalkIn: StatCardSchema,
			totalAppointment: StatCardSchema,
			totalNew: StatCardSchema,
			totalReturn: StatCardSchema
		}),
		chart: t.Array(ChartPointSchema)
	})
	export type CustomerAnalyticsStats =
		typeof CustomerAnalyticsStatsSchema.static

	export const CustomerStatusFilterEnum = t.Union([
		t.Literal('all'),
		t.Literal('new'),
		t.Literal('return')
	])
	export type CustomerStatusFilter = typeof CustomerStatusFilterEnum.static

	export const CustomerAnalyticsListItemSchema = t.Object({
		customerId: t.String(),
		customerName: t.String(),
		totalVisits: t.Number(),
		lastVisitDate: t.Nullable(t.String()),
		status: t.Union([t.Literal('new'), t.Literal('return')]),
		totalRevenue: t.Number()
	})
	export type CustomerAnalyticsListItem =
		typeof CustomerAnalyticsListItemSchema.static

	// ─── Barber analytics ────────────────────────────────────────────────────────

	export const BarberChartItemSchema = t.Object({
		barberId: t.String(),
		barberName: t.String(),
		value: t.Number()
	})
	export type BarberChartItem = typeof BarberChartItemSchema.static

	export const BarberListItemSchema = t.Object({
		barberId: t.String(),
		name: t.String(),
		imageUrl: t.Nullable(t.String()),
		totalCustomers: t.Number(),
		totalRevenue: t.Number()
	})
	export type BarberListItem = typeof BarberListItemSchema.static

	export const BarberAnalyticsResponseSchema = t.Object({
		chart: t.Array(BarberChartItemSchema)
	})
	export type BarberAnalyticsResponse =
		typeof BarberAnalyticsResponseSchema.static

	// ─── Service analytics ───────────────────────────────────────────────────────

	export const ServiceAnalyticsStatsSchema = t.Object({
		range: AnalyticsRangeEnum,
		stats: t.Object({
			totalBookings: StatCardSchema,
			totalRevenue: StatCardSchema
		}),
		chart: t.Array(ChartPointSchema)
	})
	export type ServiceAnalyticsStats =
		typeof ServiceAnalyticsStatsSchema.static

	export const ServiceListItemSchema = t.Object({
		serviceId: t.String(),
		serviceName: t.String(),
		totalBookings: t.Number(),
		percentage: t.Number(),
		revenue: t.Number()
	})
	export type ServiceListItem = typeof ServiceListItemSchema.static

	// ─── Overview ────────────────────────────────────────────────────────────────

	export const AnalyticsResponseSchema = t.Object({
		range: AnalyticsRangeEnum,
		stats: t.Object({
			totalSales: StatCardSchema,
			totalBookings: StatCardSchema,
			totalCustomers: StatCardSchema,
			appointments: StatCardSchema,
			walkIns: StatCardSchema
		}),
		chart: t.Object({
			revenue: t.Array(ChartPointSchema),
			customers: t.Array(ChartPointSchema)
		}),
		highlights: t.Object({
			topBarber: t.Nullable(HighlightItemSchema),
			topService: t.Nullable(HighlightItemSchema)
		})
	})
	export type AnalyticsResponse = typeof AnalyticsResponseSchema.static
}
