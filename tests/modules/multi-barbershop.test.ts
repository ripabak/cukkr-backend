import { describe, expect, it, beforeAll } from 'bun:test'
import { treaty } from '@elysiajs/eden'
import { customAlphabet, nanoid } from 'nanoid'

const nanoidSlug = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 8)

import { app } from '../../src/app'
import { db } from '../../src/lib/database'
import { member } from '../../src/modules/auth/schema'

const tClient = treaty(app)
const ORIGIN = 'http://localhost:3001'

async function signUpUser(emailPrefix: string): Promise<{
	cookie: string
	userId: string
}> {
	const email = `${emailPrefix}_${Date.now()}_${nanoid(4)}@example.com`
	const signUpRes = await (tClient as any).auth.api['sign-up'].email.post(
		{ email, password: 'password123', name: 'Test User' },
		{ fetch: { headers: { origin: ORIGIN } } }
	)
	const cookie: string = signUpRes.response?.headers.get('set-cookie') || ''

	const sessionRes = await (tClient as any).auth.api['get-session'].get({
		headers: { cookie }
	})
	const userId: string = sessionRes.data?.user?.id ?? ''

	return { cookie, userId }
}

async function createUserWithOrg(suffix: string): Promise<{
	authCookie: string
	orgId: string
	orgSlug: string
	userId: string
}> {
	const email = `test_mbs_${suffix}_${Date.now()}@example.com`
	const orgSlug = `mbs-${suffix}-${nanoidSlug()}`

	const signUpRes = await (tClient as any).auth.api['sign-up'].email.post(
		{ email, password: 'password123', name: 'Test User' },
		{ fetch: { headers: { origin: ORIGIN } } }
	)
	const cookie: string = signUpRes.response?.headers.get('set-cookie') || ''

	const orgRes = await (tClient as any).auth.api.organization.create.post(
		{ name: `Test Barbershop ${suffix}`, slug: orgSlug },
		{ fetch: { headers: { cookie, origin: ORIGIN } } }
	)
	const orgId: string = orgRes.data?.id

	const activeRes = await (tClient as any).auth.api.organization[
		'set-active'
	].post(
		{ organizationId: orgId },
		{ fetch: { headers: { cookie, origin: ORIGIN } } }
	)
	const authCookie: string =
		activeRes.response?.headers.get('set-cookie') || cookie

	const sessionRes = await (tClient as any).auth.api['get-session'].get({
		headers: { cookie: authCookie }
	})
	const userId: string = sessionRes.data?.user?.id ?? ''

	return { authCookie, orgId, orgSlug, userId }
}

async function setActiveOrg(
	cookie: string,
	organizationId: string
): Promise<string> {
	const activeRes = await (tClient as any).auth.api.organization[
		'set-active'
	].post(
		{ organizationId },
		{ fetch: { headers: { cookie, origin: ORIGIN } } }
	)
	return activeRes.response?.headers.get('set-cookie') || cookie
}

async function addBarberMember(
	organizationId: string,
	userId: string
): Promise<string> {
	const memberId = nanoid()
	await db.insert(member).values({
		id: memberId,
		organizationId,
		userId,
		role: 'barber',
		createdAt: new Date()
	})
	return memberId
}

