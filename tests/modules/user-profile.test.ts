import { describe, expect, it } from 'bun:test'
import { treaty } from '@elysiajs/eden'

import { app } from '../../src/app'

const tClient = treaty(app)
const ORIGIN = 'http://localhost:3001'

const testJpegBuffer = new Uint8Array([
	0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01,
	0x01, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00, 0xff, 0xdb, 0x00, 0x43,
	0x00, 0x08, 0x06, 0x06, 0x07, 0x06, 0x05, 0x08, 0x07, 0x07, 0x07, 0x09,
	0x09, 0x08, 0x0a, 0x0c, 0x14, 0x0d, 0x0c, 0x0b, 0x0b, 0x0c, 0x19, 0x12,
	0x13, 0x0f, 0x14, 0x1d, 0x1a, 0x1f, 0x1e, 0x1d, 0x1a, 0x1c, 0x1c, 0x20,
	0x24, 0x2e, 0x27, 0x20, 0x22, 0x2c, 0x23, 0x1c, 0x1c, 0x28, 0x37, 0x29,
	0x2c, 0x30, 0x31, 0x34, 0x34, 0x34, 0x1f, 0x27, 0x39, 0x3d, 0x38, 0x32,
	0x3c, 0x2e, 0x33, 0x34, 0x32, 0xff, 0xc0, 0x00, 0x0b, 0x08, 0x00, 0x01,
	0x00, 0x01, 0x01, 0x01, 0x11, 0x00, 0xff, 0xc4, 0x00, 0x1f, 0x00, 0x00,
	0x01, 0x05, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00,
	0x00, 0x00, 0x00, 0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08,
	0x09, 0x0a, 0x0b, 0xff, 0xc4, 0x00, 0xb5, 0x10, 0x00, 0x02, 0x01, 0x03,
	0x03, 0x02, 0x04, 0x03, 0x05, 0x05, 0x04, 0x04, 0x00, 0x00, 0x01, 0x7d,
	0x01, 0x02, 0x03, 0x00, 0x04, 0x11, 0x05, 0x12, 0x21, 0x31, 0x41, 0x06,
	0x13, 0x51, 0x61, 0x07, 0x22, 0x71, 0x14, 0x32, 0x81, 0x91, 0xa1, 0x08,
	0x23, 0x42, 0xb1, 0xc1, 0x15, 0x52, 0xd1, 0xf0, 0x24, 0x33, 0x62, 0x72,
	0x82, 0x09, 0x0a, 0x16, 0x17, 0x18, 0x19, 0x1a, 0x25, 0x26, 0x27, 0x28,
	0x29, 0x2a, 0x34, 0x35, 0x36, 0x37, 0x38, 0x39, 0x3a, 0x43, 0x44, 0x45,
	0x46, 0x47, 0x48, 0x49, 0x4a, 0x53, 0x54, 0x55, 0x56, 0x57, 0x58, 0x59,
	0x5a, 0x63, 0x64, 0x65, 0x66, 0x67, 0x68, 0x69, 0x6a, 0x73, 0x74, 0x75,
	0x76, 0x77, 0x78, 0x79, 0x7a, 0x83, 0x84, 0x85, 0x86, 0x87, 0x88, 0x89,
	0x8a, 0x92, 0x93, 0x94, 0x95, 0x96, 0x97, 0x98, 0x99, 0x9a, 0xa2, 0xa3,
	0xa4, 0xa5, 0xa6, 0xa7, 0xa8, 0xa9, 0xaa, 0xb2, 0xb3, 0xb4, 0xb5, 0xb6,
	0xb7, 0xb8, 0xb9, 0xba, 0xc2, 0xc3, 0xc4, 0xc5, 0xc6, 0xc7, 0xc8, 0xc9,
	0xca, 0xd2, 0xd3, 0xd4, 0xd5, 0xd6, 0xd7, 0xd8, 0xd9, 0xda, 0xe1, 0xe2,
	0xe3, 0xe4, 0xe5, 0xe6, 0xe7, 0xe8, 0xe9, 0xea, 0xf1, 0xf2, 0xf3, 0xf4,
	0xf5, 0xf6, 0xf7, 0xf8, 0xf9, 0xfa, 0xff, 0xda, 0x00, 0x08, 0x01, 0x01,
	0x00, 0x00, 0x3f, 0x00, 0xd2, 0xff, 0xd9
])

