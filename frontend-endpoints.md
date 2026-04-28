# Frontend Endpoint Audit

Dokumen ini membandingkan tiga sumber utama:

- [ui-ux-figma.md](ui-ux-figma.md)
- plan per feature di [docs/ways-of-work/plan/cukkr-barbershop-management](docs/ways-of-work/plan/cukkr-barbershop-management)
- surface backend yang benar-benar ter-mount di [src/app.ts](src/app.ts) dan handler/test terkait

Tujuan dokumen ini adalah menjawab, per halaman frontend: tampilan apa yang ada, konten apa yang dibutuhkan, endpoint apa yang sudah tersedia, dan apa yang masih belum tersedia beserta alasannya.

## Legend

- `Provided`: endpoint utama untuk halaman tersebut sudah tersedia.
- `Partial`: sebagian kebutuhan halaman sudah tersedia, tetapi masih ada gap penting.
- `Missing`: halaman butuh backend surface yang belum ada.
- `Frontend-only`: halaman tidak butuh endpoint backend khusus.

## Ringkasan Cepat

| Halaman | Modul Plan Terkait | Status | Catatan Utama |
|---|---|---|---|
| 1. Mobile Onboarding | onboarding | Frontend-only | Splash dan intro slide tidak butuh endpoint backend khusus |
| 2. Mobile Authentication | authentication | Partial | Login/register ada via Better Auth, parity OTP/email verification belum penuh |
| 3. Create Barbershop Wizard | onboarding, barber-management, service-management, barbershop-settings | Partial | Create shop, invite barber, create first service ada; logo upload dan wizard state belum ada |
| 4. Home / Schedule | booking, schedule-booking-management, multi-barbershop | Partial | List booking dan switch org ada; sort list dan request flow belum penuh |
| 5. Booking Detail | booking, schedule-booking-management | Partial | Detail dan status update ada; requested/handled split dan takeover belum ada |
| 6. Schedule New Book | booking, service-management, barber-management, open-hours | Partial | Create booking ada; slot availability/public-style picker surface belum ada |
| 7. Analytics | analytics | Provided | `GET /api/analytics` sudah menutup kebutuhan dashboard utama |
| 8. Services Management | service-management | Partial | CRUD + search/sort + toggle/default ada; media upload belum ada |
| 9. Barber Management | barber-management | Partial | List/invite/remove ada; invitation accept/decline tidak ada di modul ini |
| 10. Customer Management | customer-management | Partial | List/detail/history/notes ada; send message dan messages tab belum ada |
| 11. Barbershop Settings | barbershop-settings, multi-barbershop | Partial | Read/update settings dan slug check ada; logo/branding media belum ada |
| 12. Open Hours | open-hours | Provided | Read + replace full-week schedule ada |
| 13. Notifications | notifications, booking, barber-management | Partial | Inbox/read/unread/register-token ada; action accept/decline belum ada |
| 14. User Profile | user-profile, authentication | Partial | Read/update profile, avatar upload, sign-out, change password ada; old/new contact verification parity belum penuh |
| 15. Web Customer Booking | walk-in-pin-system, booking | Partial/Missing | Walk-in PIN flow ada sebagian; landing page publik dan appointment flow publik belum ada |

---

## 1. Mobile App — Onboarding

**Modul plan:** `onboarding`

**Status:** `Frontend-only`

### Tampilan

- Splash screen full-screen dengan logo dan nama aplikasi.
- Tiga intro slide dengan ilustrasi, progress dots, dan CTA `Next`, `Love it`, `Get Started`.

### Content

- Branding Cukkr.
- Copy edukasi value proposition aplikasi.
- Navigasi ke halaman login setelah onboarding selesai.

### Endpoint yang Digunakan

| Screen / aksi | Endpoint | Status | Catatan |
|---|---|---|---|
| Splash | Tidak butuh endpoint khusus | Provided | Murni presentation layer |
| Slide 1-3 | Tidak butuh endpoint khusus | Provided | Murni client-side state |
| `Get Started` | Tidak ada endpoint backend khusus | Provided | Hanya navigasi ke auth flow |

### Yang Belum / Kenapa Belum

- Tidak ada module handler onboarding khusus di backend. Ini bukan bug selama state intro memang disimpan di client.
- Kalau frontend ingin menyimpan flag `already_seen_onboarding`, backend juga belum menyediakan surface khusus untuk itu.

### Evidence

- [ui-ux-figma.md](ui-ux-figma.md)
- [docs/ways-of-work/plan/cukkr-barbershop-management/onboarding/prd.md](docs/ways-of-work/plan/cukkr-barbershop-management/onboarding/prd.md)
- [src/app.ts](src/app.ts)

---

## 2. Mobile App — Authentication

**Modul plan:** `authentication`

**Status:** `Partial`

### Tampilan

- Login.
- Register.
- Verify account OTP.
- Forgot password.
- Verify OTP reset password.
- Create new password.

