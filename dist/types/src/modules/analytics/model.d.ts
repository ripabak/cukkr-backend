export declare namespace AnalyticsModel {
    const AnalyticsRangeEnum: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"24h">, import("@sinclair/typebox").TLiteral<"week">, import("@sinclair/typebox").TLiteral<"month">, import("@sinclair/typebox").TLiteral<"6m">, import("@sinclair/typebox").TLiteral<"1y">]>;
    type AnalyticsRange = typeof AnalyticsRangeEnum.static;
    const AnalyticsQueryParam: import("@sinclair/typebox").TObject<{
        range: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"24h">, import("@sinclair/typebox").TLiteral<"week">, import("@sinclair/typebox").TLiteral<"month">, import("@sinclair/typebox").TLiteral<"6m">, import("@sinclair/typebox").TLiteral<"1y">]>;
    }>;
    type AnalyticsQueryParam = typeof AnalyticsQueryParam.static;
    const StatCardSchema: import("@sinclair/typebox").TObject<{
        current: import("@sinclair/typebox").TNumber;
        previous: import("@sinclair/typebox").TNumber;
        change: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TNumber, import("@sinclair/typebox").TNull]>;
        direction: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"up">, import("@sinclair/typebox").TLiteral<"down">, import("@sinclair/typebox").TLiteral<"neutral">]>;
    }>;
    type StatCard = typeof StatCardSchema.static;
    const ChartBucketSchema: import("@sinclair/typebox").TObject<{
        label: import("@sinclair/typebox").TString;
        sales: import("@sinclair/typebox").TNumber;
        bookings: import("@sinclair/typebox").TNumber;
    }>;
    type ChartBucket = typeof ChartBucketSchema.static;
    const AnalyticsResponseSchema: import("@sinclair/typebox").TObject<{
        range: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"24h">, import("@sinclair/typebox").TLiteral<"week">, import("@sinclair/typebox").TLiteral<"month">, import("@sinclair/typebox").TLiteral<"6m">, import("@sinclair/typebox").TLiteral<"1y">]>;
        stats: import("@sinclair/typebox").TObject<{
            totalSales: import("@sinclair/typebox").TObject<{
                current: import("@sinclair/typebox").TNumber;
                previous: import("@sinclair/typebox").TNumber;
                change: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TNumber, import("@sinclair/typebox").TNull]>;
                direction: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"up">, import("@sinclair/typebox").TLiteral<"down">, import("@sinclair/typebox").TLiteral<"neutral">]>;
            }>;
            totalBookings: import("@sinclair/typebox").TObject<{
                current: import("@sinclair/typebox").TNumber;
                previous: import("@sinclair/typebox").TNumber;
                change: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TNumber, import("@sinclair/typebox").TNull]>;
                direction: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"up">, import("@sinclair/typebox").TLiteral<"down">, import("@sinclair/typebox").TLiteral<"neutral">]>;
            }>;
            appointments: import("@sinclair/typebox").TObject<{
                current: import("@sinclair/typebox").TNumber;
                previous: import("@sinclair/typebox").TNumber;
                change: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TNumber, import("@sinclair/typebox").TNull]>;
                direction: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"up">, import("@sinclair/typebox").TLiteral<"down">, import("@sinclair/typebox").TLiteral<"neutral">]>;
            }>;
            walkIns: import("@sinclair/typebox").TObject<{
                current: import("@sinclair/typebox").TNumber;
                previous: import("@sinclair/typebox").TNumber;
                change: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TNumber, import("@sinclair/typebox").TNull]>;
                direction: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"up">, import("@sinclair/typebox").TLiteral<"down">, import("@sinclair/typebox").TLiteral<"neutral">]>;
            }>;
        }>;
        chart: import("@sinclair/typebox").TObject<{
            sales: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TObject<{
                label: import("@sinclair/typebox").TString;
                sales: import("@sinclair/typebox").TNumber;
                bookings: import("@sinclair/typebox").TNumber;
            }>>;
            bookings: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TObject<{
                label: import("@sinclair/typebox").TString;
                sales: import("@sinclair/typebox").TNumber;
                bookings: import("@sinclair/typebox").TNumber;
            }>>;
        }>;
    }>;
    type AnalyticsResponse = typeof AnalyticsResponseSchema.static;
}
