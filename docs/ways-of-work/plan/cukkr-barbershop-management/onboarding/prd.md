# Feature PRD: Onboarding & Barbershop Setup

**Version:** 1.0
**Date:** April 26, 2026
**Status:** Draft

---

## 1. Feature Name

**Onboarding & Barbershop Setup (4-Step Wizard)**

---

## 2. Epic

- **Parent Epic:** [Cukkr — Barbershop Management & Booking System](../epic.md)

---

## 3. Goal

### Problem

After a new owner creates their Cukkr account, they land in an empty dashboard with no barbershop, no barbers, and no services configured. Without a guided setup experience, owners face a blank slate and may not understand the correct sequence of actions needed before their barbershop can go live and start accepting bookings. This creates friction and risk of abandonment before the owner ever receives value from the platform.

### Solution

Implement a 4-step guided onboarding wizard that appears immediately after a new owner registers and verifies their email. The wizard walks the owner through: (1) creating their barbershop profile with a unique booking URL slug; (2) inviting barbers (skippable); (3) reviewing and confirming pending invitations; and (4) creating their first service. Completing the wizard leaves the barbershop in a fully operational state — ready to generate and share its booking link.

### Impact

- Reduces owner onboarding time to ≤ 5 minutes from registration to first service created.
- Eliminates blank-state confusion by providing a clear, sequential task flow.
- Increases the likelihood that a newly registered owner completes the minimum viable setup required to go live.
- Validates slug availability in real time, preventing failed slug assignments downstream.
- Sets the foundation for all other features (bookings, scheduling, analytics) that depend on an organization with at least one service configured.

---

## 4. User Personas

| Persona | Role | Interaction |
|---|---|---|
| **Barbershop Owner** | `owner` | Primary actor. Completes the wizard immediately after first login to configure their barbershop and make it operational. |
| **Invited Barber** | `barber` | Receives invitation during Step 2; their onboarding starts after they accept the invitation from their own device. |

---

## 5. User Stories

### Wizard Entry & Progress

- **US-01:** As an **owner**, I want the onboarding wizard to launch automatically after my email is verified so that I am guided to set up my barbershop without having to find the setup steps myself.
- **US-02:** As an **owner**, I want to see a progress indicator showing which step I am on out of 4 so that I know how far along I am in the setup process.
- **US-03:** As an **owner**, I want to be able to navigate back to a previous step so that I can correct information I have already entered.

### Step 1 — Barbershop Details

- **US-04:** As an **owner**, I want to enter my barbershop's name, description, and address so that customers can identify my business on the booking page.
- **US-05:** As an **owner**, I want to choose a unique URL slug for my booking page (e.g., `hendra-barbershop`) so that I can share a short, branded link with customers.
- **US-06:** As an **owner**, I want to see real-time feedback on whether my chosen slug is available so that I do not proceed with a slug that is already taken.
- **US-07:** As an **owner**, I want the system to enforce slug formatting rules (lowercase, alphanumeric, hyphens only) so that invalid slugs are not created.

### Step 2 — Invite Barbers

- **US-08:** As an **owner**, I want to invite barbers by entering their email or phone number so that they can join my barbershop on Cukkr.
- **US-09:** As an **owner**, I want to skip the barber invitation step so that I can complete setup first and invite barbers later.
- **US-10:** As an **owner**, I want to add multiple barber invitations before proceeding so that I can onboard my entire team in one step.
- **US-11:** As an **owner**, I want to remove a barber invitation I have queued before submitting so that I can correct mistakes.

### Step 3 — Invitation Confirmation

- **US-12:** As an **owner**, I want to see a summary list of all invitations I have sent so that I can confirm they were dispatched correctly.
- **US-13:** As an **owner**, I want to see each invitee's email/phone and their invitation status (`Pending`) so that I know my invitations are in flight.
- **US-14:** As an **owner** who skipped Step 2, I want Step 3 to show an empty state with a note that I can invite barbers later so that I do not feel blocked from completing setup.

