# Feature PRD: Booking State Machine By Type

**Version:** 1.0
**Date:** April 28, 2026
**Status:** Draft

---

## 1. Feature Name

**Booking State Machine By Type**

Enforce the final Step 2 booking lifecycle separately for `walk_in` and `appointment` bookings so all direct actions and notification-driven actions share the same business rules.

---

## 2. Epic

- **Parent Epic:** [Cukkr Step 2 - Backend Surface Completion & Contract Consolidation](../epic.md)
- **Parent Step PRD:** [Cukkr Step 2 - Backend Surface Completion & Contract Consolidation](../../../../PRD_STEP2.md)
- **Parent Architecture:** Not yet authored for this epic.

---

## 3. Goal

### Problem

The current booking lifecycle still contains assumptions that do not match the intended Step 2 business process, especially around appointment requests and the legacy `pending` status. Walk-in and appointment bookings do not share the same entry point or action semantics, so one generic state flow is not sufficient. If the backend allows unsupported transitions, notifications and booking screens will diverge and operational behavior will become unreliable. Step 2 needs one explicit type-aware state machine owned by the booking service layer.

### Solution

Define and enforce separate legal transitions for `walk_in` and `appointment` bookings. Walk-ins must begin in `waiting`, while appointments must begin in `requested`. Appointment-specific actions such as `accept` and `decline` must resolve into the final booking statuses, and all lifecycle validation must be centralized in booking services so direct booking actions and notification actions stay consistent.

### Impact

- Align booking behavior with the actual business process.
- Remove legacy status ambiguity from Step 2 surfaces.
- Make notification and booking-action flows deterministic.
- Improve testability of positive and negative transition cases.

---

## 4. User Personas

| Persona | Role | Relevance |
|---|---|---|
| **Barbershop Owner** | `owner` | Manages booking lifecycle and needs predictable transition rules. |
| **Barber** | `barber` | Accepts, declines, handles, completes, cancels, or takes over bookings. |
| **Frontend Integrator** | Internal | Needs stable action semantics shared by booking and notification surfaces. |

---

## 5. User Stories

- **US-01:** As a **Barber or Owner**, I want walk-in bookings to start in `waiting` so that queue handling matches shop operations.
- **US-02:** As a **Barber or Owner**, I want appointment bookings to start in `requested` so that confirmation and decline behavior is explicit.
- **US-03:** As a **Barber or Owner**, I want appointment `accept` and `decline` actions to map to the correct final statuses so that request handling is clear.
- **US-04:** As an **Engineering team member**, I want unsupported transitions rejected in one centralized service layer so that all consumers share the same rules.
- **US-05:** As a **QA/Engineering team member**, I want regression tests for each booking type's lifecycle so that Step 2 parity is enforced automatically.

---

## 6. Requirements

### Functional Requirements

- Step 2 must not rely on a legacy `pending` booking status.
- New `walk_in` bookings must always be created with status `waiting`.
- New `appointment` bookings must always be created with status `requested`.
- Valid `walk_in` transitions must be limited to `waiting -> in_progress -> completed`, with cancellation allowed from `waiting` or `in_progress`.
- Valid `appointment` transitions must be limited to `requested -> waiting -> in_progress -> completed`, with cancellation allowed from `requested`, `waiting`, or `in_progress`.
- Appointment `accept` must move a booking from `requested` to `waiting`.
- Appointment `decline` must resolve the booking to `cancelled`.
- `Handle this` must only be valid for `walk_in` bookings currently in `waiting` unless a different action is explicitly defined elsewhere in the final booking contract.
- Completion and cancellation of terminal bookings must be blocked once the booking is already `completed` or `cancelled`.
- Transition validation must be centralized in the booking service layer and reused by notification-triggered actions.
- Integration tests must cover both valid transitions and invalid transition attempts per booking type.

### Non-Functional Requirements

- **Reliability:** Transition rules must be deterministic and shared across every surface that mutates booking state.
- **Maintainability:** Booking state logic must live in the booking service layer rather than being duplicated in handlers or notifications.
- **Contract Consistency:** The public-facing Step 2 contract must use the same lifecycle vocabulary across booking list, booking detail, and notifications.
- **Security:** Booking mutations remain protected by auth and organization scoping.
- **Test Discipline:** Lifecycle regression coverage must exist for both positive and negative cases.

---

## 7. Acceptance Criteria

### AC-01: Initial Status By Booking Type

- [ ] Creating a `walk_in` booking results in status `waiting`.
- [ ] Creating an `appointment` booking results in status `requested`.
- [ ] No Step 2 booking creation flow produces status `pending`.

### AC-02: Valid Transitions

- [ ] `walk_in` bookings can move `waiting -> in_progress -> completed` and can be cancelled from `waiting` or `in_progress`.
- [ ] `appointment` bookings can move `requested -> waiting -> in_progress -> completed` and can be cancelled from `requested`, `waiting`, or `in_progress`.
- [ ] Appointment `accept` moves `requested` to `waiting`.
- [ ] Appointment `decline` moves `requested` to `cancelled`.

### AC-03: Invalid Transition Rejection

- [ ] Unsupported transitions return an explicit validation error.
- [ ] Terminal bookings cannot be transitioned to another non-terminal state.
- [ ] `Handle this` on an unsupported booking type or status is rejected.

### AC-04: Shared Rule Enforcement

- [ ] Notification-driven appointment actions use the same transition rules as direct booking actions.
- [ ] Integration tests cover both booking types and both success and failure paths.

---

## 8. Out of Scope

- Occupancy-based booking throttling or overlap rejection.
- Customer self-service reschedule or cancellation.
- Rich decline-reason taxonomies beyond the Step 2 action contract.
- Future lifecycle states not required by the final Step 2 business flow.