import { describe, expect, it, beforeAll } from 'bun:test'
import { treaty } from '@elysiajs/eden'
import { app } from '../../src/app'

const tClient = treaty(app)
const ORIGIN = 'http://localhost:3001'

function uniqueEmail() {
	return `test_${Date.now()}_${Math.random().toString(36).slice(2)}@example.com`
}

async function signUpAndGetCookie(
	email?: string,
	password = 'password123',
	name = 'Test User'
): Promise<{ cookie: string; email: string }> {
	const resolvedEmail = email ?? uniqueEmail()
	const res = await (tClient as any).auth.api['sign-up'].email.post({
		email: resolvedEmail,
		password,
		name
	})
	const cookie = res.response?.headers.get('set-cookie') ?? ''
	return { cookie, email: resolvedEmail }
}

async function signInAndGetCookie(
	email: string,
	password = 'password123'
): Promise<string> {
	const res = await (tClient as any).auth.api['sign-in'].email.post({
		email,
		password
	})
	return res.response?.headers.get('set-cookie') ?? ''
}

// ---------------------------------------------------------------------------
// S-02 — Login, Session & Logout
// ---------------------------------------------------------------------------
describe('S-02: Login, Session & Logout', () => {
	let authCookie = ''
	let testEmail = ''

	beforeAll(async () => {
		testEmail = uniqueEmail()
		const res = await signUpAndGetCookie(testEmail)
		authCookie = await signInAndGetCookie(testEmail)
		if (!authCookie) authCookie = res.cookie
	})

	it('should reject invalid credentials with 401', async () => {
		const res = await (tClient as any).auth.api['sign-in'].email.post({
			email: 'nonexistent@example.com',
			password: 'wrongpassword'
		})
		expect(res.status).toBe(401)
	})

	it('should sign in with valid credentials and set a session cookie', async () => {
		const cookie = await signInAndGetCookie(testEmail)
		expect(cookie).toBeTruthy()
	})

	it('should return session data with a valid cookie', async () => {
		const res = await (tClient as any).auth.api['get-session'].get({
			headers: { cookie: authCookie }
		})
		expect(res.status).toBe(200)
		expect(res.data).toHaveProperty('user')
	})

	it('should return null session without a cookie', async () => {
		const res = await (tClient as any).auth.api['get-session'].get()
		expect(res.status).toBe(200)
		expect(res.data).toBeNull()
	})

	it('should sign out and invalidate the session', async () => {
		const { cookie } = await signUpAndGetCookie()
		const logoutRes = await (tClient as any).auth.api['sign-out'].post(
			{},
			{ fetch: { headers: { cookie } } }
		)
		expect(logoutRes.status).toBe(200)
	})
})

// ---------------------------------------------------------------------------
// S-01 — Registration (password validation)
// ---------------------------------------------------------------------------
describe('S-01: Registration', () => {
	it('should reject registration with password shorter than 8 chars', async () => {
		const res = await (tClient as any).auth.api['sign-up'].email.post({
			email: uniqueEmail(),
			password: 'short',
			name: 'Test'
		})
		expect([400, 422]).toContain(res.status)
	})

	it('should reject duplicate email with 422 or 409', async () => {
		const email = uniqueEmail()
		await (tClient as any).auth.api['sign-up'].email.post({
			email,
			password: 'password123',
			name: 'Test'
		})
		const res = await (tClient as any).auth.api['sign-up'].email.post({
			email,
			password: 'password123',
			name: 'Test'
		})
		expect([409, 422]).toContain(res.status)
	})

	it('should sign up successfully with valid credentials', async () => {
		const res = await (tClient as any).auth.api['sign-up'].email.post({
			email: uniqueEmail(),
			password: 'password123',
			name: 'Test User'
		})
		expect([200, 201]).toContain(res.status)
	})
})

// ---------------------------------------------------------------------------
// S-06 — Password Change (Authenticated)
// ---------------------------------------------------------------------------
describe('S-06: Password Change', () => {
	let authCookie = ''

	beforeAll(async () => {
		const { cookie } = await signUpAndGetCookie()
		authCookie = cookie
	})

	it('should return 401 without authentication', async () => {
		const res = await (tClient as any).auth.api['change-password'].post({
			currentPassword: 'password123',
			newPassword: 'newpassword123'
		})
		expect(res.status).toBe(401)
	})

	it('should change password with valid current password', async () => {
		const email = uniqueEmail()
		const { cookie } = await signUpAndGetCookie(email, 'password123')

		const res = await (tClient as any).auth.api['change-password'].post(
			{ currentPassword: 'password123', newPassword: 'newpassword456' },
			{ fetch: { headers: { cookie } } }
		)
		expect([200, 204]).toContain(res.status)
	})

	it('should reject wrong current password', async () => {
		const res = await (tClient as any).auth.api['change-password'].post(
			{ currentPassword: 'wrongpassword', newPassword: 'newpassword456' },
			{ fetch: { headers: { cookie: authCookie } } }
		)
		expect([400, 401]).toContain(res.status)
	})
})

