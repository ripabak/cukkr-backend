# Feature PRD: Walk-In PIN System

**Version:** 1.0
**Date:** April 27, 2026
**Status:** Draft

---

## 1. Feature Name

**Walk-In PIN System**

---

## 2. Epic

- **Parent Epic:** [Cukkr — Barbershop Management & Booking System](../epic.md)

---

## 3. Goal

### Problem

When a customer arrives at a barbershop and wants to self-register as a walk-in via the public web booking page (`cukkr.com/{slug}`), there is no way to verify that the customer is physically present at the location. Without a presence-verification mechanism, anyone — including remote users or bots — could add themselves to a barbershop's queue, polluting the schedule with fraudulent or accidental entries. Barbers have no lightweight tool to quickly authorize a walk-in without taking over the customer's phone or manually entering all customer details themselves.

### Solution

A barber or owner generates a short-lived 4-digit numeric PIN from the mobile app. The PIN is handed (verbally or shown) to the physically present customer. On the public web booking page, the customer selects "Walk-In", enters the PIN, and the system validates it server-side against the organization's active PIN pool. A successful validation unlocks the walk-in booking form for that customer. PINs are single-use, expire after 30 minutes, are stored as bcrypt hashes (never returned in plaintext after generation), and the system limits active PINs to 10 per organization. Brute-force attacks are blocked via per-IP rate limiting on validation attempts.

### Impact

- Eliminate fraudulent or remote queue entries by requiring a physically-dispensed PIN for all walk-in self-registrations.
- Reduce barber workload: barbers hand over a PIN instead of manually entering all customer details.
- Maintain customer booking completion time at ≤ 60 seconds from landing page.
- Achieve 0 successful unauthorized PIN validations (target from Epic success metrics).

---

## 4. User Personas

| Persona | Role | Interaction |
|---|---|---|
| **Barber** | `barber` | Primary PIN generator. Opens the mobile app, taps "Generate PIN", and reads the 4-digit code to the arriving walk-in customer. |
| **Barbershop Owner** | `owner` | Can also generate PINs from the mobile app in the same way as a barber. May manage the active PIN pool (e.g., see count of active PINs). |
| **Walk-In Customer** | `customer` (unauthenticated) | Receives the PIN verbally from the barber. Opens the public web booking page, selects "Walk-In", and enters the 4-digit code to begin self-registration. |

---

## 5. User Stories

### PIN Generation (Mobile — Barber/Owner)

- **US-01:** As a **barber/owner**, I want to generate a 4-digit PIN from the mobile app so that I can give it to a walk-in customer to verify their physical presence.
- **US-02:** As a **barber/owner**, I want the generated PIN displayed prominently and immediately so that I can read it to the customer without navigating away.
- **US-03:** As a **barber/owner**, I want a PIN to automatically expire after 30 minutes so that old, unused PINs cannot be reused by someone who overheard the code.
- **US-04:** As a **barber/owner**, I want to be informed when the organization has reached the limit of 10 active PINs so that I understand why generation is temporarily blocked.
- **US-05:** As a **barber/owner**, I want to see how many active PINs currently exist for my organization so that I can track outstanding walk-in authorizations.

### PIN Validation (Web — Walk-In Customer)

- **US-06:** As a **walk-in customer**, I want to enter a 4-digit PIN on the public booking page so that I can prove my physical presence and proceed to the walk-in booking form.
- **US-07:** As a **walk-in customer**, I want to receive a clear error message when I enter an invalid or expired PIN so that I can request a new one from the barber.
- **US-08:** As a **walk-in customer**, I want the PIN entry to be rate-limited so that the system is protected even if I accidentally mistype several times.
- **US-09:** As a **walk-in customer**, I want the walk-in booking form to open immediately after a successful PIN validation so that I can complete my booking quickly.

### Security & Lifecycle

- **US-10:** As the **system**, I want to mark a PIN as used immediately upon successful validation so that the same PIN cannot be used by a second customer.
- **US-11:** As the **system**, I want to reject any PIN that has already been used, is expired, or does not belong to the requested organization so that the queue cannot be manipulated.
- **US-12:** As the **system**, I want to block an IP after 5 consecutive failed validation attempts within 15 minutes so that brute-force enumeration of PINs is prevented.

