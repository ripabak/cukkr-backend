# Barber Analytics

Barber-focused analytics — visualise revenue contribution per barber and browse a full list of all organisation members with their period stats.

---

## `GET /api/analytics/barbers`

Revenue chart broken down by barber for the selected period.

```
GET /api/analytics/barbers?range={range}
Authorization: session cookie
```

### Query Parameters

| Parameter | Type | Required | Values |
|-----------|------|----------|--------|
| `range` | string | Yes | `24h` `week` `month` `6m` `1y` |

### Response

```ts
{
  chart: {
    barberId:   string,   // member ID
    barberName: string,
    value:      number    // total revenue in IDR for the period
  }[]
}
```

#### Notes on chart data

- All organisation members are included, even those with zero revenue in the period (value = 0).
- Results are ordered by `value DESC` (highest revenue first).
- `value` is the sum of all `bookingService.price` entries for completed bookings handled by that barber in the period.
- A booking contributes to a barber's revenue only when `booking.handledByBarberId` matches that member.

### Example Request

```http
GET /api/analytics/barbers?range=week
Cookie: <session>
```

### Example Response

```json
{
  "path": "/api/analytics/barbers",
  "message": "Success",
  "status": 200,
  "data": {
    "chart": [
      { "barberId": "member_abc123", "barberName": "Pepe Julian",   "value": 480000 },
      { "barberId": "member_def456", "barberName": "Andi Barberku", "value": 170000 },
      { "barberId": "member_ghi789", "barberName": "Budi Cukur",    "value": 0      }
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

## `GET /api/analytics/barbers/list`

Full list of all organisation members with their aggregated stats for the selected period.

```
GET /api/analytics/barbers/list?range={range}
Authorization: session cookie
```

### Query Parameters

| Parameter | Type | Required | Values |
|-----------|------|----------|--------|
| `range` | string | Yes | `24h` `week` `month` `6m` `1y` |

### Response

```ts
{
  barberId:       string,
  name:           string,
  imageUrl:       string | null,
  totalCustomers: number,   // distinct customers with completed bookings handled by this barber in the period
  totalRevenue:   number    // sum of booking revenue handled by this barber in the period, IDR
}[]
```

### Example Request

```http
GET /api/analytics/barbers/list?range=week
Cookie: <session>
```

### Example Response

```json
{
  "path": "/api/analytics/barbers/list",
  "message": "Success",
  "status": 200,
  "data": [
    {
      "barberId":       "member_abc123",
      "name":           "Pepe Julian",
      "imageUrl":       null,
      "totalCustomers": 5,
      "totalRevenue":   480000
    },
    {
      "barberId":       "member_def456",
      "name":           "Andi Barberku",
      "imageUrl":       "https://cdn.example.com/andi.jpg",
      "totalCustomers": 2,
      "totalRevenue":   170000
    },
    {
      "barberId":       "member_ghi789",
      "name":           "Budi Cukur",
      "imageUrl":       null,
      "totalCustomers": 0,
      "totalRevenue":   0
    }
  ],
  "timeStamp": "2026-05-14T10:00:00.000Z"
}
```

### Notes

- All organisation members are always returned, regardless of activity in the period.
- `totalCustomers` counts distinct customers across completed bookings handled by this barber in the period.
- `totalRevenue` sums `bookingService.price` for all completed bookings handled by this barber in the period.
- Results are ordered by `totalRevenue DESC`.
- `imageUrl` comes from the user's profile image; `null` when no image is set.

### Error Responses

| Status | Condition |
|--------|-----------|
| `401` | No active session |
| `403` | No active organisation |
| `422` | Invalid `range` value |
