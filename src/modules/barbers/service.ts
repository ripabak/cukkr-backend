import { and, eq } from 'drizzle-orm'
import { nanoid } from 'nanoid'

import { db } from '../../lib/database'
import { invitation, member } from '../auth/schema'
import { BarberModel } from './model'
import { AppError } from '../../core/error'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export abstract class BarberService {
	static async inviteBarber(
		organizationId: string,
		userId: string,
		email: string
	): Promise<BarberModel.BarberInviteResponse> {
		const memberRow = await db.query.member.findFirst({
			where: and(
				eq(member.userId, userId),
				eq(member.organizationId, organizationId)
			)
		})
		if (!memberRow || memberRow.role !== 'owner') {
			throw new AppError('Forbidden', 'FORBIDDEN')
		}

		if (!EMAIL_REGEX.test(email)) {
			throw new AppError('Invalid email format', 'BAD_REQUEST')
		}

		const existing = await db.query.invitation.findFirst({
			where: and(
				eq(invitation.organizationId, organizationId),
				eq(invitation.email, email),
				eq(invitation.status, 'pending')
			)
		})
		if (existing) {
			throw new AppError(
				'Invitation already pending for this email',
				'CONFLICT'
			)
		}

		const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

		const [created] = await db
			.insert(invitation)
			.values({
				id: nanoid(),
				organizationId,
				email,
				role: 'barber',
				status: 'pending',
				expiresAt,
				inviterId: userId
			})
			.returning()

		return {
			id: created.id,
			email: created.email,
			role: created.role ?? 'barber',
			status: created.status,
			expiresAt: created.expiresAt
		}
	}
}
