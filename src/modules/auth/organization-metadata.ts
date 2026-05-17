import { eq } from 'drizzle-orm'

import { db } from '../../lib/database'
import { DEFAULT_TIMEZONE } from '../../lib/timezone'
import { organization } from './schema'

export type OrganizationMetadata = {
	timezone?: string
}

export function parseOrgMetadata(
	metadata: string | null | undefined
): OrganizationMetadata {
	if (!metadata) return {}
	try {
		return JSON.parse(metadata) as OrganizationMetadata
	} catch {
		return {}
	}
}

export function getOrgTimezone(metadata: string | null | undefined): string {
	return parseOrgMetadata(metadata).timezone ?? DEFAULT_TIMEZONE
}

export async function fetchOrgTimezone(
	organizationId: string
): Promise<string> {
	const org = await db.query.organization.findFirst({
		where: eq(organization.id, organizationId),
		columns: { metadata: true }
	})
	return getOrgTimezone(org?.metadata)
}
