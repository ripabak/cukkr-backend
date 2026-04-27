# Project Plan: Multi-Barbershop & Branch Management

**Feature:** Multi-Barbershop & Branch Management — Multi-Tenant Organization Switching  
**Epic:** Cukkr — Barbershop Management & Booking System  
**PRD:** [prd.md](./prd.md)  
**Implementation Plan:** [implementation-plan.md](./implementation-plan.md)  
**Date:** April 28, 2026  
**Total Estimate:** 17 story points (Feature size: M)

---

## Issue Hierarchy Overview

```
Epic: Cukkr — Barbershop Management & Booking System   [existing]
└── Feature #1: Multi-Barbershop & Branch Management
    ├── Enabler #2: Database Migration — Composite Member Index
    ├── Enabler #3: BarbershopModel — Multi-Barbershop TypeBox Types
    ├── Enabler #4: BarbershopService — Extract validateAndCheckSlug Helper
    ├── Story #5: Create New Barbershop Organization
    │   └── Test #9 (partial)
    ├── Story #6: List All User's Barbershops
    │   └── Test #9 (partial)
    ├── Story #7: Leave Organization
    │   └── Test #9 (partial)
    └── Story #8: Cross-Tenant Data Isolation Validation
        └── Test #9 (partial)
```

### Critical Path

```
EN #2 ──┐
EN #3 ──┼──► S #5 ──┐
EN #4 ──┘            │
                      ├──► Test #9
EN #3 ──► S #6 ──────┤
EN #2 ──► S #7 ──────┤
         S #8 ────────┘
```

### Dependency Table

| Issue | Blocks | Blocked By |
|-------|--------|------------|
| #2 Migration | #5, #7 | — |
| #3 Model types | #5, #6, #7 | — |
| #4 Service helper | #5 | — |
| #5 Create org | #9 | #2, #3, #4 |
| #6 List orgs | #9 | #3 |
| #7 Leave org | #9 | #2, #3 |
| #8 Isolation | #9 | #5, #6 |
| #9 Integration tests | — | #5, #6, #7, #8 |

---

## GitHub Issue Templates

---

### Issue #1 — Feature: Multi-Barbershop & Branch Management

```markdown
# Feature: Multi-Barbershop & Branch Management

## Feature Description

Extend the existing `barbershop` module to support multi-organization management for
authenticated users. A user (owner or barber) may belong to multiple organizations
(barbershops), each fully isolated in data. Adds three new API endpoints — create
barbershop, list barbershops, and leave barbershop — built on top of the existing
`organization`, `member`, and `barbershop_settings` tables provisioned by Better Auth's
Organizations plugin. Active organization switching is fully delegated to Better Auth's
own endpoint.

## User Stories in this Feature

- [ ] #5 - Create New Barbershop Organization
- [ ] #6 - List All User's Barbershops
- [ ] #7 - Leave Organization
- [ ] #8 - Cross-Tenant Data Isolation Validation

## Technical Enablers

- [ ] #2 - Database Migration — Composite Member Index
- [ ] #3 - BarbershopModel — Multi-Barbershop TypeBox Types
- [ ] #4 - BarbershopService — Extract validateAndCheckSlug Helper

## Dependencies

**Blocks**: —
**Blocked by**: Parent epic milestone

## Acceptance Criteria

- [ ] `POST /api/barbershop` creates a new org, assigns owner role, initializes settings row
- [ ] `GET /api/barbershop/list` returns all orgs for the user with role per org
- [ ] `DELETE /api/barbershop/:orgId/leave` removes membership; rejects sole owners with 400
- [ ] All 13 integration test cases (T-01 through T-13) pass
- [ ] No regressions in existing barbershop, services, bookings, or analytics endpoints
- [ ] Lint and format checks pass

## Definition of Done

- [ ] All user stories delivered
- [ ] Technical enablers completed
- [ ] Integration tests passing (`tests/modules/multi-barbershop.test.ts`)
- [ ] Lint (`bun run lint:fix`) and format (`bun run format`) passing
- [ ] Full test suite (`bun test`) green with no regressions

## Labels

`feature`, `priority-high`, `value-high`, `backend`, `barbershop`

## Epic

#{epic-issue-number}

## Estimate

M (17 story points)
```

---

### Issue #2 — Enabler: Database Migration — Composite Member Index

