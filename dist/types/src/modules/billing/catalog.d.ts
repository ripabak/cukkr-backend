export declare const PLANS_CATALOG: readonly [{
    readonly id: "free";
    readonly name: "Free";
    readonly price: 0;
    readonly currency: "IDR";
    readonly interval: "month";
    readonly features: readonly ["barbershop_count_1", "walk_in_queue", "appointment_booking", "public_booking_page", "services_unlimited", "barber_count_3", "analytics_basic", "notifications_inapp"];
}, {
    readonly id: "premium";
    readonly name: "Premium";
    readonly price: 99000;
    readonly currency: "IDR";
    readonly interval: "month";
    readonly features: readonly ["includes_free", "barbershop_count_5", "broadcasting", "custom_booking_path", "barber_unlimited", "analytics_full", "email_support"];
}, {
    readonly id: "business";
    readonly name: "Business";
    readonly price: 299000;
    readonly currency: "IDR";
    readonly interval: "month";
    readonly features: readonly ["includes_premium", "barbershop_unlimited", "priority_email_support"];
}];
export type PlanId = (typeof PLANS_CATALOG)[number]['id'];
export type PlanCatalogEntry = (typeof PLANS_CATALOG)[number];
