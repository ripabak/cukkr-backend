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
		role: 'barber',
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
		role: 'barber',
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
		const { status, data } = await tClient.api.barbers.invite.post(
			{ email },
			{ fetch: { headers: { cookie: owner.cookie } } }
		)

		expect(status).toBe(201)
		expect(data?.data.email).toBe(email.toLowerCase())
		expect(data?.data.phone).toBeNull()
		expect(data?.data.status).toBe('pending')
	})

	it('T-05: POST /barbers/invite creates an invitation from phone for an existing user', async () => {
		const phone = `+62812${Date.now().toString().slice(-8)}`
		const phoneUser = await signUpUser({
			name: 'Phone Invitee',
			emailPrefix: 'phone_invitee',
			phone
		})

		const { status, data } = await tClient.api.barbers.invite.post(
			{ phone },
			{ fetch: { headers: { cookie: owner.cookie } } }
		)

		expect(status).toBe(201)
		expect(data?.data.email).toBe(phoneUser.email)
		expect(data?.data.phone).toBe(phone)
	})

	it('T-06: POST /barbers/invite returns 409 for duplicate pending email', async () => {
		const email = `duplicate_${Date.now()}_${nanoid(4)}@example.com`
		await tClient.api.barbers.invite.post(
			{ email },
			{ fetch: { headers: { cookie: owner.cookie } } }
		)

		const { status } = await tClient.api.barbers.invite.post(
			{ email },
			{ fetch: { headers: { cookie: owner.cookie } } }
		)

		expect(status).toBe(409)
	})

	it('T-07: POST /barbers/invite returns 409 for an already active member', async () => {
		const existingBarber = await createBarberMemberContext({
			organizationId: owner.orgId,
			suffix: 'already-member'
		})

		const { status } = await tClient.api.barbers.invite.post(
			{ email: existingBarber.email },
			{ fetch: { headers: { cookie: owner.cookie } } }
		)

		expect(status).toBe(409)
	})

	it('T-08: POST /barbers/invite returns 403 for a barber role caller', async () => {
		const barber = await createBarberMemberContext({
			organizationId: owner.orgId,
			suffix: 'invite-forbidden'
		})

		const { status } = await tClient.api.barbers.invite.post(
			{ email: `forbidden_${Date.now()}@example.com` },
			{ fetch: { headers: { cookie: barber.cookie } } }
		)

		expect(status).toBe(403)
	})

	it('T-09: DELETE /barbers/invite/:id returns 200 for a valid pending invitation', async () => {
		const inviteId = await seedInvitation({
			organizationId: owner.orgId,
			email: `cancel_${Date.now()}_${nanoid(4)}@example.com`,
			inviterId: owner.userId
		})

		const { status, data } = await (tClient as any).api.barbers
			.invite({
				invitationId: inviteId
			})
			.delete(undefined, {
				fetch: { headers: { cookie: owner.cookie } }
			})

		expect(status).toBe(200)
		expect(data?.data.message).toBe('Invitation cancelled')
	})

	it('T-10: DELETE /barbers/invite/:id returns 404 for a cross-org invitation id', async () => {
		const otherOwner = await createOwnerContext('cross-invite')
		const otherInviteId = await seedInvitation({
			organizationId: otherOwner.orgId,
			email: `cross_${Date.now()}_${nanoid(4)}@example.com`,
			inviterId: otherOwner.userId
		})

		const { status } = await (tClient as any).api.barbers
			.invite({
				invitationId: otherInviteId
			})
			.delete(undefined, {
				fetch: { headers: { cookie: owner.cookie } }
			})

		expect(status).toBe(404)
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

		const { status } = await (tClient as any).api.barbers
			.invite({
				invitationId: inviteId
			})
			.delete(undefined, {
				fetch: { headers: { cookie: barber.cookie } }
			})

		expect(status).toBe(403)
	})

	it('T-12: DELETE /barbers/:memberId returns 200 for a valid barber member', async () => {
		const barber = await createBarberMemberContext({
			organizationId: owner.orgId,
			suffix: 'remove-valid'
		})

		const { status, data } = await (tClient as any).api
			.barbers({
				memberId: barber.memberId
			})
			.delete(undefined, {
				fetch: { headers: { cookie: owner.cookie } }
			})

		expect(status).toBe(200)
		expect(data?.data.message).toBe('Barber removed successfully')
	})

	it('T-13: DELETE /barbers/:memberId preserves booking history by nulling barberId', async () => {
		const barber = await createBarberMemberContext({
			organizationId: owner.orgId,
			suffix: 'remove-booking'
		})
		const bookingId = await seedBookingForBarber({
			organizationId: owner.orgId,
			createdById: owner.userId,
			barberId: barber.memberId
		})

		const { status } = await (tClient as any).api
			.barbers({
				memberId: barber.memberId
			})
			.delete(undefined, {
				fetch: { headers: { cookie: owner.cookie } }
			})
		const savedBooking = await db.query.booking.findFirst({
			where: eq(booking.id, bookingId)
		})

		expect(status).toBe(200)
		expect(savedBooking?.barberId).toBeNull()
	})

	it('T-14: DELETE /barbers/:memberId returns 404 for a cross-org member id', async () => {
		const otherOwner = await createOwnerContext('cross-member')
		const otherBarber = await createBarberMemberContext({
			organizationId: otherOwner.orgId,
			suffix: 'cross-member-barber'
		})

		const { status } = await (tClient as any).api
			.barbers({
				memberId: otherBarber.memberId
			})
			.delete(undefined, {
				fetch: { headers: { cookie: owner.cookie } }
			})

		expect(status).toBe(404)
	})

	it('T-15: DELETE /barbers/:memberId returns 403 when an owner removes themselves', async () => {
		const { status } = await (tClient as any).api
			.barbers({
				memberId: owner.ownerMemberId
			})
			.delete(undefined, {
				fetch: { headers: { cookie: owner.cookie } }
			})

		expect(status).toBe(403)
	})

	it('T-16: POST /barbers/invite creates an invitation notification for an existing user and preserves success when push fails', async () => {
		const targetUser = await signUpUser({
			name: 'Existing Invitee',
			emailPrefix: 'existing_invitee'
		})
		const failingToken = `ExpoPushToken[invite-fail-${Date.now()}]`

		await db.insert(notificationPushToken).values({
			id: nanoid(),
			userId: targetUser.userId,
			token: failingToken,
			isActive: true,
			lastRegisteredAt: new Date(),
			invalidatedAt: null,
			createdAt: new Date(),
			updatedAt: new Date()
		})

		expoPushClient.setTransport({
			async send(messages) {
				return messages.map(() => ({
					status: 'error' as const,
					message: 'Device not registered',
					details: { error: 'DeviceNotRegistered' }
				}))
			}
		})

		const { status, data } = await tClient.api.barbers.invite.post(
			{ email: targetUser.email },
			{ fetch: { headers: { cookie: owner.cookie } } }
		)
		const notificationRows = await db.query.notification.findMany({
			where: eq(notification.referenceId, data?.data.id ?? '')
		})

		await waitForTokenInvalidation(failingToken)

		const tokenRow = await db.query.notificationPushToken.findFirst({
			where: eq(notificationPushToken.token, failingToken)
		})

		expect(status).toBe(201)
		expect(data?.data.email).toBe(targetUser.email)
		expect(notificationRows).toHaveLength(1)
		expect(notificationRows[0]).toMatchObject({
			recipientUserId: targetUser.userId,
			type: 'barbershop_invitation',
			referenceType: 'invitation'
		})
		expect(tokenRow?.isActive).toBe(false)
		expect(tokenRow?.invalidatedAt).toBeTruthy()
	})

	it('T-17: POST /barbers/invite does not create a notification for an unknown user', async () => {
		const email = `unknown_invitee_${Date.now()}_${nanoid(4)}@example.com`

		const { status, data } = await tClient.api.barbers.invite.post(
			{ email },
			{ fetch: { headers: { cookie: owner.cookie } } }
		)
		const notificationRows = await db.query.notification.findMany({
			where: eq(notification.referenceId, data?.data.id ?? '')
		})

		expect(status).toBe(201)
		expect(data?.data.email).toBe(email.toLowerCase())
		expect(notificationRows).toHaveLength(0)
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

		const { status, data } = await (tClient as any).api.barbers
			.invitations({ invitationId })
			.accept.post(undefined, {
				fetch: { headers: { cookie: invitee.cookie } }
			})

		expect(status).toBe(200)
		expect(data?.data?.message).toBe('Invitation accepted')
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

		const { status, data } = await (tClient as any).api.barbers
			.invitations({ invitationId })
			.decline.post(undefined, {
				fetch: { headers: { cookie: invitee2.cookie } }
			})

		expect(status).toBe(200)
		expect(data?.data?.message).toBe('Invitation declined')
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

		const { status } = await (tClient as any).api.barbers
			.invitations({ invitationId })
			.accept.post(undefined, {
				fetch: { headers: { cookie: otherUser.cookie } }
			})

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

		const { status } = await (tClient as any).api.barbers
			.invitations({ invitationId })
			.accept.post(undefined)

		expect(status).toBe(401)
	})
})