```markdown
# Technical Enabler: Database Migration — Composite Member Index

## Enabler Description

Generate and apply a Drizzle ORM migration that adds a composite unique index on
`member(userId, organizationId)`. This index prevents duplicate membership rows under
concurrent invite acceptance and speeds up the ownership-count and leave queries used
by `leaveBarbershop`.

## Technical Requirements

- [ ] Run `bunx drizzle-kit generate --name add_multi_barbershop_indexes`
- [ ] Verify migration with `bunx drizzle-kit check`
- [ ] Apply migration with `bunx drizzle-kit migrate`
- [ ] Confirm `member_userId_orgId_uidx` exists in the database

## Implementation Tasks

- [ ] Generate migration file under `drizzle/`
- [ ] Validate migration is non-destructive (index-only, no column changes)
- [ ] Apply to local dev database

## User Stories Enabled

This enabler supports:
- #5 - Create New Barbershop Organization (membership INSERT idempotency)
- #7 - Leave Organization (owner-count + DELETE queries)

## Acceptance Criteria

- [ ] Migration file generated without errors
- [ ] `bunx drizzle-kit check` reports no conflicts
- [ ] Migration applies cleanly to a fresh database
- [ ] `drizzle/schemas.ts` does **not** require changes (no new tables)

## Definition of Done

- [ ] Migration file committed to `drizzle/`
- [ ] Migration applied to dev database
- [ ] Code review approved

## Labels

`enabler`, `priority-high`, `backend`, `database`

## Feature

#1

## Estimate

1 point
```

---

### Issue #3 — Enabler: BarbershopModel — Multi-Barbershop TypeBox Types

```markdown
# Technical Enabler: BarbershopModel — Multi-Barbershop TypeBox Types

## Enabler Description

Extend `src/modules/barbershop/model.ts` with the new TypeBox DTO types required by the
three new endpoints. All request/response shapes must be defined here and reused
consistently in `handler.ts` and `service.ts`.

## Technical Requirements

- [ ] Add `CreateBarbershopInput` — `t.Object` with `name`, `slug`, optional `description`, `address`
- [ ] Add `BarbershopListItem` — `t.Object` with `id`, `name`, `slug`, `description`, `address`, `onboardingCompleted`, `role`
- [ ] Add `BarbershopListResponse` — `t.Array(BarbershopListItem)`
- [ ] Add `OrgIdParam` — `t.Object({ orgId: t.String() })`
- [ ] Add `LeaveOrgResponse` — `t.Object({ message: t.String() })`

## Type Specifications

```typescript
CreateBarbershopInput = t.Object({
    name: t.String({ minLength: 2, maxLength: 100 }),
    slug: t.String({ minLength: 3, maxLength: 60 }),
    description: t.Optional(t.Nullable(t.String({ maxLength: 500 }))),
    address: t.Optional(t.Nullable(t.String({ maxLength: 300 })))
})

BarbershopListItem = t.Object({
    id: t.String(),
    name: t.String(),
    slug: t.String(),
    description: t.Nullable(t.String()),
    address: t.Nullable(t.String()),
    onboardingCompleted: t.Boolean(),
    role: t.String()
})
```

## User Stories Enabled

- #5 - Create New Barbershop Organization
- #6 - List All User's Barbershops
- #7 - Leave Organization

## Acceptance Criteria

- [ ] All five new types exported from `BarbershopModel`
- [ ] No `any` types used
- [ ] TypeScript strict mode passes with no errors

## Definition of Done

- [ ] Types added to `model.ts`
- [ ] No existing model types broken
- [ ] Code review approved

## Labels

`enabler`, `priority-high`, `backend`, `barbershop`

## Feature

#1

## Estimate

1 point
```

---

### Issue #4 — Enabler: BarbershopService — Extract validateAndCheckSlug Helper

