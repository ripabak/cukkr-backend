import { beforeAll, describe, expect, it } from 'bun:test'
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

async function createOwnerWithOrg(suffix: string): Promise<{
	authCookie: string
	orgId: string
	memberId: string
	userId: string
}> {
	const email = `crm_${suffix}_${Date.now()}@example.com`
	const slug = `crm-${suffix}-${Math.random().toString(36).substring(2, 8)}`

	const signUpRes = await (tClient as any).auth.api['sign-up'].email.post(
		{ email, password: 'password123', name: 'CRM Owner' },
		{ fetch: { headers: { origin: ORIGIN } } }
	)
	const cookie = signUpRes.response?.headers.get('set-cookie') ?? ''

	const orgRes = await (tClient as any).auth.api.organization.create.post(
		{ name: `CRM Shop ${suffix}`, slug },
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

	if (!ownerMember) {
		throw new Error('Owner member not created for CRM test setup')
	}

	return {
		authCookie,
		orgId,
		memberId: ownerMember.id,
		userId: ownerMember.userId
	}
}

async function seedService(args: {
	organizationId: string
	name: string
	price: number
	duration: number
}): Promise<string> {
	const id = nanoid()
	await db.insert(service).values({
		id,
		organizationId: args.organizationId,
		name: args.name,
		description: null,
		price: args.price,
		duration: args.duration,
		discount: 0,
		isActive: true,
		isDefault: false
	})
	return id
}

async function seedCustomer(args: {
	organizationId: string
	name: string
	phone?: string | null
	email?: string | null
}): Promise<string> {
	const id = nanoid()
	await db.insert(customer).values({
		id,
		organizationId: args.organizationId,
		name: args.name,
		phone: args.phone ?? null,
		email: args.email ?? null,
		isVerified: Boolean(args.phone || args.email),
		notes: null
	})
	return id
}

async function seedBooking(args: {
	organizationId: string
	customerId: string
	createdById: string
	barberId: string
	type: 'walk_in' | 'appointment'
	status: 'pending' | 'waiting' | 'in_progress' | 'completed' | 'cancelled'
	createdAt: Date
	services: { name: string; price: number }[]
	refSuffix?: string
}): Promise<string> {
	const id = nanoid()
	const refSuffix = args.refSuffix ?? id.slice(0, 4).toUpperCase()
	const startedAt =
		args.status === 'in_progress' || args.status === 'completed'
			? new Date(args.createdAt.getTime() + 5 * 60 * 1000)
			: null
	const completedAt =
		args.status === 'completed'
			? new Date(args.createdAt.getTime() + 45 * 60 * 1000)
			: null
	const cancelledAt =
		args.status === 'cancelled'
			? new Date(args.createdAt.getTime() + 10 * 60 * 1000)
			: null

	await db.insert(booking).values({
		id,
		organizationId: args.organizationId,
		referenceNumber: `CRM-${refSuffix}`,
		type: args.type,
		status: args.status,
		customerId: args.customerId,
		barberId: args.barberId,
		scheduledAt: null,
		notes: null,
		createdById: args.createdById,
		createdAt: args.createdAt,
		updatedAt: args.createdAt,
		startedAt,
		completedAt,
		cancelledAt
	})

	for (const [idx, svc] of args.services.entries()) {
		const svcId = await seedService({
			organizationId: args.organizationId,
			name: `${svc.name}-${id}-${idx}`,
			price: svc.price,
			duration: 30
		})
		await db.insert(bookingService).values({
			id: nanoid(),
			bookingId: id,
			serviceId: svcId,
			serviceName: svc.name,
			price: svc.price,
			originalPrice: svc.price,
			discount: 0,
			duration: 30
		})
	}

	return id
}

describe('Customer Management Tests', () => {
	let ownerACookie = ''
	let ownerAOrgId = ''
	let ownerAMemberId = ''
	let ownerAUserId = ''
	let ownerBCookie = ''
	let budiId = ''
	let alexId = ''
	let noverifId = ''
	let otherOrgCustomerId = ''

	beforeAll(async () => {
		const ownerA = await createOwnerWithOrg('crmA')
		ownerACookie = ownerA.authCookie
		ownerAOrgId = ownerA.orgId
		ownerAMemberId = ownerA.memberId
		ownerAUserId = ownerA.userId

		const ownerB = await createOwnerWithOrg('crmB')
		ownerBCookie = ownerB.authCookie

		// Seed customers in Org A
		budiId = await seedCustomer({
			organizationId: ownerAOrgId,
			name: 'Budi Santoso',
			email: 'budi@example.com',
			phone: null
		})
		alexId = await seedCustomer({
			organizationId: ownerAOrgId,
			name: 'Alex Wijaya',
			phone: '081234567890',
			email: null
		})
		noverifId = await seedCustomer({
			organizationId: ownerAOrgId,
			name: 'Noverif User',
			phone: null,
			email: null
		})

		// Seed a customer in Org B for cross-tenant test
		otherOrgCustomerId = await seedCustomer({
			organizationId: ownerB.orgId,
			name: 'Other Org Customer',
			email: 'other@example.com'
		})

		// Seed bookings for Budi (3 bookings: 2 completed + 1 waiting)
		await seedBooking({
			organizationId: ownerAOrgId,
			customerId: budiId,
			createdById: ownerAUserId,
			barberId: ownerAMemberId,
			type: 'walk_in',
			status: 'completed',
			createdAt: new Date('2026-04-20T09:00:00.000Z'),
			services: [
				{ name: 'Fade Cut', price: 50000 },
				{ name: 'Hair Wash', price: 30000 }
			],
			refSuffix: 'B001'
		})
		await seedBooking({
			organizationId: ownerAOrgId,
			customerId: budiId,
			createdById: ownerAUserId,
			barberId: ownerAMemberId,
			type: 'walk_in',
			status: 'completed',
			createdAt: new Date('2026-04-22T10:00:00.000Z'),
			services: [{ name: 'Classic Cut', price: 40000 }],
			refSuffix: 'B002'
		})
		await seedBooking({
			organizationId: ownerAOrgId,
			customerId: budiId,
			createdById: ownerAUserId,
			barberId: ownerAMemberId,
			type: 'walk_in',
			status: 'waiting',
			createdAt: new Date('2026-04-24T08:00:00.000Z'),
			services: [{ name: 'Beard Trim', price: 25000 }],
			refSuffix: 'B003'
		})

		// Seed bookings for Alex (1 cancelled + 1 in_progress)
		await seedBooking({
			organizationId: ownerAOrgId,
			customerId: alexId,
			createdById: ownerAUserId,
			barberId: ownerAMemberId,
			type: 'walk_in',
			status: 'cancelled',
			createdAt: new Date('2026-04-21T11:00:00.000Z'),
			services: [{ name: 'Fade Cut', price: 50000 }],
			refSuffix: 'A001'
		})
		await seedBooking({
			organizationId: ownerAOrgId,
			customerId: alexId,
			createdById: ownerAUserId,
			barberId: ownerAMemberId,
			type: 'walk_in',
			status: 'in_progress',
			createdAt: new Date('2026-04-25T14:00:00.000Z'),
			services: [{ name: 'Classic Cut', price: 40000 }],
			refSuffix: 'A002'
		})

		// Noverif has no bookings
	})

	// --- AC-07: Unauthenticated → 401 for all routes ---
	describe('AC-07: Unauthenticated requests return 401', () => {
		it('GET /api/customers without cookie → 401', async () => {
			const { status } = await tClient.api.customers.get()
			expect(status).toBe(401)
		})

		it('GET /api/customers/:id without cookie → 401', async () => {
			const { status } = await tClient.api
				.customers({ id: 'any-id' })
				.get()
			expect(status).toBe(401)
		})

		it('GET /api/customers/:id/bookings without cookie → 401', async () => {
			const { status } = await tClient.api
				.customers({ id: 'any-id' })
				.bookings.get()
			expect(status).toBe(401)
		})

		it('PATCH /api/customers/:id/notes without cookie → 401', async () => {
			const { status } = await tClient.api
				.customers({ id: 'any-id' })
				.notes.patch({ notes: 'test' })
			expect(status).toBe(401)
		})
	})

	// --- AC-01a: List returns all customers with computed fields ---
	describe('AC-01a: List returns all customers with computed fields', () => {
		it('should return all 3 org-A customers with correct computed fields', async () => {
			const { status, data } = await tClient.api.customers.get({
				fetch: { headers: { cookie: ownerACookie } }
			})
			expect(status).toBe(200)
			const customers = data?.data ?? []
			expect(customers.length).toBeGreaterThanOrEqual(3)

			const budi = customers.find((c) => c.id === budiId)
			expect(budi).toBeDefined()
			expect(budi?.totalBookings).toBe(3)
			expect(budi?.totalSpend).toBe(120000)
			expect(budi?.lastVisitAt).not.toBeNull()

			const alex = customers.find((c) => c.id === alexId)
			expect(alex).toBeDefined()
			expect(alex?.totalBookings).toBe(1)
			expect(alex?.totalSpend).toBe(0)
		})
	})

	// --- AC-01b: Search by name (case-insensitive) ---
	describe('AC-01b: Search by name (case-insensitive)', () => {
		it('search=budi should return only Budi Santoso', async () => {
			const { status, data } = await tClient.api.customers.get({
				query: { search: 'budi' },
				fetch: { headers: { cookie: ownerACookie } }
			})
			expect(status).toBe(200)
			const customers = data?.data ?? []
			expect(customers.length).toBe(1)
			expect(customers[0]?.id).toBe(budiId)
		})

		it('search=BUDI (uppercase) should still return Budi Santoso', async () => {
			const { status, data } = await tClient.api.customers.get({
				query: { search: 'BUDI' },
				fetch: { headers: { cookie: ownerACookie } }
			})
			expect(status).toBe(200)
			expect(data?.data[0]?.id).toBe(budiId)
		})
	})

	// --- AC-01c: Sort by spend_desc ---
	describe('AC-01c: Sort by spend_desc puts highest spender first', () => {
		it('sort=spend_desc should return Budi first', async () => {
			const { status, data } = await tClient.api.customers.get({
				query: { sort: 'spend_desc' },
				fetch: { headers: { cookie: ownerACookie } }
			})
			expect(status).toBe(200)
			const customers = data?.data ?? []
			expect(customers[0]?.id).toBe(budiId)
		})
	})

	// --- AC-01d: Pagination page 2 limit 2 ---
	describe('AC-01d: Pagination page=2 limit=2', () => {
		it('page=2&limit=2 should return 1 item and correct meta', async () => {
			const { status, data } = await tClient.api.customers.get({
				query: { page: 2, limit: 2 },
				fetch: { headers: { cookie: ownerACookie } }
			})
			expect(status).toBe(200)
			expect(data?.data.length).toBe(1)
			expect(data?.meta?.page).toBe(2)
			expect(data?.meta?.limit).toBe(2)
			expect(data?.meta?.totalItems).toBeGreaterThanOrEqual(3)
			expect(data?.meta?.hasNext).toBe(false)
			expect(data?.meta?.hasPrev).toBe(true)
		})
	})

	// --- AC-02a: No contact → isVerified = false ---
	describe('AC-02a: Customer with no contact → isVerified = false', () => {
		it('Noverif User should have isVerified = false', async () => {
			const { status, data } = await tClient.api.customers.get({
				fetch: { headers: { cookie: ownerACookie } }
			})
			expect(status).toBe(200)
			const noverif = (data?.data ?? []).find((c) => c.id === noverifId)
			expect(noverif).toBeDefined()
			expect(noverif?.isVerified).toBe(false)
		})
	})

	// --- AC-02b: Email set → isVerified = true ---
	describe('AC-02b: Customer with email → isVerified = true', () => {
		it('Budi (has email) should have isVerified = true', async () => {
			const { status, data } = await tClient.api.customers.get({
				fetch: { headers: { cookie: ownerACookie } }
			})
			expect(status).toBe(200)
			const budi = (data?.data ?? []).find((c) => c.id === budiId)
			expect(budi?.isVerified).toBe(true)
		})
	})

	// --- AC-03a: Valid id → full profile with notes and aggregates ---
	describe('AC-03a: GET /customers/:id returns full profile', () => {
		it('should return CustomerDetailResponse with notes, aggregates, and createdAt', async () => {
			const { status, data } = await tClient.api
				.customers({ id: budiId })
				.get({ fetch: { headers: { cookie: ownerACookie } } })
			expect(status).toBe(200)
			const detail = data?.data
			expect(detail?.id).toBe(budiId)
			expect(detail?.name).toBe('Budi Santoso')
			expect(detail?.email).toBe('budi@example.com')
			expect(detail?.isVerified).toBe(true)
			expect(detail?.totalBookings).toBe(3)
			expect(detail?.totalSpend).toBe(120000)
			expect(detail?.notes).toBeNull()
			expect(detail?.createdAt).toBeDefined()
		})
	})

	// --- AC-03b: Cross-org id → 404 ---
	describe('AC-03b: Cross-org customer id returns 404', () => {
		it('using org-A session to GET a customer from org-B returns 404', async () => {
			const { status } = await tClient.api
				.customers({ id: otherOrgCustomerId })
				.get({ fetch: { headers: { cookie: ownerACookie } } })
			expect(status).toBe(404)
		})
	})

	// --- AC-04a: Booking history returns bookings with services, sorted desc ---
	describe('AC-04a: Booking history with services sorted desc', () => {
		it("Budi's 3 bookings returned with services and totalAmount, sorted createdAt DESC", async () => {
			const { status, data } = await tClient.api
				.customers({ id: budiId })
				.bookings.get({
					fetch: { headers: { cookie: ownerACookie } }
				})
			expect(status).toBe(200)
			const bookings = data?.data ?? []
			expect(bookings.length).toBe(3)

			// Sorted by createdAt DESC: B003 (Apr 24), B002 (Apr 22), B001 (Apr 20)
			expect(
				new Date(bookings[0]!.createdAt) >=
					new Date(bookings[1]!.createdAt)
			).toBe(true)
			expect(
				new Date(bookings[1]!.createdAt) >=
					new Date(bookings[2]!.createdAt)
			).toBe(true)

			// Each booking has services and totalAmount
			for (const b of bookings) {
				expect(b.services.length).toBeGreaterThan(0)
				expect(b.totalAmount).toBeGreaterThan(0)
				expect(b.referenceNumber).toBeDefined()
				expect(b.status).toBeDefined()
				expect(b.type).toBeDefined()
			}
		})
	})

	// --- AC-04b: Pagination on booking history ---
	describe('AC-04b: Pagination on booking history', () => {
		it('page=1&limit=2 returns 2 bookings with correct meta', async () => {
			const { status, data } = await tClient.api
				.customers({ id: budiId })
				.bookings.get({
					query: { page: 1, limit: 2 },
					fetch: { headers: { cookie: ownerACookie } }
				})
			expect(status).toBe(200)
			expect(data?.data.length).toBe(2)
			expect(data?.meta?.page).toBe(1)
			expect(data?.meta?.limit).toBe(2)
			expect(data?.meta?.totalItems).toBe(3)
			expect(data?.meta?.totalPages).toBe(2)
			expect(data?.meta?.hasNext).toBe(true)
			expect(data?.meta?.hasPrev).toBe(false)
		})
	})

	// --- AC-05a: PATCH notes → 200, notes updated ---
	describe('AC-05a: PATCH /customers/:id/notes updates notes', () => {
		it('should update notes and return updated CustomerDetailResponse', async () => {
			const { status, data } = await tClient.api
				.customers({ id: budiId })
				.notes.patch(
					{ notes: 'Prefers fade cut, allergic to certain products' },
					{ fetch: { headers: { cookie: ownerACookie } } }
				)
			expect(status).toBe(200)
			expect(data?.data.notes).toBe(
				'Prefers fade cut, allergic to certain products'
			)
			expect(data?.data.id).toBe(budiId)
		})
	})

	// --- AC-05b: PATCH notes > 2000 chars → 422 ---
	describe('AC-05b: PATCH notes exceeding 2000 chars returns 422', () => {
		it('notes with 2001 characters should return 422', async () => {
			const longNotes = 'a'.repeat(2001)
			const { status } = await tClient.api
				.customers({ id: budiId })
				.notes.patch(
					{ notes: longNotes },
					{ fetch: { headers: { cookie: ownerACookie } } }
				)
			expect(status).toBe(422)
		})
	})

	// --- AC-05c: PATCH notes empty string → 200, notes cleared ---
	describe('AC-05c: PATCH notes with empty string clears notes', () => {
		it('empty string clears notes (stores null)', async () => {
			const { status, data } = await tClient.api
				.customers({ id: budiId })
				.notes.patch(
					{ notes: '' },
					{ fetch: { headers: { cookie: ownerACookie } } }
				)
			expect(status).toBe(200)
			expect(data?.data.notes).toBeNull()
		})
	})

	// --- AC-06: Multi-tenant isolation ---
	describe('AC-06: Multi-tenant isolation', () => {
		it('Owner B session should not see Owner A customers', async () => {
			const { status, data } = await tClient.api.customers.get({
				fetch: { headers: { cookie: ownerBCookie } }
			})
			expect(status).toBe(200)
			const ids = (data?.data ?? []).map((c) => c.id)
			expect(ids).not.toContain(budiId)
			expect(ids).not.toContain(alexId)
			expect(ids).not.toContain(noverifId)
		})
	})
})

describe('Customer Stats and Booking Type Filter (F5)', () => {
	let statsOwnerCookie = ''
	let statsOrgId = ''
	let statsMemberId = ''
	let statsUserId = ''
	let statsCustomerId = ''

	beforeAll(async () => {
		const owner = await createOwnerWithOrg('statsF5')
		statsOwnerCookie = owner.authCookie
		statsOrgId = owner.orgId
		statsMemberId = owner.memberId
		statsUserId = owner.userId

		statsCustomerId = await seedCustomer({
			organizationId: statsOrgId,
			name: 'Stats Customer',
			email: 'stats@example.com'
		})

		await seedBooking({
			organizationId: statsOrgId,
			customerId: statsCustomerId,
			createdById: statsUserId,
			barberId: statsMemberId,
			type: 'appointment',
			status: 'completed',
			createdAt: new Date('2026-04-01T09:00:00.000Z'),
			services: [{ name: 'Haircut A', price: 50000 }],
			refSuffix: 'S001'
		})

		await seedBooking({
			organizationId: statsOrgId,
			customerId: statsCustomerId,
			createdById: statsUserId,
			barberId: statsMemberId,
			type: 'appointment',
			status: 'cancelled',
			createdAt: new Date('2026-04-02T10:00:00.000Z'),
			services: [{ name: 'Haircut B', price: 50000 }],
			refSuffix: 'S002'
		})

		await seedBooking({
			organizationId: statsOrgId,
			customerId: statsCustomerId,
			createdById: statsUserId,
			barberId: statsMemberId,
			type: 'walk_in',
			status: 'completed',
			createdAt: new Date('2026-04-03T11:00:00.000Z'),
			services: [{ name: 'Fade Cut', price: 40000 }],
			refSuffix: 'S003'
		})

		await seedBooking({
			organizationId: statsOrgId,
			customerId: statsCustomerId,
			createdById: statsUserId,
			barberId: statsMemberId,
			type: 'walk_in',
			status: 'waiting',
			createdAt: new Date('2026-04-04T12:00:00.000Z'),
			services: [{ name: 'Trim', price: 25000 }],
			refSuffix: 'S004'
		})
	})

	it('F5-01: GET /customers/:id includes all four stat fields', async () => {
		const { status, data } = await tClient.api
			.customers({ id: statsCustomerId })
			.get({ fetch: { headers: { cookie: statsOwnerCookie } } })

		expect(status).toBe(200)
		const detail = data?.data
		expect(typeof detail?.appointmentCount).toBe('number')
		expect(typeof detail?.walkInCount).toBe('number')
		expect(typeof detail?.completedCount).toBe('number')
		expect(typeof detail?.cancelledCount).toBe('number')
	})

	it('F5-02: stat counts match seeded bookings', async () => {
		const { data } = await tClient.api
			.customers({ id: statsCustomerId })
			.get({ fetch: { headers: { cookie: statsOwnerCookie } } })

		const detail = data?.data
		expect(detail?.appointmentCount).toBe(1)
		expect(detail?.walkInCount).toBe(2)
		expect(detail?.completedCount).toBe(2)
		expect(detail?.cancelledCount).toBe(1)
	})

	it('F5-03: GET /customers/:id/bookings?type=appointment returns only appointment bookings', async () => {
		const { status, data } = await (tClient as any).api
			.customers({ id: statsCustomerId })
			.bookings.get({
				query: { type: 'appointment' },
				fetch: { headers: { cookie: statsOwnerCookie } }
			})

		expect(status).toBe(200)
		const bookings = data?.data ?? []
		expect(bookings.length).toBe(2)
		for (const b of bookings) {
			expect(b.type).toBe('appointment')
		}
	})

	it('F5-04: GET /customers/:id/bookings?type=walk_in returns only walk-in bookings', async () => {
		const { status, data } = await (tClient as any).api
			.customers({ id: statsCustomerId })
			.bookings.get({
				query: { type: 'walk_in' },
				fetch: { headers: { cookie: statsOwnerCookie } }
			})

		expect(status).toBe(200)
		const bookings = data?.data ?? []
		expect(bookings.length).toBe(2)
		for (const b of bookings) {
			expect(b.type).toBe('walk_in')
		}
	})

	it('F5-05: GET /customers/:id/bookings?type=all returns all bookings', async () => {
		const { status, data } = await (tClient as any).api
			.customers({ id: statsCustomerId })
			.bookings.get({
				query: { type: 'all' },
				fetch: { headers: { cookie: statsOwnerCookie } }
			})

		expect(status).toBe(200)
		const bookings = data?.data ?? []
		expect(bookings.length).toBe(4)
	})

	it('F5-06: GET /customers/:id/bookings without type filter returns all bookings', async () => {
		const { status, data } = await tClient.api
			.customers({ id: statsCustomerId })
			.bookings.get({ fetch: { headers: { cookie: statsOwnerCookie } } })

		expect(status).toBe(200)
		const bookings = data?.data ?? []
		expect(bookings.length).toBe(4)
	})
})
