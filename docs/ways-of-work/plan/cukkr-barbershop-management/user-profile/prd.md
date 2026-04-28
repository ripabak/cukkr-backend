# Feature PRD: User Profile

**Version:** 1.0
**Date:** April 27, 2026
**Status:** Draft

---

## 1. Feature Name

**User Profile** — View and edit personal account information, change credentials, and manage session for both barbershop owners and barbers.

---

## 2. Epic

- **Parent Epic:** [Cukkr — Barbershop Management & Booking System](../epic.md)

---

## 3. Goal

### Problem

Owners and barbers using the Cukkr mobile app need a dedicated space to manage their personal account data — updating their name, bio, or avatar, changing their password, and updating a contact (email or phone) without losing access to their account. Currently, no such self-service profile management exists, forcing any changes to go through manual support or workarounds, reducing trust in the platform and adding friction to daily use.

### Solution

Provide a **User Profile screen** in the mobile app where both owners and barbers can view their current profile information, edit their name and bio, upload or change their avatar, update their password securely, and change their email or phone number using OTP verification on both old and new contacts. A logout action with a confirmation modal closes the session cleanly.

### Impact

- Reduce support requests for credential changes by enabling full self-service.
- Increase platform trust by giving users control over their personal data.
- Ensure account security through OTP-verified contact changes.
- Improve onboarding completion by letting users personalize their profile (avatar, bio) after signup.

---

## 4. User Personas

| Persona | Role | Relevance |
|---|---|---|
| **Barbershop Owner** | `owner` | Views and edits their personal profile; manages credentials. |
| **Barber** | `barber` | Views and edits their personal profile; manages credentials. |

Both personas have identical profile management capabilities. Role (owner/barber) is not editable via this feature.

---

## 5. User Stories

### Profile View & Edit

- **US-01:** As a **User (Owner / Barber)**, I want to view my current name, bio, and avatar on the Profile screen so that I can confirm my account information at a glance.
- **US-02:** As a **User**, I want to tap "Edit Profile" to update my name and bio so that my profile reflects accurate information.
- **US-03:** As a **User**, I want to upload or replace my avatar photo so that I appear with a recognizable image in the app.

### Password Management

- **US-04:** As a **User**, I want to change my password by entering my current password and a new password so that I can keep my account secure without needing to log out.
- **US-05:** As a **User**, I want to see an error if my current password is incorrect so that I understand why the password change was rejected.
- **US-06:** As a **User**, I want the new password to require a minimum of 8 characters so that weak passwords are prevented.

### Email & Phone Change

- **US-07:** As a **User**, I want to initiate an email change by entering my new email address so that the system sends OTP codes to both my old and new email for verification.
- **US-08:** As a **User**, I want to complete the email change by entering both OTPs so that the change is only applied after I've verified ownership of both addresses.
- **US-09:** As a **User**, I want to change my phone number with OTP verification on both old and new numbers so that I can update my contact without losing account access.
- **US-10:** As a **User**, I want to see a clear error if an OTP I entered is invalid or expired so that I know to request a new one.

### Session Management

- **US-11:** As a **User**, I want to tap "Logout" and confirm via a modal so that I can securely end my session without accidentally logging out.

---

## 6. Requirements

### 6.1 Functional Requirements

#### Profile View

- Display current: **name**, **bio** (optional), **avatar** (fallback to initials if no image), **email**, **phone** (if set), **role** (Owner / Barber, read-only).
- Profile data fetched from `PATCH /api/me` (GET variant) or via the Better Auth session user object.

#### Edit Name & Bio

- Inline edit form (or bottom sheet modal) for **name** (required, max 100 chars) and **bio** (optional, max 300 chars).
- `PATCH /api/me` with `{ name, bio }` updates the record; returns `200 OK` with updated user.
- Optimistic UI update; revert on API error.

#### Avatar Upload

- User selects an image from the device gallery or camera.
- Client-side resize to max 512×512 px before upload.
- Upload via `POST /api/me/avatar` (multipart form-data); server validates MIME type (`image/jpeg`, `image/png`, `image/webp`) and max file size (5 MB).
- Successful upload returns a new `avatarUrl`; profile screen updates immediately.
- Invalid file type or size returns `422 Unprocessable Entity` with a descriptive message.

#### Change Password

- Form: **Current Password** (required), **New Password** (required, min 8 chars), **Confirm New Password** (required, must match new password).
- `POST /api/me/change-password` with `{ currentPassword, newPassword }`.
- Server verifies `currentPassword` against the stored hash; mismatch returns `400 Bad Request` with message "Current password is incorrect".
- On success, session remains active (no forced re-login); returns `200 OK`.

#### Change Email

- Two-phase OTP flow:
  1. User enters new email → `POST /api/me/change-email` sends OTP to both old and new email addresses.
  2. User enters both OTPs → `POST /api/me/change-email/verify` with `{ oldOtp, newOtp }` applies the change.
