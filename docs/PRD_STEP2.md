# Product Requirements Document (PRD)
# Cukkr Step 2 - Backend Surface Completion & Contract Consolidation

**Version:** 1.0
**Date:** April 28, 2026
**Status:** Draft

---

## 1. Executive Summary

### Problem Statement

Backend Cukkr sudah cukup kuat untuk flow internal owner dan barber, tetapi masih ada gap penting yang menghambat parity penuh dengan UI/UX: contract profile yang tumpang tindih, lifecycle appointment yang belum sesuai bisnis, action notification yang belum operasional, media upload yang belum tersedia, dan public booking surface yang belum lengkap.

Tanpa penyelesaian gap ini, frontend akan terdorong membuat workaround per-screen, contract akan drift antar modul, dan flow inti customer booking publik belum bisa berjalan end-to-end.

### Proposed Solution

Step 2 akan menyelesaikan surface backend yang belum lengkap dengan tetap mengikuti struktur modul yang sudah ada di repo: menjadikan `/api/me` sebagai satu-satunya contract profile, menambahkan upload media untuk barbershop dan service, melengkapi flow invitation dan notification actions, memperbaiki lifecycle booking sesuai tipe `walk_in` dan `appointment`, serta membuka public landing, public walk-in support data, dan public appointment flow berbasis slug.

Implementasi harus tetap memakai stack dan pola yang ada saat ini: Bun, Elysia, Better Auth, Drizzle ORM, PostgreSQL, multi-tenant organization scoping, dan pola test integration di `tests/modules`.

### Success Criteria

| Metric | Target |
|---|---|
| Profile mutation contract | 100% mobile profile write menggunakan `/api/me`; tidak ada dependency frontend ke `PATCH /api/auth/profile` |
| Booking lifecycle parity | 100% automated test untuk flow `walk_in` dan `appointment` lulus sesuai state machine final: `walk_in` = `waiting -> in_progress -> completed/cancelled`, `appointment` = `requested -> waiting -> in_progress -> completed/cancelled` |
| Public booking completeness | Public landing, public service/barber/open-hours data, public walk-in support data, dan public appointment submit tersedia dan lulus integration test end-to-end |
| Media upload reliability | Upload logo barbershop dan thumbnail service menerima hanya `image/jpeg`, `image/png`, `image/webp`, menolak file > 5 MB, dan lulus 100% validation test yang ditulis untuk rule ini |
| Notification action parity | Appointment request accept/decline dan barbershop invitation accept/decline bisa dijalankan dari notification contract dan tervalidasi oleh test integration |

---

## 2. User Experience & Functionality

### User Personas

| Persona | Description | Primary Interface |
|---|---|---|
| **Barbershop Owner** | Membuat dan mengelola barbershop, mengundang barber, mengatur service, open hours, branding, dan memonitor booking | Mobile App |
| **Barber** | Menangani booking, menerima invitation, mengelola schedule, dan mengambil alih booking bila diperlukan | Mobile App |
| **Customer (Walk-In)** | Datang ke toko dan mendaftarkan diri ke antrean melalui web publik dengan PIN | Web App |
| **Customer (Appointment)** | Membuka halaman publik barbershop, melihat detail, memilih barber dan service, lalu membuat appointment untuk waktu yang masih dalam open hours | Web App |
| **Frontend Integrator** | Menghubungkan UI mobile dan web ke contract backend yang konsisten dan stabil | Mobile App + Web App |

### User Stories

#### Story A - Single Profile Contract

As a **frontend integrator**, I want all profile read/write actions to use `/api/me` so that mobile profile state does not drift across overlapping backend contracts.

**Acceptance Criteria:**

- `GET /api/me`, `PATCH /api/me`, dan profile-related action di bawah `/api/me` menjadi contract utama profile screen.
- `PATCH /api/auth/profile` dihapus dari backend surface Step 2 dan tidak lagi didokumentasikan untuk frontend.
- Existing mobile profile flows tetap tercakup oleh `/api/me`, `/api/me/avatar`, `/api/me/change-phone`, dan `/api/me/change-phone/verify`.
- Test integration memverifikasi bahwa update profile dilakukan melalui `/api/me` dan tidak membutuhkan route auth profile lama.

#### Story B - Logo Upload for Barbershop

As an **owner**, I want to upload a barbershop logo during onboarding and settings so that the barbershop has visible branding in mobile and web public surfaces.

**Acceptance Criteria:**

