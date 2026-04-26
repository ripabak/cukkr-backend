import { Elysia } from 'elysia'

import { authMiddleware } from '../../middleware/auth-middleware'
import { AuthService } from './service'
import { AuthModel } from './model'
import {
	formatResponse,
	FormatResponseSchema
} from '../../core/format-response'
import { AppError } from '../../core/error'

const PHONE_OTP_RATE_LIMIT = 3
const PHONE_OTP_WINDOW_MS = 15 * 60 * 1000

const phoneOtpRateLimitMap = new Map<
	string,
	{ count: number; windowStart: number }
>()

function checkPhoneOtpRateLimit(userId: string): void {
	const now = Date.now()
	const entry = phoneOtpRateLimitMap.get(userId)

	if (!entry || now - entry.windowStart >= PHONE_OTP_WINDOW_MS) {
		phoneOtpRateLimitMap.set(userId, { count: 1, windowStart: now })
		return
	}

	if (entry.count >= PHONE_OTP_RATE_LIMIT) {
		throw new AppError(
			'Too many OTP requests. Please try again later.',
			'TOO_MANY_REQUESTS'
		)
	}

	entry.count += 1
}

export const authHandler = new Elysia({
	prefix: '/auth',
	tags: ['Auth']
})
	.use(authMiddleware)

	.patch(
		'/profile',
		async ({ body, path, user }) => {
			const data = await AuthService.updateProfile(user.id, body)
			return formatResponse({ path, data, message: 'Profile updated' })
		},
		{
			requireAuth: true,
			body: AuthModel.Schemas.UpdateProfileBody,
			response: FormatResponseSchema(
				AuthModel.Schemas.UpdateProfileResponse
			)
		}
	)

	.post(
		'/phone/send-otp',
		async ({ body, user }) => {
			checkPhoneOtpRateLimit(user.id)
			await AuthService.sendPhoneOtp(
				user.id,
				user.email,
				body.step,
				body.phone
			)
			return { success: true }
		},
		{
			requireAuth: true,
			body: AuthModel.Schemas.PhoneSendOtpBody
		}
	)

	.post(
		'/phone/verify-otp',
		async ({ body, user }) => {
			const result = await AuthService.verifyPhoneOtp(
				user.id,
				body.step,
				body.otp
			)
			return { success: true, phoneUpdated: result.phoneUpdated }
		},
		{
			requireAuth: true,
			body: AuthModel.Schemas.PhoneVerifyOtpBody
		}
	)
