import { beforeAll, describe, expect, it } from 'bun:test'
import { and, eq } from 'drizzle-orm'
import { treaty } from '@elysiajs/eden'
import { customAlphabet, nanoid } from 'nanoid'

const nanoidSlug = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 8)

import { app } from '../../src/app'
import { db } from '../../src/lib/database'
import { openHour } from '../../src/modules/open-hours/schema'
import { service } from '../../src/modules/services/schema'
import {
	notification,
	notificationPushToken
} from '../../src/modules/notifications/schema'

const tClient = treaty(app)
const ORIGIN = 'http://localhost:3001'

interface UserContext {
	cookie: string
	userId: string
	orgId: string
}

async function createUserWithOrg(suffix: string): Promise<UserContext> {
	const email = `notifications_${suffix}_${Date.now()}_${nanoid(4)}@example.com`

	const signUpRes = await (tClient as any).auth.api['sign-up'].email.post(
		{ email, password: 'password123', name: `Notifications ${suffix}` },
		{ fetch: { headers: { origin: ORIGIN } } }
	)
	const cookie = signUpRes.response?.headers.get('set-cookie') ?? ''
	const sessionRes = await (tClient as any).auth.api['get-session'].get({
		headers: { cookie }
	})
	const createdUser = sessionRes.data?.user

	if (!createdUser) {
		throw new Error('Failed to create notifications test user')
	}

	const orgRes = await (tClient as any).auth.api.organization.create.post(
		{
			name: `Notifications Org ${suffix}`,
			slug: `notifications-${suffix}-${nanoidSlug()}`
		},
		{ fetch: { headers: { cookie, origin: ORIGIN } } }
	)

	const orgId = orgRes.data?.id ?? ''
	const activeRes = await (tClient as any).auth.api.organization[
		'set-active'
	].post(
		{ organizationId: orgId },
		{ fetch: { headers: { cookie, origin: ORIGIN } } }
	)

	return {
		cookie: activeRes.response?.headers.get('set-cookie') ?? cookie,
		userId: createdUser.id,
		orgId
	}
}

async function seedNotification(args: {
	organizationId: string
	recipientUserId: string
	type?: 'appointment_requested' | 'walk_in_arrival' | 'barbershop_invitation'
	title?: string
	body?: string
	referenceId?: string | null
	referenceType?: 'booking' | 'invitation' | null
	isRead?: boolean
	createdAt: Date
}): Promise<string> {
	const id = nanoid()

	await db.insert(notification).values({
		id,
		organizationId: args.organizationId,
		recipientUserId: args.recipientUserId,
		type: args.type ?? 'appointment_requested',
		title: args.title ?? 'Seeded Notification',
		body: args.body ?? 'Seeded notification body',
		referenceId: args.referenceId ?? nanoid(),
		referenceType: args.referenceType ?? 'booking',
		isRead: args.isRead ?? false,
		createdAt: args.createdAt,
		updatedAt: args.createdAt
	})

	return id
}

async function requestJson(args: {
	path: string
	method?: 'GET' | 'POST' | 'PATCH'
	cookie?: string
	body?: unknown
}) {
	const response = await app.handle(
		new Request(`http://localhost${args.path}`, {
			method: args.method ?? 'GET',
			headers: {
				...(args.cookie ? { cookie: args.cookie } : {}),
				...(args.body ? { 'content-type': 'application/json' } : {})
			},
			body: args.body ? JSON.stringify(args.body) : undefined
		})
	)

	return {
		status: response.status,
		data: (await response.json()) as {
			data?: any
			meta?: {
				page: number
				limit: number
				totalItems: number
			}
		}
	}
}

async function signUpUserOnly(args: {
	name: string
	emailPrefix: string
}): Promise<{ cookie: string; userId: string; email: string }> {
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
		throw new Error('Failed to create user in signUpUserOnly')
	}

	return { cookie, userId: createdUser.id, email }
}

