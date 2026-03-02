import { Elysia, t } from "elysia";

import { ProductService } from "./service";
import { ProductModel } from "./model";
import { formatResponse, FormatResponseSchema } from "../../core/format-response";
import { buildPaginationMeta } from "../../core/pagination";
import { authMiddleware } from "../../middleware/auth-middleware";

export const productHandler = new Elysia({
    prefix: "/products",
    tags: ["Product"],
})
    // Auth middleware
    .use(authMiddleware)

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
            requireAdmin: true, // need admin role
            query: ProductModel.ProductQuery,
            response: FormatResponseSchema(t.Array(ProductModel.ProductWithUserResponse)),
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
            response: FormatResponseSchema(ProductModel.ProductWithUserResponse),
        },
    )

    // GET /products/my-products — list with pagination
    .get(
        "/my-products",
        async ({ query, path, user }) => {
            const { data, totalItems, pagination } = await ProductService.getAllMyProducts(query, user?.id);
            return formatResponse({
                path,
                data,
                meta: buildPaginationMeta(pagination, totalItems),
            });
        },
        {
            requireAuth: true, // need auth role
            query: ProductModel.ProductQuery,
            response: FormatResponseSchema(t.Array(ProductModel.ProductResponse)),
        },
    )

    // POST /products — create
    .post(
        "/",
        async ({ body, path, user }) => {
            const data = await ProductService.create(body, user?.id);
            return formatResponse({ path, data, status: 201, message: "Product created" });
        },
        {
            requireAuth: true, // need auth role
            body: ProductModel.ProductInputCreate,
            response: FormatResponseSchema(ProductModel.ProductResponse),
        },
    )

    // PATCH /products/:id — update
    .patch(
        "/:id",
        async ({ params: { id }, body, path, user }) => {
            const data = await ProductService.update(id, body, user?.id);
            return formatResponse({ path, data, message: "Product updated" });
        },
        {
            requireAuth: true, // need auth role
            params: t.Object({ id: t.String() }),
            body: ProductModel.ProductInputUpdate,
            response: FormatResponseSchema(ProductModel.ProductResponse),
        },
    )

    // DELETE /products/:id — delete
    .delete(
        "/:id",
        async ({ params: { id }, path, user }) => {
            const data = await ProductService.delete(id, user?.id);
            return formatResponse({ path, data, message: "Product deleted" });
        },
        {
            requireAuth: true, // need auth role
            params: t.Object({ id: t.String() }),
            response: FormatResponseSchema(ProductModel.ProductResponse),
        },
    );
