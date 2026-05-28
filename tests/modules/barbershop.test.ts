import { describe, expect, it, beforeAll } from 'bun:test'
import { treaty } from '@elysiajs/eden'
import { app } from '../../src/app'

const tClient = treaty(app)
const ORIGIN = 'http://localhost:3001'

async function signUp(): Promise<string> {
	const res = await (tClient as any).auth.api['sign-up'].email.post(
		{
			email: `test_barber_${Date.now()}@example.com`,
			password: 'password123',
			name: 'Test User'
		},
		{ fetch: { headers: { origin: ORIGIN } } }
	)
	return res.response?.headers.get('set-cookie') || ''
}

describe('Barbershop Slug Auto-Generation Tests', () => {
	let cookie: string

	beforeAll(async () => {
		cookie = await signUp()
	})

	// T-01: Slug is auto-generated in name-xxxxx format
	it('T-01: Organization creation auto-generates slug matching name-[a-z0-9]{5}', async () => {
		const orgRes = await (tClient as any).auth.api.organization.create.post(
			{ name: 'Test Barber', slug: 'placeholder' },
			{ fetch: { headers: { cookie, origin: ORIGIN } } }
		)
		expect(orgRes.status).toBe(200)
		expect(orgRes.data?.slug).toMatch(/^test-barber-[a-z0-9]{5}$/)
	})

	// T-02: Two orgs with the same name get different slugs
	it('T-02: Two barbershops with the same name get different slugs', async () => {
		const cookie2 = await signUp()

		const res1 = await (tClient as any).auth.api.organization.create.post(
			{ name: 'Same Name Barber', slug: 'placeholder' },
			{ fetch: { headers: { cookie, origin: ORIGIN } } }
		)
		const res2 = await (tClient as any).auth.api.organization.create.post(
			{ name: 'Same Name Barber', slug: 'placeholder' },
			{ fetch: { headers: { cookie: cookie2, origin: ORIGIN } } }
		)

		expect(res1.data?.slug).toMatch(/^same-name-barber-[a-z0-9]{5}$/)
		expect(res2.data?.slug).toMatch(/^same-name-barber-[a-z0-9]{5}$/)
		expect(res1.data?.slug).not.toBe(res2.data?.slug)
	})

	// T-03: Slug-check still available endpoint
	it('T-03: GET /barbershop/slug-check returns available: true for a free slug', async () => {
		const { status, data } = await tClient.api.barbershop['slug-check'].get(
			{
				query: { slug: `free-slug-${Date.now()}` }
			}
		)
		expect(status).toBe(200)
		expect(data?.data.available).toBe(true)
	})
})