### Content

- Input email/phone, password, confirm password.
- OTP 4 kotak dengan countdown.
- Link forgot password dan sign-up/sign-in.

### Endpoint yang Digunakan

| Screen / aksi | Endpoint | Status | Catatan |
|---|---|---|---|
| Login | `POST /auth/api/sign-in/email` | Provided | Surface Better Auth, dibuktikan di test auth |
| Register | `POST /auth/api/sign-up/email` | Provided | Surface Better Auth |
| Session check setelah login | `GET /auth/api/get-session` | Provided | Dipakai untuk cek session / active org |
| Logout | `POST /auth/api/sign-out` | Provided | Better Auth |
| Change password | `POST /auth/api/change-password` | Provided | Better Auth, sudah diuji |
| Forgot password request | `POST /auth/api/email-otp/request-password-reset` | Provided | Request reset sudah terbukti |
| Update basic profile from auth module | `PATCH /api/auth/profile` | Provided | Update `name`, `bio`, `avatar` string |
| Send phone OTP | `POST /api/auth/phone/send-otp` | Provided | Flow custom auth |
| Verify phone OTP | `POST /api/auth/phone/verify-otp` | Provided | OTP 4 digit |
| Change email | `POST /auth/api/change-email` | Provided | Better Auth surface terbukti reachable di test |

### Yang Belum / Kenapa Belum

- Verify account OTP dan verify OTP reset password tidak punya evidence endpoint submit yang eksplisit di repo test, walau plugin email OTP aktif di Better Auth. Artinya surface kemungkinan ada, tetapi belum bisa saya tandai sebagai “terbukti digunakan” dari repo ini.
- UI/PRD menginginkan email verification yang benar-benar enforced, tetapi [src/lib/auth.ts](src/lib/auth.ts) mengatur `requireEmailVerification: false`, jadi login/signup belum dipaksa verify dulu.
- Flow change email di UI/PRD menginginkan verifikasi dulu, tetapi [src/lib/auth.ts](src/lib/auth.ts) mengatur `updateEmailWithoutVerification: true`, jadi parity dengan UI belum penuh.
- Ada dua surface profile yang tumpang tindih: `PATCH /api/auth/profile` dan `PATCH /api/me`. Frontend perlu memilih satu contract utama agar tidak drift.

### Evidence

- [docs/ways-of-work/plan/cukkr-barbershop-management/authentication/prd.md](docs/ways-of-work/plan/cukkr-barbershop-management/authentication/prd.md)
- [src/lib/auth.ts](src/lib/auth.ts)
- [src/modules/auth/handler.ts](src/modules/auth/handler.ts)
- [src/modules/auth/model.ts](src/modules/auth/model.ts)
- [tests/modules/auth.test.ts](tests/modules/auth.test.ts)
- [TODO_28042026.md](TODO_28042026.md)

---

## 3. Mobile App — Create Barbershop (Wizard)

**Modul plan:** `onboarding`, `barber-management`, `service-management`, `barbershop-settings`

**Status:** `Partial`

### Tampilan

- Step 1 create barbershop.
- Step 2 invite barber.
- Step 3 list konfirmasi barber yang diundang.
- Step 4 create first service.
- Step 5 congratulation.

### Content

- Nama barbershop, logo.
- Email/phone barber yang diundang.
- Service name, description, price, duration.
- Progress indicator wizard.

### Endpoint yang Digunakan

| Step / aksi | Endpoint | Status | Catatan |
|---|---|---|---|
| Create barbershop | `POST /api/barbershop` | Provided | Membuat organization baru |
| Check slug real-time | `GET /api/barbershop/slug-check?slug=...` | Provided | Cocok untuk validasi Book URL selama onboarding |
| Invite barber | `POST /api/barbers/invite` | Provided | Invite satu per satu |
| Remove pending invite dari list | `DELETE /api/barbers/invite/:invitationId` | Provided | Bisa dipakai untuk tombol `X` pada chip invite |
| Create first service | `POST /api/services` | Provided | Menutup step service awal |
| Ambil data barbershop setelah selesai | `GET /api/barbershop` | Provided | Untuk screen congratulation / home handoff |
| Tandai onboarding selesai | `PATCH /api/barbershop/settings` | Partial | Surface ada, tetapi step state wizard tidak didedikasikan |

### Yang Belum / Kenapa Belum

- Upload logo barbershop belum ada. Handler dan schema barbershop belum punya field `logoUrl` atau upload endpoint, padahal UI step 1 menampilkan picker logo.
- Tidak ada backend state khusus untuk progress wizard. Saat ini wizard harus diatur sepenuhnya di frontend.
- Invite barber mendukung satu payload per request, jadi multi-invite di UI harus loop beberapa kali; tidak ada bulk endpoint atomik.

### Evidence

