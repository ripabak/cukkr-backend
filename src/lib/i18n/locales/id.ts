export const id = {
	email: {
		otp: {
			subject: 'Kode verifikasi {purpose}',
			text: 'Kode verifikasi kamu adalah {otp}. Kode ini akan kedaluwarsa dalam beberapa saat.'
		},
		invitation: {
			subject: '{inviterName} ngajak kamu gabung ke {organizationName}',
			title: 'Kamu Diundang',
			heading: 'Gabung ke {organizationName}',
			body: '<strong>{inviterName}</strong> ngajak kamu buat gabung di <strong>{organizationName}</strong>. Terima undangan ini buat mulai.',
			cta: 'Terima Undangan',
			linkHint: 'Atau salin tautan ini ke browser kamu:',
			footer: 'Undangan ini dikirim ke <strong>{to}</strong>. Kalau kamu nggak nyangka, abaikan aja email ini.<br/>&copy; {year} Cukkr. Hak cipta dilindungi undang-undang.',
			text: 'Kamu diundang gabung ke {organizationName}\n\n{inviterName} ngajak kamu buat gabung di {organizationName}.\n\nTerima undangan: {inviteUrl}\n\nKalau kamu nggak nyangka, abaikan aja email ini.'
		},
		appointmentVerification: {
			subject: 'Konfirmasi janjimu di {barbershopName}',
			title: 'Konfirmasi Janji',
			heading: 'Halo, {customerName}',
			body: 'Tolong konfirmasi janji kamu di <strong>{barbershopName}</strong> dengan klik tombol di bawah. Booking kamu bakal diproses setelah konfirmasi.',
			cta: 'Konfirmasi Janji',
			linkHint: 'Atau salin tautan ini ke browser kamu:',
			footer: 'Kalau kamu nggak buat janji ini, abaikan aja email ini.<br/>&copy; {year} Cukkr. Hak cipta dilindungi undang-undang.',
			text: 'Konfirmasi Janji\n\nHalo {customerName},\n\nTolong konfirmasi janji kamu di {barbershopName} dengan buka tautan di bawah. Booking kamu bakal diproses setelah konfirmasi.\n\n{verifyUrl}\n\nKalau kamu nggak buat janji ini, abaikan aja email ini.'
		},
		identityVerification: {
			subject: 'Verifikasi identitas kamu di {barbershopName}',
			title: 'Verifikasi Identitas',
			heading: 'Ini kamu, {customerName}?',
			body: 'Tolong konfirmasi identitas kamu buat <strong>{barbershopName}</strong> dengan klik tombol di bawah. Ini bantu kami menghubungkan riwayat booking ke akun kamu.',
			cta: 'Verifikasi Identitas Saya',
			linkHint: 'Atau salin tautan ini ke browser kamu:',
			footer: 'Kalau ini bukan kamu, abaikan aja email ini.<br/>&copy; {year} Cukkr. Hak cipta dilindungi undang-undang.',
			text: 'Verifikasi Identitas\n\nIni kamu, {customerName}?\n\nTolong konfirmasi identitas kamu buat {barbershopName} dengan buka tautan di bawah. Ini bantu kami menghubungkan riwayat booking ke akun kamu.\n\n{verifyUrl}\n\nKalau ini bukan kamu, abaikan aja email ini.'
		},
		bookingAccepted: {
			subject: 'Janji kamu di {barbershopName} udah diterima',
			title: 'Booking Diterima',
			heading: 'Halo, {customerName}',
			body: 'Kabar baik! Janji kamu di <strong>{barbershopName}</strong> udah <strong>diterima</strong>.',
			referenceLabel: 'Nomor Referensi',
			servicesLabel: 'Layanan',
			serviceLabel: 'Layanan',
			priceLabel: 'Harga',
			durationLabel: 'Durasi',
			totalDurationLabel: 'Total Durasi',
			minuteUnit: 'menit',
			barberLabel: 'Barber',
			scheduleLabel: 'Jadwal',
			bodyExtra:
				'Harap datang tepat waktu buat janji kamu. Kalau ada perubahan, hubungi barbershop langsung ya.',
			footer: 'Email ini dikirim ke <strong>{to}</strong>.<br/>&copy; {year} Cukkr. Hak cipta dilindungi undang-undang.',
			text: 'Booking Diterima\n\nHalo {customerName},\n\nKabar baik! Janji kamu di {barbershopName} udah diterima.\n\nNomor Referensi: {referenceNumber}\n\nHarap datang tepat waktu buat janji kamu. Kalau ada perubahan, hubungi barbershop langsung ya.'
		},
		bookingDeclined: {
			subject: 'Janji kamu di {barbershopName} ditolak',
			title: 'Booking Ditolak',
			heading: 'Halo, {customerName}',
			body: 'Maaf, janji kamu di <strong>{barbershopName}</strong> <strong>ditolak</strong>.',
			referenceLabel: 'Nomor Referensi',
			servicesLabel: 'Layanan',
			serviceLabel: 'Layanan',
			priceLabel: 'Harga',
			durationLabel: 'Durasi',
			totalDurationLabel: 'Total Durasi',
			minuteUnit: 'menit',
			barberLabel: 'Barber',
			scheduleLabel: 'Jadwal',
			reasonLabel: 'Alasan',
			bodyExtra:
				'Kamu bisa booking lagi di waktu lain. Kunjungi halaman booking buat coba lagi.',
			footer: 'Email ini dikirim ke <strong>{to}</strong>.<br/>&copy; {year} Cukkr. Hak cipta dilindungi undang-undang.',
			text: 'Booking Ditolak\n\nHalo {customerName},\n\nMaaf, janji kamu di {barbershopName} ditolak.\n\nNomor Referensi: {referenceNumber}{reasonText}\n\nKamu bisa booking lagi di waktu lain.'
		},
		bookingExpired: {
			subject: 'Janji kamu di {barbershopName} kedaluwarsa',
			title: 'Booking Kedaluwarsa',
			heading: 'Halo, {customerName}',
			body: 'Janji kamu di <strong>{barbershopName}</strong> udah <strong>kedaluwarsa</strong> karena nggak dikonfirmasi tepat waktu.',
			referenceLabel: 'Nomor Referensi',
			bodyExtra:
				'Kalau kamu masih butuh janji, silakan booking lagi. Kunjungi halaman booking buat coba lagi.',
			footer: 'Email ini dikirim ke <strong>{to}</strong>.<br/>&copy; {year} Cukkr. Hak cipta dilindungi undang-undang.',
			text: 'Booking Kedaluwarsa\n\nHalo {customerName},\n\nJanji kamu di {barbershopName} udah kedaluwarsa karena nggak dikonfirmasi tepat waktu.\n\nNomor Referensi: {referenceNumber}\n\nKalau kamu masih butuh janji, silakan booking lagi.'
		}
	},
	notification: {
		appointmentRequested: {
			title: '{organizationName}',
			body: '{customerName} minta booking nih. Cek yuk!'
		},
		walkInArrival: {
			title: '{organizationName}',
			body: '{customerName} udah datang (walk-in). Siap-siap ya.'
		},
		barbershopInvitation: {
			title: 'Undangan {organizationName}',
			body: '{inviterName} ngajakin kamu gabung ke {organizationName}'
		}
	}
}
