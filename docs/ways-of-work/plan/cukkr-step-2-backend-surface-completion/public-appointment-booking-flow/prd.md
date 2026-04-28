# Feature PRD: Public Appointment Booking Flow

**Version:** 1.0
**Date:** April 28, 2026
**Status:** Draft

---

## 1. Feature Name

**Public Appointment Booking Flow**

Add the missing public availability and appointment-submission contracts so customers can create future bookings from the barbershop web surface.

---

## 2. Epic

- **Parent Epic:** [Cukkr Step 2 - Backend Surface Completion & Contract Consolidation](../epic.md)
- **Parent Step PRD:** [Cukkr Step 2 - Backend Surface Completion & Contract Consolidation](../../../../PRD_STEP2.md)
- **Parent Architecture:** Not yet authored for this epic.

---

## 3. Goal

### Problem

The public booking surface is still missing the read and write contracts required for customers to schedule future appointments. Customers need to know which dates and times are selectable and must be able to submit a booking with services, optional barber preference, schedule, and notes. Without a public appointment contract, the customer web flow cannot run end to end and Step 2 remains incomplete. The backend must also ensure this public flow follows the same open-hours rule and booking lifecycle semantics as internal flows.

### Solution

Expose a public availability endpoint by slug and date, then add a public appointment submission endpoint that creates bookings with type `appointment` and initial status `requested`. Persist the selected services, optional requested barber, requested date/time, and notes, and validate the requested time against organization open hours only. Keep the existing Better Auth stack intact for any authenticated customer context without introducing a new auth model.

### Impact

- Unlock the core customer-facing appointment journey.
- Align public appointment semantics with the internal booking service model.
- Reduce frontend workarounds for calendar and booking submission.
- Improve readiness for end-to-end Step 2 delivery.

---

## 4. User Personas

| Persona | Role | Relevance |
|---|---|---|
| **Appointment Customer** | `customer` | Selects a future date/time and submits an appointment booking from the public web flow. |
| **Barbershop Owner** | `owner` | Receives requested appointments created through the public surface. |
| **Barber** | `barber` | Acts on requested appointments after creation. |
| **Frontend Integrator** | Internal | Needs public availability and appointment-create contracts with stable semantics. |

---

## 5. User Stories

- **US-01:** As an **Appointment Customer**, I want to see public availability based on barbershop open hours so that I can choose a valid booking time.
- **US-02:** As an **Appointment Customer**, I want to submit an appointment with services, optional barber preference, date/time, and notes so that I can book a future visit online.
- **US-03:** As a **Barber or Owner**, I want public appointments to enter the same booking lifecycle as internal appointments so that downstream actions behave consistently.
- **US-04:** As an **Engineering team member**, I want public appointment submission outside open hours rejected explicitly so that the contract is easy to integrate and test.

---

## 6. Requirements

### Functional Requirements

- The backend must expose a public availability endpoint resolved by barbershop slug and requested date.
- Public availability must be derived from organization open hours for Step 2.
- The backend must expose a public appointment submission endpoint resolved by slug.
- Successful public appointment submission must create a booking with type `appointment` and initial status `requested`.
- Public appointment creation must persist the selected services, optional requested barber preference, scheduled date/time, notes, and organization context.
- Public appointment creation must reject requests outside organization open hours.
- Public appointment creation must not reject requests solely because of booking overlap or occupancy during Step 2.
- Invalid slug, invalid service/barber selections, or other contract violations must return explicit errors.
- Step 2 must continue to rely on the existing Better Auth stack rather than introducing a new public-booking auth system.
- Integration tests must cover valid create, invalid slug, out-of-open-hours rejection, and subsequent accept/decline lifecycle behavior after creation.

### Non-Functional Requirements

- **Security:** Public appointment endpoints must expose only the minimal customer-safe data and validation required for booking submission.
- **Tenant Isolation:** Slug resolution and booking creation must remain scoped to the resolved organization only.
- **Contract Consistency:** Public appointments must enter the same booking state machine used by internal appointment flows.
- **Maintainability:** Availability and create logic should reuse shared booking/open-hours validation rather than fork public-only rules.
- **Performance:** Availability lookup and appointment submission must remain responsive for public web usage.

---

## 7. Acceptance Criteria

### AC-01: Public Availability

- [ ] A valid slug and date return public availability derived from the organization's open hours.
- [ ] Invalid slug requests return an explicit not-found response.

### AC-02: Successful Public Appointment Create

- [ ] Public appointment submission with a valid slug, in-hours schedule, valid services, and valid optional barber preference creates a booking.
- [ ] The created booking has type `appointment` and status `requested`.
- [ ] The created booking preserves requested barber preference, selected services, scheduled date/time, and notes.

### AC-03: Validation Rules

- [ ] Public appointment submission outside open hours is rejected explicitly.
- [ ] Step 2 public appointment submission is not rejected solely because another booking already exists in the same slot.

### AC-04: Lifecycle Compatibility

- [ ] A public appointment created through this flow can later be accepted or declined through the Step 2 appointment lifecycle contract.
- [ ] Integration tests cover create, invalid slug, invalid open-hours, and post-create accept/decline behavior.

---

## 8. Out of Scope

- Customer self-service reschedule or cancellation after submission.
- Payments or deposits during appointment creation.
- Occupancy-based availability logic.
- A new auth system dedicated to public booking.