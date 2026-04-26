# Issues Checklist: Onboarding & Barbershop Setup

**Version:** 1.0
**Date:** April 26, 2026
**Status:** Draft
**Feature PRD:** [Onboarding & Barbershop Setup PRD](./prd.md)
**Implementation Plan:** [Implementation Plan](./implementation-plan.md)
**Project Plan:** [Project Plan](./project-plan.md)

> Use this checklist to track GitHub issue creation. Replace all `#TBD` with actual issue numbers once created. Issues should be created in this order to allow dependency linking.

---

## Pre-Creation Preparation

- [ ] Feature artifacts complete: PRD (`prd.md`), Implementation Plan (`implementation-plan.md`), Project Plan (`project-plan.md`)
- [ ] Epic issue exists in GitHub with labels `epic`, `priority-high`, `value-high`
- [ ] GitHub Project board configured with columns: Backlog, Sprint Ready, In Progress, In Review, Testing, Done
- [ ] Custom fields configured: Priority (P0–P3), Value (High/Medium/Low), Component, Estimate, Sprint, Epic
- [ ] Authentication & Multi-Tenancy feature confirmed complete (prerequisite)

---

## Issue Creation Order

> Create issues in this order to enable proper dependency linking.

---

## Level 1 — Epic

### [ ] Issue #___ — Epic: Cukkr Barbershop Management

**Title:** `Epic: Cukkr Barbershop Management`

**Labels:** `epic`, `priority-high`, `value-high`

**Body:**

```markdown
## Epic Description

Enable barbershop owners to fully set up and manage their barbershop profile,
staff, and service catalog through a guided onboarding wizard and subsequent
management endpoints.

## Business Value

- **Primary Goal**: Reduce time-to-first-booking for new barbershop owners.
- **Success Metrics**: 100% of new owners complete onboarding within 10 minutes; onboarding completion rate ≥ 80%.
- **User Impact**: Owners arrive in the app with a fully operational barbershop profile, at least one barber invited, and a bookable service ready.

## Epic Acceptance Criteria

- [ ] New owners can configure barbershop name, slug, description, and address.
- [ ] Owners can invite barbers by email during or after onboarding.
- [ ] Owners can create bookable services.
- [ ] `onboardingCompleted` flag prevents repeated wizard display.
- [ ] All endpoints enforce role and organization scoping.

## Features in this Epic

- [ ] #___ - Onboarding & Barbershop Setup

## Definition of Done

- [ ] All feature stories completed
- [ ] Integration tests passing (`bun test`)
- [ ] Lint and format checks passing
- [ ] No `console.log` or dead code present
```

**Estimate:** L

---

## Level 2 — Feature

### [ ] Issue #___ — Feature: Onboarding & Barbershop Setup

**Title:** `Feature: Onboarding & Barbershop Setup`

**Labels:** `feature`, `priority-high`, `value-high`, `backend`

**Epic:** #___ (Cukkr Barbershop Management)

**Body:**

```markdown
## Feature Description

A 4-step backend-supported wizard allowing new barbershop owners to configure
their profile, invite barbers, create a first service, and mark onboarding
complete. The wizard is skipped on subsequent launches when `onboardingCompleted = true`.

## User Stories in this Feature

- [ ] #___ - Barbershop Profile & Slug Management
- [ ] #___ - Barber Invitation
- [ ] #___ - First Service Creation
- [ ] #___ - Onboarding Completion Flag

## Technical Enablers

- [ ] #___ - Database Schema & Migration (barbershop_settings + service)

## Dependencies

**Blocks**: Barbershop Settings Management (post-onboarding)
**Blocked by**: #___ Authentication & Multi-Tenancy (Better Auth + Organizations plugin)

## Acceptance Criteria

- [ ] GET /api/barbershop returns onboardingCompleted, slug, description, address.
- [ ] PATCH /api/barbershop/settings validates slug regex and enforces uniqueness.
- [ ] POST /api/barbers/invite creates pending invitations with 7-day expiry.
- [ ] POST /api/services forces isDefault=true, isActive=true.
- [ ] onboardingCompleted is write-once (only settable to true).
- [ ] All endpoints except slug-check require active organization.

## Definition of Done

- [ ] All user stories delivered
- [ ] Technical enablers completed
- [ ] tests/modules/onboarding.test.ts passing
- [ ] bun run lint:fix and bun run format clean
- [ ] No magic strings; AppError used throughout
```

