# Customer Analytics

Customer-focused analytics — segment customers by new vs returning, track walk-in vs appointment split, and browse a filterable paginated customer list.

---

## `GET /api/analytics/customers`

Customer summary stats and trend chart for the selected period.

```
GET /api/analytics/customers?range={range}
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
    totalCustomers: StatCard,  // distinct customers with completed bookings in period
    totalWalkIn:    StatCard,  // completed bookings of type walk_in
    totalAppointment: StatCard,// completed bookings of type appointment
    totalNew:       StatCard,  // customers whose first-ever booking was in this period
    totalReturn:    StatCard   // customers who had at least one booking before this period
  },
  chart: ChartPoint[]          // distinct customer count per time bucket
}
```

#### New vs Return definition

| Status | Definition |
|--------|-----------|
| **New** | Customer has **no** completed booking in the org before `currentStart` of this period |
| **Return** | Customer has **at least one** completed booking in the org before `currentStart` of this period |

The previous-period StatCard for `totalNew`/`totalReturn` applies the same logic relative to the **previous** period's start, enabling trend comparison.

### Example Request

```http
GET /api/analytics/customers?range=week
Cookie: <session>
```

### Example Response

```json
{
  "path": "/api/analytics/customers",
  "message": "Success",
  "status": 200,
  "data": {
    "range": "week",
    "stats": {
      "totalCustomers":  { "current": 8,  "previous": 6,  "change": 33.3, "direction": "up" },
      "totalWalkIn":     { "current": 5,  "previous": 4,  "change": 25,   "direction": "up" },
      "totalAppointment":{ "current": 3,  "previous": 2,  "change": 50,   "direction": "up" },
      "totalNew":        { "current": 3,  "previous": 2,  "change": 50,   "direction": "up" },
      "totalReturn":     { "current": 5,  "previous": 4,  "change": 25,   "direction": "up" }
    },
    "chart": [
      { "label": "Mon", "value": 2 },
      { "label": "Tue", "value": 3 },
      { "label": "Wed", "value": 1 },
      { "label": "Thu", "value": 4 },
      { "label": "Fri", "value": 5 },
      { "label": "Sat", "value": 6 },
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

## `GET /api/analytics/customers/list`

Paginated list of all customers who had at least one completed booking in the selected period. Supports an additional status filter on top of the date range.

```
GET /api/analytics/customers/list?range={range}&status={status}&page={page}&limit={limit}
Authorization: session cookie
```

### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `range` | string | Yes | — | `24h` `week` `month` `6m` `1y` |
| `status` | string | No | `all` | `all` `new` `return` |
| `page` | number | No | `1` | Page number (1-indexed) |
| `limit` | number | No | `10` | Items per page (max 100) |

#### Status filter

| Value | Shows |
|-------|-------|
| `all` | All customers active in the period |
| `new` | Only customers with no bookings before the period |
| `return` | Only customers with at least one previous booking |

### Response

```ts
// data array:
{
  customerId:    string,
  customerName:  string,
  totalVisits:   number,         // completed bookings in this period
  lastVisitDate: string | null,  // ISO 8601, most recent completedAt in period
  status:        "new" | "return",
  totalRevenue:  number          // sum of booking revenue in this period, IDR
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
GET /api/analytics/customers/list?range=week&status=return&page=1&limit=10
Cookie: <session>
```

### Example Response

```json
{
  "path": "/api/analytics/customers/list",
  "message": "Success",
  "status": 200,
  "data": [
    {
      "customerId":   "cust_abc",
      "customerName": "Budi Santoso",
      "totalVisits":  3,
      "lastVisitDate": "2026-05-13T10:30:00.000Z",
      "status":       "return",
      "totalRevenue": 240000
    },
    {
      "customerId":   "cust_def",
      "customerName": "Andi Wijaya",
      "totalVisits":  1,
      "lastVisitDate": "2026-05-11T09:00:00.000Z",
      "status":       "return",
      "totalRevenue": 80000
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "totalItems": 5,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false
  },
  "timeStamp": "2026-05-14T10:00:00.000Z"
}
```

### Notes

- List is ordered by `totalVisits DESC` (most frequent visitor first).
- `totalVisits` and `totalRevenue` reflect only the **selected period**, not the customer's lifetime.
- `lastVisitDate` is the most recent `completedAt` within the selected period.
- `customerId` can be used to link to the full customer profile (`GET /api/customers/:id`).
- Pagination is applied **after** the status filter, so `totalItems` reflects the filtered count.

### Error Responses

| Status | Condition |
|--------|-----------|
| `401` | No active session |
| `403` | No active organisation |
| `422` | Invalid `range` or `status` value |
