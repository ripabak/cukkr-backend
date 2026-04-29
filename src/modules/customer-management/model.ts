import { t } from 'elysia'
import {
	PaginationMetaSchema,
	PaginationQuerySchema
} from '../../core/pagination'

export namespace CustomerManagementModel {
	export const CustomerIdParam = t.Object({
		id: t.String()
	})
	export type CustomerIdParam = typeof CustomerIdParam.static

	export const CustomerListQuery = t.Composite([
		PaginationQuerySchema,
		t.Object({
			search: t.Optional(t.String()),
			sort: t.Optional(
				t.Union([
					t.Literal('recent'),
					t.Literal('bookings_desc'),
					t.Literal('spend_desc'),
					t.Literal('name_asc')
				])
			)
		})
	])
	export type CustomerListQuery = typeof CustomerListQuery.static

	export const CustomerListItemResponse = t.Object({
		id: t.String(),
		name: t.String(),
		email: t.Nullable(t.String()),
		phone: t.Nullable(t.String()),
		isVerified: t.Boolean(),
		totalBookings: t.Number(),
		totalSpend: t.Number(),
		lastVisitAt: t.Nullable(t.Date())
	})
	export type CustomerListItemResponse =
		typeof CustomerListItemResponse.static

	export const BookingTypeFilter = t.Union([
		t.Literal('all'),
		t.Literal('appointment'),
		t.Literal('walk_in')
	])
	export type BookingTypeFilter = typeof BookingTypeFilter.static

	export const CustomerDetailResponse = t.Composite([
		CustomerListItemResponse,
		t.Object({
			notes: t.Nullable(t.String()),
			createdAt: t.Date(),
			appointmentCount: t.Number(),
			walkInCount: t.Number(),
			completedCount: t.Number(),
			cancelledCount: t.Number()
		})
	])
	export type CustomerDetailResponse = typeof CustomerDetailResponse.static

	export const CustomerNotesUpdateInput = t.Object({
		notes: t.String({ maxLength: 2000 })
	})
	export type CustomerNotesUpdateInput =
		typeof CustomerNotesUpdateInput.static

	export const CustomerBookingServiceItem = t.Object({
		name: t.String(),
		price: t.Number()
	})
	export type CustomerBookingServiceItem =
		typeof CustomerBookingServiceItem.static

	export const CustomerBookingItemResponse = t.Object({
		id: t.String(),
		referenceNumber: t.String(),
		createdAt: t.Date(),
		status: t.String(),
		type: t.String(),
		services: t.Array(CustomerBookingServiceItem),
		totalAmount: t.Number()
	})
	export type CustomerBookingItemResponse =
		typeof CustomerBookingItemResponse.static

	export const PaginatedCustomerListResponse = t.Object({
		data: t.Array(CustomerListItemResponse),
		meta: PaginationMetaSchema
	})
	export type PaginatedCustomerListResponse =
		typeof PaginatedCustomerListResponse.static

	export const PaginatedBookingHistoryResponse = t.Object({
		data: t.Array(CustomerBookingItemResponse),
		meta: PaginationMetaSchema
	})
	export type PaginatedBookingHistoryResponse =
		typeof PaginatedBookingHistoryResponse.static
}