- [docs/ways-of-work/plan/cukkr-barbershop-management/onboarding/prd.md](docs/ways-of-work/plan/cukkr-barbershop-management/onboarding/prd.md)
- [src/modules/barbershop/handler.ts](src/modules/barbershop/handler.ts)
- [src/modules/barbers/handler.ts](src/modules/barbers/handler.ts)
- [src/modules/services/handler.ts](src/modules/services/handler.ts)
- [tests/modules/onboarding.test.ts](tests/modules/onboarding.test.ts)
- [TODO_28042026.md](TODO_28042026.md)

---

## 4. Mobile App — Home / Schedule

**Modul plan:** `booking`, `schedule-booking-management`, `multi-barbershop`

**Status:** `Partial`

### Tampilan

- Schedule home dengan date chip.
- Mini calendar horizontal.
- Active booking list.
- Filter status.
- All bookings view.
- Switch barbershop dari header.

### Content

- Tanggal aktif.
- Status booking (`All`, `Waiting`, `In Progress`, dst).
- Nama customer, barber, durasi, relative time.
- Daftar barbershop untuk switch session.

### Endpoint yang Digunakan

| Area / aksi | Endpoint | Status | Catatan |
|---|---|---|---|
| List booking per hari | `GET /api/bookings?date=YYYY-MM-DD&status=...&barberId=...` | Provided | Surface inti schedule |
| Buka booking detail | `GET /api/bookings/:id` | Provided | Dipakai saat tap card booking |
| Switch list barbershop | `GET /api/barbershop/list` | Provided | Menampilkan semua org yang user ikuti |
| Set active barbershop | `POST /auth/api/organization/set-active` | Provided | Better Auth organization plugin, terbukti di test |
| Cek session active org | `GET /auth/api/get-session` | Provided | Untuk sinkronisasi client setelah switch |

### Yang Belum / Kenapa Belum

- UI all-booking punya sort `Recently Added` dan `Oldest First`, tetapi `BookingListQuery` hanya expose `date`, `status`, `barberId`. Tidak ada query `sort`, sehingga sort surface backend belum tersedia secara eksplisit.
- UI notifikasi dan state machine menampilkan status `Requested`, tetapi implementasi create booking saat ini masih default `waiting`, jadi requested flow belum menyatu dengan schedule inbox.
- Tidak ada dedicated endpoint untuk aggregate calendar/availability; mini calendar di UI harus dibangun dari client state atau hasil list bookings per tanggal.

### Evidence

- [docs/ways-of-work/plan/cukkr-barbershop-management/booking/prd.md](docs/ways-of-work/plan/cukkr-barbershop-management/booking/prd.md)
- [docs/ways-of-work/plan/cukkr-barbershop-management/schedule-booking-management/implementation-plan.md](docs/ways-of-work/plan/cukkr-barbershop-management/schedule-booking-management/implementation-plan.md)
- [docs/ways-of-work/plan/cukkr-barbershop-management/multi-barbershop/prd.md](docs/ways-of-work/plan/cukkr-barbershop-management/multi-barbershop/prd.md)
- [src/modules/bookings/handler.ts](src/modules/bookings/handler.ts)
- [src/modules/bookings/model.ts](src/modules/bookings/model.ts)
- [src/modules/barbershop/handler.ts](src/modules/barbershop/handler.ts)
- [tests/modules/multi-barbershop.test.ts](tests/modules/multi-barbershop.test.ts)
- [TODO_28042026.md](TODO_28042026.md)

---

## 5. Mobile App — Booking Detail

**Modul plan:** `booking`, `schedule-booking-management`

**Status:** `Partial`

### Tampilan

- Header back + more options.
- Customer info dan status badge.
- Booking metadata.
- Services list.
- Notes.
- Payment summary.
- Action button sesuai state.

### Content

- Book number.
- Requested barber / handled by.
- Service line items dan harga.
- Status action: handle, complete, mark as waiting, cancel, take over.

### Endpoint yang Digunakan

| Area / aksi | Endpoint | Status | Catatan |
|---|---|---|---|
| Load detail | `GET /api/bookings/:id` | Provided | Sudah expose customer, barber, services, notes, timestamps |
| Handle booking | `PATCH /api/bookings/:id/status` dengan `status=in_progress` | Provided | Menutup aksi `Handle this` |
| Mark as waiting | `PATCH /api/bookings/:id/status` dengan `status=waiting` | Provided | Menutup aksi revert |
| Complete booking | `PATCH /api/bookings/:id/status` dengan `status=completed` | Provided | Menutup aksi complete |
| Cancel booking | `PATCH /api/bookings/:id/status` dengan `status=cancelled` | Provided | Menutup aksi cancel |

### Yang Belum / Kenapa Belum

