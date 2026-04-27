# Feature PRD: In-App Notifications

**Version:** 1.0
**Date:** April 27, 2026
**Status:** Draft

---

## 1. Feature Name

**In-App Notifications — Real-Time Booking & Invitation Alerts**

---

## 2. Epic

- **Parent Epic:** [Cukkr — Barbershop Management & Booking System](../epic.md)

---

## 3. Goal

### Problem

When a customer self-books an appointment or a walk-in arrives via the public booking page, barbers and owners have no way to know about it in real time unless they are actively watching the schedule screen. Similarly, when a barber receives an invitation to join a barbershop, there is no structured mechanism to surface that invitation proactively. This creates missed or delayed responses that degrade both customer experience and operational efficiency.

### Solution

Implement an in-app notification system with a dedicated Notifications tab on the mobile app. The backend persists notification records per recipient and serves them via a REST API. Push notifications are delivered via Expo Push API (→ FCM on Android, APNs on iOS) to alert recipients even when the app is backgrounded. Inline Accept/Decline action buttons are surfaced directly on appointment and invitation notifications so recipients can act without navigating away.

### Impact

- Reduce response time to new appointment requests from "whenever noticed" to within seconds.
- Ensure barber invitations are surfaced immediately, reducing onboarding drop-off.
- Drive mobile app engagement by surfacing real-time activity in a dedicated tab with unread count badge.

---

## 4. User Personas

| Persona | Role | Need |
|---|---|---|
| **Barbershop Owner** | `owner` | Receive alerts for appointment requests and walk-in arrivals; act on them inline. |
| **Barber** | `barber` | Receive alerts for appointment requests, walk-in arrivals, and barbershop invitations; accept or decline inline. |

---

## 5. User Stories

1. As a **barber**, I want to receive a push notification when a customer requests an appointment so that I can respond promptly even when the app is in the background.
2. As a **barber/owner**, I want to see a list of all my notifications in the app so that I can review past and unread alerts.
3. As a **barber/owner**, I want to see an unread count badge on the Notifications tab so that I know at a glance how many notifications require my attention.
4. As a **barber**, I want to Accept or Decline an appointment request directly from the notification item so that I don't need to navigate to the schedule to act.
5. As a **barber**, I want to Accept or Decline a barbershop invitation directly from the notification item so that I can respond without switching screens.
6. As a **barber/owner**, I want to tap a notification so that I am navigated to the relevant booking or invitation detail.
7. As a **barber/owner**, I want notifications to be marked as read when I view or act on them so that the unread badge count stays accurate.
8. As a **barber/owner**, I want to receive a walk-in arrival notification when a customer checks in via the public booking page so that I am immediately aware of a new queue entry.

---

## 6. Requirements

### Functional Requirements

#### Notification Types

- The system supports three notification types:
  - `appointment_requested`: Triggered when a customer submits an appointment booking via the web.
  - `walk_in_arrival`: Triggered when a walk-in customer completes the PIN-verified check-in flow.
  - `barbershop_invitation`: Triggered when an owner invites a barber by email or phone.

#### Notification Record

- Each notification is persisted in a `notification` table with:
  - `id` (UUID)
  - `organizationId` (FK → organization)
  - `recipientUserId` (FK → user — the barber/owner receiving the notification)
  - `type` (`appointment_requested` | `walk_in_arrival` | `barbershop_invitation`)
  - `title` (string — short heading, e.g., "New Appointment Request")
  - `body` (string — detail text, e.g., "Budi wants a haircut at 14:00")
  - `referenceId` (nullable UUID — bookingId or invitationId for deep-link navigation)
  - `referenceType` (nullable string — `booking` | `invitation`)
  - `isRead` (boolean, default `false`)
  - `createdAt` (timestamp)

#### Delivery

- On creation, the backend sends a push notification via Expo Push API to all active Expo push tokens registered for the recipient user.
- If Expo push delivery fails (non-2xx from Expo API), the notification record is still persisted and the error is logged.
- Push token registration: `POST /api/notifications/register-token` accepts `{ token: string }` from the authenticated mobile client and stores it per user.
- Push token deregistration: tokens are removed on logout or when Expo returns `DeviceNotRegistered` in a receipt check.

#### API Endpoints

- `GET /api/notifications` — Returns paginated list of notifications for the authenticated user, newest first. Supports `?unreadOnly=true` filter.
- `PATCH /api/notifications/:id/read` — Marks a single notification as read.
- `PATCH /api/notifications/read-all` — Marks all notifications for the current user as read.
- `GET /api/notifications/unread-count` — Returns `{ count: number }` of unread notifications for the badge.
- `POST /api/notifications/register-token` — Registers an Expo push token for the current user.
- All endpoints require authentication; `organizationId` is enforced where applicable.