- Barbershop entity menyimpan `logoUrl` atau field media setara.
- Tersedia endpoint upload logo untuk org aktif yang hanya menerima `jpeg`, `png`, atau `webp` hingga maksimum 5 MB.
- Response upload mengembalikan URL final yang langsung bisa dipakai UI.
- `GET /api/barbershop` dan public barbershop detail menyertakan logo URL bila ada.
- Upload logo bisa digunakan baik dari onboarding wizard maupun dari halaman settings tanpa contract terpisah.

#### Story C - Atomic Bulk Invite Barber

As an **owner**, I want to invite multiple barbers in one action so that onboarding dan barber management tidak perlu loop request satu per satu dari frontend.

**Acceptance Criteria:**

- Tersedia bulk invite endpoint untuk menerima array invite by email/phone dalam satu request.
- Operasi bersifat atomic: jika satu invite invalid, duplicate, atau tidak memenuhi rule, seluruh request gagal dan tidak ada invite yang dibuat.
- Response sukses mengembalikan seluruh invitation yang berhasil dibuat.
- Pending invite tetap bisa dihapus satu per satu.
- Test integration mencakup success case, duplicate input, invalid target, dan atomic rollback behavior.

#### Story D - Schedule List Sorting and Barber Search

As a **barber/owner**, I want booking list sorting dan barber search di booking form supaya schedule screen sesuai dengan UI dan lebih mudah digunakan.

**Acceptance Criteria:**

- `GET /api/bookings` mendukung query sort eksplisit minimal `recently_added` dan `oldest_first`.
- Default sort untuk all-booking didefinisikan jelas di contract dan didokumentasikan.
- `GET /api/barbers` mendukung query search server-side untuk screen pemilihan barber.
- Response barber list tetap scoped ke organization aktif.
- Test integration mencakup sorting ascending/descending dan search match/non-match.

#### Story E - Correct Booking State Machine by Booking Type

As a **barber/owner**, I want booking status mengikuti flow bisnis final supaya UI schedule, detail booking, dan notifikasi bergerak konsisten.

**Acceptance Criteria:**

- Tidak ada status `pending` dalam flow bisnis Step 2.
- `walk_in` baru selalu dibuat dengan status `waiting`.
- `appointment` baru selalu dibuat dengan status `requested`.
- Transition yang valid:
  - `walk_in`: `waiting -> in_progress -> completed` atau `waiting/in_progress -> cancelled`
  - `appointment`: `requested -> waiting -> in_progress -> completed` atau `requested/waiting/in_progress -> cancelled`
- Action `accept` untuk appointment memindahkan status dari `requested` ke `waiting`.
- Action `decline` untuk appointment menutup request dengan status booking `cancelled`, sementara item notifikasi boleh menampilkan badge `Declined` sebagai presentational state.
- `Handle this` hanya valid untuk booking `walk_in` dengan status `waiting`.
- Validation status transition berada di service layer dan dicakup test positif maupun negatif.

#### Story F - Booking Detail Separates Requested Barber and Handled By

As a **barber/owner**, I want booking detail membedakan barber yang diminta customer dan barber yang akhirnya menangani supaya UI booking detail akurat.

**Acceptance Criteria:**

- Booking detail response menyertakan field terpisah untuk `requestedBarber` dan `handledByBarber`.
- Untuk walk-in tanpa preferensi barber, `requestedBarber` boleh `null`.
- Saat appointment dibuat dengan barber preference, value tersebut disimpan sebagai `requestedBarber`.
- Saat booking mulai ditangani, `handledByBarber` terisi oleh barber yang menerima atau mengambil alih booking.
- Existing payment summary, notes, service lines, dan metadata detail tetap tersedia.

#### Story G - Take Over / Reassign Booking

As a **barber**, I want to take over an eligible booking so that service ownership di lapangan sesuai kondisi aktual tanpa mengubah requested barber history.

**Acceptance Criteria:**

- Tersedia dedicated endpoint untuk take over atau reassign booking.
- Action ini tidak mengubah `requestedBarber`; hanya memperbarui `handledByBarber`.
- Take over hanya valid untuk booking yang masih aktif dan belum `completed` atau `cancelled`.
- Semua action takeover dicatat di response metadata atau audit log internal sesuai pola yang sudah ada.
- Test integration mencakup reassign success, forbidden cross-org, dan invalid terminal state.

#### Story H - Booking Time Rule Uses Open Hours Only

As a **barber/owner** and **customer**, I want booking dapat dibuat kapan saja selama masih berada dalam open hours supaya sistem tidak memblokir slot hanya karena overlap booking.

