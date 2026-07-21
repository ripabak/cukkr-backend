export interface SizeConfig {
    suffix: string;
    width: number;
    height?: number;
}
export interface ImageVariant {
    buffer: Buffer;
    suffix: string;
    mimeType: string;
}
export declare const IMAGE_VARIANTS: {
    readonly service: SizeConfig[];
    readonly logo: SizeConfig[];
    readonly avatar: SizeConfig[];
};
export declare function generateWebPVariants(buffer: Uint8Array, sizes: readonly SizeConfig[]): Promise<ImageVariant[]>;
