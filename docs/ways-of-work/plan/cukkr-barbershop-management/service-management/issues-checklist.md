# Issues Checklist: Service Management

**Feature:** Service Management  
**Parent Epic:** Cukkr — Barbershop Management & Booking System  
**Project Plan:** [project-plan.md](./project-plan.md)  
**Date:** April 26, 2026

---

## Pre-Creation Preparation

- [x] Feature artifacts complete: PRD (`prd.md`), implementation plan (`implementation-plan.md`), project plan (`project-plan.md`)
- [ ] Epic issue exists in GitHub
- [ ] Project board configured (columns, labels, milestones)
- [ ] Team capacity assessed for sprint planning

---

## Feature Level

- [x] **#62** `Feature: Service Management` — labels: `feature`, `priority-high`, `value-high`, `backend`; blocked by #28

---

## Technical Enabler Level

- [x] **#63** `Technical Enabler: services Table DB Schema & Migration` — labels: `enabler`, `priority-high`, `database`, `backend`; feature #62; 3 pts
- [x] **#64** `Technical Enabler: TypeBox DTOs & Model Definitions for Service Management` — labels: `enabler`, `priority-high`, `backend`; feature #62; 2 pts

---

## User Story Level

- [x] **#65** `User Story: Browse & Search Services (US-01–04)` — labels: `user-story`, `priority-high`, `backend`; feature #62; blocked by #63, #64; 3 pts
- [x] **#66** `User Story: Create a Service (US-05–07)` — labels: `user-story`, `priority-high`, `backend`; feature #62; blocked by #63, #64; 2 pts
- [x] **#67** `User Story: Edit & Toggle a Service (US-08–09)` — labels: `user-story`, `priority-high`, `backend`; feature #62; blocked by #63, #64, #66; 3 pts
- [x] **#68** `User Story: Delete a Service (US-10–12)` — labels: `user-story`, `priority-high`, `backend`; feature #62; blocked by #63, #64; 2 pts
- [x] **#69** `User Story: Default Service Management (US-13–15)` — labels: `user-story`, `priority-high`, `backend`; feature #62; blocked by #63, #64, #66; 3 pts
- [x] **#70** `User Story: Barber View Active Services (US-16)` — labels: `user-story`, `priority-medium`, `backend`; feature #62; blocked by #63, #64, #65; 1 pt

---

## Test Level

- [x] **#71** `Test: Service Management Integration Tests` — labels: `test`, `priority-high`, `backend`; feature #62; blocked by #72–#76; 5 pts

---

## Task Level

### Phase 1 — Schema & DTO Foundation

- [x] **#72** `Task: Create src/modules/service-management/schema.ts`
  - **Scope:** Drizzle table definition with all fields (id, organizationId, name, description, price, duration, discount, isActive, isDefault, createdAt, updatedAt) and four composite indexes. Export from `drizzle/schemas.ts`.
  - **Acceptance:** TypeScript compiles, indexes defined, FK to `organization.id` present.
  - **Priority:** high | **Blocked by:** — | **Related:** #63

- [x] **#73** `Task: Generate & apply migration (add-services-table)`
  - **Scope:** `bunx drizzle-kit generate --name add-services-table`, review SQL output, `bunx drizzle-kit check`, `bunx drizzle-kit migrate`.
  - **Acceptance:** Migration applied, `services` table present in DB with correct columns and indexes.
  - **Priority:** high | **Blocked by:** #72 | **Related:** #63

- [x] **#74** `Task: Create src/modules/service-management/model.ts`
  - **Scope:** TypeBox schemas for `CreateServiceBody`, `UpdateServiceBody` (no `isDefault`), `ListServicesQuery` (search, sort enum, activeOnly), `ServiceIdParam`, `ServiceDto`.
  - **Acceptance:** Validates PRD constraints (name ≤ 100, description ≤ 500, price ≥ 0, duration ≥ 1, discount 0–100). `isDefault` absent from `UpdateServiceBody`. No `any` types.
  - **Priority:** high | **Blocked by:** — | **Related:** #64

### Phase 2 — Service-Layer Business Logic

- [x] **#75** `Task: Implement ServiceManagementService (list, get, create, update, delete, toggle-active, set-default)`
  - **Scope:**
    - `listServices(orgId, query)` — filtered by organizationId; supports search (ILIKE), sort, activeOnly
    - `getService(orgId, id)` — 404 if not found in org
    - `createService(orgId, body)` — defaults isActive=false, isDefault=false, discount=0
    - `updateService(orgId, id, body)` — partial update; rejects isDefault in body with AppError 400
    - `deleteService(orgId, id)` — rejects if isDefault=true with AppError 400
    - `toggleActive(orgId, id)` — flips isActive; if deactivating default, clears isDefault
    - `setDefault(orgId, id)` — rejects if inactive; clears existing default + sets new default in one transaction
  - **Acceptance:** All business rules from PRD enforced; every failure throws `AppError` (never plain `Error`); tenant scope always applied via `organizationId`.
  - **Priority:** high | **Blocked by:** #72, #74 | **Related:** #65, #66, #67, #68, #69, #70

