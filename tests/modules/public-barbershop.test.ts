import { beforeAll, describe, expect, it } from 'bun:test'
import { treaty } from '@elysiajs/eden'
import { customAlphabet, nanoid } from 'nanoid'

const nanoidSlug = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 8)

import { app } from '../../src/app'
import { db } from '../../src/lib/database'
import { service } from '../../src/modules/services/schema'

const tClient = treaty(app)
const ORIGIN = 'http://localhost:3001'

async function createPublicBarbershopContext(suffix: string) {
	const email = `public_${suffix}_${Date.now()}@example.com`
	const slug = `public-${suffix}-${nanoidSlug()}`

	const signUpRes = await (tClient as any).auth.api['sign-up'].email.post(
		{ email, password: 'password123', name: 'Public Owner' },
		{ fetch: { headers: { origin: ORIGIN } } }
	)
	const cookie = signUpRes.response?.headers.get('set-cookie') ?? ''

	const orgRes = await (tClient as any).auth.api.organization.create.post(
		{ name: `Public Shop ${suffix}`, slug },
		{ fetch: { headers: { cookie, origin: ORIGIN } } }
	)
	const orgId = orgRes.data?.id ?? ''

	await (tClient as any).auth.api.organization['set-active'].post(
		{ organizationId: orgId },
		{ fetch: { headers: { cookie, origin: ORIGIN } } }
	)

	return { slug, orgId }
}

describe('Public Barbershop API', () => {
	let slug = ''

	beforeAll(async () => {
		const ctx = await createPublicBarbershopContext('landing')
		slug = ctx.slug

		await db.insert(service).values([
			{
				id: nanoid(),
				organizationId: ctx.orgId,
				name: 'Active Service',
				description: 'An active service',
				price: 50000,
				duration: 30,
				discount: 0,
				isActive: true,
				isDefault: false
			},
			{
				id: nanoid(),
				organizationId: ctx.orgId,
				name: 'Inactive Service',
				description: 'An inactive service',
				price: 25000,
				duration: 20,
				discount: 0,
				isActive: false,
				isDefault: false
			}
		])
	})

	it('GET /api/public/barbershop/:slug returns 200 with correct shape', async () => {
		const { status, data } = await tClient.api.public
			.barbershop({ slug })
			.get()

		expect(status).toBe(200)
		const shop = (data as any)?.data
		expect(shop).toBeDefined()
		expect(shop.slug).toBe(slug)
		expect(Array.isArray(shop.services)).toBe(true)
		expect(Array.isArray(shop.barbers)).toBe(true)
	})

	it('only returns active services', async () => {
		const { data } = await tClient.api.public.barbershop({ slug }).get()

		const shop = (data as any)?.data
		const names: string[] = shop.services.map(
			(s: { name: string }) => s.name
		)
		expect(names).toContain('Active Service')
		expect(names).not.toContain('Inactive Service')
	})

	it('GET /api/public/barbershop/:slug returns 404 for unknown slug', async () => {
		const { status } = await tClient.api.public
			.barbershop({ slug: `unknown-shop-${nanoidSlug()}` })
			.get()

		expect(status).toBe(404)
	})

	it('endpoint does not require authentication', async () => {
		const { status } = await tClient.api.public.barbershop({ slug }).get()

		expect(status).toBe(200)
	})
})
