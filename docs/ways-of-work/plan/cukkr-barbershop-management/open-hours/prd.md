# Feature PRD: Open Hours Configuration

**Version:** 1.0
**Date:** April 26, 2026
**Status:** Draft

---

## 1. Feature Name

**Open Hours Configuration**

---

## 2. Epic

- Parent Epic PRD: [Cukkr — Barbershop Management & Booking System](../epic.md)

---

## 3. Goal

### Problem

Barbershop owners have no structured way to define their operating hours. Without a system-managed schedule, the booking engine cannot determine which time slots are available for appointment booking, which days are closed, or when the shop opens and closes. This results in customers attempting to book at times when the shop is unavailable, creating confusion and missed bookings.

### Solution

Provide a per-organization Open Hours configuration module that allows barbershop owners to define their operating schedule for each day of the week — including open/closed status and precise open and close times. This data drives the appointment booking time-slot generation, ensuring customers can only select valid time slots on active days within operating hours.

### Impact

- Eliminate invalid appointment booking attempts caused by missing schedule data.
- Reduce owner support requests related to bookings outside operating hours.
- Enable the appointment booking flow to confidently constrain date and time selection to valid windows.

---

## 4. User Personas

| Persona | Role | Description |
|---|---|---|
| **Barbershop Owner** | `owner` | Configures the shop's operating hours per day. Has full read/write access to the organization's open hours settings. |
| **Barber** | `barber` | Read-only view of open hours to be aware of the shop's schedule. Cannot modify settings. |
| **Appointment Customer** | `customer` | Indirectly affected; date and time slot availability on the web booking page is constrained by open hours. |

---

## 5. User Stories

### Primary Stories

**US-1:** As a **barbershop owner**, I want to configure the opening and closing times for each day of the week so that the system can accurately reflect when my shop is available for bookings.

**US-2:** As a **barbershop owner**, I want to mark specific days of the week as closed so that customers cannot attempt to book appointments on those days.

**US-3:** As a **barbershop owner**, I want to view the current open hours schedule in a clear weekly layout so that I can quickly verify and update my shop's availability.

**US-4:** As a **barbershop owner**, I want changes to open hours to be saved as a whole-week batch so that I can update multiple days in a single action without partial saves.

### Edge Cases

**US-5:** As a **barbershop owner**, if I attempt to save an open hours entry where the close time is equal to or earlier than the open time, I want to see a validation error so that I don't accidentally create an invalid schedule.

**US-6:** As a **barbershop owner**, I want open hours changes to take effect immediately so that the appointment booking page reflects the latest schedule without delay.

**US-7:** As an **appointment customer**, if I open the booking page for a barbershop that has not yet configured open hours, I want to see a clear message that no appointment slots are available so that I understand the shop is not yet accepting bookings.

---

## 6. Requirements

### 6.1 Functional Requirements

#### Data Model

- Each organization has exactly one open hours record per day of the week (Monday–Sunday), totalling 7 rows per organization.
- Each day record contains:
  - `dayOfWeek`: integer 0–6 (0 = Sunday, 6 = Saturday) or enum string (e.g., `MON`, `TUE`, ..., `SUN`).
  - `isOpen`: boolean — whether the shop is open on this day.
  - `openTime`: time string in `HH:MM` format (24-hour), nullable when `isOpen = false`.
  - `closeTime`: time string in `HH:MM` format (24-hour), nullable when `isOpen = false`.
  - `organizationId`: FK to the organization.

#### API Endpoints

- **`GET /api/open-hours`** — Returns the full 7-day open hours configuration for the authenticated user's active organization.
- **`PUT /api/open-hours`** — Replaces the entire 7-day open hours configuration for the active organization in a single atomic upsert. Accepts an array of 7 day entries.

#### Business Rules

- `PUT /api/open-hours` must accept all 7 days in a single request payload; partial updates (fewer than 7 days) are not supported.
- If `isOpen = false` for a day, `openTime` and `closeTime` must be `null` or omitted.
- If `isOpen = true`, both `openTime` and `closeTime` are required.
- `closeTime` must be strictly after `openTime` when `isOpen = true`.
- If no open hours record exists for the organization, the system returns a default state of all 7 days as closed (`isOpen = false`).
- Only users with the `owner` role in the active organization may call `PUT /api/open-hours`. Barbers may only call `GET /api/open-hours`.
- All operations are scoped to the `activeOrganizationId` from the session — no cross-tenant access.

#### Integration with Appointment Booking

- The booking public API (`GET /api/public/:slug/slots`) must read open hours to determine which days and time windows are available for appointment slot generation.
- Closed days must not appear as selectable in the appointment booking date picker.
- Time slots must fall within `openTime`–`closeTime` on open days.

