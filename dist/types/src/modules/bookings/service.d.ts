import { BookingModel } from './model';
export declare abstract class BookingService {
    private static buildDayRange;
    private static normalizePhone;
    private static normalizeEmail;
    private static calculateDiscountedPrice;
    private static validateBarberAssignment;
    private static validateServices;
    private static validateScheduledAt;
    static validateOpenHours(organizationId: string, scheduledAt: Date, timezone?: string): Promise<void>;
    private static validateStatusTransition;
    private static checkSingleInProgress;
    private static buildStatusUpdate;
    private static mapBarber;
    private static mapSummary;
    private static mapDetail;
    static listBookings(organizationId: string, query: BookingModel.BookingListQuery): Promise<BookingModel.BookingSummaryResponse[]>;
    static listRequestedBookings(organizationId: string, query: BookingModel.BookingRequestListQuery): Promise<BookingModel.BookingSummaryResponse[]>;
    private static doCreateBooking;
    static createBooking(organizationId: string, createdById: string, input: BookingModel.BookingCreateInput): Promise<BookingModel.BookingDetailResponse>;
    static createAppointmentRequest(organizationId: string, createdById: string, input: BookingModel.AppointmentBookingCreateInput): Promise<BookingModel.BookingDetailResponse>;
    static getBooking(organizationId: string, id: string): Promise<BookingModel.BookingDetailResponse>;
    static getInProgressBooking(organizationId: string, userId: string): Promise<BookingModel.BookingDetailResponse | null>;
    static updateBookingStatus(organizationId: string, id: string, input: BookingModel.BookingStatusUpdateInput, userId: string): Promise<BookingModel.BookingDetailResponse>;
    static acceptBooking(organizationId: string, id: string): Promise<BookingModel.BookingDetailResponse>;
    static declineBooking(organizationId: string, id: string, input: BookingModel.BookingDeclineInput): Promise<BookingModel.BookingDetailResponse>;
    static reassignBooking(organizationId: string, id: string, input: BookingModel.BookingReassignInput): Promise<BookingModel.BookingDetailResponse>;
    static getHomeSummary(organizationId: string, query: BookingModel.BookingHomeSummaryQuery): Promise<BookingModel.BookingHomeSummaryResponse>;
}
