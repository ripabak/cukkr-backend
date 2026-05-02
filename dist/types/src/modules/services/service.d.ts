import { ServiceModel } from './model';
export declare abstract class ServiceService {
    private static findInOrg;
    static listServices(organizationId: string, query: ServiceModel.ServiceListQuery): Promise<ServiceModel.ServiceResponse[]>;
    static getService(organizationId: string, id: string): Promise<ServiceModel.ServiceResponse>;
    static createService(organizationId: string, input: ServiceModel.ServiceCreateInput): Promise<ServiceModel.ServiceResponse>;
    static updateService(organizationId: string, id: string, input: ServiceModel.ServiceUpdateInput): Promise<ServiceModel.ServiceResponse>;
    static deleteService(organizationId: string, id: string): Promise<ServiceModel.ServiceResponse>;
    static toggleActive(organizationId: string, id: string): Promise<ServiceModel.ServiceResponse>;
    static setDefault(organizationId: string, id: string): Promise<ServiceModel.ServiceResponse>;
    static uploadServiceImage(organizationId: string, userId: string, id: string, file: File): Promise<ServiceModel.ServiceImageUploadResponse>;
}
