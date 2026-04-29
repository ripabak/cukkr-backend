import { and, eq } from 'drizzle-orm'

import { AppError } from '../../core/error'
import { db } from '../../lib/database'
import { member, organization, user } from '../auth/schema'
import { barbershopSettings } from '../barbershop/schema'
import { BookingService } from '../bookings/service'
import { OpenHoursService } from '../open-hours/service'
import { service } from '../services/schema'
import type { PublicModel } from './model'

type MemberWithUser = typeof member.$inferSelect & {
	user: typeof user.$inferSelect
}

const WIB_OFFSET_MS = 7 * 60 * 60 * 1000

async function resolveOrgBySlug(slug: string) {
	const orgRows = await db
		.select({ id: organization.id })
		.from(organization)
		.where(eq(organization.slug, slug))
		.limit(1)

	const org = orgRows[0]
	if (!org) {
		throw new AppError('Barbershop not found', 'NOT_FOUND')
	}
	return org
}

export abstract class PublicService {
	static async getWalkInFormData(
		slug: string
	): Promise<PublicModel.WalkInFormDataResponse> {
		const orgRows = await db
			.select({ id: organization.id })
			.from(organization)
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

	static async getAvailability(
		slug: string,
		date: string
	): Promise<PublicModel.PublicAvailabilityResponse> {
		const org = await resolveOrgBySlug(slug)

		const parsedDate = new Date(`${date}T00:00:00.000Z`)
		if (Number.isNaN(parsedDate.getTime())) {
			throw new AppError('Invalid date format', 'BAD_REQUEST')
		}

		const schedule =
			await OpenHoursService.getWeeklyScheduleForOrganization(org.id)

		const dayOfWeek = new Date(
			parsedDate.getTime() + WIB_OFFSET_MS
		).getUTCDay()

		const daySchedule = schedule[dayOfWeek]

		return {
			date,
			isOpen: daySchedule?.isOpen ?? false,
			openTime: daySchedule?.openTime ?? null,
			closeTime: daySchedule?.closeTime ?? null
		}
	}

	static async createPublicAppointment(
		slug: string,
		input: PublicModel.PublicAppointmentCreateInput
	): Promise<PublicModel.PublicAppointmentCreatedResponse> {
		const org = await resolveOrgBySlug(slug)

		const ownerMember = await db.query.member.findFirst({
			where: and(
				eq(member.organizationId, org.id),
				eq(member.role, 'owner')
			)
		})

		if (!ownerMember) {
			throw new AppError(
				'Barbershop has no owner configured',
				'BAD_REQUEST'
			)
		}

		const detail = await BookingService.createBooking(
			org.id,
			ownerMember.userId,
			{ type: 'appointment', ...input }
		)

		return {
			id: detail.id,
			referenceNumber: detail.referenceNumber,
			type: 'appointment',
			status: 'requested',
			scheduledAt: detail.scheduledAt!,
			customerName: detail.customer.name,
			serviceNames: detail.services.map((s) => s.serviceName),
			requestedBarber: detail.requestedBarber
				? {
						memberId: detail.requestedBarber.memberId,
						name: detail.requestedBarber.name
					}
				: null
		}
	}
}
