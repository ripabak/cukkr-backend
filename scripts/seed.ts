#!/usr/bin/env bun
/**
 * Cukkr Seed Script
 *
 * Membuat data demo lengkap: 2 barbershop, services, barbers (bot),
 * open hours, customers, dan bookings (histori + hari ini + ke depan).
 *
 * Usage:
 *   bun scripts/seed.ts --email EMAIL --password PASSWORD [--days 7]
 *
 * Options:
 *   --email     Email dari akun aktif Anda (owner barbershop)
 *   --password  Password dari akun aktif Anda
 *   --days      Jumlah hari booking ke depan (default: 7)
 *
 * Catatan:
 *   - Server tidak perlu berjalan. Script ini mengakses database langsung.
 *   - Jika server berjalan, password akan diverifikasi via API.
 *   - Setiap run membuat barbershop baru dengan slug unik (tidak tabrakan).
 *   - Bot barbers dibuat langsung di DB tanpa proses undangan.
 */

import { db } from '../src/lib/database'
import { nanoid, customAlphabet } from 'nanoid'
import { eq } from 'drizzle-orm'
import {
	user,
	organization,
	member,
	barbershopSettings,
	service,
	openHour,
	booking,
	bookingService,
	bookingDailyCounter,
	customer
} from '../drizzle/schemas'

// ─── Konstanta ────────────────────────────────────────────────────────────────

const CHECKSUM_ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const randomChecksum = customAlphabet(CHECKSUM_ALPHABET, 2)
const WIB_OFFSET_MS = 7 * 60 * 60 * 1000

// ─── Data Barbershop ──────────────────────────────────────────────────────────

const BARBERSHOP_TEMPLATES = [
	{
		name: 'Barber Brothers',
		slugBase: 'barber-brothers',
		description:
			'Premium barbershop untuk pria modern. Nyaman, bersih, dan hasil rapi.',
		address: 'Jl. Sudirman No. 12, Karet Tengsin, Jakarta Pusat',
		services: [
			{
				name: 'Potong Rambut',
				price: 35000,
				duration: 30,
				discount: 0,
				isDefault: true
			},
			{
				name: 'Cukur Jenggot',
				price: 20000,
				duration: 20,
				discount: 0,
				isDefault: false
			},
			{
				name: 'Cuci Rambut',
				price: 15000,
				duration: 15,
				discount: 0,
				isDefault: false
			},
			{
				name: 'Cat Rambut',
				price: 80000,
				duration: 90,
				discount: 10,
				isDefault: false
			}
		],
		barberNames: ['Andi Santoso', 'Budi Setiawan'],
		openHours: [
			{ dayOfWeek: 0, isOpen: false }, // Minggu tutup
			{
				dayOfWeek: 1,
				isOpen: true,
				openTime: '09:00',
				closeTime: '20:00'
			},
			{
				dayOfWeek: 2,
				isOpen: true,
				openTime: '09:00',
				closeTime: '20:00'
			},
			{
				dayOfWeek: 3,
				isOpen: true,
				openTime: '09:00',
				closeTime: '20:00'
			},
			{
				dayOfWeek: 4,
				isOpen: true,
				openTime: '09:00',
				closeTime: '20:00'
			},
			{
				dayOfWeek: 5,
				isOpen: true,
				openTime: '09:00',
				closeTime: '20:00'
			},
			{
				dayOfWeek: 6,
				isOpen: true,
				openTime: '09:00',
				closeTime: '17:00'
			} // Sabtu jam pendek
		]
	},
	{
		name: "The Gentleman's Cut",
		slugBase: 'the-gentlemans-cut',
		description:
			'Gaya klasik untuk pria berselera tinggi. Berpengalaman sejak 2018.',
		address: 'Jl. MH Thamrin No. 45, Gondangdia, Jakarta Pusat',
		services: [
			{
				name: 'Regular Cut',
				price: 40000,
				duration: 30,
				discount: 0,
				isDefault: true
			},
			{
				name: 'Fade & Taper',
				price: 50000,
				duration: 45,
				discount: 0,
				isDefault: false
			},
			{
				name: 'Classic Shave',
				price: 25000,
				duration: 20,
				discount: 0,
				isDefault: false
			},
			{
				name: 'Beard Styling',
				price: 30000,
				duration: 25,
				discount: 15,
				isDefault: false
			}
		],
		barberNames: ['Deni Pratama', 'Eko Wahyudi'],
		openHours: [
			{
				dayOfWeek: 0,
				isOpen: true,
				openTime: '10:00',
				closeTime: '20:00'
			}, // Minggu buka
			{
				dayOfWeek: 1,
				isOpen: true,
				openTime: '10:00',
				closeTime: '21:00'
			},
			{
				dayOfWeek: 2,
				isOpen: true,
				openTime: '10:00',
				closeTime: '21:00'
			},
			{
				dayOfWeek: 3,
				isOpen: true,
				openTime: '10:00',
				closeTime: '21:00'
			},
			{
				dayOfWeek: 4,
				isOpen: true,
				openTime: '10:00',
				closeTime: '21:00'
			},
			{
				dayOfWeek: 5,
				isOpen: true,
				openTime: '10:00',
				closeTime: '21:00'
			},
			{
				dayOfWeek: 6,
				isOpen: true,
				openTime: '10:00',
				closeTime: '21:00'
			}
		]
	}
]

