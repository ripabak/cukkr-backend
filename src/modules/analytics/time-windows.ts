import { AppError } from '../../core/error'
import { AnalyticsModel } from './model'

export type AnalyticsRange = AnalyticsModel.AnalyticsRange

export const WIB_OFFSET_MS = 7 * 60 * 60 * 1000

export interface BucketDef {
	label: string
	start: Date
	end: Date
}

export interface TimeWindows {
	currentStart: Date
	currentEnd: Date
	previousStart: Date
	previousEnd: Date
	buckets: BucketDef[]
}

const MONTH_NAMES = [
	'Jan',
	'Feb',
	'Mar',
	'Apr',
	'May',
	'Jun',
	'Jul',
	'Aug',
	'Sep',
	'Oct',
	'Nov',
	'Dec'
]
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function toWib(date: Date): Date {
	return new Date(date.getTime() + WIB_OFFSET_MS)
}

function startOfDayWib(date: Date): Date {
	const wib = toWib(date)
	const utc = Date.UTC(
		wib.getUTCFullYear(),
		wib.getUTCMonth(),
		wib.getUTCDate()
	)
	return new Date(utc - WIB_OFFSET_MS)
}

function startOfMonthWib(date: Date): Date {
	const wib = toWib(date)
	const utc = Date.UTC(wib.getUTCFullYear(), wib.getUTCMonth(), 1)
	return new Date(utc - WIB_OFFSET_MS)
}

export function buildTimeWindows(
	range: AnalyticsRange,
	now: Date
): TimeWindows {
	switch (range) {
		case '24h': {
			const currentEnd = now
			const currentStart = new Date(now.getTime() - 24 * 60 * 60 * 1000)
			const previousEnd = currentStart
			const previousStart = new Date(now.getTime() - 48 * 60 * 60 * 1000)
			const buckets: BucketDef[] = []
			for (let i = 23; i >= 0; i--) {
				const start = new Date(now.getTime() - (i + 1) * 60 * 60 * 1000)
				const end = new Date(now.getTime() - i * 60 * 60 * 1000)
				const hour = String(toWib(start).getUTCHours()).padStart(2, '0')
				buckets.push({ label: `${hour}:00`, start, end })
			}
			return {
				currentStart,
				currentEnd,
				previousStart,
				previousEnd,
				buckets
			}
		}

		case 'week': {
			const todayStart = startOfDayWib(now)
			const currentStart = new Date(
				todayStart.getTime() - 6 * 24 * 60 * 60 * 1000
			)
			const currentEnd = new Date(
				todayStart.getTime() + 24 * 60 * 60 * 1000
			)
			const previousStart = new Date(
				currentStart.getTime() - 7 * 24 * 60 * 60 * 1000
			)
			const previousEnd = currentStart
			const buckets: BucketDef[] = []
			for (let i = 0; i < 7; i++) {
				const start = new Date(
					currentStart.getTime() + i * 24 * 60 * 60 * 1000
				)
				const end = new Date(start.getTime() + 24 * 60 * 60 * 1000)
				const label = DAY_NAMES[toWib(start).getUTCDay()]
				buckets.push({ label, start, end })
			}
			return {
				currentStart,
				currentEnd,
				previousStart,
				previousEnd,
				buckets
			}
		}

		case 'month': {
			const currentStart = startOfMonthWib(now)
			const wibNow = toWib(now)
			const currentEnd = new Date(
				Date.UTC(wibNow.getUTCFullYear(), wibNow.getUTCMonth() + 1, 1) -
					WIB_OFFSET_MS
			)
			const previousStart = new Date(
				Date.UTC(wibNow.getUTCFullYear(), wibNow.getUTCMonth() - 1, 1) -
					WIB_OFFSET_MS
			)
			const previousEnd = currentStart
			const buckets: BucketDef[] = []
			const wibCurrent = toWib(currentStart)
			const year = wibCurrent.getUTCFullYear()
			const month = wibCurrent.getUTCMonth()
			const daysInMonth = new Date(
				Date.UTC(year, month + 1, 0)
			).getUTCDate()
			for (let d = 1; d <= daysInMonth; d++) {
				const start = new Date(Date.UTC(year, month, d) - WIB_OFFSET_MS)
				const end = new Date(start.getTime() + 24 * 60 * 60 * 1000)
				buckets.push({ label: String(d).padStart(2, '0'), start, end })
			}
			return {
				currentStart,
				currentEnd,
				previousStart,
				previousEnd,
				buckets
			}
		}

		case '6m': {
			const wibNow = toWib(now)
			const currentStart = new Date(
				Date.UTC(wibNow.getUTCFullYear(), wibNow.getUTCMonth() - 6, 1) -
					WIB_OFFSET_MS
			)
			const previousStart = new Date(
				Date.UTC(
					wibNow.getUTCFullYear(),
					wibNow.getUTCMonth() - 12,
					1
				) - WIB_OFFSET_MS
			)
			const buckets: BucketDef[] = []
			for (let i = 5; i >= 0; i--) {
				const start = new Date(
					Date.UTC(
						wibNow.getUTCFullYear(),
						wibNow.getUTCMonth() - i,
						1
					) - WIB_OFFSET_MS
				)
				const end = new Date(
					Date.UTC(
						wibNow.getUTCFullYear(),
						wibNow.getUTCMonth() - i + 1,
						1
					) - WIB_OFFSET_MS
				)
				const label = MONTH_NAMES[toWib(start).getUTCMonth()]
				buckets.push({ label, start, end })
			}
			return {
				currentStart,
				currentEnd: now,
				previousStart,
				previousEnd: currentStart,
				buckets
			}
		}

		case '1y': {
			const wibNow = toWib(now)
			const currentStart = new Date(
				Date.UTC(
					wibNow.getUTCFullYear(),
					wibNow.getUTCMonth() - 12,
					1
				) - WIB_OFFSET_MS
			)
			const previousStart = new Date(
				Date.UTC(
					wibNow.getUTCFullYear(),
					wibNow.getUTCMonth() - 24,
					1
				) - WIB_OFFSET_MS
			)
			const buckets: BucketDef[] = []
			for (let i = 11; i >= 0; i--) {
				const start = new Date(
					Date.UTC(
						wibNow.getUTCFullYear(),
						wibNow.getUTCMonth() - i,
						1
					) - WIB_OFFSET_MS
				)
				const end = new Date(
					Date.UTC(
						wibNow.getUTCFullYear(),
						wibNow.getUTCMonth() - i + 1,
						1
					) - WIB_OFFSET_MS
				)
				const label = MONTH_NAMES[toWib(start).getUTCMonth()]
				buckets.push({ label, start, end })
			}
			return {
				currentStart,
				currentEnd: now,
				previousStart,
				previousEnd: currentStart,
				buckets
			}
		}

		default:
			throw new AppError('Invalid analytics range', 'BAD_REQUEST')
	}
}