- OTPs are 6-digit numeric, valid for 5 minutes.
- If the new email is already in use by another account, `POST /api/me/change-email` returns `409 Conflict`.
- Expired or invalid OTP returns `400 Bad Request`.
- On success, session cookie is refreshed with the new email.

#### Change Phone

- Two-phase OTP flow (mirrors email change):
  1. User enters new phone → system sends OTP to old and new phone numbers (SMS or in-app notification for MVP).
  2. User enters both OTPs → phone is updated.
- Same OTP validation rules as email change (6-digit, 5-minute expiry).
- If new phone is already registered to another account, returns `409 Conflict`.

#### Logout

- "Logout" button opens a confirmation modal ("Are you sure you want to log out?").
- On confirm: `POST /api/auth/sign-out` (Better Auth); session cookie cleared; user redirected to the login screen.
- Cancel dismisses modal without action.

### 6.2 Non-Functional Requirements

- **Security:**
  - All profile endpoints require an authenticated session (`HttpOnly` cookie).
  - Password change requires current password verification — no reset via email for this flow.
  - OTPs are hashed before storage; raw OTP never returned in API responses.
  - OTP brute-force protection: max 5 failed OTP attempts per flow instance; subsequent attempts return `429 Too Many Requests`.
  - File uploads validated server-side for MIME type and size regardless of client-side checks.
- **Privacy:** Avatar images stored in S3-compatible storage; URLs are not guessable (use randomized object keys).
- **Performance:** Profile load ≤ 300ms (p95); avatar upload ≤ 2s for a 5 MB image on a 4G connection.
- **Accessibility:** All form fields have appropriate labels; error messages are descriptive and actionable.
- **Validation:** All inputs validated via TypeBox schema server-side; client-side validation mirrors server rules.

---

## 7. Acceptance Criteria

### AC-US-01: Profile View

- [ ] `GET /api/me` returns `{ id, name, bio, avatarUrl, email, phone, role }` for the authenticated user.
- [ ] Unauthenticated requests return `401 Unauthorized`.

### AC-US-02: Edit Name & Bio

- [ ] `PATCH /api/me` with `{ name: "New Name", bio: "My bio" }` returns `200 OK` with updated fields.
- [ ] `name` exceeding 100 characters returns `422 Unprocessable Entity`.
- [ ] Empty `name` returns `422 Unprocessable Entity`.
- [ ] `bio` exceeding 300 characters returns `422 Unprocessable Entity`.

### AC-US-03: Avatar Upload

- [ ] `POST /api/me/avatar` with a valid JPEG/PNG/WebP ≤ 5 MB returns `200 OK` with `{ avatarUrl }`.
- [ ] Uploading a file with unsupported MIME type returns `422 Unprocessable Entity`.
- [ ] Uploading a file exceeding 5 MB returns `422 Unprocessable Entity`.
- [ ] The new `avatarUrl` is reflected in subsequent `GET /api/me` responses.

### AC-US-04/05/06: Change Password

- [ ] `POST /api/me/change-password` with correct `currentPassword` and valid `newPassword` returns `200 OK`.
- [ ] Incorrect `currentPassword` returns `400 Bad Request` with message "Current password is incorrect".
- [ ] `newPassword` with fewer than 8 characters returns `422 Unprocessable Entity`.
- [ ] Session remains active after a successful password change.

### AC-US-07/08: Change Email

- [ ] `POST /api/me/change-email` with a valid new email sends OTPs to old and new addresses and returns `202 Accepted`.
- [ ] New email already in use by another account returns `409 Conflict`.
- [ ] `POST /api/me/change-email/verify` with both correct OTPs returns `200 OK` and updates the user's email.
- [ ] Expired or invalid OTP returns `400 Bad Request` with descriptive message.
- [ ] 6th failed OTP attempt returns `429 Too Many Requests`.

### AC-US-09/10: Change Phone

- [ ] `POST /api/me/change-phone` with a valid new phone number initiates OTP flow and returns `202 Accepted`.
- [ ] New phone already in use by another account returns `409 Conflict`.
- [ ] `POST /api/me/change-phone/verify` with both correct OTPs returns `200 OK` and updates the user's phone.
- [ ] Invalid OTP returns `400 Bad Request`.

### AC-US-11: Logout

- [ ] `POST /api/auth/sign-out` clears the session cookie and returns `200 OK`.
- [ ] Subsequent authenticated API calls with the cleared cookie return `401 Unauthorized`.

---

## 8. Out of Scope

- **Social login** (Google, Apple) — not supported for MVP; email/password only.
- **Account deletion / GDPR right to erasure** — Phase 2 compliance feature.
- **Two-factor authentication (2FA / TOTP)** — Phase 2 security upgrade.
- **Notification preferences** (push notification opt-in/opt-out) — Phase 2.
- **Linked accounts** (connecting multiple auth methods to one profile) — Phase 2.
- **Avatar deletion** (reverting to initials) — Phase 2; MVP supports upload/replace only.
- **Profile visibility settings** (public vs. private bio) — not applicable for MVP internal-facing app.
- **Language / locale preferences** — Indonesian only for MVP.
