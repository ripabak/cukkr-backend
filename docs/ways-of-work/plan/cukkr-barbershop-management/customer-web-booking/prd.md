# Feature PRD: Customer Web Booking

**Version:** 1.0
**Date:** April 27, 2026
**Status:** Draft

---

## 1. Feature Name

**Customer Web Booking — Public Booking Page (Walk-In & Appointment)**

---

## 2. Epic

- **Parent Epic:** [Cukkr — Barbershop Management & Booking System](../epic.md)

---

## 3. Goal

### Problem

Customers who want to book at a barbershop currently have no structured digital channel. They must call, message via WhatsApp, or simply show up in person and hope for a short queue. This creates friction for appointment customers and provides no data trail for walk-ins. Owners have no way to give customers a self-service experience that is quick, branded, and doesn't require app installation.

### Solution

Provide a zero-download, mobile-optimized public web page at `https://cukkr.com/{slug}` for each barbershop. The page serves two distinct flows:
- **Walk-In:** PIN-verified, no account required — customer enters a 4-digit PIN provided by the barber, enters their name, selects services, and joins the queue.
- **Appointment:** Account-required — customer registers or logs in, selects services, preferred barber, date (constrained by open hours), time slot, and submits a future booking.

Both flows produce a `booking` record and trigger in-app notifications to the barbershop staff.

### Impact

- Reduce customer booking time to ≤ 60 seconds from landing page.
- Eliminate phone/WhatsApp booking friction for appointment customers.
- Give walk-in customers a digital paper trail and barbers a structured queue.
- Drive owner adoption by providing immediate tangible value to their customers.

---

## 4. User Personas

| Persona | Role | Need |
|---|---|---|
| **Walk-In Customer** | unauthenticated | Arrive at the shop, scan/open link, verify presence via PIN, join the queue instantly without an account. |
| **Appointment Customer** | authenticated web user | Self-book a future timeslot by selecting services, barber, date, and time. |

Barbershop owners and barbers are indirect stakeholders — they receive the booking in their mobile app.

---

## 5. User Stories

### Walk-In Flow

1. As a **walk-in customer**, I want to open `cukkr.com/{slug}` and see my barbershop's name and logo so that I know I'm in the right place.
2. As a **walk-in customer**, I want to tap "Walk In" and enter a 4-digit PIN given to me by the barber so that my physical presence at the shop is verified.
3. As a **walk-in customer**, I want to enter my name and optionally my phone number so that the barber knows who I am.
4. As a **walk-in customer**, I want to select one or more services so that the barber knows what I need.
5. As a **walk-in customer**, I want to optionally choose a preferred barber so that I can be served by a specific person.
6. As a **walk-in customer**, I want to see a booking confirmation with a reference number so that I have a record of my queue position.
7. As a **walk-in customer**, I want a clear error message if the PIN I entered is invalid or expired so that I can ask the barber for a new one.

### Appointment Flow

8. As an **appointment customer**, I want to tap "Book Appointment" and be prompted to log in or register so that my booking is tied to my account.
9. As an **appointment customer**, I want to select one or more services so that the barber knows what I need.
10. As an **appointment customer**, I want to optionally select a preferred barber so that I can be served by a specific person.
11. As an **appointment customer**, I want to select a date (limited to open days) so that I don't accidentally book on a closed day.
12. As an **appointment customer**, I want to select a time slot within the barbershop's open hours so that my booking is at a valid time.
13. As an **appointment customer**, I want to add optional notes for the barber so that I can communicate special requests.
14. As an **appointment customer**, I want to review a summary of my booking (services, barber, date, time, total price) before submitting so that I can verify the details.
15. As an **appointment customer**, I want to see a confirmation page with a booking reference number after submitting so that I have proof of my booking.

---

## 6. Requirements

### Functional Requirements

#### Public Landing Page

- `GET /api/public/:slug` — Returns barbershop metadata for the landing page: `name`, `logoUrl`, `description`, `address`. Returns `404` if slug does not exist.
- The landing page displays two CTAs: **Walk In** and **Book Appointment**.
- The page is publicly accessible with no authentication.

#### Walk-In Flow (Unauthenticated)

