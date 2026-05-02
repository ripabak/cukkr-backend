import { BarbershopModel } from './model';
export declare abstract class BarbershopService {
    private static ensureSettingsRow;
    private static validateAndCheckSlug;
    static getSettings(organizationId: string): Promise<BarbershopModel.BarbershopResponse>;
    static updateSettings(organizationId: string, userId: string, body: BarbershopModel.BarbershopSettingsInput): Promise<BarbershopModel.BarbershopResponse>;
    static checkSlug(slug: string): Promise<BarbershopModel.SlugCheckResponse>;
    static createBarbershop(userId: string, body: BarbershopModel.CreateBarbershopInput): Promise<BarbershopModel.BarbershopResponse>;
    static listBarbershops(userId: string): Promise<BarbershopModel.BarbershopListResponse>;
    static uploadLogo(organizationId: string, userId: string, file: File): Promise<BarbershopModel.LogoUploadResponse>;
    static leaveBarbershop(userId: string, orgId: string): Promise<BarbershopModel.LeaveOrgResponse>;
}
