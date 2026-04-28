# Feature PRD: Barbershop Settings

**Version:** 1.0
**Date:** April 26, 2026
**Status:** Draft

---

## 1. Feature Name

**Barbershop Settings**

---

## 2. Epic

- **Parent Epic:** [Cukkr — Barbershop Management & Booking System](../epic.md)

---

## 3. Goal

### Problem

After a barbershop owner completes the onboarding wizard, their business details are fixed with the values entered during setup. In practice, barbershops change their names, move addresses, update their description, or need to rebrand their public booking URL. Without a dedicated settings screen, owners have no way to keep their public-facing profile accurate, leading to stale information being displayed to customers on the booking landing page. A misspelled name or outdated address erodes customer trust and can result in missed walk-ins and appointments.

### Solution

Provide a Settings screen within the mobile app that lets the barbershop owner view and edit the four core profile fields of their active organization: **Name**, **Description**, **Address**, and **Booking URL (slug)**. The slug field includes real-time availability checking against existing organizations so that owners receive instant feedback before saving, preventing collisions at the database level. Changes are persisted via `PATCH /api/barbershop/settings` and reflected immediately on the public booking landing page.

### Impact

- Eliminates stale or inaccurate barbershop profile information by giving owners full control post-onboarding.
- Prevents failed slug assignments and duplicate booking URL collisions via real-time validation.
- Reduces customer confusion (wrong address, outdated shop name) that leads to lost walk-ins.
- Ensures the public booking page (`/{slug}`) always reflects the owner's latest branding and location.

---

## 4. User Personas

| Persona | Role | Interaction |
|---|---|---|
| **Barbershop Owner** | `owner` | Primary actor. Views and edits the profile of their active barbershop. |
| **Appointment / Walk-In Customer** | `customer` | Indirectly affected; sees the updated name, description, and accesses the shop via the (possibly new) slug. |

---

## 5. User Stories

### View Settings

- **US-01:** As an **owner**, I want to open the Barbershop Settings screen and see the current name, description, address, and booking URL slug of my active barbershop so that I know what customers are currently seeing.

### Edit Name

- **US-02:** As an **owner**, I want to edit my barbershop's name so that any rebranding is reflected on the public booking page.
- **US-03:** As an **owner**, I want the name field to be required (non-empty) so that I cannot accidentally save a barbershop with a blank name.

### Edit Description

- **US-04:** As an **owner**, I want to edit the description of my barbershop so that I can provide customers with accurate information about my services and atmosphere.
- **US-05:** As an **owner**, I want the description field to be optional so that I am not blocked from saving if I choose not to provide one.

### Edit Address

- **US-06:** As an **owner**, I want to edit the physical address of my barbershop so that customers and walk-ins can find the correct location.
- **US-07:** As an **owner**, I want the address field to be optional so that I can save settings without a physical address if needed.

### Edit Booking URL Slug

- **US-08:** As an **owner**, I want to edit my barbershop's booking URL slug (e.g., change `hendra-barbershop` to `hendra-cuts`) so that my public booking link matches my current branding.
- **US-09:** As an **owner**, I want to see real-time feedback while I type my desired slug so that I know immediately whether it is available before I attempt to save.
- **US-10:** As an **owner**, I want the slug field to enforce format rules (lowercase alphanumeric and hyphens only; no spaces, no uppercase, no special characters) so that invalid URLs cannot be created.
- **US-11:** As an **owner**, I want the system to accept my current slug as "available" when it is unchanged so that I am not blocked from saving other fields without changing the slug.
- **US-12:** As an **owner**, I want to see a clear error message if the slug I entered is already taken by another barbershop so that I can choose a different slug without confusion.

### Save & Confirmation

- **US-13:** As an **owner**, I want to tap a "Save" button to persist all changes at once so that I control when updates go live.
- **US-14:** As an **owner**, I want to see a success confirmation after saving so that I know the changes have been applied.
- **US-15:** As an **owner**, I want unsaved changes to be discarded if I navigate away without saving so that accidental edits do not go live.
- **US-16:** As an **owner**, I want the "Save" button to be disabled until at least one field has changed so that I cannot submit a no-op update.

---

## 6. Requirements

### Functional Requirements

#### Settings Retrieval

- `GET /api/barbershop` returns the authenticated user's active organization profile: `name`, `description`, `address`, `slug`.
- Endpoint is protected by authentication middleware; requires a valid session with an active organization (`requireOrganization: true`).
- Response always reflects the latest persisted state (no client-side caching of stale data).

#### Settings Update

- `PATCH /api/barbershop/settings` accepts a partial update body with any combination of `name`, `description`, `address`, `slug`.
- At least one field must be present in the request body; if the body is empty, the endpoint returns `400 Bad Request`.
- `name` is required when provided and must be between 2 and 100 characters.
- `description` is optional; maximum 500 characters.
- `address` is optional; maximum 300 characters.
- `slug` is optional when provided in the body but must pass all slug validation rules (see below) before the record is updated.
- If the provided `slug` is already taken by a **different** organization, the endpoint returns `409 Conflict` with a structured error message.
- If the provided `slug` belongs to the **requesting** organization (i.e., no change), it is accepted without triggering a uniqueness error.
- Successful update returns `200 OK` with the full updated organization profile.
- Updates are scoped to the owner's `activeOrganizationId`; cross-tenant mutation is not possible.

#### Real-Time Slug Availability Check

