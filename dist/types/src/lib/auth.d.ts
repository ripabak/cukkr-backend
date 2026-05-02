export declare const auth: import("better-auth/*").Auth<{
    basePath: string;
    database: (options: import("better-auth/*").BetterAuthOptions) => import("better-auth/*").DBAdapter<import("better-auth/*").BetterAuthOptions>;
    emailAndPassword: {
        enabled: true;
        requireEmailVerification: boolean;
        minPasswordLength: number;
    };
    plugins: [{
        id: "open-api";
        version: string;
        endpoints: {
            generateOpenAPISchema: import("better-auth/*").StrictEndpoint<"/open-api/generate-schema", {
                method: "GET";
            }, {
                openapi: string;
                info: {
                    title: string;
                    description: string;
                    version: string;
                };
                components: {
                    securitySchemes: {
                        apiKeyCookie: {
                            type: string;
                            in: string;
                            name: string;
                            description: string;
                        };
                        bearerAuth: {
                            type: string;
                            scheme: string;
                            description: string;
                        };
                    };
                    schemas: {
                        [x: string]: import("better-auth/plugins").OpenAPIModelSchema;
                    };
                };
                security: {
                    apiKeyCookie: never[];
                    bearerAuth: never[];
                }[];
                servers: {
                    url: string;
                }[];
                tags: {
                    name: string;
                    description: string;
                }[];
                paths: Record<string, import("better-auth/plugins").Path>;
            }>;
            openAPIReference: import("better-auth/*").StrictEndpoint<import("better-auth/*").LiteralString | "/reference", {
                method: "GET";
                metadata: {
                    readonly scope: "server";
                };
            }, Response>;
        };
        options: NoInfer<import("better-auth/plugins").OpenAPIOptions>;
    }, {
        id: "email-otp";
        version: string;
        init(ctx: import("better-auth/*").AuthContext): {
            options: {
                emailVerification: {
                    sendVerificationEmail(data: {
                        user: import("better-auth/*").User;
                        url: string;
                        token: string;
                    }, request: Request | undefined): Promise<void>;
                };
            };
        } | undefined;
        endpoints: {
            sendVerificationOTP: import("better-auth/*").StrictEndpoint<"/email-otp/send-verification-otp", {
                method: "POST";
                body: import("better-auth/*").ZodObject<{
                    email: import("better-auth/*").ZodString;
                    type: import("better-auth/*").ZodEnum<{
                        "sign-in": "sign-in";
                        "change-email": "change-email";
                        "email-verification": "email-verification";
                        "forget-password": "forget-password";
                    }>;
                }, import("zod/v4/core").$strip>;
                metadata: {
                    openapi: {
                        operationId: string;
                        description: string;
                        responses: {
                            200: {
                                description: string;
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "object";
                                            properties: {
                                                success: {
                                                    type: string;
                                                };
                                            };
                                        };
                                    };
                                };
                            };
                        };
                    };
                };
            }, {
                success: boolean;
            }>;
            createVerificationOTP: import("better-auth/*").StrictEndpoint<string, {
                method: "POST";
                body: import("better-auth/*").ZodObject<{
                    email: import("better-auth/*").ZodString;
                    type: import("better-auth/*").ZodEnum<{
                        "sign-in": "sign-in";
                        "change-email": "change-email";
                        "email-verification": "email-verification";
                        "forget-password": "forget-password";
                    }>;
                }, import("zod/v4/core").$strip>;
                metadata: {
                    openapi: {
                        operationId: string;
                        description: string;
                        responses: {
                            200: {
                                description: string;
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "string";
                                        };
                                    };
                                };
                            };
                        };
                    };
                };
            }, string>;
            getVerificationOTP: import("better-auth/*").StrictEndpoint<string, {
                method: "GET";
                query: import("better-auth/*").ZodObject<{
                    email: import("better-auth/*").ZodString;
                    type: import("better-auth/*").ZodEnum<{
                        "sign-in": "sign-in";
                        "change-email": "change-email";
                        "email-verification": "email-verification";
                        "forget-password": "forget-password";
                    }>;
                }, import("zod/v4/core").$strip>;
                metadata: {
                    openapi: {
                        operationId: string;
                        description: string;
                        responses: {
                            "200": {
                                description: string;
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "object";
                                            properties: {
                                                otp: {
                                                    type: string;
                                                    nullable: boolean;
                                                    description: string;
                                                };
                                            };
                                            required: string[];
                                        };
                                    };
                                };
                            };
                        };
                    };
                };
            }, {
                otp: null;
            } | {
                otp: string;
            }>;
            checkVerificationOTP: import("better-auth/*").StrictEndpoint<"/email-otp/check-verification-otp", {
                method: "POST";
                body: import("better-auth/*").ZodObject<{
                    email: import("better-auth/*").ZodString;
                    type: import("better-auth/*").ZodEnum<{
                        "sign-in": "sign-in";
                        "change-email": "change-email";
                        "email-verification": "email-verification";
                        "forget-password": "forget-password";
                    }>;
                    otp: import("better-auth/*").ZodString;
                }, import("zod/v4/core").$strip>;
                metadata: {
                    openapi: {
                        operationId: string;
                        description: string;
                        responses: {
                            200: {
                                description: string;
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "object";
                                            properties: {
                                                success: {
                                                    type: string;
                                                };
                                            };
                                        };
                                    };
                                };
                            };
                        };
                    };
                };
            }, {
                success: boolean;
            }>;
            verifyEmailOTP: import("better-auth/*").StrictEndpoint<"/email-otp/verify-email", {
                method: "POST";
                body: import("better-auth/*").ZodObject<{
                    email: import("better-auth/*").ZodString;
                    otp: import("better-auth/*").ZodString;
                }, import("zod/v4/core").$strip>;
                metadata: {
                    openapi: {
                        description: string;
                        responses: {
                            200: {
                                description: string;
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "object";
                                            properties: {
                                                status: {
                                                    type: string;
                                                    description: string;
                                                    enum: boolean[];
                                                };
                                                token: {
                                                    type: string;
                                                    nullable: boolean;
                                                    description: string;
                                                };
                                                user: {
                                                    $ref: string;
                                                };
                                            };
                                            required: string[];
                                        };
                                    };
                                };
                            };
                        };
                    };
                };
            }, {
                status: boolean;
                token: string;
                user: {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    email: string;
                    emailVerified: boolean;
                    name: string;
                    image?: string | null | undefined;
                } & Record<string, any>;
            } | {
                status: boolean;
                token: null;
                user: {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    email: string;
                    emailVerified: boolean;
                    name: string;
                    image?: string | null | undefined;
                } & Record<string, any>;
            }>;
            signInEmailOTP: import("better-auth/*").StrictEndpoint<"/sign-in/email-otp", {
                method: "POST";
                body: import("better-auth/*").ZodIntersection<import("better-auth/*").ZodObject<{
                    email: import("better-auth/*").ZodString;
                    otp: import("better-auth/*").ZodString;
                    name: import("better-auth/*").ZodOptional<import("better-auth/*").ZodString>;
                    image: import("better-auth/*").ZodOptional<import("better-auth/*").ZodString>;
                }, import("zod/v4/core").$strip>, import("better-auth/*").ZodRecord<import("better-auth/*").ZodString, import("better-auth/*").ZodAny>>;
                metadata: {
                    openapi: {
                        operationId: string;
                        description: string;
                        responses: {
                            200: {
                                description: string;
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "object";
                                            properties: {
                                                token: {
                                                    type: string;
                                                    description: string;
                                                };
                                                user: {
                                                    $ref: string;
                                                };
                                            };
                                            required: string[];
                                        };
                                    };
                                };
                            };
                        };
                    };
                };
            }, {
                token: string;
                user: {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    email: string;
                    emailVerified: boolean;
                    name: string;
                    image?: string | null | undefined;
                };
            }>;
            requestPasswordResetEmailOTP: import("better-auth/*").StrictEndpoint<"/email-otp/request-password-reset", {
                method: "POST";
                body: import("better-auth/*").ZodObject<{
                    email: import("better-auth/*").ZodString;
                }, import("zod/v4/core").$strip>;
                metadata: {
                    openapi: {
                        operationId: string;
                        description: string;
                        responses: {
                            200: {
                                description: string;
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "object";
                                            properties: {
                                                success: {
                                                    type: string;
                                                    description: string;
                                                };
                                            };
                                        };
                                    };
                                };
                            };
                        };
                    };
                };
            }, {
                success: boolean;
            }>;
            forgetPasswordEmailOTP: import("better-auth/*").StrictEndpoint<"/forget-password/email-otp", {
                method: "POST";
                body: import("better-auth/*").ZodObject<{
                    email: import("better-auth/*").ZodString;
                }, import("zod/v4/core").$strip>;
                metadata: {
                    openapi: {
                        operationId: string;
                        description: string;
                        responses: {
                            200: {
                                description: string;
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "object";
                                            properties: {
                                                success: {
                                                    type: string;
                                                    description: string;
                                                };
                                            };
                                        };
                                    };
                                };
                            };
                        };
                    };
                };
            }, {
                success: boolean;
            }>;
            resetPasswordEmailOTP: import("better-auth/*").StrictEndpoint<"/email-otp/reset-password", {
                method: "POST";
                body: import("better-auth/*").ZodObject<{
                    email: import("better-auth/*").ZodString;
                    otp: import("better-auth/*").ZodString;
                    password: import("better-auth/*").ZodString;
                }, import("zod/v4/core").$strip>;
                metadata: {
                    openapi: {
                        operationId: string;
                        description: string;
                        responses: {
                            200: {
                                description: string;
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "object";
                                            properties: {
                                                success: {
                                                    type: string;
                                                };
                                            };
                                        };
                                    };
                                };
                            };
                        };
                    };
                };
            }, {
                success: boolean;
            }>;
            requestEmailChangeEmailOTP: import("better-auth/*").StrictEndpoint<"/email-otp/request-email-change", {
                method: "POST";
                body: import("better-auth/*").ZodObject<{
                    newEmail: import("better-auth/*").ZodString;
                    otp: import("better-auth/*").ZodOptional<import("better-auth/*").ZodString>;
                }, import("zod/v4/core").$strip>;
                use: ((inputContext: import("better-auth/*").MiddlewareInputContext<import("better-auth/*").MiddlewareOptions>) => Promise<{
                    session: {
                        session: Record<string, any> & {
                            id: string;
                            createdAt: Date;
                            updatedAt: Date;
                            userId: string;
                            expiresAt: Date;
                            token: string;
                            ipAddress?: string | null | undefined;
                            userAgent?: string | null | undefined;
                        };
                        user: Record<string, any> & {
                            id: string;
                            createdAt: Date;
                            updatedAt: Date;
                            email: string;
                            emailVerified: boolean;
                            name: string;
                            image?: string | null | undefined;
                        };
                    };
                }>)[];
                metadata: {
                    openapi: {
                        operationId: string;
                        description: string;
                        responses: {
                            200: {
                                description: string;
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "object";
                                            properties: {
                                                success: {
                                                    type: string;
                                                };
                                            };
                                        };
                                    };
                                };
                            };
                        };
                    };
                };
            }, {
                success: boolean;
            }>;
            changeEmailEmailOTP: import("better-auth/*").StrictEndpoint<"/email-otp/change-email", {
                method: "POST";
                body: import("better-auth/*").ZodObject<{
                    newEmail: import("better-auth/*").ZodString;
                    otp: import("better-auth/*").ZodString;
                }, import("zod/v4/core").$strip>;
                use: ((inputContext: import("better-auth/*").MiddlewareInputContext<import("better-auth/*").MiddlewareOptions>) => Promise<{
                    session: {
                        session: Record<string, any> & {
                            id: string;
                            createdAt: Date;
                            updatedAt: Date;
                            userId: string;
                            expiresAt: Date;
                            token: string;
                            ipAddress?: string | null | undefined;
                            userAgent?: string | null | undefined;
                        };
                        user: Record<string, any> & {
                            id: string;
                            createdAt: Date;
                            updatedAt: Date;
                            email: string;
                            emailVerified: boolean;
                            name: string;
                            image?: string | null | undefined;
                        };
                    };
                }>)[];
                metadata: {
                    openapi: {
                        operationId: string;
                        description: string;
                        responses: {
                            200: {
                                description: string;
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "object";
                                            properties: {
                                                success: {
                                                    type: string;
                                                };
                                            };
                                        };
                                    };
                                };
                            };
                        };
                    };
                };
            }, {
                success: boolean;
            }>;
        };
        hooks: {
            after: {
                matcher(context: import("better-auth/*").HookEndpointContext): boolean;
                handler: (inputContext: import("better-auth/*").MiddlewareInputContext<import("better-auth/*").MiddlewareOptions>) => Promise<void>;
            }[];
        };
        rateLimit: ({
            pathMatcher(path: string): path is "/email-otp/send-verification-otp";
            window: number;
            max: number;
        } | {
            pathMatcher(path: string): path is "/email-otp/check-verification-otp";
            window: number;
            max: number;
        } | {
            pathMatcher(path: string): path is "/email-otp/verify-email";
            window: number;
            max: number;
        } | {
            pathMatcher(path: string): path is "/sign-in/email-otp";
            window: number;
            max: number;
        } | {
            pathMatcher(path: string): path is "/email-otp/request-password-reset";
            window: number;
            max: number;
        } | {
            pathMatcher(path: string): path is "/email-otp/reset-password";
            window: number;
            max: number;
        } | {
            pathMatcher(path: string): path is "/forget-password/email-otp";
            window: number;
            max: number;
        } | {
            pathMatcher(path: string): path is "/email-otp/request-email-change";
            window: number;
            max: number;
        } | {
            pathMatcher(path: string): path is "/email-otp/change-email";
            window: number;
            max: number;
        })[];
        options: import("better-auth/plugins").EmailOTPOptions;
        $ERROR_CODES: {
            OTP_EXPIRED: import("better-auth/*").RawError<"OTP_EXPIRED">;
            INVALID_OTP: import("better-auth/*").RawError<"INVALID_OTP">;
            TOO_MANY_ATTEMPTS: import("better-auth/*").RawError<"TOO_MANY_ATTEMPTS">;
        };
    }, {
        id: "organization";
        version: string;
        endpoints: import("better-auth/plugins").OrganizationEndpoints<import("better-auth/plugins").OrganizationOptions & {
            teams: {
                enabled: true;
            };
            dynamicAccessControl?: {
                enabled?: false | undefined;
            } | undefined;
        }> & import("better-auth/plugins").TeamEndpoints<import("better-auth/plugins").OrganizationOptions & {
            teams: {
                enabled: true;
            };
            dynamicAccessControl?: {
                enabled?: false | undefined;
            } | undefined;
        }>;
        schema: import("better-auth/plugins").OrganizationSchema<import("better-auth/plugins").OrganizationOptions & {
            teams: {
                enabled: true;
            };
            dynamicAccessControl?: {
                enabled?: false | undefined;
            } | undefined;
        }>;
        $Infer: {
            Organization: {
                id: string;
                name: string;
                slug: string;
                createdAt: Date;
                logo?: string | null | undefined;
                metadata?: any;
            };
            Invitation: {
                id: string;
                organizationId: string;
                email: string;
                role: "member" | "admin" | "owner";
                status: import("better-auth/plugins").InvitationStatus;
                inviterId: string;
                expiresAt: Date;
                createdAt: Date;
                teamId?: string | undefined | undefined;
            };
            Member: {
                id: string;
                organizationId: string;
                role: "member" | "admin" | "owner";
                createdAt: Date;
                userId: string;
                teamId?: string | undefined | undefined;
                user: {
                    id: string;
                    email: string;
                    name: string;
                    image?: string | undefined;
                };
            };
            Team: {
                id: string;
                name: string;
                organizationId: string;
                createdAt: Date;
                updatedAt?: Date | undefined;
            };
            TeamMember: {
                id: string;
                teamId: string;
                userId: string;
                createdAt: Date;
            };
            ActiveOrganization: {
                members: {
                    id: string;
                    organizationId: string;
                    role: "member" | "admin" | "owner";
                    createdAt: Date;
                    userId: string;
                    teamId?: string | undefined | undefined;
                    user: {
                        id: string;
                        email: string;
                        name: string;
                        image?: string | undefined;
                    };
                }[];
                invitations: {
                    id: string;
                    organizationId: string;
                    email: string;
                    role: "member" | "admin" | "owner";
                    status: import("better-auth/plugins").InvitationStatus;
                    inviterId: string;
                    expiresAt: Date;
                    createdAt: Date;
                    teamId?: string | undefined | undefined;
                }[];
                teams: {
                    id: string;
                    name: string;
                    organizationId: string;
                    createdAt: Date;
                    updatedAt?: Date | undefined;
                }[];
            } & {
                id: string;
                name: string;
                slug: string;
                createdAt: Date;
                logo?: string | null | undefined;
                metadata?: any;
            };
        };
        $ERROR_CODES: {
            YOU_ARE_NOT_ALLOWED_TO_CREATE_A_NEW_ORGANIZATION: import("better-auth/*").RawError<"YOU_ARE_NOT_ALLOWED_TO_CREATE_A_NEW_ORGANIZATION">;
            YOU_HAVE_REACHED_THE_MAXIMUM_NUMBER_OF_ORGANIZATIONS: import("better-auth/*").RawError<"YOU_HAVE_REACHED_THE_MAXIMUM_NUMBER_OF_ORGANIZATIONS">;
            ORGANIZATION_ALREADY_EXISTS: import("better-auth/*").RawError<"ORGANIZATION_ALREADY_EXISTS">;
            ORGANIZATION_SLUG_ALREADY_TAKEN: import("better-auth/*").RawError<"ORGANIZATION_SLUG_ALREADY_TAKEN">;
            ORGANIZATION_NOT_FOUND: import("better-auth/*").RawError<"ORGANIZATION_NOT_FOUND">;
            USER_IS_NOT_A_MEMBER_OF_THE_ORGANIZATION: import("better-auth/*").RawError<"USER_IS_NOT_A_MEMBER_OF_THE_ORGANIZATION">;
            YOU_ARE_NOT_ALLOWED_TO_UPDATE_THIS_ORGANIZATION: import("better-auth/*").RawError<"YOU_ARE_NOT_ALLOWED_TO_UPDATE_THIS_ORGANIZATION">;
            YOU_ARE_NOT_ALLOWED_TO_DELETE_THIS_ORGANIZATION: import("better-auth/*").RawError<"YOU_ARE_NOT_ALLOWED_TO_DELETE_THIS_ORGANIZATION">;
            NO_ACTIVE_ORGANIZATION: import("better-auth/*").RawError<"NO_ACTIVE_ORGANIZATION">;
            USER_IS_ALREADY_A_MEMBER_OF_THIS_ORGANIZATION: import("better-auth/*").RawError<"USER_IS_ALREADY_A_MEMBER_OF_THIS_ORGANIZATION">;
            MEMBER_NOT_FOUND: import("better-auth/*").RawError<"MEMBER_NOT_FOUND">;
            ROLE_NOT_FOUND: import("better-auth/*").RawError<"ROLE_NOT_FOUND">;
            YOU_ARE_NOT_ALLOWED_TO_CREATE_A_NEW_TEAM: import("better-auth/*").RawError<"YOU_ARE_NOT_ALLOWED_TO_CREATE_A_NEW_TEAM">;
            TEAM_ALREADY_EXISTS: import("better-auth/*").RawError<"TEAM_ALREADY_EXISTS">;
            TEAM_NOT_FOUND: import("better-auth/*").RawError<"TEAM_NOT_FOUND">;
            YOU_CANNOT_LEAVE_THE_ORGANIZATION_AS_THE_ONLY_OWNER: import("better-auth/*").RawError<"YOU_CANNOT_LEAVE_THE_ORGANIZATION_AS_THE_ONLY_OWNER">;
            YOU_CANNOT_LEAVE_THE_ORGANIZATION_WITHOUT_AN_OWNER: import("better-auth/*").RawError<"YOU_CANNOT_LEAVE_THE_ORGANIZATION_WITHOUT_AN_OWNER">;
            YOU_ARE_NOT_ALLOWED_TO_DELETE_THIS_MEMBER: import("better-auth/*").RawError<"YOU_ARE_NOT_ALLOWED_TO_DELETE_THIS_MEMBER">;
            YOU_ARE_NOT_ALLOWED_TO_INVITE_USERS_TO_THIS_ORGANIZATION: import("better-auth/*").RawError<"YOU_ARE_NOT_ALLOWED_TO_INVITE_USERS_TO_THIS_ORGANIZATION">;
            USER_IS_ALREADY_INVITED_TO_THIS_ORGANIZATION: import("better-auth/*").RawError<"USER_IS_ALREADY_INVITED_TO_THIS_ORGANIZATION">;
            INVITATION_NOT_FOUND: import("better-auth/*").RawError<"INVITATION_NOT_FOUND">;
            YOU_ARE_NOT_THE_RECIPIENT_OF_THE_INVITATION: import("better-auth/*").RawError<"YOU_ARE_NOT_THE_RECIPIENT_OF_THE_INVITATION">;
            EMAIL_VERIFICATION_REQUIRED_BEFORE_ACCEPTING_OR_REJECTING_INVITATION: import("better-auth/*").RawError<"EMAIL_VERIFICATION_REQUIRED_BEFORE_ACCEPTING_OR_REJECTING_INVITATION">;
            YOU_ARE_NOT_ALLOWED_TO_CANCEL_THIS_INVITATION: import("better-auth/*").RawError<"YOU_ARE_NOT_ALLOWED_TO_CANCEL_THIS_INVITATION">;
            INVITER_IS_NO_LONGER_A_MEMBER_OF_THE_ORGANIZATION: import("better-auth/*").RawError<"INVITER_IS_NO_LONGER_A_MEMBER_OF_THE_ORGANIZATION">;
            YOU_ARE_NOT_ALLOWED_TO_INVITE_USER_WITH_THIS_ROLE: import("better-auth/*").RawError<"YOU_ARE_NOT_ALLOWED_TO_INVITE_USER_WITH_THIS_ROLE">;
            FAILED_TO_RETRIEVE_INVITATION: import("better-auth/*").RawError<"FAILED_TO_RETRIEVE_INVITATION">;
            YOU_HAVE_REACHED_THE_MAXIMUM_NUMBER_OF_TEAMS: import("better-auth/*").RawError<"YOU_HAVE_REACHED_THE_MAXIMUM_NUMBER_OF_TEAMS">;
            UNABLE_TO_REMOVE_LAST_TEAM: import("better-auth/*").RawError<"UNABLE_TO_REMOVE_LAST_TEAM">;
            YOU_ARE_NOT_ALLOWED_TO_UPDATE_THIS_MEMBER: import("better-auth/*").RawError<"YOU_ARE_NOT_ALLOWED_TO_UPDATE_THIS_MEMBER">;
            ORGANIZATION_MEMBERSHIP_LIMIT_REACHED: import("better-auth/*").RawError<"ORGANIZATION_MEMBERSHIP_LIMIT_REACHED">;
            YOU_ARE_NOT_ALLOWED_TO_CREATE_TEAMS_IN_THIS_ORGANIZATION: import("better-auth/*").RawError<"YOU_ARE_NOT_ALLOWED_TO_CREATE_TEAMS_IN_THIS_ORGANIZATION">;
            YOU_ARE_NOT_ALLOWED_TO_DELETE_TEAMS_IN_THIS_ORGANIZATION: import("better-auth/*").RawError<"YOU_ARE_NOT_ALLOWED_TO_DELETE_TEAMS_IN_THIS_ORGANIZATION">;
            YOU_ARE_NOT_ALLOWED_TO_UPDATE_THIS_TEAM: import("better-auth/*").RawError<"YOU_ARE_NOT_ALLOWED_TO_UPDATE_THIS_TEAM">;
            YOU_ARE_NOT_ALLOWED_TO_DELETE_THIS_TEAM: import("better-auth/*").RawError<"YOU_ARE_NOT_ALLOWED_TO_DELETE_THIS_TEAM">;
            INVITATION_LIMIT_REACHED: import("better-auth/*").RawError<"INVITATION_LIMIT_REACHED">;
            TEAM_MEMBER_LIMIT_REACHED: import("better-auth/*").RawError<"TEAM_MEMBER_LIMIT_REACHED">;
            USER_IS_NOT_A_MEMBER_OF_THE_TEAM: import("better-auth/*").RawError<"USER_IS_NOT_A_MEMBER_OF_THE_TEAM">;
            YOU_CAN_NOT_ACCESS_THE_MEMBERS_OF_THIS_TEAM: import("better-auth/*").RawError<"YOU_CAN_NOT_ACCESS_THE_MEMBERS_OF_THIS_TEAM">;
            YOU_DO_NOT_HAVE_AN_ACTIVE_TEAM: import("better-auth/*").RawError<"YOU_DO_NOT_HAVE_AN_ACTIVE_TEAM">;
            YOU_ARE_NOT_ALLOWED_TO_CREATE_A_NEW_TEAM_MEMBER: import("better-auth/*").RawError<"YOU_ARE_NOT_ALLOWED_TO_CREATE_A_NEW_TEAM_MEMBER">;
            YOU_ARE_NOT_ALLOWED_TO_REMOVE_A_TEAM_MEMBER: import("better-auth/*").RawError<"YOU_ARE_NOT_ALLOWED_TO_REMOVE_A_TEAM_MEMBER">;
            YOU_ARE_NOT_ALLOWED_TO_ACCESS_THIS_ORGANIZATION: import("better-auth/*").RawError<"YOU_ARE_NOT_ALLOWED_TO_ACCESS_THIS_ORGANIZATION">;
            YOU_ARE_NOT_A_MEMBER_OF_THIS_ORGANIZATION: import("better-auth/*").RawError<"YOU_ARE_NOT_A_MEMBER_OF_THIS_ORGANIZATION">;
            MISSING_AC_INSTANCE: import("better-auth/*").RawError<"MISSING_AC_INSTANCE">;
            YOU_MUST_BE_IN_AN_ORGANIZATION_TO_CREATE_A_ROLE: import("better-auth/*").RawError<"YOU_MUST_BE_IN_AN_ORGANIZATION_TO_CREATE_A_ROLE">;
            YOU_ARE_NOT_ALLOWED_TO_CREATE_A_ROLE: import("better-auth/*").RawError<"YOU_ARE_NOT_ALLOWED_TO_CREATE_A_ROLE">;
            YOU_ARE_NOT_ALLOWED_TO_UPDATE_A_ROLE: import("better-auth/*").RawError<"YOU_ARE_NOT_ALLOWED_TO_UPDATE_A_ROLE">;
            YOU_ARE_NOT_ALLOWED_TO_DELETE_A_ROLE: import("better-auth/*").RawError<"YOU_ARE_NOT_ALLOWED_TO_DELETE_A_ROLE">;
            YOU_ARE_NOT_ALLOWED_TO_READ_A_ROLE: import("better-auth/*").RawError<"YOU_ARE_NOT_ALLOWED_TO_READ_A_ROLE">;
            YOU_ARE_NOT_ALLOWED_TO_LIST_A_ROLE: import("better-auth/*").RawError<"YOU_ARE_NOT_ALLOWED_TO_LIST_A_ROLE">;
            YOU_ARE_NOT_ALLOWED_TO_GET_A_ROLE: import("better-auth/*").RawError<"YOU_ARE_NOT_ALLOWED_TO_GET_A_ROLE">;
            TOO_MANY_ROLES: import("better-auth/*").RawError<"TOO_MANY_ROLES">;
            INVALID_RESOURCE: import("better-auth/*").RawError<"INVALID_RESOURCE">;
            ROLE_NAME_IS_ALREADY_TAKEN: import("better-auth/*").RawError<"ROLE_NAME_IS_ALREADY_TAKEN">;
            CANNOT_DELETE_A_PRE_DEFINED_ROLE: import("better-auth/*").RawError<"CANNOT_DELETE_A_PRE_DEFINED_ROLE">;
            ROLE_IS_ASSIGNED_TO_MEMBERS: import("better-auth/*").RawError<"ROLE_IS_ASSIGNED_TO_MEMBERS">;
        };
        options: NoInfer<import("better-auth/plugins").OrganizationOptions & {
            teams: {
                enabled: true;
            };
            dynamicAccessControl?: {
                enabled?: false | undefined;
            } | undefined;
        }>;
    }, {
        id: "expo";
        version: string;
        init: (ctx: import("better-auth/*").AuthContext) => {
            options: {
                trustedOrigins: string[];
            };
        };
        onRequest(request: Request, ctx: import("better-auth/*").AuthContext): Promise<{
            request: Request;
        } | undefined>;
        hooks: {
            after: {
                matcher(context: import("better-auth/*").HookEndpointContext): boolean;
                handler: (inputContext: import("better-auth/*").MiddlewareInputContext<import("better-auth/*").MiddlewareOptions>) => Promise<void>;
            }[];
        };
        endpoints: {
            expoAuthorizationProxy: import("better-auth/*").StrictEndpoint<"/expo-authorization-proxy", {
                method: "GET";
                query: import("better-auth/*").ZodObject<{
                    authorizationURL: import("better-auth/*").ZodString;
                    oauthState: import("better-auth/*").ZodOptional<import("better-auth/*").ZodString>;
                }, import("zod/v4/core").$strip>;
                metadata: {
                    readonly scope: "server";
                };
            }, {
                status: ("OK" | "CREATED" | "ACCEPTED" | "NO_CONTENT" | "MULTIPLE_CHOICES" | "MOVED_PERMANENTLY" | "FOUND" | "SEE_OTHER" | "NOT_MODIFIED" | "TEMPORARY_REDIRECT" | "BAD_REQUEST" | "UNAUTHORIZED" | "PAYMENT_REQUIRED" | "FORBIDDEN" | "NOT_FOUND" | "METHOD_NOT_ALLOWED" | "NOT_ACCEPTABLE" | "PROXY_AUTHENTICATION_REQUIRED" | "REQUEST_TIMEOUT" | "CONFLICT" | "GONE" | "LENGTH_REQUIRED" | "PRECONDITION_FAILED" | "PAYLOAD_TOO_LARGE" | "URI_TOO_LONG" | "UNSUPPORTED_MEDIA_TYPE" | "RANGE_NOT_SATISFIABLE" | "EXPECTATION_FAILED" | "I'M_A_TEAPOT" | "MISDIRECTED_REQUEST" | "UNPROCESSABLE_ENTITY" | "LOCKED" | "FAILED_DEPENDENCY" | "TOO_EARLY" | "UPGRADE_REQUIRED" | "PRECONDITION_REQUIRED" | "TOO_MANY_REQUESTS" | "REQUEST_HEADER_FIELDS_TOO_LARGE" | "UNAVAILABLE_FOR_LEGAL_REASONS" | "INTERNAL_SERVER_ERROR" | "NOT_IMPLEMENTED" | "BAD_GATEWAY" | "SERVICE_UNAVAILABLE" | "GATEWAY_TIMEOUT" | "HTTP_VERSION_NOT_SUPPORTED" | "VARIANT_ALSO_NEGOTIATES" | "INSUFFICIENT_STORAGE" | "LOOP_DETECTED" | "NOT_EXTENDED" | "NETWORK_AUTHENTICATION_REQUIRED") | import("better-auth/*").Status;
                body: ({
                    message?: string;
                    code?: string;
                    cause?: unknown;
                } & Record<string, any>) | undefined;
                headers: HeadersInit;
                statusCode: number;
                name: string;
                message: string;
                stack?: string;
                cause?: unknown;
            }>;
        };
        options: import("@better-auth/expo/*").ExpoOptions | undefined;
    }];
    trustedOrigins: string[];
    rateLimit: {
        enabled: boolean;
        window: number;
        max: number;
    };
    user: {
        additionalFields: {
            phone: {
                type: "string";
                required: false;
            };
            bio: {
                type: "string";
                required: false;
            };
        };
        changeEmail: {
            enabled: true;
            updateEmailWithoutVerification: true;
            sendChangeEmailConfirmation({ newEmail, url }: {
                newEmail: string;
                url: string;
            }): Promise<void>;
        };
    };
    advanced: {
        useSecureCookies: true;
        defaultCookieAttributes: {
            httpOnly: true;
            secure: true;
            sameSite: "none";
        };
    };
}>;
export declare const OpenAPI: {
    readonly getPaths: (prefix?: string) => Promise<any>;
    readonly components: Promise<any>;
};
