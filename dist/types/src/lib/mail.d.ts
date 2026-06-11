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
export declare function sendOrganizationInvitation({ to, inviterName, organizationName, inviteUrl }: {
    to: string;
    inviterName: string;
    organizationName: string;
    inviteUrl: string;
}): Promise<void>;
export declare function sendAppointmentVerificationEmail({ to, customerName, barbershopName, verifyUrl }: {
    to: string;
    customerName: string;
    barbershopName: string;
    verifyUrl: string;
}): Promise<void>;
export declare function verifySmtp(): Promise<boolean>;
export {};
