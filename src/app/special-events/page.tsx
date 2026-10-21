'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import {
  ChevronRight,
  Sparkles,
  MapPin,
  Phone,
  Mail,
  Instagram,
  Heart,
  Star,
  Clock,
  Users,
  Car,
  Crown,
  ChevronDown,
  HelpCircle,
} from 'lucide-react';
import InquiryForm from './InquiryForm';
import SpecialEventPopup, { EventCountdownStrip } from '@/components/SpecialEventPopup';
import SpecialEventsLightbox from '@/components/SpecialEventsLightbox';

type GalleryPhoto = { id: string; url: string; title: string; description: string; order: number };

/* ─── Hero showcase slides (optimized local WebP) ─── */
const HERO_SLIDES = [
  { src: '/special-events/photo_5.webp', label: 'Bridal & Wedding Glam' },
  { src: '/special-events/photo_17.webp', label: 'Quinceañera & Tiara Styling' },
  { src: '/special-events/photo_20.webp', label: 'Red Carpet & Prom Styling' },
  { src: '/special-events/photo_9.webp', label: 'On-Location Mobile Suite' },
];

const DEFAULT_GALLERY_PHOTOS: GalleryPhoto[] = [
  { id: 'se-1', url: '/special-events/photo_5.webp', title: 'Bridal Glam & Veil Styling', description: 'Timeless bridal hair architecture and HD makeup in San Marcos, CA.', order: 0 },
  { id: 'se-2', url: '/special-events/photo_17.webp', title: 'Quinceañera Crown & Curls', description: 'Zero-slip tiara placement and high-volume curls for milestone celebrations.', order: 1 },
  { id: 'se-3', url: '/special-events/photo_20.webp', title: 'Red Carpet Evening Glam', description: 'Sculpted waves and luminous complexion for formal galas and prom.', order: 2 },
  { id: 'se-4', url: '/special-events/photo_9.webp', title: 'Bridal Party Collective', description: 'Coordinated bridesmaids hair and makeup across San Diego County.', order: 3 },
  { id: 'se-5', url: '/special-events/photo_1.webp', title: 'Signature Soft Glam', description: 'Camera-ready skin prep and custom faux mink lash styling.', order: 4 },
  { id: 'se-6', url: '/special-events/photo_2.webp', title: 'Editorial Updo Architecture', description: 'Intricate textured updos crafted for all-day and all-night hold.', order: 5 },
  { id: 'se-7', url: '/special-events/photo_11.webp', title: 'On-Location Bridal Suite', description: 'Mobile luxury hair and makeup delivered directly to your venue.', order: 6 },
  { id: 'se-8', url: '/special-events/photo_14.webp', title: 'Hollywood Waves & Glow', description: 'Classic sculpted waves paired with waterproof HD finishes.', order: 7 },
];

