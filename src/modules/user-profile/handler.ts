import { Elysia } from 'elysia'

import {
	formatResponse,
	FormatResponseSchema
} from '../../core/format-response'
import { authMiddleware } from '../../middleware/auth-middleware'
import { UserProfileModel } from './model'
import { UserProfileService } from './service'

export const userProfileHandler = new Elysia({
	prefix: '/me',
	tags: ['User Profile']
})
	.use(authMiddleware)
	.get(
		'/',
		async ({ path, session, user }) => {
			const data = await UserProfileService.getProfile(
				user.id,
				session?.activeOrganizationId ?? undefined
			)

			return formatResponse({ path, data })
		},
		{
			requireAuth: true,
			response: FormatResponseSchema(UserProfileModel.UserProfileResponse)
		}
	)
	.patch(
		'/',
		async ({ body, path, session, user }) => {
			const data = await UserProfileService.updateProfile(
				user.id,
				body,
				session?.activeOrganizationId ?? undefined
			)

			return formatResponse({ path, data, message: 'Profile updated' })
		},
		{
			requireAuth: true,
			body: UserProfileModel.UpdateProfileInput,
			response: FormatResponseSchema(UserProfileModel.UserProfileResponse)
		}
	)
	.post(
		'/avatar',
		async ({ body, path, session, user }) => {
			const data = await UserProfileService.uploadAvatar(
				user.id,
				body.file,
				session?.activeOrganizationId ?? undefined
			)

			return formatResponse({ path, data, message: 'Avatar uploaded' })
		},
		{
			requireAuth: true,
			body: UserProfileModel.AvatarUploadInput,
			response: FormatResponseSchema(
				UserProfileModel.AvatarUploadResponse
			)
		}
	)
