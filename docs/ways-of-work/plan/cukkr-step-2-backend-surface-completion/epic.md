# Epic PRD: Cukkr Step 2 - Backend Surface Completion & Contract Consolidation

**Version:** 1.0
**Date:** April 28, 2026
**Status:** Draft

---

## 1. Epic Name

**Cukkr Step 2 - Backend Surface Completion & Contract Consolidation**

---

## 2. Goal

### Problem

The current Cukkr backend already supports core owner and barber operations, but several product-critical surfaces remain incomplete or inconsistent with the intended UI/UX. Profile management is split across overlapping contracts, booking lifecycle rules do not fully match the business process, notification calls-to-action are not yet operational, and public booking surfaces are missing read and write endpoints needed for the customer web flow. Media upload support for barbershop branding and service thumbnails is also absent, forcing frontend workarounds and fragmenting the integration layer. Without consolidating these backend contracts, the frontend will either drift from backend intent or ship partial flows that cannot run end-to-end.

### Solution

This epic completes the Step 2 backend surface by standardizing ownership of profile APIs under `/api/me`, adding media upload capabilities, finalizing invitation and notification actions, enforcing the correct booking state machine per booking type, and exposing the missing public slug-based booking surfaces. The work preserves the existing modular architecture, Better Auth session model, Drizzle-based data layer, and organization-scoped multi-tenant design. The outcome is a stable, test-backed contract layer that matches the mobile and web experiences without requiring frontend-specific workarounds.

### Impact

- Eliminate contract ambiguity for profile, booking, invitation, and notification flows.
- Enable full end-to-end public booking journeys for both walk-in and appointment customers.
- Reduce frontend integration complexity and contract drift across mobile and web surfaces.
- Improve operational reliability by enforcing explicit booking transitions, upload validation rules, and notification action semantics.
- Increase readiness for downstream architecture and issue breakdown by turning Step 2 scope into a single, coherent epic.

---

## 3. User Personas

| Persona | Role | Primary Interface | Description |
|---|---|---|---|
| **Barbershop Owner** | `owner` | Mobile App | Manages branding, services, barbers, bookings, settings, and day-to-day operations for the active barbershop. |
| **Barber** | `barber` | Mobile App | Accepts invitations, manages booking queues, handles appointment requests, and takes over eligible active bookings when needed. |
| **Appointment Customer** | `customer` | Public Web | Visits a public barbershop page by slug, browses services and barbers, and submits a future appointment within open hours. |
| **Walk-In Customer** | `customer` | Public Web | Uses a validated PIN on the public barbershop surface to join the queue and submit a walk-in booking. |
| **Frontend Integrator** | Internal product/development user | Mobile App + Public Web | Depends on a single, stable backend contract that maps cleanly to profile, booking, media, notification, and public booking screens. |

---

## 4. High-Level User Journeys

### Journey 1: Unified Profile Management

1. A signed-in user opens the profile screen on mobile.
2. The frontend reads and updates profile information exclusively through `/api/me` surfaces.
3. Avatar and phone-change flows remain available under the same profile contract family.
4. The frontend no longer depends on legacy auth-profile mutation routes.

### Journey 2: Branded Barbershop and Service Management

1. An owner uploads a barbershop logo during onboarding or from settings.
2. The owner optionally uploads a thumbnail for individual services.
3. The backend validates media type and file size, stores the asset, and returns a usable URL.
4. The same URLs appear in owner-facing and public-facing read contracts.

### Journey 3: Barber Invitation and Notification Action Flow

1. An owner invites one or more barbers in a single bulk action.
2. Invitees receive notifications or invitation entry points with accept and decline actions.
3. The backend exposes normalized invitation state, expiry metadata, and explicit action endpoints.
4. Owners are prevented from removing barbers who still own active bookings that must first be resolved or reassigned.

### Journey 4: Booking Lifecycle Management by Type

1. A walk-in booking is created and starts in `waiting`; an appointment is created and starts in `requested`.
2. Barbers or owners act on the booking through type-specific transitions such as accept, decline, handle, complete, cancel, and take over.
3. The backend preserves both the requested barber and the actual handling barber when relevant.
4. All transitions are validated in the service layer and exposed consistently to booking and notification surfaces.

### Journey 5: Public Booking Surface by Slug

1. A customer opens a public barbershop landing page by slug.
2. The customer sees branding, active services, public barbers, and open-hours-derived availability data.
3. A walk-in customer validates a PIN and submits a queue entry; an appointment customer selects services, barber preference, date, and time.
4. The backend creates the booking using the same open-hours validation rules as internal surfaces, while maintaining tenant isolation and safe public data exposure.

---

## 5. Business Requirements

### 5.1 Functional Requirements

#### Contract Consolidation

- Standardize profile read and write operations on `/api/me`, including related profile sub-actions.
- Remove Step 2 dependency on `PATCH /api/auth/profile` from the supported backend surface.
- Ensure profile mutation coverage is complete enough for current mobile profile screens.

#### Media Uploads and Branding

- Support barbershop logo upload for the active organization.
- Support optional service thumbnail upload per service.
- Return stable asset URLs in private and public read models where relevant.
- Enforce server-side validation for supported image MIME types and maximum upload size.

