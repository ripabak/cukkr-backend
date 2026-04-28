# Step 2 Execution Order Checklist

**Epic:** [Cukkr Step 2 - Backend Surface Completion & Contract Consolidation](./epic.md)
**Date:** April 28, 2026
**Status:** Draft

---

## 1. How To Use This File

This file is the single tracking source for Step 2 execution order.

Execution rules:

- Work from top to bottom by phase.
- Features in the same phase may run in parallel only when they do not depend on each other.
- A dependency is considered satisfied only when the dependency row has `Implemented = [x]`.
- `PRD Generated` is checked when the feature's `prd.md` exists and is accepted as the current source of truth.
- `Implementation Plan Generated` is checked when the feature's `implementation-plan.md` exists.
- When `Implementation Plan Generated` is still unchecked, generate it first by using the `breakdown-feature-implementation` skill against that feature's `prd.md`.
- `Implemented` is checked only after code changes, tests, and focused validation are complete.

Tracking levels:

- **Feature**: the feature row being tracked.
- **PRD Generated**: feature PRD exists.
- **Implementation Plan Generated**: feature implementation plan exists.
- **Implemented**: feature has been delivered and validated.

---

## 2. Phase 1 — Independent And Foundational

All items in this phase are unblocked by other Step 2 features and may be executed in parallel.

| Feature | Depends On | PRD Generated | Implementation Plan Generated | Implemented |
|---|---|---|---|---|
| [Unified Profile Contract](./unified-profile-contract/prd.md) | - | [x] | [x] | [ ] |
| [Barbershop Logo Upload](./barbershop-logo-upload/prd.md) | - | [x] | [x] | [ ] |
| [Service Thumbnail Upload](./service-thumbnail-upload/prd.md) | - | [x] | [x] | [ ] |
| [Booking List Sorting And Barber Search](./booking-list-sorting-and-barber-search/prd.md) | - | [x] | [x] | [ ] |
| [Booking State Machine By Type](./booking-state-machine-by-type/prd.md) | - | [x] | [x] | [ ] |
| [Invitation Actions Expiry And Removal Safety](./invitation-actions-expiry-and-removal-safety/prd.md) | - | [x] | [x] | [ ] |
| [Public Barbershop Landing And Read Surface](./public-barbershop-landing-and-read-surface/prd.md) | - | [x] | [x] | [ ] |

---

## 3. Phase 2 — Start After Listed Dependencies Are Implemented

Items in this phase may run in parallel only after their listed dependencies are fully implemented.

| Feature | Depends On | PRD Generated | Implementation Plan Generated | Implemented |
|---|---|---|---|---|
| [Booking Requested Vs Handled Barber Detail](./booking-requested-vs-handled-barber-detail/prd.md) | Booking State Machine By Type | [x] | [ ] | [ ] |
| [Booking Open Hours Only Validation](./booking-open-hours-only-validation/prd.md) | Booking State Machine By Type | [x] | [ ] | [ ] |
| [Atomic Bulk Barber Invite](./atomic-bulk-barber-invite/prd.md) | Invitation Actions Expiry And Removal Safety | [x] | [ ] | [ ] |
| [Public Walk In Support Data](./public-walk-in-support-data/prd.md) | Public Barbershop Landing And Read Surface | [x] | [ ] | [ ] |
| [Customer Detail Stats And Booking Type Filter](./customer-detail-stats-and-booking-type-filter/prd.md) | Booking State Machine By Type | [x] | [ ] | [ ] |

---

## 4. Phase 3 — Dependent Delivery Layer

Do not start these items until all listed dependencies are implemented.

| Feature | Depends On | PRD Generated | Implementation Plan Generated | Implemented |
|---|---|---|---|---|
| [Booking Take Over And Reassignment](./booking-take-over-and-reassignment/prd.md) | Booking State Machine By Type; Booking Requested Vs Handled Barber Detail | [x] | [ ] | [ ] |
| [Public Appointment Booking Flow](./public-appointment-booking-flow/prd.md) | Booking State Machine By Type; Booking Requested Vs Handled Barber Detail; Booking Open Hours Only Validation; Public Barbershop Landing And Read Surface | [x] | [ ] | [ ] |
| [Notification Action Mutations](./notification-action-mutations/prd.md) | Booking State Machine By Type; Invitation Actions Expiry And Removal Safety | [x] | [ ] | [ ] |

---

## 5. Phase 4 — Program-Level Validation

Run this phase after the relevant feature implementations are complete.

| Validation Item | Depends On | Implemented |
|---|---|---|
| Cross-feature booking regression | Booking State Machine By Type; Booking Requested Vs Handled Barber Detail; Booking Open Hours Only Validation; Booking Take Over And Reassignment; Public Appointment Booking Flow | [ ] |
| Cross-feature invitation and notification regression | Invitation Actions Expiry And Removal Safety; Atomic Bulk Barber Invite; Notification Action Mutations | [ ] |
| Cross-feature public surface regression | Public Barbershop Landing And Read Surface; Public Walk In Support Data; Public Appointment Booking Flow | [ ] |
| Cross-feature media regression | Barbershop Logo Upload; Service Thumbnail Upload | [ ] |

---

## 6. Implementation Plan Generation Rule

Use the `breakdown-feature-implementation` skill to generate each missing implementation plan at:

- `/docs/ways-of-work/plan/cukkr-step-2-backend-surface-completion/{feature-name}/implementation-plan.md`

Minimum rule:

- Do not start implementation for a feature while `Implementation Plan Generated` is still unchecked.
- After the plan file is created successfully, immediately update the matching row in this checklist from `[ ]` to `[x]` under `Implementation Plan Generated`.

---

## 7. Completion Gate

Mark `Implemented = [x]` only when all of the following are true for that feature:

- The code change is complete.
- Relevant integration tests were added or updated.
- Focused validation passed.
- The feature no longer has known blocking defects for its committed scope.
