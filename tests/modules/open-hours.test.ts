import { beforeAll, describe, expect, it } from 'bun:test'
import { treaty } from '@elysiajs/eden'
import { nanoid } from 'nanoid'

import { app } from '../../src/app'
import { db } from '../../src/lib/database'
import { member } from '../../src/modules/auth/schema'

const tClient = treaty(app)
const ORIGIN = 'http://localhost:3001'

type AuthContext = {
	authCookie: string
	orgId: string
	userId: string
}

type OpenHoursDay = {
	dayOfWeek: number
	isOpen: boolean
	openTime: string | null
	closeTime: string | null
}

function buildWeek(
	overrides: Partial<Record<number, Partial<OpenHoursDay>>> = {}
): OpenHoursDay[] {
	return Array.from({ length: 7 }, (_, dayOfWeek) => ({
		dayOfWeek,
		isOpen: false,
		openTime: null,
		closeTime: null,
		...overrides[dayOfWeek]
	}))
}

async function signUpAndGetCookie(suffix: string): Promise<{
	cookie: string
	userId: string
}> {
	const email = `test_open_hours_${suffix}_${Date.now()}@example.com`
	const signUpRes = await (tClient as any).auth.api['sign-up'].email.post(
		{ email, password: 'password123', name: 'Test User' },
		{ fetch: { headers: { origin: ORIGIN } } }
	)
	const cookie = signUpRes.response?.headers.get('set-cookie') || ''

	const sessionRes = await (tClient as any).auth.api['get-session'].get({
		fetch: { headers: { cookie, origin: ORIGIN } }
	})

	return {
		cookie,
		userId: sessionRes.data?.user?.id ?? ''
	}
}

async function createOwnerWithOrg(suffix: string): Promise<AuthContext> {
	const { cookie, userId } = await signUpAndGetCookie(`owner_${suffix}`)
	const slug = `open-hours-${suffix}-${Math.random().toString(36).slice(2, 8)}`

	const orgRes = await (tClient as any).auth.api.organization.create.post(
		{ name: `Open Hours ${suffix}`, slug },
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
		authCookie: activeRes.response?.headers.get('set-cookie') || cookie,
		orgId,
		userId
	}
}

async function createBarberForOrg(
	organizationId: string
): Promise<AuthContext> {
	const { cookie, userId } = await signUpAndGetCookie('barber')

	await db.insert(member).values({
		id: nanoid(),
		organizationId,
		userId,
		role: 'barber',
		createdAt: new Date()
	})

	const activeRes = await (tClient as any).auth.api.organization[
		'set-active'
	].post(
		{ organizationId },
		{ fetch: { headers: { cookie, origin: ORIGIN } } }
	)

	return {
		authCookie: activeRes.response?.headers.get('set-cookie') || cookie,
		orgId: organizationId,
		userId
	}
}

