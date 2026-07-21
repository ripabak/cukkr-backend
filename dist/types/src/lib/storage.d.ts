export interface StorageUploadOptions {
    cacheControl?: string;
}
export interface StorageClient {
    upload(key: string, buffer: Uint8Array, mimeType: string, options?: StorageUploadOptions): Promise<string>;
    getPublicUrl(key: string): string;
    delete(key: string): Promise<void>;
}
export declare const storageClient: StorageClient;
export declare function extractStorageKey(url: string): string | null;
export declare function verifyStorage(): Promise<boolean>;
