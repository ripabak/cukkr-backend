import { AnalyticsModel } from './model';
type AnalyticsRange = AnalyticsModel.AnalyticsRange;
type AnalyticsResponse = AnalyticsModel.AnalyticsResponse;
export declare abstract class AnalyticsService {
    private static toWib;
    private static startOfDayWib;
    private static startOfMonthWib;
    private static buildTimeWindows;
    private static queryAggregates;
    private static queryChartBuckets;
    private static computeStatCard;
    static getAnalytics(organizationId: string, range: AnalyticsRange): Promise<AnalyticsResponse>;
}
export {};
