# Issue Creation Checklist: Open Hours Configuration

**Version:** 1.0
**Date:** April 26, 2026
**Status:** In Progress — feature implemented locally, GitHub issue wiring and full quality gate pending
**Project Plan:** [project-plan.md](./project-plan.md)
**Feature PRD:** [prd.md](./prd.md)
**Implementation Plan:** [implementation-plan.md](./implementation-plan.md)

> Use this checklist to create and wire the GitHub issues for Open Hours Configuration. Record actual issue numbers during the second pass.

---

## Pre-Creation Preparation

- [x] Feature artifacts complete: PRD, implementation plan, and project plan reviewed
- [ ] Parent epic issue exists with milestone and labels
- [ ] GitHub project board has columns: Backlog, Sprint Ready, In Progress, In Review, Testing, Done
- [ ] Custom fields are configured: Priority, Value, Component, Estimate, Sprint, Assignee, Epic
- [ ] Required labels exist:
  - [ ] `epic`
  - [ ] `feature`
  - [ ] `user-story`
  - [ ] `enabler`
  - [ ] `priority-high`
  - [ ] `priority-medium`
  - [ ] `value-high`
  - [ ] `value-medium`
  - [ ] `backend`
  - [ ] `database`
  - [ ] `api`

---

## Epic Level

| # | Issue Title | Labels | Estimate | Issue # | Done |
|---|---|---|---|---|---|
| E-01 | Epic: Cukkr — Barbershop Management & Booking System | `epic`, `priority-high`, `value-high` | XL | — | [ ] |

### E-01 Checklist

- [ ] Epic issue body copied from the Epic Issue template in `project-plan.md`
- [ ] Epic includes Open Hours Configuration in the feature list
- [ ] Epic added to project board in Backlog
- [ ] Milestone assigned

---

## Feature Level

| # | Issue Title | Labels | Estimate | Parent Epic | Issue # | Done |
|---|---|---|---|---|---|---|
| F-01 | Feature: Open Hours Configuration | `feature`, `priority-high`, `value-high`, `backend` | M | E-01 | — | [ ] |

### F-01 Checklist

- [ ] Feature issue body copied from the Feature Issue template in `project-plan.md`
- [ ] Feature references parent epic issue
- [ ] Feature lists all 3 stories and 2 enablers with `#TBD` placeholders
- [ ] Dependencies section calls out Booking & Schedule Management as blocked by this feature
- [ ] Feature added to project board in Backlog

---

## Technical Enabler Issues

| # | Issue Title | Labels | Estimate | Blocked By | Blocks | Sprint | Issue # | Done |
|---|---|---|---|---|---|---|---|---|
| EN-01 | Technical Enabler: open_hour Schema & Migration | `enabler`, `priority-high`, `backend`, `database` | 3 pts | — | S-01, S-02 | Sprint 1 | — | [x] |
| EN-02 | Technical Enabler: DTOs & Validation Mapping | `enabler`, `priority-high`, `backend`, `api` | 2 pts | — | S-01, S-02, S-03 | Sprint 1 | — | [x] |

### EN-01 Checklist

- [ ] Issue created using the Technical Enabler template
- [x] Tasks listed: schema definition, migration generation, schema export
- [x] User stories enabled: S-01 and S-02
- [ ] Component field set to `Schema`
- [ ] Sprint 1 assigned

  **Implementation Status:**
  - [x] `src/modules/open-hours/schema.ts` defines `open_hour` with `id`, `organizationId`, `dayOfWeek`, `isOpen`, `openTime`, `closeTime`, `createdAt`, and `updatedAt`
  - [x] FK to `organization.id` uses `onDelete: 'cascade'`
  - [x] Unique index on `(organizationId, dayOfWeek)` implemented as `open_hour_organizationId_dayOfWeek_uidx`
  - [x] Organization read index implemented as `open_hour_organizationId_idx`
  - [x] `drizzle/schemas.ts` exports `../src/modules/open-hours/schema`
  - [x] Migration generated: `bunx drizzle-kit generate --name add-open-hours-table` -> `drizzle/20260426144657_add-open-hours-table.sql`
  - [x] Migration SQL reviewed for table, FK, unique index, and read index
  - [x] Migration applied: `bunx drizzle-kit migrate`
  - [x] Drift check passed: `bunx drizzle-kit check`

