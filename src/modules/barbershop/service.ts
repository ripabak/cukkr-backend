import { and, eq, ne } from 'drizzle-orm'
import { nanoid } from 'nanoid'

import { db } from '../../lib/database'
import { organization, member } from '../auth/schema'
import { barbershopSettings } from './schema'
import { BarbershopModel } from './model'
import { AppError } from '../../core/error'

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
			if (slug.length < 3 || slug.length > 60 || !SLUG_REGEX.test(slug)) {
				throw new AppError('Invalid slug format', 'BAD_REQUEST')
			}

			const taken = await db
				.select({ id: organization.id })
				.from(organization)
				.where(
					and(
						eq(organization.slug, slug),
						ne(organization.id, organizationId)
					)
				)
				.limit(1)

			if (taken[0]) {
				throw new AppError('Slug is already taken', 'CONFLICT')
			}
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
}
