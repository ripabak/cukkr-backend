# Issue Creation Checklist: Booking & Schedule Management

**Version:** 1.0
**Date:** April 26, 2026
**Status:** Draft
**Project Plan:** [project-plan.md](./project-plan.md)
**Feature PRD:** [prd.md](./prd.md)
**Implementation Plan:** [implementation-plan.md](./implementation-plan.md)

> Use this checklist to create and wire the GitHub issues for Booking & Schedule Management. Record actual issue numbers during the second pass and preserve explicit links to Service Management and Open Hours dependencies.

---

## Pre-Creation Preparation

- [ ] Feature artifacts complete: PRD, implementation plan, and project plan reviewed
- [ ] Parent epic issue exists with milestone and labels
- [ ] Service Management feature issue exists or will be created in the same planning pass
- [ ] Open Hours Configuration feature issue exists or will be created in the same planning pass
- [ ] GitHub project board has columns: Backlog, Sprint Ready, In Progress, In Review, Testing, Done
- [ ] Custom fields are configured: Priority, Value, Component, Estimate, Sprint, Assignee, Epic
- [ ] Required labels exist:
  - [ ] `epic`
  - [ ] `feature`
  - [ ] `user-story`
  - [ ] `enabler`
  - [ ] `priority-high`
  - [ ] `value-high`
  - [ ] `backend`
  - [ ] `database`
  - [ ] `api`
  - [ ] `service`

---

## Epic Level

| # | Issue Title | Labels | Estimate | Issue # | Done |
|---|---|---|---|---|---|
| E-01 | Epic: Cukkr — Barbershop Management & Booking System | `epic`, `priority-high`, `value-high` | XL | — | [ ] |

### E-01 Checklist

- [ ] Epic issue body copied from the Epic Issue template in `project-plan.md`
- [ ] Epic includes Booking & Schedule Management in the feature list
- [ ] Epic added to project board in Backlog
- [ ] Milestone assigned

---

## Feature Level

| # | Issue Title | Labels | Estimate | Parent Epic | Issue # | Done |
|---|---|---|---|---|---|---|
| F-01 | Feature: Booking & Schedule Management | `feature`, `priority-high`, `value-high`, `backend` | L | E-01 | — | [ ] |

### F-01 Checklist

- [ ] Feature issue body copied from the Feature Issue template in `project-plan.md`
- [ ] Feature references parent epic issue
- [ ] Feature lists all 5 stories and 3 enablers with `#TBD` placeholders
- [ ] Feature dependency section explicitly names Service Management and Open Hours Configuration as blockers
- [ ] Feature added to project board in Backlog

---

## Technical Enabler Issues

| # | Issue Title | Labels | Estimate | Blocked By | Blocks | Sprint | Issue # | Done |
|---|---|---|---|---|---|---|---|---|
| EN-01 | Technical Enabler: Booking Persistence Schema & Migration | `enabler`, `priority-high`, `backend`, `database` | 5 pts | — | S-01, S-02, S-03, S-04, S-05 | Sprint 1 | — | [x] |
| EN-02 | Technical Enabler: DTOs, Enums, and Query Contracts | `enabler`, `priority-high`, `backend`, `api` | 3 pts | — | S-01, S-02, S-03, S-04, S-05 | Sprint 1 | — | [x] |
| EN-03 | Technical Enabler: Transactional Create Primitives | `enabler`, `priority-high`, `backend`, `service` | 5 pts | EN-01, EN-02 | S-03, S-04 | Sprint 2 | — | [x] |

### EN-01 Checklist

- [x] Issue created using the Technical Enabler template
- [x] Tasks listed: schema definitions, migration generation, schema export
- [x] User stories enabled: all 5 stories
- [x] Component field set to `Schema`
- [x] Sprint 1 assigned
- [x] Implemented locally in [src/modules/bookings/schema.ts](../../../../../src/modules/bookings/schema.ts), [drizzle/schemas.ts](../../../../../drizzle/schemas.ts), and [drizzle/20260426144841_add-bookings-module.sql](../../../../../drizzle/20260426144841_add-bookings-module.sql)

### EN-02 Checklist

- [x] Issue created using the Technical Enabler template
- [x] Tasks listed: enums/DTOs and strict params/query validation
- [x] User stories enabled: all 5 stories
- [x] Component field set to `API`
- [x] Sprint 1 assigned
- [x] Implemented locally in [src/modules/bookings/model.ts](../../../../../src/modules/bookings/model.ts)

### EN-03 Checklist

