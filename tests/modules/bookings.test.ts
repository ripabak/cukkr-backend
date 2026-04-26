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
import { openHour } from '../../src/modules/open-hours/schema'
import { service } from '../../src/modules/services/schema'

const tClient = treaty(app)
const ORIGIN = 'http://localhost:3001'
const LIST_DATE = '2026-04-26'
const WIB_OFFSET_MS = 7 * 60 * 60 * 1000

type BookingSeedStatus =
	| 'pending'
	| 'waiting'
	| 'in_progress'
	| 'completed'
	| 'cancelled'

interface OwnerContext {
	authCookie: string
	orgId: string
	ownerMemberId: string
	ownerUserId: string
}

interface ServiceSeed {
	id: string
	name: string
	price: number
	duration: number
	discount: number
}

interface CustomerSeed {
	id: string
	name: string
	phone: string | null
	email: string | null
}

type OpenHourSeed = {
	dayOfWeek: number
	isOpen: boolean
	openTime: string | null
	closeTime: string | null
}

function buildWeek(
	overrides: Partial<Record<number, Partial<OpenHourSeed>>> = {}
): OpenHourSeed[] {
	return Array.from({ length: 7 }, (_, dayOfWeek) => ({
		dayOfWeek,
		isOpen: false,
		openTime: null,
		closeTime: null,
		...overrides[dayOfWeek]
	}))
}

function toWibDate(date: Date): Date {
	return new Date(date.getTime() + WIB_OFFSET_MS)
}

function getFutureWibIso(
	dayOffset: number,
	hour: number,
	minute: number
): string {
	const now = toWibDate(new Date())
	const targetWib = new Date(
		Date.UTC(
			now.getUTCFullYear(),
			now.getUTCMonth(),
			now.getUTCDate() + dayOffset,
			hour,
			minute,
			0,
			0
		)
	)

	return new Date(targetWib.getTime() - WIB_OFFSET_MS).toISOString()
}

function extractReferenceSequence(referenceNumber: string): string {
	return referenceNumber.split('-')[2] ?? ''
}

async function createOwnerWithOrg(suffix: string): Promise<OwnerContext> {
	const email = `booking_${suffix}_${Date.now()}@example.com`
	const slug = `booking-${suffix}-${Math.random().toString(36).substring(2, 8)}`

	const signUpRes = await (tClient as any).auth.api['sign-up'].email.post(
		{ email, password: 'password123', name: 'Booking Owner' },
		{ fetch: { headers: { origin: ORIGIN } } }
	)
	const cookie = signUpRes.response?.headers.get('set-cookie') ?? ''

	const orgRes = await (tClient as any).auth.api.organization.create.post(
		{ name: `Booking Shop ${suffix}`, slug },
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
		throw new Error('Owner member was not created for booking test setup')
	}

	return {
		authCookie,
		orgId,
		ownerMemberId: ownerMember.id,
		ownerUserId: ownerMember.userId
	}
}

async function seedService(args: {
	organizationId: string
	name: string
	price: number
	duration: number
	discount?: number
	isActive?: boolean
}): Promise<ServiceSeed> {
	const row: ServiceSeed = {
		id: nanoid(),
		name: args.name,
		price: args.price,
		duration: args.duration,
		discount: args.discount ?? 0
	}

	await db.insert(service).values({
		id: row.id,
		organizationId: args.organizationId,
		name: row.name,
		description: `${row.name} description`,
		price: row.price,
		duration: row.duration,
		discount: row.discount,
		isActive: args.isActive ?? true,
		isDefault: false
	})

	return row
}

async function seedCustomer(args: {
	organizationId: string
	name: string
	phone?: string | null
	email?: string | null
}): Promise<CustomerSeed> {
	const row: CustomerSeed = {
		id: nanoid(),
		name: args.name,
		phone: args.phone ?? null,
		email: args.email ?? null
	}

	await db.insert(customer).values({
		id: row.id,
		organizationId: args.organizationId,
		name: row.name,
		phone: row.phone,
		email: row.email,
		isVerified: Boolean(row.phone || row.email),
		notes: null
	})

	return row
}

async function seedWeeklyOpenHours(
	organizationId: string,
	overrides: Partial<Record<number, Partial<OpenHourSeed>>>
): Promise<void> {
	await db.delete(openHour).where(eq(openHour.organizationId, organizationId))

	await db.insert(openHour).values(
		buildWeek(overrides).map((day) => ({
			id: nanoid(),
			organizationId,
			dayOfWeek: day.dayOfWeek,
			isOpen: day.isOpen,
			openTime: day.isOpen ? day.openTime : null,
			closeTime: day.isOpen ? day.closeTime : null
		}))
	)
}

