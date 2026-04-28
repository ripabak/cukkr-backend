import {
	HeadBucketCommand,
	PutObjectCommand,
	S3Client
} from '@aws-sdk/client-s3'

import { env } from './env'

const TEST_STORAGE_BASE_URL = `${env.BETTER_AUTH_URL.replace(/\/$/, '')}/mock-storage`

export interface StorageClient {
	upload(key: string, buffer: Uint8Array, mimeType: string): Promise<string>
	getPublicUrl(key: string): string
}

class TestStorageClient implements StorageClient {
	async upload(key: string, buffer: Uint8Array, mimeType: string) {
		void buffer
		void mimeType
		return this.getPublicUrl(key)
	}

	getPublicUrl(key: string) {
		return `${TEST_STORAGE_BASE_URL}/${key}`
	}
}

class S3CompatibleStorageClient implements StorageClient {
	private readonly client: S3Client
	private readonly endpoint: string
	private readonly bucket: string

	constructor() {
		const {
			STORAGE_ENDPOINT,
			STORAGE_BUCKET,
			STORAGE_ACCESS_KEY,
			STORAGE_SECRET_KEY
		} = env

		if (
			!STORAGE_ENDPOINT ||
			!STORAGE_BUCKET ||
			!STORAGE_ACCESS_KEY ||
			!STORAGE_SECRET_KEY
		) {
			throw new Error(
				'Storage configuration is incomplete. Please set STORAGE_ENDPOINT, STORAGE_BUCKET, STORAGE_ACCESS_KEY, and STORAGE_SECRET_KEY.'
			)
		}

		this.endpoint = STORAGE_ENDPOINT.replace(/\/$/, '')
		this.bucket = STORAGE_BUCKET
		this.client = new S3Client({
			endpoint: this.endpoint,
			region: 'auto',
			forcePathStyle: true,
			credentials: {
				accessKeyId: STORAGE_ACCESS_KEY,
				secretAccessKey: STORAGE_SECRET_KEY
			}
		})
	}

	async upload(key: string, buffer: Uint8Array, mimeType: string) {
		await this.client.send(
			new PutObjectCommand({
				Bucket: this.bucket,
				Key: key,
				Body: buffer,
				ContentType: mimeType
			})
		)

		return this.getPublicUrl(key)
	}

	getPublicUrl(key: string) {
		return `${this.endpoint}/${this.bucket}/${key}`
	}
}

export const storageClient: StorageClient =
	env.NODE_ENV === 'test'
		? new TestStorageClient()
		: new S3CompatibleStorageClient()

export async function verifyStorage() {
	if (env.NODE_ENV === 'test') {
		return true
	}

	const {
		STORAGE_ENDPOINT,
		STORAGE_BUCKET,
		STORAGE_ACCESS_KEY,
		STORAGE_SECRET_KEY
	} = env

	if (
		!STORAGE_ENDPOINT ||
		!STORAGE_BUCKET ||
		!STORAGE_ACCESS_KEY ||
		!STORAGE_SECRET_KEY
	) {
		throw new Error('Storage configuration is incomplete.')
	}

	const client = new S3Client({
		endpoint: STORAGE_ENDPOINT.replace(/\/$/, ''),
		region: 'auto',
		forcePathStyle: true,
		credentials: {
			accessKeyId: STORAGE_ACCESS_KEY,
			secretAccessKey: STORAGE_SECRET_KEY
		}
	})

	try {
		await client.send(new HeadBucketCommand({ Bucket: STORAGE_BUCKET }))
		return true
	} finally {
		client.destroy()
	}
}
