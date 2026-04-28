import { SignJWT, jwtVerify } from 'jose'
import { and, count, eq, gt, isNull } from 'drizzle-orm'
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

const ACTIVE_PIN_LIMIT = 10
const PIN_EXPIRY_MS = 30 * 60 * 1000

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
		const now = new Date()

		const [activeRow] = await db
			.select({ value: count() })
			.from(walkInPin)
			.where(
				and(
					eq(walkInPin.organizationId, organizationId),
					eq(walkInPin.isUsed, false),
					gt(walkInPin.expiresAt, now)
				)
			)

		const activeCount = Number(activeRow?.value ?? 0)

		if (activeCount >= ACTIVE_PIN_LIMIT) {
			throw new AppError(
				'Active PIN limit reached (10). Wait for existing PINs to expire or be used.',
				'TOO_MANY_REQUESTS'
			)
		}

		const rawValue = crypto.getRandomValues(new Uint16Array(1))[0]
		const pin = String(rawValue % 10000).padStart(4, '0')
		const pinHash = await Bun.password.hash(pin, {
			algorithm: 'bcrypt',
			cost: 10
		})
		const expiresAt = new Date(Date.now() + PIN_EXPIRY_MS)

		await db.insert(walkInPin).values({
			id: nanoid(),
			organizationId,
			generatedByUserId: userId,
			pinHash,
			isUsed: false,
			expiresAt,
			createdAt: now
		})

		return { pin, expiresAt, activeCount: activeCount + 1 }
	}

	static async getActivePinCount(
		organizationId: string
	): Promise<WalkInPinModel.ActiveCountResponse> {
		const now = new Date()

		const [row] = await db
			.select({ value: count() })
			.from(walkInPin)
			.where(
				and(
					eq(walkInPin.organizationId, organizationId),
					eq(walkInPin.isUsed, false),
					gt(walkInPin.expiresAt, now)
				)
			)

		return { activeCount: Number(row?.value ?? 0), limit: ACTIVE_PIN_LIMIT }
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

		const now = new Date()

		const activePins = await db.query.walkInPin.findMany({
			where: and(
				eq(walkInPin.organizationId, organizationId),
				eq(walkInPin.isUsed, false),
				gt(walkInPin.expiresAt, now)
			)
		})

		let matchedRow: (typeof activePins)[0] | null = null

		for (const row of activePins) {
			const isMatch = await Bun.password.verify(pin, row.pinHash)
			if (isMatch) {
				matchedRow = row
				break
			}
		}

		if (!matchedRow) {
			ipFailureGuard.recordFailure(ip)
			throw new AppError('Invalid or expired PIN', 'BAD_REQUEST')
		}

		await db
			.update(walkInPin)
			.set({ isUsed: true, usedAt: new Date() })
			.where(
				and(
					eq(walkInPin.id, matchedRow.id),
					eq(walkInPin.isUsed, false)
				)
			)

		const key = getHmacKey()
		const validationToken = await new SignJWT({ org: organizationId })
			.setProtectedHeader({ alg: 'HS256' })
			.setSubject(matchedRow.id)
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

		let pinId: string
		let tokenOrgId: string

		try {
			const { payload } = await jwtVerify(token, key)
			pinId = payload.sub as string
			tokenOrgId = payload.org as string
		} catch {
			throw new AppError('Unauthorized', 'UNAUTHORIZED')
		}

		if (tokenOrgId !== organizationId) {
			throw new AppError('Unauthorized', 'UNAUTHORIZED')
		}

		const pinRecord = await db.query.walkInPin.findFirst({
			where: eq(walkInPin.id, pinId)
		})

		if (
			!pinRecord ||
			!pinRecord.isUsed ||
			pinRecord.tokenConsumedAt !== null
		) {
			throw new AppError('Unauthorized', 'UNAUTHORIZED')
		}

		let booking: BookingModel.BookingDetailResponse | undefined

		await db.transaction(async (tx) => {
			booking = await BookingService.createBooking(
				organizationId,
				pinRecord.generatedByUserId,
				{
					type: 'walk_in',
					customerName: input.customerName,
					customerPhone: input.customerPhone,
					customerEmail: input.customerEmail,
					serviceIds: input.serviceIds,
					barberId: input.barberId,
					notes: input.notes
				}
			)

			await tx
				.update(walkInPin)
				.set({ tokenConsumedAt: new Date() })
				.where(
					and(
						eq(walkInPin.id, pinRecord.id),
						isNull(walkInPin.tokenConsumedAt)
					)
				)
		})

		return booking!
	}
}
