export declare const env: {
    NODE_ENV: "development" | "production" | "test";
    PORT: number;
    DATABASE_URL: string;
    BETTER_AUTH_SECRET: string;
    BETTER_AUTH_URL: string;
    CORS_ORIGIN: string[];
    SMTP_SECURE: boolean;
    WALK_IN_TOKEN_SECRET: string;
    STORAGE_ENDPOINT?: string | undefined;
    STORAGE_BUCKET?: string | undefined;
    STORAGE_ACCESS_KEY?: string | undefined;
    STORAGE_SECRET_KEY?: string | undefined;
    SMTP_HOST?: string | undefined;
    SMTP_PORT?: number | undefined;
    SMTP_USER?: string | undefined;
    SMTP_PASS?: string | undefined;
    SMTP_FROM?: string | undefined;
};
