import Elysia from 'elysia';
export declare const ERROR_CODES: {
    readonly NOT_FOUND: 404;
    readonly BAD_REQUEST: 400;
    readonly UNAUTHORIZED: 401;
    readonly FORBIDDEN: 403;
    readonly UNPROCESSABLE_ENTITY: 422;
    readonly CONFLICT: 409;
    readonly TOO_MANY_REQUESTS: 429;
    readonly INTERNAL_ERROR: 500;
};
export type ErrorCode = keyof typeof ERROR_CODES;
export declare class AppError extends Error {
    message: string;
    code: ErrorCode;
    status: number;
    constructor(message: string, code?: ErrorCode);
    toResponse(path?: string): Response;
}
export declare const CustomError: Elysia<"", {
    decorator: {};
    store: {};
    derive: {};
    resolve: {};
}, {
    typebox: {};
    error: {
        readonly AppError: AppError;
    };
}, {
    schema: {};
    standaloneSchema: {};
    macro: {};
    macroFn: {};
    parser: {};
    response: {};
}, {}, {
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
    response: {
        200: Response | {
            message: string;
            status: string | number;
            path: string;
            timeStamp: string;
        };
    };
}>;
