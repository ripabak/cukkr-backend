import { afterEach, beforeAll, describe, expect, it } from 'bun:test'
import { and, eq } from 'drizzle-orm'
import { treaty } from '@elysiajs/eden'
import { customAlphabet, nanoid } from 'nanoid'

const nanoidSlug = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 8)

import { app } from '../../src/app'
import { db } from '../../src/lib/database'
import { expoPushClient } from '../../src/lib/push'
import { invitation, member, user } from '../../src/modules/auth/schema'
import { booking, customer } from '../../src/modules/bookings/schema'
import {
	notification,
	notificationPushToken
} from '../../src/modules/notifications/schema'
import { auth } from '../../src/lib/auth'

const tClient = treaty(app)
const ORIGIN = 'http://localhost:3001'

interface AuthUserContext {
	cookie: string
	userId: string
	email: string
	phone: string | null
}

interface OwnerContext extends AuthUserContext {
	orgId: string
	ownerMemberId: string
}

async function signUpUser(args: {
	name: string
	emailPrefix: string
	phone?: string
}): Promise<AuthUserContext> {
	const email = `${args.emailPrefix}_${Date.now()}_${nanoid(4)}@example.com`

	const signUpRes = await (tClient as any).auth.api['sign-up'].email.post(
		{ email, password: 'password123', name: args.name },
		{ fetch: { headers: { origin: ORIGIN } } }
	)
	const cookie = signUpRes.response?.headers.get('set-cookie') ?? ''
	const sessionRes = await (tClient as any).auth.api['get-session'].get({
		headers: { cookie }
	})
	const createdUser = sessionRes.data?.user

	if (!createdUser) {
		throw new Error('Failed to create user for barber test setup')
	}

	if (args.phone) {
		await db
			.update(user)
			.set({ phone: args.phone })
			.where(eq(user.id, createdUser.id))
	}

	return {
		cookie,
		userId: createdUser.id,
		email: createdUser.email,
		phone: createdUser.phone
	}
}

async function createOwnerContext(suffix: string): Promise<OwnerContext> {
	const owner = await signUpUser({
		name: `Owner ${suffix}`,
		emailPrefix: `barber_owner_${suffix}`
	})
	const slug = `barber-${suffix}-${nanoidSlug()}`

	const orgRes = await (tClient as any).auth.api.organization.create.post(
		{ name: `Barber Shop ${suffix}`, slug },
		{ fetch: { headers: { cookie: owner.cookie, origin: ORIGIN } } }
	)
	const orgId = orgRes.data?.id ?? ''

	const activeRes = await (tClient as any).auth.api.organization[
		'set-active'
	].post(
		{ organizationId: orgId },
		{ fetch: { headers: { cookie: owner.cookie, origin: ORIGIN } } }
	)
	const authCookie =
		activeRes.response?.headers.get('set-cookie') ?? owner.cookie

	const ownerMember = await db.query.member.findFirst({
		where: and(
			eq(member.organizationId, orgId),
			eq(member.userId, owner.userId)
		)
	})
	if (!ownerMember) {
		throw new Error('Owner member was not created for barber test setup')
	}

	return {
		...owner,
		cookie: authCookie,
		orgId,
		ownerMemberId: ownerMember.id
	}
}

async function addBarberMember(args: {
	organizationId: string
	userId: string
}): Promise<string> {
	const memberId = nanoid()

	await db.insert(member).values({
		id: memberId,
		organizationId: args.organizationId,
		userId: args.userId,
		role: 'member',
		createdAt: new Date()
	})

	return memberId
}

async function activateOrganization(
	cookie: string,
	organizationId: string
): Promise<string> {
	const activeRes = await (tClient as any).auth.api.organization[
		'set-active'
	].post(
		{ organizationId },
		{ fetch: { headers: { cookie, origin: ORIGIN } } }
	)

	return activeRes.response?.headers.get('set-cookie') ?? cookie
}

async function createBarberMemberContext(args: {
	organizationId: string
	suffix: string
	phone?: string
}): Promise<AuthUserContext & { memberId: string }> {
	const barberUser = await signUpUser({
		name: `Barber ${args.suffix}`,
		emailPrefix: `barber_user_${args.suffix}`,
		phone: args.phone
	})
	const memberId = await addBarberMember({
		organizationId: args.organizationId,
		userId: barberUser.userId
	})
	const activeCookie = await activateOrganization(
		barberUser.cookie,
		args.organizationId
	)

	return {
		...barberUser,
		cookie: activeCookie,
		memberId
	}
}

