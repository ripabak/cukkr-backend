# Analytics API — Mind Map & Index

## Mind Map

```mermaid
mindmap
  root((Analytics API<br/>/api/analytics))
    Overview
      GET /
        Stats
          Revenue StatCard
          Total Bookings StatCard
          Total Customers StatCard
          Walk-in StatCard
          Appointments StatCard
        Charts
          Revenue Trend
          Customer Trend
        Highlights
          Top Barber
            name · cuts · revenue
          Top Service
            name · books · revenue
    Revenue
      GET /revenue
        Stats
          Total Bookings StatCard
          Avg Revenue / Booking StatCard
          Avg Time min StatCard
        Chart
          Revenue per bucket
      GET /revenue/bookings
        Paginated list
          bookingId
          customerId · customerName
          completedAt
          services[]
          revenue
    Customers
      GET /customers
        Stats
          Total Customers StatCard
          Walk-in StatCard
          Appointment StatCard
          New StatCard
          Return StatCard
        Chart
          Customers per bucket
      GET /customers/list
        Filter
          all · new · return
        Paginated list
          customerId · customerName
          totalVisits
          lastVisitDate
          status new/return
          totalRevenue
    Barbers
      GET /barbers
        Chart
          barberId · barberName · value
      GET /barbers/list
        Full list all members
          barberId · name · imageUrl
          totalCustomers
          totalRevenue
    Services
      GET /services
        Stats
          Total Bookings StatCard
          Total Revenue StatCard
        Chart
          label=serviceName · value=bookings
      GET /services/list
        Paginated list
          serviceId · serviceName
          totalBookings
          percentage
          revenue
```

## Range Filter

All endpoints accept a `range` query parameter:

| Value | Window |
|-------|--------|
| `24h` | Rolling last 24 hours |
| `week` | Last 7 days (day-aligned, WIB) |
| `month` | Current calendar month (WIB) |
| `6m` | Last 6 calendar months |
| `1y` | Last 12 calendar months |

Stats include a **StatCard** (current + previous period + % change + direction) so the UI can show trend indicators.

## Authentication

All endpoints require:
- An active session cookie (`requireAuth: true`)
- An active organisation context (`requireOrganization: true`)

Returns `401` when unauthenticated, `403` when no active organisation.

## StatCard shape

```ts
{
  current:   number,
  previous:  number,
  change:    number | null,   // % change, null when previous = 0
  direction: "up" | "down" | "neutral"
}
```

## Pages

| File | Endpoints covered |
|------|-------------------|
| [overview.md](./overview.md) | `GET /api/analytics` |
| [revenue.md](./revenue.md) | `GET /api/analytics/revenue`, `GET /api/analytics/revenue/bookings` |
| [customers.md](./customers.md) | `GET /api/analytics/customers`, `GET /api/analytics/customers/list` |
| [barbers.md](./barbers.md) | `GET /api/analytics/barbers`, `GET /api/analytics/barbers/list` |
| [services.md](./services.md) | `GET /api/analytics/services`, `GET /api/analytics/services/list` |
