import { UserProfileModel } from './model';
export declare abstract class UserProfileService {
    static buildPhoneChangeIdentifier(userId: string, phone: string): string;
    private static getUserRole;
    private static getProfileRecord;
    static getProfile(userId: string, activeOrganizationId?: string): Promise<UserProfileModel.UserProfileResponse>;
    static updateProfile(userId: string, input: UserProfileModel.UpdateProfileInput, activeOrganizationId?: string): Promise<UserProfileModel.UserProfileResponse>;
    static uploadAvatar(userId: string, file: File, activeOrganizationId?: string): Promise<UserProfileModel.AvatarUploadResponse>;
    static initiatePhoneChange(userId: string, newPhone: string): Promise<UserProfileModel.ChangePhoneResponse>;
    static verifyPhoneChange(userId: string, phone: string, otp: string, activeOrganizationId?: string): Promise<UserProfileModel.UserProfileResponse>;
}
