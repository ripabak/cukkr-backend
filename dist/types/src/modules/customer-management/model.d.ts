export declare namespace CustomerManagementModel {
    const CustomerIdParam: import("@sinclair/typebox").TObject<{
        id: import("@sinclair/typebox").TString;
    }>;
    type CustomerIdParam = typeof CustomerIdParam.static;
    const CustomerListQuery: import("@sinclair/typebox").TObject<{
        limit: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
        page: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
        sort: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"recent">, import("@sinclair/typebox").TLiteral<"bookings_desc">, import("@sinclair/typebox").TLiteral<"spend_desc">, import("@sinclair/typebox").TLiteral<"name_asc">]>>;
        search: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    }>;
    type CustomerListQuery = typeof CustomerListQuery.static;
    const CustomerListItemResponse: import("@sinclair/typebox").TObject<{
        id: import("@sinclair/typebox").TString;
        name: import("@sinclair/typebox").TString;
        email: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>;
        phone: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>;
        isVerified: import("@sinclair/typebox").TBoolean;
        totalBookings: import("@sinclair/typebox").TNumber;
        totalSpend: import("@sinclair/typebox").TNumber;
        lastVisitAt: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TDate, import("@sinclair/typebox").TNull]>;
    }>;
    type CustomerListItemResponse = typeof CustomerListItemResponse.static;
    const BookingTypeFilter: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"all">, import("@sinclair/typebox").TLiteral<"appointment">, import("@sinclair/typebox").TLiteral<"walk_in">]>;
    type BookingTypeFilter = typeof BookingTypeFilter.static;
    const CustomerDetailResponse: import("@sinclair/typebox").TObject<{
        id: import("@sinclair/typebox").TString;
        name: import("@sinclair/typebox").TString;
        email: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>;
        phone: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>;
        isVerified: import("@sinclair/typebox").TBoolean;
        totalBookings: import("@sinclair/typebox").TNumber;
        totalSpend: import("@sinclair/typebox").TNumber;
        lastVisitAt: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TDate, import("@sinclair/typebox").TNull]>;
        createdAt: import("@sinclair/typebox").TDate;
        notes: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>;
        appointmentCount: import("@sinclair/typebox").TNumber;
        walkInCount: import("@sinclair/typebox").TNumber;
        completedCount: import("@sinclair/typebox").TNumber;
        cancelledCount: import("@sinclair/typebox").TNumber;
    }>;
    type CustomerDetailResponse = typeof CustomerDetailResponse.static;
    const CustomerNotesUpdateInput: import("@sinclair/typebox").TObject<{
        notes: import("@sinclair/typebox").TString;
    }>;
    type CustomerNotesUpdateInput = typeof CustomerNotesUpdateInput.static;
    const CustomerBookingServiceItem: import("@sinclair/typebox").TObject<{
        name: import("@sinclair/typebox").TString;
        price: import("@sinclair/typebox").TNumber;
    }>;
    type CustomerBookingServiceItem = typeof CustomerBookingServiceItem.static;
    const CustomerBookingItemResponse: import("@sinclair/typebox").TObject<{
        id: import("@sinclair/typebox").TString;
        referenceNumber: import("@sinclair/typebox").TString;
        createdAt: import("@sinclair/typebox").TDate;
        status: import("@sinclair/typebox").TString;
        type: import("@sinclair/typebox").TString;
        services: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TObject<{
            name: import("@sinclair/typebox").TString;
            price: import("@sinclair/typebox").TNumber;
        }>>;
        totalAmount: import("@sinclair/typebox").TNumber;
    }>;
    type CustomerBookingItemResponse = typeof CustomerBookingItemResponse.static;
    const PaginatedCustomerListResponse: import("@sinclair/typebox").TObject<{
        data: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TObject<{
            id: import("@sinclair/typebox").TString;
            name: import("@sinclair/typebox").TString;
            email: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>;
            phone: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>;
            isVerified: import("@sinclair/typebox").TBoolean;
            totalBookings: import("@sinclair/typebox").TNumber;
            totalSpend: import("@sinclair/typebox").TNumber;
            lastVisitAt: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TDate, import("@sinclair/typebox").TNull]>;
        }>>;
        meta: import("@sinclair/typebox").TObject<{
            page: import("@sinclair/typebox").TNumber;
            limit: import("@sinclair/typebox").TNumber;
            totalItems: import("@sinclair/typebox").TNumber;
            totalPages: import("@sinclair/typebox").TNumber;
            hasNext: import("@sinclair/typebox").TBoolean;
            hasPrev: import("@sinclair/typebox").TBoolean;
        }>;
    }>;
    type PaginatedCustomerListResponse = typeof PaginatedCustomerListResponse.static;
    const PaginatedBookingHistoryResponse: import("@sinclair/typebox").TObject<{
        data: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TObject<{
            id: import("@sinclair/typebox").TString;
            referenceNumber: import("@sinclair/typebox").TString;
            createdAt: import("@sinclair/typebox").TDate;
            status: import("@sinclair/typebox").TString;
            type: import("@sinclair/typebox").TString;
            services: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TObject<{
                name: import("@sinclair/typebox").TString;
                price: import("@sinclair/typebox").TNumber;
            }>>;
            totalAmount: import("@sinclair/typebox").TNumber;
        }>>;
        meta: import("@sinclair/typebox").TObject<{
            page: import("@sinclair/typebox").TNumber;
            limit: import("@sinclair/typebox").TNumber;
            totalItems: import("@sinclair/typebox").TNumber;
            totalPages: import("@sinclair/typebox").TNumber;
            hasNext: import("@sinclair/typebox").TBoolean;
            hasPrev: import("@sinclair/typebox").TBoolean;
        }>;
    }>;
    type PaginatedBookingHistoryResponse = typeof PaginatedBookingHistoryResponse.static;
}