**Estimate:** M (21 story points)

---

## Level 3 — Enabler

### [ ] Issue #___ — Enabler: Database Schema & Migration

**Title:** `Enabler: Database Schema & Migration (barbershop_settings + service)`

**Labels:** `enabler`, `priority-critical`, `value-high`, `backend`, `database`

**Feature:** #___ (Onboarding & Barbershop Setup)

**Body:**

```markdown
## Enabler Description

Create and migrate the `barbershop_settings` and `service` Drizzle ORM tables.
Register both in `drizzle/schemas.ts` and generate/apply the named migration
`onboarding-barbershop-setup`.

## Technical Requirements

- [ ] `barbershop_settings`: id (PK), organizationId (unique FK → organization.id), description (nullable), address (nullable), onboardingCompleted (boolean, default false), createdAt, updatedAt.
- [ ] `service`: id (PK), organizationId (FK → organization.id), name, description (nullable), price (integer), duration (integer), discount (integer, default 0), isActive (boolean, default true), isDefault (boolean, default false), createdAt, updatedAt.
- [ ] Indexes: unique on `barbershop_settings.organizationId`; index on `service.organizationId`; composite index on `(service.organizationId, service.isDefault)`.
- [ ] Both schemas exported from `drizzle/schemas.ts`.

## Implementation Tasks

- [ ] #___ - Create src/modules/barbershop/schema.ts
- [ ] #___ - Create src/modules/services/schema.ts
- [ ] #___ - Add exports to drizzle/schemas.ts
- [ ] #___ - Run: bunx drizzle-kit generate --name onboarding-barbershop-setup
- [ ] #___ - Run: bunx drizzle-kit migrate

## Acceptance Criteria

- [ ] `bunx drizzle-kit check` reports no conflicts.
- [ ] Both tables exist in the target database after migrate.
- [ ] Unique constraint on `barbershop_settings.organizationId` enforced at DB level.
- [ ] Schemas importable from `drizzle/schemas.ts`.
```

**Estimate:** 3 story points

---

## Level 3 — User Stories

### [ ] Issue #___ — Story: Barbershop Profile & Slug Management

**Title:** `Story: Barbershop Profile & Slug Management`

**Labels:** `user-story`, `priority-high`, `value-high`, `backend`, `barbershop`

**Feature:** #___ (Onboarding & Barbershop Setup)

**Blocked by:** #___ (Database Schema & Migration)

**Body:**

```markdown
## Story Statement

As a **barbershop owner**, I want to configure my barbershop's name, slug,
description, and address, and check slug availability in real time so that
my barbershop has a unique identity.

## Acceptance Criteria

- [ ] GET /api/barbershop returns { id, name, slug, description, address, onboardingCompleted }.
- [ ] GET /api/barbershop/slug-check?slug=<value> returns { available: true/false }.
- [ ] Slug-check returns 400 for slugs failing regex ^[a-z0-9]([a-z0-9-]*[a-z0-9])?$ or outside 3–60 chars.
- [ ] PATCH /api/barbershop/settings updates name, description, address, slug (all optional).
- [ ] PATCH returns 409 when slug is already taken by another org.
- [ ] PATCH returns 400 for invalid slug format.
- [ ] PATCH returns 403 for non-owner callers.
- [ ] PATCH returns 401 when unauthenticated.
- [ ] Slug-check is rate-limited to 60 req/IP/min.
- [ ] barbershop_settings row is lazily created on first GET if not present.

## Implementation Tasks

- [ ] #___ - Create src/modules/barbershop/model.ts
- [ ] #___ - Implement BarbershopService (getSettings, checkSlugAvailability, updateSettings)
- [ ] #___ - Create src/modules/barbershop/handler.ts
- [ ] #___ - Register barbershopHandler in src/app.ts

## Testing Requirements

- [ ] #___ - Test: Slug check scenarios (5 cases)
- [ ] #___ - Test: PATCH settings scenarios (7 cases)
```