---

## 6. Requirements

### 6.1 Functional Requirements

#### PIN Generation

- Authenticated endpoint `POST /api/pin/generate` (requires valid session + active `organizationId`).
- Generates a cryptographically random 4-digit numeric PIN (`0000`–`9999`).
- Stores only the **bcrypt hash** of the PIN — the plaintext is **never persisted** and is returned in the response body exactly once.
- PIN record fields: `id`, `organizationId`, `generatedByUserId`, `pinHash`, `isUsed` (boolean, default `false`), `expiresAt` (30 minutes from creation), `usedAt` (nullable timestamp), `createdAt`.
- Returns the plaintext PIN and `expiresAt` in the response so the mobile app can display it.
- If the organization already has **10 or more active PINs** (not used, not expired), the endpoint must return `429 Too Many Requests` with a descriptive error message.
- Active PIN count query must exclude expired (`expiresAt < now`) and used (`isUsed = true`) records.

#### PIN Validation

- Public endpoint `POST /api/public/:slug/pin/validate` (unauthenticated; resolves `organizationId` from slug).
- Accepts a 4-digit numeric PIN in the request body.
- Looks up all active, non-expired, non-used PIN hashes for the organization and compares via `bcrypt.compare`.
- On **success**:
  - Marks the matching PIN record as `isUsed = true` and sets `usedAt = now`.
  - Returns a short-lived validation token (signed JWT, 15-minute expiry, scoped to `organizationId`) that the web booking flow presents when submitting the walk-in booking to prove prior PIN validation.
- On **failure** (PIN not found, expired, already used, or wrong organization):
  - Returns `400 Bad Request` with a non-revealing error (`Invalid or expired PIN`).
  - Increments the IP-based failed-attempt counter.
- **Rate limiting:** maximum **5 failed validation attempts per IP per 15 minutes**. On breach, return `429 Too Many Requests`; do not increment further.
- Expired PINs encountered during lookup should be filtered out (lazy cleanup); a background or post-request cleanup may purge them.

#### Walk-In Booking Form Unlock

- The web booking form for walk-in flow is rendered only after a successful PIN validation (client holds the validation token).
- The `POST /api/public/:slug/walk-in` booking endpoint must verify the validation token before creating the booking.
- Token is single-use: invalidate it upon booking creation to prevent replaying the same token for multiple bookings.

#### PIN Record Cleanup

- Expired and used PINs may be cleaned up lazily (filtered during queries) or via a periodic background job; they must not be returned in any response.
- No hard deletion requirement for MVP; soft-filtering by `expiresAt` and `isUsed` is sufficient.

#### Mobile App PIN Screen

- Barber/Owner can tap a dedicated "Generate PIN" action from the schedule screen or a contextual walk-in button.
- The app displays the generated 4-digit PIN in a large, readable format alongside a countdown timer (`MM:SS`) to expiry.
- The app displays the current count of active PINs (e.g., "3/10 active PINs").
- If the limit is reached, the "Generate PIN" button is disabled with an explanatory message.
- The PIN screen does **not** show the actual hash or any other PIN records — only the PIN just generated.

### 6.2 Non-Functional Requirements

- **Security:**
  - Plaintext PIN is never stored; only bcrypt hash persisted (cost factor ≥ 10).
  - PIN plaintext never appears in logs, API error responses, or audit records.
  - Validation endpoint is rate-limited per IP: max 5 failures per 15 minutes (`429` on breach).
  - Max 10 active PINs per organization prevents resource exhaustion.
  - Validation token (JWT) is short-lived (15 minutes), organization-scoped, and single-use.
- **Performance:**
  - PIN generation response ≤ 200ms (p95).
  - PIN validation response ≤ 400ms (p95) — bcrypt comparison dominates; acceptable latency.
- **Data Privacy:**
  - No customer data stored in the `walk_in_pin` table; only the hash and metadata.
  - `generatedByUserId` stored for auditability only — not exposed to customers.
