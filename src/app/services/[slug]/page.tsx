import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import {
  Sparkles,
  FileText,
  Target,
  CheckCircle2,
  ShieldCheck,
  HelpCircle,
  Scissors,
  Clock,
  ChevronDown,
  ChevronRight,
  MapPin,
  BookOpen,
} from 'lucide-react';
import { prisma } from '@/lib/prisma';
import {
  getDetailedServiceBySlug,
  ALL_CANONICAL_SLUGS,
  SERVICES_DETAILED,
  type DetailedService,
} from '@/data/servicesDetailed';
import {
  ALL_SERVICE_CATEGORY_SLUGS,
  CATEGORY_HUB_BY_SERVICE_CATEGORY,
  SERVICE_CATEGORIES,
  getServiceCategoryBySlug,
} from '@/data/serviceCategories';

export const revalidate = 3600;

const CANONICAL_BY_ID = new Map(SERVICES_DETAILED.map((s) => [s.id, s]));
const CANONICAL_BY_SLUG = new Map(SERVICES_DETAILED.map((s) => [s.slug, s]));
const CANONICAL_BY_NAME = new Map(SERVICES_DETAILED.map((s) => [s.name.toLowerCase(), s]));

const SHARED_STYLES = `
  .sp-wrap {
    width: min(1040px, calc(100% - 2rem));
    margin: 0 auto;
    padding: 24px 0 110px;
    font-family: 'Poppins', sans-serif;
  }
  .sp-breadcrumb {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    color: #dfd2d9;
    margin-bottom: 22px;
    flex-wrap: wrap;
    padding: 8px 16px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
  }
  .sp-breadcrumb a {
    color: #e5d8df;
    text-decoration: none;
    transition: color 0.2s;
  }
  .sp-breadcrumb a:hover { color: #ff7aae; }
  .sp-breadcrumb-sep { color: #9c8b94; }
  .sp-breadcrumb-current { color: #ff8ab8; font-weight: 700; }

  .sp-hero {
    border-radius: 28px;
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.11);
    position: relative;
    margin-bottom: 24px;
    background:
      radial-gradient(circle at 18% 20%, rgba(255, 45, 120, 0.22), transparent 55%),
      radial-gradient(circle at 86% 18%, rgba(226, 194, 134, 0.14), transparent 50%),
      linear-gradient(155deg, rgba(32, 15, 26, 0.92), rgba(14, 7, 12, 0.97));
    box-shadow: 0 28px 70px rgba(0, 0, 0, 0.55);
    padding: clamp(22px, 4vw, 38px);
  }
  .sp-hero::before {
    content: '';
    position: absolute;
    top: 0;
    left: 8%;
    right: 8%;
    height: 1px;
    z-index: 3;
    background: linear-gradient(90deg, transparent, rgba(255, 143, 188, 0.7), rgba(226, 194, 134, 0.6), transparent);
  }
  .sp-hero-layout {
    position: relative;
    z-index: 2;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 28px;
  }
  .sp-hero-inner {
    flex: 1;
    min-width: 0;
    max-width: 720px;
  }
  .sp-hero-thumb {
    width: 156px;
    height: 156px;
    border-radius: 22px;
    overflow: hidden;
    flex-shrink: 0;
    border: 1px solid rgba(255, 143, 188, 0.32);
    background: rgba(255, 255, 255, 0.05);
    box-shadow: 0 18px 40px rgba(0, 0, 0, 0.48);
    position: relative;
  }
  .sp-hero-badge {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    background: rgba(255, 45, 120, 0.18);
    border: 1px solid rgba(255, 130, 180, 0.42);
    border-radius: 999px;
    padding: 6px 14px;
    font-size: 11px;
    font-weight: 700;
    color: #ff8ab8;
    letter-spacing: 1.6px;
    text-transform: uppercase;
    margin-bottom: 12px;
  }
  .sp-hero h1 {
    font-weight: 800;
    color: #fff;
    font-size: clamp(1.75rem, 4.2vw, 2.65rem);
    letter-spacing: -0.03em;
    margin: 0 0 12px;
    line-height: 1.15;
  }
  .sp-hero-desc {
    color: #ebe0e6;
    font-size: 14.5px;
    line-height: 1.65;
    margin: 0 0 20px;
    max-width: 650px;
  }
  .sp-hero-meta {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    align-items: center;
  }
  .sp-hero-pill {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 999px;
    padding: 9px 16px;
    font-size: 14px;
    font-weight: 700;
    color: #fff;
  }
  .sp-hero-pill .price { color: #ff7aae; font-weight: 800; }

  .sp-section {
    background: linear-gradient(155deg, rgba(32, 15, 26, 0.82), rgba(15, 8, 13, 0.92));
    border: 1px solid rgba(255, 255, 255, 0.09);
    border-radius: 24px;
    padding: clamp(22px, 3.2vw, 30px);
    margin-bottom: 20px;
    box-shadow: 0 16px 38px rgba(0, 0, 0, 0.32);
  }
  .sp-section:not(#pricing):not(#menu), .sp-cta-section {
    content-visibility: auto;
    contain-intrinsic-size: auto 260px;
  }
  .sp-two-col {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 20px;
    margin-bottom: 20px;
  }
  .sp-two-col .sp-section {
    margin-bottom: 0;
  }
  .sp-section-title {
    font-size: 19px;
    font-weight: 800;
    color: #fff;
    margin: 0 0 16px;
    display: flex;
    align-items: center;
    gap: 12px;
    letter-spacing: -0.02em;
  }
  .sp-section-icon {
    width: 38px;
    height: 38px;
    border-radius: 12px;
    background: rgba(255, 45, 120, 0.14);
    border: 1px solid rgba(255, 130, 180, 0.32);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    color: #ff7aae;
  }
  .sp-p {
    color: #e2d6dc;
    font-size: 14.5px;
    line-height: 1.8;
    margin: 0 0 14px;
  }
  .sp-p:last-child { margin-bottom: 0; }
  .sp-ul { margin: 0; padding-left: 0; list-style: none; }
  .sp-ul li {
    position: relative;
    padding-left: 24px;
    color: #f0e4ea;
    font-size: 14px;
    line-height: 1.75;
    margin-bottom: 10px;
  }
  .sp-ul li:last-child { margin-bottom: 0; }
  .sp-ul li::before {
    content: '';
    position: absolute;
    left: 2px;
    top: 9px;
    width: 7px;
    height: 7px;
    border-radius: 999px;
    background: linear-gradient(135deg, #FF2D78, #E2C286);
    box-shadow: 0 0 10px rgba(255, 45, 120, 0.5);
  }

  .sp-faq {
    border-radius: 16px;
    background: rgba(255, 255, 255, 0.035);
    border: 1px solid rgba(255, 255, 255, 0.09);
    overflow: hidden;
    margin-bottom: 10px;
  }
  .sp-faq:last-child { margin-bottom: 0; }
  .sp-faq summary {
    list-style: none;
    cursor: pointer;
    padding: 16px 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }
  .sp-faq summary::-webkit-details-marker { display: none; }
  .sp-faq summary span:first-child {
    color: #fff;
    font-weight: 700;
    font-size: 14.5px;
    line-height: 1.45;
  }
  .sp-faq-chevron {
    width: 30px;
    height: 30px;
    border-radius: 10px;
    border: 1px solid rgba(255, 255, 255, 0.12);
    background: rgba(255, 45, 120, 0.12);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #ff7aae;
    flex-shrink: 0;
    transition: transform 180ms ease;
  }
  details[open] .sp-faq-chevron { transform: rotate(180deg); }
  .sp-faq-answer {
    padding: 0 20px 18px;
    color: #dfd2d9;
    font-size: 14px;
    line-height: 1.75;
  }

  .sp-related-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }
  .sp-related-card {
    display: flex;
    gap: 14px;
    align-items: center;
    padding: 14px;
    border-radius: 16px;
    border: 1px solid rgba(255, 255, 255, 0.09);
    background: rgba(255, 255, 255, 0.035);
    text-decoration: none;
    transition: all 0.22s ease;
  }
  .sp-related-card:hover {
    border-color: rgba(255, 45, 120, 0.42);
    background: rgba(255, 45, 120, 0.08);
    transform: translateY(-2px);
  }
  .sp-related-img {
    width: 56px;
    height: 56px;
    border-radius: 12px;
    overflow: hidden;
    position: relative;
    flex-shrink: 0;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.12);
  }
  .sp-related-name {
    color: #fff;
    font-weight: 700;
    font-size: 14px;
    margin: 0 0 4px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .sp-related-price {
    color: #ff7aae;
    font-weight: 700;
    font-size: 13px;
    margin: 0;
  }

  .sp-hub-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px;
  }
  .sp-hub-card {
    display: flex;
    gap: 16px;
    align-items: flex-start;
    padding: 16px;
    border-radius: 18px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(255, 255, 255, 0.035);
    text-decoration: none;
    transition: all 0.22s ease;
  }
  .sp-hub-card:hover {
    border-color: rgba(255, 45, 120, 0.48);
    background: rgba(255, 45, 120, 0.08);
    transform: translateY(-2px);
  }
  .sp-hub-img {
    width: 72px;
    height: 72px;
    border-radius: 14px;
    overflow: hidden;
    flex-shrink: 0;
    border: 1px solid rgba(255, 255, 255, 0.12);
    background: rgba(255, 255, 255, 0.05);
  }

  .sp-cta-section {
    background:
      radial-gradient(circle at 20% 0%, rgba(255, 45, 120, 0.2), transparent 55%),
      radial-gradient(circle at 80% 100%, rgba(226, 194, 134, 0.14), transparent 55%),
    linear-gradient(155deg, rgba(32, 15, 26, 0.9), rgba(14, 7, 12, 0.96));
    border: 1px solid rgba(255, 130, 180, 0.28);
    border-radius: 26px;
    padding: 38px 24px;
    text-align: center;
    margin-bottom: 24px;
    box-shadow: 0 24px 60px rgba(0, 0, 0, 0.45);
  }
  .sp-cta-section h2 {
    font-size: clamp(1.35rem, 3vw, 1.75rem);
    font-weight: 800;
    color: #fff;
    margin: 0 0 10px;
    letter-spacing: -0.02em;
  }
  .sp-cta-section p {
    color: #e2d6dc;
    font-size: 14.5px;
    line-height: 1.65;
    margin: 0 auto 22px;
    max-width: 540px;
  }

  .sp-links {
    display: flex;
    gap: 14px;
    flex-wrap: wrap;
    justify-content: center;
    margin-top: 20px;
  }
  .sp-links a {
    color: #dfd2d9;
    font-size: 13px;
    font-weight: 600;
    text-decoration: none;
    transition: color 0.2s;
  }
  .sp-links a:hover { color: #ff7aae; }

  @media (max-width: 768px) {
    .sp-two-col, .sp-related-grid, .sp-hub-grid { grid-template-columns: minmax(0, 1fr); }
    .sp-hero-layout {
      flex-direction: column-reverse;
      align-items: flex-start;
      gap: 16px;
    }
    .sp-hero-thumb {
      width: 88px;
      height: 88px;
      border-radius: 18px;
    }
  }
`;

