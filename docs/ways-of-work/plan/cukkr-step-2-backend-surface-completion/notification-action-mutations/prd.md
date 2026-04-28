# Feature PRD: Notification Action Mutations

**Version:** 1.0
**Date:** April 28, 2026
**Status:** Draft

---

## 1. Feature Name

**Notification Action Mutations**

Add action-aware notification payloads and dedicated notification-side mutations so invitation and appointment CTAs can be executed directly from the notifications surface.

---

## 2. Epic

- **Parent Epic:** [Cukkr Step 2 - Backend Surface Completion & Contract Consolidation](../epic.md)
- **Parent Step PRD:** [Cukkr Step 2 - Backend Surface Completion & Contract Consolidation](../../../../PRD_STEP2.md)
- **Parent Architecture:** Not yet authored for this epic.

---

## 3. Goal

### Problem

The notification screen can only become a real action surface if the backend provides enough target metadata and mutation entry points to perform contextual actions safely. Today, appointment-request and invitation actions are not fully operational through notification contracts, which forces the frontend to navigate elsewhere or infer target behavior indirectly. Without dedicated mutations and normalized metadata, notification CTA behavior will drift from the owning domain modules. Step 2 needs notification orchestration that is explicit but still aligned with booking and invitation business rules.

### Solution

Expose notification payload metadata including `referenceType`, `referenceId`, and action availability, and provide dedicated notification-driven action mutations for appointment requests and invitations. The notifications module should orchestrate the action, while the owning booking and invitation services remain the source of truth for validation and state changes. Generic mark-as-read behavior must continue to work alongside these action-specific mutations.

### Impact

- Enable actionable notification CTAs in the mobile app.
- Reduce navigation friction for owners and barbers.
- Keep notification contracts aligned with the domain services that own the business rules.
- Improve consistency between notification state and target-entity state.

---

## 4. User Personas

| Persona | Role | Relevance |
|---|---|---|
| **Barber** | `barber` | Accepts or declines invites and appointment requests from notifications. |
| **Barbershop Owner** | `owner` | Acts on appointment notifications and reviews notification state. |
| **Frontend Integrator** | Internal | Needs payload metadata and direct action endpoints for CTA rendering. |

---

## 5. User Stories

- **US-01:** As a **Barber or Owner**, I want notifications to include enough target metadata so that the UI can render contextual CTA buttons.
- **US-02:** As a **Barber or Owner**, I want to execute invitation actions from the notifications screen so that I do not need to open another flow first.
- **US-03:** As a **Barber or Owner**, I want to execute appointment-request actions from the notifications screen so that the request flow feels immediate.
- **US-04:** As a **Frontend Integrator**, I want generic mark-as-read to remain compatible with action-specific mutations so that notification state handling stays simple.

---

## 6. Requirements

### Functional Requirements

- Notification payloads must include `referenceType`, `referenceId`, and enough action metadata for the frontend to determine whether contextual CTAs should be shown.
- The notifications module must expose dedicated mutations for appointment-request actions initiated from notification context.
- The notifications module must expose dedicated mutations for invitation accept/decline actions initiated from notification context.
- Notification action mutations must delegate validation and state transition rules to the owning booking or invitation service layer.
- After a successful action, notification state and target-entity state must be updated consistently.
- Generic mark-as-read capabilities must remain available and must not conflict with action-specific mutations.
- Notification actions for unsupported target types must return explicit errors rather than silently no-op.
- Integration tests must cover invitation actions, appointment-request actions, and compatibility with mark-as-read behavior.

### Non-Functional Requirements

- **Security:** Notification actions require an authenticated session and must verify the notification belongs to the acting user.
- **Reliability:** Notification action outcomes must match the domain-service rules used by direct booking or invitation actions.
- **Contract Consistency:** Payload metadata must be normalized enough for stable CTA rendering across clients.
- **Maintainability:** Notifications should orchestrate actions, not reimplement booking or invitation business rules.
- **Tenant Isolation:** Notification and target-entity resolution must not leak cross-organization data.

---

## 7. Acceptance Criteria

### AC-01: Actionable Notification Payload

- [ ] Notification responses include `referenceType`, `referenceId`, and action metadata needed for CTA rendering.

### AC-02: Invitation Actions From Notifications

- [ ] Notification-driven invitation accept succeeds when the underlying invitation is valid.
- [ ] Notification-driven invitation decline succeeds when the underlying invitation is valid.

### AC-03: Appointment Actions From Notifications

- [ ] Notification-driven appointment-request actions succeed when the underlying booking transition is valid.
- [ ] Invalid notification actions return explicit errors.

### AC-04: Notification State Consistency

- [ ] After a successful action, notification status and the target entity are updated consistently.
- [ ] Generic mark-as-read remains available and works independently of action-specific mutations.

### AC-05: Test Coverage

- [ ] Integration tests cover invitation and appointment actions initiated from notifications.

---

## 8. Out of Scope

- New notification delivery channels.
- Rich notification templating beyond the metadata needed for CTA rendering.
- Bulk notification actions.
- Analytics on notification click-through or conversion.