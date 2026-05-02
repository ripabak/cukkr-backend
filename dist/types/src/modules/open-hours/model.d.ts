export declare namespace OpenHoursModel {
    const OpenHoursDay: import("@sinclair/typebox").TObject<{
        dayOfWeek: import("@sinclair/typebox").TInteger;
        isOpen: import("@sinclair/typebox").TBoolean;
        openTime: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>;
        closeTime: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>;
    }>;
    type OpenHoursDay = typeof OpenHoursDay.static;
    const OpenHoursWeekResponse: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TObject<{
        dayOfWeek: import("@sinclair/typebox").TInteger;
        isOpen: import("@sinclair/typebox").TBoolean;
        openTime: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>;
        closeTime: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>;
    }>>;
    type OpenHoursWeekResponse = typeof OpenHoursWeekResponse.static;
    const UpdateOpenHoursBody: import("@sinclair/typebox").TObject<{
        days: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TObject<{
            dayOfWeek: import("@sinclair/typebox").TInteger;
            isOpen: import("@sinclair/typebox").TBoolean;
            openTime: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>;
            closeTime: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>;
        }>>;
    }>;
    type UpdateOpenHoursBody = typeof UpdateOpenHoursBody.static;
    function validationErrorResponse(path: string, error: Error): Response;
}
