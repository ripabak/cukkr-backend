import { describe, expect, it } from 'bun:test'

import {
	clearOtpForTesting,
	generateNumericOtp,
	getLatestOtpForTesting,
	hashOtp,
	rememberOtpForTesting,
	verifyOtp
} from '../../src/utils/otp'

describe('OTP Helper', () => {
	it('generates a numeric OTP with the requested length', () => {
		const otp = generateNumericOtp()

		expect(otp).toHaveLength(6)
		expect(otp).toMatch(/^\d{6}$/)
	})

	it('hashes and verifies OTP values', async () => {
		const otp = generateNumericOtp()
		const hashedOtp = await hashOtp(otp)

		expect(await verifyOtp(otp, hashedOtp)).toBe(true)
		expect(await verifyOtp('000000', hashedOtp)).toBe(false)
	})

	it('stores OTPs for test-only retrieval', () => {
		const identifier = `otp-test:${Date.now()}`
		const otp = generateNumericOtp()

		clearOtpForTesting(identifier)
		rememberOtpForTesting(identifier, otp)

		expect(getLatestOtpForTesting(identifier)).toBe(otp)

		clearOtpForTesting(identifier)
		expect(getLatestOtpForTesting(identifier)).toBeNull()
	})
})
