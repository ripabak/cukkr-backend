import { and, eq } from 'drizzle-orm'
import { nanoid } from 'nanoid'

import { AppError } from '../../core/error'
import { db } from '../../lib/database'
import { storageClient, extractStorageKey } from '../../lib/storage'
import { member, user } from '../auth/schema'
import { UserProfileModel } from './model'

const AVATAR_MAX_SIZE_BYTES = 5 * 1024 * 1024

const IMAGE_MIME_TYPES = {
	jpeg: 'image/jpeg',
	png: 'image/png',
	webp: 'image/webp'
} as const

type SupportedImageMimeType =
	(typeof IMAGE_MIME_TYPES)[keyof typeof IMAGE_MIME_TYPES]

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

export abstract class UserProfileService {
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

		const oldProfile = await this.getProfileRecord(userId)
		const oldImage = oldProfile.image ?? null

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

		if (oldImage) {
			const oldKey = extractStorageKey(oldImage)
			if (oldKey) {
				await storageClient.delete(oldKey)
			}
		}

		return {
			avatarUrl: updated.image ?? avatarUrl
		}
	}
}
