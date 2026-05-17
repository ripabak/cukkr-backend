import { AppError } from '../../core/error'
import {
	getDayOfWeek,
	startOfDay,
	startOfMonth,
	toLocalDate
} from '../../lib/timezone'
import { AnalyticsModel } from './model'

export type AnalyticsRange = AnalyticsModel.AnalyticsRange

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

export function buildTimeWindows(
	range: AnalyticsRange,
	now: Date,
	timezone: string
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
				const hour = String(
					toLocalDate(start, timezone).getUTCHours()
				).padStart(2, '0')
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
			const todayStart = startOfDay(now, timezone)
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
				const label = DAY_NAMES[getDayOfWeek(start, timezone)]
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
			const currentStart = startOfMonth(now, timezone)
			const localNow = toLocalDate(now, timezone)
			const currentEnd = startOfMonth(
				new Date(
					Date.UTC(
						localNow.getUTCFullYear(),
						localNow.getUTCMonth() + 1,
						1
					)
				),
				timezone
			)
			const previousStart = startOfMonth(
				new Date(
					Date.UTC(
						localNow.getUTCFullYear(),
						localNow.getUTCMonth() - 1,
						1
					)
				),
				timezone
			)
			const previousEnd = currentStart
			const buckets: BucketDef[] = []
			const localCurrent = toLocalDate(currentStart, timezone)
			const year = localCurrent.getUTCFullYear()
			const month = localCurrent.getUTCMonth()
			const daysInMonth = new Date(
				Date.UTC(year, month + 1, 0)
			).getUTCDate()
			for (let d = 1; d <= daysInMonth; d++) {
				const start = startOfDay(
					new Date(Date.UTC(year, month, d)),
					timezone
				)
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
			const localNow = toLocalDate(now, timezone)
			const currentStart = startOfMonth(
				new Date(
					Date.UTC(
						localNow.getUTCFullYear(),
						localNow.getUTCMonth() - 6,
						1
					)
				),
				timezone
			)
			const previousStart = startOfMonth(
				new Date(
					Date.UTC(
						localNow.getUTCFullYear(),
						localNow.getUTCMonth() - 12,
						1
					)
				),
				timezone
			)
			const buckets: BucketDef[] = []
			for (let i = 5; i >= 0; i--) {
				const start = startOfMonth(
					new Date(
						Date.UTC(
							localNow.getUTCFullYear(),
							localNow.getUTCMonth() - i,
							1
						)
					),
					timezone
				)
				const end = startOfMonth(
					new Date(
						Date.UTC(
							localNow.getUTCFullYear(),
							localNow.getUTCMonth() - i + 1,
							1
						)
					),
					timezone
				)
				const label =
					MONTH_NAMES[toLocalDate(start, timezone).getUTCMonth()]
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
			const localNow = toLocalDate(now, timezone)
			const currentStart = startOfMonth(
				new Date(
					Date.UTC(
						localNow.getUTCFullYear(),
						localNow.getUTCMonth() - 12,
						1
					)
				),
				timezone
			)
			const previousStart = startOfMonth(
				new Date(
					Date.UTC(
						localNow.getUTCFullYear(),
						localNow.getUTCMonth() - 24,
						1
					)
				),
				timezone
			)
			const buckets: BucketDef[] = []
			for (let i = 11; i >= 0; i--) {
				const start = startOfMonth(
					new Date(
						Date.UTC(
							localNow.getUTCFullYear(),
							localNow.getUTCMonth() - i,
							1
						)
					),
					timezone
				)
				const end = startOfMonth(
					new Date(
						Date.UTC(
							localNow.getUTCFullYear(),
							localNow.getUTCMonth() - i + 1,
							1
						)
					),
					timezone
				)
				const label =
					MONTH_NAMES[toLocalDate(start, timezone).getUTCMonth()]
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
