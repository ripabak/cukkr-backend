import { beforeAll, describe, expect, it } from 'bun:test'
import { eq } from 'drizzle-orm'
import { treaty } from '@elysiajs/eden'
import { customAlphabet, nanoid } from 'nanoid'

const nanoidSlug = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 8)

const testJpegBuffer = new Uint8Array([
	0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01,
	0x01, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00, 0xff, 0xdb, 0x00, 0x43,
	0x00, 0x08, 0x06, 0x06, 0x07, 0x06, 0x05, 0x08, 0x07, 0x07, 0x07, 0x09,
	0x09, 0x08, 0x0a, 0x0c, 0x14, 0x0d, 0x0c, 0x0b, 0x0b, 0x0c, 0x19, 0x12,
	0x13, 0x0f, 0x14, 0x1d, 0x1a, 0x1f, 0x1e, 0x1d, 0x1a, 0x1c, 0x1c, 0x20,
	0x24, 0x2e, 0x27, 0x20, 0x22, 0x2c, 0x23, 0x1c, 0x1c, 0x28, 0x37, 0x29,
	0x2c, 0x30, 0x31, 0x34, 0x34, 0x34, 0x1f, 0x27, 0x39, 0x3d, 0x38, 0x32,
	0x3c, 0x2e, 0x33, 0x34, 0x32, 0xff, 0xc0, 0x00, 0x0b, 0x08, 0x00, 0x01,
	0x00, 0x01, 0x01, 0x01, 0x11, 0x00, 0xff, 0xc4, 0x00, 0x1f, 0x00, 0x00,
	0x01, 0x05, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00,
	0x00, 0x00, 0x00, 0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08,
	0x09, 0x0a, 0x0b, 0xff, 0xc4, 0x00, 0xb5, 0x10, 0x00, 0x02, 0x01, 0x03,
	0x03, 0x02, 0x04, 0x03, 0x05, 0x05, 0x04, 0x04, 0x00, 0x00, 0x01, 0x7d,
	0x01, 0x02, 0x03, 0x00, 0x04, 0x11, 0x05, 0x12, 0x21, 0x31, 0x41, 0x06,
	0x13, 0x51, 0x61, 0x07, 0x22, 0x71, 0x14, 0x32, 0x81, 0x91, 0xa1, 0x08,
	0x23, 0x42, 0xb1, 0xc1, 0x15, 0x52, 0xd1, 0xf0, 0x24, 0x33, 0x62, 0x72,
	0x82, 0x09, 0x0a, 0x16, 0x17, 0x18, 0x19, 0x1a, 0x25, 0x26, 0x27, 0x28,
	0x29, 0x2a, 0x34, 0x35, 0x36, 0x37, 0x38, 0x39, 0x3a, 0x43, 0x44, 0x45,
	0x46, 0x47, 0x48, 0x49, 0x4a, 0x53, 0x54, 0x55, 0x56, 0x57, 0x58, 0x59,
	0x5a, 0x63, 0x64, 0x65, 0x66, 0x67, 0x68, 0x69, 0x6a, 0x73, 0x74, 0x75,
	0x76, 0x77, 0x78, 0x79, 0x7a, 0x83, 0x84, 0x85, 0x86, 0x87, 0x88, 0x89,
	0x8a, 0x92, 0x93, 0x94, 0x95, 0x96, 0x97, 0x98, 0x99, 0x9a, 0xa2, 0xa3,
	0xa4, 0xa5, 0xa6, 0xa7, 0xa8, 0xa9, 0xaa, 0xb2, 0xb3, 0xb4, 0xb5, 0xb6,
	0xb7, 0xb8, 0xb9, 0xba, 0xc2, 0xc3, 0xc4, 0xc5, 0xc6, 0xc7, 0xc8, 0xc9,
	0xca, 0xd2, 0xd3, 0xd4, 0xd5, 0xd6, 0xd7, 0xd8, 0xd9, 0xda, 0xe1, 0xe2,
	0xe3, 0xe4, 0xe5, 0xe6, 0xe7, 0xe8, 0xe9, 0xea, 0xf1, 0xf2, 0xf3, 0xf4,
	0xf5, 0xf6, 0xf7, 0xf8, 0xf9, 0xfa, 0xff, 0xda, 0x00, 0x08, 0x01, 0x01,
	0x00, 0x00, 0x3f, 0x00, 0xd2, 0xff, 0xd9
])

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
	const actualSlug: string = orgRes.data?.slug ?? slug

	const activeRes = await (tClient as any).auth.api.organization[
		'set-active'
	].post(
		{ organizationId: orgId },
		{ fetch: { headers: { cookie: rawCookie, origin: ORIGIN } } }
	)
	const cookie: string =
		activeRes.response?.headers.get('set-cookie') ?? rawCookie

	return { cookie, userId, orgId, slug: actualSlug }
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
		role: 'member',
		createdAt: new Date()
	})

	return { cookie, userId, email, memberId }
}

function createImageFile(
	mimeType: string,
	size = 256,
	filename = 'test.jpg'
): File {
	const bytes = new Uint8Array(Math.max(size, testJpegBuffer.length))
	bytes.set(testJpegBuffer)
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

		const createRes = await (tClient as any).api.public.booking[
			ownerCtx.slug
		].appointment.post({
			customerName: 'Lifecycle Customer',
			customerEmail: 'lifecycle@test.com',
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

		const createRes = await (tClient as any).api.public.booking[
			ownerCtx.slug
		].appointment.post({
			customerName: 'Decline Lifecycle Customer',
			customerEmail: 'decline-lifecycle@test.com',
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

		const createRes = await (tClient as any).api.public.booking[
			ownerCtx.slug
		].appointment.post({
			customerName: 'Barber Split Customer',
			customerEmail: 'barber-split@test.com',
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

		const formDataRes = await (tClient as any).api.public.booking[
			ownerCtx.slug
		]['form-data'].get()
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
		const res = await (tClient as any).api.public.booking[
			ownerCtx.slug
		].appointment.post({
			customerName: 'Cross-Org Customer',
			customerEmail: 'cross-org@test.com',
			serviceIds: [otherSvcId],
			scheduledAt
		})

		expect(res.status).toBe(400)
	})
})
