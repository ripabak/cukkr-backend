# Epic PRD: Cukkr — Barbershop Management & Booking System

**Version:** 1.0
**Date:** April 26, 2026
**Status:** Draft

---

## 1. Epic Name

**Cukkr — Barbershop Management & Booking System**

---

## 2. Goal

### Problem

Barbershop owners today manage bookings through informal channels — WhatsApp messages, manual paper queues, and verbal coordination between barbers. This leads to double bookings, missed appointments, and complete absence of business performance visibility. Customers experience wasted time waiting without knowing queue status or estimated wait times in advance. There is no structured system to manage barber schedules, service catalogs, or customer relationships across one or multiple barbershop locations.

### Solution

Cukkr is a multi-tenant barbershop management platform that gives owners a mobile app to manage their barbershop(s), barbers, services, schedules, and analytics. Barbers get a mobile interface to handle their daily booking queue and walk-in/appointment workflow. Customers access a lightweight web booking page via a unique shareable URL (e.g., `https://cukkr.com/hendra-barbershop`) — no app download required. Walk-in customers verify physical presence via a PIN provided by the barber. Appointment customers register/log in on the web to self-book.

### Impact

- Eliminate double-bookings and verbal scheduling errors for barbershop owners.
- Reduce customer booking time to ≤ 60 seconds from landing page.
- Give owners real-time analytics on sales and bookings to make data-driven decisions.
- Enable digital customer relationship management (CRM) without requiring new infrastructure.
- Support multi-location barbershop owners with isolated, per-branch management.

---

## 3. User Personas

| Persona | Role | Primary Interface | Description |
|---|---|---|---|
| **Barbershop Owner** | `owner` | Mobile App (React Native Expo) | Creates and manages the barbershop, branches, services, barbers, settings, and analytics. May own multiple barbershops. |
| **Barber** | `barber` | Mobile App (React Native Expo) | Invited staff member. Manages their own bookings, views daily schedule, handles walk-ins and appointments. |
| **Appointment Customer** | `customer` | Web App (React + Vite) | Registers/logs in on the web to book a future appointment at a specific branch. Selects services, barber, date, and time. |
| **Walk-In Customer** | `customer` | Web App (React + Vite) | Arrives at the shop, opens the booking link, enters a PIN given by the barber to self-register in the queue — no account required. |

---

## 4. High-Level User Journeys

### Journey 1: Owner Onboarding & Barbershop Setup

1. Owner registers on the mobile app (email/password + OTP verification).
2. Guided 4-step onboarding wizard: create barbershop name + logo → invite barbers → create first service.
3. Owner configures open hours and sets the booking URL slug (e.g., `hendra-barbershop`).
4. Barbershop is live and ready to accept bookings.

### Journey 2: Barber Handles a Walk-In

1. Customer arrives at the barbershop and asks to join the queue.
2. Barber generates a 4-digit PIN from the mobile app.
3. Customer opens `cukkr.com/hendra-barbershop` on their phone, selects "Walk-In", enters PIN.
4. Customer enters their name and selects services.
5. Booking is created (`status = waiting`, `type = walk-in`).
6. Barber sees the new booking appear on the schedule screen; taps "Handle This" to set it `In Progress`.
7. Barber taps "Complete" (swipe-to-complete) when done.

### Journey 3: Customer Self-Books an Appointment

1. Customer receives the barbershop booking link and opens it on their phone.
2. Selects "Appointment"; redirected to register/login.
3. Selects services, preferred barber, date, and time slot (constrained by open hours).
4. Reviews summary and submits booking (`status = waiting`, `type = appointment`).
5. Barber/owner receives an in-app notification; accepts or declines from the notification list.
6. On the appointment day, barber accepts and starts the booking from the schedule screen.

### Journey 4: Owner Manages Barbers & Services

