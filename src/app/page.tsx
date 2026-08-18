/**
 * Home Page — Server Component (SSR)
 *
 * Fetches all data server-side via Prisma so the HTML response contains
 * real content (fixes mobile LCP 7.0s → target <2.5s).
 *
 * Interactive UI (carousel, timer, session-dependent loyalty) lives in
 * HomeClient which receives the prefetched data as props.
 */

import { prisma } from '@/lib/prisma';
import { resolveImageUrl } from '@/lib/imageUrl';
import { getGoogleReviews } from '@/lib/googleReviews';
import HomeClient from '@/components/HomeClient';
import ReactDOM from 'react-dom';

const INITIAL_FEATURED = [
  { name: 'Acrylic Set', price: 'From $65', image: '/services/Full_Set_GelX.jpeg', href: '/services#nails', wide: true, dbName: 'Acrylic Set', id: '' },
  { name: 'Deep Cleansing Facial', price: 'From $85', image: '/services/Deep_Cleansing_and_Extraction_Facial.jpeg', href: '/services#facials', dbName: 'Deep Cleansing + Extraction Facial', id: '' },
  { name: 'Balayage', price: 'From $380', image: '/services/Elegant_beauty_spa_202601022049.jpeg', href: '/services#haircolor', dbName: 'Balayage', id: '' },
  { name: 'Jelly Foot Detox', price: 'From $75', image: '/services/Jelly_Hydrating_Foot_Detox.jpeg', href: '/services#pedicures', dbName: 'Jelly Hydrating Foot Detox', id: '' },
  { name: 'Eyebrow Wax', price: 'From $12', image: '/services/Clean_professional_waxing_202601022049.jpeg', href: '/services#waxing', dbName: 'Eyebrow Wax', id: '' },
];

export default async function HomePage() {
  // Fetch all homepage data in parallel (server-side — no waterfall)
  const [sliderResult, servicesResult, reviewsResult, googleReviewsResult] = await Promise.allSettled([
    prisma.sliderImage.findMany({ orderBy: { order: 'asc' } }),
    prisma.service.findMany({ where: { isActive: true }, select: { id: true, name: true, priceLabel: true, imageUrl: true } }),
    (prisma as any).review.findMany({
      where: { rating: { gte: 4 } },
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: { user: { select: { name: true, image: true } } },
    }),
    getGoogleReviews(),
  ]);

  // Slider images
  const sliderImages = sliderResult.status === 'fulfilled'
    ? sliderResult.value.map(img => ({ id: img.id, url: resolveImageUrl(img.url) ?? img.url }))
    : [];

  // Featured services — merge DB data with fallback defaults
  const dbServices = servicesResult.status === 'fulfilled' ? servicesResult.value : [];
  const featuredServices = INITIAL_FEATURED.map(item => {
    const dbMatch = dbServices.find(s => s.name === item.dbName);
    if (dbMatch) {
      return {
        ...item,
        id: dbMatch.id,
        image: resolveImageUrl(dbMatch.imageUrl) ?? item.image,
        price: dbMatch.priceLabel || item.price,
      };
    }
    return item;
  });

  // Reviews — combine DB + Google, format for carousel
  const dbReviews = reviewsResult.status === 'fulfilled' ? reviewsResult.value : [];
  const googleReviews = googleReviewsResult.status === 'fulfilled' ? googleReviewsResult.value : [];
  const allReviewsRaw = [...googleReviews, ...dbReviews].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  const reviews = allReviewsRaw.slice(0, 15).map(r => ({
    name: r.user?.name || r.authorName || 'Client',
    text: r.text,
    date: new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
    initial: (r.user?.name || r.authorName || 'C').charAt(0).toUpperCase(),
    rating: r.rating || 5,
  }));

  // Preload the first LCP slider image so the browser fetches it
  // as early as possible — biggest single improvement for LCP score
  const lcpImageUrl = sliderImages[0]?.url;
  if (lcpImageUrl) {
    ReactDOM.preload(lcpImageUrl, { as: 'image', fetchPriority: 'high' });
  }

  return (
    <HomeClient
      initialSliderImages={sliderImages}
      initialFeaturedServices={featuredServices}
      initialReviews={reviews.length > 0 ? reviews : undefined}
    />
  );
}
