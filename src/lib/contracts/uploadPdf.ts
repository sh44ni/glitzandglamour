import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

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

export async function uploadContractPdf(key: string, pdfBytes: Uint8Array): Promise<void> {
    const minio = client();
    if (!minio) {
        throw new Error('File storage is not configured (MinIO env missing).');
    }
    await minio.send(
        new PutObjectCommand({
            Bucket: BUCKET,
            Key: key,
            Body: Buffer.from(pdfBytes),
            ContentType: 'application/pdf',
        })
    );
}
