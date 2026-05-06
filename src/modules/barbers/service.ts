import { and, desc, eq, gte, inArray } from 'drizzle-orm'

import { db } from '../../lib/database'
import { invitation, member, user } from '../auth/schema'
import { BarberModel } from './model'

const BARBER_ROLE = 'member'

type MemberWithUser = typeof member.$inferSelect & {
	user: typeof user.$inferSelect
}

export abstract class BarberService {
	private static toBarberListItem(
		row: MemberWithUser
	): BarberModel.BarberListItem {
		return {
			id: row.id,
			userId: row.userId,
			name: row.user.name,
			email: row.user.email,
			phone: row.user.phone,
			avatarUrl: row.user.image,
			role: row.role,
			status: 'active',
			createdAt: row.createdAt
		}
	}

	static async listBarbers(
		organizationId: string,
		query: BarberModel.BarberListQuery
	): Promise<BarberModel.BarberListItem[]> {
		const { search, status } = query

		// Skip active members query when filtering for pending only
		const activeMembers =
			status === 'pending'
				? []
				: await db.query.member.findMany({
						where: and(
							eq(member.organizationId, organizationId),
							eq(member.role, BARBER_ROLE)
						),
						with: {
							user: true
						}
					})

		// Skip invitations query when filtering for active only
		const pendingInvitations =
			status === 'active'
				? []
				: await db.query.invitation.findMany({
						where: and(
							eq(invitation.organizationId, organizationId),
							eq(invitation.status, 'pending'),
							gte(invitation.expiresAt, new Date())
						),
						orderBy: desc(invitation.createdAt)
					})

		const invitationEmails = [
			...new Set(
				pendingInvitations.map((row) => row.email.trim().toLowerCase())
			)
		]
		const invitedUsers =
			invitationEmails.length > 0
				? await db.query.user.findMany({
						where: inArray(user.email, invitationEmails)
					})
				: []

		const invitedUserByEmail = new Map(
			invitedUsers.map((row) => [row.email.toLowerCase(), row])
		)

		let activeItems = activeMembers
			.map((row) => BarberService.toBarberListItem(row as MemberWithUser))
			.sort((left, right) => left.name.localeCompare(right.name))

		let pendingItems: BarberModel.BarberListItem[] = pendingInvitations.map(
			(row) => {
				const invitedUser =
					invitedUserByEmail.get(row.email.toLowerCase()) ?? null

				return {
					id: row.id,
					userId: invitedUser?.id ?? null,
					name: invitedUser?.name ?? row.email,
					email: row.email,
					phone: invitedUser?.phone ?? null,
					avatarUrl: invitedUser?.image ?? null,
					role: row.role ?? BARBER_ROLE,
					status: 'pending',
					createdAt: row.createdAt,
					expiresAt: row.expiresAt,
					expired: false
				}
			}
		)

		if (search) {
			const lowerSearch = search.toLowerCase()
			activeItems = activeItems.filter(
				(item) =>
					item.name.toLowerCase().includes(lowerSearch) ||
					item.email.toLowerCase().includes(lowerSearch)
			)
			pendingItems = pendingItems.filter(
				(item) =>
					item.name.toLowerCase().includes(lowerSearch) ||
					item.email.toLowerCase().includes(lowerSearch)
			)
		}

		return [...activeItems, ...pendingItems]
	}
}
