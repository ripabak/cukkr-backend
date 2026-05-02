import { OpenHoursModel } from './model';
export declare abstract class OpenHoursService {
    static getWeeklySchedule(organizationId: string): Promise<OpenHoursModel.OpenHoursWeekResponse>;
    static getWeeklyScheduleForOrganization(organizationId: string): Promise<OpenHoursModel.OpenHoursWeekResponse>;
    static replaceWeeklySchedule(organizationId: string, userId: string, input: OpenHoursModel.UpdateOpenHoursBody): Promise<OpenHoursModel.OpenHoursWeekResponse>;
    private static ensureOwner;
    private static normalizeStoredRows;
    private static normalizeInputDays;
}
