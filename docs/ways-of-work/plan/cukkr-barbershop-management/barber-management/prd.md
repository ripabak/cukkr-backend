# Feature PRD: Barber Management

**Version:** 1.0
**Date:** April 27, 2026
**Status:** Draft

---

## 1. Feature Name

**Barber Management** — Invite, view, and remove barbers within a barbershop organization.

---

## 2. Epic

- **Parent Epic:** [Cukkr — Barbershop Management & Booking System](../epic.md)

---

## 3. Goal

### Problem

Barbershop owners need a structured way to manage their staff (barbers) inside the digital platform. Currently, adding or removing staff is done verbally or via informal channels, with no access control or audit trail. There is no mechanism to onboard a barber digitally, notify them of their invitation, or revoke access when they leave the shop. This creates security and operational risks, especially for multi-location owners.

### Solution

Provide the owner with a Barber Management screen in the mobile app where they can invite barbers by email or phone, view the current team with status badges, and remove barbers with a confirmation step. Invited barbers receive in-app and push notifications and can accept or decline. Invitations expire automatically after 7 days, keeping the team list clean without manual intervention.

### Impact

- Eliminate informal staff onboarding; reduce time to add a new barber to < 2 minutes.
- Ensure only authorized barbers can access the organization's booking data.
- Reduce risk of "ghost" barbers (ex-employees with lingering access) via streamlined removal.
- Support multi-location owners by scoping all barber membership to a specific organization.

---

## 4. User Personas

| Persona | Role | Relevance |
|---|---|---|
| **Barbershop Owner** | `owner` | Invites, views, and removes barbers within their organization. |
| **Barber (Invitee)** | `barber` | Receives invitation, accepts or declines, and becomes an active member. |

---

## 5. User Stories

### Owner Stories

- **US-01:** As a **Barbershop Owner**, I want to invite a barber by email or phone so that they can join my barbershop and start handling bookings.
- **US-02:** As a **Barbershop Owner**, I want to see a list of all my barbers with their status (`Active` / `Pending`) so that I know who has joined and who still hasn't accepted.
- **US-03:** As a **Barbershop Owner**, I want to remove a barber with a confirmation step so that I can revoke access without accidentally deleting the wrong person.
- **US-04:** As a **Barbershop Owner**, I want pending invitations to expire after 7 days so that my barber list doesn't accumulate stale entries.

### Barber Stories

- **US-05:** As a **Barber**, I want to receive an in-app and push notification when I'm invited to a barbershop so that I can promptly accept or decline.
- **US-06:** As a **Barber**, I want to accept or decline a barbershop invitation from the notification screen so that I can control which organizations I'm a member of.
- **US-07:** As a **Barber**, I want to be a member of multiple barbershop organizations so that I can work across different locations.

### Edge Cases

- **US-08:** As a **Barbershop Owner**, I want to see an error if I try to invite an email/phone that is already an active member, so that I don't send duplicate invitations.
- **US-09:** As a **Barbershop Owner**, I want to see a warning when removing a barber who has active/in-progress bookings so that I understand the operational impact.

---

## 6. Requirements

### 6.1 Functional Requirements

#### Invitation

- Owner can invite a barber by **email** or **phone number** from the Barbers screen.
- System sends an in-app notification (and push notification via Expo Push API) to the invitee.
- Invitations are stored in the `invitation` table (managed by Better Auth Organizations plugin).
- Invitations expire **7 days** after creation; expired invitations are shown with a `Expired` status and excluded from active counts.
- If the invitee is not yet a registered user, the system stores the invitation and delivers the notification when they sign up (or via email/SMS link if supported).
- Prevent duplicate active invitations: if an active/pending invitation already exists for the same email/phone in the same organization, return a `409 Conflict` error.
- If the invitee is already an active `member` of the organization, return a `409 Conflict` error.

#### Barber List

- Display all current members (`status = active`) and pending invitations (`status = pending`) in a single list.
- Each list item shows: **avatar**, **name**, **email/phone**, **status badge** (`Active` / `Pending`).
- List is scoped to the active organization (`activeOrganizationId`).
- List sorted by: active members first (alphabetical by name), then pending invitations (most recent first).

#### Remove Barber

