# Feature PRD: Schedule & Booking Management

**Version:** 1.0
**Date:** April 27, 2026
**Status:** Draft

---

## 1. Feature Name

**Schedule & Booking Management** — Mobile interface for barbers and owners to view, create, and manage the full booking lifecycle for both walk-in and appointment customers.

---

## 2. Epic

- **Parent Epic:** [Cukkr — Barbershop Management & Booking System](../epic.md)

---

## 3. Goal

### Problem

Without a structured digital system, barbers coordinate their daily queue verbally or with paper lists, leading to double bookings, forgotten appointments, and no visibility into how busy the day will be. Customers who book in advance have no guarantee their slot is reserved, and barbers can't efficiently track which bookings are waiting, in progress, or completed. There is also no standardized reference number system to identify a booking across the shop.

### Solution

Provide a **Schedule screen** in the mobile app with a weekly strip day picker and a daily booking list. Barbers and owners can view all bookings for any day, filter by status, and take contextual actions (Accept, Decline, Handle This, Mark as Waiting, Complete, Cancel) that move bookings through a defined status lifecycle. Walk-in and appointment bookings are created directly from this screen. A swipe-to-complete gesture with a confirmation modal wraps up a service session. Each booking is assigned a unique, human-readable reference number (`BK-{YYYYMMDD}-{DailySeq}-{Checksum}`).

### Impact

- Eliminate double-bookings and verbal scheduling errors.
- Reduce barber context-switching by providing a single screen for the full daily workflow.
- Give owners real-time visibility into shop activity without being physically present.
- Create a structured audit trail (booking reference numbers) for dispute resolution and analytics.
- Enable customers to trust that their appointment slot is genuinely reserved.

---

## 4. User Personas

| Persona | Role | Relevance |
|---|---|---|
| **Barbershop Owner** | `owner` | Views and manages all bookings across all barbers in the organization. |
| **Barber** | `barber` | Views their own daily schedule, handles walk-ins, accepts/declines appointments. |
| **Appointment Customer** | `customer` | Self-books via the web; booking appears in the barber's schedule. |
| **Walk-In Customer** | `customer` | Physically present; booking created by barber (or via PIN flow on web). |

---

## 5. User Stories

### Schedule View

- **US-01:** As a **Barber / Owner**, I want to see a weekly strip with day selectors so that I can quickly jump between days to review the schedule.
- **US-02:** As a **Barber / Owner**, I want to open a full calendar modal so that I can navigate to any date beyond the current week.
- **US-03:** As a **Barber / Owner**, I want to filter the booking list by status (All, Waiting, In Progress, Completed, Canceled) so that I can focus on relevant bookings.

### Walk-In Booking Creation

- **US-04:** As a **Barber / Owner**, I want to create a walk-in booking from the schedule screen by entering the customer's name, optional contact, selecting a service, and optionally assigning a barber so that the customer is added to the queue immediately.
- **US-05:** As a **Barber / Owner**, I want the new walk-in booking to appear instantly in the Waiting list so that I can see the updated queue without refreshing.

### Appointment Booking Creation

- **US-06:** As a **Barber / Owner**, I want to create an appointment booking for a customer by entering their name, contact, selecting services, a preferred barber, a date/time, and optional notes so that I can register a future booking on behalf of the customer.
- **US-07:** As an **Appointment Customer**, I want to self-book via the web by selecting services, barber, date, and time so that I can secure a slot in advance without calling the shop.

### Booking Lifecycle Management

- **US-08:** As a **Barber / Owner**, I want to tap "Accept" on a waiting appointment booking so that the customer knows their slot is confirmed.
- **US-09:** As a **Barber / Owner**, I want to tap "Decline" with an optional reason so that the customer is notified their booking was not accepted.
- **US-10:** As a **Barber / Owner**, I want to tap "Handle This" on a waiting/accepted booking so that the booking transitions to `In Progress` and I know which customer I'm currently serving.
- **US-11:** As a **Barber / Owner**, I want to swipe-to-complete on an in-progress booking so that a confirmation modal shows the service list and prices before I finalize the session.
- **US-12:** As a **Barber / Owner**, I want to tap "Cancel" on a booking with a confirmation prompt so that I can remove erroneously created or no-show bookings.
- **US-13:** As a **Barber / Owner**, I want to tap "Mark as Waiting" to revert an in-progress booking back to waiting so that I can handle interruptions or reassignments.

### Booking Reference

- **US-14:** As a **Barber / Owner**, I want every booking to have a unique reference number in the format `BK-{YYYYMMDD}-{DailySeq}-{Checksum}` so that I can quickly identify and communicate about a booking.

