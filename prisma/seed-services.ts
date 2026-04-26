import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const services = [
    // Nail Services
    { name: 'Acrylic Set', category: 'nails', priceFrom: 65, priceLabel: 'From $65 & up', description: 'Varies by design', displayOrder: 1 },
    { name: 'GelX', category: 'nails', priceFrom: 60, priceLabel: 'From $60 & up', displayOrder: 2 },
    { name: 'Fill', category: 'nails', priceFrom: 35, priceLabel: '$35', description: '3-4 weeks max', displayOrder: 3 },
    { name: 'Rebalance', category: 'nails', priceFrom: 55, priceLabel: '$55', description: '1+ month growth', displayOrder: 4 },
    { name: 'Manicure', category: 'nails', priceFrom: 40, priceLabel: '$40', description: 'Rubber base structure with choice of gel polish', displayOrder: 5 },
    { name: 'Soak Off (my work)', category: 'nails', priceFrom: 30, priceLabel: '$30', displayOrder: 6 },
    { name: 'Foreign Soak Off', category: 'nails', priceFrom: 50, priceLabel: '$50', displayOrder: 7 },

    // Pedicures
    { name: 'Classic Foot Soak Detox', category: 'pedicures', priceFrom: 65, priceLabel: '$65', description: 'Cuticle clean up • Callus removal • New polish • Relaxing massage', displayOrder: 10 },
    { name: 'Jelly Hydrating Foot Detox', category: 'pedicures', priceFrom: 75, priceLabel: '$75', description: 'Cuticle clean up • Callus removal • Exfoliation', displayOrder: 11 },
    { name: 'Acrylic Toes', category: 'pedicures', priceFrom: 45, priceLabel: '$45', displayOrder: 12 },

    // Hair Color
    { name: 'Solid One Tone', category: 'haircolor', priceFrom: 120, priceLabel: 'From $120 & up', description: 'All blacks & browns etc.', displayOrder: 20 },
    { name: 'Highlights', category: 'haircolor', priceFrom: 380, priceLabel: 'From $380 & up', description: 'Add subtle brightness into hair for dimension', displayOrder: 21 },
    { name: 'Balayage', category: 'haircolor', priceFrom: 380, priceLabel: 'From $380 & up', description: 'More bold effect of blonde dimension', displayOrder: 22 },
    { name: 'Gloss', category: 'haircolor', priceFrom: 65, priceLabel: '$65', description: 'Quick shine and tone refresh', displayOrder: 23 },
    { name: 'Vivids', category: 'haircolor', priceFrom: 380, priceLabel: 'From $380 & up', description: 'Bright bold fashion colors — reds, blues, pinks etc.', displayOrder: 24 },
    { name: 'Creative Color', category: 'haircolor', priceFrom: 150, priceLabel: 'From $150 & up', description: 'Custom bold trend-inspired designs', displayOrder: 25 },

    // Haircuts
    { name: 'Womens Haircut', category: 'haircuts', priceFrom: 65, priceLabel: '$65', description: 'Includes wash, cut and blowout', displayOrder: 30 },
    { name: 'Mens Haircut', category: 'haircuts', priceFrom: 45, priceLabel: '$45', description: 'Fades or shear work', displayOrder: 31 },
    { name: 'Kids (Girls) Haircut', category: 'haircuts', priceFrom: 35, priceLabel: '$35', description: 'Ages 0-12, includes haircut and style', displayOrder: 32 },
    { name: 'Kids (Boys) Haircut', category: 'haircuts', priceFrom: 35, priceLabel: '$35', description: 'Ages 0-12, fades or shear work', displayOrder: 33 },

    // Waxing
    { name: 'Upper Lip', category: 'waxing', priceFrom: 10, priceLabel: '$10', displayOrder: 40 },
    { name: 'Eyebrow Wax', category: 'waxing', priceFrom: 12, priceLabel: '$12', displayOrder: 41 },
    { name: 'Underarm', category: 'waxing', priceFrom: 20, priceLabel: '$20', displayOrder: 42 },
    { name: 'Sideburns', category: 'waxing', priceFrom: 15, priceLabel: '$15', displayOrder: 43 },
    { name: 'Brazilian', category: 'waxing', priceFrom: 60, priceLabel: '$60', displayOrder: 44 },

    // Facials
    { name: 'Mini Facials', category: 'facials', priceFrom: 30, priceLabel: '$30', description: 'Ingrown extraction • Steam • Hydrating enzyme mask', displayOrder: 50 },
    { name: 'Basic Facial', category: 'facials', priceFrom: 75, priceLabel: '$75', description: 'Cleansing, exfoliation, mask & massage', displayOrder: 51 },
    { name: 'Deep Cleansing + Extraction Facial', category: 'facials', priceFrom: 85, priceLabel: '$85', description: 'Deep pore cleanse, exfoliation, extractions & massage', displayOrder: 52 },
    { name: 'Anti-Aging & Enzyme Facial', category: 'facials', priceFrom: 100, priceLabel: '$100', description: 'Exfoliation, extractions, cupping & facial massage', displayOrder: 53 },
];

async function main() {
    console.log('Seeding services...');

    // Upsert by name to avoid duplicates
    for (const svc of services) {
        const existing = await prisma.service.findFirst({ where: { name: svc.name } });
        if (existing) {
            await prisma.service.update({ where: { id: existing.id }, data: svc });
            console.log(`  Updated: ${svc.name}`);
        } else {
            await prisma.service.create({ data: svc });
            console.log(`  Created: ${svc.name}`);
        }
    }

    const count = await prisma.service.count();
    console.log(`\nDone! ${count} services in database.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