```markdown
# Technical Enabler: BarbershopService — Extract validateAndCheckSlug Helper

## Enabler Description

Refactor `src/modules/barbershop/service.ts` to extract the shared slug validation and
uniqueness logic from `updateSettings` into a private `validateAndCheckSlug(slug,
excludeOrgId?)` helper. This eliminates duplication between `updateSettings` and the new
`createBarbershop` method.

## Technical Requirements

- [ ] Extract slug format check (`SLUG_REGEX`) and length validation into private static helper
- [ ] Helper signature: `private static validateAndCheckSlug(slug: string, excludeOrgId?: string): Promise<void>`
- [ ] Throws `AppError` with `BAD_REQUEST` on invalid format
- [ ] Throws `AppError` with `CONFLICT` on duplicate slug (excluding own org when `excludeOrgId` provided)
- [ ] Update `updateSettings` to call the new helper (no behaviour change)

## User Stories Enabled

- #5 - Create New Barbershop Organization (calls `validateAndCheckSlug` without excludeOrgId)

## Acceptance Criteria

- [ ] `updateSettings` behaviour is unchanged (existing tests still pass)
- [ ] `validateAndCheckSlug` correctly rejects invalid slug formats
- [ ] `validateAndCheckSlug` correctly rejects slugs already in use by other orgs
- [ ] `validateAndCheckSlug(slug, ownOrgId)` allows the same slug for an existing org's own update

## Definition of Done

- [ ] Helper extracted and `updateSettings` refactored
- [ ] All existing `bun test barbershop` tests pass
- [ ] Code review approved

## Labels

`enabler`, `priority-high`, `backend`, `barbershop`

## Feature

#1

## Estimate

1 point
```

---

### Issue #5 — Story: Create New Barbershop Organization

```markdown
# User Story: Create New Barbershop Organization

## Story Statement

As a **barbershop owner**, I want to create a new barbershop organization from the app
so that I can manage a second location without registering a new account.

## Acceptance Criteria

- [ ] `POST /api/barbershop` with valid `name` and unique `slug` returns `201 Created` with the new org's profile
- [ ] Caller is automatically assigned the `owner` role in the new organization
- [ ] A `barbershop_settings` row is initialized for the new org
- [ ] Optional `description` and `address` fields are persisted when provided
- [ ] Slug with invalid format (not matching `SLUG_REGEX`) returns `400 Bad Request`
- [ ] Duplicate slug returns `409 Conflict`
- [ ] Unauthenticated request returns `401 Unauthorized`
- [ ] `requireOrganization` is **not** required — endpoint works without an active org in session

## Technical Tasks

- [ ] Add `BarbershopService.createBarbershop(userId, body)` static method
- [ ] Wire `POST /` route in `barbershopHandler` with `requireAuth: true`, no `requireOrganization`
- [ ] Bind `CreateBarbershopInput` body model and `BarbershopResponse` response model

## Testing Requirements

- [ ] #9 — T-01: POST creates org, assigns owner role, returns org profile
- [ ] #9 — T-02: POST with duplicate slug returns 409
- [ ] #9 — T-03: POST with invalid slug format returns 400
- [ ] #9 — T-04: POST without session returns 401

## Dependencies

**Blocked by**: #2 (migration), #3 (model types), #4 (service helper)

## Definition of Done

- [ ] Acceptance criteria met
- [ ] Code review approved
- [ ] Integration tests (T-01–T-04) passing

## Labels

`user-story`, `priority-high`, `backend`, `barbershop`

## Feature

#1

## Estimate

3 points
```

---

### Issue #6 — Story: List All User's Barbershops

```markdown
# User Story: List All User's Barbershops

## Story Statement

As a **barbershop owner or barber**, I want to see a list of all my barbershops and my
role in each so that I can switch context or display the switcher UI correctly.

## Acceptance Criteria

- [ ] `GET /api/barbershop/list` returns all organizations the authenticated user belongs to
- [ ] Each item includes: `id`, `name`, `slug`, `description`, `address`, `onboardingCompleted`, `role`
- [ ] `onboardingCompleted` defaults to `false` when the `barbershop_settings` row has no value
- [ ] A user who belongs to 3 orgs receives exactly 3 items
- [ ] A fresh user with no orgs receives an empty array `[]`
- [ ] Results are ordered by `organization.createdAt ASC`
- [ ] Unauthenticated request returns `401 Unauthorized`
- [ ] `requireOrganization` is **not** required

## Technical Tasks

- [ ] Add `BarbershopService.listBarbershops(userId)` static method with `INNER JOIN organization LEFT JOIN barbershop_settings`
- [ ] Wire `GET /list` route in `barbershopHandler` with `requireAuth: true`
- [ ] Bind `BarbershopListResponse` response model

## Testing Requirements

- [ ] #9 — T-05: GET returns all orgs (2 orgs created, expect 2 items)
- [ ] #9 — T-06: Each item includes correct `role` field
- [ ] #9 — T-07: Fresh user with no orgs returns `[]`

## Dependencies

**Blocked by**: #3 (model types)

## Definition of Done

- [ ] Acceptance criteria met
- [ ] Code review approved
- [ ] Integration tests (T-05–T-07) passing

## Labels

`user-story`, `priority-high`, `backend`, `barbershop`

## Feature

#1

## Estimate

2 points
```

