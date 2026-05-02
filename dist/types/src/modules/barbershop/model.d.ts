export declare namespace BarbershopModel {
    const BarbershopResponse: import("@sinclair/typebox").TObject<{
        id: import("@sinclair/typebox").TString;
        name: import("@sinclair/typebox").TString;
        slug: import("@sinclair/typebox").TString;
        description: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>;
        address: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>;
        logoUrl: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>;
        onboardingCompleted: import("@sinclair/typebox").TBoolean;
    }>;
    type BarbershopResponse = typeof BarbershopResponse.static;
    const BarbershopSettingsInput: import("@sinclair/typebox").TObject<{
        name: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        description: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>>;
        address: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>>;
        slug: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        onboardingCompleted: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>;
    }>;
    type BarbershopSettingsInput = typeof BarbershopSettingsInput.static;
    const SlugCheckQuery: import("@sinclair/typebox").TObject<{
        slug: import("@sinclair/typebox").TString;
    }>;
    type SlugCheckQuery = typeof SlugCheckQuery.static;
    const SlugCheckResponse: import("@sinclair/typebox").TObject<{
        available: import("@sinclair/typebox").TBoolean;
    }>;
    type SlugCheckResponse = typeof SlugCheckResponse.static;
    const CreateBarbershopInput: import("@sinclair/typebox").TObject<{
        name: import("@sinclair/typebox").TString;
        slug: import("@sinclair/typebox").TString;
        description: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>>;
        address: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>>;
    }>;
    type CreateBarbershopInput = typeof CreateBarbershopInput.static;
    const BarbershopListItem: import("@sinclair/typebox").TObject<{
        id: import("@sinclair/typebox").TString;
        name: import("@sinclair/typebox").TString;
        slug: import("@sinclair/typebox").TString;
        description: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>;
        address: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>;
        logoUrl: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>;
        onboardingCompleted: import("@sinclair/typebox").TBoolean;
        role: import("@sinclair/typebox").TString;
    }>;
    type BarbershopListItem = typeof BarbershopListItem.static;
    const BarbershopListResponse: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TObject<{
        id: import("@sinclair/typebox").TString;
        name: import("@sinclair/typebox").TString;
        slug: import("@sinclair/typebox").TString;
        description: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>;
        address: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>;
        logoUrl: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>;
        onboardingCompleted: import("@sinclair/typebox").TBoolean;
        role: import("@sinclair/typebox").TString;
    }>>;
    type BarbershopListResponse = typeof BarbershopListResponse.static;
    const OrgIdParam: import("@sinclair/typebox").TObject<{
        orgId: import("@sinclair/typebox").TString;
    }>;
    type OrgIdParam = typeof OrgIdParam.static;
    const LogoUploadInput: import("@sinclair/typebox").TObject<{
        file: import("@sinclair/typebox").TUnsafe<File>;
    }>;
    type LogoUploadInput = typeof LogoUploadInput.static;
    const LogoUploadResponse: import("@sinclair/typebox").TObject<{
        logoUrl: import("@sinclair/typebox").TString;
    }>;
    type LogoUploadResponse = typeof LogoUploadResponse.static;
    const LeaveOrgResponse: import("@sinclair/typebox").TObject<{
        message: import("@sinclair/typebox").TString;
    }>;
    type LeaveOrgResponse = typeof LeaveOrgResponse.static;
}
