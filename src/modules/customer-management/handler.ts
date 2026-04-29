import { Elysia, t } from 'elysia'

import {
	formatResponse,
	FormatResponseSchema
} from '../../core/format-response'
import { buildPaginationMeta } from '../../core/pagination'
import { authMiddleware } from '../../middleware/auth-middleware'
import { CustomerManagementModel } from './model'
import { CustomerManagementService } from './service'

export const customersHandler = new Elysia({
	prefix: '/customers',
	tags: ['Customer Management']
})
	.use(authMiddleware)

	// GET /api/customers — paginated, searchable, sortable list
	.get(
		'/',
		async ({ query, path, activeOrganizationId }) => {
			const { data, totalItems, pagination } =
				await CustomerManagementService.listCustomers(
					activeOrganizationId,
					query
				)
			return formatResponse({
				path,
				data,
				meta: buildPaginationMeta(pagination, totalItems)
			})
		},
		{
			requireAuth: true,
			requireOrganization: true,
			query: CustomerManagementModel.CustomerListQuery,
			response: FormatResponseSchema(
				t.Array(CustomerManagementModel.CustomerListItemResponse)
			)
		}
	)

	// GET /api/customers/:id — full customer profile
	.get(
		'/:id',
		async ({ params: { id }, path, activeOrganizationId }) => {
			const data = await CustomerManagementService.getCustomer(
				activeOrganizationId,
				id
			)
			return formatResponse({ path, data })
		},
		{
			requireAuth: true,
			requireOrganization: true,
			params: CustomerManagementModel.CustomerIdParam,
			response: FormatResponseSchema(
				CustomerManagementModel.CustomerDetailResponse
			)
		}
	)

	// GET /api/customers/:id/bookings — paginated booking history
	.get(
		'/:id/bookings',
		async ({ params: { id }, query, path, activeOrganizationId }) => {
			const { data, totalItems, pagination } =
				await CustomerManagementService.getCustomerBookings(
					activeOrganizationId,
					id,
					query
				)
			return formatResponse({
				path,
				data,
				meta: buildPaginationMeta(pagination, totalItems)
			})
		},
		{
			requireAuth: true,
			requireOrganization: true,
			params: CustomerManagementModel.CustomerIdParam,
			query: t.Object({
				page: t.Optional(t.Numeric()),
				limit: t.Optional(t.Numeric()),
				type: t.Optional(CustomerManagementModel.BookingTypeFilter)
			}),
			response: FormatResponseSchema(
				t.Array(CustomerManagementModel.CustomerBookingItemResponse)
			)
		}
	)

	// PATCH /api/customers/:id/notes — update customer notes
	.patch(
		'/:id/notes',
		async ({ params: { id }, body, path, activeOrganizationId }) => {
			const data = await CustomerManagementService.updateNotes(
				activeOrganizationId,
				id,
				body.notes
			)
			return formatResponse({
				path,
				data,
				message: 'Customer notes updated'
			})
		},
		{
			requireAuth: true,
			requireOrganization: true,
			params: CustomerManagementModel.CustomerIdParam,
			body: CustomerManagementModel.CustomerNotesUpdateInput,
			response: FormatResponseSchema(
				CustomerManagementModel.CustomerDetailResponse
			)
		}
	)
