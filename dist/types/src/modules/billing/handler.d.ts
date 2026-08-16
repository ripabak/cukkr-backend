import { Elysia } from 'elysia';
export declare const billingHandler: Elysia<"/billing", {
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
    billing: {
        plans: {
            get: {
                body: unknown;
                params: {};
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
                            price: number;
                            currency: string;
                            interval: string;
                            features: string[];
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
