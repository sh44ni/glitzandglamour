// Backfill SpecialEventClient records from all SIGNED contracts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const signed = await prisma.contractSigningInvite.findMany({
        where: { lifecycleStatus: 'SIGNED' },
        select: {
            id: true,
            label: true,
            adminPayload: true,
            clientPayload: true,
        },
    });

    console.log(`Found ${signed.length} signed contracts`);

    for (const inv of signed) {
        const ap = inv.adminPayload;
        if (!ap || typeof ap !== 'object') {
            console.log(`  ⏭ ${inv.id} — no adminPayload, skipping`);
            continue;
        }

        const cp = inv.clientPayload;
        const clientName = (cp && typeof cp === 'object' && 'printedName' in cp ? cp.printedName : null)
            || ('clientLegalName' in ap ? ap.clientLegalName : null)
            || 'Unknown';
        const clientEmail = ('email' in ap && typeof ap.email === 'string') ? ap.email.trim().toLowerCase() : null;
        const clientPhone = ('phone' in ap && typeof ap.phone === 'string') ? ap.phone.trim() : null;

        console.log(`  → ${inv.label}: name=${clientName}, email=${clientEmail}, phone=${clientPhone}`);

        // Check if already linked
        const existingLink = await prisma.specialEventClientContract.findFirst({
            where: { inviteId: inv.id },
        });
        if (existingLink) {
            console.log(`    ✅ Already linked to client ${existingLink.clientId}`);
            continue;
        }

        // Find or create client
        let seClient = clientEmail
            ? await prisma.specialEventClient.findFirst({ where: { email: clientEmail } })
            : null;
        if (!seClient && clientPhone) {
            seClient = await prisma.specialEventClient.findFirst({ where: { phone: clientPhone } });
        }

        if (seClient) {
            console.log(`    🔗 Found existing client ${seClient.id}, linking...`);
            await prisma.specialEventClientContract.create({
                data: { clientId: seClient.id, inviteId: inv.id },
            });
        } else {
            console.log(`    ✨ Creating new client...`);
            await prisma.specialEventClient.create({
                data: {
                    name: String(clientName),
                    email: clientEmail,
                    phone: clientPhone,
                    contracts: {
                        create: { inviteId: inv.id },
                    },
                },
            });
        }
    }

    const total = await prisma.specialEventClient.count();
    console.log(`\nDone! Total clients: ${total}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