### Phase 3 — HTTP Handler Integration

- [x] **#76** `Task: Create src/modules/service-management/handler.ts + register in app.ts`
  - **Scope:** Elysia route group under `/api/services` with `requireOrganization: true` on all routes:
    - `POST /api/services` → 201
    - `GET /api/services` → 200
    - `GET /api/services/:id` → 200
    - `PATCH /api/services/:id` → 200
    - `DELETE /api/services/:id` → 200
    - `PATCH /api/services/:id/toggle-active` → 200
    - `PATCH /api/services/:id/set-default` → 200
    Register handler in `src/app.ts` under the `/api` namespace.
  - **Acceptance:** All routes respond with correct HTTP status per PRD error table. TypeBox schemas bound to body, params, query. 401 for unauthenticated requests via macro.
  - **Priority:** high | **Blocked by:** #74, #75 | **Related:** #62

### Phase 4 — Integration Tests

- [x] **#77** `Task: Create tests/modules/service-management.test.ts (full suite)`
  - **Scope:** Full Eden Treaty test file covering every scenario in the test plan table (project-plan.md). Two separate organizations required for tenant isolation tests. Use `beforeAll` to sign up owner, create org, set active org.
  - **Test scenarios must include:**
    - [ ] 401 for unauthenticated POST, PATCH, DELETE
    - [ ] Create valid → 201, defaults verified
    - [ ] Create invalid (missing name, price < 0, duration < 1, discount > 100) → 422
    - [ ] List all services
    - [ ] List with activeOnly=true
    - [ ] List with search (case-insensitive)
    - [ ] List with all 5 sort options
    - [ ] Get service by id (200)
    - [ ] Get service with cross-org id (404)
    - [ ] Partial update (only supplied fields change, updatedAt refreshes)
    - [ ] Update with isDefault in body → 400
    - [ ] Toggle inactive → active
    - [ ] Toggle default active → inactive (isDefault cleared)
    - [ ] Set default (active target) → 200, previous default cleared
    - [ ] Set default (inactive target) → 400
    - [ ] Delete non-default service → 200
    - [ ] Delete default service → 400
    - [ ] Cross-org: cannot read, update, toggle, set-default, or delete another org's service IDs
  - **Acceptance:** `bun test tests/modules/service-management.test.ts` passes with 0 failures. No skipped tests.
  - **Priority:** high | **Blocked by:** #75, #76 | **Related:** #71

### Phase 5 — Validation & Cleanup

- [x] **#78** `Task: Run lint:fix + format — service management quality gate`
  - **Scope:** `bun run lint:fix` → 0 errors. `bun run format` → no unstaged changes. Remove any console.log or commented-out code. Confirm no `any` types.
  - **Acceptance:** Both commands exit 0; code committed clean.
  - **Priority:** high | **Blocked by:** #77

---

## API Surface Summary

| Method | Route | Auth | Status Codes |
|---|---|---|---|
| POST | /api/services | owner | 201, 401, 422 |
| GET | /api/services | owner/barber | 200, 401, 422 |
| GET | /api/services/:id | owner/barber | 200, 401, 404 |
| PATCH | /api/services/:id | owner | 200, 400, 401, 404, 422 |
| DELETE | /api/services/:id | owner | 200, 400, 401, 404 |
| PATCH | /api/services/:id/toggle-active | owner | 200, 401, 404 |
| PATCH | /api/services/:id/set-default | owner | 200, 400, 401, 404 |

---

## Business Rule Summary (for test authoring)

| Rule | Endpoint | Status | Message |
|---|---|---|---|
| `isDefault` blocked from generic update | PATCH /api/services/:id | 400 | `Default service must be updated via set-default endpoint` |
| Inactive service cannot be set as default | PATCH /api/services/:id/set-default | 400 | `Service must be active to be set as default` |
| Default service cannot be deleted | DELETE /api/services/:id | 400 | `Cannot delete the default service. Please set a new default first.` |
| Deactivating default auto-clears isDefault | PATCH /api/services/:id/toggle-active | 200 | `isDefault` set to false in response |
| set-default is atomic (single transaction) | PATCH /api/services/:id/set-default | 200 | Previous default cleared in same DB transaction |
| Cross-org resource access always 404 | All /:id routes | 404 | Service not found |

---

## Estimated Total Story Points

| Category | Issues | Points |
|---|---|---|
| Enablers | #63, #64 | 5 |
| User Stories | #65–#70 | 14 |
| Tests | #71 | 5 |
| Tasks | #72–#78 | 17 |
| **Total** | **17 issues** | **~26 pts** |

---

## Completion Checklist

- [ ] All 17 issues created in GitHub with correct labels and dependencies
- [ ] Feature #62 linked to parent epic
- [x] All implementation tasks completed
- [x] All story acceptance criteria met
- [x] Integration tests passing (0 failures)
- [x] Lint + format clean
- [ ] Migration applied to production
- [ ] Feature marked Done in project board