#### Barber Management and Invitations

- Support atomic bulk barber invitation in a single request.
- Expose invitation accept and decline actions through dedicated contract surfaces.
- Include invitation expiry metadata and expired-state semantics in responses.
- Prevent silent or unsafe barber removal while active bookings still depend on that member.
- Add server-side barber search for booking and management flows.

#### Booking List, Detail, and State Management

- Support explicit sorting options for booking lists and define a default list order.
- Enforce separate state machines for `walk_in` and `appointment` bookings.
- Remove unsupported legacy `pending` status assumptions from Step 2 behavior.
- Store and return distinct `requestedBarber` and `handledByBarber` data in booking detail.
- Support take-over or reassignment flows without overwriting original requested barber intent.
- Keep booking actions and validation centralized so notifications and direct booking actions share the same rules.

#### Booking Time Validation

- Validate booking creation against organization open hours only.
- Reject booking creation outside configured open hours with explicit validation responses.
- Keep Step 2 free from occupancy-based or overlap-based booking rejection logic.
- Reuse the same open-hours validation rule across internal booking creation and public appointment submission.

#### Customer Management Enhancements

- Add booking-type filtering to customer booking history.
- Return richer customer detail statistics including booking counts, spend totals, and recent visit metadata.
- Preserve existing notes and pagination flows while extending the detail contract.

#### Notification Actions

- Expose notification payload metadata sufficient to render contextual CTA actions.
- Support action-specific appointment request mutations from the notifications surface.
- Support action-specific invitation mutations from the notifications surface.
- Keep generic mark-as-read capabilities compatible with action-specific updates.

#### Public Customer-Facing Surface

- Expose a public landing/detail endpoint by barbershop slug.
- Return customer-safe public service, barber, and open-hours data tied to the resolved organization.
- Preserve public walk-in PIN validation and submission flows.
- Add public availability and public appointment submission endpoints.
- Ensure public appointment creation persists requested barber preference, selected services, schedule, notes, booking type, and initial status.

#### Testing and Delivery Expectations

- Cover each changed backend surface with integration tests in the existing test suite.
- Add regression coverage for booking lifecycle transitions by booking type.
- Add validation coverage for upload MIME and size rules.
- Add public surface and cross-organization isolation coverage for slug-based endpoints.

### 5.2 Non-Functional Requirements

- **Contract Consistency:** Mobile and web clients must rely on a single authoritative backend contract for each Step 2 flow area.
- **Security:** All private endpoints must remain protected by Better Auth session middleware and organization scoping.
- **Tenant Isolation:** Public and private reads must never leak data across organizations.
- **Upload Safety:** Image uploads must validate MIME type, file size, and organization ownership before persistence.
- **Data Privacy:** Public slug surfaces may only expose customer-facing, explicitly safe data.
- **Reliability:** Booking transitions, invitation actions, and notification actions must be deterministic and test-backed.
- **Backward Risk Control:** Removal of the legacy auth-profile patch route must be accompanied by contract coverage sufficient to prevent frontend regression.
- **Maintainability:** The implementation must extend existing modules and services rather than introduce parallel architecture.
- **Testing Discipline:** All Step 2 behavior must be represented through automated integration tests aligned with current repo conventions.

---

## 6. Success Metrics

| Metric | Target |
|---|---|
| Profile mutation contract adoption | 100% of mobile profile writes use `/api/me`; no frontend dependency on `PATCH /api/auth/profile` |
| Booking lifecycle parity | 100% automated tests pass for final `walk_in` and `appointment` state transitions |
| Public booking completeness | Public landing, services, barbers, open hours, walk-in support, availability, and appointment submit flows pass end-to-end integration coverage |
| Media upload reliability | 100% validation coverage for supported MIME types and file size limit; unsupported files are rejected consistently |
| Notification action parity | Appointment request and invitation accept/decline flows are executable from notification contracts and covered by integration tests |
| Cross-org isolation | 0 verified cross-organization data leakage cases in Step 2 public and private endpoint tests |
| Unsafe barber removal prevention | 100% of removal attempts involving active bookings return explicit blocking or warning behavior |

---

## 7. Out of Scope

- Online payments, invoicing, or settlement workflows.
- Customer chat inbox or messaging center.
- Special onboarding progress persistence workflows beyond current backend needs.
- Slot-capacity engines, barber load balancing, or booking conflict enforcement beyond open-hours validation.
- Replacing or redesigning the base Better Auth authentication model.
- Editing or repurposing the `product-example` module.
- Customer self-service reschedule and cancellation flows.
- Advanced notification enrichment such as detailed reason codes beyond the Step 2 contract needs.

---

## 8. Business Value

**Value: High**

This epic closes the most important backend gaps blocking product parity between implemented backend modules and intended frontend experiences. It directly reduces engineering overhead caused by duplicate or missing contracts, unlocks customer-facing public booking journeys that are central to product value, and lowers operational risk by making booking transitions and invitation actions explicit and enforceable. Completing this epic also creates a cleaner planning boundary for downstream architecture, issue decomposition, and implementation sequencing.