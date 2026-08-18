interface XenditCreateInvoiceParams {
    externalId: string;
    amount: number;
    currency: string;
    description: string;
    payerEmail: string;
    payerName?: string;
    paymentMethods: string[];
    metadata?: Record<string, string>;
}
interface XenditInvoice {
    id: string;
    invoiceUrl: string;
    status: string;
    externalId: string;
    amount: number;
    currency: string;
}
export declare abstract class XenditService {
    static createInvoice(params: XenditCreateInvoiceParams): Promise<XenditInvoice>;
    static expireInvoice(invoiceId: string): Promise<boolean>;
    static verifyWebhookToken(token: string | null | undefined): boolean;
}
export {};
