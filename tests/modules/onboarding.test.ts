import { describe, expect, it, beforeAll } from 'bun:test'
import { treaty } from '@elysiajs/eden'
import { app } from '../../src/app'

const tClient = treaty(app)
const ORIGIN = 'http://localhost:3001'

interface OwnerContext {
	cookie: string
	orgId: string
	orgSlug: string
}

async function createOwnerContext(suffix: string): Promise<OwnerContext> {
	const email = `owner_${suffix}_${Date.now()}@example.com`
	const slug = `test-shop-${suffix}-${Date.now()}`

	const signUpRes = await (tClient as any).auth.api['sign-up'].email.post(
		{ email, password: 'password123', name: 'Owner User' },
		{ fetch: { headers: { origin: ORIGIN } } }
	)
	const cookie = signUpRes.response?.headers.get('set-cookie') ?? ''

	const orgRes = await (tClient as any).auth.api.organization.create.post(
		{ name: 'Test Barbershop', slug },
		{ fetch: { headers: { cookie, origin: ORIGIN } } }
	)
	const orgId: string = orgRes.data?.id ?? ''

	const activeRes = await (tClient as any).auth.api.organization[
		'set-active'
	].post(
		{ organizationId: orgId },
		{ fetch: { headers: { cookie, origin: ORIGIN } } }
	)
	const finalCookie = activeRes.response?.headers.get('set-cookie') ?? cookie

	return { cookie: finalCookie, orgId, orgSlug: slug }
}

async function getNoOrgCookie(): Promise<string> {
	const email = `noorg_${Date.now()}@example.com`
	const res = await (tClient as any).auth.api['sign-up'].email.post(
		{ email, password: 'password123', name: 'No Org User' },
		{ fetch: { headers: { origin: ORIGIN } } }
	)
	return res.response?.headers.get('set-cookie') ?? ''
}

// ─── Slug Check Tests ─────────────────────────────────────────────────────────

describe('Slug Check Tests', () => {
	let owner: OwnerContext

	beforeAll(async () => {
		owner = await createOwnerContext('slug')
	})

	it('should return available: true for a free slug', async () => {
		const { status, data } = await tClient.api.barbershop['slug-check'].get(
			{
				query: { slug: 'free-slug-xyz-99' }
			}
		)
		expect(status).toBe(200)
		expect(data?.data.available).toBe(true)
	})

	it('should return available: false for a taken slug (owner org slug)', async () => {
		const { status, data } = await tClient.api.barbershop['slug-check'].get(
			{
				query: { slug: owner.orgSlug }
			}
		)
		expect(status).toBe(200)
		expect(data?.data.available).toBe(false)
	})

	it('should return 400 for invalid slug format (uppercase letters)', async () => {
		const { status } = await tClient.api.barbershop['slug-check'].get({
			query: { slug: 'UPPERCASE' }
		})
		expect(status).toBe(400)
	})

	it('should return 400 for slug starting with hyphen', async () => {
		const { status } = await tClient.api.barbershop['slug-check'].get({
			query: { slug: '-starts-with-hyphen' }
		})
		expect(status).toBe(400)
	})

	it('should return 400 for slug shorter than 3 chars', async () => {
		const { status } = await tClient.api.barbershop['slug-check'].get({
			query: { slug: 'ab' }
		})
		expect(status).toBe(400)
	})
})

// ─── PATCH Barbershop Settings Tests ──────────────────────────────────────────

