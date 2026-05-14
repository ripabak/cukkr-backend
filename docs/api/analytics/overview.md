# Overview Analytics

Dashboard summary endpoint — covers all key metrics, trend charts, and top-performer highlights in a single response.

---

## `GET /api/analytics`

```
GET /api/analytics?range={range}
Authorization: session cookie
```

### Query Parameters

| Parameter | Type | Required | Values |
|-----------|------|----------|--------|
| `range` | string | Yes | `24h` `week` `month` `6m` `1y` |

### Response

```ts
{
  range: "week",
  stats: {
    totalSales:      StatCard,   // total revenue from completed bookings
    totalBookings:   StatCard,   // distinct completed booking count
    totalCustomers:  StatCard,   // distinct customer count with completed bookings
    appointments:    StatCard,   // completed bookings of type "appointment"
    walkIns:         StatCard    // completed bookings of type "walk_in"
  },
  chart: {
    revenue:   ChartPoint[],     // revenue value per time bucket
    customers: ChartPoint[]      // unique customer count per time bucket
  },
  highlights: {
    topBarber:  HighlightItem | null,
    topService: HighlightItem | null
  }
}
```

#### ChartPoint

```ts
{ label: string, value: number }
```

Bucket labels by range:

| Range | Label format | Example |
|-------|-------------|---------|
| `24h` | `"HH:00"` (WIB) | `"14:00"` |
| `week` | Day abbreviation | `"Mon"` |
| `month` | Zero-padded day | `"05"` |
| `6m` / `1y` | Month abbreviation | `"Jan"` |

#### HighlightItem

```ts
{
  id:       string,         // member ID (barber) or service ID
  name:     string,
  imageUrl: string | null,
  count:    number,         // cuts (barber) or books (service)
  revenue:  number          // in IDR (smallest unit, e.g. 65000 = Rp65k)
}
```

### Example Request

```http
GET /api/analytics?range=week
Cookie: <session>
```

### Example Response

```json
{
  "path": "/api/analytics",
  "message": "Success",
  "status": 200,
  "data": {
    "range": "week",
    "stats": {
      "totalSales":     { "current": 650000, "previous": 500000, "change": 30, "direction": "up" },
      "totalBookings":  { "current": 10,     "previous": 8,      "change": 25, "direction": "up" },
      "totalCustomers": { "current": 8,      "previous": 6,      "change": null,"direction": "neutral" },
      "appointments":   { "current": 4,      "previous": 3,      "change": 33.3,"direction": "up" },
      "walkIns":        { "current": 6,      "previous": 5,      "change": 20, "direction": "up" }
    },
    "chart": {
      "revenue":   [{ "label": "Mon", "value": 80000 }, { "label": "Tue", "value": 120000 }, "..."],
      "customers": [{ "label": "Mon", "value": 3 },     { "label": "Tue", "value": 5 },      "..."]
    },
    "highlights": {
      "topBarber": {
        "id": "member_abc123",
        "name": "Pepe Julian",
        "imageUrl": null,
        "count": 6,
        "revenue": 480000
      },
      "topService": {
        "id": "svc_xyz789",
        "name": "Hair Cut",
        "imageUrl": "https://cdn.example.com/haircut.jpg",
        "count": 8,
        "revenue": 640000
      }
    }
  },
  "timeStamp": "2026-05-14T10:00:00.000Z"
}
```

### Notes

- Only **completed** bookings contribute to all stats and charts.
- Results are cached per organisation + range for **60 seconds**.
- `topBarber` is determined by cuts (distinct completed booking count) handled via `handledByBarberId`; `null` when no barber has handled any booking in the period.
- `topService` is ranked by how many times it was booked; `null` when no completed bookings exist.
- Revenue values are in **IDR integer** (e.g. `65000` = Rp65.000).

### Error Responses

| Status | Condition |
|--------|-----------|
| `401` | No active session |
| `403` | No active organisation |
| `422` | Invalid `range` value |
