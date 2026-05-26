type Listener = () => void

class BookingEventBus {
	private readonly listeners = new Map<string, Set<Listener>>()

	subscribe(orgId: string, listener: Listener): () => void {
		if (!this.listeners.has(orgId)) {
			this.listeners.set(orgId, new Set())
		}
		this.listeners.get(orgId)!.add(listener)

		return () => {
			const orgListeners = this.listeners.get(orgId)
			if (!orgListeners) return
			orgListeners.delete(listener)
			if (orgListeners.size === 0) this.listeners.delete(orgId)
		}
	}

	notify(orgId: string): void {
		this.listeners.get(orgId)?.forEach((fn) => fn())
	}
}

export const bookingEventBus = new BookingEventBus()
