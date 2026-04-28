import { db } from '../lib/database'
import { verifySmtp } from '../lib/mail'
import { verifyStorage } from '../lib/storage'

const CHECKS = {
	DATABASE: false,
	SMTP: false,
	STORAGE: false
}

const checkDatabaseConnection = async () => {
	try {
		await db.execute(`SELECT 1`)
		CHECKS.DATABASE = true
	} catch {
		CHECKS.DATABASE = false
	}
}

const checkSmtpConnection = async () => {
	try {
		await verifySmtp()
		CHECKS.SMTP = true
	} catch {
		CHECKS.SMTP = false
	}
}

const checkStorageConnection = async () => {
	try {
		await verifyStorage()
		CHECKS.STORAGE = true
	} catch {
		CHECKS.STORAGE = false
	}
}

export const healthCheck = async () => {
	await Promise.all([
		checkDatabaseConnection(),
		checkSmtpConnection(),
		checkStorageConnection()
	])
	return {
		status: 'ok',
		message: 'Elysia Backend is running',
		checks: CHECKS
	}
}
