import { BookingModel } from '../bookings/model';
import { WalkInPinModel } from './model';
export declare abstract class WalkInPinService {
    static resolveOrganizationBySlug(slug: string): Promise<string>;
    static generatePin(organizationId: string, userId: string): Promise<WalkInPinModel.GeneratePinResponse>;
    static getActivePinCount(organizationId: string): Promise<WalkInPinModel.ActiveCountResponse>;
    static validatePin(organizationId: string, pin: string, ip: string): Promise<WalkInPinModel.ValidatePinResponse>;
    static createWalkInBooking(organizationId: string, token: string, input: Omit<WalkInPinModel.WalkInBookingBody, 'validationToken'>): Promise<BookingModel.BookingDetailResponse>;
}
