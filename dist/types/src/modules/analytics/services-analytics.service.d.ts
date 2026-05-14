import { PaginatedResult } from '../../core/pagination';
import { AnalyticsModel } from './model';
type AnalyticsRange = AnalyticsModel.AnalyticsRange;
type ServiceAnalyticsStats = AnalyticsModel.ServiceAnalyticsStats;
type ServiceListItem = AnalyticsModel.ServiceListItem;
export declare abstract class ServiceAnalyticsService {
    static getServiceStats(organizationId: string, range: AnalyticsRange): Promise<ServiceAnalyticsStats>;
    static getServiceList(organizationId: string, range: AnalyticsRange, query: {
        page?: number;
        limit?: number;
    }): Promise<PaginatedResult<ServiceListItem>>;
}
export {};
