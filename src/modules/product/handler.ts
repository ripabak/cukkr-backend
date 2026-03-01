import { Elysia, t } from "elysia";

import { ProductService } from "./service";
import { ProductModel } from "./model";
import { formatResponse, FormatResponseSchema } from "../../core/format-response";
import { buildPaginationMeta } from "../../core/pagination";

export const productHandler = new Elysia({
    prefix: "/products",
    tags: ["Product"],
})
    // GET /products — list with pagination
    .get(
        "/",
        async ({ query, path }) => {
            const { data, totalItems, pagination } = await ProductService.getAll(query);
            return formatResponse({
                path,
                data,
                meta: buildPaginationMeta(pagination, totalItems),
            });
        },
        {
            query: ProductModel.ProductQuery,
            response: FormatResponseSchema(t.Array(ProductModel.ProductResponse)),
        },
    )

    // GET /products/:id — single product
    .get(
        "/:id",
        async ({ params: { id }, path }) => {
            const data = await ProductService.getById(id);
            return formatResponse({ path, data });
        },
        {
            params: t.Object({ id: t.String() }),
            response: FormatResponseSchema(ProductModel.ProductResponse),
        },
    )

    // POST /products — create
    .post(
        "/",
        async ({ body, path }) => {
            const data = await ProductService.create(body);
            return formatResponse({ path, data, status: 201, message: "Product created" });
        },
        {
            body: ProductModel.ProductInputCreate,
            response: FormatResponseSchema(ProductModel.ProductResponse),
        },
    )

    // PATCH /products/:id — update
    .patch(
        "/:id",
        async ({ params: { id }, body, path }) => {
            const data = await ProductService.update(id, body);
            return formatResponse({ path, data, message: "Product updated" });
        },
        {
            params: t.Object({ id: t.String() }),
            body: ProductModel.ProductInputUpdate,
            response: FormatResponseSchema(ProductModel.ProductResponse),
        },
    )

    // DELETE /products/:id — delete
    .delete(
        "/:id",
        async ({ params: { id }, path }) => {
            const data = await ProductService.delete(id);
            return formatResponse({ path, data, message: "Product deleted" });
        },
        {
            params: t.Object({ id: t.String() }),
            response: FormatResponseSchema(ProductModel.ProductResponse),
        },
    );
