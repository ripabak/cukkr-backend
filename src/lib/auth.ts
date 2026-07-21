import { betterAuth, APIError } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { emailOTP, openAPI, organization } from 'better-auth/plugins'
import { db } from './database'
import * as schema from '../../drizzle/schemas'
import { and, eq } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { env } from './env'
import { sendOtpEmail, sendEmail, sendOrganizationInvitation } from './mail'
import { t, type Language } from './i18n'
import { expo } from '@better-auth/expo'
import { BarbershopService } from '../modules/barbershop/service'
import { validateEmail } from '../utils/email-validation'

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
		// turn on this can make test fail
		requireEmailVerification: env.NODE_ENV !== 'test',
		minPasswordLength: 8
	},
	emailVerification: {
		autoSignInAfterVerification: true
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
					await sendOtpEmail({
						to: email,
						otp,
						purpose: type,
						language: 'id'
					})
				} catch (err) {
					if (env.NODE_ENV !== 'test') throw err
				}
			}
		}),
		organization({
			organizationHooks: {
				beforeCreateOrganization: async ({ organization: orgData }) => {
					const slug = await BarbershopService.generateUniqueSlug(
						orgData.name ?? ''
					)
					return { data: { slug } }
				},
				beforeCreateInvitation: async ({ invitation }) => {
					const result = await validateEmail(invitation.email)
					if (!result.valid) {
						throw new APIError('BAD_REQUEST', {
							message: result.reason!
						})
					}
				}
			},
			allowUserToCreateOrganization: async (user) => {
				if (env.NODE_ENV !== 'production') return true
				const orgCount = await db.$count(
					schema.member,
					and(
						eq(schema.member.userId, user.id),
						eq(schema.member.role, 'owner')
					)
				)
				return orgCount < 2
			},
			requireEmailVerificationOnInvitation: env.NODE_ENV !== 'test',
			async sendInvitationEmail(data) {
				const inviteLink = `${env.CLIENT_URL}/d/accept-invitation?id=${data.id}`

				// Get invitee language if they already have an account
				let inviteeLanguage: Language = 'id'
				try {
					const inviteeUser = await db.query.user.findFirst({
						where: eq(schema.user.email, data.email.toLowerCase()),
						columns: { language: true }
					})
					if (inviteeUser?.language) {
						inviteeLanguage = inviteeUser.language as Language
					}
				} catch {
					// ignore
				}

				try {
					await sendOrganizationInvitation({
						to: data.email,
						inviterName: data.inviter.user.name,
						organizationName: data.organization.name,
						inviteUrl: inviteLink,
						language: inviteeLanguage
					})
				} catch (err) {
					console.error(
						'[Auth] Failed to send invitation email to',
						data.email,
						err
					)
				}

				// Create in-app notification if the invitee already has an account
				try {
					const inviteeUser = await db.query.user.findFirst({
						where: eq(schema.user.email, data.email.toLowerCase())
					})
					if (inviteeUser) {
						await db.insert(schema.notification).values({
							id: nanoid(),
							organizationId: data.organization.id,
							recipientUserId: inviteeUser.id,
							type: 'barbershop_invitation',
							title: t(
								inviteeLanguage,
								'notification.barbershopInvitation.title',
								{
									organizationName: data.organization.name
								}
							),
							body: t(
								inviteeLanguage,
								'notification.barbershopInvitation.body',
								{
									inviterName: data.inviter.user.name,
									organizationName: data.organization.name
								}
							),
							referenceId: data.id,
							referenceType: 'invitation'
						})
					}
				} catch (err) {
					console.error(
						'[Auth] Failed to create barbershop_invitation notification',
						err
					)
				}
			}
		}),
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
		enabled: env.NODE_ENV === 'production',
		window: 60,
		max: 200
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
			},
			language: {
				type: 'string',
				required: false,
				defaultValue: 'id'
			},
			imageThumb: {
				type: 'string',
				required: false
			},
			imageMed: {
				type: 'string',
				required: false
			},
			imageFull: {
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
