# Product Requirements Document (PRD)
# Cukkr — Barbershop Management & Booking System

**Version:** 1.0  
**Date:** April 26, 2026  
**Status:** Draft  

---

## 1. Executive Summary

### Problem Statement

Barbershop owners today manage bookings via WhatsApp chat, manual queues, and verbal coordination between barbers — leading to double bookings, missed appointments, and zero visibility into business performance. Customers waste time in queues without knowing wait times in advance.

### Proposed Solution

**Cukkr** is a multi-tenant barbershop management system with a shareable booking link. Owners get a mobile app to manage their barbershop(s), services, barbers, schedule, and analytics. Customers get a lightweight web booking page accessible via a unique URL (e.g., `https://cukkr.com/hendra-barbershop`) — no app download required. Walk-in customers verify physical presence via a PIN provided by the barber. Appointment customers log in via the web.

### Success Criteria

| Metric | Target |
|---|---|
| Customer completes booking (web) | ≤ 60 seconds from landing page |
| Owner completes onboarding (create shop + 1 service) | ≤ 5 minutes |
| Booking detail page load time | ≤ 1.5 seconds (p95) |
| Analytics page load time | ≤ 2 seconds (p95) |
| System availability | ≥ 99.5% uptime |

---

## 2. User Experience & Functionality

### 2.1 User Personas

| Persona | Description | Primary Interface |
|---|---|---|
| **Barbershop Owner** (`owner`) | Creates and manages the barbershop, branches, services, barbers, settings, and analytics | Mobile App (React Native Expo) |
| **Barber** (`barber`) | Invited staff member; manages their own bookings, views schedule, handles walk-ins/appointments | Mobile App (React Native Expo) |
| **Customer (Appointment)** | Registers/logs in on the web to book a future appointment at a specific branch | Web App (React Vite) |
| **Customer (Walk-In)** | Arrives at the shop, scans/opens the booking link, enters a PIN given by the barber to register in the queue | Web App (React Vite) |

---

### 2.2 Feature Modules & User Stories

---

#### Module 1: Authentication (Mobile)

**User Stories:**

- As a **user**, I want to register with email and password so that I can access the app.
- As a **user**, I want to verify my account with an OTP so that my identity is confirmed.
- As a **user**, I want to reset my password via OTP so that I can regain access if I forget it.
- As a **user**, I want to change my email/phone with OTP verification on both old and new contact so that my account remains secure.

**Acceptance Criteria:**

- Registration requires: Name, Email/Phone, Password, Confirm Password.
- OTP is 4-digit, expires in 5 minutes, and can be resent after the timer expires.
- Forgot Password flow: enter email/phone → OTP → set new password.
- Email/Phone change flow: verify old contact OTP → enter new contact → verify new contact OTP.
- Session is persisted using secure HTTP-only cookies (handled by Better Auth).
- All auth endpoints return appropriate HTTP status codes (401, 422, etc.).

---

#### Module 2: Onboarding & Barbershop Creation

**User Stories:**

- As a **new owner**, I want a guided 4-step onboarding wizard so that I can set up my barbershop without confusion.
- As an **owner**, I want to invite barbers during onboarding (skippable) so that my team is ready from day one.
- As an **owner**, I want to create my first service during onboarding so that customers can book immediately.

**Acceptance Criteria:**

**Step 1 — Create Barbershop:**
- Inputs: Barbershop Name (required), Logo image (optional, upload).
- Progress indicator shows 4 steps.

**Step 2 — Invite Barber (skippable):**
- Input: Email or phone number.
- Multiple barbers can be added before proceeding.
- Each added entry shows in a list with a remove (×) button.
- "Skip" button bypasses this step.

**Step 3 — Invite Barber (confirmation):**
- Shows all pending invites with remove option.
- "Next" proceeds; "Back" returns to step 2.

**Step 4 — Create First Service:**
- Inputs: Name (required), Description (optional), Price (required, integer in IDR), Duration in minutes (required), Active (toggle).
- On submit, service is created and set as the default service.
- On success: Congratulations screen with "Open My Barbershop" CTA.

---

#### Module 3: Barbershop Settings

**User Stories:**

