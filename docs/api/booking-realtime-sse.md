# Booking Realtime — Server-Sent Events (SSE)

Dokumen ini menjelaskan cara mengintegrasikan real-time booking updates di frontend menggunakan SSE endpoint yang tersedia di backend.

---

## Endpoint

```
GET /api/bookings/events
```

**Auth:** Required (session cookie)  
**Org:** Required (`active-organization-id` header)

Koneksi dibuka satu kali, server akan push event setiap kali ada perubahan data booking di organisasi yang aktif. Browser secara native akan auto-reconnect jika koneksi terputus.

---

## Format Event

Server mengirim dua jenis data:

| `event.data`       | Keterangan                                         |
|--------------------|----------------------------------------------------|
| `booking_updated`  | Ada perubahan data booking — trigger refetch       |
| `ping`             | Heartbeat tiap 30 detik, tidak perlu ditangani     |

---

## Kapan Event Dikirim

Event `booking_updated` dikirim ke semua client dalam organisasi yang sama setiap kali terjadi salah satu dari mutasi berikut:

- `POST /api/bookings` — booking baru dibuat (walk-in / appointment)
- `PATCH /api/bookings/:id/status` — status booking diubah
- `POST /api/bookings/:id/accept` — appointment diterima
- `POST /api/bookings/:id/decline` — appointment ditolak
- `PATCH /api/bookings/:id/reassign` — barber diganti
- Appointment request dari halaman publik pelanggan

---

## Implementasi Frontend

### 1. Custom Hook

Buat hook ini sekali, pakai di semua page yang butuh real-time:

```ts
// hooks/useBookingRealtimeSync.ts
import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'

export function useBookingRealtimeSync() {
  const queryClient = useQueryClient()

  useEffect(() => {
    const es = new EventSource('/api/bookings/events', {
      withCredentials: true
    })

    es.onmessage = (e) => {
      if (e.data === 'booking_updated') {
        queryClient.invalidateQueries({ queryKey: ['bookings'] })
      }
    }

    es.onerror = () => {
      // EventSource auto-reconnect setelah beberapa detik — tidak perlu handle manual
    }

    return () => es.close()
  }, [queryClient])
}
```

### 2. Pakai di Page

Cukup panggil hook satu kali di level page (bukan per komponen):

```ts
// pages/SchedulePage.tsx
function SchedulePage() {
  useBookingRealtimeSync() // ← satu baris ini sudah cukup

  const { data } = useQuery({
    queryKey: ['bookings', date, filters],
    queryFn: () => fetchBookings(date, filters),
  })

  return <BookingList data={data} />
}
```

---

## Query Key Convention

Supaya `invalidateQueries` bisa menghapus semua variant booking sekaligus, pastikan semua query booking dimulai dengan key `'bookings'`:

```ts
// ✅ Benar — akan ke-invalidate saat ada SSE event
useQuery({ queryKey: ['bookings', date], ... })
useQuery({ queryKey: ['bookings', date, { barberId }], ... })
useQuery({ queryKey: ['bookings', 'summary', date], ... })
useQuery({ queryKey: ['bookings', 'requests'], ... })

// ❌ Salah — tidak akan ke-invalidate
useQuery({ queryKey: ['schedule', date], ... })
useQuery({ queryKey: ['booking-list', date], ... })
```

Jika ada query yang belum pakai prefix `'bookings'`, ganti dulu sebelum pakai SSE.

---

## Behaviour & Edge Cases

### Auto-reconnect
`EventSource` browser akan otomatis reconnect jika koneksi terputus (network hiccup, server restart). Tidak perlu implementasi retry manual.

### Tab tidak aktif
Koneksi SSE tetap hidup meski tab di-background. Jika ingin menghemat resource, tambahkan visibility check:

```ts
useEffect(() => {
  let es: EventSource | null = null

  const connect = () => {
    es = new EventSource('/api/bookings/events', { withCredentials: true })
    es.onmessage = (e) => {
      if (e.data === 'booking_updated') {
        queryClient.invalidateQueries({ queryKey: ['bookings'] })
      }
    }
  }

  const handleVisibility = () => {
    if (document.visibilityState === 'visible') {
      connect()
      // Invalidate langsung saat tab kembali aktif untuk catch up missed updates
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
    } else {
      es?.close()
    }
  }

  connect()
  document.addEventListener('visibilitychange', handleVisibility)

  return () => {
    es?.close()
    document.removeEventListener('visibilitychange', handleVisibility)
  }
}, [queryClient])
```

### Multiple pages
Jika lebih dari satu page aktif pada waktu bersamaan (misal tab berbeda dalam org yang sama), masing-masing page punya koneksi SSE sendiri. Ini normal — server handle tiap koneksi secara independen.

### Organisasi berbeda
SSE di-scope per `active-organization-id`. Jika user switch org, hook akan dismount dan remount otomatis karena komponen page berganti, sehingga koneksi SSE lama ditutup dan yang baru dibuka dengan org yang benar.

---

## Testing Manual

Buka dua tab browser dengan akun yang sama di halaman schedule. Update status booking di tab pertama — tab kedua harus update otomatis tanpa refresh.

Untuk memverifikasi koneksi SSE aktif, buka DevTools → Network → filter `EventStream`:

```
Request URL: /api/bookings/events
Request Method: GET
Status: 200
Content-Type: text/event-stream
```

Kolom "EventStream" di DevTools akan menampilkan setiap event yang diterima secara real-time.