describe('Barber Removal Safety', () => {
	let owner: OwnerContext

	beforeAll(async () => {
		owner = await createOwnerContext('removal-safety')
	})

	it('T-RS01: DELETE /barbers/:memberId returns 409 when barber has an active booking', async () => {
		const barber = await createBarberMemberContext({
			organizationId: owner.orgId,
			suffix: 'active-booking'
		})

		const customerId = nanoid()
		const bookingId = nanoid()
		const now = new Date()

		await db.insert(customer).values({
			id: customerId,
			organizationId: owner.orgId,
			name: 'Active Booking Customer',
			phone: '+628100000001',
			email: `${nanoid()}@example.com`,
			isVerified: true,
			notes: null
		})

		await db.insert(booking).values({
			id: bookingId,
			organizationId: owner.orgId,
			referenceNumber: `BK-ACTIVE-${nanoid(4)}`,
			type: 'walk_in',
			status: 'waiting',
			customerId,
			barberId: barber.memberId,
			scheduledAt: null,
			notes: null,
			startedAt: null,
			completedAt: null,
			cancelledAt: null,
			createdById: owner.userId,
			createdAt: now,
			updatedAt: now
		})

		const { status } = await (tClient as any).api
			.barbers({ memberId: barber.memberId })
			.delete(undefined, {
				fetch: { headers: { cookie: owner.cookie } }
			})

		expect(status).toBe(409)
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

		const { status } = await (tClient as any).api
			.barbers({ memberId: barber.memberId })
			.delete(undefined, {
				fetch: { headers: { cookie: owner.cookie } }
			})

		expect(status).toBe(200)
	})
})

