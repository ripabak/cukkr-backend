import { describe, expect, it, beforeAll } from 'bun:test'
import { treaty } from '@elysiajs/eden'
import { app } from '../../src/app'

const tClient = treaty(app)
const ORIGIN = 'http://localhost:3001'

async function createOwnerWithOrg(suffix: string): Promise<{
	authCookie: string
	orgId: string
}> {
	const email = `test_svc_${suffix}_${Date.now()}@example.com`
	const slug = `svc-${suffix}-${Math.random().toString(36).substring(2, 8)}`

	const signUpRes = await (tClient as any).auth.api['sign-up'].email.post(
		{ email, password: 'password123', name: 'Test User' },
		{ fetch: { headers: { origin: ORIGIN } } }
	)
	const cookie: string = signUpRes.response?.headers.get('set-cookie') || ''

	const orgRes = await (tClient as any).auth.api.organization.create.post(
		{ name: `Barbershop ${suffix}`, slug },
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

	return { authCookie, orgId }
}

describe('Service Management Tests', () => {
	let authCookieA: string
	let authCookieB: string
	let serviceIdA: string
	let inactiveServiceId: string
	let activeServiceId: string
	let defaultServiceId: string
	let crossOrgServiceId: string

	beforeAll(async () => {
		const ownerA = await createOwnerWithOrg('a')
		authCookieA = ownerA.authCookie

		const ownerB = await createOwnerWithOrg('b')
		authCookieB = ownerB.authCookie

		// Seed a service in org B for cross-org tests
		const crossOrgRes = await tClient.api.services.post(
			{
				name: 'Org B Service',
				price: 50000,
				duration: 30
			},
			{ fetch: { headers: { cookie: authCookieB } } }
		)
		crossOrgServiceId = crossOrgRes.data?.data?.id ?? ''
	})

	// ── Unauthenticated rejections ──────────────────────────────────────────

	it('T-01: POST /services returns 401 without auth', async () => {
		const { status } = await tClient.api.services.post({
			name: 'Haircut',
			price: 50000,
			duration: 30
		})
		expect(status).toBe(401)
	})

	it('T-02: PATCH /services/:id returns 401 without auth', async () => {
		const { status } = await tClient.api.services({ id: 'any-id' }).patch({
			name: 'Updated'
		})
		expect(status).toBe(401)
	})

	it('T-03: DELETE /services/:id returns 401 without auth', async () => {
		const { status } = await tClient.api.services({ id: 'any-id' }).delete()
		expect(status).toBe(401)
	})

	it('T-04: PATCH /services/:id/toggle-active returns 401 without auth', async () => {
		const { status } = await (tClient as any).api.services['any-id'][
			'toggle-active'
		].patch({}, { fetch: { headers: {} } })
		expect(status).toBe(401)
	})

	it('T-05: PATCH /services/:id/set-default returns 401 without auth', async () => {
		const { status } = await (tClient as any).api.services['any-id'][
			'set-default'
		].patch({}, { fetch: { headers: {} } })
		expect(status).toBe(401)
	})

	// ── Create validations ──────────────────────────────────────────────────

	it('T-06: POST /services returns 422 when name is missing', async () => {
		const { status } = await tClient.api.services.post(
			{ price: 50000, duration: 30 } as any,
			{ fetch: { headers: { cookie: authCookieA } } }
		)
		expect(status).toBe(422)
	})

	it('T-07: POST /services returns 422 when price is negative', async () => {
		const { status } = await tClient.api.services.post(
			{ name: 'Bad', price: -1, duration: 30 },
			{ fetch: { headers: { cookie: authCookieA } } }
		)
		expect(status).toBe(422)
	})

	it('T-08: POST /services returns 422 when duration is zero', async () => {
		const { status } = await tClient.api.services.post(
			{ name: 'Bad', price: 50000, duration: 0 },
			{ fetch: { headers: { cookie: authCookieA } } }
		)
		expect(status).toBe(422)
	})

	it('T-09: POST /services returns 422 when discount exceeds 100', async () => {
		const { status } = await tClient.api.services.post(
			{ name: 'Bad', price: 50000, duration: 30, discount: 101 },
			{ fetch: { headers: { cookie: authCookieA } } }
		)
		expect(status).toBe(422)
	})

	// ── Create success ──────────────────────────────────────────────────────

	it('T-10: POST /services returns 201 with correct defaults', async () => {
		const { status, data } = await tClient.api.services.post(
			{ name: 'Classic Haircut', price: 75000, duration: 30 },
			{ fetch: { headers: { cookie: authCookieA } } }
		)
		expect(status).toBe(201)
		expect(data?.data.name).toBe('Classic Haircut')
		expect(data?.data.price).toBe(75000)
		expect(data?.data.duration).toBe(30)
		expect(data?.data.discount).toBe(0)
		expect(data?.data.isActive).toBe(false)
		expect(data?.data.isDefault).toBe(false)
		serviceIdA = data?.data.id ?? ''
		inactiveServiceId = serviceIdA
	})

	it('T-11: POST /services with optional discount sets it correctly', async () => {
		const { status, data } = await tClient.api.services.post(
			{
				name: 'Fade Cut',
				price: 80000,
				duration: 45,
				discount: 10,
				description: 'A clean fade'
			},
			{ fetch: { headers: { cookie: authCookieA } } }
		)
		expect(status).toBe(201)
		expect(data?.data.discount).toBe(10)
		expect(data?.data.description).toBe('A clean fade')
	})

	// ── List ────────────────────────────────────────────────────────────────

	it('T-12: GET /services returns all services for the org', async () => {
		const { status, data } = await tClient.api.services.get({
			fetch: { headers: { cookie: authCookieA } }
		})
		expect(status).toBe(200)
		expect(Array.isArray(data?.data)).toBe(true)
		expect((data?.data?.length ?? 0) >= 2).toBe(true)
	})

	it('T-13: GET /services?activeOnly=true returns only active services', async () => {
		// Activate one service first
		const createRes = await tClient.api.services.post(
			{ name: 'Shave', price: 40000, duration: 20 },
			{ fetch: { headers: { cookie: authCookieA } } }
		)
		const newId = createRes.data?.data?.id ?? ''
		await (tClient as any).api.services[newId]['toggle-active'].patch(
			{},
			{ fetch: { headers: { cookie: authCookieA } } }
		)
		activeServiceId = newId

		const { status, data } = await tClient.api.services.get({
			query: { activeOnly: 'true' },
			fetch: { headers: { cookie: authCookieA } }
		})
		expect(status).toBe(200)
		const services = data?.data ?? []
		expect(services.every((s: { isActive: boolean }) => s.isActive)).toBe(
			true
		)
	})

	it('T-14: GET /services?search= filters by name case-insensitively', async () => {
		const { status, data } = await tClient.api.services.get({
			query: { search: 'haircut' },
			fetch: { headers: { cookie: authCookieA } }
		})
		expect(status).toBe(200)
		const services = data?.data ?? []
		expect(
			services.every((s: { name: string }) =>
				s.name.toLowerCase().includes('haircut')
			)
		).toBe(true)
	})

	it('T-15: GET /services?sort=name_asc returns services sorted by name asc', async () => {
		const { status, data } = await tClient.api.services.get({
			query: { sort: 'name_asc' },
			fetch: { headers: { cookie: authCookieA } }
		})
		expect(status).toBe(200)
		const names = (data?.data ?? []).map((s: { name: string }) => s.name)
		const sorted = [...names].sort()
		expect(names).toEqual(sorted)
	})

	it('T-16: GET /services?sort=name_desc returns services sorted by name desc', async () => {
		const { status, data } = await tClient.api.services.get({
			query: { sort: 'name_desc' },
			fetch: { headers: { cookie: authCookieA } }
		})
		expect(status).toBe(200)
		const names = (data?.data ?? []).map((s: { name: string }) => s.name)
		const sorted = [...names].sort().reverse()
		expect(names).toEqual(sorted)
	})

	it('T-17: GET /services?sort=price_asc returns services sorted by price asc', async () => {
		const { status, data } = await tClient.api.services.get({
			query: { sort: 'price_asc' },
			fetch: { headers: { cookie: authCookieA } }
		})
		expect(status).toBe(200)
		const prices = (data?.data ?? []).map((s: { price: number }) => s.price)
		const sorted = [...prices].sort((a, b) => a - b)
		expect(prices).toEqual(sorted)
	})

	it('T-18: GET /services?sort=price_desc returns services sorted by price desc', async () => {
		const { status, data } = await tClient.api.services.get({
			query: { sort: 'price_desc' },
			fetch: { headers: { cookie: authCookieA } }
		})
		expect(status).toBe(200)
		const prices = (data?.data ?? []).map((s: { price: number }) => s.price)
		const sorted = [...prices].sort((a, b) => b - a)
		expect(prices).toEqual(sorted)
	})

	it('T-19: GET /services?sort=recent returns services (most recent first)', async () => {
		const { status } = await tClient.api.services.get({
			query: { sort: 'recent' },
			fetch: { headers: { cookie: authCookieA } }
		})
		expect(status).toBe(200)
	})

	// ── Get by ID ────────────────────────────────────────────────────────────

	it('T-20: GET /services/:id returns 200 for a valid service', async () => {
		const { status, data } = await tClient.api
			.services({ id: serviceIdA })
			.get({ fetch: { headers: { cookie: authCookieA } } })
		expect(status).toBe(200)
		expect(data?.data.id).toBe(serviceIdA)
	})

	it('T-21: GET /services/:id returns 404 for cross-org service id', async () => {
		const { status } = await tClient.api
			.services({ id: crossOrgServiceId })
			.get({ fetch: { headers: { cookie: authCookieA } } })
		expect(status).toBe(404)
	})

	// ── Update ────────────────────────────────────────────────────────────────

	it('T-22: PATCH /services/:id updates only supplied fields', async () => {
		const originalRes = await tClient.api
			.services({ id: serviceIdA })
			.get({ fetch: { headers: { cookie: authCookieA } } })
		const originalName = originalRes.data?.data.name

		const { status, data } = await tClient.api
			.services({ id: serviceIdA })
			.patch(
				{ price: 99000 },
				{ fetch: { headers: { cookie: authCookieA } } }
			)
		expect(status).toBe(200)
		expect(data?.data.price).toBe(99000)
		expect(data?.data.name).toBe(originalName)
	})

	it('T-23: PATCH /services/:id with isDefault in body returns 400', async () => {
		const { status } = await tClient.api
			.services({ id: serviceIdA })
			.patch({ isDefault: true } as any, {
				fetch: { headers: { cookie: authCookieA } }
			})
		expect(status).toBe(400)
	})

	it('T-24: PATCH /services/:id returns 404 for cross-org service', async () => {
		const { status } = await tClient.api
			.services({ id: crossOrgServiceId })
			.patch(
				{ price: 10000 },
				{ fetch: { headers: { cookie: authCookieA } } }
			)
		expect(status).toBe(404)
	})

	// ── Toggle active ─────────────────────────────────────────────────────────

	it('T-25: PATCH /services/:id/toggle-active flips inactive → active', async () => {
		const { status, data } = await (tClient as any).api.services[
			inactiveServiceId
		]['toggle-active'].patch(
			{},
			{ fetch: { headers: { cookie: authCookieA } } }
		)
		expect(status).toBe(200)
		expect(data?.data.isActive).toBe(true)
	})

	it('T-26: PATCH /services/:id/toggle-active flips active → inactive (and clears default)', async () => {
		// Set activeServiceId as default first
		await (tClient as any).api.services[activeServiceId][
			'set-default'
		].patch({}, { fetch: { headers: { cookie: authCookieA } } })

		const { status, data } = await (tClient as any).api.services[
			activeServiceId
		]['toggle-active'].patch(
			{},
			{ fetch: { headers: { cookie: authCookieA } } }
		)
		expect(status).toBe(200)
		expect(data?.data.isActive).toBe(false)
		expect(data?.data.isDefault).toBe(false)
	})

	it('T-27: PATCH /services/:id/toggle-active returns 404 for cross-org service', async () => {
		const { status } = await (tClient as any).api.services[
			crossOrgServiceId
		]['toggle-active'].patch(
			{},
			{ fetch: { headers: { cookie: authCookieA } } }
		)
		expect(status).toBe(404)
	})

	// ── Set default ───────────────────────────────────────────────────────────

	it('T-28: PATCH /services/:id/set-default sets active service as default and clears previous', async () => {
		// Create and activate two services
		const s1Res = await tClient.api.services.post(
			{ name: 'Default Candidate 1', price: 60000, duration: 30 },
			{ fetch: { headers: { cookie: authCookieA } } }
		)
		const s1Id = s1Res.data?.data?.id ?? ''

		const s2Res = await tClient.api.services.post(
			{ name: 'Default Candidate 2', price: 70000, duration: 40 },
			{ fetch: { headers: { cookie: authCookieA } } }
		)
		const s2Id = s2Res.data?.data?.id ?? ''

		// Activate both
		await (tClient as any).api.services[s1Id]['toggle-active'].patch(
			{},
			{ fetch: { headers: { cookie: authCookieA } } }
		)
		await (tClient as any).api.services[s2Id]['toggle-active'].patch(
			{},
			{ fetch: { headers: { cookie: authCookieA } } }
		)

		// Set s1 as default
		await (tClient as any).api.services[s1Id]['set-default'].patch(
			{},
			{ fetch: { headers: { cookie: authCookieA } } }
		)
		defaultServiceId = s1Id

		// Set s2 as default — s1 should be cleared
		const { status, data } = await (tClient as any).api.services[s2Id][
			'set-default'
		].patch({}, { fetch: { headers: { cookie: authCookieA } } })
		expect(status).toBe(200)
		expect(data?.data.isDefault).toBe(true)

		// Verify s1 is no longer default
		const s1Check = await tClient.api
			.services({ id: s1Id })
			.get({ fetch: { headers: { cookie: authCookieA } } })
		expect(s1Check.data?.data.isDefault).toBe(false)

		defaultServiceId = s2Id
	})

	it('T-29: PATCH /services/:id/set-default returns 400 for inactive service', async () => {
		// Create a new inactive service and try to set it as default
		const sRes = await tClient.api.services.post(
			{ name: 'Inactive Default Attempt', price: 30000, duration: 15 },
			{ fetch: { headers: { cookie: authCookieA } } }
		)
		const inactId = sRes.data?.data?.id ?? ''

		const { status } = await (tClient as any).api.services[inactId][
			'set-default'
		].patch({}, { fetch: { headers: { cookie: authCookieA } } })
		expect(status).toBe(400)
	})

	it('T-30: PATCH /services/:id/set-default returns 404 for cross-org service', async () => {
		const { status } = await (tClient as any).api.services[
			crossOrgServiceId
		]['set-default'].patch(
			{},
			{ fetch: { headers: { cookie: authCookieA } } }
		)
		expect(status).toBe(404)
	})

	// ── Delete ────────────────────────────────────────────────────────────────

	it('T-31: DELETE /services/:id returns 400 when deleting the default service', async () => {
		const { status } = await (tClient as any).api
			.services({ id: defaultServiceId })
			.delete(undefined, { fetch: { headers: { cookie: authCookieA } } })
		expect(status).toBe(400)
	})

	it('T-32: DELETE /services/:id returns 200 for non-default service', async () => {
		const createRes = await tClient.api.services.post(
			{ name: 'Temporary Service', price: 20000, duration: 10 },
			{ fetch: { headers: { cookie: authCookieA } } }
		)
		const tmpId = createRes.data?.data?.id ?? ''

		const { status, data } = await (tClient as any).api
			.services({ id: tmpId })
			.delete(undefined, { fetch: { headers: { cookie: authCookieA } } })
		expect(status).toBe(200)
		expect(data?.data.id).toBe(tmpId)
	})

	it('T-33: DELETE /services/:id returns 404 for cross-org service', async () => {
		const { status } = await (tClient as any).api
			.services({ id: crossOrgServiceId })
			.delete(undefined, { fetch: { headers: { cookie: authCookieA } } })
		expect(status).toBe(404)
	})
})
