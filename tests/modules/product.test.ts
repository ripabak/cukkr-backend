import { describe, expect, it } from "bun:test";
import { treaty } from "@elysiajs/eden";
import { app } from "../../src/app";

// Wrap the app with Treaty client
const tClient = treaty(app);

// Helper function to create an authenticated user and return the cookie
async function getAuthCookie() {
    const testEmail = `test_product_${Date.now()}_${Math.random().toString(36).substring(7)}@example.com`;
    const res = await (tClient as any).auth.api["sign-up"].email.post({
        email: testEmail,
        password: "password123",
        name: "Test User"
    });
    return res.response?.headers.get("set-cookie") || "";
}

// Helper function to create an authenticated admin and return the cookie
async function getAdminAuthCookie() {
    const testEmail = `test_admin_${Date.now()}_${Math.random().toString(36).substring(7)}@example.com`;
    const res = await (tClient as any).auth.api["sign-up"].email.post({
        email: testEmail,
        password: "adminpassword123",
        name: "Admin User",
        role: "admin"
    });
    return res.response?.headers.get("set-cookie") || "";
}

describe("Product Module Tests", () => {
    describe("GET /products", () => {
        it("should return 401 Unauthorized for unauthenticated requests", async () => {
            const { status } = await tClient.api.products.get();
            expect(status).toBe(401);
        });

        it("should return 403 Forbidden for a regular user", async () => {
            const authCookie = await getAuthCookie();
            const { status } = await tClient.api.products.get({
                fetch: {
                    headers: { cookie: authCookie }
                }
            });
            expect(status).toBe(403);
        });

        it("should return a list of products successfully for an admin", async () => {
            const adminCookie = await getAdminAuthCookie();
            const { status, error } = await tClient.api.products.get({
                fetch: {
                    headers: { cookie: adminCookie }
                }
            });
            expect(status).toBe(200);
            expect(error).toBeNull();
        });
    });

    describe("POST /products", () => {
        it("should return 401 Unauthorized for unauthenticated requests", async () => {
            const { status } = await tClient.api.products.post({
                name: "Test Name",
                price: 100,
                description: "Test Description"
            });
            expect(status).toBe(401);
        });

        it("should create a new product when authenticated", async () => {
            const authCookie = await getAuthCookie();
            const { status, data, error } = await tClient.api.products.post({
                name: "New Product",
                price: 1500,
                description: "This is a new product test"
            }, {
                fetch: {
                    headers: { cookie: authCookie }
                }
            });

            expect(status).toBe(200); // HTTP Status is 200
            expect(data?.status).toBe(201); // Logical formatResponse status is 201
            expect(error).toBeNull();
            expect(data?.data).toHaveProperty("id");
            expect(data?.data.name).toBe("New Product");
        });
    });

    describe("GET /products/:id", () => {
        it("should return the newly created product", async () => {
            const authCookie = await getAuthCookie();

            // 1. SETUP: Create a product first
            const createRes = await tClient.api.products.post({
                name: "Test Get ID",
                price: 1500,
                description: "Test standalone isolation"
            }, {
                fetch: { headers: { cookie: authCookie } }
            });
            const standaloneTestId = createRes.data?.data.id;
            expect(standaloneTestId).toBeDefined();

            // 2. ACTION: Get the product
            const { status, data } = await tClient.api.products({ id: standaloneTestId! }).get();
            expect(status).toBe(200);
            expect(data?.data.id).toBe(standaloneTestId);
        });
    });

    describe("DELETE /products/:id", () => {
        it("should delete the product when authenticated", async () => {
            const authCookie = await getAuthCookie();

            // 1. SETUP: Create a product
            const createRes = await tClient.api.products.post({
                name: "Test Delete ID",
                price: 1500,
                description: "Test delete isolation"
            }, {
                fetch: { headers: { cookie: authCookie } }
            });
            const standaloneTestId = createRes.data?.data.id;
            expect(standaloneTestId).toBeDefined();

            // 2. ACTION: Delete the product
            const { status, error } = await tClient.api.products({ id: standaloneTestId! }).delete(undefined, {
                fetch: { headers: { cookie: authCookie } }
            });

            expect(status).toBe(200);
            expect(error).toBeNull();
        });

        it("should return 404 when getting the deleted product", async () => {
            const authCookie = await getAuthCookie();

            // 1. SETUP: Create a product
            const createRes = await tClient.api.products.post({
                name: "Test Get Deleted",
                price: 1500,
                description: "Test 404 isolation"
            }, {
                fetch: { headers: { cookie: authCookie } }
            });
            const standaloneTestId = createRes.data?.data.id;
            expect(standaloneTestId).toBeDefined();

            // 2. SETUP: Delete the product
            await tClient.api.products({ id: standaloneTestId! }).delete(undefined, {
                fetch: { headers: { cookie: authCookie } }
            });

            // 3. ACTION: Get the deleted product
            const { status } = await tClient.api.products({ id: standaloneTestId! }).get();
            expect(status).toBe(404);
        });
    });
});
