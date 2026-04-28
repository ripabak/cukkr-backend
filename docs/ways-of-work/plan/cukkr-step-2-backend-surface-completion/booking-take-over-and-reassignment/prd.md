# Feature PRD: Booking Take Over And Reassignment

**Version:** 1.0
**Date:** April 28, 2026
**Status:** Draft

---

## 1. Feature Name

**Booking Take Over And Reassignment**

Provide a dedicated booking ownership action so active work can be taken over or reassigned without destroying the customer's original barber preference.

---

## 2. Epic

- **Parent Epic:** [Cukkr Step 2 - Backend Surface Completion & Contract Consolidation](../epic.md)
- **Parent Step PRD:** [Cukkr Step 2 - Backend Surface Completion & Contract Consolidation](../../../../PRD_STEP2.md)
- **Parent Architecture:** Not yet authored for this epic.

---

## 3. Goal

### Problem

Real barbershop operations often require a different barber to take over or be assigned to an active booking. Today, that operational need risks being handled through ad hoc status changes or destructive overwrites of the originally requested barber. Without an explicit backend action for take over or reassignment, the UI cannot reliably support the real-world workflow and the data model loses intent. Step 2 needs a safe contract for changing who is handling a booking while preserving request history.

### Solution

Introduce a dedicated action for taking over or reassigning eligible bookings. The action updates actual handling ownership, leaves `requestedBarber` unchanged, and is restricted to bookings that are still active. It must enforce organization boundaries and reject terminal-state mutations.

### Impact

- Support real operational reassignment without data loss.
- Keep booking detail accurate when service ownership changes.
- Reduce risky manual workarounds in staff workflows.
- Improve auditability and consistency for assignment changes.

---

## 4. User Personas

| Persona | Role | Relevance |
|---|---|---|
| **Barber** | `barber` | Takes over or is assigned to an active booking. |
| **Barbershop Owner** | `owner` | Reassigns bookings to maintain operations. |
| **Frontend Integrator** | Internal | Needs a dedicated contract rather than inferring reassignment through generic status updates. |

---

## 5. User Stories

- **US-01:** As a **Barber**, I want to take over an eligible booking so that I can handle the customer when plans change on the floor.
- **US-02:** As an **Owner**, I want to reassign an active booking so that service ownership reflects current staffing conditions.
- **US-03:** As a **Barber or Owner**, I want reassignment to preserve the originally requested barber so that customer intent remains visible.
- **US-04:** As an **Engineering team member**, I want terminal or cross-organization takeover attempts rejected so that assignment changes remain safe.

---

## 6. Requirements

### Functional Requirements

- The bookings module must expose a dedicated take-over or reassignment action endpoint.
- The action must update `handledByBarber` and must not overwrite `requestedBarber`.
- The action must only be valid for bookings that are not in terminal states such as `completed` or `cancelled`.
- The action must enforce active-organization scoping for both the booking and the target handling barber.
- The action must reject attempts to assign ownership across organizations.
- The action must return booking detail or assignment metadata sufficient for the UI to refresh current handler state.
- If the product preserves internal assignment metadata or audit information, the reassignment action must update it consistently.
- Integration tests must cover successful reassignment, cross-organization rejection, and terminal-state rejection.

### Non-Functional Requirements

- **Security:** Only authenticated users allowed by organization membership and role rules may reassign booking handling.
- **Tenant Isolation:** Take-over and reassignment must never cross organization boundaries.
- **Reliability:** Assignment changes must be deterministic and must not mutate unrelated booking fields.
- **Maintainability:** The new action should reuse booking lifecycle and detail serialization rules.
- **Auditability:** The response or internal persistence must preserve enough information to explain who currently handles the booking.

---

## 7. Acceptance Criteria

### AC-01: Successful Reassignment

- [ ] A valid take-over or reassignment request updates `handledByBarber` for an eligible active booking.
- [ ] The response exposes enough data for the UI to show the new current handler.

### AC-02: Requested Barber Preservation

- [ ] Reassignment does not overwrite or remove `requestedBarber`.

### AC-03: Safety Rules

- [ ] Reassignment for a `completed` booking is rejected.
- [ ] Reassignment for a `cancelled` booking is rejected.
- [ ] Cross-organization reassignment attempts are rejected.

### AC-04: Test Coverage

- [ ] Integration tests cover success, forbidden cross-org, and invalid terminal-state cases.

---

## 8. Out of Scope

- Full historical assignment timeline presentation in the product UI.
- Auto-assignment or load-balancing logic.
- Rewriting requested barber preference rules.
- Capacity planning or conflict resolution beyond active-state eligibility.