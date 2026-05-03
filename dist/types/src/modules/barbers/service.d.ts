import { BarberModel } from './model';
export declare abstract class BarberService {
    private static toBarberListItem;
    static listBarbers(organizationId: string, search?: string): Promise<BarberModel.BarberListItem[]>;
}
