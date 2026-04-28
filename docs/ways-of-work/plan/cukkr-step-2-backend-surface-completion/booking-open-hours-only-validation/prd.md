# Feature PRD: Booking Open Hours Only Validation

**Version:** 1.0
**Date:** April 28, 2026
**Status:** Draft

---

## 1. Feature Name

**Booking Open Hours Only Validation**

Make organization open hours the single validation rule for Step 2 booking-time acceptance across internal and public booking creation surfaces.

---

## 2. Epic

- **Parent Epic:** [Cukkr Step 2 - Backend Surface Completion & Contract Consolidation](../epic.md)
- **Parent Step PRD:** [Cukkr Step 2 - Backend Surface Completion & Contract Consolidation](../../../../PRD_STEP2.md)
- **Parent Architecture:** Not yet authored for this epic.

---

## 3. Goal

### Problem

Booking-time validation must match the Step 2 business rule that open hours, not occupancy or overlap, determine whether a booking can be created. If internal and public booking flows apply different validation logic, customers and staff will get conflicting results. If occupancy-based rejection leaks into Step 2, frontend teams will build against rules the business explicitly deferred. The backend needs one shared, simpler time-validation rule for this phase.

### Solution

Centralize booking-time validation on organization open hours only and reuse that rule across internal booking creation, public appointment submission, and public availability responses. Reject requests outside configured open hours with explicit validation errors. Do not block Step 2 bookings because another booking already exists at the same time.

### Impact

- Align internal and public scheduling behavior.
- Remove hidden capacity assumptions from Step 2.
- Reduce contract drift between booking creation surfaces.
- Make availability rules predictable and easier to test.

---

## 4. User Personas

| Persona | Role | Relevance |
|---|---|---|
| **Barbershop Owner** | `owner` | Creates bookings within configured open hours. |
| **Barber** | `barber` | Creates bookings without conflict-based rejection when time is within open hours. |
| **Appointment Customer** | `customer` | Books a future appointment against the same open-hours rules as staff flows. |
| **Frontend Integrator** | Internal | Needs one shared validation rule across internal and public surfaces. |

---

## 5. User Stories

- **US-01:** As a **Barber or Owner**, I want booking creation checked only against open hours so that the backend does not reject valid Step 2 bookings because of overlaps.
- **US-02:** As an **Appointment Customer**, I want public appointment submission to use the same open-hours validation as internal booking creation so that results are consistent.
- **US-03:** As a **Frontend Integrator**, I want public availability to reflect open hours rather than occupancy so that the calendar UI matches backend rules.
- **US-04:** As a **QA/Engineering team member**, I want explicit out-of-open-hours errors so that validation failures are easy to understand and test.

---

## 6. Requirements

### Functional Requirements

- Booking creation validation must use organization open hours as the sole Step 2 time-eligibility rule.
- Internal booking creation endpoints must reject bookings outside configured open hours.
- Public appointment submission must reject bookings outside configured open hours.
- Public availability output must be derived from organization open hours and must not remove options because of occupancy or existing-booking overlap.
- Step 2 booking creation must not reject a request solely because another booking exists at the same time.
- The same validation logic must be reused across internal create, public appointment create, and public availability behavior.
- Validation failures must return explicit responses indicating the requested time is outside open hours.
- Integration tests must cover in-hours acceptance, out-of-hours rejection, and parity between internal and public surfaces.

### Non-Functional Requirements

- **Contract Consistency:** Time validation semantics must be identical across all Step 2 booking creation surfaces.
- **Maintainability:** Open-hours validation logic should live in a shared booking/open-hours service path rather than be duplicated per handler.
- **Reliability:** Booking acceptance must not depend on hidden occupancy checks in Step 2.
- **Tenant Isolation:** The open-hours record used for validation must belong to the resolved organization only.
- **Performance:** Availability and validation lookups must remain efficient for interactive booking flows.

---

## 7. Acceptance Criteria

### AC-01: Open-Hours Acceptance

- [ ] Internal booking creation succeeds when the requested date/time is within organization open hours.
- [ ] Public appointment creation succeeds when the requested date/time is within organization open hours.

### AC-02: Out-Of-Hours Rejection

- [ ] Internal booking creation outside open hours returns an explicit validation error.
- [ ] Public appointment creation outside open hours returns an explicit validation error.

### AC-03: No Occupancy Blocking

- [ ] Step 2 booking creation does not reject a booking only because another booking already exists in the same time slot.
- [ ] Public availability is derived from open hours rather than current occupancy.

### AC-04: Shared Rule Coverage

- [ ] Integration tests verify the same open-hours rule is applied to internal create and public appointment create.

---

## 8. Out of Scope

- Slot-capacity engines.
- Overlap prevention based on existing bookings.
- Barber load balancing or utilization-based rejection.
- Estimated wait-time prediction.