const EVENTS = [
  {
    slug: 'weddings-bridal',
    tag: 'Most Popular',
    tone: 'pink' as const,
    name: 'Weddings & Bridal',
    desc: 'Full glam for the bride, bridesmaids, and the entire wedding party. Hair, makeup, lashes — we do it all.',
    img: '/special-events/ev-weddings.webp',
    pills: ['Hair', 'Makeup', 'Lashes', 'Updo'],
  },
  {
    slug: 'quinceaneras',
    tag: 'Celebration',
    tone: 'gold' as const,
    name: 'Quinceañeras',
    desc: 'Celebrate her big day with show-stopping curls, flawless makeup, and the perfect tiara-ready look.',
    img: '/special-events/ev-quinceaneras.webp',
    pills: ['Updo', 'Makeup', 'Nails'],
  },
  {
    slug: 'prom-homecoming',
    tag: 'Red Carpet',
    tone: 'pink' as const,
    name: 'Prom & Homecoming',
    desc: 'Hollywood-ready glam for prom night, homecoming, and every formal occasion that calls for perfection.',
    img: '/special-events/ev-prom.webp',
    pills: ['Hair', 'Makeup', 'Styling'],
  },
  {
    slug: 'on-location-hair-makeup',
    tag: 'VIP Mobile',
    tone: 'gold' as const,
    name: 'On-Location & Mobile Glam',
    desc: 'We bring the salon to you. Complete hair and makeup stations at your venue, hotel suite, or home across San Diego County.',
    img: '/special-events/photo_5.webp',
    pills: ['We Come to You', 'Venues', 'Hotels', 'Airbnbs'],
  },
  {
    slug: 'baby-showers',
    tag: 'Milestone',
    tone: 'gold' as const,
    name: 'Baby Showers & Maternity',
    desc: 'Radiant, gentle looks for the mom-to-be and her closest loved ones. Glow from the inside out.',
    img: '/special-events/ev-baby-showers.webp',
    pills: ['Makeup', 'Hair', 'Glow'],
  },
  {
    slug: 'corporate-gala',
    tag: 'Professional',
    tone: 'gold' as const,
    name: 'Corporate & Gala Events',
    desc: 'Polished, refined looks for award nights, galas, networking events, and company celebrations.',
    img: '/special-events/ev-corporate.webp',
    pills: ['Polished Glam', 'Hair', 'Makeup'],
  },
  {
    slug: 'bridal-showers-bachelorettes',
    tag: 'Party',
    tone: 'pink' as const,
    name: 'Bridal Showers & Bachelorettes',
    desc: 'Pamper the bride-to-be and her girls with coordinated glam — from soft & romantic to full beat.',
    img: '/special-events/ev-bridal-shower.webp',
    pills: ['Group Glam', 'Hair', 'Makeup'],
  },
  {
    slug: 'sweet-16-birthdays',
    tag: 'Sweet',
    tone: 'pink' as const,
    name: 'Sweet 16 & Birthdays',
    desc: 'Make her 16th birthday legendary with age-appropriate glam that steals every photo.',
    img: '/special-events/ev-sweet16.webp',
    pills: ['Makeup', 'Hair', 'Nails'],
  },
  {
    slug: 'photo-video-shoots',
    tag: 'Creative',
    tone: 'gold' as const,
    name: 'Photo & Video Shoots',
    desc: 'Editorial, lifestyle, or content — we create camera-ready looks that pop in every frame.',
    img: '/special-events/ev-photo-shoots.webp',
    pills: ['Editorial', 'HD Makeup', 'Styling'],
  },
];

const SERVICES = [
  { icon: <Star size={20} />, title: 'Full Glam Makeup', desc: 'HD, natural, and editorial — every finish, every skin tone, every occasion.', href: '/special-events/weddings-bridal' },
  { icon: <Crown size={20} />, title: 'Hair Styling', desc: 'Updos, blowouts, braids, curls, and extensions. Precision work that lasts all night.', href: '/special-events/quinceaneras' },
  { icon: <Car size={20} />, title: 'On-Location Service', desc: 'We come to your venue, hotel, or home — no travel stress on your big day.', href: '/special-events/on-location-hair-makeup' },
  { icon: <Users size={20} />, title: 'Group Packages', desc: 'Coordinated timelines for bridal parties, courts, and groups of any size.', href: '/special-events/bridal-showers-bachelorettes' },
];

const STEPS = [
  { n: '01', t: 'Submit Your Inquiry', d: 'Fill out the questionnaire below with your event details. Takes less than 2 minutes.' },
  { n: '02', t: 'Receive a Quote', d: 'We will review your details and reach out within 48 hours with pricing and availability.' },
  { n: '03', t: 'Sign & Secure', d: 'Review your contract, sign, and pay your retainer to lock in your date.' },
  { n: '04', t: 'Look Stunning', d: 'Our team arrives ready. You relax and let the magic happen.' },
];