// ─── Fake Customers ───────────────────────────────────────────────────────────

const FAKE_CUSTOMERS = [
	{ name: 'Ahmad Fauzi', phone: '081234567890' },
	{ name: 'Rizky Pratama', phone: '082345678901' },
	{ name: 'Hendra Kurniawan', phone: '083456789012' },
	{ name: 'Dimas Ariyanto', phone: '084567890123' },
	{ name: 'Fajar Nugroho', phone: '085678901234' },
	{ name: 'Galih Setiawan', phone: '086789012345' },
	{ name: 'Ivan Susanto', phone: '087890123456' },
	{ name: 'Joko Santoso', phone: '088901234567' },
	{ name: 'Kevin Halim', phone: '089012345678' },
	{ name: 'Leo Wirawan', phone: '081123456789' }
]

// ─── Helper Functions ─────────────────────────────────────────────────────────

// Konversi UTC ke WIB (UTC+7)
function toWibDate(date: Date): Date {
	return new Date(date.getTime() + WIB_OFFSET_MS)
}

// Format tanggal WIB sebagai YYYYMMDD untuk referensi booking
function getWibDateKey(date: Date): string {
	const d = toWibDate(date)
	const y = d.getUTCFullYear()
	const m = String(d.getUTCMonth() + 1).padStart(2, '0')
	const day = String(d.getUTCDate()).padStart(2, '0')
	return `${y}${m}${day}`
}

function addDays(date: Date, days: number): Date {
	const result = new Date(date)
	result.setUTCDate(result.getUTCDate() + days)
	return result
}

function pick<T>(arr: T[]): T {
	return arr[Math.floor(Math.random() * arr.length)]
}

function rand(min: number, max: number): number {
	return Math.floor(Math.random() * (max - min + 1)) + min
}

// Buat timestamp dari tanggal (UTC midnight) + jam WIB → disimpan sebagai UTC
function makeTimestamp(
	utcMidnight: Date,
	wibHour: number,
	wibMinute = 0
): Date {
	const ts = new Date(utcMidnight)
	// WIB ke UTC: kurang 7 jam
	ts.setUTCHours(wibHour - 7, wibMinute, 0, 0)
	return ts
}

// ─── Verifikasi User ──────────────────────────────────────────────────────────

