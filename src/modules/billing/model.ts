// Model defines the data structure and validation for request and response
import { t } from 'elysia'

export namespace BillingModel {
	export const PlanResponse = t.Object({
		id: t.String(),
		name: t.String(),
		price: t.Number(),
		currency: t.String(),
		interval: t.String(),
		features: t.Array(t.String())
	})
	export type PlanResponse = typeof PlanResponse.static
}
