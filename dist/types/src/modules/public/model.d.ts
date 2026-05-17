declare const PublicBarberItem: import("@sinclair/typebox").TObject<{
    id: import("@sinclair/typebox").TString;
    name: import("@sinclair/typebox").TString;
    avatarUrl: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>;
}>;
declare const PublicServiceItem: import("@sinclair/typebox").TObject<{
    id: import("@sinclair/typebox").TString;
    name: import("@sinclair/typebox").TString;
    description: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>;
    price: import("@sinclair/typebox").TNumber;
    duration: import("@sinclair/typebox").TNumber;
    discount: import("@sinclair/typebox").TNumber;
    imageUrl: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>;
    isDefault: import("@sinclair/typebox").TBoolean;
}>;
declare const PublicBarbershopResponse: import("@sinclair/typebox").TObject<{
    id: import("@sinclair/typebox").TString;
    name: import("@sinclair/typebox").TString;
    slug: import("@sinclair/typebox").TString;
    description: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>;
    address: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>;
    logoUrl: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>;
    services: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TObject<{
        id: import("@sinclair/typebox").TString;
        name: import("@sinclair/typebox").TString;
        description: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>;
        price: import("@sinclair/typebox").TNumber;
        duration: import("@sinclair/typebox").TNumber;
        discount: import("@sinclair/typebox").TNumber;
        imageUrl: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>;
        isDefault: import("@sinclair/typebox").TBoolean;
    }>>;
    barbers: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TObject<{
        id: import("@sinclair/typebox").TString;
        name: import("@sinclair/typebox").TString;
        avatarUrl: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>;
    }>>;
}>;
declare const WalkInFormDataResponse: import("@sinclair/typebox").TObject<{
    services: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TObject<{
        id: import("@sinclair/typebox").TString;
        name: import("@sinclair/typebox").TString;
        description: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>;
        price: import("@sinclair/typebox").TNumber;
        duration: import("@sinclair/typebox").TNumber;
        discount: import("@sinclair/typebox").TNumber;
        imageUrl: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>;
        isDefault: import("@sinclair/typebox").TBoolean;
    }>>;
    barbers: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TObject<{
        id: import("@sinclair/typebox").TString;
        name: import("@sinclair/typebox").TString;
        avatarUrl: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>;
    }>>;
}>;
declare const PublicSlugParam: import("@sinclair/typebox").TObject<{
    slug: import("@sinclair/typebox").TString;
}>;
declare const PublicAvailabilityQuery: import("@sinclair/typebox").TObject<{
    date: import("@sinclair/typebox").TString;
}>;
declare const PublicAvailabilityResponse: import("@sinclair/typebox").TObject<{
    date: import("@sinclair/typebox").TString;
    isOpen: import("@sinclair/typebox").TBoolean;
    openTime: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>;
    closeTime: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>;
}>;
declare const PublicAppointmentCreateInput: import("@sinclair/typebox").TObject<{
    customerName: import("@sinclair/typebox").TString;
    customerPhone: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>>;
    customerEmail: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>>;
    serviceIds: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>;
    barberId: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>>;
    scheduledAt: import("@sinclair/typebox").TString;
    notes: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>>;
}>;
declare const PublicAppointmentCreatedResponse: import("@sinclair/typebox").TObject<{
    id: import("@sinclair/typebox").TString;
    referenceNumber: import("@sinclair/typebox").TString;
    type: import("@sinclair/typebox").TLiteral<"appointment">;
    status: import("@sinclair/typebox").TLiteral<"requested">;
    scheduledAt: import("@sinclair/typebox").TDate;
    customerName: import("@sinclair/typebox").TString;
    serviceNames: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>;
    requestedBarber: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TObject<{
        memberId: import("@sinclair/typebox").TString;
        name: import("@sinclair/typebox").TString;
    }>, import("@sinclair/typebox").TNull]>;
}>;
export declare namespace PublicModel {
    type PublicBarberItem = typeof PublicBarberItem.static;
    type PublicServiceItem = typeof PublicServiceItem.static;
    type PublicBarbershopResponse = typeof PublicBarbershopResponse.static;
    type WalkInFormDataResponse = typeof WalkInFormDataResponse.static;
    type PublicSlugParam = typeof PublicSlugParam.static;
    type PublicAvailabilityQuery = typeof PublicAvailabilityQuery.static;
    type PublicAvailabilityResponse = typeof PublicAvailabilityResponse.static;
    type PublicAppointmentCreateInput = typeof PublicAppointmentCreateInput.static;
    type PublicAppointmentCreatedResponse = typeof PublicAppointmentCreatedResponse.static;
    const Schemas: {
        PublicBarberItem: import("@sinclair/typebox").TObject<{
            id: import("@sinclair/typebox").TString;
            name: import("@sinclair/typebox").TString;
            avatarUrl: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>;
        }>;
        PublicServiceItem: import("@sinclair/typebox").TObject<{
            id: import("@sinclair/typebox").TString;
            name: import("@sinclair/typebox").TString;
            description: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>;
            price: import("@sinclair/typebox").TNumber;
            duration: import("@sinclair/typebox").TNumber;
            discount: import("@sinclair/typebox").TNumber;
            imageUrl: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>;
            isDefault: import("@sinclair/typebox").TBoolean;
        }>;
        PublicBarbershopResponse: import("@sinclair/typebox").TObject<{
            id: import("@sinclair/typebox").TString;
            name: import("@sinclair/typebox").TString;
            slug: import("@sinclair/typebox").TString;
            description: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>;
            address: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>;
            logoUrl: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>;
            services: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TObject<{
                id: import("@sinclair/typebox").TString;
                name: import("@sinclair/typebox").TString;
                description: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>;
                price: import("@sinclair/typebox").TNumber;
                duration: import("@sinclair/typebox").TNumber;
                discount: import("@sinclair/typebox").TNumber;
                imageUrl: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>;
                isDefault: import("@sinclair/typebox").TBoolean;
            }>>;
            barbers: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TObject<{
                id: import("@sinclair/typebox").TString;
                name: import("@sinclair/typebox").TString;
                avatarUrl: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>;
            }>>;
        }>;
        WalkInFormDataResponse: import("@sinclair/typebox").TObject<{
            services: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TObject<{
                id: import("@sinclair/typebox").TString;
                name: import("@sinclair/typebox").TString;
                description: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>;
                price: import("@sinclair/typebox").TNumber;
                duration: import("@sinclair/typebox").TNumber;
                discount: import("@sinclair/typebox").TNumber;
                imageUrl: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>;
                isDefault: import("@sinclair/typebox").TBoolean;
            }>>;
            barbers: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TObject<{
                id: import("@sinclair/typebox").TString;
                name: import("@sinclair/typebox").TString;
                avatarUrl: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>;
            }>>;
        }>;
        PublicSlugParam: import("@sinclair/typebox").TObject<{
            slug: import("@sinclair/typebox").TString;
        }>;
        PublicAvailabilityQuery: import("@sinclair/typebox").TObject<{
            date: import("@sinclair/typebox").TString;
        }>;
        PublicAvailabilityResponse: import("@sinclair/typebox").TObject<{
            date: import("@sinclair/typebox").TString;
            isOpen: import("@sinclair/typebox").TBoolean;
            openTime: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>;
            closeTime: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>;
        }>;
        PublicAppointmentCreateInput: import("@sinclair/typebox").TObject<{
            customerName: import("@sinclair/typebox").TString;
            customerPhone: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>>;
            customerEmail: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>>;
            serviceIds: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>;
            barberId: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>>;
            scheduledAt: import("@sinclair/typebox").TString;
            notes: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>>;
        }>;
        PublicAppointmentCreatedResponse: import("@sinclair/typebox").TObject<{
            id: import("@sinclair/typebox").TString;
            referenceNumber: import("@sinclair/typebox").TString;
            type: import("@sinclair/typebox").TLiteral<"appointment">;
            status: import("@sinclair/typebox").TLiteral<"requested">;
            scheduledAt: import("@sinclair/typebox").TDate;
            customerName: import("@sinclair/typebox").TString;
            serviceNames: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>;
            requestedBarber: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TObject<{
                memberId: import("@sinclair/typebox").TString;
                name: import("@sinclair/typebox").TString;
            }>, import("@sinclair/typebox").TNull]>;
        }>;
    };
}
export {};