---

### Issue #7 — Story: Leave Organization

```markdown
# User Story: Leave Organization

## Story Statement

As a **barber or non-sole-owner**, I want to leave a barbershop organization I no longer
work at so that my organization list stays clean and I no longer receive its notifications.

## Acceptance Criteria

- [ ] `DELETE /api/barbershop/:orgId/leave` removes the caller's membership and returns `200 OK`
- [ ] After leaving, the org no longer appears in `GET /api/barbershop/list` for the ex-member
- [ ] A sole owner attempting to leave receives `400 Bad Request` with a descriptive error
- [ ] A non-member calling the endpoint for an org they don't belong to receives `404 Not Found`
- [ ] Unauthenticated request returns `401 Unauthorized`
- [ ] `requireOrganization` is **not** required — endpoint is active-org-independent

## Technical Tasks

- [ ] Add `BarbershopService.leaveBarbershop(userId, orgId)` static method
- [ ] Membership lookup: `SELECT FROM member WHERE userId = userId AND organizationId = orgId`
- [ ] Owner-count guard: `SELECT COUNT(*) FROM member WHERE organizationId = orgId AND role = 'owner'`
- [ ] `DELETE FROM member WHERE id = memberRow.id` on success
- [ ] Wire `DELETE /:orgId/leave` route in `barbershopHandler` with `requireAuth: true`
- [ ] Bind `OrgIdParam` params model and `LeaveOrgResponse` response model

## Testing Requirements

- [ ] #9 — T-08: DELETE returns 400 when caller is sole owner
- [ ] #9 — T-09: DELETE returns 200 and removes barber membership
- [ ] #9 — T-10: After leaving, org no longer in list for ex-barber
- [ ] #9 — T-11: DELETE returns 404 for non-member org ID

## Dependencies

**Blocked by**: #2 (migration), #3 (model types)

## Definition of Done

- [ ] Acceptance criteria met
- [ ] Code review approved
- [ ] Integration tests (T-08–T-11) passing

## Labels

`user-story`, `priority-high`, `backend`, `barbershop`

## Feature

#1

## Estimate

2 points
```

---

### Issue #8 — Story: Cross-Tenant Data Isolation Validation

```markdown
# User Story: Cross-Tenant Data Isolation Validation

## Story Statement

As a **platform operator**, I want cross-tenant data isolation enforced at the API level
so that switching active organizations never exposes another organization's data.

## Acceptance Criteria

- [ ] After switching active org to Org B via `POST /api/auth/organization/set-active`, `GET /api/services` returns only Org B's services
- [ ] User B (Org B active) cannot read Org A's data through any resource endpoint
- [ ] Existing `requireOrganization: true` endpoints (services, bookings, analytics, open-hours) continue to scope all queries to `activeOrganizationId`

## Technical Tasks

- [ ] No new handler/service code required — this story validates the *existing* isolation guarantees are preserved after the multi-barbershop changes
- [ ] Ensure `BarbershopService.createBarbershop` does not inadvertently alter the active session's `activeOrganizationId`

## Testing Requirements

- [ ] #9 — T-12: Switch active org, verify `GET /api/services` scoped to new active org
- [ ] #9 — T-13: User B cannot read Org A's data

## Dependencies

**Blocked by**: #5 (needs createBarbershop to seed test data), #6 (needs list to verify)

## Definition of Done

- [ ] T-12 and T-13 passing
- [ ] No regressions in existing module tests
- [ ] Code review approved

## Labels

`user-story`, `priority-high`, `value-high`, `backend`, `security`

## Feature

#1

## Estimate

2 points
```

---

### Issue #9 — Test: Integration Tests for Multi-Barbershop Feature

