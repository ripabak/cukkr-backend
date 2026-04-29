import { beforeAll, describe, expect, it } from 'bun:test'
import { treaty } from '@elysiajs/eden'
import { customAlphabet, nanoid } from 'nanoid'

const nanoidSlug = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 8)

import { app } from '../../src/app'
import { db } from '../../src/lib/database'
import { openHour } from '../../src/modules/open-hours/schema'
import { service } from '../../src/modules/services/schema'

const tClient = treaty(app)
const ORIGIN = 'http://localhost:3001'

async function createPublicBarbershopContext(suffix: string) {
	const email = `public_${suffix}_${Date.now()}@example.com`
	const slug = `public-${suffix}-${nanoidSlug()}`

	const signUpRes = await (tClient as any).auth.api['sign-up'].email.post(
		{ email, password: 'password123', name: 'Public Owner' },
		{ fetch: { headers: { origin: ORIGIN } } }
	)
	const cookie = signUpRes.response?.headers.get('set-cookie') ?? ''

	const orgRes = await (tClient as any).auth.api.organization.create.post(
		{ name: `Public Shop ${suffix}`, slug },
		{ fetch: { headers: { cookie, origin: ORIGIN } } }
	)
	const orgId = orgRes.data?.id ?? ''

	await (tClient as any).auth.api.organization['set-active'].post(
		{ organizationId: orgId },
		{ fetch: { headers: { cookie, origin: ORIGIN } } }
	)

	return { slug, orgId }
}

describe('Public Barbershop API', () => {
	let slug = ''

	beforeAll(async () => {
		const ctx = await createPublicBarbershopContext('landing')
		slug = ctx.slug

		await db.insert(service).values([
			{
				id: nanoid(),
				organizationId: ctx.orgId,
				name: 'Active Service',
				description: 'An active service',
				price: 50000,
				duration: 30,
				discount: 0,
				isActive: true,
				isDefault: false
			},
			{
				id: nanoid(),
				organizationId: ctx.orgId,
				name: 'Inactive Service',
				description: 'An inactive service',
				price: 25000,
				duration: 20,
				discount: 0,
				isActive: false,
				isDefault: false
			}
		])
	})

	it('GET /api/public/barbershop/:slug returns 200 with correct shape', async () => {
		const { status, data } = await tClient.api.public
			.barbershop({ slug })
			.get()

		expect(status).toBe(200)
		const shop = (data as any)?.data
		expect(shop).toBeDefined()
		expect(shop.slug).toBe(slug)
		expect(Array.isArray(shop.services)).toBe(true)
		expect(Array.isArray(shop.barbers)).toBe(true)
	})

	it('only returns active services', async () => {
		const { data } = await tClient.api.public.barbershop({ slug }).get()

		const shop = (data as any)?.data
		const names: string[] = shop.services.map(
			(s: { name: string }) => s.name
		)
		expect(names).toContain('Active Service')
		expect(names).not.toContain('Inactive Service')
	})

	it('GET /api/public/barbershop/:slug returns 404 for unknown slug', async () => {
		const { status } = await tClient.api.public
			.barbershop({ slug: `unknown-shop-${nanoidSlug()}` })
			.get()

		expect(status).toBe(404)
	})

	it('endpoint does not require authentication', async () => {
		const { status } = await tClient.api.public.barbershop({ slug }).get()

		expect(status).toBe(200)
	})
})

const WIB_OFFSET_MS_PUB = 7 * 60 * 60 * 1000

function getFutureWibIso(
	dayOffset: number,
	hour: number,
	minute: number
): string {
	const nowWib = new Date(new Date().getTime() + WIB_OFFSET_MS_PUB)
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
	return new Date(targetWib.getTime() - WIB_OFFSET_MS_PUB).toISOString()
}

async function createPublicBarbershopContextFull(suffix: string) {
	const email = `pub_full_${suffix}_${Date.now()}@example.com`
	const slug = `pub-full-${suffix}-${nanoidSlug()}`

	const signUpRes = await (tClient as any).auth.api['sign-up'].email.post(
		{ email, password: 'password123', name: 'Public Full Owner' },
		{ fetch: { headers: { origin: ORIGIN } } }
	)
	const rawCookie = signUpRes.response?.headers.get('set-cookie') ?? ''

	const orgRes = await (tClient as any).auth.api.organization.create.post(
		{ name: `Public Full Shop ${suffix}`, slug },
		{ fetch: { headers: { cookie: rawCookie, origin: ORIGIN } } }
	)
	const orgId = orgRes.data?.id ?? ''

	const activeRes = await (tClient as any).auth.api.organization[
		'set-active'
	].post(
		{ organizationId: orgId },
		{ fetch: { headers: { cookie: rawCookie, origin: ORIGIN } } }
	)
	const cookie = activeRes.response?.headers.get('set-cookie') ?? rawCookie

	return { slug, orgId, cookie }
}