async function seedBookingRecord(args: {
	organizationId: string
	createdById: string
	barberId: string
	type: 'walk_in' | 'appointment'
	status: BookingSeedStatus
	createdAt: Date
	scheduledAt?: Date | null
	customerName: string
	customerPhone?: string | null
	serviceNames: string[]
	notes?: string | null
}): Promise<{ bookingId: string }> {
	const seededCustomer = await seedCustomer({
		organizationId: args.organizationId,
		name: args.customerName,
		phone: args.customerPhone ?? null,
		email: `${nanoid()}@example.com`
	})
	const bookingId = nanoid()
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
		id: bookingId,
		organizationId: args.organizationId,
		referenceNumber: `BK-${LIST_DATE.replace(/-/g, '')}-${bookingId.slice(0, 3)}-AA`,
		type: args.type,
		status: args.status,
		customerId: seededCustomer.id,
		barberId: args.barberId,
		scheduledAt: args.scheduledAt ?? null,
		notes: args.notes ?? null,
		createdById: args.createdById,
		createdAt: args.createdAt,
		updatedAt: args.createdAt,
		startedAt,
		completedAt,
		cancelledAt
	})

	for (const [index, serviceName] of args.serviceNames.entries()) {
		const seededService = await seedService({
			organizationId: args.organizationId,
			name: `${serviceName}-${bookingId}-${index}`,
			price: 50000 + index * 10000,
			duration: 30 + index * 15,
			discount: index
		})

		await db.insert(bookingService).values({
			id: nanoid(),
			bookingId,
			serviceId: seededService.id,
			serviceName,
			price: seededService.price,
			originalPrice: seededService.price,
			discount: seededService.discount,
			duration: seededService.duration
		})
	}

	return { bookingId }
}

describe('Booking Read Endpoints', () => {
	let ownerA: OwnerContext
	let ownerB: OwnerContext
	let walkInBookingId = ''
	let appointmentBookingId = ''

	beforeAll(async () => {
		ownerA = await createOwnerWithOrg('read-a')
		ownerB = await createOwnerWithOrg('read-b')

		walkInBookingId = (
			await seedBookingRecord({
				organizationId: ownerA.orgId,
				createdById: ownerA.ownerUserId,
				barberId: ownerA.ownerMemberId,
				type: 'walk_in',
				status: 'waiting',
				createdAt: new Date('2026-04-26T09:00:00.000Z'),
				customerName: 'Walk In Customer',
				customerPhone: '081234567890',
				serviceNames: ['Classic Cut'],
				notes: 'Queue customer'
			})
		).bookingId

		appointmentBookingId = (
			await seedBookingRecord({
				organizationId: ownerA.orgId,
				createdById: ownerA.ownerUserId,
				barberId: ownerA.ownerMemberId,
				type: 'appointment',
				status: 'completed',
				createdAt: new Date('2026-04-25T12:00:00.000Z'),
				scheduledAt: new Date('2026-04-26T11:00:00.000Z'),
				customerName: 'Appointment Customer',
				customerPhone: '089876543210',
				serviceNames: ['Hair Wash', 'Premium Cut'],
				notes: 'Booked ahead'
			})
		).bookingId

		await seedBookingRecord({
			organizationId: ownerA.orgId,
			createdById: ownerA.ownerUserId,
			barberId: ownerA.ownerMemberId,
			type: 'walk_in',
			status: 'waiting',
			createdAt: new Date('2026-04-27T08:00:00.000Z'),
			customerName: 'Other Day Customer',
			customerPhone: '081111111111',
			serviceNames: ['Other Day Cut']
		})

		await seedBookingRecord({
			organizationId: ownerB.orgId,
			createdById: ownerB.ownerUserId,
			barberId: ownerB.ownerMemberId,
			type: 'walk_in',
			status: 'waiting',
			createdAt: new Date('2026-04-26T10:00:00.000Z'),
			customerName: 'Other Org Customer',
			customerPhone: '082222222222',
			serviceNames: ['Other Org Cut']
		})
	})

	it('returns 401 for GET /bookings without auth', async () => {
		const { status } = await tClient.api.bookings.get({
			query: { date: LIST_DATE }
		})
		expect(status).toBe(401)
	})

	it('lists same-day bookings inside the active organization', async () => {
		const { status, data } = await tClient.api.bookings.get({
			query: { date: LIST_DATE },
			fetch: { headers: { cookie: ownerA.authCookie } }
		})

		expect(status).toBe(200)
		expect(data?.data.map((item) => item.id)).toEqual([
			walkInBookingId,
			appointmentBookingId
		])
		expect(data?.data[0]?.customerName).toBe('Walk In Customer')
		expect(data?.data[1]?.serviceNames).toEqual([
			'Hair Wash',
			'Premium Cut'
		])
		expect(
			data?.data.every(
				(item) => item.barber?.memberId === ownerA.ownerMemberId
			)
		).toBe(true)
	})

	it('filters booking list by status and barber', async () => {
		const { status, data } = await tClient.api.bookings.get({
			query: {
				date: LIST_DATE,
				status: 'waiting',
				barberId: ownerA.ownerMemberId
			},
			fetch: { headers: { cookie: ownerA.authCookie } }
		})

		expect(status).toBe(200)
		expect(data?.data).toHaveLength(1)
		expect(data?.data[0]?.id).toBe(walkInBookingId)
	})

	it('returns booking detail with customer and snapshot services', async () => {
		const { status, data } = await tClient.api
			.bookings({
				id: appointmentBookingId
			})
			.get({
				fetch: { headers: { cookie: ownerA.authCookie } }
			})

		expect(status).toBe(200)
		expect(data?.data.customer.name).toBe('Appointment Customer')
		expect(data?.data.services.map((item) => item.serviceName)).toEqual([
			'Hair Wash',
			'Premium Cut'
		])
		expect(data?.data.barber?.memberId).toBe(ownerA.ownerMemberId)
		expect(data?.data.completedAt).toBeDefined()
	})

	it('returns 404 when reading another organization booking detail', async () => {
		const { status } = await tClient.api
			.bookings({
				id: appointmentBookingId
			})
			.get({
				fetch: { headers: { cookie: ownerB.authCookie } }
			})

		expect(status).toBe(404)
	})
})

