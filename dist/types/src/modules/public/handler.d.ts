import { Elysia } from 'elysia';
export declare const publicHandler: Elysia<"/public", {
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
        barbershop: {
            ":slug": {
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
                                id: string;
                                name: string;
                                slug: string;
                                description: string | null;
                                address: string | null;
                                logoUrl: string | null;
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
} & {
    public: {
        barbershop: {
            ":slug": {
                availability: {
                    get: {
                        body: unknown;
                        params: {
                            slug: string;
                        };
                        query: {
                            date: string;
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
                                    date: string;
                                    isOpen: boolean;
                                    openTime: string | null;
                                    closeTime: string | null;
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
        barbershop: {
            ":slug": {
                appointment: {
                    post: {
                        body: {
                            notes?: string | null | undefined;
                            barberId?: string | null | undefined;
                            customerPhone?: string | null | undefined;
                            customerEmail?: string | null | undefined;
                            scheduledAt: string;
                            customerName: string;
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
