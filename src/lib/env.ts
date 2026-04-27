import { z } from 'zod'

const envSchema = z.object({
	NODE_ENV: z
		.enum(['development', 'production', 'test'])
		.default('development'),

	PORT: z.coerce.number().default(3000),

	DATABASE_URL: z.string().min(1),

	BETTER_AUTH_SECRET: z.string().min(1),

	BETTER_AUTH_URL: z.string().url(),

	STORAGE_ENDPOINT: z.string().url().optional(),
	STORAGE_BUCKET: z.string().min(1).optional(),
	STORAGE_ACCESS_KEY: z.string().min(1).optional(),
	STORAGE_SECRET_KEY: z.string().min(1).optional(),

	CORS_ORIGIN: z
		.string()
		.optional()
		.transform((val) => (val ? val.split(',').map((u) => u.trim()) : [])),

	// SMTP Configuration
	SMTP_HOST: z.string().optional(),
	SMTP_PORT: z.coerce.number().optional(),
	SMTP_USER: z.string().optional(),
	SMTP_PASS: z.string().optional(),
	SMTP_SECURE: z.coerce.boolean().optional().default(false),
	SMTP_FROM: z.string().optional()
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
	console.error('❌ Invalid environment variables:')
	console.error(parsed.error.format())
	process.exit(1)
}

export const env = parsed.data
