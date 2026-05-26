import webpush from 'web-push'

import { env } from './env'

webpush.setVapidDetails(
	env.VAPID_EMAIL,
	env.VAPID_PUBLIC_KEY,
	env.VAPID_PRIVATE_KEY
)

export { webpush }
