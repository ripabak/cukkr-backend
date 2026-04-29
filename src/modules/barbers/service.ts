import { and, count, desc, eq, gte, inArray } from 'drizzle-orm'
import { nanoid } from 'nanoid'

import { AppError } from '../../core/error'
import { db } from '../../lib/database'
import { invitation, member, user } from '../auth/schema'
import { booking } from '../bookings/schema'
import { NotificationService } from '../notifications/service'
import { BarberModel } from './model'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const INVITATION_DURATION_MS = 7 * 24 * 60 * 60 * 1000
const BARBER_ROLE = 'barber'
const OWNER_ROLE = 'owner'

type MemberWithUser = typeof member.$inferSelect & {
	user: typeof user.$inferSelect
}

export abstract class BarberService {
	private static async requireOwner(
		organizationId: string,
		userId: string
	): Promise<typeof member.$inferSelect> {
		const memberRow = await db.query.member.findFirst({
			where: and(
				eq(member.userId, userId),
				eq(member.organizationId, organizationId)
			)
		})
		if (!memberRow || memberRow.role !== OWNER_ROLE) {
			throw new AppError('Forbidden', 'FORBIDDEN')
		}

		return memberRow
	}

	private static normalizeEmail(email?: string | null): string | null {
		const normalized = email?.trim().toLowerCase() ?? ''
		return normalized || null
	}

	private static normalizePhone(phone?: string | null): string | null {
		if (!phone) return null

		const trimmed = phone.trim()
		if (!trimmed) return null

		if (trimmed.startsWith('+')) {
			const digits = trimmed.slice(1).replace(/\D/g, '')
			return digits ? `+${digits}` : null
		}

		const digits = trimmed.replace(/\D/g, '')
		if (!digits) return null
		if (digits.startsWith('0')) return `+62${digits.slice(1)}`
		if (digits.startsWith('62')) return `+${digits}`

		return `+${digits}`
	}

	private static async findUserByInviteTarget(args: {
		email: string | null
		phone: string | null
	}): Promise<typeof user.$inferSelect | null> {
		if (args.phone) {
			const phoneUser = await db.query.user.findFirst({
				where: eq(user.phone, args.phone)
			})
			if (!phoneUser) {
				throw new AppError(
					'Phone invitation requires an existing user with that phone number',
					'BAD_REQUEST'
				)
			}

			if (
				args.email &&
				phoneUser.email.toLowerCase() !== args.email.toLowerCase()
			) {
				throw new AppError(
					'Provided email does not match the user for that phone number',
					'BAD_REQUEST'
				)
			}

			return phoneUser
		}

		if (!args.email) return null

		return (
			(await db.query.user.findFirst({
				where: eq(user.email, args.email)
			})) ?? null
		)
	}

	private static async ensureNoPendingInvitation(
		organizationId: string,
		email: string
	): Promise<void> {
		const existing = await db.query.invitation.findFirst({
			where: and(
				eq(invitation.organizationId, organizationId),
				eq(invitation.email, email),
				eq(invitation.status, 'pending'),
				gte(invitation.expiresAt, new Date())
			)
		})
		if (existing) {
			throw new AppError(
				'Invitation already pending for this barber',
				'CONFLICT'
			)
		}
	}

	private static async ensureNotActiveMember(
		organizationId: string,
		targetUserId: string | null
	): Promise<void> {
		if (!targetUserId) return

		const existingMember = await db.query.member.findFirst({
			where: and(
				eq(member.organizationId, organizationId),
				eq(member.userId, targetUserId)
			)
		})
		if (existingMember) {
			throw new AppError(
				'User is already an active member of this organization',
				'CONFLICT'
			)
		}
	}

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

