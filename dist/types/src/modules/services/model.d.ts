export declare const ServiceSortEnum: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"name_asc">, import("@sinclair/typebox").TLiteral<"name_desc">, import("@sinclair/typebox").TLiteral<"price_asc">, import("@sinclair/typebox").TLiteral<"price_desc">, import("@sinclair/typebox").TLiteral<"recent">]>;
export declare namespace ServiceModel {
    const ServiceCreateInput: import("@sinclair/typebox").TObject<{
        name: import("@sinclair/typebox").TString;
        description: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>>;
        price: import("@sinclair/typebox").TInteger;
        duration: import("@sinclair/typebox").TInteger;
        discount: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TInteger>;
        isActive: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>;
    }>;
    type ServiceCreateInput = typeof ServiceCreateInput.static;
    const ServiceUpdateInput: import("@sinclair/typebox").TObject<{
        name: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        description: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>>;
        price: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TInteger>;
        duration: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TInteger>;
        discount: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TInteger>;
        isDefault: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>;
    }>;
    type ServiceUpdateInput = typeof ServiceUpdateInput.static;
    const ServiceListQuery: import("@sinclair/typebox").TObject<{
        search: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        sort: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"name_asc">, import("@sinclair/typebox").TLiteral<"name_desc">, import("@sinclair/typebox").TLiteral<"price_asc">, import("@sinclair/typebox").TLiteral<"price_desc">, import("@sinclair/typebox").TLiteral<"recent">]>>;
        activeOnly: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>;
    }>;
    type ServiceListQuery = typeof ServiceListQuery.static;
    const ServiceIdParam: import("@sinclair/typebox").TObject<{
        id: import("@sinclair/typebox").TString;
    }>;
    type ServiceIdParam = typeof ServiceIdParam.static;
    const ServiceImageUploadInput: import("@sinclair/typebox").TObject<{
        file: import("@sinclair/typebox").TUnsafe<File>;
    }>;
    type ServiceImageUploadInput = typeof ServiceImageUploadInput.static;
    const ServiceImageUploadResponse: import("@sinclair/typebox").TObject<{
        imageUrl: import("@sinclair/typebox").TString;
    }>;
    type ServiceImageUploadResponse = typeof ServiceImageUploadResponse.static;
    const ServiceResponse: import("@sinclair/typebox").TObject<{
        id: import("@sinclair/typebox").TString;
        organizationId: import("@sinclair/typebox").TString;
        name: import("@sinclair/typebox").TString;
        description: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>;
        price: import("@sinclair/typebox").TNumber;
        duration: import("@sinclair/typebox").TNumber;
        discount: import("@sinclair/typebox").TNumber;
        imageUrl: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>;
        isActive: import("@sinclair/typebox").TBoolean;
        isDefault: import("@sinclair/typebox").TBoolean;
        createdAt: import("@sinclair/typebox").TDate;
        updatedAt: import("@sinclair/typebox").TDate;
    }>;
    type ServiceResponse = typeof ServiceResponse.static;
}
