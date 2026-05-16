export const DEFAULT_TIMEZONE = 'Asia/Jakarta'

function getOffsetMs(date: Date, timezone: string): number {
	const utcStr = date.toLocaleString('en-US', { timeZone: 'UTC' })
	const localStr = date.toLocaleString('en-US', { timeZone: timezone })
	return new Date(localStr).getTime() - new Date(utcStr).getTime()
}

export function toLocalDate(date: Date, timezone: string): Date {
	return new Date(date.getTime() + getOffsetMs(date, timezone))
}

export function getDateKey(date: Date, timezone: string): string {
	const local = toLocalDate(date, timezone)
	return [
		local.getUTCFullYear(),
		String(local.getUTCMonth() + 1).padStart(2, '0'),
		String(local.getUTCDate()).padStart(2, '0')
	].join('')
}

export function getDayOfWeek(date: Date, timezone: string): number {
	return toLocalDate(date, timezone).getUTCDay()
}

export function getTimeString(date: Date, timezone: string): string {
	const local = toLocalDate(date, timezone)
	return `${String(local.getUTCHours()).padStart(2, '0')}:${String(local.getUTCMinutes()).padStart(2, '0')}`
}

export function startOfDay(date: Date, timezone: string): Date {
	const local = toLocalDate(date, timezone)
	const utcApprox = Date.UTC(
		local.getUTCFullYear(),
		local.getUTCMonth(),
		local.getUTCDate()
	)
	return new Date(utcApprox - getOffsetMs(new Date(utcApprox), timezone))
}

export function startOfMonth(date: Date, timezone: string): Date {
	const local = toLocalDate(date, timezone)
	const utcApprox = Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), 1)
	return new Date(utcApprox - getOffsetMs(new Date(utcApprox), timezone))
}
