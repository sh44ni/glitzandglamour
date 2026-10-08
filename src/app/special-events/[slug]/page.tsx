import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import {
  getSpecialEventBySlug,
  ALL_SPECIAL_EVENT_SLUGS,
  SPECIAL_EVENTS_DETAILED,
  type DetailedSpecialEvent,
} from '@/data/specialEventsDetailed';
import { Sparkles, MapPin, Phone, Calendar, Clock, ChevronRight, CheckCircle2, Heart, ShieldCheck, Car } from 'lucide-react';
import RealReviewsSection from '@/components/RealReviewsSection';
import { getDynamicRealReviews, getFilteredRealReviews } from '@/lib/realReviews';

export const revalidate = 86400; // 24 hours ISR

export async function generateStaticParams() {
  return ALL_SPECIAL_EVENT_SLUGS.map((slug) => ({ slug }));
}

function canonicalUrl(slug: string) {
  return `https://www.glitzandglamours.com/special-events/${slug}`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const detailed = getSpecialEventBySlug(slug);

  if (detailed) {
    const canonical = canonicalUrl(detailed.slug);
    const imageUrl = detailed.heroImage.startsWith('http')
      ? detailed.heroImage
      : `https://www.glitzandglamours.com${detailed.heroImage}`;

    return {
      title: detailed.seoTitle,
      description: detailed.seoDescription,
      keywords: detailed.targetKeywords.join(', '),
      alternates: { canonical },
      openGraph: {
        title: detailed.seoTitle,
        description: detailed.seoDescription,
        type: 'website',
        url: canonical,
        images: [{ url: imageUrl, alt: `${detailed.name} in San Marcos, CA | Glitz & Glamour Studio` }],
      },
      twitter: {
        card: 'summary_large_image',
        title: detailed.seoTitle,
        description: detailed.seoDescription,
        images: [imageUrl],
      },
    };
  }

  // Graceful DB fallback if an admin-created category exists
  let cat: any = null;
  try {
    cat = await prisma.specialEventCategory.findFirst({
      where: { slug, isActive: true },
      select: { name: true, slug: true, description: true, imageUrl: true, tag: true },
    });
  } catch {
    cat = null;
  }

  if (!cat) {
    return {
      title: 'Special Event Glam | Glitz & Glamour Studio San Marcos CA',
      robots: { index: false, follow: false },
    };
  }

  const title = `${cat.name} in San Marcos CA | Glitz & Glamour Studio`.slice(0, 60);
  const description = (
    cat.description ||
    `Special event hair and makeup for ${cat.name} in San Marcos, Vista, and North County San Diego.`
  ).slice(0, 158);

  return {
    title,
    description,
    alternates: { canonical: canonicalUrl(cat.slug || slug) },
  };
}

interface PricingGuideData {
  eyebrow: string;
  title: string;
  description: string;
  influencersTitle: string;
  influencers: { title: string; desc: string }[];
  packagesTitle: string;
  packages: { badge: string; color: string; title: string; desc: string; quoteType: string }[];
  ctaTitle: string;
  ctaDesc: string;
}

