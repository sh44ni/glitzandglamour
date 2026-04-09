import { prisma } from '../src/lib/prisma';

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function main() {
  const services = await prisma.service.findMany({
    select: { id: true, name: true, slug: true },
  });

  const used = new Set<string>();
  for (const s of services) {
    if (s.slug) used.add(s.slug);
  }

  let updated = 0;
  for (const s of services) {
    if (s.slug && s.slug.trim()) continue;
    const base = slugify(s.name) || `service-${s.id.slice(0, 8)}`;
    let candidate = base;
    let n = 2;
    while (used.has(candidate)) {
      candidate = `${base}-${n}`;
      n += 1;
    }
    used.add(candidate);
    await prisma.service.update({ where: { id: s.id }, data: { slug: candidate } });
    updated += 1;
    // eslint-disable-next-line no-console
    console.log(`✓ ${s.name} -> ${candidate}`);
  }

  // eslint-disable-next-line no-console
  console.log(`Done. Updated ${updated} services.`);
}

main()
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

