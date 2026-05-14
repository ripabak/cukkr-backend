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

function startOfDayWib(date: Date): Date {
	const wib = new Date(date.getTime() + WIB_OFFSET_MS)
	const utc = Date.UTC(
		wib.getUTCFullYear(),
		wib.getUTCMonth(),
		wib.getUTCDate()
	)
	return new Date(utc - WIB_OFFSET_MS)
}

async function createOwnerWithOrg(suffix: string) {
	const email = `det_${suffix}_${Date.now()}@example.com`
	const slug = `det-${suffix}-${Math.random().toString(36).substring(2, 8)}`

	const signUpRes = await (tClient as any).auth.api['sign-up'].email.post(
		{ email, password: 'password123', name: 'Detail Owner' },
		{ fetch: { headers: { origin: ORIGIN } } }
	)
	const cookie = signUpRes.response?.headers.get('set-cookie') ?? ''

	const orgRes = await (tClient as any).auth.api.organization.create.post(
		{ name: `Detail Shop ${suffix}`, slug },
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
	if (!ownerMember) throw new Error('Owner member not found')

	return {
		authCookie,
		orgId,
		ownerUserId: ownerMember.userId,
		ownerMemberId: ownerMember.id
	}
}

async function seedCustomer(
	organizationId: string,
	name = 'Test Customer'
): Promise<string> {
	const id = nanoid()
	await db.insert(customer).values({
		id,
		organizationId,
		name,
		phone: null,
		email: null,
		isVerified: false,
		notes: null
	})
	return id
}

async function seedService(
	organizationId: string,
	name = 'Test Service',
	price = 50_000,
	duration = 30
): Promise<string> {
	const id = nanoid()
	await db.insert(service).values({
		id,
		organizationId,
		name,
		description: null,
		price,
		duration,
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
	serviceName?: string
	type?: 'walk_in' | 'appointment'
	status?: 'completed' | 'pending'
	completedAt?: Date | null
	price?: number
	duration?: number
	handledByBarberId?: string | null
}

async function seedBooking(args: SeedBookingArgs): Promise<string> {
	const bookingId = nanoid()
	const now = new Date()
	await db.insert(booking).values({
		id: bookingId,
		organizationId: args.organizationId,
		referenceNumber: `REF-${bookingId.slice(0, 8)}`,
		type: args.type ?? 'walk_in',
		status: args.status ?? 'completed',
		customerId: args.customerId,
		barberId: null,
		handledByBarberId: args.handledByBarberId ?? null,
		scheduledAt: null,
		notes: null,
		startedAt: null,
		completedAt: args.completedAt !== undefined ? args.completedAt : now,
		cancelledAt: null,
		createdById: args.createdById
	})
	await db.insert(bookingService).values({
		id: nanoid(),
		bookingId,
		serviceId: args.serviceId,
		serviceName: args.serviceName ?? 'Test Service',
		price: args.price ?? 50_000,
		originalPrice: args.price ?? 50_000,
		discount: 0,
		duration: args.duration ?? 30
	})
	return bookingId
}

async function cleanupOrg(orgId: string) {
	await db.delete(booking).where(eq(booking.organizationId, orgId))
	await db.delete(customer).where(eq(customer.organizationId, orgId))
	await db.delete(service).where(eq(service.organizationId, orgId))
}

// ─── Revenue analytics ────────────────────────────────────────────────────────

describe('Analytics - Revenue Detail', () => {
	let authCookie = ''
	let orgId = ''
	let ownerUserId = ''
	let customerId = ''
	let serviceId = ''

	const now = new Date()
	const weekTs = new Date(
		startOfDayWib(now).getTime() - 2 * 24 * 60 * 60 * 1000
	)

	beforeAll(async () => {
		const ctx = await createOwnerWithOrg('rev')
		authCookie = ctx.authCookie
		orgId = ctx.orgId
		ownerUserId = ctx.ownerUserId
		customerId = await seedCustomer(orgId)
		serviceId = await seedService(orgId, 'Hair Cut', 80_000, 40)

		// 2 completed bookings in current week
		await seedBooking({
			organizationId: orgId,
			customerId,
			createdById: ownerUserId,
			serviceId,
			serviceName: 'Hair Cut',
			price: 80_000,
			duration: 40,
			completedAt: weekTs
		})
		await seedBooking({
			organizationId: orgId,
			customerId,
			createdById: ownerUserId,
			serviceId,
			serviceName: 'Hair Cut',
			price: 60_000,
			duration: 30,
			completedAt: weekTs,
			type: 'appointment'
		})
	})

	afterAll(() => cleanupOrg(orgId))

	it('RV-01: returns 401 without auth', async () => {
		const { status } = await (tClient as any).api.analytics.revenue.get({
			query: { range: 'week' }
		})
		expect(status).toBe(401)
	})

	it('RV-02: returns revenue stats with correct totalBookings', async () => {
		const { status, data } = await (
			tClient as any
		).api.analytics.revenue.get({
			query: { range: 'week' },
			fetch: { headers: { cookie: authCookie } }
		})
		expect(status).toBe(200)
		expect(data?.data.range).toBe('week')
		expect(data?.data.stats.totalBookings.current).toBe(2)
	})

	it('RV-03: avgRevenuePerBooking is calculated correctly', async () => {
		const { data } = await (tClient as any).api.analytics.revenue.get({
			query: { range: 'week' },
			fetch: { headers: { cookie: authCookie } }
		})
		// (80k + 60k) / 2 = 70k
		expect(data?.data.stats.avgRevenuePerBooking.current).toBe(70_000)
	})

	it('RV-04: avgTime is calculated from service durations', async () => {
		const { data } = await (tClient as any).api.analytics.revenue.get({
			query: { range: 'week' },
			fetch: { headers: { cookie: authCookie } }
		})
		// (40 + 30) / 2 = 35 minutes
		expect(data?.data.stats.avgTime.current).toBe(35)
	})

	it('RV-05: chart has correct bucket count for week', async () => {
		const { data } = await (tClient as any).api.analytics.revenue.get({
			query: { range: 'week' },
			fetch: { headers: { cookie: authCookie } }
		})
		expect(data?.data.chart).toHaveLength(7)
		expect(data?.data.chart[0]).toHaveProperty('label')
		expect(data?.data.chart[0]).toHaveProperty('value')
	})

	it('RV-06: booking list returns paginated results with correct fields', async () => {
		const { status, data } = await (
			tClient as any
		).api.analytics.revenue.bookings.get({
			query: { range: 'week', page: 1, limit: 10 },
			fetch: { headers: { cookie: authCookie } }
		})
		expect(status).toBe(200)
		expect(data?.data).toHaveLength(2)
		expect(data?.meta?.totalItems).toBe(2)

		const item = data?.data[0]
		expect(item).toHaveProperty('bookingId')
		expect(item).toHaveProperty('customerId')
		expect(item).toHaveProperty('customerName')
		expect(item).toHaveProperty('completedAt')
		expect(item).toHaveProperty('services')
		expect(item).toHaveProperty('revenue')
		expect(item.customerId).toBe(customerId)
		expect(Array.isArray(item.services)).toBe(true)
		expect(item.services[0]).toBe('Hair Cut')
	})

	it('RV-07: booking list pagination works correctly', async () => {
		const { data } = await (
			tClient as any
		).api.analytics.revenue.bookings.get({
			query: { range: 'week', page: 1, limit: 1 },
			fetch: { headers: { cookie: authCookie } }
		})
		expect(data?.data).toHaveLength(1)
		expect(data?.meta?.totalItems).toBe(2)
		expect(data?.meta?.totalPages).toBe(2)
		expect(data?.meta?.hasNext).toBe(true)
	})

	it('RV-08: empty period returns zero stats', async () => {
		const ctx = await createOwnerWithOrg('revempty')
		const { data } = await (tClient as any).api.analytics.revenue.get({
			query: { range: 'week' },
			fetch: { headers: { cookie: ctx.authCookie } }
		})
		expect(data?.data.stats.totalBookings.current).toBe(0)
		expect(data?.data.stats.avgRevenuePerBooking.current).toBe(0)
		expect(data?.data.stats.avgTime.current).toBe(0)
	})
})

// ─── Customer analytics ──────────────────────────────────────────────────────

describe('Analytics - Customer Detail', () => {
	let authCookie = ''
	let orgId = ''
	let ownerUserId = ''
	let custIdNew = ''
	let custIdReturn = ''
	let serviceId = ''

	const now = new Date()
	const weekTs = new Date(
		startOfDayWib(now).getTime() - 2 * 24 * 60 * 60 * 1000
	)
	// A timestamp well before the current week (for seeding old bookings)
	const oldTs = new Date(
		startOfDayWib(now).getTime() - 30 * 24 * 60 * 60 * 1000
	)

	beforeAll(async () => {
		const ctx = await createOwnerWithOrg('cust')
		authCookie = ctx.authCookie
		orgId = ctx.orgId
		ownerUserId = ctx.ownerUserId
		serviceId = await seedService(orgId)

		custIdNew = await seedCustomer(orgId, 'New Customer')
		custIdReturn = await seedCustomer(orgId, 'Return Customer')

		// custIdReturn has a booking from BEFORE the current week (makes them a returning customer)
		await seedBooking({
			organizationId: orgId,
			customerId: custIdReturn,
			createdById: ownerUserId,
			serviceId,
			price: 50_000,
			completedAt: oldTs
		})

		// Both customers have bookings in current week
		await seedBooking({
			organizationId: orgId,
			customerId: custIdNew,
			createdById: ownerUserId,
			serviceId,
			price: 50_000,
			completedAt: weekTs,
			type: 'walk_in'
		})
		await seedBooking({
			organizationId: orgId,
			customerId: custIdReturn,
			createdById: ownerUserId,
			serviceId,
			price: 70_000,
			completedAt: weekTs,
			type: 'appointment'
		})
	})

	afterAll(() => cleanupOrg(orgId))

	it('CA-01: returns 401 without auth', async () => {
		const { status } = await (tClient as any).api.analytics.customers.get({
			query: { range: 'week' }
		})
		expect(status).toBe(401)
	})

	it('CA-02: returns correct totalCustomers, totalNew, totalReturn for week', async () => {
		const { status, data } = await (
			tClient as any
		).api.analytics.customers.get({
			query: { range: 'week' },
			fetch: { headers: { cookie: authCookie } }
		})
		expect(status).toBe(200)
		expect(data?.data.stats.totalCustomers.current).toBe(2)
		expect(data?.data.stats.totalNew.current).toBe(1)
		expect(data?.data.stats.totalReturn.current).toBe(1)
	})

	it('CA-03: returns correct walk-in and appointment split', async () => {
		const { data } = await (tClient as any).api.analytics.customers.get({
			query: { range: 'week' },
			fetch: { headers: { cookie: authCookie } }
		})
		expect(data?.data.stats.totalWalkIn.current).toBe(1)
		expect(data?.data.stats.totalAppointment.current).toBe(1)
	})

	it('CA-04: chart has correct bucket count', async () => {
		const { data } = await (tClient as any).api.analytics.customers.get({
			query: { range: 'week' },
			fetch: { headers: { cookie: authCookie } }
		})
		expect(data?.data.chart).toHaveLength(7)
	})

	it('CA-05: customer list returns all customers with correct fields', async () => {
		const { status, data } = await (tClient as any).api.analytics[
			'customers'
		]['list'].get({
			query: { range: 'week', status: 'all' },
			fetch: { headers: { cookie: authCookie } }
		})
		expect(status).toBe(200)
		expect(data?.data).toHaveLength(2)

		const item = data?.data[0]
		expect(item).toHaveProperty('customerId')
		expect(item).toHaveProperty('customerName')
		expect(item).toHaveProperty('totalVisits')
		expect(item).toHaveProperty('lastVisitDate')
		expect(item).toHaveProperty('status')
		expect(item).toHaveProperty('totalRevenue')
		expect(['new', 'return']).toContain(item.status)
	})

	it('CA-06: customer list status=new filters correctly', async () => {
		const { data } = await (tClient as any).api.analytics['customers'][
			'list'
		].get({
			query: { range: 'week', status: 'new' },
			fetch: { headers: { cookie: authCookie } }
		})
		expect(data?.data).toHaveLength(1)
		expect(data?.data[0].customerId).toBe(custIdNew)
		expect(data?.data[0].status).toBe('new')
	})

	it('CA-07: customer list status=return filters correctly', async () => {
		const { data } = await (tClient as any).api.analytics['customers'][
			'list'
		].get({
			query: { range: 'week', status: 'return' },
			fetch: { headers: { cookie: authCookie } }
		})
		expect(data?.data).toHaveLength(1)
		expect(data?.data[0].customerId).toBe(custIdReturn)
		expect(data?.data[0].status).toBe('return')
	})

	it('CA-08: customer list pagination works', async () => {
		const { data } = await (tClient as any).api.analytics['customers'][
			'list'
		].get({
			query: { range: 'week', status: 'all', page: 1, limit: 1 },
			fetch: { headers: { cookie: authCookie } }
		})
		expect(data?.data).toHaveLength(1)
		expect(data?.meta?.totalItems).toBe(2)
		expect(data?.meta?.hasNext).toBe(true)
	})

	it('CA-09: customer list includes customerId on each item', async () => {
		const { data } = await (tClient as any).api.analytics['customers'][
			'list'
		].get({
			query: { range: 'week', status: 'all' },
			fetch: { headers: { cookie: authCookie } }
		})
		const ids = data?.data.map((d: any) => d.customerId)
		expect(ids).toContain(custIdNew)
		expect(ids).toContain(custIdReturn)
	})
})

// ─── Barbers analytics ────────────────────────────────────────────────────────

describe('Analytics - Barbers', () => {
	let authCookie = ''
	let orgId = ''
	let ownerUserId = ''
	let ownerMemberId = ''
	let customerId = ''
	let serviceId = ''

	const now = new Date()
	const weekTs = new Date(
		startOfDayWib(now).getTime() - 2 * 24 * 60 * 60 * 1000
	)

	beforeAll(async () => {
		const ctx = await createOwnerWithOrg('barb')
		authCookie = ctx.authCookie
		orgId = ctx.orgId
		ownerUserId = ctx.ownerUserId
		ownerMemberId = ctx.ownerMemberId
		customerId = await seedCustomer(orgId)
		serviceId = await seedService(orgId)

		// 2 bookings handled by the owner member
		await seedBooking({
			organizationId: orgId,
			customerId,
			createdById: ownerUserId,
			serviceId,
			price: 100_000,
			completedAt: weekTs,
			handledByBarberId: ownerMemberId
		})
		await seedBooking({
			organizationId: orgId,
			customerId,
			createdById: ownerUserId,
			serviceId,
			price: 80_000,
			completedAt: weekTs,
			handledByBarberId: ownerMemberId
		})
	})

	afterAll(() => cleanupOrg(orgId))

	it('BA-01: returns 401 without auth', async () => {
		const { status } = await (tClient as any).api.analytics.barbers.get({
			query: { range: 'week' }
		})
		expect(status).toBe(401)
	})

	it('BA-02: chart returns barber revenue with correct shape', async () => {
		const { status, data } = await (
			tClient as any
		).api.analytics.barbers.get({
			query: { range: 'week' },
			fetch: { headers: { cookie: authCookie } }
		})
		expect(status).toBe(200)
		expect(Array.isArray(data?.data.chart)).toBe(true)

		const owner = data?.data.chart.find(
			(b: any) => b.barberId === ownerMemberId
		)
		expect(owner).toBeDefined()
		expect(owner.barberName).toBe('Detail Owner')
		expect(owner.value).toBe(180_000)
	})

	it('BA-03: chart items have barberId, barberName, value', async () => {
		const { data } = await (tClient as any).api.analytics.barbers.get({
			query: { range: 'week' },
			fetch: { headers: { cookie: authCookie } }
		})
		const item = data?.data.chart[0]
		expect(item).toHaveProperty('barberId')
		expect(item).toHaveProperty('barberName')
		expect(item).toHaveProperty('value')
	})

	it('BA-04: barber list returns correct totalCustomers and totalRevenue', async () => {
		const { status, data } = await (
			tClient as any
		).api.analytics.barbers.list.get({
			query: { range: 'week' },
			fetch: { headers: { cookie: authCookie } }
		})
		expect(status).toBe(200)
		expect(Array.isArray(data?.data)).toBe(true)

		const owner = data?.data.find((b: any) => b.barberId === ownerMemberId)
		expect(owner).toBeDefined()
		expect(owner.name).toBe('Detail Owner')
		// Both bookings have same customerId → 1 distinct customer
		expect(owner.totalCustomers).toBe(1)
		expect(owner.totalRevenue).toBe(180_000)
	})

	it('BA-05: barber list items have barberId, name, imageUrl, totalCustomers, totalRevenue', async () => {
		const { data } = await (tClient as any).api.analytics.barbers.list.get({
			query: { range: 'week' },
			fetch: { headers: { cookie: authCookie } }
		})
		const item = data?.data[0]
		expect(item).toHaveProperty('barberId')
		expect(item).toHaveProperty('name')
		expect(item).toHaveProperty('imageUrl')
		expect(item).toHaveProperty('totalCustomers')
		expect(item).toHaveProperty('totalRevenue')
	})
})

// ─── Services analytics ───────────────────────────────────────────────────────

describe('Analytics - Services', () => {
	let authCookie = ''
	let orgId = ''
	let ownerUserId = ''
	let customerId = ''
	let serviceIdA = ''
	let serviceIdB = ''

	const now = new Date()
	const weekTs = new Date(
		startOfDayWib(now).getTime() - 2 * 24 * 60 * 60 * 1000
	)

	beforeAll(async () => {
		const ctx = await createOwnerWithOrg('svc')
		authCookie = ctx.authCookie
		orgId = ctx.orgId
		ownerUserId = ctx.ownerUserId
		customerId = await seedCustomer(orgId)
		serviceIdA = await seedService(orgId, 'Hair Cut', 80_000)
		serviceIdB = await seedService(orgId, 'Beard Trim', 40_000)

		// 3x Hair Cut, 1x Beard Trim → 4 total bookings
		for (let i = 0; i < 3; i++) {
			await seedBooking({
				organizationId: orgId,
				customerId,
				createdById: ownerUserId,
				serviceId: serviceIdA,
				serviceName: 'Hair Cut',
				price: 80_000,
				completedAt: weekTs
			})
		}
		await seedBooking({
			organizationId: orgId,
			customerId,
			createdById: ownerUserId,
			serviceId: serviceIdB,
			serviceName: 'Beard Trim',
			price: 40_000,
			completedAt: weekTs
		})
	})

	afterAll(() => cleanupOrg(orgId))

	it('SV-01: returns 401 without auth', async () => {
		const { status } = await (tClient as any).api.analytics.services.get({
			query: { range: 'week' }
		})
		expect(status).toBe(401)
	})

	it('SV-02: returns correct totalBookings and totalRevenue stats', async () => {
		const { status, data } = await (
			tClient as any
		).api.analytics.services.get({
			query: { range: 'week' },
			fetch: { headers: { cookie: authCookie } }
		})
		expect(status).toBe(200)
		expect(data?.data.stats.totalBookings.current).toBe(4)
		expect(data?.data.stats.totalRevenue.current).toBe(3 * 80_000 + 40_000)
	})

	it('SV-03: chart has correct service name labels and booking counts', async () => {
		const { data } = await (tClient as any).api.analytics.services.get({
			query: { range: 'week' },
			fetch: { headers: { cookie: authCookie } }
		})
		const chart = data?.data.chart
		expect(Array.isArray(chart)).toBe(true)
		const hairCut = chart.find((c: any) => c.label === 'Hair Cut')
		const beardTrim = chart.find((c: any) => c.label === 'Beard Trim')
		expect(hairCut?.value).toBe(3)
		expect(beardTrim?.value).toBe(1)
	})

	it('SV-04: service list returns items with correct fields and serviceId', async () => {
		const { status, data } = await (
			tClient as any
		).api.analytics.services.list.get({
			query: { range: 'week', page: 1, limit: 10 },
			fetch: { headers: { cookie: authCookie } }
		})
		expect(status).toBe(200)
		expect(data?.data).toHaveLength(2)

		const item = data?.data[0]
		expect(item).toHaveProperty('serviceId')
		expect(item).toHaveProperty('serviceName')
		expect(item).toHaveProperty('totalBookings')
		expect(item).toHaveProperty('percentage')
		expect(item).toHaveProperty('revenue')
	})

	it('SV-05: top service is Hair Cut with 3 bookings and 75% percentage', async () => {
		const { data } = await (tClient as any).api.analytics.services.list.get(
			{
				query: { range: 'week', page: 1, limit: 10 },
				fetch: { headers: { cookie: authCookie } }
			}
		)
		const top = data?.data[0]
		expect(top.serviceId).toBe(serviceIdA)
		expect(top.serviceName).toBe('Hair Cut')
		expect(top.totalBookings).toBe(3)
		// 3 / 4 total bookings = 75%
		expect(top.percentage).toBe(75)
		expect(top.revenue).toBe(240_000)
	})

	it('SV-06: service list pagination works', async () => {
		const { data } = await (tClient as any).api.analytics.services.list.get(
			{
				query: { range: 'week', page: 1, limit: 1 },
				fetch: { headers: { cookie: authCookie } }
			}
		)
		expect(data?.data).toHaveLength(1)
		expect(data?.meta?.totalItems).toBe(2)
		expect(data?.meta?.hasNext).toBe(true)
	})

	it('SV-07: Beard Trim has serviceId and correct percentage', async () => {
		const { data } = await (tClient as any).api.analytics.services.list.get(
			{
				query: { range: 'week', page: 1, limit: 10 },
				fetch: { headers: { cookie: authCookie } }
			}
		)
		const beardTrim = data?.data.find(
			(s: any) => s.serviceName === 'Beard Trim'
		)
		expect(beardTrim?.serviceId).toBe(serviceIdB)
		expect(beardTrim?.totalBookings).toBe(1)
		expect(beardTrim?.percentage).toBe(25)
	})
})
