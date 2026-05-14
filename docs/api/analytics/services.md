# Service Analytics

Service-focused analytics — summary stats with trend comparison, a booking-count chart per service, and a paginated list of all services with their period contribution.

---

## `GET /api/analytics/services`

Service summary stats and booking-count chart for the selected period.

```
GET /api/analytics/services?range={range}
Authorization: session cookie
```

### Query Parameters

| Parameter | Type | Required | Values |
|-----------|------|----------|--------|
| `range` | string | Yes | `24h` `week` `month` `6m` `1y` |

### Response

```ts
{
  range: string,
  stats: {
    totalBookings: StatCard,  // distinct completed bookings in period
    totalRevenue:  StatCard   // sum of all booking revenue in period, IDR
  },
  chart: {
    label: string,  // service name
    value: number   // times this service was booked in the period
  }[]
}
```

#### Chart notes

- Each entry in `chart` represents one distinct service.
- `label` uses the **snapshot name** stored in `bookingService.serviceName` at the time of booking, not the current service name.
- `value` is the count of `bookingService` rows for that service in completed bookings within the period.
- Chart is ordered by `value DESC` (most-booked service first).

### Example Request

```http
GET /api/analytics/services?range=week
Cookie: <session>
```

### Example Response

```json
{
  "path": "/api/analytics/services",
  "message": "Success",
  "status": 200,
  "data": {
    "range": "week",
    "stats": {
      "totalBookings": { "current": 10, "previous": 8,      "change": 25,  "direction": "up" },
      "totalRevenue":  { "current": 750000, "previous": 600000, "change": 25, "direction": "up" }
    },
    "chart": [
      { "label": "Hair Cut",   "value": 8 },
      { "label": "Beard Trim", "value": 5 },
      { "label": "Hair Color", "value": 2 }
    ]
  },
  "timeStamp": "2026-05-14T10:00:00.000Z"
}
```

### Error Responses

| Status | Condition |
|--------|-----------|
| `401` | No active session |
| `403` | No active organisation |
| `422` | Invalid `range` value |

---

## `GET /api/analytics/services/list`

Paginated list of all services that appeared in completed bookings during the selected period.

```
GET /api/analytics/services/list?range={range}&page={page}&limit={limit}
Authorization: session cookie
```

### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `range` | string | Yes | — | `24h` `week` `month` `6m` `1y` |
| `page` | number | No | `1` | Page number (1-indexed) |
| `limit` | number | No | `10` | Items per page (max 100) |

### Response

```ts
// data array:
{
  serviceId:     string,
  serviceName:   string,
  totalBookings: number,  // times this service appeared in completed bookings in the period
  percentage:    number,  // share of total bookings, rounded to 1 decimal place
  revenue:       number   // sum of bookingService.price for this service in the period, IDR
}[]

// meta:
{
  page:       number,
  limit:      number,
  totalItems: number,
  totalPages: number,
  hasNext:    boolean,
  hasPrev:    boolean
}
```

#### Percentage calculation

```
percentage = ROUND((serviceBookings / totalCompletedBookings) * 1000) / 10
```

Where `totalCompletedBookings` is the count of distinct completed bookings (not service rows) in the period. Returns `0` when there are no bookings.

### Example Request

```http
GET /api/analytics/services/list?range=week&page=1&limit=10
Cookie: <session>
```

### Example Response

```json
{
  "path": "/api/analytics/services/list",
  "message": "Success",
  "status": 200,
  "data": [
    {
      "serviceId":     "svc_abc111",
      "serviceName":   "Hair Cut",
      "totalBookings": 8,
      "percentage":    53.3,
      "revenue":       480000
    },
    {
      "serviceId":     "svc_def222",
      "serviceName":   "Beard Trim",
      "totalBookings": 5,
      "percentage":    33.3,
      "revenue":       200000
    },
    {
      "serviceId":     "svc_ghi333",
      "serviceName":   "Hair Color",
      "totalBookings": 2,
      "percentage":    13.3,
      "revenue":       70000
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "totalItems": 3,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false
  },
  "timeStamp": "2026-05-14T10:00:00.000Z"
}
```

### Notes

- Only services that appear in **completed** bookings within the period are listed.
- `serviceName` reflects the **current** service name from the `service` table (not the snapshot name).
- `serviceId` links to the canonical service record and can be used for deep-linking to the service detail page.
- `revenue` is the sum of `bookingService.price` for all rows belonging to this service in the period.
- Results are ordered by `totalBookings DESC` (most-booked first).
- Pagination is applied after grouping, so `totalItems` reflects the number of distinct services active in the period.

### Error Responses

| Status | Condition |
|--------|-----------|
| `401` | No active session |
| `403` | No active organisation |
| `422` | Invalid `range` value |
