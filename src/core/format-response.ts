import { Static, TSchema, t } from "elysia";

export const FormatErrorResponseSchema = t.Object({
    path: t.String(),
    message: t.String(),
    status: t.Union([t.Number(), t.String()]),
    timeStamp: t.String(),
});

export type FormatErrorResponse = Static<typeof FormatErrorResponseSchema>;

export const formatErrorResponse = (args: {
    path: string;
    message: string;
    status: number;
}): FormatErrorResponse => ({
    path: args.path,
    message: args.message,
    status: args.status,
    timeStamp: new Date().toISOString(),
});

import { PaginationMetaSchema, PaginationMeta } from "./pagination";

export const FormatResponseSchema = <SCHEMA extends TSchema>(
    responseSchema: SCHEMA
) =>
    t.Object({
        path: t.String(),
        message: t.String(),
        data: responseSchema,
        meta: t.Optional(PaginationMetaSchema),
        status: t.Union([t.Number(), t.String()]),
        timeStamp: t.String(),
    });

export const formatResponse = <T>(args: {
    path: string;
    data: T;
    status?: number | string;
    message?: string;
    meta?: PaginationMeta;
}) => {
    return {
        path: args.path,
        message: args.message ?? "Success",
        data: args.data,
        meta: args.meta,
        status: args.status ?? 200,
        timeStamp: new Date().toISOString(),
    };
};