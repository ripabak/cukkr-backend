import { and, count, eq, ne } from 'drizzle-orm'
import { nanoid } from 'nanoid'

import { db } from '../../lib/database'
import { organization, member } from '../auth/schema'
import { barbershopSettings } from './schema'
import { BarbershopModel } from './model'
import { AppError } from '../../core/error'
import { storageClient } from '../../lib/storage'

const SLUG_REGEX = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/

export abstract class BarbershopService {
	private static async ensureSettingsRow(
		organizationId: string
	): Promise<void> {
		await db
			.insert(barbershopSettings)
			.values({
				id: nanoid(),
				organizationId,
				onboardingCompleted: false
			})
			.onConflictDoNothing()
	}

	private static async validateAndCheckSlug(
		slug: string,
		excludeOrgId?: string
	): Promise<void> {
		if (slug.length < 3 || slug.length > 60 || !SLUG_REGEX.test(slug)) {
			throw new AppError('Invalid slug format', 'BAD_REQUEST')
		}

		const conditions = excludeOrgId
			? and(
					eq(organization.slug, slug),
					ne(organization.id, excludeOrgId)
				)
			: eq(organization.slug, slug)

		const taken = await db
			.select({ id: organization.id })
			.from(organization)
			.where(conditions)
			.limit(1)

		if (taken[0]) {
			throw new AppError('Slug is already taken', 'CONFLICT')
		}
	}

	static async getSettings(
		organizationId: string
	): Promise<BarbershopModel.BarbershopResponse> {
		await BarbershopService.ensureSettingsRow(organizationId)

		const rows = await db
			.select({
				id: organization.id,
				name: organization.name,
				slug: organization.slug,
				description: barbershopSettings.description,
				address: barbershopSettings.address,
				logoUrl: barbershopSettings.logoUrl,
				onboardingCompleted: barbershopSettings.onboardingCompleted
			})
			.from(organization)
			.leftJoin(
				barbershopSettings,
				eq(barbershopSettings.organizationId, organization.id)
			)
			.where(eq(organization.id, organizationId))
			.limit(1)

		if (!rows[0]) {
			throw new AppError('Organization not found', 'NOT_FOUND')
		}

		return {
			id: rows[0].id,
			name: rows[0].name,
			slug: rows[0].slug,
			description: rows[0].description ?? null,
			address: rows[0].address ?? null,
			logoUrl: rows[0].logoUrl ?? null,
			onboardingCompleted: rows[0].onboardingCompleted ?? false
		}
	}

	static async updateSettings(
		organizationId: string,
		userId: string,
		body: BarbershopModel.BarbershopSettingsInput
	): Promise<BarbershopModel.BarbershopResponse> {
		const memberRow = await db.query.member.findFirst({
			where: and(
				eq(member.userId, userId),
				eq(member.organizationId, organizationId)
			)
		})
		if (!memberRow || memberRow.role !== 'owner') {
			throw new AppError('Forbidden', 'FORBIDDEN')
		}

		const { name, slug, description, address, onboardingCompleted } = body

		if (onboardingCompleted === false) {
			throw new AppError(
				'onboardingCompleted cannot be set to false',
				'BAD_REQUEST'
			)
		}

		if (slug !== undefined) {
			await BarbershopService.validateAndCheckSlug(slug, organizationId)
		}

		if (name !== undefined || slug !== undefined) {
			await db
				.update(organization)
				.set({
					...(name !== undefined ? { name } : {}),
					...(slug !== undefined ? { slug } : {})
				})
				.where(eq(organization.id, organizationId))
		}

		await BarbershopService.ensureSettingsRow(organizationId)

		const settingsUpdate: {
			description?: string | null
			address?: string | null
			onboardingCompleted?: boolean
		} = {}

		if (description !== undefined) settingsUpdate.description = description
		if (address !== undefined) settingsUpdate.address = address

		if (onboardingCompleted === true) {
			const current = await db.query.barbershopSettings.findFirst({
				where: eq(barbershopSettings.organizationId, organizationId)
			})
			if (!current?.onboardingCompleted) {
				settingsUpdate.onboardingCompleted = true
			}
		}

		if (Object.keys(settingsUpdate).length > 0) {
			await db
				.update(barbershopSettings)
				.set(settingsUpdate)
				.where(eq(barbershopSettings.organizationId, organizationId))
		}

		return BarbershopService.getSettings(organizationId)
	}

	static async checkSlug(
		slug: string
	): Promise<BarbershopModel.SlugCheckResponse> {
		if (slug.length < 3 || slug.length > 60 || !SLUG_REGEX.test(slug)) {
			throw new AppError('Invalid slug format', 'BAD_REQUEST')
		}

		const rows = await db
			.select({ id: organization.id })
			.from(organization)
			.where(eq(organization.slug, slug))
			.limit(1)

		return { available: rows.length === 0 }
	}

