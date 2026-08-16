export declare namespace BillingModel {
    const PlanResponse: import("@sinclair/typebox").TObject<{
        id: import("@sinclair/typebox").TString;
        name: import("@sinclair/typebox").TString;
        price: import("@sinclair/typebox").TNumber;
        currency: import("@sinclair/typebox").TString;
        interval: import("@sinclair/typebox").TString;
        features: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>;
    }>;
    type PlanResponse = typeof PlanResponse.static;
}
