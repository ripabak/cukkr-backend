import { Elysia } from "elysia";
import { auth } from "../lib/auth";
import { AppError } from "../core/error";

export const authMiddleware = new Elysia()
    // Derive: Extract session dari setiap request
    .derive(async ({ request: { headers } }) => {
        const session = await auth.api.getSession({
            headers
        })

        return {
            user: session?.user,
            session: session?.session,
        }
    })
    .macro({
        // 1️⃣ AUTH (session only ONCE)
        requireAuth: {
            async resolve({ user }) {
                if (!user) throw new AppError('Unauthorized', "UNAUTHORIZED")

                return {
                    user: user
                }
            }
        },
        // 2️⃣ ADMIN (check role)
        requireAdmin: {
            async resolve({ user }) {
                if (!user) throw new AppError('Unauthorized', "UNAUTHORIZED")

                // Assuming the user object from better-auth retains the 'role' field we added to the schema.
                // We cast to 'any' to avoid TS errors if better-auth types aren't fully synced yet.
                if (user.role !== "admin") {
                    throw new AppError('Forbidden: Admin access required', "FORBIDDEN")
                }

                return {
                    user: user
                }
            }
        }
    })

    .as("scoped")