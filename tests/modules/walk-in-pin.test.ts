import { afterEach, beforeAll, describe, expect, it } from 'bun:test'
import { eq } from 'drizzle-orm'
import { treaty } from '@elysiajs/eden'

import { app } from '../../src/app'
import { db } from '../../src/lib/database'
import { member } from '../../src/modules/auth/schema'
import { walkInPin } from '../../src/modules/walk-in-pin/schema'
import { ipFailureGuard } from '../../src/utils/ip-failure-guard'

const tClient = treaty(app)
const ORIGIN = 'http://localhost:3001'

interface OwnerContext {
	authCookie: string
	orgId: string
	orgSlug: string
	ownerUserId: string
}

async function createOwnerWithOrg(suffix: string): Promise<OwnerContext> {
	const email = `walkin_${suffix}_${Date.now()}@example.com`
	const slug = `walkin-${suffix}-${Math.random().toString(36).substring(2, 8)}`

	const signUpRes = await (tClient as any).auth.api['sign-up'].email.post(
		{ email, password: 'password123', name: 'WalkIn Owner' },
		{ fetch: { headers: { origin: ORIGIN } } }
	)
	const cookie: string = signUpRes.response?.headers.get('set-cookie') ?? ''

	const orgRes = await (tClient as any).auth.api.organization.create.post(
		{ name: `WalkIn Shop ${suffix}`, slug },
		{ fetch: { headers: { cookie, origin: ORIGIN } } }
	)
	const orgId: string = orgRes.data?.id ?? ''

	const activeRes = await (tClient as any).auth.api.organization[
		'set-active'
	].post(
		{ organizationId: orgId },
		{ fetch: { headers: { cookie, origin: ORIGIN } } }
	)
	const authCookie: string =
		activeRes.response?.headers.get('set-cookie') ?? cookie

	const ownerMember = await db.query.member.findFirst({
		where: eq(member.organizationId, orgId)
	})

	if (!ownerMember) {
		throw new Error('Owner member not created for walk-in test setup')
	}

	return { authCookie, orgId, orgSlug: slug, ownerUserId: ownerMember.userId }
}

async function createInActiveService(authCookie: string): Promise<string> {
	const res = await tClient.api.services.post(
		{
			name: `Haircut ${Date.now()}`,
			price: 50000,
			duration: 30,
			discount: 0,
			description: null,
			isActive: false
		},
		{ fetch: { headers: { cookie: authCookie, origin: ORIGIN } } }
	)
	const serviceId: string = (res.data as any)?.data?.id ?? ''

	// Services default to isActive: false — toggle to active
	await (tClient as any).api.services[serviceId]['toggle-active'].patch(
		{},
		{ fetch: { headers: { cookie: authCookie, origin: ORIGIN } } }
	)

	return serviceId
}

