# Feature PRD: Analytics

**Version:** 1.0
**Date:** April 27, 2026
**Status:** Draft

---

## 1. Feature Name

**Analytics — Sales & Booking Performance Dashboard**

---

## 2. Epic

- **Parent Epic:** [Cukkr — Barbershop Management & Booking System](../epic.md)

---

## 3. Goal

### Problem

Barbershop owners currently have zero visibility into the performance of their business. They cannot answer basic questions such as how many bookings happened today, which service generates the most revenue, or whether sales are trending up or down. This forces all business decisions to be based on gut feeling rather than data, making growth and staffing optimization nearly impossible.

### Solution

Provide an in-app Analytics screen inside the owner's mobile app that aggregates booking and sales data per organization and presents it as stat cards and bar charts across selectable time ranges. Owners can compare the current period to the previous equivalent period to quickly spot trends.

### Impact

- Give owners actionable data to make staffing, pricing, and promotion decisions.
- Increase owner engagement by surfacing business value directly on the app home tab.
- Reduce time-to-insight from "never" to under 2 seconds (p95 page load).

---

## 4. User Personas

| Persona | Role | Need |
|---|---|---|
| **Barbershop Owner** | `owner` | Monitor revenue, booking volume, and trends across their active barbershop. |

---

## 5. User Stories

1. As a **barbershop owner**, I want to view total sales revenue for a selected time range so that I can understand how much my shop has earned.
2. As a **barbershop owner**, I want to see total booking count, split by appointment and walk-in, so that I can understand my booking mix.
3. As a **barbershop owner**, I want to select a time range (24H, Week, Month, 6M, 1Y) so that I can analyze performance over different periods.
4. As a **barbershop owner**, I want to see a percentage change vs the previous equivalent period so that I can quickly identify upward or downward trends.
5. As a **barbershop owner**, I want to tap a bar in the chart so that I can see the exact value for that time bucket.
6. As a **barbershop owner**, I want analytics data scoped to my currently active barbershop so that I never see data from another organization.

---

## 6. Requirements

### Functional Requirements

- The analytics endpoint accepts a `range` query parameter: `24h`, `week`, `month`, `6m`, `1y`.
- The endpoint returns the following stat cards:
  - **Total Sales (IDR):** Sum of prices of all services in completed bookings.
  - **Total Bookings:** Count of all completed bookings.
  - **Appointments:** Count of completed bookings with `type = appointment`.
  - **Walk-Ins:** Count of completed bookings with `type = walk-in`.
- Each stat card includes:
  - Current period value.
  - Previous period value (same duration, immediately preceding).
  - Percentage change: `((current - previous) / previous) * 100`, rounded to 1 decimal place. Return `null` when previous is 0.
  - Direction: `up`, `down`, or `neutral`.
- The endpoint returns a time-bucketed chart dataset for both Sales and Bookings:
  - `24h`: 24 hourly buckets.
  - `week`: 7 daily buckets.
  - `month`: daily buckets for the calendar month.
  - `6m`: monthly buckets (6 months).
  - `1y`: monthly buckets (12 months).
- Each bucket in the chart dataset contains: `label` (human-readable period), `sales` (IDR total), `bookings` (count).
- All data is filtered by `organizationId` from the active session.
- Only bookings with `status = completed` contribute to stats and chart data.
- The `GET /api/analytics` endpoint requires authentication (`requireOrganization: true`).
- Analytics query results are cached per `(organizationId, range)` for 60 seconds to reduce DB load.

### Non-Functional Requirements

- Analytics page load ≤ 2s (p95) including chart data.
- All analytics queries must use DB indexes on `organizationId`, `status`, and `createdAt` / `scheduledAt`.
- Cache must be invalidated or expired when a new completed booking is recorded (or rely on 60-second TTL).
- No cross-tenant data access — `organizationId` enforced at query level.
- All monetary values returned as integers (IDR, no decimals).
- Input validation via Elysia TypeBox on the `range` query parameter; reject invalid values with 400.

---

## 7. Acceptance Criteria

### AC-1: Stat cards return correct values

- **Given** an owner has 10 completed bookings in the current week with total sales of IDR 500,000  
- **When** they call `GET /api/analytics?range=week`  
- **Then** the response contains `totalSales: 500000`, `totalBookings: 10` for the current period.

### AC-2: Percentage change is calculated correctly

- **Given** last week had 5 bookings and this week has 10  
- **When** the owner requests `range=week`  
- **Then** the booking change shows `+100.0%` with direction `up`.

### AC-3: Previous period is zero

- **Given** the previous period had 0 completed bookings  
- **When** percentage change would be division by zero  
- **Then** the API returns `change: null` and `direction: "neutral"` for that stat.

### AC-4: Walk-In vs Appointment split

- **Given** 6 walk-in and 4 appointment completed bookings this week  
- **When** the owner requests `range=week`  
- **Then** `walkIns: 6` and `appointments: 4` are returned.

### AC-5: Chart buckets are correct

- **Given** `range=week` is requested  
- **When** the chart data is returned  
- **Then** there are exactly 7 daily buckets, each with a `label` (e.g., `"Mon"`), `sales`, and `bookings` value.

### AC-6: Only completed bookings count

- **Given** there are bookings with `status = waiting`, `in_progress`, and `completed`  
- **When** analytics are fetched  
- **Then** only `completed` bookings contribute to sales and counts.

### AC-7: Organization isolation

- **Given** two organizations each have their own completed bookings  
- **When** owner A requests analytics  
- **Then** only owner A's organization's data is returned; owner B's data is never included.

### AC-8: Invalid range rejected

- **Given** an authenticated owner sends `GET /api/analytics?range=forever`  
- **When** the request is processed  
- **Then** the API returns `400 Bad Request`.

### AC-9: Caching

- **Given** an analytics request has been made within the last 60 seconds  
- **When** the same `(organizationId, range)` is requested again  
- **Then** the response is served from cache without hitting the database a second time.

---

## 8. Out of Scope

- Per-barber analytics breakdown (Phase 2.1).
- Per-service revenue breakdown.
- Export to CSV or PDF.
- Real-time live updates / WebSocket push.
- Revenue forecasting or predictive analytics.
- Custom date range picker (only predefined ranges: 24h, week, month, 6m, 1y).
- Analytics for non-owner roles (barbers do not have access).
- Service image or barbershop logo display on analytics screen.
- Reviews or rating aggregations in analytics.
