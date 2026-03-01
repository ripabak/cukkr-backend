// Service handles business logic, decoupled from Elysia controller
import { eq, ilike, sql } from "drizzle-orm";
import { nanoid } from "nanoid";

import { db } from "../../lib/database";
import { PaginatedResult, normalizePagination } from "../../core/pagination";
import { product, Product } from "./schema";
import { ProductModel } from "./model";
import { AppError, ERROR_CODES } from "../../core/error";

// Abstract class as it carries no instance state
export abstract class ProductService {

    static async getAll(
        query?: ProductModel.ProductQuery,
    ): Promise<PaginatedResult<Product>> {
        const pagination = normalizePagination(query);

        const where = query?.q
            ? ilike(product.name, `%${query.q}%`)
            : undefined;

        const [data, countResult] = await Promise.all([
            db
                .select()
                .from(product)
                .where(where)
                .limit(pagination.take)
                .offset(pagination.skip)
                .orderBy(product.createdAt),
            db
                .select({ count: sql<number>`count(*)::int` })
                .from(product)
                .where(where),
        ]);

        return { data, totalItems: countResult[0]?.count ?? 0, pagination };
    }

    static async getById(id: string): Promise<Product> {
        const [row] = await db
            .select()
            .from(product)
            .where(eq(product.id, id))
            .limit(1);

        if (!row) {
            throw new AppError("Product not found", ERROR_CODES.NOT_FOUND);
        }

        return row;
    }

    static async create(data: ProductModel.ProductInputCreate): Promise<Product> {
        const [row] = await db
            .insert(product)
            .values({
                id: nanoid(),
                name: data.name,
                description: data.description ?? null,
                price: String(data.price),
                stock: data.stock ?? 0,
            })
            .returning();

        return row!;
    }

    static async update(id: string, data: ProductModel.ProductInputUpdate): Promise<Product> {
        // Ensure product exists first
        await this.getById(id);

        const [row] = await db
            .update(product)
            .set({
                ...(data.name !== undefined && { name: data.name }),
                ...(data.description !== undefined && { description: data.description }),
                ...(data.price !== undefined && { price: String(data.price) }),
                ...(data.stock !== undefined && { stock: data.stock }),
            })
            .where(eq(product.id, id))
            .returning();

        return row!;
    }

    static async delete(id: string): Promise<Product> {
        // Ensure product exists first
        await this.getById(id);

        const [row] = await db
            .delete(product)
            .where(eq(product.id, id))
            .returning();

        return row!;
    }
}
