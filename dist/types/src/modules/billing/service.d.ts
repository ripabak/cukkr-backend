import { BillingModel } from './model';
export declare const ENABLED_PAYMENT_METHODS: readonly ["QRIS"];
export type PaymentMethod = (typeof ENABLED_PAYMENT_METHODS)[number];
export declare abstract class BillingService {
    static getPlans(): BillingModel.PlanResponse[];
    static startCheckout(userId: string, input: BillingModel.CheckoutInput): Promise<BillingModel.CheckoutResponse>;
    static handleInvoiceWebhook(payload: {
        id?: string;
        external_id?: string;
        status?: string;
        amount?: number;
        paid_at?: string | null;
        payment_id?: string | null;
    }): Promise<BillingModel.WebhookResponse>;
    static activateOrRenew(userId: string, planId: string, paidAt: Date): Promise<void>;
    static getPayments(userId: string): Promise<BillingModel.PaymentResponse[]>;
    static getSubscription(userId: string): Promise<BillingModel.SubscriptionResponse>;
    static getEffectivePlanId(userId: string): Promise<string>;
    static expireStalePendingPayments(): Promise<number>;
    static expireOverdueSubscriptions(): Promise<number>;
    static getMaxBarbershops(userId: string): Promise<number | null>;
}