### EN-02 Checklist

- [ ] Issue created using the Technical Enabler template
- [x] Tasks listed: DTO definitions and validation-error mapping
- [x] User stories enabled: S-01, S-02, and S-03
- [ ] Component field set to `API`
- [ ] Sprint 1 assigned

  **Implementation Status:**
  - [x] `src/modules/open-hours/model.ts` defines `OpenHoursDay`, `OpenHoursWeekResponse`, and `UpdateOpenHoursBody`
  - [x] DTO validation constrains `dayOfWeek` to `0-6` and time values to nullable `HH:MM`
  - [x] `src/modules/open-hours/handler.ts` adds a module-local validation mapper for `VALIDATION` errors
  - [x] Malformed weekly payloads return `400` in focused integration coverage instead of relying on the repo-wide default `422`

---

## User Story Issues

| # | Issue Title | Labels | Estimate | Blocked By | Sprint | Issue # | Done |
|---|---|---|---|---|---|---|---|
| S-01 | User Story: Read Weekly Open Hours | `user-story`, `priority-high`, `backend` | 3 pts | EN-01, EN-02 | Sprint 1 | — | [x] |
| S-02 | User Story: Replace Weekly Schedule as Owner | `user-story`, `priority-high`, `backend` | 5 pts | EN-01, EN-02 | Sprint 2 | — | [x] |
| S-03 | User Story: Preserve Consistency for Booking Reuse | `user-story`, `priority-medium`, `backend` | 2 pts | S-01, S-02 | Sprint 3 | — | [x] |

### S-01 Checklist

- [ ] Story statement present and user-focused
- [x] Acceptance criteria include default closed state, barber read access, unauthenticated `401`, and tenant scoping
- [x] Technical tasks reference GET handler, read service, and app registration
- [x] Testing requirement references read-path integration tests
- [ ] Sprint 1 assigned

  **Implementation Status:**
  - [x] `GET /api/open-hours` implemented in `src/modules/open-hours/handler.ts`
  - [x] `OpenHoursService.getWeeklySchedule()` returns a normalized 7-day schedule
  - [x] `src/app.ts` registers `openHoursHandler` under `/api`
  - [x] Focused tests cover unauthenticated `401`, default closed state, barber read access, and tenant-safe reads

### S-02 Checklist

- [ ] Story statement present and user-focused
- [x] Acceptance criteria include owner-only writes, exact 7-day coverage, time validation, normalization, and rollback
- [x] Technical tasks reference PUT handler, transactional service write, and owner-role check
- [x] Testing requirement references invalid payloads and atomic rollback
- [ ] Sprint 2 assigned

  **Implementation Status:**
  - [x] `PUT /api/open-hours` implemented in `src/modules/open-hours/handler.ts`
  - [x] `OpenHoursService.replaceWeeklySchedule()` validates the full week and replaces rows transactionally
  - [x] Owner-only writes enforced via `member.role === 'owner'`
  - [x] Closed-day times normalize to `null`, invalid time ranges return `400`, and rollback behavior is covered by focused tests

### S-03 Checklist

- [ ] Story statement present and future-booking-consumer perspective is clear
- [x] Acceptance criteria include reusable helper, in-memory normalization, and tenant-safe output
- [x] Technical tasks reference helper exposure and missing-day fill behavior
- [x] Testing requirement references tenant isolation and normalized output checks
- [ ] Sprint 3 assigned

  **Implementation Status:**
  - [x] `OpenHoursService.getWeeklyScheduleForOrganization()` is exposed for downstream booking reuse
  - [x] Missing rows are filled in memory as closed days without persisting defaults
  - [x] Focused tests verify normalized output and tenant isolation

---

## Implementation Task Issues