- Owner can remove an active barber via a confirmation modal ("Are you sure you want to remove [Name]?").
- Upon confirmation, the member record is deleted from the organization (via Better Auth `removeMember`).
- Removing a barber does **not** delete historical booking data — bookings retain the barber reference.
- If the barber has bookings with `status = in_progress` at removal time, show an additional warning in the confirmation modal.

#### Cancel Invitation

- Owner can cancel a **pending** invitation before it is accepted.
- Cancelled invitations are removed from the list immediately.

#### Notifications (Barber Side)

- Notification type: `barbershop_invitation` with inline **Accept** and **Decline** action buttons.
- Accepting sets `member.status = active` and dismisses the notification.
- Declining deletes the invitation record and dismisses the notification.
- Unread notification count badge is updated in real time.

### 6.2 Non-Functional Requirements

- **Security:** All barber management endpoints require authentication and `requireOrganization: true`. Only `owner` role members may invite or remove barbers.
- **Multi-Tenancy:** Barber list and invitations are strictly scoped to `activeOrganizationId`. No cross-organization data leakage.
- **Performance:** Barber list load ≤ 500ms (p95) for up to 100 members.
- **Validation:** Email format and phone format validated server-side via TypeBox schema.
- **Invitation Expiry:** A background job or lazy-evaluation check marks invitations as expired after 7 days — expired entries are not returned in active invitation counts.
- **Push Notifications:** Delivered via Expo Push API → FCM (Android) / APNs (iOS) with a fallback log if delivery fails.

---

## 7. Acceptance Criteria

### AC-US-01: Invite Barber

- [ ] `POST /api/barbers/invite` with a valid `{ email }` or `{ phone }` returns `201 Created` and creates an invitation record.
- [ ] The invitee receives an in-app notification of type `barbershop_invitation` with Accept/Decline actions.
- [ ] A push notification is sent to the invitee's registered device token.
- [ ] If the email/phone is already an active member, the endpoint returns `409 Conflict`.
- [ ] If an active pending invitation already exists for the same email/phone, the endpoint returns `409 Conflict`.

### AC-US-02: View Barber List

- [ ] `GET /api/barbers` returns a list of all active members and pending invitations for the active organization.
- [ ] Response includes `id`, `name`, `avatarUrl`, `email`, `phone`, `status` (`active` | `pending`), `createdAt` for each entry.
- [ ] Barbers from other organizations are not included in the response.
- [ ] Expired invitations (`createdAt + 7 days < now`) are excluded from the active pending list.

### AC-US-03: Remove Barber

- [ ] `DELETE /api/barbers/:memberId` removes the member from the organization and returns `200 OK`.
- [ ] Historical bookings associated with the removed barber remain intact.
- [ ] If `memberId` belongs to a different organization, the endpoint returns `404 Not Found`.
- [ ] Only users with `owner` role can call this endpoint; others receive `403 Forbidden`.

### AC-US-04: Cancel Invitation

- [ ] `DELETE /api/barbers/invite/:invitationId` cancels a pending invitation and returns `200 OK`.
- [ ] The cancelled invitation no longer appears in `GET /api/barbers`.
- [ ] Attempting to cancel an already-accepted or expired invitation returns `404 Not Found`.

### AC-US-05 / US-06: Barber Accepts or Declines Invitation

- [ ] `POST /api/notifications/:id/accept` for an invitation notification sets `member.status = active`.
- [ ] `POST /api/notifications/:id/decline` deletes the invitation record.
- [ ] After accepting, the barber can switch to the new organization and view its bookings.
- [ ] After declining, the notification is dismissed and the invitation no longer appears in any list.

### AC-US-08: Duplicate Invitation

- [ ] Inviting an already-active member returns `409 Conflict` with a clear error message.
- [ ] Inviting with an email/phone that already has a pending invitation returns `409 Conflict`.

---

## 8. Out of Scope

- **Barber role-level permissions** beyond `owner` / `barber` distinction (e.g., senior barber, manager) — Phase 2.
- **Barber schedule/availability configuration** — covered in the Open Hours feature.
- **Per-barber performance analytics** — Phase 2.1.
- **Bulk invite** (inviting multiple barbers at once from a CSV) — Phase 2.
- **Automatic WhatsApp / SMS invitation delivery** — manual WhatsApp shortcut only for MVP.
- **Barber profile editing by owner** — barbers manage their own profile via User Profile feature.
- **Invitee not yet on Cukkr** email/SMS deep-link onboarding — Phase 2.
