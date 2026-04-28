# Issues Creation Checklist: Notifications — In-App Alerts & Push Delivery

**Version:** 1.0  
**Date:** April 27, 2026  
**Status:** Pending  
**Project Plan:** [project-plan.md](./project-plan.md)

Track each GitHub issue as it is created. Replace `#???` placeholders with the actual issue numbers assigned by GitHub, then backfill cross-references in the project plan.

---

## Pre-Creation Preparation

- [ ] Feature artifacts complete (`prd.md`, `implementation-plan.md`, `project-plan.md`)
- [ ] Parent epic issue exists in GitHub with milestone assigned
- [ ] GitHub project board configured with columns: Backlog, Sprint Ready, In Progress, In Review, Testing, Done
- [ ] Custom fields configured: Priority, Value, Component, Estimate, Sprint, Assignee, Epic
- [ ] Team aligned on MVP constraint: push delivery is best-effort and receipt polling is deferred

---

## Parent Epic Reference

- [ ] Parent epic issue verified for `Cukkr — Barbershop Management & Booking System`
- [ ] Epic labels applied: `epic`, `priority-high`, `value-high`
- [ ] Epic added to the project board
- [ ] Notifications feature will be linked back to the epic issue once created

---

## Issue Creation Order

Create issues in this order so dependencies can be linked immediately as the issue numbers are assigned.

| Order | ID | Title | Labels | Priority | Estimate | Blocked By | Issue # |
|---|---|---|---|---|---|---|---|
| 1 | F | In-App Notifications Feature | `feature`, `priority-high`, `value-high`, `backend` | P1 | L | — | #??? |
| 2 | E1 | Notification Schema + Migration | `enabler`, `priority-high`, `value-medium`, `backend`, `database` | P1 | 2 pts | — | #??? |
| 3 | E2 | Notification Model Definitions | `enabler`, `priority-high`, `value-medium`, `backend` | P1 | 2 pts | — | #??? |
| 4 | E3 | Notification Service Core Workflows | `enabler`, `priority-critical`, `value-high`, `backend` | P0 | 5 pts | E1, E2 | #??? |
| 5 | E4 | Expo Push Client + Token Lifecycle | `enabler`, `priority-high`, `value-medium`, `backend`, `infrastructure` | P1 | 3 pts | E1 | #??? |
| 6 | E5 | Notifications Handler + App Registration | `enabler`, `priority-critical`, `value-high`, `backend` | P0 | 2 pts | E2, E3, E4 | #??? |
| 7 | S1 | View Notification Inbox + Unread Count | `user-story`, `priority-high`, `value-high`, `backend` | P1 | 2 pts | E5 | #??? |
| 8 | S2 | Mark Notifications Read With Ownership Checks | `user-story`, `priority-high`, `value-high`, `backend` | P1 | 2 pts | E5 | #??? |
| 9 | S3 | Register Expo Push Token | `user-story`, `priority-high`, `value-high`, `backend` | P1 | 1 pt | E4, E5 | #??? |
| 10 | S4 | Receive Appointment and Walk-In Notifications | `user-story`, `priority-high`, `value-high`, `backend` | P1 | 3 pts | E3, E4, E5 | #??? |
| 11 | S5 | Receive Barbershop Invitation Notifications | `user-story`, `priority-high`, `value-high`, `backend` | P1 | 2 pts | E3, E4, E5 | #??? |
| 12 | T1 | Notifications API Integration Tests | `test`, `priority-high`, `value-high`, `backend` | P1 | 3 pts | E5 | #??? |
| 13 | T2 | Booking and Invitation Trigger Regression Tests | `test`, `priority-high`, `value-high`, `backend` | P1 | 2 pts | S4, S5 | #??? |

**Total:** 29 story points

---

## Suggested Sprint Allocation

### Sprint 1

- [ ] E1 — Notification Schema + Migration
- [ ] E2 — Notification Model Definitions
- [ ] E3 — Notification Service Core Workflows
- [ ] E4 — Expo Push Client + Token Lifecycle
- [ ] E5 — Notifications Handler + App Registration

### Sprint 2

- [ ] S1 — View Notification Inbox + Unread Count
- [ ] S2 — Mark Notifications Read With Ownership Checks
- [ ] S3 — Register Expo Push Token
- [ ] S4 — Receive Appointment and Walk-In Notifications
- [ ] S5 — Receive Barbershop Invitation Notifications
- [ ] T1 — Notifications API Integration Tests
- [ ] T2 — Booking and Invitation Trigger Regression Tests