- UI membedakan `Requested` dan `Handled By`, tetapi `BookingDetailResponse` hanya punya satu field `barber`. Model backend belum memisahkan barber yang diminta vs barber yang akhirnya menangani.
- UI punya aksi `Take Over This Booking`, tetapi tidak ada endpoint dedicated takeover/reassign barber.
- Walau enum status sudah memuat `pending`, implementasi create booking internal saat ini mengisi status `waiting`, sehingga flow appointment-request belum tertutup penuh.

### Evidence

- [docs/ways-of-work/plan/cukkr-barbershop-management/booking/prd.md](docs/ways-of-work/plan/cukkr-barbershop-management/booking/prd.md)
- [src/modules/bookings/handler.ts](src/modules/bookings/handler.ts)
- [src/modules/bookings/model.ts](src/modules/bookings/model.ts)
- [src/modules/bookings/service.ts](src/modules/bookings/service.ts)
- [TODO_28042026.md](TODO_28042026.md)

---

## 6. Mobile App — Schedule New Book (by Admin/Barber)

**Modul plan:** `booking`, `service-management`, `barber-management`, `open-hours`

**Status:** `Partial`

### Tampilan

- Form walk-in.
- Form appointment.
- Calendar picker.
- Time picker.
- Select services.
- Select barber.

### Content

- Customer name.
- Email/phone optional.
- Preferred barber optional.
- Date/time appointment.
- Multi-select service.

### Endpoint yang Digunakan

| Area / aksi | Endpoint | Status | Catatan |
|---|---|---|---|
| Submit walk-in | `POST /api/bookings` | Provided | `type=walk_in` |
| Submit appointment | `POST /api/bookings` | Provided | `type=appointment` |
| Load service list untuk picker | `GET /api/services?search=...&sort=...&activeOnly=true` | Provided | Search/sort tersedia di query model |
| Load barber list untuk picker | `GET /api/barbers` | Provided | Frontend bisa filter lokal untuk search |
| Load open hours untuk appointment picker | `GET /api/open-hours` | Provided | Dipakai untuk constraint kalender/jam |

### Yang Belum / Kenapa Belum

- Tidak ada endpoint khusus slot availability. UI time picker appointment idealnya butuh daftar slot valid/tersedia, tetapi backend saat ini tidak menyediakan `GET /availability` atau surface serupa.
- Search barber pada sub-screen belum punya query endpoint; frontend harus ambil semua barber lalu filter lokal.
- Konflik booking real-time per slot/barber tidak punya surface eksplisit di handler. Kalau ada validasi di service, itu belum diekspos sebagai endpoint pencarian slot.

### Evidence

- [docs/ways-of-work/plan/cukkr-barbershop-management/booking/prd.md](docs/ways-of-work/plan/cukkr-barbershop-management/booking/prd.md)
- [src/modules/bookings/handler.ts](src/modules/bookings/handler.ts)
- [src/modules/services/model.ts](src/modules/services/model.ts)
- [src/modules/barbers/handler.ts](src/modules/barbers/handler.ts)
- [src/modules/open-hours/handler.ts](src/modules/open-hours/handler.ts)
- [tests/modules/bookings.test.ts](tests/modules/bookings.test.ts)

---

## 7. Mobile App — Analytics

**Modul plan:** `analytics`

**Status:** `Provided`

### Tampilan

- Filter tabs `24H`, `Week`, `Month`, `6M`, `1Y`.
- Stat cards.
- Sales chart.
- Bookings chart.

### Content

- Total sales.
- Total books.
- Appointment count.
- Walk-in count.
- Chart dataset dan persentase perubahan.

### Endpoint yang Digunakan

| Area / aksi | Endpoint | Status | Catatan |
|---|---|---|---|
| Load analytics dashboard | `GET /api/analytics?range=24h|week|month|6m|1y` | Provided | Surface tunggal untuk semua filter range |

### Yang Belum / Kenapa Belum

- Dari perspektif endpoint, kebutuhan utama analytics sudah tertutup.
- Detail presentasi chart seperti format label tooltip/presisi persentase bukan gap endpoint, tetapi implementasi response detail tetap perlu dicocokkan oleh frontend.

### Evidence

- [docs/ways-of-work/plan/cukkr-barbershop-management/analytics/implementation-plan.md](docs/ways-of-work/plan/cukkr-barbershop-management/analytics/implementation-plan.md)
- [src/modules/analytics/handler.ts](src/modules/analytics/handler.ts)
- [tests/modules/analytics.test.ts](tests/modules/analytics.test.ts)

---

## 8. Mobile App — Services Management

**Modul plan:** `service-management`

**Status:** `Partial`

### Tampilan

- Service list.
- Search bar.
- Sort/filter bottom sheet.
- Service detail.
- Edit sub-screen per field.
- New service form.

### Content

- Name, description, price, duration, discount.
- Active toggle.
- Default badge.
- Thumbnail/foto service.

### Endpoint yang Digunakan