### 6.2 Non-Functional Requirements

- **Security:** `PUT /api/open-hours` requires authentication and `requireOrganization: true`; owner role must be enforced server-side.
- **Validation:** All input validated via Elysia TypeBox schema. Invalid payloads (wrong day count, missing fields, illogical time ranges) return `400 Bad Request` with a descriptive message.
- **Tenant Isolation:** All queries filter by `organizationId` derived from the active session. No row-level data from other organizations is accessible.
- **Atomicity:** The `PUT` operation performs an upsert (insert or update) for all 7 rows in a single database transaction. If any row fails validation or insertion, the entire operation is rolled back.
- **Performance:** `GET /api/open-hours` response time ≤ 200ms (p95). The result may be cached server-side for up to 60 seconds per organization.
- **Idempotency:** Repeated identical `PUT` requests must produce the same result and return `200 OK`.

---

## 7. Acceptance Criteria

### AC-1: Retrieve Open Hours

- **Given** an authenticated owner with an active organization
- **When** `GET /api/open-hours` is called
- **Then** the response returns an array of 7 day objects with `dayOfWeek`, `isOpen`, `openTime`, and `closeTime`
- **And** all data belongs to the active organization only

### AC-2: Default State — No Records Configured

- **Given** an authenticated owner whose organization has no open hours records in the database
- **When** `GET /api/open-hours` is called
- **Then** the response returns 7 entries all with `isOpen = false` and `openTime`/`closeTime` as `null`

### AC-3: Save Full Weekly Schedule

- **Given** an authenticated owner with an active organization
- **When** `PUT /api/open-hours` is called with a valid payload of exactly 7 day entries
- **Then** the response returns `200 OK` with the updated schedule
- **And** the database reflects the new values for all 7 days
- **And** subsequent `GET /api/open-hours` returns the updated data

### AC-4: Validation — Missing or Partial Payload

- **Given** an authenticated owner
- **When** `PUT /api/open-hours` is called with fewer than 7 day entries or missing required fields
- **Then** the response returns `400 Bad Request` with a descriptive validation error message
- **And** no database changes are made

### AC-5: Validation — Invalid Time Range

- **Given** an authenticated owner
- **When** `PUT /api/open-hours` is called with a day where `isOpen = true` and `closeTime ≤ openTime`
- **Then** the response returns `400 Bad Request`
- **And** no database changes are made

### AC-6: Validation — Open Day Missing Times

- **Given** an authenticated owner
- **When** `PUT /api/open-hours` is called with a day where `isOpen = true` but `openTime` or `closeTime` is `null`/omitted
- **Then** the response returns `400 Bad Request`

### AC-7: Role Enforcement — Barber Cannot Write

- **Given** an authenticated barber (non-owner) with an active organization
- **When** `PUT /api/open-hours` is called
- **Then** the response returns `403 Forbidden`
- **And** the database is not modified

### AC-8: Role Enforcement — Barber Can Read

- **Given** an authenticated barber with an active organization
- **When** `GET /api/open-hours` is called
- **Then** the response returns `200 OK` with the organization's open hours

### AC-9: Unauthenticated Access

- **Given** a request with no valid session cookie
- **When** either `GET` or `PUT /api/open-hours` is called
- **Then** the response returns `401 Unauthorized`

### AC-10: Tenant Isolation

- **Given** two organizations with different open hours
- **When** each owner calls `GET /api/open-hours` with their respective active organization
- **Then** each receives only their own organization's data — never data from the other organization

### AC-11: Closed Day Null Times

- **Given** an authenticated owner
- **When** `PUT /api/open-hours` is called with a day where `isOpen = false` and `openTime`/`closeTime` are provided
- **Then** the system stores `null` for both times (ignoring provided values) or returns `400 Bad Request` — either is acceptable and must be documented

### AC-12: Atomicity on Partial Failure

- **Given** a payload of 7 days where one entry fails server-side validation
- **When** `PUT /api/open-hours` is processed
- **Then** no days are written to the database (full rollback)

---

## 8. Out of Scope

- **Per-barber schedules:** Individual barber availability windows are not managed by this feature (Phase 2+).
- **Holiday / special day overrides:** One-off closures or special hours on specific calendar dates are not supported in this version.
- **Break times / lunch hours:** Intra-day breaks are not modelled.
- **Time zone configuration:** All times are stored and interpreted in the barbershop's local time zone. Multi-timezone support is out of scope for MVP.
- **Open hours history / audit log:** Previous configurations are not retained.
- **Owner UI:** This PRD covers only the backend API. Mobile and web UI implementation is managed by the frontend team.
- **Appointment slot generation:** The actual time-slot generation algorithm for customer booking is part of the `booking-public` module and is out of scope for this feature.
