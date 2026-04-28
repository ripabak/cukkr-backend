# Feature PRD: Authentication & User Management

**Version:** 1.0
**Date:** April 26, 2026
**Status:** Draft

---

## 1. Feature Name

**Authentication & User Management**

---

## 2. Epic

- **Parent Epic:** [Cukkr — Barbershop Management & Booking System](../epic.md)

---

## 3. Goal

### Problem

Cukkr serves three distinct user types — owners, barbers, and customers — each requiring a secure, reliable identity layer before they can interact with the platform. Without proper authentication, any user could access sensitive barbershop data, bookings, or multi-tenant organization resources belonging to other businesses. Currently there is no digital identity system in place; all coordination is verbal or via informal channels, meaning there is no user account to protect or recover.

### Solution

Implement a full-featured authentication system using Better Auth with the Organizations plugin. The system covers email/password registration with 4-digit OTP verification, session management via secure HTTP-only cookies, a forgot-password recovery flow (OTP-based), and a verified email/phone change flow. The multi-tenant session context (active organization) is injected into every authenticated request, enabling downstream authorization.

### Impact

- Provides a secure, verified identity for every owner, barber, and customer account.
- Prevents cross-tenant data access via per-session organization scoping.
- Enables the entire downstream feature set (bookings, services, analytics) that relies on authenticated, organization-scoped sessions.
- Reduces friction by keeping session cookies persistent, so users do not need to re-authenticate on every app launch.

---

## 4. User Personas

| Persona | Role | Interaction |
|---|---|---|
| **Barbershop Owner** | `owner` | Registers a new account, verifies email via OTP, manages their own profile, changes credentials. |
| **Barber** | `barber` | Accepts an invitation via a registered account; logs in to access their daily schedule. |
| **Appointment Customer** | `customer` | Registers/logs in on the customer web app to self-book appointments. |
| **All Authenticated Users** | — | Can change their email or phone number (with OTP verification) and reset forgotten passwords. |

---

## 5. User Stories

### Registration & Verification

- **US-01:** As an **owner**, I want to register with my email and password so that I can create my Cukkr account.
- **US-02:** As a **new user**, I want to receive a 4-digit OTP to my email after registration so that my email address is verified before I can use the platform.
- **US-03:** As a **new user**, I want the OTP to expire after 5 minutes so that stale verification codes cannot be reused.
- **US-04:** As a **new user**, I want to be able to request a new OTP if the original one expires or is not received.

### Login & Sessions

- **US-05:** As a **registered user**, I want to log in with my email and password so that I can access my dashboard.
- **US-06:** As a **logged-in user**, I want my session to persist in a secure cookie so that I do not have to log in again on the next app launch.
- **US-07:** As a **logged-in user**, I want to log out so that my session is invalidated and I am redirected to the login screen.

### Forgot Password

- **US-08:** As a **user who forgot their password**, I want to initiate a password reset by providing my email so that I can regain access to my account.
- **US-09:** As a **user in the reset flow**, I want to receive a 4-digit OTP to my email so that I can prove ownership of the account before setting a new password.
- **US-10:** As a **user in the reset flow**, I want to set a new password after the OTP is verified so that I can access my account again.
- **US-11:** As a **user in the reset flow**, I want the OTP to expire after 5 minutes so that reset tokens cannot be exploited later.

### Profile & Credential Changes

- **US-12:** As a **logged-in user**, I want to change my email address by verifying the OTP sent to both my old and new email so that the change is confirmed from both sides.
- **US-13:** As a **logged-in user**, I want to change my phone number by verifying OTP on both the old and new phone contacts so that ownership of both is confirmed.
- **US-14:** As a **logged-in user**, I want to change my password by providing my current password and a new password so that I can update my credentials securely.
- **US-15:** As a **logged-in user**, I want to update my display name, bio, and avatar so that my profile reflects my current identity.

### Multi-Tenant Session Context

- **US-16:** As a **member of multiple organizations**, I want my active organization to be tracked in my session so that all data I see is scoped to the correct barbershop.
- **US-17:** As an **owner or barber**, I want to switch my active organization so that I can manage a different barbershop without logging out.

---

## 6. Requirements

### 6.1 Functional Requirements

#### Registration

