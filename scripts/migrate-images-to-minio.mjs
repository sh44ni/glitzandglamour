// Migrates all gallery images from webdistt.com → MinIO VPS
// Updates DB URLs to point to new MinIO storage
// Run: node scripts/migrate-images-to-minio.mjs

import { PrismaClient } from '@prisma/client';
import { S3Client, PutObjectCommand, CreateBucketCommand, PutBucketPolicyCommand } from '@aws-sdk/client-s3';

const VPS_IP = '31.97.236.172';
const BUCKET = 'glitz-images';

const minio = new S3Client({
    endpoint: `http://${VPS_IP}:9000`,
    region: 'us-east-1',
    credentials: { accessKeyId: 'admin', secretAccessKey: 'supergliTzG376' },
    forcePathStyle: true,
});

const db = new PrismaClient({
    datasources: { db: { url: 'postgresql://glitzuser:Glit2Db431@31.97.236.172:5432/glitzandglamour?sslmode=disable' } },
});

async function setupBucket() {
    try {
        await minio.send(new CreateBucketCommand({ Bucket: BUCKET }));
        console.log(`✅ Bucket "${BUCKET}" created`);
    } catch (e) {
        if (e && e.Code === 'BucketAlreadyOwnedByYou') {
            console.log(`ℹ️  Bucket "${BUCKET}" already exists`);
        } else {
            throw e;
        }
    }

    const policy = JSON.stringify({
        Version: '2012-10-17',
        Statement: [{ Effect: 'Allow', Principal: { AWS: ['*'] }, Action: ['s3:GetObject'], Resource: [`arn:aws:s3:::${BUCKET}/*`] }],
    });
    await minio.send(new PutBucketPolicyCommand({ Bucket: BUCKET, Policy: policy }));
    console.log('✅ Bucket set to public read\n');
}

async function downloadImage(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
    const buffer = Buffer.from(await res.arrayBuffer());
    const contentType = res.headers.get('content-type') || 'image/webp';
    return { buffer, contentType };
}

async function uploadToMinio(buffer, filename, contentType) {
    await minio.send(new PutObjectCommand({ Bucket: BUCKET, Key: filename, Body: buffer, ContentType: contentType }));
    return `http://${VPS_IP}:9000/${BUCKET}/${filename}`;
}

async function migrateImages() {
    await setupBucket();
    await db.$connect();

    const gallery = await db.galleryImage.findMany();
    console.log(`🖼️  Migrating ${gallery.length} gallery images...`);

    let done = 0;
    for (const img of gallery) {
        // Skip if already on MinIO
        if (img.url.includes(VPS_IP)) {
            console.log(`   [skip] Already on MinIO: ${img.id}`);
            done++;
            continue;
        }
        try {
            const { buffer, contentType } = await downloadImage(img.url);
            const ext = contentType.includes('webp') ? 'webp' : (contentType.split('/')[1] || 'jpg');
            const filename = `gallery/${img.id}.${ext}`;
            const newUrl = await uploadToMinio(buffer, filename, contentType);
            await db.galleryImage.update({ where: { id: img.id }, data: { url: newUrl } });
            done++;
            console.log(`   [${done}/${gallery.length}] ✓ ${img.id}`);
        } catch (e) {
            console.error(`   ✗ Failed ${img.id}:`, e?.message || e);
        }
    }

    console.log('\n🎉 Image migration complete!');
    console.log(`📦 Visit: http://${VPS_IP}:9001  (admin / supergliTzG376)`);
    await db.$disconnect();
}

migrateImages().catch(e => {
    console.error('❌ Failed:', e?.message || e);
    process.exit(1);
});
