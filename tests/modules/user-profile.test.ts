import { describe, expect, it } from 'bun:test'
import { treaty } from '@elysiajs/eden'

import { app } from '../../src/app'

const tClient = treaty(app)
const ORIGIN = 'http://localhost:3001'

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
	const bytes = new Uint8Array(Math.max(size, 4))
	bytes.set([0xff, 0xd8, 0xff, 0xdb])

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
