import { Elysia } from 'elysia'

import { authMiddleware } from '../../middleware/auth-middleware'

export const authHandler = new Elysia({
	prefix: '/auth',
	tags: ['Auth']
}).use(authMiddleware)
