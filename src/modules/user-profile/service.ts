import { and, eq } from 'drizzle-orm'
import { nanoid } from 'nanoid'

import { AppError } from '../../core/error'
import { db } from '../../lib/database'
import { storageClient } from '../../lib/storage'
import {
	generateNumericOtp,
	hashOtp,
	rememberOtpForTesting,
	verifyOtp
} from '../../utils/otp'
import { sendOtpEmail } from '../../lib/mail'
import { member, user, verification } from '../auth/schema'
import { UserProfileModel } from './model'

const AVATAR_MAX_SIZE_BYTES = 5 * 1024 * 1024
const PHONE_CHANGE_OTP_TTL_MS = 5 * 60 * 1000
const PHONE_CHANGE_MAX_FAILED_ATTEMPTS = 5

const IMAGE_MIME_TYPES = {
	jpeg: 'image/jpeg',
	png: 'image/png',
	webp: 'image/webp'
} as const

type SupportedImageMimeType =
	(typeof IMAGE_MIME_TYPES)[keyof typeof IMAGE_MIME_TYPES]

interface PhoneChangeOtpPayload {
	hash: string
	attempts: number
	phone: string
}

function getAvatarExtension(mimeType: SupportedImageMimeType): string {
	switch (mimeType) {
		case IMAGE_MIME_TYPES.jpeg:
			return 'jpg'
		case IMAGE_MIME_TYPES.png:
			return 'png'
		case IMAGE_MIME_TYPES.webp:
			return 'webp'
	}
}

function detectImageMimeType(
	buffer: Uint8Array
): SupportedImageMimeType | null {
	if (
		buffer.length >= 3 &&
		buffer[0] === 0xff &&
		buffer[1] === 0xd8 &&
		buffer[2] === 0xff
	) {
		return IMAGE_MIME_TYPES.jpeg
	}

	if (
		buffer.length >= 8 &&
		buffer[0] === 0x89 &&
		buffer[1] === 0x50 &&
		buffer[2] === 0x4e &&
		buffer[3] === 0x47 &&
		buffer[4] === 0x0d &&
		buffer[5] === 0x0a &&
		buffer[6] === 0x1a &&
		buffer[7] === 0x0a
	) {
		return IMAGE_MIME_TYPES.png
	}

	if (
		buffer.length >= 12 &&
		buffer[0] === 0x52 &&
		buffer[1] === 0x49 &&
		buffer[2] === 0x46 &&
		buffer[3] === 0x46 &&
		buffer[8] === 0x57 &&
		buffer[9] === 0x45 &&
		buffer[10] === 0x42 &&
		buffer[11] === 0x50
	) {
		return IMAGE_MIME_TYPES.webp
	}

	return null
}

function toPhoneChangePayload(value: string): PhoneChangeOtpPayload {
	const parsed = JSON.parse(value) as Partial<PhoneChangeOtpPayload>

	if (
		typeof parsed.hash !== 'string' ||
		typeof parsed.phone !== 'string' ||
		typeof parsed.attempts !== 'number'
	) {
		throw new AppError('Invalid phone change state', 'INTERNAL_ERROR')
	}

	return parsed as PhoneChangeOtpPayload
}

export abstract class UserProfileService {
	static buildPhoneChangeIdentifier(userId: string, phone: string): string {
		return `phone_change:${userId}:${phone}`
	}

	private static async getUserRole(
		userId: string,
		activeOrganizationId?: string
	): Promise<string | null> {
		if (!activeOrganizationId) {
			return null
		}

		const membership = await db.query.member.findFirst({
			where: and(
				eq(member.userId, userId),
				eq(member.organizationId, activeOrganizationId)
			)
		})

		return membership?.role ?? null
	}

	private static async getProfileRecord(userId: string) {
		const row = await db.query.user.findFirst({
			where: eq(user.id, userId)
		})

		if (!row) {
			throw new AppError('User not found', 'NOT_FOUND')
		}

		return row
	}

	static async getProfile(
		userId: string,
		activeOrganizationId?: string
	): Promise<UserProfileModel.UserProfileResponse> {
		const [row, role] = await Promise.all([
			this.getProfileRecord(userId),
			this.getUserRole(userId, activeOrganizationId)
		])

		return {
			id: row.id,
			name: row.name,
			bio: row.bio ?? null,
			avatarUrl: row.image ?? null,
			email: row.email,
			phone: row.phone ?? null,
			emailVerified: row.emailVerified,
			role,
			createdAt: row.createdAt,
			updatedAt: row.updatedAt
		}
	}

