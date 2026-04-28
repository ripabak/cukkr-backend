# Feature PRD: Atomic Bulk Barber Invite

**Version:** 1.0
**Date:** April 28, 2026
**Status:** Draft

---

## 1. Feature Name

**Atomic Bulk Barber Invite**

Allow owners to invite multiple barbers in a single request with all-or-nothing execution so onboarding and staff expansion do not require one request per invite.

---

## 2. Epic

- **Parent Epic:** [Cukkr Step 2 - Backend Surface Completion & Contract Consolidation](../epic.md)
- **Parent Step PRD:** [Cukkr Step 2 - Backend Surface Completion & Contract Consolidation](../../../../PRD_STEP2.md)
- **Parent Architecture:** Not yet authored for this epic.

---

## 3. Goal

### Problem

Current barber invitation flow is optimized for one invite at a time, which adds avoidable frontend complexity during onboarding and barber management. Owners may need to add multiple team members in one session, but looping requests in the client makes error handling inconsistent and can leave the organization in a partially invited state. Duplicate, invalid, or already-member targets also need clear behavior. Without atomic bulk invite, staff onboarding remains slower and harder to reason about.

### Solution

Provide a bulk invitation endpoint that accepts an array of barber targets and validates the entire request before creating any invitation. If one target fails because it is invalid, duplicated, already invited, or already a member, the entire request fails and no invitations are created. On success, the response returns the full set of created invitations in a normalized format.

### Impact

- Reduce onboarding friction for owners managing multiple hires.
- Eliminate partial-success ambiguity in the invitation workflow.
- Simplify frontend implementation for batch invite flows.
- Improve data integrity by enforcing atomic rollback behavior.

---

## 4. User Personas

| Persona | Role | Relevance |
|---|---|---|
| **Barbershop Owner** | `owner` | Invites multiple barbers in one action. |
| **Barber (Invitee)** | `barber` | Receives a normalized invitation generated from a bulk operation. |
| **Frontend Integrator** | Internal | Needs an atomic batch contract instead of client-side request loops. |

---

## 5. User Stories

- **US-01:** As a **Barbershop Owner**, I want to submit multiple barber invites in one request so that I can onboard staff faster.
- **US-02:** As a **Barbershop Owner**, I want the request to fail entirely if any target is invalid so that I do not end up with a partially created invite batch.
- **US-03:** As a **Frontend Integrator**, I want a single success response containing all created invitations so that the UI can refresh predictably.
- **US-04:** As an **Engineering team member**, I want duplicate or already-member targets rejected explicitly so that invitation semantics remain deterministic.

---

## 6. Requirements

### Functional Requirements

- The barbers module must expose a bulk invite endpoint that accepts an array of invitation targets in a single request.
- Each invitation target must support the same identity rules as the single-invite flow, including email and/or phone when supported by the current module.
- The endpoint must validate the full request before creating any invitation records.
- If any target in the request is invalid, duplicated within the payload, already has an active invitation, or is already an active member of the organization, the entire request must fail and create no invitations.
- The operation must be atomic at the database and service level.
- A successful response must return the set of created invitations with fields needed by owner-facing invite management UI.
- Existing single-invite and invitation removal flows must remain compatible with invitations created by bulk invite.
- Pending invitations created by bulk invite must remain removable one by one through the existing removal/cancel path.
- Integration tests must cover success, invalid target, duplicate payload entries, already-member target, already-pending target, and rollback behavior.

### Non-Functional Requirements

- **Security:** Only authorized owners in the active organization may call the bulk invite endpoint.
- **Tenant Isolation:** All invitation creation and validation must be scoped to the active organization.
- **Reliability:** Atomicity must guarantee that no partial batch is persisted on failure.
- **Contract Consistency:** Bulk-created invitations must share the same normalized response semantics as individually created invitations.
- **Maintainability:** Validation logic should reuse the existing invitation rules rather than creating a second rule set.

---

## 7. Acceptance Criteria

### AC-01: Successful Atomic Batch Invite

- [ ] The bulk invite endpoint accepts a valid array of invitation targets and creates all invitations in one successful operation.
- [ ] The success response returns the full list of created invitations.

### AC-02: All-or-Nothing Validation

- [ ] If any target in the request is invalid, the endpoint fails and no invitations are created.
- [ ] If the payload contains duplicate invite targets, the endpoint fails and no invitations are created.
- [ ] If any target is already an active member or already has an active invitation, the endpoint fails and no invitations are created.

### AC-03: Compatibility with Existing Invite Management

- [ ] Invitations created by bulk invite appear in barber/invitation list responses the same way as single invites.
- [ ] A pending invitation created by the bulk flow can still be removed or cancelled individually.

### AC-04: Test Coverage

- [ ] Integration tests prove rollback behavior by asserting zero invitation creation after a failed mixed-validity request.

---

## 8. Out of Scope

- CSV import or spreadsheet-driven invite ingestion.
- Auto-splitting partial-success results back to the client.
- Invitation delivery through new channels not already supported by the product.
- Bulk removal of active barbers.