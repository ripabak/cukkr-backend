# Issues Checklist: Barbershop Settings

**Version:** 1.0
**Date:** April 26, 2026
**Status:** Draft
**Project Plan:** [Barbershop Settings Project Plan](./project-plan.md)
**Implementation Plan:** [Barbershop Settings Implementation Plan](./implementation-plan.md)

---

## Pre-Creation Preparation

- [ ] Feature PRD complete: [`docs/ways-of-work/plan/cukkr-barbershop-management/barbershop-settings/prd.md`](./prd.md)
- [ ] Implementation plan complete: [`docs/ways-of-work/plan/cukkr-barbershop-management/barbershop-settings/implementation-plan.md`](./implementation-plan.md)
- [ ] Project plan complete: [`docs/ways-of-work/plan/cukkr-barbershop-management/barbershop-settings/project-plan.md`](./project-plan.md)
- [ ] Parent epic issue exists in GitHub with labels `epic`, `priority-high`, `value-high`
- [ ] GitHub project board configured with columns: Backlog → Sprint Ready → In Progress → In Review → Testing → Done
- [ ] Custom fields set up: Priority, Value, Component, Estimate, Epic

---

## Epic Level

- [ ] **Epic issue created**: "Cukkr — Barbershop Management & Booking System"
  - Labels: `epic`, `priority-high`, `value-high`
  - Acceptance criteria listed (onboarding, settings, barber workflow, customer booking)
  - Estimate: XL
  - Added to project board in **Backlog**

---

## Feature Level

- [ ] **Feature issue created**: "Barbershop Settings"
  - Links to parent epic issue
  - Lists all 3 stories and 2 enablers with `#TBD` placeholders to be updated post-creation
  - Dependencies documented: blocked by Auth/Onboarding feature; blocks public booking landing page
  - Labels: `feature`, `priority-high`, `value-high`, `backend`
  - Estimate: M (15 story points)
  - Added to project board in **Backlog**

---

## Enabler Level Issues

### Enabler 1: barbershop_settings DB Schema & Migration

- [ ] **Issue created**: "Technical Enabler: barbershop_settings DB Schema & Migration"
  - Labels: `enabler`, `priority-critical`, `value-high`, `backend`, `database`
  - Estimate: 2 points
  - Component: `Schema`
  - Added to **Sprint Ready**

  **Acceptance Criteria Checklist in Issue:**
  - [ ] `barbershop_settings` table defined in `src/modules/barbershop/schema.ts`
  - [ ] All required columns present: `id`, `organizationId`, `description`, `address`, `onboardingCompleted`, `createdAt`, `updatedAt`
  - [ ] UNIQUE constraint on `organizationId`
  - [ ] FK → `organization.id` ON DELETE CASCADE
  - [ ] Migration generated: `bunx drizzle-kit generate --name add_barbershop_settings`
  - [ ] Migration SQL verified manually
  - [ ] Migration applied: `bunx drizzle-kit migrate`
  - [ ] `drizzle/schemas.ts` updated with `export * from "../src/modules/barbershop/schema"`
  - [ ] `bunx drizzle-kit check` passes

---

### Enabler 2: TypeBox DTOs & Model Definitions

- [ ] **Issue created**: "Technical Enabler: TypeBox DTOs & Model Definitions for Barbershop"
  - Labels: `enabler`, `priority-critical`, `value-high`, `backend`
  - Estimate: 1 point
  - Component: `Model`
  - Added to **Sprint Ready**

  **Acceptance Criteria Checklist in Issue:**
  - [ ] `BarbershopResponse` defined: `id`, `name`, `slug`, `description` (nullable), `address` (nullable), `onboardingCompleted`
  - [ ] `BarbershopSettingsInput` defined: all 4 fields optional, with minLength/maxLength and slug regex pattern
  - [ ] `SlugCheckQuery` defined: `slug` required string
  - [ ] `SlugCheckResponse` defined: `{ available: boolean }`
  - [ ] No TypeScript errors in `model.ts`

---

## Story Level Issues

### Story 1: View Barbershop Profile

