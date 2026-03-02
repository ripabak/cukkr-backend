import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { emailOTP, openAPI } from "better-auth/plugins";
import { db } from "./database";
import * as schema from "../../drizzle/schemas"
import { env } from "./env";
import { sendOtpEmail } from "./mail";

export const auth = betterAuth({
    basePath: "/api",
    database: drizzleAdapter(db, {
        provider: "pg",
        schema: {
            ...schema
        }
    }),
    emailAndPassword: {
        enabled: true,
    },
    plugins: [
        openAPI(),
        emailOTP({
            async sendVerificationOTP({ email, otp, type }) {
                await sendOtpEmail({ to: email, otp, purpose: type });
            },
        })

    ],
    trustedOrigins: env.CORS_ORIGIN,

    rateLimit: {
        enabled: false
    },

    advanced: {
        useSecureCookies: true,
        defaultCookieAttributes: {
            httpOnly: true,
            secure: true,
            sameSite: "none",
        },
    },

    user: {
        additionalFields: {
            role: {
                type: "string",
                default: "user",
            }
        }
    }

    //...
});


let _schema: ReturnType<typeof auth.api.generateOpenAPISchema>
const getSchema = async () => (_schema ??= auth.api.generateOpenAPISchema())

export const OpenAPI = {
    getPaths: (prefix = '/auth/api') =>
        getSchema().then(({ paths }) => {
            const reference: typeof paths = Object.create(null)

            for (const path of Object.keys(paths)) {
                const key = prefix + path
                reference[key] = paths[path]

                for (const method of Object.keys(paths[path])) {
                    const operation = (reference[key] as any)[method]

                    operation.tags = ['Better Auth']
                }
            }

            return reference
        }) as Promise<any>,
    components: getSchema().then(({ components }) => components) as Promise<any>
} as const