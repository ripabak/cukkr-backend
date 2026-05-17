# Booking Flow Documentation

## Overview

Ada dua jalur utama dalam pembuatan booking:

1. **Barber Flow** — Barber/owner membuat booking langsung dari dashboard
2. **Public Booking Flow** — Customer membuat booking sendiri melalui link/form publik

---

## 1. Barber Flow

**Endpoint:** `POST /api/bookings`  
**Auth:** Required (barber/owner)

### Walk-In (langsung datang)

```
Barber input data customer → status: waiting
```

| Status | Keterangan |
|--------|-----------|
| `waiting` | Customer menunggu giliran |
| `in_progress` | Sedang dilayani |
| `completed` | Selesai |
| `cancelled` | Dibatalkan |

**Transisi yang diizinkan:**
```
waiting → in_progress
waiting → cancelled
in_progress → completed
in_progress → waiting
in_progress → cancelled
```

### Appointment (jadwal)

```
Barber input data + jadwal → status: waiting
```

Appointment yang dibuat barber langsung masuk `waiting` — tidak perlu konfirmasi lagi.

**Transisi sama dengan walk-in.**

---

## 2. Public Booking Flow

Base URL: `/api/public/booking/:slug`

Tidak memerlukan auth. Slug mengidentifikasi barbershop.

---

### 2a. Walk-In via Form Publik

Customer datang langsung, scan QR/masuk link barbershop, dan booking sendiri.  
**Wajib validasi PIN** yang di-generate barber.

```
┌─────────────────────────────────────────────────────────────┐
│                     BARBER (Dashboard)                      │
│                                                             │
│  POST /api/pin/generate   →   PIN: 1234  (berlaku sampai    │
│                                          di-generate ulang) │
└────────────────────────────┬────────────────────────────────┘
                             │ Barber kasih tau PIN ke customer
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                    CUSTOMER (Public Form)                   │
│                                                             │
│  1. GET  /api/public/booking/:slug/form-data                │
│     → Ambil daftar layanan & barber yang tersedia           │
│                                                             │
│  2. POST /api/public/booking/:slug/pin/validate             │
│     Body: { pin: "1234" }                                   │
│     → Dapat validationToken (JWT, one-time use)             │
│                                                             │
│  3. POST /api/public/booking/:slug/walk-in                  │
│     Body: { validationToken, customerName, serviceIds, ... }│
│     → Booking dibuat, status: waiting                       │
└─────────────────────────────────────────────────────────────┘
```

**Catatan PIN:**
- PIN bersifat 4 digit angka
- Satu PIN bisa dipakai banyak customer (reusable) — setiap validasi menghasilkan token unik
- Token hanya bisa dipakai **sekali** untuk membuat booking
- Setelah 5 kali salah dari IP yang sama → diblokir (429)

---

### 2b. Appointment via Form Publik

Customer membuat janji temu dari luar. Tidak perlu PIN.

```
┌─────────────────────────────────────────────────────────────┐
│                    CUSTOMER (Public Form)                   │
│                                                             │
│  1. GET  /api/public/booking/:slug/form-data                │
│     → Ambil layanan, barber, dan jadwal tersedia            │
│                                                             │
│  2. POST /api/public/booking/:slug/appointment              │
│     Body: { customerName, serviceIds, scheduledAt, ... }    │
│     → Booking dibuat, status: requested                     │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼ Notifikasi dikirim ke owner & barber
┌─────────────────────────────────────────────────────────────┐
│                    BARBER (Dashboard)                       │
│                                                             │
│  Lihat di daftar request appointment                        │
│                                                             │
│  POST /api/bookings/:id/accept  →  status: waiting          │
│  POST /api/bookings/:id/decline →  status: cancelled        │
└─────────────────────────────────────────────────────────────┘
```

**Transisi appointment (customer-created):**
```
requested → waiting     (accept)
requested → cancelled   (decline)
waiting   → in_progress
waiting   → cancelled
in_progress → completed
in_progress → waiting
in_progress → cancelled
```

---

## 3. Status Lifecycle

