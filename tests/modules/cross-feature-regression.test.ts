import { beforeAll, describe, expect, it } from 'bun:test'
import { eq } from 'drizzle-orm'
import { treaty } from '@elysiajs/eden'
import { customAlphabet, nanoid } from 'nanoid'

const nanoidSlug = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 8)

import { app } from '../../src/app'
import { db } from '../../src/lib/database'
import { member, invitation } from '../../src/modules/auth/schema'
import { notification } from '../../src/modules/notifications/schema'
import { openHour } from '../../src/modules/open-hours/schema'
import { service } from '../../src/modules/services/schema'
import { and } from 'drizzle-orm'

const tClient = treaty(app)
const ORIGIN = 'http://localhost:3001'

const WIB_OFFSET_MS = 7 * 60 * 60 * 1000

function getFutureWibIso(
	dayOffset: number,
	hour: number,
	minute: number
): string {
	const nowWib = new Date(new Date().getTime() + WIB_OFFSET_MS)
	const targetWib = new Date(
		Date.UTC(
			nowWib.getUTCFullYear(),
			nowWib.getUTCMonth(),
			nowWib.getUTCDate() + dayOffset,
			hour,
			minute,
			0,
			0
		)
	)
	return new Date(targetWib.getTime() - WIB_OFFSET_MS).toISOString()
}

interface UserContext {
	cookie: string
	userId: string
	orgId: string
	slug: string
}

async function createOwnerContext(prefix: string): Promise<UserContext> {
	const email = `${prefix}_${Date.now()}_${nanoid(4)}@example.com`
	const slug = `${prefix}-${nanoidSlug()}`

	const signUpRes = await (tClient as any).auth.api['sign-up'].email.post(
		{ email, password: 'password123', name: `${prefix} Owner` },
		{ fetch: { headers: { origin: ORIGIN } } }
	)
	const rawCookie: string =
		signUpRes.response?.headers.get('set-cookie') ?? ''

	const sessionRes = await (tClient as any).auth.api['get-session'].get({
		headers: { cookie: rawCookie }
	})
	const userId: string = sessionRes.data?.user?.id ?? ''

	const orgRes = await (tClient as any).auth.api.organization.create.post(
		{ name: `${prefix} Shop`, slug },
		{ fetch: { headers: { cookie: rawCookie, origin: ORIGIN } } }
	)
	const orgId: string = orgRes.data?.id ?? ''

	const activeRes = await (tClient as any).auth.api.organization[
		'set-active'
	].post(
		{ organizationId: orgId },
		{ fetch: { headers: { cookie: rawCookie, origin: ORIGIN } } }
	)
	const cookie: string =
		activeRes.response?.headers.get('set-cookie') ?? rawCookie

	return { cookie, userId, orgId, slug }
}

async function addBarberMember(args: {
	orgId: string
	suffix: string
}): Promise<{
	cookie: string
	userId: string
	email: string
	memberId: string
}> {
	const email = `barber_${args.suffix}_${Date.now()}_${nanoid(4)}@example.com`

	const signUpRes = await (tClient as any).auth.api['sign-up'].email.post(
		{ email, password: 'password123', name: `Barber ${args.suffix}` },
		{ fetch: { headers: { origin: ORIGIN } } }
	)
	const cookie: string = signUpRes.response?.headers.get('set-cookie') ?? ''
	const sessionRes = await (tClient as any).auth.api['get-session'].get({
		headers: { cookie }
	})
	const userId: string = sessionRes.data?.user?.id ?? ''

	const memberId = nanoid()
	await db.insert(member).values({
		id: memberId,
		organizationId: args.orgId,
		userId,
		role: 'barber',
		createdAt: new Date()
	})

	return { cookie, userId, email, memberId }
}

function createImageFile(
	mimeType: string,
	size = 256,
	filename = 'test.jpg'
): File {
	const bytes = new Uint8Array(Math.max(size, 4))
	bytes.set([0xff, 0xd8, 0xff, 0xdb])
	return new File([bytes], filename, { type: mimeType })
}

async function uploadFile(
	path: string,
	cookie: string,
	file: File
): Promise<Response> {
	const form = new FormData()
	form.set('file', file)
	return app.handle(
		new Request(`http://localhost${path}`, {
			method: 'POST',
			headers: { cookie },
			body: form
		})
	)
}

