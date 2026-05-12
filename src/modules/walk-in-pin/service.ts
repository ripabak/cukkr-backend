import { SignJWT, jwtVerify } from 'jose'
import { eq } from 'drizzle-orm'
import { nanoid } from 'nanoid'

import { AppError } from '../../core/error'
import { db } from '../../lib/database'
import { env } from '../../lib/env'
import { organization } from '../auth/schema'
import { BookingService } from '../bookings/service'
import { BookingModel } from '../bookings/model'
import { ipFailureGuard } from '../../utils/ip-failure-guard'
import { WalkInPinModel } from './model'
import { walkInPin } from './schema'

const consumedTokens = new Set<string>()

function getHmacKey(): Uint8Array {
	return new TextEncoder().encode(env.WALK_IN_TOKEN_SECRET)
}

export abstract class WalkInPinService {
	static async resolveOrganizationBySlug(slug: string): Promise<string> {
		const org = await db.query.organization.findFirst({
			where: eq(organization.slug, slug),
			columns: { id: true }
		})

		if (!org) {
			throw new AppError('Organization not found', 'NOT_FOUND')
		}

		return org.id
	}

	static async generatePin(
		organizationId: string,
		userId: string
	): Promise<WalkInPinModel.GeneratePinResponse> {
		const rawValue = crypto.getRandomValues(new Uint16Array(1))[0]
		const pin = String(rawValue % 10000).padStart(4, '0')

		await db
			.insert(walkInPin)
			.values({
				organizationId,
				pin,
				updatedByUserId: userId,
				updatedAt: new Date()
			})
			.onConflictDoUpdate({
				target: walkInPin.organizationId,
				set: { pin, updatedByUserId: userId, updatedAt: new Date() }
			})

		return { pin }
	}

	static async getCurrentPin(
		organizationId: string
	): Promise<WalkInPinModel.CurrentPinResponse> {
		const record = await db.query.walkInPin.findFirst({
			where: eq(walkInPin.organizationId, organizationId)
		})

		return { pin: record?.pin ?? null }
	}

	static async validatePin(
		organizationId: string,
		pin: string,
		ip: string
	): Promise<WalkInPinModel.ValidatePinResponse> {
		if (ipFailureGuard.isBlocked(ip)) {
			throw new AppError(
				'Too many failed attempts. Try again later.',
				'TOO_MANY_REQUESTS'
			)
		}

		const record = await db.query.walkInPin.findFirst({
			where: eq(walkInPin.organizationId, organizationId)
		})

		if (!record || record.pin !== pin) {
			ipFailureGuard.recordFailure(ip)
			throw new AppError('Invalid PIN', 'BAD_REQUEST')
		}

		const jti = nanoid()
		const key = getHmacKey()
		const validationToken = await new SignJWT({
			org: organizationId,
			uid: record.updatedByUserId
		})
			.setProtectedHeader({ alg: 'HS256' })
			.setJti(jti)
			.setIssuedAt()
			.setExpirationTime('15m')
			.sign(key)

		return { validationToken }
	}

	static async createWalkInBooking(
		organizationId: string,
		token: string,
		input: Omit<WalkInPinModel.WalkInBookingBody, 'validationToken'>
	): Promise<BookingModel.BookingDetailResponse> {
		const key = getHmacKey()

		let jti: string
		let tokenOrgId: string
		let userId: string

		try {
			const { payload } = await jwtVerify(token, key)
			jti = payload.jti as string
			tokenOrgId = payload.org as string
			userId = payload.uid as string
		} catch {
			throw new AppError('Unauthorized', 'UNAUTHORIZED')
		}

		if (tokenOrgId !== organizationId) {
			throw new AppError('Unauthorized', 'UNAUTHORIZED')
		}

		if (consumedTokens.has(jti)) {
			throw new AppError('Unauthorized', 'UNAUTHORIZED')
		}

		consumedTokens.add(jti)

		return BookingService.createBooking(organizationId, userId, {
			type: 'walk_in',
			customerName: input.customerName,
			customerPhone: input.customerPhone,
			customerEmail: input.customerEmail,
			serviceIds: input.serviceIds,
			barberId: input.barberId,
			notes: input.notes
		})
	}
}
