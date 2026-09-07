import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import {
  getDetailedServiceBySlug,
  ALL_CANONICAL_SLUGS,
  SERVICES_DETAILED,
  type DetailedService,
} from '@/data/servicesDetailed';

export const revalidate = 3600;

export async function generateStaticParams() {
  return ALL_CANONICAL_SLUGS.map((slug) => ({ slug }));
}

function serviceCanonical(slug: string) {
  return `https://www.glitzandglamours.com/services/${slug}`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const detailed = getDetailedServiceBySlug(slug);

  if (detailed) {
    const canonical = serviceCanonical(detailed.slug);
    const imageUrl = detailed.imageUrl.startsWith('http')
      ? detailed.imageUrl
      : `https://www.glitzandglamours.com${detailed.imageUrl}`;

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
        images: [{ url: imageUrl, alt: `${detailed.name} at Glitz & Glamour Studio in Vista, CA` }],
      },
      twitter: {
        card: 'summary_large_image',
        title: detailed.seoTitle,
        description: detailed.seoDescription,
        images: [imageUrl],
      },
    };
  }

  // Fallback to database lookup
  let svc: any = null;
  try {
    svc = await prisma.service.findUnique({
      where: { slug },
      select: {
        name: true,
        slug: true,
        description: true,
        seoTitle: true,
        seoDescription: true,
        seoKeywords: true,
        ogImageUrl: true,
        imageUrl: true,
        category: true,
      },
    });
  } catch {
    svc = null;
  }

  if (!svc) {
    return {
      title: 'Service Not Found | Glitz & Glamour Studio',
      robots: { index: false, follow: false },
    };
  }

  const title = (svc.seoTitle?.trim() || `${svc.name} in Vista CA | Glitz & Glamour`).slice(0, 68);
  const description = (
    svc.seoDescription?.trim() ||
    svc.description?.trim() ||
    `${svc.name} at Glitz & Glamour Studio in Vista, CA. View details, pricing, and book online.`
  ).slice(0, 158);
  const canonical = serviceCanonical(svc.slug || slug);

  return {
    title,
    description,
    keywords: svc.seoKeywords?.trim() || `${svc.name}, ${svc.category}, Vista CA`,
    alternates: { canonical },
  };
}

