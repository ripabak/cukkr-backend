// Thin wrapper around the Xendit API (sandbox/test first).
// Docs: https://docs.xendit.co — Invoice API v2 + Webhooks.
//
// Rule: keep secret API key server-side ONLY. HTTP Basic Auth with the
// secret key as username and an EMPTY password (trailing colon preserved).
import { timingSafeEqual } from 'node:crypto'

import { AppError } from '../core/error'
import { env } from './env'

// Invoice kedaluwarsa setelah 1 jam (dalam MENIT per docs Invoice API v2,
// default 1440 = 24 jam). Harus sinkron dengan INVOICE_VALIDITY_HOURS di
// modules/billing/service.ts.
const INVOICE_DURATION_MINUTES = 60

interface XenditCreateInvoiceParams {
	externalId: string
	amount: number
	currency: string
	description: string
	payerEmail: string
	payerName?: string
	paymentMethods: string[]
	metadata?: Record<string, string>
}

interface XenditInvoice {
	id: string
	invoiceUrl: string
	status: string
	externalId: string
	amount: number
	currency: string
}

export abstract class XenditService {
	/**
	 * Create a hosted invoice (Invoice API v2). The customer is redirected to
	 * `invoiceUrl` where Xendit renders the chosen channel (QRIS, VA, e-wallet...).
	 * Webhooks (`invoice.paid` / `invoice.expired`) are the source of truth —
	 * never fulfill from the redirect alone.
	 */
	static async createInvoice(
		params: XenditCreateInvoiceParams
	): Promise<XenditInvoice> {
		if (!env.XENDIT_SECRET_API_KEY) {
			throw new AppError(
				'Xendit is not configured. Set XENDIT_SECRET_API_KEY in the backend .env',
				'BAD_REQUEST'
			)
		}

		const auth = Buffer.from(`${env.XENDIT_SECRET_API_KEY}:`).toString(
			'base64'
		)

		const res = await fetch(`${env.XENDIT_API_URL}/v2/invoices`, {
			method: 'POST',
			headers: {
				Authorization: `Basic ${auth}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				external_id: params.externalId,
				amount: params.amount,
				currency: params.currency,
				description: params.description,
				payer_email: params.payerEmail,
				customer: {
					given_names: params.payerName || 'Cukkr User',
					email: params.payerEmail
				},
				payment_methods: params.paymentMethods,
				invoice_duration: INVOICE_DURATION_MINUTES,
				metadata: params.metadata ?? {}
			})
		})

		if (!res.ok) {
			const detail = (await res.text()).slice(0, 300)
			throw new AppError(
				`Xendit API error (${res.status}): ${detail}`,
				'INTERNAL_ERROR'
			)
		}

		const json = (await res.json()) as Record<string, unknown>
		const id = json.id as string
		const invoiceUrl = json.invoice_url as string
		if (!id || !invoiceUrl) {
			throw new AppError(
				'Xendit returned an unexpected invoice payload',
				'INTERNAL_ERROR'
			)
		}

		return {
			id,
			invoiceUrl,
			status: (json.status as string) ?? 'PENDING',
			externalId: (json.external_id as string) ?? params.externalId,
			amount: Number(json.amount ?? params.amount),
			currency: (json.currency as string) ?? params.currency
		}
	}

	/**
	 * Expire invoice di sisi Xendit secara langsung (POST /v2/invoices/:id/expire).
	 * Dipakai saat mengganti invoice pending lama dengan yang baru — QRIS lama
	 * langsung mati, bukan hanya di bukuan lokal. Non-fatal: kalau gagal (mis.
	 * invoice sudah expire di Xendit) kita tetap lanjut, karena webhook
	 * invoice.expired/paid tetap jadi penentu akhir.
	 */
	static async expireInvoice(invoiceId: string): Promise<boolean> {
		if (!env.XENDIT_SECRET_API_KEY) return false

		const auth = Buffer.from(`${env.XENDIT_SECRET_API_KEY}:`).toString(
			'base64'
		)

		const res = await fetch(
			`${env.XENDIT_API_URL}/v2/invoices/${invoiceId}/expire`,
			{
				method: 'POST',
				headers: {
					Authorization: `Basic ${auth}`,
					'Content-Type': 'application/json'
				},
				body: '{}'
			}
		)

		return res.ok
	}

	/**
	 * Verify the `x-callback-token` header sent by Xendit webhooks against the
	 * token configured in Dashboard > Settings > Webhooks. Constant-time compare.
	 */
	static verifyWebhookToken(token: string | null | undefined): boolean {
		if (!token || !env.XENDIT_WEBHOOK_TOKEN) return false
		const a = Buffer.from(token)
		const b = Buffer.from(env.XENDIT_WEBHOOK_TOKEN)
		if (a.length !== b.length) return false
		return timingSafeEqual(a, b)
	}
}