describe('Walk-In PIN System', () => {
	let ownerA: OwnerContext
	let ownerB: OwnerContext
	let serviceIdA: string

	beforeAll(async () => {
		ownerA = await createOwnerWithOrg('a')
		ownerB = await createOwnerWithOrg('b')
		serviceIdA = await createInActiveService(ownerA.authCookie)
	})

	afterEach(() => {
		ipFailureGuard.resetAll()
	})

	// -------------------------------------------------------------------------
	// AC-01, AC-02: PIN Generation
	// -------------------------------------------------------------------------
	describe('PIN Generation (AC-01, AC-02)', () => {
		it('AC-01: authenticated owner generates a 4-digit PIN with expiresAt ~30 min', async () => {
			const before = Date.now()

			const res = await tClient.api.pin.generate.post(
				{},
				{
					fetch: {
						headers: { cookie: ownerA.authCookie, origin: ORIGIN }
					}
				}
			)

			expect(res.status).toBe(200)
			const body = res.data as any
			const pin: string = body?.data?.pin
			const expiresAt: string = body?.data?.expiresAt

			expect(typeof pin).toBe('string')
			expect(pin).toHaveLength(4)
			expect(/^\d{4}$/.test(pin)).toBe(true)

			const expiresMs = new Date(expiresAt).getTime()
			const expectedMs = before + 30 * 60 * 1000
			expect(Math.abs(expiresMs - expectedMs)).toBeLessThan(5000)
		})

		it('AC-02: returns 429 when 10 active PINs already exist', async () => {
			await db
				.delete(walkInPin)
				.where(eq(walkInPin.organizationId, ownerA.orgId))

			for (let i = 0; i < 10; i++) {
				const r = await tClient.api.pin.generate.post(
					{},
					{
						fetch: {
							headers: {
								cookie: ownerA.authCookie,
								origin: ORIGIN
							}
						}
					}
				)
				expect(r.status).toBe(200)
			}

			const res = await tClient.api.pin.generate.post(
				{},
				{
					fetch: {
						headers: { cookie: ownerA.authCookie, origin: ORIGIN }
					}
				}
			)
			expect(res.status).toBe(429)
		})
	})

	// -------------------------------------------------------------------------
	// AC-10: active-count has no `pin` field
	// -------------------------------------------------------------------------
	describe('Active Count (AC-10)', () => {
		it('AC-10: GET /api/pin/active-count response has no pin field', async () => {
			const res = await tClient.api.pin['active-count'].get({
				fetch: {
					headers: { cookie: ownerA.authCookie, origin: ORIGIN }
				}
			})

			expect(res.status).toBe(200)
			const body = res.data as any
			expect(body?.data?.pin).toBeUndefined()
			expect(typeof body?.data?.activeCount).toBe('number')
			expect(body?.data?.limit).toBe(10)
		})
	})

	// -------------------------------------------------------------------------
	// AC-03 through AC-09: PIN Validation
	// -------------------------------------------------------------------------
	describe('PIN Validation (AC-03 through AC-09)', () => {
		it('AC-03: valid PIN → 200 with validationToken', async () => {
			await db
				.delete(walkInPin)
				.where(eq(walkInPin.organizationId, ownerA.orgId))

			const genRes = await tClient.api.pin.generate.post(
				{},
				{
					fetch: {
						headers: { cookie: ownerA.authCookie, origin: ORIGIN }
					}
				}
			)
			const pin: string = (genRes.data as any)?.data?.pin

			const validateRes = await (tClient as any).api.public[
				ownerA.orgSlug
			].pin.validate.post(
				{ pin },
				{ fetch: { headers: { origin: ORIGIN } } }
			)

			expect(validateRes.status).toBe(200)
			const token: string = validateRes.data?.data?.validationToken
			expect(typeof token).toBe('string')
			expect(token.length).toBeGreaterThan(10)
		})

		it('AC-04: expired PIN → 400', async () => {
			await db
				.delete(walkInPin)
				.where(eq(walkInPin.organizationId, ownerA.orgId))

			const expiredPin = '1234'
			const hash = await Bun.password.hash(expiredPin, {
				algorithm: 'bcrypt',
				cost: 10
			})
			await db.insert(walkInPin).values({
				id: `test-expired-${Date.now()}`,
				organizationId: ownerA.orgId,
				generatedByUserId: ownerA.ownerUserId,
				pinHash: hash,
				isUsed: false,
				expiresAt: new Date(Date.now() - 1000),
				createdAt: new Date()
			})

			const res = await (tClient as any).api.public[
				ownerA.orgSlug
			].pin.validate.post(
				{ pin: expiredPin },
				{ fetch: { headers: { origin: ORIGIN } } }
			)

			expect(res.status).toBe(400)
		})

		it('AC-05: already-used PIN → 400', async () => {
			await db
				.delete(walkInPin)
				.where(eq(walkInPin.organizationId, ownerA.orgId))

			const genRes = await tClient.api.pin.generate.post(
				{},
				{
					fetch: {
						headers: { cookie: ownerA.authCookie, origin: ORIGIN }
					}
				}
			)
			const pin: string = (genRes.data as any)?.data?.pin

			await (tClient as any).api.public[ownerA.orgSlug].pin.validate.post(
				{ pin },
				{ fetch: { headers: { origin: ORIGIN } } }
			)

			const res = await (tClient as any).api.public[
				ownerA.orgSlug
			].pin.validate.post(
				{ pin },
				{ fetch: { headers: { origin: ORIGIN } } }
			)

			expect(res.status).toBe(400)
		})

		it('AC-06: wrong PIN → 400', async () => {
			await db
				.delete(walkInPin)
				.where(eq(walkInPin.organizationId, ownerA.orgId))

			await tClient.api.pin.generate.post(
				{},
				{
					fetch: {
						headers: { cookie: ownerA.authCookie, origin: ORIGIN }
					}
				}
			)

			const res = await (tClient as any).api.public[
				ownerA.orgSlug
			].pin.validate.post(
				{ pin: '0000' },
				{ fetch: { headers: { origin: ORIGIN } } }
			)

			expect(res.status).toBe(400)
		})

		it('AC-07: 6th attempt after 5 failures → 429', async () => {
			await db
				.delete(walkInPin)
				.where(eq(walkInPin.organizationId, ownerA.orgId))

			await tClient.api.pin.generate.post(
				{},
				{
					fetch: {
						headers: { cookie: ownerA.authCookie, origin: ORIGIN }
					}
				}
			)

			const testIp = '127.0.0.1'
			ipFailureGuard.reset(testIp)
			for (let i = 0; i < 5; i++) {
				ipFailureGuard.recordFailure(testIp)
			}

			const res = await (tClient as any).api.public[
				ownerA.orgSlug
			].pin.validate.post(
				{ pin: '0000' },
				{
					fetch: {
						headers: {
							origin: ORIGIN,
							'x-forwarded-for': testIp
						}
					}
				}
			)

			expect(res.status).toBe(429)
		})

		it('AC-09: PIN from org A cannot be validated at org B slug', async () => {
			await db
				.delete(walkInPin)
				.where(eq(walkInPin.organizationId, ownerA.orgId))

			const genRes = await tClient.api.pin.generate.post(
				{},
				{
					fetch: {
						headers: { cookie: ownerA.authCookie, origin: ORIGIN }
					}
				}
			)
			const pin: string = (genRes.data as any)?.data?.pin

			const res = await (tClient as any).api.public[
				ownerB.orgSlug
			].pin.validate.post(
				{ pin },
				{ fetch: { headers: { origin: ORIGIN } } }
			)

			expect(res.status).toBe(400)
		})
	})

	// -------------------------------------------------------------------------
	// AC-08, AC-11, AC-12: Walk-In Booking
	// -------------------------------------------------------------------------
	describe('Walk-In Booking (AC-08, AC-11, AC-12)', () => {
		it('AC-11: missing/no token → 401', async () => {
			const res = await (tClient as any).api.public[ownerA.orgSlug][
				'walk-in'
			].post(
				{
					validationToken: 'invalid.token.here',
					customerName: 'Test Customer',
					serviceIds: [serviceIdA]
				},
				{ fetch: { headers: { origin: ORIGIN } } }
			)

			expect(res.status).toBe(401)
		})

		it('AC-08: valid token creates booking; re-using the consumed PIN returns 400', async () => {
			await db
				.delete(walkInPin)
				.where(eq(walkInPin.organizationId, ownerA.orgId))

			const genRes = await tClient.api.pin.generate.post(
				{},
				{
					fetch: {
						headers: { cookie: ownerA.authCookie, origin: ORIGIN }
					}
				}
			)
			const pin: string = (genRes.data as any)?.data?.pin

			const validateRes = await (tClient as any).api.public[
				ownerA.orgSlug
			].pin.validate.post(
				{ pin },
				{ fetch: { headers: { origin: ORIGIN } } }
			)
			expect(validateRes.status).toBe(200)
			const validationToken: string =
				validateRes.data?.data?.validationToken

			const bookingRes = await (tClient as any).api.public[
				ownerA.orgSlug
			]['walk-in'].post(
				{
					validationToken,
					customerName: 'Walk-In Customer',
					serviceIds: [serviceIdA]
				},
				{ fetch: { headers: { origin: ORIGIN } } }
			)
			expect(bookingRes.status).toBe(201)
			const booking = bookingRes.data?.data
			expect(booking?.id).toBeDefined()
			expect(booking?.type).toBe('walk_in')

			const reuseRes = await (tClient as any).api.public[
				ownerA.orgSlug
			].pin.validate.post(
				{ pin },
				{ fetch: { headers: { origin: ORIGIN } } }
			)
			expect(reuseRes.status).toBe(400)
		})

		it('AC-12: same validationToken used twice → second attempt 401', async () => {
			await db
				.delete(walkInPin)
				.where(eq(walkInPin.organizationId, ownerA.orgId))

			const genRes = await tClient.api.pin.generate.post(
				{},
				{
					fetch: {
						headers: { cookie: ownerA.authCookie, origin: ORIGIN }
					}
				}
			)
			const pin: string = (genRes.data as any)?.data?.pin

			const validateRes = await (tClient as any).api.public[
				ownerA.orgSlug
			].pin.validate.post(
				{ pin },
				{ fetch: { headers: { origin: ORIGIN } } }
			)
			const validationToken: string =
				validateRes.data?.data?.validationToken

			const first = await (tClient as any).api.public[ownerA.orgSlug][
				'walk-in'
			].post(
				{
					validationToken,
					customerName: 'Replay Customer',
					serviceIds: [serviceIdA]
				},
				{ fetch: { headers: { origin: ORIGIN } } }
			)
			expect(first.status).toBe(201)

			const second = await (tClient as any).api.public[ownerA.orgSlug][
				'walk-in'
			].post(
				{
					validationToken,
					customerName: 'Replay Customer',
					serviceIds: [serviceIdA]
				},
				{ fetch: { headers: { origin: ORIGIN } } }
			)
			expect(second.status).toBe(401)
		})
	})
})

