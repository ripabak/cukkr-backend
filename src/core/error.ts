import Elysia from "elysia";
import { formatErrorResponse } from "./format-response";

export const ERROR_CODES = {
    NOT_FOUND: 404,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    CONFLICT: 409,
    INTERNAL_ERROR: 500
} as const;

export class AppError extends Error {
    status = 418

    constructor(public message: string, public code: number = 418) {
        super(message)
        this.status = code;
    }

    toResponse(path: string = "/") {
        return Response.json(
            formatErrorResponse({ path, message: this.message, status: this.code }),
            { status: this.code }
        );
    }
}

export const CustomError = new Elysia()
    .error({ AppError })
    .onError(({ code, error, set, request }) => {
        if (error instanceof AppError) {
            const path = new URL(request.url).pathname;
            return error.toResponse(path);
        }
        set.status = 500;
        return formatErrorResponse({
            path: new URL(request.url).pathname,
            message: "Internal Server Error",
            status: 500,
        });
    })