- As an **owner**, I want to update my barbershop name, description, address, and booking URL from the settings screen.
- As an **owner**, I want to set a unique booking URL so that I can share it with customers.

**Acceptance Criteria:**

- Each field (Name, Description, Address, Book URL) has its own edit screen with a confirm (✓) button.
- Book URL:
  - Format: `https://cukkr.com/{slug}` where `{slug}` allows only lowercase letters, numbers, and hyphens.
  - Spaces are not allowed; show inline error "Spaces are not allowed" in red.
  - On save, the backend checks slug uniqueness.
  - If slug is taken: show modal dialog "Url Not Available — `{slug}` is already in use. Please choose a different url and try again." with "Oke" button.
- Changes are saved immediately on confirm; no batch save.

---

#### Module 4: Barber Management

**User Stories:**

- As an **owner**, I want to see all barbers in my barbershop with their status so I know who is active.
- As an **owner**, I want to invite a barber by email or phone so they can join my barbershop.
- As an **owner**, I want to remove a barber from my barbershop with a confirmation so I don't do it accidentally.
- As a **barber**, I want to receive an invitation and accept or decline it via a notification.

**Acceptance Criteria:**

- Barber list shows: avatar, name, status badge (`Active` = green, `Pending` = yellow/orange).
- Invite Barber screen: single input for email/phone, send button (paper plane icon).
- Invited barber receives a notification in-app and via push with Accept/Decline actions.
- Remove Barber: confirmation modal "Remove User From Barber? This action cannot be undone." with "No, Cancel" and "Yes" buttons.
- Removed barbers are immediately removed from the list; pending invites can be cancelled.

---

#### Module 5: Services Management

**User Stories:**

- As an **owner**, I want to manage all services offered by my barbershop (CRUD).
- As an **owner**, I want to set one service as the default so it pre-selects in new bookings.
- As an **owner**, I want to toggle a service's active state so inactive services aren't shown to customers.
- As an **owner**, I want to sort and search services.

**Acceptance Criteria:**

**Service List:**
- Shows: thumbnail image (optional), name, price, "Up to review" label if image missing.
- Default badge shown on the default service.
- Active/Inactive toggle per service row.
- Search: filters list in real-time by name.
- Sort options: By Name, By Lowest/Highest price, By Recently Added, By Oldest First.

**Service Detail:**
- Sections: General Information, Pricing & Duration, Operational Details.
- Fields: Name, Description, Duration (minutes), Price (IDR), Discount (%), Final Price (auto-calculated: `price - (price × discount/100)`), Active (toggle), Default Service (toggle/button).
- "Set As Default?" confirmation modal: "This service will be the default for new bookings and must stay active. To deactivate, set another service as default." with "No, Not Yet" and "Yes" buttons.

**Create New Service:**
- Form: Name, Description (optional), Price (IDR), Duration (minutes), Active (toggle), thumbnail image upload.
- "New Service" submit button.

---

#### Module 6: Open Hours

**User Stories:**

- As an **owner**, I want to set open/closed days and hours for my barbershop so that customers can only book during business hours.

**Acceptance Criteria:**

- 7 days (Monday–Sunday) each with: toggle (open/closed), open time, close time.
- Times default to 09:00 AM – 09:00 AM.
- Tapping a time opens a scrollable time picker (hour, minute, AM/PM) with a confirm (✓) button.
- Days toggled OFF show grayed-out times and are unavailable for booking.
- Changes are saved immediately or on a global save action (TBD: auto-save vs explicit save button).

---

#### Module 7: Schedule & Booking Management (Mobile)

**User Stories:**

- As a **barber/owner**, I want to see today's active bookings at a glance so I know who is next.
- As a **barber/owner**, I want to filter bookings by status and date.
- As a **barber/owner**, I want to create a new Walk-In or Appointment on behalf of a customer.
- As a **barber/owner**, I want to manage a booking through its full lifecycle.

**Acceptance Criteria:**

**Schedule Home:**
- Horizontal week strip showing days; active day highlighted.
- "Active Booking (N)" section: shows bookings for the selected day with status colors.
  - `Waiting` = yellow
  - `In Progress` = blue/green
  - `Completed` = green
  - `Canceled` = red/gray
