import { describe, expect, it, beforeAll } from 'bun:test'
import { treaty } from '@elysiajs/eden'
import { app } from '../../src/app'
import { db } from '../../src/lib/database'
import { barbershopSettings } from '../../src/modules/barbershop/schema'
import { eq } from 'drizzle-orm'

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

async function signUpAndCreateOrg(): Promise<{
	cookie: string
	orgId: string
}> {
	const cookie = await signUp()
	const orgRes = await (tClient as any).auth.api.organization.create.post(
		{ name: 'Cooldown Test Org', slug: 'placeholder' },
		{ fetch: { headers: { cookie, origin: ORIGIN } } }
	)
	const orgId = orgRes.data?.id as string

	const setActiveRes = await (tClient as any).auth.api.organization[
		'set-active'
	].post(
		{ organizationId: orgId },
		{ fetch: { headers: { cookie, origin: ORIGIN } } }
	)

	return {
		cookie: setActiveRes.response?.headers.get('set-cookie') || cookie,
		orgId
	}
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

describe('Barbershop Slug Cooldown Tests', () => {
	// T-04: First slug change succeeds and sets lastSlugChangedAt
	it('T-04: First slug change succeeds and sets lastSlugChangedAt', async () => {
		const { cookie } = await signUpAndCreateOrg()

		const newSlug = `first-slug-${Date.now()}`
		const { status, data } = await tClient.api.barbershop.settings.patch(
			{ slug: newSlug },
			{ fetch: { headers: { cookie, origin: ORIGIN } } }
		)
		expect(status).toBe(200)
		expect(data?.data.slug).toBe(newSlug)
		expect(data?.data.lastSlugChangedAt).toBeTruthy()
		expect(data?.data.lastSlugChangedAt).not.toBeNull()
	})

	// T-05: Second slug change within cooldown returns 429
	it('T-05: Second slug change within cooldown returns 429', async () => {
		const { cookie } = await signUpAndCreateOrg()

		const firstSlug = `first-slug-${Date.now()}`
		const firstRes = await tClient.api.barbershop.settings.patch(
			{ slug: firstSlug },
			{ fetch: { headers: { cookie, origin: ORIGIN } } }
		)
		expect(firstRes.status).toBe(200)

		const secondSlug = `second-slug-${Date.now()}`
		const secondRes = await tClient.api.barbershop.settings.patch(
			{ slug: secondSlug },
			{ fetch: { headers: { cookie, origin: ORIGIN } } }
		)
		expect(secondRes.status).toBe(429)
	})

	// T-06: Slug change succeeds after cooldown expires
	it('T-06: Slug change succeeds after cooldown expires', async () => {
		const { cookie, orgId } = await signUpAndCreateOrg()

		const firstSlug = `first-slug-${Date.now()}`
		const firstRes = await tClient.api.barbershop.settings.patch(
			{ slug: firstSlug },
			{ fetch: { headers: { cookie, origin: ORIGIN } } }
		)
		expect(firstRes.status).toBe(200)

		const pastDate = new Date()
		pastDate.setHours(pastDate.getHours() - 73)
		await db
			.update(barbershopSettings)
			.set({ lastSlugChangedAt: pastDate })
			.where(eq(barbershopSettings.organizationId, orgId))

		const newSlug = `after-cooldown-${Date.now()}`
		const { status, data } = await tClient.api.barbershop.settings.patch(
			{ slug: newSlug },
			{ fetch: { headers: { cookie, origin: ORIGIN } } }
		)
		expect(status).toBe(200)
		expect(data?.data.slug).toBe(newSlug)
	})
})
