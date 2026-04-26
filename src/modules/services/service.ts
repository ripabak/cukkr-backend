import { and, eq } from 'drizzle-orm'
import { nanoid } from 'nanoid'

import { db } from '../../lib/database'
import { member } from '../auth/schema'
import { service } from './schema'
import { ServiceModel } from './model'
import { AppError } from '../../core/error'

export abstract class ServiceService {
	static async createService(
		organizationId: string,
		userId: string,
		input: ServiceModel.ServiceCreateInput
	): Promise<ServiceModel.ServiceResponse> {
		const memberRow = await db.query.member.findFirst({
			where: and(
				eq(member.userId, userId),
				eq(member.organizationId, organizationId)
			)
		})
		if (!memberRow || memberRow.role !== 'owner') {
			throw new AppError('Forbidden', 'FORBIDDEN')
		}

		const { name, price, duration, description, discount = 0 } = input

		if (!name || name.length < 2 || name.length > 100) {
			throw new AppError(
				'Name must be between 2 and 100 characters',
				'BAD_REQUEST'
			)
		}

		if (!Number.isInteger(price) || price <= 0) {
			throw new AppError(
				'Price must be a positive integer',
				'BAD_REQUEST'
			)
		}

		if (!Number.isInteger(duration) || duration < 5) {
			throw new AppError(
				'Duration must be an integer of at least 5 minutes',
				'BAD_REQUEST'
			)
		}

		if (!Number.isInteger(discount) || discount < 0 || discount > 100) {
			throw new AppError(
				'Discount must be an integer between 0 and 100',
				'BAD_REQUEST'
			)
		}

		const [created] = await db
			.insert(service)
			.values({
				id: nanoid(),
				organizationId,
				name,
				description: description ?? null,
				price,
				duration,
				discount,
				isActive: true,
				isDefault: true
			})
			.returning()

		return created
	}
}
