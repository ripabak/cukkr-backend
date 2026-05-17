export interface StorageClient {
    upload(key: string, buffer: Uint8Array, mimeType: string): Promise<string>;
    getPublicUrl(key: string): string;
}
export declare const storageClient: StorageClient;
export declare function verifyStorage(): Promise<boolean>;