function uniqueEmail() {
	return `user_profile_${Date.now()}_${Math.random().toString(36).slice(2)}@example.com`
}

function uniqueSlug(prefix: string) {
	return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

async function createAuthenticatedUser(
	name = 'Profile User',
	password = 'password123'
): Promise<{ cookie: string; email: string }> {
	const email = uniqueEmail()
	const signUpRes = await (tClient as any).auth.api['sign-up'].email.post(
		{
			email,
			password,
			name
		},
		{ fetch: { headers: { origin: ORIGIN } } }
	)
	const cookie = signUpRes.response?.headers.get('set-cookie') ?? ''

	const orgRes = await (tClient as any).auth.api.organization.create.post(
		{
			name: `${name} Org`,
			slug: uniqueSlug('user-profile')
		},
		{ fetch: { headers: { cookie, origin: ORIGIN } } }
	)

	const setActiveRes = await (tClient as any).auth.api.organization[
		'set-active'
	].post(
		{ organizationId: orgRes.data?.id },
		{ fetch: { headers: { cookie, origin: ORIGIN } } }
	)

	return {
		cookie: setActiveRes.response?.headers.get('set-cookie') ?? cookie,
		email
	}
}

function createJpegFile(size = 256): File {
	const bytes = new Uint8Array(Math.max(size, testJpegBuffer.length))
	bytes.set(testJpegBuffer)

	return new File([bytes], 'avatar.jpg', { type: 'image/jpeg' })
}

async function uploadAvatar(cookie: string, file: File) {
	const form = new FormData()
	form.set('file', file)

	return app.handle(
		new Request('http://localhost/api/me/avatar', {
			method: 'POST',
			headers: { cookie },
			body: form
		})
	)
}

describe('User Profile Module Tests', () => {
	describe('Sprint 1 — Profile View & Edit', () => {
		it('T-01: GET /api/me authenticated returns the full profile', async () => {
			const auth = await createAuthenticatedUser()
			const res = await tClient.api.me.get({
				fetch: { headers: { cookie: auth.cookie } }
			})

			expect(res.status).toBe(200)
			expect(res.data?.data).toMatchObject({
				name: 'Profile User',
				bio: null,
				avatarUrl: null,
				role: 'owner'
			})
			expect(res.data?.data.email).toContain('@example.com')
			expect(res.data?.data.id).toBeTruthy()
		})

		it('T-02: GET /api/me unauthenticated returns 401', async () => {
			const res = await tClient.api.me.get()
			expect(res.status).toBe(401)
		})

		it('T-03: PATCH /api/me updates the name', async () => {
			const auth = await createAuthenticatedUser()
			const res = await tClient.api.me.patch(
				{ name: 'Updated Profile Name' },
				{ fetch: { headers: { cookie: auth.cookie } } }
			)

			expect(res.status).toBe(200)
			expect(res.data?.data.name).toBe('Updated Profile Name')
		})

		it('T-04: PATCH /api/me updates the bio', async () => {
			const auth = await createAuthenticatedUser()
			const res = await tClient.api.me.patch(
				{ bio: 'Senior barber with a fade specialty.' },
				{ fetch: { headers: { cookie: auth.cookie } } }
			)

			expect(res.status).toBe(200)
			expect(res.data?.data.bio).toBe(
				'Senior barber with a fade specialty.'
			)
		})

		it('T-05: PATCH /api/me rejects an empty name', async () => {
			const auth = await createAuthenticatedUser()
			const res = await tClient.api.me.patch(
				{ name: '' },
				{ fetch: { headers: { cookie: auth.cookie } } }
			)

			expect(res.status).toBe(422)
		})

		it('T-06: PATCH /api/me rejects a name longer than 100 characters', async () => {
			const auth = await createAuthenticatedUser()
			const res = await tClient.api.me.patch(
				{ name: 'n'.repeat(101) },
				{ fetch: { headers: { cookie: auth.cookie } } }
			)

			expect(res.status).toBe(422)
		})

		it('T-07: PATCH /api/me rejects a bio longer than 300 characters', async () => {
			const auth = await createAuthenticatedUser()
			const res = await tClient.api.me.patch(
				{ bio: 'b'.repeat(301) },
				{ fetch: { headers: { cookie: auth.cookie } } }
			)

			expect(res.status).toBe(422)
		})
	})

	describe('Sprint 2 — Avatar, Phone OTP & Auth', () => {
		it('T-08: POST /api/me/avatar uploads a valid avatar', async () => {
			const auth = await createAuthenticatedUser('Avatar User')
			const response = await uploadAvatar(auth.cookie, createJpegFile())
			const body = (await response.json()) as {
				data: { avatarUrl: string }
			}

			expect(response.status).toBe(200)
			expect(body.data.avatarUrl).toContain('/mock-storage/avatars/')

			const profileRes = await tClient.api.me.get({
				fetch: { headers: { cookie: auth.cookie } }
			})
			expect(profileRes.data?.data.avatarUrl).toBe(body.data.avatarUrl)
		})

		it('T-09: POST /api/me/avatar rejects an invalid MIME type', async () => {
			const auth = await createAuthenticatedUser('Invalid Avatar User')
			const invalidFile = new File(['not-an-image'], 'avatar.txt', {
				type: 'text/plain'
			})
			const response = await uploadAvatar(auth.cookie, invalidFile)

			expect(response.status).toBe(422)
		})

		it('T-10: POST /api/me/avatar rejects files larger than 5 MB', async () => {
			const auth = await createAuthenticatedUser('Large Avatar User')
			const response = await uploadAvatar(
				auth.cookie,
				createJpegFile(5 * 1024 * 1024 + 1)
			)

			expect(response.status).toBe(422)
		})

		it('T-11: POST /auth/api/change-password accepts the correct password', async () => {
			const auth = await createAuthenticatedUser('Password User')
			const res = await (tClient as any).auth.api['change-password'].post(
				{
					currentPassword: 'password123',
					newPassword: 'newpassword123'
				},
				{ fetch: { headers: { cookie: auth.cookie } } }
			)

			expect([200, 204]).toContain(res.status)
		})

		it('T-12: POST /auth/api/change-password rejects a wrong current password', async () => {
			const auth = await createAuthenticatedUser('Wrong Password User')
			const res = await (tClient as any).auth.api['change-password'].post(
				{
					currentPassword: 'wrong-password',
					newPassword: 'newpassword123'
				},
				{ fetch: { headers: { cookie: auth.cookie } } }
			)

			expect([400, 401]).toContain(res.status)
		})

		it('T-13: POST /auth/api/sign-out clears the session', async () => {
			const auth = await createAuthenticatedUser('Logout User')
			const signOutRes = await (tClient as any).auth.api['sign-out'].post(
				{},
				{ fetch: { headers: { cookie: auth.cookie } } }
			)

			expect([200, 204]).toContain(signOutRes.status)

			const profileRes = await tClient.api.me.get({
				fetch: { headers: { cookie: auth.cookie } }
			})
			expect(profileRes.status).toBe(401)
		})

		it('verifies Better Auth change-email is reachable with the configured flow', async () => {
			const auth = await createAuthenticatedUser('Email User')
			const res = await (tClient as any).auth.api['change-email'].post(
				{
					newEmail: uniqueEmail(),
					callbackURL: 'http://localhost:3001/settings'
				},
				{ fetch: { headers: { cookie: auth.cookie, origin: ORIGIN } } }
			)

			expect([200, 204]).toContain(res.status)
		})
	})
})
