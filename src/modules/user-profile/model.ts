import { t } from 'elysia'

const PHONE_PATTERN = '^(?:\\+[1-9]\\d{1,14}|0\\d{8,14})$'

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

	export const ChangePhoneInput = t.Object(
		{
			phone: t.String({ pattern: PHONE_PATTERN })
		},
		{ additionalProperties: false }
	)
	export type ChangePhoneInput = typeof ChangePhoneInput.static

	export const VerifyPhoneInput = t.Object(
		{
			phone: t.String({ pattern: PHONE_PATTERN }),
			otp: t.String({ minLength: 6, maxLength: 6, pattern: '^\\d{6}$' })
		},
		{ additionalProperties: false }
	)
	export type VerifyPhoneInput = typeof VerifyPhoneInput.static

	export const UserProfileResponse = t.Object({
		id: t.String(),
		name: t.String(),
		bio: t.Nullable(t.String()),
		avatarUrl: t.Nullable(t.String()),
		email: t.String(),
		phone: t.Nullable(t.String()),
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

	export const ChangePhoneResponse = t.Object({
		message: t.String()
	})
	export type ChangePhoneResponse = typeof ChangePhoneResponse.static
}