- `POST /api/public/:slug/walk-in/validate-pin` — Validates a 4-digit PIN against the organization's active PINs.
  - Accepts `{ pin: string }`.
  - Returns `{ valid: true, token: string }` (a short-lived single-use token, 30 minutes TTL) on success.
  - Returns `{ valid: false, message: string }` on failure.
  - Rate-limited: max 5 failed attempts per IP per 15 minutes (429 after exceeded).
  - PIN is consumed (marked used) on successful validation.
- `POST /api/public/:slug/walk-in` — Creates a walk-in booking.
  - Requires the single-use token from PIN validation in the request body or as a short-lived JWT.
  - Accepts: `{ token, customerName, customerPhone?, serviceIds: string[], barberId? }`.
  - `customerName` is required; `customerPhone` is optional.
  - `serviceIds` must contain at least one valid, active service belonging to the organization.
  - `barberId` is optional; if provided, must be an active member of the organization.
  - Creates a `booking` record with `status = waiting`, `type = walk-in`.
  - Creates or updates a `customer` record linked to the booking.
  - Triggers `walk_in_arrival` notifications to all staff members.
  - Returns `{ bookingReference, barbershopName, services, estimatedWait? }`.

#### Appointment Flow (Authenticated Web User)

- Customer authentication uses Better Auth's standard email/password flow on the web (same user table as mobile). Session cookie scoped to the web domain.
- `GET /api/public/:slug/services` — Returns the list of active services for the organization (no auth required).
- `GET /api/public/:slug/barbers` — Returns the list of active barbers for the organization (no auth required).
- `GET /api/public/:slug/availability` — Returns available time slots for a given date.
  - Query params: `date` (YYYY-MM-DD), `barberId?` (optional filter).
  - Validates the date is not a closed day per open hours configuration.
  - Returns hourly or 30-minute slots within open hours, excluding already-booked slots.
- `POST /api/public/:slug/appointment` — Creates an appointment booking. Requires authentication.
  - Accepts: `{ serviceIds: string[], barberId?, scheduledAt: string (ISO 8601), notes? }`.
  - `serviceIds` must contain at least one valid, active service.
  - `scheduledAt` must fall within the barbershop's open hours on that day.
  - `scheduledAt` must not conflict with an existing confirmed booking for the same barber (if `barberId` provided).
  - Creates a `booking` record with `status = waiting`, `type = appointment`.
  - Creates or updates a `customer` record for the authenticated web user.
  - Triggers `appointment_requested` notifications to all staff members.
  - Returns `{ bookingReference, barbershopName, services, scheduledAt, barber? }`.

#### Booking Reference Format

- Format: `BK-{YYYYMMDD}-{DailySeq:3}-{Checksum:2}` (e.g., `BK-20260425-001-A7`).
- `DailySeq`: zero-padded 3-digit sequential counter per organization, resetting daily.
- `Checksum`: 2-character random alphanumeric.

#### Customer Record Upsert

- A `customer` record is created or updated based on phone (walk-in) or `userId` (appointment).
- Walk-in customers without phone are created as anonymous records linked only to the booking.
- Appointment customers are linked to the authenticated user's `userId`.

### Non-Functional Requirements

- The landing page and walk-in flow must work with no JavaScript disabled (progressive enhancement preferred) but a React/Vite SPA is acceptable.
- All public endpoints enforce rate limiting:
  - PIN validation: max 5 failures per IP per 15 minutes.
  - Walk-in submission: max 10 per IP per hour.
  - Appointment submission: max 20 per IP per hour.
- Walk-in PIN tokens are single-use and expire in 30 minutes; reuse returns `401`.
- `scheduledAt` for appointments must be validated to be in the future (≥ current time + 30 minutes).
- Service IDs in `serviceIds` must all belong to the target organization; foreign-org service IDs return `400`.
- File uploads are not part of this feature.
- Customer contact data (phone, email) stored only when explicitly provided.
- No payment data is collected or stored.
- All endpoints validated via Elysia TypeBox schemas.
- CORS: public endpoints (`/api/public/*`) allow requests from the customer web app origin.

---

## 7. Acceptance Criteria

### AC-1: Landing page — valid slug

