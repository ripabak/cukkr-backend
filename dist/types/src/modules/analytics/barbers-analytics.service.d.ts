import { AnalyticsModel } from './model';
type AnalyticsRange = AnalyticsModel.AnalyticsRange;
type BarberChartItem = AnalyticsModel.BarberChartItem;
type BarberListItem = AnalyticsModel.BarberListItem;
export declare abstract class BarberAnalyticsService {
    static getBarberChart(organizationId: string, range: AnalyticsRange): Promise<{
        chart: BarberChartItem[];
    }>;
    static getBarberList(organizationId: string, range: AnalyticsRange): Promise<BarberListItem[]>;
}
export {};
