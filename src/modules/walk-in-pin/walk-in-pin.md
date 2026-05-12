# Walk-In PIN

Sistem PIN untuk memungkinkan customer walk-in membuat booking sendiri melalui form publik, tanpa perlu login.

## Konsep

Staff generate satu PIN 4 digit per organisasi. PIN ini ditampilkan di meja/layar kasir. Customer memasukkan PIN → mendapat token sementara → mengisi form booking.

```
Staff generate PIN "4821"
        │
        ▼
Customer masukkan PIN di form publik
        │
        ▼
Sistem beri validationToken (JWT, berlaku 15 menit)
        │
        ▼
Customer submit booking dengan validationToken
        │
        ▼
Booking terbuat ✓
```

- Satu PIN berlaku untuk **banyak customer** sekaligus
- PIN tidak expire — hanya berubah jika staff generate ulang
- `validationToken` **single-use** (tidak bisa dipakai dua kali)

---

## Endpoints

### Staff (butuh autentikasi)

#### `POST /api/pin/generate`
Generate PIN baru. Menimpa PIN lama jika sudah ada.

**Response**
```json
{
  "data": {
    "pin": "4821"
  }
}
```

---

#### `GET /api/pin/current`
Lihat PIN yang sedang aktif (jika staff lupa).

**Response**
```json
{
  "data": {
    "pin": "4821"
  }
}
```
`pin` bernilai `null` jika belum pernah di-generate.

---

### Publik (tanpa autentikasi)

#### `GET /api/public/:slug/form-data`
Ambil data untuk mengisi form walk-in (daftar layanan, info barbershop).

**Params:** `slug` — slug organisasi

---

#### `POST /api/public/:slug/pin/validate`
Validasi PIN yang dimasukkan customer. Jika benar, kembalikan `validationToken`.

**Body**
```json
{ "pin": "4821" }
```

**Response**
```json
{
  "data": {
    "validationToken": "<jwt>"
  }
}
```

> Rate limited: 5 kali salah dari IP yang sama → blocked sementara (429).

---

#### `POST /api/public/:slug/walk-in`
Buat booking walk-in menggunakan `validationToken` dari endpoint sebelumnya.

**Body**
```json
{
  "validationToken": "<jwt>",
  "customerName": "Budi",
  "customerPhone": "08123456789",
  "customerEmail": null,
  "serviceIds": ["<service-id>"],
  "barberId": null,
  "notes": null
}
```

**Response** — detail booking yang terbuat (status `201`).

> `validationToken` hanya bisa dipakai **sekali**. Pakai dua kali → 401.

---

## Flow Lengkap (Frontend)

```
1. GET  /api/public/:slug/form-data        → ambil list service & info shop
2. POST /api/public/:slug/pin/validate     → customer input PIN → dapat token
3. POST /api/public/:slug/walk-in          → submit form booking dengan token
```
