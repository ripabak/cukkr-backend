import { BookingModel } from './model';
export declare abstract class BookingService {
    private static createBookingNotifications;
    private static toWibDate;
    private static getWibDateKey;
    private static getWibDayOfWeek;
    private static getWibTime;
    private static buildDayRange;
    private static normalizePhone;
    private static normalizeEmail;
    private static calculateDiscountedPrice;
    private static validateBarberAssignment;
    private static validateServices;
    private static validateScheduledAt;
    static validateOpenHours(organizationId: string, scheduledAt: Date): Promise<void>;
    private static validateStatusTransition;
    private static checkSingleInProgress;
    private static buildStatusUpdate;
    private static mapBarber;
    private static mapSummary;
    private static mapDetail;
    static listBookings(organizationId: string, query: BookingModel.BookingListQuery): Promise<BookingModel.BookingSummaryResponse[]>;
    static createBooking(organizationId: string, createdById: string, input: BookingModel.BookingCreateInput): Promise<BookingModel.BookingDetailResponse>;
    static getBooking(organizationId: string, id: string): Promise<BookingModel.BookingDetailResponse>;
    static updateBookingStatus(organizationId: string, id: string, input: BookingModel.BookingStatusUpdateInput): Promise<BookingModel.BookingDetailResponse>;
    static acceptBooking(organizationId: string, id: string): Promise<BookingModel.BookingDetailResponse>;
    static declineBooking(organizationId: string, id: string, input: BookingModel.BookingDeclineInput): Promise<BookingModel.BookingDetailResponse>;
    static reassignBooking(organizationId: string, id: string, input: BookingModel.BookingReassignInput): Promise<BookingModel.BookingDetailResponse>;
}
