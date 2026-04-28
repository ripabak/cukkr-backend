import { t, Static } from 'elysia'

const UpdateProfileBody = t.Object({
	name: t.Optional(t.String({ minLength: 1 })),
	bio: t.Optional(t.String({ maxLength: 500 })),
	avatar: t.Optional(t.String())
})

const PhoneSendOtpBody = t.Object({
	step: t.Union([t.Literal('old'), t.Literal('new')]),
	phone: t.Optional(t.String({ pattern: '^\\+[1-9]\\d{1,14}$' }))
})

const PhoneVerifyOtpBody = t.Object({
	step: t.Union([t.Literal('old'), t.Literal('new')]),
	otp: t.String({ minLength: 4, maxLength: 4, pattern: '^\\d{4}$' })
})

const UpdateProfileResponse = t.Object({
	id: t.String(),
	name: t.String(),
	bio: t.Union([t.String(), t.Null()]),
	image: t.Union([t.String(), t.Null()])
})

export namespace AuthModel {
	export type UpdateProfileBody = Static<typeof UpdateProfileBody>
	export type PhoneSendOtpBody = Static<typeof PhoneSendOtpBody>
	export type PhoneVerifyOtpBody = Static<typeof PhoneVerifyOtpBody>
	export type UpdateProfileResponse = Static<typeof UpdateProfileResponse>

	export const Schemas = {
		UpdateProfileBody,
		PhoneSendOtpBody,
		PhoneVerifyOtpBody,
		UpdateProfileResponse
	}
}