- [x] Issue created using the Technical Enabler template
- [x] Tasks listed: customer matching, daily counter, reference generation, service snapshots
- [x] User stories enabled: S-03 and S-04
- [x] Component field set to `Service`
- [x] Sprint 2 assigned
- [x] Implemented locally in [src/modules/bookings/service.ts](../../../../../src/modules/bookings/service.ts), [src/modules/bookings/handler.ts](../../../../../src/modules/bookings/handler.ts), and [tests/modules/bookings.test.ts](../../../../../tests/modules/bookings.test.ts)

---

## User Story Issues

| # | Issue Title | Labels | Estimate | Blocked By | Sprint | Issue # | Done |
|---|---|---|---|---|---|---|---|
| S-01 | User Story: View Daily Booking Schedule | `user-story`, `priority-high`, `backend` | 5 pts | EN-01, EN-02 | Sprint 1 | — | [x] |
| S-02 | User Story: View Booking Detail & Snapshots | `user-story`, `priority-high`, `backend` | 3 pts | EN-01, EN-02 | Sprint 1 | — | [x] |
| S-03 | User Story: Create Walk-In Booking | `user-story`, `priority-high`, `backend` | 5 pts | EN-01, EN-02, EN-03, Service Management | Sprint 2 | — | [x] |
| S-04 | User Story: Create Appointment Booking | `user-story`, `priority-high`, `backend` | 5 pts | EN-01, EN-02, EN-03, Service Management, Open Hours Configuration | Sprint 3 | — | [x] |
| S-05 | User Story: Manage Booking Status Lifecycle | `user-story`, `priority-high`, `backend` | 5 pts | EN-01, EN-02 | Sprint 3 | — | [x] |

### S-01 Checklist

- [x] Story statement present and operational schedule use case is clear
- [x] Acceptance criteria include date/status/barber filters and tenant scoping
- [x] Technical tasks reference list route and service query composition
- [x] Testing requirement references list filtering and tenant isolation
- [x] Implemented locally in [src/modules/bookings/handler.ts](../../../../../src/modules/bookings/handler.ts), [src/modules/bookings/service.ts](../../../../../src/modules/bookings/service.ts), and [tests/modules/bookings.test.ts](../../../../../tests/modules/bookings.test.ts)

### S-02 Checklist

- [x] Story statement present and detail use case is clear
- [x] Acceptance criteria include nested customer, barber, notes, timestamps, and service snapshots
- [x] Technical tasks reference detail route and tenant-scoped detail query
- [x] Testing requirement references snapshot integrity and cross-tenant 404 behavior
- [x] Implemented locally in [src/modules/bookings/handler.ts](../../../../../src/modules/bookings/handler.ts), [src/modules/bookings/service.ts](../../../../../src/modules/bookings/service.ts), and [tests/modules/bookings.test.ts](../../../../../tests/modules/bookings.test.ts)

### S-03 Checklist

- [x] Story statement present and walk-in queue value is clear
- [x] Acceptance criteria include customer matching, optional barber validation, waiting status, and reference-number generation
- [x] Technical tasks reference walk-in create path and service/barber validation
- [x] Testing requirement references invalid service IDs and matching behavior
- [x] Implemented locally in [src/modules/bookings/service.ts](../../../../../src/modules/bookings/service.ts), [src/modules/bookings/handler.ts](../../../../../src/modules/bookings/handler.ts), and [tests/modules/bookings.test.ts](../../../../../tests/modules/bookings.test.ts)

### S-04 Checklist

- [x] Story statement present and appointment scheduling value is clear
- [x] Acceptance criteria include future `scheduledAt`, open-hours validation, and shared create primitives
- [x] Technical tasks reference appointment validation and open-hours integration
- [x] Testing requirement references missing `scheduledAt`, past dates, and outside-open-hours rejection
- [x] Implemented locally in [src/modules/bookings/service.ts](../../../../../src/modules/bookings/service.ts), [src/modules/bookings/handler.ts](../../../../../src/modules/bookings/handler.ts), [src/modules/open-hours/service.ts](../../../../../src/modules/open-hours/service.ts), and [tests/modules/bookings.test.ts](../../../../../tests/modules/bookings.test.ts)

### S-05 Checklist

- [x] Story statement present and lifecycle value is clear
- [x] Acceptance criteria include all valid transitions plus rejection of invalid transitions
- [x] Technical tasks reference status route and lifecycle engine
- [x] Testing requirement references timestamp behavior on each transition
- [x] Implemented locally in [src/modules/bookings/service.ts](../../../../../src/modules/bookings/service.ts), [src/modules/bookings/handler.ts](../../../../../src/modules/bookings/handler.ts), and [tests/modules/bookings.test.ts](../../../../../tests/modules/bookings.test.ts)