- `GET /api/barbershop/slug-check?slug={value}` returns `{ available: boolean }`.
- The check is unauthenticated-safe but must be rate-limited (maximum 30 requests per minute per IP) to prevent enumeration.
- If the requesting user is authenticated and the slug belongs to their active organization, the response returns `available: true`.
- The check is case-insensitive (slug is lowercased before comparison).

#### Slug Validation Rules

- Allowed characters: `a–z`, `0–9`, `-` (hyphen).
- Must start and end with an alphanumeric character (not a hyphen).
- Minimum length: 3 characters. Maximum length: 63 characters.
- No consecutive hyphens (`--`).
- All uppercase input is automatically lowercased before persistence and before the availability check.

### Non-Functional Requirements

- **Security:** Endpoint is protected by `requireOrganization: true` middleware. An owner can only modify the organization they are currently active in. No `organizationId` is accepted in the request body — it is always derived from the session.
- **Input Validation:** All fields are validated via Elysia TypeBox schemas at the route level before reaching the service layer.
- **Performance:** `PATCH /api/barbershop/settings` must complete in ≤ 500 ms (p95). Slug availability check must complete in ≤ 200 ms (p95).
- **Idempotency:** Submitting the same payload twice in succession must produce the same result with no side effects.
- **Consistency:** After a successful slug change, the previous slug is immediately freed and the new slug is live — no grace period or redirect.
- **No `process.env` usage:** All configuration must be accessed via `src/lib/env.ts`.
- **No plain errors:** All thrown exceptions must use `AppError` from `src/core/error.ts`.

---

## 7. Acceptance Criteria

### AC-01 — Load Current Settings

**Given** an authenticated owner with an active organization,  
**When** they open the Barbershop Settings screen,  
**Then** the screen displays the current `name`, `description`, `address`, and `slug` exactly as stored in the database.

---

### AC-02 — Save Valid Changes

**Given** an owner has edited one or more fields with valid values,  
**When** they tap "Save",  
**Then** a `PATCH /api/barbershop/settings` request is sent, the server returns `200 OK`, and the updated values are reflected on screen immediately.

---

### AC-03 — Name Validation

**Given** an owner clears the name field and attempts to save,  
**When** the "Save" button is tapped,  
**Then** the request is rejected (client-side or server returns `400`) and an error message "Name is required" is displayed.

---

### AC-04 — Slug Format Enforcement

**Given** an owner types an invalid slug (e.g., `My Shop!!`, `--hendra`, `ab`),  
**When** they type in the slug field,  
**Then** a format validation message is shown inline (e.g., "Only lowercase letters, numbers, and hyphens allowed; must be 3–63 characters") and the "Save" button remains disabled.

---

### AC-05 — Slug Availability (Taken by Another)

**Given** an owner types a slug that is already used by a different organization,  
**When** the availability check completes (≤ 200 ms after typing stops),  
**Then** the slug field shows an "Already taken" indicator and the "Save" button remains disabled.

---

### AC-06 — Slug Availability (Own Current Slug)

**Given** an owner has not changed their slug,  
**When** the availability check runs,  
**Then** the slug field shows "Available" (or neutral state) and saving is not blocked.

---

### AC-07 — Slug Conflict on Save (Race Condition)

**Given** an owner's slug passed the real-time check but was claimed by another user before the save request arrived,  
**When** `PATCH /api/barbershop/settings` is called,  
**Then** the server returns `409 Conflict` and the client displays an error: "This URL is no longer available. Please choose a different one."

---

### AC-08 — Slug Immediately Active After Change

**Given** an owner successfully changes their slug from `old-slug` to `new-slug`,  
**When** a customer navigates to `/{new-slug}`,  
**Then** the public booking page loads correctly with the updated barbershop details.

---

### AC-09 — Unauthorized Access Rejected

**Given** a request to `PATCH /api/barbershop/settings` with no valid session cookie,  
**When** the request arrives,  
**Then** the server returns `401 Unauthorized`.

---

### AC-10 — Cross-Tenant Mutation Blocked

**Given** an authenticated owner whose active organization is Org A,  
**When** they attempt to modify the settings of Org B (e.g., by manipulating the request),  
**Then** the update applies only to Org A; Org B is unaffected.

---

### AC-11 — Slug Availability Rate Limit

**Given** a client sends more than 30 slug-check requests per minute from the same IP,  
**When** the 31st request arrives,  
**Then** the server returns `429 Too Many Requests`.

---

### AC-12 — Empty Update Body Rejected

**Given** a `PATCH /api/barbershop/settings` request is sent with an empty JSON body `{}`,  
**When** the request arrives,  
**Then** the server returns `400 Bad Request`.

---

## 8. Out of Scope

- **Logo / image upload:** Uploading or changing the barbershop logo is deferred to Phase 2 (dependent on file storage provider selection).
- **Open hours configuration:** Managing per-day open/close schedules is a separate feature (`open-hours`).
- **Branch / multi-location management:** Creating or switching between multiple barbershop organizations is handled by the Multi-Barbershop feature.
- **Slug redirect:** After a slug change, no redirect from the old slug to the new slug is implemented (old slug is immediately freed).
- **Barbershop deletion:** Deleting or deactivating an organization is out of scope for this feature.
- **Barber-initiated settings changes:** Only users with the `owner` role in the active organization may edit barbershop settings. Barbers have read-only access at most.
- **Automatic slug suggestion:** The system does not suggest alternative slugs when a chosen one is unavailable.
- **Social media links or contact fields:** Additional profile fields beyond name, description, address, and slug are not included.
