import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { emailOTP, openAPI, organization } from 'better-auth/plugins'
import { db } from './database'
import * as schema from '../../drizzle/schemas'
import { env } from './env'
import { sendOtpEmail } from './mail'

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
		requireEmailVerification: false,
		minPasswordLength: 8
	},
	plugins: [
		openAPI(),
		emailOTP({
			otpLength: 4,
			expiresIn: 300,
			allowedAttempts: 5,
			sendVerificationOnSignUp: true,
			async sendVerificationOTP({ email, otp, type }) {
				await sendOtpEmail({ to: email, otp, purpose: type })
			}
		}),
		organization()
	],
	trustedOrigins: env.CORS_ORIGIN,

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
