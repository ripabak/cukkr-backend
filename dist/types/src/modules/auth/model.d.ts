import { Static } from 'elysia';
declare const PhoneSendOtpBody: import("@sinclair/typebox").TObject<{
    step: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"old">, import("@sinclair/typebox").TLiteral<"new">]>;
    phone: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
}>;
declare const PhoneVerifyOtpBody: import("@sinclair/typebox").TObject<{
    step: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"old">, import("@sinclair/typebox").TLiteral<"new">]>;
    otp: import("@sinclair/typebox").TString;
}>;
export declare namespace AuthModel {
    type PhoneSendOtpBody = Static<typeof PhoneSendOtpBody>;
    type PhoneVerifyOtpBody = Static<typeof PhoneVerifyOtpBody>;
    const Schemas: {
        PhoneSendOtpBody: import("@sinclair/typebox").TObject<{
            step: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"old">, import("@sinclair/typebox").TLiteral<"new">]>;
            phone: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        }>;
        PhoneVerifyOtpBody: import("@sinclair/typebox").TObject<{
            step: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"old">, import("@sinclair/typebox").TLiteral<"new">]>;
            otp: import("@sinclair/typebox").TString;
        }>;
    };
}
export {};
