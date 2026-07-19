import { id } from './locales/id'
import { en } from './locales/en'

export type Language = 'id' | 'en'

const locales: Record<Language, Record<string, unknown>> = { id, en }

function resolveKey(obj: unknown, path: string): unknown {
	return path.split('.').reduce<unknown>((acc, key) => {
		if (acc && typeof acc === 'object' && key in acc) {
			return (acc as Record<string, unknown>)[key]
		}
		return undefined
	}, obj)
}

function interpolate(str: string, params?: Record<string, string>): string {
	if (!params) return str
	return Object.entries(params).reduce(
		(acc, [key, value]) => acc.replace(`{${key}}`, value),
		str
	)
}

export function t(
	language: Language,
	key: string,
	params?: Record<string, string>
): string {
	const lang = language === 'en' ? 'en' : 'id'
	const locale = locales[lang]
	const value = resolveKey(locale, key)

	if (typeof value === 'string') {
		return interpolate(value, params)
	}

	// Fallback to id if key not found in requested language
	if (lang === 'en') {
		const fallbackValue = resolveKey(locales.id, key)
		if (typeof fallbackValue === 'string') {
			return interpolate(fallbackValue, params)
		}
	}

	return key
}
