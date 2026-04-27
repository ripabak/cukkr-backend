const EXPO_PUSH_API_URL = 'https://exp.host/--/api/v2/push/send'
const EXPO_PUSH_CHUNK_SIZE = 100

export type ExpoPushMessage = {
	to: string
	title: string
	body: string
	data?: Record<string, unknown>
}

type ExpoPushTicket = {
	status?: 'ok' | 'error'
	id?: string
	message?: string
	details?: {
		error?: string
	}
}

type ExpoPushTransport = {
	send(messages: ExpoPushMessage[]): Promise<ExpoPushTicket[]>
}

export type ExpoPushOutcome =
	| {
			token: string
			status: 'ok'
			ticketId: string | null
	  }
	| {
			token: string
			status: 'error'
			message: string
			errorCode: string | null
			isPermanentFailure: boolean
	  }

function isExpoPushTicketArray(value: unknown): value is ExpoPushTicket[] {
	return Array.isArray(value)
}

function chunkMessages(
	messages: ExpoPushMessage[],
	chunkSize: number = EXPO_PUSH_CHUNK_SIZE
): ExpoPushMessage[][] {
	const chunks: ExpoPushMessage[][] = []

	for (let index = 0; index < messages.length; index += chunkSize) {
		chunks.push(messages.slice(index, index + chunkSize))
	}

	return chunks
}

function normalizeOutcome(
	message: ExpoPushMessage,
	ticket?: ExpoPushTicket
): ExpoPushOutcome {
	if (ticket?.status === 'ok') {
		return {
			token: message.to,
			status: 'ok',
			ticketId: ticket.id ?? null
		}
	}

	const errorCode = ticket?.details?.error ?? null

	return {
		token: message.to,
		status: 'error',
		message: ticket?.message ?? 'Expo push delivery failed',
		errorCode,
		isPermanentFailure: errorCode === 'DeviceNotRegistered'
	}
}

const defaultExpoPushTransport: ExpoPushTransport = {
	async send(messages) {
		const response = await fetch(EXPO_PUSH_API_URL, {
			method: 'POST',
			headers: {
				'content-type': 'application/json',
				accept: 'application/json'
			},
			body: JSON.stringify(messages)
		})

		if (!response.ok) {
			throw new Error(
				`Expo push request failed with status ${response.status}`
			)
		}

		const payload = (await response.json()) as {
			data?: unknown
		}

		if (!isExpoPushTicketArray(payload.data)) {
			throw new Error('Expo push response did not include a data array')
		}

		return payload.data
	}
}

export const expoPushClient = {
	transport: defaultExpoPushTransport as ExpoPushTransport,

	async sendMessages(
		messages: ExpoPushMessage[]
	): Promise<ExpoPushOutcome[]> {
		const outcomes: ExpoPushOutcome[] = []

		for (const chunk of chunkMessages(messages)) {
			try {
				const tickets = await this.transport.send(chunk)

				for (const [index, message] of chunk.entries()) {
					outcomes.push(normalizeOutcome(message, tickets[index]))
				}
			} catch (error) {
				const message =
					error instanceof Error
						? error.message
						: 'Expo push delivery failed'

				for (const pushMessage of chunk) {
					outcomes.push({
						token: pushMessage.to,
						status: 'error',
						message,
						errorCode: 'TRANSPORT_ERROR',
						isPermanentFailure: false
					})
				}
			}
		}

		return outcomes
	},

	setTransport(transport: ExpoPushTransport) {
		this.transport = transport
	},

	resetTransport() {
		this.transport = defaultExpoPushTransport
	}
}

export function isExpoPushToken(token: string): boolean {
	return /^(ExponentPushToken|ExpoPushToken)\[[^\]]+\]$/.test(token)
}
