export type OrganizationMetadata = {
    timezone?: string;
};
export declare function parseOrgMetadata(metadata: string | null | undefined): OrganizationMetadata;
export declare function getOrgTimezone(metadata: string | null | undefined): string;
export declare function fetchOrgTimezone(organizationId: string): Promise<string>;