describe('Bulk Barber Invite (F3)', () => {
	let bulkOwner: OwnerContext

	afterEach(() => {
		expoPushClient.resetTransport()
	})

	beforeAll(async () => {
		bulkOwner = await createOwnerContext('bulk-invite')
	})

	it('F3-01: POST /barbers/bulk-invite creates invitations for all valid targets', async () => {
		const email1 = `bulk1_${Date.now()}_${nanoid(4)}@example.com`
		const email2 = `bulk2_${Date.now()}_${nanoid(4)}@example.com`

		const { status, data } = await (tClient as any).api.barbers[
			'bulk-invite'
		].post(
			{ targets: [{ email: email1 }, { email: email2 }] },
			{ fetch: { headers: { cookie: bulkOwner.cookie } } }
		)

		expect(status).toBe(201)
		expect(data?.data.count).toBe(2)
		expect(data?.data.invited).toHaveLength(2)
		const emails = data?.data.invited.map((i: { email: string }) => i.email)
		expect(emails).toContain(email1.toLowerCase())
		expect(emails).toContain(email2.toLowerCase())
	})

	it('F3-02: POST /barbers/bulk-invite returns 400 for duplicate emails in payload', async () => {
		const email = `bulk_dup_${Date.now()}_${nanoid(4)}@example.com`

		const { status } = await (tClient as any).api.barbers[
			'bulk-invite'
		].post(
			{ targets: [{ email }, { email }] },
			{ fetch: { headers: { cookie: bulkOwner.cookie } } }
		)

		expect(status).toBe(400)
	})

	it('F3-03: POST /barbers/bulk-invite returns 400 when a target has neither email nor phone', async () => {
		const { status } = await (tClient as any).api.barbers[
			'bulk-invite'
		].post(
			{ targets: [{}] },
			{ fetch: { headers: { cookie: bulkOwner.cookie } } }
		)

		expect(status).toBe(400)
	})

	it('F3-04: POST /barbers/bulk-invite returns 409 and is all-or-nothing when any target conflicts', async () => {
		const existingEmail = `bulk_conflict_${Date.now()}_${nanoid(4)}@example.com`
		await seedInvitation({
			organizationId: bulkOwner.orgId,
			email: existingEmail,
			inviterId: bulkOwner.userId
		})

		const newEmail = `bulk_new_${Date.now()}_${nanoid(4)}@example.com`

		const { status } = await (tClient as any).api.barbers[
			'bulk-invite'
		].post(
			{ targets: [{ email: existingEmail }, { email: newEmail }] },
			{ fetch: { headers: { cookie: bulkOwner.cookie } } }
		)

		expect(status).toBe(409)

		const newInvitation = await db.query.invitation.findFirst({
			where: eq(invitation.email, newEmail.toLowerCase())
		})
		expect(newInvitation).toBeUndefined()
	})

	it('F3-05: POST /barbers/bulk-invite returns 403 for non-owner caller', async () => {
		const barber = await createBarberMemberContext({
			organizationId: bulkOwner.orgId,
			suffix: 'bulk-forbidden'
		})

		const { status } = await (tClient as any).api.barbers[
			'bulk-invite'
		].post(
			{ targets: [{ email: `bulk_f_${Date.now()}@example.com` }] },
			{ fetch: { headers: { cookie: barber.cookie } } }
		)

		expect(status).toBe(403)
	})
})
