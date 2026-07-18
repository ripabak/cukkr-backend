import { and, eq } from 'drizzle-orm'

import { AppError } from '../../core/error'
import { db } from '../../lib/database'
import { sendAppointmentVerificationEmail } from '../../lib/mail'
import { member, organization } from '../auth/schema'
import { BookingService } from '../bookings/service'
import { booking, customer } from '../bookings/schema'
import type { BookingModel } from '../bookings/model'
import { NotificationService } from '../notifications/service'
import { service } from '../services/schema'
import { WalkInPinService } from '../walk-in-pin/service'
import type { WalkInPinModel } from '../walk-in-pin/model'
import type { PublicBookingModel } from './model'
import { env } from '../../lib/env'

type MemberWithUser = typeof member.$inferSelect & {
	user: typeof import('../auth/schema').user.$inferSelect
}

async function resolveOrgBySlug(slug: string): Promise<{ id: string }> {
	const rows = await db
		.select({ id: organization.id })
		.from(organization)
		.where(eq(organization.slug, slug))
		.limit(1)

	const org = rows[0]
	if (!org) throw new AppError('Barbershop not found', 'NOT_FOUND')
	return org
}

export abstract class PublicBookingService {
	static async getFormData(
		slug: string
	): Promise<PublicBookingModel.FormDataResponse> {
		const org = await resolveOrgBySlug(slug)

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
					eq(member.role, 'member')
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

	static async validatePin(
		slug: string,
		pin: string,
		ip: string
	): Promise<WalkInPinModel.ValidatePinResponse> {
		const orgId = await WalkInPinService.resolveOrganizationBySlug(slug)
		return WalkInPinService.validatePin(orgId, pin, ip)
	}

	static async createWalkIn(
		slug: string,
		validationToken: string,
		input: Omit<WalkInPinModel.WalkInBookingBody, 'validationToken'>
	): Promise<BookingModel.BookingDetailResponse> {
		const orgId = await WalkInPinService.resolveOrganizationBySlug(slug)
		return WalkInPinService.createWalkInBooking(
			orgId,
			validationToken,
			input
		)
	}

	static async createAppointment(
		slug: string,
		input: PublicBookingModel.AppointmentCreateInput
	): Promise<{
		appointment: PublicBookingModel.AppointmentCreatedResponse
	}> {
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

		const detail = await BookingService.createAppointmentRequest(
			org.id,
			ownerMember.userId,
			{ type: 'appointment', ...input }
		)

		const token = await BookingService.getBookingVerificationToken(
			detail.id
		)

		const orgInfo = await db.query.organization.findFirst({
			where: eq(organization.id, org.id),
			columns: { name: true }
		})

		if (token && input.customerEmail) {
			const verifyUrl = `${env.WEB_URL}/${slug}/booking/appointment/verify?token=${token}`
			await sendAppointmentVerificationEmail({
				to: input.customerEmail,
				customerName: input.customerName,
				barbershopName: orgInfo?.name ?? 'the barbershop',
				verifyUrl
			}).catch((err) => {
				console.error(
					'Failed to send appointment verification email:',
					err
				)
			})
		}

		return {
			appointment: {
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

	static async verifyAppointment(token: string): Promise<{
		verified: boolean
		bookingId: string | null
		status: 'verified' | 'already_verified' | 'invalid'
	}> {
		const result = await BookingService.verifyAppointmentEmail(token)

		if (result.status === 'verified' && result.bookingId) {
			const bookingRow = await db.query.booking.findFirst({
				where: eq(booking.id, result.bookingId),
				columns: { organizationId: true }
			})

			if (bookingRow) {
				const detail = await BookingService.getBooking(
					bookingRow.organizationId,
					result.bookingId
				).catch(() => null)

				if (detail) {
					await NotificationService.createBookingNotifications(
						detail
					).catch(console.error)
				}
			}
		}

		return result
	}

	static async verifyIdentity(token: string): Promise<{
		verified: boolean
		bookingId: null
		status: 'verified' | 'already_verified' | 'invalid'
	}> {
		const custRow = await db.query.customer.findFirst({
			where: eq(customer.emailVerificationToken, token)
		})

		if (!custRow) {
			return { verified: false, bookingId: null, status: 'invalid' }
		}

		if (custRow.emailVerified) {
			return {
				verified: true,
				bookingId: null,
				status: 'already_verified'
			}
		}

		const now = new Date()
		await db
			.update(customer)
			.set({
				emailVerified: true,
				emailVerifiedAt: now,
				emailVerificationToken: null,
				updatedAt: now
			})
			.where(eq(customer.id, custRow.id))

		return { verified: true, bookingId: null, status: 'verified' }
	}

	static async getOrgIdBySlug(slug: string): Promise<string> {
		const org = await resolveOrgBySlug(slug)
		return org.id
	}
}
