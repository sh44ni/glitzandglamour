import { NextRequest, NextResponse } from 'next/server';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';

const minio = new S3Client({
    endpoint: `http://${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT || '9000'}`,
    region: 'us-east-1',
    credentials: {
        accessKeyId: process.env.MINIO_ACCESS_KEY!,
        secretAccessKey: process.env.MINIO_SECRET_KEY!,
    },
    forcePathStyle: true,
});

const BUCKET = process.env.MINIO_BUCKET || 'glitz-images';

// Cache images for 7 days
const CACHE_HEADER = 'public, max-age=604800, stale-while-revalidate=86400';

export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    const { path } = await params;
    const key = path.join('/');

    // Security: only allow access to public image prefixes
    const ALLOWED_PREFIXES = ['uploads/', 'gallery/', 'slider/'];
    const isAllowed = ALLOWED_PREFIXES.some(p => key.startsWith(p));
    if (!isAllowed || key.includes('..')) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    try {
        const command = new GetObjectCommand({ Bucket: BUCKET, Key: key });
        const response = await minio.send(command);

        const body = response.Body;
        if (!body) return NextResponse.json({ error: 'Not found' }, { status: 404 });

        // Stream the body to a buffer
        const chunks: Uint8Array[] = [];
        const reader = (body as any).transformToWebStream
            ? (body as any).transformToWebStream().getReader()
            : null;

        if (reader) {
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                chunks.push(value);
            }
        } else {
            // Node.js ReadableStream fallback
            for await (const chunk of body as any) {
                chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
            }
        }

        const buffer = Buffer.concat(chunks);
        const contentType = response.ContentType || 'image/webp';

        return new NextResponse(buffer, {
            status: 200,
            headers: {
                'Content-Type': contentType,
                'Cache-Control': CACHE_HEADER,
                'Content-Length': buffer.length.toString(),
            },
        });
    } catch (err: any) {
        if (err?.name === 'NoSuchKey' || err?.$metadata?.httpStatusCode === 404) {
            return NextResponse.json({ error: 'Image not found' }, { status: 404 });
        }
        console.error('[image-proxy] error:', err);
        return NextResponse.json({ error: 'Failed to load image' }, { status: 500 });
    }
}
