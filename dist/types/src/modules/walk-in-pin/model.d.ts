export declare namespace WalkInPinModel {
    const GeneratePinResponse: import("@sinclair/typebox").TObject<{
        pin: import("@sinclair/typebox").TString;
        expiresAt: import("@sinclair/typebox").TDate;
        activeCount: import("@sinclair/typebox").TNumber;
    }>;
    type GeneratePinResponse = typeof GeneratePinResponse.static;
    const ActiveCountResponse: import("@sinclair/typebox").TObject<{
        activeCount: import("@sinclair/typebox").TNumber;
        limit: import("@sinclair/typebox").TNumber;
    }>;
    type ActiveCountResponse = typeof ActiveCountResponse.static;
    const ValidatePinBody: import("@sinclair/typebox").TObject<{
        pin: import("@sinclair/typebox").TString;
    }>;
    type ValidatePinBody = typeof ValidatePinBody.static;
    const ValidatePinResponse: import("@sinclair/typebox").TObject<{
        validationToken: import("@sinclair/typebox").TString;
    }>;
    type ValidatePinResponse = typeof ValidatePinResponse.static;
    const WalkInBookingBody: import("@sinclair/typebox").TObject<{
        validationToken: import("@sinclair/typebox").TString;
        customerName: import("@sinclair/typebox").TString;
        customerPhone: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>>;
        customerEmail: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>>;
        serviceIds: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>;
        barberId: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>>;
        notes: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>>;
    }>;
    type WalkInBookingBody = typeof WalkInBookingBody.static;
    const SlugParam: import("@sinclair/typebox").TObject<{
        slug: import("@sinclair/typebox").TString;
    }>;
    type SlugParam = typeof SlugParam.static;
}
