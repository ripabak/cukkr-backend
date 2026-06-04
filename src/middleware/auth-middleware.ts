import { Elysia } from 'elysia'
import { and, eq, inArray } from 'drizzle-orm'
import { auth } from '../lib/auth'
import { AppError } from '../core/error'
import { db } from '../lib/database'
import { member } from '../modules/auth/schema'

export type OrgRole = 'owner' | 'admin' | 'member'

export const authMiddleware = new Elysia()
	.derive(async ({ request: { headers } }) => {
		const session = await auth.api.getSession({ headers })

		return {
			user: session?.user,
			session: session?.session
		}
	})
	.macro({
		requireAuth: {
			async resolve({ user }) {
				if (!user) throw new AppError('Unauthorized', 'UNAUTHORIZED')

				return { user }
			}
		},
		requireOrganization: {
			async resolve({ user, session }) {
				if (!user || !session) {
					throw new AppError('Unauthorized', 'UNAUTHORIZED')
				}

				if (!session.activeOrganizationId) {
					throw new AppError('Organization not selected', 'FORBIDDEN')
				}

				return { activeOrganizationId: session.activeOrganizationId }
			}
		},
		/**
		 * Kombinasi dari requireAuth + requireOrganization + pengecekan role.
		 * Gunakan sebagai pengganti requireAuth + requireOrganization pada endpoint
		 * yang membatasi akses berdasarkan role member dalam organisasi.
		 *
		 * @example
		 * // Hanya owner yang boleh akses
		 * { requireRoles: ['owner'] }
		 *
		 * // Owner atau admin boleh akses
		 * { requireRoles: ['owner', 'admin'] }
		 */
		requireRoles(roles: OrgRole[]) {
			return {
				async resolve({ user, session }) {
					if (!user)
						throw new AppError('Unauthorized', 'UNAUTHORIZED')

					if (!session?.activeOrganizationId) {
						throw new AppError(
							'Organization not selected',
							'FORBIDDEN'
						)
					}

					const activeOrganizationId = session.activeOrganizationId

					const memberRow = await db.query.member.findFirst({
						where: and(
							eq(member.userId, user.id),
							eq(member.organizationId, activeOrganizationId),
							inArray(member.role, roles)
						)
					})

					if (!memberRow) {
						throw new AppError(
							'You have no permission to perform this action',
							'FORBIDDEN'
						)
					}

					return { user, activeOrganizationId }
				}
			}
		}
	})

	.as('scoped')
