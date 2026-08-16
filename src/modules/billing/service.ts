// Service handles business logic, decoupled from Elysia controller
import { PLANS_CATALOG } from './catalog'
import { BillingModel } from './model'

// Static catalog — no DB yet. Becomes DB-backed when subscriptions ship.
export abstract class BillingService {
	static getPlans(): BillingModel.PlanResponse[] {
		return PLANS_CATALOG.map((plan) => ({
			id: plan.id,
			name: plan.name,
			price: plan.price,
			currency: plan.currency,
			interval: plan.interval,
			features: [...plan.features]
		}))
	}
}
