import { Elysia } from 'elysia';
export declare const publicBookingHandler: Elysia<"/public/booking", {
    decorator: {};
    store: {};
    derive: {};
    resolve: {};
}, {
    typebox: {};
    error: {};
}, {
    schema: {};
    standaloneSchema: {};
    macro: {};
    macroFn: {};
    parser: {};
    response: {};
}, {
    public: {
        booking: {
            ":slug": {
                "form-data": {
                    get: {
                        body: unknown;
                        params: {
                            slug: string;
                        };
                        query: unknown;
                        headers: unknown;
                        response: {
                            200: {
                                meta?: {
                                    limit: number;
                                    page: number;
                                    totalItems: number;
                                    totalPages: number;
                                    hasNext: boolean;
                                    hasPrev: boolean;
                                } | undefined;
                                message: string;
                                data: {
                                    services: {
                                        duration: number;
                                        id: string;
                                        name: string;
                                        description: string | null;
                                        price: number;
                                        discount: number;
                                        imageUrl: string | null;
                                        isDefault: boolean;
                                    }[];
                                    barbers: {
                                        id: string;
                                        name: string;
                                        avatarUrl: string | null;
                                    }[];
                                };
                                status: string | number;
                                path: string;
                                timeStamp: string;
                            };
                            422: {
                                type: "validation";
                                on: string;
                                summary?: string;
                                message?: string;
                                found?: unknown;
                                property?: string;
                                expected?: string;
                            };
                        };
                    };
                };
            };
        };
    };
} & {
    public: {
        booking: {
            ":slug": {
                pin: {
                    validate: {
                        post: {
                            body: {
                                pin: string;
                            };
                            params: {
                                slug: string;
                            };
                            query: unknown;
                            headers: unknown;
                            response: {
                                200: {
                                    meta?: {
                                        limit: number;
                                        page: number;
                                        totalItems: number;
                                        totalPages: number;
                                        hasNext: boolean;
                                        hasPrev: boolean;
                                    } | undefined;
                                    message: string;
                                    data: {
                                        validationToken: string;
                                    };
                                    status: string | number;
                                    path: string;
                                    timeStamp: string;
                                };
                                422: {
                                    type: "validation";
                                    on: string;
                                    summary?: string;
                                    message?: string;
                                    found?: unknown;
                                    property?: string;
                                    expected?: string;
                                };
                            };
                        };
                    };
                };
            };
        };
    };
} & {
    public: {
        booking: {
            ":slug": {
                "walk-in": {
                    post: {
                        body: {
                            notes?: string | null | undefined;
                            barberId?: string | null | undefined;
                            customerEmail?: string | null | undefined;
                            lang?: string | undefined;
                            customerName: string;
                            serviceIds: string[];
                            validationToken: string;
                        };
                        params: {
                            slug: string;
                        };
                        query: unknown;
                        headers: unknown;
                        response: {
                            200: {
                                meta?: {
                                    limit: number;
                                    page: number;
                                    totalItems: number;
                                    totalPages: number;
                                    hasNext: boolean;
                                    hasPrev: boolean;
                                } | undefined;
                                message: string;
                                data: {
                                    type: "walk_in" | "appointment";
                                    id: string;
                                    createdAt: Date;
                                    updatedAt: Date;
                                    organizationId: string;
                                    status: "requested" | "waiting" | "in_progress" | "completed" | "cancelled";
                                    customer: {
                                        id: string;
                                        name: string;
                                        email: string | null;
                                        emailVerified: boolean;
                                        phone: string | null;
                                        language: string | null;
                                        createdAt: Date;
                                        updatedAt: Date;
                                        phoneVerified: boolean;
                                        emailVerifiedAt: Date | null;
                                        phoneVerifiedAt: Date | null;
                                        notes: string | null;
                                    };
                                    notes: string | null;
                                    referenceNumber: string;
                                    scheduledAt: Date | null;
                                    startedAt: Date | null;
                                    completedAt: Date | null;
                                    cancelledAt: Date | null;
                                    source: "customer" | "staff";
                                    createdById: string;
                                    handledByBarber: {
                                        name: string;
                                        email: string;
                                        userId: string;
                                        role: string;
                                        memberId: string;
                                    } | null;
                                    services: {
                                        duration: number;
                                        id: string;
                                        price: number;
                                        discount: number;
                                        serviceId: string | null;
                                        serviceName: string;
                                        originalPrice: number;
                                    }[];
                                    totalDuration: number;
                                    requestedBarber: {
                                        name: string;
                                        email: string;
                                        userId: string;
                                        role: string;
                                        memberId: string;
                                    } | null;
                                    createdByName: string | null;
                                };
                                status: string | number;
                                path: string;
                                timeStamp: string;
                            };
                            422: {
                                type: "validation";
                                on: string;
                                summary?: string;
                                message?: string;
                                found?: unknown;
                                property?: string;
                                expected?: string;
                            };
                        };
                    };
                };
            };
        };
    };
} & {
    public: {
        booking: {
            ":slug": {
                appointment: {
                    post: {
                        body: {
                            notes?: string | null | undefined;
                            barberId?: string | null | undefined;
                            lang?: string | undefined;
                            scheduledAt: string;
                            customerName: string;
                            customerEmail: string;
                            serviceIds: string[];
                        };
                        params: {
                            slug: string;
                        };
                        query: unknown;
                        headers: unknown;
                        response: {
                            200: {
                                meta?: {
                                    limit: number;
                                    page: number;
                                    totalItems: number;
                                    totalPages: number;
                                    hasNext: boolean;
                                    hasPrev: boolean;
                                } | undefined;
                                message: string;
                                data: {
                                    type: "appointment";
                                    id: string;
                                    status: "requested";
                                    referenceNumber: string;
                                    scheduledAt: Date;
                                    customerName: string;
                                    serviceNames: string[];
                                    requestedBarber: {
                                        name: string;
                                        memberId: string;
                                    } | null;
                                };
                                status: string | number;
                                path: string;
                                timeStamp: string;
                            };
                            422: {
                                type: "validation";
                                on: string;
                                summary?: string;
                                message?: string;
                                found?: unknown;
                                property?: string;
                                expected?: string;
                            };
                        };
                    };
                };
            };
        };
    };
} & {
    public: {
        booking: {
            ":slug": {
                appointment: {
                    verify: {
                        get: {
                            body: unknown;
                            params: {
                                slug: string;
                            };
                            query: {
                                token: string;
                            };
                            headers: unknown;
                            response: {
                                200: {
                                    meta?: {
                                        limit: number;
                                        page: number;
                                        totalItems: number;
                                        totalPages: number;
                                        hasNext: boolean;
                                        hasPrev: boolean;
                                    } | undefined;
                                    message: string;
                                    data: {
                                        status: "verified" | "already_verified" | "invalid";
                                        bookingId: string | null;
                                        verified: boolean;
                                    };
                                    status: string | number;
                                    path: string;
                                    timeStamp: string;
                                };
                                422: {
                                    type: "validation";
                                    on: string;
                                    summary?: string;
                                    message?: string;
                                    found?: unknown;
                                    property?: string;
                                    expected?: string;
                                };
                            };
                        };
                    };
                };
            };
        };
    };
} & {
    public: {
        booking: {
            ":slug": {
                identity: {
                    check: {
                        get: {
                            body: unknown;
                            params: {
                                slug: string;
                            };
                            query: {
                                token: string;
                            };
                            headers: unknown;
                            response: {
                                200: {
                                    meta?: {
                                        limit: number;
                                        page: number;
                                        totalItems: number;
                                        totalPages: number;
                                        hasNext: boolean;
                                        hasPrev: boolean;
                                    } | undefined;
                                    message: string;
                                    data: {
                                        customerName: string | null;
                                        valid: boolean;
                                    };
                                    status: string | number;
                                    path: string;
                                    timeStamp: string;
                                };
                                422: {
                                    type: "validation";
                                    on: string;
                                    summary?: string;
                                    message?: string;
                                    found?: unknown;
                                    property?: string;
                                    expected?: string;
                                };
                            };
                        };
                    };
                };
            };
        };
    };
} & {
    public: {
        booking: {
            ":slug": {
                identity: {
                    verify: {
                        get: {
                            body: unknown;
                            params: {
                                slug: string;
                            };
                            query: {
                                token: string;
                            };
                            headers: unknown;
                            response: {
                                200: {
                                    meta?: {
                                        limit: number;
                                        page: number;
                                        totalItems: number;
                                        totalPages: number;
                                        hasNext: boolean;
                                        hasPrev: boolean;
                                    } | undefined;
                                    message: string;
                                    data: {
                                        status: "verified" | "already_verified" | "invalid";
                                        bookingId: string | null;
                                        verified: boolean;
                                    };
                                    status: string | number;
                                    path: string;
                                    timeStamp: string;
                                };
                                422: {
                                    type: "validation";
                                    on: string;
                                    summary?: string;
                                    message?: string;
                                    found?: unknown;
                                    property?: string;
                                    expected?: string;
                                };
                            };
                        };
                    };
                };
            };
        };
    };
}, {
    derive: {};
    resolve: {};
    schema: {};
    standaloneSchema: {};
    response: {};
}, {
    derive: {};
    resolve: {};
    schema: {};
    standaloneSchema: {};
    response: {};
}>;
