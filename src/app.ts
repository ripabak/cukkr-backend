import { Elysia } from "elysia";
import { auth } from "./lib/auth";
import { openapi } from "@elysiajs/openapi";
import { OpenAPI } from "./lib/auth";
import { env } from "./lib/env";
import cors from '@elysiajs/cors'
import { healthCheck } from "./utils/health-check";
import { AppError, CustomError } from "./core/error";
import { productHandler } from "./modules/product/handler";


export const app = new Elysia()
  .use(
    cors({
      origin: env.CORS_ORIGIN,
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true,
    })
  )
  .use(openapi({
    documentation: {
      components: await OpenAPI.components,
      paths: await OpenAPI.getPaths()
    }
  }))
  // Gzip compression
  .mapResponse(({ responseValue, set }) => {
    const isJson = typeof responseValue === 'object'

    const text = isJson
      ? JSON.stringify(responseValue)
      : (responseValue?.toString() ?? '')

    set.headers['Content-Encoding'] = 'gzip'

    return new Response(Bun.gzipSync(Buffer.from(text)), {
      headers: {
        'Content-Type': `${isJson ? 'application/json' : 'text/plain'
          }; charset=utf-8`
      }
    })
  })
  // Error handler
  .use(CustomError)

  // Response middleware
  // .use(ResponseMiddleware)

  .mount(auth.handler)

  // Health Check
  .get("/health-check", () => healthCheck())
  .get("/", () => {
    throw new AppError("Not Found", "NOT_FOUND")
  })

  // Modules
  .group("/api", (app) => app
    .use(productHandler)
  )

export type App = typeof app