---

## Feature Level

- [ ] **Feature issue created** — `#F` (In-App Notifications)
  - [ ] Description matches the feature template in `project-plan.md`
  - [ ] Linked to the parent epic in the `Epic` field
  - [ ] All enabler, story, and test references added after issue creation
  - [ ] Acceptance criteria checklist copied in full
  - [ ] Estimate set to `L (29 story points)`
  - [ ] Added to the project board Backlog column

---

## Enabler Level

- [ ] **E1 — Notification Schema + Migration** — `#???`
  - [ ] Includes both `notification` and `notification_push_token` tables
  - [ ] Index requirements copied from the implementation plan
  - [ ] Migration command included: `bunx drizzle-kit generate --name add-notifications-module`
  - [ ] `drizzle/schemas.ts` export step listed
  - [ ] Estimate set to `2 pts`
  - [ ] Added to Sprint 1

- [ ] **E2 — Notification Model Definitions** — `#???`
  - [ ] Enum coverage includes all three notification types
  - [ ] Query DTO covers `page`, `pageSize`, and `unreadOnly`
  - [ ] Response DTOs cover list, unread count, read mutations, and token registration
  - [ ] Estimate set to `2 pts`
  - [ ] Added to Sprint 1

- [ ] **E3 — Notification Service Core Workflows** — `#???`
  - [ ] Blocked-by field references E1 and E2
  - [ ] List, unread count, mark-read, mark-all-read, and batch create methods all listed
  - [ ] Ownership boundary explicitly stated as `recipientUserId = session.user.id`
  - [ ] Invitation-read visibility note included
  - [ ] Estimate set to `5 pts`
  - [ ] Added to Sprint 1

- [ ] **E4 — Expo Push Client + Token Lifecycle** — `#???`
  - [ ] Blocked-by field references E1
  - [ ] Includes token validation, chunking, normalized Expo responses, and invalidation rules
  - [ ] Notes that push failures are swallowed after logging
  - [ ] Estimate set to `3 pts`
  - [ ] Added to Sprint 1

- [ ] **E5 — Notifications Handler + App Registration** — `#???`
  - [ ] Blocked-by field references E2, E3, and E4
  - [ ] All five endpoints are listed
  - [ ] `requireAuth: true` noted for all routes
  - [ ] Explicitly states `requireOrganization: true` is not used for this module
  - [ ] Estimate set to `2 pts`
  - [ ] Added to Sprint 1

---

## Story Level

- [ ] **S1 — View Notification Inbox + Unread Count** — `#???`
  - [ ] Story statement follows As/I want/so that format
  - [ ] Includes pagination, unread-only filter, and unread count expectations
  - [ ] Mentions retained `organizationId` context in list items
  - [ ] Testing requirement references T1
  - [ ] Estimate set to `2 pts`
  - [ ] Added to Sprint 2

- [ ] **S2 — Mark Notifications Read With Ownership Checks** — `#???`
  - [ ] Story statement follows As/I want/so that format
  - [ ] Includes both single-read and read-all behavior
  - [ ] Cross-user 404 acceptance criterion included
  - [ ] Testing requirement references T1
  - [ ] Estimate set to `2 pts`
  - [ ] Added to Sprint 2

- [ ] **S3 — Register Expo Push Token** — `#???`
  - [ ] Story statement follows As/I want/so that format
  - [ ] Token reassignment and reactivation behavior included
  - [ ] Success response `{ tokenRegistered: true }` included
  - [ ] Testing requirement references T1
  - [ ] Estimate set to `1 pt`
  - [ ] Added to Sprint 2

- [ ] **S4 — Receive Appointment and Walk-In Notifications** — `#???`
  - [ ] Story statement follows As/I want/so that format
  - [ ] Covers both appointment-requested and walk-in-arrival triggers
  - [ ] Recipient fan-out to owners and barbers is specified
  - [ ] Push failure isolation is included in acceptance criteria
  - [ ] Testing requirement references T2
  - [ ] Estimate set to `3 pts`
  - [ ] Added to Sprint 2

