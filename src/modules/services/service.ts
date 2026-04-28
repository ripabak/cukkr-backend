import { and, asc, desc, eq, ilike } from 'drizzle-orm'
import { nanoid } from 'nanoid'

import { db } from '../../lib/database'
import { member } from '../auth/schema'
import { service } from './schema'
import { ServiceModel } from './model'
import { AppError } from '../../core/error'
import { storageClient } from '../../lib/storage'

export abstract class ServiceService {
	private static async findInOrg(
		id: string,
		organizationId: string
	): Promise<ServiceModel.ServiceResponse> {
		const row = await db.query.service.findFirst({
			where: and(
				eq(service.id, id),
				eq(service.organizationId, organizationId)
			)
		})

		if (!row) throw new AppError('Service not found', 'NOT_FOUND')

		return row
	}

	static async listServices(
		organizationId: string,
		query: ServiceModel.ServiceListQuery
	): Promise<ServiceModel.ServiceResponse[]> {
		const conditions = [
			eq(service.organizationId, organizationId),
			query.search ? ilike(service.name, `%${query.search}%`) : undefined,
			query.activeOnly === true ? eq(service.isActive, true) : undefined
		].filter(Boolean) as Parameters<typeof and>

		const where = and(...conditions)

		let orderBy
		switch (query.sort) {
			case 'name_asc':
				orderBy = asc(service.name)
				break
			case 'name_desc':
				orderBy = desc(service.name)
				break
			case 'price_asc':
				orderBy = asc(service.price)
				break
			case 'price_desc':
				orderBy = desc(service.price)
				break
			default:
				orderBy = desc(service.createdAt)
		}

		return db.query.service.findMany({ where, orderBy })
	}

	static async getService(
		organizationId: string,
		id: string
	): Promise<ServiceModel.ServiceResponse> {
		return ServiceService.findInOrg(id, organizationId)
	}

	static async createService(
		organizationId: string,
		input: ServiceModel.ServiceCreateInput
	): Promise<ServiceModel.ServiceResponse> {
		const [created] = await db
			.insert(service)
			.values({
				id: nanoid(),
				organizationId,
				name: input.name,
				description: input.description ?? null,
				price: input.price,
				duration: input.duration,
				discount: input.discount ?? 0,
				isActive: false,
				isDefault: false
			})
			.returning()

		return created
	}

	static async updateService(
		organizationId: string,
		id: string,
		input: ServiceModel.ServiceUpdateInput
	): Promise<ServiceModel.ServiceResponse> {
		if ('isDefault' in input && input.isDefault !== undefined) {
			throw new AppError(
				'Default service must be updated via set-default endpoint',
				'BAD_REQUEST'
			)
		}

		await ServiceService.findInOrg(id, organizationId)

		const [updated] = await db
			.update(service)
			.set({
				...(input.name !== undefined && { name: input.name }),
				...(input.description !== undefined && {
					description: input.description
				}),
				...(input.price !== undefined && { price: input.price }),
				...(input.duration !== undefined && {
					duration: input.duration
				}),
				...(input.discount !== undefined && {
					discount: input.discount
				})
			})
			.where(
				and(
					eq(service.id, id),
					eq(service.organizationId, organizationId)
				)
			)
			.returning()

		return updated
	}

	static async deleteService(
		organizationId: string,
		id: string
	): Promise<ServiceModel.ServiceResponse> {
		const row = await ServiceService.findInOrg(id, organizationId)

		if (row.isDefault) {
			throw new AppError(
				'Cannot delete the default service. Please set a new default first.',
				'BAD_REQUEST'
			)
		}

		const [deleted] = await db
			.delete(service)
			.where(
				and(
					eq(service.id, id),
					eq(service.organizationId, organizationId)
				)
			)
			.returning()

		return deleted
	}

	static async toggleActive(
		organizationId: string,
		id: string
	): Promise<ServiceModel.ServiceResponse> {
		const row = await ServiceService.findInOrg(id, organizationId)

		const nextActive = !row.isActive
		const clearDefault = row.isDefault && !nextActive

		const [updated] = await db
			.update(service)
			.set({
				isActive: nextActive,
				...(clearDefault && { isDefault: false })
			})
			.where(
				and(
					eq(service.id, id),
					eq(service.organizationId, organizationId)
				)
			)
			.returning()

		return updated
	}

	static async setDefault(
		organizationId: string,
		id: string
	): Promise<ServiceModel.ServiceResponse> {
		const row = await ServiceService.findInOrg(id, organizationId)

		if (!row.isActive) {
			throw new AppError(
				'Service must be active to be set as default',
				'BAD_REQUEST'
			)
		}

		const [updated] = await db.transaction(async (tx) => {
			await tx
				.update(service)
				.set({ isDefault: false })
				.where(
					and(
						eq(service.organizationId, organizationId),
						eq(service.isDefault, true)
					)
				)

			return tx
				.update(service)
				.set({ isDefault: true })
				.where(
					and(
						eq(service.id, id),
						eq(service.organizationId, organizationId)
					)
				)
				.returning()
		})

		return updated
	}

	static async uploadServiceImage(
		organizationId: string,
		userId: string,
		id: string,
		file: File
	): Promise<ServiceModel.ServiceImageUploadResponse> {
		const memberRow = await db.query.member.findFirst({
			where: and(
				eq(member.userId, userId),
				eq(member.organizationId, organizationId)
			)
		})
		if (!memberRow || memberRow.role !== 'owner') {
			throw new AppError('Forbidden', 'FORBIDDEN')
		}

		await ServiceService.findInOrg(id, organizationId)

		const SERVICE_IMAGE_MAX_SIZE = 5 * 1024 * 1024
		const ALLOWED_MIME_EXTENSIONS: Record<string, string> = {
			'image/jpeg': 'jpg',
			'image/png': 'png',
			'image/webp': 'webp'
		}

		if (file.size > SERVICE_IMAGE_MAX_SIZE) {
			throw new AppError(
				'Image file exceeds maximum size of 5MB',
				'UNPROCESSABLE_ENTITY'
			)
		}

		const ext = ALLOWED_MIME_EXTENSIONS[file.type]
		if (!ext) {
			throw new AppError(
				'Image must be a JPEG, PNG, or WebP image',
				'UNPROCESSABLE_ENTITY'
			)
		}

		const buffer = new Uint8Array(await file.arrayBuffer())
		const key = `services/${organizationId}/${id}/${nanoid()}.${ext}`
		const imageUrl = await storageClient.upload(key, buffer, file.type)

		await db
			.update(service)
			.set({ imageUrl })
			.where(
				and(
					eq(service.id, id),
					eq(service.organizationId, organizationId)
				)
			)

		return { imageUrl }
	}
}
