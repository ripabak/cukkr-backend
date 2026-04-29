# Feature PRD: Public Walk In Support Data

**Version:** 1.0
**Date:** April 28, 2026
**Status:** Draft

---

## 1. Feature Name

**Public Walk In Support Data**

Complete the public walk-in journey by preserving PIN validation and walk-in submission while ensuring the customer-facing web form has the service and barber data it needs.

---

## 2. Epic

- **Parent Epic:** [Cukkr Step 2 - Backend Surface Completion & Contract Consolidation](../epic.md)
- **Parent Step PRD:** [Cukkr Step 2 - Backend Surface Completion & Contract Consolidation](../../../../PRD_STEP2.md)
- **Parent Architecture:** Not yet authored for this epic.

---

## 3. Goal

### Problem

The public walk-in flow already has partial support through PIN validation, but the full customer journey still depends on a complete set of public inputs and submission rules. Customers must be able to browse the services and barber options relevant to the walk-in form, validate a shop-issued PIN, and submit a queue entry end to end. Without a consolidated walk-in support contract, the web flow remains incomplete and the public booking surface cannot ship cleanly. Step 2 needs a public walk-in contract that combines safe read data with validated write behavior.

### Solution

Preserve and formalize the slug-based PIN validation and walk-in submission endpoints while ensuring public service and barber data can populate the form. Require a valid PIN validation token for submission and always create public walk-ins with status `waiting`. Cover the full flow with integration tests, including invalid token and organization-isolation scenarios.

### Impact

- Enable the end-to-end public queue-join experience.
- Reduce walk-in counter friction for customers already at the shop.
- Keep public walk-in semantics aligned with internal walk-in lifecycle rules.
- Provide a stable contract for the public web implementation.

---

## 4. User Personas

| Persona | Role | Relevance |
|---|---|---|
| **Walk-In Customer** | `customer` | Validates a PIN and submits a queue entry from the public web flow. |
| **Barbershop Owner** | `owner` | Relies on the public walk-in flow to create correct queue entries. |
| **Frontend Integrator** | Internal | Needs the public web form to have both the data and mutations required for walk-in booking. |

---

## 5. User Stories

- **US-01:** As a **Walk-In Customer**, I want to validate a shop-issued PIN so that I can prove I am allowed to use the public walk-in form.
- **US-02:** As a **Walk-In Customer**, I want public service and barber options so that I can fill the walk-in form correctly.
- **US-03:** As a **Walk-In Customer**, I want a successful public walk-in submission to place me in the queue immediately.
- **US-04:** As an **Engineering team member**, I want public walk-in submission blocked without a valid PIN-validation token so that the endpoint cannot be abused directly.

---

## 6. Requirements

### Functional Requirements

- `POST /api/public/:slug/pin/validate` must remain available for public walk-in PIN validation.
- `POST /api/public/:slug/walk-in` must remain available for public walk-in booking submission.
- Public service and barber read surfaces must provide enough data for walk-in form selection of `serviceIds` and optional `barberId`.
- Public walk-in submission must require a valid PIN validation token or equivalent proof from the prior validation step.
- Successful public walk-in creation must create a booking with type `walk_in` and status `waiting`.
- The walk-in submission contract must persist the customer-provided fields required by the Step 2 form.
- Invalid slug, invalid PIN token, or invalid service/barber references must return explicit errors.
- Integration tests must cover PIN validation, data fetch support, and successful end-to-end public walk-in submission.

### Non-Functional Requirements

- **Security:** Walk-in submission must require the validated PIN token and expose only customer-safe data publicly.
- **Tenant Isolation:** Slug resolution, PIN validation, and booking creation must remain scoped to the resolved organization.
- **Reliability:** A successful public walk-in submission must produce the same initial lifecycle state as internal walk-in creation.
- **Maintainability:** Public walk-in behavior should build on the existing walk-in PIN module rather than duplicate the flow elsewhere.
- **Contract Consistency:** Public walk-in payload and response semantics must align with the Step 2 booking lifecycle model.

---

## 7. Acceptance Criteria

### AC-01: PIN Validation

- [ ] `POST /api/public/:slug/pin/validate` validates a correct PIN for the resolved organization and returns the token or proof required for walk-in submission.
- [ ] Invalid PIN validation returns an explicit error.

### AC-02: Public Form Support Data

- [ ] Public service and barber data sufficient for the walk-in form are available to the frontend.

### AC-03: Successful Walk-In Submission

- [ ] `POST /api/public/:slug/walk-in` with a valid token and valid payload creates a `walk_in` booking in status `waiting`.
- [ ] Submitting without a valid PIN-validation token is rejected.

### AC-04: Test Coverage

- [ ] Integration tests cover PIN validation, public support data, successful walk-in create, and relevant invalid-input paths.

---

## 8. Out of Scope

- Public walk-in cancellation by the customer.
- Queue-position prediction or estimated wait times.
- PIN generation redesign.
- Anonymous public access to internal queue-management data.