describe('Multi-Barbershop & Branch Management Tests', () => {
	let ownerCookie: string

	beforeAll(async () => {
		const owner = await createUserWithOrg('main')
		ownerCookie = owner.authCookie
	})

	// T-01: POST /barbershop creates org, assigns owner role, returns org profile
	it('T-01: POST /barbershop creates org, assigns owner role, returns org profile', async () => {
		const slug = `t01-${nanoidSlug()}`
		const { status, data } = await tClient.api.barbershop.post(
			{ name: 'My Second Shop', slug },
			{ fetch: { headers: { cookie: ownerCookie } } }
		)
		expect(status).toBe(201)
		expect(data?.data.slug).toBe(slug)
		expect(data?.data.name).toBe('My Second Shop')
		expect(data?.data.onboardingCompleted).toBe(false)
	})

	// T-02: POST /barbershop with duplicate slug returns 409 Conflict
	it('T-02: POST /barbershop with duplicate slug returns 409 Conflict', async () => {
		const slug = `t02-${nanoidSlug()}`
		await tClient.api.barbershop.post(
			{ name: 'Shop T02', slug },
			{ fetch: { headers: { cookie: ownerCookie } } }
		)
		const { status } = await tClient.api.barbershop.post(
			{ name: 'Shop T02 Dup', slug },
			{ fetch: { headers: { cookie: ownerCookie } } }
		)
		expect(status).toBe(409)
	})

	// T-03: POST /barbershop with invalid slug format returns 400 Bad Request
	it('T-03: POST /barbershop with invalid slug format returns 400 Bad Request', async () => {
		const { status } = await tClient.api.barbershop.post(
			{ name: 'Bad Slug Shop', slug: '-invalid-slug-' },
			{ fetch: { headers: { cookie: ownerCookie } } }
		)
		expect(status).toBe(400)
	})

	// T-04: POST /barbershop without session returns 401 Unauthorized
	it('T-04: POST /barbershop without session returns 401 Unauthorized', async () => {
		const { status } = await tClient.api.barbershop.post({
			name: 'No Auth Shop',
			slug: `t04-${nanoidSlug()}`
		})
		expect(status).toBe(401)
	})

	// T-05: GET /barbershop/list returns all orgs (2 created, expect 2)
	it('T-05: GET /barbershop/list returns all orgs for user', async () => {
		const user = await createUserWithOrg('t05')
		const slug2 = `t05-second-${nanoidSlug()}`
		await tClient.api.barbershop.post(
			{ name: 'Second Shop T05', slug: slug2 },
			{ fetch: { headers: { cookie: user.authCookie } } }
		)
		const { status, data } = await tClient.api.barbershop.list.get({
			fetch: { headers: { cookie: user.authCookie } }
		})
		expect(status).toBe(200)
		expect(data?.data.length).toBe(2)
	})

	// T-06: Each item includes correct role field
	it('T-06: GET /barbershop/list includes correct role field for each org', async () => {
		const user = await createUserWithOrg('t06')
		const { status, data } = await tClient.api.barbershop.list.get({
			fetch: { headers: { cookie: user.authCookie } }
		})
		expect(status).toBe(200)
		expect(data?.data.length).toBeGreaterThanOrEqual(1)
		for (const item of data?.data ?? []) {
			expect(item.role).toBe('owner')
		}
	})

	// T-07: Fresh user with no orgs returns empty array
	it('T-07: GET /barbershop/list returns [] for a fresh user with no orgs', async () => {
		const { cookie } = await signUpUser('t07-fresh')
		const { status, data } = await tClient.api.barbershop.list.get({
			fetch: { headers: { cookie } }
		})
		expect(status).toBe(200)
		expect(data?.data).toEqual([])
	})

	// T-08: DELETE returns 400 when caller is sole owner
	it('T-08: DELETE /barbershop/:orgId/leave returns 400 when caller is sole owner', async () => {
		const user = await createUserWithOrg('t08')
		const { status } = await (tClient as any).api
			.barbershop({ orgId: user.orgId })
			.leave.delete(undefined, {
				fetch: { headers: { cookie: user.authCookie } }
			})
		expect(status).toBe(400)
	})

	// T-09: DELETE returns 200 and removes barber membership
	it('T-09: DELETE /barbershop/:orgId/leave returns 200 and removes barber membership', async () => {
		const owner = await createUserWithOrg('t09-owner')
		const { cookie: barberCookie, userId: barberUserId } =
			await signUpUser('t09-barber')
		await addBarberMember(owner.orgId, barberUserId)
		const barberActiveCookie = await setActiveOrg(barberCookie, owner.orgId)

		const { status, data } = await (tClient as any).api
			.barbershop({ orgId: owner.orgId })
			.leave.delete(undefined, {
				fetch: { headers: { cookie: barberActiveCookie } }
			})
		expect(status).toBe(200)
		expect(data?.data.message).toBe('You have left the organization')
	})

	// T-10: After leaving, org no longer in GET /barbershop/list for ex-barber
	it('T-10: After leaving, org no longer in GET /barbershop/list for ex-barber', async () => {
		const owner = await createUserWithOrg('t10-owner')
		const { cookie: barberCookie, userId: barberUserId } =
			await signUpUser('t10-barber')
		await addBarberMember(owner.orgId, barberUserId)
		const barberActiveCookie = await setActiveOrg(barberCookie, owner.orgId)

		const beforeRes = await tClient.api.barbershop.list.get({
			fetch: { headers: { cookie: barberActiveCookie } }
		})
		expect(beforeRes.data?.data.some((o) => o.id === owner.orgId)).toBe(
			true
		)

		await (tClient as any).api
			.barbershop({ orgId: owner.orgId })
			.leave.delete(undefined, {
				fetch: { headers: { cookie: barberActiveCookie } }
			})

		const afterRes = await tClient.api.barbershop.list.get({
			fetch: { headers: { cookie: barberCookie } }
		})
		expect(afterRes.data?.data.some((o) => o.id === owner.orgId)).toBe(
			false
		)
	})

	// T-11: DELETE returns 404 for non-member org ID
	it('T-11: DELETE /barbershop/:orgId/leave returns 404 for non-member org ID', async () => {
		const otherOwner = await createUserWithOrg('t11-other')
		const { cookie: strangerCookie } = await signUpUser('t11-stranger')

		const { status } = await (tClient as any).api
			.barbershop({ orgId: otherOwner.orgId })
			.leave.delete(undefined, {
				fetch: { headers: { cookie: strangerCookie } }
			})
		expect(status).toBe(404)
	})

	// T-12: Switch active org; GET /api/services scoped to new org
	it('T-12: After switching active org, GET /api/services returns only new org services', async () => {
		const user = await createUserWithOrg('t12')

		for (let i = 0; i < 3; i++) {
			await tClient.api.services.post(
				{
					name: `Org A Service ${i + 1}`,
					price: 50000,
					duration: 30
				},
				{ fetch: { headers: { cookie: user.authCookie } } }
			)
		}

		const slugB = `t12-orgb-${nanoidSlug()}`
		const createRes = await tClient.api.barbershop.post(
			{ name: 'Org B T12', slug: slugB },
			{ fetch: { headers: { cookie: user.authCookie } } }
		)
		const orgBId = createRes.data?.data.id ?? ''

		const cookieOrgB = await setActiveOrg(user.authCookie, orgBId)
		for (let i = 0; i < 2; i++) {
			await tClient.api.services.post(
				{
					name: `Org B Service ${i + 1}`,
					price: 60000,
					duration: 45
				},
				{ fetch: { headers: { cookie: cookieOrgB } } }
			)
		}

		const { status, data } = await tClient.api.services.get({
			fetch: { headers: { cookie: cookieOrgB } }
		})
		expect(status).toBe(200)
		expect(data?.data.length).toBe(2)
	})

	// T-13: User B cannot read Org A's data when Org B is active
	it('T-13: User B cannot read Org A data when Org B is active', async () => {
		const userA = await createUserWithOrg('t13-usera')
		await tClient.api.services.post(
			{ name: 'Org A Exclusive Service', price: 70000, duration: 60 },
			{ fetch: { headers: { cookie: userA.authCookie } } }
		)

		const userB = await createUserWithOrg('t13-userb')
		const { status, data } = await tClient.api.services.get({
			fetch: { headers: { cookie: userB.authCookie } }
		})
		expect(status).toBe(200)
		const serviceNames = (data?.data ?? []).map((s) => s.name)
		expect(serviceNames.includes('Org A Exclusive Service')).toBe(false)
	})

	// Unauthenticated access
	it('T-AUTH: GET /barbershop/list returns 401 without session', async () => {
		const { status } = await tClient.api.barbershop.list.get()
		expect(status).toBe(401)
	})
})
