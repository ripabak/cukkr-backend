# Feature PRD: Customer Management (CRM)

**Version:** 1.0
**Date:** April 27, 2026
**Status:** Draft

---

## 1. Feature Name

**Customer Management (CRM)**

---

## 2. Epic

- **Parent Epic:** [Cukkr — Barbershop Management & Booking System](../epic.md)

---

## 3. Goal

### Problem

Barbershop owners currently have no structured record of who their customers are, how often they visit, or how much they spend. Customer data exists only as informal chat history or the barber's personal memory. There is no way for owners to search for a past customer, review a customer's booking history, or identify high-value customers worth nurturing. Without this visibility, retention and personalised service become impossible to execute at scale.

### Solution

Provide a Customer Management (CRM) screen in the mobile app where owners and barbers can view all customers associated with their active barbershop. Customers are automatically captured when a booking is created (walk-in or appointment) — no separate registration step is required for owners. Each customer profile aggregates booking history, total spend, and notes. A verified badge is shown for customers who have provided at least one contact method (email or phone). Owners can search by name, email, or phone, sort by multiple criteria, and navigate to a WhatsApp shortcut directly from the customer detail header.

### Impact

- Gives owners instant visibility into customer lifetime value (total bookings and total spend per customer), enabling informed retention decisions.
- Enables owners and barbers to provide personalised service by reviewing a customer's history and notes before a visit.
- Reduces friction for re-engagement by surfacing a one-tap WhatsApp shortcut from the customer detail screen.
- Establishes the customer data foundation required for broadcast messaging in Phase 2.

---

## 4. User Personas

| Persona | Role | Interaction |
|---|---|---|
| **Barbershop Owner** | `owner` | Primary actor. Views, searches, and sorts the full customer list. Reviews customer detail, booking history, and adds/edits notes. Uses WhatsApp shortcut. |
| **Barber** | `barber` | Secondary actor. Views customer list and detail scoped to their active organization. May add notes. No access to multi-select or broadcast features. |

---

## 5. User Stories

### Browse Customers

- **US-01:** As an **owner**, I want to see a list of all customers who have made at least one booking at my active barbershop so that I can understand who my customers are.
- **US-02:** As an **owner**, I want to search the customer list by name, email, or phone so that I can quickly locate a specific customer.
- **US-03:** As an **owner**, I want to sort the customer list by total bookings, total spend, or most recent visit so that I can identify my most loyal or highest-value customers.
- **US-04:** As an **owner**, I want to see each customer's name, avatar initials, total bookings, total spend (IDR), and a verified badge (if they have email or phone on record) at a glance in the list so that I can quickly assess their status without opening the detail view.

### View Customer Detail

- **US-05:** As an **owner**, I want to open a customer's detail page and see their total bookings, total spend, a spend trend indicator, and their full booking history so that I can understand their relationship with my barbershop.
- **US-06:** As an **owner**, I want to see a booking history tab on the customer detail page listing all past bookings (date, services, amount, status) sorted from newest to oldest so that I can review what services the customer has used.
- **US-07:** As an **owner**, I want to open the Notes tab on a customer's detail page and add or edit a free-text note about the customer (e.g., preferred style, allergies) so that barbers have contextual information before the appointment.

### WhatsApp Shortcut

- **US-08:** As an **owner**, I want to tap a WhatsApp shortcut button on the customer detail header so that I can quickly open a pre-filled WhatsApp chat with the customer's phone number without manually copying it.
- **US-09:** As an **owner**, I want the WhatsApp shortcut button to be disabled (with a tooltip) when the customer has no phone number on record so that I understand why the action is unavailable.

---

## 6. Requirements

### 6.1 Functional Requirements

#### Customer Record

Each `customer` record contains:

- `id` — UUID, auto-generated.
- `organizationId` — FK to `organization.id`; required; enforces multi-tenant isolation.
- `name` — string; required; max 100 characters.
- `email` — string; optional; stored only if provided by the customer during booking.
- `phone` — string; optional; stored only if provided by the customer during booking.
- `notes` — text; optional; free-text set by owner/barber.
- `createdAt`, `updatedAt` — timestamps.

Computed / derived fields (not stored):