/* ─── FAQ data for SEO ─── */
const FAQS = [
  { q: 'Where are you located and did you move from Vista?', a: 'Yes! Glitz & Glamour Studio recently moved from our previous Vista location to our expanded flagship salon at 935 W San Marcos Blvd, Suite 101, San Marcos, CA 92078 (just 7 minutes from our former Vista studio). We continue to welcome our beloved Vista clients in-studio, and our on-location mobile glam team travels throughout Vista, San Marcos, Carlsbad, Escondido, Oceanside, Encinitas, and all of San Diego County.' },
  { q: 'What determines hair and makeup prices for special events and weddings across San Diego?', a: 'At Glitz & Glamour Studio, we do not believe in rigid, one-size-fits-all pricing packages with hidden fees. Hair and makeup prices are custom-quoted based on your exact event needs: guest headcount, desired styling finishes (such as airbrush makeup, Hollywood glam waves, or extension work), preview trials, and whether services are hosted in our San Marcos flagship salon or on-location across San Diego County. Every quote is fully itemized so you only invest in what you need.' },
  { q: 'What do special event and wedding hair updos cost, and how does styling complexity affect pricing?', a: 'The cost of formal hair updos varies depending on hair length, texture, and technical complexity—ranging from textured boho braids and sleek low chignons to intricate pinned updos with clip-in extensions. For bridal parties, quinceañera courts, and group events, we offer streamlined per-person group rates. Every updo includes pro-grade thermal prep, architectural zero-slip pinning, and humidity-resistant hold spray.' },
  { q: 'How far in advance should I book for my event?', a: 'We recommend booking at least 4–6 weeks in advance for most events. For weddings, quinceañeras, and large bridal parties, we suggest securing your date 2–3 months ahead to guarantee availability.' },
  { q: 'Do you offer on-location services?', a: 'Absolutely! We travel to your venue, hotel, home, or any location of your choice throughout San Marcos, Vista, Oceanside, Carlsbad, Escondido, Encinitas, and all San Diego County and surrounding areas. Travel is not limited to San Diego County, and a travel fee may apply depending on the location.' },
  { q: 'How many people can you accommodate in one event?', a: 'Our team can accommodate events of different sizes — from solo glam sessions to larger bridal parties and special events. If needed, we will coordinate multiple artists to make sure everyone is camera-ready on time.' },
  { q: 'What is included in a bridal/event package?', a: 'Bridal and event packages can be customized based on your needs, service location, timeline, and party size. Packages may include hair styling, makeup application, false lashes, a trial run for weddings, on-location services, and coordination for your event day. A custom quote will be provided based on the services requested.' },
  { q: 'Do you provide trial sessions before the event?', a: 'Yes! We highly recommend trial sessions for weddings and quinceañeras. This ensures you love your final look and gives us time to perfect every detail before the big day.' },
  { q: 'What brands and products do you use?', a: 'We use a variety of professional, high-quality products selected for long wear, photography, and a flawless finish. Our kit may include brands such as Charlotte Tilbury, MAC, NARS, Anastasia Beverly Hills, Morphe, Too Faced, NYX, and other trusted beauty brands. Products are chosen based on your skin type, tone, desired look, and the needs of your event.' },
  { q: 'What is your cancellation and refund policy?', a: 'A non-refundable retainer is required to reserve your event date and secure our team\'s availability. Cancellation, rescheduling, and payment details will be outlined in your personalized agreement after your consultation.' },
  { q: 'Can you work with specific themes or color palettes?', a: 'Of course! We love collaborating on themed events. Share your mood board, color palette, or Pinterest inspiration and we will tailor every look to match your vision perfectly.' },
];

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.glitzandglamours.com' },
    { '@type': 'ListItem', position: 2, name: 'Special Events', item: 'https://www.glitzandglamours.com/special-events' },
  ],
};