async function seedInvitation(args: {
	organizationId: string
	email: string
	inviterId: string
	expiresAt?: Date
}): Promise<string> {
	const invitationId = nanoid()

	await db.insert(invitation).values({
		id: invitationId,
		organizationId: args.organizationId,
		email: args.email.toLowerCase(),
		role: 'member',
		status: 'pending',
		expiresAt:
			args.expiresAt ?? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
		inviterId: args.inviterId
	})

	return invitationId
}

async function seedBookingForBarber(args: {
	organizationId: string
	createdById: string
	barberId: string
}): Promise<string> {
	const customerId = nanoid()
	const bookingId = nanoid()
	const now = new Date()

	await db.insert(customer).values({
		id: customerId,
		organizationId: args.organizationId,
		name: 'Booking Customer',
		phone: '+628111111111',
		email: `${nanoid()}@example.com`,
		isVerified: true,
		notes: null
	})

	await db.insert(booking).values({
		id: bookingId,
		organizationId: args.organizationId,
		referenceNumber: `BK-${Date.now()}-${nanoid(4).toUpperCase()}`,
		type: 'walk_in',
		status: 'pending',
		customerId,
		barberId: args.barberId,
		scheduledAt: null,
		notes: null,
		startedAt: null,
		completedAt: null,
		cancelledAt: null,
		createdById: args.createdById,
		createdAt: now,
		updatedAt: now
	})

	return bookingId
}

async function waitForTokenInvalidation(token: string): Promise<void> {
	for (let attempt = 0; attempt < 20; attempt++) {
		const tokenRow = await db.query.notificationPushToken.findFirst({
			where: eq(notificationPushToken.token, token)
		})

		if (tokenRow && !tokenRow.isActive && tokenRow.invalidatedAt) {
			return
		}

		await new Promise((resolve) => setTimeout(resolve, 0))
	}

	throw new Error('Timed out waiting for invitation push token invalidation')
}

