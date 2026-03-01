import { Static, t } from "elysia";

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

export function normalizePagination(query?: { page?: number; limit?: number }) {
    const page = Math.max(1, query?.page ?? 1);
    const limit = Math.min(100, Math.max(1, query?.limit ?? 10));
    return { page, limit, skip: (page - 1) * limit, take: limit };
}

export const PaginationMetaSchema = t.Object({
    page: t.Number(),
    limit: t.Number(),
    totalItems: t.Number(),
    totalPages: t.Number(),
    hasNext: t.Boolean(),
    hasPrev: t.Boolean(),
});

export type PaginationMeta = Static<typeof PaginationMetaSchema>;

export const PaginationQuerySchema = t.Object({
    page: t.Optional(t.Numeric()),
    limit: t.Optional(t.Numeric()),
});

export type PaginationQuery = Static<typeof PaginationQuerySchema>;

export function buildPaginationMeta(
    pagination: { page: number; limit: number },
    totalItems: number
): PaginationMeta {
    return {
        page: pagination.page,
        limit: pagination.limit,
        totalItems,
        totalPages: Math.ceil(totalItems / pagination.limit),
        hasNext: pagination.page * pagination.limit < totalItems,
        hasPrev: pagination.page > 1,
    };
}
