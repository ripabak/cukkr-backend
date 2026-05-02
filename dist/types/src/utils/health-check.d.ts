export declare const healthCheck: () => Promise<{
    status: string;
    message: string;
    checks: {
        DATABASE: boolean;
        SMTP: boolean;
        STORAGE: boolean;
    };
}>;