// ---------------------------------------------------------------------------
// Cross-Feature Media Regression
// ---------------------------------------------------------------------------

describe('Cross-Feature Media Regression — Barbershop Logo Upload', () => {
	let owner: UserContext
	let barber: { cookie: string; userId: string; memberId: string }

	beforeAll(async () => {
		owner = await createOwnerContext('media-logo')
		barber = await addBarberMember({ orgId: owner.orgId, suffix: 'logo' })
	})

	it('POST /barbershop/logo returns 200 and a logoUrl for a valid JPEG', async () => {
		const file = createImageFile('image/jpeg', 256, 'logo.jpg')
		const res = await uploadFile('/api/barbershop/logo', owner.cookie, file)
		const body = (await res.json()) as { data: { logoUrl: string } }

		expect(res.status).toBe(200)
		expect(body.data.logoUrl).toBeTruthy()
		expect(body.data.logoUrl).toContain('/mock-storage/')
	})

	it('POST /barbershop/logo returns 200 for a valid PNG', async () => {
		const file = createImageFile('image/png', 256, 'logo.png')
		const res = await uploadFile('/api/barbershop/logo', owner.cookie, file)

		expect(res.status).toBe(200)
	})

	it('POST /barbershop/logo returns 422 for an invalid MIME type', async () => {
		const file = new File(['not-an-image'], 'logo.txt', {
			type: 'text/plain'
		})
		const res = await uploadFile('/api/barbershop/logo', owner.cookie, file)

		expect(res.status).toBe(422)
	})

	it('POST /barbershop/logo returns 422 for a file exceeding 5 MB', async () => {
		const file = createImageFile(
			'image/jpeg',
			5 * 1024 * 1024 + 1,
			'large.jpg'
		)
		const res = await uploadFile('/api/barbershop/logo', owner.cookie, file)

		expect(res.status).toBe(422)
	})

	it('POST /barbershop/logo returns 401 without authentication', async () => {
		const file = createImageFile('image/jpeg', 256, 'logo.jpg')
		const form = new FormData()
		form.set('file', file)
		const res = await app.handle(
			new Request('http://localhost/api/barbershop/logo', {
				method: 'POST',
				body: form
			})
		)

		expect(res.status).toBe(401)
	})

	it('POST /barbershop/logo returns 403 for a barber role caller', async () => {
		const file = createImageFile('image/jpeg', 256, 'logo.jpg')
		const res = await uploadFile(
			'/api/barbershop/logo',
			barber.cookie,
			file
		)

		expect(res.status).toBe(403)
	})

	it('uploaded logo appears in GET /barbershop', async () => {
		const file = createImageFile('image/jpeg', 256, 'logo-check.jpg')
		const uploadRes = await uploadFile(
			'/api/barbershop/logo',
			owner.cookie,
			file
		)
		const uploadBody = (await uploadRes.json()) as {
			data: { logoUrl: string }
		}
		expect(uploadRes.status).toBe(200)

		const { status, data } = await tClient.api.barbershop.get({
			fetch: { headers: { cookie: owner.cookie } }
		})

		expect(status).toBe(200)
		expect((data as any)?.data?.logoUrl).toBe(uploadBody.data.logoUrl)
	})

	it('uploaded logo appears in GET /public/barbershop/:slug', async () => {
		const file = createImageFile('image/jpeg', 256, 'logo-pub.jpg')
		const uploadRes = await uploadFile(
			'/api/barbershop/logo',
			owner.cookie,
			file
		)
		const uploadBody = (await uploadRes.json()) as {
			data: { logoUrl: string }
		}
		expect(uploadRes.status).toBe(200)

		const { status, data } = await tClient.api.public
			.barbershop({ slug: owner.slug })
			.get()

		expect(status).toBe(200)
		expect((data as any)?.data?.logoUrl).toBe(uploadBody.data.logoUrl)
	})
})

