# Repository Guidelines

## Tech Stack Overview

This is a modern, type-safe backend built with cutting-edge technologies. Understanding these core technologies is essential for development:

### Core Technologies

| Technology | Purpose | Key Information |
|---|---|---|
| **Bun** | Runtime & Package Manager | Faster alternative to Node.js. Use `bun run` for all commands. |
| **Elysia** | Web Framework | Type-safe routing framework. Define routes in `handler.ts` using Elysia groups. See [Elysia Docs](https://elysiajs.com) |
| **TypeScript** | Language | Strict mode enforced. No `any` types—use proper types. |
| **Drizzle ORM** | Database ORM | Type-safe database queries. Define schemas in `schema.ts`, migrations auto-generated. Use `drizzle-kit` for migrations (never `push/up/drop`). See [Drizzle Docs](https://orm.drizzle.team/) |
| **PostgreSQL** | Database | Primary data store. Connection via `DATABASE_URL` in `.env`. See `src/lib/database.ts` for client setup. |
| **Better Auth** | Authentication & Multi-Tenancy | Handles user auth, sessions, and organizations. Built-in multi-tenant support via Organizations plugin. See `src/lib/auth.ts`. |
| **Eden Treaty** | Type-Safe API Client | End-to-end typed HTTP client for testing and internal calls. Used in all test files. |

### Essential Tools

| Tool | Purpose | Command |
|---|---|---|
| **ESLint + Prettier** | Code Quality & Formatting | `bun run lint:fix` & `bun run format` before commits |
| **Husky + Lint-Staged** | Git Hooks | Auto-runs linting on commit. Never bypass with `--no-verify`. |
| **Bun Test Runner** | Testing | `bun test --env-file=.env` to run all tests. Uses `bun:test` (built-in). |
| **Docker** | Containerization | `Dockerfile` included for production deployments. |

### Quick Reference Links

- **Elysia Route Patterns:** See `src/modules/product-example/handler.ts`
- **Database Schemas:** See `src/modules/*/schema.ts` and `drizzle/schemas.ts`
- **Authentication Setup:** See `src/lib/auth.ts` and `tests/modules/auth.test.ts`
- **Environment Variables:** See `src/lib/env.ts` (access all config here, never use `process.env` directly)

---

## Project Structure & Module Organization

```
src/
├── app.ts            # App entry point; registers plugins, middleware, and modules
├── main.ts           # Server start
├── core/             # Framework-agnostic foundations (errors, response formats, interfaces)
├── lib/              # Wrappers for external services (database, auth, env)
├── middleware/       # Elysia middleware plugins
├── modules/          # Feature modules grouped by domain (e.g., product-example, auth)
│   └── product-example/
│       ├── handler.ts   # Route definitions (Elysia group)
│       ├── model.ts     # DTOs / request-response types
│       ├── schema.ts    # Drizzle table schema
│       └── service.ts   # Business logic
└── utils/            # General-purpose helpers

drizzle/              
├── schemas.ts        # Central re-export of all module schemas
├── meta/             # Auto-generated Drizzle metadata
└── *.sql             # Auto-generated migration files

tests/
├── health-check.test.ts
└── modules/          # Integration tests per module
```

- Use `src/modules/product-example/` as the canonical example for any new module.
- Register new module schemas in `drizzle/schemas.ts`.

---

## Build, Test & Development Commands

| Command | Description |
|---|---|
| `bun run dev` | Start the development server with hot reload |
| `bun run build` | Type-check and compile a production binary to `.output/server` |
| `bun run start` | Run the compiled production binary |
| `bun run lint:fix` | Fix lint errors via ESLint |
| `bun run format` | Format all source files via Prettier |
| `bun test --env-file=.env` | Run all tests |
| `bun test --env-file=.env <pattern>` | Run tests matching a name or path pattern (e.g., `bun test auth`) |
| `bunx drizzle-kit generate --name <name>` | Generate a migration from schema changes |
| `bunx drizzle-kit check` | Validate pending migrations |
| `bunx drizzle-kit migrate` | Apply pending migrations to the database |

> ⚠️ Never use `drizzle-kit push`, `drizzle-kit up`, or `drizzle-kit drop`.

---

## Coding Style & Naming Conventions

- **Language:** TypeScript (strict).
- **Indentation:** 4 spaces.
- **Linting & Formatting:** ESLint (flat config) and Prettier have been set up. Always pass linting checks before committing.
- **File & folder names:** `kebab-case` only (e.g., `product-handler.ts`, `my-module/`).
- **Error handling:** Always throw `AppError` from `src/core/error.ts` — never throw plain errors or `new Error(...)`.
- **DTOs:** Define all request/response shapes in the module's `model.ts`. Use the same DTO types consistently across `handler.ts` and `service.ts`.
- **No magic strings:** Use enums or constants for status codes and error types.
- **Don't use 'any' type:** Use proper types instead of 'any' as much as possible
- **Timestamps must use timezone:** Always define timestamp columns with `{ withTimezone: true }` — e.g., `timestamp('created_at', { withTimezone: true }).defaultNow()`. This prevents timezone-related bugs when storing and comparing dates.
- **Multi-Tenant Scoping:** If a resource belongs to an organization, ensure its table has an `organizationId` foreign key (referencing `organization.id`). Use the `requireOrganization: true` macro in the handler to enforce tenant isolation and access `activeOrganizationId`. Service methods must always filter and insert data using the `organizationId`. If needed adjust you can refer to "https://better-auth.com/docs/plugins/organization" for documentation.

- **Protected Handlers — Auth & Role Macros:** Three macros are available from `authMiddleware` (see `src/middleware/auth-middleware.ts`):

  | Macro | What it enforces | Context injected |
  |---|---|---|
  | `requireAuth: true` | Valid session (user logged in) | `user` |
  | `requireOrganization: true` | Active organization in session | `activeOrganizationId` |
  | `requireRoles: ['owner'&#124;'admin'&#124;'member']` | Auth + org + member role check | `user`, `activeOrganizationId` |

  Use `requireRoles` as a single drop-in replacement for `requireAuth + requireOrganization` when the endpoint also needs to restrict by role. The macro queries the `member` table and throws `FORBIDDEN` if the user's role is not in the provided list. **Do not** duplicate the role check inside the service method — the handler macro is the authoritative gate.

  ```typescript
  // ✅ Correct — role enforced at handler level
  .patch('/settings', async ({ body, path, activeOrganizationId }) => {
      const data = await BarbershopService.updateSettings(activeOrganizationId, body)
      return formatResponse({ path, data })
  }, {
      requireRoles: ['owner'],           // only owners may call this
      body: BarbershopModel.SettingsInput,
  })

  // ✅ Multi-role — owner or admin allowed
  { requireRoles: ['owner', 'admin'] }

  // ✅ Auth + org only, no role restriction
  { requireAuth: true, requireOrganization: true }
  ```

### Role Hierarchy & Permission Rules

| Role | Level | Typical Access |
|------|-------|---------------|
| `owner` | Full control | Create/delete barbershop, invite/remove barbers, manage services, open hours, analytics, all booking operations |
| `admin` | Management | All `owner` operations *except*: delete barbershop, upload logo/image, change timezone (owner-only endpoints). Can CRUD services, edit open hours, view analytics, accept/decline bookings |
| `member` | Staff (barber) | View-only for services & analytics. Can create bookings, update booking status (start/complete/cancel), view customer info, generate walk-in PIN, view open hours |

**Rule of thumb for choosing the macro:**

| Scenario | Macro |
|---|---|
| Any authenticated org member can do this | `requireAuth: true, requireOrganization: true` |
| Only management (owner/admin) can do this | `requireRoles: ['owner', 'admin']` |
| Only the barbershop creator can do this | `requireRoles: ['owner']` |

> **When adding a new endpoint, always ask:** *Should a barber be able to do this?*  
> If the answer is no, use `requireRoles: ['owner', 'admin']` instead of `requireAuth + requireOrganization`.

- **Always make tests for new features:** For every new feature or changes, create a new test or update existing test file in the `tests/modules/` directory.
- **Don't edit product example module:** The product-example module is a template and should not be edited. Use it as a reference to create new modules.
- **After changes, always run lint:fix and format:** Before committing, always run `bun run lint:fix` and `bun run format` to ensure your code is clean and consistent. If there are any lint errors, fix them.

---

## Testing Guidelines

Tests use Bun's built-in test runner (`bun:test`) with Eden Treaty for end-to-end typed HTTP calls.

### Setup Pattern

```typescript
import { describe, expect, it, beforeAll } from "bun:test";
import { treaty } from "@elysiajs/eden";
import { app } from "../../src/app";

const tClient = treaty(app);
```

### Testing Endpoints That Require Authentication

Better Auth routes are mounted via `.mount(auth.handler)` and are not statically reflected in the Eden type system. Cast `tClient` to `any` for auth-specific calls:

```typescript
describe("My Module Tests", () => {
    let authCookie = "";

    beforeAll(async () => {
        // 1. Sign up a temporary test user
        const res = await (tClient as any).auth.api["sign-up"].email.post({
            email: `test_${Date.now()}@example.com`,
            password: "password123",
            name: "Test User"
        });

        // 2. Capture the session cookie for subsequent authenticated requests
        const cookieHeader = res.response?.headers.get("set-cookie");
        if (cookieHeader) authCookie = cookieHeader;
    });

    it("should succeed with auth cookie", async () => {
        const { status } = await tClient.api.myResource.post(
            { field: "value" },
            { fetch: { headers: { cookie: authCookie } } }
        );
        expect(status).toBe(200);
    });

    	it("should return 401 without auth", async () => {
		const { status } = await tClient.api.myResource.post({ field: "value" });
		expect(status).toBe(401);
	});
});
```

> **Note on Multi-Tenant Tests:** For endpoints using `requireOrganization: true`, you must first create an organization and set it as active on the client/test side (e.g., via `tClient.auth.api.createOrganization`) to ensure the `activeOrganizationId` is present in the session context.

- See `tests/modules/product-example.test.ts` for a full example with create, read, and delete flows.
- See `tests/modules/auth.test.ts` for auth-specific test patterns.
- Test file names mirror module names: `tests/modules/<module-name>.test.ts`.

---

## Commit & Pull Request Guidelines

- **Prefix commit messages with:**
    - `Fix:` for bug fixes
    - `Feat:` for new features
    - `Docs:` for documentation changes
    - `Style:` for code style changes
    - `Refactor:` for code refactoring
    - `Test:` for test changes
    - `Chore:` for chore changes
- **Commit messages:** Use concise imperative sentences: `Add product delete endpoint`, `Fix auth cookie handling in tests`.
- **One concern per commit:** Avoid mixing unrelated refactors with feature changes.
- **PRs:** Include a short description of what changed and why. Reference related issues if applicable.
- **No dead code:** Remove `console.log` statements and commented-out code before committing.

---

## Security & Configuration

- All secrets live in `.env`. Use `src/lib/env.ts` to access them — never import `process.env` directly in modules.
- Do not commit `.env`. Use `.env.example` to document required variables.
- Cookies use `Secure`, `HttpOnly`, and `SameSite=None` by default (see `src/lib/auth.ts`).