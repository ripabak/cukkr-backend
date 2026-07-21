import sharp from 'sharp'

export interface SizeConfig {
	suffix: string
	width: number
	height?: number
}

export interface ImageVariant {
	buffer: Buffer
	suffix: string
	mimeType: string
}

export const IMAGE_VARIANTS = {
	service: [
		{ suffix: 'thumb', width: 200 },
		{ suffix: 'med', width: 600 },
		{ suffix: 'full', width: 1200 }
	] as SizeConfig[],
	logo: [
		{ suffix: 'thumb', width: 150 },
		{ suffix: 'med', width: 300 },
		{ suffix: 'full', width: 600 }
	] as SizeConfig[],
	avatar: [
		{ suffix: 'thumb', width: 48 },
		{ suffix: 'med', width: 150 },
		{ suffix: 'full', width: 400 }
	] as SizeConfig[]
} as const

const WEBP_QUALITY = 80

export async function generateWebPVariants(
	buffer: Uint8Array,
	sizes: readonly SizeConfig[]
): Promise<ImageVariant[]> {
	const results: ImageVariant[] = []

	for (const size of sizes) {
		const resized = await sharp(buffer)
			.resize({
				width: size.width,
				height: size.height,
				fit: 'inside',
				withoutEnlargement: true
			})
			.webp({ quality: WEBP_QUALITY })
			.toBuffer()

		results.push({
			buffer: resized,
			suffix: size.suffix,
			mimeType: 'image/webp'
		})
	}

	return results
}
