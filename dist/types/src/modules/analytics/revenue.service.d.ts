import { PaginatedResult } from '../../core/pagination';
import { AnalyticsModel } from './model';
type AnalyticsRange = AnalyticsModel.AnalyticsRange;
type RevenueStats = AnalyticsModel.RevenueStats;
type RevenueBookingItem = AnalyticsModel.RevenueBookingItem;
type BookingTypeFilter = AnalyticsModel.BookingTypeFilter;
export declare abstract class RevenueAnalyticsService {
    static getRevenueStats(organizationId: string, range: AnalyticsRange): Promise<RevenueStats>;
    static getBookingsList(organizationId: string, range: AnalyticsRange, typeFilter: BookingTypeFilter, query: {
        page?: number;
        limit?: number;
    }): Promise<PaginatedResult<RevenueBookingItem>>;
}
export {};
