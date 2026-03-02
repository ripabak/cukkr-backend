import { describe, expect, it } from "bun:test";
import { treaty } from "@elysiajs/eden";
import { app } from "../../src/app";

// Wrap the app with Treaty client
const tClient = treaty(app);

describe("Auth Module Tests (via better-auth)", () => {
    let authCookie = "";

    describe("POST /auth/api/sign-in/email", () => {
        it("should reject invalid login credentials", async () => {
            const SignInResponse = await (tClient as any).auth.api["sign-in"].email.post({
                email: "test@example.com",
                password: "wrongpassword"
            });

            expect([401]).toContain(SignInResponse.status);
        });
    });

    describe("GET /auth/api/get-session", () => {
        it("should return null when no session exists", async () => {
            const GetSessionResponse = await (tClient as any).auth.api["get-session"].get();
            expect([200]).toContain(GetSessionResponse.status);
            expect(GetSessionResponse.data).toBeNull();
        });
    });

    describe("POST /auth/api/sign-in/email", () => {
        it("should sign up and sign in a user", async () => {
            const testEmail = `test_${Date.now()}@example.com`;
            const testPassword = "password123";
            const SignUpResponse = await (tClient as any).auth.api["sign-up"].email.post({
                email: testEmail,
                password: testPassword,
                name: "Test User"
            });
            expect([200]).toContain(SignUpResponse.status);
            expect(SignUpResponse.data).toHaveProperty("user");

            const SignInResponse = await (tClient as any).auth.api["sign-in"].email.post({
                email: testEmail,
                password: testPassword,
            });

            // Extract the session cookie from the response headers
            const cookieHeader = SignInResponse.response?.headers.get("set-cookie");
            if (cookieHeader) {
                authCookie = cookieHeader;
            }
            expect([200]).toContain(SignInResponse.status);
            expect(SignInResponse.data).toHaveProperty("user");

            // Get session with the auth cookie
            const GetSessionResponse = await (tClient as any).auth.api["get-session"].get(
                {
                    headers: {
                        cookie: authCookie,
                    },
                }
            );
            expect([200]).toContain(GetSessionResponse.status);
            expect(GetSessionResponse.data).toHaveProperty("user");
        });
    });
});