async function resolveUser(
	email: string,
	password: string,
	authUrl: string
): Promise<string> {
	// Coba verifikasi via HTTP jika server berjalan
	try {
		const res = await fetch(`${authUrl}/auth/api/sign-in/email`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Origin: authUrl
			},
			body: JSON.stringify({ email, password }),
			signal: AbortSignal.timeout(3000)
		})

		if (res.ok) {
			const data = (await res.json()) as { user?: { id: string } }
			if (data?.user?.id) {
				console.log('  ✅ Login berhasil via server')
				return data.user.id
			}
		} else {
			const err = (await res.json().catch(() => ({}))) as {
				message?: string
			}
			console.warn(`  ⚠️  Login gagal: ${err?.message || res.status}`)
			console.warn('      Pastikan email dan password benar.')
			process.exit(1)
		}
	} catch {
		console.warn(
			`  ⚠️  Server tidak bisa dihubungi (${authUrl}). Mencari user di database...`
		)
	}

	// Fallback: cari user di DB berdasarkan email
	const found = await db.query.user.findFirst({
		where: eq(user.email, email)
	})
	if (!found) {
		console.error(
			`  ❌ User dengan email "${email}" tidak ditemukan di database.`
		)
		process.exit(1)
	}

	console.log(`  ✅ User ditemukan di DB: ${found.name}`)
	console.warn('  ⚠️  Password tidak diverifikasi (server tidak berjalan)')
	return found.id
}

// ─── Seed Barbershop ──────────────────────────────────────────────────────────

async function seedBarbershop(
	template: (typeof BARBERSHOP_TEMPLATES)[0],
	ownerId: string,
	daysAhead: number,
	runSuffix: string
) {
	const slug = `${template.slugBase}-${runSuffix}`
	const now = new Date()

	console.log(`\n  📍 ${template.name} (slug: ${slug})`)

	// 1. Organization
	const [org] = await db
		.insert(organization)
		.values({
			id: nanoid(),
			name: template.name,
			slug,
			createdAt: now
		})
		.returning()

	// 2. Owner membership
	await db.insert(member).values({
		id: nanoid(),
		organizationId: org.id,
		userId: ownerId,
		role: 'owner',
		createdAt: now
	})

	// 3. Barbershop settings
	await db.insert(barbershopSettings).values({
		id: nanoid(),
		organizationId: org.id,
		description: template.description,
		address: template.address,
		onboardingCompleted: true,
		createdAt: now,
		updatedAt: now
	})

	// 4. Services
	const createdServices = await db
		.insert(service)
		.values(
			template.services.map((svc) => ({
				id: nanoid(),
				organizationId: org.id,
				name: svc.name,
				price: svc.price,
				duration: svc.duration,
				discount: svc.discount,
				isActive: true,
				isDefault: svc.isDefault,
				createdAt: now,
				updatedAt: now
			}))
		)
		.returning()

	console.log(`     ✂️  ${createdServices.length} layanan dibuat`)

	// 5. Bot barbers (langsung insert ke DB, tanpa undangan)
	const barberMemberIds: string[] = []

	for (const barberName of template.barberNames) {
		const emailKey = barberName.toLowerCase().replace(/\s+/g, '.')
		const botEmail = `seed.${emailKey}.${runSuffix}@cukkr-seed.dev`

		// Cek apakah bot sudah ada (idempotent)
		let botUser = await db.query.user.findFirst({
			where: eq(user.email, botEmail)
		})

		if (!botUser) {
			;[botUser] = await db
				.insert(user)
				.values({
					id: nanoid(),
					name: barberName,
					email: botEmail,
					emailVerified: true, // Langsung aktif tanpa verifikasi email
					createdAt: now,
					updatedAt: now
				})
				.returning()
		}

		const [barberMember] = await db
			.insert(member)
			.values({
				id: nanoid(),
				organizationId: org.id,
				userId: botUser.id,
				role: 'member',
				createdAt: now
			})
			.returning()

		barberMemberIds.push(barberMember.id)
	}

	console.log(`     💈 ${barberMemberIds.length} barber ditambahkan`)

	// 6. Open hours
	await db.insert(openHour).values(
		template.openHours.map((oh) => ({
			id: nanoid(),
			organizationId: org.id,
			dayOfWeek: oh.dayOfWeek,
			isOpen: oh.isOpen,
			openTime: oh.isOpen ? (oh.openTime ?? null) : null,
			closeTime: oh.isOpen ? (oh.closeTime ?? null) : null,
			createdAt: now,
			updatedAt: now
		}))
	)

	console.log('     🕐 Jam buka diatur')

	// 7. Customers
	const createdCustomers = await db
		.insert(customer)
		.values(
			FAKE_CUSTOMERS.map((c) => ({
				id: nanoid(),
				organizationId: org.id,
				name: c.name,
				phone: `+62${c.phone.slice(1)}`, // Normalisasi ke format +62
				isVerified: true,
				createdAt: now,
				updatedAt: now
			}))
		)
		.returning()

	console.log(`     👥 ${createdCustomers.length} customer dibuat`)

	// 8. Bookings
	const bookingCount = await seedBookings({
		orgId: org.id,
		createdById: ownerId,
		services: createdServices,
		barberMemberIds,
		customers: createdCustomers,
		daysAhead
	})

	console.log(
		`     📅 ${bookingCount} booking dibuat (histori + hari ini + ke depan)`
	)

	return org
}

