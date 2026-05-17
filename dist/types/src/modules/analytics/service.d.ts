import { AnalyticsModel } from './model';
type AnalyticsRange = AnalyticsModel.AnalyticsRange;
type AnalyticsResponse = AnalyticsModel.AnalyticsResponse;
export declare abstract class AnalyticsService {
    private static queryAggregates;
    private static queryChartBuckets;
    private static queryTopBarber;
    private static queryTopService;
    private static computeStatCard;
    static getAnalytics(organizationId: string, range: AnalyticsRange): Promise<AnalyticsResponse>;
}
export {};
