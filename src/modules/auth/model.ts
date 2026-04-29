import { t, Static } from 'elysia'

const PhoneSendOtpBody = t.Object({
	step: t.Union([t.Literal('old'), t.Literal('new')]),
	phone: t.Optional(t.String({ pattern: '^\\+[1-9]\\d{1,14}$' }))
})

const PhoneVerifyOtpBody = t.Object({
	step: t.Union([t.Literal('old'), t.Literal('new')]),
	otp: t.String({ minLength: 4, maxLength: 4, pattern: '^\\d{4}$' })
})

export namespace AuthModel {
	export type PhoneSendOtpBody = Static<typeof PhoneSendOtpBody>
	export type PhoneVerifyOtpBody = Static<typeof PhoneVerifyOtpBody>

	export const Schemas = {
		PhoneSendOtpBody,
		PhoneVerifyOtpBody
	}
}
