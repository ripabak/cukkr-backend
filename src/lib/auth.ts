import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { emailOTP, openAPI, organization } from 'better-auth/plugins'
import { db } from './database'
import * as schema from '../../drizzle/schemas'
import { env } from './env'
import { sendOtpEmail, sendEmail } from './mail'
import { expo } from '@better-auth/expo'

export const auth = betterAuth({
	basePath: '/api',
	database: drizzleAdapter(db, {
		provider: 'pg',
		schema: {
			...schema
		}
	}),
	emailAndPassword: {
		enabled: true,
		requireEmailVerification: true,
		minPasswordLength: 8
	},
	plugins: [
		openAPI(),
		emailOTP({
			otpLength: 4,
			expiresIn: 300,
			allowedAttempts: 5,
			sendVerificationOnSignUp: false,
			async sendVerificationOTP({ email, otp, type }) {
				try {
					await sendOtpEmail({ to: email, otp, purpose: type })
				} catch (err) {
					if (env.NODE_ENV !== 'test') throw err
				}
			}
		}),
		organization(),
		expo()
	],
	trustedOrigins: [
		...env.CORS_ORIGIN,

		// Expo cukkr frontend
		'cukkrfrontend://',

		// Development mode - Expo's exp:// scheme with local IP ranges
		...(process.env.NODE_ENV === 'development'
			? [
					'exp://', // Trust all Expo URLs (prefix matching)
					'exp://**', // Trust all Expo URLs (wildcard matching)
					'exp://192.168.*.*:*/**' // Trust 192.168.x.x IP range with any port and path
				]
			: [])
	],
	rateLimit: {
		enabled: env.NODE_ENV !== 'test',
		window: 900,
		max: 10
	},

	user: {
		additionalFields: {
			phone: {
				type: 'string',
				required: false
			},
			bio: {
				type: 'string',
				required: false
			}
		},
		changeEmail: {
			enabled: true,
			updateEmailWithoutVerification: true,
			async sendChangeEmailConfirmation({
				newEmail,
				url
			}: {
				newEmail: string
				url: string
			}) {
				try {
					await sendEmail({
						to: newEmail,
						subject: 'Confirm your new email address',
						text: `Click the link to confirm your new email address: ${url}`
					})
				} catch (err) {
					if (env.NODE_ENV !== 'test') throw err
				}
			}
		}
	},

	advanced: {
		useSecureCookies: true,
		defaultCookieAttributes: {
			httpOnly: true,
			secure: true,
			sameSite: 'none'
		}
	}
})

let _schema: ReturnType<typeof auth.api.generateOpenAPISchema>
const getSchema = async () => (_schema ??= auth.api.generateOpenAPISchema())

export const OpenAPI = {
	getPaths: (prefix = '/auth/api') =>
		getSchema().then(({ paths }) => {
			const reference: typeof paths = Object.create(null)

			for (const path of Object.keys(paths)) {
				const key = prefix + path
				reference[key] = paths[path]

				for (const method of Object.keys(paths[path])) {
					const operation = (reference[key] as any)[method]

					operation.tags = ['Better Auth']
				}
			}

			return reference
		}) as Promise<any>,
	components: getSchema().then(({ components }) => components) as Promise<any>
} as const
