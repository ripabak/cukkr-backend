import { BarbershopModel } from './model';
export declare abstract class BarbershopService {
    static ensureSettingsRow(organizationId: string): Promise<void>;
    private static validateAndCheckSlug;
    static getSettings(organizationId: string): Promise<BarbershopModel.BarbershopResponse>;
    static updateTimezone(organizationId: string, timezone: string): Promise<BarbershopModel.TimezoneResponse>;
    static updateSettings(organizationId: string, body: BarbershopModel.BarbershopSettingsInput): Promise<BarbershopModel.BarbershopResponse>;
    static checkSlug(slug: string): Promise<BarbershopModel.SlugCheckResponse>;
    static uploadLogo(organizationId: string, file: File): Promise<BarbershopModel.LogoUploadResponse>;
    static leaveBarbershop(userId: string, orgId: string): Promise<BarbershopModel.LeaveOrgResponse>;
}