- Filter dropdown: All, Waiting, In Progress, Completed, Canceled.
- Date picker: calendar modal to jump to any date.
- FAB (+) button to create new booking.
- "All Booking" tab: shows all bookings sorted by recently added or oldest first.
- Sort options: Recently Added, Oldest First.

**New Walk-In:**
- Fields: Customer Name (required), Email/Phone (optional), Preferred Barber (optional), Service (pre-selected with default, changeable).
- Submit: "New Walk-In" button.
- Booking is created with status = `Waiting`, type = `walk-in`.

**New Appointment:**
- Fields: Customer Name (required), Email/Phone (optional), Preferred Barber (optional), Date & Time picker, Services (multi-select from service list).
- Submit: "New Appointment" button.
- Booking is created with status = `Waiting`, type = `appointment`, scheduled at selected datetime.

**Booking Detail — Status Lifecycle:**

| Status | Available Actions |
|---|---|
| `Waiting` (appointment) | Accept, Decline |
| `Waiting` (walk-in) | Handle This |
| `In Progress` | Mark as Waiting, Complete, Cancel |
| `Completed` | View only |
| `Canceled` | View only |

**Action Confirmations:**
- "Start this booking?" → sets status to `In Progress`. Modal: "No, Not Yet" / "Yes".
- "Take Over This Booking?" (when customer requested a different barber) → Modal with info, "No, Not Yet" / "Yes".
- "Complete Booking?" → Swipe-to-complete gesture + confirmation modal showing final service list and prices.
- "Mark as Waiting" → reverts to `Waiting` from `In Progress`.
- "Cancel Book" → sets to `Canceled` from detail header menu (···).

**Booking Detail — Information Displayed:**
- Customer name, date, arrival time (relative e.g., "12m ago"), duration, status badge.
- Book No (e.g. `BK-20260425-001-A7`), Requested barber, Handled By barber.
- Services list with individual prices.
- Notes (customer-entered free text).
- Payment Summary: Services total, Discount, net total (no payment gateway — display only).
- WhatsApp shortcut button next to customer name (opens WA with pre-filled message).

---

#### Module 8: Notifications (Mobile)

**User Stories:**

- As a **barber/owner**, I want to receive real-time notifications for new appointment requests, walk-in arrivals, and barbershop invitations.
- As a **barber**, I want to Accept or Decline appointment requests directly from the notification list.

**Acceptance Criteria:**

- Notification types:
  - `Appointment Requested` — shows customer name, scheduled time, duration. Actions: Decline (red), Accept (green).
  - `Walk-in Arrival` — shows customer name, arrival time, duration.
  - `Barbershop Invitation` — shows inviter name and barbershop name. Actions: Decline (red), Accept (green).
- Declined appointments show `Declined` badge on the notification item (no further action).
- Tapping a notification item navigates to the relevant Booking Detail.
- Delivered via FCM (Android) and APNs (iOS) using Expo push notifications.
- Unread count badge on notification tab icon.

---

#### Module 9: Customer Management (Mobile)

**User Stories:**

- As an **owner/barber**, I want to see all customers who have booked at my barbershop.
- As an **owner/barber**, I want to view a customer's booking history, stats, and notes.
- As an **owner/barber**, I want to send a broadcast message to selected customers.

**Acceptance Criteria:**

**Customer List:**
- Shows: avatar, name, total bookings count, total spend (IDR), verified badge (✓) if contact info exists.
- Customer list shows ALL customers (verified and unverified).
- Unverified customers (no contact info) show with a gray/unverified indicator — cannot receive messages.
- Search: by name, email, phone.
- Sort: By Name, By Total Book, By Book Value, By Recently Added, By Oldest First.
- Multi-select mode: tap select icon → checkboxes appear → "Select Customers (N)" footer → send message button.

**Customer Detail:**
- Header: name, phone/email, notes, WA shortcut.
- Stats: Book Value total, Books count (with mini trend chart).
- Booking tab: all bookings with status color coding.
  - Sub-filter: All, Waiting, In Progress, Completed, Canceled.
- Notes tab: free-form notes about the customer.
- Reviews tab: customer reviews/ratings.