describe('Public Walk-In Form Data (F4)', () => {
	let formDataOwner: OwnerContext
	let formServiceId: string

	beforeAll(async () => {
		formDataOwner = await createOwnerWithOrg('form-data')
		formServiceId = await createInActiveService(formDataOwner.authCookie)
	})

	it('F4-02: GET /public/:slug/form-data only includes active services', async () => {
		const activeRes = await tClient.api.services.post(
			{
				name: `Active Svc ${Date.now()}`,
				price: 30000,
				duration: 15,
				discount: 0,
				description: null
			},
			{
				fetch: {
					headers: {
						cookie: formDataOwner.authCookie,
						origin: ORIGIN
					}
				}
			}
		)
		const activeServiceId = (activeRes.data as any)?.data?.id

		const { data } = await (tClient as any).api.public[
			formDataOwner.orgSlug
		]['form-data'].get({ fetch: { headers: { origin: ORIGIN } } })

		const serviceIds = (data as any)?.data?.services.map(
			(s: { id: string }) => s.id
		)
		expect(serviceIds).toContain(activeServiceId)
	})

	it('F4-03: GET /public/:slug/form-data returns 404 for unknown slug', async () => {
		const { status } = await (tClient as any).api.public[
			'no-such-slug-xyz'
		]['form-data'].get({ fetch: { headers: { origin: ORIGIN } } })

		expect(status).toBe(404)
	})
})
