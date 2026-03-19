const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const bookings = await prisma.booking.findMany({
    where: { inspoImageUrls: { isEmpty: false } },
  });
  
  let updated = 0;
  for (const b of bookings) {
    let changed = false;
    const newUrls = b.inspoImageUrls.map(url => {
      if (url.includes('http://31.97.236.172:9000/glitz-images')) {
        changed = true;
        return url.replace('http://31.97.236.172:9000/glitz-images', 'https://glitzandglamours.com/images');
      }
      return url;
    });
    
    if (changed) {
      await prisma.booking.update({
        where: { id: b.id },
        data: { inspoImageUrls: newUrls }
      });
      updated++;
    }
  }
  console.log(`Updated ${updated} bookings with old image URLs in bookings table.`);
  
  // Also check gallery_images table
  const images = await prisma.galleryImage.findMany();
  let imgUpdated = 0;
  for (const img of images) {
    if (img.url.includes('http://31.97.236.172:9000/glitz-images')) {
      const newUrl = img.url.replace('http://31.97.236.172:9000/glitz-images', 'https://glitzandglamours.com/images');
      await prisma.galleryImage.update({
        where: { id: img.id },
        data: { url: newUrl }
      });
      imgUpdated++;
    }
  }
  
  console.log(`Updated ${imgUpdated} images in gallery_images table.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
