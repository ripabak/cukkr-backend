import type { PublicModel } from './model';
export declare abstract class PublicService {
    static getWalkInFormData(slug: string): Promise<PublicModel.WalkInFormDataResponse>;
    static getPublicBarbershop(slug: string): Promise<PublicModel.PublicBarbershopResponse>;
    static getAvailability(slug: string, date: string): Promise<PublicModel.PublicAvailabilityResponse>;
    static createPublicAppointment(slug: string, input: PublicModel.PublicAppointmentCreateInput): Promise<PublicModel.PublicAppointmentCreatedResponse>;
}
