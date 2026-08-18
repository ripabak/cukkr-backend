# Billing & Xendit — Dokumentasi Implementasi

> Dokumentasi teknis bagaimana **Xendit** diintegrasikan ke modul billing Cukkr:
> arsitektur, file, endpoints, alur pembayaran, webhook, database, keamanan, dan testing.
>
> Untuk panduan **setup sandbox** (ambil kredensial, tunnel ngrok, simulasi bayar) lihat
> [`docs/xendit-sandbox.md`](../../docs/xendit-sandbox.md) di root monorepo.

---

## 1. Ringkasan

Cukkr menjual langganan bulanan (Premium Rp 99.000 / Business Rp 299.000) dengan
payment gateway **Xendit — mode sandbox/test** (Invoice API v2, channel **QRIS**).

Model integrasi yang dipakai:

- **Hosted invoice**: server membuat invoice di Xendit → customer diarahkan ke `invoice_url`
  (halaman checkout Xendit) → customer bayar QRIS di sana.
- **Webhook sebagai sumber kebenaran**: status pembayaran hanya dipercaya dari callback
  `invoice.paid` / `invoice.expired`. Redirect/URL invoice **tidak pernah** dipakai untuk
  fulfill langganan — mencegah spoofing.
- **Satu baris langganan per user** (`subscription`), dengan audit log per percobaan bayar
  (`subscription_payment`).
- **Anti-penumpukan invoice**: checkout SELALU menghasilkan invoice QRIS baru (masa berlaku 1
  jam). Kalau masih ada invoice PENDING untuk plan yang sama, yang lama di-expire otomatis
  dulu — sampai ke sisi Xendit — lalu dibuatkan yang baru. User tidak pernah punya 2 tagihan
  aktif sekaligus, dan QRIS yang ditampilkan selalu fresh.

**Sumber kebenaran harga & fitur**: `src/modules/billing/catalog.ts`
(Free / Premium / Business + `maxBarbershops` untuk enforcement).

**Business = contact sales**: plan Business memiliki `requiresContact: true` — **tidak bisa
dibeli langsung via checkout**; calon customer menghubungi `hello@cukkr.com` dulu. Backend
menolak `POST /subscription/checkout` untuk plan ini (400), dan client (app + landing)
menampilkan CTA "Hubungi kami" sebagai ganti tombol bayar.

---

## 2. Arsitektur — Peta File

| File | Peran |
|---|---|
| `src/lib/xendit.ts` | Wrapper tipis ke Xendit API: `createInvoice()`, `verifyWebhookToken()`, `isConfigured()` |
| `src/lib/env.ts` | Validasi env `XENDIT_*` (optional supaya server bisa boot tanpa key) |
| `src/modules/billing/catalog.ts` | `PLANS_CATALOG` — single source of truth plan & harga |
| `src/modules/billing/schema.ts` | Drizzle: tabel `subscription` & `subscription_payment` |
| `src/modules/billing/model.ts` | DTO request/response (Elysia `t.Object`) |
| `src/modules/billing/service.ts` | Business logic: checkout, webhook, aktivasi/perpanjangan, cron, read-side |
| `src/modules/billing/handler.ts` | 4 endpoint Elysia dengan auth macros |
| `src/app.ts` | Registrasi `billingHandler` + cron `subscription-expiry` (03:00) & `payment-reconciliation` (setiap jam) |
| `drizzle/20260816203022_billing-subscriptions.sql` | Migration tabel subscription + subscription_payment |
| `drizzle/20260818062547_add-invoice-url-to-subscription-payment.sql` | Migration kolom `invoice_url` (URL halaman bayar) |
| `tests/modules/billing-subscription.test.ts` | 15 tes end-to-end (Xendit di-mock) |

```
src/lib/xendit.ts  ──►  env.ts (XENDIT_*)
      ▲
      │ HTTP Basic Auth (secret key)
      │ POST {XENDIT_API_URL}/v2/invoices   (fetch, Bun built-in)
      │
src/modules/billing/
      ├── catalog.ts   → plan & harga (Free/Premium/Business)
      ├── service.ts   → startCheckout · handleInvoiceWebhook · activateOrRenew
      │                    getSubscription · expireOverdueSubscriptions
      ├── handler.ts   → 4 endpoint (auth: requireAuth / public webhook)
      ├── schema.ts    → subscription (1 baris/user) + subscription_payment (audit)
      └── model.ts     → DTO
```