- `totalBookings` — count of completed + in-progress + waiting bookings linked to this customer in the organization.
- `totalSpend` — sum of service prices across all `completed` bookings linked to this customer.
- `isVerified` — `true` if at least one of `email` or `phone` is non-null.
- `lastVisitAt` — `createdAt` of the most recent booking linked to this customer.

#### Customer List Endpoint

- `GET /api/customers` — returns a paginated list of customers for the active organization.
  - Query params:
    - `search` (string) — partial case-insensitive match against `name`, `email`, or `phone`.
    - `sort` — one of: `recent` (default, by `lastVisitAt` desc), `bookings_desc`, `spend_desc`, `name_asc`.
    - `page` (integer, default 1) and `limit` (integer, default 20, max 100).
  - Each item includes: `id`, `name`, `email`, `phone`, `isVerified`, `totalBookings`, `totalSpend`, `lastVisitAt`.

#### Customer Detail Endpoint

- `GET /api/customers/:id` — returns full customer profile for the active organization.
  - Response includes: all list fields + `notes` + `createdAt`.
  - Returns `404` if the customer does not belong to the active organization.

#### Customer Notes Update Endpoint

- `PATCH /api/customers/:id/notes` — updates the `notes` field of a customer.
  - Body: `{ notes: string }` (max 2000 characters; empty string allowed to clear notes).
  - Returns `200` with the updated customer object.
  - Returns `404` if the customer does not belong to the active organization.

#### Customer Booking History Endpoint

- `GET /api/customers/:id/bookings` — returns a paginated list of all bookings linked to this customer, sorted by `createdAt` descending.
  - Query params: `page` (default 1), `limit` (default 20, max 100).
  - Each booking item includes: `id`, `referenceNumber`, `createdAt`, `status`, `type`, `services` (name + price), `totalAmount`.
  - Returns `404` if the customer does not belong to the active organization.

#### Customer Creation (Automatic)

- Customers are **not created manually** by owners. A `customer` record is automatically created when a booking is submitted (walk-in or appointment) and no existing customer for that organization matches the provided email or phone.
- If a match is found (same email or same phone within the organization), the existing customer record is linked to the new booking — no duplicate is created.
- This logic is owned by the `booking` module; the `customer-management` module only exposes read and notes-update endpoints.

#### Multi-Tenant Isolation

- All customer endpoints require `requireOrganization: true` (Elysia macro).
- All DB queries filter by `organizationId = activeOrganizationId`. Cross-tenant data is never accessible.

#### WhatsApp Shortcut (Mobile Client)

- The deep link format is: `https://wa.me/<phoneE164>` where `<phoneE164>` is the customer's phone number in E.164 format (e.g., `+6281234567890`).
- The backend returns the raw `phone` value; the mobile client is responsible for formatting and constructing the deep link.
- The backend does not validate phone format — it stores whatever the customer provided.

### 6.2 Non-Functional Requirements

- **Performance:** `GET /api/customers` must respond in ≤ 400ms (p95) for organizations with up to 10,000 customers; add a DB index on `(organizationId, name)` and `(organizationId, lastVisitAt)`.
- **Pagination:** All list endpoints are paginated to avoid large payload issues on organizations with many customers.
- **Security:** All customer endpoints are authenticated and organization-scoped. No unauthenticated access to customer data.
- **Data Privacy:** Customer contact data (`email`, `phone`) is only stored after explicit input by the customer during booking; no data is inferred or collected without customer action. No payment data is stored.
- **Input Validation:** All endpoints validate input via Elysia TypeBox schemas; malformed requests return `422` with field-level errors.
- **No `any` types:** TypeScript strict mode; all DTOs defined in `model.ts`.
- **Error Handling:** All errors thrown as `AppError` from `src/core/error.ts`; no plain `Error` objects.
- **Notes Size Limit:** Notes field capped at 2000 characters to prevent abuse.

---

## 7. Acceptance Criteria

### AC-01: List Customers

- **Given** an authenticated owner with an active organization that has 5 customers,
  **When** they `GET /api/customers`,
  **Then** the response returns a paginated list of 5 customers with `isVerified`, `totalBookings`, `totalSpend`, and `lastVisitAt` computed correctly; status `200`.

