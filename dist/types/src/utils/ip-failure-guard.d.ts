declare class IpFailureGuardClass {
    private store;
    isBlocked(ip: string): boolean;
    recordFailure(ip: string): void;
    reset(ip: string): void;
    resetAll(): void;
}
export declare const ipFailureGuard: IpFailureGuardClass;
export {};
