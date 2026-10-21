/**
 * Home Page — Server Component (SSR)
 *
 * Fetches all data server-side via Prisma so the HTML response contains
 * real content (fixes mobile LCP 7.0s → target <2.5s).
 *
 * Interactive UI (carousel, timer, session-dependent loyalty) lives in
 * HomeClient which receives the prefetched data as props.
 */

import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { resolveImageUrl } from '@/lib/imageUrl';
import { getDynamicReviewStats } from '@/lib/googleReviews';
import { SERVICES_DETAILED } from '@/data/servicesDetailed';
import HomeClient from '@/components/HomeClient';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Nail Salon, Hair & Bridal in San Marcos & Vista | Glitz CA',
  description: '5-Star Nail Salon, Hair Color & Bridal Studio at 935 W San Marcos Blvd (serving San Marcos & Vista). Gel-X from $60, Pedicures $40+, Balayage. Book online!',
  keywords: 'nail salon san marcos ca, nail salon vista ca, hair salon san marcos ca, hair salon vista ca, gel x nails san marcos, pedicure san marcos ca, balayage san marcos, bridal hair and makeup san diego, makeup artist san diego',
  alternates: {
    canonical: 'https://www.glitzandglamours.com',
  },
  openGraph: {
    title: 'Nail Salon, Hair & Bridal in San Marcos & Vista | Glitz CA',
    description: '5-Star Nail Salon, Hair Color & Bridal Studio at 935 W San Marcos Blvd (serving San Marcos & Vista). Gel-X from $60, Pedicures $40+, Balayage. Book online!',
    url: 'https://www.glitzandglamours.com',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nail Salon, Hair & Bridal in San Marcos & Vista | Glitz CA',
    description: '5-Star Nail Salon, Hair Color & Bridal Studio at 935 W San Marcos Blvd (serving San Marcos & Vista). Gel-X from $60, Pedicures $40+, Balayage. Book online!',
  },
};

