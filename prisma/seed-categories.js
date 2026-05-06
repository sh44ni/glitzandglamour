const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const CATEGORIES = [
  { key: 'nails',     label: 'Nail Services', emoji: '💅', imageUrl: '/services/categories/nails.png',     order: 0 },
  { key: 'pedicures', label: 'Pedicures',     emoji: '🦶', imageUrl: '/services/categories/pedicures.png', order: 1 },
  { key: 'haircolor', label: 'Hair Color',    emoji: '🎨', imageUrl: '/services/categories/haircolor.png', order: 2 },
  { key: 'haircuts',  label: 'Haircuts',      emoji: '✂️', imageUrl: '/services/categories/haircuts.png',  order: 3 },
  { key: 'waxing',    label: 'Waxing',        emoji: '✨', imageUrl: '/services/categories/waxing.png',    order: 4 },
  { key: 'facials',   label: 'Facials',        emoji: '🧖‍♀️', imageUrl: '/services/categories/facials.png',  order: 5 },
];

async function main() {
  for (const cat of CATEGORIES) {
    await prisma.serviceCategory.upsert({
      where: { key: cat.key },
      update: {},           // don't overwrite if already exists
      create: cat,
    });
    console.log(`✓ ${cat.key} → ${cat.label}`);
  }
  console.log('\nDone! All categories seeded.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
