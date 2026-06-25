import { NextRequest, NextResponse } from 'next/server';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { NodeHttpHandler } from '@smithy/node-http-handler';

function getMinioClient() {
    const endpoint = process.env.MINIO_ENDPOINT;
    const port = process.env.MINIO_PORT || '9000';
    if (!endpoint) throw new Error('MINIO_ENDPOINT not configured');
    return new S3Client({
        endpoint: `http://${endpoint}:${port}`,
        region: 'us-east-1',
        credentials: {
            accessKeyId: process.env.MINIO_ACCESS_KEY || '',
            secretAccessKey: process.env.MINIO_SECRET_KEY || '',
        },
        forcePathStyle: true,
        requestHandler: new NodeHttpHandler({
            connectionTimeout: 3000,
            requestTimeout: 5000,
        }),
    });
}

const BUCKET = process.env.MINIO_BUCKET || 'glitz-images';

// MinIO public base URL — set MINIO_PUBLIC_URL in .env.local if MinIO is
// directly reachable from the internet (e.g. http://31.97.236.172:9000).
// When set, images are served by MinIO directly (fastest, zero Node buffering).
const MINIO_PUBLIC_URL = process.env.MINIO_PUBLIC_URL;

export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    const { path } = await params;
    const key = path.join('/');

    // Security: only allow access to public image prefixes
    const ALLOWED_PREFIXES = ['uploads/', 'gallery/', 'slider/', 'avatars/'];
    const isAllowed = ALLOWED_PREFIXES.some(p => key.startsWith(p));
    if (!isAllowed || key.includes('..')) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // ── Fast path: direct redirect to MinIO public URL ────────────────────────
    // When MINIO_PUBLIC_URL is configured, skip Next.js entirely:
    // return a 302 so the client fetches straight from MinIO.
    // No buffering through Node — 109 images load in parallel with zero server load.
    if (MINIO_PUBLIC_URL) {
        const directUrl = `${MINIO_PUBLIC_URL}/${BUCKET}/${key}`;
        return NextResponse.redirect(directUrl, {
            status: 302,
            headers: { 'Cache-Control': 'public, max-age=604800' },
        });
    }

    // ── Presigned URL redirect (MinIO is internal-only) ───────────────────────
    // Generates a short-lived signed URL that the client fetches directly from
    // MinIO's internal address. Still 100x faster than buffering the full image
    // through Node.js.
    try {
        const minio = getMinioClient();
        const command = new GetObjectCommand({ Bucket: BUCKET, Key: key });
        // Presigned URL valid for 7 days
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const presignedUrl = await getSignedUrl(minio as any, command, { expiresIn: 604800 });

        return NextResponse.redirect(presignedUrl, {
            status: 302,
            headers: { 'Cache-Control': 'public, max-age=3600' },
        });
    } catch (err: any) {
        if (err?.name === 'NoSuchKey' || err?.$metadata?.httpStatusCode === 404) {
            return NextResponse.json({ error: 'Image not found' }, { status: 404 });
        }
        const message = err instanceof Error ? err.message : String(err);
        console.error('[image-proxy] presign error for', key, '-', message);
        return NextResponse.json({ error: 'Failed to load image' }, { status: 500 });
    }
}
