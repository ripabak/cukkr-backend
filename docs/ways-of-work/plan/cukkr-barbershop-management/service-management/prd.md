# Feature PRD: Service Management

**Version:** 1.0
**Date:** April 26, 2026
**Status:** Draft

---

## 1. Feature Name

**Service Management**

---

## 2. Epic

- **Parent Epic:** [Cukkr — Barbershop Management & Booking System](../epic.md)

---

## 3. Goal

### Problem

Barbershop owners currently communicate their services, prices, and durations verbally or through informal price lists. There is no digital catalog that customers can browse before booking, and no structured way to map a specific service to a booking. This makes it impossible to calculate total booking cost, enforce accurate scheduling time slots, or provide customers with price transparency upfront. Owners also have no way to temporarily disable a service (e.g., during barber shortage) without removing it entirely.

### Solution

Provide a dedicated Services screen in the mobile app where owners can create, edit, and manage their full service catalog. Each service has a name, description, price (IDR), duration (minutes), discount percentage, and an active/inactive toggle. One service per organization can be marked as the default, which is pre-selected when a new booking is created. Services are fully scoped to the owner's active organization (multi-tenant isolation). The service list supports search and sorting so owners can quickly find and manage specific services.

### Impact

- Enables accurate booking cost calculation and time-slot enforcement by attaching structured service data to bookings.
- Increases price transparency for customers on the web booking page, improving conversion from browse to confirmed booking.
- Reduces back-and-forth between barbers and customers by surfacing service options directly at booking time.
- Gives owners operational flexibility to deactivate services temporarily without losing their configuration.

---

## 4. User Personas

| Persona | Role | Interaction |
|---|---|---|
| **Barbershop Owner** | `owner` | Primary actor. Creates, edits, deactivates, and sets the default service for their active barbershop. |
| **Barber** | `barber` | Read access. Views available services when creating a booking from the schedule screen. |
| **Appointment Customer** | `customer` | Indirectly affected. Sees available services and prices on the customer web booking page. |
| **Walk-In Customer** | `customer` | Indirectly affected. Selects services during the walk-in PIN flow on the customer web page. |

---

## 5. User Stories

### Browse Services

- **US-01:** As an **owner**, I want to see a list of all services in my active barbershop so that I can review what is currently offered to customers.
- **US-02:** As an **owner**, I want to search services by name so that I can quickly find a specific service in a long list.
- **US-03:** As an **owner**, I want to sort services by name, price, or recency so that I can organize the list in a way that suits my workflow.
- **US-04:** As an **owner**, I want to see each service's active/inactive status, price, duration, and a "Default" badge (where applicable) at a glance in the list so that I don't need to open each service to understand its state.

### Create a Service

- **US-05:** As an **owner**, I want to create a new service with a name, description, price, duration, and optional discount so that customers can see and select it during booking.
- **US-06:** As an **owner**, I want the name field to be required and the price and duration fields to accept only valid positive numbers so that invalid service data cannot be saved.
- **US-07:** As an **owner**, I want a newly created service to be inactive by default so that I can review it before it becomes customer-visible.

### Edit a Service

- **US-08:** As an **owner**, I want to edit any field of an existing service (name, description, price, duration, discount) so that I can keep the catalog up to date.
- **US-09:** As an **owner**, I want to toggle a service between active and inactive from both the edit form and directly from the list so that I can quickly change visibility without a full edit flow.

### Delete a Service

- **US-10:** As an **owner**, I want to delete a service that is no longer offered so that the catalog stays clean.
- **US-11:** As an **owner**, I want a confirmation modal before deleting a service so that I cannot accidentally remove an active offering.
- **US-12:** As an **owner**, I want to be prevented from deleting a service that is currently set as the default unless I change the default first so that bookings always have a valid pre-selection.

### Default Service