- [ ] **S5 — Receive Barbershop Invitation Notifications** — `#???`
  - [ ] Story statement follows As/I want/so that format
  - [ ] Existing-user creation path included
  - [ ] Unknown-user no-op behavior included
  - [ ] Pre-membership readability expectation included
  - [ ] Testing requirement references T2
  - [ ] Estimate set to `2 pts`
  - [ ] Added to Sprint 2

---

## Test Level

- [ ] **T1 — Notifications API Integration Tests** — `#???`
  - [ ] `tests/modules/notifications.test.ts` is the target file
  - [ ] Covers list, unread filter, unread count, read mutations, token registration, and 401 paths
  - [ ] Includes ownership-isolation setup using at least two authenticated users
  - [ ] Covers token reassignment behavior
  - [ ] Estimate set to `3 pts`
  - [ ] Added to Sprint 2

- [ ] **T2 — Booking and Invitation Trigger Regression Tests** — `#???`
  - [ ] Extends `tests/modules/bookings.test.ts` and `tests/modules/barbers.test.ts`
  - [ ] Covers appointment, walk-in, existing-user invitation, and unknown-user invitation flows
  - [ ] Includes deterministic push failure stubbing
  - [ ] Confirms upstream booking and invitation success responses remain unchanged
  - [ ] Estimate set to `2 pts`
  - [ ] Added to Sprint 2

---

## GitHub Project Board Setup

- [ ] Column structure verified: Backlog, Sprint Ready, In Progress, In Review, Testing, Done
- [ ] Custom field `Priority` configured with values `P0`, `P1`, `P2`, `P3`
- [ ] Custom field `Value` configured with values `High`, `Medium`, `Low`
- [ ] Custom field `Component` includes `Schema`, `Service`, `Handler`, `Infrastructure`, `Testing`
- [ ] Automation or workflow conventions agreed for moving PR-linked items into `In Review`

---

## Post-Creation Validation

- [ ] All `#???` placeholders replaced with real GitHub issue numbers
- [ ] All cross-references in `project-plan.md` updated with real issue numbers if desired
- [ ] Dependency links set in GitHub for E3, E4, E5, S1, S2, S3, S4, S5, T1, and T2
- [ ] Feature issue updated to include all created issue numbers
- [ ] All issues visible on the GitHub project board in the correct starting column
- [ ] Sprint 1 issues moved to `Sprint Ready` when team commits capacity
- [ ] Sprint 2 issues remain in `Backlog` until Sprint 1 critical path is complete

---

## Implementation Status Tracking

Update this table as work progresses.

| ID | Issue # | Status | PR | Notes |
|---|---|---|---|---|
| F | #??? | planned | — | Feature container for notifications scope |
| E1 | #??? | implemented | — | Added notification schemas and export, generated `drizzle/20260427170541_add-notifications-module.sql`, and passed `bunx drizzle-kit generate --name add-notifications-module && bunx drizzle-kit check` |
| E2 | #??? | implemented | — | Added TypeBox enums, list query DTO, and response contracts in `src/modules/notifications/model.ts` |
| E3 | #??? | implemented | — | Added notification service methods for list, unread count, mark-read, mark-all-read, batch create, and org recipient lookup in `src/modules/notifications/service.ts` |
| E4 | #??? | implemented | — | Added Expo push wrapper in `src/lib/push.ts` and token validation, upsert, async dispatch, and invalidation handling in `src/modules/notifications/service.ts` |
| E5 | #??? | implemented | — | Added authenticated notifications routes in `src/modules/notifications/handler.ts` and registered the module in `src/app.ts` |
| S1 | #??? | implemented | — | Added inbox list and unread-count API behavior through the notifications service and handler |
| S2 | #??? | implemented | — | Added single-read and read-all ownership-scoped notification mutations |
| S3 | #??? | implemented | — | Added Expo push token registration, reassignment, and reactivation behavior |
| S4 | #??? | implemented | — | Integrated appointment and walk-in notification creation into booking success flows |
| S5 | #??? | implemented | — | Integrated existing-user barber invitation notification creation with unknown-user no-op behavior |
| T1 | #??? | implemented | — | Added `tests/modules/notifications.test.ts` covering list, unread filter, unread count, read mutations, token registration, and ownership isolation |
| T2 | #??? | implemented | — | Extended booking and barber suites for notification trigger regressions and deterministic push failure stubbing |