1. Owner opens the Barbers screen and invites a barber by email or phone.
2. Barber receives an in-app invitation notification and accepts it.
3. Owner opens Services, creates new services with name, price, duration, and optional image.
4. Owner sets a default service and toggles service active states.

### Journey 5: Owner Reviews Analytics

1. Owner opens the Analytics tab.
2. Selects a time range (24H, Week, Month, 6M, 1Y).
3. Reviews total sales (IDR), bookings, appointments, and walk-ins.
4. Taps chart bars to see exact values and compares vs previous period.

### Journey 6: Barber/Owner Manages Customers (CRM)

1. Opens Customer list; searches by name, email, or phone.
2. Taps a customer to see their booking history, spend total, and notes.
3. Opens WhatsApp shortcut to message the customer directly.
4. Multi-selects customers for broadcast messaging.

---

## 5. Business Requirements

### 5.1 Functional Requirements

#### Authentication & User Management

- Email/password registration with 4-digit OTP verification (expires in 5 minutes).
- Forgot password flow: email/phone → OTP → set new password.
- Email/phone change with OTP verification on both old and new contacts.
- Session persistence via secure HTTP-only cookies (Better Auth).

#### Onboarding & Barbershop Creation

- 4-step guided onboarding wizard for new owners: barbershop details → invite barbers (skippable) → invite confirmation → create first service.
- Progress indicator across all 4 steps.

#### Barbershop Settings

- Editable fields: Name, Description, Address, Booking URL (slug).
- Slug format: lowercase letters, numbers, hyphens only; no spaces.
- Real-time slug availability check; modal error if slug already taken.

#### Barber Management

- Invite barbers by email or phone.
- Barber list with name, avatar, and status badge (`Active` / `Pending`).
- Remove barber with confirmation modal.
- Invited barbers receive in-app + push notification with Accept/Decline actions.
- Invitations expire after 7 days.

#### Services Management

- Full CRUD for services: name, description, price (IDR), duration (minutes), discount (%), active toggle.
- One service per organization marked as default (used in new booking pre-selection).
- "Set as Default" requires service to be active; confirmation modal.
- Service list with search and sort (by name, price, recency).
- Optional thumbnail image upload per service (max 5 MB, validated MIME type).

#### Open Hours

- Per-day configuration for Monday–Sunday: open/closed toggle + open time + close time.
- Closed days are unavailable for appointment booking.
- Time picker for open/close times.

#### Schedule & Booking Management (Mobile)

- Weekly strip view of bookings per day; day picker with calendar modal.
- Booking status filter: All, Waiting, In Progress, Completed, Canceled.
- Create Walk-In booking: customer name (required), contact (optional), preferred barber, service.
- Create Appointment booking: customer name (required), contact (optional), preferred barber, date/time picker, services (multi-select), notes.
- Booking status lifecycle with contextual action buttons (Accept, Decline, Handle This, Mark as Waiting, Complete, Cancel).
- Swipe-to-complete gesture with confirmation modal showing service list and prices.
- Booking reference number format: `BK-{YYYYMMDD}-{DailySeq}-{Checksum}` (e.g., `BK-20260425-001-A7`).
- Sequential daily counter per organization; 2-char random alphanumeric checksum.

#### In-App Notifications

- Notification types: Appointment Requested, Walk-In Arrival, Barbershop Invitation.
- Inline Accept/Decline actions on appointment and invitation notifications.
- Unread count badge on notification tab.
- Tapping a notification navigates to the relevant booking or invitation detail.
- Push notification delivery via Expo Push API → FCM (Android) / APNs (iOS).

#### Customer Management (CRM)

- Customer list: name, avatar, total bookings, total spend (IDR), verified badge.
- Verified = has at least one of email or phone.
- Search by name, email, phone; sort by multiple criteria.
- Customer detail: stats (book count, spend trend), booking history, notes tab, reviews tab.
- WhatsApp shortcut on customer detail header.
- Multi-select for broadcast message composition (verified customers only).

