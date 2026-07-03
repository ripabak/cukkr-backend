import { PaginatedResult } from '../../core/pagination';
import { CustomerManagementModel } from './model';
type CustomerListQuery = CustomerManagementModel.CustomerListQuery;
type CustomerListItemResponse = CustomerManagementModel.CustomerListItemResponse;
type CustomerDetailResponse = CustomerManagementModel.CustomerDetailResponse;
type CustomerBookingItemResponse = CustomerManagementModel.CustomerBookingItemResponse;
export declare abstract class CustomerManagementService {
    private static buildAggregateQuery;
    static listCustomers(orgId: string, query: CustomerListQuery): Promise<PaginatedResult<CustomerListItemResponse>>;
    static getCustomer(orgId: string, id: string): Promise<CustomerDetailResponse>;
    static getCustomerChart(orgId: string, customerId: string): Promise<CustomerManagementModel.CustomerChartPoint[]>;
    static updateNotes(orgId: string, id: string, notes: string): Promise<CustomerDetailResponse>;
    static getCustomerBookings(orgId: string, customerId: string, query: {
        page?: number;
        limit?: number;
        type?: string;
        status?: string;
    }): Promise<PaginatedResult<CustomerBookingItemResponse>>;
}
export {};