- **US-13:** As an **owner**, I want to mark a specific service as the default so that it is pre-selected automatically when a new booking is created.
- **US-14:** As an **owner**, I want to be prevented from setting an inactive service as the default so that customers are never pre-assigned an unavailable service.
- **US-15:** As an **owner**, I want a confirmation modal when setting a new default (since it replaces the existing default) so that the action is intentional.

### Barber — View Services

- **US-16:** As a **barber**, I want to view the active services of my organization when creating a booking so that I can select the correct services for a customer.

---

## 6. Requirements

### 6.1 Functional Requirements

#### Service Fields

- Each service record contains:
  - `id` — UUID, auto-generated.
  - `organizationId` — FK to `organization.id`; required; enforces multi-tenant isolation.
  - `name` — string; required; max 100 characters.
  - `description` — string; optional; max 500 characters.
  - `price` — integer (IDR, in whole rupiah); required; must be ≥ 0.
  - `duration` — integer (minutes); required; must be ≥ 1.
  - `discount` — integer (percentage, 0–100); optional; defaults to 0.
  - `isActive` — boolean; defaults to `false` on creation.
  - `isDefault` — boolean; at most one service per organization may be `true`.
  - `createdAt`, `updatedAt` — timestamps.

#### CRUD Operations

- **Create:** `POST /api/services` — creates a new service for the active organization. `isActive` defaults to `false`; `isDefault` defaults to `false`.
- **List:** `GET /api/services` — returns all services for the active organization; supports query params:
  - `search` (string, partial name match)
  - `sort` (`name_asc`, `name_desc`, `price_asc`, `price_desc`, `recent`)
  - `activeOnly` (boolean, default `false`)
- **Get:** `GET /api/services/:id` — returns a single service; validates it belongs to the active organization.
- **Update:** `PATCH /api/services/:id` — partial update of any editable field; `isDefault` cannot be set via this endpoint (use the dedicated set-default endpoint).
- **Delete:** `DELETE /api/services/:id` — deletes the service; returns `400` if the service is currently the default.
- **Toggle Active:** `PATCH /api/services/:id/toggle-active` — flips `isActive`; if the service is the default and is being deactivated, the default is also cleared and `isDefault` is set to `false`.
- **Set Default:** `PATCH /api/services/:id/set-default` — sets this service as default; returns `400` if the service is inactive. Clears the `isDefault` flag on any previously default service in the same organization atomically (single DB transaction).

#### Multi-Tenant Isolation

- All service endpoints require `requireOrganization: true` (Elysia macro).
- All DB queries filter by `organizationId = activeOrganizationId`. No cross-organization data is ever returned.

#### Validation

- Input validated via Elysia TypeBox schema on all endpoints.
- `price` and `duration` must be integers; `price` ≥ 0, `duration` ≥ 1.
- `discount` must be an integer between 0 and 100 (inclusive).
- `name` must be a non-empty string of ≤ 100 characters.
- `description`, if provided, must be ≤ 500 characters.

#### Business Rules

- A service being set as default must have `isActive = true`.
- Deleting the current default service is not allowed until the default is reassigned.
- Deactivating the default service automatically clears `isDefault`.
- There is no upper limit on the number of services per organization in MVP.

### 6.2 Non-Functional Requirements

- **Security:** All service endpoints are authenticated and organization-scoped. No unauthenticated access except read access from the public booking page (which returns only active services via `GET /api/public/:slug/services`).
- **Performance:** List endpoint must respond in ≤ 300ms (p95) for organizations with up to 100 services; add DB index on `(organizationId, isActive)`.
- **Data Integrity:** The "set default" operation must be executed in a single database transaction to prevent two services simultaneously holding `isDefault = true`.
- **Input Validation:** All endpoints validate input using TypeBox schemas; malformed requests return `422 Unprocessable Entity` with field-level error details.
- **No `any` types:** TypeScript strict mode; all DTOs defined in `model.ts`.
- **Error Handling:** All errors thrown as `AppError` from `src/core/error.ts`; no plain `Error` objects.

---