**Acceptance Criteria:**

- Validasi waktu booking hanya memeriksa apakah tanggal dan jam berada dalam open hours organization untuk hari tersebut.
- Booking di luar open hours ditolak dengan validation error yang eksplisit.
- Step 2 tidak memblokir booking berdasarkan konflik slot antar booking existing.
- Public availability endpoint mengembalikan jam yang dibolehkan berdasarkan open hours, bukan berdasarkan occupancy atau kapasitas barber.
- Internal create booking dan public appointment submit memakai rule open-hours yang sama.

#### Story I - Service Thumbnail Upload

As an **owner**, I want to upload a thumbnail image for each service so that service list dan detail cocok dengan UI.

**Acceptance Criteria:**

- Service entity menyimpan `imageUrl` atau field media setara.
- Tersedia upload endpoint untuk service image dengan validasi MIME dan ukuran yang sama seperti logo barbershop.
- `GET /api/services` dan `GET /api/services/:id` mengembalikan image URL bila ada.
- Frontend tetap dapat membuat service tanpa gambar.
- Test integration mencakup upload success, invalid MIME, oversized file, dan detail/list response yang menyertakan URL.

#### Story J - Invitation Accept/Decline, Expiry Contract, and Removal Safety

As a **barber** and **owner**, I want invitation actions dan removal warning yang jelas supaya membership flow aman dan sesuai UI.

**Acceptance Criteria:**

- Tersedia endpoint accept invitation dan decline invitation yang bisa dipakai dari notification CTA maupun invite link flow.
- Invitation payload menyertakan `expiresAt` dan status `expired` bila sudah lewat 7 hari.
- Accept/decline invitation yang sudah expired mengembalikan error contract yang eksplisit.
- Saat owner mencoba menghapus barber yang masih punya booking aktif (`requested`, `waiting`, `in_progress`), backend mengembalikan warning/blocking response yang jelas.
- Step 2 tidak menghapus barber secara diam-diam bila masih ada booking aktif yang belum diselesaikan atau direassign.

#### Story K - Customer Detail Stats and Booking Type Filter

As an **owner**, I want richer customer detail dan filter riwayat booking berdasarkan tipe supaya halaman customer management sesuai desain.

**Acceptance Criteria:**

- `GET /api/customers/:id/bookings` mendukung filter tipe minimal `all`, `appointment`, dan `walk_in`.
- `GET /api/customers/:id` menyertakan statistik tambahan minimal: total bookings, appointment count, walk-in count, completed count, cancelled count, total spend, dan last visit.
- Notes tetap bisa di-update melalui endpoint yang ada.
- Pagination behavior pada booking history tetap dipertahankan.
- Test integration mencakup filter history dan perhitungan statistik dari data campuran appointment dan walk-in.

#### Story L - Notification Actions for Appointment Requests and Invitations

As a **barber/owner**, I want action endpoint yang spesifik untuk item notification supaya CTA Accept/Decline di notification screen punya contract yang jelas.

**Acceptance Criteria:**

- Notification payload menyertakan `referenceType`, `referenceId`, dan action availability yang cukup untuk render CTA.
- Tersedia mutation spesifik untuk action appointment request dari notification flow.
- Tersedia mutation spesifik untuk action invitation dari notification flow.
- Setelah action sukses, status notification dan target entity diperbarui secara konsisten.
- Mark-as-read generic tetap tersedia dan tidak bentrok dengan action-specific mutation.

#### Story M - Public Landing Page and Public Read Surface

As a **customer**, I want to open a public barbershop page by slug so that I can see branding, basic info, available barbers, available services, dan open hours sebelum membuat booking.

**Acceptance Criteria:**

- Tersedia endpoint public detail by slug.
- Public detail response menyertakan minimal nama, deskripsi, alamat, slug, logo URL, dan metadata open status yang diperlukan UI.
- Tersedia public service list untuk service aktif saja.
- Tersedia public barber list untuk member aktif yang boleh tampil di customer-facing surface.
- Tersedia public open hours endpoint atau field setara yang cukup untuk kalender web.
- Semua endpoint public hanya membaca data dari organization yang sesuai slug.

#### Story N - Public Walk-In Support Data

As a **walk-in customer**, I want public service dan barber data tersedia sebelum submit walk-in supaya form publik bisa diisi dengan benar.

**Acceptance Criteria:**