---

## 3. Alur End-to-End

```
cukkr-frontend (app)                 cukkr-backend                          Xendit
┌──────────────────────┐   POST /api/billing/subscription/checkout    ┌──────────────┐
│ BillingScreen         │ ───────────────────────────────────────────► │ POST /v2/invoices
│ pilih plan + QRIS      │   { planId, paymentMethod }                 │   (QRIS)
│ "Bayar sekarang" →     │ ◄────────────────────────────────────────── │              │
│ buka invoice_url       │   { invoiceUrl }                            └──────┬───────┘
└──────────────────────┘                                                     │
                                                                            │
      customer bayar QRIS di halaman Xendit (hosted)                        │ webhook
                                                                            ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│ POST /api/billing/webhook/xendit                                                   │
│   header x-callback-token  (diverifikasi constant-time)                            │
│   invoice.paid   →  payment row → paid; subscription: planId=..., ACTIVE,          │
│                     periodEnd = +1 bulan (renewal memperpanjang dari tanggal lama)  │
│   invoice.expired→  payment row → expired (langganan TIDAK berubah)                │
└─────────────────────────────────────────────────────────────────────────────────────┘
        │
        ▼ cron harian 03:00 `subscription-expiry`
   ACTIVE & currentPeriodEnd < now  →  EXPIRED
```

Poin penting urutan di `startCheckout`:

1. Validasi `planId` (harus ada di katalog & harga > 0) + validasi `paymentMethod`
   (hanya yang ada di `ENABLED_PAYMENT_METHODS`).
2. Baca `user.email` / `user.name` dari DB (untuk `payer_email` & `customer`).
3. **Anti-penumpukan check**: cari `subscription_payment` PENDING milik user untuk plan yg sama.
   - Ada → **expire otomatis**: `XenditService.expireInvoice()` (mematikan QRIS lama di
     sisi Xendit, non-blocking) + update row lokal jadi `expired`.
   - Tidak ada → lanjut bikin invoice baru.
   Hasil: setiap checkout selalu membuat invoice FRESH, tidak pernah ada 2 pending sekaligus.
4. Generate `referenceId = cukkr_${nanoid(24)}` + `expiresAt = now + 1 jam`.
5. **Insert `subscription_payment` status `pending` DULU sebelum panggil Xendit** —
   supaya webhook yang datang lebih cepat dari respons invoice tetap bisa dicocokkan
   via `reference_id`.
6. Panggil `XenditService.createInvoice(...)` — pakai `external_id = referenceId`,
   `metadata = { userId, planId }`.
7. Kalau gagal → update payment jadi `failed` (auditable), rethrow.
8. Simpan `xenditInvoiceId` + `invoiceUrl` ke baris payment (dedupe webhook & UI "Belum dibayar").
9. Balikin `{ invoiceId, xenditInvoiceId, invoiceUrl, planId, amount, currency }`.

---

## 4. Endpoints

Semua respons dibungkus envelope `formatResponse`:
`{ path, message, data, status, timeStamp }` (lihat `src/core/format-response.ts`).

| Method & Path | Auth | Fungsi |
|---|---|---|
| `GET /api/billing/plans` | publik | Katalog plan (Free/Premium/Business) dari `catalog.ts` |
| `POST /api/billing/subscription/checkout` | `requireAuth` | Mulai checkout → invoice QRIS baru (berlaku 1 jam); kalau ada pending lama, di-expire otomatis dulu → balikin `invoiceUrl` |
| `GET /api/billing/payments` | `requireAuth` | Riwayat tagihan user — dipakai UI menampilkan invoice yang belum dibayar |
| `GET /api/billing/subscription` | `requireAuth` | Plan efektif user + periode berjalan |
| `POST /api/billing/webhook/xendit` | callback token | Terima `invoice.paid` / `invoice.expired` dari Xendit |

