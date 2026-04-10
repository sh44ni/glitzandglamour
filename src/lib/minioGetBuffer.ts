import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';

function client() {
    const endpoint = process.env.MINIO_ENDPOINT;
    if (!endpoint || !process.env.MINIO_ACCESS_KEY || !process.env.MINIO_SECRET_KEY) {
        return null;
    }
    return new S3Client({
        endpoint: `http://${endpoint}:${process.env.MINIO_PORT || '9000'}`,
        region: 'us-east-1',
        credentials: {
            accessKeyId: process.env.MINIO_ACCESS_KEY,
            secretAccessKey: process.env.MINIO_SECRET_KEY,
        },
        forcePathStyle: true,
    });
}

const BUCKET = process.env.MINIO_BUCKET || 'glitz-images';

/** Loads an object from MinIO into memory (suitable for PDFs and small files). */
export async function minioGetBuffer(key: string): Promise<{ buffer: Buffer; contentType: string } | null> {
    const minio = client();
    if (!minio) return null;

    try {
        const response = await minio.send(new GetObjectCommand({ Bucket: BUCKET, Key: key }));
        const body = response.Body;
        if (!body) return null;

        const chunks: Uint8Array[] = [];
        const reader = (body as { transformToWebStream?: () => ReadableStream }).transformToWebStream?.().getReader();
        if (reader) {
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                chunks.push(value);
            }
        } else {
            for await (const chunk of body as AsyncIterable<Uint8Array | string>) {
                chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
            }
        }

        const buffer = Buffer.concat(chunks);
        const contentType = response.ContentType || 'application/octet-stream';
        return { buffer, contentType };
    } catch {
        return null;
    }
}