## 7. Acceptance Criteria

### AC-01: Create a Service

- **Given** an authenticated owner with an active organization,  
  **When** they `POST /api/services` with a valid `name`, `price`, and `duration`,  
  **Then** the service is created with `isActive = false`, `isDefault = false`, and the response returns the full service object with a `201` status.

- **Given** a `POST /api/services` request with a missing `name` or a `price < 0` or `duration < 1`,  
  **Then** the response returns `422` with field-level validation errors; no record is created.

### AC-02: List Services

- **Given** an owner with 3 active and 2 inactive services,  
  **When** they `GET /api/services`,  
  **Then** all 5 services are returned.

- **Given** a `GET /api/services?activeOnly=true`,  
  **Then** only the 3 active services are returned.

- **Given** a `GET /api/services?search=haircut`,  
  **Then** only services whose names contain "haircut" (case-insensitive) are returned.

- **Given** a `GET /api/services?sort=price_asc`,  
  **Then** services are returned in ascending price order.

### AC-03: Update a Service

- **Given** an existing service,  
  **When** the owner `PATCH /api/services/:id` with a new `price`,  
  **Then** only `price` is updated; all other fields remain unchanged; `updatedAt` is refreshed.

- **Given** a `PATCH /api/services/:id` request that includes `isDefault`,  
  **Then** the response returns `400`; `isDefault` is unchanged.

### AC-04: Toggle Active

- **Given** an active service that is also the default,  
  **When** the owner `PATCH /api/services/:id/toggle-active`,  
  **Then** the service becomes inactive and `isDefault` is cleared (set to `false`); the response confirms both changes.

- **Given** an inactive service,  
  **When** the owner `PATCH /api/services/:id/toggle-active`,  
  **Then** the service becomes active.

### AC-05: Set Default

- **Given** an active service that is not currently the default,  
  **When** the owner `PATCH /api/services/:id/set-default`,  
  **Then** the service's `isDefault` is set to `true` and any previous default service has `isDefault` set to `false`; both changes occur in the same DB transaction; the response returns `200`.

- **Given** an inactive service,  
  **When** the owner `PATCH /api/services/:id/set-default`,  
  **Then** the response returns `400` with an error message: "Service must be active to be set as default"; `isDefault` is unchanged.

### AC-06: Delete a Service

- **Given** a non-default service,  
  **When** the owner `DELETE /api/services/:id`,  
  **Then** the service is permanently deleted and the response returns `200`.

- **Given** the current default service,  
  **When** the owner `DELETE /api/services/:id`,  
  **Then** the response returns `400` with an error message: "Cannot delete the default service. Please set a new default first."; the service is not deleted.

### AC-07: Multi-Tenant Isolation

- **Given** owner A and owner B each have services in separate organizations,  
  **When** owner A calls `GET /api/services`,  
  **Then** only owner A's services are returned; owner B's services are never visible.

- **Given** owner A tries to `PATCH /api/services/:id` where `:id` belongs to owner B's organization,  
  **Then** the response returns `404`; no data is modified.

### AC-08: Unauthenticated Access

- **Given** an unauthenticated request to any `POST`, `PATCH`, or `DELETE` service endpoint,  
  **Then** the response returns `401 Unauthorized`.

---

## 8. Out of Scope

- **Service image/thumbnail upload** — deferred to Phase 2 (listed as out of scope in the Epic).
- **Per-barber service assignment** — all services are available to all barbers in the organization for MVP.
- **Service categories or grouping** — flat list only in MVP.
- **Service-level analytics** (e.g., most booked service) — covered by the Analytics feature, not here.
- **Customer-visible service listing on public booking page** — read logic is owned by the `booking-public` module; this PRD covers only the management (owner/barber) API.
- **Import/export of service catalog** — not required for MVP.
- **Loyalty pricing or membership discounts** — out of scope for the entire Epic MVP.
- **Maximum services per organization limit** — no hard cap in MVP.
