import { Elysia } from 'elysia';
import { AppError } from './core/error';
export declare const app: Elysia<"", {
    decorator: import("logixlysia").EmptyElysiaSlot;
    store: {
        beforeTime?: bigint | undefined;
        logger: import("logixlysia").Logger;
        pino: import("logixlysia").Pino;
        cron: Record<"notification-cleanup", import("croner").Cron>;
    };
    derive: import("logixlysia").EmptyElysiaSlot;
    resolve: import("logixlysia").EmptyElysiaSlot;
}, {
    typebox: {};
    error: {};
} & {
    error: {};
    typebox: import("@sinclair/typebox").TModule<{}, {}>;
} & {
    typebox: {};
    error: {};
} & {
    typebox: {};
    error: {};
} & {
    typebox: {};
    error: {
        readonly AppError: AppError;
    };
} & {
    typebox: {};
    error: {};
} & {
    typebox: {};
    error: {};
}, {
    schema: {};
    standaloneSchema: {};
    macro: {};
    macroFn: {};
    parser: {};
    response: {};
} & {
    schema: {};
    macro: {};
    macroFn: {};
    parser: {};
} & {
    schema: {};
    standaloneSchema: {};
    macro: {};
    macroFn: {};
    parser: {};
    response: {};
} & {
    schema: {};
    standaloneSchema: {};
    macro: {};
    macroFn: {};
    parser: {};
    response: {};
} & {
    schema: {};
    standaloneSchema: {};
    macro: {};
    macroFn: {};
    parser: {};
    response: {};
} & {
    schema: {};
    standaloneSchema: {};
    macro: {};
    macroFn: {};
    parser: {};
    response: {};
}, {
    "health-check": {
        get: {
            body: unknown;
            params: {};
            query: unknown;
            headers: unknown;
            response: {
                200: {
                    status: string;
                    message: string;
                    checks: {
                        DATABASE: boolean;
                        SMTP: boolean;
                        STORAGE: boolean;
                    };
                };
            };
        };
    };
} & {
    get: {
        body: unknown;
        params: {};
        query: unknown;
        headers: unknown;
        response: {};
    };
} & {
    api: {
        "product-examples": {};
    } & {
        "product-examples": {
            get: {
                body: {};
                params: {};
                query: {
                    limit?: number | undefined;
                    page?: number | undefined;
                    q?: string | undefined;
                };
                headers: {};
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
                            user: {
                                id: string;
                                name: string;
                                email: string;
                                image: string | null;
                            };
                            id: string;
                            name: string;
                            createdAt: Date;
                            updatedAt: Date;
                            description: string | null;
                            price: string;
                            stock: number;
                        }[];
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
    } & {
        "product-examples": {
            ":id": {
                get: {
                    body: {};
                    params: {
                        id: string;
                    };
                    query: {};
                    headers: {};
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
                                user: {
                                    id: string;
                                    name: string;
                                    email: string;
                                    image: string | null;
                                };
                                id: string;
                                name: string;
                                createdAt: Date;
                                updatedAt: Date;
                                description: string | null;
                                price: string;
                                stock: number;
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
    } & {
        "product-examples": {
            "my-products": {
                get: {
                    body: {};
                    params: {};
                    query: {
                        limit?: number | undefined;
                        page?: number | undefined;
                        q?: string | undefined;
                    };
                    headers: {};
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
                                createdAt: Date;
                                updatedAt: Date;
                                description: string | null;
                                price: string;
                                stock: number;
                            }[];
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
    } & {
        "product-examples": {
            post: {
                body: {
                    description?: string | null | undefined;
                    stock?: number | undefined;
                    name: string;
                    price: number;
                };
                params: {};
                query: {};
                headers: {};
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
                            createdAt: Date;
                            updatedAt: Date;
                            description: string | null;
                            price: string;
                            stock: number;
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
    } & {
        "product-examples": {
            ":id": {
                patch: {
                    body: {
                        name?: string | undefined;
                        description?: string | null | undefined;
                        price?: number | undefined;
                        stock?: number | undefined;
                    };
                    params: {
                        id: string;
                    };
                    query: {};
                    headers: {};
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
                                createdAt: Date;
                                updatedAt: Date;
                                description: string | null;
                                price: string;
                                stock: number;
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
    } & {
        "product-examples": {
            ":id": {
                delete: {
                    body: {};
                    params: {
                        id: string;
                    };
                    query: {};
                    headers: {};
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
                                createdAt: Date;
                                updatedAt: Date;
                                description: string | null;
                                price: string;
                                stock: number;
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
    api: {
        auth: {};
    };
} & {
    api: {
        barbershop: {};
    } & {
        barbershop: {
            get: {
                body: {};
                params: {};
                query: {};
                headers: {};
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
                            onboardingCompleted: boolean;
                            timezone: string;
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
    } & {
        barbershop: {
            settings: {
                patch: {
                    body: {
                        name?: string | undefined;
                        slug?: string | undefined;
                        description?: string | null | undefined;
                        address?: string | null | undefined;
                        onboardingCompleted?: boolean | undefined;
                    };
                    params: {};
                    query: {};
                    headers: {};
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
                                onboardingCompleted: boolean;
                                timezone: string;
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
    } & {
        barbershop: {
            ":orgId": {
                leave: {
                    delete: {
                        body: {};
                        params: {
                            orgId: string;
                        };
                        query: {};
                        headers: {};
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
                                    message: string;
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
        barbershop: {
            timezone: {
                patch: {
                    body: {
                        timezone: string;
                    };
                    params: {};
                    query: {};
                    headers: {};
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
                                timezone: string;
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
    } & {
        barbershop: {
            logo: {
                post: {
                    body: {
                        file: File;
                    };
                    params: {};
                    query: {};
                    headers: {};
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
                                logoUrl: string;
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
    } & {
        barbershop: {
            "slug-check": {};
        };
    } & {
        barbershop: {
            "slug-check": {
                get: {
                    body: {};
                    params: {};
                    query: {
                        slug: string;
                    };
                    headers: {};
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
                                available: boolean;
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
    api: {
        barbers: {};
    } & {
        barbers: {
            get: {
                body: {};
                params: {};
                query: {
                    search?: string | undefined;
                    status?: "pending" | "active" | undefined;
                };
                headers: {};
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
                            expiresAt?: Date | null | undefined;
                            expired?: boolean | undefined;
                            id: string;
                            name: string;
                            email: string;
                            createdAt: Date;
                            userId: string | null;
                            role: string;
                            status: "pending" | "active";
                            avatarUrl: string | null;
                        }[];
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
} & {
    api: {
        services: {};
    } & {
        services: {
            post: {
                body: {
                    description?: string | null | undefined;
                    discount?: number | undefined;
                    isActive?: boolean | undefined;
                    duration: number;
                    name: string;
                    price: number;
                };
                params: {};
                query: {};
                headers: {};
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
                            duration: number;
                            id: string;
                            name: string;
                            createdAt: Date;
                            updatedAt: Date;
                            organizationId: string;
                            description: string | null;
                            price: number;
                            discount: number;
                            imageUrl: string | null;
                            isActive: boolean;
                            isDefault: boolean;
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
    } & {
        services: {
            get: {
                body: {};
                params: {};
                query: {
                    sort?: "name_asc" | "name_desc" | "price_asc" | "price_desc" | "recent" | undefined;
                    search?: string | undefined;
                    activeOnly?: boolean | undefined;
                };
                headers: {};
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
                            duration: number;
                            id: string;
                            name: string;
                            createdAt: Date;
                            updatedAt: Date;
                            organizationId: string;
                            description: string | null;
                            price: number;
                            discount: number;
                            imageUrl: string | null;
                            isActive: boolean;
                            isDefault: boolean;
                        }[];
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
    } & {
        services: {
            ":id": {
                get: {
                    body: {};
                    params: {
                        id: string;
                    };
                    query: {};
                    headers: {};
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
                                duration: number;
                                id: string;
                                name: string;
                                createdAt: Date;
                                updatedAt: Date;
                                organizationId: string;
                                description: string | null;
                                price: number;
                                discount: number;
                                imageUrl: string | null;
                                isActive: boolean;
                                isDefault: boolean;
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
    } & {
        services: {
            ":id": {
                patch: {
                    body: {
                        duration?: number | undefined;
                        name?: string | undefined;
                        description?: string | null | undefined;
                        price?: number | undefined;
                        discount?: number | undefined;
                        isDefault?: boolean | undefined;
                    };
                    params: {
                        id: string;
                    };
                    query: {};
                    headers: {};
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
                                duration: number;
                                id: string;
                                name: string;
                                createdAt: Date;
                                updatedAt: Date;
                                organizationId: string;
                                description: string | null;
                                price: number;
                                discount: number;
                                imageUrl: string | null;
                                isActive: boolean;
                                isDefault: boolean;
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
    } & {
        services: {
            ":id": {
                delete: {
                    body: {};
                    params: {
                        id: string;
                    };
                    query: {};
                    headers: {};
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
                                duration: number;
                                id: string;
                                name: string;
                                createdAt: Date;
                                updatedAt: Date;
                                organizationId: string;
                                description: string | null;
                                price: number;
                                discount: number;
                                imageUrl: string | null;
                                isActive: boolean;
                                isDefault: boolean;
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
    } & {
        services: {
            ":id": {
                "toggle-active": {
                    patch: {
                        body: {};
                        params: {
                            id: string;
                        };
                        query: {};
                        headers: {};
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
                                    duration: number;
                                    id: string;
                                    name: string;
                                    createdAt: Date;
                                    updatedAt: Date;
                                    organizationId: string;
                                    description: string | null;
                                    price: number;
                                    discount: number;
                                    imageUrl: string | null;
                                    isActive: boolean;
                                    isDefault: boolean;
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
        services: {
            ":id": {
                image: {
                    post: {
                        body: {
                            file: File;
                        };
                        params: {
                            id: string;
                        };
                        query: {};
                        headers: {};
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
                                    imageUrl: string;
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
        services: {
            ":id": {
                "set-default": {
                    patch: {
                        body: {};
                        params: {
                            id: string;
                        };
                        query: {};
                        headers: {};
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
                                    duration: number;
                                    id: string;
                                    name: string;
                                    createdAt: Date;
                                    updatedAt: Date;
                                    organizationId: string;
                                    description: string | null;
                                    price: number;
                                    discount: number;
                                    imageUrl: string | null;
                                    isActive: boolean;
                                    isDefault: boolean;
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
    api: {
        bookings: {};
    } & {
        bookings: {
            post: {
                body: {
                    notes?: string | null | undefined;
                    barberId?: string | null | undefined;
                    scheduledAt?: string | null | undefined;
                    customerEmail?: string | null | undefined;
                    type: "walk_in";
                    customerName: string;
                    serviceIds: string[];
                } | {
                    notes?: string | null | undefined;
                    barberId?: string | null | undefined;
                    customerEmail?: string | null | undefined;
                    type: "appointment";
                    scheduledAt: string;
                    customerName: string;
                    serviceIds: string[];
                };
                params: {};
                query: {};
                headers: {};
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
                            status: "pending" | "requested" | "waiting" | "in_progress" | "completed" | "cancelled";
                            customer: {
                                id: string;
                                name: string;
                                email: string | null;
                                phone: string | null;
                                createdAt: Date;
                                updatedAt: Date;
                                isVerified: boolean;
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
    } & {
        bookings: {
            summary: {
                get: {
                    body: {};
                    params: {};
                    query: {
                        dateFrom?: string | undefined;
                        dateTo?: string | undefined;
                    };
                    headers: {};
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
                                appointment: number;
                                waiting: number;
                                dateFrom: string;
                                dateTo: string;
                                total: number;
                                walkIn: number;
                                inProgress: number;
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
    } & {
        bookings: {
            requests: {
                get: {
                    body: {};
                    params: {};
                    query: {
                        barberId?: string | undefined;
                        dateFrom?: string | undefined;
                        dateTo?: string | undefined;
                    };
                    headers: {};
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
                                status: "pending" | "requested" | "waiting" | "in_progress" | "completed" | "cancelled";
                                referenceNumber: string;
                                scheduledAt: Date | null;
                                source: "customer" | "staff";
                                barber: {
                                    name: string;
                                    email: string;
                                    userId: string;
                                    role: string;
                                    memberId: string;
                                } | null;
                                customerName: string;
                                serviceNames: string[];
                                totalDuration: number;
                            }[];
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
    } & {
        bookings: {
            get: {
                body: {};
                params: {};
                query: {
                    sort?: "oldest_first" | "recently_added" | undefined;
                    status?: "pending" | "all" | "requested" | "waiting" | "in_progress" | "completed" | "cancelled" | undefined;
                    barberId?: string | undefined;
                    date: string;
                };
                headers: {};
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
                            status: "pending" | "requested" | "waiting" | "in_progress" | "completed" | "cancelled";
                            referenceNumber: string;
                            scheduledAt: Date | null;
                            source: "customer" | "staff";
                            barber: {
                                name: string;
                                email: string;
                                userId: string;
                                role: string;
                                memberId: string;
                            } | null;
                            customerName: string;
                            serviceNames: string[];
                            totalDuration: number;
                        }[];
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
    } & {
        bookings: {
            events: {
                get: {
                    body: {};
                    params: {};
                    query: {};
                    headers: {};
                    response: {
                        200: AsyncGenerator<{
                            readonly data: string;
                        }, void, unknown>;
                    };
                };
            };
        };
    } & {
        bookings: {
            "in-progress": {
                get: {
                    body: {};
                    params: {};
                    query: {};
                    headers: {};
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
                                status: "pending" | "requested" | "waiting" | "in_progress" | "completed" | "cancelled";
                                customer: {
                                    id: string;
                                    name: string;
                                    email: string | null;
                                    phone: string | null;
                                    createdAt: Date;
                                    updatedAt: Date;
                                    isVerified: boolean;
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
                            } | null;
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
    } & {
        bookings: {
            ":id": {
                get: {
                    body: {};
                    params: {
                        id: string;
                    };
                    query: {};
                    headers: {};
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
                                status: "pending" | "requested" | "waiting" | "in_progress" | "completed" | "cancelled";
                                customer: {
                                    id: string;
                                    name: string;
                                    email: string | null;
                                    phone: string | null;
                                    createdAt: Date;
                                    updatedAt: Date;
                                    isVerified: boolean;
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
    } & {
        bookings: {
            ":id": {
                status: {
                    patch: {
                        body: {
                            cancelReason?: string | null | undefined;
                            status: "pending" | "requested" | "waiting" | "in_progress" | "completed" | "cancelled";
                        };
                        params: {
                            id: string;
                        };
                        query: {};
                        headers: {};
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
                                    status: "pending" | "requested" | "waiting" | "in_progress" | "completed" | "cancelled";
                                    customer: {
                                        id: string;
                                        name: string;
                                        email: string | null;
                                        phone: string | null;
                                        createdAt: Date;
                                        updatedAt: Date;
                                        isVerified: boolean;
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
    } & {
        bookings: {
            ":id": {
                accept: {
                    post: {
                        body: {};
                        params: {
                            id: string;
                        };
                        query: {};
                        headers: {};
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
                                    status: "pending" | "requested" | "waiting" | "in_progress" | "completed" | "cancelled";
                                    customer: {
                                        id: string;
                                        name: string;
                                        email: string | null;
                                        phone: string | null;
                                        createdAt: Date;
                                        updatedAt: Date;
                                        isVerified: boolean;
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
    } & {
        bookings: {
            ":id": {
                decline: {
                    post: {
                        body: {
                            reason?: string | undefined;
                        };
                        params: {
                            id: string;
                        };
                        query: {};
                        headers: {};
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
                                    status: "pending" | "requested" | "waiting" | "in_progress" | "completed" | "cancelled";
                                    customer: {
                                        id: string;
                                        name: string;
                                        email: string | null;
                                        phone: string | null;
                                        createdAt: Date;
                                        updatedAt: Date;
                                        isVerified: boolean;
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
    } & {
        bookings: {
            ":id": {
                reassign: {
                    patch: {
                        body: {
                            handledByMemberId: string;
                        };
                        params: {
                            id: string;
                        };
                        query: {};
                        headers: {};
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
                                    status: "pending" | "requested" | "waiting" | "in_progress" | "completed" | "cancelled";
                                    customer: {
                                        id: string;
                                        name: string;
                                        email: string | null;
                                        phone: string | null;
                                        createdAt: Date;
                                        updatedAt: Date;
                                        isVerified: boolean;
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
    api: {
        customers: {};
    } & {
        customers: {
            get: {
                body: {};
                params: {};
                query: {
                    sort?: "name_asc" | "recent" | "bookings_desc" | "spend_desc" | undefined;
                    search?: string | undefined;
                    limit?: number | undefined;
                    page?: number | undefined;
                };
                headers: {};
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
                            email: string | null;
                            phone: string | null;
                            isVerified: boolean;
                            totalBookings: number;
                            totalSpend: number;
                            lastVisitAt: Date | null;
                        }[];
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
    } & {
        customers: {
            ":id": {
                get: {
                    body: {};
                    params: {
                        id: string;
                    };
                    query: {};
                    headers: {};
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
                                email: string | null;
                                phone: string | null;
                                createdAt: Date;
                                isVerified: boolean;
                                notes: string | null;
                                totalBookings: number;
                                totalSpend: number;
                                lastVisitAt: Date | null;
                                appointmentCount: number;
                                walkInCount: number;
                                completedCount: number;
                                cancelledCount: number;
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
    } & {
        customers: {
            ":id": {
                bookings: {
                    get: {
                        body: {};
                        params: {
                            id: string;
                        };
                        query: {
                            type?: "all" | "walk_in" | "appointment" | undefined;
                            limit?: number | undefined;
                            page?: number | undefined;
                        };
                        headers: {};
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
                                    type: string;
                                    id: string;
                                    createdAt: Date;
                                    status: string;
                                    referenceNumber: string;
                                    services: {
                                        name: string;
                                        price: number;
                                    }[];
                                    totalAmount: number;
                                }[];
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
        customers: {
            ":id": {
                notes: {
                    patch: {
                        body: {
                            notes: string;
                        };
                        params: {
                            id: string;
                        };
                        query: {};
                        headers: {};
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
                                    email: string | null;
                                    phone: string | null;
                                    createdAt: Date;
                                    isVerified: boolean;
                                    notes: string | null;
                                    totalBookings: number;
                                    totalSpend: number;
                                    lastVisitAt: Date | null;
                                    appointmentCount: number;
                                    walkInCount: number;
                                    completedCount: number;
                                    cancelledCount: number;
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
    api: {
        "open-hours": {};
    } & {
        "open-hours": {
            get: {
                body: {};
                params: {};
                query: {};
                headers: {};
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
                            dayOfWeek: number;
                            isOpen: boolean;
                            openTime: string | null;
                            closeTime: string | null;
                        }[];
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
    } & {
        "open-hours": {
            put: {
                body: {
                    days: {
                        dayOfWeek: number;
                        isOpen: boolean;
                        openTime: string | null;
                        closeTime: string | null;
                    }[];
                };
                params: {};
                query: {};
                headers: {};
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
                            dayOfWeek: number;
                            isOpen: boolean;
                            openTime: string | null;
                            closeTime: string | null;
                        }[];
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
} & {
    api: {
        me: {};
    } & {
        me: {
            get: {
                body: {};
                params: {};
                query: {};
                headers: {};
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
                            email: string;
                            emailVerified: boolean;
                            bio: string | null;
                            createdAt: Date;
                            updatedAt: Date;
                            role: string | null;
                            avatarUrl: string | null;
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
    } & {
        me: {
            patch: {
                body: {
                    name?: string | undefined;
                    bio?: string | null | undefined;
                };
                params: {};
                query: {};
                headers: {};
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
                            email: string;
                            emailVerified: boolean;
                            bio: string | null;
                            createdAt: Date;
                            updatedAt: Date;
                            role: string | null;
                            avatarUrl: string | null;
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
    } & {
        me: {
            avatar: {
                post: {
                    body: {
                        file: File;
                    };
                    params: {};
                    query: {};
                    headers: {};
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
                                avatarUrl: string;
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
    api: {
        pin: {};
    } & {
        pin: {
            generate: {
                post: {
                    body: {};
                    params: {};
                    query: {};
                    headers: {};
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
                                pin: string;
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
    } & {
        pin: {
            current: {
                get: {
                    body: {};
                    params: {};
                    query: {};
                    headers: {};
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
                                pin: string | null;
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
    api: {
        analytics: {};
    } & {
        analytics: {
            get: {
                body: {};
                params: {};
                query: {
                    range: "month" | "24h" | "week" | "6m" | "1y";
                };
                headers: {};
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
                            range: "month" | "24h" | "week" | "6m" | "1y";
                            stats: {
                                totalBookings: {
                                    current: number;
                                    previous: number;
                                    change: number | null;
                                    direction: "up" | "down" | "neutral";
                                };
                                totalCustomers: {
                                    current: number;
                                    previous: number;
                                    change: number | null;
                                    direction: "up" | "down" | "neutral";
                                };
                                totalSales: {
                                    current: number;
                                    previous: number;
                                    change: number | null;
                                    direction: "up" | "down" | "neutral";
                                };
                                appointments: {
                                    current: number;
                                    previous: number;
                                    change: number | null;
                                    direction: "up" | "down" | "neutral";
                                };
                                walkIns: {
                                    current: number;
                                    previous: number;
                                    change: number | null;
                                    direction: "up" | "down" | "neutral";
                                };
                            };
                            chart: {
                                customers: {
                                    value: number;
                                    label: string;
                                }[];
                                revenue: {
                                    value: number;
                                    label: string;
                                }[];
                            };
                            highlights: {
                                topBarber: {
                                    id: string;
                                    name: string;
                                    imageUrl: string | null;
                                    count: number;
                                    revenue: number;
                                } | null;
                                topService: {
                                    id: string;
                                    name: string;
                                    imageUrl: string | null;
                                    count: number;
                                    revenue: number;
                                } | null;
                            };
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
    } & {
        analytics: {
            revenue: {
                get: {
                    body: {};
                    params: {};
                    query: {
                        range: "month" | "24h" | "week" | "6m" | "1y";
                    };
                    headers: {};
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
                                range: "month" | "24h" | "week" | "6m" | "1y";
                                stats: {
                                    totalBookings: {
                                        current: number;
                                        previous: number;
                                        change: number | null;
                                        direction: "up" | "down" | "neutral";
                                    };
                                    avgRevenuePerBooking: {
                                        current: number;
                                        previous: number;
                                        change: number | null;
                                        direction: "up" | "down" | "neutral";
                                    };
                                    avgTime: {
                                        current: number;
                                        previous: number;
                                        change: number | null;
                                        direction: "up" | "down" | "neutral";
                                    };
                                };
                                chart: {
                                    value: number;
                                    label: string;
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
    } & {
        analytics: {
            revenue: {
                bookings: {
                    get: {
                        body: {};
                        params: {};
                        query: {
                            type?: "all" | "walk_in" | "appointment" | undefined;
                            limit?: number | undefined;
                            page?: number | undefined;
                            range: "month" | "24h" | "week" | "6m" | "1y";
                        };
                        headers: {};
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
                                    customerId: string;
                                    completedAt: string;
                                    bookingId: string;
                                    services: string[];
                                    customerName: string;
                                    revenue: number;
                                }[];
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
        analytics: {
            customers: {
                get: {
                    body: {};
                    params: {};
                    query: {
                        range: "month" | "24h" | "week" | "6m" | "1y";
                    };
                    headers: {};
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
                                range: "month" | "24h" | "week" | "6m" | "1y";
                                stats: {
                                    totalCustomers: {
                                        current: number;
                                        previous: number;
                                        change: number | null;
                                        direction: "up" | "down" | "neutral";
                                    };
                                    totalWalkIn: {
                                        current: number;
                                        previous: number;
                                        change: number | null;
                                        direction: "up" | "down" | "neutral";
                                    };
                                    totalAppointment: {
                                        current: number;
                                        previous: number;
                                        change: number | null;
                                        direction: "up" | "down" | "neutral";
                                    };
                                    totalNew: {
                                        current: number;
                                        previous: number;
                                        change: number | null;
                                        direction: "up" | "down" | "neutral";
                                    };
                                    totalReturn: {
                                        current: number;
                                        previous: number;
                                        change: number | null;
                                        direction: "up" | "down" | "neutral";
                                    };
                                };
                                chart: {
                                    value: number;
                                    label: string;
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
    } & {
        analytics: {
            customers: {
                list: {
                    get: {
                        body: {};
                        params: {};
                        query: {
                            status?: "return" | "all" | "new" | undefined;
                            limit?: number | undefined;
                            page?: number | undefined;
                            range: "month" | "24h" | "week" | "6m" | "1y";
                        };
                        headers: {};
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
                                    status: "return" | "new";
                                    customerId: string;
                                    customerName: string;
                                    totalVisits: number;
                                    lastVisitDate: string | null;
                                    totalRevenue: number;
                                }[];
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
        analytics: {
            barbers: {
                get: {
                    body: {};
                    params: {};
                    query: {
                        range: "month" | "24h" | "week" | "6m" | "1y";
                    };
                    headers: {};
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
                                chart: {
                                    value: number;
                                    barberId: string;
                                    barberName: string;
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
    } & {
        analytics: {
            barbers: {
                list: {
                    get: {
                        body: {};
                        params: {};
                        query: {
                            range: "month" | "24h" | "week" | "6m" | "1y";
                        };
                        headers: {};
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
                                    name: string;
                                    imageUrl: string | null;
                                    barberId: string;
                                    totalCustomers: number;
                                    totalRevenue: number;
                                }[];
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
        analytics: {
            services: {
                get: {
                    body: {};
                    params: {};
                    query: {
                        range: "month" | "24h" | "week" | "6m" | "1y";
                    };
                    headers: {};
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
                                range: "month" | "24h" | "week" | "6m" | "1y";
                                stats: {
                                    totalBookings: {
                                        current: number;
                                        previous: number;
                                        change: number | null;
                                        direction: "up" | "down" | "neutral";
                                    };
                                    totalRevenue: {
                                        current: number;
                                        previous: number;
                                        change: number | null;
                                        direction: "up" | "down" | "neutral";
                                    };
                                };
                                chart: {
                                    value: number;
                                    label: string;
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
    } & {
        analytics: {
            services: {
                list: {
                    get: {
                        body: {};
                        params: {};
                        query: {
                            limit?: number | undefined;
                            page?: number | undefined;
                            range: "month" | "24h" | "week" | "6m" | "1y";
                        };
                        headers: {};
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
                                    serviceId: string;
                                    serviceName: string;
                                    totalBookings: number;
                                    revenue: number;
                                    percentage: number;
                                }[];
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
    api: {
        notifications: {};
    } & {
        notifications: {
            get: {
                body: {};
                params: {};
                query: {
                    page?: number | undefined;
                    pageSize?: number | undefined;
                    unreadOnly?: boolean | undefined;
                };
                headers: {};
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
                            type: "barbershop_invitation" | "appointment_requested" | "walk_in_arrival";
                            id: string;
                            createdAt: Date;
                            updatedAt: Date;
                            organizationId: string;
                            title: string;
                            body: string;
                            referenceId: string | null;
                            referenceType: "invitation" | "booking" | null;
                            actionedAs: "accepted" | "declined" | null;
                            isRead: boolean;
                            actionType: "accept_decline_appointment" | "accept_decline_invite" | null;
                        }[];
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
    } & {
        notifications: {
            "unread-count": {
                get: {
                    body: {};
                    params: {};
                    query: {};
                    headers: {};
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
                                count: number;
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
    } & {
        notifications: {
            "read-all": {
                patch: {
                    body: {};
                    params: {};
                    query: {};
                    headers: {};
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
                                updatedCount: number;
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
    } & {
        notifications: {
            ":id": {
                read: {
                    patch: {
                        body: {};
                        params: {
                            id: string;
                        };
                        query: {};
                        headers: {};
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
                                    updatedAt: Date;
                                    isRead: boolean;
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
        notifications: {
            "register-token": {
                post: {
                    body: {
                        token: string;
                    };
                    params: {};
                    query: {};
                    headers: {};
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
                                tokenRegistered: true;
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
    } & {
        notifications: {
            ":id": {
                actions: {
                    accept: {
                        post: {
                            body: {};
                            params: {
                                id: string;
                            };
                            query: {};
                            headers: {};
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
                                        referenceId: string;
                                        referenceType: "invitation" | "booking";
                                        notificationId: string;
                                        action: "accepted" | "declined";
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
        notifications: {
            ":id": {
                actions: {
                    decline: {
                        post: {
                            body: {
                                reason?: string | undefined;
                            };
                            params: {
                                id: string;
                            };
                            query: {};
                            headers: {};
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
                                        referenceId: string;
                                        referenceType: "invitation" | "booking";
                                        notificationId: string;
                                        action: "accepted" | "declined";
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
        notifications: {
            "vapid-public-key": {
                get: {
                    body: {};
                    params: {};
                    query: {};
                    headers: {};
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
                                publicKey: string;
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
    } & {
        notifications: {
            "web-push": {
                subscribe: {
                    post: {
                        body: {
                            endpoint: string;
                            p256dh: string;
                            auth: string;
                        };
                        params: {};
                        query: {};
                        headers: {};
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
                                    subscribed: true;
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
        notifications: {
            "web-push": {
                unsubscribe: {
                    delete: {
                        body: {
                            endpoint: string;
                        };
                        params: {};
                        query: {};
                        headers: {};
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
                                    unsubscribed: true;
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
    api: {
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
    };
} & {
    api: {
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
                                        status: "pending" | "requested" | "waiting" | "in_progress" | "completed" | "cancelled";
                                        customer: {
                                            id: string;
                                            name: string;
                                            email: string | null;
                                            phone: string | null;
                                            createdAt: Date;
                                            updatedAt: Date;
                                            isVerified: boolean;
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
    };
} & {
    [x: string]: {
        get: {
            body: unknown;
            params: {};
            query: unknown;
            headers: unknown;
            response: {
                200: Bun.BunFile;
            };
        };
    };
}, {
    derive: {};
    resolve: {};
    schema: {};
    standaloneSchema: {};
    response: {};
} & {
    derive: {};
    resolve: {};
    schema: {};
} & {
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
} & {
    derive: {};
    resolve: {};
    schema: {};
    standaloneSchema: {};
    response: {};
} & {
    derive: {};
    resolve: {};
    schema: {};
} & {
    derive: {};
    resolve: {};
    schema: {};
    standaloneSchema: {};
    response: {};
} & {
    derive: {};
    resolve: {};
    schema: {};
    standaloneSchema: {};
    response: {};
} & {
    derive: {};
    resolve: {};
    schema: {};
    standaloneSchema: {};
    response: {};
} & {
    derive: {};
    resolve: {};
    schema: {};
    standaloneSchema: {};
    response: {};
}>;
export type App = typeof app;