describe('Public Appointment Booking Flow', () => {
	let apptSlug = ''
	let apptOrgId = ''
	let apptCookie = ''
	let activeServiceId = ''

	beforeAll(async () => {
		const ctx = await createPublicBarbershopContextFull('appt')
		apptSlug = ctx.slug
		apptOrgId = ctx.orgId
		apptCookie = ctx.cookie

		activeServiceId = nanoid()
		await db.insert(service).values({
			id: activeServiceId,
			organizationId: apptOrgId,
			name: 'Appt Active Service',
			description: null,
			price: 55000,
			duration: 30,
			discount: 0,
			isActive: true,
			isDefault: false
		})

		await db.insert(openHour).values(
			Array.from({ length: 7 }, (_, dayOfWeek) => ({
				id: nanoid(),
				organizationId: apptOrgId,
				dayOfWeek,
				isOpen: true,
				openTime: '09:00',
				closeTime: '17:00'
			}))
		)
	})

	it('GET /availability returns isOpen true for an open day', async () => {
		const scheduledAt = getFutureWibIso(1, 11, 0)
		const date = scheduledAt.slice(0, 10)

		const response = await (tClient as any).api.public
			.barbershop({ slug: apptSlug })
			.availability.get({ query: { date } })

		expect(response.status).toBe(200)
		expect((response.data as any)?.data?.isOpen).toBe(true)
		expect((response.data as any)?.data?.openTime).toBe('09:00')
		expect((response.data as any)?.data?.closeTime).toBe('17:00')
	})

	it('GET /availability returns 404 for unknown slug', async () => {
		const response = await (tClient as any).api.public
			.barbershop({ slug: `unknown-${nanoidSlug()}` })
			.availability.get({ query: { date: '2030-01-15' } })

		expect(response.status).toBe(404)
	})

	it('POST /appointment creates an appointment and returns 201', async () => {
		const scheduledAt = getFutureWibIso(1, 11, 0)

		const response = await (tClient as any).api.public
			.barbershop({ slug: apptSlug })
			.appointment.post({
				customerName: 'Public Customer',
				serviceIds: [activeServiceId],
				scheduledAt
			})

		expect(response.status).toBe(201)
		const appt = (response.data as any)?.data
		expect(appt?.type).toBe('appointment')
		expect(appt?.status).toBe('requested')
		expect(appt?.customerName).toBe('Public Customer')
		expect(Array.isArray(appt?.serviceNames)).toBe(true)
		expect(appt?.referenceNumber).toBeTruthy()
	})

	it('POST /appointment returns 404 for unknown slug', async () => {
		const scheduledAt = getFutureWibIso(1, 11, 0)

		const response = await (tClient as any).api.public
			.barbershop({ slug: `unknown-${nanoidSlug()}` })
			.appointment.post({
				customerName: 'Ghost Customer',
				serviceIds: [activeServiceId],
				scheduledAt
			})

		expect(response.status).toBe(404)
	})

	it('POST /appointment returns 400 when scheduledAt is in the past', async () => {
		const pastAt = new Date(Date.now() - 60 * 60 * 1000).toISOString()

		const response = await (tClient as any).api.public
			.barbershop({ slug: apptSlug })
			.appointment.post({
				customerName: 'Past Customer',
				serviceIds: [activeServiceId],
				scheduledAt: pastAt
			})

		expect(response.status).toBe(400)
	})

	it('POST /appointment returns 400 when outside open hours', async () => {
		const earlyAt = getFutureWibIso(1, 7, 0)

		const response = await (tClient as any).api.public
			.barbershop({ slug: apptSlug })
			.appointment.post({
				customerName: 'Early Customer',
				serviceIds: [activeServiceId],
				scheduledAt: earlyAt
			})

		expect(response.status).toBe(400)
	})

	it('POST /appointment returns 400 for invalid serviceId', async () => {
		const scheduledAt = getFutureWibIso(1, 11, 0)

		const response = await (tClient as any).api.public
			.barbershop({ slug: apptSlug })
			.appointment.post({
				customerName: 'Bad Service Customer',
				serviceIds: [nanoid()],
				scheduledAt
			})

		expect(response.status).toBe(400)
	})

	it('created appointment can be accepted by owner (→ waiting)', async () => {
		const scheduledAt = getFutureWibIso(2, 11, 0)

		const createRes = await (tClient as any).api.public
			.barbershop({ slug: apptSlug })
			.appointment.post({
				customerName: 'Accept Lifecycle Customer',
				serviceIds: [activeServiceId],
				scheduledAt
			})
		expect(createRes.status).toBe(201)
		const bookingId = (createRes.data as any)?.data?.id as string

		const acceptRes = await (tClient as any).api
			.bookings({ id: bookingId })
			.accept.post(undefined, {
				fetch: { headers: { cookie: apptCookie } }
			})

		expect(acceptRes.status).toBe(200)
		expect((acceptRes.data as any)?.data?.status).toBe('waiting')
	})

	it('created appointment can be declined by owner (→ cancelled)', async () => {
		const scheduledAt = getFutureWibIso(2, 12, 0)

		const createRes = await (tClient as any).api.public
			.barbershop({ slug: apptSlug })
			.appointment.post({
				customerName: 'Decline Lifecycle Customer',
				serviceIds: [activeServiceId],
				scheduledAt
			})
		expect(createRes.status).toBe(201)
		const bookingId = (createRes.data as any)?.data?.id as string

		const declineRes = await (tClient as any).api
			.bookings({ id: bookingId })
			.decline.post(
				{ reason: 'No slot available' },
				{ fetch: { headers: { cookie: apptCookie } } }
			)

		expect(declineRes.status).toBe(200)
		expect((declineRes.data as any)?.data?.status).toBe('cancelled')
	})
})