```markdown
# Test: Integration Tests — Multi-Barbershop & Branch Management

## Test Description

Create `tests/modules/multi-barbershop.test.ts` covering all 13 acceptance criteria
defined in the implementation plan. Uses Bun's built-in test runner and Eden Treaty for
end-to-end typed HTTP calls following the pattern established in
`tests/modules/barbershop-settings.test.ts`.

## Test Cases

| ID | AC | Description |
|----|----|----|
| T-01 | AC-1 | `POST /barbershop` creates org, assigns owner role, returns org profile |
| T-02 | AC-2 | `POST /barbershop` with duplicate slug returns `409 Conflict` |
| T-03 | AC-1 | `POST /barbershop` with invalid slug format returns `400 Bad Request` |
| T-04 | AC-1 | `POST /barbershop` without session returns `401 Unauthorized` |
| T-05 | AC-3 | `GET /barbershop/list` returns all orgs (2 created, expect 2) |
| T-06 | AC-3 | Each item includes correct `role` field |
| T-07 | AC-3 | Fresh user (no orgs) returns `[]` |
| T-08 | AC-6 | `DELETE /barbershop/:orgId/leave` returns `400` for sole owner |
| T-09 | AC-7 | `DELETE /barbershop/:orgId/leave` returns `200`, removes barber |
| T-10 | AC-7 | Org absent from list after ex-barber leaves |
| T-11 | — | `DELETE /barbershop/:orgId/leave` returns `404` for non-member |
| T-12 | AC-4 | Switch active org; `GET /api/services` scoped to new org |
| T-13 | AC-8 | User B cannot read Org A's data |

## Implementation Notes

- Use `createUserWithOrg` helper pattern (sign-up → create org → set-active → capture cookie)
- Use `createBarberInOrg` helper for tests requiring a barber member (T-09, T-10)
- Cast `tClient` to `any` for Better Auth auth calls (sign-up, set-active)
- For T-12/T-13: seed services via `POST /api/services` under different orgs before switching

## Acceptance Criteria

- [ ] All 13 test cases implemented and named to match T-01 through T-13
- [ ] Tests are self-contained — no shared state leaks between test cases
- [ ] `bun test multi-barbershop` passes in isolation
- [ ] `bun test` full suite passes with no regressions

## Definition of Done

- [ ] `tests/modules/multi-barbershop.test.ts` created
- [ ] All 13 tests passing
- [ ] No regressions in other test files
- [ ] Code review approved

## Labels

`test`, `priority-high`, `backend`, `barbershop`

## Feature

#1

## Estimate

5 points
```

---

## Sprint Planning

### Sprint Allocation (2-week sprint, ~18 pts capacity with 20% buffer)

| Order | Issue | Estimate | Parallel? | Notes |
|-------|-------|----------|-----------|-------|
| 1 | #2 Migration | 1 pt | Yes (with #3, #4) | No-risk index-only migration |
| 1 | #3 Model types | 1 pt | Yes (with #2, #4) | Pure type additions, no runtime risk |
| 1 | #4 Service helper | 1 pt | Yes (with #2, #3) | Refactor with existing test coverage |
| 2 | #5 Create org | 3 pts | After #2, #3, #4 | Core story; most complex service logic |
| 2 | #6 List orgs | 2 pts | After #3 | Can start as soon as model types done |
| 2 | #7 Leave org | 2 pts | After #2, #3 | Parallel with #5, #6 |
| 3 | #8 Isolation | 2 pts | After #5, #6 | Validation story; no new code |
| 4 | #9 Tests | 5 pts | After #5–#8 | All 13 test cases |

**Sprint Commitment**: 17 story points  
**Sprint Goal**: Deliver `POST /api/barbershop`, `GET /api/barbershop/list`, `DELETE /api/barbershop/:orgId/leave` fully tested and lint-clean.

---

## GitHub Labels Required

| Label | Color | Description |
|-------|-------|-------------|
| `epic` | `#6f42c1` | Epic-level work item |
| `feature` | `#0075ca` | Feature-level deliverable |
| `user-story` | `#28a745` | User-facing story |
| `enabler` | `#e4e669` | Technical infrastructure work |
| `test` | `#d93f0b` | QA and integration test work |
| `priority-high` | `#b60205` | P1 — core functionality |
| `value-high` | `#0e8a16` | High business value |
| `backend` | `#1d76db` | Backend scope |
| `barbershop` | `#f9d0c4` | Barbershop module |
| `database` | `#c5def5` | Database / migration scope |
| `security` | `#e11d48` | Security-relevant work |
