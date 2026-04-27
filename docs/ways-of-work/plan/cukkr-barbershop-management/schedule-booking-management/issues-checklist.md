# Issues Creation Checklist: Schedule & Booking Management

**Feature:** Schedule & Booking Management
**Epic:** Cukkr — Barbershop Management & Booking System
**Date:** April 27, 2026

---

## Pre-Creation Preparation

- [ ] **Feature artifacts complete:** PRD (`prd.md`), implementation plan (`implementation-plan.md`), and project plan (`project-plan.md`) are finalized.
- [ ] **Epic exists:** Parent epic issue created in GitHub with `epic`, `priority-critical`, `value-high` labels and milestone set.
- [ ] **Project board configured:** Columns (Backlog → Sprint Ready → In Progress → In Review → Testing → Done) and custom fields (Priority, Value, Component, Estimate, Sprint) are set up.
- [ ] **Team capacity assessed:** Sprint velocity agreed upon; 3 sprints planned totalling ~35 story points.

---

## Epic Level

- [ ] **EPIC-01** — "Cukkr — Barbershop Management & Booking System" issue created
  - Labels: `epic`, `priority-critical`, `value-high`
  - Milestone: `v1.0 — MVP Release`
  - Estimate: XL
- [ ] Epic milestone created with target release date
- [ ] Epic added to project board in **Backlog** column

---

## Feature Level

- [ ] **FEAT-01** — "Feature: Schedule & Booking Management" issue created
  - Labels: `feature`, `priority-critical`, `value-high`, `backend`, `bookings`
  - Parent: #EPIC-01
  - Estimate: L (~35 story points)
  - Dependencies documented: Blocked by Barber Management (barberId member records)
- [ ] Feature issue linked to parent epic
- [ ] Feature added to project board in **Backlog** column

---

## Enabler Level Issues

### E-01: Booking Service Business Logic Hardening

- [ ] Issue created: **"Technical Enabler: Booking Service Business Logic Hardening"**
  - Labels: `enabler`, `priority-critical`, `backend`, `bookings`, `value-high`
  - Feature: #FEAT-01
  - Estimate: 5 points
  - Sprint: Sprint 1
- [ ] Sub-tasks linked:
  - [ ] TASK-E01-1: Implement `validateStatusTransition` with typed transition map
  - [ ] TASK-E01-2: Implement `checkSingleInProgress` query
  - [ ] TASK-E01-3: Implement `validateOpenHours` query against `open_hours` table
  - [ ] TASK-E01-4: Add timestamp automation to `updateBookingStatus`
  - [ ] TASK-E01-5: Verify/fix `generateReferenceNumber` atomicity
  - [ ] TASK-E01-6: Verify/fix `upsertCustomer` for all three lookup paths

### E-02: Booking Model & Handler Verification

- [ ] Issue created: **"Technical Enabler: Booking Model & Handler Verification"**
  - Labels: `enabler`, `priority-high`, `backend`, `bookings`, `value-high`
  - Feature: #FEAT-01
  - Estimate: 3 points
  - Sprint: Sprint 1
- [ ] Sub-tasks linked:
  - [ ] TASK-E02-1: Update `BookingStatusUpdateInput` DTO with `cancelReason` optional field
  - [ ] TASK-E02-2: Verify/fix TypeBox union schema for walk-in vs. appointment
  - [ ] TASK-E02-3: Audit all 4 routes in `handler.ts` for correct schema application

### E-03: DB Index — booking_orgId_status_barberId_idx (Conditional)

- [ ] Issue created: **"Technical Enabler: DB Index booking_orgId_status_barberId_idx"**
  - Labels: `enabler`, `priority-medium`, `backend`, `bookings`, `database`, `value-medium`
  - Feature: #FEAT-01
  - Estimate: 2 points
  - Sprint: Sprint 1 (if agreed)
  - Note: Conditional — implement if `checkSingleInProgress` becomes a query hotspot
- [ ] Sub-tasks linked:
  - [ ] TASK-E03-1: Add index to `src/modules/bookings/schema.ts`
  - [ ] TASK-E03-2: Generate and apply migration via `drizzle-kit`

---

## User Story Level Issues

### S-01: Create Walk-In Booking

- [ ] Issue created: **"User Story: Create Walk-In Booking"**
  - Labels: `user-story`, `priority-critical`, `value-high`, `backend`, `bookings`
  - Feature: #FEAT-01
  - Estimate: 3 points
  - Sprint: Sprint 2
  - Blocked by: #E-01, #E-02
- [ ] Acceptance criteria written and testable
- [ ] Task issues linked: TASK-S01-1, TASK-S01-2
- [ ] Test references linked: T-01, T-02, T-03, T-07, T-19

### S-02: Create Appointment Booking with Open-Hours Validation

- [ ] Issue created: **"User Story: Create Appointment Booking with Open-Hours Validation"**
  - Labels: `user-story`, `priority-high`, `value-high`, `backend`, `bookings`
  - Feature: #FEAT-01
  - Estimate: 3 points
  - Sprint: Sprint 2
  - Blocked by: #E-01, #E-02