#### Analytics

- Time range selector: 24H, Week, Month, 6M, 1Y.
- Stat cards: Total Sales (IDR), Total Books, Appointments, Walk-Ins.
- Bar chart for sales and bookings with % change vs previous period and tap-to-tooltip.
- All data scoped to active organization.

#### User Profile

- View and edit name, bio, avatar.
- Change password (current + new password inputs).
- Change email/phone with OTP verification on old and new contacts.
- Logout with confirmation modal.

#### Multi-Barbershop / Branch Management

- Owner can create and manage multiple independent barbershops (organizations).
- Switch active barbershop from dashboard header.
- Barbers can be members of multiple organizations and switch between them.
- All data (services, barbers, bookings, analytics) fully isolated per organization.

#### Customer Web Booking

- Public landing page at `/{slug}`: shows barbershop name, logo, Walk-In and Appointment CTAs.
- **Walk-In flow:** PIN entry → validate server-side → customer name + contact → service selection → optional barber → submit → confirmation with booking reference.
- **Appointment flow:** Login/register → service selection → optional barber → date (open-hours constrained) → time slot → optional notes → review summary → submit → confirmation.

#### Walk-In PIN System

- PINs are 4-digit numeric, generated by barber/owner from the mobile app.
- PINs stored hashed (bcrypt); never returned in API responses.
- Each PIN: single-use, scoped to organization, expires in 30 minutes.
- Max 10 active PINs per organization (rate limit on generation).

### 5.2 Non-Functional Requirements

- **Performance:** Booking detail page load ≤ 1.5s (p95); analytics page load ≤ 2s (p95).
- **Availability:** ≥ 99.5% uptime.
- **Security:**
  - All authenticated endpoints protected via Better Auth session cookies (`HttpOnly`, `Secure`, `SameSite=None`).
  - All organization-scoped endpoints validate `activeOrganizationId` — no cross-tenant data access.
  - Walk-in PIN rate-limited to max 5 failed validation attempts per IP per 15 minutes.
  - File uploads validated for MIME type and max size (5 MB).
  - No `process.env` usage outside `src/lib/env.ts`.
  - Input validation via Elysia TypeBox schema on all endpoints.
- **Multi-Tenancy:** All resource tables include `organizationId` FK; `requireOrganization: true` enforces tenant isolation.
- **Scalability:** Analytics queries use DB indexes; cache analytics results for 60 seconds to handle concurrent load.
- **Data Privacy:** Customer contact data stored only after explicit input; no payment data stored anywhere.
- **Onboarding Time:** Owner completes barbershop creation + first service in ≤ 5 minutes.
- **Customer Booking Time:** Customer completes booking in ≤ 60 seconds from landing page.

---

## 6. Success Metrics

| Metric | Target |
|---|---|
| Customer booking completion time | ≤ 60 seconds from landing page |
| Owner onboarding completion (create shop + 1 service) | ≤ 5 minutes |
| Booking detail page load time | ≤ 1.5s (p95) |
| Analytics page load time | ≤ 2s (p95) |
| System availability | ≥ 99.5% uptime |
| Walk-In PIN brute-force protection | 0 successful unauthorized PIN validations |
| Slug collision errors | 0 duplicate slug assignments |
| Push notification delivery success rate | ≥ 95% |

---

## 7. Out of Scope

- Online payment / payment gateway integration (cash only for MVP).
- In-app chat between barber and customer.
- Customer-facing mobile app (iOS/Android) — web only for customers.
- Multi-language / i18n support (Indonesian only for MVP).
- Point-of-sale (POS) or inventory management.
- Loyalty points / rewards system.
- Third-party calendar sync (Google Calendar, iCal).
- Automated SMS / WhatsApp via official API (manual WA shortcut link only).
- Google / Apple social login for customer web booking.
- Advanced per-barber analytics breakdown (Phase 2.1).
- Service image uploads and barbershop logo upload (Phase 2).
- Booking reminder push notifications (Phase 2.1).
- Reviews and ratings from customers (Phase 2).
- Broadcast messaging to customers (Phase 2).