### Step 4 — First Service

- **US-15:** As an **owner**, I want to create my first service by providing a name, price, and duration so that my barbershop has at least one bookable service when it goes live.
- **US-16:** As an **owner**, I want to optionally add a description and a discount percentage to my first service so that I can fully configure it during onboarding.
- **US-17:** As an **owner**, I want the first service I create to be automatically marked as the default service so that new bookings are pre-populated with it.

### Wizard Completion

- **US-18:** As an **owner**, I want to see a success screen when I complete the wizard so that I know my barbershop is live and ready to accept bookings.
- **US-19:** As an **owner**, I want to receive my barbershop's public booking URL on the success screen so that I can immediately copy and share it with customers.
- **US-20:** As an **owner** who has already completed onboarding, I want the wizard to not appear again so that I am taken directly to my dashboard on subsequent logins.

---

## 6. Requirements

### 6.1 Functional Requirements

#### Wizard Entry & State

- The wizard is triggered automatically for any authenticated owner whose organization has not completed onboarding (no services created yet).
- A boolean flag `onboardingCompleted` on the organization record controls whether the wizard is shown.
- The wizard is a multi-step modal/screen flow; the underlying app shell is not accessible until the wizard is dismissed via completion (not closeable mid-flow).
- Wizard step state is held client-side; only the final data payloads of each step are sent to the backend on step advance or on final completion.

#### Step 1 — Barbershop Details

- Fields:
  - `name` (required): 2–100 characters.
  - `description` (optional): max 500 characters.
  - `address` (optional): max 300 characters.
  - `slug` (required): 3–60 characters; lowercase letters (`a–z`), digits (`0–9`), and hyphens (`-`) only; must not start or end with a hyphen; no consecutive hyphens.
- `PATCH /api/barbershop/settings` updates the organization record with the provided fields.
- `GET /api/barbershop/slug-check?slug=<value>` performs a real-time availability check:
  - Returns `{ available: true }` if the slug is not taken.
  - Returns `{ available: false }` if the slug is already in use.
  - Debounced on the client side (≥ 300 ms after the user stops typing).
  - Slug check is unauthenticated-safe (does not reveal organization details beyond availability).
- Slug is stored in the `organization` record. On `PATCH`, if the new slug is already taken, the API returns a 409 conflict.
- The "Next" button on Step 1 is disabled until the slug passes validation and is confirmed available.

#### Step 2 — Invite Barbers

- The owner enters one or more email addresses or phone numbers (E.164 format for phone) to invite as barbers.
- Each invitation entry is validated before being added to the local list (valid email or E.164 phone).
- Submitting the step sends `POST /api/barbers/invite` for each queued invitation.
- Invitation records are created in the `invitation` table with:
  - `organizationId` = active organization
  - `inviterId` = authenticated user ID
  - `role` = `barber`
  - `expiresAt` = now + 7 days
  - `status` = `pending`
- Each invited barber receives an in-app and push notification with Accept/Decline actions.
- If the owner skips this step, no invitations are sent and the wizard proceeds directly to Step 3.
- Duplicate invitations (same email/phone already pending for this org) return a 409; the UI silently filters duplicates before submission.

#### Step 3 — Invitation Confirmation

- Displays the list of invitations dispatched in Step 2, showing each invitee's identifier (email/phone) and status badge (`Pending`).
- If Step 2 was skipped, displays an empty state: "No invitations sent. You can invite barbers later from the Barbers screen."
- This step is read-only; no API calls are made.
- The "Next" button is always enabled (the owner cannot be blocked here).

#### Step 4 — First Service

- Fields:
  - `name` (required): 2–100 characters.
  - `price` (required): positive integer (IDR, no decimals).
  - `duration` (required): positive integer (minutes); minimum 5 minutes.
  - `description` (optional): max 500 characters.
  - `discount` (optional): integer 0–100 (percentage); defaults to 0.
  - `isActive` is forced to `true` on creation.
