import { eq, and, gt } from 'drizzle-orm'
import { nanoid } from 'nanoid'

import { db } from '../../lib/database'
import { user, verification } from './schema'
import { AppError } from '../../core/error'
import { sendOtpEmail } from '../../lib/mail'

function generateOtp(): string {
	const array = new Uint32Array(1)
	crypto.getRandomValues(array)
	return (array[0] % 10000).toString().padStart(4, '0')
}

export abstract class AuthService {
	static async sendPhoneOtp(
		userId: string,
		userEmail: string,
		step: 'old' | 'new',
		newPhone?: string
	): Promise<void> {
		if (step === 'new') {
			if (!newPhone) {
				throw new AppError(
					'Phone number is required for step "new"',
					'BAD_REQUEST'
				)
			}

			const existing = await db.query.user.findFirst({
				where: eq(user.phone, newPhone)
			})

			if (existing) {
				throw new AppError('Phone number already in use', 'CONFLICT')
			}
		}

		const otp = generateOtp()
		const hashedOtp = await Bun.password.hash(otp)
		const identifier = `phone-change-${step}:${userId}`
		const expiresAt = new Date(Date.now() + 5 * 60 * 1000)

		const value =
			step === 'new' && newPhone
				? JSON.stringify({ hash: hashedOtp, phone: newPhone })
				: hashedOtp

		await db
			.delete(verification)
			.where(eq(verification.identifier, identifier))

		await db.insert(verification).values({
			id: nanoid(),
			identifier,
			value,
			expiresAt
		})

		await sendOtpEmail({ to: userEmail, otp, purpose: 'phone-change' })
	}

	static async verifyPhoneOtp(
		userId: string,
		step: 'old' | 'new',
		otp: string
	): Promise<{ phoneUpdated: boolean }> {
		const identifier = `phone-change-${step}:${userId}`

		const record = await db.query.verification.findFirst({
			where: eq(verification.identifier, identifier)
		})

		if (!record) {
			throw new AppError('Invalid or expired OTP', 'BAD_REQUEST')
		}

		if (record.expiresAt < new Date()) {
			await db.delete(verification).where(eq(verification.id, record.id))
			throw new AppError('OTP has expired', 'BAD_REQUEST')
		}

		let hashToVerify: string
		let storedPhone: string | undefined

		if (step === 'new') {
			const parsed = JSON.parse(record.value) as {
				hash: string
				phone: string
			}
			hashToVerify = parsed.hash
			storedPhone = parsed.phone
		} else {
			hashToVerify = record.value
		}

		const valid = await Bun.password.verify(otp, hashToVerify)

		if (!valid) {
			throw new AppError('Invalid OTP', 'BAD_REQUEST')
		}

		await db.delete(verification).where(eq(verification.id, record.id))

		if (step === 'old') {
			const verifiedIdentifier = `phone-change-old-verified:${userId}`
			const expiresAt = new Date(Date.now() + 10 * 60 * 1000)

			await db
				.delete(verification)
				.where(eq(verification.identifier, verifiedIdentifier))

			await db.insert(verification).values({
				id: nanoid(),
				identifier: verifiedIdentifier,
				value: 'verified',
				expiresAt
			})

			return { phoneUpdated: false }
		}

		const oldVerifiedIdentifier = `phone-change-old-verified:${userId}`
		const oldVerified = await db.query.verification.findFirst({
			where: and(
				eq(verification.identifier, oldVerifiedIdentifier),
				gt(verification.expiresAt, new Date())
			)
		})

		if (!oldVerified) {
			throw new AppError(
				'Old phone verification must be completed first',
				'BAD_REQUEST'
			)
		}

		if (!storedPhone) {
			throw new AppError(
				'Phone number not found in OTP record',
				'BAD_REQUEST'
			)
		}

		const phoneConflict = await db.query.user.findFirst({
			where: eq(user.phone, storedPhone)
		})

		if (phoneConflict) {
			throw new AppError('Phone number already in use', 'CONFLICT')
		}

		await db
			.update(user)
			.set({ phone: storedPhone })
			.where(eq(user.id, userId))

		await db
			.delete(verification)
			.where(eq(verification.identifier, oldVerifiedIdentifier))

		return { phoneUpdated: true }
	}
}