export default async function ServicePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const detailed = getDetailedServiceBySlug(slug);

  // If accessed via an alias, permanently redirect to canonical slug
  if (detailed && slug !== detailed.slug) {
    redirect(`/services/${detailed.slug}`);
  }

  // Optional Prisma query to fetch real-time DB id / updates
  let dbService: any = null;
  let relatedDb: any[] = [];
  try {
    if (detailed) {
      dbService = await prisma.service.findFirst({
        where: {
          OR: [
            { slug: detailed.slug },
            { id: detailed.id },
            { name: { equals: detailed.name, mode: 'insensitive' } },
          ],
        },
      });
    } else {
      dbService = await prisma.service.findUnique({ where: { slug } });
    }

    if (dbService?.category) {
      relatedDb = await prisma.service.findMany({
        where: {
          isActive: true,
          category: dbService.category,
          NOT: { id: dbService.id },
        },
        orderBy: { displayOrder: 'asc' },
        take: 4,
        select: { id: true, name: true, slug: true, priceLabel: true, imageUrl: true },
      });
    }
  } catch (err) {
    // Database fallback or offline handling
  }

  if (!detailed && !dbService) {
    notFound();
  }

  // Merge static curated data with dynamic database overrides
  const name = detailed?.name || dbService?.name || 'Service';
  const canonicalSlug = detailed?.slug || dbService?.slug || slug;
  const canonicalUrl = serviceCanonical(canonicalSlug);
  const category = detailed?.category || dbService?.category || 'salon';
  const categoryLabel = detailed?.categoryLabel || category.charAt(0).toUpperCase() + category.slice(1);
  const priceLabel = dbService?.priceLabel || detailed?.priceLabel || 'Starting at $50';
  const startingAt = detailed?.startingAtPrice || dbService?.startingAtPrice || 50;
  const durationMins = detailed?.durationMins || dbService?.durationMins || 60;
  const bookId = dbService?.id || detailed?.id || canonicalSlug;
  const heroImage = dbService?.imageUrl || detailed?.imageUrl || '/services/Full_Set_GelX.jpeg';
  const h1Title = detailed?.h1 || `${name} in Vista, CA`;

  const overviewParagraphs = detailed?.overview || [
    dbService?.description || `${name} at Glitz & Glamour Studio in Vista, CA.`,
    `Every ${name.toLowerCase()} service is customized to your preferences with precision care, unhurried attention, and premium salon-grade formulas.`,
  ];

  const whoItsFor = detailed?.whoItsFor || [
    `Clients in Vista, San Marcos, Oceanside, and Carlsbad seeking high-quality ${name.toLowerCase()}`,
    `Anyone looking for clean, personalized, and unhurried salon care`,
    `Clients wanting long-lasting results using premium products`,
  ];

  const whatsIncluded = detailed?.whatsIncluded || [
    `One-on-one consultation to discuss goals and personal preferences`,
    `Professional preparation and precision technique execution`,
    `Nourishing finish and tailored aftercare advice`,
  ];

  const aftercare = detailed?.aftercare || [
    `Follow personalized care instructions provided during your visit to maximize longevity`,
    `Protect the treated area from excessive heat, harsh chemicals, or picking`,
    `Schedule routine maintenance to keep your look fresh and healthy`,
  ];

  const pricingDisclaimer = detailed?.pricingDisclaimer ||
    `Prices shown are starting points. Final pricing is confirmed in person before beginning, based on length, complexity, and custom requests.`;

  const faqs = detailed?.faqs || [
    {
      q: `How do I book a ${name} appointment?`,
      a: `You can easily book online through our booking page. We confirm all details and pricing transparently before your service begins.`,
    },
    {
      q: `Where is Glitz & Glamour Studio located?`,
      a: `We are located at 935 W San Marcos Blvd, Suite 101, San Marcos, CA 92078, proudly serving clients from Vista, San Marcos, Carlsbad, and North County San Diego.`,
    },
    {
      q: `What is your cancellation policy?`,
      a: `We kindly request at least 24 hours notice for any cancellations or rescheduling so we can accommodate other clients on our waitlist.`,
    },
  ];

  // Related services fallback
  const relatedServices = (relatedDb.length > 0
    ? relatedDb
    : SERVICES_DETAILED.filter((s) => s.category === category && s.slug !== canonicalSlug).slice(0, 4)
  ).map((r: any) => ({
    name: r.name,
    slug: r.slug || r.id,
    priceLabel: r.priceLabel,
    imageUrl: r.imageUrl,
  }));

  // JSON-LD Schemas
  const jsonLdService = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name,
    description: (detailed?.seoDescription || dbService?.seoDescription || overviewParagraphs[0]).slice(0, 500),
    provider: {
      '@type': 'BeautySalon',
      name: 'Glitz & Glamour Studio',
      url: 'https://www.glitzandglamours.com',
      telephone: '+1-760-525-8327',
      address: {
        '@type': 'PostalAddress',
        streetAddress: '935 W San Marcos Blvd, Suite 101',
        addressLocality: 'San Marcos',
        addressRegion: 'CA',
        postalCode: '92078',
        addressCountry: 'US',
      },
    },
    areaServed: [
      { '@type': 'City', name: 'Vista, CA' },
      { '@type': 'City', name: 'San Marcos, CA' },
      { '@type': 'City', name: 'Oceanside, CA' },
      { '@type': 'City', name: 'Carlsbad, CA' },
      { '@type': 'AdministrativeArea', name: 'North County San Diego' },
    ],
    url: canonicalUrl,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'USD',
      price: startingAt,
      url: canonicalUrl,
      availability: 'https://schema.org/InStock',
    },
  };

  const jsonLdFaq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  const jsonLdBreadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.glitzandglamours.com' },
      { '@type': 'ListItem', position: 2, name: 'Services', item: 'https://www.glitzandglamours.com/services' },
      { '@type': 'ListItem', position: 3, name: categoryLabel, item: `https://www.glitzandglamours.com/services#${category}` },
      { '@type': 'ListItem', position: 4, name, item: canonicalUrl },
    ],
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0A' }}>
      <style>{`
        .sp-wrap { max-width: 880px; margin: 0 auto; padding: 24px 20px 120px; font-family: 'Poppins', sans-serif; }
        .sp-breadcrumb { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #777; margin-bottom: 24px; flex-wrap: wrap; }
        .sp-breadcrumb a { color: #888; text-decoration: none; transition: color 0.2s; }
        .sp-breadcrumb a:hover { color: #FF2D78; }
        .sp-breadcrumb-sep { color: #444; }
        .sp-breadcrumb-current { color: #FF2D78; font-weight: 600; }

        .sp-hero { border-radius: 28px; overflow: hidden; border: 1px solid rgba(255,255,255,0.08); position: relative; margin-bottom: 24px; background: #111; }
        .sp-hero-img { position: relative; height: 360px; }
        .sp-hero-overlay { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(10,10,10,0.2) 0%, rgba(10,10,10,0.75) 55%, rgba(10,10,10,0.98) 100%); }
        .sp-hero-content { position: absolute; inset: 0; display: flex; align-items: flex-end; padding: 32px; }
        .sp-hero-inner { max-width: 740px; }
        .sp-hero-badge { display: inline-flex; align-items: center; gap: 6px; background: rgba(255,45,120,0.15); border: 1px solid rgba(255,45,120,0.35); border-radius: 50px; padding: 5px 14px; font-size: 11px; font-weight: 700; color: #FF2D78; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 12px; }
        .sp-hero h1 { font-weight: 800; color: #fff; font-size: clamp(1.8rem, 4.2vw, 2.6rem); letter-spacing: -0.6px; margin: 0 0 10px; line-height: 1.15; }
        .sp-hero-desc { color: #ccc; font-size: 14px; line-height: 1.6; margin: 0 0 18px; max-width: 600px; }
        .sp-hero-meta { display: flex; gap: 14px; flex-wrap: wrap; align-items: center; }
        .sp-hero-pill { display: inline-flex; align-items: center; gap: 6px; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.12); border-radius: 50px; padding: 8px 16px; font-size: 14px; font-weight: 700; color: #fff; }
        .sp-hero-pill .price { color: #FF2D78; font-weight: 800; }

        .sp-section { background: rgba(255,255,255,0.025); border: 1px solid rgba(255,255,255,0.06); border-radius: 20px; padding: 28px; margin-bottom: 20px; }
        .sp-section-title { font-size: 19px; font-weight: 800; color: #fff; margin: 0 0 16px; display: flex; align-items: center; gap: 10px; letter-spacing: -0.3px; }
        .sp-section-icon { width: 34px; height: 34px; border-radius: 10px; background: rgba(255,45,120,0.12); border: 1px solid rgba(255,45,120,0.25); display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 16px; }
        .sp-p { color: #bbb; font-size: 14.5px; line-height: 1.8; margin: 0 0 14px; }
        .sp-p:last-child { margin-bottom: 0; }
        .sp-ul { margin: 0; padding-left: 0; list-style: none; }
        .sp-ul li { position: relative; padding-left: 22px; color: #ddd; font-size: 14px; line-height: 1.8; margin-bottom: 8px; }
        .sp-ul li::before { content: '✦'; position: absolute; left: 0; color: #FF2D78; font-size: 11px; top: 3px; }

        .sp-faq { border-radius: 14px; background: rgba(255,255,255,0.025); border: 1px solid rgba(255,255,255,0.06); overflow: hidden; margin-bottom: 10px; }
        .sp-faq summary { list-style: none; cursor: pointer; padding: 16px 20px; display: flex; align-items: center; justify-content: space-between; gap: 12px; }
        .sp-faq summary::-webkit-details-marker { display: none; }
        .sp-faq summary span:first-child { color: #fff; font-weight: 700; font-size: 14.5px; line-height: 1.4; }
        .sp-faq-chevron { width: 26px; height: 26px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); background: rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: #FF2D78; flex-shrink: 0; transition: transform 180ms ease; font-size: 14px; }
        details[open] .sp-faq-chevron { transform: rotate(180deg); }
        .sp-faq-answer { padding: 0 20px 18px; color: #aaa; font-size: 14px; line-height: 1.75; }

        .sp-related-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
        .sp-related-card { display: flex; gap: 14px; align-items: center; padding: 14px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.06); background: rgba(0,0,0,0.25); text-decoration: none; transition: all 0.25s; }
        .sp-related-card:hover { border-color: rgba(255,45,120,0.35); background: rgba(255,45,120,0.05); transform: translateY(-2px); }
        .sp-related-img { width: 48px; height: 48px; border-radius: 10px; overflow: hidden; position: relative; flex-shrink: 0; background: #222; }
        .sp-related-name { color: #eee; font-weight: 700; font-size: 13.5px; margin: 0 0 3px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .sp-related-price { color: #FF2D78; font-weight: 700; font-size: 12.5px; margin: 0; }

        .sp-cta-section { background: linear-gradient(135deg, rgba(255,45,120,0.1), rgba(121,40,202,0.08)); border: 1px solid rgba(255,45,120,0.2); border-radius: 24px; padding: 36px 24px; text-align: center; margin-bottom: 24px; }
        .sp-cta-section h2 { font-size: 24px; font-weight: 800; color: #fff; margin: 0 0 10px; letter-spacing: -0.4px; }
        .sp-cta-section p { color: #bbb; font-size: 14.5px; line-height: 1.65; margin: 0 0 22px; max-width: 520px; margin-left: auto; margin-right: auto; }

        .sp-links { display: flex; gap: 14px; flex-wrap: wrap; justify-content: center; margin-top: 18px; }
        .sp-links a { color: #777; font-size: 12.5px; text-decoration: none; transition: color 0.2s; }
        .sp-links a:hover { color: #FF2D78; }

        .sp-sticky { position: fixed; left: 0; right: 0; bottom: 0; z-index: 60; padding: 12px 18px; background: rgba(10,10,10,0.92); border-top: 1px solid rgba(255,255,255,0.08); backdrop-filter: blur(24px); }
        .sp-sticky-inner { max-width: 880px; margin: 0 auto; display: flex; gap: 14px; align-items: center; }
        .sp-sticky-info { flex: 1; min-width: 0; }
        .sp-sticky-name { margin: 0; color: #fff; font-weight: 800; font-size: 13.5px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .sp-sticky-price { margin: 0; color: #FF2D78; font-size: 12.5px; font-weight: 700; }

        @media (max-width: 640px) {
          .sp-hero-img { height: 280px; }
          .sp-hero-content { padding: 20px; }
          .sp-related-grid { grid-template-columns: 1fr; }
          .sp-sticky { padding-bottom: calc(12px + 64px); }
        }
      `}</style>

      {/* JSON-LD Schemas */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdService) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFaq) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumb) }} />

      <div className="sp-wrap">
        {/* Breadcrumb navigation */}
        <nav className="sp-breadcrumb" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span className="sp-breadcrumb-sep">›</span>
          <Link href="/services">Services</Link>
          <span className="sp-breadcrumb-sep">›</span>
          <Link href={`/services#${category}`}>{categoryLabel}</Link>
          <span className="sp-breadcrumb-sep">›</span>
          <span className="sp-breadcrumb-current">{name}</span>
        </nav>

        {/* Hero Section */}
        <section className="sp-hero">
          <div className="sp-hero-img">
            {heroImage && (
              <Image
                src={heroImage}
                alt={`${name} at Glitz & Glamour Studio in Vista, CA`}
                fill
                priority
                style={{ objectFit: 'cover', objectPosition: 'center' }}
              />
            )}
            <div className="sp-hero-overlay" />
            <div className="sp-hero-content">
              <div className="sp-hero-inner">
                <div className="sp-hero-badge">{categoryLabel}</div>
                <h1>{h1Title}</h1>
                <p className="sp-hero-desc">
                  {detailed?.seoDescription ||
                    `Premium ${name.toLowerCase()} by JoJany at Glitz & Glamour Studio in Vista, CA. Serving North County.`}
                </p>
                <div className="sp-hero-meta">
                  <span className="sp-hero-pill">
                    <span className="price">{priceLabel}</span>
                  </span>
                  {durationMins ? (
                    <span className="sp-hero-pill">⏱ {durationMins} min</span>
                  ) : null}
                  <Link
                    href={`/book?service=${bookId}`}
                    className="btn-primary"
                    style={{ padding: '10px 22px', fontSize: '14px', fontWeight: 700 }}
                  >
                    Book This Service
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="sp-section" id="pricing">
          <h2 className="sp-section-title">
            <span className="sp-section-icon">💰</span> Transparent Pricing
          </h2>
          <p style={{ color: '#FF2D78', fontWeight: 800, fontSize: '24px', margin: '0 0 8px' }}>
            {priceLabel}
          </p>
          <p className="sp-p">
            {pricingDisclaimer}
          </p>
        </section>

        {/* About This Service / Comprehensive Narrative */}
        <section className="sp-section">
          <h2 className="sp-section-title">
            <span className="sp-section-icon">📋</span> About This Service
          </h2>
          {overviewParagraphs.map((p, i) => (
            <p key={i} className="sp-p">
              {p}
            </p>
          ))}
          <p className="sp-p" style={{ marginTop: '14px', color: '#999', fontSize: '13.5px' }}>
            All {name.toLowerCase()} services are provided by JoJany at{' '}
            <Link href="/" style={{ color: '#FF2D78', textDecoration: 'none', fontWeight: 600 }}>
              Glitz &amp; Glamour Studio
            </Link>
            {' '}in Vista, CA — conveniently serving clients throughout North County San Diego including San Marcos, Oceanside, and Carlsbad.
          </p>
        </section>

        {/* Who It's For */}
        <section className="sp-section">
          <h2 className="sp-section-title">
            <span className="sp-section-icon">🎯</span> Who It&apos;s For
          </h2>
          <ul className="sp-ul">
            {whoItsFor.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </section>

        {/* What's Included / Step-by-Step Protocol */}
        <section className="sp-section">
          <h2 className="sp-section-title">
            <span className="sp-section-icon">✨</span> What&apos;s Included in Your Appointment
          </h2>
          <ul className="sp-ul">
            {whatsIncluded.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ul>
        </section>

        {/* Pro Aftercare & Longevity Tips */}
        {aftercare && aftercare.length > 0 && (
          <section className="sp-section">
            <h2 className="sp-section-title">
              <span className="sp-section-icon">🛡️</span> Pro Aftercare &amp; Longevity Tips
            </h2>
            <ul className="sp-ul">
              {aftercare.map((tip, i) => (
                <li key={i}>{tip}</li>
              ))}
            </ul>
          </section>
        )}

        {/* Frequently Asked Questions */}
        {faqs.length > 0 && (
          <section className="sp-section" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.015))' }}>
            <h2 className="sp-section-title">
              <span className="sp-section-icon">❓</span> Frequently Asked Questions
            </h2>
            <div>
              {faqs.map((f, i) => (
                <details key={i} className="sp-faq">
                  <summary>
                    <span>{f.q}</span>
                    <span className="sp-faq-chevron" aria-hidden>⌄</span>
                  </summary>
                  <div className="sp-faq-answer">{f.a}</div>
                </details>
              ))}
            </div>
          </section>
        )}

        {/* Related Services */}
        {relatedServices.length > 0 && (
          <section className="sp-section">
            <h2 className="sp-section-title">
              <span className="sp-section-icon">💅</span> More {categoryLabel} Services
            </h2>
            <div className="sp-related-grid">
              {relatedServices.map((r, i) => (
                <Link key={i} href={`/services/${r.slug}`} className="sp-related-card">
                  {r.imageUrl && (
                    <div className="sp-related-img">
                      <Image src={r.imageUrl} alt={r.name} fill style={{ objectFit: 'cover' }} />
                    </div>
                  )}
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <p className="sp-related-name">{r.name}</p>
                    <p className="sp-related-price">{r.priceLabel}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Bottom CTA Section */}
        <section className="sp-cta-section">
          <h2>Ready to Book Your {name}?</h2>
          <p>
            Reserve your appointment online with instant confirmation. Final pricing is always discussed and confirmed before we begin.
          </p>
          <Link
            href={`/book?service=${bookId}`}
            className="btn-primary"
            style={{ padding: '14px 32px', fontSize: '15px', fontWeight: 700, display: 'inline-block' }}
          >
            Book Your Appointment Online
          </Link>
          <div className="sp-links">
            <Link href="/services">All Services</Link>
            <span style={{ color: '#444' }}>·</span>
            <Link href="/reviews">Reviews</Link>
            <span style={{ color: '#444' }}>·</span>
            <Link href="/gallery">Gallery</Link>
            <span style={{ color: '#444' }}>·</span>
            <Link href="/policy">Studio Policies</Link>
            <span style={{ color: '#444' }}>·</span>
            <Link href="/faq">FAQ</Link>
          </div>
        </section>
      </div>

      {/* Mobile Sticky Bar */}
      <div className="sp-sticky">
        <div className="sp-sticky-inner">
          <div className="sp-sticky-info">
            <p className="sp-sticky-name">{name}</p>
            <p className="sp-sticky-price">{priceLabel}</p>
          </div>
          <Link
            href={`/book?service=${bookId}`}
            className="btn-primary"
            style={{ padding: '10px 20px', fontWeight: 800, whiteSpace: 'nowrap', fontSize: '13px' }}
          >
            Book Now
          </Link>
        </div>
        <div style={{ height: 'env(safe-area-inset-bottom)' }} />
      </div>
    </div>
  );
}
