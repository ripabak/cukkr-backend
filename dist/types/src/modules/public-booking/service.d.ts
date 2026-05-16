import type { BookingModel } from '../bookings/model';
import type { WalkInPinModel } from '../walk-in-pin/model';
import type { PublicBookingModel } from './model';
export declare abstract class PublicBookingService {
    static getFormData(slug: string): Promise<PublicBookingModel.FormDataResponse>;
    static validatePin(slug: string, pin: string, ip: string): Promise<WalkInPinModel.ValidatePinResponse>;
    static createWalkIn(slug: string, validationToken: string, input: Omit<WalkInPinModel.WalkInBookingBody, 'validationToken'>): Promise<BookingModel.BookingDetailResponse>;
    static createAppointment(slug: string, input: PublicBookingModel.AppointmentCreateInput): Promise<PublicBookingModel.AppointmentCreatedResponse>;
}
