import { type Language } from './i18n';
interface SendEmailPayload {
    to: string;
    subject: string;
    text?: string;
    html?: string;
}
export declare function sendEmail({ to, subject, text, html }: SendEmailPayload): Promise<void>;
export declare function sendOtpEmail({ to, otp, purpose, language }: {
    to: string;
    otp: string;
    purpose: string;
    language?: Language;
}): Promise<void>;
export declare function sendOrganizationInvitation({ to, inviterName, organizationName, inviteUrl, language }: {
    to: string;
    inviterName: string;
    organizationName: string;
    inviteUrl: string;
    language?: Language;
}): Promise<void>;
export declare function sendAppointmentVerificationEmail({ to, customerName, barbershopName, verifyUrl, language }: {
    to: string;
    customerName: string;
    barbershopName: string;
    verifyUrl: string;
    language?: Language;
}): Promise<void>;
export declare function sendIdentityVerificationEmail({ to, customerName, barbershopName, verifyUrl, language }: {
    to: string;
    customerName: string;
    barbershopName: string;
    verifyUrl: string;
    language?: Language;
}): Promise<void>;
export declare function sendBookingAcceptedEmail({ to, customerName, barbershopName, referenceNumber, language }: {
    to: string;
    customerName: string;
    barbershopName: string;
    referenceNumber: string;
    language?: Language;
}): Promise<void>;
export declare function sendBookingDeclinedEmail({ to, customerName, barbershopName, referenceNumber, reason, language }: {
    to: string;
    customerName: string;
    barbershopName: string;
    referenceNumber: string;
    reason?: string | null;
    language?: Language;
}): Promise<void>;
export declare function sendBookingExpiredEmail({ to, customerName, barbershopName, referenceNumber, language }: {
    to: string;
    customerName: string;
    barbershopName: string;
    referenceNumber: string;
    language?: Language;
}): Promise<void>;
export declare function verifySmtp(): Promise<boolean>;
export {};