describe('Cross-Feature Media Regression — Service Thumbnail Upload', () => {
	let owner: UserContext
	let barber: { cookie: string; userId: string; memberId: string }
	let serviceId: string

	beforeAll(async () => {
		owner = await createOwnerContext('media-svc')
		barber = await addBarberMember({
			orgId: owner.orgId,
			suffix: 'svc-thumb'
		})

		serviceId = nanoid()
		await db.insert(service).values({
			id: serviceId,
			organizationId: owner.orgId,
			name: 'Thumbnail Test Service',
			description: null,
			price: 50000,
			duration: 30,
			discount: 0,
			isActive: true,
			isDefault: false
		})
	})

	it('POST /services/:id/image returns 200 and an imageUrl for a valid JPEG', async () => {
		const file = createImageFile('image/jpeg', 256, 'thumb.jpg')
		const res = await uploadFile(
			`/api/services/${serviceId}/image`,
			owner.cookie,
			file
		)
		const body = (await res.json()) as { data: { imageUrl: string } }

		expect(res.status).toBe(200)
		expect(body.data.imageUrl).toBeTruthy()
		expect(body.data.imageUrl).toContain('/mock-storage/')
	})

	it('POST /services/:id/image returns 200 for a valid WebP', async () => {
		const file = createImageFile('image/webp', 256, 'thumb.webp')
		const res = await uploadFile(
			`/api/services/${serviceId}/image`,
			owner.cookie,
			file
		)

		expect(res.status).toBe(200)
	})

	it('POST /services/:id/image returns 422 for an invalid MIME type', async () => {
		const file = new File(['gif data'], 'thumb.gif', { type: 'image/gif' })
		const res = await uploadFile(
			`/api/services/${serviceId}/image`,
			owner.cookie,
			file
		)

		expect(res.status).toBe(422)
	})

	it('POST /services/:id/image returns 422 for a file exceeding 5 MB', async () => {
		const file = createImageFile(
			'image/jpeg',
			5 * 1024 * 1024 + 1,
			'big.jpg'
		)
		const res = await uploadFile(
			`/api/services/${serviceId}/image`,
			owner.cookie,
			file
		)

		expect(res.status).toBe(422)
	})

	it('POST /services/:id/image returns 401 without authentication', async () => {
		const file = createImageFile('image/jpeg', 256, 'thumb.jpg')
		const form = new FormData()
		form.set('file', file)
		const res = await app.handle(
			new Request(`http://localhost/api/services/${serviceId}/image`, {
				method: 'POST',
				body: form
			})
		)

		expect(res.status).toBe(401)
	})

	it('POST /services/:id/image returns 403 for a barber role caller', async () => {
		const file = createImageFile('image/jpeg', 256, 'thumb.jpg')
		const res = await uploadFile(
			`/api/services/${serviceId}/image`,
			barber.cookie,
			file
		)

		expect(res.status).toBe(403)
	})

	it('POST /services/:id/image returns 404 for a service from another org', async () => {
		const otherOwner = await createOwnerContext('media-svc-other')
		const otherServiceId = nanoid()
		await db.insert(service).values({
			id: otherServiceId,
			organizationId: otherOwner.orgId,
			name: 'Other Org Service',
			description: null,
			price: 30000,
			duration: 20,
			discount: 0,
			isActive: true,
			isDefault: false
		})

		const file = createImageFile('image/jpeg', 256, 'thumb.jpg')
		const res = await uploadFile(
			`/api/services/${otherServiceId}/image`,
			owner.cookie,
			file
		)

		expect(res.status).toBe(404)
	})

	it('uploaded imageUrl appears in GET /services/:id', async () => {
		const file = createImageFile('image/jpeg', 256, 'check.jpg')
		const uploadRes = await uploadFile(
			`/api/services/${serviceId}/image`,
			owner.cookie,
			file
		)
		const uploadBody = (await uploadRes.json()) as {
			data: { imageUrl: string }
		}
		expect(uploadRes.status).toBe(200)

		const { status, data } = await tClient.api
			.services({ id: serviceId })
			.get({
				fetch: { headers: { cookie: owner.cookie } }
			})

		expect(status).toBe(200)
		expect((data as any)?.data?.imageUrl).toBe(uploadBody.data.imageUrl)
	})
})

// ---------------------------------------------------------------------------
// Cross-Feature Booking Regression
// ---------------------------------------------------------------------------

