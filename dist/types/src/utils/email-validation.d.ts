export interface EmailValidationResult {
    valid: boolean;
    reason?: string;
}
export declare function validateEmail(email: string): Promise<EmailValidationResult>;
