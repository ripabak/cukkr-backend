# Feature PRD: Booking & Schedule Management

**Version:** 1.0
**Date:** April 26, 2026
**Status:** Draft

---

## 1. Feature Name

**Booking & Schedule Management**

---

## 2. Epic

- **Parent Epic:** [Cukkr — Barbershop Management & Booking System](../epic.md)

---

## 3. Goal

### Problem

Barbershop owners and barbers today manage their daily queue through verbal coordination and paper records. There is no structured way to track which customer is being served, which are waiting, and which appointments are confirmed for future dates. Walk-in customers queue randomly without any reference number, while appointment customers have no way to self-register their spot. Barbers have no unified schedule view, making it impossible to plan their day or see upcoming workload at a glance. The absence of a structured booking system leads directly to double-bookings, lost revenue, and a poor customer experience.

### Solution

Provide a fully-featured booking management system scoped to each organization. Barbers and owners can create two types of bookings: **walk-in** (immediate, queue-based) and **appointment** (future-dated, pre-approved). Each booking is linked to a customer record, one or more services, and optionally a specific barber. Bookings progress through a defined status lifecycle (`pending → waiting → in_progress → completed / cancelled`) with contextual action buttons at each stage. Every booking is assigned a unique reference number (`BK-{YYYYMMDD}-{DailySeq}-{Checksum}`) for identification. The schedule screen exposes a filterable, day-based list of all bookings for the active organization.

### Impact

- Eliminates double-bookings and verbal queue management errors.
- Gives barbers a single screen to see and manage their entire daily workload.
- Creates a permanent, queryable booking history per organization — the foundation for analytics and CRM.
- Enables appointment pre-approval flow, reducing no-shows and impromptu cancellations.
- Provides customers with a booking reference number for queue transparency.

---

## 4. User Personas

| Persona | Role | Interaction |
|---|---|---|
| **Barbershop Owner** | `owner` | Creates walk-in and appointment bookings on behalf of customers. Views and manages all bookings for the active organization. Accepts or declines appointment requests from the notification list. |
| **Barber** | `barber` | Primary actor for daily schedule management. Creates walk-in bookings, advances booking status (Handle This, Complete, Cancel), and views their own schedule. |
| **Appointment Customer** | `customer` | Submits appointment booking requests via the public web page (handled by the `booking-public` module — out of scope here). Receives a reference number on confirmation. |
| **Walk-In Customer** | `customer` | Registered in the queue by the barber via the mobile app after PIN verification (PIN module out of scope here). Receives a reference number on confirmation. |

---

## 5. User Stories

### View Schedule

- **US-01:** As a **barber/owner**, I want to see all bookings for a selected day so that I can plan and manage the daily queue.
- **US-02:** As a **barber/owner**, I want to filter bookings by status (`all`, `waiting`, `in_progress`, `completed`, `cancelled`) so that I can focus on the relevant subset.
- **US-03:** As a **barber/owner**, I want to navigate between days using a date picker so that I can view past records or upcoming appointments.
- **US-04:** As a **barber/owner**, I want to see booking summary information (reference number, customer name, services, status, scheduled time) in the list so that I can quickly identify each booking.

### Create a Walk-In Booking

- **US-05:** As a **barber/owner**, I want to create a walk-in booking for a customer currently at the shop so that they are added to the queue immediately.
- **US-06:** As a **barber**, I want to specify the customer's name (required) and contact (optional) when creating a walk-in booking so that a customer record is created or matched.
- **US-07:** As a **barber**, I want to select one or more services from the active catalog when creating a walk-in booking so that the correct services are recorded.
- **US-08:** As a **barber**, I want to optionally assign a preferred barber to the booking so that the customer is served by their preferred person.
- **US-09:** As a **barber/owner**, I want the walk-in booking to start immediately with `status = waiting` so that it appears in the active queue without requiring approval.

### Create an Appointment Booking (from mobile — staff side)

