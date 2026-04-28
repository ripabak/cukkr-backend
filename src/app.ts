import { Elysia } from 'elysia'
import { auth } from './lib/auth'
import { openapi } from '@elysiajs/openapi'
import { OpenAPI } from './lib/auth'
import { env } from './lib/env'
import cors from '@elysiajs/cors'
import { healthCheck } from './utils/health-check'
import { AppError, CustomError } from './core/error'
import { productExampleHandler } from './modules/product-example/handler'
import { barbershopHandler } from './modules/barbershop/handler'
import { barbersHandler } from './modules/barbers/handler'
import { servicesHandler } from './modules/services/handler'
import { openHoursHandler } from './modules/open-hours/handler'
import { authHandler } from './modules/auth/handler'
import { bookingsHandler } from './modules/bookings/handler'
import { customersHandler } from './modules/customer-management/handler'
import { rateLimit } from 'elysia-rate-limit'
import { logixlysia } from 'logixlysia'
import { userProfileHandler } from './modules/user-profile/handler'
import {
	walkInPinHandler,
	publicWalkInHandler
} from './modules/walk-in-pin/handler'
import { analyticsHandler } from './modules/analytics/handler'
import { notificationsHandler } from './modules/notifications/handler'
import { publicHandler } from './modules/public/handler'

export const app = new Elysia()
	.use(
		logixlysia({
			config: {
				showStartupMessage: true,
				startupMessageFormat: 'banner',
				timestamp: {
					translateTime: 'yyyy-mm-dd HH:MM:ss.SSS'
				},
				logFilePath: './logs/example.log',
				ip: true,
				customLogFormat:
					'🦊 {now} {level} {duration} {method} {pathname} {status} {message} {ip}'
			}
		})
	)
	.use(
		rateLimit({
			max: 100,
			skip: () => env.NODE_ENV === 'test'
		})
	)
	.use(
		cors({
			origin: env.CORS_ORIGIN,
			methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
			allowedHeaders: ['Content-Type', 'Authorization'],
			credentials: true
		})
	)
	.use(
		openapi({
			documentation: {
				components: await OpenAPI.components,
				paths: await OpenAPI.getPaths()
			}
		})
	)
	// Error handler
	.use(CustomError)

	// Response middleware
	// .use(ResponseMiddleware)

	.mount(auth.handler)

	// Health Check
	.get('/health-check', () => healthCheck())
	.get('/', () => {
		throw new AppError('Not Found', 'NOT_FOUND')
	})

	// Modules
	.group('/api', (app) =>
		app
			.use(productExampleHandler)
			.use(authHandler)
			.use(barbershopHandler)
			.use(barbersHandler)
			.use(servicesHandler)
			.use(bookingsHandler)
			.use(customersHandler)
			.use(openHoursHandler)
			.use(userProfileHandler)
			.use(walkInPinHandler)
			.use(publicWalkInHandler)
			.use(analyticsHandler)
			.use(notificationsHandler)
			.use(publicHandler)
	)

export type App = typeof app