	static async updateProfile(
		userId: string,
		input: UserProfileModel.UpdateProfileInput,
		activeOrganizationId?: string
	): Promise<UserProfileModel.UserProfileResponse> {
		const updateData: Partial<{
			name: string
			bio: string | null
		}> = {}

		if (input.name !== undefined) {
			updateData.name = input.name
		}

		if (input.bio !== undefined) {
			updateData.bio = input.bio
		}

		const [updated] = await db
			.update(user)
			.set(updateData)
			.where(eq(user.id, userId))
			.returning({ id: user.id })

		if (!updated) {
			throw new AppError('User not found', 'NOT_FOUND')
		}

		return this.getProfile(userId, activeOrganizationId)
	}

	static async uploadAvatar(
		userId: string,
		file: File,
		activeOrganizationId?: string
	): Promise<UserProfileModel.AvatarUploadResponse> {
		if (file.size > AVATAR_MAX_SIZE_BYTES) {
			throw new AppError(
				'Avatar file must be 5 MB or smaller',
				'UNPROCESSABLE_ENTITY'
			)
		}

		const buffer = new Uint8Array(await file.arrayBuffer())
		const detectedMimeType = detectImageMimeType(buffer)

		if (!detectedMimeType) {
			throw new AppError(
				'Avatar must be a JPEG, PNG, or WebP image',
				'UNPROCESSABLE_ENTITY'
			)
		}

		const extension = getAvatarExtension(detectedMimeType)
		const key = `avatars/${userId}/${nanoid()}.${extension}`
		const avatarUrl = await storageClient.upload(
			key,
			buffer,
			detectedMimeType
		)

		const [updated] = await db
			.update(user)
			.set({ image: avatarUrl })
			.where(eq(user.id, userId))
			.returning({ id: user.id, image: user.image })

		if (!updated) {
			throw new AppError('User not found', 'NOT_FOUND')
		}

		if (activeOrganizationId) {
			await this.getUserRole(userId, activeOrganizationId)
		}

		return {
			avatarUrl: updated.image ?? avatarUrl
		}
	}

	static async initiatePhoneChange(
		userId: string,
		newPhone: string
	): Promise<UserProfileModel.ChangePhoneResponse> {
		const [currentUser, phoneConflict] = await Promise.all([
			this.getProfileRecord(userId),
			db.query.user.findFirst({
				where: eq(user.phone, newPhone)
			})
		])

		if (phoneConflict && phoneConflict.id !== userId) {
			throw new AppError('Phone number already in use', 'CONFLICT')
		}

		const otp = generateNumericOtp()
		const identifier = this.buildPhoneChangeIdentifier(userId, newPhone)
		const payload = JSON.stringify({
			hash: await hashOtp(otp),
			attempts: 0,
			phone: newPhone
		} satisfies PhoneChangeOtpPayload)

		await db
			.delete(verification)
			.where(eq(verification.identifier, identifier))

		await db.insert(verification).values({
			id: nanoid(),
			identifier,
			value: payload,
			expiresAt: new Date(Date.now() + PHONE_CHANGE_OTP_TTL_MS)
		})

		rememberOtpForTesting(identifier, otp)
		await sendOtpEmail({
			to: currentUser.email,
			otp,
			purpose: 'phone-change'
		})

		return {
			message: 'OTP sent to verify your new phone number'
		}
	}

	static async verifyPhoneChange(
		userId: string,
		phone: string,
		otp: string,
		activeOrganizationId?: string
	): Promise<UserProfileModel.UserProfileResponse> {
		const identifier = this.buildPhoneChangeIdentifier(userId, phone)
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

		const payload = toPhoneChangePayload(record.value)

		if (payload.attempts >= PHONE_CHANGE_MAX_FAILED_ATTEMPTS) {
			await db.delete(verification).where(eq(verification.id, record.id))
			throw new AppError(
				'Too many invalid OTP attempts',
				'TOO_MANY_REQUESTS'
			)
		}

		const isValid = await verifyOtp(otp, payload.hash)

		if (!isValid) {
			await db
				.update(verification)
				.set({
					value: JSON.stringify({
						...payload,
						attempts: payload.attempts + 1
					} satisfies PhoneChangeOtpPayload)
				})
				.where(eq(verification.id, record.id))

			throw new AppError('Invalid OTP', 'BAD_REQUEST')
		}

		const phoneConflict = await db.query.user.findFirst({
			where: eq(user.phone, payload.phone)
		})

		if (phoneConflict && phoneConflict.id !== userId) {
			throw new AppError('Phone number already in use', 'CONFLICT')
		}

		await Promise.all([
			db
				.update(user)
				.set({ phone: payload.phone })
				.where(eq(user.id, userId)),
			db.delete(verification).where(eq(verification.id, record.id))
		])

		return this.getProfile(userId, activeOrganizationId)
	}
}