- Sends `POST /api/services` to create the service.
- The created service is automatically set as the default service (`isDefault = true`).
- The "Finish" button is disabled until `name`, `price`, and `duration` pass validation.

#### Wizard Completion

- On "Finish", `PATCH /api/barbershop/settings` is called to set `onboardingCompleted = true` on the organization record.
- The success screen displays:
  - A congratulatory message.
  - The full public booking URL: `https://cukkr.com/{slug}`.
  - A "Copy Link" button that writes the URL to the clipboard.
  - A "Go to Dashboard" CTA that dismisses the wizard.
- Once `onboardingCompleted = true`, the wizard is never shown again for that organization, even if all services are later deleted.

#### Existing Organization Access

- The `GET /api/barbershop` endpoint returns the organization's `onboardingCompleted` flag so the client can determine whether to show the wizard on app launch.

### 6.2 Non-Functional Requirements

- **Performance:**
  - Slug availability check (`GET /api/barbershop/slug-check`) responds in ≤ 100 ms (p95).
  - Each wizard step's API call responds in ≤ 300 ms (p95) under normal load.
- **Security:**
  - All wizard endpoints (except slug check) require an authenticated session with `requireOrganization: true`.
  - Slug check endpoint is rate-limited to 60 requests per IP per minute to prevent enumeration of all taken slugs.
  - Service `price` and `discount` fields are validated server-side to prevent negative or out-of-range values.
  - Invitation endpoints validate that the authenticated user has the `owner` role in the active organization before creating invitations.
  - `onboardingCompleted` flag can only be set to `true` by the system on wizard completion — it is not an editable field via `PATCH /api/barbershop/settings` post-onboarding.
- **Reliability:**
  - Invitation dispatch failures (push/email) do not block the wizard from proceeding; failures are queued for retry.
  - If Step 1's `PATCH` succeeds but the client crashes before Step 4, re-launching the app resumes at Step 2 (the wizard detects `slug` is set but `onboardingCompleted` is still `false`).
- **Usability:**
  - The wizard must be completable end-to-end in ≤ 5 minutes on a standard mobile connection.
  - Inline validation messages appear per field in real time; they do not wait for form submission.
  - The back button on Step 1 is disabled (no previous step); the back button on all other steps returns to the prior step.
- **Input Validation:**
  - All inputs validated via Elysia TypeBox schema at the handler layer on every API call.
  - Slug regex validated both client-side (instant feedback) and server-side (authoritative check).

---

## 7. Acceptance Criteria

### US-01 / US-02 — Wizard Entry & Progress

- [ ] **Given** a newly registered owner who has completed email verification, **when** they open the app, **then** the 4-step onboarding wizard is displayed automatically.
- [ ] **Given** an owner on any wizard step, **when** the step is rendered, **then** a progress indicator correctly shows the current step number out of 4.
- [ ] **Given** an owner who has already completed onboarding (`onboardingCompleted = true`), **when** they open the app, **then** the wizard does not appear.

### US-03 — Back Navigation

- [ ] **Given** an owner on Step 2, 3, or 4, **when** they tap "Back", **then** they are returned to the previous step with their previously entered data preserved.
- [ ] **Given** an owner on Step 1, **when** the wizard is rendered, **then** no "Back" button is visible.

### US-04 / US-05 / US-06 / US-07 — Step 1: Barbershop Details

- [ ] **Given** a valid barbershop name (2–100 chars) and an available, valid slug, **when** the owner taps "Next", **then** `PATCH /api/barbershop/settings` succeeds (200) and the wizard advances to Step 2.
- [ ] **Given** the owner types a slug that is already taken, **when** the slug check resolves, **then** an inline error "This URL is already taken" is shown and the "Next" button is disabled.
- [ ] **Given** the owner types a slug with invalid characters (e.g., uppercase, spaces, special chars), **when** they type, **then** an inline validation error is shown immediately and the "Next" button is disabled.
- [ ] **Given** a slug that starts or ends with a hyphen, **when** submitted to the API**, then** a 400 validation error is returned.
- [ ] **Given** an empty `name` field, **when** the owner attempts to advance, **then** an inline required-field error is shown and the step does not advance.

