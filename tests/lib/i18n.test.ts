import { describe, expect, it } from 'bun:test'
import { t, type Language } from '../../src/lib/i18n'

describe('i18n', () => {
	it('should return Indonesian string for key email.otp.subject', () => {
		const result = t('id', 'email.otp.subject', { purpose: 'Login' })
		expect(result).toBe('Kode verifikasi Login')
	})

	it('should return English string for key email.otp.subject', () => {
		const result = t('en', 'email.otp.subject', { purpose: 'Login' })
		expect(result).toBe('Login verification code')
	})

	it('should return key as-is when key not found in any locale', () => {
		const result = t('id', 'some.nonexistent.key')
		expect(result).toBe('some.nonexistent.key')
	})

	it('should interpolate multiple params', () => {
		const result = t('id', 'notification.appointmentRequested.body', {
			customerName: 'Budi'
		})
		expect(result).toBe('Budi minta booking nih. Cek yuk!')
	})

	it('should handle unknown language by falling back to id', () => {
		const result = t('unknown' as Language, 'email.otp.subject', {
			purpose: 'Test'
		})
		expect(result).toBe('Kode verifikasi Test')
	})

	it('should return Indonesian invitation email subject', () => {
		const result = t('id', 'email.invitation.subject', {
			inviterName: 'Andi',
			organizationName: 'Barbershop Mantap'
		})
		expect(result).toBe('Andi ngajak kamu gabung ke Barbershop Mantap')
	})

	it('should return English booking accepted text', () => {
		const result = t('en', 'email.bookingAccepted.text', {
			customerName: 'Budi',
			barbershopName: 'Cool Barbershop',
			referenceNumber: 'BK-001'
		})
		expect(result).toContain('Hi Budi')
		expect(result).toContain('Cool Barbershop')
		expect(result).toContain('BK-001')
	})
})
