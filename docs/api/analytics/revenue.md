# Revenue Analytics

Detailed revenue breakdown — stats with trend comparison, a revenue chart, and a filterable paginated list of all contributing bookings.

---

## `GET /api/analytics/revenue`

Revenue summary stats and trend chart for the selected period.

```
GET /api/analytics/revenue?range={range}
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
    totalBookings:       StatCard,  // distinct completed booking count
    avgRevenuePerBooking: StatCard, // total revenue / bookings, in IDR
    avgTime:             StatCard   // avg total service duration per booking, in minutes
  },
  chart: ChartPoint[]               // revenue per time bucket
}
```

#### How `avgTime` is calculated

For each completed booking, all `bookingService.duration` values are summed (planned service time). The average across all bookings in the period is returned as an integer (minutes).

```
avgTime = ROUND(SUM(service_durations) / COUNT(bookings))
```

#### How `avgRevenuePerBooking` is calculated

```
avgRevenuePerBooking = ROUND(total_revenue / total_bookings)
```

Returns `0` when there are no bookings in the period.

### Example Request

```http
GET /api/analytics/revenue?range=week
Cookie: <session>
```

### Example Response

```json
{
  "path": "/api/analytics/revenue",
  "message": "Success",
  "status": 200,
  "data": {
    "range": "week",
    "stats": {
      "totalBookings":        { "current": 10, "previous": 8,  "change": 25,   "direction": "up" },
      "avgRevenuePerBooking": { "current": 65000, "previous": 62500, "change": 4, "direction": "up" },
      "avgTime":              { "current": 40, "previous": 38, "change": 5.3, "direction": "up" }
    },
    "chart": [
      { "label": "Mon", "value": 80000 },
      { "label": "Tue", "value": 120000 },
      { "label": "Wed", "value": 95000 },
      { "label": "Thu", "value": 110000 },
      { "label": "Fri", "value": 145000 },
      { "label": "Sat", "value": 200000 },
      { "label": "Sun", "value": 0 }
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

## `GET /api/analytics/revenue/bookings`

Paginated list of all completed bookings in the selected period, sorted by `completedAt` descending.

```
GET /api/analytics/revenue/bookings?range={range}&type={type}&page={page}&limit={limit}
Authorization: session cookie
```

### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `range` | string | Yes | — | `24h` `week` `month` `6m` `1y` |
| `type` | string | No | `all` | `all` `walk_in` `appointment` |
| `page` | number | No | `1` | Page number (1-indexed) |
| `limit` | number | No | `10` | Items per page (max 100) |

#### Type filter

| Value | Shows |
|-------|-------|
| `all` | All completed bookings in the period |
| `walk_in` | Only walk-in bookings |
| `appointment` | Only appointment bookings |

### Response

```ts
// data array:
{
  bookingId:    string,
  customerId:   string,
  customerName: string,
  completedAt:  string,                         // ISO 8601 timestamp
  type:         "walk_in" | "appointment",
  services:     string[],                       // service names in this booking
  revenue:      number                          // total booking revenue in IDR
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

### Example Request

```http
GET /api/analytics/revenue/bookings?range=week&type=walk_in&page=1&limit=5
Cookie: <session>
```

### Example Response

```json
{
  "path": "/api/analytics/revenue/bookings",
  "message": "Success",
  "status": 200,
  "data": [
    {
      "bookingId":    "bk_abc123",
      "customerId":   "cust_xyz",
      "customerName": "Budi Santoso",
      "completedAt":  "2026-05-12T08:30:00.000Z",
      "type":         "walk_in",
      "services":     ["Hair Cut", "Beard Trim"],
      "revenue":      120000
    },
    {
      "bookingId":    "bk_def456",
      "customerId":   "cust_uvw",
      "customerName": "Andi Wijaya",
      "completedAt":  "2026-05-12T09:15:00.000Z",
      "type":         "walk_in",
      "services":     ["Hair Cut"],
      "revenue":      80000
    }
  ],
  "meta": {
    "page": 1,
    "limit": 5,
    "totalItems": 10,
    "totalPages": 2,
    "hasNext": true,
    "hasPrev": false
  },
  "timeStamp": "2026-05-14T10:00:00.000Z"
}
```

### Notes

- Only **completed** bookings are listed.
- `services` contains snapshot names from `bookingService.serviceName` — these reflect the name at the time of booking, not the current service name.
- `revenue` is the sum of all `bookingService.price` values for that booking.
- Results are ordered by `completedAt DESC` (most recent first).
- `customerId` can be used to deep-link to the customer's profile.

### Error Responses

| Status | Condition |
|--------|-----------|
| `401` | No active session |
| `403` | No active organisation |
| `422` | Invalid `range` value |
