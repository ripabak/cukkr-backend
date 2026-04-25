# Cukkr — UI/UX Flow Documentation

> **Platform Overview**
> - **Mobile App**: Digunakan oleh pemilik barbershop (Owner) dan barber yang diundang.
> - **Web App**: Digunakan oleh customer untuk booking Walk-In atau Appointment via share link.

---

## Daftar Isi

1. [Mobile App — Onboarding](#1-mobile-app--onboarding)
2. [Mobile App — Autentikasi](#2-mobile-app--autentikasi)
3. [Mobile App — Create Barbershop (Wizard)](#3-mobile-app--create-barbershop-wizard)
4. [Mobile App — Home / Schedule](#4-mobile-app--home--schedule)
5. [Mobile App — Booking Detail](#5-mobile-app--booking-detail)
6. [Mobile App — Schedule New Book (by Admin/Barber)](#6-mobile-app--schedule-new-book-by-adminbarber)
7. [Mobile App — Analytics](#7-mobile-app--analytics)
8. [Mobile App — Services Management](#8-mobile-app--services-management)
9. [Mobile App — Barber Management](#9-mobile-app--barber-management)
10. [Mobile App — Customer Management](#10-mobile-app--customer-management)
11. [Mobile App — Barbershop Settings](#11-mobile-app--barbershop-settings)
12. [Mobile App — Open Hours](#12-mobile-app--open-hours)
13. [Mobile App — Notifications](#13-mobile-app--notifications)
14. [Mobile App — User Profile](#14-mobile-app--user-profile)
15. [Web App — Customer Booking (Walk-In & Appointment)](#15-web-app--customer-booking-walk-in--appointment)

---

## Navigasi Global (Mobile)

### Bottom Navigation Bar
Tersedia di semua halaman utama (bukan halaman detail/sub-halaman).

| Icon | Label | Halaman |
|---|---|---|
| 🏠 | Home | Schedule Home |
| 📊 | Analytics | Analytics Dashboard |
| 📅 | Schedule | All Bookings |
| 👤 | Profile | User Profile |

> Ikon yang sedang aktif ditampilkan dengan background chip hijau.

---

## 1. Mobile App — Onboarding

**Trigger:** Pertama kali membuka aplikasi (belum pernah login).

### Screen 1 — Splash
- **Layout:** Full screen, background putih.
- **Konten:** Logo dan nama "Cukkr" di tengah layar.
- **Aksi:** Auto-navigate ke slide pertama setelah beberapa detik.

### Screen 2 — Fitur 1
- **Layout:** Tengah layar, ilustrasi di atas, teks di bawah.
- **Konten:**
  - Ilustrasi: barber memegang tablet dengan checklist
  - Judul: *"Run Your Barbershop with Full Control"*
  - Subjudul: *"Manage bookings, walk-ins, barbers, and services in one system. Everything is structured, nothing gets missed."*
  - Progress dots: ●○○
- **CTA:** Tombol hitam `Next`

### Screen 3 — Fitur 2
- **Layout:** Sama dengan Screen 2.
- **Konten:**
  - Ilustrasi: kalender/jadwal booking
  - Judul: *"Easy Booking with One Link"*
  - Subjudul: *"Share your booking link on social media. Customers book by themselves — no chat, no back-and-forth."*
  - Progress dots: ○●○
- **CTA:** Tombol hitam `Love it`

### Screen 4 — Fitur 3
- **Layout:** Sama dengan Screen 2.
- **Konten:**
  - Ilustrasi: barber dan customer dengan tanda centang hijau
  - Judul: *"Customer Happy, Barber Happy"*
  - Subjudul: *"Smooth bookings for customers, clear schedules for barbers. Everyone knows what to do, every day."*
  - Progress dots: ○○●
- **CTA:** Tombol hijau `Get Started` → navigasi ke halaman Login.

---

## 2. Mobile App — Autentikasi

### 2.1 Login
- **Layout:** Form vertikal dengan header teks, form fields, dan footer link.
- **Konten:**
  - Header: Judul "Login", deskripsi singkat.
  - Field: `Email / Phone Number*`
  - Field: `Password`
  - Link: `Forgot Password` (kanan bawah field password, teks kuning)
- **CTA:** Tombol hijau `Login`
- **Footer:** *"Don't have an account? Sign Up here"* (link kuning)
- **Aksi:**
  - Login sukses → Home (Schedule Home) atau Create Barbershop Wizard (jika baru pertama kali)
  - Forgot Password → Screen Forgot Password

### 2.2 Create Account (Register)
- **Layout:** Form vertikal.
- **Konten:**
  - Header: Judul "Create Account", deskripsi.
  - Field: `Name`
  - Field: `Email / Phone Number*`
  - Field: `Password` (dengan toggle show/hide icon di kanan)
  - Field: `Confirm Password` (dengan toggle show/hide)
- **CTA:** Tombol hitam `Create Account`
- **Footer:** *"Already have an account? Sign in here"* (link kuning)
- **Aksi:** Submit → Screen Verify Account (OTP)

### 2.3 Verify Account (OTP)
- **Layout:** Form OTP.
- **Konten:**
  - Header: Judul "Verify Your Account", deskripsi: OTP dikirim ke email/nomor.
  - 4 kotak input OTP.
  - Timer countdown: `05:00`
- **CTA sekunder:** Tombol outline `Send Again` (aktif setelah timer habis)
- **CTA primer:** Tombol hijau `Verify`

### 2.4 Forgot Password
- **Layout:** Form sederhana.
- **Konten:**
  - Header: Judul "Forgot Password", deskripsi.
  - Field: `Email / Phone Number*`
- **CTA:** Tombol hijau `Continue` → Screen Verify OTP

### 2.5 Verify OTP (Reset Password)
- **Layout:** Sama dengan 2.3.
- **Konten:**
  - Header: Judul "Verify Your OTP", deskripsi.
  - 4 kotak input OTP.
  - Timer countdown: `05:00`
- **CTA sekunder:** Tombol outline `Send Again`
- **CTA primer:** Tombol hijau `Continue` → Screen Create New Password

### 2.6 Create New Password
- **Layout:** Form password baru.
- **Konten:**
  - Header: Judul "Create New Password", subjudul "Enter Your New Password".
  - Field: `Password` (dengan toggle show/hide)
  - Field: `Confirm Password` (dengan toggle show/hide)
  - Link: `Forgot Password`
- **CTA:** Tombol hijau `Continue` → Login Screen

---

## 3. Mobile App — Create Barbershop (Wizard)

**Trigger:** Setelah register dan belum memiliki barbershop.

Progress bar ditampilkan di bagian atas (bertambah di setiap langkah).

### Step 1 — Create Barbershop
- **Judul:** "Create Barbershop", subjudul "Set up your own barbershop"
- **Konten:**
  - Field: `Barbershop Name`
  - Input gambar: `Logo` (choose image)
- **CTA:** Tombol hitam `Create` → Step 2

### Step 2 — Invite Barber
- **Judul:** "Invite Barber", subjudul "Inviting barber to your barbershop"
- **Konten:**
  - Label: `Add Barber`
  - Field: `email / phone number *`
  - Tombol outline: `Invite` → menambahkan ke daftar
- **CTA sekunder:** Tombol hitam `Skip`
- **CTA primer:** Tombol hitam `Next` → Step 3 (jika ada barber ditambahkan)

### Step 3 — Barber's Barbers (List Konfirmasi)
- **Judul:** "Invite Barber"
- **Konten:**
  - Sub-judul: `Barbershop's barbers`
  - List chip barber yang diundang (email/phone dengan tombol X merah untuk hapus)
  - Field: `Add Barber` dengan tombol `Invite`
- **CTA:** Tombol hitam `Next` → Step 4

### Step 4 — Create Your First Service
- **Judul:** "Create Your First Service"
- **Deskripsi:** *"This will be the default service for your barbershop. You can change it anytime."*
- **Konten:**
  - Field: `Name` — Service Name
  - Field: `Description (Optional)` — Service Description (textarea)
  - Field: `Price` — prefiks `Rp`, input angka
  - Field: `Duration` — prefiks `In Minutes`, input angka
- **CTA:** Tombol hijau `Finish` → Step 5

### Step 5 — Congratulation
- **Konten:**
  - Emoji 🎉
  - Teks: "Congratulation"
  - Subjudul: *"Your barbershop, '[Nama Barbershop]', has been created."*
- **CTA:** Tombol hitam `Open My Barbershop →` → Home

---

## 4. Mobile App — Home / Schedule

### 4.1 Schedule Home (Tampilan Default)
- **Header:**
  - Kiri: Date chip dropdown — `Sun, 11 May 25 ▼` (menampilkan kalender picker)
  - Tengah: Ikon kalender
  - Kanan: Tombol `+` (hitam, buat booking baru)
- **Kalender mini (horizontal):** Strip hari — Sun, Mon, Tue, Wed, Thu + arrow kanan untuk geser.
- **Section "Active Booking (n)":**
  - Kanan: Dropdown filter status `All ▼`
  - List item booking:
    - Icon avatar customer (warna berbeda untuk walk-in vs appointment)
    - Waktu relatif (e.g., `12m ago`)
    - Nama customer (berwarna sesuai status: oranye = Waiting, biru = In Progress)
    - Barber yang ditugaskan (ikon bintang + nama)
    - Durasi (e.g., `30 mins`)

### 4.2 Filter Status (Dropdown)
Muncul dari bawah layar (bottom sheet):
- `All`
- `Waiting` (label oranye)
- `In Progress` (label biru)

### 4.3 Calendar Picker
Muncul overlay kalender bulanan:
- Header: `< September 2021 >`
- Grid kalender dengan highlight tanggal hari ini (merah/oranye)
- Pilih tanggal → filter booking di hari tersebut

### 4.4 All Booking View
- Header: `< Kembali`, ikon filter, kalender dropdown
- Filter status tersedia
- Sort options (bottom sheet): `Sort by Recently Added`, `Sort by Oldest First`
- List semua booking di semua tanggal
- Filter status: `All`, `Waiting`, `In Progress`, `Completed`, `Cancelled`

### 4.5 Switch Barbershop
- Accessible dari header Home (tap nama/logo barbershop)
- Menampilkan daftar barbershop yang user ikuti
- Opsi `Switch Session` untuk berpindah barbershop aktif

---

## 5. Mobile App — Booking Detail

Dapat dibuka dari Schedule Home, All Booking, atau Notifikasi.

### 5.1 Layout Umum
- **Header:** `< Kembali`, tombol `•••` (more options)
- **Customer info:**
  - Nama customer (besar, tebal)
  - Tanggal booking (e.g., `Sunday, 11 May 2025`)
  - Ikon WhatsApp (link ke WA customer)
  - Info waktu: `Arrived at 8:15 am (12m ago)` atau `Scheduled at 8:15 am`
  - Ikon durasi: `Duration 30m`
- **Status badge:** (di bawah info waktu)
  - `Waiting` — kuning/oranye
  - `In Progress` — biru
  - `Completed` — hijau
  - `Cancelled` — merah/pink
- **Data rows:**
  - `Book No` — e.g., `#BOOK-12345`
  - `Requested` — nama barber yang diminta customer (ikon bintang)
  - `Handled By` — nama barber yang menangani (hanya muncul jika status > Waiting)
- **Services:**
  - List service: nama (durasi) + harga (e.g., `Hair Cut (20m) — Rp. 40,000`)
- **Notes:** Catatan customer (teks bebas)
- **Payment Summary:**
  - `Services (n)` — total harga
  - `Discount` — nominal diskon (negatif)
  - **Total** (implied)

### 5.2 Status Actions & State Machine

```
Waiting → [Handle this] → Konfirmasi "Start this booking?" → In Progress
Waiting → [Cancel Book] → Cancelled

In Progress → [Complete] → Konfirmasi "Complete Booking?" → Completed
In Progress → [Mark as Waiting] → Waiting

Barber lain → [Take Over] → Konfirmasi "Take Over This Booking?" → In Progress (by barber baru)
```

**Action Buttons berdasarkan status:**

| Status | Tombol Utama | Tombol Sekunder | More Options (`•••`) |
|---|---|---|---|
| Waiting | `Handle this` (hitam, di Payment) | — | `Cancel Book` |
| Waiting (barber berbeda) | `Take Over This Booking` | — | `Cancel Book` |
| In Progress | `Complete` (hijau) | `Mark as Waiting` (chip) | `Cancel Book` |
| Completed | — | — | — |
| Cancelled | — | — | — |

### 5.3 Modal Konfirmasi

**Start this booking?**
- Deskripsi: *"This will mark the booking as In Progress. Please make sure you are ready to serve the customer before continuing."*
- Tombol: `No, Not Yet` | `Yes`

**Take Over This Booking?**
- Ikon ⚠️ kuning
- Deskripsi: *"The customer requested a different barber. Do you want to handle this booking instead?"*
- Tombol: `No, Not Yet` | `Yes`

**Complete Booking?**
- Ikon ✅ hijau
- Deskripsi: *"This action will finalize the booking and cannot be undone. Please make sure the service and details are correct before continuing."*
- Swipe-to-complete gesture (slider "Swipe to complete")
- Preview services + harga di bawah slider

**Cancel Book:**
- Konfirmasi sebelum membatalkan.

---

## 6. Mobile App — Schedule New Book (by Admin/Barber)

Diakses via tombol `+` di header Schedule Home.

### 6.1 Pilih Tipe Booking
Dua opsi di header form:
- **Ikon kalender** = Appointment
- **Ikon orang** = Walk-In

### 6.2 Form Walk-In
- **Judul:** "New Walk-In"
- **Field:**
  - `Customer Name` (text input)
  - `Email / Phone Number (Optional)`
  - `Select Preferred Barber (Optional)` — dengan ikon search/person
  - **Service section:**
    - List service yang dipilih (dengan badge `Default` jika itu default)
    - Nama service + harga
- **CTA:** Tombol hitam `New Walk-In`

### 6.3 Form Appointment
- **Judul:** "New Appointment"
- **Field:**
  - `Customer Name`
  - `Email / Phone Number (Optional)`
  - `Select Preferred Barber (Optional)` — dengan ikon search/person
  - `Select your date and time` — ikon kalender, tap → overlay calendar picker
  - **Service section:** List service terpilih
- **CTA:** Tombol hitam `New Appointment`

### 6.4 Calendar Picker (Overlay)
- Header: `< September 2021 >`
- Grid kalender, highlight hari ini (merah)
- Pilih tanggal → lanjut ke time picker

### 6.5 Time Picker (Overlay)
- Scroll drum picker:
  - Kolom jam (06, 07, 08...)
  - Kolom menit (27, 28, 29...)
  - Kolom AM/PM
- Tombol konfirmasi ✅ (hitam, kanan)

### 6.6 Select Services (Sub-screen)
- **Header:** `< Kembali`, ikon ✅ (konfirmasi pilihan)
- **Search bar:** `Search`
- **List services:** Setiap item dengan:
  - Foto thumbnail service (kiri)
  - Nama service
  - Harga
  - Checkbox di kanan (pilih/hapus)
- Pilih satu atau lebih service → tap ✅ untuk kembali ke form booking

### 6.7 Select Barber (Sub-screen)
- **Header:** `< Kembali`, ikon ✅
- **Search bar:** `Search`
- **List barbers:** Setiap item dengan:
  - Foto avatar barber
  - Nama barber
  - Arrow `>` di kanan
- Pilih satu → kembali ke form booking

---

## 7. Mobile App — Analytics

### 7.1 Layout Utama
- **Filter tabs (horizontal):** `24H` | `Week` | `Month` | `6M` | `1Y`
  - Tab aktif: background putih dengan outline, tampak seperti pill terseleksi.
- **Section "Total Statistics":**
  - 4 cards dalam grid 2x2:
    - `Sales` — e.g., `Rp. 120k`
    - `Books` — e.g., `5`
    - `Appoint.` — e.g., `2`
    - `Walk-In` — e.g., `3`
- **Section "Sales Chart":**
  - Label: `Sales` (hijau, bold) + persentase perubahan (e.g., `15% ▲`) + `this month`
  - Bar chart vertikal (batang hijau) dengan label bulan di X-axis (Jan–Jun)
  - Tap bar → tooltip muncul: `Sales — Rp. 125,000`
- **Section "Bookings Chart":**
  - Label: `Bookings` + persentase + `this month`
  - Bar chart serupa

---

## 8. Mobile App — Services Management

### 8.1 Halaman Utama
- **Header:** `< Kembali`, ikon filter `≡`, tombol `+` (tambah service baru)
- **Judul:** "Services Management"
- **Deskripsi:** *"Organize your services so customers know exactly what you offer and how long it takes."*
- **Search bar:** ikon kaca pembesar di kanan
- **List services:** Setiap item:
  - Foto thumbnail kiri
  - Nama service
  - Harga
  - Badge `Default` (jika default)
  - Toggle aktif/nonaktif (kanan)

### 8.2 Sort / Filter (Bottom Sheet)
- `Sort by Name`
- `Sort by Lowest` (harga)
- `Sort by Highest` (harga)
- `Sort by Recently Added`
- `Sort by Oldest First`

### 8.3 Service Detail
- **Header:** `< Kembali`, tombol `•••` (more options)
- **Foto service** (banner atas)
- **Section "General Information":**
  - `Name` — nama service (tappable untuk edit)
  - `Description` — deskripsi (tappable untuk edit)
- **Section "Pricing & Duration":**
  - `Duration` — e.g., `20 Minutes` / `30 Minutes`
  - `Price` — e.g., `Rp. 40,000`
  - `Discount` — e.g., `20% → Rp. 80,000`
  - `Final Price` — calculated
- **Section "Operational Details":**
  - `Active` — toggle
  - `Default Service` — chip/badge tappable → modal "Set As Default?"
- **More Options (`•••`):** `Delete this Service`

### 8.4 Modal "Set As Default?"
- Ikon ℹ️
- Deskripsi: *"This service will be the default for new bookings and must stay active. To deactivate, set another service as default."*
- Tombol: `No, Not Yet` | `Yes`

### 8.5 Modal "Delete this Service"
- Foto service di atas
- Judul: `Delete this Service`
- Konfirmasi tombol

### 8.6 Edit Field (Sub-screen individual)
Setiap field bisa diedit di screen terpisah dengan judul field dan tombol simpan ✅ di header.

| Sub-screen | Field | Catatan |
|---|---|---|
| Name | Input teks | Label dan helper text |
| Description | Textarea | Helper text tentang visibilitas ke customer |
| Price | Input angka prefiks `Rp` | Tampilkan `Final Price` setelah diskon |
| Discount | Input `%` | Update Final Price real-time |
| Duration | Input angka `In Minutes` | |

### 8.7 New Service Form
- **Header:** `< Kembali`
- **Judul:** "New Service"
- **Preview foto service** di kanan atas (upload)
- **Fields:**
  - `Name` — Service Name
  - `Description (Optional)` — Service Description
  - `Price` — prefiks `Rp`, input angka
  - `Duration` — prefiks `In Minutes`, input angka
  - Toggle `Active`
- **CTA:** Tombol hijau `New Service`

---

## 9. Mobile App — Barber Management

Diakses dari Barbershop Settings.

### 9.1 Halaman Utama
- **Header:** `< Kembali`
- **Judul:** "Barbers Management"
- **Deskripsi:** *"Add, remove barbers in your barbershop"*
- **List barbers:** Setiap item:
  - Foto avatar
  - Nama barber
  - Status badge: `Active` (hijau) atau `Pending` (kuning/oranye)
  - Tombol `×` merah di kanan → konfirmasi hapus
- **Section bawah:**
  - Label: `Invite Barber`
  - Tombol hitam: `Invite Barber`

### 9.2 Invite Barber (Sub-screen)
- **Header:** `< Kembali`, judul "Invite Barber", tombol kirim ✈ (hitam, kanan)
- **Field:** `email / phone number *`
- **Deskripsi:** *"Enter the email address or phone number of the barber you want to invite. They will receive an invitation to join your barbershop on the app."*

### 9.3 Modal "Remove User From Barber?"
- Ikon avatar merah
- Judul merah: `Remove User From Barber?`
- Deskripsi: *"Are you sure you want to remove this user from the barber? This action cannot be undone."*
- Tombol: `No, Cancel` | `Yes`

---

## 10. Mobile App — Customer Management

### 10.1 Halaman Utama
- **Header:** `< Kembali`, ikon filter `≡`, tombol `Select` (mode multi-select)
- **Judul:** "Customer Management"
- **Deskripsi:** *"Manage all your customers in one place. Only Customer with valid contact information will be here."*
- **Search bar:** ikon kaca pembesar
- **List customers:** Setiap item:
  - Foto avatar (atau inisial)
  - Nama customer
  - Total book (angka)
  - Total value (e.g., `Rp 100,000`)

### 10.2 Sort / Filter (Bottom Sheet)
- `Sort by Name`
- `Sort by Total Book`
- `Sort by Book Value`
- `Sort by Recently Added`
- `Sort by Oldest First`

### 10.3 Search Mode
- Header berubah menampilkan search bar aktif + tombol `Cancel`
- List filter real-time

### 10.4 Select Mode (Multi-select)
- Checkbox muncul di setiap item
- Footer: `Select Customers (n)` + tombol kirim ✈
- Pilih customer → tombol `Send Messages` aktif

### 10.5 Send Messages
- **Header:** `< Kembali`, judul `Send Messages (n)`, tombol kirim ✈ (kuning/aktif)
- **Textarea:** input pesan
- **Deskripsi:** *"Send messages or announcements to your customers. Stay in touch about promotions, new services, or important updates from your barbershop."*
- **Opsi pengiriman:** Toggle/info: "It will send the message through registered email or mobile phone."
- Pesan yang dikirim muncul sebagai chat bubble (kanan, hijau)

### 10.6 Customer Detail
Tab navigation: `General` | `Booking` | `Notes` | `Messages`

**Tab General:**
- Foto avatar besar
- Nama customer (besar)
- Sub-info: ID/nomor, verifikasi centang
- Stats cards:
  - `Book Value` — total spending
  - `Books` — total booking count
  - Stats tambahan (rating bintang, dll.)
- Stats breakdown: Appointments, Walk-ins

**Tab Booking:**
- Filter chip: `All` | `Appointment` | `Walk-in`
- List booking history:
  - Setiap item: tanggal, jam, nama customer (link), harga, barber, status badge

**Tab Notes:**
- Textarea untuk catatan tentang customer

**Tab Messages:**
- Riwayat pesan yang dikirim ke customer

### 10.7 Dari Customer Detail
- Ikon WhatsApp di header → buka WhatsApp
- Tombol `Send Message` → Send Messages screen

---

## 11. Mobile App — Barbershop Settings

Diakses dari tab Profile atau ikon gear di Home.

### 11.1 Halaman Utama (Barbershop Settings)
- **Header:** Judul "Barbershop Settings"
- **Foto/logo barbershop** (dapat diedit)
- **Nama barbershop** (dapat diedit)
- **Sections:**
  - `Barbershop Information` (Name, Description, Address, Book URL) — tappable baris
  - `Barbers` — navigasi ke Barber Management
  - `Open Hours` — navigasi ke Open Hours
  - `Services` — navigasi ke Services Management

### 11.2 Edit Name (Sub-screen)
- **Header:** `< Kembali`, judul "Name", tombol ✅ simpan (kanan, hitam)
- **Field:** `Barbershop Name`
- **Helper text:** *"Enter your barbershop name as you want it to appear to customers. This name will be shown on the booking page, notifications, and reports."*

### 11.3 Edit Description (Sub-screen)
- **Header:** `< Kembali`, judul "Description", tombol ✅
- **Field:** `Barbershop Description` (textarea dengan scroll indicator)
- **Helper text:** *"Write a short description about your barbershop. This helps customers understand your style and services before booking."*

### 11.4 Edit Address (Sub-screen)
- **Header:** `< Kembali`, judul "Address", tombol ✅
- **Field:** `Barbershop Address`
- **Helper text:** *"Enter the full address of your barbershop. This helps customers find your location easily."*

### 11.5 Edit Book URL (Sub-screen)
- **Header:** `< Kembali`, judul "Book Url", tombol ✅
- **Layout:** Input prefiks `https://cukkr.com/` + input slug (e.g., `hendra-barbershop`)
- **Helper text:** *"This is your public booking link that customers use to make appointments. Use only letters, numbers, and hyphens."*
- **Validasi:** `Spaces are not allowed` (merah)
- **Modal "Url Not Available":** Ikon ⚠️ kuning, pesan bahwa URL sudah dipakai, tombol `Oke`

---

## 12. Mobile App — Open Hours

### 12.1 Halaman Utama
- **Header:** `< Kembali`
- **Judul:** "Open Hours"
- **Deskripsi:** *"Set the opening hours for each day. Customers can only book within these times."*
- **List hari:**

| Toggle | Hari | Jam Buka | — | Jam Tutup |
|---|---|---|---|---|
| ● | Monday | 09:00 AM | — | 09:00 AM |
| ● | Tuesday | 09:00 AM | — | 09:00 AM |
| ● | Wednesday | 09:00 AM | — | 09:00 AM |
| ● | Thursday | 09:00 AM | — | 09:00 AM |
| ● | Friday | 09:00 AM | — | 09:00 AM |
| ● | Saturday | 09:00 AM | — | 09:00 AM |
| ○ | Sunday | 09:00 AM | — | 09:00 AM |

- Toggle hijau = hari buka, toggle gelap = hari tutup.
- Tap pada jam → Time Picker overlay

### 12.2 Time Picker (Overlay)
- Drum scroll picker:
  - Kolom jam (06, 07, 08...)
  - Kolom menit (27, 28, 29...)
  - Kolom AM/PM
- Tombol ✅ hitam di kanan untuk konfirmasi

---

## 13. Mobile App — Notifications

### 13.1 Daftar Notifikasi
- **Header:** `< Kembali`, tombol `•••` (more options, e.g., Mark all as read)
- **List notifikasi** (chronological, terbaru di atas):

**Tipe 1 — Appointment Requested:**
- Kategori: `Appointment Requested` + timestamp (e.g., `50s ago`)
- Nama customer
- Info: `Scheduled at [tanggal] [jam]`
- Durasi
- Tombol: `Decline` (outline merah) | `Accept` (outline hijau)
- Badge status jika sudah direspons: `Declined` (pink)

**Tipe 2 — Walk-in Arrival:**
- Kategori: `Walk-in Arrival` + timestamp
- Nama customer
- Info: `Arrived at [tanggal] [jam]`
- Durasi
- (Tanpa tombol Accept/Decline — walk-in langsung masuk queue)

**Tipe 3 — Barbershop Invitation:**
- Kategori: `Barbershop Invitation` + timestamp
- Nama yang mengundang
- Info: `Invite you to [Nama Barbershop]`
- Tombol: `Decline` | `Accept`

### 13.2 Booking Detail dari Notifikasi
Status `Requested`:
- Layout sama dengan Booking Detail (Section 5)
- Status badge: `Requested`
- Tombol bawah: `Decline` | `Accept`

Status `Declined`:
- Status badge merah: `Declined`
- Tidak ada tombol aksi

Status `Waiting` (setelah Accept):
- Normal Booking Detail dengan `Handle this` button + opsi `Cancel Book`

---

## 14. Mobile App — User Profile

### 14.1 Halaman Utama
- **Header:** `< Kembali`
- **Judul:** "User Profile"
- **Avatar** (foto profil, tappable untuk ganti)
- **Section "General Information":**
  - `Your Name` — e.g., `Pepe Julian` (tappable → edit name)
  - `Bio` — e.g., `Fade Specialist` (tappable → edit bio)
- **Section "Account":**
  - `Email` — e.g., `julianpepe@gmail.com`
  - `Phone Number` — e.g., `+62838383833`
  - `Change Password` — arrow `>` (tappable)
- **Section "Logout":**
  - Baris `Logout` dengan ikon → ikon
  
### 14.2 Modal "Confirm Log out?"
- Ikon logout
- Judul: `Confirm Log out?`
- Deskripsi: *"Are you sure you want to log out from this account?"*
- Tombol: `No, Not Yet` | `Yes`

### 14.3 Edit Your Name (Sub-screen)
- **Header:** `< Kembali`, judul "Your Name", tombol ✅
- **Field:** `Your Name`
- **Helper:** *"Enter your name, it will be shown in detail of barber & list of barber in barbershop booking website"*

### 14.4 Edit Bio (Sub-screen)
- **Header:** `< Kembali`, judul "Bio", tombol ✅
- **Field:** `Bio` (textarea)
- **Helper:** *"Enter your bio, it will be shown in detail of barber & list of barber in barbershop booking website"*

### 14.5 Change Password (Sub-screen)
- **Header:** `< Kembali`, judul "Change Password"
- **Deskripsi:** *"Enter your current and new password"*
- **Field:** `Current Password` (dengan toggle show/hide)
- **Field:** `New Password` (dengan toggle show/hide)
- **Link:** `Forgot Password`
- **CTA:** Tombol hijau `Change Password` → Verify Old Contact

### 14.6 Verify Old Contact (OTP)
- **Judul:** "Verify Old Contact"
- **Deskripsi:** *"OTP sent to your old email/phone number"* (menampilkan email/phone yang dimasking)
- 4 kotak OTP + timer + `Send Again`
- **CTA:** Tombol hijau `Continue` → Verify New Contact

### 14.7 Verify New Contact (OTP)
- **Judul:** "Verify New Contact"
- **Deskripsi:** *"OTP sent to your new email/phone number"*
- 4 kotak OTP + timer + `Send Again`
- **CTA:** Tombol hijau `Verify` → kembali ke Profile

### 14.8 Notifikasi "Email / phone number changed"
- Modal atau screen konfirmasi: *"Your contact has been changed."*
- Tombol: `Oke` → kembali ke Profile

---

## 15. Web App — Customer Booking (Walk-In & Appointment)

> **Akses:** Via URL publik barbershop — `https://cukkr.com/[barbershop-slug]`
> **Desain:** Lebih sederhana dari mobile, fokus pada kecepatan booking.

### 15.1 Landing Page Barbershop
- **Header:** Logo Cukkr + nama barbershop
- **Info barbershop:** Foto/logo, nama, deskripsi, alamat
- **Dua pilihan booking:**
  - Card `Walk-In` — *"Saya sudah di sini, daftarkan saya"*
  - Card `Appointment` — *"Saya ingin booking jadwal"*

---

### 15.2 Alur Walk-In

**Step 1 — Verifikasi PIN**
- **Layout:** Card centered
- **Judul:** "Walk-In Verification"
- **Deskripsi:** *"Masukkan PIN yang diberikan oleh barber untuk memverifikasi kehadiran Anda."*
- **Field:** PIN input (numeric, dari barber)
- **CTA:** Tombol `Verify PIN`
- **Catatan:** PIN diatur oleh barber/owner dari sisi mobile app.

**Step 2 — Customer Info**
- **Field:** `Customer Name`
- **Field:** `Email / Phone Number (Optional)`
- **Select:** `Preferred Barber (Optional)` — dropdown daftar barber aktif
- **Service:** Default service otomatis dipilih (dengan opsi ganti)
- **CTA:** Tombol `Submit Walk-In`

**Step 3 — Konfirmasi**
- Ringkasan booking
- *"Anda telah masuk antrean. Mohon tunggu dipanggil oleh barber."*
- Estimasi waktu tunggu (jika tersedia)

---

### 15.3 Alur Appointment

**Step 1 — Login / Register (jika belum autentikasi)**
- Pilihan: `Login` | `Register`
- Form Login: email/phone + password
- Form Register: nama, email/phone, password, konfirmasi password
- Setelah auth → lanjut ke Step 2

**Step 2 — Customer Info**
- **Field:** `Customer Name` (pre-filled dari profil jika login)
- **Field:** `Email / Phone Number` (pre-filled)
- **Select:** `Preferred Barber (Optional)`

**Step 3 — Pilih Tanggal & Waktu**
- Kalender picker (bulan/minggu)
- Setelah pilih tanggal → pilih slot waktu yang tersedia
- Slot ditampilkan berdasarkan open hours barbershop

**Step 4 — Pilih Service**
- List service aktif dari barbershop
- Multi-select diperbolehkan
- Tampil harga dan durasi setiap service

**Step 5 — Review & Konfirmasi**
- Ringkasan:
  - Nama customer
  - Tanggal & waktu
  - Barber (jika dipilih)
  - Services + harga
  - Total harga
  - Catatan (optional textarea)
- **CTA:** `Confirm Appointment`

**Step 6 — Booking Confirmed**
- Nomor booking (e.g., `#BOOK-12345`)
- Detail ringkasan
- Opsi: `Add to Calendar` | `Bagikan ke WhatsApp`

---

## Ringkasan Tipe Pengguna & Akses

| Pengguna | Platform | Akses |
|---|---|---|
| **Owner** | Mobile | Semua fitur: Settings, Barber Mgmt, Analytics, Schedule, Services, Customers |
| **Barber (invited)** | Mobile | Schedule (lihat & handle booking milik sendiri), Notifikasi, Profile |
| **Customer (Walk-In)** | Web | Booking walk-in via PIN verification |
| **Customer (Appointment)** | Web | Booking appointment via login/register |

---

## Status Booking — State Machine

```
                   ┌─────────────────────┐
                   │   Booking Created   │
                   └──────────┬──────────┘
                              │
                    ┌─────────▼──────────┐
                    │      Requested     │ ← Appointment dari customer
                    └────┬──────────┬────┘
                 Accept  │          │  Decline
                         │          │
              ┌──────────▼──┐   ┌───▼──────────┐
              │   Waiting   │   │   Declined   │
              │ (Walk-In or │   └──────────────┘
              │  Accepted)  │
              └──────┬──────┘
                     │ Handle this
              ┌──────▼──────┐
              │ In Progress │◄──── Mark as Waiting (kembali)
              └──────┬──────┘
                     │ Complete
              ┌──────▼──────┐
              │  Completed  │
              └─────────────┘
              
  (Dari Waiting atau In Progress dapat pindah ke Cancelled)
```

---

## Komponen UI Reusable

| Komponen | Deskripsi |
|---|---|
| **Status Badge** | Pill kecil berwarna: Waiting (oranye), In Progress (biru), Completed (hijau), Cancelled (merah), Pending (kuning), Active (hijau), Declined (pink) |
| **Confirmation Modal** | Judul, deskripsi, tombol `No, Not Yet` + `Yes` — digunakan untuk semua aksi destruktif/irreversible |
| **OTP Input** | 4 kotak besar, auto-focus ke kotak berikutnya, timer countdown + `Send Again` |
| **Time Picker (Drum)** | Scroll drum: jam + menit + AM/PM, tombol ✅ kanan |
| **Calendar Picker** | Grid bulanan, highlight hari ini, navigasi `< >` |
| **Bottom Sheet Sort** | Daftar opsi sort, muncul dari bawah layar |
| **Swipe-to-Complete** | Slider horizontal dengan teks, swipe kanan untuk aksi |
| **Toggle Switch** | Hitam = aktif, abu = nonaktif; hijau = aktif (hari buka) |
| **Service Card** | Thumbnail + nama + harga + badge Default + toggle active |
| **Barber Card** | Avatar + nama + status badge + tombol × |
