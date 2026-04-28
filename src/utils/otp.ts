import { env } from '../lib/env'

const otpStoreForTesting = new Map<string, string>()

export function generateNumericOtp(length = 6): string {
	const digits = Array.from(crypto.getRandomValues(new Uint32Array(length)))
		.map((value) => (value % 10).toString())
		.join('')

	return digits.padStart(length, '0').slice(0, length)
}

export async function hashOtp(otp: string): Promise<string> {
	return Bun.password.hash(otp)
}

export async function verifyOtp(
	otp: string,
	hashedOtp: string
): Promise<boolean> {
	return Bun.password.verify(otp, hashedOtp)
}

export function rememberOtpForTesting(identifier: string, otp: string): void {
	if (env.NODE_ENV === 'test') {
		otpStoreForTesting.set(identifier, otp)
	}
}

export function getLatestOtpForTesting(identifier: string): string | null {
	return otpStoreForTesting.get(identifier) ?? null
}

export function clearOtpForTesting(identifier?: string): void {
	if (identifier) {
		otpStoreForTesting.delete(identifier)
		return
	}

	otpStoreForTesting.clear()
}
