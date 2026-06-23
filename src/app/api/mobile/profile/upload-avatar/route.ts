import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { auth } from '@/auth';
import { getMobileOrWebUser } from '@/lib/mobileAuth';
import { prisma } from '@/lib/prisma';
import { rateLimit, getClientIp } from '@/lib/rateLimit';

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

/**
 * POST /api/mobile/profile/upload-avatar
 * Accepts multipart/form-data with a 'file' field.
 * Supports mobile JWT Bearer tokens + NextAuth sessions.
 */
export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        const mobileUser = await getMobileOrWebUser(req, session?.user?.email);
        if (!mobileUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const rl = rateLimit(getClientIp(req), 'mobile-avatar-upload', { limit: 10, windowMs: 60 * 60 * 1000 });
        if (!rl.ok) {
            return NextResponse.json(
                { error: 'Too many uploads. Please try again later.' },
                { status: 429, headers: { 'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } },
            );
        }

        const formData = await req.formData();
        const file = formData.get('file') as File | null;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        const isImage = file.type.startsWith('image/')
            || file.name.toLowerCase().match(/\.(heic|heif|jpg|jpeg|png|webp|avif|gif)$/);

        if (!isImage) {
            return NextResponse.json({ error: 'Only images are allowed' }, { status: 400 });
        }

        if (file.size > 10 * 1024 * 1024) {
            return NextResponse.json({ error: 'Image must be under 10MB' }, { status: 400 });
        }

        // Resize to square avatar, convert to WebP
        const inputBuffer = Buffer.from(await file.arrayBuffer());
        const converted = await sharp(inputBuffer, { failOn: 'none' })
            .rotate()
            .resize(400, 400, { fit: 'cover', position: 'centre' })
            .webp({ quality: 85 })
            .toBuffer();

        const filename = `avatars/${mobileUser.id}-${Date.now()}.webp`;

        await minio.send(new PutObjectCommand({
            Bucket: BUCKET,
            Key: filename,
            Body: converted,
            ContentType: 'image/webp',
        }));

        const url = `/api/images/${filename}`;

        // Persist to user record
        await (prisma as any).user.update({
            where: { id: mobileUser.id },
            data: { image: url },
        });

        return NextResponse.json({ url });
    } catch (e) {
        console.error('[mobile/profile/upload-avatar]', e instanceof Error ? e.message : 'unknown');
        return NextResponse.json({ error: 'Failed to upload avatar' }, { status: 500 });
    }
}
