export declare abstract class AuthService {
    static sendPhoneOtp(userId: string, userEmail: string, step: 'old' | 'new', newPhone?: string): Promise<void>;
    static verifyPhoneOtp(userId: string, step: 'old' | 'new', otp: string): Promise<{
        phoneUpdated: boolean;
    }>;
}
