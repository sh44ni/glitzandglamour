import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { 
  MapPin, 
  Sparkles, 
  Calendar, 
  Phone, 
  CheckCircle2, 
  HelpCircle, 
  Star, 
  ChevronRight, 
  DollarSign, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { SERVICE_AREAS, ALL_SERVICE_AREA_SLUGS } from '@/data/serviceAreas';
import RealReviewsSection from '@/components/RealReviewsSection';
import { getDynamicRealReviews, getFilteredRealReviews } from '@/lib/realReviews';

interface PageProps {
  params: Promise<{ city: string }>;
}

export const revalidate = 3600;

export async function generateStaticParams() {
  return ALL_SERVICE_AREA_SLUGS.map((slug) => ({
    city: slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { city } = await params;
  const area = SERVICE_AREAS[city];

  if (!area) {
    return {
      title: 'Service Area Not Found | Glitz & Glamour Studio',
      robots: { index: false, follow: false },
    };
  }

  const canonicalUrl = `https://www.glitzandglamours.com/service-areas/${city}`;

  return {
    title: area.metaTitle,
    description: area.metaDescription,
    keywords: area.keywords.join(', '),
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: area.metaTitle,
      description: area.metaDescription,
      url: canonicalUrl,
      type: 'website',
      images: [
        {
          url: `https://www.glitzandglamours.com${area.heroImage}`,
          width: 1200,
          height: 630,
          alt: `${area.heroTitle} - Glitz & Glamour Studio`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: area.metaTitle,
      description: area.metaDescription,
      images: [`https://www.glitzandglamours.com${area.heroImage}`],
    },
  };
}

export default async function ServiceAreaPage({ params }: PageProps) {
  const { city } = await params;
  const area = SERVICE_AREAS[city];

  if (!area) {
    notFound();
  }

  // Fetch dynamic, auto-updating real reviews from the DB (with verified fallback cache)
  const allReviews = await getDynamicRealReviews();
  const realReviews = getFilteredRealReviews({
    allReviews,
    slug: city,
    keywords: area.keywords,
    city: area.city,
    limit: 2,
  });

  // Schema.org Structured Data
  const jsonLdLocalBusiness = {
    '@context': 'https://schema.org',
    '@type': 'BeautySalon',
    name: 'Glitz & Glamour Studio',
    image: `https://www.glitzandglamours.com${area.heroImage}`,
    '@id': `https://www.glitzandglamours.com/service-areas/${area.slug}#salon`,
    url: `https://www.glitzandglamours.com/service-areas/${area.slug}`,
    telephone: '+1-760-290-5910',
    priceRange: '$$$',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '935 W San Marcos Blvd, Suite 101',
      addressLocality: 'San Marcos',
      addressRegion: 'CA',
      postalCode: '92078',
      addressCountry: 'US',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: area.geo.latitude,
      longitude: area.geo.longitude,
    },
    areaServed: {
      '@type': 'City',
      name: `${area.city}, CA`,
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        opens: '09:00',
        closes: '18:00',
      },
    ],
  };

  const jsonLdFAQ = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: area.faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  const jsonLdBreadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://www.glitzandglamours.com',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Special Events',
        item: 'https://www.glitzandglamours.com/special-events',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'Weddings & Bridal',
        item: 'https://www.glitzandglamours.com/special-events/weddings-bridal',
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: `${area.city}, CA`,
        item: `https://www.glitzandglamours.com/service-areas/${area.slug}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdLocalBusiness) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFAQ) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumb) }}
      />

      <style>{`
        .sa-page {
          min-height: 100vh;
          background: #0a0a0a;
          color: #fff;
          font-family: var(--font-poppins, 'Poppins'), sans-serif;
          position: relative;
          z-index: 1;
          padding-bottom: 90px;
        }
        .sa-nav-bar {
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          background: rgba(17, 17, 17, 0.6);
          backdrop-filter: blur(10px);
        }
        .sa-nav-inner {
          max-width: 1140px;
          margin: 0 auto;
          padding: 14px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 10px;
        }
        .sa-breadcrumbs {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: #888;
          list-style: none;
          margin: 0;
          padding: 0;
        }
        .sa-breadcrumbs a {
          color: #aaa;
          text-decoration: none;
          transition: color 0.2s;
        }
        .sa-breadcrumbs a:hover {
          color: #FF2D78;
        }
        .sa-breadcrumbs-sep {
          color: #444;
          font-size: 12px;
        }
        .sa-breadcrumbs-cur {
          color: #FF2D78;
          font-weight: 600;
        }
        .sa-hero-wrap {
          border-radius: 28px;
          overflow: hidden;
          position: relative;
          min-height: 480px;
          display: flex;
          align-items: flex-end;
          border: 1px solid rgba(255, 45, 120, 0.25);
          box-shadow: 0 24px 70px rgba(0, 0, 0, 0.7);
          margin-bottom: 36px;
        }
        .sa-hero-content {
          position: relative;
          z-index: 2;
          width: 100%;
          max-width: 820px;
          padding: 48px 32px 40px;
        }
        .sa-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(255, 45, 120, 0.12);
          border: 1px solid rgba(255, 45, 120, 0.3);
          border-radius: 50px;
          padding: 6px 16px;
          color: #FF2D78;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 14px;
        }
        .sa-hero-title {
          font-size: clamp(26px, 4.5vw, 42px);
          font-weight: 800;
          color: #fff;
          line-height: 1.18;
          letter-spacing: -0.5px;
          margin: 0 0 14px;
        }
        .sa-hero-tagline {
          font-size: clamp(14px, 2vw, 17px);
          color: #ccc;
          line-height: 1.6;
          margin-bottom: 24px;
        }
        .sa-cta-row {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          align-items: center;
          margin-bottom: 20px;
        }
        .sa-studio-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 8px 16px;
          font-size: 12px;
          color: #bbb;
        }
        .sa-content-grid {
          display: grid;
          grid-template-columns: 1.3fr 0.7fr;
          gap: 28px;
          margin-bottom: 40px;
        }
        .sa-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 20px;
          padding: 28px;
          margin-bottom: 24px;
        }
        .sa-value-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 14px;
          margin-top: 24px;
        }
        .sa-value-item {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 14px;
          padding: 16px;
        }
        .sa-venue-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(270px, 1fr));
          gap: 16px;
          margin-bottom: 32px;
        }
        .sa-venue-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 18px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          transition: border-color 0.25s ease;
        }
        .sa-venue-card:hover {
          border-color: rgba(255, 45, 120, 0.35);
        }
        .sa-tip-box {
          background: rgba(255, 45, 120, 0.05);
          border: 1px solid rgba(255, 45, 120, 0.18);
          border-radius: 12px;
          padding: 12px 14px;
          margin-top: 14px;
          font-size: 12px;
          color: #eee;
          line-height: 1.55;
        }
        .sa-service-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 16px;
          margin-bottom: 32px;
        }
        .sa-service-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 18px;
          padding: 22px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        .sa-driver-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 14px;
          margin: 18px 0 24px;
        }
        .sa-driver-card {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 14px;
          padding: 16px;
          text-align: center;
        }
        .sa-driver-num {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(255, 45, 120, 0.12);
          color: #FF2D78;
          font-weight: 700;
          font-size: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 10px;
        }
        .sa-review-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 16px;
          margin-bottom: 32px;
        }
        .sa-review-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 18px;
          padding: 22px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        .sa-faq-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          overflow: hidden;
          margin-bottom: 12px;
          transition: all 0.25s ease;
        }
        .sa-faq-card[open] {
          border-color: rgba(255, 45, 120, 0.35);
          background: rgba(255, 45, 120, 0.04);
        }
        .sa-faq-summary {
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
        .sa-faq-summary::-webkit-details-marker {
          display: none;
        }
        .sa-sidebar {
          position: sticky;
          top: 24px;
        }
        .sa-sidebar-card {
          background: linear-gradient(180deg, #161616 0%, #111111 100%);
          border: 1px solid rgba(255, 45, 120, 0.25);
          border-radius: 22px;
          padding: 26px;
          box-shadow: 0 16px 45px rgba(0, 0, 0, 0.5);
        }
        .sa-crosslink-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 12px;
          margin: 20px 0;
        }
        .sa-city-chip {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 12px 14px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: #ddd;
          text-decoration: none;
          text-align: center;
          transition: all 0.2s ease;
        }
        .sa-city-chip:hover {
          border-color: rgba(255, 45, 120, 0.4);
          color: #FF2D78;
          background: rgba(255, 45, 120, 0.05);
        }
        .sa-city-chip.active {
          border-color: #FF2D78;
          background: rgba(255, 45, 120, 0.12);
          color: #fff;
          font-weight: 700;
          pointer-events: none;
        }
        @media (max-width: 900px) {
          .sa-content-grid {
            grid-template-columns: 1fr;
          }
          .sa-sidebar {
            order: -1;
            margin-bottom: 24px;
            position: static;
          }
        }
        @media (max-width: 600px) {
          .sa-hero-wrap {
            min-height: 420px;
            border-radius: 20px;
          }
          .sa-hero-content {
            padding: 32px 20px 24px;
          }
          .sa-cta-row {
            flex-direction: column;
            align-items: stretch;
          }
          .sa-cta-row a {
            text-align: center;
            justify-content: center;
          }
        }
      `}</style>

      <div className="sa-page">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="sa-nav-bar">
          <div className="sa-nav-inner">
            <ol className="sa-breadcrumbs">
              <li>
                <Link href="/">Home</Link>
              </li>
              <li className="sa-breadcrumbs-sep">/</li>
              <li>
                <Link href="/special-events">Special Events</Link>
              </li>
              <li className="sa-breadcrumbs-sep">/</li>
              <li>
                <Link href="/special-events/weddings-bridal">Weddings &amp; Bridal</Link>
              </li>
              <li className="sa-breadcrumbs-sep">/</li>
              <li className="sa-breadcrumbs-cur" aria-current="page">
                {area.city}, CA
              </li>
            </ol>

            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#aaa' }}>
              <MapPin size={12} color="#FF2D78" />
              <span>San Marcos Studio &bull; Mobile Across San Diego</span>
            </div>
          </div>
        </nav>

        {/* Main Page Container */}
        <div style={{ maxWidth: '1140px', margin: '20px auto 0', padding: '0 20px' }}>
          {/* Hero Section */}
          <section className="sa-hero-wrap">
            <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
              <Image
                src={area.heroImage}
                alt={`${area.heroTitle} wedding hair and makeup`}
                fill
                priority
                style={{ objectFit: 'cover', objectPosition: 'center 25%', opacity: 0.35 }}
                sizes="100vw"
              />
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background:
                    'linear-gradient(180deg, rgba(10,10,10,0.2) 0%, rgba(10,10,10,0.65) 50%, rgba(10,10,10,0.96) 100%)',
                }}
              />
            </div>

            <div className="sa-hero-content">
              <span className="sa-badge">
                <Sparkles size={12} color="#FF2D78" />
                {area.tagBadge}
              </span>

              <h1 className="sa-hero-title">{area.heroTitle}</h1>

              <p className="sa-hero-tagline">{area.heroTagline}</p>

              {/* CTAs */}
              <div className="sa-cta-row">
                <button
                  type="button"
                  data-open-quote="true"
                  data-city={`${area.city}, CA`}
                  data-event-type="Wedding / Bridal"
                  className="btn-primary"
                  style={{ padding: '12px 26px', fontSize: '14px', gap: '8px', cursor: 'pointer' }}
                >
                  <DollarSign size={15} />
                  Request Custom Wedding Quote
                  <ChevronRight size={14} />
                </button>

                <a
                  href="tel:7602905910"
                  className="btn-outline"
                  style={{ padding: '12px 22px', fontSize: '14px', gap: '8px' }}
                >
                  <Phone size={14} color="#FF2D78" />
                  Call (760) 290-5910
                </a>
              </div>

              {/* Proximity Pill */}
              <div className="sa-studio-pill">
                <MapPin size={13} color="#FF2D78" />
                <span>
                  <strong>Flagship Studio:</strong> 935 W San Marcos Blvd, Suite 101, San Marcos, CA 92078 &bull;{' '}
                  <span style={{ color: '#FF6BA8', fontWeight: 600 }}>{area.distanceFromStudio}</span>
                </span>
              </div>
            </div>
          </section>

          {/* Main 2-Column Grid */}
          <div className="sa-content-grid">
            {/* Left Main Column */}
            <div>
              {/* Detailed Intro Card */}
              <div className="sa-card">
                <p
                  style={{
                    color: '#FF2D78',
                    fontSize: '11px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '2px',
                    marginBottom: '4px',
                  }}
                >
                  Artistry &amp; Heritage
                </p>
                <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#fff', margin: '0 0 16px' }}>
                  Premier Wedding Hair &amp; Makeup Artistry in {area.city}, California
                </h2>
                {area.introParagraphs.map((paragraph, index) => (
                  <p key={index} style={{ fontSize: '14px', lineHeight: 1.8, color: '#ccc', marginBottom: '16px' }}>
                    {paragraph}
                  </p>
                ))}

                {/* 4 Value Pillars */}
                <div className="sa-value-grid">
                  {area.valueProps.map((prop, idx) => (
                    <div key={idx} className="sa-value-item">
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '6px' }}>
                        <CheckCircle2 size={16} color="#FF2D78" style={{ marginTop: '2px', flexShrink: 0 }} />
                        <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#fff', margin: 0 }}>
                          {prop.title}
                        </h3>
                      </div>
                      <p style={{ fontSize: '12px', color: '#999', lineHeight: 1.6, margin: 0, paddingLeft: '24px' }}>
                        {prop.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Local Wedding Venues Spotlight */}
              <div style={{ marginBottom: '28px' }}>
                <p
                  style={{
                    color: '#FF2D78',
                    fontSize: '11px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '2px',
                    marginBottom: '4px',
                  }}
                >
                  Local Venue Expertise
                </p>
                <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#fff', margin: '0 0 8px' }}>
                  Top Wedding Venues We Love in {area.city}
                </h2>
                <p style={{ color: '#aaa', fontSize: '13px', lineHeight: 1.6, marginBottom: '18px' }}>
                  Our mobile bridal team has deep experience with venue layouts, natural lighting conditions, and morning setup logistics across {area.city}.
                </p>

                <div className="sa-venue-grid">
                  {area.venues.map((venue, idx) => (
                    <div key={idx} className="sa-venue-card">
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                          <span
                            style={{
                              background: 'rgba(255, 45, 120, 0.1)',
                              color: '#FF6BA8',
                              fontSize: '11px',
                              fontWeight: 600,
                              padding: '3px 10px',
                              borderRadius: '6px',
                            }}
                          >
                            {venue.type}
                          </span>
                          <span style={{ fontSize: '11px', color: '#888', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <MapPin size={11} color="#666" />
                            {venue.neighborhood}
                          </span>
                        </div>

                        <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff', margin: '0 0 8px' }}>
                          {venue.name}
                        </h3>
                        <p style={{ fontSize: '13px', color: '#aaa', lineHeight: 1.6, margin: 0 }}>
                          {venue.description}
                        </p>
                      </div>

                      <div className="sa-tip-box">
                        <strong style={{ color: '#FF6BA8' }}>Stylist Tip:</strong> {venue.hmuaTip}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dedicated Services Provided */}
              <div style={{ marginBottom: '28px' }}>
                <p
                  style={{
                    color: '#FF2D78',
                    fontSize: '11px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '2px',
                    marginBottom: '4px',
                  }}
                >
                  Bespoke Options
                </p>
                <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#fff', margin: '0 0 18px' }}>
                  Tailored Wedding Hair &amp; Makeup Services for {area.city}
                </h2>

                <div className="sa-service-grid">
                  {area.servicesProvided.map((service, idx) => (
                    <div key={idx} className="sa-service-card">
                      <div>
                        <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff', margin: '0 0 8px' }}>
                          {service.title}
                        </h3>
                        <p style={{ fontSize: '13px', color: '#aaa', lineHeight: 1.6, marginBottom: '14px' }}>
                          {service.description}
                        </p>
                      </div>

                      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '12px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: '#FF2D78', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '8px' }}>
                          Included Features:
                        </span>
                        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {service.deliverables.map((item, itemIdx) => (
                            <li key={itemIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', fontSize: '12px', color: '#ccc' }}>
                              <CheckCircle2 size={13} color="#FF2D78" style={{ marginTop: '2px', flexShrink: 0 }} />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Custom Quote Pricing Breakdown */}
              <div className="sa-card" style={{ border: '1px solid rgba(255, 45, 120, 0.25)' }}>
                <p
                  style={{
                    color: '#FF2D78',
                    fontSize: '11px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '2px',
                    marginBottom: '4px',
                  }}
                >
                  Transparent Investment
                </p>
                <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#fff', margin: '0 0 6px' }}>
                  {area.pricingGuide.heading}
                </h2>
                <p style={{ color: '#FF6BA8', fontSize: '13px', fontWeight: 600, margin: '0 0 10px' }}>
                  {area.pricingGuide.subheading}
                </p>
                <p style={{ fontSize: '13px', color: '#ccc', lineHeight: 1.7, margin: '0 0 16px' }}>
                  {area.pricingGuide.explanation}
                </p>

                {/* 4 Cost Drivers */}
                <div className="sa-driver-grid">
                  {area.pricingGuide.drivers.map((driver, idx) => (
                    <div key={idx} className="sa-driver-card">
                      <div className="sa-driver-num">0{idx + 1}</div>
                      <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#fff', margin: '0 0 6px' }}>
                        {driver.title}
                      </h4>
                      <p style={{ fontSize: '12px', color: '#aaa', lineHeight: 1.5, margin: 0 }}>
                        {driver.description}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Proposal Request Banner */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '14px',
                    padding: '18px 20px',
                    borderRadius: '14px',
                    background: 'linear-gradient(135deg, rgba(255,45,120,0.15), rgba(168,85,247,0.1))',
                    border: '1px solid rgba(255,45,120,0.3)',
                  }}
                >
                  <div>
                    <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#fff', margin: '0 0 4px' }}>
                      Ready for Your Personalized {area.city} Wedding Quote?
                    </h4>
                    <p style={{ fontSize: '12px', color: '#ddd', margin: 0 }}>
                      Submit your wedding date, venue, and party size for a fast, no-obligation custom estimate.
                    </p>
                  </div>
                  <button
                    type="button"
                    data-open-quote="true"
                    data-city={`${area.city}, CA`}
                    data-event-type="Wedding / Bridal"
                    className="btn-primary"
                    style={{ padding: '10px 18px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
                  >
                    Request Custom Quote <ChevronRight size={14} />
                  </button>
                </div>
              </div>

              {/* Real Bride & Client Testimonials with Auto-Update and Keyword Relevance */}
              <RealReviewsSection
                city={area.city}
                reviews={realReviews}
              />

              {/* FAQs Accordion */}
              <div>
                <p
                  style={{
                    color: '#FF2D78',
                    fontSize: '11px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '2px',
                    marginBottom: '4px',
                  }}
                >
                  Help &amp; Logistics
                </p>
                <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#fff', margin: '0 0 16px' }}>
                  Frequently Asked Questions &bull; {area.city} Weddings
                </h2>

                <div>
                  {area.faqs.map((faq, idx) => (
                    <details key={idx} className="sa-faq-card">
                      <summary className="sa-faq-summary">
                        <span>{faq.question}</span>
                        <ChevronRight
                          size={16}
                          color="#FF2D78"
                          style={{ transform: 'rotate(90deg)', flexShrink: 0, marginLeft: '12px' }}
                        />
                      </summary>
                      <div style={{ padding: '0 20px 18px', color: '#aaa', fontSize: '13px', lineHeight: 1.75 }}>
                        {faq.answer}
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Sticky Sidebar */}
            <div>
              <aside className="sa-sidebar">
                <div className="sa-sidebar-card">
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color: '#FF2D78',
                      textTransform: 'uppercase',
                      letterSpacing: '1.5px',
                    }}
                  >
                    Booking Inquiries
                  </span>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#fff', margin: '6px 0 16px' }}>
                    {area.city} Wedding Glam
                  </h3>

                  <div
                    style={{
                      borderTop: '1px solid rgba(255,255,255,0.08)',
                      borderBottom: '1px solid rgba(255,255,255,0.08)',
                      padding: '14px 0',
                      marginBottom: '18px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                      fontSize: '12px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#888' }}>Coverage Area:</span>
                      <span style={{ color: '#fff', fontWeight: 600 }}>{area.city}, CA</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#888' }}>Studio HQ Distance:</span>
                      <span style={{ color: '#FF6BA8', fontWeight: 600 }}>{area.distanceFromStudio}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#888' }}>On-Location Travel:</span>
                      <span style={{ color: '#fff', fontWeight: 600 }}>Full Mobile Glam Squad</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#888' }}>Pricing Model:</span>
                      <span style={{ color: '#FFD700', fontWeight: 600 }}>Itemized Custom Quotes</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
                    <button
                      type="button"
                      data-open-quote="true"
                      data-city={`${area.city}, CA`}
                      data-event-type="Wedding / Bridal"
                      className="btn-primary"
                      style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: '13px', cursor: 'pointer', gap: '6px' }}
                    >
                      <Calendar size={14} />
                      Get Your Custom Proposal
                    </button>
                    <Link
                      href="/book"
                      className="btn-outline"
                      style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: '13px' }}
                    >
                      Book In-Studio Trial
                    </Link>
                  </div>

                  <div style={{ textAlign: 'center' }}>
                    <a
                      href="tel:7602905910"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        color: '#aaa',
                        fontSize: '12px',
                        textDecoration: 'none',
                      }}
                    >
                      <Phone size={12} color="#FF2D78" />
                      Or call us directly at <strong>(760) 290-5910</strong>
                    </a>
                  </div>
                </div>
              </aside>
            </div>
          </div>

          {/* Cross-Linking Hub: Other San Diego Service Areas */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: '20px',
              padding: '28px 24px',
              marginBottom: '32px',
              textAlign: 'center',
            }}
          >
            <span
              style={{
                color: '#FF2D78',
                fontSize: '11px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '2px',
              }}
            >
              Regional Coverage Network
            </span>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#fff', margin: '6px 0 10px' }}>
              Explore Bridal Hair &amp; Makeup Services Across San Diego County
            </h3>
            <p style={{ color: '#aaa', fontSize: '13px', maxWidth: '640px', margin: '0 auto 18px' }}>
              We travel throughout Southern California to bring couture bridal beauty directly to your bridal suite or hotel.
            </p>

            <div className="sa-crosslink-grid">
              {ALL_SERVICE_AREA_SLUGS.map((slug) => {
                const item = SERVICE_AREAS[slug];
                const isCurrent = slug === area.slug;
                return (
                  <Link
                    key={slug}
                    href={`/service-areas/${slug}`}
                    className={`sa-city-chip ${isCurrent ? 'active' : ''}`}
                  >
                    <span style={{ fontSize: '13px' }}>{item.city}, CA</span>
                    <span style={{ fontSize: '11px', color: '#888', marginTop: '2px' }}>{item.region}</span>
                  </Link>
                );
              })}
            </div>

            <div style={{ marginTop: '16px' }}>
              <Link
                href="/special-events/weddings-bridal"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: '#FF2D78',
                  fontSize: '13px',
                  fontWeight: 600,
                  textDecoration: 'none',
                }}
              >
                <span>View Full San Diego Weddings &amp; Bridal Services Page</span>
                <ChevronRight size={14} />
              </Link>
            </div>
          </div>

          {/* Bottom Banner CTA */}
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(255,45,120,0.14) 0%, rgba(168,85,247,0.1) 100%)',
              border: '1px solid rgba(255,45,120,0.3)',
              borderRadius: '24px',
              padding: '36px 24px',
              textAlign: 'center',
            }}
          >
            <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#fff', margin: '0 0 10px' }}>
              Reserve Your {area.city} Wedding Date
            </h2>
            <p style={{ color: '#ccc', fontSize: '14px', maxWidth: '560px', margin: '0 auto 20px', lineHeight: 1.6 }}>
              Let our senior bridal team curate a morning of relaxation, champagne, and picture-perfect hair and makeup for you and your bridal party.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center' }}>
              <button
                type="button"
                data-open-quote="true"
                data-city={`${area.city}, CA`}
                data-event-type="Wedding / Bridal"
                className="btn-primary"
                style={{ padding: '12px 28px', fontSize: '14px', cursor: 'pointer' }}
              >
                Request Custom Quote
              </button>
              <Link
                href="/book"
                className="btn-outline"
                style={{ padding: '12px 24px', fontSize: '14px' }}
              >
                Schedule Preview Trial
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
