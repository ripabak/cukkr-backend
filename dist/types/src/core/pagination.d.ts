import { Static } from 'elysia';
export interface PaginatedResult<T> {
    data: T[];
    totalItems: number;
    pagination: {
        page: number;
        limit: number;
        skip: number;
        take: number;
    };
}
export declare function normalizePagination(query?: {
    page?: number;
    limit?: number;
}): {
    page: number;
    limit: number;
    skip: number;
    take: number;
};
export declare const PaginationMetaSchema: import("@sinclair/typebox").TObject<{
    page: import("@sinclair/typebox").TNumber;
    limit: import("@sinclair/typebox").TNumber;
    totalItems: import("@sinclair/typebox").TNumber;
    totalPages: import("@sinclair/typebox").TNumber;
    hasNext: import("@sinclair/typebox").TBoolean;
    hasPrev: import("@sinclair/typebox").TBoolean;
}>;
export type PaginationMeta = Static<typeof PaginationMetaSchema>;
export declare const PaginationQuerySchema: import("@sinclair/typebox").TObject<{
    page: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
    limit: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
}>;
export type PaginationQuery = Static<typeof PaginationQuerySchema>;
export declare function buildPaginationMeta(pagination: {
    page: number;
    limit: number;
}, totalItems: number): PaginationMeta;