#### Inline Actions

- Notifications of type `appointment_requested` expose Accept and Decline action buttons in the mobile UI.
  - Accept maps to `PATCH /api/bookings/:id/status` with `{ status: "confirmed" }`.
  - Decline maps to `PATCH /api/bookings/:id/status` with `{ status: "canceled" }`.
- Notifications of type `barbershop_invitation` expose Accept and Decline action buttons.
  - Accept/Decline map to Better Auth invitation acceptance endpoints.
- After an inline action, the notification is automatically marked as read.

#### Notification Creation Triggers

- `appointment_requested`: Created by the booking service when a booking of `type = appointment` is submitted via the public web endpoint. Recipients = all `owner` and `barber` members of the organization.
- `walk_in_arrival`: Created when a walk-in booking is completed via the PIN-verified public endpoint. Recipients = all `owner` and `barber` members of the organization.
- `barbershop_invitation`: Created when an invitation is sent via `POST /api/barbers/invite`. Recipient = the invited user (if they have an account); otherwise delivered only as push if a token is known.

### Non-Functional Requirements

- Notification list must load within 1s (p95) for up to 100 records.
- Push notification delivery must not block the HTTP response — fire-and-forget with async error logging.
- Notifications are per-user, not per-organization; the `recipientUserId` field enforces this.
- No cross-user data access: users can only read and mutate their own notifications.
- Expo push tokens must be stored securely; never returned in API list responses.
- Pagination: default page size 20, maximum 100.
- Notification records are retained indefinitely (no TTL at MVP); archiving is out of scope.

---

## 7. Acceptance Criteria

### AC-1: Notification persisted on appointment request

- **Given** a customer submits an appointment booking via the public web endpoint  
- **When** the booking is created successfully  
- **Then** a `notification` record of type `appointment_requested` is created for each owner and barber in the organization.

### AC-2: Push notification sent

- **Given** a barber has a registered Expo push token  
- **When** a new `appointment_requested` notification is created for them  
- **Then** the Expo Push API is called with the correct token, title, and body.

### AC-3: Notification list returns correct data

- **Given** an authenticated barber has 5 notifications (3 unread, 2 read)  
- **When** they call `GET /api/notifications`  
- **Then** all 5 notifications are returned, newest first, with `isRead` reflecting the correct state.

### AC-4: Unread-only filter

- **Given** the same 5 notifications (3 unread)  
- **When** `GET /api/notifications?unreadOnly=true` is called  
- **Then** only the 3 unread notifications are returned.

### AC-5: Unread count badge

- **Given** a barber has 3 unread notifications  
- **When** `GET /api/notifications/unread-count` is called  
- **Then** the response is `{ count: 3 }`.

### AC-6: Mark single notification as read

- **Given** a barber has an unread notification with `id = X`  
- **When** `PATCH /api/notifications/X/read` is called  
- **Then** the notification's `isRead` becomes `true` and the unread count decreases by 1.

### AC-7: Mark all as read

- **Given** a barber has 5 unread notifications  
- **When** `PATCH /api/notifications/read-all` is called  
- **Then** all 5 notifications are marked as read and the unread count returns 0.

### AC-8: Cross-user isolation

- **Given** barber A and barber B each have notifications  
- **When** barber A calls `PATCH /api/notifications/:id/read` on barber B's notification  
- **Then** the API returns `404 Not Found`.

### AC-9: Push failure does not break booking flow

- **Given** the Expo Push API returns a 500 error  
- **When** an appointment booking is created  
- **Then** the booking is saved successfully and the error is logged; the API response to the client is not affected.

### AC-10: Walk-in arrival notification

- **Given** a walk-in customer completes the PIN check-in flow  
- **When** the booking is created  
- **Then** a `walk_in_arrival` notification is created for all organization members.

### AC-11: Invitation notification

- **Given** an owner invites a new barber  
- **When** the invitation is created  
- **Then** a `barbershop_invitation` notification is created for the invited user (if they have an account).

### AC-12: Token registration

- **Given** a barber authenticates and registers their Expo push token via `POST /api/notifications/register-token`  
- **When** the request is processed  
- **Then** the token is saved and the barber receives push notifications on subsequent events.

---

## 8. Out of Scope

- Real-time WebSocket or SSE push to the mobile app (polling or app-open refresh only for MVP).
- Email or SMS notification delivery.
- Notification preferences / mute settings.
- Notification grouping or threading.
- Customer-facing notifications (customers are not app users at MVP).
- Booking reminder notifications (Phase 2.1).
- Broadcast messaging notifications (Phase 2).
- Read receipts beyond `isRead` boolean (e.g., delivered-at timestamp).
- Archiving or deleting individual notifications by the user.
- Admin notification management dashboard.