const LOCAL_CITY_LINKS = [
  { href: '/service-areas/san-marcos-ca', label: 'San Marcos, CA' },
  { href: '/service-areas/vista-ca', label: 'Vista, CA' },
  { href: '/service-areas/escondido-ca', label: 'Escondido, CA' },
  { href: '/service-areas/carlsbad-ca', label: 'Carlsbad, CA' },
  { href: '/service-areas/oceanside-ca', label: 'Oceanside, CA' },
];

export async function generateStaticParams() {
  return [...ALL_SERVICE_CATEGORY_SLUGS, ...ALL_CANONICAL_SLUGS].map((slug) => ({ slug }));
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

  const categoryHub = getServiceCategoryBySlug(slug);
  if (categoryHub) {
    const canonical = serviceCanonical(categoryHub.slug);
    const imageUrl = `https://www.glitzandglamours.com${categoryHub.heroImage}`;
    return {
      title: categoryHub.seoTitle,
      description: categoryHub.seoDescription,
      keywords: categoryHub.targetKeywords.join(', '),
      alternates: { canonical },
      openGraph: {
        title: categoryHub.seoTitle,
        description: categoryHub.seoDescription,
        type: 'website',
        url: canonical,
        images: [{ url: imageUrl, alt: `${categoryHub.name} at Glitz & Glamour Studio in San Marcos, CA` }],
      },
      twitter: {
        card: 'summary_large_image',
        title: categoryHub.seoTitle,
        description: categoryHub.seoDescription,
        images: [imageUrl],
      },
    };
  }

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
        images: [{ url: imageUrl, alt: `${detailed.name} at Glitz & Glamour Studio in San Marcos, CA` }],
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
      title: 'Service Not Found | Glitz & Glamour',
      robots: { index: false, follow: false },
    };
  }

  const title = (svc.seoTitle?.trim() || `${svc.name} in San Marcos, CA | Glitz`).slice(0, 60);
  const description = (
    svc.seoDescription?.trim() ||
    svc.description?.trim() ||
    `${svc.name} at Glitz & Glamour Studio in San Marcos, CA (935 W San Marcos Blvd). View pricing and book online.`
  ).slice(0, 150);
  const canonical = serviceCanonical(svc.slug || slug);
  const fallbackImg = svc.ogImageUrl || svc.imageUrl || 'https://www.glitzandglamours.com/herobg.jpeg';

  return {
    title,
    description,
    keywords: svc.seoKeywords?.trim() || `${svc.name}, ${svc.category}, San Marcos CA`,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      type: 'website',
      url: canonical,
      images: [{ url: fallbackImg, alt: `${svc.name} in San Marcos, CA` }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [fallbackImg],
    },
  };
}

