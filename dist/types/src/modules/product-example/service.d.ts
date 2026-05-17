import { PaginatedResult } from '../../core/pagination';
import { ProductExampleModel } from './model';
export declare abstract class ProductExampleService {
    private static checkProductExampleOwnership;
    static getAll(query: ProductExampleModel.ProductExampleQuery | undefined, organizationId: string): Promise<PaginatedResult<ProductExampleModel.ProductExampleWithUserResponse>>;
    static getById(id: string, organizationId: string): Promise<ProductExampleModel.ProductExampleWithUserResponse>;
    static getAllMyProductExamples(query: ProductExampleModel.ProductExampleQuery | undefined, userId: string, organizationId: string): Promise<PaginatedResult<ProductExampleModel.ProductExampleResponse>>;
    static create(data: ProductExampleModel.ProductExampleInputCreate, userId: string, organizationId: string): Promise<ProductExampleModel.ProductExampleResponse>;
    static update(id: string, data: ProductExampleModel.ProductExampleInputUpdate, organizationId: string): Promise<ProductExampleModel.ProductExampleResponse>;
    static delete(id: string, organizationId: string): Promise<ProductExampleModel.ProductExampleResponse>;
}