### 4.1. `GET /api/billing/plans` — publik

```json
{
  "path": "/api/billing/plans",
  "message": "Success",
  "data": [
    {
      "id": "free", "name": "Free", "price": 0, "currency": "IDR",
      "interval": "month", "maxBarbershops": 1,
      "features": ["barbershop_count_1", "walk_in_queue", "..."]
    },
    { "id": "premium", "name": "Premium", "price": 99000, "maxBarbershops": 5, "..." : "" },
    { "id": "business", "name": "Business", "price": 299000, "maxBarbershops": null, "..." : "" }
  ]
}
```

Dimakan oleh **cukkr-web** (halaman pricing & checkout) dan **cukkr-frontend** (BillingScreen).
Label fitur diterjemahkan per-client di i18n masing-masing app (bukan di backend).

### 4.2. `POST /api/billing/subscription/checkout` — login

**Body:**

```json
{ "planId": "premium", "paymentMethod": "QRIS" }
```

- `planId`: `"premium" | "business"`. **Business → 400** *"Business plan is available via
  direct contact only"* (contact sales, tidak bisa checkout). Free juga tidak bisa (400).
- `paymentMethod`: opsional, default `"QRIS"`. Hanya channel di
  `ENABLED_PAYMENT_METHODS` yang diterima (saat ini hanya `QRIS`) → selain itu 400.

**Response:**

```json
{
  "data": {
    "invoiceId": "<id baris subscription_payment>",
    "xenditInvoiceId": "inv_...",
    "invoiceUrl": "https://checkout.xendit.co/web/...",
    "planId": "premium",
    "amount": 99000,
    "currency": "IDR"
  }
}
```

**Error yang mungkin:** 400 "Plan is not purchasable" · 400 "Payment method X is not
enabled yet" · 400 "Xendit is not configured" (kalau `XENDIT_SECRET_API_KEY` kosong) · 401 tanpa login.

### 4.3. `GET /api/billing/payments` — login

Riwayat tagihan user (terbaru dulu). Dipakai app untuk menampilkan
**invoice yang belum dibayar** + tombol lanjut bayar.

```json
{
  "data": [
    {
      "id": "<id baris subscription_payment>",
      "planId": "premium",
      "amount": 99000,
      "currency": "IDR",
      "status": "pending",              // pending | paid | expired | failed
      "paymentMethod": "QRIS",
      "invoiceUrl": "https://checkout.xendit.co/web/...",
      "xenditInvoiceId": "inv_...",
      "paidAt": null,
      "expiresAt": "2026-08-19T10:00:00.000Z",
      "createdAt": "2026-08-18T10:00:00.000Z"
    }
  ]
}
```

### 4.4. `GET /api/billing/subscription` — login

**Response:**

```json
{
  "data": {
    "planId": "premium",
    "plan": { "id": "premium", "name": "Premium", "price": 99000, "currency": "IDR", "interval": "month", "maxBarbershops": 5, "features": ["..."] },
    "status": "active",          // active | expired | free
    "currentPeriodStart": "2026-08-16T10:00:00.000Z",
    "currentPeriodEnd": "2026-09-16T10:00:00.000Z"
  }
}
```

Logika: `status = active` hanya jika row `subscription` ada, `status='active'`, dan
`currentPeriodEnd > now`. Tanpa itu → `planId: 'free'`, `status: 'expired'` (row ada tapi
lewat) atau `'free'` (belum pernah bayar), dan `plan: null`.

### 4.5. `POST /api/billing/webhook/xendit` — callback token

Dipanggil langsung oleh **Xendit cloud** (bukan client app). Wajib membawa header
`x-callback-token` — tanpa/header salah → **401** sebelum state disentuh.

**Payload (field yang dipakai, sisanya diabaikan):**

| Field | Keterangan |
|---|---|
| `id` | Xendit invoice id — dicocokkan ke `subscription_payment.xendit_invoice_id` |
| `external_id` | Fallback match — dicocokkan ke `reference_id` (mengatasi webhook yang datang sebelum `xendit_invoice_id` tersimpan) |
| `status` | `PAID` / `EXPIRED` (atau lain → di-ackno, tidak ada aksi) |
| `amount` | Wajib cocok dengan harga plan, kalau tidak → payment `failed` + 400 |
| `paid_at` | Waktu bayar (basis periode langganan) |
| `payment_id` | Disimpan ke `xendit_payment_id` untuk audit |