	static async bulkInviteBarbers(
		organizationId: string,
		userId: string,
		input: BarberModel.BulkInviteInput
	): Promise<BarberModel.BulkInviteResponse> {
		await BarberService.requireOwner(organizationId, userId)

		const normalized = input.targets.map((target) => ({
			email: BarberService.normalizeEmail(target.email),
			phone: BarberService.normalizePhone(target.phone)
		}))

		for (const target of normalized) {
			if (!target.email && !target.phone) {
				throw new AppError(
					'Each target must have an email or phone',
					'BAD_REQUEST'
				)
			}
		}

		const emailKeys = normalized
			.map((t) => t.email)
			.filter(Boolean) as string[]
		const uniqueEmails = new Set(emailKeys)
		if (uniqueEmails.size !== emailKeys.length) {
			throw new AppError(
				'Duplicate emails found in bulk invite targets',
				'BAD_REQUEST'
			)
		}

		const resolvedTargets = await Promise.all(
			normalized.map(async (target) => {
				const targetUser =
					await BarberService.findUserByInviteTarget(target)
				const invitationEmail =
					targetUser?.email.toLowerCase() ?? target.email ?? null

				if (!invitationEmail) {
					throw new AppError(
						'Email or phone is required for each target',
						'BAD_REQUEST'
					)
				}

				await BarberService.ensureNoPendingInvitation(
					organizationId,
					invitationEmail
				)
				await BarberService.ensureNotActiveMember(
					organizationId,
					targetUser?.id ?? null
				)

				return {
					targetUser,
					invitationEmail,
					normalizedPhone: target.phone
				}
			})
		)

		const expiresAt = new Date(Date.now() + INVITATION_DURATION_MS)

		const created = await db.transaction(async (tx) => {
			return tx
				.insert(invitation)
				.values(
					resolvedTargets.map((resolved) => ({
						id: nanoid(),
						organizationId,
						email: resolved.invitationEmail,
						role: BARBER_ROLE,
						status: 'pending' as const,
						expiresAt,
						inviterId: userId
					}))
				)
				.returning()
		})

		await Promise.allSettled(
			resolvedTargets
				.filter((resolved) => resolved.targetUser)
				.map((resolved, index) =>
					NotificationService.createNotificationsForRecipients({
						organizationId,
						recipientUserIds: [resolved.targetUser!.id],
						type: 'barbershop_invitation',
						title: 'New Barbershop Invitation',
						body: 'You have been invited to join a barbershop.',
						referenceId: created[index].id,
						referenceType: 'invitation'
					})
				)
		)

		const invitedResponses: BarberModel.BarberInviteResponse[] =
			created.map((row, index) => ({
				id: row.id,
				email: row.email,
				phone:
					resolvedTargets[index].targetUser?.phone ??
					resolvedTargets[index].normalizedPhone ??
					null,
				role: row.role ?? BARBER_ROLE,
				status: row.status,
				expiresAt: row.expiresAt,
				expired: false
			}))

		return { invited: invitedResponses, count: invitedResponses.length }
	}

	static async inviteBarber(
		organizationId: string,
		userId: string,
		input: BarberModel.BarberInviteInput
	): Promise<BarberModel.BarberInviteResponse> {
		await BarberService.requireOwner(organizationId, userId)

		const normalizedEmail = BarberService.normalizeEmail(input.email)
		const normalizedPhone = BarberService.normalizePhone(input.phone)

		if (!normalizedEmail && !normalizedPhone) {
			throw new AppError('Email or phone is required', 'BAD_REQUEST')
		}

		if (normalizedEmail && !EMAIL_REGEX.test(normalizedEmail)) {
			throw new AppError('Invalid email format', 'BAD_REQUEST')
		}

		const targetUser = await BarberService.findUserByInviteTarget({
			email: normalizedEmail,
			phone: normalizedPhone
		})

		const invitationEmail =
			targetUser?.email.toLowerCase() ?? normalizedEmail ?? null

		if (!invitationEmail) {
			throw new AppError('Email or phone is required', 'BAD_REQUEST')
		}

		await BarberService.ensureNoPendingInvitation(
			organizationId,
			invitationEmail
		)
		await BarberService.ensureNotActiveMember(
			organizationId,
			targetUser?.id ?? null
		)

		const expiresAt = new Date(Date.now() + INVITATION_DURATION_MS)

		const [created] = await db
			.insert(invitation)
			.values({
				id: nanoid(),
				organizationId,
				email: invitationEmail,
				role: BARBER_ROLE,
				status: 'pending',
				expiresAt,
				inviterId: userId
			})
			.returning()

		if (targetUser) {
			await NotificationService.createNotificationsForRecipients({
				organizationId,
				recipientUserIds: [targetUser.id],
				type: 'barbershop_invitation',
				title: 'New Barbershop Invitation',
				body: 'You have been invited to join a barbershop.',
				referenceId: created.id,
				referenceType: 'invitation'
			})
		}

		return {
			id: created.id,
			email: created.email,
			phone: targetUser?.phone ?? normalizedPhone ?? null,
			role: created.role ?? BARBER_ROLE,
			status: created.status,
			expiresAt: created.expiresAt,
			expired: false
		}
	}