describe('PATCH Barbershop Settings Tests', () => {
	let owner: OwnerContext

	beforeAll(async () => {
		owner = await createOwnerContext('settings')
	})

	it('should update name and slug successfully (200)', async () => {
		const newSlug = `updated-shop-${Date.now()}`
		const { status, data } = await tClient.api.barbershop.settings.patch(
			{ name: 'Updated Barbershop', slug: newSlug },
			{ fetch: { headers: { cookie: owner.cookie } } }
		)
		expect(status).toBe(200)
		expect(data?.data.name).toBe('Updated Barbershop')
		expect(data?.data.slug).toBe(newSlug)
	})

	it('should return 409 when slug is already taken', async () => {
		const takenSlug = `taken-slug-${Date.now()}`
		const other = await createOwnerContext(`other-${Date.now()}`)
		// Assign the slug to another org first
		await tClient.api.barbershop.settings.patch(
			{ slug: takenSlug },
			{ fetch: { headers: { cookie: other.cookie } } }
		)

		const { status } = await tClient.api.barbershop.settings.patch(
			{ slug: takenSlug },
			{ fetch: { headers: { cookie: owner.cookie } } }
		)
		expect(status).toBe(409)
	})

	it('should return 400 for invalid slug format', async () => {
		const { status } = await tClient.api.barbershop.settings.patch(
			{ slug: 'INVALID SLUG!' },
			{ fetch: { headers: { cookie: owner.cookie } } }
		)
		expect(status).toBe(400)
	})

	it('should return 401 without auth', async () => {
		const { status } = await tClient.api.barbershop.settings.patch({
			name: 'No Auth'
		})
		expect(status).toBe(401)
	})

	it('should return 403 without active org', async () => {
		const noOrgCookie = await getNoOrgCookie()
		const { status } = await tClient.api.barbershop.settings.patch(
			{ name: 'No Org' },
			{ fetch: { headers: { cookie: noOrgCookie } } }
		)
		expect(status).toBe(403)
	})

	it('should set onboardingCompleted=true successfully (200)', async () => {
		const { status, data } = await tClient.api.barbershop.settings.patch(
			{ onboardingCompleted: true },
			{ fetch: { headers: { cookie: owner.cookie } } }
		)
		expect(status).toBe(200)
		expect(data?.data.onboardingCompleted).toBe(true)
	})

	it('should return 400 when trying to set onboardingCompleted=false', async () => {
		const { status } = await tClient.api.barbershop.settings.patch(
			{ onboardingCompleted: false },
			{ fetch: { headers: { cookie: owner.cookie } } }
		)
		expect(status).toBe(400)
	})
})

// ─── Barber Invite Tests ───────────────────────────────────────────────────────

describe('Barber Invite Tests', () => {
	let owner: OwnerContext

	beforeAll(async () => {
		owner = await createOwnerContext('invite')
	})

	it('should invite a barber successfully (201)', async () => {
		const email = `barber_${Date.now()}@example.com`
		const { status, data } = await tClient.api.barbers.invite.post(
			{ email },
			{ fetch: { headers: { cookie: owner.cookie } } }
		)
		expect(status).toBe(201)
		expect(data?.data.email).toBe(email)
		expect(data?.data.role).toBe('barber')
		expect(data?.data.status).toBe('pending')
		expect(data?.data.expiresAt).toBeDefined()
	})

	it('should return 409 when inviting the same email twice', async () => {
		const email = `barber_dup_${Date.now()}@example.com`
		await tClient.api.barbers.invite.post(
			{ email },
			{ fetch: { headers: { cookie: owner.cookie } } }
		)
		const { status } = await tClient.api.barbers.invite.post(
			{ email },
			{ fetch: { headers: { cookie: owner.cookie } } }
		)
		expect(status).toBe(409)
	})

	it('should return 400 for invalid email format', async () => {
		const { status } = await tClient.api.barbers.invite.post(
			{ email: 'not-an-email' },
			{ fetch: { headers: { cookie: owner.cookie } } }
		)
		expect(status).toBe(400)
	})

	it('should return 401 without auth', async () => {
		const { status } = await tClient.api.barbers.invite.post({
			email: 'noauth@example.com'
		})
		expect(status).toBe(401)
	})

	it('should return 403 without active org', async () => {
		const noOrgCookie = await getNoOrgCookie()
		const { status } = await tClient.api.barbers.invite.post(
			{ email: 'noorg@example.com' },
			{ fetch: { headers: { cookie: noOrgCookie } } }
		)
		expect(status).toBe(403)
	})
})

// ─── Service Creation Tests ────────────────────────────────────────────────────

