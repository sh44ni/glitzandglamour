import Link from 'next/link';
import {
  Sparkles,
  MapPin,
  Phone,
  Calendar,
  ChevronRight,
  CheckCircle2,
  Heart,
  ShieldCheck,
  Car,
} from 'lucide-react';
import {
  getSpecialEventBySlug,
  SPECIAL_EVENTS_DETAILED,
  type DetailedSpecialEvent,
} from '@/data/specialEventsDetailed';
import RealReviewsSection from '@/components/RealReviewsSection';
import type { RealReviewItem } from '@/lib/realReviews';

export interface PricingGuideData {
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

export function getPricingGuide(slug: string, eventName: string): PricingGuideData {
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
            color: '#E2C286',
            title: 'The Bridal Party Collection',
            desc: 'Coordinated hair styling (updos, waves, half-up) + camera-ready event makeup & lashes for bridesmaids, mothers, and attendees.',
            quoteType: 'Quoted Per Person',
          },
          {
            badge: 'VIP All-Day',
            color: '#FF2D78',
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
            color: '#FF2D78',
            title: 'The Private Suite Experience',
            desc: 'Full-service mobile hair architecture and camera-ready HD makeup in your hotel room, bridal suite, or private residence.',
            quoteType: 'Tailored VIP Proposal',
          },
          {
            badge: 'Squad Mobile',
            color: '#E2C286',
            title: 'The Mobile Bridal Party Collective',
            desc: 'Synchronized on-location hair and makeup stations for bridesmaids, moms, and celebration groups with coordinated timelines.',
            quoteType: 'Quoted Per Person',
          },
          {
            badge: 'All-Day Concierge',
            color: '#FF2D78',
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
            color: '#FF2D78',
            title: 'The Spotlight Bride Glam',
            desc: 'Elevated hair and makeup designed to ensure the bride stands out gorgeously at her shower or bachelorette.',
            quoteType: 'Spotlight Proposal',
          },
          {
            badge: 'Squad Collection',
            color: '#E2C286',
            title: 'The Bride Squad Beauty Bar',
            desc: 'Coordinated party waves, blowouts, and radiant soft glam with custom lashes for bridesmaids and besties.',
            quoteType: 'Quoted Per Person',
          },
          {
            badge: 'Studio Takeover',
            color: '#FF2D78',
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
            color: '#FF2D78',
            title: 'The Quinceañera Royal Crown Package',
            desc: 'Full HD camera-tested glam, lashes, tiara anchoring, high-volume curls or textured updo, plus preview trial.',
            quoteType: 'Royal Custom Proposal',
          },
          {
            badge: 'Damas Court',
            color: '#E2C286',
            title: 'The Court of Honor Collection',
            desc: 'Coordinated soft glam and elegant hairstyles for your damas, quoted per person with group savings.',
            quoteType: 'Quoted Per Dama',
          },
          {
            badge: 'Full Family Glam',
            color: '#FF2D78',
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
            color: '#FF2D78',
            title: 'The Prom Queen Full Glam',
            desc: 'Full HD complexion makeup, custom fluttery lashes, sculpted brows, and formal hair styling or updo.',
            quoteType: 'Student Solo Rate',
          },
          {
            badge: 'Besties Duo',
            color: '#E2C286',
            title: 'The Best Friends Glam Duo',
            desc: 'Back-to-back appointments in our San Marcos studio with photo-ready lighting and complimentary lash application.',
            quoteType: 'Duo Booking Rate',
          },
          {
            badge: 'Squad Package',
            color: '#FF2D78',
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
            color: '#FF2D78',
            title: 'The Stage & Podium Polish',
            desc: 'Anti-glare stage HD makeup, precision brow and hair grooming, and all-day setting techniques.',
            quoteType: 'Executive Proposal',
          },
          {
            badge: 'Gala Black-Tie',
            color: '#E2C286',
            title: 'The Red Carpet Gala Experience',
            desc: 'Formal evening hair updo or waves, radiant complexion, smoky eyes, and elegant lash enhancement.',
            quoteType: 'Gala Retainer',
          },
          {
            badge: 'Corporate Suite',
            color: '#FF2D78',
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
            color: '#FF2D78',
            title: 'The Executive Headshot & Creator Prep',
            desc: '1-2 camera-ready hair and makeup looks in our San Marcos studio before your photo session.',
            quoteType: 'In-Studio Rate',
          },
          {
            badge: 'Half-Day Retainer',
            color: '#E2C286',
            title: 'The Half-Day On-Set Retainer (Up to 4 Hrs)',
            desc: 'On-set artist presence for touch-ups, flyaway control, and look refreshes between camera takes.',
            quoteType: 'Half-Day Day Rate',
          },
          {
            badge: 'Full-Day Editorial',
            color: '#FF2D78',
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
            color: '#E2C286',
            title: 'The Celebration Squad Package',
            desc: 'Coordinated hair and makeup appointments for you and your guests with group savings.',
            quoteType: 'Quoted Per Person',
          },
          {
            badge: 'Mobile VIP',
            color: '#FF2D78',
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

export default function SpecialEventDetailClient({
  slug,
  dbCategory,
  realReviews,
}: {
  slug: string;
  dbCategory?: any;
  realReviews: RealReviewItem[];
}) {
  const detailed = getSpecialEventBySlug(slug);
  const relatedEvents = detailed
    ? detailed.relatedSlugs
        .map((s) => getSpecialEventBySlug(s))
        .filter((e): e is DetailedSpecialEvent => !!e)
        .slice(0, 3)
    : SPECIAL_EVENTS_DETAILED.filter((e) => e.slug !== slug).slice(0, 3);

  const eventName = detailed ? detailed.name : dbCategory?.name || 'Special Event';
  const pricingGuide = getPricingGuide(slug, eventName);
  const faqs = detailed?.faqs || [];
  const heroImageUrl = detailed
    ? detailed.heroImage
    : (dbCategory?.imageUrl && !dbCategory.imageUrl.startsWith('http://') ? dbCategory.imageUrl : '/special-events/ev-weddings.webp');

  return (
    <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh', paddingBottom: '100px' }}>
      <style>{`
        .sed-shell {
          width: min(1140px, calc(100% - 2rem));
          margin: 0 auto;
          padding: 20px 0 60px;
          font-family: 'Poppins', sans-serif;
        }
        .sed-top-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
          margin-bottom: 18px;
        }
        .sed-breadcrumb {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: #dfd2d9;
          flex-wrap: wrap;
          padding: 7px 15px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
        }
        .sed-breadcrumb a {
          color: #e5d8df;
          text-decoration: none;
          transition: color 0.2s;
        }
        .sed-breadcrumb a:hover { color: #ff7aae; }

        .sed-hero-card {
          border-radius: 28px;
          overflow: hidden;
          position: relative;
          padding: clamp(24px, 4vw, 42px);
          background:
            radial-gradient(circle at 18% 18%, rgba(255, 45, 120, 0.24), transparent 55%),
            radial-gradient(circle at 86% 20%, rgba(226, 194, 134, 0.16), transparent 50%),
            linear-gradient(155deg, rgba(32, 15, 26, 0.94), rgba(14, 7, 12, 0.98));
          border: 1px solid rgba(255, 255, 255, 0.12);
          box-shadow: 0 28px 70px rgba(0, 0, 0, 0.55);
          margin-bottom: 34px;
        }
        .sed-hero-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 8%;
          right: 8%;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255, 143, 188, 0.7), rgba(226, 194, 134, 0.6), transparent);
        }
        .sed-hero-layout {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 32px;
        }
        .sed-hero-copy {
          flex: 1;
          min-width: 0;
          max-width: 760px;
        }
        .sed-hero-frame {
          width: 220px;
          height: 220px;
          border-radius: 24px;
          overflow: hidden;
          flex-shrink: 0;
          border: 1px solid rgba(255, 143, 188, 0.34);
          background: rgba(255, 255, 255, 0.04);
          box-shadow: 0 20px 44px rgba(0, 0, 0, 0.5);
        }
        .sed-tag-badge {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          background: rgba(255, 45, 120, 0.16);
          border: 1px solid rgba(255, 130, 180, 0.42);
          color: #ff8ab8;
          padding: 6px 14px;
          border-radius: 999px;
          margin-bottom: 14px;
        }
        .sed-pill {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.4px;
          text-transform: uppercase;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.16);
          color: #f4eaf0;
          padding: 5px 12px;
          border-radius: 999px;
        }

        .sed-feature-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 16px;
          margin-bottom: 34px;
        }
        .sed-card {
          background: linear-gradient(155deg, rgba(32, 15, 26, 0.84), rgba(14, 7, 12, 0.94));
          border: 1px solid rgba(255, 255, 255, 0.09);
          border-radius: 22px;
          padding: clamp(22px, 3vw, 28px);
          box-shadow: 0 16px 38px rgba(0, 0, 0, 0.32);
        }
        .sed-content-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.3fr) minmax(0, 0.7fr);
          gap: 24px;
          content-visibility: auto;
          contain-intrinsic-size: 1px 900px;
        }
        .sed-step-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
          gap: 14px;
        }
        .sed-faq-card {
          background: linear-gradient(155deg, rgba(32, 15, 26, 0.82), rgba(14, 7, 12, 0.92));
          border: 1px solid rgba(255, 255, 255, 0.09);
          border-radius: 16px;
          overflow: hidden;
          margin-bottom: 12px;
          transition: all 0.22s ease;
        }
        .sed-faq-card[open] {
          border-color: rgba(255, 130, 180, 0.38);
        }
        .sed-faq-summary {
          padding: 18px 20px;
          cursor: pointer;
          list-style: none;
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-weight: 700;
          font-size: 14.5px;
          color: #fff;
          user-select: none;
          gap: 12px;
        }
        .sed-faq-summary::-webkit-details-marker {
          display: none;
        }
        @media (max-width: 900px) {
          .sed-content-grid {
            grid-template-columns: minmax(0, 1fr);
          }
        }
        @media (max-width: 768px) {
          .sed-hero-layout {
            flex-direction: column-reverse;
            align-items: flex-start;
            gap: 16px;
          }
          .sed-hero-frame {
            width: 88px;
            height: 88px;
            border-radius: 18px;
          }
        }
      `}</style>

      <div className="sed-shell">
        {/* ── Breadcrumb Bar ── */}
        <div className="sed-top-bar">
          <nav aria-label="Breadcrumb" className="sed-breadcrumb">
            <Link href="/">Home</Link>
            <span style={{ color: '#9c8b94' }} aria-hidden="true">›</span>
            <Link href="/special-events">Special Events</Link>
            <span style={{ color: '#9c8b94' }} aria-hidden="true">›</span>
            <span style={{ color: '#ff8ab8', fontWeight: 700 }}>{eventName}</span>
          </nav>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,45,120,0.12)', border: '1px solid rgba(255,130,180,0.32)', borderRadius: '999px', padding: '6px 14px' }}>
            <MapPin size={12} color="#ff7aae" aria-hidden="true" />
            <span style={{ fontSize: '11.5px', color: '#f6edf2', fontWeight: 600, letterSpacing: '0.2px' }}>
              San Marcos Studio &amp; Mobile Across San Diego
            </span>
          </div>
        </div>

        {/* ── Hero Section ── */}
        <section className="sed-hero-card">
          <div className="sed-hero-layout">
            <div className="sed-hero-copy">
              {detailed?.tag && (
                <div className="sed-tag-badge">
                  <Sparkles size={12} aria-hidden="true" />
                  <span>{detailed.tag}</span>
                </div>
              )}

              <h1 style={{ fontWeight: 800, color: '#fff', fontSize: 'clamp(1.85rem, 4.3vw, 2.95rem)', lineHeight: 1.12, letterSpacing: '-0.03em', margin: '0 0 14px' }}>
                {detailed?.h1 || eventName}
              </h1>

              <p style={{ color: '#e2d6dc', fontSize: 'clamp(14px, 1.8vw, 15.5px)', lineHeight: 1.7, margin: '0 0 20px', maxWidth: '720px' }}>
                {detailed?.shortDesc || dbCategory?.description}
              </p>

              {detailed?.pills && detailed.pills.length > 0 && (
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
                  {detailed.pills.map((pill) => (
                    <span key={pill} className="sed-pill">{pill}</span>
                  ))}
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                <button
                  type="button"
                  data-open-quote="true"
                  data-event-type={eventName}
                  className="btn-primary"
                  style={{ padding: '13px 26px', fontSize: '14px', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <span>Request Custom Quote</span>
                  <ChevronRight size={16} aria-hidden="true" />
                </button>
                <a href="tel:+17602905910" className="btn-outline" style={{ padding: '13px 22px', fontSize: '14px', background: 'rgba(255,255,255,0.06)', color: '#fff', borderColor: 'rgba(255,255,255,0.24)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <Phone size={15} aria-hidden="true" />
                  <span>(760) 290-5910</span>
                </a>
              </div>
            </div>

            <div className="sed-hero-frame">
              <img
                src={heroImageUrl}
                alt={`${eventName} in San Marcos, CA`}
                width={220}
                height={220}
                loading="lazy"
                fetchPriority="low"
                decoding="async"
                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 22%', display: 'block' }}
              />
            </div>
          </div>
        </section>

        {/* ── Services Breakdown Grid (What We Offer For This Event) ── */}
        {detailed?.servicesOffered && detailed.servicesOffered.length > 0 && (
          <section style={{ marginBottom: '36px' }}>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <p style={{ color: '#ff8ab8', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '2.5px', marginBottom: '6px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={13} aria-hidden="true" />
                <span>Tailored Artistry</span>
              </p>
              <h2 style={{ fontWeight: 800, fontSize: 'clamp(1.5rem, 3.2vw, 2.2rem)', color: '#fff', letterSpacing: '-0.025em', margin: 0 }}>
                Specialized Services for <span className="text-gradient">{detailed.name}</span>
              </h2>
            </div>

            <div className="sed-feature-grid">
              {detailed.servicesOffered.map((svc, i) => (
                <div key={i} className="sed-card" style={{ display: 'flex', flexDirection: 'column' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(255,45,120,0.14)', border: '1px solid rgba(255,130,180,0.32)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ff8ab8', marginBottom: '14px', fontWeight: 800, fontSize: '13px' }}>
                    0{i + 1}
                  </div>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff', margin: '0 0 8px' }}>{svc.title}</h3>
                  <p style={{ fontSize: '13.5px', color: '#e2d6dc', lineHeight: 1.65, margin: 0 }}>{svc.desc}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Main Two-Column Content Layout ── */}
        <div className="sed-content-grid">
          <div style={{ minWidth: 0 }}>
            {detailed?.overview && (
              <section className="sed-card" style={{ marginBottom: '24px' }}>
                <h2 style={{ fontSize: '18.5px', fontWeight: 800, color: '#fff', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Sparkles size={18} color="#ff7aae" aria-hidden="true" />
                  <span>Overview &amp; Experience</span>
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {detailed.overview.map((para, i) => (
                    <p key={i} style={{ color: '#e2d6dc', fontSize: '14.5px', lineHeight: 1.8, margin: 0 }}>
                      {para}
                    </p>
                  ))}
                </div>
              </section>
            )}

            {detailed?.whatsIncluded && detailed.whatsIncluded.length > 0 && (
              <section className="sed-card" style={{ marginBottom: '24px' }}>
                <h2 style={{ fontSize: '18.5px', fontWeight: 800, color: '#fff', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <CheckCircle2 size={18} color="#ff7aae" aria-hidden="true" />
                  <span>What&apos;s Included in Your Service</span>
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '12px' }}>
                  {detailed.whatsIncluded.map((item, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                      <CheckCircle2 size={16} color="#ff7aae" aria-hidden="true" style={{ flexShrink: 0, marginTop: '3px' }} />
                      <span style={{ fontSize: '13.5px', color: '#f0e4ea', lineHeight: 1.65 }}>{item}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {detailed?.timelineGuide && detailed.timelineGuide.length > 0 && (
              <section className="sed-card" style={{ marginBottom: '24px' }}>
                <div style={{ marginBottom: '18px' }}>
                  <p style={{ color: '#ff8ab8', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '2px', margin: '0 0 4px' }}>
                    Stress-Free Planning
                  </p>
                  <h2 style={{ fontSize: '18.5px', fontWeight: 800, color: '#fff', margin: 0 }}>
                    Event Timeline &amp; Booking Process
                  </h2>
                </div>
                <div className="sed-step-grid">
                  {detailed.timelineGuide.map((step, i) => (
                    <div
                      key={i}
                      style={{
                        background: 'rgba(255,255,255,0.035)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '16px',
                        padding: '18px 16px',
                        position: 'relative',
                      }}
                    >
                      <span style={{ fontSize: '11px', fontWeight: 800, color: '#ff8ab8', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        {step.step}
                      </span>
                      <h3 style={{ fontSize: '14.5px', fontWeight: 700, color: '#fff', margin: '6px 0 8px' }}>{step.title}</h3>
                      <p style={{ fontSize: '13px', color: '#e2d6dc', lineHeight: 1.65, margin: 0 }}>{step.desc}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Dedicated Pricing & Custom Quote Investment Guide (#pricing) */}
            <section id="pricing" className="sed-card" style={{ marginBottom: '24px', border: '1px solid rgba(255, 130, 180, 0.28)' }}>
              <div style={{ marginBottom: '20px' }}>
                <p style={{ color: '#ff8ab8', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '2px', margin: '0 0 4px' }}>
                  {pricingGuide.eyebrow}
                </p>
                <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#fff', margin: '0 0 8px' }}>
                  {pricingGuide.title}
                </h2>
                <p style={{ color: '#e2d6dc', fontSize: '13.5px', lineHeight: 1.75, margin: 0 }}>
                  {pricingGuide.description}
                </p>
              </div>

              <h3 style={{ fontSize: '15.5px', fontWeight: 700, color: '#fff', margin: '0 0 14px' }}>
                {pricingGuide.influencersTitle}
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '24px' }}>
                {pricingGuide.influencers.map((inf, idx) => (
                  <div key={idx} style={{ background: 'rgba(255,255,255,0.035)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '16px' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#ff8ab8', margin: '0 0 6px' }}>{inf.title}</h4>
                    <p style={{ fontSize: '13px', color: '#e2d6dc', lineHeight: 1.6, margin: 0 }}>{inf.desc}</p>
                  </div>
                ))}
              </div>

              <h3 style={{ fontSize: '15.5px', fontWeight: 700, color: '#fff', margin: '0 0 14px' }}>
                {pricingGuide.packagesTitle}
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '22px' }}>
                {pricingGuide.packages.map((pkg, idx) => {
                  const isPink = idx % 2 === 0;
                  const accent = isPink ? '#ff8ab8' : '#f3d9a4';
                  const bg = isPink ? 'rgba(255, 45, 120, 0.08)' : 'rgba(226, 194, 134, 0.08)';
                  const border = isPink ? 'rgba(255, 130, 180, 0.28)' : 'rgba(226, 194, 134, 0.28)';
                  return (
                    <div key={idx} style={{ background: bg, border: `1px solid ${border}`, borderRadius: '16px', padding: '18px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 800, color: accent, textTransform: 'uppercase', letterSpacing: '1px' }}>{pkg.badge}</span>
                      <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#fff', margin: '6px 0 8px' }}>{pkg.title}</h4>
                      <p style={{ fontSize: '13px', color: '#e2d6dc', lineHeight: 1.6, margin: '0 0 12px' }}>
                        {pkg.desc}
                      </p>
                      <span style={{ fontSize: '11.5px', color: accent, fontWeight: 700 }}>{pkg.quoteType}</span>
                    </div>
                  );
                })}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px', padding: '18px 20px', borderRadius: '16px', background: 'linear-gradient(135deg, rgba(255,45,120,0.16), rgba(226,194,134,0.1))', border: '1px solid rgba(255,130,180,0.34)' }}>
                <div>
                  <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#fff', margin: '0 0 4px' }}>{pricingGuide.ctaTitle}</h4>
                  <p style={{ fontSize: '13px', color: '#f0e4ea', margin: 0 }}>{pricingGuide.ctaDesc}</p>
                </div>
                <button
                  type="button"
                  data-open-quote="true"
                  data-event-type={eventName}
                  className="btn-primary"
                  style={{ padding: '10px 18px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                >
                  <span>Request Custom Quote</span>
                  <ChevronRight size={14} aria-hidden="true" />
                </button>
              </div>
            </section>

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

            {faqs.length > 0 && (
              <section style={{ marginBottom: '24px' }}>
                <div style={{ marginBottom: '18px' }}>
                  <p style={{ color: '#ff8ab8', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '2px', margin: '0 0 4px' }}>
                    Questions &amp; Answers
                  </p>
                  <h2 style={{ fontSize: '18.5px', fontWeight: 800, color: '#fff', margin: 0 }}>
                    Frequently Asked Questions
                  </h2>
                </div>

                <div>
                  {faqs.map((faq, i) => (
                    <details key={i} className="sed-faq-card">
                      <summary className="sed-faq-summary">
                        <span>{faq.q}</span>
                        <ChevronRight size={16} color="#ff7aae" aria-hidden="true" style={{ transform: 'rotate(90deg)', flexShrink: 0, marginLeft: '12px' }} />
                      </summary>
                      <div style={{ padding: '0 20px 18px', color: '#e2d6dc', fontSize: '13.5px', lineHeight: 1.75 }}>
                        {faq.a}
                      </div>
                    </details>
                  ))}
                </div>
              </section>
            )}
          </div>

          <aside className="sed-sidebar" style={{ minWidth: 0 }}>
            <div style={{ position: 'sticky', top: '90px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div
                style={{
                  background: 'linear-gradient(155deg, rgba(44, 18, 34, 0.92), rgba(18, 9, 15, 0.96))',
                  border: '1px solid rgba(255, 130, 180, 0.34)',
                  borderRadius: '22px',
                  padding: '24px 20px',
                  boxShadow: '0 16px 40px rgba(0,0,0,0.45)',
                }}
              >
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#ff8ab8', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
                  <Calendar size={13} aria-hidden="true" />
                  <span>Reserve Your Date</span>
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#fff', margin: '0 0 8px' }}>
                  Planning Your {detailed ? detailed.name.split(' ')[0] : 'Event'}?
                </h3>
                <p style={{ color: '#e2d6dc', fontSize: '13.5px', lineHeight: 1.65, margin: '0 0 16px' }}>
                  Dates fill quickly across San Marcos and San Diego County. Fill out our short inquiry questionnaire to receive custom pricing and availability within 48 hours.
                </p>
                <button
                  type="button"
                  data-open-quote="true"
                  data-event-type={eventName}
                  className="btn-primary"
                  style={{ width: '100%', justifyContent: 'center', padding: '13px', fontSize: '14px', fontWeight: 700, marginBottom: '10px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <span>Start Your Inquiry</span>
                  <ChevronRight size={15} aria-hidden="true" />
                </button>
                <a
                  href="tel:+17602905910"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    color: '#fff',
                    textDecoration: 'none',
                    fontSize: '13px',
                    fontWeight: 600,
                    padding: '9px',
                    borderRadius: '12px',
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.14)',
                  }}
                >
                  <Phone size={13} color="#ff7aae" aria-hidden="true" />
                  <span>Call (760) 290-5910</span>
                </a>
              </div>

              <div className="sed-card" style={{ padding: '22px 18px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#fff', margin: '0 0 10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MapPin size={15} color="#ff7aae" aria-hidden="true" />
                  <span>Location &amp; Travel Radius</span>
                </h3>
                <p style={{ fontSize: '13px', color: '#e2d6dc', lineHeight: 1.6, margin: '0 0 12px' }}>
                  <strong style={{ color: '#fff' }}>Flagship Studio:</strong> 935 W San Marcos Blvd, Suite 101, San Marcos, CA 92078 (just minutes from our former Vista location).
                </p>
                <p style={{ fontSize: '13px', color: '#e2d6dc', lineHeight: 1.6, margin: '0 0 12px' }}>
                  <strong style={{ color: '#fff' }}>On-Location Travel:</strong> We bring our glam team to venues, hotels, and homes across:
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '14px' }}>
                  {['San Marcos', 'Vista', 'Carlsbad', 'Escondido', 'Oceanside', 'Encinitas', 'San Elijo Hills', 'Rancho Santa Fe', 'Del Mar', 'Temecula'].map((city) => (
                    <span key={city} style={{ fontSize: '11px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', color: '#f0e4ea', padding: '3px 9px', borderRadius: '999px' }}>
                      {city}
                    </span>
                  ))}
                </div>
                {detailed?.serviceAreas?.venues && (
                  <div>
                    <span style={{ fontSize: '11px', color: '#ff8ab8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>
                      Featured Local Venues Served:
                    </span>
                    <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '12.5px', color: '#e2d6dc', lineHeight: 1.65 }}>
                      {detailed.serviceAreas.venues.map((v) => (
                        <li key={v}>{v}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="sed-card" style={{ padding: '18px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12.5px', color: '#f0e4ea', fontWeight: 500 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ShieldCheck size={16} color="#ff7aae" aria-hidden="true" />
                    <span>Licensed &amp; Insured Beauty Artists</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Car size={16} color="#ff7aae" aria-hidden="true" />
                    <span>Punctual On-Location Arrival Guarantee</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Heart size={16} color="#ff7aae" aria-hidden="true" />
                    <span>5-Star Rated Across Google &amp; Yelp</span>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>

        <section style={{ marginTop: '56px', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '40px', contentVisibility: 'auto', containIntrinsicSize: '1px 360px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <p style={{ color: '#ff8ab8', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '2px', margin: 0 }}>
                Explore More
              </p>
              <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#fff', margin: '4px 0 0' }}>
                Other Special Events We Celebrate
              </h2>
            </div>
            <Link href="/special-events" style={{ color: '#ff7aae', textDecoration: 'none', fontSize: '13.5px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <span>View All Special Events</span>
              <ChevronRight size={14} aria-hidden="true" />
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
            {relatedEvents.map((r) => (
              <Link key={r.slug} href={`/special-events/${r.slug}`} style={{ textDecoration: 'none' }}>
                <div
                  className="sed-card"
                  style={{
                    padding: 0,
                    overflow: 'hidden',
                    borderRadius: '20px',
                    transition: 'transform 0.25s ease, border-color 0.25s ease',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <div style={{ position: 'relative', height: '148px', width: '100%', background: '#170b13' }}>
                    <img
                      src={r.heroImage}
                      alt={r.name}
                      width={340}
                      height={148}
                      loading="lazy"
                      fetchPriority="low"
                      decoding="async"
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
                    <span style={{ position: 'absolute', top: '12px', left: '12px', fontSize: '10px', fontWeight: 800, background: 'rgba(20, 8, 15, 0.88)', border: '1px solid rgba(255, 130, 180, 0.5)', color: '#ff8ab8', padding: '4px 11px', borderRadius: '999px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                      {r.tag}
                    </span>
                  </div>
                  <div style={{ padding: '18px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff', margin: '0 0 6px' }}>{r.name}</h3>
                      <p style={{ fontSize: '13px', color: '#e2d6dc', lineHeight: 1.55, margin: 0 }}>
                        {r.shortDesc.slice(0, 95)}…
                      </p>
                    </div>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#ff7aae', fontSize: '12.5px', fontWeight: 700, marginTop: '14px' }}>
                      <span>Learn More</span>
                      <ChevronRight size={13} aria-hidden="true" />
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
