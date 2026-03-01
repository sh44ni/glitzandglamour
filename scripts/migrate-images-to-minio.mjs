// Migrates ALL image types from webdistt.com → MinIO VPS
// Covers: GalleryImage, SliderImage, Service.imageUrl
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
        } else if (e && e.name === 'BucketAlreadyExists') {
            console.log(`ℹ️  Bucket "${BUCKET}" already exists`);
        } else {
            console.log(`ℹ️  Bucket likely exists, continuing...`);
        }
    }
    try {
        const policy = JSON.stringify({
            Version: '2012-10-17',
            Statement: [{ Effect: 'Allow', Principal: { AWS: ['*'] }, Action: ['s3:GetObject'], Resource: [`arn:aws:s3:::${BUCKET}/*`] }],
        });
        await minio.send(new PutBucketPolicyCommand({ Bucket: BUCKET, Policy: policy }));
        console.log('✅ Bucket public read policy applied\n');
    } catch (e) {
        console.log('ℹ️  Policy already set\n');
    }
}

async function downloadImage(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
    const buffer = Buffer.from(await res.arrayBuffer());
    const contentType = res.headers.get('content-type') || 'image/webp';
    return { buffer, contentType };
}

async function uploadToMinio(buffer, folder, id, contentType) {
    const ext = contentType.includes('webp') ? 'webp' : (contentType.split('/')[1] || 'jpg');
    const key = `${folder}/${id}.${ext}`;
    await minio.send(new PutObjectCommand({ Bucket: BUCKET, Key: key, Body: buffer, ContentType: contentType }));
    return `http://${VPS_IP}:9000/${BUCKET}/${key}`;
}

function shouldMigrate(url) {
    if (!url) return false;
    if (url.startsWith('/') || url.startsWith('./')) return false; // local file
    if (url.includes(VPS_IP)) return false; // already on MinIO
    return true;
}

async function migrateTable(label, folder, items, idField, urlField, updateFn) {
    const toMigrate = items.filter(i => shouldMigrate(i[urlField]));
    const skipping = items.length - toMigrate.length;
    console.log(`\n${label}: ${items.length} total, ${toMigrate.length} to migrate, ${skipping} skipped`);
    let done = 0;
    for (const item of toMigrate) {
        try {
            const { buffer, contentType } = await downloadImage(item[urlField]);
            const newUrl = await uploadToMinio(buffer, folder, item[idField], contentType);
            await updateFn(item[idField], newUrl);
            done++;
            console.log(`   [${done}/${toMigrate.length}] ✓ ${item[idField]}`);
        } catch (e) {
            console.error(`   ✗ Failed ${item[idField]}:`, e?.message || e);
        }
    }
    console.log(`   ✓ Done (${done} migrated)`);
}

async function migrateAll() {
    await setupBucket();
    await db.$connect();

    // ── Gallery images ─────────────────────────────────────────
    const gallery = await db.galleryImage.findMany();
    await migrateTable('🖼️  Gallery', 'gallery', gallery, 'id', 'url',
        (id, url) => db.galleryImage.update({ where: { id }, data: { url } }));

    // ── Slider images ──────────────────────────────────────────
    const slider = await db.sliderImage.findMany();
    await migrateTable('🎠 Slider', 'slider', slider, 'id', 'url',
        (id, url) => db.sliderImage.update({ where: { id }, data: { url } }));

    // ── Service images ─────────────────────────────────────────
    const services = await db.service.findMany();
    await migrateTable('💅 Services', 'services', services, 'id', 'imageUrl',
        (id, url) => db.service.update({ where: { id }, data: { imageUrl: url } }));

    console.log('\n🎉 All images migrated to MinIO!');
    console.log(`📦 MinIO console: http://${VPS_IP}:9001  (admin / supergliTzG376)`);
    await db.$disconnect();
}

migrateAll().catch(e => {
    console.error('❌ Failed:', e?.message || e);
    process.exit(1);
});
