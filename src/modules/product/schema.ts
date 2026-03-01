import { pgTable, text, numeric, integer, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const product = pgTable("product", {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    description: text("description"),
    price: numeric("price", { precision: 12, scale: 2 }).notNull(),
    stock: integer("stock").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
        .defaultNow()
        .$onUpdate(() => new Date())
        .notNull(),
});

export type Product = typeof product.$inferSelect;
export type ProductInsert = typeof product.$inferInsert;
