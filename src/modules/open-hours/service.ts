import { and, asc, eq } from 'drizzle-orm'
import { nanoid } from 'nanoid'

import { AppError } from '../../core/error'
import { db } from '../../lib/database'
import { member } from '../auth/schema'
import { OpenHoursModel } from './model'
import { OpenHour, openHour } from './schema'

const DAYS_OF_WEEK = [0, 1, 2, 3, 4, 5, 6] as const

type OpenHoursRow = Pick<
	OpenHour,
	'dayOfWeek' | 'isOpen' | 'openTime' | 'closeTime'
>

export abstract class OpenHoursService {
	static async getWeeklySchedule(
		organizationId: string
	): Promise<OpenHoursModel.OpenHoursWeekResponse> {
		return OpenHoursService.getWeeklyScheduleForOrganization(organizationId)
	}

	static async getWeeklyScheduleForOrganization(
		organizationId: string
	): Promise<OpenHoursModel.OpenHoursWeekResponse> {
		const rows = await db.query.openHour.findMany({
			where: eq(openHour.organizationId, organizationId),
			orderBy: asc(openHour.dayOfWeek)
		})

		return OpenHoursService.normalizeStoredRows(rows)
	}

	static async replaceWeeklySchedule(
		organizationId: string,
		userId: string,
		input: OpenHoursModel.UpdateOpenHoursBody
	): Promise<OpenHoursModel.OpenHoursWeekResponse> {
		await OpenHoursService.ensureOwner(organizationId, userId)

		const normalizedDays = OpenHoursService.normalizeInputDays(input.days)

		const insertedRows = await db.transaction(async (tx) => {
			await tx
				.delete(openHour)
				.where(eq(openHour.organizationId, organizationId))

			return tx
				.insert(openHour)
				.values(
					normalizedDays.map((day) => ({
						id: nanoid(),
						organizationId,
						dayOfWeek: day.dayOfWeek,
						isOpen: day.isOpen,
						openTime: day.openTime,
						closeTime: day.closeTime
					}))
				)
				.returning()
		})

		return OpenHoursService.normalizeStoredRows(insertedRows)
	}

	private static async ensureOwner(
		organizationId: string,
		userId: string
	): Promise<void> {
		const memberRow = await db.query.member.findFirst({
			where: and(
				eq(member.organizationId, organizationId),
				eq(member.userId, userId)
			)
		})

		if (!memberRow || memberRow.role !== 'owner') {
			throw new AppError('Forbidden', 'FORBIDDEN')
		}
	}

	private static normalizeStoredRows(
		rows: OpenHoursRow[]
	): OpenHoursModel.OpenHoursWeekResponse {
		const rowByDay = new Map<number, OpenHoursModel.OpenHoursDay>()

		for (const row of rows) {
			rowByDay.set(row.dayOfWeek, {
				dayOfWeek: row.dayOfWeek,
				isOpen: row.isOpen,
				openTime: row.isOpen ? (row.openTime ?? null) : null,
				closeTime: row.isOpen ? (row.closeTime ?? null) : null
			})
		}

		return DAYS_OF_WEEK.map(
			(dayOfWeek): OpenHoursModel.OpenHoursDay =>
				rowByDay.get(dayOfWeek) ?? {
					dayOfWeek,
					isOpen: false,
					openTime: null,
					closeTime: null
				}
		)
	}

	private static normalizeInputDays(
		days: OpenHoursModel.OpenHoursDay[]
	): OpenHoursModel.OpenHoursDay[] {
		if (days.length !== DAYS_OF_WEEK.length) {
			throw new AppError(
				'Weekly schedule must include exactly 7 day entries',
				'BAD_REQUEST'
			)
		}

		const seenDays = new Set<number>()
		const normalizedDays = days.map((day) => {
			if (seenDays.has(day.dayOfWeek)) {
				throw new AppError(
					'Weekly schedule cannot contain duplicate dayOfWeek values',
					'BAD_REQUEST'
				)
			}

			seenDays.add(day.dayOfWeek)

			if (!day.isOpen) {
				return {
					dayOfWeek: day.dayOfWeek,
					isOpen: false,
					openTime: null,
					closeTime: null
				}
			}

			if (!day.openTime || !day.closeTime) {
				throw new AppError(
					'Open days must include both openTime and closeTime',
					'BAD_REQUEST'
				)
			}

			if (day.closeTime <= day.openTime) {
				throw new AppError(
					'closeTime must be later than openTime',
					'BAD_REQUEST'
				)
			}

			return {
				dayOfWeek: day.dayOfWeek,
				isOpen: true,
				openTime: day.openTime,
				closeTime: day.closeTime
			}
		})

		for (const dayOfWeek of DAYS_OF_WEEK) {
			if (!seenDays.has(dayOfWeek)) {
				throw new AppError(
					'Weekly schedule must cover dayOfWeek values 0 through 6',
					'BAD_REQUEST'
				)
			}
		}

		return normalizedDays.sort(
			(left, right) => left.dayOfWeek - right.dayOfWeek
		)
	}
}