**Response:**

```json
{ "data": { "received": true, "paymentStatus": "paid" } }
```

`paymentStatus` bisa: `paid`, `expired`, `unknown` (invoice tidak ditemukan), status mentah
lainnya, atau `rejected` (401 token salah).

---

## 5. Webhook Handling — Detail

Implementasi: `BillingService.handleInvoiceWebhook()` (`service.ts`) + verifikasi token di
`handler.ts`.

1. **Verifikasi token** — `XenditService.verifyWebhookToken()` membandingkan
   `x-callback-token` dengan `XENDIT_WEBHOOK_TOKEN` memakai `timingSafeEqual`
   (constant-time). Gagal → 401.
2. **Lokasi payment row** — prioritas `xendit_invoice_id`; kalau belum ada (webhook lebih
   cepat dari update invoice), fallback ke `referenceId` dari `external_id`.
3. **Unknown invoice** → balas 2xx `{ received: true, paymentStatus: 'unknown' }`.
   Penting: Xendit menghentikan retry setelah menerima 2xx; kalau kita bebaskan 4xx,
   Xendit akan mengulang sampai 6×.
4. **Idempotency** — jika `status != 'pending'`, langsung return status existing,
   tidak ada perubahan state. (Webhook PAID duplikat tidak memperpanjang periode 2×.)
5. **`PAID`**:
   - Ambil plan dari katalog; cek `amount` cocok dengan `plan.price` → tidak cocok:
     payment jadi `failed`, throw 400, **langganan tidak diaktifkan**.
   - `activateOrRenew(userId, planId, paidAt)`.
   - Update payment → `paid` + `paidAt` + `xenditPaymentId`.
6. **`EXPIRED`** — update payment → `expired`. Langganan aktif **tidak** berubah.
7. **Status lain** (`PENDING` dll.) → di-acknowledge, tidak ada aksi.

---

## 6. Aktivasi & Perpanjangan (`activateOrRenew`)

Satu-satunya tempat "data user berubah setelah pembayaran sukses".

| Kondisi | Aksi |
|---|---|
| Sudah ada `subscription` aktif & `currentPeriodEnd > paidAt` | **Perpanjang**: `currentPeriodEnd = currentPeriodEnd + 1 bulan` (dari tanggal berakhir LAMA, bukan dari sekarang) |
| Belum ada / sudah expire / `currentPeriodEnd <= paidAt` | **Baru**: periode mulai dari `paidAt`, berakhir `paidAt + 1 bulan` |

Implementasi memakai upsert (`onConflictDoUpdate` on `user_id`) sehingga aman dari race
duplikat.

---

## 7. Database Schema

Migration: `drizzle/20260816203022_billing-subscriptions.sql`.

### `subscription` — 1 baris per user (unique index `user_id`)

| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | text PK | `nanoid()` |
| `user_id` | text FK→user (cascade) | unique index |
| `plan_id` | text | id katalog (`free`/`premium`/`business`) |
| `status` | text default `active` | `active` / `canceled` / `expired` |
| `current_period_start` / `current_period_end` | timestamptz | periode langganan; `current_period_end` = tanggal expire |
| `auto_renew` | boolean default `false` | placeholder auto-renew (belum aktif) |
| `created_at` / `updated_at` | timestamptz | |

### `subscription_payment` — audit log + idempotency

| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | text PK | `nanoid()` |
| `user_id` | text FK→user (cascade) | indexed |
| `plan_id` | text | plan yang dibeli |
| `amount` | integer | IDR |
| `currency` | text default `IDR` | |
| `status` | text default `pending` | `pending` / `paid` / `expired` / `failed` |
| `reference_id` | text **unique** | merchant key kita = `cukkr_${nanoid(24)}`, dikirim sebagai `external_id` Xendit (idempotency key) |
| `invoice_url` | text nullable | URL halaman checkout Xendit — dipakai UI "Belum dibayar" untuk membuka halaman bayar |
| `xendit_invoice_id` | text unique | id invoice Xendit, untuk dedupe webhook & expire invoice lama |
| `xendit_payment_id` | text | id payment Xendit dari webhook `paid` |
| `payment_method` | text default `QRIS` | |
| `paid_at` | timestamptz nullable | |
| `expires_at` | timestamptz | `now + 1 jam` saat checkout (sinkron dgn `invoice_duration` di Xendit) |
| `created_at` / `updated_at` | timestamptz | |

---

## 8. Cron — Expire & Reconciliation

Di `src/app.ts`, registered via `@elysiajs/cron`:

```ts
{ name: 'subscription-expiry', pattern: '0 3 * * *', run: () => BillingService.expireOverdueSubscriptions() }
{ name: 'payment-reconciliation', pattern: '0 * * * *', run: () => BillingService.expireStalePendingPayments() }
```

| Cron | Fungsi |
|---|---|
| `subscription-expiry` (03:00) | `ACTIVE` yang `currentPeriodEnd < now` → `expired`. Setelahnya `GET /subscription` kembali `planId: 'free'` & `status: 'expired'` |
| `payment-reconciliation` (setiap jam) | `PENDING` yang `expires_at < now` → `expired`. Menutup celah invoice yang tidak pernah menerima webhook (webhook bisa hilang). Logika yang sama juga dijalankan inline saat checkout mengganti pending lama |

---

## 9. Enforcement (Plan → Limit Fitur)

Enforcement sekarang baru di satu tempat: **pembuatan barbershop/organization**.

`src/lib/auth.ts` → `allowUserToCreateOrganization` memanggil
`BillingService.getMaxBarbershops(userId)`:

| Plan | `maxBarbershops` |
|---|---|
| Free | 1 |
| Premium | 3 |
| Business | `null` → unlimited |

`getEffectivePlanId()` menurunkan ke `'free'` saat langganan tidak aktif/expired,
sehingga user yang langganannya habis otomatis kena limit Free.

---

## 10. Konfigurasi Environment

`src/lib/env.ts` (semua opsional — server tetap boot; checkout error 400 sampai diisi):

```bash
# cukkr-backend/.env
XENDIT_SECRET_API_KEY=xnd_development_...   # Dashboard > Settings > Developers > API Keys (Test)
XENDIT_WEBHOOK_TOKEN=xxxx-xxxx-xxxx         # Dashboard > Settings > Webhooks > Callback Token
XENDIT_API_URL=https://api.xendit.co        # default sudah benar
```

- `XENDIT_API_URL` default `https://api.xendit.co`; untuk test bisa diarahkan ke
  `https://api.xendit.co` (sandbox key `xnd_development_*` sudah otomatis menuju sandbox).
- Dokumentasi pengambilan kredensial ada di `docs/xendit-sandbox.md` §2.

---

## 11. Keamanan

- ✅ **Secret key hanya di server** — `src/lib/xendit.ts`, autentikasi Basic Auth
  `base64(secret + ":")` (username = secret key, password kosong, trailing colon dijaga).
- ✅ **Webhook diverifikasi** — `x-callback-token` dibandingkan constant-time
  (`timingSafeEqual`) sebelum state disentuh; tanpa/header salah → 401.
- ✅ **Fulfillment hanya dari webhook** — tidak pernah dari redirect/URL invoice.
- ✅ **Amount diverifikasi** — webhook PAID dengan nominal ≠ harga plan → ditolak 400,
  payment `failed`, langganan tidak aktif.
- ✅ **Idempotent** — `reference_id` sebagai idempotency key + `xendit_invoice_id` untuk
  dedupe; duplicate webhook tidak memperpanjang periode 2×.
- ✅ **Unknown invoice di-acknowledge (2xx)** — supaya Xendit berhenti retry.

---

## 12. Konsumen Integration

### cukkr-frontend (Expo / React Native)

- `src/features/billing/services/billing.service.ts` — klien Eden Treaty:
  `getPlans()`, `getSubscription()`, `startCheckout(planId, paymentMethod)`.