- **Given** a barbershop with slug `hendra-barbershop` exists  
- **When** `GET /api/public/hendra-barbershop` is called  
- **Then** the response returns `name`, `description`, `address`, and `logoUrl`.

### AC-2: Landing page — invalid slug

- **Given** slug `nonexistent-shop` does not exist  
- **When** `GET /api/public/nonexistent-shop` is called  
- **Then** the API returns `404 Not Found`.

### AC-3: Walk-in PIN validation — success

- **Given** a valid, unused, unexpired PIN exists for the organization  
- **When** `POST /api/public/{slug}/walk-in/validate-pin` is called with the correct PIN  
- **Then** the response includes `valid: true` and a single-use token.

### AC-4: Walk-in PIN validation — wrong PIN

- **Given** a 4-digit PIN that does not match any active PIN  
- **When** the validate-pin endpoint is called  
- **Then** the response returns `valid: false` with an error message; the failure count increments.

### AC-5: Walk-in PIN rate limiting

- **Given** 5 consecutive failed PIN attempts from the same IP  
- **When** a 6th attempt is made  
- **Then** the API returns `429 Too Many Requests`.

### AC-6: Walk-in booking created

- **Given** a valid single-use token and at least one active service ID  
- **When** `POST /api/public/{slug}/walk-in` is called  
- **Then** a booking record is created with `status = waiting`, `type = walk-in`, and a booking reference is returned.

### AC-7: Walk-in PIN single-use

- **Given** a PIN was successfully validated and a token was issued  
- **When** the same PIN is submitted again  
- **Then** the validate-pin endpoint returns `valid: false` (PIN already consumed).

### AC-8: Appointment booking — valid slot

- **Given** an authenticated customer, a valid service, and a `scheduledAt` within open hours  
- **When** `POST /api/public/{slug}/appointment` is called  
- **Then** a booking is created with `status = waiting`, `type = appointment`, and a booking reference is returned.

### AC-9: Appointment booking — closed day rejected

- **Given** the barbershop is closed on Sundays per open hours  
- **When** an appointment is submitted for a Sunday  
- **Then** the API returns `400 Bad Request` with a message indicating the shop is closed.

### AC-10: Appointment booking — past time rejected

- **Given** `scheduledAt` is in the past  
- **When** the appointment submission is processed  
- **Then** the API returns `400 Bad Request`.

### AC-11: Appointment booking — unauthenticated rejected

- **Given** no session cookie is present  
- **When** `POST /api/public/{slug}/appointment` is called  
- **Then** the API returns `401 Unauthorized`.

### AC-12: Staff notified on walk-in

- **Given** a walk-in booking is successfully created  
- **When** the booking is persisted  
- **Then** a `walk_in_arrival` notification is created for all owner and barber members of the organization.

### AC-13: Staff notified on appointment

- **Given** an appointment booking is successfully created  
- **When** the booking is persisted  
- **Then** an `appointment_requested` notification is created for all owner and barber members.

### AC-14: Foreign service ID rejected

- **Given** service ID `X` belongs to a different organization  
- **When** `serviceIds` containing `X` is submitted to `POST /api/public/{slug}/walk-in` or `/appointment`  
- **Then** the API returns `400 Bad Request`.

### AC-15: Availability returns correct slots

- **Given** the barbershop is open 09:00–17:00 on Monday and has 2 existing confirmed bookings at 10:00 and 14:00  
- **When** `GET /api/public/{slug}/availability?date=<next-monday>` is called  
- **Then** available time slots exclude 10:00 and 14:00.

---

## 8. Out of Scope

- Customer-facing mobile app (iOS/Android) — web only.
- Google / Apple social login for customer web booking.
- Online payment / payment gateway integration.
- In-app chat between barber and customer.
- Booking cancellation by the customer via the web (only barber/owner can cancel at MVP).
- Customer booking history page on the web (Phase 2).
- Customer account management on the web (Phase 2).
- Multi-language / i18n support (Indonesian only).
- SEO meta tags or Open Graph for the public booking page (Phase 2).
- SMS/email confirmation to the customer after booking (Phase 2).
- Real-time queue position updates (Phase 2).
- Waitlist or overbooking handling.
- Recurring appointment scheduling.
- Maximum concurrent bookings per time slot configuration.
