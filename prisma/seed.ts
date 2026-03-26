import { PrismaClient, BookingStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const services = [
    // Nail Services
    { name: 'Acrylic Set', category: 'nails', priceFrom: 65, priceLabel: 'From $65', description: 'Varies by design', imageUrl: '/services/Full_Set_GelX.jpeg', displayOrder: 1 },
    { name: 'GelX', category: 'nails', priceFrom: 60, priceLabel: 'From $60', imageUrl: '/services/Full_Set_GelX.jpeg', displayOrder: 2 },
    { name: 'Fill', category: 'nails', priceFrom: 35, priceLabel: 'From $35', description: '3-4 weeks max', imageUrl: '/services/Fill_Rebalance.jpeg', displayOrder: 3 },
    { name: 'Rebalance', category: 'nails', priceFrom: 55, priceLabel: 'From $55', description: '1+ month growth', imageUrl: '/services/Fill_Rebalance.jpeg', displayOrder: 4 },
    { name: 'Manicure', category: 'nails', priceFrom: 40, priceLabel: 'From $40', description: 'Rubber base structure with choice of gel polish', imageUrl: '/services/Full_Set_GelX.jpeg', displayOrder: 5 },
    { name: 'Soak Off (my work)', category: 'nails', priceFrom: 30, priceLabel: 'From $30', imageUrl: '/services/Soak_Off.jpeg', displayOrder: 6 },
    { name: 'Foreign Soak Off', category: 'nails', priceFrom: 50, priceLabel: 'From $50', imageUrl: '/services/Soak_Off.jpeg', displayOrder: 7 },
    { name: 'Nail Design (Add-on)', category: 'nails', priceFrom: 5, priceLabel: 'From $5', imageUrl: '/services/Nail_Design_New_Design.jpeg', displayOrder: 8 },
    // Pedicures
    { name: 'Classic Foot Soak Detox', category: 'pedicures', priceFrom: 65, priceLabel: 'From $65', description: 'Cuticle clean up • Callus removal • New polish • Relaxing massage', imageUrl: '/services/Classic_Foot_Soak_Detox.jpeg', displayOrder: 9 },
    { name: 'Jelly Hydrating Foot Detox', category: 'pedicures', priceFrom: 75, priceLabel: 'From $75', description: 'Cuticle clean up • Callus removal • Exfoliation', imageUrl: '/services/Jelly_Hydrating_Foot_Detox.jpeg', displayOrder: 10 },
    { name: 'Acrylic Toes', category: 'pedicures', priceFrom: 45, priceLabel: 'From $45', imageUrl: '/services/Acrylic_Toes.jpeg', displayOrder: 11 },
    // Hair Color
    { name: 'Solid One Tone', category: 'haircolor', priceFrom: 120, priceLabel: 'From $120', description: 'All blacks & browns etc.', imageUrl: '/services/Elegant_beauty_spa_202601022049.jpeg', displayOrder: 12 },
    { name: 'Highlights', category: 'haircolor', priceFrom: 380, priceLabel: 'From $380', description: 'Add subtle brightness into hair for dimension', imageUrl: '/services/Elegant_beauty_spa_202601022049.jpeg', displayOrder: 13 },
    { name: 'Balayage', category: 'haircolor', priceFrom: 380, priceLabel: 'From $380', description: 'More bold effect of blonde dimension', imageUrl: '/services/Elegant_beauty_spa_202601022049.jpeg', displayOrder: 14 },
    { name: 'Gloss', category: 'haircolor', priceFrom: 65, priceLabel: 'From $65', description: 'Quick shine and tone refresh that enhances color, reduces brassiness, adds shine & silkiness', imageUrl: '/services/Elegant_beauty_spa_202601022049.jpeg', displayOrder: 15 },
    { name: 'Vivids', category: 'haircolor', priceFrom: 380, priceLabel: 'From $380', description: 'Bright bold fashion colors — reds, blues, pinks etc.', imageUrl: '/services/Elegant_beauty_spa_202601022049.jpeg', displayOrder: 16 },
    { name: 'Creative Color', category: 'haircolor', priceFrom: 150, priceLabel: 'From $150', description: 'Customizable bold trend-inspired hair designs like peekaboo panels, stripes, cheetah print, custom pops of color', imageUrl: '/services/Elegant_beauty_spa_202601022049.jpeg', displayOrder: 17 },
    // Haircuts
    { name: "Women's Haircut", category: 'haircuts', priceFrom: 65, priceLabel: 'From $65', description: 'Includes wash, cut and blowout', imageUrl: '/services/Elegant_beauty_spa_202601022049.jpeg', displayOrder: 18 },
    { name: "Men's Haircut", category: 'haircuts', priceFrom: 45, priceLabel: 'From $45', description: 'Fades or shear work', imageUrl: '/services/Elegant_beauty_spa_202601022049.jpeg', displayOrder: 19 },
    { name: 'Kids Haircut (Girls)', category: 'haircuts', priceFrom: 35, priceLabel: 'From $35', description: 'Ages 0-12, includes haircut and style', imageUrl: '/services/Elegant_beauty_spa_202601022049.jpeg', displayOrder: 20 },
    { name: 'Kids Haircut (Boys)', category: 'haircuts', priceFrom: 35, priceLabel: 'From $35', description: 'Ages 0-12, fades or shear work', imageUrl: '/services/Elegant_beauty_spa_202601022049.jpeg', displayOrder: 21 },
    // Waxing
    { name: 'Upper Lip', category: 'waxing', priceFrom: 10, priceLabel: 'From $10', imageUrl: '/services/Clean_professional_waxing_202601022049.jpeg', displayOrder: 22 },
    { name: 'Eyebrow Wax', category: 'waxing', priceFrom: 12, priceLabel: 'From $12', imageUrl: '/services/Clean_professional_waxing_202601022049.jpeg', displayOrder: 23 },
    { name: 'Underarm', category: 'waxing', priceFrom: 20, priceLabel: 'From $20', imageUrl: '/services/Clean_professional_waxing_202601022049.jpeg', displayOrder: 24 },
    { name: 'Sideburns', category: 'waxing', priceFrom: 15, priceLabel: 'From $15', imageUrl: '/services/Clean_professional_waxing_202601022049.jpeg', displayOrder: 25 },
    { name: 'Brazilian', category: 'waxing', priceFrom: 60, priceLabel: 'From $60', imageUrl: '/services/Clean_professional_waxing_202601022049.jpeg', displayOrder: 26 },
    // Facials
    { name: 'Mini Facial', category: 'facials', priceFrom: 30, priceLabel: 'From $30', description: 'Ingrown extraction • Steam to loosen dead skin cells • Hydrating enzyme mask • Perfect post-wax treatment', imageUrl: '/services/Mini_Facials.jpeg', displayOrder: 27 },
    { name: 'Basic Facial', category: 'facials', priceFrom: 75, priceLabel: 'From $75', description: 'Cleansing, exfoliation, mask & massage', imageUrl: '/services/Basic_Facial.jpeg', displayOrder: 28 },
    { name: 'Deep Cleansing + Extraction Facial', category: 'facials', priceFrom: 85, priceLabel: 'From $85', description: 'Deep pore cleanse, exfoliation, extractions & relaxing facial massage', imageUrl: '/services/Deep_Cleansing_and_Extraction_Facial.jpeg', displayOrder: 29 },
    { name: 'Anti-Aging & Enzyme Facial', category: 'facials', priceFrom: 100, priceLabel: 'From $100', description: 'Includes exfoliation, extractions, cupping to boost blood flow, & soothing facial massage', imageUrl: '/services/Anti-Aging_and_Enzyme_Facial.jpeg', displayOrder: 30 },
];

async function main() {
    console.log('🌱 Seeding database...');

    // Seed admin user
    const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'glitzandglamour', 12);
    await prisma.adminUser.upsert({
        where: { email: 'info@glitzandglamours.com' },
        update: { passwordHash },
        create: {
            email: 'info@glitzandglamours.com',
            passwordHash,
            name: 'JoJany',
        },
    });
    console.log('✅ Admin user seeded');

    // Seed services
    for (const service of services) {
        await prisma.service.upsert({
            where: { id: service.name.toLowerCase().replace(/[^a-z0-9]/g, '-') },
            update: service,
            create: {
                id: service.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
                ...service,
            },
        });
    }
    console.log(`✅ ${services.length} services seeded`);

    console.log('🎉 Database seeded successfully!');
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