### US-08 / US-09 / US-10 / US-11 — Step 2: Invite Barbers

- [ ] **Given** a valid email address entered and the "Add" button tapped, **when** the invitation is queued, **then** it appears in the pending invitations list on the screen.
- [ ] **Given** an invalid email/phone entered, **when** the "Add" button is tapped, **then** an inline validation error is shown and the entry is not added to the list.
- [ ] **Given** an invitation in the queued list, **when** the owner taps the remove icon, **then** the entry is removed from the list.
- [ ] **Given** the owner taps "Skip", **when** confirmed, **then** no `POST /api/barbers/invite` calls are made and the wizard advances to Step 3.
- [ ] **Given** queued invitations, **when** the owner taps "Next"**, then** `POST /api/barbers/invite` is called for each entry and the wizard advances to Step 3 after all calls succeed.
- [ ] **Given** a duplicate email already pending for the same organization, **when** a second invitation is attempted, **then** the UI filters the duplicate and does not send a second API request.

### US-12 / US-13 / US-14 — Step 3: Invitation Confirmation

- [ ] **Given** invitations were sent in Step 2, **when** Step 3 is rendered, **then** each invitee's email/phone is listed with a `Pending` status badge.
- [ ] **Given** Step 2 was skipped, **when** Step 3 is rendered, **then** the empty-state message is shown and the "Next" button is enabled.
- [ ] **Given** Step 3 is rendered, **when** the owner attempts to interact, **then** no edits to the invitation list are possible (read-only).

### US-15 / US-16 / US-17 — Step 4: First Service

- [ ] **Given** a valid `name`, `price` (> 0), and `duration` (≥ 5), **when** the owner taps "Finish", **then** `POST /api/services` succeeds (201) and the service is created with `isDefault = true` and `isActive = true`.
- [ ] **Given** a missing required field (`name`, `price`, or `duration`), **when** the owner attempts to tap "Finish", **then** the button remains disabled and inline validation messages are shown.
- [ ] **Given** a `price` of 0 or a negative value, **when** submitted to the API, **then** a 400 validation error is returned.
- [ ] **Given** a `duration` less than 5 minutes, **when** submitted to the API, **then** a 400 validation error is returned.
- [ ] **Given** a `discount` value outside 0–100, **when** submitted to the API, **then** a 400 validation error is returned.

### US-18 / US-19 / US-20 — Wizard Completion

- [ ] **Given** the service is created successfully, **when** the API returns 201, **then** `PATCH /api/barbershop/settings` is called to set `onboardingCompleted = true`.
- [ ] **Given** `onboardingCompleted` is set to `true`, **when** the success screen is shown, **then** the full public booking URL (`https://cukkr.com/{slug}`) is displayed.
- [ ] **Given** the success screen is shown, **when** the owner taps "Copy Link", **then** the booking URL is written to the device clipboard.
- [ ] **Given** the wizard has been completed, **when** the owner closes and reopens the app, **then** the wizard does not appear again.

---

## 8. Out of Scope

- Uploading a barbershop logo during onboarding (Phase 2).
- Uploading a service thumbnail image during onboarding (Phase 2).
- Configuring open hours during the wizard (available separately in the Barbershop Settings screen post-onboarding).
- Inviting barbers via phone number SMS delivery (push notification only for MVP; SMS in Phase 2).
- Multi-branch creation during onboarding (additional branches created post-onboarding from the dashboard).
- Social login (Google/Apple) for owner registration (email/password only for MVP).
- In-wizard preview of the public booking page.
- Resumable wizard state persisted to the server (client-side only for MVP).
- Editing or resending individual invitations from Step 3 (available post-onboarding on the Barbers screen).
