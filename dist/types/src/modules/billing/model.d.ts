export declare namespace BillingModel {
    const PlanResponse: import("@sinclair/typebox").TObject<{
        id: import("@sinclair/typebox").TString;
        name: import("@sinclair/typebox").TString;
        price: import("@sinclair/typebox").TNumber;
        currency: import("@sinclair/typebox").TString;
        interval: import("@sinclair/typebox").TString;
        maxBarbershops: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TNumber, import("@sinclair/typebox").TNull]>;
        features: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>;
        requiresContact: import("@sinclair/typebox").TBoolean;
    }>;
    type PlanResponse = typeof PlanResponse.static;
    const CheckoutInput: import("@sinclair/typebox").TObject<{
        planId: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"premium">, import("@sinclair/typebox").TLiteral<"business">]>;
        paymentMethod: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    }>;
    type CheckoutInput = typeof CheckoutInput.static;
    const CheckoutResponse: import("@sinclair/typebox").TObject<{
        invoiceId: import("@sinclair/typebox").TString;
        xenditInvoiceId: import("@sinclair/typebox").TString;
        invoiceUrl: import("@sinclair/typebox").TString;
        planId: import("@sinclair/typebox").TString;
        amount: import("@sinclair/typebox").TNumber;
        currency: import("@sinclair/typebox").TString;
    }>;
    type CheckoutResponse = typeof CheckoutResponse.static;
    const SubscriptionResponse: import("@sinclair/typebox").TObject<{
        planId: import("@sinclair/typebox").TString;
        plan: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TObject<{
            id: import("@sinclair/typebox").TString;
            name: import("@sinclair/typebox").TString;
            price: import("@sinclair/typebox").TNumber;
            currency: import("@sinclair/typebox").TString;
            interval: import("@sinclair/typebox").TString;
            maxBarbershops: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TNumber, import("@sinclair/typebox").TNull]>;
            features: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>;
            requiresContact: import("@sinclair/typebox").TBoolean;
        }>, import("@sinclair/typebox").TNull]>;
        status: import("@sinclair/typebox").TString;
        currentPeriodStart: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>;
        currentPeriodEnd: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>;
    }>;
    type SubscriptionResponse = typeof SubscriptionResponse.static;
    const PaymentResponse: import("@sinclair/typebox").TObject<{
        id: import("@sinclair/typebox").TString;
        planId: import("@sinclair/typebox").TString;
        amount: import("@sinclair/typebox").TNumber;
        currency: import("@sinclair/typebox").TString;
        status: import("@sinclair/typebox").TString;
        paymentMethod: import("@sinclair/typebox").TString;
        invoiceUrl: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>;
        xenditInvoiceId: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>;
        paidAt: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>;
        expiresAt: import("@sinclair/typebox").TString;
        createdAt: import("@sinclair/typebox").TString;
    }>;
    type PaymentResponse = typeof PaymentResponse.static;
    const WebhookInput: import("@sinclair/typebox").TAny;
    const WebhookResponse: import("@sinclair/typebox").TObject<{
        received: import("@sinclair/typebox").TBoolean;
        paymentStatus: import("@sinclair/typebox").TString;
    }>;
    type WebhookResponse = typeof WebhookResponse.static;
}