describe('Service Creation Tests', () => {
	let owner: OwnerContext

	beforeAll(async () => {
		owner = await createOwnerContext('service')
	})

	it('should create a service with valid fields (201)', async () => {
		const { status, data } = await tClient.api.services.post(
			{
				name: 'Haircut',
				price: 50000,
				duration: 30,
				description: 'Standard haircut',
				discount: 10
			},
			{ fetch: { headers: { cookie: owner.cookie } } }
		)
		expect(status).toBe(201)
		expect(data?.data.isDefault).toBe(true)
		expect(data?.data.isActive).toBe(true)
		expect(data?.data.name).toBe('Haircut')
		expect(data?.data.price).toBe(50000)
	})

	it('should return 400 when price is 0', async () => {
		const { status } = await tClient.api.services.post(
			{ name: 'Bad Price', price: 0, duration: 30 },
			{ fetch: { headers: { cookie: owner.cookie } } }
		)
		expect(status).toBe(400)
	})

	it('should return 400 when price is negative', async () => {
		const { status } = await tClient.api.services.post(
			{ name: 'Negative Price', price: -1, duration: 30 },
			{ fetch: { headers: { cookie: owner.cookie } } }
		)
		expect(status).toBe(400)
	})

	it('should return 400 when duration is less than 5', async () => {
		const { status } = await tClient.api.services.post(
			{ name: 'Short Duration', price: 50000, duration: 4 },
			{ fetch: { headers: { cookie: owner.cookie } } }
		)
		expect(status).toBe(400)
	})

	it('should return 400 when discount is greater than 100', async () => {
		const { status } = await tClient.api.services.post(
			{
				name: 'Over Discount',
				price: 50000,
				duration: 30,
				discount: 101
			},
			{ fetch: { headers: { cookie: owner.cookie } } }
		)
		expect(status).toBe(400)
	})

	it('should return 400 when name is missing (empty string)', async () => {
		const { status } = await tClient.api.services.post(
			{ name: 'a', price: 50000, duration: 30 },
			{ fetch: { headers: { cookie: owner.cookie } } }
		)
		expect(status).toBe(400)
	})

	it('should return 401 without auth', async () => {
		const { status } = await tClient.api.services.post({
			name: 'No Auth Service',
			price: 50000,
			duration: 30
		})
		expect(status).toBe(401)
	})
})

// ─── Full Onboarding Wizard Flow ──────────────────────────────────────────────

describe('Full Onboarding Wizard Flow', () => {
	it('should complete the full 4-step wizard end-to-end', async () => {
		const owner = await createOwnerContext('wizard')
		const uniqueSlug = `wizard-shop-${Date.now()}`

		// Step 1: Check slug availability
		const slugCheckRes = await tClient.api.barbershop['slug-check'].get({
			query: { slug: uniqueSlug }
		})
		expect(slugCheckRes.status).toBe(200)
		expect(slugCheckRes.data?.data.available).toBe(true)

		// Step 1: PATCH barbershop settings (name + slug + description)
		const patchRes = await tClient.api.barbershop.settings.patch(
			{
				name: 'Wizard Barbershop',
				slug: uniqueSlug,
				description: 'The best cuts in town',
				address: '123 Main Street'
			},
			{ fetch: { headers: { cookie: owner.cookie } } }
		)
		expect(patchRes.status).toBe(200)
		expect(patchRes.data?.data.name).toBe('Wizard Barbershop')
		expect(patchRes.data?.data.slug).toBe(uniqueSlug)

		// Step 2: Invite a barber
		const inviteRes = await tClient.api.barbers.invite.post(
			{ email: `wizard-barber-${Date.now()}@example.com` },
			{ fetch: { headers: { cookie: owner.cookie } } }
		)
		expect(inviteRes.status).toBe(201)
		expect(inviteRes.data?.data.role).toBe('barber')

		// Step 4: Create the first service
		const serviceRes = await tClient.api.services.post(
			{ name: 'Classic Cut', price: 60000, duration: 45 },
			{ fetch: { headers: { cookie: owner.cookie } } }
		)
		expect(serviceRes.status).toBe(201)
		expect(serviceRes.data?.data.isDefault).toBe(true)
		expect(serviceRes.data?.data.isActive).toBe(true)

		// Finish: Mark onboarding as complete
		const completeRes = await tClient.api.barbershop.settings.patch(
			{ onboardingCompleted: true },
			{ fetch: { headers: { cookie: owner.cookie } } }
		)
		expect(completeRes.status).toBe(200)
		expect(completeRes.data?.data.onboardingCompleted).toBe(true)

		// Verify: GET /api/barbershop returns onboardingCompleted: true
		const getRes = await tClient.api.barbershop.get({
			fetch: { headers: { cookie: owner.cookie } }
		})
		expect(getRes.status).toBe(200)
		expect(getRes.data?.data.onboardingCompleted).toBe(true)

		// Verify idempotency: PATCH onboardingCompleted=true again is fine
		const idempotentRes = await tClient.api.barbershop.settings.patch(
			{ onboardingCompleted: true },
			{ fetch: { headers: { cookie: owner.cookie } } }
		)
		expect(idempotentRes.status).toBe(200)
		expect(idempotentRes.data?.data.onboardingCompleted).toBe(true)
	})
})
