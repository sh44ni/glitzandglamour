/**
 * migrate-webdistt.cjs
 *
 * Downloads all gallery images still hosted on storage.webdistt.com,
 * re-uploads them to your MinIO bucket, and updates the DB records.
 *
 * Run on the VPS:
 *   node migrate-webdistt.cjs
 *
 * Requires env vars: MINIO_ENDPOINT, MINIO_PORT, MINIO_ACCESS_KEY,
 *                    MINIO_SECRET_KEY, MINIO_BUCKET, DATABASE_URL
 */

require('dotenv').config({ path: '.env.local' });

const { PrismaClient } = require('@prisma/client');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const https = require('https');
const http = require('http');

const prisma = new PrismaClient();

const BUCKET = process.env.MINIO_BUCKET || 'glitz-images';

const minio = new S3Client({
  endpoint: `http://${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT || '9000'}`,
  region: 'us-east-1',
  credentials: {
    accessKeyId: process.env.MINIO_ACCESS_KEY,
    secretAccessKey: process.env.MINIO_SECRET_KEY,
  },
  forcePathStyle: true,
});

// The 22 webdistt images extracted from the live API
const WEBDISTT_IMAGES = [
  { id: 'cmm5tbow10006ji04nekgzjr9', url: 'https://storage.webdistt.com/files/lava/ffb30bfc8f8e8fcc8ae23b85de220705.webp', tags: 'Nails' },
  { id: 'cmm5tbbgt0001l404j9dj0zfc', url: 'https://storage.webdistt.com/files/lava/12b93dc132207de4ee2ee4994a5c587e.webp', tags: 'Nails' },
  { id: 'cmm5tazy50005ji04id61glyk', url: 'https://storage.webdistt.com/files/lava/3435c73f1052af546a5d53d94fab7c82.webp', tags: 'Nails' },
  { id: 'cmm5tantz0004ji049tjym90g', url: 'https://storage.webdistt.com/files/lava/f18187959d259791c392684738811e06.webp', tags: 'Hair' },
  { id: 'cmm5ta88p0006ju04q92tlh0i', url: 'https://storage.webdistt.com/files/lava/d2acbcd56e3d2edf1af8bd9692d3c02c.webp', tags: 'Hair' },
  { id: 'cmm5t9y0d0003ji040nb4fwss', url: 'https://storage.webdistt.com/files/lava/58ef4ab1b570784b5f0bb180db2d2afe.webp', tags: 'Hair' },
  { id: 'cmm5t9fos0005ju045xbg8nth', url: 'https://storage.webdistt.com/files/lava/42ec0357ae80d675e3ebdbd2105d948f.webp', tags: 'Hair' },
  { id: 'cmm5t92ey0004ju04izr4cutf', url: 'https://storage.webdistt.com/files/lava/89c68980860b993299ef38b6f455a2d4.webp', tags: 'Nails' },
  { id: 'cmm5t8see0002ji04c2y3e4cy', url: 'https://storage.webdistt.com/files/lava/be298ca965a1c08e919485d24e8f91b7.webp', tags: 'Nails' },
  { id: 'cmm5t8jhp0003ju04889tt6tc', url: 'https://storage.webdistt.com/files/lava/082599f4e9e7b7307fe6d30be13f2c6c.webp', tags: 'Nails' },
  { id: 'cmm5t892x0000l4045yxr444w', url: 'https://storage.webdistt.com/files/lava/640f7b26fe296f0c7882cd2004cc1127.webp', tags: 'Nails' },
  { id: 'cmm5t7vhe0001ji0439o9l6r0', url: 'https://storage.webdistt.com/files/lava/f498174ecc5f40dfe5f99689a900ec42.webp', tags: 'Nails' },
  { id: 'cmm5t7hvj0002ju046xv1pnin', url: 'https://storage.webdistt.com/files/lava/a3b85af62b17e25b5ae1d7656b1d8ebd.webp', tags: 'Nails' },
  { id: 'cmm5t70oo0001ju04hxr2k49n', url: 'https://storage.webdistt.com/files/lava/9d235e89f2db8ebab8be6c858e17d2fc.webp', tags: 'Nails' },
  { id: 'cmm5t6n4l0000ji04lgjytuc3', url: 'https://storage.webdistt.com/files/lava/00b36ee6e015a4cb40681f6dff248b54.webp', tags: 'Nails' },
  { id: 'cmm5szqty0000ju04gby9ylze', url: 'https://storage.webdistt.com/files/lava/fd80d8cb337fa5b1043f7007d1e448cb.webp', tags: 'Nails' },
  { id: 'cmm4ypdus0001ib049t1hpjga', url: 'https://storage.webdistt.com/files/lava/fca6c6fc08d312305810ab91b8bda4fb.webp', tags: 'Nails' },
  { id: 'cmm4yp1x50000ib04xov5ipea', url: 'https://storage.webdistt.com/files/lava/7195ce0060cc72de0771a7176ab76547.webp', tags: 'Nails' },
  { id: 'cmm4yok2o0001l204n86otqhy', url: 'https://storage.webdistt.com/files/lava/28175d9c1db32ed9f9bc347a24b2b849.webp', tags: 'Hair' },
  { id: 'cmm4yo0fc0000l204g0a0fetf', url: 'https://storage.webdistt.com/files/lava/4f0d624b39c125e38c0ffecacd757e3d.webp', tags: 'Hair' },
  { id: 'cmm4yhlk70002lb041mhe3mmr', url: 'https://storage.webdistt.com/files/lava/9eb2a29a026185239a88b3ea6f96824f.webp', tags: 'Hair' },
  { id: 'cmm4yh05o0000l504rt5h7tmc', url: 'https://storage.webdistt.com/files/lava/42e8240c5c68317d733d9fb8075908fa.webp', tags: 'Nails' },
];

function downloadBuffer(url) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http;
    lib.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode} for ${url}`));
        return;
      }
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve({ buffer: Buffer.concat(chunks), contentType: res.headers['content-type'] || 'image/webp' }));
      res.on('error', reject);
    }).on('error', reject);
  });
}

async function migrate() {
  console.log(`\n🚀 Migrating ${WEBDISTT_IMAGES.length} images from storage.webdistt.com → MinIO\n`);

  let ok = 0, fail = 0;

  for (const img of WEBDISTT_IMAGES) {
    const filename = img.url.split('/').pop(); // e.g. ffb30bfc...webp
    const key = `gallery/${filename}`;
    const newUrl = `/api/images/${key}`;

    process.stdout.write(`  [${WEBDISTT_IMAGES.indexOf(img) + 1}/${WEBDISTT_IMAGES.length}] ${filename} ... `);

    try {
      // 1. Download from webdistt
      const { buffer, contentType } = await downloadBuffer(img.url);

      // 2. Upload to MinIO
      await minio.send(new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: buffer,
        ContentType: contentType,
      }));

      // 3. Update DB record
      await prisma.galleryImage.update({
        where: { id: img.id },
        data: { url: newUrl },
      });

      console.log(`✅ → ${newUrl}`);
      ok++;
    } catch (e) {
      console.log(`❌ FAILED: ${e.message}`);
      fail++;
    }
  }

  console.log(`\n✅ Done: ${ok} migrated, ${fail} failed\n`);
  await prisma.$disconnect();
}

migrate().catch(e => {
  console.error('Fatal:', e.message);
  process.exit(1);
});