function getPricingGuide(slug: string, eventName: string): PricingGuideData {
  switch (slug) {
    case 'weddings-bridal':
      return {
        eyebrow: 'Transparent Bridal Investment',
        title: 'San Diego Wedding Hair and Makeup Prices & Custom Quote Guide',
        description:
          'At Glitz & Glamour Studio, we do not believe in rigid one-size-fits-all packages with hidden fees. Every bridal party size, venue timeline, and styling preference is unique. We provide transparent, itemized custom quotes so you only invest in the exact services you and your party require.',
        influencersTitle: 'What Determines Your Custom Wedding Hair and Makeup Quote?',
        influencers: [
          {
            title: '1. Party Scale & Headcount',
            desc: 'Individualized artistry for the bride plus streamlined per-person rates for bridesmaids, mothers, and flower girls.',
          },
          {
            title: '2. In-Studio Preview Trial',
            desc: 'A private 2-hour trial at our San Marcos salon to test veil placement, airbrush foundation, and custom hair architecture.',
          },
          {
            title: '3. On-Location Travel',
            desc: 'Mobile travel across North County, La Jolla, and Temecula wine country with timeline and artist coordination.',
          },
          {
            title: '4. Custom Enhancements',
            desc: 'Clip-in extension installation, Hollywood wave sculpting, waterproof HD finishes, and day-of touch-up kits.',
          },
        ],
        packagesTitle: 'Signature Custom Bridal Packages',
        packages: [
          {
            badge: 'Signature Bride',
            color: '#FF2D78',
            title: 'The Couture Bride',
            desc: 'In-studio trial session + Day-of luxury hair architecture + HD airbrush makeup + custom lash clusters + veil placement & touch-up kit.',
            quoteType: 'Custom Itemized Proposal',
          },
          {
            badge: 'Group Glam',
            color: '#a855f7',
            title: 'The Bridal Party Collection',
            desc: 'Coordinated hair styling (updos, waves, half-up) + camera-ready event makeup & lashes for bridesmaids, mothers, and attendees.',
            quoteType: 'Quoted Per Person',
          },
          {
            badge: 'VIP All-Day',
            color: '#06b6d4',
            title: 'Full-Day Wedding Concierge',
            desc: 'Morning bridal styling plus on-site artist accompaniment through ceremony photos, veil removal, and reception grand entrance.',
            quoteType: 'Full-Day Custom Retainer',
          },
        ],
        ctaTitle: 'Ready for Your Personalized Wedding Proposal?',
        ctaDesc: 'Submit your date, headcount, and venue for a fast, no-obligation custom quote.',
      };

    case 'on-location-hair-makeup':
      return {
        eyebrow: 'Transparent Mobile Beauty Investment',
        title: 'On-Location Hair and Makeup Prices & Mobile Glam Quote Guide',
        description:
          'We bring the luxury salon experience directly to your bridal suite, hotel, or private estate across San Diego County. Every quote is custom-tailored to your party size, timeline, and venue location with zero surprise setup or kit fees.',
        influencersTitle: 'What Determines Your On-Location Hair and Makeup Prices?',
        influencers: [
          {
            title: '1. Service Headcount & Party Size',
            desc: 'Solo VIP sessions or multi-artist glam squads for large wedding parties and celebration groups.',
          },
          {
            title: '2. Venue Location & Mileage',
            desc: 'Transparent travel rates calculated by round-trip mileage from our San Marcos studio to your venue.',
          },
          {
            title: '3. Hair Updos Cost & Complexity',
            desc: 'From effortless beach waves and blowouts to sculpted Hollywood waves, intricate pinned hair updos, and extensions.',
          },
          {
            title: '4. On-Set Concierge Presence',
            desc: 'Morning ready-by service only, or having a dedicated lead artist remain on-site for photography touch-ups.',
          },
        ],
        packagesTitle: 'Signature Mobile Event Packages',
        packages: [
          {
            badge: 'Mobile VIP',
            color: '#3b82f6',
            title: 'The Private Suite Experience',
            desc: 'Full-service mobile hair architecture and camera-ready HD makeup in your hotel room, bridal suite, or private residence.',
            quoteType: 'Tailored VIP Proposal',
          },
          {
            badge: 'Squad Mobile',
            color: '#a855f7',
            title: 'The Mobile Bridal Party Collective',
            desc: 'Synchronized on-location hair and makeup stations for bridesmaids, moms, and celebration groups with coordinated timelines.',
            quoteType: 'Quoted Per Person',
          },
          {
            badge: 'All-Day Concierge',
            color: '#06b6d4',
            title: 'The Full-Day Mobile Concierge',
            desc: 'Continuous on-location artist presence for touch-ups through ceremonies, wind, and reception look transformations.',
            quoteType: 'Full-Day Custom Retainer',
          },
        ],
        ctaTitle: 'Ready for Your Mobile Glam Proposal?',
        ctaDesc: 'Submit your event address, headcount, and ready-by time for an immediate custom quote.',
      };

    case 'bridal-showers-bachelorettes':
      return {
        eyebrow: 'Group Celebration Investment',
        title: 'Bridal Party & Bachelorette Hair and Makeup Prices Guide',
        description:
          'Celebrate the bride-to-be with cohesive, stress-free beauty. We offer flexible per-person rates for bridal party hair prices and bridesmaid makeup, whether hosting at our San Marcos salon or having our mobile team come to your Airbnb.',
        influencersTitle: 'What Determines Your Bridal Party Hair Prices & Glam Quote?',
        influencers: [
          {
            title: '1. Guest Count & Service Mix',
            desc: 'Guests can choose hair only, makeup only, or full glam—tailored to each individual attendant’s preference.',
          },
          {
            title: '2. Setting: In-Studio vs Mobile Rental',
            desc: 'Private salon takeover at our San Marcos studio with champagne vibe or on-location glam at your coastal rental.',
          },
          {
            title: '3. Hair Updos Cost & Styling Finish',
            desc: 'Effortless beach waves and blowouts vs voluminous formal updos and sculpted Hollywood glamour.',
          },
          {
            title: '4. Timeline & Artist Allocation',
            desc: 'Coordinated scheduling with dedicated artists to guarantee everyone finishes together for toasts and photos.',
          },
        ],
        packagesTitle: 'Signature Bridal Party & Bachelorette Packages',
        packages: [
          {
            badge: 'Bride of Honor',
            color: '#06b6d4',
            title: 'The Spotlight Bride Glam',
            desc: 'Elevated hair and makeup designed to ensure the bride stands out gorgeously at her shower or bachelorette.',
            quoteType: 'Spotlight Proposal',
          },
          {
            badge: 'Squad Collection',
            color: '#ec4899',
            title: 'The Bride Squad Beauty Bar',
            desc: 'Coordinated party waves, blowouts, and radiant soft glam with custom lashes for bridesmaids and besties.',
            quoteType: 'Quoted Per Person',
          },
          {
            badge: 'Studio Takeover',
            color: '#a855f7',
            title: 'Private Salon Champagne VIP',
            desc: 'Exclusive multi-hour rental of our San Marcos salon with private stations, music, and dedicated stylists.',
            quoteType: 'Private Studio Buyout',
          },
        ],
        ctaTitle: 'Ready to Plan Your Squad’s Glam?',
        ctaDesc: 'Tell us your dates, guest count, and whether you prefer in-studio or mobile pampering.',
      };

    case 'quinceaneras':
      return {
        eyebrow: 'Quinceañera Milestone Investment',
        title: 'Quinceañera Hair and Makeup Prices & Court of Honor Package Guide',
        description:
          'Every quinceañera deserves to feel like royalty on her milestone celebration. We provide transparent package estimates covering the quinceañera, crown placement, and special group rates for her Damas court of honor.',
        influencersTitle: 'What Determines Your Quinceañera Hair and Makeup Quote?',
        influencers: [
          {
            title: '1. Crown & Tiara Anchoring',
            desc: 'Zero-slip anchor pinning for heavy tiaras, royal crowns, and hair jewelry to withstand hours of dancing.',
          },
          {
            title: '2. Hair Updos Cost & Volume Architecture',
            desc: 'Cascading Hollywood curls, textured formal updos, and clip-in extension blending for maximum drama.',
          },
          {
            title: '3. Damas Court Headcount',
            desc: 'Group rate packages for 4, 6, 8, or more damas and chambelanes grooming with synchronized timelines.',
          },
          {
            title: '4. In-Studio vs On-Location Banquet Hall',
            desc: 'Pampering in our spacious San Marcos salon or mobile artist stations at your home or reception hall.',
          },
        ],
        packagesTitle: 'Signature Quinceañera Packages',
        packages: [
          {
            badge: 'Quinceañera Queen',
            color: '#a855f7',
            title: 'The Quinceañera Royal Crown Package',
            desc: 'Full HD camera-tested glam, lashes, tiara anchoring, high-volume curls or textured updo, plus preview trial.',
            quoteType: 'Royal Custom Proposal',
          },
          {
            badge: 'Damas Court',
            color: '#ec4899',
            title: 'The Court of Honor Collection',
            desc: 'Coordinated soft glam and elegant hairstyles for your damas, quoted per person with group savings.',
            quoteType: 'Quoted Per Dama',
          },
          {
            badge: 'Full Family Glam',
            color: '#3b82f6',
            title: 'The Royal Family Celebration',
            desc: 'Styling for the quinceañera, mom, sisters, and damas with dedicated on-location or in-studio team.',
            quoteType: 'Complete Family Proposal',
          },
        ],
        ctaTitle: 'Reserve Your Quinceañera Glam Team',
        ctaDesc: 'Submit your date, headcount, and venue for an immediate custom quote in English or Spanish.',
      };

    case 'prom-homecoming':
      return {
        eyebrow: 'Student Formal Investment',
        title: 'Prom & Homecoming Hair & Makeup Prices & Group Rates Guide',
        description:
          'Look like you just walked off the red carpet without the celebrity price tag. We offer transparent student pricing and group savings for high school formals across North County San Diego.',
        influencersTitle: 'What Determines Your Prom Hair and Makeup Prices?',
        influencers: [
          {
            title: '1. Hair Styling & Hair Updos Cost',
            desc: 'From effortless beach waves and sleek blowouts to sculpted Hollywood waves and intricate pinned updos.',
          },
          {
            title: '2. Makeup Finish: Soft Glam vs Full Beat',
            desc: 'Airbrush-effect dewy skin, clean-girl glow, or dramatic feline wings with fluttery false lashes.',
          },
          {
            title: '3. Group Booking Savings',
            desc: 'Book back-to-back or simultaneous time slots with your best friends for special group rates.',
          },
          {
            title: '4. Extension Placement & Accessories',
            desc: 'Blending clip-in extensions or pinning delicate hair jewelry and florals to complement your dress.',
          },
        ],
        packagesTitle: 'Signature Prom & Formal Dance Packages',
        packages: [
          {
            badge: 'Red Carpet Solo',
            color: '#ec4899',
            title: 'The Prom Queen Full Glam',
            desc: 'Full HD complexion makeup, custom fluttery lashes, sculpted brows, and formal hair styling or updo.',
            quoteType: 'Student Solo Rate',
          },
          {
            badge: 'Besties Duo',
            color: '#a855f7',
            title: 'The Best Friends Glam Duo',
            desc: 'Back-to-back appointments in our San Marcos studio with photo-ready lighting and complimentary lash application.',
            quoteType: 'Duo Booking Rate',
          },
          {
            badge: 'Squad Package',
            color: '#3b82f6',
            title: 'The Formal Group Collection',
            desc: 'Coordinated hair and makeup appointments for 3 or more friends with group rate savings.',
            quoteType: 'Group Student Rate',
          },
        ],
        ctaTitle: 'Lock in Your Prom Glam Time Slot',
        ctaDesc: 'Prom dates fill quickly across North County. Inquire now to secure appointments for you and your friends.',
      };

    case 'corporate-gala':
      return {
        eyebrow: 'Executive & Black-Tie Investment',
        title: 'Corporate Gala Hair and Makeup Prices & Executive Retainer Guide',
        description:
          'Refined, commanding, and polished to stage-ready perfection. We provide transparent corporate packages, multi-attendee discounts, and commercial invoicing for award galas and executive summits.',
        influencersTitle: 'What Determines Your Corporate Hair and Makeup Prices?',
        influencers: [
          {
            title: '1. Attendee Count & Schedule Windows',
            desc: 'Individual executive appointments or synchronized corporate styling suites for entire leadership teams.',
          },
          {
            title: '2. Stage vs Gala Dinner Lighting',
            desc: 'Formulations designed to eliminate shine under continuous 4K stage spotlights or flattering candlelight.',
          },
          {
            title: '3. Hair Updos Cost & Styling Discipline',
            desc: 'From polished power blowouts and sleek chignons to formal gala Hollywood waves.',
          },
          {
            title: '4. Billing & Invoicing Needs',
            desc: 'Seamless corporate card processing, Net-30 invoicing, and itemized receipts for business expense reconciliation.',
          },
        ],
        packagesTitle: 'Signature Corporate & Gala Packages',
        packages: [
          {
            badge: 'Keynote Executive',
            color: '#3b82f6',
            title: 'The Stage & Podium Polish',
            desc: 'Anti-glare stage HD makeup, precision brow and hair grooming, and all-day setting techniques.',
            quoteType: 'Executive Proposal',
          },
          {
            badge: 'Gala Black-Tie',
            color: '#a855f7',
            title: 'The Red Carpet Gala Experience',
            desc: 'Formal evening hair updo or waves, radiant complexion, smoky eyes, and elegant lash enhancement.',
            quoteType: 'Gala Retainer',
          },
          {
            badge: 'Corporate Suite',
            color: '#06b6d4',
            title: 'The VIP On-Site Beauty Lounge',
            desc: 'Mobile styling stations and touch-up artists hosted directly at your conference or gala venue.',
            quoteType: 'Corporate Day Rate',
          },
        ],
        ctaTitle: 'Book Your Corporate Event Styling Team',
        ctaDesc: 'Submit your event schedule, venue, and attendee count for a prompt commercial proposal.',
      };

    case 'photo-video-shoots':
      return {
        eyebrow: 'Production & Commercial Investment',
        title: 'Photoshoot & Editorial Hair & Makeup Prices & Production Day Rates',
        description:
          'Camera-tested, high-definition artistry for commercial campaigns, branding sessions, and wedding photo shoots. Transparent half-day and full-day rates with on-set continuity.',
        influencersTitle: 'What Determines Your Photoshoot Hair and Makeup Prices?',
        influencers: [
          {
            title: '1. Talent Count & Number of Looks',
            desc: 'Single-subject branding headshots or multi-model editorial campaigns with wardrobe transitions.',
          },
          {
            title: '2. Booking Duration & Format',
            desc: 'In-studio prep at our San Marcos salon, half-day (up to 4 hrs), or full-day (up to 8 hrs) on-set presence.',
          },
          {
            title: '3. Lighting & Camera Sensor Calibration',
            desc: 'Zero-flashback pigments calibrated for 4K video, outdoor coastal sunlight, or high-output studio strobes.',
          },
          {
            title: '4. Hair Updos Cost & Continuity',
            desc: 'Maintaining windblown hair, resetting styles, and on-set monitor watching between takes.',
          },
        ],
        packagesTitle: 'Signature Shoot & Production Packages',
        packages: [
          {
            badge: 'Personal Branding',
            color: '#8b5cf6',
            title: 'The Executive Headshot & Creator Prep',
            desc: '1-2 camera-ready hair and makeup looks in our San Marcos studio before your photo session.',
            quoteType: 'In-Studio Rate',
          },
          {
            badge: 'Half-Day Retainer',
            color: '#ec4899',
            title: 'The Half-Day On-Set Retainer (Up to 4 Hrs)',
            desc: 'On-set artist presence for touch-ups, flyaway control, and look refreshes between camera takes.',
            quoteType: 'Half-Day Day Rate',
          },
          {
            badge: 'Full-Day Editorial',
            color: '#06b6d4',
            title: 'The Full-Day Commercial Retainer (Up to 8 Hrs)',
            desc: 'Dedicated lead artist for commercial video shoots, multiple talent, and wardrobe styling resets.',
            quoteType: 'Full-Day Day Rate',
          },
        ],
        ctaTitle: 'Book Your On-Set Hair & Makeup Artist',
        ctaDesc: 'Share your call sheet, talent count, and location for an immediate production estimate.',
      };

    default:
      return {
        eyebrow: 'Transparent Event Investment',
        title: `${eventName} Hair and Makeup Prices & Custom Quote Guide`,
        description:
          'At Glitz & Glamour Studio, we do not believe in rigid one-size-fits-all packages with hidden fees. Every event timeline and styling preference is unique. We provide transparent, itemized custom quotes so you only invest in the exact services you require.',
        influencersTitle: `What Determines Your ${eventName} Hair and Makeup Quote?`,
        influencers: [
          {
            title: '1. Guest Count & Service Selection',
            desc: 'Solo glam sessions or group appointments for celebration parties with friends and family.',
          },
          {
            title: '2. In-Studio vs Mobile Location',
            desc: 'Pampering in our San Marcos flagship studio or mobile on-location service across San Diego County.',
          },
          {
            title: '3. Hair Updos Cost & Complexity',
            desc: 'From curled blowouts and textured beach waves to intricate formal pinned hair updos and extensions.',
          },
          {
            title: '4. Custom Enhancements',
            desc: 'Airbrush-finish foundation, custom lash applications, and 12-hour setting longevity.',
          },
        ],
        packagesTitle: `Signature ${eventName} Packages`,
        packages: [
          {
            badge: 'Signature Glam',
            color: '#FF2D78',
            title: `The Signature ${eventName} Experience`,
            desc: 'Full camera-ready makeup with lashes and precision hair styling tailored to your event.',
            quoteType: 'Custom Itemized Proposal',
          },
          {
            badge: 'Group Celebration',
            color: '#a855f7',
            title: 'The Celebration Squad Package',
            desc: 'Coordinated hair and makeup appointments for you and your guests with group savings.',
            quoteType: 'Quoted Per Person',
          },
          {
            badge: 'Mobile VIP',
            color: '#3b82f6',
            title: 'The On-Location Experience',
            desc: 'Mobile glam squad traveling to your home, venue, or hotel suite with professional lighting.',
            quoteType: 'Mobile VIP Proposal',
          },
        ],
        ctaTitle: `Ready for Your ${eventName} Proposal?`,
        ctaDesc: 'Submit your date, headcount, and venue for a fast, no-obligation custom quote.',
      };
  }
}

