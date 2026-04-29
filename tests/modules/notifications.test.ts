import { beforeAll, describe, expect, it } from 'bun:test'
import { eq } from 'drizzle-orm'
import { treaty } from '@elysiajs/eden'
import { customAlphabet, nanoid } from 'nanoid'

const nanoidSlug = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 8)

import { app } from '../../src/app'
import { db } from '../../src/lib/database'
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
