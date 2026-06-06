import dns from 'node:dns'

const EMAIL_REGEX =
	/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/

export interface EmailValidationResult {
	valid: boolean
	reason?: string
}

export async function validateEmail(
	email: string
): Promise<EmailValidationResult> {
	if (!EMAIL_REGEX.test(email)) {
		return { valid: false, reason: 'Invalid email format.' }
	}

	const domain = email.split('@')[1]?.toLowerCase()
	if (!domain) {
		return { valid: false, reason: 'Invalid email format.' }
	}

	try {
		const records = await dns.promises.resolveMx(domain)
		if (records.length === 0) {
			return {
				valid: false,
				reason: `The domain "${domain}" does not accept email.`
			}
		}
	} catch (err: unknown) {
		const code = (err as NodeJS.ErrnoException).code
		if (code === 'ENOTFOUND' || code === 'ENODATA') {
			return {
				valid: false,
				reason: `The domain "${domain}" does not exist or has no mail server.`
			}
		}
		console.warn('[Email Validation] DNS lookup failed for', domain, err)
	}

	return { valid: true }
}