- **US-10:** As a **barber/owner**, I want to create an appointment booking for a future date and time on behalf of a customer (e.g., phone request) so that it appears on the schedule.
- **US-11:** As a **barber/owner**, I want to select date, time, services, and an optional preferred barber when creating an appointment booking so that the schedule is accurate.
- **US-12:** As a **barber/owner**, I want to add optional notes to an appointment booking so that context like special requests is preserved.
- **US-13:** As a **barber/owner**, I want appointments created from the mobile app to start with `status = waiting` (pre-confirmed) so that no additional acceptance step is required for staff-created bookings.

### Booking Status Lifecycle

- **US-14:** As a **barber/owner**, I want to see contextual action buttons based on the current booking status so that I always know which actions are available at each stage.
- **US-15:** As a **barber**, I want to tap "Handle This" on a `waiting` booking to mark it as `in_progress` so that the customer knows they are being served.
- **US-16:** As a **barber**, I want to complete a booking (swipe-to-complete) that is `in_progress` so that it is marked `completed` and removed from the active queue.
- **US-17:** As a **barber/owner**, I want to cancel any non-completed booking so that cancelled slots free up schedule space.
- **US-18:** As a **barber/owner**, I want to revert an `in_progress` booking back to `waiting` so that I can correct an accidental status change.
- **US-19:** As a **barber/owner**, I want to accept a `pending` appointment booking so that it moves to `waiting` and appears in the queue.
- **US-20:** As a **barber/owner**, I want to decline a `pending` appointment booking so that it is cancelled and the customer is notified.

### Booking Detail

- **US-21:** As a **barber/owner**, I want to view a booking's full detail (reference number, customer, services with prices, barber, status, timestamps, notes) so that I have all relevant information in one place.
- **US-22:** As a **barber/owner**, I want to see the itemized services with their snapshotted price and duration on the completion modal so that the final cost is transparent before confirming completion.

### Reference Number

- **US-23:** As a **barber/owner**, I want every booking to have a unique reference number in the format `BK-{YYYYMMDD}-{DailySeq}-{Checksum}` so that bookings are identifiable to customers.

---

## 6. Requirements

### 6.1 Functional Requirements

#### Booking Record Fields

- Each `booking` record contains:
  - `id` — UUID, auto-generated.
  - `organizationId` — FK to `organization.id`; required; enforces multi-tenant isolation.
  - `referenceNumber` — string; format `BK-{YYYYMMDD}-{DailySeq}-{Checksum}`; unique per organization; generated at creation.
  - `type` — enum: `walk_in` | `appointment`; required.
  - `status` — enum: `pending` | `waiting` | `in_progress` | `completed` | `cancelled`; required; default `waiting` for walk-ins and staff-created appointments, `pending` for customer-submitted appointments (handled by `booking-public`).
  - `customerId` — FK to `customer.id`; required; linked to the customer record created or matched at booking creation.
  - `barberId` — FK to `member.id` (organization member); optional; the assigned/preferred barber.
  - `scheduledAt` — timestamp; required for `appointment` type; null for `walk_in`.
  - `notes` — string; optional; max 500 characters.
  - `startedAt` — timestamp; set when status transitions to `in_progress`.
  - `completedAt` — timestamp; set when status transitions to `completed`.
  - `cancelledAt` — timestamp; set when status transitions to `cancelled`.
  - `createdById` — FK to `user.id`; the staff member who created the booking.
  - `createdAt`, `updatedAt` — timestamps.

#### Booking Service (Line Items) Fields

- Each `booking_service` record contains:
  - `id` — UUID, auto-generated.
  - `bookingId` — FK to `booking.id`; required.
  - `serviceId` — FK to `service.id`; required.
  - `serviceName` — string; snapshot of `service.name` at booking time.
  - `price` — integer (IDR); snapshot of `service.price` at booking time (after discount).
  - `originalPrice` — integer (IDR); snapshot of `service.price` before discount.
  - `discount` — integer (0–100); snapshot of `service.discount` at booking time.
  - `duration` — integer (minutes); snapshot of `service.duration` at booking time.

#### Customer Record Fields