- **Given** a `GET /api/customers?search=budi`,
  **Then** only customers whose `name`, `email`, or `phone` contains "budi" (case-insensitive) are returned.

- **Given** a `GET /api/customers?sort=spend_desc`,
  **Then** customers are returned in descending order of `totalSpend`.

- **Given** a `GET /api/customers?page=2&limit=2` with 5 customers total,
  **Then** 2 customers are returned (items 3–4), and the response includes `total`, `page`, and `totalPages` pagination metadata.

### AC-02: Verified Badge

- **Given** a customer with `email = null` and `phone = null`,
  **Then** `isVerified = false` is returned in the list and detail responses.

- **Given** a customer with a non-null `email` (regardless of phone),
  **Then** `isVerified = true` is returned.

### AC-03: Customer Detail

- **Given** a valid customer id belonging to the active organization,
  **When** the owner calls `GET /api/customers/:id`,
  **Then** the response returns the full customer profile including `notes`, `totalBookings`, `totalSpend`, `createdAt`, `isVerified`; status `200`.

- **Given** a customer id that belongs to a different organization,
  **When** the owner calls `GET /api/customers/:id`,
  **Then** the response returns `404`; no data is exposed.

### AC-04: Customer Booking History

- **Given** a customer with 3 bookings (2 completed, 1 canceled),
  **When** the owner calls `GET /api/customers/:id/bookings`,
  **Then** all 3 bookings are returned, each including `referenceNumber`, `status`, `type`, `services`, and `totalAmount`; sorted by `createdAt` descending.

- **Given** `GET /api/customers/:id/bookings?page=1&limit=2`,
  **Then** only 2 bookings are returned with correct pagination metadata.

### AC-05: Update Notes

- **Given** an existing customer,
  **When** the owner calls `PATCH /api/customers/:id/notes` with `{ notes: "Prefers fade cut" }`,
  **Then** the `notes` field is updated; response returns the updated customer object with status `200`.

- **Given** `PATCH /api/customers/:id/notes` with a `notes` value exceeding 2000 characters,
  **Then** the response returns `422` with a validation error; no update is performed.

- **Given** `PATCH /api/customers/:id/notes` with `{ notes: "" }`,
  **Then** the notes field is cleared (set to `null` or empty string); response returns `200`.

### AC-06: Multi-Tenant Isolation

- **Given** owner A and owner B each have customers in separate organizations,
  **When** owner A calls `GET /api/customers`,
  **Then** only owner A's customers are returned; owner B's customers are never visible.

### AC-07: Unauthenticated Access

- **Given** an unauthenticated request to any customer endpoint,
  **Then** the response returns `401 Unauthorized`.

### AC-08: Automatic Customer Creation (Booking Integration)

- **Given** a walk-in booking is submitted with a phone number not yet associated with any customer in the organization,
  **Then** a new `customer` record is created and linked to the booking.

- **Given** a walk-in booking is submitted with a phone number that already matches an existing customer in the organization,
  **Then** no duplicate customer is created; the existing customer is linked to the new booking; the existing customer's `updatedAt` is refreshed.

---

## 8. Out of Scope

- **Broadcast messaging** — multi-select and message composition are deferred to Phase 2 (listed as out of scope in the Epic).
- **Customer reviews and ratings** — deferred to Phase 2 (listed as out of scope in the Epic).
- **Manual customer creation by owners** — customers are always created automatically through the booking flow.
- **Customer profile editing by owners** — owners may only update `notes`; name, email, and phone belong to the customer and are set at booking time.
- **Customer deletion** — not available in MVP; customer records are retained for historical booking integrity.
- **Customer deduplication UI** — auto-merge on matching email/phone at booking time is handled by the booking module; no manual merge tool in MVP.
- **Export of customer data** (CSV/Excel) — not required for MVP.
- **Customer spend trend chart on detail** — the mobile client may derive a trend from booking history data; no dedicated trend endpoint is needed from the backend in MVP.
- **Per-barber customer segmentation** — all customers visible to all members of the organization; no per-barber filtering.
- **In-app messaging** — out of scope for the entire Epic MVP.