	static async listBarbers(
		organizationId: string,
		search?: string
	): Promise<BarberModel.BarberListItem[]> {
		const activeMembers = await db.query.member.findMany({
			where: and(
				eq(member.organizationId, organizationId),
				eq(member.role, BARBER_ROLE)
			),
			with: {
				user: true
			}
		})

		const pendingInvitations = await db.query.invitation.findMany({
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

		const activeItems = activeMembers
			.map((row) => BarberService.toBarberListItem(row as MemberWithUser))
			.sort((left, right) => left.name.localeCompare(right.name))

		const pendingItems: BarberModel.BarberListItem[] =
			pendingInvitations.map((row) => {
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
			})

		if (search) {
			const lowerSearch = search.toLowerCase()
			const matchActive = activeItems.filter(
				(item) =>
					item.name.toLowerCase().includes(lowerSearch) ||
					item.email.toLowerCase().includes(lowerSearch)
			)
			const matchPending = pendingItems.filter(
				(item) =>
					item.name.toLowerCase().includes(lowerSearch) ||
					item.email.toLowerCase().includes(lowerSearch)
			)
			return [...matchActive, ...matchPending]
		}

		return [...activeItems, ...pendingItems]
	}

	static async cancelInvitation(
		organizationId: string,
		userId: string,
		invitationId: string
	): Promise<BarberModel.CancelInviteResponse> {
		await BarberService.requireOwner(organizationId, userId)

		const pendingInvitation = await db.query.invitation.findFirst({
			where: and(
				eq(invitation.id, invitationId),
				eq(invitation.organizationId, organizationId),
				eq(invitation.status, 'pending'),
				gte(invitation.expiresAt, new Date())
			)
		})
		if (!pendingInvitation) {
			throw new AppError('Invitation not found', 'NOT_FOUND')
		}

		await db
			.delete(invitation)
			.where(eq(invitation.id, pendingInvitation.id))

		return {
			message: 'Invitation cancelled'
		}
	}

	static async removeBarber(
		organizationId: string,
		userId: string,
		memberId: string
	): Promise<BarberModel.BarberRemoveResponse> {
		const callerMember = await BarberService.requireOwner(
			organizationId,
			userId
		)

		if (callerMember.id === memberId) {
			throw new AppError('Owner cannot remove themselves', 'FORBIDDEN')
		}

		const targetMember = await db.query.member.findFirst({
			where: and(
				eq(member.id, memberId),
				eq(member.organizationId, organizationId),
				eq(member.role, BARBER_ROLE)
			)
		})
		if (!targetMember) {
			throw new AppError('Barber not found', 'NOT_FOUND')
		}

		const [activeBookingCount] = await db
			.select({ count: count() })
			.from(booking)
			.where(
				and(
					eq(booking.organizationId, organizationId),
					eq(booking.barberId, memberId),
					inArray(booking.status, [
						'requested',
						'waiting',
						'in_progress'
					])
				)
			)

		if ((activeBookingCount?.count ?? 0) > 0) {
			throw new AppError(
				'Cannot remove barber with active bookings',
				'CONFLICT'
			)
		}

		await db.delete(member).where(eq(member.id, targetMember.id))

		return {
			message: 'Barber removed successfully'
		}
	}

	static async acceptInvitation(
		userId: string,
		invitationId: string
	): Promise<BarberModel.InvitationActionResponse> {
		const userRow = await db.query.user.findFirst({
			where: eq(user.id, userId)
		})
		if (!userRow) {
			throw new AppError('User not found', 'NOT_FOUND')
		}

		const invitationRow = await db.query.invitation.findFirst({
			where: eq(invitation.id, invitationId)
		})
		if (!invitationRow) {
			throw new AppError('Invitation not found', 'NOT_FOUND')
		}

		if (invitationRow.email.toLowerCase() !== userRow.email.toLowerCase()) {
			throw new AppError('Forbidden', 'FORBIDDEN')
		}

		if (invitationRow.status !== 'pending') {
			throw new AppError('Invitation is no longer pending', 'BAD_REQUEST')
		}

		if (invitationRow.expiresAt < new Date()) {
			throw new AppError('Invitation has expired', 'BAD_REQUEST')
		}

		const existingMember = await db.query.member.findFirst({
			where: and(
				eq(member.organizationId, invitationRow.organizationId),
				eq(member.userId, userId)
			)
		})

		await db.transaction(async (tx) => {
			await tx
				.update(invitation)
				.set({ status: 'accepted' })
				.where(eq(invitation.id, invitationId))

			if (!existingMember) {
				await tx.insert(member).values({
					id: nanoid(),
					organizationId: invitationRow.organizationId,
					userId,
					role: invitationRow.role ?? BARBER_ROLE,
					createdAt: new Date()
				})
			}
		})

		return { message: 'Invitation accepted' }
	}

	static async declineInvitation(
		userId: string,
		invitationId: string
	): Promise<BarberModel.InvitationActionResponse> {
		const userRow = await db.query.user.findFirst({
			where: eq(user.id, userId)
		})
		if (!userRow) {
			throw new AppError('User not found', 'NOT_FOUND')
		}

		const invitationRow = await db.query.invitation.findFirst({
			where: eq(invitation.id, invitationId)
		})
		if (!invitationRow) {
			throw new AppError('Invitation not found', 'NOT_FOUND')
		}

		if (invitationRow.email.toLowerCase() !== userRow.email.toLowerCase()) {
			throw new AppError('Forbidden', 'FORBIDDEN')
		}

		if (invitationRow.status !== 'pending') {
			throw new AppError('Invitation is no longer pending', 'BAD_REQUEST')
		}

		if (invitationRow.expiresAt < new Date()) {
			throw new AppError('Invitation has expired', 'BAD_REQUEST')
		}

		await db
			.update(invitation)
			.set({ status: 'rejected' })
			.where(eq(invitation.id, invitationId))

		return { message: 'Invitation declined' }
	}
}
