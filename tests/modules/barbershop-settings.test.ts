import { describe, expect, it, beforeAll } from 'bun:test'
import { treaty } from '@elysiajs/eden'
import { app } from '../../src/app'

const tClient = treaty(app)
const ORIGIN = 'http://localhost:3001'

async function createUserWithOrg(suffix: string): Promise<{
	authCookie: string
	orgId: string
	orgSlug: string
}> {
	const email = `test_barbershop_${suffix}_${Date.now()}@example.com`
	const orgSlug = `bs-${suffix}-${Math.random().toString(36).substring(2, 8)}`

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

	return { authCookie, orgId, orgSlug }
}

describe('Barbershop Settings Tests', () => {
	let authCookieA: string
	let orgSlugA: string
	let orgSlugB: string
	let authCookieB: string

	beforeAll(async () => {
		const userA = await createUserWithOrg('a')
		authCookieA = userA.authCookie
		orgSlugA = userA.orgSlug

		const userB = await createUserWithOrg('b')
		authCookieB = userB.authCookie
		orgSlugB = userB.orgSlug
	})

	// T-01: Load settings — authenticated owner
	it('T-01: GET /barbershop returns 200 with profile for authenticated owner', async () => {
		const { status, data } = await tClient.api.barbershop.get({
			fetch: { headers: { cookie: authCookieA } }
		})
		expect(status).toBe(200)
		expect(data?.data).toMatchObject({
			name: expect.any(String),
			slug: orgSlugA,
			description: null,
			address: null,
			onboardingCompleted: false
		})
	})

	// T-02: Load settings — no session
	it('T-02: GET /barbershop returns 403 without session', async () => {
		const { status } = await tClient.api.barbershop.get()
		expect(status).toBe(403)
	})

	// T-03: Update name only
	it('T-03: PATCH /barbershop/settings returns 200 when updating name only', async () => {
		const newName = 'Updated Barbershop Name'
		const { status, data } = await tClient.api.barbershop.settings.patch(
			{ name: newName },
			{ fetch: { headers: { cookie: authCookieA } } }
		)
		expect(status).toBe(200)
		expect(data?.data.name).toBe(newName)
	})

	// T-04: Update description and address
	it('T-04: PATCH /barbershop/settings returns 200 when updating description and address', async () => {
		const { status, data } = await tClient.api.barbershop.settings.patch(
			{ description: 'A great barbershop', address: '123 Main St' },
			{ fetch: { headers: { cookie: authCookieA } } }
		)
		expect(status).toBe(200)
		expect(data?.data.description).toBe('A great barbershop')
		expect(data?.data.address).toBe('123 Main St')
	})

	// T-05: Update slug — available new value
	it('T-05: PATCH /barbershop/settings returns 200 with a new available slug', async () => {
		const newSlug = `new-slug-${Date.now()}`
		const { status, data } = await tClient.api.barbershop.settings.patch(
			{ slug: newSlug },
			{ fetch: { headers: { cookie: authCookieA } } }
		)
		expect(status).toBe(200)
		expect(data?.data.slug).toBe(newSlug)
		orgSlugA = newSlug
	})

	// T-06: Update slug — taken by another org
	it('T-06: PATCH /barbershop/settings returns 409 when slug is taken by another org', async () => {
		const { status } = await tClient.api.barbershop.settings.patch(
			{ slug: orgSlugB },
			{ fetch: { headers: { cookie: authCookieA } } }
		)
		expect(status).toBe(409)
	})

	// T-07: Update slug — own current slug
	it('T-07: PATCH /barbershop/settings returns 200 when submitting own current slug', async () => {
		const { status } = await tClient.api.barbershop.settings.patch(
			{ slug: orgSlugA },
			{ fetch: { headers: { cookie: authCookieA } } }
		)
		expect(status).toBe(200)
	})

	// T-08: Empty body — no fields provided, treated as no-op
	it('T-08: PATCH /barbershop/settings returns 200 for empty body (no-op)', async () => {
		const { status } = await tClient.api.barbershop.settings.patch(
			{},
			{ fetch: { headers: { cookie: authCookieA } } }
		)
		expect(status).toBe(200)
	})

	// T-09: Name too short (1 char) — TypeBox schema validation → 422
	it('T-09: PATCH /barbershop/settings returns 422 when name is 1 character', async () => {
		const { status } = await tClient.api.barbershop.settings.patch(
			{ name: 'A' },
			{ fetch: { headers: { cookie: authCookieA } } }
		)
		expect(status).toBe(422)
	})

	// T-10: Slug with space — service validation → 400
	it('T-10: PATCH /barbershop/settings returns 400 when slug contains a space', async () => {
		const { status } = await tClient.api.barbershop.settings.patch(
			{ slug: 'my shop' },
			{ fetch: { headers: { cookie: authCookieA } } }
		)
		expect(status).toBe(400)
	})

	// T-11: Slug starts with hyphen — service validation → 400
	it('T-11: PATCH /barbershop/settings returns 400 when slug starts with a hyphen', async () => {
		const { status } = await tClient.api.barbershop.settings.patch(
			{ slug: '-bad-slug' },
			{ fetch: { headers: { cookie: authCookieA } } }
		)
		expect(status).toBe(400)
	})

	// T-12: Slug too short (2 chars) — service validation → 400
	it('T-12: PATCH /barbershop/settings returns 400 when slug is only 2 characters', async () => {
		const { status } = await tClient.api.barbershop.settings.patch(
			{ slug: 'ab' },
			{ fetch: { headers: { cookie: authCookieA } } }
		)
		expect(status).toBe(400)
	})

	// T-13: Unauthenticated PATCH
	it('T-13: PATCH /barbershop/settings returns 401 without session', async () => {
		const { status } = await tClient.api.barbershop.settings.patch({
			name: 'Should Fail'
		})
		expect(status).toBe(401)
	})

	// T-14: Slug check — available
	it('T-14: GET /barbershop/slug-check returns available: true for a free slug', async () => {
		const { status, data } = await (tClient as any).api.barbershop[
			'slug-check'
		].get({ query: { slug: `totally-free-${Date.now()}` } })
		expect(status).toBe(200)
		expect(data?.data.available).toBe(true)
	})

	// T-15: Slug check — taken
	it('T-15: GET /barbershop/slug-check returns available: false for a taken slug', async () => {
		const { status, data } = await (tClient as any).api.barbershop[
			'slug-check'
		].get({ query: { slug: orgSlugB } })
		expect(status).toBe(200)
		expect(data?.data.available).toBe(false)
	})

	// T-16: Slug check — own slug (treated as taken since check is public with no org context)
	it('T-16: GET /barbershop/slug-check returns available: false for own slug (slug is taken)', async () => {
		const { status, data } = await (tClient as any).api.barbershop[
			'slug-check'
		].get({
			query: { slug: orgSlugA },
			fetch: { headers: { cookie: authCookieA } }
		})
		expect(status).toBe(200)
		expect(data?.data.available).toBe(false)
	})

	// T-17: Slug check — missing param — TypeBox schema validation → 422
	it('T-17: GET /barbershop/slug-check returns 422 when slug param is missing', async () => {
		const { status } = await (tClient as any).api.barbershop[
			'slug-check'
		].get({ query: {} })
		expect(status).toBe(422)
	})

	// T-18: Cross-tenant isolation
	it('T-18: Org A PATCH cannot affect Org B data', async () => {
		// Org A updates their own name
		await tClient.api.barbershop.settings.patch(
			{ name: 'Org A Shop' },
			{ fetch: { headers: { cookie: authCookieA } } }
		)

		// Verify Org B profile is unchanged
		const { data } = await tClient.api.barbershop.get({
			fetch: { headers: { cookie: authCookieB } }
		})
		expect(data?.data.name).not.toBe('Org A Shop')
		expect(data?.data.slug).toBe(orgSlugB)
	})

	// T-19: Idempotency — same PATCH twice
	it('T-19: Two identical PATCHes both return 200', async () => {
		const payload = { description: 'Idempotency test description' }
		const { status: s1 } = await tClient.api.barbershop.settings.patch(
			payload,
			{ fetch: { headers: { cookie: authCookieA } } }
		)
		const { status: s2 } = await tClient.api.barbershop.settings.patch(
			payload,
			{ fetch: { headers: { cookie: authCookieA } } }
		)
		expect(s1).toBe(200)
		expect(s2).toBe(200)
	})
})
