// Migration script: copies ALL data from Neon → VPS PostgreSQL
// Run with: node scripts/migrate-to-vps.mjs

import { PrismaClient } from '@prisma/client';

const SOURCE = new PrismaClient({
    datasources: { db: { url: 'postgresql://neondb_owner:npg_NZjz7ATJUM3C@ep-dark-union-aiyemuh7-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require' } },
});

const TARGET = new PrismaClient({
    datasources: { db: { url: 'postgresql://glitzuser:Glit2Db431@31.97.236.172:5432/glitzandglamour?sslmode=disable' } },
});

async function migrate() {
    console.log('🔌 Connecting to both databases...');
    await SOURCE.$connect();
    await TARGET.$connect();
    console.log('✅ Connected\n');

    // ── Users ──────────────────────────────────────────────────
    const users = await SOURCE.user.findMany();
    console.log(`👤 Migrating ${users.length} users...`);
    for (const u of users) {
        await TARGET.user.upsert({ where: { id: u.id }, update: u, create: u });
    }
    console.log('   ✓ Users done');

    // ── Services ───────────────────────────────────────────────
    const services = await SOURCE.service.findMany();
    console.log(`💅 Migrating ${services.length} services...`);
    for (const s of services) {
        await TARGET.service.upsert({ where: { id: s.id }, update: s, create: s });
    }
    console.log('   ✓ Services done');

    // ── Bookings ───────────────────────────────────────────────
    const bookings = await SOURCE.booking.findMany();
    console.log(`📅 Migrating ${bookings.length} bookings...`);
    for (const b of bookings) {
        await TARGET.booking.upsert({ where: { id: b.id }, update: b, create: b });
    }
    console.log('   ✓ Bookings done');

    // ── Loyalty Cards ──────────────────────────────────────────
    const loyaltyCards = await SOURCE.loyaltyCard.findMany();
    console.log(`🎀 Migrating ${loyaltyCards.length} loyalty cards...`);
    for (const lc of loyaltyCards) {
        await TARGET.loyaltyCard.upsert({ where: { id: lc.id }, update: lc, create: lc });
    }
    console.log('   ✓ Loyalty cards done');

    // ── Stamps ─────────────────────────────────────────────────
    const stamps = await SOURCE.stamp.findMany();
    console.log(`🐱 Migrating ${stamps.length} stamps...`);
    for (const st of stamps) {
        await TARGET.stamp.upsert({ where: { id: st.id }, update: st, create: st });
    }
    console.log('   ✓ Stamps done');

    // ── Gallery ────────────────────────────────────────────────
    try {
        const gallery = await SOURCE.galleryImage.findMany();
        console.log(`🖼️  Migrating ${gallery.length} gallery images...`);
        for (const g of gallery) {
            await TARGET.galleryImage.upsert({ where: { id: g.id }, update: g, create: g });
        }
        console.log('   ✓ Gallery done');
    } catch { console.log('   ⚠ No gallery table (skip)'); }

    // ── Reviews ────────────────────────────────────────────────
    try {
        const reviews = await SOURCE.review.findMany();
        console.log(`⭐ Migrating ${reviews.length} reviews...`);
        for (const r of reviews) {
            await TARGET.review.upsert({ where: { id: r.id }, update: r, create: r });
        }
        console.log('   ✓ Reviews done');
    } catch { console.log('   ⚠ No review table (skip)'); }

    console.log('\n🎉 Migration complete! All data is now on your VPS.\n');
    console.log('Next step: update DATABASE_URL in Vercel to:');
    console.log('postgresql://glitzuser:Glit2Db431@31.97.236.172:5432/glitzandglamour?sslmode=disable\n');

    await SOURCE.$disconnect();
    await TARGET.$disconnect();
}

migrate().catch(e => {
    console.error('❌ Migration failed:', e.message);
    process.exit(1);
});
