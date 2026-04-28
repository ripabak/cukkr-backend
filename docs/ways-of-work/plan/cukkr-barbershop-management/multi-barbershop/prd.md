# Feature PRD: Multi-Barbershop & Branch Management

**Version:** 1.0
**Date:** April 27, 2026
**Status:** Draft

---

## 1. Feature Name

**Multi-Barbershop & Branch Management — Multi-Tenant Organization Switching**

---

## 2. Epic

- **Parent Epic:** [Cukkr — Barbershop Management & Booking System](../epic.md)

---

## 3. Goal

### Problem

Many barbershop owners in Indonesia operate more than one physical location. Managing each branch through a separate account or a flat single-tenant system leads to context confusion, credential sharing, and the inability to maintain separate service catalogs, barber rosters, open hours, and booking histories per branch. Barbers who work across multiple locations face the same problem from the staff side.

### Solution

Leverage Better Auth's Organizations plugin to support multiple independent organizations (barbershops) per user account. Owners can create additional barbershops beyond the first and switch between them from the app's dashboard header. All data — services, barbers, bookings, analytics, open hours — is fully isolated per organization. Barbers can be members of multiple organizations and switch their active context.

### Impact

- Enable owners with multiple locations to manage them all from a single account, eliminating credential juggling.
- Enforce strict data isolation so that viewing or managing one branch never surfaces data from another.
- Provide a scalable SaaS foundation where revenue grows proportionally with the number of branches per owner.

---

## 4. User Personas

| Persona | Role | Need |
|---|---|---|
| **Barbershop Owner** | `owner` | Create and manage multiple barbershops; switch active barbershop from the dashboard header. |
| **Barber** | `barber` | Accept invitations from multiple organizations; switch active barbershop context. |

---

## 5. User Stories

1. As a **barbershop owner**, I want to create a new barbershop organization from the app so that I can manage a second location without registering a new account.
2. As a **barbershop owner**, I want to see a list of all my barbershops and switch the active one from the dashboard header so that I can quickly context-switch between branches.
3. As a **barbershop owner**, I want all data (services, barbers, bookings, analytics) for each barbershop to be fully isolated so that I never see Branch B's data while managing Branch A.
4. As a **barber**, I want to accept invitations from multiple barbershops so that I can work at more than one location.
5. As a **barber**, I want to switch my active barbershop context so that my schedule view, bookings, and notifications reflect the correct branch.
6. As a **barbershop owner**, I want to set a unique booking URL slug for each barbershop so that each branch has its own public booking page.
7. As a **barbershop owner**, I want to leave or remove a barbershop organization when it is no longer active so that my organization list stays clean.

---

## 6. Requirements

### Functional Requirements

#### Organization Creation

- Authenticated users can create a new organization (barbershop) via `POST /api/barbershop` (mapped to Better Auth's `createOrganization`).
- Required fields: `name` (string), `slug` (unique, validated format).
- Optional fields: `description`, `address`.
- The creator is automatically assigned the `owner` role in the new organization.
- Slug uniqueness is enforced at the database level and checked before creation (reuse the existing slug-check endpoint).
- There is no hard cap on the number of organizations per user at MVP.

#### Organization Listing & Switching

- `GET /api/barbershop/list` — Returns all organizations the authenticated user is a member of, including their role in each.
- Active organization switching is handled via Better Auth's `setActiveOrganization` call from the mobile client, which updates the session cookie's `activeOrganizationId`.
- The dashboard header displays the active barbershop name and a caret/chevron to open the switcher.
- The switcher shows all organizations the user belongs to and allows one-tap switching.

#### Data Isolation

- Every resource table (`service`, `open_hours`, `booking`, `customer`, `notification`, `walk_in_pin`) has an `organizationId` foreign key.
- All service methods filter by `organizationId` from the active session; no endpoint returns cross-organization data.
- Endpoints that require an active organization use the `requireOrganization: true` macro.

#### Member Management Per Organization

- Each organization maintains an independent member list (owner + barbers).
- Inviting a barber who is already a member of another organization does not affect their membership in that other organization.
- A user can hold different roles in different organizations (e.g., `owner` in Organization A, `barber` in Organization B).

#### Organization Leave / Archive

- `DELETE /api/barbershop/:orgId/leave` — Allows a member (non-owner) to leave an organization.
- An owner cannot leave their own organization if they are the sole owner; they must transfer ownership or archive the organization first. Return `400` with a descriptive error.
- Organization archival / deletion is out of scope for MVP (handled by admin tooling).

### Non-Functional Requirements

- Switching active organizations must update the session state within 500ms.
- The organization list endpoint must return within 500ms for up to 20 organizations.
- All tenant-isolation guarantees established in the existing modules must be preserved; adding a new organization must not weaken isolation in any existing endpoint.
- No cross-tenant data leaks under any combination of race conditions or concurrent requests.
- Role-based access: only `owner` members can access settings, barber management, and analytics endpoints.

---

## 7. Acceptance Criteria

### AC-1: Create new organization

- **Given** an authenticated owner calls `POST /api/barbershop` with a unique name and slug  
- **When** the request is processed  
- **Then** a new organization is created, the user is assigned the `owner` role, and the new org appears in their organization list.

### AC-2: Duplicate slug rejected

- **Given** slug `hendra-barbershop` is already taken  
- **When** a user attempts to create an organization with the same slug  
- **Then** the API returns `409 Conflict` with a descriptive error message.

### AC-3: Organization list

- **Given** a user is a member of 3 organizations  
- **When** `GET /api/barbershop/list` is called  
- **Then** all 3 organizations are returned with the user's role in each.

### AC-4: Active org switching isolates data

- **Given** Organization A has 5 services and Organization B has 3 services  
- **When** the owner switches active org to B and calls `GET /api/services`  
- **Then** only 3 services (from Org B) are returned.

### AC-5: Barber member of multiple orgs

- **Given** a barber accepts invitations from Org A and Org B  
- **When** they switch active org to Org A  
- **Then** their schedule and notifications reflect only Org A's data.

### AC-6: Owner cannot leave as sole owner

- **Given** a user is the only owner of an organization  
- **When** they call `DELETE /api/barbershop/:orgId/leave`  
- **Then** the API returns `400 Bad Request` explaining they are the sole owner.

### AC-7: Member (non-owner) can leave

- **Given** a barber is a member of an organization  
- **When** they call `DELETE /api/barbershop/:orgId/leave`  
- **Then** their membership is removed and they no longer see that org in their list.

### AC-8: Cross-tenant isolation enforced

- **Given** user A is owner of Org A and user B is owner of Org B  
- **When** user B (authenticated with Org B as active) calls any resource endpoint  
- **Then** only Org B's data is accessible; Org A's data is never returned.

### AC-9: Role enforcement

- **Given** a barber (non-owner role) in an organization  
- **When** they call an owner-only endpoint (e.g., `GET /api/analytics`)  
- **Then** the API returns `403 Forbidden`.

---

## 8. Out of Scope

- Organization-level deletion or archival by the owner (admin tooling only).
- Ownership transfer between users.
- Per-branch sub-roles beyond `owner` and `barber`.
- Consolidated cross-organization analytics (each org's analytics are independent).
- Billing or subscription management per organization.
- Organization audit logs.
- Branch-to-branch staff sharing or shared service catalogs.
- Guest or read-only member roles.