export default async function SpecialEventPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const detailed = getSpecialEventBySlug(slug);

  // If accessed by an alias, 301 redirect to canonical slug
  if (detailed && slug !== detailed.slug) {
    redirect(`/special-events/${detailed.slug}`);
  }

  // If not found in static dataset, check database fallback
  let dbCategory: any = null;
  if (!detailed) {
    try {
      dbCategory = await prisma.specialEventCategory.findFirst({
        where: { slug, isActive: true },
      });
    } catch {
      dbCategory = null;
    }
    if (!dbCategory) {
      notFound();
    }
  }

  // Related events for bottom navigation
  const relatedEvents = detailed
    ? detailed.relatedSlugs
        .map((s) => getSpecialEventBySlug(s))
        .filter((e): e is DetailedSpecialEvent => !!e)
        .slice(0, 3)
    : SPECIAL_EVENTS_DETAILED.filter((e) => e.slug !== slug).slice(0, 3);

  const eventName = detailed ? detailed.name : dbCategory.name;
  const pricingGuide = getPricingGuide(slug, eventName);

  // Fetch dynamic, auto-updating real reviews from the DB (with verified fallback cache)
  const allReviews = await getDynamicRealReviews();
  const realReviews = getFilteredRealReviews({
    allReviews,
    slug,
    keywords: detailed ? detailed.targetKeywords : ['bridal', 'wedding', 'hair', 'makeup', 'glam'],
    limit: 2,
  });

  // Prepare Schema.org JSON-LD Structured Data
  const jsonLdService = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: eventName,
    name: eventName,
    description: detailed ? detailed.seoDescription : dbCategory.description,
    provider: {
      '@type': 'BeautySalon',
      name: 'Glitz & Glamour Studio',
      image: 'https://www.glitzandglamours.com/special-events/ev-weddings.png',
      telephone: '+1-760-290-5910',
      address: {
        '@type': 'PostalAddress',
        streetAddress: '935 W San Marcos Blvd, Suite 101',
        addressLocality: 'San Marcos',
        addressRegion: 'CA',
        postalCode: '92078',
        addressCountry: 'US',
      },
      url: 'https://www.glitzandglamours.com',
      priceRange: '$$',
    },
    areaServed: [
      { '@type': 'City', name: 'San Marcos, CA' },
      { '@type': 'City', name: 'Vista, CA' },
      { '@type': 'City', name: 'Carlsbad, CA' },
      { '@type': 'City', name: 'Escondido, CA' },
      { '@type': 'City', name: 'Oceanside, CA' },
      { '@type': 'City', name: 'Encinitas, CA' },
      { '@type': 'City', name: 'La Jolla, CA' },
      { '@type': 'AdministrativeArea', name: 'San Diego County, CA' },
    ],
    url: canonicalUrl(detailed ? detailed.slug : dbCategory.slug || slug),
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: `${eventName} Styling Packages`,
      itemListElement: pricingGuide.packages.map((pkg) => ({
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: pkg.title,
          description: pkg.desc,
        },
      })),
    },
  };

  const faqs = detailed?.faqs || [];
  const jsonLdFaq =
    faqs.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faqs.map((f) => ({
            '@type': 'Question',
            name: f.q,
            acceptedAnswer: { '@type': 'Answer', text: f.a },
          })),
        }
      : null;

  const jsonLdBreadcrumbs = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.glitzandglamours.com' },
      { '@type': 'ListItem', position: 2, name: 'Special Events', item: 'https://www.glitzandglamours.com/special-events' },
      { '@type': 'ListItem', position: 3, name: detailed ? detailed.name : dbCategory.name, item: canonicalUrl(detailed ? detailed.slug : slug) },
    ],
  };

  return (
    <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh', paddingBottom: '90px' }}>
      {/* Schema.org scripts */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdService) }} />
      {jsonLdFaq && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFaq) }} />}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumbs) }} />

      <style>{`
        .se-hero-wrap {
          border-radius: 28px;
          overflow: hidden;
          position: relative;
          min-height: 480px;
          display: flex;
          align-items: flex-end;
          border: 1px solid rgba(255, 45, 120, 0.2);
          box-shadow: 0 24px 70px rgba(0, 0, 0, 0.7);
          margin-bottom: 32px;
        }
        .se-feature-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 16px;
          margin-bottom: 32px;
        }
        .se-content-grid {
          display: grid;
          grid-template-columns: 1.25fr 0.75fr;
          gap: 24px;
        }
        .se-step-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 14px;
        }
        .se-faq-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          overflow: hidden;
          margin-bottom: 12px;
          transition: all 0.25s ease;
        }
        .se-faq-card[open] {
          border-color: rgba(255, 45, 120, 0.35);
          background: rgba(255, 45, 120, 0.04);
        }
        .se-faq-summary {
          padding: 18px 20px;
          cursor: pointer;
          list-style: none;
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-weight: 600;
          font-size: 15px;
          color: #fff;
          user-select: none;
        }
        .se-faq-summary::-webkit-details-marker {
          display: none;
        }
        @media (max-width: 900px) {
          .se-content-grid {
            grid-template-columns: 1fr;
          }
          .se-sidebar {
            order: -1;
          }
        }
        @media (max-width: 600px) {
          .se-hero-wrap {
            min-height: 400px;
            border-radius: 20px;
          }
        }
      `}</style>

      <div style={{ maxWidth: '1140px', margin: '0 auto', padding: '16px 20px 60px' }}>
        {/* ── Breadcrumb Bar ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' }}>
          <nav aria-label="Breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#888' }}>
            <Link href="/" style={{ color: '#aaa', textDecoration: 'none' }}>Home</Link>
            <span>/</span>
            <Link href="/special-events" style={{ color: '#aaa', textDecoration: 'none' }}>Special Events</Link>
            <span>/</span>
            <span style={{ color: '#FF2D78', fontWeight: 600 }}>{detailed ? detailed.name : dbCategory.name}</span>
          </nav>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,45,120,0.1)', border: '1px solid rgba(255,45,120,0.25)', borderRadius: '50px', padding: '4px 14px' }}>
            <MapPin size={12} color="#FF2D78" />
            <span style={{ fontSize: '11px', color: '#fff', fontWeight: 600, letterSpacing: '0.3px' }}>
              San Marcos Studio &amp; Mobile Across San Diego
            </span>
          </div>
        </div>

        {/* ── Hero Section ── */}
        <section className="se-hero-wrap">
          <Image
            src={detailed ? detailed.heroImage : dbCategory.imageUrl || '/special-events/ev-weddings.png'}
            alt={detailed ? `${detailed.name} in San Marcos, CA` : dbCategory.name}
            fill
            priority
            style={{ objectFit: 'cover', objectPosition: 'center 30%' }}
            sizes="(max-width: 1200px) 100vw, 1140px"
          />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(10,10,10,0.25) 0%, rgba(10,10,10,0.65) 50%, rgba(10,10,10,0.96) 100%)' }} />

          <div style={{ position: 'relative', zIndex: 2, padding: 'clamp(24px, 5vw, 48px)', maxWidth: '820px' }}>
            {detailed?.tag && (
              <span style={{ display: 'inline-block', fontSize: '11px', fontWeight: 800, letterSpacing: '1.5px', textTransform: 'uppercase', background: detailed.badge || '#FF2D78', color: '#fff', padding: '4px 14px', borderRadius: '50px', marginBottom: '14px', boxShadow: '0 4px 12px rgba(255,45,120,0.3)' }}>
                ✦ {detailed.tag}
              </span>
            )}

            <h1 style={{ fontWeight: 800, color: '#fff', fontSize: 'clamp(1.9rem, 4.5vw, 3.2rem)', lineHeight: 1.1, letterSpacing: '-0.8px', marginBottom: '14px' }}>
              {detailed?.h1 || dbCategory.name}
            </h1>

            <p style={{ color: '#e0e0e0', fontSize: 'clamp(14px, 1.8vw, 16px)', lineHeight: 1.7, marginBottom: '20px', maxWidth: '720px' }}>
              {detailed?.shortDesc || dbCategory.description}
            </p>

            {detailed?.pills && detailed.pills.length > 0 && (
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
                {detailed.pills.map((pill) => (
                  <span
                    key={pill}
                    style={{
                      fontSize: '11px',
                      fontWeight: 600,
                      letterSpacing: '0.4px',
                      textTransform: 'uppercase',
                      background: 'rgba(0, 0, 0, 0.4)',
                      border: '1px solid rgba(255, 255, 255, 0.25)',
                      backdropFilter: 'blur(8px)',
                      color: '#fff',
                      padding: '4px 12px',
                      borderRadius: '50px',
                    }}
                  >
                    {pill}
                  </span>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
              <Link href="/special-events#inquire" className="btn-primary" style={{ padding: '13px 26px', fontSize: '14px', fontWeight: 700 }}>
                Request Custom Quote <ChevronRight size={16} />
              </Link>
              <a href="tel:+17602905910" className="btn-outline" style={{ padding: '13px 22px', fontSize: '14px', background: 'rgba(255,255,255,0.08)', color: '#fff', borderColor: 'rgba(255,255,255,0.25)' }}>
                <Phone size={15} style={{ marginRight: 6 }} /> (760) 290-5910
              </a>
            </div>
          </div>
        </section>

        {/* ── Services Breakdown Grid (What We Offer For This Event) ── */}
        {detailed?.servicesOffered && detailed.servicesOffered.length > 0 && (
          <section style={{ marginBottom: '40px' }}>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <p style={{ color: '#FF2D78', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '2.5px', marginBottom: '6px' }}>
                <Sparkles size={13} style={{ display: 'inline', marginRight: 6 }} />Tailored Artistry
              </p>
              <h2 style={{ fontWeight: 700, fontSize: 'clamp(1.5rem, 3.2vw, 2.2rem)', color: '#fff', letterSpacing: '-0.5px' }}>
                Specialized Services for <span className="text-gradient">{detailed.name}</span>
              </h2>
            </div>

            <div className="se-feature-grid">
              {detailed.servicesOffered.map((svc, i) => (
                <div key={i} className="glass-card" style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(255,45,120,0.1)', border: '1px solid rgba(255,45,120,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FF2D78', marginBottom: '14px', fontWeight: 800 }}>
                    0{i + 1}
                  </div>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>{svc.title}</h3>
                  <p style={{ fontSize: '13px', color: '#999', lineHeight: 1.65, margin: 0 }}>{svc.desc}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Main Two-Column Content Layout ── */}
        <div className="se-content-grid">
          {/* Left Column: Overview, What's Included, Timelines, FAQs */}
          <main style={{ minWidth: 0 }}>
            {/* Overview / Story & Local Authority */}
            {detailed?.overview && (
              <section className="glass-card" style={{ padding: '30px 24px', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={18} color="#FF2D78" /> Overview &amp; Experience
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {detailed.overview.map((para, i) => (
                    <p key={i} style={{ color: '#ccc', fontSize: '14px', lineHeight: 1.8, margin: 0 }}>
                      {para}
                    </p>
                  ))}
                </div>
              </section>
            )}

            {/* What's Included List */}
            {detailed?.whatsIncluded && detailed.whatsIncluded.length > 0 && (
              <section className="glass-card" style={{ padding: '30px 24px', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={18} color="#FF2D78" /> What&apos;s Included in Your Service
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
                  {detailed.whatsIncluded.map((item, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                      <CheckCircle2 size={16} color="#FF2D78" style={{ flexShrink: 0, marginTop: '3px' }} />
                      <span style={{ fontSize: '13px', color: '#ddd', lineHeight: 1.6 }}>{item}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Preparation & Day-Of Timeline Guide */}
            {detailed?.timelineGuide && detailed.timelineGuide.length > 0 && (
              <section className="glass-card" style={{ padding: '30px 24px', marginBottom: '24px' }}>
                <div style={{ marginBottom: '18px' }}>
                  <p style={{ color: '#FF2D78', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '4px' }}>
                    Stress-Free Planning
                  </p>
                  <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', margin: 0 }}>
                    Event Timeline &amp; Booking Process
                  </h2>
                </div>
                <div className="se-step-grid">
                  {detailed.timelineGuide.map((step, i) => (
                    <div
                      key={i}
                      style={{
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid rgba(255,255,255,0.06)',
                        borderRadius: '14px',
                        padding: '18px 16px',
                        position: 'relative',
                      }}
                    >
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#FF2D78', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        {step.step}
                      </span>
                      <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#fff', margin: '6px 0 8px' }}>{step.title}</h3>
                      <p style={{ fontSize: '12px', color: '#999', lineHeight: 1.6, margin: 0 }}>{step.desc}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Dedicated Pricing & Custom Quote Investment Guide (#pricing) */}
            <section id="pricing" className="glass-card" style={{ padding: '32px 24px', marginBottom: '24px', border: '1px solid rgba(255, 45, 120, 0.25)' }}>
              <div style={{ marginBottom: '20px' }}>
                <p style={{ color: '#FF2D78', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '4px' }}>
                  {pricingGuide.eyebrow}
                </p>
                <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#fff', margin: '0 0 8px' }}>
                  {pricingGuide.title}
                </h2>
                <p style={{ color: '#ccc', fontSize: '13px', lineHeight: 1.75, margin: 0 }}>
                  {pricingGuide.description}
                </p>
              </div>

              {/* 4 Cost Influencers Grid */}
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#fff', marginBottom: '14px' }}>
                {pricingGuide.influencersTitle}
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '14px', marginBottom: '24px' }}>
                {pricingGuide.influencers.map((inf, idx) => (
                  <div key={idx} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', padding: '16px' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#FF6BA8', margin: '0 0 6px' }}>{inf.title}</h4>
                    <p style={{ fontSize: '12px', color: '#aaa', lineHeight: 1.6, margin: 0 }}>{inf.desc}</p>
                  </div>
                ))}
              </div>

              {/* 3 Bespoke Package Tiers Card */}
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#fff', marginBottom: '14px' }}>
                {pricingGuide.packagesTitle}
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '14px', marginBottom: '22px' }}>
                {pricingGuide.packages.map((pkg, idx) => (
                  <div key={idx} style={{ background: `${pkg.color}0a`, border: `1px solid ${pkg.color}33`, borderRadius: '16px', padding: '18px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: pkg.color, textTransform: 'uppercase', letterSpacing: '1px' }}>{pkg.badge}</span>
                    <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#fff', margin: '6px 0 8px' }}>{pkg.title}</h4>
                    <p style={{ fontSize: '12px', color: '#bbb', lineHeight: 1.6, margin: '0 0 12px' }}>
                      {pkg.desc}
                    </p>
                    <span style={{ fontSize: '11px', color: pkg.color, fontWeight: 600 }}>{pkg.quoteType}</span>
                  </div>
                ))}
              </div>

              {/* Instant Quote CTA Strip */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px', padding: '18px 20px', borderRadius: '14px', background: 'linear-gradient(135deg, rgba(255,45,120,0.15), rgba(168,85,247,0.1))', border: '1px solid rgba(255,45,120,0.3)' }}>
                <div>
                  <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#fff', margin: '0 0 4px' }}>{pricingGuide.ctaTitle}</h4>
                  <p style={{ fontSize: '12px', color: '#ddd', margin: 0 }}>{pricingGuide.ctaDesc}</p>
                </div>
                <Link href="/special-events#inquire" className="btn-primary" style={{ padding: '10px 18px', fontSize: '13px', fontWeight: 700 }}>
                  Request Custom Quote <ChevronRight size={14} />
                </Link>
              </div>
            </section>

            {/* Real Bride & Client Testimonials with Auto-Update and Keyword Relevance */}
            <RealReviewsSection
              reviews={realReviews}
              eyebrow="Real Brides & Clients"
              title={
                slug === 'weddings-bridal'
                  ? 'What Our Brides & Clients Say'
                  : slug === 'on-location-hair-makeup'
                  ? 'What Our On-Location Brides & Clients Say'
                  : `What Our ${detailed?.name || 'Event'} Clients Say`
              }
            />

            {/* FAQs Accordion */}
            {faqs.length > 0 && (
              <section style={{ marginBottom: '24px' }}>
                <div style={{ marginBottom: '18px' }}>
                  <p style={{ color: '#FF2D78', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '4px' }}>
                    Questions &amp; Answers
                  </p>
                  <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', margin: 0 }}>
                    Frequently Asked Questions
                  </h2>
                </div>

                <div>
                  {faqs.map((faq, i) => (
                    <details key={i} className="se-faq-card">
                      <summary className="se-faq-summary">
                        <span>{faq.q}</span>
                        <ChevronRight size={16} color="#FF2D78" style={{ transform: 'rotate(90deg)', flexShrink: 0, marginLeft: '12px' }} />
                      </summary>
                      <div style={{ padding: '0 20px 18px', color: '#aaa', fontSize: '13px', lineHeight: 1.75 }}>
                        {faq.a}
                      </div>
                    </details>
                  ))}
                </div>
              </section>
            )}
          </main>

          {/* Right Sidebar: Location Info, Quick Inquiry CTA, Venue Coverage */}
          <aside className="se-sidebar" style={{ minWidth: 0 }}>
            <div style={{ position: 'sticky', top: '90px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* Ready to Book Card */}
              <div
                style={{
                  background: 'linear-gradient(135deg, rgba(255,45,120,0.12), rgba(168,85,247,0.08))',
                  border: '1px solid rgba(255,45,120,0.3)',
                  borderRadius: '20px',
                  padding: '24px 20px',
                  boxShadow: '0 12px 36px rgba(0,0,0,0.4)',
                }}
              >
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#FF2D78', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
                  <Calendar size={13} /> Reserve Your Date
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>
                  Planning Your {detailed ? detailed.name.split(' ')[0] : 'Event'}?
                </h3>
                <p style={{ color: '#ccc', fontSize: '13px', lineHeight: 1.6, marginBottom: '16px' }}>
                  Dates fill quickly across San Marcos and San Diego County. Fill out our short inquiry questionnaire to receive custom pricing and availability within 48 hours.
                </p>
                <Link href="/special-events#inquire" className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '13px', fontSize: '14px', fontWeight: 700, marginBottom: '10px' }}>
                  Start Your Inquiry <ChevronRight size={15} />
                </Link>
                <a
                  href="tel:+17602905910"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    color: '#fff',
                    textDecoration: 'none',
                    fontSize: '12px',
                    fontWeight: 600,
                    padding: '8px',
                    borderRadius: '10px',
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.12)',
                  }}
                >
                  <Phone size={13} color="#FF2D78" /> Call (760) 290-5910
                </a>
              </div>

              {/* Geographic Coverage Card (San Marcos + Vista Move + Venues) */}
              <div className="glass-card" style={{ padding: '22px 18px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#fff', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MapPin size={15} color="#FF2D78" /> Location &amp; Travel Radius
                </h4>
                <p style={{ fontSize: '12px', color: '#aaa', lineHeight: 1.6, marginBottom: '12px' }}>
                  <strong style={{ color: '#fff' }}>Flagship Studio:</strong> 935 W San Marcos Blvd, Suite 101, San Marcos, CA 92078 (just minutes from our former Vista location).
                </p>
                <p style={{ fontSize: '12px', color: '#aaa', lineHeight: 1.6, marginBottom: '12px' }}>
                  <strong style={{ color: '#fff' }}>On-Location Travel:</strong> We bring our glam team to venues, hotels, and homes across:
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '14px' }}>
                  {['San Marcos', 'Vista', 'Carlsbad', 'Escondido', 'Oceanside', 'Encinitas', 'San Elijo Hills', 'Rancho Santa Fe', 'Del Mar', 'Temecula'].map((city) => (
                    <span key={city} style={{ fontSize: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#ddd', padding: '3px 8px', borderRadius: '50px' }}>
                      {city}
                    </span>
                  ))}
                </div>
                {detailed?.serviceAreas?.venues && (
                  <div>
                    <span style={{ fontSize: '11px', color: '#888', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>
                      Featured Local Venues Served:
                    </span>
                    <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '11px', color: '#bbb', lineHeight: 1.6 }}>
                      {detailed.serviceAreas.venues.map((v) => (
                        <li key={v}>{v}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Peace of Mind Guarantees */}
              <div className="glass-card" style={{ padding: '18px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12px', color: '#bbb' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ShieldCheck size={16} color="#FF2D78" /> Licensed &amp; Insured Beauty Artists
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Car size={16} color="#FF2D78" /> Punctual On-Location Arrival Guarantee
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Heart size={16} color="#FF2D78" /> 5-Star Rated Across Google &amp; Yelp
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>

        {/* ── Related Special Events Navigation ── */}
        <section style={{ marginTop: '56px', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <p style={{ color: '#FF2D78', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '2px', margin: 0 }}>
                Explore More
              </p>
              <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#fff', margin: '4px 0 0' }}>
                Other Special Events We Celebrate
              </h2>
            </div>
            <Link href="/special-events" style={{ color: '#FF2D78', textDecoration: 'none', fontSize: '13px', fontWeight: 600 }}>
              View All Special Events →
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
            {relatedEvents.map((r) => (
              <Link key={r.slug} href={`/special-events/${r.slug}`} style={{ textDecoration: 'none' }}>
                <div
                  className="glass-card"
                  style={{
                    padding: 0,
                    overflow: 'hidden',
                    borderRadius: '18px',
                    transition: 'transform 0.3s ease, border-color 0.3s ease',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <div style={{ position: 'relative', height: '140px', width: '100%' }}>
                    <Image src={r.heroImage} alt={r.name} fill style={{ objectFit: 'cover' }} sizes="(max-width: 768px) 100vw, 33vw" />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)' }} />
                    <span style={{ position: 'absolute', top: '12px', left: '12px', fontSize: '10px', fontWeight: 700, background: r.badge, color: '#fff', padding: '3px 10px', borderRadius: '50px', textTransform: 'uppercase' }}>
                      {r.tag}
                    </span>
                  </div>
                  <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#fff', marginBottom: '6px' }}>{r.name}</h3>
                      <p style={{ fontSize: '12px', color: '#999', lineHeight: 1.5, margin: 0 }}>
                        {r.shortDesc.slice(0, 95)}…
                      </p>
                    </div>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#FF2D78', fontSize: '12px', fontWeight: 600, marginTop: '12px' }}>
                      Learn More <ChevronRight size={13} />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