- **Reliability:** PIN generation must be idempotent at the application level — a network retry by the mobile client should not bypass the 10-PIN limit.
- **Multi-Tenancy:** All PIN records include `organizationId`; validation always resolves `organizationId` from the public slug before lookup — no cross-tenant PIN reuse possible.
- **Input Validation:** PIN input on both generate and validate endpoints validated as a 4-digit numeric string via TypeBox schema.

---

## 7. Acceptance Criteria

### AC-01: Successful PIN Generation

- **Given** an authenticated barber/owner with an active organization that has fewer than 10 active PINs,
- **When** they call `POST /api/pin/generate`,
- **Then** a 4-digit numeric PIN is returned in the response body, the PIN hash is stored in `walk_in_pin`, and `expiresAt` is set to 30 minutes from now.

### AC-02: PIN Generation Blocked at Limit

- **Given** an organization already has 10 active (not used, not expired) PINs,
- **When** a barber calls `POST /api/pin/generate`,
- **Then** the endpoint returns `429 Too Many Requests` and no new PIN is created.

### AC-03: Successful PIN Validation

- **Given** a valid, non-expired, non-used PIN exists for the organization matching the slug,
- **When** the customer submits the correct PIN to `POST /api/public/:slug/pin/validate`,
- **Then** the PIN record is marked `isUsed = true`, `usedAt` is set, and a 15-minute validation token is returned.

### AC-04: Expired PIN Rejected

- **Given** a PIN whose `expiresAt` is in the past,
- **When** the customer submits that PIN to the validate endpoint,
- **Then** the endpoint returns `400 Bad Request` with the message "Invalid or expired PIN".

### AC-05: Used PIN Rejected

- **Given** a PIN that has already been used (`isUsed = true`),
- **When** the customer attempts to validate it again,
- **Then** the endpoint returns `400 Bad Request` with "Invalid or expired PIN".

### AC-06: Wrong PIN Rejected

- **Given** a PIN that does not match any active PIN hash for the organization,
- **When** the customer submits it,
- **Then** the endpoint returns `400 Bad Request` and increments the IP failed-attempt counter.

### AC-07: Rate Limiting on Validation

- **Given** a customer has submitted 5 incorrect PINs within 15 minutes from the same IP,
- **When** they attempt a 6th validation,
- **Then** the endpoint returns `429 Too Many Requests` without performing any database lookup.

### AC-08: PIN Not Reusable After Successful Validation

- **Given** a PIN was successfully validated and a walk-in booking was created using the issued validation token,
- **When** the same PIN is submitted again,
- **Then** the endpoint returns `400 Bad Request`.

### AC-09: Cross-Tenant Isolation

- **Given** a valid PIN was generated for Organization A,
- **When** a customer submits that PIN to the validate endpoint for Organization B's slug,
- **Then** the endpoint returns `400 Bad Request` (no match found across tenant boundary).

### AC-10: PIN Never Returned After Generation

- **Given** a PIN has been generated and stored,
- **When** any subsequent API call (list, get, analytics, etc.) is made,
- **Then** the plaintext PIN is never present in any API response body.

### AC-11: Walk-In Booking Requires Valid Token

- **Given** a walk-in booking submission is made to `POST /api/public/:slug/walk-in` without a valid, unexpired, unused validation token,
- **Then** the endpoint returns `401 Unauthorized` and no booking is created.

### AC-12: Validation Token is Single-Use

- **Given** a validation token was already consumed to create a booking,
- **When** the same token is used to attempt a second booking,
- **Then** the endpoint returns `401 Unauthorized`.

---

## 8. Out of Scope

- QR code generation as an alternative to PIN entry (Phase 2).
- Owner-facing dashboard showing a full history of all generated PINs and their usage.
- Barber-facing list of currently active (pending) PINs — only the most recently generated PIN is shown in the mobile app immediately after creation.
- PIN regeneration or manual PIN revocation by barber/owner.
- SMS or email delivery of the PIN to the customer.
- Walk-in registration without any presence verification (open/anonymous queue joining).
- Configurable PIN length (always 4 digits for MVP).
- Configurable PIN expiry duration (always 30 minutes for MVP).
- Configurable active PIN limit per organization (always 10 for MVP).
- Persistent rate-limit storage across server restarts (in-memory rate limiting acceptable for MVP).