**Send Message:**
- Compose screen: template message with variable substitution (customer name, barbershop name, booking link, etc.).
- Sends via registered email or mobile number (channel TBD: email, SMS, or WhatsApp API).
- Delivery status shown per customer in result screen.

---

#### Module 10: Analytics (Mobile)

**User Stories:**

- As an **owner**, I want to see sales and booking statistics over different time ranges so I can track business performance.

**Acceptance Criteria:**

- Time range selector: 24H, Week, Month, 6M, 1Y.
- **Total Statistics cards:** Sales (IDR), Books (total), Appointments (count), Walk-Ins (count).
- **Sales chart:** Bar chart grouped by time period, with % change vs previous period (e.g., "15% ▲ this month"). Tapping a bar shows tooltip with exact value.
- **Bookings chart:** same structure as sales chart.
- All statistics are scoped to the active barbershop/branch.
- Analytics page loads in ≤ 2 seconds (p95).

---

#### Module 11: User Profile (Mobile)

**User Stories:**

- As a **user**, I want to view and update my profile (name, bio, avatar).
- As a **user**, I want to change my password securely.
- As a **user**, I want to change my email/phone with OTP verification.
- As a **user**, I want to log out of the app.

**Acceptance Criteria:**

- Profile sections: General Information (Name, Bio), Account (Email, Phone Number, Change Password), Logout.
- Name and Bio each have their own edit screen with a save (✓) button.
- "Change Password" screen: Current Password, New Password inputs.
- Email/Phone change: enters OTP verification on old contact, then OTP on new contact.
- Logout: confirmation modal "Confirm Log out? Are you sure you want to log out from this account?" with "No, Not Yet" / "Yes".
- Name displayed in barber detail pages and booking page for customers.
- Bio displayed in barber profile on the customer booking web page.

---

#### Module 12: Multi-Barbershop / Branch Management

**User Stories:**

- As an **owner**, I want to create multiple barbershops or branches, each fully independent.
- As an **owner**, I want to switch between barbershops from the home dashboard.

**Acceptance Criteria:**

- Each barbershop/branch is modeled as an independent Better Auth **organization**.
- Owner can be a member of multiple organizations (barbershops).
- Dashboard header shows current active barbershop name with a switch option.
- "Switch Barbershop" modal: lists all owned barbershops, tap to switch, confirms with "Thanks, let me in!" CTA.
- All data (services, barbers, bookings, analytics, settings) is scoped to the active organization.
- A barber (non-owner) is a member of one or more organizations; they can also switch between them if invited to multiple.

---

#### Module 13: Customer Web Booking (React Vite)

**User Stories:**

- As a **walk-in customer**, I want to open the barbershop booking link on my phone, enter a PIN, and register myself in the queue without an account.
- As an **appointment customer**, I want to register/login and book a future appointment, selecting my preferred service, barber, and time slot.

**Acceptance Criteria:**

**Landing Page (`/[slug]`):**
- Shows barbershop name, logo, and two options: **Walk-In** and **Appointment**.

**Walk-In Flow:**
1. Customer taps "Walk-In".
2. Prompted to enter a PIN (numeric, 4–6 digits) provided by the barber/staff on-site.
3. PIN is validated server-side (PIN is generated per session/day by the barbershop; expires after use or time limit).
4. On valid PIN: customer enters Name and (optionally) email/phone.
5. Selects one or more services from the barbershop's active service list.
6. Optionally selects a preferred barber.
7. Submits — booking created with status = `Waiting`, type = `walk-in`.
8. Confirmation screen with booking reference number.

**Appointment Flow:**
1. Customer taps "Appointment".
2. Redirected to Login/Register if not authenticated.
3. Registration: Name, Email/Phone, Password, Confirm Password (same OTP verification as mobile).
4. After auth, booking form:
   - Select Services (multi-select, with prices shown).
   - Select Preferred Barber (optional).
   - Select Date (only days within open hours are selectable).
   - Select Time slot (only slots within open hours and not fully booked are selectable).
   - Optional notes.
5. Review summary showing: services, barber, date/time, total price.
6. Submit — booking created with status = `Waiting`, type = `appointment`.
7. Confirmation screen with booking reference number and option to view booking status.

