import { Static, TSchema } from 'elysia';
export declare const FormatErrorResponseSchema: import("@sinclair/typebox").TObject<{
    path: import("@sinclair/typebox").TString;
    message: import("@sinclair/typebox").TString;
    status: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TNumber, import("@sinclair/typebox").TString]>;
    timeStamp: import("@sinclair/typebox").TString;
}>;
export type FormatErrorResponse = Static<typeof FormatErrorResponseSchema>;
export declare const formatErrorResponse: (args: {
    path: string;
    message: string;
    status: number;
}) => FormatErrorResponse;
import { PaginationMeta } from './pagination';
export declare const FormatResponseSchema: <SCHEMA extends TSchema>(responseSchema: SCHEMA) => import("@sinclair/typebox").TObject<{
    path: import("@sinclair/typebox").TString;
    message: import("@sinclair/typebox").TString;
    data: SCHEMA;
    meta: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TObject<{
        page: import("@sinclair/typebox").TNumber;
        limit: import("@sinclair/typebox").TNumber;
        totalItems: import("@sinclair/typebox").TNumber;
        totalPages: import("@sinclair/typebox").TNumber;
        hasNext: import("@sinclair/typebox").TBoolean;
        hasPrev: import("@sinclair/typebox").TBoolean;
    }>>;
    status: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TNumber, import("@sinclair/typebox").TString]>;
    timeStamp: import("@sinclair/typebox").TString;
}>;
export declare const formatResponse: <T>(args: {
    path: string;
    data: T;
    status?: number | string;
    message?: string;
    meta?: PaginationMeta;
}) => {
    path: string;
    message: string;
    data: T;
    meta: {
        limit: number;
        page: number;
        totalItems: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    } | undefined;
    status: string | number;
    timeStamp: string;
};
