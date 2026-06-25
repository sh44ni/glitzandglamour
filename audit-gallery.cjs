const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
async function main() {
  const all = await p.galleryImage.findMany({
    select: { id: true, url: true, tags: true, createdAt: true },
    orderBy: { createdAt: 'asc' },
  });

  const webdistt = all.filter(i => i.url && i.url.includes('storage.webdistt.com'));
  const proxy    = all.filter(i => i.url && i.url.startsWith('/api/images/'));
  const other    = all.filter(i => !i.url?.includes('webdistt') && !i.url?.startsWith('/api/images/'));

  console.log(`Total: ${all.length}`);
  console.log(`  /api/images/ (MinIO proxy): ${proxy.length}`);
  console.log(`  storage.webdistt.com:        ${webdistt.length}`);
  console.log(`  other:                       ${other.length}`);

  if (webdistt.length > 0) {
    console.log('\n--- storage.webdistt.com images ---');
    webdistt.forEach(i => console.log(`  [${i.createdAt.toISOString().slice(0,10)}] tags:${i.tags || 'none'} | ${i.url}`));
  }

  if (other.length > 0) {
    console.log('\n--- other URLs ---');
    other.forEach(i => console.log(' ', i.url));
  }

  await p.$disconnect();
}
main().catch(e => { console.error(e.message); process.exit(1); });