describe('Cross-Feature Booking Regression — Public Appointment Full Lifecycle', () => {
	let ownerCtx: UserContext
	let activeServiceId: string

	beforeAll(async () => {
		ownerCtx = await createOwnerContext('booking-pub')

		activeServiceId = nanoid()
		await db.insert(service).values({
			id: activeServiceId,
			organizationId: ownerCtx.orgId,
			name: 'Full Lifecycle Service',
			description: null,
			price: 60000,
			duration: 30,
			discount: 0,
			isActive: true,
			isDefault: false
		})

		await db.insert(openHour).values(
			Array.from({ length: 7 }, (_, dayOfWeek) => ({
				id: nanoid(),
				organizationId: ownerCtx.orgId,
				dayOfWeek,
				isOpen: true,
				openTime: '09:00',
				closeTime: '18:00'
			}))
		)
	})

	it('public appointment → accept → start → complete succeeds end-to-end', async () => {
		const scheduledAt = getFutureWibIso(1, 11, 0)

		const createRes = await (tClient as any).api.public
			.barbershop({ slug: ownerCtx.slug })
			.appointment.post({
				customerName: 'Lifecycle Customer',
				serviceIds: [activeServiceId],
				scheduledAt
			})
		expect(createRes.status).toBe(201)
		const bookingId: string = (createRes.data as any)?.data?.id
		expect((createRes.data as any)?.data?.status).toBe('requested')

		const acceptRes = await (tClient as any).api
			.bookings({ id: bookingId })
			.accept.post(undefined, {
				fetch: { headers: { cookie: ownerCtx.cookie } }
			})
		expect(acceptRes.status).toBe(200)
		expect((acceptRes.data as any)?.data?.status).toBe('waiting')

		const startRes = await (tClient as any).api.bookings[
			bookingId
		].status.patch(
			{ status: 'in_progress' },
			{ fetch: { headers: { cookie: ownerCtx.cookie } } }
		)
		expect(startRes.status).toBe(200)
		expect((startRes.data as any)?.data?.status).toBe('in_progress')

		const completeRes = await (tClient as any).api.bookings[
			bookingId
		].status.patch(
			{ status: 'completed' },
			{ fetch: { headers: { cookie: ownerCtx.cookie } } }
		)
		expect(completeRes.status).toBe(200)
		expect((completeRes.data as any)?.data?.status).toBe('completed')
		expect((completeRes.data as any)?.data?.completedAt).toBeTruthy()
	})

	it('public appointment → decline transitions booking to cancelled', async () => {
		const scheduledAt = getFutureWibIso(2, 10, 0)

		const createRes = await (tClient as any).api.public
			.barbershop({ slug: ownerCtx.slug })
			.appointment.post({
				customerName: 'Decline Lifecycle Customer',
				serviceIds: [activeServiceId],
				scheduledAt
			})
		expect(createRes.status).toBe(201)
		const bookingId: string = (createRes.data as any)?.data?.id

		const declineRes = await (tClient as any).api
			.bookings({ id: bookingId })
			.decline.post(
				{ reason: 'No availability' },
				{ fetch: { headers: { cookie: ownerCtx.cookie } } }
			)
		expect(declineRes.status).toBe(200)
		expect((declineRes.data as any)?.data?.status).toBe('cancelled')
		expect((declineRes.data as any)?.data?.cancelledAt).toBeTruthy()
	})

	it('walk-in booking → reassign to barber → start → complete', async () => {
		const barber = await addBarberMember({
			orgId: ownerCtx.orgId,
			suffix: 'reassign-lifecycle'
		})

		const createRes = await (tClient as any).api.bookings.post(
			{
				type: 'walk_in',
				customerName: 'Reassign Lifecycle Customer',
				serviceIds: [activeServiceId]
			},
			{ fetch: { headers: { cookie: ownerCtx.cookie } } }
		)
		expect(createRes.status).toBe(201)
		const bookingId: string = (createRes.data as any)?.data?.id

		const reassignRes = await (tClient as any).api
			.bookings({ id: bookingId })
			.reassign.patch(
				{ handledByMemberId: barber.memberId },
				{ fetch: { headers: { cookie: ownerCtx.cookie } } }
			)
		expect(reassignRes.status).toBe(200)
		expect((reassignRes.data as any)?.data?.handledByBarber?.memberId).toBe(
			barber.memberId
		)

		const startRes = await (tClient as any).api.bookings[
			bookingId
		].status.patch(
			{ status: 'in_progress' },
			{ fetch: { headers: { cookie: ownerCtx.cookie } } }
		)
		expect(startRes.status).toBe(200)
		expect((startRes.data as any)?.data?.status).toBe('in_progress')

		const completeRes = await (tClient as any).api.bookings[
			bookingId
		].status.patch(
			{ status: 'completed' },
			{ fetch: { headers: { cookie: ownerCtx.cookie } } }
		)
		expect(completeRes.status).toBe(200)
		expect((completeRes.data as any)?.data?.status).toBe('completed')
	})

	it('public appointment preserves requestedBarber after accept', async () => {
		const barber = await addBarberMember({
			orgId: ownerCtx.orgId,
			suffix: 'barber-split'
		})
		const scheduledAt = getFutureWibIso(3, 11, 0)

		const createRes = await (tClient as any).api.public
			.barbershop({ slug: ownerCtx.slug })
			.appointment.post({
				customerName: 'Barber Split Customer',
				serviceIds: [activeServiceId],
				scheduledAt,
				barberId: barber.memberId
			})
		expect(createRes.status).toBe(201)
		const bookingId: string = (createRes.data as any)?.data?.id

		await (tClient as any).api
			.bookings({ id: bookingId })
			.accept.post(undefined, {
				fetch: { headers: { cookie: ownerCtx.cookie } }
			})

		const detailRes = await (tClient as any).api
			.bookings({ id: bookingId })
			.get({ fetch: { headers: { cookie: ownerCtx.cookie } } })

		expect(detailRes.status).toBe(200)
		expect((detailRes.data as any)?.data?.requestedBarber?.memberId).toBe(
			barber.memberId
		)
	})
})

