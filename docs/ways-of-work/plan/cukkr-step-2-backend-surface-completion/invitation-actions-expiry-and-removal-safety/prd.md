# Feature PRD: Invitation Actions Expiry And Removal Safety

**Version:** 1.0
**Date:** April 28, 2026
**Status:** Draft

---

## 1. Feature Name

**Invitation Actions Expiry And Removal Safety**

Normalize barber invitation accept and decline actions, expose expiry semantics, and prevent unsafe barber removal while active bookings still depend on that member.

---

## 2. Epic

- **Parent Epic:** [Cukkr Step 2 - Backend Surface Completion & Contract Consolidation](../epic.md)
- **Parent Step PRD:** [Cukkr Step 2 - Backend Surface Completion & Contract Consolidation](../../../../PRD_STEP2.md)
- **Parent Architecture:** Not yet authored for this epic.

---

## 3. Goal

### Problem

Invitation lifecycle behavior is not yet fully normalized for Step 2. Invitees need explicit accept and decline actions, owners need clear expiry metadata, and the backend must not allow stale or expired invitations to be acted on silently. At the same time, barber removal needs stronger operational safety because active bookings may still reference a member. Without explicit contracts here, invitation and staff-management flows remain fragile and can produce unsafe state changes.

### Solution

Expose dedicated invitation accept and decline actions with a normalized invitation response model that includes `expiresAt` and `expired` semantics. Reject action attempts on expired invitations with explicit errors. Add a barber-removal safety rule that blocks or clearly warns when the member still owns active bookings in `requested`, `waiting`, or `in_progress`, requiring resolution or reassignment first.

### Impact

- Make invitation lifecycle behavior explicit for both owners and barbers.
- Reduce operational risk when removing members with active work.
- Improve notification and invite-screen consistency.
- Add testable protection around expiry and member-removal semantics.

---

## 4. User Personas

| Persona | Role | Relevance |
|---|---|---|
| **Barber** | `barber` | Accepts or declines an invitation and needs clear expiry feedback. |
| **Barbershop Owner** | `owner` | Manages invitations and removes barbers safely. |
| **Frontend Integrator** | Internal | Needs normalized invitation state and explicit action endpoints. |

---

## 5. User Stories

- **US-01:** As a **Barber**, I want explicit accept and decline invitation actions so that I can respond from invite-entry surfaces without ambiguity.
- **US-02:** As a **Barber**, I want invitations to expose expiry metadata so that I understand when an invite can no longer be used.
- **US-03:** As a **Barbershop Owner**, I want expired invitations rejected explicitly so that invitation state remains trustworthy.
- **US-04:** As a **Barbershop Owner**, I want barber removal blocked or warned when active bookings still depend on that member so that operational data is not orphaned.

---

## 6. Requirements

### Functional Requirements

- The barbers module must expose dedicated invitation accept and decline action endpoints or wrappers.
- Invitation responses must include `expiresAt` and an `expired` boolean or equivalent normalized expired-state indicator.
- Invitation expiry for Step 2 must represent the seven-day invitation validity rule.
- Accept and decline attempts against expired invitations must return explicit contract errors.
- Invitation list/detail responses must expose enough metadata for the frontend to determine whether actions are currently allowed.
- Removing a barber with active bookings in `requested`, `waiting`, or `in_progress` must not silently succeed.
- The removal flow must either block the action or return a clear warning/error contract instructing that the active bookings must first be resolved or reassigned.
- Safety checks for removal must be scoped to the active organization only.
- Integration tests must cover accept success, decline success, expired invitation rejection, and unsafe barber-removal prevention.

### Non-Functional Requirements

- **Security:** Only the intended invitee may accept or decline an invitation; only authorized owners may remove members.
- **Tenant Isolation:** Invitation and booking-dependency checks must remain organization-scoped.
- **Reliability:** Expiry state and actionability must be deterministic regardless of whether the request comes from a notification or another UI surface.
- **Contract Consistency:** Invitation payloads must use the same normalized semantics across list, detail, and action responses.
- **Operational Safety:** Removal rules must prevent loss of ownership context for active bookings.

---

## 7. Acceptance Criteria

### AC-01: Invitation Actions

- [ ] Dedicated accept and decline invitation actions are available for Step 2 flows.
- [ ] A valid invitee can accept an active invitation successfully.
- [ ] A valid invitee can decline an active invitation successfully.

### AC-02: Expiry Contract

- [ ] Invitation payloads include `expiresAt` and an expired-state indicator.
- [ ] Accepting an expired invitation returns an explicit error.
- [ ] Declining an expired invitation returns an explicit error.

### AC-03: Removal Safety

- [ ] Attempting to remove a barber with active `requested`, `waiting`, or `in_progress` bookings does not silently remove the member.
- [ ] The response clearly communicates that those bookings must be resolved or reassigned first.

### AC-04: Test Coverage

- [ ] Integration tests cover accept, decline, expired-action rejection, and removal safety behavior.

---

## 8. Out of Scope

- Invitation delivery-channel redesign.
- Advanced decline reasons or long-lived invitation renewal workflows.
- Automatic booking reassignment during member removal.
- Role and permission redesign outside current owner/barber semantics.