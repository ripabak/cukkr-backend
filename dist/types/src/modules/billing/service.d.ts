import { BillingModel } from './model';
export declare abstract class BillingService {
    static getPlans(): BillingModel.PlanResponse[];
}