- [ ] Acceptance criteria written and testable
- [ ] Task issues linked: TASK-S02-1
- [ ] Test references linked: T-04, T-05, T-06

### S-03: Booking Lifecycle — Status Transition Management

- [ ] Issue created: **"User Story: Booking Lifecycle — Status Transition Management"**
  - Labels: `user-story`, `priority-critical`, `value-high`, `backend`, `bookings`
  - Feature: #FEAT-01
  - Estimate: 5 points
  - Sprint: Sprint 2
  - Blocked by: #E-01, #E-02
- [ ] Acceptance criteria written and testable
- [ ] Task issues linked: (delegates to E-01 tasks)
- [ ] Test references linked: T-12, T-13, T-14, T-15, T-16

### S-04: Booking List & Detail View

- [ ] Issue created: **"User Story: Booking List & Detail View"**
  - Labels: `user-story`, `priority-high`, `value-high`, `backend`, `bookings`
  - Feature: #FEAT-01
  - Estimate: 3 points
  - Sprint: Sprint 3
  - Blocked by: #E-02
- [ ] Acceptance criteria written and testable
- [ ] Task issues linked: TASK-S04-1, TASK-S04-2
- [ ] Test references linked: T-08, T-09, T-10, T-11

### S-05: Booking Reference Number Generation

- [ ] Issue created: **"User Story: Booking Reference Number Generation"**
  - Labels: `user-story`, `priority-high`, `value-high`, `backend`, `bookings`
  - Feature: #FEAT-01
  - Estimate: 3 points
  - Sprint: Sprint 2
  - Blocked by: #E-01
- [ ] Acceptance criteria written and testable
- [ ] Task issues linked: TASK-S05-1
- [ ] Test references linked: T-17, T-18

---

## Test Level Issues

### TEST-01: Booking Integration Test Suite

- [ ] Issue created: **"Test: Booking Integration Test Suite"**
  - Labels: `test`, `priority-critical`, `backend`, `bookings`, `value-high`
  - Feature: #FEAT-01
  - Estimate: 8 points
  - Sprint: Sprint 3
  - Blocked by: #S-01, #S-02, #S-03, #S-04, #S-05
- [ ] All 19 test case IDs documented in issue body
- [ ] Test file path noted: `tests/modules/bookings.test.ts`

---

## Test Case Coverage Tracker

| ID | Test Case | Story | Status |
|---|---|---|---|
| T-01 | Walk-in valid input → 201, ref present | S-01 | [ ] |
| T-02 | Walk-in missing customerName → 422 | S-01 | [ ] |
| T-03 | Walk-in invalid serviceId → 400 | S-01 | [ ] |
| T-04 | Appointment valid + scheduledAt → 201 | S-02 | [ ] |
| T-05 | Appointment closed day → 400 | S-02 | [ ] |
| T-06 | Appointment outside hours → 400 | S-02 | [ ] |
| T-07 | POST without auth → 401 | S-01 | [ ] |
| T-08 | GET list by date → 200, array | S-04 | [ ] |
| T-09 | GET list by date + status filter → 200 | S-04 | [ ] |
| T-10 | GET detail valid id → 200, full detail | S-04 | [ ] |
| T-11 | GET detail cross-org id → 404 | S-04 | [ ] |
| T-12 | PATCH waiting → in_progress → startedAt set | S-03 | [ ] |
| T-13 | PATCH in_progress → completed → completedAt set | S-03 | [ ] |
| T-14 | PATCH in_progress → waiting → startedAt null | S-03 | [ ] |
| T-15 | PATCH completed → cancelled → 400 | S-03 | [ ] |
| T-16 | 2nd in_progress same barber → 409 | S-03 | [ ] |
| T-17 | Two simultaneous walk-ins → unique refs | S-05 | [ ] |
| T-18 | Daily seq resets per day → format correct | S-05 | [ ] |
| T-19 | Same email → one customer, two bookings | S-01 | [ ] |

---

## Labels Required

Ensure the following labels exist in GitHub before creating issues:

| Label | Color | Purpose |
|---|---|---|
| `epic` | `#6f42c1` | Epic-level work items |
| `feature` | `#0075ca` | Feature-level deliverables |
| `user-story` | `#0052cc` | User-facing requirements |
| `enabler` | `#e4e669` | Technical infrastructure work |
| `test` | `#d93f0b` | QA and test implementation |
| `priority-critical` | `#b60205` | Critical path items |
| `priority-high` | `#d93f0b` | High priority items |
| `priority-medium` | `#e4e669` | Medium priority items |
| `priority-low` | `#0e8a16` | Low priority items |
| `value-high` | `#0e8a16` | High business value |
| `value-medium` | `#e4e669` | Medium business value |
| `backend` | `#1d76db` | Backend work |
| `bookings` | `#5319e7` | Bookings module |
| `database` | `#006b75` | Database/schema work |

---

## Issue Count Summary

| Type | Count | Total Points |
|---|---|---|
| Epic | 1 | XL |
| Feature | 1 | L (~35) |
| Enabler | 3 | 10 |
| User Story | 5 | 17 |
| Test | 1 | 8 |
| **Total GitHub Issues** | **11** | **35** |
