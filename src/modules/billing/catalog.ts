/**
 * Billing plan catalog — SINGLE SOURCE OF TRUTH for plan structure & pricing.
 *
 * Clients (cukkr-web landing, cukkr-frontend app) fetch this via
 * `GET /api/billing/plans`. Feature lists are arrays of machine-readable
 * feature KEYS; display labels are translated per-client in each app's
 * i18n dictionary (see `pricing.features` / `billing.features`).
 *
 * Prices are in IDR, billed monthly. When real Xendit integration lands,
 * subscription enforcement (limits per plan) must read from this catalog
 * (or its DB-backed successor) server-side.
 */

export interface PlanCatalogEntry {
	id: string
	name: string
	price: number
	currency: string
	interval: string
	maxBarbershops: number | null
	features: string[]
	/**
	 * Plan enterprise — TIDAK bisa dibeli langsung via checkout.
	 * Calon customer harus menghubungi tim Cukkr (hello@cukkr.com) dulu.
	 */
	requiresContact?: boolean
}

export const PLANS_CATALOG: readonly PlanCatalogEntry[] = [
	{
		id: 'free',
		name: 'Free',
		price: 0,
		currency: 'IDR',
		interval: 'month',
		/** Max barbershops this plan allows; null = unlimited. Used by subscription enforcement. */
		maxBarbershops: 1,
		features: [
			'barbershop_count_1',
			'walk_in_queue',
			'appointment_booking',
			'public_booking_page',
			'services_unlimited',
			'barber_count_3',
			'analytics_basic',
			'notifications_inapp'
		]
	},
	{
		id: 'premium',
		name: 'Premium',
		price: 99_000,
		currency: 'IDR',
		interval: 'month',
		maxBarbershops: 3,
		features: [
			'includes_free',
			'barbershop_count_3',
			'broadcasting',
			'custom_booking_path',
			'barber_unlimited',
			'analytics_full',
			'email_support'
		]
	},
	{
		id: 'business',
		name: 'Business',
		price: 299_000,
		currency: 'IDR',
		interval: 'month',
		requiresContact: true,
		maxBarbershops: null,
		features: [
			'includes_premium',
			'barbershop_unlimited',
			'priority_email_support'
		]
	}
]
