import { prisma } from '@/lib/prisma';
import HomeClient from '@/components/HomeClient';

export default async function HomePage() {
  // Fetch the slider images on the server to prevent LCP delays
  const initialSliderImages = await prisma.sliderImage.findMany({
    orderBy: { order: 'asc' },
    select: { id: true, url: true } // only select needed fields to send to client
  });

  return <HomeClient initialSliderImages={initialSliderImages} />;
}