### Edge Cases

- **US-15:** As a **Barber**, I want to be prevented from having more than one `In Progress` booking at a time so that I focus on one customer.
- **US-16:** As a **Barber / Owner**, I want to see a booking's full detail (services, price, notes, customer info, reference number) on a detail screen so that I have complete context before or during a session.

---

## 6. Requirements

### 6.1 Functional Requirements

#### Schedule Screen

- Weekly horizontal strip with one day selector button per day (Mon–Sun); selected day is highlighted.
- "Today" button snaps back to the current day.
- Calendar modal (full month view) accessible from the strip header for navigation beyond the current week.
- Booking list displays all bookings for the selected day, sorted by creation time (ascending).
- Status filter tabs: **All**, **Waiting**, **In Progress**, **Completed**, **Canceled**.
- Empty state illustration shown when no bookings match the active filter.
- Real-time updates: new walk-in bookings from the web PIN flow appear without requiring a manual refresh (polling every 30 seconds or WebSocket — TBD).

#### Booking Card

Each booking card displays:
- Customer name and reference number.
- Service(s) name and total duration.
- Booking type badge (`Walk-In` | `Appointment`).
- Status badge (`Waiting` | `In Progress` | `Completed` | `Canceled`).
- Contextual action button(s) based on current status (see Status Lifecycle below).

#### Status Lifecycle & Actions

| Current Status | Available Actions | Next Status |
|---|---|---|
| `waiting` (appointment) | Accept → `waiting` (confirmed), Decline → `canceled` | — |
| `waiting` (confirmed / walk-in) | Handle This → `in_progress`, Cancel → `canceled` | — |
| `in_progress` | Swipe-to-Complete → `completed`, Mark as Waiting → `waiting`, Cancel → `canceled` | — |
| `completed` | (read-only) | — |
| `canceled` | (read-only) | — |

- `PATCH /api/bookings/:id/status` with `{ status: "..." }` drives all transitions.
- Server validates that the transition is legal; illegal transitions return `400 Bad Request`.
- Only one booking per barber may be `in_progress` at a time; attempting a second returns `409 Conflict`.

#### Create Walk-In Booking

- Form fields: **Customer Name** (required, max 100 chars), **Phone** (optional), **Service** (required, single select from active services), **Preferred Barber** (optional, defaults to current user).
- Submitted as `POST /api/bookings` with `{ type: "walk_in", status: "waiting", ... }`.
- On success, booking appears at the top of the Waiting list for the current day.

#### Create Appointment Booking (Mobile / Staff Side)

- Form fields: **Customer Name** (required), **Phone / Email** (optional), **Service(s)** (required, multi-select), **Preferred Barber** (optional), **Date** (date picker, constrained to open days), **Time** (time picker, constrained to open hours), **Notes** (optional, max 500 chars).
- Submitted as `POST /api/bookings` with `{ type: "appointment", status: "waiting", ... }`.

#### Swipe-to-Complete Flow

1. Barber swipes the booking card right (or taps "Complete" button).
2. Confirmation modal shows: customer name, service list with individual prices, subtotal, and final total after discount.
3. "Confirm & Complete" button finalizes the booking (`status = completed`); "Cancel" dismisses modal.

#### Booking Reference Number

- Format: `BK-{YYYYMMDD}-{DailySeq}-{Checksum}`.
  - `YYYYMMDD`: UTC date of booking creation.
  - `DailySeq`: 3-digit zero-padded sequential counter per organization per day (resets to `001` each day).
  - `Checksum`: 2-character random alphanumeric string.
- Generated server-side at booking creation; never editable.
- Displayed on booking cards and booking detail screens.

#### Booking Detail Screen

- Full read-only detail view: reference number, type, status, customer info, assigned barber, service(s) with prices, notes, timestamps (created, started, completed).
- "Copy Reference" shortcut.
- Action buttons mirrored from the card (same lifecycle logic).

#### Multi-Service Bookings

- Up to **N** services selectable per appointment booking (limit TBD — see Open Questions).
- Total duration = sum of all selected services' durations.
- Total price = sum of all selected services' prices after individual discounts.

### 6.2 Non-Functional Requirements

- **Performance:** Booking list for a single day loads in ≤ 1.5s (p95); status transitions complete in ≤ 500ms (p95).
- **Security:**
  - All booking endpoints require authentication and `requireOrganization: true`.
  - Barbers can only transition bookings belonging to their organization.
  - Cross-organization booking access returns `404 Not Found`.
