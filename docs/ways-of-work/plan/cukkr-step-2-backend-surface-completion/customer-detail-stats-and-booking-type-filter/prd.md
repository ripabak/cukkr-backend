# Feature PRD: Customer Detail Stats And Booking Type Filter

**Version:** 1.0
**Date:** April 28, 2026
**Status:** Draft

---

## 1. Feature Name

**Customer Detail Stats And Booking Type Filter**

Extend customer detail and history contracts with richer aggregate statistics and booking-type filtering so customer-management screens can match the intended Step 2 UI.

---

## 2. Epic

- **Parent Epic:** [Cukkr Step 2 - Backend Surface Completion & Contract Consolidation](../epic.md)
- **Parent Step PRD:** [Cukkr Step 2 - Backend Surface Completion & Contract Consolidation](../../../../PRD_STEP2.md)
- **Parent Architecture:** Not yet authored for this epic.

---

## 3. Goal

### Problem

The current customer-management detail surface does not provide the richer statistics and filtering needed by the Step 2 design. Owners need quick context about a customer's booking history, spend, and recent activity, and they also need to filter history by booking type without rebuilding that logic in the client. Without those fields, the customer screen remains shallow and integration code becomes more complex. Step 2 needs a stronger customer detail contract while preserving existing notes and pagination behavior.

### Solution

Extend `GET /api/customers/:id` with aggregate metrics such as booking totals, spend totals, and last-visit metadata. Extend `GET /api/customers/:id/bookings` with booking-type filtering for `all`, `appointment`, and `walk_in` while keeping the existing pagination model. Preserve current notes functionality and existing detail flows.

### Impact

- Improve owner visibility into customer value and visit behavior.
- Reduce frontend aggregation logic.
- Bring the customer-management screen closer to the intended Step 2 experience.
- Add contract clarity around mixed appointment and walk-in history.

---

## 4. User Personas

| Persona | Role | Relevance |
|---|---|---|
| **Barbershop Owner** | `owner` | Reviews customer history, spend, and visit patterns. |
| **Barber** | `barber` | May inspect customer history in operational workflows if allowed by product roles. |
| **Frontend Integrator** | Internal | Needs server-returned stats and filters instead of recomputing history client-side. |

---

## 5. User Stories

- **US-01:** As a **Barbershop Owner**, I want customer detail to include booking and spend statistics so that I can understand customer value at a glance.
- **US-02:** As a **Barbershop Owner**, I want to filter customer booking history by type so that I can distinguish appointment behavior from walk-in behavior.
- **US-03:** As a **Frontend Integrator**, I want the existing pagination behavior preserved so that current history screens do not need a structural rewrite.
- **US-04:** As an **Engineering team member**, I want notes behavior preserved while detail data expands so that existing customer-management flows remain compatible.

---

## 6. Requirements

### Functional Requirements

- `GET /api/customers/:id` must return aggregate statistics including at minimum total bookings, appointment count, walk-in count, completed count, cancelled count, total spend, and last visit.
- `GET /api/customers/:id/bookings` must support a booking-type filter with at minimum `all`, `appointment`, and `walk_in`.
- Booking-history pagination behavior must remain compatible with the current customer-management surface.
- Existing notes update behavior for the customer record must remain available and unaffected.
- Aggregate stats must be calculated from the customer data scoped to the active organization.
- Mixed appointment and walk-in datasets must be reflected accurately in both aggregate counts and filtered history results.
- Integration tests must cover filter behavior and aggregate-stat calculations for mixed booking histories.

### Non-Functional Requirements

- **Security:** Customer detail and history endpoints remain protected by auth and organization scoping.
- **Tenant Isolation:** Stats and history must never include bookings from another organization.
- **Reliability:** Aggregate values must be deterministic for the same stored dataset.
- **Maintainability:** New stats should extend the existing customer-management module rather than introduce a parallel reporting surface.
- **Performance:** History filtering and stat calculation must remain responsive for interactive owner workflows.

---

## 7. Acceptance Criteria

### AC-01: Rich Customer Detail Stats

- [ ] `GET /api/customers/:id` returns total bookings, appointment count, walk-in count, completed count, cancelled count, total spend, and last-visit metadata.
- [ ] Aggregate stats reflect only bookings belonging to the active organization.

### AC-02: Booking Type Filter

- [ ] `GET /api/customers/:id/bookings` accepts `all`, `appointment`, and `walk_in` filter values.
- [ ] Filtered results include only bookings of the requested type.
- [ ] Pagination behavior remains compatible with the existing endpoint contract.

### AC-03: Existing Flow Preservation

- [ ] Existing notes update flow continues to work unchanged.
- [ ] Customer detail and history remain readable for current authorized users.

### AC-04: Test Coverage

- [ ] Integration tests cover mixed-data aggregate stats and type-based history filtering.

---

## 8. Out of Scope

- Customer segmentation or CRM campaign tooling.
- Export/reporting dashboards beyond the Step 2 detail screen.
- Predictive customer scoring.
- Customer-facing views of these statistics.