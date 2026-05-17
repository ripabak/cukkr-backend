export declare const NotificationTypeEnum: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"appointment_requested">, import("@sinclair/typebox").TLiteral<"walk_in_arrival">, import("@sinclair/typebox").TLiteral<"barbershop_invitation">]>;
export declare const NotificationReferenceTypeEnum: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"booking">, import("@sinclair/typebox").TLiteral<"invitation">]>;
export declare const NotificationActionTypeEnum: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"accept_decline_appointment">, import("@sinclair/typebox").TLiteral<"accept_decline_invite">, import("@sinclair/typebox").TNull]>;
export declare namespace NotificationModel {
    const NotificationListQuery: import("@sinclair/typebox").TObject<{
        page: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
        pageSize: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
        unreadOnly: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>;
    }>;
    type NotificationListQuery = typeof NotificationListQuery.static;
    const NotificationIdParam: import("@sinclair/typebox").TObject<{
        id: import("@sinclair/typebox").TString;
    }>;
    type NotificationIdParam = typeof NotificationIdParam.static;
    const NotificationListItem: import("@sinclair/typebox").TObject<{
        id: import("@sinclair/typebox").TString;
        organizationId: import("@sinclair/typebox").TString;
        type: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"appointment_requested">, import("@sinclair/typebox").TLiteral<"walk_in_arrival">, import("@sinclair/typebox").TLiteral<"barbershop_invitation">]>;
        title: import("@sinclair/typebox").TString;
        body: import("@sinclair/typebox").TString;
        referenceId: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>;
        referenceType: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"booking">, import("@sinclair/typebox").TLiteral<"invitation">]>, import("@sinclair/typebox").TNull]>;
        actionType: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"accept_decline_appointment">, import("@sinclair/typebox").TLiteral<"accept_decline_invite">, import("@sinclair/typebox").TNull]>;
        isRead: import("@sinclair/typebox").TBoolean;
        createdAt: import("@sinclair/typebox").TDate;
        updatedAt: import("@sinclair/typebox").TDate;
    }>;
    type NotificationListItem = typeof NotificationListItem.static;
    const NotificationListResponse: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TObject<{
        id: import("@sinclair/typebox").TString;
        organizationId: import("@sinclair/typebox").TString;
        type: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"appointment_requested">, import("@sinclair/typebox").TLiteral<"walk_in_arrival">, import("@sinclair/typebox").TLiteral<"barbershop_invitation">]>;
        title: import("@sinclair/typebox").TString;
        body: import("@sinclair/typebox").TString;
        referenceId: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>;
        referenceType: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"booking">, import("@sinclair/typebox").TLiteral<"invitation">]>, import("@sinclair/typebox").TNull]>;
        actionType: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"accept_decline_appointment">, import("@sinclair/typebox").TLiteral<"accept_decline_invite">, import("@sinclair/typebox").TNull]>;
        isRead: import("@sinclair/typebox").TBoolean;
        createdAt: import("@sinclair/typebox").TDate;
        updatedAt: import("@sinclair/typebox").TDate;
    }>>;
    type NotificationListResponse = typeof NotificationListResponse.static;
    const NotificationUnreadCountResponse: import("@sinclair/typebox").TObject<{
        count: import("@sinclair/typebox").TNumber;
    }>;
    type NotificationUnreadCountResponse = typeof NotificationUnreadCountResponse.static;
    const NotificationMarkReadResponse: import("@sinclair/typebox").TObject<{
        id: import("@sinclair/typebox").TString;
        isRead: import("@sinclair/typebox").TBoolean;
        updatedAt: import("@sinclair/typebox").TDate;
    }>;
    type NotificationMarkReadResponse = typeof NotificationMarkReadResponse.static;
    const NotificationMarkAllReadResponse: import("@sinclair/typebox").TObject<{
        updatedCount: import("@sinclair/typebox").TNumber;
    }>;
    type NotificationMarkAllReadResponse = typeof NotificationMarkAllReadResponse.static;
    const NotificationRegisterPushTokenInput: import("@sinclair/typebox").TObject<{
        token: import("@sinclair/typebox").TString;
    }>;
    type NotificationRegisterPushTokenInput = typeof NotificationRegisterPushTokenInput.static;
    const NotificationRegisterPushTokenResponse: import("@sinclair/typebox").TObject<{
        tokenRegistered: import("@sinclair/typebox").TLiteral<true>;
    }>;
    type NotificationRegisterPushTokenResponse = typeof NotificationRegisterPushTokenResponse.static;
    const NotificationActionResponse: import("@sinclair/typebox").TObject<{
        notificationId: import("@sinclair/typebox").TString;
        action: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"accepted">, import("@sinclair/typebox").TLiteral<"declined">]>;
        referenceType: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"booking">, import("@sinclair/typebox").TLiteral<"invitation">]>;
        referenceId: import("@sinclair/typebox").TString;
    }>;
    type NotificationActionResponse = typeof NotificationActionResponse.static;
    const NotificationDeclineActionInput: import("@sinclair/typebox").TObject<{
        reason: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    }>;
    type NotificationDeclineActionInput = typeof NotificationDeclineActionInput.static;
}