const INITIAL_FEATURED = [
  // Original 5 signature services first
  { name: 'Acrylic Set', price: 'From $65', image: '/services/catalog/acrylic-set.webp', href: '/services#nails', wide: true, dbName: 'Acrylic Set', id: 'acrylic-set', category: 'nails', categoryLabel: 'Nail Services' },
  { name: 'Deep Cleansing Facial', price: 'From $85', image: '/services/catalog/deep-cleansing-extraction-facial.webp', href: '/services#facials', dbName: 'Deep Cleansing + Extraction Facial', id: 'deep-cleansing-extraction-facial', category: 'facials', categoryLabel: 'Facials' },
  { name: 'Balayage', price: 'From $380', image: '/services/catalog/balayage.webp', href: '/services#haircolor', dbName: 'Balayage', id: 'balayage', category: 'haircolor', categoryLabel: 'Hair Color' },
  { name: 'Jelly Foot Detox', price: 'From $75', image: '/services/catalog/jelly-hydrating-foot-detox.webp', href: '/services#pedicures', dbName: 'Jelly Hydrating Foot Detox', id: 'jelly-hydrating-foot-detox', category: 'pedicures', categoryLabel: 'Pedicures' },
  { name: 'Eyebrow Wax', price: 'From $12', image: '/services/catalog/eyebrow-wax.webp', href: '/services#waxing', dbName: 'Eyebrow Wax', id: 'eyebrow-wax', category: 'waxing', categoryLabel: 'Waxing' },
  // Remaining 24 studio services across all 6 categories (all 29 total indexed in DOM)
  { name: 'Gel-X Nail Extensions', price: 'From $60', image: '/services/catalog/gelx.webp', href: '/services#nails', dbName: 'GelX', id: 'gelx', category: 'nails', categoryLabel: 'Nail Services' },
  { name: 'Acrylic Nail Fill', price: 'From $35', image: '/services/catalog/fill.webp', href: '/services#nails', dbName: 'Fill', id: 'fill', category: 'nails', categoryLabel: 'Nail Services' },
  { name: 'Acrylic Nail Rebalance', price: 'From $55', image: '/services/catalog/rebalance.webp', href: '/services#nails', dbName: 'Rebalance', id: 'rebalance', category: 'nails', categoryLabel: 'Nail Services' },
  { name: 'Classic & Gel Manicure', price: 'From $40', image: '/services/catalog/manicure.webp', href: '/services#nails', dbName: 'Manicure', id: 'manicure', category: 'nails', categoryLabel: 'Nail Services' },
  { name: 'Safe Nail Soak-Off (My Work)', price: 'From $30', image: '/services/catalog/soak-off-my-work.webp', href: '/services#nails', dbName: 'Soak Off (My Work)', id: 'soak-off-my-work', category: 'nails', categoryLabel: 'Nail Services' },
  { name: 'Foreign Nail Soak-Off', price: 'From $50', image: '/services/catalog/foreign-soak-off.webp', href: '/services#nails', dbName: 'Foreign Soak Off', id: 'foreign-soak-off', category: 'nails', categoryLabel: 'Nail Services' },
  { name: 'Classic Foot Soak Detox Pedicure', price: 'From $65', image: '/services/catalog/classic-foot-soak-detox.webp', href: '/services#pedicures', dbName: 'Classic Foot Soak Detox', id: 'classic-foot-soak-detox', category: 'pedicures', categoryLabel: 'Pedicures' },
  { name: 'Full Set Acrylic Toes', price: 'From $45', image: '/services/catalog/acrylic-toes.webp', href: '/services#pedicures', dbName: 'Acrylic Toes', id: 'acrylic-toes', category: 'pedicures', categoryLabel: 'Pedicures' },
  { name: 'Dimensional Foil Highlights', price: 'From $380', image: '/services/catalog/highlights.webp', href: '/services#haircolor', dbName: 'Highlights', id: 'highlights', category: 'haircolor', categoryLabel: 'Hair Color' },
  { name: 'Solid One-Tone Hair Color', price: 'From $120', image: '/services/catalog/solid-one-tone.webp', href: '/services#haircolor', dbName: 'Solid One Tone', id: 'solid-one-tone', category: 'haircolor', categoryLabel: 'Hair Color' },
  { name: 'Hair Gloss & Toner Refresh', price: 'From $65', image: '/services/catalog/gloss.webp', href: '/services#haircolor', dbName: 'Gloss', id: 'gloss', category: 'haircolor', categoryLabel: 'Hair Color' },
  { name: 'Vivid & Fashion Hair Color', price: 'From $380', image: '/services/catalog/vivids.webp', href: '/services#haircolor', dbName: 'Vivids', id: 'vivids', category: 'haircolor', categoryLabel: 'Hair Color' },
  { name: 'Creative Color & Color Melt', price: 'From $150', image: '/services/catalog/creative-color.webp', href: '/services#haircolor', dbName: 'Creative Color', id: 'creative-color', category: 'haircolor', categoryLabel: 'Hair Color' },
  { name: "Women's Haircut & Blowout", price: 'From $65', image: '/services/catalog/womens-haircut.webp', href: '/services#haircuts', dbName: "Women's Haircut", id: 'womens-haircut', category: 'haircuts', categoryLabel: 'Haircuts' },
  { name: "Men's Haircut & Grooming", price: 'From $45', image: '/services/catalog/mens-haircut.webp', href: '/services#haircuts', dbName: "Men's Haircut", id: 'mens-haircut', category: 'haircuts', categoryLabel: 'Haircuts' },
  { name: 'Kids Haircut (Girls)', price: 'From $35', image: '/services/catalog/kids-haircut-girls.webp', href: '/services#haircuts', dbName: 'Kids Haircut (Girls)', id: 'kids-haircut-girls', category: 'haircuts', categoryLabel: 'Haircuts' },
  { name: 'Kids Haircut (Boys)', price: 'From $35', image: '/services/catalog/kids-haircut-boys.webp', href: '/services#haircuts', dbName: 'Kids Haircut (Boys)', id: 'kids-haircut-boys', category: 'haircuts', categoryLabel: 'Haircuts' },
  { name: 'Anti-Aging & Enzyme Facial', price: 'From $100', image: '/services/catalog/anti-aging-and-enzyme-facial.webp', href: '/services#facials', dbName: 'Anti-Aging & Enzyme Facial', id: 'anti-aging-and-enzyme-facial', category: 'facials', categoryLabel: 'Facials' },
  { name: 'Custom Nourishing Facial', price: 'From $75', image: '/services/catalog/basic-facial.webp', href: '/services#facials', dbName: 'Basic Facial', id: 'basic-facial', category: 'facials', categoryLabel: 'Facials' },
  { name: 'Express Mini Facial (30 Min)', price: 'From $30', image: '/services/catalog/mini-facial.webp', href: '/services#facials', dbName: 'Mini Facial', id: 'mini-facial', category: 'facials', categoryLabel: 'Facials' },
  { name: 'Female Brazilian Wax', price: 'From $60', image: '/services/catalog/brazilian.webp', href: '/services#waxing', dbName: 'Brazilian', id: 'brazilian', category: 'waxing', categoryLabel: 'Waxing' },
  { name: 'Underarm Wax', price: 'From $20', image: '/services/catalog/underarm.webp', href: '/services#waxing', dbName: 'Underarm', id: 'underarm', category: 'waxing', categoryLabel: 'Waxing' },
  { name: 'Sideburns Wax', price: 'From $15', image: '/services/catalog/sideburns.webp', href: '/services#waxing', dbName: 'Sideburns', id: 'sideburns', category: 'waxing', categoryLabel: 'Waxing' },
  { name: 'Upper Lip Wax', price: 'From $10', image: '/services/catalog/upper-lip.webp', href: '/services#waxing', dbName: 'Upper Lip', id: 'upper-lip', category: 'waxing', categoryLabel: 'Waxing' },
];

