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
    const UserProfileResponse: import("@sinclair/typebox").TObject<{
        id: import("@sinclair/typebox").TString;
        name: import("@sinclair/typebox").TString;
        bio: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>;
        avatarUrl: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>;
        avatarThumb: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>;
        avatarMed: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>;
        avatarFull: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>;
        email: import("@sinclair/typebox").TString;
        emailVerified: import("@sinclair/typebox").TBoolean;
        role: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>;
        createdAt: import("@sinclair/typebox").TDate;
        updatedAt: import("@sinclair/typebox").TDate;
    }>;
    type UserProfileResponse = typeof UserProfileResponse.static;
    const AvatarUploadResponse: import("@sinclair/typebox").TObject<{
        avatarUrl: import("@sinclair/typebox").TString;
        avatarThumb: import("@sinclair/typebox").TString;
        avatarMed: import("@sinclair/typebox").TString;
        avatarFull: import("@sinclair/typebox").TString;
    }>;
    type AvatarUploadResponse = typeof AvatarUploadResponse.static;
}
