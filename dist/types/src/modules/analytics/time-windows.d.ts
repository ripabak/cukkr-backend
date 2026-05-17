import { AnalyticsModel } from './model';
export type AnalyticsRange = AnalyticsModel.AnalyticsRange;
export interface BucketDef {
    label: string;
    start: Date;
    end: Date;
}
export interface TimeWindows {
    currentStart: Date;
    currentEnd: Date;
    previousStart: Date;
    previousEnd: Date;
    buckets: BucketDef[];
}
export declare function buildTimeWindows(range: AnalyticsRange, now: Date, timezone: string): TimeWindows;