- [ ] **Issue created**: "User Story: View Barbershop Profile (GET /api/barbershop)"
  - Labels: `user-story`, `priority-high`, `value-high`, `backend`
  - Estimate: 3 points
  - Component: `Handler`, `Service`
  - Blocked by: Enabler 1, Enabler 2
  - Added to **Backlog**

  **Implementation Tasks in Issue:**
  - [ ] Task: Implement `getSettings(organizationId)` in `service.ts` — SELECT from `organization` + LEFT JOIN `barbershop_settings`
  - [ ] Task: Implement `GET /api/barbershop` route in `handler.ts` with `requireOrganization: true` macro
  - [ ] Task: Return `description: null`, `address: null`, `onboardingCompleted: false` when no `barbershop_settings` row exists

  **Tests Referenced:**
  - [ ] T-01: Authenticated owner → 200 with full profile
  - [ ] T-02: No session → 403

---

### Story 2: Update Barbershop Settings

- [ ] **Issue created**: "User Story: Update Barbershop Settings (PATCH /api/barbershop/settings)"
  - Labels: `user-story`, `priority-high`, `value-high`, `backend`
  - Estimate: 5 points
  - Component: `Handler`, `Service`
  - Blocked by: Enabler 1, Enabler 2
  - Added to **Backlog**

  **Implementation Tasks in Issue:**
  - [ ] Task: Implement `PATCH /api/barbershop/settings` route in `handler.ts` with `requireAuth: true` + `requireOrganization: true`
  - [ ] Task: Implement `updateSettings(organizationId, body)` in `service.ts`
    - [ ] Empty-body guard (throws `AppError` 400 if no fields present)
    - [ ] Slug uniqueness pre-check (SELECT from `organization` WHERE `slug = lower(input)`; 409 if different org owns it)
    - [ ] Lowercase slug before all checks and persistence
    - [ ] Conditional UPDATE on `organization` table if `name` or `slug` in body
    - [ ] Conditional UPSERT on `barbershop_settings` if `description` or `address` in body
    - [ ] Return full updated profile (call `getSettings()` after writes)
  - [ ] Task: Confirm `organizationId` is **never** read from request body

  **Tests Referenced:**
  - [ ] T-03: Update name only → 200
  - [ ] T-04: Update description and address → 200
  - [ ] T-05: Update slug — available new value → 200
  - [ ] T-06: Update slug — taken by another org → 409
  - [ ] T-07: Update slug — own current slug → 200
  - [ ] T-08: Empty body → 400
  - [ ] T-09: Name too short (1 char) → 400
  - [ ] T-10: Slug invalid format (contains space) → 400
  - [ ] T-11: Slug invalid format (starts with hyphen) → 400
  - [ ] T-12: Slug too short (2 chars) → 400
  - [ ] T-13: Unauthenticated PATCH → 401
  - [ ] T-18: Cross-tenant isolation — owner A cannot overwrite owner B's data
  - [ ] T-19: Idempotency — two identical PATCHes both return 200

---

### Story 3: Real-Time Slug Check

- [ ] **Issue created**: "User Story: Real-Time Slug Availability Check (GET /api/barbershop/slug-check)"
  - Labels: `user-story`, `priority-high`, `value-high`, `backend`
  - Estimate: 3 points
  - Component: `Handler`, `Service`
  - Blocked by: Enabler 2
  - Added to **Backlog**

  **Implementation Tasks in Issue:**
  - [ ] Task: Implement `checkSlug(slug, requestingOrgId?)` in `service.ts`
    - [ ] Lowercase input before lookup
    - [ ] SELECT id FROM `organization` WHERE `lower(slug) = lower(input)`
    - [ ] If no row: return `available: true`
    - [ ] If row found and `id === requestingOrgId`: return `available: true`
    - [ ] If row found and different org: return `available: false`
  - [ ] Task: Implement `GET /api/barbershop/slug-check` route in `handler.ts`
    - [ ] Per-route `rateLimit({ max: 30, duration: 60000 })` override scoped to this route only
    - [ ] Optional session read (unauthenticated callers allowed)
    - [ ] Pass `activeOrganizationId` if session present, otherwise `undefined`
    - [ ] Return 400 if `slug` query param is missing (TypeBox validation)

  **Tests Referenced:**
  - [ ] T-14: Available slug → `{ available: true }`
  - [ ] T-15: Taken slug → `{ available: false }`
  - [ ] T-16: Own slug while authenticated → `{ available: true }`
  - [ ] T-17: Missing slug param → 400

