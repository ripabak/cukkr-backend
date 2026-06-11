import { t } from 'elysia'

export namespace UserProfileModel {
	export const UpdateProfileInput = t.Object(
		{
			name: t.Optional(t.String({ minLength: 1, maxLength: 100 })),
			bio: t.Optional(t.Nullable(t.String({ maxLength: 300 })))
		},
		{ additionalProperties: false }
	)
	export type UpdateProfileInput = typeof UpdateProfileInput.static

	export const AvatarUploadInput = t.Object({
		file: t.File()
	})
	export type AvatarUploadInput = typeof AvatarUploadInput.static

	export const UserProfileResponse = t.Object({
		id: t.String(),
		name: t.String(),
		bio: t.Nullable(t.String()),
		avatarUrl: t.Nullable(t.String()),
		email: t.String(),
		emailVerified: t.Boolean(),
		role: t.Nullable(t.String()),
		createdAt: t.Date(),
		updatedAt: t.Date()
	})
	export type UserProfileResponse = typeof UserProfileResponse.static

	export const AvatarUploadResponse = t.Object({
		avatarUrl: t.String()
	})
	export type AvatarUploadResponse = typeof AvatarUploadResponse.static
}