- Flow `POST /api/public/:slug/pin/validate` dan `POST /api/public/:slug/walk-in` tetap dipertahankan.
- Public GET service/barber endpoints cukup untuk mengisi pilihan `serviceIds` dan `barberId` pada form walk-in.
- Submit walk-in publik tetap memerlukan PIN validation token yang valid.
- Walk-in publik yang berhasil dibuat selalu masuk dengan status `waiting`.
- Test integration mencakup PIN validation, service/barber fetch, dan submit walk-in publik end-to-end.

#### Story O - Public Appointment Flow

As a **customer**, I want to create an appointment from the public web flow so that I can book a future visit tanpa datang langsung ke toko.

**Acceptance Criteria:**

- Tersedia public availability endpoint yang mengembalikan pilihan waktu selama masih dalam open hours untuk tanggal tertentu.
- Tersedia public appointment submit endpoint.
- Public appointment create menyimpan type `appointment`, status `requested`, requested barber preference bila ada, service selections, scheduled date time, dan notes.
- Frontend web boleh tetap memakai Better Auth session yang sudah ada untuk login/register customer; Step 2 tidak membuat auth system baru di luar auth stack yang ada.
- Submit appointment di luar open hours ditolak.
- Submit appointment dalam open hours diterima tanpa mengecek konflik slot existing.
- Test integration mencakup create appointment publik, invalid slug, invalid open-hours, dan transition accept/decline setelah booking tercipta.

### Non-Goals

- Tidak membangun payment gateway, invoice settlement, atau transaksi online pada Step 2.
- Tidak membangun chat inbox atau messaging center untuk customer management.
- Tidak membangun wizard progress persistence khusus onboarding di backend.
- Tidak membangun slot-capacity engine, auto-balancing barber load, atau conflict-based blocking selama jam masih dalam open hours.
- Tidak merombak sistem auth dasar Better Auth di luar kebutuhan integrasi contract Step 2.
- Tidak mengubah module `product-example`.

---

## 3. AI System Requirements (If Applicable)

### Tool Requirements

Tidak ada kebutuhan AI khusus pada Step 2. Semua requirement bersifat transactional backend, media handling, notification actions, dan public booking surface.

### Evaluation Strategy

Tidak berlaku. Evaluasi kualitas Step 2 dilakukan melalui integration testing, schema validation, contract consistency review, dan endpoint-level acceptance testing.

---

## 4. Technical Specifications

### Architecture Overview

Step 2 harus mempertahankan pola modul yang sudah ada di repo dan memperluas modul yang relevan, bukan membuat arsitektur paralel baru.

**Module Responsibilities:**

- **Auth module**
  - Menghapus surface `PATCH /api/auth/profile`.
  - Tetap menangani Better Auth surface untuk session, sign-in, sign-up, change-password, change-email, dan organization plugin.

- **User Profile module**
  - Menjadi single owner untuk profile contract mobile melalui `/api/me`, `/api/me/avatar`, `/api/me/change-phone`, dan `/api/me/change-phone/verify`.

- **Barbershop module**
  - Menyimpan dan mengembalikan `logoUrl`.
  - Menangani upload logo untuk onboarding dan settings.
  - Menyediakan data settings org aktif dan tetap mendukung slug-check.

- **Barbers module**
  - Menambah bulk invite endpoint.
  - Menambah search query untuk list barber.
  - Menambah accept/decline invitation contract atau wrapper yang memetakan ke Better Auth organization invitation.
  - Menambah remove safety rule saat barber masih punya active bookings.

- **Bookings module**
  - Menambah query sort pada list bookings.
  - Menegakkan state machine final tanpa `pending`.
  - Menyimpan `requestedBarber` dan `handledByBarber` secara terpisah.
  - Menambah action accept, decline, dan take over.
  - Memakai open-hours-only validation untuk create booking internal.

- **Services module**
  - Menyimpan `imageUrl`.
  - Menyediakan upload endpoint thumbnail service.

- **Customer Management module**
  - Menambah filter booking history by type.
  - Menambah statistik customer di detail response.

- **Notifications module**
  - Mengekspos action-specific mutation untuk appointment request dan barbershop invitation.
  - Menjaga generic read/unread behavior tetap tersedia.

- **Walk-In PIN / Public booking surface**
  - Memperluas surface publik berbasis slug untuk landing page, barber list, service list, open-hours, availability, walk-in support data, dan appointment create.
  - Tetap mempertahankan PIN validate dan submit walk-in flow yang sudah ada.

**Data Model Changes (minimum expected):**

