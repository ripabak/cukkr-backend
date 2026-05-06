export declare namespace BarberModel {
    const BarberInviteInput: import("@sinclair/typebox").TObject<{
        email: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        phone: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    }>;
    type BarberInviteInput = typeof BarberInviteInput.static;
    const BarberInviteResponse: import("@sinclair/typebox").TObject<{
        id: import("@sinclair/typebox").TString;
        email: import("@sinclair/typebox").TString;
        phone: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>;
        role: import("@sinclair/typebox").TString;
        status: import("@sinclair/typebox").TString;
        expiresAt: import("@sinclair/typebox").TDate;
        expired: import("@sinclair/typebox").TBoolean;
    }>;
    type BarberInviteResponse = typeof BarberInviteResponse.static;
    const BarberListStatus: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"active">, import("@sinclair/typebox").TLiteral<"pending">]>;
    type BarberListStatus = typeof BarberListStatus.static;
    const BarberListItem: import("@sinclair/typebox").TObject<{
        id: import("@sinclair/typebox").TString;
        userId: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>;
        name: import("@sinclair/typebox").TString;
        email: import("@sinclair/typebox").TString;
        phone: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>;
        avatarUrl: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>;
        role: import("@sinclair/typebox").TString;
        status: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"active">, import("@sinclair/typebox").TLiteral<"pending">]>;
        createdAt: import("@sinclair/typebox").TDate;
        expiresAt: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TDate, import("@sinclair/typebox").TNull]>>;
        expired: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>;
    }>;
    type BarberListItem = typeof BarberListItem.static;
    const InvitationIdParam: import("@sinclair/typebox").TObject<{
        invitationId: import("@sinclair/typebox").TString;
    }>;
    type InvitationIdParam = typeof InvitationIdParam.static;
    const MemberIdParam: import("@sinclair/typebox").TObject<{
        memberId: import("@sinclair/typebox").TString;
    }>;
    type MemberIdParam = typeof MemberIdParam.static;
    const BarberListQuery: import("@sinclair/typebox").TObject<{
        search: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        status: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"active">, import("@sinclair/typebox").TLiteral<"pending">]>>;
    }>;
    type BarberListQuery = typeof BarberListQuery.static;
    const InvitationActionResponse: import("@sinclair/typebox").TObject<{
        message: import("@sinclair/typebox").TString;
    }>;
    type InvitationActionResponse = typeof InvitationActionResponse.static;
    const CancelInviteResponse: import("@sinclair/typebox").TObject<{
        message: import("@sinclair/typebox").TString;
    }>;
    type CancelInviteResponse = typeof CancelInviteResponse.static;
    const BarberRemoveResponse: import("@sinclair/typebox").TObject<{
        message: import("@sinclair/typebox").TString;
    }>;
    type BarberRemoveResponse = typeof BarberRemoveResponse.static;
    const BulkInviteInput: import("@sinclair/typebox").TObject<{
        targets: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TObject<{
            email: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
            phone: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        }>>;
    }>;
    type BulkInviteInput = typeof BulkInviteInput.static;
    const BulkInviteResponse: import("@sinclair/typebox").TObject<{
        invited: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TObject<{
            id: import("@sinclair/typebox").TString;
            email: import("@sinclair/typebox").TString;
            phone: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>;
            role: import("@sinclair/typebox").TString;
            status: import("@sinclair/typebox").TString;
            expiresAt: import("@sinclair/typebox").TDate;
            expired: import("@sinclair/typebox").TBoolean;
        }>>;
        count: import("@sinclair/typebox").TNumber;
    }>;
    type BulkInviteResponse = typeof BulkInviteResponse.static;
}