| Area / aksi | Endpoint | Status | Catatan |
|---|---|---|---|
| Create service | `POST /api/services` | Provided | Menutup form service baru |
| List services | `GET /api/services` | Provided | Mendukung `search`, `sort`, `activeOnly` |
| Service detail | `GET /api/services/:id` | Provided | Detail service |
| Edit service | `PATCH /api/services/:id` | Provided | Partial update per field |
| Delete service | `DELETE /api/services/:id` | Provided | Menutup modal delete |
| Toggle active | `PATCH /api/services/:id/toggle-active` | Provided | Menutup switch active |
| Set default | `PATCH /api/services/:id/set-default` | Provided | Menutup modal set as default |

### Yang Belum / Kenapa Belum

- UI menampilkan thumbnail/foto service, tetapi schema/model/handler service belum punya field image maupun upload endpoint.
- Validasi file MIME/size untuk service media juga belum ada karena upload endpoint-nya sendiri belum ada.

### Evidence

- [docs/ways-of-work/plan/cukkr-barbershop-management/service-management/prd.md](docs/ways-of-work/plan/cukkr-barbershop-management/service-management/prd.md)
- [src/modules/services/handler.ts](src/modules/services/handler.ts)
- [src/modules/services/model.ts](src/modules/services/model.ts)
- [tests/modules/service-management.test.ts](tests/modules/service-management.test.ts)
- [TODO_28042026.md](TODO_28042026.md)

---

## 9. Mobile App — Barber Management

**Modul plan:** `barber-management`

**Status:** `Partial`

### Tampilan

- List barbers dengan status.
- Invite barber sub-screen.
- Remove confirmation modal.

### Content

- Nama barber.
- Status `Active` / `Pending`.
- Email/phone invitee.
- Remove member action.

### Endpoint yang Digunakan

| Area / aksi | Endpoint | Status | Catatan |
|---|---|---|---|
| List barbers | `GET /api/barbers` | Provided | Cocok untuk halaman utama barber management |
| Invite barber | `POST /api/barbers/invite` | Provided | Invite by email/phone |
| Cancel pending invite | `DELETE /api/barbers/invite/:invitationId` | Provided | Menutup action hapus undangan pending |
| Remove barber | `DELETE /api/barbers/:memberId` | Provided | Menutup modal remove |

### Yang Belum / Kenapa Belum

- Accept/Decline invitation tidak ada di modul `barbers`; kalau frontend ingin CTA di inbox atau link invite, saat ini itu belum dibuktikan di modul ini.
- Expiry invitation 7 hari tidak tampak sebagai surface endpoint tersendiri. Kalau logika expiry ada di service/plugin, repositori ini belum memberinya contract UI yang jelas.
- Warning saat remove barber dengan active booking tidak terlihat dari handler contract yang ada.

### Evidence

- [docs/ways-of-work/plan/cukkr-barbershop-management/barber-management/prd.md](docs/ways-of-work/plan/cukkr-barbershop-management/barber-management/prd.md)
- [src/modules/barbers/handler.ts](src/modules/barbers/handler.ts)
- [tests/modules/barbers.test.ts](tests/modules/barbers.test.ts)
- [TODO_28042026.md](TODO_28042026.md)

---

## 10. Mobile App — Customer Management

**Modul plan:** `customer-management`

**Status:** `Partial`

### Tampilan

- Customer list.
- Search mode.
- Select mode.
- Send messages.
- Customer detail tab `General`, `Booking`, `Notes`, `Messages`.

### Content

- Name, total book, total value.
- Verified badge.
- Booking history.
- Notes.
- Messages/history.
- WhatsApp CTA.

### Endpoint yang Digunakan

| Area / aksi | Endpoint | Status | Catatan |
|---|---|---|---|
| List customers | `GET /api/customers?search=...&sort=...&page=...&limit=...` | Provided | Search dan sort utama sudah ada |
| Customer detail | `GET /api/customers/:id` | Provided | Profile dasar customer |
| Booking history | `GET /api/customers/:id/bookings?page=...&limit=...` | Provided | Histori booking customer |
| Update notes | `PATCH /api/customers/:id/notes` | Provided | Menutup tab notes |

### Yang Belum / Kenapa Belum

- UI `Send Messages` dan multi-select customer belum punya endpoint backend sama sekali.
- `Messages` tab juga belum punya surface read/write tersendiri.
- UI filter booking tab `Appointment` / `Walk-in` belum didukung query server-side, karena endpoint history customer hanya menerima `page` dan `limit`.
- UI general tab menginginkan breakdown statistik tambahan, tetapi `CustomerDetailResponse` masih sebatas list fields + notes + createdAt.
- CTA WhatsApp tidak butuh endpoint khusus, tetapi backend juga tidak memberi deep-link siap pakai; frontend harus membangun sendiri dari `phone`.

### Evidence

