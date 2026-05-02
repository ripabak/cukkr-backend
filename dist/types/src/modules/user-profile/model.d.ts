export declare namespace UserProfileModel {
    const UpdateProfileInput: import("@sinclair/typebox").TObject<{
        name: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        bio: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>>;
    }>;
    type UpdateProfileInput = typeof UpdateProfileInput.static;
    const AvatarUploadInput: import("@sinclair/typebox").TObject<{
        file: import("@sinclair/typebox").TUnsafe<File>;
    }>;
    type AvatarUploadInput = typeof AvatarUploadInput.static;
    const ChangePhoneInput: import("@sinclair/typebox").TObject<{
        phone: import("@sinclair/typebox").TString;
    }>;
    type ChangePhoneInput = typeof ChangePhoneInput.static;
    const VerifyPhoneInput: import("@sinclair/typebox").TObject<{
        phone: import("@sinclair/typebox").TString;
        otp: import("@sinclair/typebox").TString;
    }>;
    type VerifyPhoneInput = typeof VerifyPhoneInput.static;
    const UserProfileResponse: import("@sinclair/typebox").TObject<{
        id: import("@sinclair/typebox").TString;
        name: import("@sinclair/typebox").TString;
        bio: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>;
        avatarUrl: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>;
        email: import("@sinclair/typebox").TString;
        phone: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>;
        emailVerified: import("@sinclair/typebox").TBoolean;
        role: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>;
        createdAt: import("@sinclair/typebox").TDate;
        updatedAt: import("@sinclair/typebox").TDate;
    }>;
    type UserProfileResponse = typeof UserProfileResponse.static;
    const AvatarUploadResponse: import("@sinclair/typebox").TObject<{
        avatarUrl: import("@sinclair/typebox").TString;
    }>;
    type AvatarUploadResponse = typeof AvatarUploadResponse.static;
    const ChangePhoneResponse: import("@sinclair/typebox").TObject<{
        message: import("@sinclair/typebox").TString;
    }>;
    type ChangePhoneResponse = typeof ChangePhoneResponse.static;
}