**Non-Goals for Web:**
- No online payment.
- No customer-side booking management beyond view status.
- No admin features on the web.

---

### 2.3 Non-Goals (Global)

The following are explicitly **out of scope** for all phases:

- Online payment / payment gateway integration.
- In-app chat between barber and customer.
- Customer-facing mobile app (iOS/Android).
- Multi-language / i18n support (Indonesian only for MVP).
- Point-of-sale (POS) or inventory management.
- Loyalty points / rewards system.
- Third-party calendar sync (Google Calendar, iCal).
- Automated SMS/WhatsApp via official API (manual WA link shortcut only in MVP).

---

## 3. Technical Specifications

### 3.1 Architecture Overview

```
┌────────────────────────────────┐      ┌──────────────────────────────────┐
│   Mobile App (React Native     │      │   Customer Web (React + Vite)    │
│   Expo)                        │      │   cukkr.com/[slug]               │
│   - Owner & Barber             │      │   - Walk-in + Appointment        │
└────────────────┬───────────────┘      └────────────────┬─────────────────┘
                 │ HTTPS REST (Eden Treaty)               │ HTTPS REST
                 ▼                                        ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                    Backend API (Bun + Elysia)                             │
│  ┌────────────┐ ┌────────────┐ ┌──────────────┐ ┌──────────────────────┐ │
│  │ Auth       │ │ Barbershop │ │ Booking      │ │ Analytics            │ │
│  │ (BetterAuth│ │ Module     │ │ Module       │ │ Module               │ │
│  │ + Org)     │ │            │ │              │ │                      │ │
│  └────────────┘ └────────────┘ └──────────────┘ └──────────────────────┘ │
│  ┌────────────┐ ┌────────────┐ ┌──────────────┐                          │
│  │ Service    │ │ Customer   │ │ Notification │                          │
│  │ Module     │ │ Module     │ │ Module (FCM) │                          │
│  └────────────┘ └────────────┘ └──────────────┘                          │
└───────────────────────────────────────────────────────────────────────────┘
                                  │
                          ┌───────┴───────┐
                          │  PostgreSQL   │
                          │  (Drizzle ORM)│
                          └───────────────┘
```

### 3.2 Technology Stack

| Layer | Technology |
|---|---|
| **Backend Runtime** | Bun |
| **Backend Framework** | Elysia (type-safe routing) |
| **Database** | PostgreSQL |
| **ORM** | Drizzle ORM |
| **Authentication** | Better Auth + Organizations plugin |
| **API Client (Type-safe)** | Eden Treaty |
| **Mobile** | React Native (Expo) |
| **Web (Customer)** | React + Vite |
| **Push Notifications** | Expo Notifications → FCM (Android) / APNs (iOS) |
| **File Storage** | TBD (S3-compatible, e.g., Supabase Storage or AWS S3) |
| **Email** | Nodemailer / Resend (see `src/lib/mail.ts`) |

### 3.3 Multi-Tenancy Model

Better Auth's **Organizations plugin** maps 1:1 to a barbershop/branch:

- `organization` → A single barbershop or branch.
- `organization.metadata` → stores `slug` (booking URL), `address`, `description`, `logoUrl`.
- `member` → links a `user` to an `organization` with a role (`owner` or `barber`).
- All resource tables (`services`, `bookings`, `open_hours`, etc.) include an `organizationId` FK.
- `requireOrganization: true` macro enforces tenant isolation on all scoped endpoints.

### 3.4 Backend Module Plan

