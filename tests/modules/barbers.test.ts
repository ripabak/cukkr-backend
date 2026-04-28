import { afterEach, beforeAll, describe, expect, it } from 'bun:test'
import { and, eq } from 'drizzle-orm'
import { treaty } from '@elysiajs/eden'
import { nanoid } from 'nanoid'

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
	const slug = `barber-${suffix}-${nanoid(6).toLowerCase()}`

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
