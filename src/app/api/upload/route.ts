import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

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
const PUBLIC_URL = process.env.MINIO_PUBLIC_URL || `http://${process.env.MINIO_ENDPOINT}:9000`;

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File | null;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        // Accept images AND HEIC/HEIF from iPhone
        const isImage = file.type.startsWith('image/')
            || file.name.toLowerCase().match(/\.(heic|heif|jpg|jpeg|png|webp|avif|gif)$/);

        if (!isImage) {
            return NextResponse.json({ error: 'Only images are allowed' }, { status: 400 });
        }

        // 25MB max input
        if (file.size > 25 * 1024 * 1024) {
            return NextResponse.json({ error: 'Image must be under 25MB' }, { status: 400 });
        }

        // Convert to WebP via Sharp
        const inputBuffer = Buffer.from(await file.arrayBuffer());
        const converted = await sharp(inputBuffer, { failOn: 'none' })
            .rotate()
            .resize(2400, 2400, { fit: 'inside', withoutEnlargement: true })
            .webp({ quality: 82, effort: 4 })
            .toBuffer();

        // Unique filename: timestamp + random
        const baseName = file.name.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9-_]/g, '-');
        const filename = `uploads/${Date.now()}-${Math.random().toString(36).slice(2)}-${baseName}.webp`;

        // Upload to MinIO
        await minio.send(new PutObjectCommand({
            Bucket: BUCKET,
            Key: filename,
            Body: converted,
            ContentType: 'image/webp',
        }));

        const url = `${PUBLIC_URL}/${BUCKET}/${filename}`;

        return NextResponse.json({
            url,
            filename,
            originalSize: file.size,
            convertedSize: converted.length,
            savedBytes: file.size - converted.length,
        });

    } catch (e) {
        console.error('[upload] error:', e);
        return NextResponse.json({ error: 'Internal error processing image' }, { status: 500 });
    }
}