- **Multi-Tenancy:** All booking records include `organizationId`; queries always filter by active organization.
- **Concurrency:** Status transition endpoint uses DB-level row locking or optimistic concurrency to prevent race conditions (e.g., two barbers both accepting the same booking).
- **Validation:** All inputs validated via TypeBox schema; invalid status transitions rejected with descriptive error messages.
- **Real-Time Updates:** Walk-in bookings created via the public PIN flow must appear on the mobile schedule within ≤ 30 seconds (polling-based acceptable for MVP).
- **Reference Uniqueness:** Daily sequence counter is atomic (DB sequence or transaction-safe increment) to guarantee uniqueness within the day.

---

## 7. Acceptance Criteria

### AC-US-01/02/03: Schedule View

- [ ] The schedule screen shows a 7-day strip centered on today; tapping a day loads that day's bookings.
- [ ] A calendar modal opens on tapping the month/year header and allows navigating to any date.
- [ ] "Today" button snaps the strip to the current day.
- [ ] Status filter tabs correctly filter the booking list; "All" tab shows all statuses.
- [ ] Empty state is shown when no bookings exist for the selected day + filter.

### AC-US-04/05: Create Walk-In Booking

- [ ] `POST /api/bookings` with `type = walk_in` returns `201 Created` with the new booking including reference number.
- [ ] The booking appears in the `waiting` list for the correct day.
- [ ] Missing required fields (`customerName`, `serviceId`) return `422 Unprocessable Entity`.

### AC-US-06: Create Appointment Booking (Staff)

- [ ] `POST /api/bookings` with `type = appointment` returns `201 Created`.
- [ ] Booking date/time outside open hours returns `400 Bad Request`.
- [ ] Multi-service selection stores all selected services in `booking_service` table.

### AC-US-08/09: Accept / Decline Appointment

- [ ] `PATCH /api/bookings/:id/status` with `{ status: "accepted" }` returns `200 OK` and updates booking status.
- [ ] `PATCH /api/bookings/:id/status` with `{ status: "canceled" }` returns `200 OK` and records cancellation.
- [ ] Customer receives an in-app notification for Accept/Decline outcome.

### AC-US-10: Handle This (In Progress)

- [ ] `PATCH /api/bookings/:id/status` with `{ status: "in_progress" }` returns `200 OK`.
- [ ] If the barber already has another `in_progress` booking, returns `409 Conflict`.

### AC-US-11: Swipe-to-Complete

- [ ] Swipe gesture triggers confirmation modal with itemized service prices and total.
- [ ] Confirming calls `PATCH /api/bookings/:id/status` with `{ status: "completed" }` and returns `200 OK`.
- [ ] Completed bookings move to the "Completed" filter tab and are read-only.

### AC-US-12: Cancel Booking

- [ ] `PATCH /api/bookings/:id/status` with `{ status: "canceled" }` returns `200 OK` with optional `cancelReason`.
- [ ] Cancellation is rejected for already-`completed` bookings (`400 Bad Request`).

### AC-US-14: Booking Reference

- [ ] Every booking in `POST /api/bookings` response includes `referenceNumber` matching the format `BK-{YYYYMMDD}-{3DigitSeq}-{2CharChecksum}`.
- [ ] Two bookings created on the same day for the same organization have different `DailySeq` values.
- [ ] Two bookings created on different days reset the daily sequence (e.g., `001` on each new day).

### AC-US-15: Single In-Progress Constraint

- [ ] A barber with an active `in_progress` booking receives `409 Conflict` when attempting to start another.

### AC-US-16: Booking Detail

- [ ] `GET /api/bookings/:id` returns full booking detail including services, prices, notes, timestamps.
- [ ] Cross-organization booking ID returns `404 Not Found`.

---

## 8. Out of Scope

- **Customer-facing appointment cancellation** from the web app — Phase 2 (customers contact the shop directly for MVP).
- **Automated booking reminders** (push/email) sent to customers — Phase 2.1.
- **Real-time WebSocket** for live booking updates — polling acceptable for MVP; WebSocket upgrade in Phase 2.
- **Per-barber schedule isolation** (a barber seeing only their own bookings by default) — all barbers see the full organization schedule for MVP.
- **Recurring bookings / subscriptions** — Phase 3.
- **Booking payment collection** — cash only; no payment gateway for MVP.
- **Customer-initiated booking modifications** after submission — Phase 2.
- **Reviews and ratings** post-completion — Phase 2.
- **Maximum services per booking enforcement** — limit TBD (see Open Questions); no hard cap for MVP.