- [docs/ways-of-work/plan/cukkr-barbershop-management/customer-management/prd.md](docs/ways-of-work/plan/cukkr-barbershop-management/customer-management/prd.md)
- [src/modules/customer-management/handler.ts](src/modules/customer-management/handler.ts)
- [src/modules/customer-management/model.ts](src/modules/customer-management/model.ts)
- [tests/modules/customer-management.test.ts](tests/modules/customer-management.test.ts)
- [TODO_28042026.md](TODO_28042026.md)

---

## 11. Mobile App — Barbershop Settings

**Modul plan:** `barbershop-settings`, `multi-barbershop`

**Status:** `Partial`

### Tampilan

- Barbershop settings main page.
- Edit name.
- Edit description.
- Edit address.
- Edit book URL.

### Content

- Nama, deskripsi, alamat, slug/book URL.
- Logo/foto barbershop.
- Link ke barber management, open hours, services.

### Endpoint yang Digunakan

| Area / aksi | Endpoint | Status | Catatan |
|---|---|---|---|
| Load settings | `GET /api/barbershop` | Provided | Ambil profile org aktif |
| Update settings | `PATCH /api/barbershop/settings` | Provided | Bisa dipakai untuk edit per-field maupun batch |
| Check slug availability | `GET /api/barbershop/slug-check?slug=...` | Provided | Menutup validasi Book URL |
| List org untuk switch | `GET /api/barbershop/list` | Provided | Relevan untuk multi-barbershop |
| Leave org | `DELETE /api/barbershop/:orgId/leave` | Provided | Relevan untuk member keluar dari branch |

### Yang Belum / Kenapa Belum

- UI membutuhkan logo/foto barbershop, tetapi schema/settings sekarang belum menyimpan media field seperti `logoUrl` dan tidak ada upload endpoint.
- Halaman setting sendiri tertutup dengan baik untuk text fields, tetapi branding/media belum tertutup.

### Evidence

- [docs/ways-of-work/plan/cukkr-barbershop-management/barbershop-settings/prd.md](docs/ways-of-work/plan/cukkr-barbershop-management/barbershop-settings/prd.md)
- [docs/ways-of-work/plan/cukkr-barbershop-management/multi-barbershop/prd.md](docs/ways-of-work/plan/cukkr-barbershop-management/multi-barbershop/prd.md)
- [src/modules/barbershop/handler.ts](src/modules/barbershop/handler.ts)
- [tests/modules/barbershop-settings.test.ts](tests/modules/barbershop-settings.test.ts)
- [tests/modules/multi-barbershop.test.ts](tests/modules/multi-barbershop.test.ts)
- [TODO_28042026.md](TODO_28042026.md)

---

## 12. Mobile App — Open Hours

**Modul plan:** `open-hours`

**Status:** `Provided`

### Tampilan

- Weekly open hours list per hari.
- Toggle buka/tutup.
- Time picker per hari.

### Content

- Hari Senin sampai Minggu.
- Open time dan close time.
- Toggle active/non-active per hari.

### Endpoint yang Digunakan

| Area / aksi | Endpoint | Status | Catatan |
|---|---|---|---|
| Load weekly schedule | `GET /api/open-hours` | Provided | Ambil 1 minggu penuh |
| Save weekly schedule | `PUT /api/open-hours` | Provided | Replace full-week schedule |

### Yang Belum / Kenapa Belum

- UI terlihat seperti edit per hari, tetapi backend hanya menyediakan full-week `PUT`. Ini masih workable, hanya frontend harus kirim seluruh minggu setiap kali ada perubahan satu hari.

### Evidence

- [docs/ways-of-work/plan/cukkr-barbershop-management/open-hours/prd.md](docs/ways-of-work/plan/cukkr-barbershop-management/open-hours/prd.md)
- [src/modules/open-hours/handler.ts](src/modules/open-hours/handler.ts)
- [tests/modules/open-hours.test.ts](tests/modules/open-hours.test.ts)

---

## 13. Mobile App — Notifications

**Modul plan:** `notifications`, `booking`, `barber-management`

**Status:** `Partial`

### Tampilan

- Notification list.
- Inline accept/decline untuk appointment request.
- Walk-in arrival notification.
- Barbershop invitation notification.

### Content

- Notification type.
- Timestamp.
- Reference booking atau invitation.
- CTA accept/decline.

### Endpoint yang Digunakan

| Area / aksi | Endpoint | Status | Catatan |
|---|---|---|---|
| List notifications | `GET /api/notifications` | Provided | Pagination + unread filter tersedia |
| Unread badge | `GET /api/notifications/unread-count` | Provided | Cocok untuk badge UI |
| Mark all as read | `PATCH /api/notifications/read-all` | Provided | Menutup action more options |
| Mark single as read | `PATCH /api/notifications/:id/read` | Provided | Menutup open/read action |
| Register push token | `POST /api/notifications/register-token` | Provided | Dipakai oleh mobile push setup |