**Estimate:** 5 story points

---

### [ ] Issue #___ — Story: Barber Invitation

**Title:** `Story: Barber Invitation`

**Labels:** `user-story`, `priority-high`, `value-high`, `backend`, `barbers`

**Feature:** #___ (Onboarding & Barbershop Setup)

**Blocked by:** #___ (Database Schema & Migration)

**Body:**

```markdown
## Story Statement

As a **barbershop owner**, I want to invite barbers by email so that
my team can access the platform and serve customers.

## Acceptance Criteria

- [ ] POST /api/barbers/invite creates a pending invitation with role=barber and expiresAt = now + 7 days.
- [ ] Returns 201 with { id, email, role, status, expiresAt }.
- [ ] Returns 409 when a pending invitation for the same org+email already exists.
- [ ] Returns 400 for invalid email format.
- [ ] Returns 403 for non-owner callers.
- [ ] Returns 401 when unauthenticated.
- [ ] Notification failure does not block the HTTP response.

## Implementation Tasks

- [ ] #___ - Create src/modules/barbers/model.ts
- [ ] #___ - Implement BarberService.inviteBarber
- [ ] #___ - Create src/modules/barbers/handler.ts
- [ ] #___ - Register barbersHandler in src/app.ts

## Testing Requirements

- [ ] #___ - Test: Invite scenarios (5 cases: valid 201, duplicate 409, invalid email 400, no auth 401, no org 403)
```

**Estimate:** 3 story points

---

### [ ] Issue #___ — Story: First Service Creation

**Title:** `Story: First Service Creation`

**Labels:** `user-story`, `priority-high`, `value-high`, `backend`, `services`

**Feature:** #___ (Onboarding & Barbershop Setup)

**Blocked by:** #___ (Database Schema & Migration)

**Body:**

```markdown
## Story Statement

As a **barbershop owner**, I want to create my first bookable service during
onboarding so that customers can immediately book an appointment.

## Acceptance Criteria

- [ ] POST /api/services creates a service with isDefault=true and isActive=true (forced).
- [ ] Returns 201 with full service record.
- [ ] price must be integer > 0; returns 400 if price ≤ 0.
- [ ] duration must be integer ≥ 5; returns 400 if duration < 5.
- [ ] discount must be integer 0–100; returns 400 if out of range.
- [ ] name is required (2–100 chars); returns 400 if missing or invalid.
- [ ] description is optional (max 500 chars).
- [ ] Returns 403 for non-owner callers.
- [ ] Returns 401 when unauthenticated.

## Implementation Tasks

- [ ] #___ - Create src/modules/services/model.ts
- [ ] #___ - Implement ServiceService.createService
- [ ] #___ - Create src/modules/services/handler.ts
- [ ] #___ - Register servicesHandler in src/app.ts

## Testing Requirements

- [ ] #___ - Test: Service creation scenarios (7 cases: valid 201, price=0 400, price=-1 400, duration=4 400, discount=101 400, no name 400, no auth 401)
```

**Estimate:** 3 story points

---

### [ ] Issue #___ — Story: Onboarding Completion Flag

**Title:** `Story: Onboarding Completion Flag`

**Labels:** `user-story`, `priority-high`, `value-high`, `backend`, `barbershop`

**Feature:** #___ (Onboarding & Barbershop Setup)

**Blocked by:** #___ (Story: Barbershop Profile & Slug Management)

**Body:**

