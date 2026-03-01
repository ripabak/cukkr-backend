// Model defines the data structure and validation for request and response
import { t } from "elysia";

export namespace ProductModel {

    export const ProductInputCreate = t.Object({
        name: t.String({ minLength: 1 }),
        description: t.Optional(t.Nullable(t.String())),
        price: t.Number({ minimum: 0 }),
        stock: t.Optional(t.Number({ minimum: 0 })),
    });
    export type ProductInputCreate = typeof ProductInputCreate.static;

    export const ProductInputUpdate = t.Object({
        name: t.Optional(t.String({ minLength: 1 })),
        description: t.Optional(t.Nullable(t.String())),
        price: t.Optional(t.Number({ minimum: 0 })),
        stock: t.Optional(t.Number({ minimum: 0 })),
    });
    export type ProductInputUpdate = typeof ProductInputUpdate.static;

    export const ProductResponse = t.Object({
        id: t.String(),
        name: t.String(),
        description: t.Nullable(t.String()),
        price: t.String(),   // numeric comes back as string from pg-driver
        stock: t.Number(),
        createdAt: t.Date(),
        updatedAt: t.Date(),
    });
    export type ProductResponse = typeof ProductResponse.static;

    export const ProductQuery = t.Object({
        q: t.Optional(t.String()),
        page: t.Optional(t.Numeric()),
        limit: t.Optional(t.Numeric()),
    });
    export type ProductQuery = typeof ProductQuery.static;
}