---

## Implementation Task Issues

| # | Task Title | Parent | Estimate | Sprint | Issue # | Done |
|---|---|---|---|---|---|---|
| T-01 | Task: Define booking schemas and relations | EN-01 | 3 pts | Sprint 1 | — | [x] |
| T-02 | Task: Generate and verify bookings migration | EN-01 | 1 pt | Sprint 1 | — | [x] |
| T-03 | Task: Export booking schemas in `drizzle/schemas.ts` | EN-01 | 1 pt | Sprint 1 | — | [x] |
| T-04 | Task: Define enums and DTOs in `model.ts` | EN-02 | 2 pts | Sprint 1 | — | [x] |
| T-05 | Task: Define strict params and query validation | EN-02 | 1 pt | Sprint 1 | — | [x] |
| T-06 | Task: Implement customer matching and normalization helpers | EN-03 | 2 pts | Sprint 2 | — | [x] |
| T-07 | Task: Implement daily counter and reference-number generator | EN-03 | 2 pts | Sprint 2 | — | [x] |
| T-08 | Task: Implement booking-service snapshot mapping | EN-03 | 1 pt | Sprint 2 | — | [x] |
| T-09 | Task: Implement list route in `handler.ts` | S-01 | 1 pt | Sprint 1 | — | [x] |
| T-10 | Task: Implement day-list query composition in `service.ts` | S-01 | 3 pts | Sprint 1 | — | [x] |
| T-11 | Task: Implement detail route in `handler.ts` | S-02 | 1 pt | Sprint 1 | — | [x] |
| T-12 | Task: Implement tenant-scoped detail query in `service.ts` | S-02 | 2 pts | Sprint 1 | — | [x] |
| T-13 | Task: Implement walk-in create path in `service.ts` | S-03 | 3 pts | Sprint 2 | — | [x] |
| T-14 | Task: Validate services and optional barber assignment | S-03 | 2 pts | Sprint 2 | — | [x] |
| T-15 | Task: Add appointment-specific scheduling validation | S-04 | 2 pts | Sprint 3 | — | [x] |
| T-16 | Task: Integrate open-hours dependency for appointment acceptance | S-04 | 3 pts | Sprint 3 | — | [x] |
| T-17 | Task: Implement status route in `handler.ts` | S-05 | 1 pt | Sprint 3 | — | [x] |
| T-18 | Task: Implement lifecycle engine and timestamp updates | S-05 | 3 pts | Sprint 3 | — | [x] |
| T-19 | Task: Register `bookingsHandler` in `src/app.ts` | Feature | 1 pt | Sprint 2 | — | [x] |
| T-20 | Task: Add `tests/modules/bookings.test.ts` integration coverage | Feature | 5 pts | Sprint 3 | — | [x] |
| T-21 | Task: Run targeted tests, lint, and format quality gate | Feature | 1 pt | Sprint 3 | — | [x] |

### Per-Task Checklist

#### T-01 to T-03 — Persistence foundation
- [x] Issues reference table/index requirements and Drizzle export wiring

#### T-04 to T-05 — Contracts
- [x] Issues reference create body, list query, detail response, and status-update contracts

#### T-06 to T-08 — Shared create primitives
- [x] Issues reference customer normalization, transactional sequence generation, and service snapshots

#### T-09 to T-12 — Read endpoints
- [x] Issues reference organization scoping in the query itself, not post-fetch filtering

#### T-13 to T-16 — Create workflows
- [x] Issues reference Service Management and Open Hours dependencies where applicable
- [x] Appointment-specific task explicitly notes future-dated and within-open-hours validation

#### T-17 to T-18 — Lifecycle management
- [x] Issues reference allowed transitions and timestamp side effects

#### T-19 — App registration
- [x] Issue references `.use(bookingsHandler)` under `/api`

#### T-20 — Integration coverage
- [x] Issue includes auth, tenant scoping, customer matching, reference generation, lifecycle transitions, list filtering, and snapshot integrity

#### T-21 — Quality gate
- [x] Issue or PR checklist references targeted booking tests plus lint and format

---

## Second Pass After Issue Creation

- [ ] Replace all `#TBD` placeholders in epic, feature, enabler, story, and task issues
- [ ] Add explicit blocking links to the Service Management and Open Hours issues
- [ ] Update the feature issue with actual story and enabler numbers
- [ ] Verify Sprint 1 only includes work with cleared dependencies
- [ ] Confirm every issue has Priority, Value, Component, Estimate, Sprint, and Epic custom fields populated