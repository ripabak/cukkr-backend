interface SendEmailPayload {
    to: string;
    subject: string;
    text?: string;
    html?: string;
}
export declare function sendEmail({ to, subject, text, html }: SendEmailPayload): Promise<void>;
export declare function sendOtpEmail({ to, otp, purpose }: {
    to: string;
    otp: string;
    purpose: string;
}): Promise<void>;
export declare function verifySmtp(): Promise<boolean>;
export {};
