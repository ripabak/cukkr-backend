export type ExpoPushMessage = {
    to: string;
    title: string;
    body: string;
    data?: Record<string, unknown>;
};
type ExpoPushTicket = {
    status?: 'ok' | 'error';
    id?: string;
    message?: string;
    details?: {
        error?: string;
    };
};
type ExpoPushTransport = {
    send(messages: ExpoPushMessage[]): Promise<ExpoPushTicket[]>;
};
export type ExpoPushOutcome = {
    token: string;
    status: 'ok';
    ticketId: string | null;
} | {
    token: string;
    status: 'error';
    message: string;
    errorCode: string | null;
    isPermanentFailure: boolean;
};
export declare const expoPushClient: {
    transport: ExpoPushTransport;
    sendMessages(messages: ExpoPushMessage[]): Promise<ExpoPushOutcome[]>;
    setTransport(transport: ExpoPushTransport): void;
    resetTransport(): void;
};
export declare function isExpoPushToken(token: string): boolean;
export {};
