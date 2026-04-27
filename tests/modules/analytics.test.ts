import { afterAll, beforeAll, describe, expect, it } from 'bun:test'
import { eq } from 'drizzle-orm'
import { treaty } from '@elysiajs/eden'
import { nanoid } from 'nanoid'

import { app } from '../../src/app'
import { db } from '../../src/lib/database'
import { member } from '../../src/modules/auth/schema'
import {
	booking,
	bookingService,
	customer
} from '../../src/modules/bookings/schema'
import { service } from '../../src/modules/services/schema'

const tClient = treaty(app)
const ORIGIN = 'http://localhost:3001'
const WIB_OFFSET_MS = 7 * 60 * 60 * 1000

function toWib(date: Date): Date {
	return new Date(date.getTime() + WIB_OFFSET_MS)
}

function startOfDayWib(date: Date): Date {
	const wib = toWib(date)
	const utc = Date.UTC(
		wib.getUTCFullYear(),
		wib.getUTCMonth(),
		wib.getUTCDate()
	)
	return new Date(utc - WIB_OFFSET_MS)
}

async function createOwnerWithOrg(suffix: string) {
	const email = `analytics_${suffix}_${Date.now()}@example.com`
	const slug = `analytics-${suffix}-${Math.random().toString(36).substring(2, 8)}`

	const signUpRes = await (tClient as any).auth.api['sign-up'].email.post(
		{ email, password: 'password123', name: 'Analytics Owner' },
		{ fetch: { headers: { origin: ORIGIN } } }
	)
	const cookie = signUpRes.response?.headers.get('set-cookie') ?? ''

	const orgRes = await (tClient as any).auth.api.organization.create.post(
		{ name: `Analytics Shop ${suffix}`, slug },
		{ fetch: { headers: { cookie, origin: ORIGIN } } }
	)
	const orgId = orgRes.data?.id ?? ''

	const activeRes = await (tClient as any).auth.api.organization[
		'set-active'
	].post(
		{ organizationId: orgId },
		{ fetch: { headers: { cookie, origin: ORIGIN } } }
	)
	const authCookie = activeRes.response?.headers.get('set-cookie') ?? cookie

	const ownerMember = await db.query.member.findFirst({
		where: eq(member.organizationId, orgId)
	})
	if (!ownerMember)
		throw new Error('Owner member not found for analytics test')

	return { authCookie, orgId, ownerUserId: ownerMember.userId }
}

async function seedCustomer(organizationId: string): Promise<string> {
	const id = nanoid()
	await db.insert(customer).values({
		id,
		organizationId,
		name: 'Analytics Test Customer',
		phone: null,
		email: null,
		isVerified: false,
		notes: null
	})
	return id
}

async function seedService(organizationId: string): Promise<string> {
	const id = nanoid()
	await db.insert(service).values({
		id,
		organizationId,
		name: 'Analytics Test Service',
		description: null,
		price: 50_000,
		duration: 30,
		discount: 0,
		isActive: true,
		isDefault: false
	})
	return id
}

interface SeedBookingArgs {
	organizationId: string
	customerId: string
	createdById: string
	serviceId: string
	type: 'walk_in' | 'appointment'
	status: 'completed' | 'pending' | 'cancelled'
	completedAt: Date | null
	price: number
}

async function seedBooking(args: SeedBookingArgs): Promise<string> {
	const bookingId = nanoid()
	await db.insert(booking).values({
		id: bookingId,
		organizationId: args.organizationId,
		referenceNumber: `REF-${bookingId.slice(0, 8)}`,
		type: args.type,
		status: args.status,
		customerId: args.customerId,
		barberId: null,
		scheduledAt: null,
		notes: null,
		startedAt: null,
		completedAt: args.completedAt,
		cancelledAt: null,
		createdById: args.createdById
	})
	await db.insert(bookingService).values({
		id: nanoid(),
		bookingId,
		serviceId: args.serviceId,
		serviceName: 'Test Service',
		price: args.price,
		originalPrice: args.price,
		discount: 0,
		duration: 30
	})
	return bookingId
}