// ---------------------------------------------------------------------------
// Cross-Feature Invitation And Notification Regression
// ---------------------------------------------------------------------------

describe('Cross-Feature Invitation And Notification Regression', () => {
	let ownerCtx: UserContext
	let inviteeA: { cookie: string; userId: string; email: string }
	let inviteeB: { cookie: string; userId: string; email: string }

	beforeAll(async () => {
		ownerCtx = await createOwnerContext('inv-notif')

		const emailA = `inv_a_${Date.now()}_${nanoid(4)}@example.com`
		const signUpA = await (tClient as any).auth.api['sign-up'].email.post(
			{ email: emailA, password: 'password123', name: 'Invitee A' },
			{ fetch: { headers: { origin: ORIGIN } } }
		)
		const cookieA: string =
			signUpA.response?.headers.get('set-cookie') ?? ''
		const sessionA = await (tClient as any).auth.api['get-session'].get({
			headers: { cookie: cookieA }
		})
		inviteeA = {
			cookie: cookieA,
			userId: sessionA.data?.user?.id ?? '',
			email: emailA
		}

		const emailB = `inv_b_${Date.now()}_${nanoid(4)}@example.com`
		const signUpB = await (tClient as any).auth.api['sign-up'].email.post(
			{ email: emailB, password: 'password123', name: 'Invitee B' },
			{ fetch: { headers: { origin: ORIGIN } } }
		)
		const cookieB: string =
			signUpB.response?.headers.get('set-cookie') ?? ''
		const sessionB = await (tClient as any).auth.api['get-session'].get({
			headers: { cookie: cookieB }
		})
		inviteeB = {
			cookie: cookieB,
			userId: sessionB.data?.user?.id ?? '',
			email: emailB
		}
	})

	it('bulk invite creates invitations for all targets', async () => {
		const res = await (tClient as any).api.barbers['bulk-invite'].post(
			{ targets: [{ email: inviteeA.email }, { email: inviteeB.email }] },
			{ fetch: { headers: { cookie: ownerCtx.cookie } } }
		)

		expect(res.status).toBe(201)
		const invited = (res.data as any)?.data?.invited as {
			id: string
			email: string
			status: string
		}[]
		expect(invited.length).toBe(2)
		expect(invited.every((r) => r.status === 'pending')).toBe(true)
	})

	it('bulk invite → notification is created for each known invitee', async () => {
		const emailX = `inv_x_${Date.now()}_${nanoid(4)}@example.com`
		const signUpX = await (tClient as any).auth.api['sign-up'].email.post(
			{ email: emailX, password: 'password123', name: 'Invitee X' },
			{ fetch: { headers: { origin: ORIGIN } } }
		)
		const cookieX: string =
			signUpX.response?.headers.get('set-cookie') ?? ''
		const sessionX = await (tClient as any).auth.api['get-session'].get({
			headers: { cookie: cookieX }
		})
		const userIdX: string = sessionX.data?.user?.id ?? ''

		const bulkOwner = await createOwnerContext('bulk-notif')
		const invRes = await (tClient as any).api.barbers['bulk-invite'].post(
			{ targets: [{ email: emailX }] },
			{ fetch: { headers: { cookie: bulkOwner.cookie } } }
		)
		expect(invRes.status).toBe(201)
		const inviteId: string = (invRes.data as any)?.data?.invited?.[0]?.id

		const notifRow = await db.query.notification.findFirst({
			where: and(
				eq(notification.recipientUserId, userIdX),
				eq(notification.referenceId, inviteId)
			)
		})

		expect(notifRow).toBeTruthy()
		expect(notifRow?.type).toBe('barbershop_invitation')
		expect(notifRow?.referenceType).toBe('invitation')
	})

	it('invitee accepts invitation via notification action → becomes member', async () => {
		const emailY = `inv_y_${Date.now()}_${nanoid(4)}@example.com`
		const signUpY = await (tClient as any).auth.api['sign-up'].email.post(
			{ email: emailY, password: 'password123', name: 'Invitee Y' },
			{ fetch: { headers: { origin: ORIGIN } } }
		)
		const cookieY: string =
			signUpY.response?.headers.get('set-cookie') ?? ''
		const sessionY = await (tClient as any).auth.api['get-session'].get({
			headers: { cookie: cookieY }
		})
		const userIdY: string = sessionY.data?.user?.id ?? ''

		const notifOwner = await createOwnerContext('notif-accept')
		const invRes = await app.handle(
			new Request('http://localhost/api/barbers/invite', {
				method: 'POST',
				headers: {
					cookie: notifOwner.cookie,
					'content-type': 'application/json'
				},
				body: JSON.stringify({ email: emailY })
			})
		)
		expect(invRes.status).toBe(201)
		const inviteId: string = ((await invRes.json()) as any)?.data?.id

		const notifRow = await db.query.notification.findFirst({
			where: and(
				eq(notification.recipientUserId, userIdY),
				eq(notification.referenceId, inviteId)
			)
		})
		expect(notifRow).toBeTruthy()
		const notifId = notifRow!.id

		const actionRes = await app.handle(
			new Request(
				`http://localhost/api/notifications/${notifId}/actions/accept`,
				{
					method: 'POST',
					headers: { cookie: cookieY }
				}
			)
		)
		expect(actionRes.status).toBe(200)
		const actionBody = (await actionRes.json()) as any
		expect(actionBody?.data?.action).toBe('accepted')
		expect(actionBody?.data?.referenceType).toBe('invitation')

		const memberRow = await db.query.member.findFirst({
			where: and(
				eq(member.userId, userIdY),
				eq(member.organizationId, notifOwner.orgId)
			)
		})
		expect(memberRow).toBeTruthy()
		expect(memberRow?.role).toBe('barber')
	})

	it('invitee declines invitation via notification action → invitation is declined', async () => {
		const emailZ = `inv_z_${Date.now()}_${nanoid(4)}@example.com`
		const signUpZ = await (tClient as any).auth.api['sign-up'].email.post(
			{ email: emailZ, password: 'password123', name: 'Invitee Z' },
			{ fetch: { headers: { origin: ORIGIN } } }
		)
		const cookieZ: string =
			signUpZ.response?.headers.get('set-cookie') ?? ''
		const sessionZ = await (tClient as any).auth.api['get-session'].get({
			headers: { cookie: cookieZ }
		})
		const userIdZ: string = sessionZ.data?.user?.id ?? ''

		const notifOwner2 = await createOwnerContext('notif-decline')
		const invRes = await app.handle(
			new Request('http://localhost/api/barbers/invite', {
				method: 'POST',
				headers: {
					cookie: notifOwner2.cookie,
					'content-type': 'application/json'
				},
				body: JSON.stringify({ email: emailZ })
			})
		)
		expect(invRes.status).toBe(201)
		const inviteId: string = ((await invRes.json()) as any)?.data?.id

		const notifRow = await db.query.notification.findFirst({
			where: and(
				eq(notification.recipientUserId, userIdZ),
				eq(notification.referenceId, inviteId)
			)
		})
		const notifId = notifRow!.id

		const actionRes = await app.handle(
			new Request(
				`http://localhost/api/notifications/${notifId}/actions/decline`,
				{
					method: 'POST',
					headers: {
						cookie: cookieZ,
						'content-type': 'application/json'
					},
					body: JSON.stringify({})
				}
			)
		)
		expect(actionRes.status).toBe(200)
		const actionBody = (await actionRes.json()) as any
		expect(actionBody?.data?.action).toBe('declined')

		const invRow = await db.query.invitation.findFirst({
			where: eq(invitation.id, inviteId)
		})
		expect(invRow?.status).toBe('rejected')
	})
})