### Yang Belum / Kenapa Belum

- UI appointment request butuh `Accept` dan `Decline`, tetapi modul notifications tidak menyediakan contract action tersebut.
- UI barbershop invitation juga butuh `Accept` dan `Decline`; jika memang didelegasikan ke Better Auth organization plugin, repo ini belum menghubungkan CTA notifikasi ke contract yang jelas di modul notifications.
- Notification model hanya menyimpan item inbox; tidak ada surface mutation spesifik untuk `appointment_requested` selain generic mark-read.

### Evidence

- [docs/ways-of-work/plan/cukkr-barbershop-management/notifications/prd.md](docs/ways-of-work/plan/cukkr-barbershop-management/notifications/prd.md)
- [src/modules/notifications/handler.ts](src/modules/notifications/handler.ts)
- [src/modules/notifications/model.ts](src/modules/notifications/model.ts)
- [tests/modules/notifications.test.ts](tests/modules/notifications.test.ts)
- [TODO_28042026.md](TODO_28042026.md)

---

## 14. Mobile App — User Profile

**Modul plan:** `user-profile`, `authentication`

**Status:** `Partial`

### Tampilan

- Profile overview.
- Edit name.
- Edit bio.
- Change password.
- Verify old/new contact.
- Logout confirmation.

### Content

- Avatar.
- Name.
- Bio.
- Email.
- Phone.
- Change password form.
- OTP old/new contact.

### Endpoint yang Digunakan

| Area / aksi | Endpoint | Status | Catatan |
|---|---|---|---|
| Load profile | `GET /api/me` | Provided | Contract utama profile screen |
| Update name/bio | `PATCH /api/me` | Provided | Update basic profile |
| Upload avatar | `POST /api/me/avatar` | Provided | Multipart upload sudah diuji |
| Initiate phone change | `POST /api/me/change-phone` | Provided | Mengirim OTP flow phone change |
| Verify phone change | `POST /api/me/change-phone/verify` | Provided | OTP verify phone change |
| Change password | `POST /auth/api/change-password` | Provided | Better Auth |
| Logout | `POST /auth/api/sign-out` | Provided | Better Auth |
| Change email | `POST /auth/api/change-email` | Partial | Reachable, tetapi parity flow verifikasi belum sama dengan UI |
| Legacy/basic profile update | `PATCH /api/auth/profile` | Provided | Surface tambahan yang overlap dengan `/api/me` |

### Yang Belum / Kenapa Belum

- UI/PRD menginginkan old-contact dan new-contact verification untuk email dan phone, tetapi surface yang terbukti hanya satu flow phone change di `/api/me/change-phone` dan satu Better Auth `change-email` yang bahkan dikonfigurasi `updateEmailWithoutVerification: true`.
- UI OTP profile menggunakan 4 kotak, tetapi `VerifyPhoneInput` di user-profile memakai OTP 6 digit. Jadi parity UI belum penuh.
- PRD user-profile menginginkan `POST /api/me/change-password`, sedangkan implementasi nyata memakai Better Auth `POST /auth/api/change-password`. Secara fungsional ada, tetapi contract path berbeda dari plan.

### Evidence

- [docs/ways-of-work/plan/cukkr-barbershop-management/user-profile/prd.md](docs/ways-of-work/plan/cukkr-barbershop-management/user-profile/prd.md)
- [src/modules/user-profile/handler.ts](src/modules/user-profile/handler.ts)
- [src/modules/user-profile/model.ts](src/modules/user-profile/model.ts)
- [src/lib/auth.ts](src/lib/auth.ts)
- [tests/modules/user-profile.test.ts](tests/modules/user-profile.test.ts)
- [tests/modules/auth.test.ts](tests/modules/auth.test.ts)
- [TODO_28042026.md](TODO_28042026.md)

---

## 15. Web App — Customer Booking (Walk-In & Appointment)

**Modul plan:** `walk-in-pin-system`, `booking`

**Status:** `Partial/Missing`

### 15.1 Landing Page Barbershop

**Status:** `Missing`

#### Tampilan

- Header logo Cukkr + nama barbershop.
- Info barbershop.
- Card Walk-In.
- Card Appointment.

#### Content

- Logo.
- Nama.
- Deskripsi.
- Alamat.

#### Endpoint yang Dibutuhkan

| Area / aksi | Endpoint | Status | Catatan |
|---|---|---|---|
| Load public barbershop detail by slug | `GET /api/public/:slug` | Missing | Tidak ada public landing surface |
| Load active barbers for public page | `GET /api/public/:slug/barbers` | Missing | Tidak ada surface publik |
| Load active services for public page | `GET /api/public/:slug/services` | Missing | Tidak ada surface publik |
| Load open hours for public page | `GET /api/public/:slug/open-hours` atau setara | Missing | Tidak ada surface publik |

#### Yang Belum / Kenapa Belum

