# Feature PRD: Booking Requested Vs Handled Barber Detail

**Version:** 1.0
**Date:** April 28, 2026
**Status:** Draft

---

## 1. Feature Name

**Booking Requested Vs Handled Barber Detail**

Return distinct `requestedBarber` and `handledByBarber` data in booking detail so customer intent and actual service ownership remain visible at the same time.

---

## 2. Epic

- **Parent Epic:** [Cukkr Step 2 - Backend Surface Completion & Contract Consolidation](../epic.md)
- **Parent Step PRD:** [Cukkr Step 2 - Backend Surface Completion & Contract Consolidation](../../../../PRD_STEP2.md)
- **Parent Architecture:** Not yet authored for this epic.

---

## 3. Goal

### Problem

The current booking model and detail contract do not clearly separate the barber requested by the customer from the barber who actually handles the booking. This becomes especially important for appointments with preference, walk-ins without a preference, and operational takeover scenarios. If the backend overwrites one concept with the other, the product loses valuable context for service accuracy, reporting, and customer expectation tracking. Step 2 needs a booking detail surface that preserves both roles explicitly.

### Solution

Extend booking persistence and serialization so `requestedBarber` and `handledByBarber` are separate fields in the detail contract. Preserve `requestedBarber` as customer intent, allow it to be `null` for walk-ins without preference, and fill `handledByBarber` when a barber actually starts or assumes the service. Keep existing pricing, notes, service lines, and metadata intact.

### Impact

- Preserve customer preference history without losing operational ownership.
- Enable accurate booking detail rendering for owners and barbers.
- Support future analytics and audit use cases with clearer semantics.
- Reduce ambiguity during take-over and reassignment flows.

---

## 4. User Personas

| Persona | Role | Relevance |
|---|---|---|
| **Barbershop Owner** | `owner` | Needs accurate booking detail for oversight and reassignment decisions. |
| **Barber** | `barber` | Needs to know the originally requested barber versus the actual handler. |
| **Appointment Customer** | `customer` | Indirectly represented through stored barber preference. |
| **Frontend Integrator** | Internal | Needs clear, non-overloaded booking detail fields. |

---

## 5. User Stories

- **US-01:** As a **Barber or Owner**, I want booking detail to show the barber requested by the customer so that I can see the original preference.
- **US-02:** As a **Barber or Owner**, I want booking detail to show who is actually handling the booking so that service ownership is clear.
- **US-03:** As an **Appointment Customer**, I want my barber preference preserved in the system even if another barber eventually handles the service.
- **US-04:** As an **Engineering team member**, I want walk-ins without barber preference to support a `null` requested barber so that the model reflects real usage.

---

## 6. Requirements

### Functional Requirements

- Booking detail responses must expose `requestedBarber` and `handledByBarber` as separate fields.
- `requestedBarber` must represent the barber selected or preferred at booking creation time.
- `handledByBarber` must represent the barber who actually handles the booking once work begins or ownership is reassigned.
- For walk-in bookings without barber preference, `requestedBarber` must be allowed to be `null`.
- For appointment bookings created with barber preference, `requestedBarber` must persist that selected barber.
- Actions that start or reassign booking handling must update `handledByBarber` without overwriting `requestedBarber`.
- Existing booking detail fields for service lines, pricing, notes, customer information, and timestamps must remain available.
- Integration tests must cover appointment preference preservation, walk-in `null` requested barber, and post-handling detail serialization.

### Non-Functional Requirements

- **Contract Clarity:** Requested and actual barber ownership semantics must be unambiguous in the API response.
- **Maintainability:** Serialization and persistence changes must be additive and compatible with existing booking detail consumers where possible.
- **Reliability:** Booking detail must reflect the latest assignment state without losing original request context.
- **Tenant Isolation:** Both barber references must resolve only within the booking's organization.
- **Testing Discipline:** Regression tests must cover mixed walk-in and appointment scenarios.

---

## 7. Acceptance Criteria

### AC-01: Distinct Booking Detail Fields

- [ ] Booking detail responses include both `requestedBarber` and `handledByBarber` fields.
- [ ] The two fields are not overloaded to represent the same concept.

### AC-02: Requested Barber Preservation

- [ ] Appointment bookings created with barber preference return that barber in `requestedBarber`.
- [ ] Walk-ins without preference return `requestedBarber = null`.

### AC-03: Actual Handler Visibility

- [ ] When a barber starts handling a booking, `handledByBarber` is populated in the detail response.
- [ ] Updating actual handling ownership does not overwrite `requestedBarber`.

### AC-04: Backward Data Completeness

- [ ] Booking detail continues to return existing non-barber metadata required by the current UI.
- [ ] Integration tests verify the contract for both walk-in and appointment bookings.

---

## 8. Out of Scope

- Historical timeline UI for every assignment change.
- Detailed audit-log design beyond what is needed to preserve requested and handled barber semantics.
- Customer-facing exposure of internal handling ownership.
- Analytics dashboards built on top of the new fields.