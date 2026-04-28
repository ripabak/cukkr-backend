const WINDOW_MS = 15 * 60 * 1000
const MAX_FAILURES = 5

interface IpRecord {
	count: number
	windowStart: number
}

class IpFailureGuardClass {
	private store = new Map<string, IpRecord>()

	isBlocked(ip: string): boolean {
		const record = this.store.get(ip)
		if (!record) return false

		if (Date.now() - record.windowStart > WINDOW_MS) {
			this.store.delete(ip)
			return false
		}

		return record.count >= MAX_FAILURES
	}

	recordFailure(ip: string): void {
		const record = this.store.get(ip)
		const now = Date.now()

		if (!record || now - record.windowStart > WINDOW_MS) {
			this.store.set(ip, { count: 1, windowStart: now })
		} else {
			record.count += 1
		}
	}

	reset(ip: string): void {
		this.store.delete(ip)
	}

	resetAll(): void {
		this.store.clear()
	}
}

export const ipFailureGuard = new IpFailureGuardClass()