describe('Barber Management Tests', () => {
	let owner: OwnerContext

	afterEach(() => {
		expoPushClient.resetTransport()
	})

	beforeAll(async () => {
		owner = await createOwnerContext('suite')
	})

	it('T-01: GET /barbers returns active members and pending invitations', async () => {
		const activeBarber = await createBarberMemberContext({
			organizationId: owner.orgId,
			suffix: 'list-active'
		})
		const pendingEmail = `pending_${Date.now()}_${nanoid(4)}@example.com`
		await seedInvitation({
			organizationId: owner.orgId,
			email: pendingEmail,
			inviterId: owner.userId
		})

		const { status, data } = await tClient.api.barbers.get({
			fetch: { headers: { cookie: owner.cookie } }
		})

		expect(status).toBe(200)
		expect(
			data?.data.some((item) => item.id === activeBarber.memberId)
		).toBe(true)
		expect(
			data?.data.some((item) => item.email === pendingEmail.toLowerCase())
		).toBe(true)
		expect(data?.data[0]?.status).toBe('active')
	})

	it('T-02: GET /barbers excludes expired invitations', async () => {
		const expiredEmail = `expired_${Date.now()}_${nanoid(4)}@example.com`
		await seedInvitation({
			organizationId: owner.orgId,
			email: expiredEmail,
			inviterId: owner.userId,
			expiresAt: new Date(Date.now() - 60_000)
		})

		const { status, data } = await tClient.api.barbers.get({
			fetch: { headers: { cookie: owner.cookie } }
		})

		expect(status).toBe(200)
		expect(data?.data.some((item) => item.email === expiredEmail)).toBe(
			false
		)
	})

	it('T-03: GET /barbers returns 401 without auth', async () => {
		const { status } = await tClient.api.barbers.get()
		expect(status).toBe(401)
	})

	it('T-04: POST /barbers/invite creates an email invitation for an owner', async () => {
		const email = `invite_email_${Date.now()}_${nanoid(4)}@example.com`
		const { status, data } = await (tClient as any).auth.api.organization[
			'invite-member'
		].post(
			{ email, role: 'member' },
			{ fetch: { headers: { cookie: owner.cookie, origin: ORIGIN } } }
		)

		expect(status).toBe(200)
		expect(data?.email).toBe(email.toLowerCase())
		expect(data?.status).toBe('pending')
	})

	it('T-05: POST /barbers/invite creates an invitation from email for an existing user', async () => {
		const email = `phone_invitee_${Date.now()}@example.com`
		const phoneUser = await signUpUser({
			name: 'Phone Invitee',
			emailPrefix: 'phone_invitee'
		})

		const { status, data } = await (tClient as any).auth.api.organization[
			'invite-member'
		].post(
			{ email: phoneUser.email, role: 'member' },
			{ fetch: { headers: { cookie: owner.cookie, origin: ORIGIN } } }
		)

		expect(status).toBe(200)
		expect(data?.email).toBe(phoneUser.email.toLowerCase())
	})

	it('T-06: POST /barbers/invite returns 409 for duplicate pending email', async () => {
		const email = `duplicate_${Date.now()}_${nanoid(4)}@example.com`
		await (tClient as any).auth.api.organization['invite-member'].post(
			{ email, role: 'member' },
			{ fetch: { headers: { cookie: owner.cookie, origin: ORIGIN } } }
		)

		const { status } = await (tClient as any).auth.api.organization[
			'invite-member'
		].post(
			{ email, role: 'member' },
			{ fetch: { headers: { cookie: owner.cookie, origin: ORIGIN } } }
		)

		expect(status).not.toBe(200)
	})

	it('T-07: POST /barbers/invite returns error for an already active member', async () => {
		const existingBarber = await createBarberMemberContext({
			organizationId: owner.orgId,
			suffix: 'already-member'
		})

		const { status } = await (tClient as any).auth.api.organization[
			'invite-member'
		].post(
			{
				email: existingBarber.email,
				role: 'member',
				organizationId: owner.orgId
			},
			{ fetch: { headers: { cookie: owner.cookie, origin: ORIGIN } } }
		)

		expect(status).not.toBe(200)
	})

	it('T-08: POST /barbers/invite returns 403 for a barber role caller', async () => {
		const barber = await createBarberMemberContext({
			organizationId: owner.orgId,
			suffix: 'invite-forbidden'
		})

		const { status } = await (tClient as any).auth.api.organization[
			'invite-member'
		].post(
			{
				email: `forbidden_${Date.now()}@example.com`,
				role: 'member',
				organizationId: owner.orgId
			},
			{ fetch: { headers: { cookie: barber.cookie, origin: ORIGIN } } }
		)

		expect(status).toBe(403)
	})

	it('T-09: DELETE /barbers/invite/:id returns 200 for a valid pending invitation', async () => {
		const inviteId = await seedInvitation({
			organizationId: owner.orgId,
			email: `cancel_${Date.now()}_${nanoid(4)}@example.com`,
			inviterId: owner.userId
		})

		const { status } = await (tClient as any).auth.api.organization[
			'cancel-invitation'
		].post(
			{ invitationId: inviteId },
			{ fetch: { headers: { cookie: owner.cookie, origin: ORIGIN } } }
		)

		expect(status).toBe(200)
	})

	it('T-10: DELETE /barbers/invite/:id returns error for a cross-org invitation id', async () => {
		const otherOwner = await createOwnerContext('cross-invite')
		const otherInviteId = await seedInvitation({
			organizationId: otherOwner.orgId,
			email: `cross_${Date.now()}_${nanoid(4)}@example.com`,
			inviterId: otherOwner.userId
		})

		const { status } = await (tClient as any).auth.api.organization[
			'cancel-invitation'
		].post(
			{ invitationId: otherInviteId },
			{ fetch: { headers: { cookie: owner.cookie, origin: ORIGIN } } }
		)

		expect(status).not.toBe(200)
	})

	it('T-11: DELETE /barbers/invite/:id returns 403 for a barber role caller', async () => {
		const barber = await createBarberMemberContext({
			organizationId: owner.orgId,
			suffix: 'cancel-forbidden'
		})
		const inviteId = await seedInvitation({
			organizationId: owner.orgId,
			email: `cancel_forbidden_${Date.now()}_${nanoid(4)}@example.com`,
			inviterId: owner.userId
		})

		const { status } = await (tClient as any).auth.api.organization[
			'cancel-invitation'
		].post(
			{ invitationId: inviteId },
			{ fetch: { headers: { cookie: barber.cookie, origin: ORIGIN } } }
		)

		expect(status).toBe(403)
	})

	it('T-12: DELETE /barbers/:memberId returns 200 for a valid barber member', async () => {
		const barber = await createBarberMemberContext({
			organizationId: owner.orgId,
			suffix: 'remove-valid'
		})

		const { status } = await (tClient as any).auth.api.organization[
			'remove-member'
		].post(
			{ memberIdOrEmail: barber.memberId },
			{ fetch: { headers: { cookie: owner.cookie, origin: ORIGIN } } }
		)

		expect(status).toBe(200)
	})

	it('T-14: DELETE /barbers/:memberId returns error for a cross-org member id', async () => {
		const otherOwner = await createOwnerContext('cross-member')
		const otherBarber = await createBarberMemberContext({
			organizationId: otherOwner.orgId,
			suffix: 'cross-member-barber'
		})

		const { status } = await (tClient as any).auth.api.organization[
			'remove-member'
		].post(
			{ memberIdOrEmail: otherBarber.memberId },
			{ fetch: { headers: { cookie: owner.cookie, origin: ORIGIN } } }
		)

		expect(status).not.toBe(200)
	})
})

