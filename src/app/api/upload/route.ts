import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';

const UPLOAD_URL = 'https://storage.webdistt.com/api/buckets/lava/upload';
const STORAGE_BASE = 'https://storage.webdistt.com';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File | null;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        // Accept images AND HEIC/HEIF from iPhone
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/heif', 'image/avif'];
        const isImage = file.type.startsWith('image/') || allowedTypes.includes(file.type.toLowerCase())
            || file.name.toLowerCase().match(/\.(heic|heif|jpg|jpeg|png|webp|avif)$/);

        if (!isImage) {
            return NextResponse.json({ error: 'Only images are allowed' }, { status: 400 });
        }

        // 25MB max input (HEIC can be large)
        if (file.size > 25 * 1024 * 1024) {
            return NextResponse.json({ error: 'Image must be under 25MB' }, { status: 400 });
        }

        // Convert through Sharp:
        // - HEIC/HEIF (iPhone) → WebP
        // - JPEG/PNG → WebP (compressed, quality 82)
        // - Max dimension 2400px (keeps it sharp but not huge)
        const inputBuffer = Buffer.from(await file.arrayBuffer());

        const converted = await sharp(inputBuffer, {
            failOn: 'none', // Don't fail on malformed metadata (common with iPhone photos)
        })
            .rotate()           // Auto-rotate based on EXIF orientation (iPhone portrait fix)
            .resize(2400, 2400, { fit: 'inside', withoutEnlargement: true })
            .webp({ quality: 82, effort: 4 })
            .toBuffer();

        // Build the output filename
        const baseName = file.name.replace(/\.[^/.]+$/, '');
        const outputFilename = `${baseName}.webp`;

        // Upload converted buffer to webdistt
        const uploadForm = new FormData();
        const blob = new Blob([new Uint8Array(converted)], { type: 'image/webp' });
        uploadForm.append('file', blob, outputFilename);

        const res = await fetch(UPLOAD_URL, {
            method: 'POST',
            body: uploadForm,
        });

        if (!res.ok) {
            const text = await res.text().catch(() => 'Upload service error');
            console.error('[upload] webdistt error:', res.status, text);
            return NextResponse.json({ error: `Upload failed: ${text}` }, { status: 502 });
        }

        const data = await res.json();
        const rawUrl: string = data.url || data.path || data.file || '';
        const url = rawUrl.startsWith('http') ? rawUrl : `${STORAGE_BASE}/${rawUrl.replace(/^\//, '')}`;

        return NextResponse.json({
            url,
            filename: data.filename || outputFilename,
            originalSize: file.size,
            convertedSize: converted.length,
            savedBytes: file.size - converted.length,
        });

    } catch (e) {
        console.error('[upload] error:', e);
        return NextResponse.json({ error: 'Internal error processing image' }, { status: 500 });
    }
}