describe('Notification Action Mutations', () => {
	let ownerCtx: UserContext
	let barber1: { cookie: string; userId: string; email: string }
	let barber2: { cookie: string; userId: string; email: string }
	let barber1InviteNotifId = ''
	let barber2InviteNotifId = ''
	let appointmentAcceptNotifId = ''
	let appointmentDeclineNotifId = ''
	let walkInNotifId = ''

	beforeAll(async () => {
		ownerCtx = await createUserWithOrg('action-owner')
		barber1 = await signUpUserOnly({
			name: 'Action Barber One',
			emailPrefix: 'action_barber1'
		})
		barber2 = await signUpUserOnly({
			name: 'Action Barber Two',
			emailPrefix: 'action_barber2'
		})

		await db.insert(openHour).values(
			Array.from({ length: 7 }, (_, dayOfWeek) => ({
				id: nanoid(),
				organizationId: ownerCtx.orgId,
				dayOfWeek,
				isOpen: true,
				openTime: '08:00',
				closeTime: '20:00'
			}))
		)

		const svcId = nanoid()
		await db.insert(service).values({
			id: svcId,
			organizationId: ownerCtx.orgId,
			name: 'Action Service',
			description: null,
			price: 60000,
			duration: 30,
			discount: 0,
			isActive: true,
			isDefault: false
		})

		const invite1Res = await requestJson({
			path: '/api/barbers/invite',
			method: 'POST',
			cookie: ownerCtx.cookie,
			body: { email: barber1.email }
		})
		const invite1Id = invite1Res.data?.data?.id as string

		const invite2Res = await requestJson({
			path: '/api/barbers/invite',
			method: 'POST',
			cookie: ownerCtx.cookie,
			body: { email: barber2.email }
		})
		const invite2Id = invite2Res.data?.data?.id as string

		const n1 = await db.query.notification.findFirst({
			where: and(
				eq(notification.recipientUserId, barber1.userId),
				eq(notification.referenceId, invite1Id)
			)
		})
		barber1InviteNotifId = n1?.id ?? ''

		const n2 = await db.query.notification.findFirst({
			where: and(
				eq(notification.recipientUserId, barber2.userId),
				eq(notification.referenceId, invite2Id)
			)
		})
		barber2InviteNotifId = n2?.id ?? ''

		const WIB_OFFSET_MS = 7 * 60 * 60 * 1000
		const nowWib = new Date(new Date().getTime() + WIB_OFFSET_MS)
		const scheduledAt = new Date(
			Date.UTC(
				nowWib.getUTCFullYear(),
				nowWib.getUTCMonth(),
				nowWib.getUTCDate() + 2,
				11,
				0
			) - WIB_OFFSET_MS
		)
		const scheduledAtStr = scheduledAt.toISOString()

		const booking1Res = await requestJson({
			path: '/api/bookings',
			method: 'POST',
			cookie: ownerCtx.cookie,
			body: {
				type: 'appointment',
				customerName: 'Action Accept Customer',
				serviceIds: [svcId],
				scheduledAt: scheduledAtStr
			}
		})
		const booking1Id = booking1Res.data?.data?.id as string

		const booking2Res = await requestJson({
			path: '/api/bookings',
			method: 'POST',
			cookie: ownerCtx.cookie,
			body: {
				type: 'appointment',
				customerName: 'Action Decline Customer',
				serviceIds: [svcId],
				scheduledAt: scheduledAtStr
			}
		})
		const booking2Id = booking2Res.data?.data?.id as string

		const an1 = await db.query.notification.findFirst({
			where: and(
				eq(notification.recipientUserId, ownerCtx.userId),
				eq(notification.referenceId, booking1Id)
			)
		})
		appointmentAcceptNotifId = an1?.id ?? ''

		const an2 = await db.query.notification.findFirst({
			where: and(
				eq(notification.recipientUserId, ownerCtx.userId),
				eq(notification.referenceId, booking2Id)
			)
		})
		appointmentDeclineNotifId = an2?.id ?? ''

		const booking3Res = await requestJson({
			path: '/api/bookings',
			method: 'POST',
			cookie: ownerCtx.cookie,
			body: {
				type: 'walk_in',
				customerName: 'Walk In Action Customer',
				serviceIds: [svcId]
			}
		})
		const booking3Id = booking3Res.data?.data?.id as string

		const wn = await db.query.notification.findFirst({
			where: and(
				eq(notification.recipientUserId, ownerCtx.userId),
				eq(notification.referenceId, booking3Id)
			)
		})
		walkInNotifId = wn?.id ?? ''
	})

	it('actionType field is present in listed notifications', async () => {
		const response = await requestJson({
			path: '/api/notifications',
			cookie: ownerCtx.cookie
		})

		expect(response.status).toBe(200)
		const items = response.data.data as {
			type: string
			actionType: unknown
		}[]
		const appointmentItem = items.find(
			(n) => n.type === 'appointment_requested'
		)
		const walkInItem = items.find((n) => n.type === 'walk_in_arrival')
		expect(appointmentItem?.actionType).toBe('accept_decline_appointment')
		expect(walkInItem?.actionType).toBeNull()
	})

	it('POST /:id/actions/accept accepts a barbershop invitation', async () => {
		const response = await requestJson({
			path: `/api/notifications/${barber1InviteNotifId}/actions/accept`,
			method: 'POST',
			cookie: barber1.cookie
		})

		expect(response.status).toBe(200)
		expect(response.data.data?.action).toBe('accepted')
		expect(response.data.data?.referenceType).toBe('invitation')
	})

	it('POST /:id/actions/decline declines a barbershop invitation', async () => {
		const response = await requestJson({
			path: `/api/notifications/${barber2InviteNotifId}/actions/decline`,
			method: 'POST',
			cookie: barber2.cookie,
			body: {}
		})

		expect(response.status).toBe(200)
		expect(response.data.data?.action).toBe('declined')
		expect(response.data.data?.referenceType).toBe('invitation')
	})

	it('POST /:id/actions/accept accepts an appointment (booking → waiting)', async () => {
		const response = await requestJson({
			path: `/api/notifications/${appointmentAcceptNotifId}/actions/accept`,
			method: 'POST',
			cookie: ownerCtx.cookie
		})

		expect(response.status).toBe(200)
		expect(response.data.data?.action).toBe('accepted')
		expect(response.data.data?.referenceType).toBe('booking')

		const bookingId = response.data.data?.referenceId as string
		const bookingRes = await requestJson({
			path: `/api/bookings/${bookingId}`,
			cookie: ownerCtx.cookie
		})
		expect(bookingRes.data.data?.status).toBe('waiting')
	})

	it('POST /:id/actions/decline declines an appointment (booking → cancelled)', async () => {
		const response = await requestJson({
			path: `/api/notifications/${appointmentDeclineNotifId}/actions/decline`,
			method: 'POST',
			cookie: ownerCtx.cookie,
			body: { reason: 'Fully booked that day' }
		})

		expect(response.status).toBe(200)
		expect(response.data.data?.action).toBe('declined')
		expect(response.data.data?.referenceType).toBe('booking')

		const bookingId = response.data.data?.referenceId as string
		const bookingRes = await requestJson({
			path: `/api/bookings/${bookingId}`,
			cookie: ownerCtx.cookie
		})
		expect(bookingRes.data.data?.status).toBe('cancelled')
	})

	it('POST /:id/actions/decline returns 400 when declining appointment without reason', async () => {
		const response = await requestJson({
			path: `/api/notifications/${appointmentDeclineNotifId}/actions/decline`,
			method: 'POST',
			cookie: ownerCtx.cookie,
			body: {}
		})

		expect(response.status).toBe(400)
	})

	it('POST /:id/actions/accept returns 400 for walk_in_arrival type', async () => {
		const response = await requestJson({
			path: `/api/notifications/${walkInNotifId}/actions/accept`,
			method: 'POST',
			cookie: ownerCtx.cookie
		})

		expect(response.status).toBe(400)
	})

	it("returns 404 when acting on another user's notification", async () => {
		const response = await requestJson({
			path: `/api/notifications/${barber2InviteNotifId}/actions/accept`,
			method: 'POST',
			cookie: ownerCtx.cookie
		})

		expect(response.status).toBe(404)
	})

	it('returns 401 when not authenticated', async () => {
		const response = await requestJson({
			path: `/api/notifications/${appointmentAcceptNotifId}/actions/accept`,
			method: 'POST'
		})

		expect(response.status).toBe(401)
	})
})

