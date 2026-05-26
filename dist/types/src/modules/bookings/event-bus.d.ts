type Listener = () => void;
declare class BookingEventBus {
    private readonly listeners;
    subscribe(orgId: string, listener: Listener): () => void;
    notify(orgId: string): void;
}
export declare const bookingEventBus: BookingEventBus;
export {};