| Module | Tables | Key Endpoints |
|---|---|---|
| `auth` | `user`, `session`, `account`, `verification`, `organization`, `member`, `invitation` | Handled by Better Auth |
| `barbershop` | uses `organization` | `GET /api/barbershop`, `PATCH /api/barbershop/settings`, `GET /api/barbershop/slug-check` |
| `barber` | uses `member`, `invitation` | `GET /api/barbers`, `POST /api/barbers/invite`, `DELETE /api/barbers/:id` |
| `service` | `service` | `GET /api/services`, `POST /api/services`, `PATCH /api/services/:id`, `DELETE /api/services/:id`, `PATCH /api/services/:id/set-default` |
| `open-hours` | `open_hours` | `GET /api/open-hours`, `PUT /api/open-hours` |
| `booking` | `booking`, `booking_service` | `GET /api/bookings`, `POST /api/bookings`, `PATCH /api/bookings/:id/status`, `GET /api/bookings/:id` |
| `customer` | `customer` (derived from bookings) | `GET /api/customers`, `GET /api/customers/:id`, `POST /api/customers/message` |
| `analytics` | aggregations from `booking` | `GET /api/analytics?range=6m` |
| `notification` | `notification` | `GET /api/notifications`, `PATCH /api/notifications/:id/read` |
| `booking-public` | (public, no auth) | `GET /api/public/:slug`, `POST /api/public/:slug/walk-in`, `POST /api/public/:slug/appointment` |
| `pin` | `walk_in_pin` | `POST /api/pin/generate`, `POST /api/pin/validate` |

### 3.5 Key Data Models (Drizzle Schema Outline)

```typescript
// service
{
  id, organizationId, name, description, price (integer, IDR),
  durationMinutes, discountPercent, isActive, isDefault,
  imageUrl, createdAt, updatedAt
}

// open_hours
{
  id, organizationId, dayOfWeek (0=Sun–6=Sat),
  isOpen, openTime (HH:MM), closeTime (HH:MM)
}

// booking
{
  id, organizationId,
  bookNo,  // format: BK-{YYYYMMDD}-{DailySeq}-{Checksum}
           // e.g. BK-20260425-001-A7
           // DailySeq = 3-digit zero-padded sequential per org per day
           // Checksum = 2-char random alphanumeric for uniqueness
  customerId (nullable for walk-ins), customerName, customerContact,
  type (walk-in | appointment), status (waiting | in_progress | completed | canceled),
  requestedBarberId (nullable), handledByBarberId (nullable),
  scheduledAt (nullable, for appointments), notes,
  createdAt, updatedAt
}

// booking_service
{
  id, bookingId, serviceId, serviceName (snapshot), price (snapshot),
  discountPercent (snapshot)
}

// walk_in_pin
{
  id, organizationId, pin (hashed), expiresAt, usedAt (nullable),
  createdByUserId
}

// notification
{
  id, userId, type, title, body, data (jsonb),
  isRead, createdAt
}

// customer  (auto-created on first booking, per unique contact per org)
{
  id, organizationId, name,
  email (nullable),         // present if customer provided email
  phone (nullable),         // present if customer provided phone
  isVerified (boolean),     // true if at least one of email or phone is present
  notes, createdAt, updatedAt
}
// isVerified = false  → walk-in with name only (no contact info)
// isVerified = true   → has email and/or phone → eligible for messaging, CRM features
```

### 3.6 Walk-In PIN Security

- PINs are **4–6 digit numeric codes**, generated by barber/owner from the mobile app.
- PINs are stored **hashed** (bcrypt) in the `walk_in_pin` table.
- Each PIN:
  - Is valid for a configurable duration (default: 30 minutes).
  - Is single-use (marked `usedAt` after validation).
  - Is scoped to the organization.
- PIN generation rate-limited to prevent brute force: max 10 active PINs per organization.
- Validation endpoint rate-limited: max 5 failed attempts per IP per 15 minutes.

### 3.7 Integration Points

| Integration | Purpose | Notes |
|---|---|---|
| Better Auth Organizations | Multi-tenancy, invitations, session management | Already configured in `src/lib/auth.ts` |
| FCM / APNs (Expo) | Push notifications for mobile | Expo SDK handles device registration; backend sends via Expo Push API |
| File Storage (S3-compatible) | Service images, barbershop logos | TBD — add `STORAGE_URL`, `STORAGE_KEY`, `STORAGE_SECRET` to `.env` |
| Email (Nodemailer/Resend) | OTP emails, invitation emails | Already configured in `src/lib/mail.ts` |

### 3.8 Security & Privacy