- Accept `name`, `email`, and `password` fields.
- Password minimum length: 8 characters.
- After registration, send a 4-digit OTP to the provided email address.
- OTP expires in 5 minutes from generation.
- Account is not fully active until the OTP is verified.
- If OTP expires, the user can request a new one (rate-limited to 3 resend attempts per 15 minutes per email).

#### OTP Verification

- OTP is a 4-digit numeric code.
- OTP must be stored hashed (bcrypt) in the database; the plaintext must never be persisted or logged.
- OTP is single-use; it is invalidated immediately after first use.
- OTP is scoped to a specific user and action type (registration, password-reset, email-change, phone-change).
- A failed OTP attempt increments a counter; after 5 consecutive failures for the same OTP, it is invalidated.

#### Login

- Authenticate via email + password.
- On success, create a session and set a `HttpOnly`, `Secure`, `SameSite=None` cookie.
- Return a 401 with a generic error message on failure (do not distinguish between "user not found" and "wrong password" to prevent user enumeration).
- Implement rate limiting: max 10 failed login attempts per IP per 15 minutes; return 429 after threshold.

#### Session Management

- Sessions managed by Better Auth; stored in the `session` table.
- Session cookie must have `HttpOnly`, `Secure`, `SameSite=None` attributes.
- Session is extended on activity (sliding expiry).
- `GET /api/auth/session` returns the current user and active organization context.
- Logout invalidates the session server-side and clears the cookie.

#### Forgot Password

- Accepts email address; always returns a success response regardless of whether the email exists (to prevent user enumeration).
- If email exists, sends a 4-digit OTP.
- OTP valid for 5 minutes, single-use.
- After OTP verification, allow setting a new password (minimum 8 characters).
- Previous sessions are not invalidated after a password reset (Better Auth default); only the reset OTP is consumed.

#### Email Change

- Requires the user to be authenticated.
- Sends OTP to the **old** email address; user must verify it first.
- Then sends OTP to the **new** email address; user must verify it.
- Email is updated in the database only after both verifications succeed.
- If the new email is already in use, return a 409 conflict error.

#### Phone Change

- Requires the user to be authenticated.
- Follows the same dual-OTP flow as email change (old phone → new phone).
- Phone numbers are stored in E.164 format.
- If the new phone is already in use, return a 409 conflict error.

#### Password Change (Authenticated)

- Requires the user to be authenticated.
- Accepts `currentPassword` and `newPassword` fields.
- Validates `currentPassword` against the stored hash before updating.
- Returns a 400 if `currentPassword` is incorrect.
- New password must be at least 8 characters.

#### Profile Update

- Allows updating `name`, `bio`, and `avatar` (avatar via URL or future file upload).
- All fields optional in the request; only provided fields are updated.

#### Multi-Tenant Organization Context

- Active organization ID is set on the session via Better Auth's `setActiveOrganization` API.
- All downstream module handlers access `activeOrganizationId` from the session context; they never accept it as a request body or query param.
- Switching organizations updates the session's active organization; no re-authentication required.

### 6.2 Non-Functional Requirements

- **Security:**
  - OTPs stored as bcrypt hashes; never returned in API responses or logs.
  - Passwords stored as bcrypt hashes (cost factor ≥ 10).
  - Login rate-limited to 10 attempts / IP / 15 minutes (return HTTP 429).
  - OTP resend rate-limited to 3 attempts / email / 15 minutes (return HTTP 429).
  - Walk-in PIN and forgot-password endpoints always return success to prevent user enumeration.
  - No `process.env` usage outside `src/lib/env.ts`.
  - All session cookies: `HttpOnly`, `Secure`, `SameSite=None`.
- **Performance:**
  - Login and session validation endpoints respond in ≤ 200 ms (p95).
- **Reliability:**
  - OTP email delivery must be retried up to 3 times on transient SMTP failure before returning an error.
- **Privacy:**
  - Email addresses and phone numbers are never exposed in error messages beyond the user's own session.
  - Verification OTPs are single-use and time-limited to minimize exposure window.
- **Input Validation:**
  - All inputs validated via Elysia TypeBox schema at the handler layer.
  - Email addresses validated for RFC 5322 format.
  - Phone numbers validated for E.164 format.

---

## 7. Acceptance Criteria

### US-01 — Registration