---

## 8. Business Value

**Value: High**

Cukkr directly replaces an entirely manual, error-prone, and unscalable booking process. The platform:

1. **Eliminates operational errors** (double bookings, missed appointments) that directly translate to lost revenue for shop owners.
2. **Reduces friction for customers** with a no-download, sub-60-second booking experience — improving conversion from walk-in intent to confirmed booking.
3. **Unlocks data visibility** that barbershop owners currently have zero access to — enabling owners to make informed decisions about staffing, pricing, and promotions.
4. **Creates a scalable multi-tenant SaaS foundation** that can grow with barbershop chains and franchises, increasing revenue potential per customer.
5. **Establishes a digital customer relationship** (CRM) that creates retention and re-engagement opportunities (broadcast messaging in Phase 2).

The combination of owner/barber mobile tooling and a zero-friction customer web experience creates a flywheel where higher owner adoption drives more customer bookings, which drives more value for owners.

---

## 9. Technical Architecture Summary

| Component | Technology |
|---|---|
| Backend Runtime | Bun |
| Backend Framework | Elysia (type-safe routing) |
| Database | PostgreSQL via Drizzle ORM |
| Authentication & Multi-Tenancy | Better Auth + Organizations plugin |
| Mobile App | React Native (Expo) |
| Customer Web | React + Vite |
| Push Notifications | Expo Push API → FCM / APNs |
| Email | Nodemailer / Resend |
| File Storage | S3-compatible (TBD: Supabase Storage, AWS S3, or Cloudflare R2) |

### Core Backend Modules

| Module | Key Tables | Key Endpoints |
|---|---|---|
| `auth` | `user`, `session`, `account`, `verification`, `organization`, `member`, `invitation` | Handled by Better Auth |
| `barbershop` | `organization` (via Better Auth) | `GET /api/barbershop`, `PATCH /api/barbershop/settings`, `GET /api/barbershop/slug-check` |
| `barber` | `member`, `invitation` | `GET /api/barbers`, `POST /api/barbers/invite`, `DELETE /api/barbers/:id` |
| `service` | `service` | Full CRUD + `PATCH /api/services/:id/set-default` |
| `open-hours` | `open_hours` | `GET /api/open-hours`, `PUT /api/open-hours` |
| `booking` | `booking`, `booking_service`, `customer` | `GET /api/bookings`, `POST /api/bookings`, `PATCH /api/bookings/:id/status` |
| `customer` | `customer` | `GET /api/customers`, `GET /api/customers/:id` |
| `analytics` | aggregations from `booking` | `GET /api/analytics?range=6m` |
| `notification` | `notification` | `GET /api/notifications`, `PATCH /api/notifications/:id/read` |
| `booking-public` | (unauthenticated) | `GET /api/public/:slug`, `POST /api/public/:slug/walk-in`, `POST /api/public/:slug/appointment` |
| `pin` | `walk_in_pin` | `POST /api/pin/generate`, `POST /api/pin/validate` |

---

## 10. Open Questions

| # | Question | Owner | Priority | Status |
|---|---|---|---|---|
| 1 | File storage provider selection (Minio, Supabase Storage, AWS S3, Cloudflare R2)? | Engineering | Medium | Open |
| 2 | Is the "Send Message" feature via WhatsApp API, email, or SMS? | Product | Low | Open |
| 3 | Should the web booking page support Google/Apple login in addition to email? | Product | Low | Open |
| 4 | Should analytics results be cached in-memory (Bun) or via Redis? | Engineering | Medium | Open |
| 5 | What is the maximum number of services selectable per booking? | Product | Low | Open |

---

*Epic PRD maintained by the Cukkr engineering team. Update version and date on each revision.*