interface HomeCachedData {
  sliderImages: { id: string; url: string }[];
  featuredServices: any[];
  reviews: any[];
  reviewStats?: {
    rating: number;
    totalCount: number;
    googleTotalCount: number;
    setmoreTotalCount: number;
  };
  updatedAt: number;
}

const g = globalThis as unknown as {
  __glitzHomeData?: HomeCachedData;
  __glitzHomeRefreshPromise?: Promise<HomeCachedData>;
};

async function fetchHomeDataFromDB(): Promise<HomeCachedData> {
  const [sliderResult, servicesResult, reviewsResult, statsResult] = await Promise.allSettled([
    prisma.sliderImage.findMany({ orderBy: { order: 'asc' } }),
    prisma.service.findMany({ where: { isActive: true }, select: { id: true, name: true, priceLabel: true, imageUrl: true } }),
    (prisma as any).review.findMany({
      where: { rating: { gte: 4 } },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: { user: { select: { name: true, image: true } } },
    }),
    getDynamicReviewStats(),
  ]);

  const sliderImages = sliderResult.status === 'fulfilled'
    ? sliderResult.value.map(img => ({ id: img.id, url: resolveImageUrl(img.url) ?? img.url }))
    : [];

  const dbServices = servicesResult.status === 'fulfilled' ? servicesResult.value : [];
  const featuredServices = INITIAL_FEATURED.map(item => {
    const detailedMatch = SERVICES_DETAILED.find(
      s => s.slug === item.id || s.name.toLowerCase() === item.dbName.toLowerCase()
    );
    const canonicalSlug = detailedMatch ? detailedMatch.slug : item.id;
    const dbMatch = dbServices.find(
      s => s.name.toLowerCase() === item.dbName.toLowerCase() || s.id === canonicalSlug
    );
    if (dbMatch) {
      const resolvedDbImg = resolveImageUrl(dbMatch.imageUrl);
      const useCustomImage = resolvedDbImg && (resolvedDbImg.startsWith('/api/images/') || resolvedDbImg.startsWith('/services/catalog/'));
      return {
        ...item,
        id: canonicalSlug,
        bookId: dbMatch.id,
        image: useCustomImage ? resolvedDbImg : item.image,
        price: dbMatch.priceLabel || item.price,
      };
    }
    return {
      ...item,
      id: canonicalSlug,
      bookId: canonicalSlug,
    };
  });

  const dbReviews = reviewsResult.status === 'fulfilled' ? reviewsResult.value : [];
  const reviews = dbReviews.map((r: any) => ({
    name: r.user?.name || r.authorName || 'Client',
    text: r.text,
    date: new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
    initial: (r.user?.name || r.authorName || 'C').charAt(0).toUpperCase(),
    rating: r.rating || 5,
    source: r.source || undefined,
  }));

  const reviewStats = statsResult.status === 'fulfilled' ? statsResult.value : undefined;

  const data: HomeCachedData = {
    sliderImages,
    featuredServices,
    reviews,
    reviewStats,
    updatedAt: Date.now(),
  };
  g.__glitzHomeData = data;
  return data;
}

export default function HomePage() {
  const now = Date.now();
  const cached = g.__glitzHomeData;

  if ((!cached || now - cached.updatedAt > 60_000) && !g.__glitzHomeRefreshPromise) {
    g.__glitzHomeRefreshPromise = fetchHomeDataFromDB()
      .catch(() => undefined as unknown as HomeCachedData)
      .finally(() => {
        g.__glitzHomeRefreshPromise = undefined;
      });
  }

  return (
    <HomeClient
      initialSliderImages={cached && cached.sliderImages.length > 0 ? cached.sliderImages : undefined}
      initialFeaturedServices={cached ? cached.featuredServices : INITIAL_FEATURED}
      initialReviews={cached && cached.reviews.length > 0 ? cached.reviews : undefined}
      initialReviewStats={cached?.reviewStats}
    />
  );
}