describe('Open Hours Tests', () => {
	let ownerA: AuthContext
	let ownerB: AuthContext
	let barberA: AuthContext
	let savedScheduleA: OpenHoursDay[]

	beforeAll(async () => {
		ownerA = await createOwnerWithOrg('a')
		ownerB = await createOwnerWithOrg('b')
		barberA = await createBarberForOrg(ownerA.orgId)
		savedScheduleA = buildWeek({
			1: { isOpen: true, openTime: '09:00', closeTime: '17:00' },
			2: { isOpen: true, openTime: '10:00', closeTime: '18:00' },
			6: { isOpen: false, openTime: '12:00', closeTime: '14:00' }
		})
	})

	it('T-01: GET /open-hours returns 401 without auth', async () => {
		const { status } = await (tClient as any).api['open-hours'].get()
		expect(status).toBe(401)
	})

	it('T-02: PUT /open-hours returns 401 without auth', async () => {
		const { status } = await (tClient as any).api['open-hours'].put({
			days: buildWeek()
		})
		expect(status).toBe(401)
	})

	it('T-03: GET /open-hours returns a default closed week for a new organization', async () => {
		const { status, data } = await (tClient as any).api['open-hours'].get({
			fetch: { headers: { cookie: ownerA.authCookie } }
		})

		expect(status).toBe(200)
		expect(data?.data).toHaveLength(7)
		expect(
			(data?.data ?? []).every(
				(day: OpenHoursDay) =>
					day.isOpen === false &&
					day.openTime === null &&
					day.closeTime === null
			)
		).toBe(true)
	})

	it('T-04: GET /open-hours returns 200 for a barber in the same organization', async () => {
		const { status, data } = await (tClient as any).api['open-hours'].get({
			fetch: { headers: { cookie: barberA.authCookie } }
		})

		expect(status).toBe(200)
		expect(data?.data).toHaveLength(7)
	})

	it('T-05: PUT /open-hours returns 403 for a barber', async () => {
		const { status } = await (tClient as any).api['open-hours'].put(
			{
				days: buildWeek({
					1: { isOpen: true, openTime: '09:00', closeTime: '17:00' }
				})
			},
			{ fetch: { headers: { cookie: barberA.authCookie } } }
		)

		expect(status).toBe(403)
	})

	it('T-06: PUT /open-hours saves a full weekly schedule and normalizes closed-day times', async () => {
		const { status, data } = await (tClient as any).api['open-hours'].put(
			{ days: savedScheduleA },
			{ fetch: { headers: { cookie: ownerA.authCookie } } }
		)

		expect(status).toBe(200)
		expect(data?.data).toHaveLength(7)
		expect(data?.data[1]).toMatchObject({
			dayOfWeek: 1,
			isOpen: true,
			openTime: '09:00',
			closeTime: '17:00'
		})
		expect(data?.data[6]).toMatchObject({
			dayOfWeek: 6,
			isOpen: false,
			openTime: null,
			closeTime: null
		})

		const getRes = await (tClient as any).api['open-hours'].get({
			fetch: { headers: { cookie: ownerA.authCookie } }
		})
		expect(getRes.status).toBe(200)
		expect(getRes.data?.data).toEqual(data?.data)
	})

	it('T-07: PUT /open-hours returns 400 for fewer than 7 day entries', async () => {
		const { status } = await (tClient as any).api['open-hours'].put(
			{ days: buildWeek().slice(0, 6) },
			{ fetch: { headers: { cookie: ownerA.authCookie } } }
		)

		expect(status).toBe(400)
	})

	it('T-08: PUT /open-hours returns 400 when an open day is missing times', async () => {
		const invalidWeek = buildWeek({
			3: { isOpen: true, openTime: null, closeTime: '15:00' }
		})

		const { status } = await (tClient as any).api['open-hours'].put(
			{ days: invalidWeek },
			{ fetch: { headers: { cookie: ownerA.authCookie } } }
		)

		expect(status).toBe(400)
	})

	it('T-09: PUT /open-hours preserves the previous schedule when validation fails', async () => {
		const invalidWeek = buildWeek({
			1: { isOpen: true, openTime: '17:00', closeTime: '09:00' }
		})

		const { status } = await (tClient as any).api['open-hours'].put(
			{ days: invalidWeek },
			{ fetch: { headers: { cookie: ownerA.authCookie } } }
		)

		expect(status).toBe(400)

		const { status: getStatus, data } = await (tClient as any).api[
			'open-hours'
		].get({
			fetch: { headers: { cookie: ownerA.authCookie } }
		})

		expect(getStatus).toBe(200)
		expect(data?.data[1]).toMatchObject({
			dayOfWeek: 1,
			isOpen: true,
			openTime: '09:00',
			closeTime: '17:00'
		})
		expect(data?.data[2]).toMatchObject({
			dayOfWeek: 2,
			isOpen: true,
			openTime: '10:00',
			closeTime: '18:00'
		})
	})

	it('T-10: GET /open-hours is tenant-isolated', async () => {
		const weekB = buildWeek({
			0: { isOpen: true, openTime: '08:00', closeTime: '12:00' },
			4: { isOpen: true, openTime: '11:00', closeTime: '19:00' }
		})

		const putRes = await (tClient as any).api['open-hours'].put(
			{ days: weekB },
			{ fetch: { headers: { cookie: ownerB.authCookie } } }
		)
		expect(putRes.status).toBe(200)

		const ownerARes = await (tClient as any).api['open-hours'].get({
			fetch: { headers: { cookie: ownerA.authCookie } }
		})
		const ownerBRes = await (tClient as any).api['open-hours'].get({
			fetch: { headers: { cookie: ownerB.authCookie } }
		})

		expect(ownerARes.status).toBe(200)
		expect(ownerBRes.status).toBe(200)
		expect(ownerARes.data?.data[0]).toMatchObject({
			dayOfWeek: 0,
			isOpen: false,
			openTime: null,
			closeTime: null
		})
		expect(ownerBRes.data?.data[0]).toMatchObject({
			dayOfWeek: 0,
			isOpen: true,
			openTime: '08:00',
			closeTime: '12:00'
		})
	})
})
