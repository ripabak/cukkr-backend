import { and, eq } from 'drizzle-orm'

import { AppError } from '../../core/error'
import { db } from '../../lib/database'
import { member, organization, user } from '../auth/schema'
import { barbershopSettings } from '../barbershop/schema'
import { service } from '../services/schema'
import type { PublicModel } from './model'

type MemberWithUser = typeof member.$inferSelect & {
	user: typeof user.$inferSelect
}

export abstract class PublicService {
	static async getPublicBarbershop(
		slug: string
	): Promise<PublicModel.PublicBarbershopResponse> {
		const orgRows = await db
			.select({
				id: organization.id,
				name: organization.name,
				slug: organization.slug,
				description: barbershopSettings.description,
				address: barbershopSettings.address,
				logoUrl: barbershopSettings.logoUrl
			})
			.from(organization)
			.leftJoin(
				barbershopSettings,
				eq(barbershopSettings.organizationId, organization.id)
			)
			.where(eq(organization.slug, slug))
			.limit(1)

		const org = orgRows[0]
		if (!org) {
			throw new AppError('Barbershop not found', 'NOT_FOUND')
		}

		const [services, members] = await Promise.all([
			db.query.service.findMany({
				where: and(
					eq(service.organizationId, org.id),
					eq(service.isActive, true)
				)
			}),
			db.query.member.findMany({
				where: and(
					eq(member.organizationId, org.id),
					eq(member.role, 'barber')
				),
				with: { user: true }
			})
		])

		return {
			id: org.id,
			name: org.name,
			slug: org.slug,
			description: org.description ?? null,
			address: org.address ?? null,
			logoUrl: org.logoUrl ?? null,
			services: services.map((s) => ({
				id: s.id,
				name: s.name,
				description: s.description ?? null,
				price: s.price,
				duration: s.duration,
				discount: s.discount,
				imageUrl: s.imageUrl ?? null,
				isDefault: s.isDefault
			})),
			barbers: (members as MemberWithUser[]).map((m) => ({
				id: m.id,
				name: m.user.name,
				avatarUrl: m.user.image ?? null
			}))
		}
	}
}
