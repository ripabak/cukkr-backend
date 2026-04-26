# Elysia with Bun runtime

This is a modern backend starter template built with [ElysiaJS](https://elysiajs.com/), [Bun](https://bun.sh/), [Drizzle ORM](https://orm.drizzle.team/), PostgreSQL, and [Better Auth](https://better-auth.com/).

## AI Agent Skills

This project includes AI agent skills (`.agents/skills/`) to help with planning and documentation. Use them by mentioning the skill name in GitHub Copilot Chat:

| Skill | When to Use |
|---|---|
| `prd` | Translate a vague idea into a structured requirements document |
| `breakdown-epic-pm` | Create an Epic PRD for a large business capability |
| `breakdown-feature-prd` | Break an Epic into a detailed Feature PRD |
| `breakdown-feature-implementation` | Generate a technical implementation plan from a Feature PRD |
| `breakdown-plan` | Generate GitHub Issues and a project plan from all artifacts |
| `create-implement-github-issues` | Add generated Issues to Github and Implement it |

**Recommended flow:** `breakdown-epic-pm` → `breakdown-feature-prd` → `breakdown-feature-implementation` → `breakdown-plan`

Documents are saved to `docs/ways-of-work/plan/{epic-name}/`.

---

## Getting Started

To get started with this template, install the dependencies:

```bash
bun install
```

Make sure you have your PostgreSQL database running and update the `.env` file based on `.env.example`.

## Project Structure

This project enforces a strict, modular directory structure to cleanly separate concerns:

- `src/core/`: Contains core foundation components that are agnostic to business logic (e.g., custom errors, global middlewares, standard response formats).
- `src/lib/`: Custom wrappers and configurations for external libraries or third-party services (e.g., database connection, Redis, email provider, auth utilities).
- `src/modules/`: Contains the actual business logic grouped by features or domains (e.g., `auth`, `product-example`). Each module encapsulates its own routes (`handler.ts`), database schema (`schema.ts`), data transfer objects (`model.ts`), and business logic (`service.ts`).
- `src/utils/`: General-purpose helper functions and utilities used across the application.
- `drizzle/`: Contains the database migration files and the central schema definitions (`schemas.ts`).
- `tests/`: Contains automated tests for the project.

### Technical & Naming Conventions
- Always use the `AppError` class for error handling (`src/core/error.ts`).
- Explicit DTOs must be defined in the `model.ts` file. Make sure they are consistently used between handlers and services.
- File and folder names must logically use `kebab-case`.

### Multi-Tenancy (Better Auth Organizations)
This template is configured for multi-tenant (B2B) applications using Better Auth's Organization plugin.
- The database schema includes `organization`, `member`, and `invitation` tables.
- Route handlers can enforce organization context using the `requireOrganization: true` macro in `auth-middleware.ts`.
- When `requireOrganization: true` is set, the active organization ID is injected into the context as `activeOrganizationId`. Modules should use this ID to scope data queries and mutations.

## Development

Start the development server using the watch mode:
```bash
bun run dev
```

Build the project to check for any errors before deployment:
```bash
bun run build
```

Run the production server:
```bash
bun run start
```

Format the code and fix lint errors:
```bash
bun run format
bun run lint:fix
```

> **Note:** This project uses [Husky](https://typicode.github.io/husky/) and [lint-staged](https://github.com/lint-staged/lint-staged). Every time you run `git commit`, it will automatically format and lint the files you have staged. If there are any ESLint errors that cannot be fixed automatically, the commit will be aborted.

### Endpoints
- **API Base:** `http://localhost:3000/`
- **OpenAPI / Swagger UI:** `http://localhost:3000/openapi`
- **Health Check:** `http://localhost:3000/health-check` to check connections (e.g. database, smtp)

## Database Migrations (Drizzle ORM)

If you make any changes in a module's `schema.ts`, you need to generate migrations and apply them.
**Note:** Ensure the module's schema is also exported within `drizzle/schemas.ts`.

1. **Generate migrations:**
```bash
bunx drizzle-kit generate --name "<migration-name>"
```

2. **Check database schema:**
```bash
bunx drizzle-kit check
```

3. **Apply migrations:**
```bash
bunx drizzle-kit migrate
```

> **Warning:** Never reset or drop the database directly in a production environment. Avoid using commands like `drizzle-kit up`, `drizzle-kit push`, or `drizzle-kit drop`.

## Docker

This project can be run using Docker. Here's how to build and run it:

1. **Build Docker Image:**
```bash
docker build -t elysia-app .
```

2. **Run Docker Container:**
```bash
# Replace the database URL with your own
docker run -p 3000:3000 --env-file .env elysia-app
```

## Testing

This project uses the built-in `bun test` runner for testing. Tests are located in the `tests/` directory.

To run tests:
```bash
bun test
```

Example integration test for the health check endpoint (`tests/health-check.test.ts`):
```typescript
import { describe, expect, it } from "bun:test";
import { app } from "../src/app";

describe("Health Check", () => {
    it("should return ok status", async () => {
        const response = await app.handle(new Request("http://localhost/health-check"));
        const data = await response.json();
        
        expect(response.status).toBe(200);
        expect(data.status).toBe("ok");
        expect(data.message).toBe("Elysia Backend is running");
        expect(data.checks).toHaveProperty("DATABASE");
    });
});
```