- Handler publik yang ter-mount saat ini hanya untuk walk-in PIN validate dan walk-in submit. Belum ada surface untuk merender landing page barbershop publik.

#### Evidence

- [ui-ux-figma.md](ui-ux-figma.md)
- [src/modules/walk-in-pin/handler.ts](src/modules/walk-in-pin/handler.ts)
- [src/app.ts](src/app.ts)
- [TODO_28042026.md](TODO_28042026.md)

### 15.2 Walk-In Flow

**Status:** `Partial`

#### Tampilan

- Verify PIN.
- Customer info.
- Confirmation.

#### Content

- 4 digit PIN.
- Customer name.
- Contact optional.
- Preferred barber optional.
- Service selection.

#### Endpoint yang Digunakan

| Area / aksi | Endpoint | Status | Catatan |
|---|---|---|---|
| Verify PIN | `POST /api/public/:slug/pin/validate` | Provided | Mengembalikan validation token |
| Submit walk-in booking | `POST /api/public/:slug/walk-in` | Provided | Membuat booking walk-in publik |
| Generate PIN dari mobile | `POST /api/pin/generate` | Provided | Dipakai oleh barber/owner |
| Active PIN count | `GET /api/pin/active-count` | Provided | Mendukung screen generate PIN di mobile |

#### Yang Belum / Kenapa Belum

- Form walk-in publik butuh daftar service aktif dan barber aktif untuk di-select, tetapi tidak ada public GET endpoint untuk dua data itu.
- `WalkInBookingBody` mengharuskan `serviceIds` dan menerima `barberId`, jadi frontend publik tidak bisa mengisi form secara benar hanya dengan dua endpoint POST yang ada.

#### Evidence

- [docs/ways-of-work/plan/cukkr-barbershop-management/walk-in-pin-system/prd.md](docs/ways-of-work/plan/cukkr-barbershop-management/walk-in-pin-system/prd.md)
- [src/modules/walk-in-pin/handler.ts](src/modules/walk-in-pin/handler.ts)
- [src/modules/walk-in-pin/model.ts](src/modules/walk-in-pin/model.ts)
- [tests/modules/walk-in-pin.test.ts](tests/modules/walk-in-pin.test.ts)
- [TODO_28042026.md](TODO_28042026.md)

### 15.3 Appointment Flow

**Status:** `Missing`

#### Tampilan

- Customer login/register.
- Customer info.
- Date & time selection.
- Service selection.
- Review & confirm.
- Booking confirmed.

#### Content

- Public customer auth.
- Active services.
- Active barbers.
- Available time slots.
- Notes.
- Booking summary.

#### Endpoint yang Dibutuhkan

| Area / aksi | Endpoint | Status | Catatan |
|---|---|---|---|
| Public barbershop detail | `GET /api/public/:slug` | Missing | Prasyarat flow appointment |
| Public services list | `GET /api/public/:slug/services` | Missing | Belum ada |
| Public barbers list | `GET /api/public/:slug/barbers` | Missing | Belum ada |
| Public slot availability | `GET /api/public/:slug/availability` atau setara | Missing | Belum ada |
| Submit appointment | `POST /api/public/:slug/appointment` | Missing | Belum ada |

#### Yang Belum / Kenapa Belum

- Todo audit internal repo sudah mencatat bahwa public landing page dan public appointment booking belum ada backend surface-nya.
- Module booking yang ada saat ini adalah internal/staff booking (`/api/bookings`), bukan public customer appointment flow.

#### Evidence

- [docs/ways-of-work/plan/cukkr-barbershop-management/booking/prd.md](docs/ways-of-work/plan/cukkr-barbershop-management/booking/prd.md)
- [src/modules/bookings/handler.ts](src/modules/bookings/handler.ts)
- [src/modules/walk-in-pin/handler.ts](src/modules/walk-in-pin/handler.ts)
- [src/app.ts](src/app.ts)
- [TODO_28042026.md](TODO_28042026.md)

---

## Kesimpulan

Secara umum, backend sudah kuat di area internal owner/barber: analytics, service management inti, open hours, booking CRUD internal, barbershop settings text fields, dan customer list/detail dasar. Gap terbesar yang masih menghambat kesesuaian penuh dengan UI/UX ada di tiga area:

1. Public customer booking surface, terutama landing page publik dan appointment booking publik.
2. Request/accept/decline booking flow yang dibutuhkan notifikasi dan state machine `Requested`.
3. Parity profile/auth flow, terutama change-email verification, old/new contact OTP flow, dan konsistensi OTP digit/path contract.

Kalau dokumen ini dipakai sebagai baseline pengerjaan frontend, maka area yang paling aman untuk langsung dihubungkan sekarang adalah: analytics, services CRUD, open hours, barbers list/invite/remove, customer list/detail/notes, internal booking create/list/detail/status, dan profile basic read/update/avatar.