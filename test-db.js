const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Testing connection to:', process.env.DATABASE_URL.split('@')[1] || process.env.DATABASE_URL);
        const userCount = await prisma.user.count();
        const bookingCount = await prisma.booking.count();
        console.log('--- FOUND ---');
        console.log('Users:', userCount);
        console.log('Bookings:', bookingCount);
    } catch (error) {
        console.error('Error connecting or querying:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