- Each `customer` record contains:
  - `id` — UUID, auto-generated.
  - `organizationId` — FK to `organization.id`; required.
  - `name` — string; required; max 100 characters.
  - `phone` — string; optional; normalized E.164 format.
  - `email` — string; optional; normalized lowercase.
  - `isVerified` — boolean; computed: `true` if `phone` or `email` is present; defaults to `false`.
  - `notes` — string; optional; max 1000 characters; editable from CRM.
  - `createdAt`, `updatedAt` — timestamps.

- **Customer matching at booking creation:** When a booking is created with a `customerPhone` or `customerEmail`, the system attempts to find an existing `customer` record in the same organization with matching contact. If found, the booking links to that record. If not found, a new `customer` record is created.

#### Reference Number Generation

- Format: `BK-{YYYYMMDD}-{DailySeq}-{Checksum}`
  - `YYYYMMDD` — booking creation date in the organization's local time (default UTC+7 / WIB).
  - `DailySeq` — 3-digit zero-padded sequential counter per organization per calendar day (e.g., `001`, `002`). Counter resets to `1` at midnight.
  - `Checksum` — 2-character random alphanumeric (uppercase letters + digits), e.g., `A7`, `3K`.
- Generation must be atomic: use a DB transaction to read the current daily counter, increment it, and write the new booking in a single operation to prevent duplicate `DailySeq` values under concurrency.
- `referenceNumber` is unique per organization (DB unique constraint on `(organizationId, referenceNumber)`).

#### Booking Status Lifecycle

| Current Status | Allowed Transitions | Trigger |
|---|---|---|
| `pending` | → `waiting` | Accept (owner/barber) |
| `pending` | → `cancelled` | Decline (owner/barber) |
| `waiting` | → `in_progress` | Handle This (barber/owner) |
| `waiting` | → `cancelled` | Cancel (barber/owner) |
| `in_progress` | → `completed` | Complete / swipe-to-complete (barber/owner) |
| `in_progress` | → `waiting` | Mark as Waiting (barber/owner) |
| `in_progress` | → `cancelled` | Cancel (barber/owner) |
| `completed` | — | No further transitions allowed. |
| `cancelled` | — | No further transitions allowed. |

- Any invalid status transition request returns `400 Bad Request` with a descriptive error message.
- Timestamp fields (`startedAt`, `completedAt`, `cancelledAt`) are set atomically on the corresponding transition.

#### API Endpoints

- **List Bookings:** `GET /api/bookings`
  - Query params:
    - `date` — ISO date string (`YYYY-MM-DD`); required; filters bookings by calendar day (using `scheduledAt` for appointments, `createdAt` for walk-ins).
    - `status` — optional; one of `all` | `pending` | `waiting` | `in_progress` | `completed` | `cancelled`; defaults to `all`.
    - `barberId` — optional UUID; filters to a specific barber's bookings.
  - Returns bookings with customer name, service summary, status, reference number, and assigned barber.
  - Ordered by: appointments by `scheduledAt` asc, walk-ins by `createdAt` asc.

- **Get Booking Detail:** `GET /api/bookings/:id`
  - Returns the full booking object including customer details, all `booking_service` line items (with snapshotted prices), barber, and all timestamps.

- **Create Booking:** `POST /api/bookings`
  - Body fields:
    - `type` — `walk_in` | `appointment`; required.
    - `customerName` — string; required.
    - `customerPhone` — string; optional.
    - `customerEmail` — string; optional.
    - `serviceIds` — array of service UUIDs; required; min 1 item; all must be active and belong to the active organization.
    - `barberId` — UUID; optional; must be an active member of the active organization.
    - `scheduledAt` — ISO datetime string; required if `type = appointment`; must be a future datetime within the barbershop's open hours.
    - `notes` — string; optional; max 500 characters.
  - On success: creates `customer` record (or matches existing), creates `booking` record with `status = waiting`, creates `booking_service` line items (price/duration snapshotted), and generates `referenceNumber`. Returns `201` with the full booking object.

- **Update Booking Status:** `PATCH /api/bookings/:id/status`
  - Body: `{ "status": "<new_status>" }`
  - Validates the transition is allowed per the lifecycle table above.
  - Updates relevant timestamps atomically.
  - Returns `200` with the updated booking.

