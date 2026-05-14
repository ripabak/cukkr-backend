import { PaginatedResult } from '../../core/pagination';
import { AnalyticsModel } from './model';
type AnalyticsRange = AnalyticsModel.AnalyticsRange;
type CustomerAnalyticsStats = AnalyticsModel.CustomerAnalyticsStats;
type CustomerAnalyticsListItem = AnalyticsModel.CustomerAnalyticsListItem;
type CustomerStatusFilter = AnalyticsModel.CustomerStatusFilter;
export declare abstract class CustomerAnalyticsService {
    static getCustomerStats(organizationId: string, range: AnalyticsRange): Promise<CustomerAnalyticsStats>;
    static getCustomerList(organizationId: string, range: AnalyticsRange, status: CustomerStatusFilter, query: {
        page?: number;
        limit?: number;
    }): Promise<PaginatedResult<CustomerAnalyticsListItem>>;
}
export {};
