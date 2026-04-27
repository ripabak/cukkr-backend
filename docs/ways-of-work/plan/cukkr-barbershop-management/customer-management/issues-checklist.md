# Issue Creation Checklist: Customer Management (CRM)

**Project Plan:** [project-plan.md](./project-plan.md)
**Feature PRD:** [prd.md](./prd.md)
**Implementation Plan:** [implementation-plan.md](./implementation-plan.md)

> **Instructions:** Create GitHub issues in the order listed below. Update the `#TBD` placeholders in [project-plan.md](./project-plan.md) with the real issue numbers as you go. Check each box when the issue is created.

---

## Pre-Creation Preparation

- [ ] Feature artifacts complete: PRD, implementation plan, and project plan all committed
- [ ] Parent epic issue exists in GitHub with correct labels and milestone
- [ ] GitHub Project board configured with `Backlog`, `Sprint Ready`, `In Progress`, `In Review`, `Testing`, `Done` columns
- [ ] Labels created: `epic`, `feature`, `user-story`, `enabler`, `test`, `priority-critical`, `priority-high`, `priority-medium`, `value-high`, `value-medium`, `backend`, `database`, `crm`

---

## Epic Level

- [ ] **Epic issue exists** — Cukkr Barbershop Management & Booking System
  - Labels: `epic`, `priority-high`, `value-high`
  - Record epic issue number: `#______`

---

## Feature Level

- [ ] **Feature: Customer Management (CRM)**
  - Body: copy from [project-plan.md](./project-plan.md) — Feature Issue section
  - Labels: `feature`, `priority-high`, `value-high`, `backend`, `crm`
  - Epic: link to epic issue
  - Estimate: L
  - Record issue number: `#______`

---

## Enabler Level

> Create enablers before stories so blockers can be linked immediately.

- [x] **Enabler: DB Indexes for Customer Management**
  - Body: copy from [project-plan.md](./project-plan.md) — Enabler 1 section
  - Labels: `enabler`, `priority-critical`, `backend`, `database`
  - Feature: link to feature issue
  - Estimate: 2 pts
  - Record issue number: `#______`
  - **Implementation:** Added `customer_organizationId_name_idx` and `booking_organizationId_customerId_createdAt_idx` to `src/modules/bookings/schema.ts`. Migration `20260427124250_add_customer_management_indexes.sql` generated and applied. ✅

- [x] **Enabler: Customer Management Module Setup**
  - Body: copy from [project-plan.md](./project-plan.md) — Enabler 2 section
  - Labels: `enabler`, `priority-critical`, `backend`, `crm`
  - Feature: link to feature issue
  - Estimate: 3 pts
  - Record issue number: `#______`
  - **Implementation:** Created `src/modules/customer-management/` with `model.ts`, `service.ts`, `handler.ts`. Registered `customersHandler` in `src/app.ts` under `/api` group. Build passes. ✅

---

## Story Level

> Stories can be created in parallel. All are blocked by both enablers above.

- [x] **Story: Browse & Search Customer List**
  - Body: copy from [project-plan.md](./project-plan.md) — Story 1 section
  - Labels: `user-story`, `priority-high`, `value-high`, `backend`, `crm`
  - Blocked by: DB Indexes enabler + Module Setup enabler
  - Feature: link to feature issue
  - Estimate: 5 pts
  - Record issue number: `#______`
  - **Implementation:** `CustomerManagementService.listCustomers()` implemented with SQL aggregation, search (ILIKE), sort (recent/bookings_desc/spend_desc/name_asc), and pagination. `GET /api/customers` route wired. ✅

- [x] **Story: View Customer Detail**
  - Body: copy from [project-plan.md](./project-plan.md) — Story 2 section
  - Labels: `user-story`, `priority-high`, `value-high`, `backend`, `crm`
  - Blocked by: DB Indexes enabler + Module Setup enabler
  - Feature: link to feature issue
  - Estimate: 3 pts
  - Record issue number: `#______`
  - **Implementation:** `CustomerManagementService.getCustomer()` with aggregation; 404 on cross-org access. `GET /api/customers/:id` route wired. ✅

- [x] **Story: View Customer Booking History**
  - Body: copy from [project-plan.md](./project-plan.md) — Story 3 section
  - Labels: `user-story`, `priority-high`, `value-high`, `backend`, `crm`
  - Blocked by: DB Indexes enabler + Module Setup enabler
  - Feature: link to feature issue
  - Estimate: 3 pts
  - Record issue number: `#______`
  - **Implementation:** `CustomerManagementService.getCustomerBookings()` using `db.query.booking.findMany` with services relation; sorted desc; paginated. `GET /api/customers/:id/bookings` route wired. ✅

- [x] **Story: Update Customer Notes**
  - Body: copy from [project-plan.md](./project-plan.md) — Story 4 section
  - Labels: `user-story`, `priority-high`, `value-medium`, `backend`, `crm`
  - Blocked by: DB Indexes enabler + Module Setup enabler
  - Feature: link to feature issue
  - Estimate: 2 pts
  - Record issue number: `#______`
  - **Implementation:** `CustomerManagementService.updateNotes()` — ownership check, update (empty string → null), re-fetch detail. `PATCH /api/customers/:id/notes` with `maxLength: 2000` body validation. ✅

---

## Test Level

- [x] **Test: Customer Management Integration Tests**
  - Body: copy from [project-plan.md](./project-plan.md) — Test Issue section
  - Labels: `test`, `priority-high`, `backend`, `crm`
  - Blocked by: all four stories above
  - Feature: link to feature issue
  - Estimate: 5 pts
  - Record issue number: `#______`
  - **Implementation:** `tests/modules/customer-management.test.ts` — 19 test cases covering all 15 AC criteria (AC-01a/b/c/d, AC-02a/b, AC-03a/b, AC-04a/b, AC-05a/b/c, AC-06, AC-07). All 19 tests pass (`bun test`). ✅

---

## Post-Creation Verification

- [ ] All 9 issues created (1 feature + 2 enablers + 4 stories + 1 test)
- [ ] All `#TBD` placeholders in `project-plan.md` updated with real issue numbers
- [ ] All issues added to the GitHub Project board in the `Backlog` column
- [ ] Blocking relationships set in GitHub (use "linked issues" or project dependencies)
- [ ] Sprint 1 issues assigned to sprint: Enabler DB Indexes, Enabler Module Setup, Story Browse & Search List
- [ ] Sprint 2 issues assigned to sprint: Story Customer Detail, Story Booking History, Story Update Notes, Test Integration Tests
- [ ] Feature issue added to epic issue's checklist

---

## Issue Number Reference (fill in as created)

| Issue | GitHub # |
|---|---|
| Epic: Cukkr Barbershop Management & Booking System | # |
| Feature: Customer Management (CRM) | # |
| Enabler: DB Indexes for Customer Management | # |
| Enabler: Customer Management Module Setup | # |
| Story: Browse & Search Customer List | # |
| Story: View Customer Detail | # |
| Story: View Customer Booking History | # |
| Story: Update Customer Notes | # |
| Test: Customer Management Integration Tests | # |