- **Delete Booking:** Not supported. Bookings are immutable records; use `cancelled` status instead.

#### Multi-Tenant Isolation

- All booking endpoints require `requireOrganization: true`.
- All DB queries filter by `organizationId = activeOrganizationId`. Booking detail (`GET /api/bookings/:id`) verifies the booking belongs to the active organization before returning data.

#### Validation Rules

- `serviceIds` must contain at least 1 item; all referenced services must be `isActive = true` and belong to the active organization.
- `barberId`, if provided, must be an active member of the active organization.
- For `type = appointment`: `scheduledAt` is required, must be in the future, and must fall within the barbershop's open hours for that day-of-week.
- `customerName` is required; max 100 characters.
- `customerPhone`, if provided, must be a valid phone number string; max 20 characters.
- `customerEmail`, if provided, must be a valid email format.
- Status update requests with invalid transitions return `400`.

### 6.2 Non-Functional Requirements

- **Security:**
  - All booking endpoints are authenticated and organization-scoped.
  - `createdById` is always set server-side from the session — never accepted from the client.
  - Service price snapshots are taken at booking creation from the DB — never accepted from the client — to prevent price manipulation.
  - No cross-tenant data access: all queries enforce `organizationId` filter.
- **Performance:**
  - `GET /api/bookings` must respond in ≤ 300ms (p95) for a day with up to 200 bookings.
  - Add DB indexes on: `(organizationId, createdAt)`, `(organizationId, scheduledAt)`, `(organizationId, status)`, `(bookingId)` on `booking_service`.
- **Data Integrity:**
  - Reference number generation is atomic via a DB transaction (counter read + booking insert in a single transaction).
  - DB unique constraint on `(organizationId, referenceNumber)` prevents duplicates.
  - `booking_service` records store price/duration snapshots so that future service edits do not retroactively alter historical booking records.
- **Atomicity:** Status transitions that set timestamp fields (`startedAt`, `completedAt`, `cancelledAt`) are applied in the same DB update to avoid partial state.
- **Input Validation:** All endpoints validate input via TypeBox schemas; malformed requests return `422` with field-level error details.
- **No `any` types:** TypeScript strict mode; all DTOs defined in `model.ts`.
- **Error Handling:** All errors thrown as `AppError` from `src/core/error.ts`.

---

## 7. Acceptance Criteria

### AC-01: Create Walk-In Booking

- **Given** an authenticated barber with an active organization and at least one active service,  
  **When** they `POST /api/bookings` with `type = walk_in`, `customerName = "Budi"`, and a valid `serviceIds` array,  
  **Then** a `booking` is created with `status = waiting`, a `customer` record is created with `name = "Budi"`, `booking_service` line items are created with price/duration snapshots, a `referenceNumber` is generated in the format `BK-{YYYYMMDD}-{DailySeq}-{XX}`, and the response returns `201` with the full booking object.

- **Given** a `POST /api/bookings` request with an empty `serviceIds` array,  
  **Then** the response returns `422`; no booking is created.

- **Given** a `POST /api/bookings` request with a `serviceId` that belongs to a different organization,  
  **Then** the response returns `422`; no booking is created.

### AC-02: Create Appointment Booking

- **Given** an authenticated owner/barber with an active organization,  
  **When** they `POST /api/bookings` with `type = appointment`, a future `scheduledAt` that falls within open hours, and valid services,  
  **Then** a booking is created with `status = waiting`, `scheduledAt` is stored, and the response returns `201`.

- **Given** a `POST /api/bookings` request with `type = appointment` and no `scheduledAt`,  
  **Then** the response returns `422`; no booking is created.

- **Given** a `POST /api/bookings` request with `type = appointment` and a `scheduledAt` in the past,  
  **Then** the response returns `422`; no booking is created.

### AC-03: Customer Matching

- **Given** an existing `customer` record in the organization with `phone = "+628123456789"`,  
  **When** a new booking is created with `customerPhone = "+628123456789"`,  
  **Then** the new booking links to the existing customer record (no duplicate customer created).