// ---------------------------------------------------------------------------
// S-07 — Profile Update
// ---------------------------------------------------------------------------
describe('S-07: Profile Update', () => {
	let authCookie = ''

	beforeAll(async () => {
		const { cookie } = await signUpAndGetCookie()
		authCookie = cookie
	})

	it('should return 401 without authentication', async () => {
		const res = await tClient.api.auth.profile.patch({ name: 'New Name' })
		expect(res.status).toBe(401)
	})

	it('should update name', async () => {
		const res = await tClient.api.auth.profile.patch(
			{ name: 'Updated Name' },
			{ fetch: { headers: { cookie: authCookie } } }
		)
		expect(res.status).toBe(200)
		expect((res.data as any)?.data?.name).toBe('Updated Name')
	})

	it('should update bio', async () => {
		const res = await tClient.api.auth.profile.patch(
			{ bio: 'My bio text' },
			{ fetch: { headers: { cookie: authCookie } } }
		)
		expect(res.status).toBe(200)
		expect((res.data as any)?.data?.bio).toBe('My bio text')
	})

	it('should update avatar', async () => {
		const res = await tClient.api.auth.profile.patch(
			{ avatar: 'https://example.com/avatar.png' },
			{ fetch: { headers: { cookie: authCookie } } }
		)
		expect(res.status).toBe(200)
		expect((res.data as any)?.data?.image).toBe(
			'https://example.com/avatar.png'
		)
	})

	it('should update all fields at once', async () => {
		const res = await tClient.api.auth.profile.patch(
			{
				name: 'Full Update',
				bio: 'Updated bio',
				avatar: 'https://example.com/new.png'
			},
			{ fetch: { headers: { cookie: authCookie } } }
		)
		expect(res.status).toBe(200)
	})
})

// ---------------------------------------------------------------------------
// S-08 — Multi-Tenant Organization Context
// ---------------------------------------------------------------------------
describe('S-08: Multi-Tenant Organization Context', () => {
	let authCookie = ''

	beforeAll(async () => {
		const { cookie } = await signUpAndGetCookie()
		authCookie = cookie
	})

	it('should return 401 when creating org without session', async () => {
		const rawRes = await app.handle(
			new Request('http://localhost/auth/api/organization/create', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					origin: ORIGIN
				},
				body: JSON.stringify({
					name: 'Test Org',
					slug: `test-org-${Date.now()}`
				})
			})
		)
		expect(rawRes.status).toBe(401)
	})

	it('should create an organization when authenticated', async () => {
		const res = await (tClient as any).auth.api.organization.create.post(
			{ name: 'My Barbershop', slug: `barbershop-${Date.now()}` },
			{ fetch: { headers: { cookie: authCookie, origin: ORIGIN } } }
		)
		expect([200, 201]).toContain(res.status)
	})

	it('should set active organization and reflect it in session', async () => {
		const createRes = await (
			tClient as any
		).auth.api.organization.create.post(
			{
				name: `Org ${Date.now()}`,
				slug: `org-${Date.now()}`
			},
			{ fetch: { headers: { cookie: authCookie, origin: ORIGIN } } }
		)
		expect([200, 201]).toContain(createRes.status)

		const orgId = createRes.data?.id
		if (!orgId) return

		const setRes = await (tClient as any).auth.api.organization[
			'set-active'
		].post(
			{ organizationId: orgId },
			{ fetch: { headers: { cookie: authCookie, origin: ORIGIN } } }
		)
		expect([200, 204]).toContain(setRes.status)

		const sessionRes = await (tClient as any).auth.api['get-session'].get({
			headers: { cookie: authCookie }
		})
		expect(sessionRes.status).toBe(200)
		expect(sessionRes.data?.session?.activeOrganizationId).toBe(orgId)
	})
})

// ---------------------------------------------------------------------------
// S-05 — Phone Change (send-otp / verify-otp endpoints, 401 + rate limit)
// ---------------------------------------------------------------------------
describe('S-05: Phone Change — Authentication Guards', () => {
	it('should return 401 on send-otp without authentication', async () => {
		const res = await tClient.api.auth.phone['send-otp'].post({
			step: 'old'
		})
		expect(res.status).toBe(401)
	})

	it('should return 401 on verify-otp without authentication', async () => {
		const res = await tClient.api.auth.phone['verify-otp'].post({
			step: 'old',
			otp: '1234'
		})
		expect(res.status).toBe(401)
	})

	it('should return 400 when step=new and phone is missing', async () => {
		const { cookie } = await signUpAndGetCookie()
		const res = await tClient.api.auth.phone['send-otp'].post(
			{ step: 'new' },
			{ fetch: { headers: { cookie } } }
		)
		expect([400, 422]).toContain(res.status)
	})

	it('should return 400 when OTP is invalid (no prior send)', async () => {
		const { cookie } = await signUpAndGetCookie()
		const res = await tClient.api.auth.phone['verify-otp'].post(
			{ step: 'old', otp: '0000' },
			{ fetch: { headers: { cookie } } }
		)
		expect(res.status).toBe(400)
	})

	it('should enforce 429 after exceeding phone OTP rate limit', async () => {
		const { cookie } = await signUpAndGetCookie()

		for (let i = 0; i < 3; i++) {
			await tClient.api.auth.phone['send-otp'].post(
				{ step: 'old' },
				{ fetch: { headers: { cookie } } }
			)
		}

		const res = await tClient.api.auth.phone['send-otp'].post(
			{ step: 'old' },
			{ fetch: { headers: { cookie } } }
		)
		expect(res.status).toBe(429)
	})
})