export default function SpecialEventsPage() {
  const [sliderIdx, setSliderIdx] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [showOffer, setShowOffer] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setSliderIdx(i => (i + 1) % HERO_SLIDES.length), 5000);
    return () => clearInterval(id);
  }, []);

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <div style={{ position: 'relative', zIndex: 1 }}>
      <style>{`
        .se-shell {
          width: min(1160px, calc(100% - 2rem));
          margin: 0 auto;
          padding: 20px 0 110px;
          font-family: 'Poppins', sans-serif;
        }
        .se-hero-card {
          position: relative;
          overflow: hidden;
          border-radius: 30px;
          padding: clamp(24px, 4vw, 44px);
          background:
            radial-gradient(circle at 18% 18%, rgba(255, 45, 120, 0.24), transparent 55%),
            radial-gradient(circle at 86% 20%, rgba(226, 194, 134, 0.16), transparent 50%),
            linear-gradient(155deg, rgba(32, 15, 26, 0.94), rgba(14, 7, 12, 0.98));
          border: 1px solid rgba(255, 255, 255, 0.12);
          box-shadow: 0 28px 70px rgba(0, 0, 0, 0.55);
        }
        .se-hero-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 8%;
          right: 8%;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255, 143, 188, 0.7), rgba(226, 194, 134, 0.6), transparent);
        }
        .se-hero-layout {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 32px;
        }
        .se-hero-copy {
          flex: 1;
          min-width: 0;
          max-width: 720px;
        }
        .se-loc-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(255, 45, 120, 0.14);
          border: 1px solid rgba(255, 130, 180, 0.36);
          border-radius: 999px;
          padding: 7px 16px;
          margin-bottom: 16px;
          font-size: 12.5px;
          color: #f6edf2;
          font-weight: 600;
        }
        .se-hero-title {
          font-weight: 800;
          font-size: clamp(1.85rem, 4.4vw, 3.05rem);
          line-height: 1.12;
          letter-spacing: -0.03em;
          margin: 0 0 12px;
          color: #fff;
        }
        .se-hero-tagline {
          font-size: 15px;
          font-weight: 700;
          color: #ff8ab8;
          margin: 0 0 10px;
          letter-spacing: 0.2px;
        }
        .se-hero-desc {
          font-size: clamp(14px, 1.8vw, 15.5px);
          color: #e2d6dc;
          margin: 0 0 24px;
          line-height: 1.7;
        }
        .se-hero-actions {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }
        .se-hero-showcase {
          width: 240px;
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
        }
        .se-hero-frame {
          width: 240px;
          height: 260px;
          border-radius: 24px;
          overflow: hidden;
          position: relative;
          border: 1px solid rgba(255, 143, 188, 0.34);
          background: rgba(255, 255, 255, 0.04);
          box-shadow: 0 20px 44px rgba(0, 0, 0, 0.5);
        }
        .se-hero-frame-cap {
          position: absolute;
          left: 10px;
          right: 10px;
          bottom: 10px;
          padding: 7px 12px;
          border-radius: 12px;
          background: rgba(14, 7, 12, 0.86);
          border: 1px solid rgba(255, 255, 255, 0.14);
          color: #fff;
          font-size: 11.5px;
          font-weight: 700;
          text-align: center;
        }
        .se-dots {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
        }
        .se-dot-btn {
          width: 32px;
          height: 32px;
          border: none;
          background: transparent;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          padding: 0;
        }
        .se-dot-indicator {
          height: 7px;
          border-radius: 999px;
          transition: all 0.25s ease;
        }

        .se-section {
          margin-top: 48px;
          content-visibility: auto;
          contain-intrinsic-size: 1px 520px;
        }
        .se-section-header {
          text-align: center;
          margin-bottom: 34px;
        }
        .se-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: #ff8ab8;
          font-weight: 700;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 2.6px;
          margin: 0 0 10px;
        }
        .se-h2 {
          font-weight: 800;
          font-size: clamp(1.6rem, 3.6vw, 2.35rem);
          letter-spacing: -0.025em;
          margin: 0 0 10px;
          color: #fff;
        }
        .se-sub {
          color: #dfd2d9;
          font-size: 14.5px;
          max-width: 560px;
          margin: 0 auto;
          line-height: 1.65;
        }

        .se-events-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 18px;
        }
        .se-event-card {
          display: flex;
          flex-direction: column;
          border-radius: 22px;
          overflow: hidden;
          background: linear-gradient(155deg, rgba(32, 15, 26, 0.86), rgba(14, 7, 12, 0.95));
          border: 1px solid rgba(255, 255, 255, 0.09);
          box-shadow: 0 16px 38px rgba(0, 0, 0, 0.35);
          text-decoration: none;
          transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
        }
        .se-event-card:hover {
          transform: translateY(-4px);
          border-color: rgba(255, 130, 180, 0.44);
          box-shadow: 0 22px 48px rgba(0, 0, 0, 0.5), 0 0 24px rgba(255, 45, 120, 0.14);
        }
        .se-event-img-wrap {
          position: relative;
          height: 184px;
          overflow: hidden;
          background: #170b13;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }
        .se-event-badge {
          position: absolute;
          top: 12px;
          left: 12px;
          z-index: 2;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 1.4px;
          text-transform: uppercase;
          padding: 5px 12px;
          border-radius: 999px;
        }
        .se-event-badge.pink {
          background: rgba(20, 8, 15, 0.88);
          border: 1px solid rgba(255, 130, 180, 0.55);
          color: #ff8ab8;
        }
        .se-event-badge.gold {
          background: rgba(20, 12, 8, 0.88);
          border: 1px solid rgba(226, 194, 134, 0.55);
          color: #f3d9a4;
        }
        .se-event-body {
          padding: 20px;
          display: flex;
          flex-direction: column;
          flex: 1;
        }
        .se-event-title {
          font-weight: 800;
          color: #fff;
          font-size: 18px;
          margin: 0 0 8px;
          letter-spacing: -0.015em;
        }
        .se-event-desc {
          color: #e2d6dc;
          font-size: 13.5px;
          line-height: 1.6;
          margin: 0 0 14px;
          flex: 1;
        }
        .se-event-pills {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
          margin-bottom: 16px;
        }
        .se-event-pill {
          font-size: 10.5px;
          font-weight: 600;
          letter-spacing: 0.4px;
          text-transform: uppercase;
          border: 1px solid rgba(255, 255, 255, 0.14);
          color: #f0e4ea;
          padding: 3px 10px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.04);
        }
        .se-event-cta {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          color: #ff7aae;
          font-size: 13px;
          font-weight: 700;
        }

        .se-services-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 14px;
          margin-top: 24px;
        }
        .se-service-card {
          padding: 24px 20px;
          border-radius: 22px;
          background: linear-gradient(155deg, rgba(32, 15, 26, 0.82), rgba(14, 7, 12, 0.92));
          border: 1px solid rgba(255, 255, 255, 0.09);
          text-decoration: none;
          display: flex;
          flex-direction: column;
          transition: all 0.25s ease;
        }
        .se-service-card:hover {
          border-color: rgba(255, 130, 180, 0.4);
          transform: translateY(-2px);
        }
        .se-service-icon {
          width: 44px;
          height: 44px;
          border-radius: 13px;
          background: rgba(255, 45, 120, 0.14);
          border: 1px solid rgba(255, 130, 180, 0.32);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ff7aae;
          margin-bottom: 14px;
        }

        .se-gallery-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 14px;
        }
        .se-gallery-cell {
          position: relative;
          aspect-ratio: 4 / 3;
          border-radius: 18px;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: #160a12;
          cursor: pointer;
          padding: 0;
          transition: transform 0.25s ease, border-color 0.25s ease;
        }
        .se-gallery-cell:hover {
          transform: translateY(-3px);
          border-color: rgba(255, 130, 180, 0.45);
        }
        .se-gallery-cap {
          position: absolute;
          inset: auto 0 0 0;
          padding: 26px 14px 12px;
          background: linear-gradient(to top, rgba(10, 5, 9, 0.92) 0%, rgba(10, 5, 9, 0.55) 65%, transparent 100%);
          text-align: left;
        }

        .se-steps-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 16px;
        }
        .se-step-card {
          padding: 28px 20px;
          border-radius: 22px;
          background: linear-gradient(155deg, rgba(32, 15, 26, 0.82), rgba(14, 7, 12, 0.92));
          border: 1px solid rgba(255, 255, 255, 0.09);
          text-align: center;
        }
        .se-step-num {
          width: 48px;
          height: 48px;
          border-radius: 999px;
          border: 1.5px solid rgba(255, 130, 180, 0.5);
          background: rgba(255, 45, 120, 0.14);
          color: #ff8ab8;
          font-weight: 800;
          font-size: 15px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 14px;
        }

        .se-faq-item {
          border-radius: 18px;
          background: linear-gradient(155deg, rgba(32, 15, 26, 0.82), rgba(14, 7, 12, 0.92));
          border: 1px solid rgba(255, 255, 255, 0.09);
          overflow: hidden;
        }
        .se-faq-summary {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 18px 22px;
          font-size: 15px;
          font-weight: 700;
          color: #fff;
          list-style: none;
          cursor: pointer;
          gap: 12px;
        }
        .se-faq-summary::-webkit-details-marker { display: none; }

        @media (max-width: 980px) {
          .se-events-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .se-services-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .se-gallery-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .se-steps-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }
        @media (max-width: 768px) {
          .se-hero-layout {
            flex-direction: column-reverse;
            align-items: flex-start;
            gap: 16px;
          }
          .se-hero-showcase {
            width: 100%;
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
          }
          .se-hero-frame {
            width: 88px;
            height: 88px;
            border-radius: 18px;
          }
          .se-hero-frame-cap { display: none; }
        }
        @media (max-width: 600px) {
          .se-events-grid { grid-template-columns: minmax(0, 1fr); }
          .se-services-grid { grid-template-columns: minmax(0, 1fr); }
          .se-steps-grid { grid-template-columns: minmax(0, 1fr); }
        }
      `}</style>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      {/* Special Event Popup — only on this page, once per session */}
      <SpecialEventPopup forceOpen={showOffer} onClose={() => setShowOffer(false)} />

      <div className="se-shell">
        {/* ══════════════ HERO ══════════════ */}
        <section className="se-hero-card">
          <div className="se-hero-layout">
            <div className="se-hero-copy">
              <div className="se-loc-pill">
                <MapPin size={14} color="#ff7aae" strokeWidth={2.4} aria-hidden="true" />
                <span>935 W San Marcos Blvd, Suite 101, San Marcos, CA · Serving Vista &amp; All North County</span>
              </div>
              <h1 className="se-hero-title">
                <span className="text-gradient">Special Event &amp; Bridal Hair &amp; Makeup</span>{' '}
                <span>in San Marcos, Vista &amp; San Diego</span>
              </h1>
              <p className="se-hero-tagline">
                Your most beautiful moments, made unforgettable.
              </p>
              <p className="se-hero-desc">
                Bridal parties, quinceañeras, proms, and celebrations. Premier hair and makeup in San Diego &amp; San Marcos (relocated from Vista) with top-rated makeup artists and mobile glam across Carlsbad, Oceanside, Escondido, La Jolla, and all San Diego County.
              </p>
              <div className="se-hero-actions">
                <button
                  type="button"
                  data-open-quote="true"
                  className="btn-primary btn-pulse"
                  style={{ fontSize: '14px', padding: '13px 26px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <span>Start Your Inquiry</span>
                  <ChevronRight size={16} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className="btn-outline"
                  onClick={() => scrollTo('events')}
                  style={{ fontSize: '14px', padding: '13px 24px', background: 'rgba(255,255,255,0.05)', color: '#fff', borderColor: 'rgba(255,255,255,0.26)', cursor: 'pointer' }}
                >
                  Explore Event Services
                </button>
              </div>
            </div>

            <div className="se-hero-showcase">
              <div
                className="se-hero-frame"
                role="img"
                aria-label={`Showcase photo: ${HERO_SLIDES[sliderIdx].label}`}
                style={{
                  backgroundImage: `url(${HERO_SLIDES[sliderIdx].src})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center 20%',
                }}
              >
                <div className="se-hero-frame-cap" aria-hidden="true">{HERO_SLIDES[sliderIdx].label}</div>
              </div>
              <div className="se-dots" role="tablist" aria-label="Showcase slides">
                {HERO_SLIDES.map((s, i) => (
                  <button
                    key={s.src}
                    type="button"
                    className="se-dot-btn"
                    aria-label={`Show slide ${i + 1}: ${s.label}`}
                    aria-selected={i === sliderIdx}
                    role="tab"
                    onClick={() => setSliderIdx(i)}
                  >
                    <span
                      className="se-dot-indicator"
                      style={{
                        width: i === sliderIdx ? '22px' : '8px',
                        background: i === sliderIdx ? '#ff7aae' : 'rgba(255,255,255,0.35)',
                      }}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════ URGENCY COUNTDOWN STRIP ══════════════ */}
        <div style={{ paddingTop: '24px' }}>
          <EventCountdownStrip onLearnMore={() => setShowOffer(true)} />
        </div>

        {/* ══════════════ EVENTS ══════════════ */}
        <section id="events" className="se-section">
          <div className="se-section-header">
            <p className="se-eyebrow">
              <Sparkles size={13} aria-hidden="true" />
              <span>What We Celebrate</span>
            </p>
            <h2 className="se-h2">
              Special Event <span className="text-gradient">Services &amp; Packages</span>
            </h2>
            <p className="se-sub">
              Select any event below to view detailed styling packages, pricing expectations, FAQs, and local service coverage.
            </p>
          </div>

          <div className="se-events-grid">
            {EVENTS.map((ev) => (
              <Link
                key={ev.slug}
                href={`/special-events/${ev.slug}`}
                className="se-event-card"
              >
                <div className="se-event-img-wrap">
                  <img
                    src={ev.img}
                    alt={`${ev.name} in San Marcos, CA`}
                    width={360}
                    height={184}
                    loading="lazy"
                    fetchPriority="low"
                    decoding="async"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 22%', display: 'block' }}
                  />
                  <span className={`se-event-badge ${ev.tone}`}>{ev.tag}</span>
                </div>
                <div className="se-event-body">
                  <h3 className="se-event-title">{ev.name}</h3>
                  <p className="se-event-desc">{ev.desc}</p>
                  <div className="se-event-pills">
                    {ev.pills.map((p) => (
                      <span key={p} className="se-event-pill">{p}</span>
                    ))}
                  </div>
                  <div className="se-event-cta">
                    <span>View Packages &amp; Details</span>
                    <ChevronRight size={14} aria-hidden="true" />
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* ══════════════ SERVICES BAR ══════════════ */}
          <div className="se-services-grid">
            {SERVICES.map((s, i) => (
              <Link key={i} href={s.href} className="se-service-card">
                <div className="se-service-icon" aria-hidden="true">{s.icon}</div>
                <h3 style={{ fontWeight: 700, color: '#fff', fontSize: '15.5px', margin: '0 0 6px' }}>{s.title}</h3>
                <p style={{ color: '#e2d6dc', fontSize: '13.5px', lineHeight: 1.6, margin: '0 0 12px', flex: 1 }}>{s.desc}</p>
                <span style={{ color: '#ff7aae', fontSize: '12.5px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <span>Explore Details</span>
                  <ChevronRight size={13} aria-hidden="true" />
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* ══════════════ GALLERY — BENTO SHOWCASE ══════════════ */}
        <section className="se-section" aria-label="Special Events Gallery">
          <div className="se-section-header">
            <p className="se-eyebrow">
              <Heart size={13} aria-hidden="true" />
              <span>Our Work</span>
            </p>
            <h2 className="se-h2">
              Moments We&apos;ve <span className="text-gradient">Created</span>
            </h2>
            <p className="se-sub">
              Every look, every detail, every unforgettable moment — crafted by our team.
            </p>
          </div>

          <div className="se-gallery-grid">
            {DEFAULT_GALLERY_PHOTOS.map((g, i) => (
              <button
                key={g.id}
                type="button"
                className="se-gallery-cell"
                aria-label={`View photo: ${g.title}`}
                onClick={() => setLightboxIndex(i)}
              >
                <img
                  src={g.url}
                  alt=""
                  width={280}
                  height={210}
                  loading="lazy"
                  fetchPriority="low"
                  decoding="async"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 20%', display: 'block' }}
                />
                <div className="se-gallery-cap">
                  <p style={{ color: '#fff', fontWeight: 700, fontSize: '13px', margin: 0 }}>{g.title}</p>
                </div>
              </button>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '28px' }}>
            <a
              href="https://instagram.com/glitzandglamourstudio"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(255, 45, 120, 0.12)',
                border: '1px solid rgba(255, 130, 180, 0.34)',
                borderRadius: '999px',
                padding: '10px 24px',
                color: '#ff8ab8',
                fontWeight: 700,
                fontSize: '13px',
                textDecoration: 'none',
              }}
            >
              <Instagram size={16} aria-hidden="true" />
              <span>See more on Instagram</span>
            </a>
          </div>
        </section>

        {/* ── Special Events Lightbox Viewer ── */}
        {lightboxIndex !== null && (
          <SpecialEventsLightbox
            photos={DEFAULT_GALLERY_PHOTOS}
            startIndex={lightboxIndex}
            onClose={() => setLightboxIndex(null)}
            onInquire={(photo) => {
              setLightboxIndex(null);
              if (typeof window !== 'undefined' && (window as unknown as { __openQuoteModal?: (d: { eventType: string }) => void }).__openQuoteModal) {
                (window as unknown as { __openQuoteModal: (d: { eventType: string }) => void }).__openQuoteModal({ eventType: photo?.title || 'Special Event' });
              } else {
                scrollTo('inquire');
              }
            }}
          />
        )}

        {/* ══════════════ HOW IT WORKS ══════════════ */}
        <section className="se-section">
          <div className="se-section-header">
            <p className="se-eyebrow">
              <Clock size={13} aria-hidden="true" />
              <span>How It Works</span>
            </p>
            <h2 className="se-h2">
              From <span className="text-gradient">Inquiry</span> to Event Day
            </h2>
            <p className="se-sub">
              A simple, stress-free process so you can focus on celebrating.
            </p>
          </div>
          <div className="se-steps-grid">
            {STEPS.map((s, i) => (
              <div key={i} className="se-step-card">
                <div className="se-step-num">{s.n}</div>
                <h3 style={{ fontWeight: 700, color: '#fff', fontSize: '15.5px', margin: '0 0 8px' }}>{s.t}</h3>
                <p style={{ color: '#e2d6dc', fontSize: '13.5px', lineHeight: 1.65, margin: 0 }}>{s.d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ══════════════ FAQ ══════════════ */}
        <section id="faq" className="se-section" aria-label="Frequently Asked Questions">
          <div style={{ maxWidth: '820px', margin: '0 auto' }}>
            <div className="se-section-header">
              <p className="se-eyebrow">
                <HelpCircle size={13} aria-hidden="true" />
                <span>FAQ</span>
              </p>
              <h2 className="se-h2">
                Frequently Asked <span className="text-gradient">Questions</span>
              </h2>
              <p className="se-sub">
                Everything you need to know about booking your special event glam with us.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {FAQS.map((faq, i) => (
                <details
                  key={i}
                  open={openFaq === i}
                  onToggle={(e) => {
                    if ((e.target as HTMLDetailsElement).open) setOpenFaq(i);
                    else if (openFaq === i) setOpenFaq(null);
                  }}
                  className="se-faq-item"
                >
                  <summary className="se-faq-summary">
                    <span style={{ flex: 1 }}>{faq.q}</span>
                    <ChevronDown
                      size={18}
                      aria-hidden="true"
                      style={{
                        color: '#ff7aae',
                        transform: openFaq === i ? 'rotate(180deg)' : 'rotate(0)',
                        transition: 'transform 0.25s',
                        flexShrink: 0,
                      }}
                    />
                  </summary>
                  <div style={{ padding: '0 22px 20px', color: '#e2d6dc', fontSize: '14px', lineHeight: 1.8 }}>
                    {faq.a}
                  </div>
                </details>
              ))}
            </div>
          </div>

          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'FAQPage',
                mainEntity: FAQS.map(f => ({
                  '@type': 'Question',
                  name: f.q,
                  acceptedAnswer: { '@type': 'Answer', text: f.a },
                })),
              }),
            }}
          />
        </section>

        {/* ══════════════ INQUIRY FORM ══════════════ */}
        <section id="inquire" className="se-section">
          <div style={{ maxWidth: '820px', margin: '0 auto' }}>
            <div className="se-section-header" style={{ marginBottom: '26px' }}>
              <p className="se-eyebrow">Get Started</p>
              <h2 className="se-h2">
                Tell Us About Your <span className="text-gradient">Event</span>
              </h2>
              <p className="se-sub" style={{ marginBottom: '16px' }}>
                Fill out this short questionnaire and we&apos;ll reach out within 48 hours. No commitment required.
              </p>
              <div
                style={{
                  padding: '9px 18px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '13px',
                  color: '#f0e4ea',
                  borderRadius: '999px',
                  background: 'rgba(255, 45, 120, 0.12)',
                  border: '1px solid rgba(255, 130, 180, 0.3)',
                }}
              >
                <Sparkles size={14} color="#ff7aae" aria-hidden="true" />
                <span>This is an inquiry, not a booking.</span>
              </div>
            </div>

            {/* Contact pills */}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '28px' }}>
              {[
                { icon: <Phone size={13} aria-hidden="true" />, text: '(760) 290-5910', href: 'tel:+17602905910' },
                { icon: <Mail size={13} aria-hidden="true" />, text: 'info@glitzandglamours.com', href: 'mailto:info@glitzandglamours.com' },
                { icon: <Instagram size={13} aria-hidden="true" />, text: '@glitzandglamourstudio', href: 'https://instagram.com/glitzandglamourstudio' },
              ].map((c, i) => (
                <a
                  key={i}
                  href={c.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '7px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '999px',
                    padding: '8px 16px',
                    fontSize: '12.5px',
                    color: '#f0e4ea',
                    fontWeight: 600,
                    textDecoration: 'none',
                  }}
                >
                  <span style={{ color: '#ff7aae', display: 'inline-flex' }}>{c.icon}</span>
                  <span>{c.text}</span>
                </a>
              ))}
            </div>

            <InquiryForm />
          </div>
        </section>
      </div>
    </div>
  );
}
