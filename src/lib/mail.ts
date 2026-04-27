import nodemailer from 'nodemailer'
import { env } from './env'

interface SendEmailPayload {
	to: string
	subject: string
	text?: string
	html?: string
}

let transporter: nodemailer.Transporter | null = null

function getTransporter() {
	if (!transporter) {
		const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_SECURE } = env

		if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
			throw new Error(
				'SMTP configuration is incomplete. Please set SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASS.'
			)
		}

		transporter = nodemailer.createTransport({
			service: 'gmail',
			host: SMTP_HOST,
			port: Number(SMTP_PORT),
			secure: SMTP_SECURE === true,
			auth: {
				user: SMTP_USER,
				pass: SMTP_PASS
			}
		})
	}

	return transporter
}

const TRANSIENT_SMTP_ERRORS = new Set([
	'ECONNRESET',
	'ETIMEDOUT',
	'ECONNREFUSED',
	'ESOCKET'
])

function isTransientSmtpError(err: unknown): boolean {
	return (
		err !== null &&
		typeof err === 'object' &&
		'code' in err &&
		typeof (err as { code: unknown }).code === 'string' &&
		TRANSIENT_SMTP_ERRORS.has((err as { code: string }).code)
	)
}

export async function sendEmail({ to, subject, text, html }: SendEmailPayload) {
	if (!to) {
		throw new Error('Destination email address (to) is required')
	}

	if (env.NODE_ENV === 'test') {
		return
	}

	const transporterInstance = getTransporter()
	const from = env.SMTP_FROM ?? env.SMTP_USER

	if (!from) {
		throw new Error(
			'SMTP_FROM or SMTP_USER must be configured to send emails'
		)
	}

	const payload = { from, to, subject, text, html }
	const maxAttempts = 3

	for (let attempt = 0; attempt < maxAttempts; attempt++) {
		try {
			await transporterInstance.sendMail(payload)
			return
		} catch (err) {
			if (isTransientSmtpError(err) && attempt < maxAttempts - 1) {
				await new Promise((resolve) =>
					setTimeout(resolve, Math.pow(2, attempt) * 500)
				)
			} else {
				throw err
			}
		}
	}
}

export async function sendOtpEmail({
	to,
	otp,
	purpose
}: {
	to: string
	otp: string
	purpose: string
}) {
	await sendEmail({
		to,
		subject: `${purpose} verification code`,
		text: `Your verification code is ${otp}. This code will expire shortly.`
	})
}

export async function verifySmtp() {
	if (env.NODE_ENV === 'test') {
		return true
	}

	try {
		const transporterInstance = getTransporter()
		await transporterInstance.verify()
		return true
	} catch (error) {
		console.error('[SMTP Error] Failed to verify connection:', error)
		throw error
	}
}