| # | Task Title | Parent | Estimate | Sprint | Issue # | Done |
|---|---|---|---|---|---|---|
| T-01 | Task: Define `open_hour` Drizzle schema | EN-01 | 1 pt | Sprint 1 | — | [x] |
| T-02 | Task: Generate and verify open-hours migration | EN-01 | 1 pt | Sprint 1 | — | [x] |
| T-03 | Task: Export schema from `drizzle/schemas.ts` | EN-01 | 1 pt | Sprint 1 | — | [x] |
| T-04 | Task: Define weekly DTOs in `model.ts` | EN-02 | 1 pt | Sprint 1 | — | [x] |
| T-05 | Task: Add validation-error mapping for schema failures | EN-02 | 1 pt | Sprint 1 | — | [x] |
| T-06 | Task: Implement GET route in `handler.ts` | S-01 | 1 pt | Sprint 1 | — | [x] |
| T-07 | Task: Implement normalized weekly read in `service.ts` | S-01 | 2 pts | Sprint 1 | — | [x] |
| T-08 | Task: Register `openHoursHandler` in `src/app.ts` | S-01 | 1 pt | Sprint 1 | — | [x] |
| T-09 | Task: Implement PUT route in `handler.ts` | S-02 | 1 pt | Sprint 2 | — | [x] |
| T-10 | Task: Implement transactional weekly replacement | S-02 | 3 pts | Sprint 2 | — | [x] |
| T-11 | Task: Implement owner-role authorization check | S-02 | 1 pt | Sprint 2 | — | [x] |
| T-12 | Task: Expose reusable weekly schedule helper | S-03 | 1 pt | Sprint 3 | — | [x] |
| T-13 | Task: Fill missing days in memory without persistence side effects | S-03 | 1 pt | Sprint 3 | — | [x] |
| T-14 | Task: Add `tests/modules/open-hours.test.ts` integration coverage | Feature | 3 pts | Sprint 2 | — | [x] |
| T-15 | Task: Run targeted tests, lint, and format quality gate | Feature | 1 pt | Sprint 3 | — | [ ] |

### Per-Task Checklist

#### T-01 — Define `open_hour` schema
- [x] Issue created with schema column list and index requirements
- [x] Acceptance criteria mention `(organizationId, dayOfWeek)` uniqueness

#### T-02 — Generate and verify migration
- [x] Issue references T-01 as prerequisite
- [x] Acceptance criteria mention SQL review and clean migration apply

#### T-03 — Export schema
- [x] Issue references Drizzle tooling visibility as acceptance criteria

#### T-04 — Define weekly DTOs
- [x] Issue lists request and response schemas explicitly
- [x] Acceptance criteria mention `HH:MM` and `0-6` validation constraints

#### T-05 — Validation-error mapping
- [x] Issue captures the `400` versus `422` requirement tradeoff

#### T-06 to T-08 — Read flow tasks
- [x] Issues reference S-01 and note `requireAuth` plus `requireOrganization`

#### T-09 to T-11 — Write flow tasks
- [x] Issues reference S-02 and note transactionality plus owner-role enforcement

#### T-12 to T-13 — Reuse readiness tasks
- [x] Issues reference S-03 and note no default-row persistence on reads

#### T-14 — Integration coverage
- [x] Issue includes auth, role enforcement, default state, invalid payloads, rollback, and tenant isolation coverage

#### T-15 — Quality gate
- [ ] Issue or PR checklist references `bun test open-hours`, `bun run lint:fix`, and `bun run format`

  **Current Validation Status:**
  - [x] Focused tests passed: `bun test --env-file=.env tests/modules/open-hours.test.ts`
  - [x] Focused lint passed: `bunx eslint src/modules/open-hours/*.ts tests/modules/open-hours.test.ts`
  - [ ] Full feature quality gate still pending: `bun run lint:fix` and `bun run format`

---

## Second Pass After Issue Creation

- [ ] Replace all `#TBD` placeholders in epic, feature, enabler, story, and task issues
- [ ] Update feature issue with actual story and enabler numbers
- [ ] Add blocking links from Booking & Schedule Management feature to F-01 or S-03 as appropriate
- [ ] Move Sprint 1 items to Sprint Ready once acceptance criteria are finalized
- [ ] Verify every issue has Priority, Value, Component, Estimate, Sprint, and Epic custom fields populated