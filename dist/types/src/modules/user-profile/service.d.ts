import { UserProfileModel } from './model';
export declare abstract class UserProfileService {
    private static getUserRole;
    private static getProfileRecord;
    static getProfile(userId: string, activeOrganizationId?: string): Promise<UserProfileModel.UserProfileResponse>;
    static updateProfile(userId: string, input: UserProfileModel.UpdateProfileInput, activeOrganizationId?: string): Promise<UserProfileModel.UserProfileResponse>;
    static uploadAvatar(userId: string, file: File, activeOrganizationId?: string): Promise<UserProfileModel.AvatarUploadResponse>;
}
