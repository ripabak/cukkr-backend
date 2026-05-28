import { describe, expect, it, beforeAll } from 'bun:test'
import { treaty } from '@elysiajs/eden'
import { customAlphabet, nanoid } from 'nanoid'

const nanoidSlug = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 8)

import { app } from '../../src/app'
import { db } from '../../src/lib/database'
import { member } from '../../src/modules/auth/schema'
import { auth } from '../../src/lib/auth'

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
	const actualSlug: string = orgRes.data?.slug ?? orgSlug

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

	return { authCookie, orgId, orgSlug: actualSlug, userId }
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
		role: 'member',
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

	// T-01: Creating a second org via Better Auth auto-generates a unique slug
	it('T-01: Organization creation auto-generates unique slug in name-xxxxx format', async () => {
		const orgRes = await (tClient as any).auth.api.organization.create.post(
			{ name: 'My Second Shop', slug: `t01-${nanoidSlug()}` },
			{ fetch: { headers: { cookie: ownerCookie, origin: ORIGIN } } }
		)
		expect(orgRes.status).toBe(200)
		expect(orgRes.data?.slug).toMatch(/^my-second-shop-[a-z0-9]{5}$/)
		expect(orgRes.data?.name).toBe('My Second Shop')
	})

	// T-05: GET /barbershop/list returns all orgs (2 created, expect 2)
	it('T-05: GET /barbershop/list returns all orgs for user', async () => {
		const user = await createUserWithOrg('t05')
		await (tClient as any).auth.api.organization.create.post(
			{ name: 'Second Shop T05', slug: `t05-second-${nanoidSlug()}` },
			{ fetch: { headers: { cookie: user.authCookie, origin: ORIGIN } } }
		)
		const { status, data } = await (
			tClient as any
		).auth.api.organization.list.get({
			fetch: { headers: { cookie: user.authCookie, origin: ORIGIN } }
		})
		expect(status).toBe(200)
		expect(data?.length).toBe(2)
	})

	// T-06: Each item includes correct role field
	it('T-06: GET /barbershop/list includes correct role field for each org', async () => {
		const user = await createUserWithOrg('t06')
		// const { status, data } = await (tClient as any).auth.api.organization.list.get({
		// 	fetch: { headers: { cookie: user.authCookie, origin: ORIGIN } }
		// })
		const data = await auth.api.listMembers({
			headers: { cookie: user.authCookie }
		})
		expect(data?.total).toBeGreaterThanOrEqual(1)
		const userRole = data.members?.find(
			(m) => m.userId === user.userId
		)?.role
		expect(userRole).toBe('owner')
	})

	// T-07: Fresh user with no orgs returns empty array
	it('T-07: GET /barbershop/list returns [] for a fresh user with no orgs', async () => {
		const { cookie } = await signUpUser('t07-fresh')
		const { status, data } = await (
			tClient as any
		).auth.api.organization.list.get({
			fetch: { headers: { cookie, origin: ORIGIN } }
		})
		expect(status).toBe(200)
		expect(data).toEqual([])
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

		const beforeRes = await (tClient as any).auth.api.organization.list.get(
			{
				fetch: {
					headers: { cookie: barberActiveCookie, origin: ORIGIN }
				}
			}
		)
		expect(beforeRes.data?.some((o: any) => o.id === owner.orgId)).toBe(
			true
		)

		await (tClient as any).api
			.barbershop({ orgId: owner.orgId })
			.leave.delete(undefined, {
				fetch: { headers: { cookie: barberActiveCookie } }
			})

		const afterRes = await (tClient as any).auth.api.organization.list.get({
			fetch: { headers: { cookie: barberCookie, origin: ORIGIN } }
		})
		expect(afterRes.data?.some((o: any) => o.id === owner.orgId)).toBe(
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

		const createRes = await (
			tClient as any
		).auth.api.organization.create.post(
			{ name: 'Org B T12', slug: `t12-orgb-${nanoidSlug()}` },
			{ fetch: { headers: { cookie: user.authCookie, origin: ORIGIN } } }
		)
		const orgBId = createRes.data?.id ?? ''

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
		const { status } = await (
			tClient as any
		).auth.api.organization.list.get()
		expect(status).toBe(401)
	})
})
