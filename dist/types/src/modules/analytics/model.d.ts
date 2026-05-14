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
    const ChartPointSchema: import("@sinclair/typebox").TObject<{
        label: import("@sinclair/typebox").TString;
        value: import("@sinclair/typebox").TNumber;
    }>;
    type ChartPoint = typeof ChartPointSchema.static;
    const HighlightItemSchema: import("@sinclair/typebox").TObject<{
        id: import("@sinclair/typebox").TString;
        name: import("@sinclair/typebox").TString;
        imageUrl: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>;
        count: import("@sinclair/typebox").TNumber;
        revenue: import("@sinclair/typebox").TNumber;
    }>;
    type HighlightItem = typeof HighlightItemSchema.static;
    const RevenueStatsSchema: import("@sinclair/typebox").TObject<{
        range: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"24h">, import("@sinclair/typebox").TLiteral<"week">, import("@sinclair/typebox").TLiteral<"month">, import("@sinclair/typebox").TLiteral<"6m">, import("@sinclair/typebox").TLiteral<"1y">]>;
        stats: import("@sinclair/typebox").TObject<{
            totalBookings: import("@sinclair/typebox").TObject<{
                current: import("@sinclair/typebox").TNumber;
                previous: import("@sinclair/typebox").TNumber;
                change: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TNumber, import("@sinclair/typebox").TNull]>;
                direction: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"up">, import("@sinclair/typebox").TLiteral<"down">, import("@sinclair/typebox").TLiteral<"neutral">]>;
            }>;
            avgRevenuePerBooking: import("@sinclair/typebox").TObject<{
                current: import("@sinclair/typebox").TNumber;
                previous: import("@sinclair/typebox").TNumber;
                change: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TNumber, import("@sinclair/typebox").TNull]>;
                direction: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"up">, import("@sinclair/typebox").TLiteral<"down">, import("@sinclair/typebox").TLiteral<"neutral">]>;
            }>;
            avgTime: import("@sinclair/typebox").TObject<{
                current: import("@sinclair/typebox").TNumber;
                previous: import("@sinclair/typebox").TNumber;
                change: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TNumber, import("@sinclair/typebox").TNull]>;
                direction: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"up">, import("@sinclair/typebox").TLiteral<"down">, import("@sinclair/typebox").TLiteral<"neutral">]>;
            }>;
        }>;
        chart: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TObject<{
            label: import("@sinclair/typebox").TString;
            value: import("@sinclair/typebox").TNumber;
        }>>;
    }>;
    type RevenueStats = typeof RevenueStatsSchema.static;
    const BookingTypeFilterEnum: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"all">, import("@sinclair/typebox").TLiteral<"walk_in">, import("@sinclair/typebox").TLiteral<"appointment">]>;
    type BookingTypeFilter = typeof BookingTypeFilterEnum.static;
    const RevenueBookingItemSchema: import("@sinclair/typebox").TObject<{
        bookingId: import("@sinclair/typebox").TString;
        customerId: import("@sinclair/typebox").TString;
        customerName: import("@sinclair/typebox").TString;
        completedAt: import("@sinclair/typebox").TString;
        type: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"walk_in">, import("@sinclair/typebox").TLiteral<"appointment">]>;
        services: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>;
        revenue: import("@sinclair/typebox").TNumber;
    }>;
    type RevenueBookingItem = typeof RevenueBookingItemSchema.static;
    const CustomerAnalyticsStatsSchema: import("@sinclair/typebox").TObject<{
        range: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"24h">, import("@sinclair/typebox").TLiteral<"week">, import("@sinclair/typebox").TLiteral<"month">, import("@sinclair/typebox").TLiteral<"6m">, import("@sinclair/typebox").TLiteral<"1y">]>;
        stats: import("@sinclair/typebox").TObject<{
            totalCustomers: import("@sinclair/typebox").TObject<{
                current: import("@sinclair/typebox").TNumber;
                previous: import("@sinclair/typebox").TNumber;
                change: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TNumber, import("@sinclair/typebox").TNull]>;
                direction: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"up">, import("@sinclair/typebox").TLiteral<"down">, import("@sinclair/typebox").TLiteral<"neutral">]>;
            }>;
            totalWalkIn: import("@sinclair/typebox").TObject<{
                current: import("@sinclair/typebox").TNumber;
                previous: import("@sinclair/typebox").TNumber;
                change: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TNumber, import("@sinclair/typebox").TNull]>;
                direction: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"up">, import("@sinclair/typebox").TLiteral<"down">, import("@sinclair/typebox").TLiteral<"neutral">]>;
            }>;
            totalAppointment: import("@sinclair/typebox").TObject<{
                current: import("@sinclair/typebox").TNumber;
                previous: import("@sinclair/typebox").TNumber;
                change: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TNumber, import("@sinclair/typebox").TNull]>;
                direction: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"up">, import("@sinclair/typebox").TLiteral<"down">, import("@sinclair/typebox").TLiteral<"neutral">]>;
            }>;
            totalNew: import("@sinclair/typebox").TObject<{
                current: import("@sinclair/typebox").TNumber;
                previous: import("@sinclair/typebox").TNumber;
                change: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TNumber, import("@sinclair/typebox").TNull]>;
                direction: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"up">, import("@sinclair/typebox").TLiteral<"down">, import("@sinclair/typebox").TLiteral<"neutral">]>;
            }>;
            totalReturn: import("@sinclair/typebox").TObject<{
                current: import("@sinclair/typebox").TNumber;
                previous: import("@sinclair/typebox").TNumber;
                change: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TNumber, import("@sinclair/typebox").TNull]>;
                direction: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"up">, import("@sinclair/typebox").TLiteral<"down">, import("@sinclair/typebox").TLiteral<"neutral">]>;
            }>;
        }>;
        chart: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TObject<{
            label: import("@sinclair/typebox").TString;
            value: import("@sinclair/typebox").TNumber;
        }>>;
    }>;
    type CustomerAnalyticsStats = typeof CustomerAnalyticsStatsSchema.static;
    const CustomerStatusFilterEnum: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"all">, import("@sinclair/typebox").TLiteral<"new">, import("@sinclair/typebox").TLiteral<"return">]>;
    type CustomerStatusFilter = typeof CustomerStatusFilterEnum.static;
    const CustomerAnalyticsListItemSchema: import("@sinclair/typebox").TObject<{
        customerId: import("@sinclair/typebox").TString;
        customerName: import("@sinclair/typebox").TString;
        totalVisits: import("@sinclair/typebox").TNumber;
        lastVisitDate: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>;
        status: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"new">, import("@sinclair/typebox").TLiteral<"return">]>;
        totalRevenue: import("@sinclair/typebox").TNumber;
    }>;
    type CustomerAnalyticsListItem = typeof CustomerAnalyticsListItemSchema.static;
    const BarberChartItemSchema: import("@sinclair/typebox").TObject<{
        barberId: import("@sinclair/typebox").TString;
        barberName: import("@sinclair/typebox").TString;
        value: import("@sinclair/typebox").TNumber;
    }>;
    type BarberChartItem = typeof BarberChartItemSchema.static;
    const BarberListItemSchema: import("@sinclair/typebox").TObject<{
        barberId: import("@sinclair/typebox").TString;
        name: import("@sinclair/typebox").TString;
        imageUrl: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>;
        totalCustomers: import("@sinclair/typebox").TNumber;
        totalRevenue: import("@sinclair/typebox").TNumber;
    }>;
    type BarberListItem = typeof BarberListItemSchema.static;
    const BarberAnalyticsResponseSchema: import("@sinclair/typebox").TObject<{
        chart: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TObject<{
            barberId: import("@sinclair/typebox").TString;
            barberName: import("@sinclair/typebox").TString;
            value: import("@sinclair/typebox").TNumber;
        }>>;
    }>;
    type BarberAnalyticsResponse = typeof BarberAnalyticsResponseSchema.static;
    const ServiceAnalyticsStatsSchema: import("@sinclair/typebox").TObject<{
        range: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"24h">, import("@sinclair/typebox").TLiteral<"week">, import("@sinclair/typebox").TLiteral<"month">, import("@sinclair/typebox").TLiteral<"6m">, import("@sinclair/typebox").TLiteral<"1y">]>;
        stats: import("@sinclair/typebox").TObject<{
            totalBookings: import("@sinclair/typebox").TObject<{
                current: import("@sinclair/typebox").TNumber;
                previous: import("@sinclair/typebox").TNumber;
                change: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TNumber, import("@sinclair/typebox").TNull]>;
                direction: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"up">, import("@sinclair/typebox").TLiteral<"down">, import("@sinclair/typebox").TLiteral<"neutral">]>;
            }>;
            totalRevenue: import("@sinclair/typebox").TObject<{
                current: import("@sinclair/typebox").TNumber;
                previous: import("@sinclair/typebox").TNumber;
                change: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TNumber, import("@sinclair/typebox").TNull]>;
                direction: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"up">, import("@sinclair/typebox").TLiteral<"down">, import("@sinclair/typebox").TLiteral<"neutral">]>;
            }>;
        }>;
        chart: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TObject<{
            label: import("@sinclair/typebox").TString;
            value: import("@sinclair/typebox").TNumber;
        }>>;
    }>;
    type ServiceAnalyticsStats = typeof ServiceAnalyticsStatsSchema.static;
    const ServiceListItemSchema: import("@sinclair/typebox").TObject<{
        serviceId: import("@sinclair/typebox").TString;
        serviceName: import("@sinclair/typebox").TString;
        totalBookings: import("@sinclair/typebox").TNumber;
        percentage: import("@sinclair/typebox").TNumber;
        revenue: import("@sinclair/typebox").TNumber;
    }>;
    type ServiceListItem = typeof ServiceListItemSchema.static;
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
            totalCustomers: import("@sinclair/typebox").TObject<{
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
            revenue: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TObject<{
                label: import("@sinclair/typebox").TString;
                value: import("@sinclair/typebox").TNumber;
            }>>;
            customers: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TObject<{
                label: import("@sinclair/typebox").TString;
                value: import("@sinclair/typebox").TNumber;
            }>>;
        }>;
        highlights: import("@sinclair/typebox").TObject<{
            topBarber: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TObject<{
                id: import("@sinclair/typebox").TString;
                name: import("@sinclair/typebox").TString;
                imageUrl: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>;
                count: import("@sinclair/typebox").TNumber;
                revenue: import("@sinclair/typebox").TNumber;
            }>, import("@sinclair/typebox").TNull]>;
            topService: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TObject<{
                id: import("@sinclair/typebox").TString;
                name: import("@sinclair/typebox").TString;
                imageUrl: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>;
                count: import("@sinclair/typebox").TNumber;
                revenue: import("@sinclair/typebox").TNumber;
            }>, import("@sinclair/typebox").TNull]>;
        }>;
    }>;
    type AnalyticsResponse = typeof AnalyticsResponseSchema.static;
}