- `src/features/billing/hooks/` — `usePlans()`, `useSubscription()`, `usePayments()`
  (TanStack Query, query keys `["billing","plans"]` / `["billing","subscription"]` / `["billing","payments"]`).
- `src/features/billing/screens/BillingScreen.tsx` —
  - Pilih plan → pilih metode (hanya QRIS aktif; daftar channel di `methods.ts`)
  - `handlePay()` → `startCheckout` → **`Linking.openURL(checkout.invoiceUrl)`**
  - Invalidasi query subscription & payments → modal "menunggu pembayaran"
  - Error "Xendit is not configured" → modal "Pembayaran belum tersedia"
  - **Bagian "Belum dibayar"**: daftar `pending` dari `usePayments()` dengan tombol
    "Lanjutkan bayar" yang membuka `invoiceUrl` pending saat ini (berlaku 1 jam)

### cukkr-web (Next.js)

- `/pricing` + `/checkout` — fetch plan dari `GET /api/billing/plans` (force-dynamic).
- Checkout page adalah **preview/landing**: tombol bayar mengarahkan user ke app
  (`/d/login?redirect=/d/billing`) yang menjalankan `POST /subscription/checkout` sungguhan.

> Sinkronisasi tipe Eden setelah ada perubahan endpoint backend:
> `bunx type-share-eden-elysia sync http://localhost:3000/types/app.d.ts`
> (dijalankan dari `cukkr-frontend/`).

---

## 13. Testing

`tests/modules/billing-subscription.test.ts` — 15 tes. **Xendit tidak pernah dipanggil
beneran**: `XenditService` di-stub dengan `Object.assign` sebelum impor app; token &
secret di-set via `process.env` sebelum `env.ts` dibaca.

```bash
cd cukkr-backend
bun test --env-file=.env tests/modules/billing-subscription.test.ts
```

Yang dites:

1. Checkout tanpa login → 401.
2. Checkout sukses → `invoiceUrl` mengarah ke checkout Xendit + amount/planId benar.
3. Payment method non-QRIS → 400.
4. User baru → effective plan `free`.
5. Webhook `PAID` → subscription aktif (plan premium, ada `currentPeriodEnd`).
6. **Idempotency** — webhook PAID duplikat tidak memperpanjang periode 2×.
7. Webhook token salah → 401.
8. Webhook `EXPIRED` → payment expired, langganan aktif tidak berubah.
9. Webhook PAID dengan amount mismatch → 400.
10. Cron expire — backdate aktivasi → `expireOverdueSubscriptions()` → plan jadi `free`.
11. **Anti-penumpukan** — checkout 2× sebelum bayar → invoice BARU tiap kali, yang lama di-expire (sampai ke Xendit) + hanya 1 pending tersisa.
12. **Stale pending** — backdate `expires_at` → checkout → invoice baru, row lama `expired`.
13. `GET /payments` menampilkan pending + `invoiceUrl`; tanpa login → 401.
14. Reconciliation — `expireStalePendingPayments()` menandai pending basi jadi `expired`.

---

## 14. Status Saat Ini & Roadmap

**Sudah jalan (sandbox MVP):** checkout QRIS → invoice hosted → webhook paid/expired →
aktivasi/perpanjangan 1 bulan → read-side plan → cron expire → enforcement barbershop →
anti-penumpukan invoice (pending lama auto-expire, selalu invoice fresh) → daftar tagihan
belum dibayar → reconciliation invoice basi.

**Belum / roadmap** (lihat `docs/xendit-sandbox.md` §9):

1. **Auto-renew** — ganti mode 1-bulan manual dengan Xendit Subscriptions (recurring).
2. **Channel lain** — tambah Virtual Account / E-Wallet / Retail ke
   `ENABLED_PAYMENT_METHODS` (frontend sudah punya daftar channel di `methods.ts`).
3. **Refund / cancel / downgrade** — endpoint cancel langganan + penanganan refund.
4. **Go-live** — KYC + aktivasi channel live → ganti key test→live → pindahkan webhook ke
   URL produksi.