- **Given** no existing customer with `email = "new@example.com"`,  
  **When** a booking is created with `customerEmail = "new@example.com"` and `customerName = "Ani"`,  
  **Then** a new customer record is created with `name = "Ani"`, `email = "new@example.com"`, `isVerified = true`.

### AC-04: Reference Number Generation

- **Given** it is the first booking of the day for the organization,  
  **Then** the `DailySeq` is `001`.

- **Given** two bookings created concurrently for the same organization on the same day,  
  **Then** each booking receives a unique sequential `DailySeq` (e.g., `001` and `002`); no duplicate reference numbers exist.

- **Given** a booking created on a new calendar day,  
  **Then** the `DailySeq` resets to `001` for that day regardless of the previous day's counter.

### AC-05: Status Lifecycle

- **Given** a booking with `status = waiting`,  
  **When** `PATCH /api/bookings/:id/status` is called with `{ "status": "in_progress" }`,  
  **Then** the booking status becomes `in_progress`, `startedAt` is set to the current timestamp, and the response returns `200`.

- **Given** a booking with `status = in_progress`,  
  **When** `PATCH /api/bookings/:id/status` is called with `{ "status": "completed" }`,  
  **Then** the booking status becomes `completed` and `completedAt` is set; the response returns `200`.

- **Given** a booking with `status = completed`,  
  **When** `PATCH /api/bookings/:id/status` is called with any new status,  
  **Then** the response returns `400`; the booking status is unchanged.

- **Given** a booking with `status = waiting`,  
  **When** `PATCH /api/bookings/:id/status` is called with `{ "status": "completed" }` (skipping `in_progress`),  
  **Then** the response returns `400`; the booking status is unchanged.

- **Given** a booking with `status = in_progress`,  
  **When** `PATCH /api/bookings/:id/status` is called with `{ "status": "waiting" }`,  
  **Then** the booking status reverts to `waiting` and `startedAt` is cleared (set to null); the response returns `200`.

- **Given** a booking with `status = cancelled`,  
  **When** `PATCH /api/bookings/:id/status` is called with any status,  
  **Then** the response returns `400`; the booking is unchanged.

### AC-06: List Bookings

- **Given** an organization with 3 walk-in bookings and 2 appointment bookings on `2026-04-26`,  
  **When** `GET /api/bookings?date=2026-04-26` is called,  
  **Then** all 5 bookings are returned in ascending chronological order.

- **Given** bookings with mixed statuses,  
  **When** `GET /api/bookings?date=2026-04-26&status=waiting` is called,  
  **Then** only bookings with `status = waiting` are returned.

- **Given** two barbers in the same organization with separate bookings,  
  **When** `GET /api/bookings?date=2026-04-26&barberId={id}` is called with a specific barber's ID,  
  **Then** only bookings assigned to that barber are returned.

### AC-07: Cross-Tenant Isolation

- **Given** a booking belonging to Organization A,  
  **When** a user from Organization B calls `GET /api/bookings/:id` with that booking's ID,  
  **Then** the response returns `404`; no data from Organization A is exposed.

### AC-08: Price Snapshot Integrity

- **Given** a booking with a snapshotted `booking_service.price = 50000`,  
  **When** the linked service's price is later updated to `75000`,  
  **Then** `GET /api/bookings/:id` still returns `price = 50000` for that line item.

---

## 8. Out of Scope

- **Public web booking flow** (walk-in PIN validation + customer appointment submission) — handled by the `booking-public` module.
- **Walk-in PIN generation and validation** — handled by the `pin` module.
- **Push notifications** triggered by booking status changes — handled by the `notification` module.
- **Analytics aggregations** from booking data — handled by the `analytics` module.
- **Customer CRM detail screen** (booking history, notes, spend stats) — handled by the `customer` module.
- **Recurring bookings** — out of scope for MVP.
- **Online payments** — out of scope for MVP (cash only).
- **Multi-service duration scheduling** / open-hours time-slot enforcement beyond simple future-date validation — Phase 2.
- **Barber-level booking restrictions** (e.g., a barber can only see their own bookings) — Phase 2.
- **Booking reminders** via push notification — Phase 2.1.
- **Reviews and ratings** from completed bookings — Phase 2.
