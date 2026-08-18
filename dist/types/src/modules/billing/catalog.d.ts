export interface PlanCatalogEntry {
    id: string;
    name: string;
    price: number;
    currency: string;
    interval: string;
    maxBarbershops: number | null;
    features: string[];
    requiresContact?: boolean;
}
export declare const PLANS_CATALOG: readonly PlanCatalogEntry[];