describe('Booking Creation Endpoints', () => {
	let ownerA: OwnerContext
	let ownerB: OwnerContext
	let existingCustomer: CustomerSeed
	let activeServiceA: ServiceSeed
	let extraServiceA: ServiceSeed
	let crossOrgService: ServiceSeed

	beforeAll(async () => {
		ownerA = await createOwnerWithOrg('create-a')
		ownerB = await createOwnerWithOrg('create-b')
		existingCustomer = await seedCustomer({
			organizationId: ownerA.orgId,
			name: 'Existing Customer',
			phone: '+628123456789',
			email: null
		})
		activeServiceA = await seedService({
			organizationId: ownerA.orgId,
			name: 'Crew Cut',
			price: 100000,
			duration: 45,
			discount: 10
		})
		extraServiceA = await seedService({
			organizationId: ownerA.orgId,
			name: 'Beard Trim',
			price: 60000,
			duration: 20,
			discount: 0
		})
		crossOrgService = await seedService({
			organizationId: ownerB.orgId,
			name: 'Other Org Service',
			price: 75000,
			duration: 30,
			discount: 0
		})
		await seedWeeklyOpenHours(ownerA.orgId, {
			0: { isOpen: true, openTime: '09:00', closeTime: '17:00' },
			1: { isOpen: true, openTime: '09:00', closeTime: '17:00' },
			2: { isOpen: true, openTime: '09:00', closeTime: '17:00' },
			3: { isOpen: true, openTime: '09:00', closeTime: '17:00' },
			4: { isOpen: true, openTime: '09:00', closeTime: '17:00' },
			5: { isOpen: true, openTime: '09:00', closeTime: '17:00' },
			6: { isOpen: true, openTime: '09:00', closeTime: '17:00' }
		})
	})

	it('returns 401 for POST /bookings without auth', async () => {
		const { status } = await tClient.api.bookings.post({
			type: 'walk_in',
			customerName: 'No Auth',
			serviceIds: [activeServiceA.id]
		})
		expect(status).toBe(401)
	})

	it('creates a walk-in booking, matches an existing customer, and snapshots service pricing', async () => {
		const customerCountBefore = (
			await db.query.customer.findMany({
				where: eq(customer.organizationId, ownerA.orgId)
			})
		).length

		const { status, data } = await tClient.api.bookings.post(
			{
				type: 'walk_in',
				customerName: 'Budi',
				customerPhone: '08123456789',
				serviceIds: [activeServiceA.id, extraServiceA.id],
				barberId: ownerA.ownerMemberId,
				notes: 'Arrived without appointment'
			},
			{ fetch: { headers: { cookie: ownerA.authCookie } } }
		)

		expect(status).toBe(201)
		expect(data?.data.status).toBe('waiting')
		expect(data?.data.customer.id).toBe(existingCustomer.id)
		expect(data?.data.barber?.memberId).toBe(ownerA.ownerMemberId)
		expect(data?.data.referenceNumber).toMatch(
			/^BK-\d{8}-\d{3}-[A-Z0-9]{2}$/
		)
		expect(data?.data.services).toHaveLength(2)
		expect(data?.data.services[0]).toMatchObject({
			serviceId: activeServiceA.id,
			serviceName: activeServiceA.name,
			price: 90000,
			originalPrice: 100000,
			discount: 10,
			duration: 45
		})

		const customerCountAfter = (
			await db.query.customer.findMany({
				where: eq(customer.organizationId, ownerA.orgId)
			})
		).length
		expect(customerCountAfter).toBe(customerCountBefore)
	})

	it('rejects a booking that references a service from another organization', async () => {
		const { status } = await tClient.api.bookings.post(
			{
				type: 'walk_in',
				customerName: 'Invalid Service',
				serviceIds: [crossOrgService.id]
			},
			{ fetch: { headers: { cookie: ownerA.authCookie } } }
		)

		expect(status).toBe(400)
	})

	it('creates an appointment booking inside open hours', async () => {
		const scheduledAt = getFutureWibIso(1, 10, 0)

		const { status, data } = await tClient.api.bookings.post(
			{
				type: 'appointment',
				customerName: 'Booked Customer',
				customerEmail: 'booked@example.com',
				serviceIds: [activeServiceA.id],
				scheduledAt,
				barberId: ownerA.ownerMemberId,
				notes: 'Phone booking'
			},
			{ fetch: { headers: { cookie: ownerA.authCookie } } }
		)

		expect(status).toBe(201)
		expect(data?.data.status).toBe('waiting')
		expect(data?.data.scheduledAt).toBeDefined()
		expect(data?.data.customer.email).toBe('booked@example.com')
	})

	it('returns 422 when appointment scheduledAt is missing', async () => {
		const { status } = await tClient.api.bookings.post(
			{
				type: 'appointment',
				customerName: 'Missing Schedule',
				serviceIds: [activeServiceA.id]
			} as any,
			{ fetch: { headers: { cookie: ownerA.authCookie } } }
		)

		expect(status).toBe(422)
	})

	it('returns 400 when appointment scheduledAt is in the past', async () => {
		const { status } = await tClient.api.bookings.post(
			{
				type: 'appointment',
				customerName: 'Past Appointment',
				serviceIds: [activeServiceA.id],
				scheduledAt: new Date(Date.now() - 60 * 60 * 1000).toISOString()
			},
			{ fetch: { headers: { cookie: ownerA.authCookie } } }
		)

		expect(status).toBe(400)
	})

	it('returns 400 when appointment scheduledAt falls outside open hours', async () => {
		const scheduledAt = getFutureWibIso(1, 18, 30)

		const { status } = await tClient.api.bookings.post(
			{
				type: 'appointment',
				customerName: 'Late Appointment',
				serviceIds: [activeServiceA.id],
				scheduledAt
			},
			{ fetch: { headers: { cookie: ownerA.authCookie } } }
		)

		expect(status).toBe(400)
	})

	it('generates unique sequential reference numbers within the same organization day', async () => {
		const ownerRef = await createOwnerWithOrg('ref')
		const refService = await seedService({
			organizationId: ownerRef.orgId,
			name: 'Reference Service',
			price: 85000,
			duration: 40
		})

		const [first, second] = await Promise.all([
			tClient.api.bookings.post(
				{
					type: 'walk_in',
					customerName: 'Seq One',
					serviceIds: [refService.id]
				},
				{ fetch: { headers: { cookie: ownerRef.authCookie } } }
			),
			tClient.api.bookings.post(
				{
					type: 'walk_in',
					customerName: 'Seq Two',
					serviceIds: [refService.id]
				},
				{ fetch: { headers: { cookie: ownerRef.authCookie } } }
			)
		])

		expect(first.status).toBe(201)
		expect(second.status).toBe(201)

		const sequences = [
			extractReferenceSequence(first.data?.data.referenceNumber ?? ''),
			extractReferenceSequence(second.data?.data.referenceNumber ?? '')
		].sort()

		expect(sequences).toEqual(['001', '002'])
		expect(first.data?.data.referenceNumber).not.toBe(
			second.data?.data.referenceNumber
		)
	})
})

