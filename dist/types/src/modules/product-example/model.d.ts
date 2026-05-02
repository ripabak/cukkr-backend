export declare namespace ProductExampleModel {
    const ProductExampleInputCreate: import("@sinclair/typebox").TObject<{
        name: import("@sinclair/typebox").TString;
        description: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>>;
        price: import("@sinclair/typebox").TNumber;
        stock: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
    }>;
    type ProductExampleInputCreate = typeof ProductExampleInputCreate.static;
    const ProductExampleInputUpdate: import("@sinclair/typebox").TObject<{
        name: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        description: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>>;
        price: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
        stock: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
    }>;
    type ProductExampleInputUpdate = typeof ProductExampleInputUpdate.static;
    const ProductExampleResponse: import("@sinclair/typebox").TObject<{
        id: import("@sinclair/typebox").TString;
        name: import("@sinclair/typebox").TString;
        description: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>;
        price: import("@sinclair/typebox").TString;
        stock: import("@sinclair/typebox").TNumber;
        createdAt: import("@sinclair/typebox").TDate;
        updatedAt: import("@sinclair/typebox").TDate;
    }>;
    type ProductExampleResponse = typeof ProductExampleResponse.static;
    const ProductExampleWithUserResponse: import("@sinclair/typebox").TObject<{
        id: import("@sinclair/typebox").TString;
        name: import("@sinclair/typebox").TString;
        description: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>;
        price: import("@sinclair/typebox").TString;
        stock: import("@sinclair/typebox").TNumber;
        createdAt: import("@sinclair/typebox").TDate;
        updatedAt: import("@sinclair/typebox").TDate;
        user: import("@sinclair/typebox").TObject<{
            id: import("@sinclair/typebox").TString;
            name: import("@sinclair/typebox").TString;
            email: import("@sinclair/typebox").TString;
            image: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>;
        }>;
    }>;
    type ProductExampleWithUserResponse = typeof ProductExampleWithUserResponse.static;
    const ProductExampleQuery: import("@sinclair/typebox").TObject<{
        q: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        page: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
        limit: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
    }>;
    type ProductExampleQuery = typeof ProductExampleQuery.static;
}
