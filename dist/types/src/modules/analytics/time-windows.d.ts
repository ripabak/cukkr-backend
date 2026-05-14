import { AnalyticsModel } from './model';
export type AnalyticsRange = AnalyticsModel.AnalyticsRange;
export declare const WIB_OFFSET_MS: number;
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
export declare function toWib(date: Date): Date;
export declare function buildTimeWindows(range: AnalyticsRange, now: Date): TimeWindows;
