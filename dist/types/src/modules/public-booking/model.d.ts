declare const SlugParam: import("@sinclair/typebox").TObject<{
    slug: import("@sinclair/typebox").TString;
}>;
declare const FormDataResponse: import("@sinclair/typebox").TObject<{
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
declare const ValidatePinBody: import("@sinclair/typebox").TObject<{
    pin: import("@sinclair/typebox").TString;
}>;
declare const ValidatePinResponse: import("@sinclair/typebox").TObject<{
    validationToken: import("@sinclair/typebox").TString;
}>;
declare const WalkInBookingBody: import("@sinclair/typebox").TObject<{
    validationToken: import("@sinclair/typebox").TString;
    customerName: import("@sinclair/typebox").TString;
    customerPhone: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>>;
    customerEmail: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>>;
    serviceIds: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>;
    barberId: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>>;
    notes: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>>;
}>;
declare const AppointmentCreateInput: import("@sinclair/typebox").TObject<{
    customerName: import("@sinclair/typebox").TString;
    customerPhone: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>>;
    customerEmail: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>>;
    serviceIds: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>;
    barberId: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>>;
    scheduledAt: import("@sinclair/typebox").TString;
    notes: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>>;
}>;
declare const AppointmentCreatedResponse: import("@sinclair/typebox").TObject<{
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
export declare namespace PublicBookingModel {
    type SlugParam = typeof SlugParam.static;
    type FormDataResponse = typeof FormDataResponse.static;
    type ValidatePinBody = typeof ValidatePinBody.static;
    type ValidatePinResponse = typeof ValidatePinResponse.static;
    type WalkInBookingBody = typeof WalkInBookingBody.static;
    type AppointmentCreateInput = typeof AppointmentCreateInput.static;
    type AppointmentCreatedResponse = typeof AppointmentCreatedResponse.static;
    const Schemas: {
        SlugParam: import("@sinclair/typebox").TObject<{
            slug: import("@sinclair/typebox").TString;
        }>;
        FormDataResponse: import("@sinclair/typebox").TObject<{
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
        ValidatePinBody: import("@sinclair/typebox").TObject<{
            pin: import("@sinclair/typebox").TString;
        }>;
        ValidatePinResponse: import("@sinclair/typebox").TObject<{
            validationToken: import("@sinclair/typebox").TString;
        }>;
        WalkInBookingBody: import("@sinclair/typebox").TObject<{
            validationToken: import("@sinclair/typebox").TString;
            customerName: import("@sinclair/typebox").TString;
            customerPhone: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>>;
            customerEmail: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>>;
            serviceIds: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>;
            barberId: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>>;
            notes: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>>;
        }>;
        AppointmentCreateInput: import("@sinclair/typebox").TObject<{
            customerName: import("@sinclair/typebox").TString;
            customerPhone: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>>;
            customerEmail: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>>;
            serviceIds: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>;
            barberId: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>>;
            scheduledAt: import("@sinclair/typebox").TString;
            notes: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>>;
        }>;
        AppointmentCreatedResponse: import("@sinclair/typebox").TObject<{
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
        WalkInBookingDetailResponse: import("@sinclair/typebox").TObject<{
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
            createdById: import("@sinclair/typebox").TString;
            createdAt: import("@sinclair/typebox").TDate;
            updatedAt: import("@sinclair/typebox").TDate;
        }>;
    };
}
export {};