// ---------------------------------------------------------------------------
// Cross-Feature Public Surface Regression
// ---------------------------------------------------------------------------

describe('Cross-Feature Public Surface Regression', () => {
	let ownerCtx: UserContext
	let svcId: string

	beforeAll(async () => {
		ownerCtx = await createOwnerContext('pub-surface')

		svcId = nanoid()
		await db.insert(service).values({
			id: svcId,
			organizationId: ownerCtx.orgId,
			name: 'Public Surface Service',
			description: 'Visible on public landing',
			price: 70000,
			duration: 45,
			discount: 0,
			isActive: true,
			isDefault: false
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
	})

	it('public landing includes the service uploaded via owner endpoint', async () => {
		const { status, data } = await tClient.api.public
			.barbershop({ slug: ownerCtx.slug })
			.get()

		expect(status).toBe(200)
		const services = (data as any)?.data?.services as { id: string }[]
		expect(services.some((s) => s.id === svcId)).toBe(true)
	})

	it('uploaded logo appears in public surface response', async () => {
		const file = createImageFile('image/jpeg', 256, 'pub-logo.jpg')
		const uploadRes = await uploadFile(
			'/api/barbershop/logo',
			ownerCtx.cookie,
			file
		)
		const uploadBody = (await uploadRes.json()) as {
			data: { logoUrl: string }
		}
		expect(uploadRes.status).toBe(200)

		const { status, data } = await tClient.api.public
			.barbershop({ slug: ownerCtx.slug })
			.get()

		expect(status).toBe(200)
		expect((data as any)?.data?.logoUrl).toBe(uploadBody.data.logoUrl)
	})

	it('walk-in form data returns the same active services as the public landing', async () => {
		const landingRes = await tClient.api.public
			.barbershop({ slug: ownerCtx.slug })
			.get()
		expect(landingRes.status).toBe(200)
		const landingServiceIds = (
			(landingRes.data as any)?.data?.services as { id: string }[]
		).map((s) => s.id)

		const formDataRes = await (tClient as any).api.public[ownerCtx.slug][
			'form-data'
		].get()
		expect(formDataRes.status).toBe(200)
		const formServiceIds = (
			(formDataRes.data as any)?.data?.services as { id: string }[]
		).map((s: { id: string }) => s.id)

		expect(formServiceIds).toEqual(
			expect.arrayContaining(landingServiceIds)
		)
	})

	it('public surface does not return data for an unknown slug', async () => {
		const { status } = await tClient.api.public
			.barbershop({ slug: `unknown-${nanoidSlug()}` })
			.get()

		expect(status).toBe(404)
	})

	it('public appointment booking is org-isolated: wrong org returns 400 for cross-org serviceId', async () => {
		const otherOwner = await createOwnerContext('pub-iso')
		const otherSvcId = nanoid()
		await db.insert(service).values({
			id: otherSvcId,
			organizationId: otherOwner.orgId,
			name: 'Isolated Service',
			description: null,
			price: 40000,
			duration: 20,
			discount: 0,
			isActive: true,
			isDefault: false
		})
		await db.insert(openHour).values(
			Array.from({ length: 7 }, (_, dayOfWeek) => ({
				id: nanoid(),
				organizationId: otherOwner.orgId,
				dayOfWeek,
				isOpen: true,
				openTime: '08:00',
				closeTime: '20:00'
			}))
		)

		const scheduledAt = getFutureWibIso(1, 11, 0)
		const res = await (tClient as any).api.public
			.barbershop({ slug: ownerCtx.slug })
			.appointment.post({
				customerName: 'Cross-Org Customer',
				serviceIds: [otherSvcId],
				scheduledAt
			})

		expect(res.status).toBe(400)
	})
})