---

## Integration Test Issue

- [ ] **Issue created**: "Test: Barbershop Settings Integration Tests"
  - Labels: `test`, `priority-high`, `value-high`, `backend`
  - Estimate: 2 points
  - Component: `Tests`
  - Blocked by: All 3 stories
  - Added to **Backlog**

  **Test File**: `tests/modules/barbershop-settings.test.ts`

  **Setup Tasks in Issue:**
  - [ ] Sign up unique user (User A), create org, set active, capture `authCookie`
  - [ ] Sign up second user (User B), create org, set active — for cross-tenant tests

  **Test Cases to Implement:**

  | # | Test | Endpoint | Expected |
  |---|---|---|---|
  | T-01 | Load settings — authenticated owner | `GET /api/barbershop` | 200 with profile fields |
  | T-02 | Load settings — no session | `GET /api/barbershop` | 403 |
  | T-03 | Update name only | `PATCH /api/barbershop/settings` | 200 with updated name |
  | T-04 | Update description and address | `PATCH /api/barbershop/settings` | 200 with updated fields |
  | T-05 | Update slug — available | `PATCH /api/barbershop/settings` | 200 with updated slug |
  | T-06 | Update slug — taken by another org | `PATCH /api/barbershop/settings` | 409 |
  | T-07 | Update slug — own current slug | `PATCH /api/barbershop/settings` | 200 |
  | T-08 | Empty body | `PATCH /api/barbershop/settings` | 400 |
  | T-09 | Name too short (1 char) | `PATCH /api/barbershop/settings` | 400 |
  | T-10 | Slug with space | `PATCH /api/barbershop/settings` | 400 |
  | T-11 | Slug starts with hyphen | `PATCH /api/barbershop/settings` | 400 |
  | T-12 | Slug too short (2 chars) | `PATCH /api/barbershop/settings` | 400 |
  | T-13 | Unauthenticated PATCH | `PATCH /api/barbershop/settings` | 401 |
  | T-14 | Slug check — available | `GET /api/barbershop/slug-check` | `{ available: true }` |
  | T-15 | Slug check — taken | `GET /api/barbershop/slug-check` | `{ available: false }` |
  | T-16 | Slug check — own slug authenticated | `GET /api/barbershop/slug-check` | `{ available: true }` |
  | T-17 | Slug check — missing param | `GET /api/barbershop/slug-check` | 400 |
  | T-18 | Cross-tenant isolation | PATCH as Org A | Org B data unchanged |
  | T-19 | Idempotency | Two identical PATCHes | Both return 200 |

---

## Registration Task Issue

- [ ] **Issue created**: "Task: Register barbershopHandler in src/app.ts"
  - Labels: `task`, `priority-high`, `backend`
  - Estimate: 1 point
  - Component: `Handler`
  - Blocked by: Story 1, Story 2, Story 3 (handler must be fully implemented first)
  - Added to **Backlog**

  **Acceptance Criteria:**
  - [ ] `import { barbershopHandler } from "./modules/barbershop/handler"` added to `src/app.ts`
  - [ ] `app.use(barbershopHandler)` registered alongside existing module handlers
  - [ ] All three routes visible at `/api/barbershop`, `/api/barbershop/settings`, `/api/barbershop/slug-check`

---

## Post-Creation Verification

- [ ] All issues have been created in GitHub
- [ ] All `#TBD` placeholders in feature issue updated with real issue numbers
- [ ] All blocking relationships set using GitHub's "Blocked by" field or comments
- [ ] All issues assigned to the project board in correct columns
- [ ] Milestone/Epic linked on every feature-level and story-level issue
- [ ] `bun run lint:fix && bun run format` pass before submitting any PR
- [ ] `bun test barbershop-settings` all 19 tests green before marking stories Done
