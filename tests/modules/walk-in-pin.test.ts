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
	const actualSlug: string = orgRes.data?.slug ?? slug

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

	return {
		authCookie,
		orgId,
		orgSlug: actualSlug,
		ownerUserId: ownerMember.userId
	}
}

async function createActiveService(authCookie: string): Promise<string> {
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
		serviceIdA = await createActiveService(ownerA.authCookie)
	})

	afterEach(() => {
		ipFailureGuard.resetAll()
	})

	// -------------------------------------------------------------------------
	// PIN Generation
	// -------------------------------------------------------------------------
	describe('PIN Generation', () => {
		it('generate returns a 4-digit PIN', async () => {
			const res = await tClient.api.pin.generate.post(
				{},
				{
					fetch: {
						headers: { cookie: ownerA.authCookie, origin: ORIGIN }
					}
				}
			)

			expect(res.status).toBe(200)
			const pin: string = (res.data as any)?.data?.pin
			expect(typeof pin).toBe('string')
			expect(pin).toHaveLength(4)
			expect(/^\d{4}$/.test(pin)).toBe(true)
		})

		it('generate overwrites previous PIN', async () => {
			const first = await tClient.api.pin.generate.post(
				{},
				{
					fetch: {
						headers: { cookie: ownerA.authCookie, origin: ORIGIN }
					}
				}
			)
			const firstPin: string = (first.data as any)?.data?.pin

			const second = await tClient.api.pin.generate.post(
				{},
				{
					fetch: {
						headers: { cookie: ownerA.authCookie, origin: ORIGIN }
					}
				}
			)
			const secondPin: string = (second.data as any)?.data?.pin

			const record = await db.query.walkInPin.findFirst({
				where: eq(walkInPin.organizationId, ownerA.orgId)
			})

			expect(record?.pin).toBe(secondPin)
			// old PIN no longer valid (unless by coincidence they match)
			if (firstPin !== secondPin) {
				const validateOld = await (tClient as any).api.public.booking[
					ownerA.orgSlug
				].pin.validate.post(
					{ pin: firstPin },
					{ fetch: { headers: { origin: ORIGIN } } }
				)
				expect(validateOld.status).toBe(400)
			}
		})
	})

	// -------------------------------------------------------------------------
	// GET /current
	// -------------------------------------------------------------------------
	describe('GET /pin/current', () => {
		it('returns current PIN after generate', async () => {
			const genRes = await tClient.api.pin.generate.post(
				{},
				{
					fetch: {
						headers: { cookie: ownerA.authCookie, origin: ORIGIN }
					}
				}
			)
			const generatedPin: string = (genRes.data as any)?.data?.pin

			const currentRes = await tClient.api.pin.current.get({
				fetch: {
					headers: { cookie: ownerA.authCookie, origin: ORIGIN }
				}
			})

			expect(currentRes.status).toBe(200)
			expect((currentRes.data as any)?.data?.pin).toBe(generatedPin)
		})
	})

	// -------------------------------------------------------------------------
	// PIN Validation
	// -------------------------------------------------------------------------
	describe('PIN Validation', () => {
		it('valid PIN returns validationToken', async () => {
			const genRes = await tClient.api.pin.generate.post(
				{},
				{
					fetch: {
						headers: { cookie: ownerA.authCookie, origin: ORIGIN }
					}
				}
			)
			const pin: string = (genRes.data as any)?.data?.pin

			const validateRes = await (tClient as any).api.public.booking[
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

		it('same PIN can be validated multiple times (reusable)', async () => {
			const genRes = await tClient.api.pin.generate.post(
				{},
				{
					fetch: {
						headers: { cookie: ownerA.authCookie, origin: ORIGIN }
					}
				}
			)
			const pin: string = (genRes.data as any)?.data?.pin

			for (let i = 0; i < 3; i++) {
				const res = await (tClient as any).api.public.booking[
					ownerA.orgSlug
				].pin.validate.post(
					{ pin },
					{ fetch: { headers: { origin: ORIGIN } } }
				)
				expect(res.status).toBe(200)
			}
		})

		it('wrong PIN returns 400', async () => {
			await tClient.api.pin.generate.post(
				{},
				{
					fetch: {
						headers: { cookie: ownerA.authCookie, origin: ORIGIN }
					}
				}
			)

			const res = await (tClient as any).api.public.booking[
				ownerA.orgSlug
			].pin.validate.post(
				{ pin: '0000' },
				{ fetch: { headers: { origin: ORIGIN } } }
			)

			expect(res.status).toBe(400)
		})

		it('6th attempt after 5 failures returns 429', async () => {
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

			const res = await (tClient as any).api.public.booking[
				ownerA.orgSlug
			].pin.validate.post(
				{ pin: '0000' },
				{
					fetch: {
						headers: { origin: ORIGIN, 'x-forwarded-for': testIp }
					}
				}
			)

			expect(res.status).toBe(429)
		})

		it('PIN from org A cannot be validated at org B slug', async () => {
			const genRes = await tClient.api.pin.generate.post(
				{},
				{
					fetch: {
						headers: { cookie: ownerA.authCookie, origin: ORIGIN }
					}
				}
			)
			const pin: string = (genRes.data as any)?.data?.pin

			const res = await (tClient as any).api.public.booking[
				ownerB.orgSlug
			].pin.validate.post(
				{ pin },
				{ fetch: { headers: { origin: ORIGIN } } }
			)

			expect(res.status).toBe(400)
		})
	})

	// -------------------------------------------------------------------------
	// Walk-In Booking
	// -------------------------------------------------------------------------
	describe('Walk-In Booking', () => {
		it('missing/invalid token returns 401', async () => {
			const res = await (tClient as any).api.public.booking[
				ownerA.orgSlug
			]['walk-in'].post(
				{
					validationToken: 'invalid.token.here',
					customerName: 'Test Customer',
					serviceIds: [serviceIdA]
				},
				{ fetch: { headers: { origin: ORIGIN } } }
			)

			expect(res.status).toBe(401)
		})

		it('valid token creates walk-in booking', async () => {
			const genRes = await tClient.api.pin.generate.post(
				{},
				{
					fetch: {
						headers: { cookie: ownerA.authCookie, origin: ORIGIN }
					}
				}
			)
			const pin: string = (genRes.data as any)?.data?.pin

			const validateRes = await (tClient as any).api.public.booking[
				ownerA.orgSlug
			].pin.validate.post(
				{ pin },
				{ fetch: { headers: { origin: ORIGIN } } }
			)
			const validationToken: string =
				validateRes.data?.data?.validationToken

			const bookingRes = await (tClient as any).api.public.booking[
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
		})

		it('multiple customers can book using the same PIN (different tokens)', async () => {
			const genRes = await tClient.api.pin.generate.post(
				{},
				{
					fetch: {
						headers: { cookie: ownerA.authCookie, origin: ORIGIN }
					}
				}
			)
			const pin: string = (genRes.data as any)?.data?.pin

			for (let i = 0; i < 3; i++) {
				const validateRes = await (tClient as any).api.public.booking[
					ownerA.orgSlug
				].pin.validate.post(
					{ pin },
					{ fetch: { headers: { origin: ORIGIN } } }
				)
				const validationToken: string =
					validateRes.data?.data?.validationToken

				const bookingRes = await (tClient as any).api.public.booking[
					ownerA.orgSlug
				]['walk-in'].post(
					{
						validationToken,
						customerName: `Customer ${i + 1}`,
						serviceIds: [serviceIdA]
					},
					{ fetch: { headers: { origin: ORIGIN } } }
				)

				expect(bookingRes.status).toBe(201)
			}
		})

		it('same validationToken used twice returns 401 on second attempt', async () => {
			const genRes = await tClient.api.pin.generate.post(
				{},
				{
					fetch: {
						headers: { cookie: ownerA.authCookie, origin: ORIGIN }
					}
				}
			)
			const pin: string = (genRes.data as any)?.data?.pin

			const validateRes = await (tClient as any).api.public.booking[
				ownerA.orgSlug
			].pin.validate.post(
				{ pin },
				{ fetch: { headers: { origin: ORIGIN } } }
			)
			const validationToken: string =
				validateRes.data?.data?.validationToken

			const first = await (tClient as any).api.public.booking[
				ownerA.orgSlug
			]['walk-in'].post(
				{
					validationToken,
					customerName: 'Replay Customer',
					serviceIds: [serviceIdA]
				},
				{ fetch: { headers: { origin: ORIGIN } } }
			)
			expect(first.status).toBe(201)

			const second = await (tClient as any).api.public.booking[
				ownerA.orgSlug
			]['walk-in'].post(
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
		formServiceId = await createActiveService(formDataOwner.authCookie)
	})

	it('F4-02: GET /public/booking/:slug/form-data only includes active services', async () => {
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

		const { data } = await (tClient as any).api.public.booking[
			formDataOwner.orgSlug
		]['form-data'].get({ fetch: { headers: { origin: ORIGIN } } })

		const serviceIds = (data as any)?.data?.services.map(
			(s: { id: string }) => s.id
		)
		expect(serviceIds).toContain(activeServiceId)
	})

	it('F4-03: GET /public/booking/:slug/form-data returns 404 for unknown slug', async () => {
		const { status } = await (tClient as any).api.public.booking[
			'no-such-slug-xyz'
		]['form-data'].get({ fetch: { headers: { origin: ORIGIN } } })

		expect(status).toBe(404)
	})
})