export default async function ServicePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const categoryHub = getServiceCategoryBySlug(slug);
  if (categoryHub) {
    if (slug !== categoryHub.slug) {
      redirect(`/services/${categoryHub.slug}`);
    }

    const canonicalUrl = serviceCanonical(categoryHub.slug);
    const childServices = SERVICES_DETAILED.filter((s) =>
      categoryHub.childCategories.includes(s.category),
    );
    const otherHubs = SERVICE_CATEGORIES.filter((c) => c.slug !== categoryHub.slug);

    const jsonLdHubService = {
      '@context': 'https://schema.org',
      '@type': 'Service',
      serviceType: `${categoryHub.name} in San Marcos, CA`,
      name: `${categoryHub.name} — Glitz & Glamour Studio`,
      description: categoryHub.seoDescription,
      provider: {
        '@type': 'BeautySalon',
        name: 'Glitz & Glamour Studio',
        url: 'https://www.glitzandglamours.com',
        telephone: '+1-760-290-5910',
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
          latitude: 33.1434,
          longitude: -117.1856,
        },
      },
      areaServed: [
        { '@type': 'City', name: 'San Marcos, CA' },
        { '@type': 'City', name: 'Vista, CA' },
        { '@type': 'City', name: 'Carlsbad, CA' },
        { '@type': 'City', name: 'Escondido, CA' },
        { '@type': 'City', name: 'Oceanside, CA' },
      ],
      url: canonicalUrl,
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: `${categoryHub.name} Menu`,
        itemListElement: childServices.map((child) => ({
          '@type': 'Offer',
          priceCurrency: 'USD',
          price: child.startingAtPrice,
          url: serviceCanonical(child.slug),
          itemOffered: {
            '@type': 'Service',
            name: child.name,
            description: child.seoDescription,
            url: serviceCanonical(child.slug),
          },
        })),
      },
    };

    const jsonLdHubList = {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: `${categoryHub.name} Services in San Marcos, CA`,
      itemListElement: childServices.map((child, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        name: child.name,
        url: serviceCanonical(child.slug),
      })),
    };

    const jsonLdHubFaq = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: categoryHub.faqs.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    };

    const jsonLdHubBreadcrumb = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.glitzandglamours.com' },
        { '@type': 'ListItem', position: 2, name: 'Services', item: 'https://www.glitzandglamours.com/services' },
        { '@type': 'ListItem', position: 3, name: categoryHub.name, item: canonicalUrl },
      ],
    };

    return (
      <div style={{ minHeight: '100vh', position: 'relative', zIndex: 1 }}>
        <style>{SHARED_STYLES}</style>

        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdHubService) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdHubList) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdHubFaq) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdHubBreadcrumb) }} />

        <div className="sp-wrap">
          <nav className="sp-breadcrumb" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span className="sp-breadcrumb-sep" aria-hidden="true">›</span>
            <Link href="/services">Services</Link>
            <span className="sp-breadcrumb-sep" aria-hidden="true">›</span>
            <span className="sp-breadcrumb-current">{categoryHub.name}</span>
          </nav>

          <section className="sp-hero">
            <div className="sp-hero-layout">
              <div className="sp-hero-inner">
                <div className="sp-hero-badge">
                  <Sparkles size={12} aria-hidden="true" />
                  <span>{categoryHub.badge}</span>
                </div>
                <h1>{categoryHub.h1}</h1>
                <p className="sp-hero-desc">{categoryHub.seoDescription}</p>
                <div className="sp-hero-meta">
                  <span className="sp-hero-pill">
                    <span className="price">{categoryHub.priceRangeLabel}</span>
                  </span>
                  <span className="sp-hero-pill">
                    <span>{childServices.length} Services Available</span>
                  </span>
                  <Link
                    href="/book"
                    className="btn-primary"
                    style={{
                      padding: '10px 22px',
                      fontSize: '14px',
                      fontWeight: 700,
                      borderRadius: '999px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    Book Online <ChevronRight size={15} aria-hidden="true" />
                  </Link>
                </div>
              </div>
              <div className="sp-hero-thumb">
                <img
                  src={categoryHub.heroImage}
                  alt={`${categoryHub.name} at Glitz & Glamour Studio in San Marcos, CA`}
                  width={156}
                  height={156}
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: 'center',
                    display: 'block',
                  }}
                />
              </div>
            </div>
          </section>

          {/* Child Services Menu Grid */}
          <section className="sp-section" id="menu">
            <h2 className="sp-section-title">
              <span className="sp-section-icon" aria-hidden="true">
                <Scissors size={18} />
              </span>
              <span>{categoryHub.name} Menu &amp; Starting Prices in San Marcos, CA</span>
            </h2>
            <p className="sp-p" style={{ marginBottom: '18px' }}>
              Select any {categoryHub.name.toLowerCase()} service below for full treatment steps, longevity tips, FAQs, and online booking at 935 W San Marcos Blvd, Suite 101:
            </p>
            <div className="sp-hub-grid">
              {childServices.map((child) => (
                <Link key={child.slug} href={`/services/${child.slug}`} className="sp-hub-card">
                  <div className="sp-hub-img">
                    <img
                      src={child.imageUrl}
                      alt={`${child.name} in San Marcos, CA`}
                      width={72}
                      height={72}
                      loading="lazy"
                      decoding="async"
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '8px', marginBottom: '4px' }}>
                      <h3 style={{ color: '#fff', fontWeight: 700, fontSize: '15px', margin: 0 }}>
                        {child.name}
                      </h3>
                      <span style={{ color: '#ff7aae', fontWeight: 800, fontSize: '13.5px', flexShrink: 0 }}>
                        {child.priceLabel}
                      </span>
                    </div>
                    <p style={{ color: '#d8cbd2', fontSize: '12.5px', lineHeight: 1.55, margin: '0 0 6px' }}>
                      {child.seoDescription}
                    </p>
                    <span style={{ color: '#E2C286', fontSize: '12px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      {child.durationMins} min · View service details <ChevronRight size={13} aria-hidden="true" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Overview & Highlights */}
          <section className="sp-section">
            <h2 className="sp-section-title">
              <span className="sp-section-icon" aria-hidden="true">
                <FileText size={18} />
              </span>
              <span>Why Clients Choose Our {categoryHub.name} in San Marcos</span>
            </h2>
            {categoryHub.overview.map((p, idx) => (
              <p key={idx} className="sp-p">
                {p}
              </p>
            ))}
            <ul className="sp-ul" style={{ marginTop: '16px' }}>
              {categoryHub.highlights.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </section>

          {/* Category FAQs */}
          <section className="sp-section">
            <h2 className="sp-section-title">
              <span className="sp-section-icon" aria-hidden="true">
                <HelpCircle size={18} />
              </span>
              <span>{categoryHub.name} FAQs — San Marcos Studio</span>
            </h2>
            <div>
              {categoryHub.faqs.map((f, idx) => (
                <details key={idx} className="sp-faq">
                  <summary>
                    <span>{f.q}</span>
                    <span className="sp-faq-chevron" aria-hidden="true">
                      <ChevronDown size={16} />
                    </span>
                  </summary>
                  <div className="sp-faq-answer">{f.a}</div>
                </details>
              ))}
            </div>
          </section>

          {/* Related Local Guides + Other Salon Categories */}
          <div className="sp-two-col">
            <section className="sp-section">
              <h2 className="sp-section-title">
                <span className="sp-section-icon" aria-hidden="true">
                  <BookOpen size={18} />
                </span>
                <span>Local {categoryHub.name} Guides</span>
              </h2>
              <ul className="sp-ul">
                {categoryHub.relatedBlogs.map((b) => (
                  <li key={b.slug}>
                    <Link href={`/blogs/${b.slug}`} style={{ color: '#ff8ab8', textDecoration: 'none', fontWeight: 600 }}>
                      {b.title}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link href="/blogs" style={{ color: '#dfd2d9', textDecoration: 'none', fontWeight: 600 }}>
                    Browse all San Marcos beauty &amp; pricing guides →
                  </Link>
                </li>
              </ul>
            </section>

            <section className="sp-section">
              <h2 className="sp-section-title">
                <span className="sp-section-icon" aria-hidden="true">
                  <Sparkles size={18} />
                </span>
                <span>Explore Other Salon Categories</span>
              </h2>
              <ul className="sp-ul">
                {otherHubs.map((h) => (
                  <li key={h.slug}>
                    <Link href={`/services/${h.slug}`} style={{ color: '#fff', textDecoration: 'none', fontWeight: 700 }}>
                      {h.name} in San Marcos, CA
                    </Link>{' '}
                    <span style={{ color: '#ff7aae', fontWeight: 700 }}>({h.priceRangeLabel})</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          {/* Local Service Area Links */}
          <section className="sp-section" style={{ textAlign: 'center', padding: '24px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#fff', margin: '0 0 8px', letterSpacing: '-0.02em' }}>
              Serving San Marcos, Vista &amp; North County San Diego
            </h2>
            <p className="sp-p" style={{ fontSize: '13.5px', marginBottom: '16px' }}>
              Located at 935 W San Marcos Blvd, Suite 101, San Marcos, CA 92078 — explore our local salon guides:
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
              {LOCAL_CITY_LINKS.map((city) => (
                <Link
                  key={city.href}
                  href={city.href}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '7px 14px',
                    borderRadius: '999px',
                    background: 'rgba(255, 45, 120, 0.12)',
                    border: '1px solid rgba(255, 130, 180, 0.3)',
                    color: '#fff',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    textDecoration: 'none',
                  }}
                >
                  <MapPin size={12} color="#ff7aae" aria-hidden="true" />
                  <span>{city.label}</span>
                </Link>
              ))}
            </div>
          </section>

          <section className="sp-cta-section">
            <h2>Ready to Book Your {categoryHub.name} Visit?</h2>
            <p>
              Reserve your one-on-one appointment online at our private San Marcos studio. Every price is confirmed transparently before we begin.
            </p>
            <Link
              href="/book"
              className="btn-primary"
              style={{
                padding: '14px 32px',
                fontSize: '15px',
                fontWeight: 700,
                borderRadius: '999px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              Book Appointment Online <ChevronRight size={16} aria-hidden="true" />
            </Link>
            <div className="sp-links">
              <Link href="/services">All 28 Services</Link>
              <span style={{ color: '#8e7d86' }} aria-hidden="true">·</span>
              <Link href="/reviews">Reviews</Link>
              <span style={{ color: '#8e7d86' }} aria-hidden="true">·</span>
              <Link href="/gallery">Gallery</Link>
              <span style={{ color: '#8e7d86' }} aria-hidden="true">·</span>
              <Link href="/policy">Studio Policies</Link>
              <span style={{ color: '#8e7d86' }} aria-hidden="true">·</span>
              <Link href="/faq">FAQ</Link>
            </div>
          </section>
        </div>
      </div>
    );
  }

  const detailed = getDetailedServiceBySlug(slug);

  // If accessed via an alias, permanently redirect to canonical slug
  if (detailed && slug !== detailed.slug) {
    redirect(`/services/${detailed.slug}`);
  }

  // Only query Prisma if slug is not in static SERVICES_DETAILED catalog
  let dbService: any = null;
  let relatedDb: any[] = [];
  if (!detailed) {
    try {
      dbService = await prisma.service.findUnique({ where: { slug } });
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
    } catch {
      // Database fallback or offline handling
    }
  }

  if (!detailed && !dbService) {
    notFound();
  }

  // Merge static curated data with dynamic database overrides
  const name = detailed?.name || dbService?.name || 'Service';
  const canonicalSlug = detailed?.slug || dbService?.slug || slug;
  const canonicalUrl = serviceCanonical(canonicalSlug);
  const category = (detailed?.category || dbService?.category || 'nails') as DetailedService['category'];
  const hubInfo = CATEGORY_HUB_BY_SERVICE_CATEGORY[category] || { slug: 'nails' as const, label: 'Nail Salon' };
  const categoryLabel = detailed?.categoryLabel || hubInfo.label;
  const priceLabel = dbService?.priceLabel || detailed?.priceLabel || 'Starting at $50';
  const startingAt = detailed?.startingAtPrice || dbService?.startingAtPrice || 50;
  const durationMins = detailed?.durationMins || dbService?.durationMins || 60;
  const bookId = dbService?.id || detailed?.id || canonicalSlug;
  const heroImage =
    detailed?.imageUrl ||
    (dbService?.imageUrl && !dbService.imageUrl.startsWith('http://') ? dbService.imageUrl : null) ||
    '/services/catalog/gelx.webp';
  const h1Title = detailed?.h1 || `${name} in San Marcos, CA`;

  const overviewParagraphs = detailed?.overview || [
    dbService?.description || `${name} at Glitz & Glamour Studio in San Marcos, CA.`,
    `Every ${name.toLowerCase()} service is customized to your preferences with precision care, unhurried attention, and premium salon-grade formulas.`,
  ];

  const whoItsFor = detailed?.whoItsFor || [
    `Clients in San Marcos, Vista, Carlsbad, and Escondido seeking high-quality ${name.toLowerCase()}`,
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

  const pricingDisclaimer =
    detailed?.pricingDisclaimer ||
    `Prices shown are starting points. Final pricing is confirmed in person before beginning, based on length, complexity, and custom requests.`;

  const faqs = detailed?.faqs || [
    {
      q: `How do I book a ${name} appointment?`,
      a: `You can easily book online through our booking page. We confirm all details and pricing transparently before your service begins.`,
    },
    {
      q: `Where is Glitz & Glamour Studio located?`,
      a: `We are located at 935 W San Marcos Blvd, Suite 101, San Marcos, CA 92078, proudly serving clients from San Marcos, Vista, Carlsbad, and North County San Diego.`,
    },
    {
      q: `What is your cancellation policy?`,
      a: `A retainer is required to secure your appointment. Nail services require 24-hour notice to transfer your retainer, and hairstyling and makeup require at least 48 hours in advance. Please see our Studio Policies for full details.`,
    },
  ];

  // Related services fallback with canonical WebP image mapping
  const curatedRelated = (detailed?.relatedSlugs || [])
    .map((s) => getDetailedServiceBySlug(s))
    .filter((s): s is NonNullable<typeof s> => !!s && s.slug !== canonicalSlug);
  const relatedServices = (relatedDb.length > 0
    ? relatedDb
    : curatedRelated.length > 0
    ? curatedRelated
    : SERVICES_DETAILED.filter((s) => s.category === category && s.slug !== canonicalSlug).slice(0, 4)
  ).map((r: any) => {
    const cMatch =
      CANONICAL_BY_SLUG.get(r.slug) ||
      CANONICAL_BY_ID.get(r.id) ||
      CANONICAL_BY_NAME.get((r.name || '').toLowerCase());
    return {
      name: r.name,
      slug: cMatch?.slug || r.slug || r.id,
      priceLabel: r.priceLabel || cMatch?.priceLabel,
      imageUrl: cMatch?.imageUrl || (r.imageUrl && !r.imageUrl.startsWith('http://') ? r.imageUrl : '/services/catalog/gelx.webp'),
    };
  });

  const parentHubUrl = serviceCanonical(hubInfo.slug);

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
      telephone: '+1-760-290-5910',
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
        latitude: 33.1434,
        longitude: -117.1856,
      },
    },
    areaServed: [
      { '@type': 'City', name: 'San Marcos, CA' },
      { '@type': 'City', name: 'Vista, CA' },
      { '@type': 'City', name: 'Carlsbad, CA' },
      { '@type': 'City', name: 'Oceanside, CA' },
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
      { '@type': 'ListItem', position: 3, name: hubInfo.label, item: parentHubUrl },
      { '@type': 'ListItem', position: 4, name, item: canonicalUrl },
    ],
  };

  return (
    <div style={{ minHeight: '100vh', position: 'relative', zIndex: 1 }}>
      <style>{SHARED_STYLES}</style>

      {/* JSON-LD Schemas */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdService) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFaq) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumb) }} />

      <div className="sp-wrap">
        {/* Breadcrumb navigation */}
        <nav className="sp-breadcrumb" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span className="sp-breadcrumb-sep" aria-hidden="true">›</span>
          <Link href="/services">Services</Link>
          <span className="sp-breadcrumb-sep" aria-hidden="true">›</span>
          <Link href={`/services/${hubInfo.slug}`}>{hubInfo.label}</Link>
          <span className="sp-breadcrumb-sep" aria-hidden="true">›</span>
          <span className="sp-breadcrumb-current">{name}</span>
        </nav>

        {/* Hero Section */}
        <section className="sp-hero">
          <div className="sp-hero-layout">
            <div className="sp-hero-inner">
              <div className="sp-hero-badge">
                <Sparkles size={12} aria-hidden="true" />
                <span>{categoryLabel}</span>
              </div>
              <h1>{h1Title}</h1>
              <p className="sp-hero-desc">
                {detailed?.seoDescription ||
                  `Premium ${name.toLowerCase()} by Jojo at Glitz & Glamour Studio in San Marcos, CA. Serving North County.`}
              </p>
              <div className="sp-hero-meta">
                <span className="sp-hero-pill">
                  <span className="price">{priceLabel}</span>
                </span>
                {durationMins ? (
                  <span className="sp-hero-pill">
                    <Clock size={14} color="#E2C286" aria-hidden="true" />
                    <span>{durationMins} min</span>
                  </span>
                ) : null}
                <Link
                  href={`/book?service=${bookId}`}
                  rel="nofollow"
                  className="btn-primary"
                  style={{
                    padding: '10px 22px',
                    fontSize: '14px',
                    fontWeight: 700,
                    borderRadius: '999px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  Book This Service <ChevronRight size={15} aria-hidden="true" />
                </Link>
              </div>
            </div>
            {heroImage && (
              <div className="sp-hero-thumb">
                <img
                  src={heroImage}
                  alt={`${name} at Glitz & Glamour Studio in San Marcos, CA`}
                  width={156}
                  height={156}
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: 'center',
                    display: 'block',
                  }}
                />
              </div>
            )}
          </div>
        </section>

        {/* Pricing Section */}
        <section className="sp-section" id="pricing">
          <h2 className="sp-section-title">
            <span className="sp-section-icon" aria-hidden="true">
              <Sparkles size={18} />
            </span>
            <span>{name} Pricing in San Marcos, CA</span>
          </h2>
          <p style={{ color: '#ff7aae', fontWeight: 800, fontSize: '24px', margin: '0 0 8px' }}>
            {priceLabel}
          </p>
          <p className="sp-p">{pricingDisclaimer}</p>
        </section>

        {/* About This Service / Comprehensive Narrative */}
        <section className="sp-section">
          <h2 className="sp-section-title">
            <span className="sp-section-icon" aria-hidden="true">
              <FileText size={18} />
            </span>
            <span>About Our {name} in San Marcos</span>
          </h2>
          {overviewParagraphs.map((p, i) => (
            <p key={i} className="sp-p">
              {p}
            </p>
          ))}
          <p className="sp-p" style={{ marginTop: '14px', color: '#d8cbd2', fontSize: '13.5px' }}>
            All {name.toLowerCase()} services are provided by Jojo at{' '}
            <Link href="/" style={{ color: '#ff7aae', textDecoration: 'none', fontWeight: 700 }}>
              Glitz &amp; Glamour Studio
            </Link>{' '}
            in San Marcos, CA (935 W San Marcos Blvd, Suite 101) — conveniently serving clients throughout North County San Diego including Vista, Oceanside, and Carlsbad.
          </p>
        </section>

        {/* Two-column Who It's For + What's Included */}
        <div className="sp-two-col">
          {/* Who It's For */}
          <section className="sp-section">
            <h2 className="sp-section-title">
              <span className="sp-section-icon" aria-hidden="true">
                <Target size={18} />
              </span>
              <span>Who It&apos;s For</span>
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
              <span className="sp-section-icon" aria-hidden="true">
                <CheckCircle2 size={18} />
              </span>
              <span>What&apos;s Included in Your Appointment</span>
            </h2>
            <ul className="sp-ul">
              {whatsIncluded.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ul>
          </section>
        </div>

        {/* Pro Aftercare & Longevity Tips */}
        {aftercare && aftercare.length > 0 && (
          <section className="sp-section">
            <h2 className="sp-section-title">
              <span className="sp-section-icon" aria-hidden="true">
                <ShieldCheck size={18} />
              </span>
              <span>Pro Aftercare &amp; Longevity Tips</span>
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
          <section className="sp-section">
            <h2 className="sp-section-title">
              <span className="sp-section-icon" aria-hidden="true">
                <HelpCircle size={18} />
              </span>
              <span>Frequently Asked Questions</span>
            </h2>
            <div>
              {faqs.map((f, i) => (
                <details key={i} className="sp-faq">
                  <summary>
                    <span>{f.q}</span>
                    <span className="sp-faq-chevron" aria-hidden="true">
                      <ChevronDown size={16} />
                    </span>
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '16px' }}>
              <h2 className="sp-section-title" style={{ margin: 0 }}>
                <span className="sp-section-icon" aria-hidden="true">
                  <Scissors size={18} />
                </span>
                <span>More {hubInfo.label} Services</span>
              </h2>
              <Link
                href={`/services/${hubInfo.slug}`}
                style={{ color: '#ff8ab8', fontSize: '13px', fontWeight: 700, textDecoration: 'none' }}
              >
                View Full {hubInfo.label} Menu →
              </Link>
            </div>
            <div className="sp-related-grid">
              {relatedServices.map((r, i) => (
                <Link key={i} href={`/services/${r.slug}`} className="sp-related-card">
                  {r.imageUrl && (
                    <div className="sp-related-img">
                      <img
                        src={r.imageUrl}
                        alt={r.name}
                        width={56}
                        height={56}
                        loading="lazy"
                        decoding="async"
                        style={{ objectFit: 'cover', width: '100%', height: '100%', display: 'block' }}
                      />
                    </div>
                  )}
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <p className="sp-related-name">{r.name}</p>
                    <p className="sp-related-price">{r.priceLabel}</p>
                  </div>
                  <ChevronRight size={16} color="#d4c3cc" aria-hidden="true" />
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Serving San Marcos, Vista & North County San Diego Link Row */}
        <section className="sp-section" style={{ textAlign: 'center', padding: '24px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#fff', margin: '0 0 8px', letterSpacing: '-0.02em' }}>
            Serving San Marcos, Vista &amp; North County San Diego
          </h2>
          <p className="sp-p" style={{ fontSize: '13.5px', marginBottom: '16px' }}>
            Located at 935 W San Marcos Blvd, Suite 101, San Marcos, CA 92078 — explore our local salon guides:
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
            {LOCAL_CITY_LINKS.map((city) => (
              <Link
                key={city.href}
                href={city.href}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 14px',
                  borderRadius: '999px',
                  background: 'rgba(255, 45, 120, 0.12)',
                  border: '1px solid rgba(255, 130, 180, 0.3)',
                  color: '#fff',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  textDecoration: 'none',
                }}
              >
                <MapPin size={12} color="#ff7aae" aria-hidden="true" />
                <span>{city.label}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Bottom CTA Section */}
        <section className="sp-cta-section">
          <h2>Ready to Book Your {name}?</h2>
          <p>
            Reserve your appointment online with instant confirmation. Final pricing is always discussed and confirmed before we begin.
          </p>
          <Link
            href={`/book?service=${bookId}`}
            rel="nofollow"
            className="btn-primary"
            style={{
              padding: '14px 32px',
              fontSize: '15px',
              fontWeight: 700,
              borderRadius: '999px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            Book Your Appointment Online <ChevronRight size={16} aria-hidden="true" />
          </Link>
          <div className="sp-links">
            <Link href={`/services/${hubInfo.slug}`}>{hubInfo.label} Hub</Link>
            <span style={{ color: '#8e7d86' }} aria-hidden="true">·</span>
            <Link href="/services">All Services</Link>
            <span style={{ color: '#8e7d86' }} aria-hidden="true">·</span>
            <Link href="/reviews">Reviews</Link>
            <span style={{ color: '#8e7d86' }} aria-hidden="true">·</span>
            <Link href="/gallery">Gallery</Link>
            <span style={{ color: '#8e7d86' }} aria-hidden="true">·</span>
            <Link href="/policy">Studio Policies</Link>
            <span style={{ color: '#8e7d86' }} aria-hidden="true">·</span>
            <Link href="/faq">FAQ</Link>
          </div>
        </section>
      </div>
    </div>
  );
}