	static async createBarbershop(
		userId: string,
		body: BarbershopModel.CreateBarbershopInput
	): Promise<BarbershopModel.BarbershopResponse> {
		await BarbershopService.validateAndCheckSlug(body.slug)

		const orgId = nanoid()
		const now = new Date()

		await db.insert(organization).values({
			id: orgId,
			name: body.name,
			slug: body.slug,
			createdAt: now
		})

		await db.insert(member).values({
			id: nanoid(),
			organizationId: orgId,
			userId,
			role: 'owner',
			createdAt: now
		})

		await BarbershopService.ensureSettingsRow(orgId)

		if (body.description !== undefined || body.address !== undefined) {
			const settingsUpdate: {
				description?: string | null
				address?: string | null
			} = {}
			if (body.description !== undefined)
				settingsUpdate.description = body.description
			if (body.address !== undefined)
				settingsUpdate.address = body.address

			await db
				.update(barbershopSettings)
				.set(settingsUpdate)
				.where(eq(barbershopSettings.organizationId, orgId))
		}

		return BarbershopService.getSettings(orgId)
	}

	static async listBarbershops(
		userId: string
	): Promise<BarbershopModel.BarbershopListResponse> {
		const rows = await db
			.select({
				id: organization.id,
				name: organization.name,
				slug: organization.slug,
				description: barbershopSettings.description,
				address: barbershopSettings.address,
				logoUrl: barbershopSettings.logoUrl,
				onboardingCompleted: barbershopSettings.onboardingCompleted,
				role: member.role
			})
			.from(member)
			.innerJoin(organization, eq(organization.id, member.organizationId))
			.leftJoin(
				barbershopSettings,
				eq(barbershopSettings.organizationId, organization.id)
			)
			.where(eq(member.userId, userId))
			.orderBy(organization.createdAt)

		return rows.map((row) => ({
			id: row.id,
			name: row.name,
			slug: row.slug,
			description: row.description ?? null,
			address: row.address ?? null,
			logoUrl: row.logoUrl ?? null,
			onboardingCompleted: row.onboardingCompleted ?? false,
			role: row.role
		}))
	}

	static async uploadLogo(
		organizationId: string,
		userId: string,
		file: File
	): Promise<BarbershopModel.LogoUploadResponse> {
		const memberRow = await db.query.member.findFirst({
			where: and(
				eq(member.userId, userId),
				eq(member.organizationId, organizationId)
			)
		})
		if (!memberRow || memberRow.role !== 'owner') {
			throw new AppError('Forbidden', 'FORBIDDEN')
		}

		const LOGO_MAX_SIZE = 5 * 1024 * 1024
		const ALLOWED_MIME_EXTENSIONS: Record<string, string> = {
			'image/jpeg': 'jpg',
			'image/png': 'png',
			'image/webp': 'webp'
		}

		if (file.size > LOGO_MAX_SIZE) {
			throw new AppError(
				'Logo file exceeds maximum size of 5MB',
				'UNPROCESSABLE_ENTITY'
			)
		}

		const ext = ALLOWED_MIME_EXTENSIONS[file.type]
		if (!ext) {
			throw new AppError(
				'Logo must be a JPEG, PNG, or WebP image',
				'UNPROCESSABLE_ENTITY'
			)
		}

		const buffer = new Uint8Array(await file.arrayBuffer())
		const key = `logos/${organizationId}/${nanoid()}.${ext}`
		const logoUrl = await storageClient.upload(key, buffer, file.type)

		await BarbershopService.ensureSettingsRow(organizationId)
		await db
			.update(barbershopSettings)
			.set({ logoUrl })
			.where(eq(barbershopSettings.organizationId, organizationId))

		return { logoUrl }
	}

	static async leaveBarbershop(
		userId: string,
		orgId: string
	): Promise<BarbershopModel.LeaveOrgResponse> {
		const memberRow = await db.query.member.findFirst({
			where: and(
				eq(member.userId, userId),
				eq(member.organizationId, orgId)
			)
		})

		if (!memberRow) {
			throw new AppError('Not a member of this organization', 'NOT_FOUND')
		}

		if (memberRow.role === 'owner') {
			const ownerCountResult = await db
				.select({ count: count() })
				.from(member)
				.where(
					and(
						eq(member.organizationId, orgId),
						eq(member.role, 'owner')
					)
				)

			const ownerCount = ownerCountResult[0]?.count ?? 0

			if (ownerCount <= 1) {
				throw new AppError(
					'Cannot leave: you are the sole owner. Transfer ownership or archive the barbershop first.',
					'BAD_REQUEST'
				)
			}
		}

		await db.delete(member).where(eq(member.id, memberRow.id))

		return { message: 'You have left the organization' }
	}
}
