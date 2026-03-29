import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const count = await prisma.appleWalletDevice.count();
  console.log('Device count:', count);
  const devices = await prisma.appleWalletDevice.findMany();
  console.log('Devices:', devices);
}
main().finally(() => prisma.$disconnect());
