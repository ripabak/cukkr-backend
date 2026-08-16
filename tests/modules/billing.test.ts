import { describe, expect, it } from 'bun:test'
import { treaty } from '@elysiajs/eden'
import { app } from '../../src/app'

const tClient = treaty(app)

describe('Billing Plans', () => {
	it('returns the full plan catalog (public, no auth)', async () => {
		const { status, data } = await tClient.api.billing.plans.get()
		expect(status).toBe(200)

		const plans = data?.data
		expect(plans).toHaveLength(3)

		// Plan ids must be stable — clients key copy by these ids
		const ids = plans?.map((p) => p.id)
		expect(ids).toEqual(['free', 'premium', 'business'])
	})

	it('exposes prices and feature keys per plan', async () => {
		const { data } = await tClient.api.billing.plans.get()
		const plans = data?.data ?? []

		const free = plans.find((p) => p.id === 'free')
		const premium = plans.find((p) => p.id === 'premium')
		const business = plans.find((p) => p.id === 'business')

		expect(free?.price).toBe(0)
		expect(premium?.price).toBe(99_000)
		expect(business?.price).toBe(299_000)
		expect(premium?.currency).toBe('IDR')
		expect(premium?.interval).toBe('month')

		// Feature lists are arrays of feature keys
		expect(premium?.features).toContain('broadcasting')
		expect(premium?.features).toContain('custom_booking_path')
		expect(business?.features).toContain('barbershop_unlimited')
		expect(business?.features).toContain('priority_email_support')
	})
})