describe('Notifications Module Tests', () => {
	let ownerA: UserContext
	let ownerB: UserContext
	let newestNotificationId = ''
	let unreadNotificationId = ''
	let readNotificationId = ''
	let foreignNotificationId = ''

	beforeAll(async () => {
		ownerA = await createUserWithOrg('owner-a')
		ownerB = await createUserWithOrg('owner-b')

		readNotificationId = await seedNotification({
			organizationId: ownerA.orgId,
			recipientUserId: ownerA.userId,
			title: 'Old Read Notification',
			isRead: true,
			createdAt: new Date('2026-04-28T08:00:00.000Z')
		})
		unreadNotificationId = await seedNotification({
			organizationId: ownerA.orgId,
			recipientUserId: ownerA.userId,
			title: 'Unread Notification',
			isRead: false,
			createdAt: new Date('2026-04-28T09:00:00.000Z')
		})
		newestNotificationId = await seedNotification({
			organizationId: ownerA.orgId,
			recipientUserId: ownerA.userId,
			type: 'walk_in_arrival',
			title: 'Newest Notification',
			isRead: false,
			createdAt: new Date('2026-04-28T10:00:00.000Z')
		})
		foreignNotificationId = await seedNotification({
			organizationId: ownerB.orgId,
			recipientUserId: ownerB.userId,
			type: 'barbershop_invitation',
			referenceType: 'invitation',
			title: 'Foreign Notification',
			createdAt: new Date('2026-04-28T11:00:00.000Z')
		})
	})

	it('returns 401 for GET /api/notifications without auth', async () => {
		const response = await requestJson({ path: '/api/notifications' })
		expect(response.status).toBe(401)
	})

	it('lists notifications newest first with pagination metadata', async () => {
		const response = await requestJson({
			path: '/api/notifications?page=1&pageSize=2',
			cookie: ownerA.cookie
		})

		expect(response.status).toBe(200)
		expect(
			response.data.data?.map((item: { id: string }) => item.id)
		).toEqual([newestNotificationId, unreadNotificationId])
		expect(response.data.meta).toMatchObject({
			page: 1,
			limit: 2,
			totalItems: 3
		})
		expect(
			response.data.data?.every(
				(item: { organizationId: string }) =>
					item.organizationId === ownerA.orgId
			)
		).toBe(true)
	})

	it('filters unread notifications and returns the unread count', async () => {
		const listResponse = await requestJson({
			path: '/api/notifications?unreadOnly=true',
			cookie: ownerA.cookie
		})
		const countResponse = await requestJson({
			path: '/api/notifications/unread-count',
			cookie: ownerA.cookie
		})

		expect(listResponse.status).toBe(200)
		expect(listResponse.data.data).toHaveLength(2)
		expect(
			listResponse.data.data?.every(
				(item: { isRead: boolean }) => item.isRead === false
			)
		).toBe(true)
		expect(countResponse.status).toBe(200)
		expect(countResponse.data.data).toEqual({ count: 2 })
	})

	it('marks a single owned notification as read', async () => {
		const response = await requestJson({
			path: `/api/notifications/${unreadNotificationId}/read`,
			method: 'PATCH',
			cookie: ownerA.cookie
		})
		const updatedRow = await db.query.notification.findFirst({
			where: eq(notification.id, unreadNotificationId)
		})

		expect(response.status).toBe(200)
		expect(response.data.data?.id).toBe(unreadNotificationId)
		expect(response.data.data?.isRead).toBe(true)
		expect(updatedRow?.isRead).toBe(true)
	})

	it("returns 404 when marking another user's notification as read", async () => {
		const response = await requestJson({
			path: `/api/notifications/${foreignNotificationId}/read`,
			method: 'PATCH',
			cookie: ownerA.cookie
		})

		expect(response.status).toBe(404)
	})

	it('marks all remaining unread notifications as read', async () => {
		const response = await requestJson({
			path: '/api/notifications/read-all',
			method: 'PATCH',
			cookie: ownerA.cookie
		})
		const countResponse = await requestJson({
			path: '/api/notifications/unread-count',
			cookie: ownerA.cookie
		})

		expect(response.status).toBe(200)
		expect(response.data.data?.updatedCount).toBe(1)
		expect(countResponse.data.data).toEqual({ count: 0 })
	})

	it('returns 401 for POST /api/notifications/register-token without auth', async () => {
		const response = await requestJson({
			path: '/api/notifications/register-token',
			method: 'POST',
			body: { token: 'ExpoPushToken[test-without-auth]' }
		})

		expect(response.status).toBe(401)
	})

	it('registers and reassigns Expo push tokens', async () => {
		const token = `ExpoPushToken[test-${Date.now()}]`

		const firstResponse = await requestJson({
			path: '/api/notifications/register-token',
			method: 'POST',
			cookie: ownerA.cookie,
			body: { token }
		})
		const firstRow = await db.query.notificationPushToken.findFirst({
			where: eq(notificationPushToken.token, token)
		})

		expect(firstResponse.status).toBe(200)
		expect(firstResponse.data.data).toEqual({ tokenRegistered: true })
		expect(firstRow?.userId).toBe(ownerA.userId)
		expect(firstRow?.isActive).toBe(true)

		await db
			.update(notificationPushToken)
			.set({ isActive: false, invalidatedAt: new Date() })
			.where(eq(notificationPushToken.token, token))

		const secondResponse = await requestJson({
			path: '/api/notifications/register-token',
			method: 'POST',
			cookie: ownerB.cookie,
			body: { token }
		})
		const secondRow = await db.query.notificationPushToken.findFirst({
			where: eq(notificationPushToken.token, token)
		})

		expect(secondResponse.status).toBe(200)
		expect(secondRow?.userId).toBe(ownerB.userId)
		expect(secondRow?.isActive).toBe(true)
		expect(secondRow?.invalidatedAt).toBeNull()
	})
})