```
                    ┌─── WALK-IN ────────────────────────┐
                    │                                    │
                    │   [waiting] ──→ [in_progress] ──→ [completed]
                    │       │              │
                    │       └──────────────┴──→ [cancelled]
                    │
                    └─── APPOINTMENT (barber-created) ───┘
                         (sama dengan walk-in, langsung waiting)

                    ┌─── APPOINTMENT (customer-created) ─┐
                    │                                    │
                    │   [requested] ──→ [waiting] ──→ [in_progress] ──→ [completed]
                    │       │              │                │
                    │       └──────────────┴────────────────┴──→ [cancelled]
                    │
                    └────────────────────────────────────┘
```

---

## 4. Update Status & Handled By

`PATCH /api/bookings/:id/status`  
**Auth:** Required

Saat status diupdate ke `in_progress`, sistem otomatis menentukan siapa yang menangani:

1. Cek member dari **user yang login** → set sebagai `handledByBarber`
2. Fallback ke `handledByBarberId` yang sudah ada sebelumnya
3. Fallback ke `requestedBarber` (barberId awal dari booking)

**Race condition protection:** Menggunakan `SELECT FOR UPDATE` sehingga tidak bisa dua barber serentak mengambil booking yang sama ke `in_progress`.

**Satu barber hanya boleh punya satu booking `in_progress`** di waktu bersamaan.

---

## 5. In-Progress Booking

`GET /api/bookings/in-progress`  
**Auth:** Required

Mengembalikan booking yang sedang berjalan (`in_progress`) untuk barber yang sedang login.  
Return `null` jika tidak ada.

Berguna untuk:
- Menampilkan booking aktif di dashboard barber
- Mencegah barber memulai booking baru sebelum menyelesaikan yang sedang berjalan

---

## 6. Struktur Module

```
src/modules/
├── bookings/           # Core booking logic (barber-facing)
│   ├── handler.ts      # POST /api/bookings, GET, PATCH status, dll
│   ├── service.ts      # createBooking, createAppointmentRequest,
│   │                   # updateBookingStatus, getInProgressBooking, ...
│   └── model.ts
│
├── public-booking/     # Customer-facing booking (tanpa auth)
│   ├── handler.ts      # /api/public/booking/:slug/...
│   ├── service.ts      # PublicBookingService (delegasi ke booking & walk-in-pin)
│   └── model.ts
│
├── walk-in-pin/        # PIN management (barber-facing, butuh auth)
│   ├── handler.ts      # POST /api/pin/generate, GET /api/pin/current
│   └── service.ts      # generatePin, validatePin, createWalkInBooking
│
└── public/             # Info barbershop (tanpa auth)
    ├── handler.ts      # GET /api/public/barbershop/:slug
    └── service.ts      # getPublicBarbershop, getAvailability
```

---

## 7. Endpoints Summary

### Barber (Auth Required)

| Method | Endpoint | Keterangan |
|--------|----------|-----------|
| `POST` | `/api/bookings` | Buat booking (walk-in/appointment), langsung `waiting` |
| `GET` | `/api/bookings` | List booking harian |
| `GET` | `/api/bookings/in-progress` | Booking aktif barber yang login |
| `GET` | `/api/bookings/requests` | List appointment yang perlu dikonfirmasi |
| `GET` | `/api/bookings/summary` | Ringkasan jumlah booking |
| `GET` | `/api/bookings/:id` | Detail booking |
| `PATCH` | `/api/bookings/:id/status` | Update status booking |
| `POST` | `/api/bookings/:id/accept` | Terima appointment request |
| `POST` | `/api/bookings/:id/decline` | Tolak appointment request |
| `PATCH` | `/api/bookings/:id/reassign` | Pindahkan ke barber lain |
| `POST` | `/api/pin/generate` | Generate PIN walk-in |
| `GET` | `/api/pin/current` | Lihat PIN aktif |

### Customer / Public (No Auth)

| Method | Endpoint | Keterangan |
|--------|----------|-----------|
| `GET` | `/api/public/booking/:slug/form-data` | Daftar layanan & barber |
| `POST` | `/api/public/booking/:slug/pin/validate` | Validasi PIN → dapat token |
| `POST` | `/api/public/booking/:slug/walk-in` | Buat walk-in booking (butuh token) |
| `POST` | `/api/public/booking/:slug/appointment` | Buat appointment request |
| `GET` | `/api/public/barbershop/:slug` | Info barbershop |
| `GET` | `/api/public/barbershop/:slug/availability` | Cek jadwal buka |
