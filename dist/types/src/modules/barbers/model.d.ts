export declare namespace BarberModel {
    const BarberListStatus: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"active">, import("@sinclair/typebox").TLiteral<"pending">]>;
    type BarberListStatus = typeof BarberListStatus.static;
    const BarberListItem: import("@sinclair/typebox").TObject<{
        id: import("@sinclair/typebox").TString;
        userId: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>;
        name: import("@sinclair/typebox").TString;
        email: import("@sinclair/typebox").TString;
        avatarUrl: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>;
        role: import("@sinclair/typebox").TString;
        status: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"active">, import("@sinclair/typebox").TLiteral<"pending">]>;
        createdAt: import("@sinclair/typebox").TDate;
        expiresAt: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TDate, import("@sinclair/typebox").TNull]>>;
        expired: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>;
    }>;
    type BarberListItem = typeof BarberListItem.static;
    const BarberListQuery: import("@sinclair/typebox").TObject<{
        search: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        status: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"active">, import("@sinclair/typebox").TLiteral<"pending">]>>;
    }>;
    type BarberListQuery = typeof BarberListQuery.static;
}