// ─── Seed Bookings ────────────────────────────────────────────────────────────

async function seedBookings({
	orgId,
	createdById,
	services,
	barberMemberIds,
	customers,
	daysAhead
}: {
	orgId: string
	createdById: string
	services: Array<{
		id: string
		name: string
		price: number
		duration: number
		discount: number
	}>
	barberMemberIds: string[]
	customers: Array<{ id: string }>
	daysAhead: number
}) {
	// Urutan sequence per tanggal untuk referensi booking
	const sequenceByDate: Record<string, number> = {}

	function nextSequence(ts: Date): { refNum: string } {
		const dateKey = getWibDateKey(ts)
		sequenceByDate[dateKey] = (sequenceByDate[dateKey] ?? 0) + 1
		const seq = sequenceByDate[dateKey]
		const refNum = `BK-${dateKey}-${String(seq).padStart(3, '0')}-${randomChecksum()}`
		return { refNum }
	}

	function calcPrice(svc: { price: number; discount: number }) {
		return Math.max(0, Math.round(svc.price * ((100 - svc.discount) / 100)))
	}

	const bookingsToInsert: any[] = []
	const bookingServicesToInsert: any[] = []

	// Helper: tambah satu booking ke antrian insert
	function addBooking(params: {
		type: 'walk_in' | 'appointment'
		status: string
		ts: Date
		scheduledAt: Date | null
		barberId: string
		handledByBarberId: string | null
		startedAt: Date | null
		completedAt: Date | null
		cancelledAt: Date | null
		svcs: typeof services
	}) {
		const { refNum } = nextSequence(params.ts)
		const bookingId = nanoid()

		bookingsToInsert.push({
			id: bookingId,
			organizationId: orgId,
			referenceNumber: refNum,
			type: params.type,
			status: params.status,
			customerId: pick(customers).id,
			barberId: params.barberId,
			handledByBarberId: params.handledByBarberId,
			scheduledAt: params.scheduledAt,
			createdById,
			startedAt: params.startedAt,
			completedAt: params.completedAt,
			cancelledAt: params.cancelledAt,
			createdAt: params.ts,
			updatedAt: params.ts
		})

		for (const svc of params.svcs) {
			bookingServicesToInsert.push({
				id: nanoid(),
				bookingId,
				serviceId: svc.id,
				serviceName: svc.name,
				price: calcPrice(svc),
				originalPrice: svc.price,
				discount: svc.discount,
				duration: svc.duration
			})
		}
	}

	const todayUTC = new Date()
	todayUTC.setUTCHours(0, 0, 0, 0)

	// ── Histori 7 hari ke belakang ─────────────────────────────────────────────
	// Mix walk-in (completed/cancelled) dan appointment (completed/cancelled)
	const PAST_HOURS_WIB = [10, 11, 13, 14, 16, 17, 19]

	for (let d = -7; d <= -1; d++) {
		const date = addDays(todayUTC, d)
		const numBookings = rand(3, 5)

		for (let i = 0; i < numBookings; i++) {
			const wibHour = PAST_HOURS_WIB[i % PAST_HOURS_WIB.length]
			const ts = makeTimestamp(date, wibHour)
			const isWalkIn = Math.random() > 0.4
			const barber = pick(barberMemberIds)
			const svcs = [pick(services)]

			const roll = Math.random()
			const isCompleted = roll > 0.2

			const status = isCompleted ? 'completed' : 'cancelled'
			const startedAt = isCompleted ? ts : null
			const completedAt = isCompleted
				? new Date(ts.getTime() + svcs[0].duration * 60 * 1000)
				: null
			const cancelledAt = !isCompleted
				? new Date(ts.getTime() + 15 * 60 * 1000)
				: null

			addBooking({
				type: isWalkIn ? 'walk_in' : 'appointment',
				status,
				ts,
				scheduledAt: isWalkIn ? null : ts,
				barberId: barber,
				handledByBarberId: isCompleted ? barber : null,
				startedAt,
				completedAt,
				cancelledAt,
				svcs
			})
		}
	}

	// ── Hari ini ───────────────────────────────────────────────────────────────
	// Campuran: ada yang selesai pagi, sedang berjalan, menunggu, dan upcoming
	const todayBookingDefs = [
		{
			wibHour: 9,
			wibMin: 30,
			type: 'walk_in' as const,
			status: 'completed',
			handled: true
		},
		{
			wibHour: 10,
			wibMin: 30,
			type: 'appointment' as const,
			status: 'completed',
			handled: true
		},
		{
			wibHour: 12,
			wibMin: 0,
			type: 'walk_in' as const,
			status: 'in_progress',
			handled: true
		},
		{
			wibHour: 13,
			wibMin: 30,
			type: 'walk_in' as const,
			status: 'waiting',
			handled: false
		},
		{
			wibHour: 15,
			wibMin: 0,
			type: 'appointment' as const,
			status: 'waiting',
			handled: false
		},
		{
			wibHour: 17,
			wibMin: 0,
			type: 'appointment' as const,
			status: 'requested',
			handled: false
		}
	]

	for (const def of todayBookingDefs) {
		const ts = makeTimestamp(todayUTC, def.wibHour, def.wibMin)
		const barber = pick(barberMemberIds)
		const svc = pick(services)

		const startedAt =
			def.status === 'in_progress' || def.status === 'completed'
				? new Date(ts.getTime() - 5 * 60 * 1000)
				: null
		const completedAt =
			def.status === 'completed'
				? new Date(ts.getTime() + svc.duration * 60 * 1000)
				: null

		addBooking({
			type: def.type,
			status: def.status,
			ts,
			scheduledAt: def.type === 'appointment' ? ts : null,
			barberId: barber,
			handledByBarberId: def.handled ? barber : null,
			startedAt,
			completedAt,
			cancelledAt: null,
			svcs: [svc]
		})
	}

	// ── Hari ke depan (appointments) ──────────────────────────────────────────
	const FUTURE_HOURS_WIB = [10, 11, 14, 16]

	for (let d = 1; d <= daysAhead; d++) {
		const date = addDays(todayUTC, d)
		const numBookings = rand(2, 3)

		for (let i = 0; i < numBookings; i++) {
			const wibHour = FUTURE_HOURS_WIB[i % FUTURE_HOURS_WIB.length]
			const ts = makeTimestamp(date, wibHour)
			const barber = pick(barberMemberIds)
			const svc = pick(services)

			// Tanggal booking dibuat beberapa hari yang lalu
			const createdOffset = rand(0, 3)
			const createdAt = addDays(todayUTC, -createdOffset)

			addBooking({
				type: 'appointment',
				status: Math.random() > 0.4 ? 'requested' : 'waiting',
				ts: createdAt,
				scheduledAt: ts,
				barberId: barber,
				handledByBarberId: null,
				startedAt: null,
				completedAt: null,
				cancelledAt: null,
				svcs: [svc]
			})
		}
	}

	// Batch insert ke database
	if (bookingsToInsert.length > 0) {
		await db.insert(booking).values(bookingsToInsert)
	}
	if (bookingServicesToInsert.length > 0) {
		await db.insert(bookingService).values(bookingServicesToInsert)
	}

	// Update booking daily counter (diperlukan untuk generate referensi baru)
	for (const [dateKey, lastSeq] of Object.entries(sequenceByDate)) {
		await db
			.insert(bookingDailyCounter)
			.values({
				organizationId: orgId,
				bookingDate: dateKey,
				lastSequence: lastSeq,
				updatedAt: new Date()
			})
			.onConflictDoUpdate({
				target: [
					bookingDailyCounter.organizationId,
					bookingDailyCounter.bookingDate
				],
				set: { lastSequence: lastSeq, updatedAt: new Date() }
			})
	}

	return bookingsToInsert.length
}