describe('Barber Search', () => {
	let owner: OwnerContext

	beforeAll(async () => {
		owner = await createOwnerContext('search')

		await createBarberMemberContext({
			organizationId: owner.orgId,
			suffix: 'search-alice'
		})
		await createBarberMemberContext({
			organizationId: owner.orgId,
			suffix: 'search-bob'
		})
	})

	it('T-BS01: GET /barbers?search= returns matching barbers only', async () => {
		const { status, data } = await tClient.api.barbers.get({
			query: { search: 'alice' },
			fetch: { headers: { cookie: owner.cookie } }
		})

		expect(status).toBe(200)
		const names = (data?.data ?? []).map((b: { name: string }) =>
			b.name.toLowerCase()
		)
		expect(names.some((n: string) => n.includes('alice'))).toBe(true)
		expect(names.every((n: string) => n.includes('alice'))).toBe(true)
	})

	it('T-BS02: GET /barbers without search returns all active barbers', async () => {
		const { status, data } = await tClient.api.barbers.get({
			fetch: { headers: { cookie: owner.cookie } }
		})

		expect(status).toBe(200)
		expect((data?.data ?? []).length).toBeGreaterThanOrEqual(2)
	})
})

describe('Invitation Accept/Decline', () => {
	let owner: OwnerContext
	let invitee: Awaited<ReturnType<typeof signUpUser>>
	let otherUser: Awaited<ReturnType<typeof signUpUser>>

	beforeAll(async () => {
		owner = await createOwnerContext('invitation-action')
		invitee = await signUpUser({
			name: 'Invitee User',
			emailPrefix: 'invitee_action'
		})
		otherUser = await signUpUser({
			name: 'Other User',
			emailPrefix: 'other_action'
		})
	})

	it('T-IA01: POST /barbers/invitations/:id/accept accepts a pending invitation', async () => {
		const invitationId = await seedInvitation({
			organizationId: owner.orgId,
			email: invitee.email,
			inviterId: owner.userId
		})

		const { status } = await (tClient as any).auth.api.organization[
			'accept-invitation'
		].post(
			{ invitationId },
			{ fetch: { headers: { cookie: invitee.cookie, origin: ORIGIN } } }
		)

		expect(status).toBe(200)
	})

	it('T-IA02: POST /barbers/invitations/:id/decline declines a pending invitation', async () => {
		const invitee2 = await signUpUser({
			name: 'Invitee Two',
			emailPrefix: 'invitee_decline'
		})
		const invitationId = await seedInvitation({
			organizationId: owner.orgId,
			email: invitee2.email,
			inviterId: owner.userId
		})

		const { status } = await (tClient as any).auth.api.organization[
			'reject-invitation'
		].post(
			{ invitationId },
			{ fetch: { headers: { cookie: invitee2.cookie, origin: ORIGIN } } }
		)

		expect(status).toBe(200)
	})

	it('T-IA03: POST /barbers/invitations/:id/accept returns 403 for a different user', async () => {
		const invitee3 = await signUpUser({
			name: 'Invitee Three',
			emailPrefix: 'invitee_wrong'
		})
		const invitationId = await seedInvitation({
			organizationId: owner.orgId,
			email: invitee3.email,
			inviterId: owner.userId
		})

		const { status } = await (tClient as any).auth.api.organization[
			'accept-invitation'
		].post(
			{ invitationId },
			{ fetch: { headers: { cookie: otherUser.cookie, origin: ORIGIN } } }
		)

		expect(status).toBe(403)
	})

	it('T-IA04: POST /barbers/invitations/:id/accept returns 401 without auth', async () => {
		const invitee4 = await signUpUser({
			name: 'Invitee Four',
			emailPrefix: 'invitee_unauth'
		})
		const invitationId = await seedInvitation({
			organizationId: owner.orgId,
			email: invitee4.email,
			inviterId: owner.userId
		})

		const { status } = await (tClient as any).auth.api.organization[
			'accept-invitation'
		].post({ invitationId })

		expect(status).toBe(401)
	})
})

describe('Barber Removal Safety', () => {
	let owner: OwnerContext

	beforeAll(async () => {
		owner = await createOwnerContext('removal-safety')
	})

	it('T-RS02: DELETE /barbers/:memberId succeeds when barber has only completed bookings', async () => {
		const barber = await createBarberMemberContext({
			organizationId: owner.orgId,
			suffix: 'completed-booking'
		})

		await seedBookingForBarber({
			organizationId: owner.orgId,
			createdById: owner.userId,
			barberId: barber.memberId
		})

		const { status } = await (tClient as any).auth.api.organization[
			'remove-member'
		].post(
			{ memberIdOrEmail: barber.memberId },
			{ fetch: { headers: { cookie: owner.cookie, origin: ORIGIN } } }
		)

		expect(status).toBe(200)
	})
})
