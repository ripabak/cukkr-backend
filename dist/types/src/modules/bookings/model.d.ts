export declare const BOOKING_TYPES: readonly ["walk_in", "appointment"];
export declare const BOOKING_STATUSES: readonly ["pending", "requested", "waiting", "in_progress", "completed", "cancelled"];
export declare const BOOKING_LIST_STATUSES: readonly ["all", "pending", "requested", "waiting", "in_progress", "completed", "cancelled"];
export declare const BookingTypeEnum: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"walk_in">, import("@sinclair/typebox").TLiteral<"appointment">]>;
export declare const BookingStatusEnum: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"pending">, import("@sinclair/typebox").TLiteral<"requested">, import("@sinclair/typebox").TLiteral<"waiting">, import("@sinclair/typebox").TLiteral<"in_progress">, import("@sinclair/typebox").TLiteral<"completed">, import("@sinclair/typebox").TLiteral<"cancelled">]>;
export declare const BookingListStatusEnum: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"all">, import("@sinclair/typebox").TLiteral<"pending">, import("@sinclair/typebox").TLiteral<"requested">, import("@sinclair/typebox").TLiteral<"waiting">, import("@sinclair/typebox").TLiteral<"in_progress">, import("@sinclair/typebox").TLiteral<"completed">, import("@sinclair/typebox").TLiteral<"cancelled">]>;
export declare namespace BookingModel {
    type BookingType = (typeof BOOKING_TYPES)[number];
    type BookingStatus = (typeof BOOKING_STATUSES)[number];
    type BookingListStatus = (typeof BOOKING_LIST_STATUSES)[number];
    const WalkInBookingCreateInput: import("@sinclair/typebox").TObject<{
        type: import("@sinclair/typebox").TLiteral<"walk_in">;
        customerName: import("@sinclair/typebox").TString;
        customerEmail: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>>;
        serviceIds: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>;
        barberId: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>>;
        scheduledAt: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>>;
        notes: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>>;
    }>;
    type WalkInBookingCreateInput = typeof WalkInBookingCreateInput.static;
    const AppointmentBookingCreateInput: import("@sinclair/typebox").TObject<{
        type: import("@sinclair/typebox").TLiteral<"appointment">;
        customerName: import("@sinclair/typebox").TString;
        customerEmail: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>>;
        serviceIds: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>;
        barberId: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>>;
        scheduledAt: import("@sinclair/typebox").TString;
        notes: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>>;
    }>;
    type AppointmentBookingCreateInput = typeof AppointmentBookingCreateInput.static;
    const BookingIdParam: import("@sinclair/typebox").TObject<{
        id: import("@sinclair/typebox").TString;
    }>;
    type BookingIdParam = typeof BookingIdParam.static;
    const BookingCreateInput: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TObject<{
        type: import("@sinclair/typebox").TLiteral<"walk_in">;
        customerName: import("@sinclair/typebox").TString;
        customerEmail: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>>;
        serviceIds: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>;
        barberId: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>>;
        scheduledAt: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>>;
        notes: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>>;
    }>, import("@sinclair/typebox").TObject<{
        type: import("@sinclair/typebox").TLiteral<"appointment">;
        customerName: import("@sinclair/typebox").TString;
        customerEmail: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>>;
        serviceIds: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>;
        barberId: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>>;
        scheduledAt: import("@sinclair/typebox").TString;
        notes: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>>;
    }>]>;
    type BookingCreateInput = typeof BookingCreateInput.static;
    const BookingStatusUpdateInput: import("@sinclair/typebox").TObject<{
        status: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"pending">, import("@sinclair/typebox").TLiteral<"requested">, import("@sinclair/typebox").TLiteral<"waiting">, import("@sinclair/typebox").TLiteral<"in_progress">, import("@sinclair/typebox").TLiteral<"completed">, import("@sinclair/typebox").TLiteral<"cancelled">]>;
        cancelReason: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>>;
    }>;
    type BookingStatusUpdateInput = typeof BookingStatusUpdateInput.static;
    const BookingDeclineInput: import("@sinclair/typebox").TObject<{
        reason: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    }>;
    type BookingDeclineInput = typeof BookingDeclineInput.static;
    const BookingReassignInput: import("@sinclair/typebox").TObject<{
        handledByMemberId: import("@sinclair/typebox").TString;
    }>;
    type BookingReassignInput = typeof BookingReassignInput.static;
    const BookingListQuery: import("@sinclair/typebox").TObject<{
        date: import("@sinclair/typebox").TString;
        status: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"all">, import("@sinclair/typebox").TLiteral<"pending">, import("@sinclair/typebox").TLiteral<"requested">, import("@sinclair/typebox").TLiteral<"waiting">, import("@sinclair/typebox").TLiteral<"in_progress">, import("@sinclair/typebox").TLiteral<"completed">, import("@sinclair/typebox").TLiteral<"cancelled">]>>;
        barberId: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        sort: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"oldest_first">, import("@sinclair/typebox").TLiteral<"recently_added">]>>;
    }>;
    type BookingListQuery = typeof BookingListQuery.static;
    const BookingServiceLineItemResponse: import("@sinclair/typebox").TObject<{
        id: import("@sinclair/typebox").TString;
        serviceId: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>;
        serviceName: import("@sinclair/typebox").TString;
        price: import("@sinclair/typebox").TNumber;
        originalPrice: import("@sinclair/typebox").TNumber;
        discount: import("@sinclair/typebox").TNumber;
        duration: import("@sinclair/typebox").TNumber;
    }>;
    type BookingServiceLineItemResponse = typeof BookingServiceLineItemResponse.static;
    const CustomerResponse: import("@sinclair/typebox").TObject<{
        id: import("@sinclair/typebox").TString;
        name: import("@sinclair/typebox").TString;
        phone: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>;
        email: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>;
        isVerified: import("@sinclair/typebox").TBoolean;
        notes: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>;
        createdAt: import("@sinclair/typebox").TDate;
        updatedAt: import("@sinclair/typebox").TDate;
    }>;
    type CustomerResponse = typeof CustomerResponse.static;
    const BarberSummaryResponse: import("@sinclair/typebox").TObject<{
        memberId: import("@sinclair/typebox").TString;
        userId: import("@sinclair/typebox").TString;
        name: import("@sinclair/typebox").TString;
        email: import("@sinclair/typebox").TString;
        role: import("@sinclair/typebox").TString;
    }>;
    type BarberSummaryResponse = typeof BarberSummaryResponse.static;
    const BookingSummaryResponse: import("@sinclair/typebox").TObject<{
        id: import("@sinclair/typebox").TString;
        referenceNumber: import("@sinclair/typebox").TString;
        type: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"walk_in">, import("@sinclair/typebox").TLiteral<"appointment">]>;
        status: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"pending">, import("@sinclair/typebox").TLiteral<"requested">, import("@sinclair/typebox").TLiteral<"waiting">, import("@sinclair/typebox").TLiteral<"in_progress">, import("@sinclair/typebox").TLiteral<"completed">, import("@sinclair/typebox").TLiteral<"cancelled">]>;
        customerName: import("@sinclair/typebox").TString;
        serviceNames: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>;
        totalDuration: import("@sinclair/typebox").TNumber;
        barber: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TObject<{
            memberId: import("@sinclair/typebox").TString;
            userId: import("@sinclair/typebox").TString;
            name: import("@sinclair/typebox").TString;
            email: import("@sinclair/typebox").TString;
            role: import("@sinclair/typebox").TString;
        }>, import("@sinclair/typebox").TNull]>;
        scheduledAt: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TDate, import("@sinclair/typebox").TNull]>;
        createdAt: import("@sinclair/typebox").TDate;
        source: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"customer">, import("@sinclair/typebox").TLiteral<"staff">]>;
    }>;
    type BookingSummaryResponse = typeof BookingSummaryResponse.static;
    const BookingDetailResponse: import("@sinclair/typebox").TObject<{
        id: import("@sinclair/typebox").TString;
        organizationId: import("@sinclair/typebox").TString;
        referenceNumber: import("@sinclair/typebox").TString;
        type: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"walk_in">, import("@sinclair/typebox").TLiteral<"appointment">]>;
        status: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"pending">, import("@sinclair/typebox").TLiteral<"requested">, import("@sinclair/typebox").TLiteral<"waiting">, import("@sinclair/typebox").TLiteral<"in_progress">, import("@sinclair/typebox").TLiteral<"completed">, import("@sinclair/typebox").TLiteral<"cancelled">]>;
        customer: import("@sinclair/typebox").TObject<{
            id: import("@sinclair/typebox").TString;
            name: import("@sinclair/typebox").TString;
            phone: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>;
            email: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>;
            isVerified: import("@sinclair/typebox").TBoolean;
            notes: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>;
            createdAt: import("@sinclair/typebox").TDate;
            updatedAt: import("@sinclair/typebox").TDate;
        }>;
        requestedBarber: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TObject<{
            memberId: import("@sinclair/typebox").TString;
            userId: import("@sinclair/typebox").TString;
            name: import("@sinclair/typebox").TString;
            email: import("@sinclair/typebox").TString;
            role: import("@sinclair/typebox").TString;
        }>, import("@sinclair/typebox").TNull]>;
        handledByBarber: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TObject<{
            memberId: import("@sinclair/typebox").TString;
            userId: import("@sinclair/typebox").TString;
            name: import("@sinclair/typebox").TString;
            email: import("@sinclair/typebox").TString;
            role: import("@sinclair/typebox").TString;
        }>, import("@sinclair/typebox").TNull]>;
        services: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TObject<{
            id: import("@sinclair/typebox").TString;
            serviceId: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>;
            serviceName: import("@sinclair/typebox").TString;
            price: import("@sinclair/typebox").TNumber;
            originalPrice: import("@sinclair/typebox").TNumber;
            discount: import("@sinclair/typebox").TNumber;
            duration: import("@sinclair/typebox").TNumber;
        }>>;
        totalDuration: import("@sinclair/typebox").TNumber;
        scheduledAt: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TDate, import("@sinclair/typebox").TNull]>;
        notes: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>;
        startedAt: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TDate, import("@sinclair/typebox").TNull]>;
        completedAt: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TDate, import("@sinclair/typebox").TNull]>;
        cancelledAt: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TDate, import("@sinclair/typebox").TNull]>;
        source: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"customer">, import("@sinclair/typebox").TLiteral<"staff">]>;
        createdByName: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>;
        createdById: import("@sinclair/typebox").TString;
        createdAt: import("@sinclair/typebox").TDate;
        updatedAt: import("@sinclair/typebox").TDate;
    }>;
    type BookingDetailResponse = typeof BookingDetailResponse.static;
    const BookingRequestListQuery: import("@sinclair/typebox").TObject<{
        dateFrom: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        dateTo: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        barberId: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    }>;
    type BookingRequestListQuery = typeof BookingRequestListQuery.static;
    const BookingHomeSummaryQuery: import("@sinclair/typebox").TObject<{
        dateFrom: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        dateTo: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    }>;
    type BookingHomeSummaryQuery = typeof BookingHomeSummaryQuery.static;
    const BookingHomeSummaryResponse: import("@sinclair/typebox").TObject<{
        dateFrom: import("@sinclair/typebox").TString;
        dateTo: import("@sinclair/typebox").TString;
        total: import("@sinclair/typebox").TNumber;
        walkIn: import("@sinclair/typebox").TNumber;
        appointment: import("@sinclair/typebox").TNumber;
        inProgress: import("@sinclair/typebox").TNumber;
        waiting: import("@sinclair/typebox").TNumber;
    }>;
    type BookingHomeSummaryResponse = typeof BookingHomeSummaryResponse.static;
    const BookingDateMarkersQuery: import("@sinclair/typebox").TObject<{
        dateFrom: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        dateTo: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    }>;
    type BookingDateMarkersQuery = typeof BookingDateMarkersQuery.static;
    const BookingDateMarkerEntry: import("@sinclair/typebox").TObject<{
        requested: import("@sinclair/typebox").TBoolean;
        waiting: import("@sinclair/typebox").TBoolean;
    }>;
    const BookingDateMarkersResponse: import("@sinclair/typebox").TObject<{
        markers: import("@sinclair/typebox").TRecord<import("@sinclair/typebox").TString, import("@sinclair/typebox").TObject<{
            requested: import("@sinclair/typebox").TBoolean;
            waiting: import("@sinclair/typebox").TBoolean;
        }>>;
    }>;
    type BookingDateMarkersResponse = typeof BookingDateMarkersResponse.static;
}
export type BookingType = (typeof BOOKING_TYPES)[number];
export type BookingStatus = (typeof BOOKING_STATUSES)[number];
export type BookingListStatus = (typeof BOOKING_LIST_STATUSES)[number];