describe('Analytics Module', () => {
	let authCookie = ''
	let orgId = ''
	let ownerUserId = ''
	let customerId = ''
	let serviceId = ''

	// Second org for isolation test (T-7)
	let authCookieB = ''
	let orgIdB = ''

	const now = new Date()
	const todayStart = startOfDayWib(now)

	// Timestamps for seeding
	const currentWeekTs = new Date(
		todayStart.getTime() - 2 * 24 * 60 * 60 * 1000
	)
	const previousWeekTs = new Date(
		todayStart.getTime() - 9 * 24 * 60 * 60 * 1000
	)
	// Used in T-3 (scoped inside the test itself via this shared now)
	const current24hTs = new Date(now.getTime() - 2 * 60 * 60 * 1000)

	beforeAll(async () => {
		const ownerCtx = await createOwnerWithOrg('main')
		authCookie = ownerCtx.authCookie
		orgId = ownerCtx.orgId
		ownerUserId = ownerCtx.ownerUserId

		const ownerCtxB = await createOwnerWithOrg('isolation')
		authCookieB = ownerCtxB.authCookie
		orgIdB = ownerCtxB.orgId

		customerId = await seedCustomer(orgId)
		serviceId = await seedService(orgId)

		// Current week: 1 walk_in (100k) + 1 appointment (50k) = 150k sales, 2 bookings
		await seedBooking({
			organizationId: orgId,
			customerId,
			createdById: ownerUserId,
			serviceId,
			type: 'walk_in',
			status: 'completed',
			completedAt: currentWeekTs,
			price: 100_000
		})
		await seedBooking({
			organizationId: orgId,
			customerId,
			createdById: ownerUserId,
			serviceId,
			type: 'appointment',
			status: 'completed',
			completedAt: currentWeekTs,
			price: 50_000
		})

		// Previous week: 1 walk_in (50k) = 50k sales, 1 booking
		await seedBooking({
			organizationId: orgId,
			customerId,
			createdById: ownerUserId,
			serviceId,
			type: 'walk_in',
			status: 'completed',
			completedAt: previousWeekTs,
			price: 50_000
		})

		// Non-completed booking — must NOT contribute
		await seedBooking({
			organizationId: orgId,
			customerId,
			createdById: ownerUserId,
			serviceId,
			type: 'walk_in',
			status: 'pending',
			completedAt: null,
			price: 999_999
		})
	})

	afterAll(async () => {
		await db.delete(booking).where(eq(booking.organizationId, orgId))
		await db.delete(customer).where(eq(customer.organizationId, orgId))
		await db.delete(service).where(eq(service.organizationId, orgId))
		await db.delete(booking).where(eq(booking.organizationId, orgIdB))
	})

	// T-10: Unauthenticated returns 401
	it('T-10: returns 401 without authentication', async () => {
		const { status } = await tClient.api.analytics.get({
			query: { range: 'week' }
		})
		expect(status).toBe(401)
	})

	// T-11: Authenticated but no active org returns 403
	it('T-11: returns 403 without active organization', async () => {
		const noOrgRes = await (tClient as any).auth.api['sign-up'].email.post(
			{
				email: `analytics_noorg_${Date.now()}@example.com`,
				password: 'password123',
				name: 'No Org User'
			},
			{ fetch: { headers: { origin: ORIGIN } } }
		)
		const noOrgCookie = noOrgRes.response?.headers.get('set-cookie') ?? ''
		const { status } = await tClient.api.analytics.get({
			query: { range: 'week' },
			fetch: { headers: { cookie: noOrgCookie } }
		})
		expect(status).toBe(403)
	})

	// T-8: Invalid range returns 400/422
	it('T-8: returns 422 for invalid range value', async () => {
		const { status } = await (tClient as any).api.analytics.get({
			query: { range: 'forever' },
			fetch: { headers: { cookie: authCookie } }
		})
		expect(status).toBe(422)
	})

	// T-1: Correct totals for week range
	it('T-1: returns 200 with correct totalSales and totalBookings for range=week', async () => {
		const { status, data } = await tClient.api.analytics.get({
			query: { range: 'week' },
			fetch: { headers: { cookie: authCookie } }
		})
		expect(status).toBe(200)
		expect(data?.data.range).toBe('week')
		// current week: 100k + 50k = 150k, 2 bookings
		expect(data?.data.stats.totalSales.current).toBe(150_000)
		expect(data?.data.stats.totalBookings.current).toBe(2)
		// previous week: 50k, 1 booking
		expect(data?.data.stats.totalSales.previous).toBe(50_000)
		expect(data?.data.stats.totalBookings.previous).toBe(1)
	})

	// T-2: direction=up when current > previous
	it('T-2: returns direction=up and correct change% when current bookings double previous', async () => {
		const { data } = await tClient.api.analytics.get({
			query: { range: 'week' },
			fetch: { headers: { cookie: authCookie } }
		})
		// totalBookings: current=2, previous=1 → +100%
		expect(data?.data.stats.totalBookings.direction).toBe('up')
		expect(data?.data.stats.totalBookings.change).toBe(100)
	})

	// T-3: change=null and direction=neutral when previous=0
	it('T-3: returns change=null and direction=neutral when previous period has 0 bookings', async () => {
		const ctx = await createOwnerWithOrg('nullchange')
		const custId = await seedCustomer(ctx.orgId)
		const svcId = await seedService(ctx.orgId)

		// Only a current-period booking — previous will be 0
		await seedBooking({
			organizationId: ctx.orgId,
			customerId: custId,
			createdById: ctx.ownerUserId,
			serviceId: svcId,
			type: 'walk_in',
			status: 'completed',
			completedAt: current24hTs,
			price: 10_000
		})

		const { data } = await tClient.api.analytics.get({
			query: { range: '24h' },
			fetch: { headers: { cookie: ctx.authCookie } }
		})
		expect(data?.data.stats.totalBookings.change).toBeNull()
		expect(data?.data.stats.totalBookings.direction).toBe('neutral')

		await db.delete(booking).where(eq(booking.organizationId, ctx.orgId))
		await db.delete(customer).where(eq(customer.organizationId, ctx.orgId))
		await db.delete(service).where(eq(service.organizationId, ctx.orgId))
	})

	// T-4: Walk-in / appointment split
	it('T-4: returns correct walkIns and appointments split', async () => {
		const { data } = await tClient.api.analytics.get({
			query: { range: 'week' },
			fetch: { headers: { cookie: authCookie } }
		})
		expect(data?.data.stats.walkIns.current).toBe(1)
		expect(data?.data.stats.appointments.current).toBe(1)
	})

	// T-5: Exactly 7 chart buckets for week range
	it('T-5: returns exactly 7 chart buckets for range=week', async () => {
		const { data } = await tClient.api.analytics.get({
			query: { range: 'week' },
			fetch: { headers: { cookie: authCookie } }
		})
		expect(data?.data.chart.sales).toHaveLength(7)
		expect(data?.data.chart.bookings).toHaveLength(7)
		const bucket = data?.data.chart.sales[0]
		expect(bucket).toHaveProperty('label')
		expect(bucket).toHaveProperty('sales')
		expect(bucket).toHaveProperty('bookings')
	})

	// T-6: Non-completed bookings excluded
	it('T-6: pending bookings do not contribute to stats', async () => {
		const { data } = await tClient.api.analytics.get({
			query: { range: 'week' },
			fetch: { headers: { cookie: authCookie } }
		})
		// The pending booking has price 999_999 — if it leaked, sales would exceed 150k
		expect(data?.data.stats.totalSales.current).toBe(150_000)
		expect(data?.data.stats.totalBookings.current).toBe(2)
	})

	// T-7: Org isolation
	it('T-7: org B cannot see org A data', async () => {
		const { data } = await tClient.api.analytics.get({
			query: { range: 'week' },
			fetch: { headers: { cookie: authCookieB } }
		})
		expect(data?.data.stats.totalBookings.current).toBe(0)
		expect(data?.data.stats.totalSales.current).toBe(0)
	})

	// T-9: Cache hit — second request within 60s returns same result
	it('T-9: second request within 60s returns same cached result', async () => {
		const res1 = await tClient.api.analytics.get({
			query: { range: 'month' },
			fetch: { headers: { cookie: authCookie } }
		})
		const res2 = await tClient.api.analytics.get({
			query: { range: 'month' },
			fetch: { headers: { cookie: authCookie } }
		})
		expect(res1.status).toBe(200)
		expect(res2.status).toBe(200)
		expect(JSON.stringify(res1.data?.data)).toBe(
			JSON.stringify(res2.data?.data)
		)
	})

	// T-12: 24h returns exactly 24 chart buckets
	it('T-12: returns exactly 24 chart buckets for range=24h', async () => {
		const { data } = await tClient.api.analytics.get({
			query: { range: '24h' },
			fetch: { headers: { cookie: authCookie } }
		})
		expect(data?.data.chart.sales).toHaveLength(24)
		expect(data?.data.chart.bookings).toHaveLength(24)
	})

	// T-13: 6m returns exactly 6 chart buckets
	it('T-13: returns exactly 6 chart buckets for range=6m', async () => {
		const { data } = await tClient.api.analytics.get({
			query: { range: '6m' },
			fetch: { headers: { cookie: authCookie } }
		})
		expect(data?.data.chart.sales).toHaveLength(6)
		expect(data?.data.chart.bookings).toHaveLength(6)
	})

	// T-14: 1y returns exactly 12 chart buckets
	it('T-14: returns exactly 12 chart buckets for range=1y', async () => {
		const { data } = await tClient.api.analytics.get({
			query: { range: '1y' },
			fetch: { headers: { cookie: authCookie } }
		})
		expect(data?.data.chart.sales).toHaveLength(12)
		expect(data?.data.chart.bookings).toHaveLength(12)
	})
})
