const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const servicesDir = path.join(__dirname, 'public', 'services');

async function main() {
    // 1. Rename files in public/services
    const files = fs.readdirSync(servicesDir);
    const renamedMap = {};

    for (const file of files) {
        if (file.includes(' ') || file.includes('+')) {
            const newName = file.replace(/\+/g, 'and').replace(/\s+/g, '_');
            fs.renameSync(path.join(servicesDir, file), path.join(servicesDir, newName));
            renamedMap[file] = newName;
            console.log(`Renamed: "${file}" -> "${newName}"`);
        }
    }

    // 2. Update Database
    const services = await prisma.service.findMany();
    for (const s of services) {
        if (s.imageUrl) {
            const oldFilename = path.basename(s.imageUrl);
            if (renamedMap[oldFilename]) {
                const newUrl = `/services/${renamedMap[oldFilename]}`;
                await prisma.service.update({
                    where: { id: s.id },
                    data: { imageUrl: newUrl }
                });
                console.log(`Updated DB for ${s.name}: ${newUrl}`);
            }
        }
    }

    // 3. Update prisma/seed.ts manually via replace in bash, or just print warning.
    console.log("Done fixing DB and files!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