- Barbershop settings/entity: tambah field media `logoUrl`.
- Services entity: tambah field media `imageUrl`.
- Bookings entity: tambah relasi atau field untuk requested barber dan handled-by barber yang berbeda.
- Invitation response model: tambah `expiresAt`, `expired`, dan status actionability.
- Notification response model: tambah action metadata yang cukup untuk CTA frontend.

**Testing Requirements:**

- Setiap perubahan modul harus memiliki atau memperbarui integration test di `tests/modules`.
- Harus ada regression test untuk lifecycle booking berdasarkan type.
- Harus ada validation test untuk upload MIME dan ukuran file.
- Harus ada test untuk public slug surface dan cross-org isolation.

### Integration Points

| Area | Integration Point | Requirement |
|---|---|---|
| Auth & Session | Better Auth | Tetap dipakai untuk session dan organization membership; invitation accept/decline boleh dibungkus oleh module contract sendiri |
| Database | Drizzle + PostgreSQL | Schema baru wajib dibuat via migration generation; semua data tetap scoped ke organization bila relevan |
| File Storage | `src/lib/storage.ts` | Digunakan untuk upload logo barbershop, avatar, dan image service |
| Notifications | Notifications module + push infra | Action notification harus sinkron dengan target booking/invitation state |
| Public Web | Public slug routes | Harus hanya expose data customer-facing yang aman dan aktif |
| Open Hours | Open hours module | Menjadi satu-satunya sumber validasi waktu booking untuk Step 2 |

### Security & Privacy

- Semua endpoint private tetap memakai auth middleware dan organization scoping yang sudah ada.
- Public endpoints by slug tidak boleh membocorkan data internal non-customer-facing seperti notes internal, inactive services, membership metadata sensitif, atau booking data pelanggan lain.
- Upload media wajib memvalidasi MIME type, size, dan organization ownership sebelum menyimpan file.
- Invitation accept/decline harus memastikan hanya target invitee yang dapat mengambil tindakan.
- Remove barber safety rule harus mencegah kehilangan referensi booking aktif.
- Route public walk-in tetap memakai PIN validation token untuk menghindari penyalahgunaan langsung dari submit endpoint.
- Semua konfigurasi tetap diambil dari `src/lib/env.ts`; tidak ada akses `process.env` langsung di modul feature.

---

## 5. Risks & Roadmap

### Phased Rollout

**MVP (Step 2 target scope):**

- Hapus `PATCH /api/auth/profile` dan standarkan profile ke `/api/me`.
- Upload logo barbershop dan upload service image.
- Bulk invite barber atomic.
- Search barber server-side.
- Sorting booking list.
- State machine booking final tanpa `pending`.
- Requested barber vs handled-by barber.
- Take over booking.
- Customer detail stats + booking type filter.
- Invitation accept/decline + expiry contract + remove safety.
- Notification action endpoints.
- Public landing detail + public services + public barbers + public open-hours + public availability + public appointment submit.
- Public walk-in support data untuk memenuhi form publik.

**v1.1:**

- Improve UX metadata di notification payload seperti reason codes dan richer decline context.
- Tambah audit trace yang lebih kaya untuk action accept/decline/takeover.
- Tambah richer public availability presentation metadata bila frontend membutuhkannya.

**v2.0:**

- Slot-capacity engine berbasis barber load atau durasi service.
- Wait-time prediction dan recommendation engine.
- Customer self-service reschedule/cancel flow publik.

### Technical Risks

| Risk | Impact | Mitigation |
|---|---|---|
| Removing `PATCH /api/auth/profile` may break unknown clients | Medium | Audit caller usage, update docs, add test to ensure `/api/me` covers required fields |
| Booking schema change for requested vs handled barber may affect existing queries | High | Use additive migration first, update serializers and tests before removing old assumptions |
| Notification action endpoint can drift from booking service rules | High | Centralize transition validation in booking and invitation service layer; notifications only orchestrate |
| Public slug endpoints can leak cross-org data | High | Enforce slug-to-org resolution once per request and scope every downstream query |
| File upload misuse or unsupported MIME uploads | Medium | Validate MIME and size server-side before persisting to storage |
| Better Auth invitation internals may not map 1:1 to desired contract | Medium | Wrap plugin behavior in module-specific DTOs and normalize expired/accepted/declined responses |
| Open-hours-only availability can create overlapping bookings | Accepted scope tradeoff | Document explicitly as business rule for Step 2 and defer capacity enforcement to future phase |