describe('Booking Lifecycle Endpoints', () => {
	let owner: OwnerContext
	let waitingBookingId = ''
	let inProgressBookingId = ''
	let completedBookingId = ''
	let pendingBookingId = ''

	beforeAll(async () => {
		owner = await createOwnerWithOrg('lifecycle')

		waitingBookingId = (
			await seedBookingRecord({
				organizationId: owner.orgId,
				createdById: owner.ownerUserId,
				barberId: owner.ownerMemberId,
				type: 'walk_in',
				status: 'waiting',
				createdAt: new Date(),
				customerName: 'Waiting Customer',
				serviceNames: ['Waiting Cut']
			})
		).bookingId

		inProgressBookingId = (
			await seedBookingRecord({
				organizationId: owner.orgId,
				createdById: owner.ownerUserId,
				barberId: owner.ownerMemberId,
				type: 'walk_in',
				status: 'in_progress',
				createdAt: new Date(),
				customerName: 'In Progress Customer',
				serviceNames: ['Active Cut']
			})
		).bookingId

		completedBookingId = (
			await seedBookingRecord({
				organizationId: owner.orgId,
				createdById: owner.ownerUserId,
				barberId: owner.ownerMemberId,
				type: 'walk_in',
				status: 'completed',
				createdAt: new Date(),
				customerName: 'Completed Customer',
				serviceNames: ['Completed Cut']
			})
		).bookingId

		pendingBookingId = (
			await seedBookingRecord({
				organizationId: owner.orgId,
				createdById: owner.ownerUserId,
				barberId: owner.ownerMemberId,
				type: 'appointment',
				status: 'pending',
				createdAt: new Date(),
				scheduledAt: new Date(Date.now() + 2 * 60 * 60 * 1000),
				customerName: 'Pending Customer',
				serviceNames: ['Pending Cut']
			})
		).bookingId
	})

	it('updates waiting bookings to in_progress and sets startedAt', async () => {
		const { status, data } = await (tClient as any).api.bookings[
			waitingBookingId
		].status.patch(
			{ status: 'in_progress' },
			{ fetch: { headers: { cookie: owner.authCookie } } }
		)

		expect(status).toBe(200)
		expect(data?.data.status).toBe('in_progress')
		expect(data?.data.startedAt).toBeDefined()
	})

	it('reverts in_progress bookings back to waiting and clears startedAt', async () => {
		const { status, data } = await (tClient as any).api.bookings[
			inProgressBookingId
		].status.patch(
			{ status: 'waiting' },
			{ fetch: { headers: { cookie: owner.authCookie } } }
		)

		expect(status).toBe(200)
		expect(data?.data.status).toBe('waiting')
		expect(data?.data.startedAt).toBeNull()
	})

	it('allows pending appointments to move to waiting', async () => {
		const { status, data } = await (tClient as any).api.bookings[
			pendingBookingId
		].status.patch(
			{ status: 'waiting' },
			{ fetch: { headers: { cookie: owner.authCookie } } }
		)

		expect(status).toBe(200)
		expect(data?.data.status).toBe('waiting')
	})

	it('completes in_progress bookings and sets completedAt', async () => {
		const promoted = await (tClient as any).api.bookings[
			inProgressBookingId
		].status.patch(
			{ status: 'in_progress' },
			{ fetch: { headers: { cookie: owner.authCookie } } }
		)
		expect(promoted.status).toBe(200)

		const { status, data } = await (tClient as any).api.bookings[
			inProgressBookingId
		].status.patch(
			{ status: 'completed' },
			{ fetch: { headers: { cookie: owner.authCookie } } }
		)

		expect(status).toBe(200)
		expect(data?.data.status).toBe('completed')
		expect(data?.data.completedAt).toBeDefined()
	})

	it('rejects invalid waiting to completed transitions', async () => {
		const invalidBooking = (
			await seedBookingRecord({
				organizationId: owner.orgId,
				createdById: owner.ownerUserId,
				barberId: owner.ownerMemberId,
				type: 'walk_in',
				status: 'waiting',
				createdAt: new Date(),
				customerName: 'Invalid Transition Customer',
				serviceNames: ['Invalid Transition Cut']
			})
		).bookingId

		const { status } = await (tClient as any).api.bookings[
			invalidBooking
		].status.patch(
			{ status: 'completed' },
			{ fetch: { headers: { cookie: owner.authCookie } } }
		)

		expect(status).toBe(400)
	})

	it('rejects further transitions from completed bookings', async () => {
		const { status } = await (tClient as any).api.bookings[
			completedBookingId
		].status.patch(
			{ status: 'cancelled' },
			{ fetch: { headers: { cookie: owner.authCookie } } }
		)

		expect(status).toBe(400)
	})
})