- All authenticated endpoints use Better Auth session cookies (`HttpOnly`, `Secure`, `SameSite=None`).
- All organization-scoped endpoints validate `activeOrganizationId` from session — no cross-tenant data access.
- Walk-in PIN hashed at rest; never returned in API responses.
- Customer contact data (email/phone) stored only after explicit input by customer or barber.
- No payment data stored (offline cash only).
- Input validation via Elysia's built-in TypeBox schema validation on all endpoints.
- Rate limiting on auth endpoints and PIN validation (implemented via middleware).
- File uploads: validate MIME type and file size (max 5MB) server-side.
- No `process.env` usage outside `src/lib/env.ts`.

---

## 4. Risks & Roadmap

### 4.1 Phased Roadmap

#### Phase 1 — MVP (Core Loop)

**Goal:** Owner can create a barbershop, invite barbers, manage services, and barbers can handle walk-in and appointment bookings end-to-end.

**Includes:**
- Auth (register, login, OTP, forgot password)
- Barbershop creation & settings (name, description, address, booking URL)
- Service management (CRUD, default, active toggle)
- Open Hours configuration
- Barber management (invite, list, remove)
- Schedule: create Walk-In and Appointment from mobile
- Booking lifecycle management (Waiting → In Progress → Completed/Canceled)
- Customer web booking page (Walk-In with PIN, Appointment with login)
- In-app notifications (no push yet)

#### Phase 1.1 — Notifications & Analytics

**Includes:**
- Push notifications (FCM/APNs via Expo)
- Notification center (Accept/Decline inline)
- Analytics module (Sales, Bookings charts by time range)
- Customer Management (list, detail, booking history)

#### Phase 2 — Growth Features

**Includes:**
- Multi-barbershop/branch management
- Switch barbershop from dashboard
- Broadcast messaging to customers
- Service image uploads
- Barbershop logo upload
- Reviews & ratings (customer can leave a review post-booking)
- Barber profile (bio, avatar shown on booking page)

#### Phase 2.1 — Advanced Features

**Includes:**
- Advanced analytics (per-barber breakdown, service popularity)
- Customer notes & CRM features
- Booking reminder notifications (24h/1h before appointment)

### 4.2 Technical Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| PIN brute-force on walk-in endpoint | Medium | High | Rate limiting (5 attempts/15min/IP) + PIN expiry |
| Slug collision at high scale | Low | Medium | Unique DB constraint + real-time availability check on input |
| Push notification delivery failures | Medium | Medium | Use Expo Push API with retry; fall back to in-app notification |
| Large concurrent bookings causing slow analytics queries | Medium | Medium | Aggregate stats with DB indexes; cache analytics results for 60s |
| File storage costs for service images | Low | Low | Lazy image upload (Phase 2); enforce 5MB limit |

---

## 5. Open Questions

| # | Question | Owner | Priority |
|---|---|---|---|
| 1 | ~~What is the PIN length? Fixed 4-digit or configurable 4–6?~~ **RESOLVED** Fix 4-digit and can be rotate when as needed | Product | ~~High~~ **CLOSED** |
| 2 | ~~Should barber invitations expire? If yes, after how long?~~ **RESOLVED** 7 days | Product | ~~Medium~~ **Closed** |
| 3 | ~~What is the `bookNo` format? Sequential per org or global?~~ **RESOLVED:** Format `BK-{YYYYMMDD}-{DailySeq}-{Checksum}` — e.g. `BK-20260425-001-A7`. Sequential counter resets daily per org. Checksum is 2-char random alphanumeric. | Engineering | ~~Medium~~ **Closed** |
| 4 | ~~Should appointment time slots be fixed intervals (e.g., every 30 min) or free selection?~~ **RESOLVED:** free selection in open hours  | Product | ~~High~~ **Closed** |
| 5 | ~~How is the customer `customer` table populated — auto on first booking or explicit CRM add?~~ **RESOLVED:** Auto-created on first booking. Customers are flagged `isVerified = true` if they provided email or phone, `false` if name-only. Verified customers are eligible for messaging. | Product | ~~Medium~~ **Closed** |
| 6 | Is the "Send Message" feature via WhatsApp API, email, or SMS? | Product | Low |
| 7 | Should the web booking page support Google/Apple login in addition to email? | Product | Low |
| 8 | File storage provider selection (Minio, Supabase Storage, AWS S3, Cloudflare R2)? | Engineering | Medium |

---

*Document maintained by the Cukkr engineering team. Update version and date on each revision.*