```markdown
## Story Statement

As a **barbershop owner**, I want the app to know I have completed onboarding
so that I am not shown the wizard again on subsequent app launches.

## Acceptance Criteria

- [ ] PATCH /api/barbershop/settings with { onboardingCompleted: true } sets the flag.
- [ ] Subsequent GET /api/barbershop returns onboardingCompleted: true.
- [ ] PATCH with { onboardingCompleted: false } returns 400.
- [ ] Once true, further PATCHes with onboardingCompleted: true are idempotent (200).
- [ ] Client cannot set onboardingCompleted to false via any endpoint.

## Testing Requirements

- [ ] #___ - Test: onboardingCompleted=true (200), false attempt (400), idempotent (200), full wizard flow
```

**Estimate:** 2 story points

---

## Level 4 — Test Issues

### [ ] Issue #___ — Test: Slug Check Scenarios

**Title:** `Test: Slug check scenarios (barbershop)`

**Labels:** `test`, `priority-high`, `backend`, `barbershop`

**Story:** #___ (Barbershop Profile & Slug Management)

**Scenarios:**

| # | Scenario | Expected |
|---|---|---|
| 1 | Valid available slug | `200 { available: true }` |
| 2 | Slug taken (same as owner's org slug) | `200 { available: false }` |
| 3 | Invalid format — uppercase letters | `400` |
| 4 | Slug starting with hyphen | `400` |
| 5 | Slug shorter than 3 chars | `400` |

---

### [ ] Issue #___ — Test: PATCH Barbershop Settings Scenarios

**Title:** `Test: PATCH barbershop settings scenarios`

**Labels:** `test`, `priority-high`, `backend`, `barbershop`

**Story:** #___ (Barbershop Profile & Slug Management) + #___ (Onboarding Completion Flag)

**Scenarios:**

| # | Scenario | Expected |
|---|---|---|
| 1 | PATCH with valid name + available slug | `200` — updated record |
| 2 | PATCH with slug already taken | `409` |
| 3 | PATCH with invalid slug format | `400` |
| 4 | PATCH without auth | `401` |
| 5 | PATCH without active org | `403` |
| 6 | PATCH to set `onboardingCompleted = true` | `200` |
| 7 | PATCH to set `onboardingCompleted = false` after true | `400` |

---

### [ ] Issue #___ — Test: Barber Invite Scenarios

**Title:** `Test: Barber invite scenarios`

**Labels:** `test`, `priority-high`, `backend`, `barbers`

**Story:** #___ (Barber Invitation)

**Scenarios:**

| # | Scenario | Expected |
|---|---|---|
| 1 | Invite valid email as owner | `201` — invitation record |
| 2 | Invite same email twice | `409` |
| 3 | Invite with invalid email format | `400` |
| 4 | Invite without auth | `401` |
| 5 | Invite without active org | `403` |

---

### [ ] Issue #___ — Test: Service Creation Scenarios

**Title:** `Test: Service creation scenarios`

**Labels:** `test`, `priority-high`, `backend`, `services`

**Story:** #___ (First Service Creation)

**Scenarios:**

| # | Scenario | Expected |
|---|---|---|
| 1 | Create service with valid fields | `201`, `isDefault=true`, `isActive=true` |
| 2 | Create with `price = 0` | `400` |
| 3 | Create with `price = -1` | `400` |
| 4 | Create with `duration = 4` (< 5) | `400` |
| 5 | Create with `discount = 101` | `400` |
| 6 | Create without `name` | `400` |
| 7 | Create without auth | `401` |

---

### [ ] Issue #___ — Test: Full Onboarding Wizard Flow

**Title:** `Test: Full onboarding wizard flow (end-to-end)`

**Labels:** `test`, `priority-high`, `backend`, `integration`

**Stories:** #___ #___ #___ #___ (all 4 stories)

**Scenarios:**

| Step | Action | Expected |
|---|---|---|
| 1 | Check slug availability | `{ available: true }` |
| 1 | PATCH barbershop settings (name + slug) | `200` |
| 2 | POST barbers/invite (valid email) | `201` |
| 3 | (Read-only, no API call) | — |
| 4 | POST services (valid service) | `201`, `isDefault=true` |
| Finish | PATCH onboardingCompleted = true | `200` |
| Verify | GET /api/barbershop | `onboardingCompleted: true` |

---

## Level 4 — Implementation Tasks

### Phase 1 — Database

| # | Task | Labels | Story Points | Issue |
|---|---|---|---|---|
| T1 | Create `src/modules/barbershop/schema.ts` | `task`, `backend`, `database` | 1 | #___ |
| T2 | Create `src/modules/services/schema.ts` | `task`, `backend`, `database` | 1 | #___ |
| T3 | Register both in `drizzle/schemas.ts` | `task`, `backend`, `database` | — (part of T1/T2) | — |
| T4 | Generate & apply migration (`onboarding-barbershop-setup`) | `task`, `backend`, `database` | 1 | #___ |

### Phase 2 — Barbershop Module

| # | Task | Labels | Story Points | Issue |
|---|---|---|---|---|
| T5 | Create `src/modules/barbershop/model.ts` | `task`, `backend`, `barbershop` | 1 | #___ |
| T6 | Implement `BarbershopService` (getSettings, checkSlugAvailability, updateSettings) | `task`, `backend`, `barbershop` | 3 | #___ |
| T7 | Create `src/modules/barbershop/handler.ts` (3 routes) | `task`, `backend`, `barbershop` | 1 | #___ |
| T8 | Register `barbershopHandler` in `src/app.ts` | `task`, `backend`, `barbershop` | — (part of T7) | — |

### Phase 3 — Barbers Module

| # | Task | Labels | Story Points | Issue |
|---|---|---|---|---|
| T9 | Create `src/modules/barbers/model.ts` | `task`, `backend`, `barbers` | 1 | #___ |
| T10 | Implement `BarberService.inviteBarber` | `task`, `backend`, `barbers` | 1 | #___ |
| T11 | Create `src/modules/barbers/handler.ts` + register in app.ts | `task`, `backend`, `barbers` | 1 | #___ |

### Phase 4 — Services Module

| # | Task | Labels | Story Points | Issue |
|---|---|---|---|---|
| T12 | Create `src/modules/services/model.ts` | `task`, `backend`, `services` | 1 | #___ |
| T13 | Implement `ServiceService.createService` | `task`, `backend`, `services` | 1 | #___ |
| T14 | Create `src/modules/services/handler.ts` + register in app.ts | `task`, `backend`, `services` | 1 | #___ |

### Phase 5 — Testing

| # | Task | Labels | Story Points | Issue |
|---|---|---|---|---|
| T15 | Create `tests/modules/onboarding.test.ts` (full suite) | `task`, `testing` | 5 | #___ |

### Phase 6 — Lint & Format

| # | Task | Labels | Story Points | Issue |
|---|---|---|---|---|
| T16 | Run `bun run lint:fix` and `bun run format`; fix all errors | `task`, `chore` | — | — |

---

## Summary Table

| Type | Count | Total Points |
|---|---|---|
| Epic | 1 | L |
| Feature | 1 | M (21 pts) |
| Enabler | 1 | 3 pts |
| User Stories | 4 | 13 pts |
| Test Issues | 5 | 5 pts |
| Task Issues | ~14 | — |
| **Total GitHub Issues** | **~26** | **21 pts** |

---

## Post-Creation Checklist

- [ ] All `#TBD` / `#___` placeholders replaced with actual issue numbers.
- [ ] All issues added to the GitHub Project board in the **Backlog** column.
- [ ] Epic issue linked to feature issue (parent → child).
- [ ] Feature issue linked to all stories and enablers.
- [ ] Story issues have `Blocked by` dependency set to Enabler issue.
- [ ] Test issues linked to their parent stories.
- [ ] Milestone created and assigned to feature and epic issues.
- [ ] Sprint 1 column populated with Week 1 issues (Enabler + Story 1 + Story 2).
- [ ] Sprint 1 column populated with Week 2 issues (Story 3 + Story 4 + Test suite).
