export declare function generateNumericOtp(length?: number): string;
export declare function hashOtp(otp: string): Promise<string>;
export declare function verifyOtp(otp: string, hashedOtp: string): Promise<boolean>;
export declare function rememberOtpForTesting(identifier: string, otp: string): void;
export declare function getLatestOtpForTesting(identifier: string): string | null;
export declare function clearOtpForTesting(identifier?: string): void;