// ─── CLI Argument Parsing ─────────────────────────────────────────────────────

function parseArgs(): { email: string; password: string; days: number } {
	const args = process.argv.slice(2)
	let email = ''
	let password = ''
	let days = 7

	for (let i = 0; i < args.length; i++) {
		if (args[i] === '--email' && args[i + 1]) email = args[++i]
		else if (args[i] === '--password' && args[i + 1]) password = args[++i]
		else if (args[i] === '--days' && args[i + 1]) days = parseInt(args[++i])
	}

	if (!email || !password) {
		console.error('')
		console.error('Usage:')
		console.error(
			'  bun scripts/seed.ts --email EMAIL --password PASSWORD [--days 7]'
		)
		console.error('')
		console.error('Contoh:')
		console.error(
			'  bun scripts/seed.ts --email saya@email.com --password password123'
		)
		console.error(
			'  bun scripts/seed.ts --email saya@email.com --password password123 --days 14'
		)
		process.exit(1)
	}

	return { email, password, days }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
	console.log('')
	console.log('🚀 Cukkr Seed Script')
	console.log('══════════════════════════════════════')

	const { email, password, days } = parseArgs()
	const authUrl = process.env.BETTER_AUTH_URL ?? 'http://localhost:3000'

	console.log(`\n📧 Email    : ${email}`)
	console.log(`📅 Days     : ${days} hari ke depan`)
	console.log(`🌐 Auth URL : ${authUrl}`)
	console.log('\n🔐 Verifikasi user...')

	const userId = await resolveUser(email, password, authUrl)

	// Suffix unik per run agar slug tidak tabrakan jika dijalankan beberapa kali
	const runSuffix = Date.now().toString(36).slice(-6)

	console.log('\n🏪 Membuat barbershops...')

	const createdOrgs = []
	for (const template of BARBERSHOP_TEMPLATES) {
		const org = await seedBarbershop(template, userId, days, runSuffix)
		createdOrgs.push(org)
	}

	console.log('\n══════════════════════════════════════')
	console.log('✨ Seeding selesai!\n')
	console.log('📊 Ringkasan:')
	console.log(`   • ${createdOrgs.length} barbershop dibuat`)

	for (const org of createdOrgs) {
		console.log(`     - ${org.name} (slug: ${org.slug})`)
	}

	console.log('   • Masing-masing punya:')
	console.log('     - 4 layanan (services)')
	console.log('     - 2 barber (bot user, langsung aktif)')
	console.log('     - Jam buka per hari')
	console.log('     - 10 customer')
	console.log(
		`     - Booking: 7 hari histori + hari ini + ${days} hari ke depan`
	)
	console.log('')
	console.log(
		'💡 Tips: Aktifkan barbershop di aplikasi lewat menu "Switch Organization"'
	)
	console.log('')
}

main().catch((err) => {
	console.error('\n❌ Fatal error:', err.message ?? err)
	process.exit(1)
})