- [ ] **Given** a valid name, email, and password (≥ 8 chars), **when** the user POSTs to the registration endpoint, **then** a new unverified account is created and an OTP is sent to the email.
- [ ] **Given** an email already registered, **when** registration is attempted, **then** a 409 conflict response is returned.
- [ ] **Given** a password shorter than 8 characters, **when** registration is attempted, **then** a 400 validation error is returned.

### US-02 / US-03 — OTP Verification

- [ ] **Given** a valid OTP submitted within 5 minutes, **when** the user verifies the OTP, **then** the account is marked as verified and a session is created.
- [ ] **Given** an expired OTP (> 5 minutes), **when** submitted, **then** a 400 error is returned with a message indicating the code has expired.
- [ ] **Given** a correct OTP, **when** it is submitted a second time, **then** a 400 error is returned (single-use enforcement).
- [ ] **Given** 5 consecutive failed OTP attempts, **when** the next attempt is made, **then** the OTP is invalidated and a 400 error is returned.

### US-04 — OTP Resend

- [ ] **Given** a valid unverified email, **when** the user requests a resend, **then** a new OTP is generated and sent, and the old OTP is invalidated.
- [ ] **Given** more than 3 resend requests in 15 minutes for the same email, **when** a fourth request is made, **then** a 429 Too Many Requests response is returned.

### US-05 / US-06 — Login & Session

- [ ] **Given** correct credentials, **when** the user logs in, **then** a session cookie is set with `HttpOnly`, `Secure`, `SameSite=None` attributes.
- [ ] **Given** an unverified account, **when** the user attempts to log in, **then** a 403 response is returned prompting email verification.
- [ ] **Given** wrong credentials, **when** the user attempts to log in, **then** a generic 401 is returned (no user enumeration).
- [ ] **Given** 10 failed login attempts from the same IP within 15 minutes, **when** the 11th attempt is made, **then** a 429 is returned.

### US-07 — Logout

- [ ] **Given** an active session, **when** the user POSTs to the logout endpoint, **then** the session is invalidated server-side and the cookie is cleared.

### US-08 / US-09 / US-10 / US-11 — Forgot Password

- [ ] **Given** any email (registered or not), **when** the forgot-password endpoint is called, **then** a 200 response is always returned.
- [ ] **Given** a registered email, **when** the endpoint is called, **then** a 4-digit OTP is sent to that email.
- [ ] **Given** a valid OTP, **when** a new password (≥ 8 chars) is submitted, **then** the password is updated and the OTP is invalidated.
- [ ] **Given** an expired OTP, **when** the reset is attempted, **then** a 400 error is returned.

### US-12 / US-13 — Email & Phone Change

- [ ] **Given** an authenticated user, **when** an email change is requested, **then** an OTP is sent to the old email.
- [ ] **Given** successful old-email OTP verification, **when** the new email OTP is also verified, **then** the email is updated in the database.
- [ ] **Given** a new email already in use, **when** the change is submitted, **then** a 409 conflict is returned.
- [ ] The same pattern applies symmetrically for phone number changes.

### US-14 — Password Change

- [ ] **Given** a correct `currentPassword`, **when** a new password (≥ 8 chars) is provided, **then** the password is updated.
- [ ] **Given** an incorrect `currentPassword`, **when** the change is attempted, **then** a 400 error is returned.

### US-16 / US-17 — Organization Context

- [ ] **Given** a session with an active organization, **when** any protected endpoint is called, **then** the `activeOrganizationId` is correctly injected into the request context.
- [ ] **Given** a logged-in user who is a member of two organizations, **when** they switch the active organization, **then** subsequent requests use the new organization's ID.

---

## 8. Out of Scope

- Google / Apple / OAuth social login (any provider).
- SMS-based OTP (email OTP only for MVP).
- Two-factor authentication (TOTP / authenticator app).
- Phone number as primary login identifier (email is the only login credential for MVP).
- Account deletion / GDPR right-to-erasure flow (Phase 2).
- Device management / active session listing and remote revocation (Phase 2).
- Invite-based barber registration flow (covered in the Barber Management feature).
- Customer web registration (shares the same auth system but is addressed in the Customer Web Booking feature).
- Admin / super-admin roles or platform-level user management.
- Passkeys / WebAuthn.

---

*Feature PRD maintained by the Cukkr engineering team. Update version and date on each revision.*
