import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getServiceContent } from '@/lib/serviceContent';

export const dynamic = 'force-dynamic';

type Faq = { q: string; a: string };

function asFaqs(value: unknown): Faq[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((x: any) => ({ q: String(x?.q || '').trim(), a: String(x?.a || '').trim() }))
    .filter(x => x.q && x.a);
}

function parseBullets(text: string): { bullets: string[]; paragraphs: string[] } {
  const lines = text.split(/\r?\n/).map(l => l.trim());
  const bullets: string[] = [];
  const paragraphs: string[] = [];
  for (const l of lines) {
    if (!l) continue;
    if (/^[-*]\s+/.test(l)) bullets.push(l.replace(/^[-*]\s+/, '').trim());
    else paragraphs.push(l);
  }
  return { bullets, paragraphs };
}

function serviceCanonical(slug: string) {
  return `https://glitzandglamours.com/services/${slug}`;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const svc = await prisma.service.findUnique({
    where: { slug },
    select: {
      name: true, slug: true, description: true,
      seoTitle: true, seoDescription: true, seoKeywords: true,
      ogImageUrl: true, imageUrl: true, category: true,
    },
  });

  if (!svc) {
    return { title: 'Service not found | Glitz & Glamour Studio', robots: { index: false, follow: false } };
  }

  const title = svc.seoTitle?.trim() || `${svc.name} in Vista CA | Glitz & Glamour`;
  const description =
    svc.seoDescription?.trim() ||
    svc.description?.trim() ||
    `${svc.name} at Glitz & Glamour Studio in Vista, CA. View details, pricing, and book online.`;
  const keywords = svc.seoKeywords?.trim() || `${svc.name}, ${svc.category}, Vista CA, North County`;
  const image = svc.ogImageUrl?.trim() || svc.imageUrl?.trim() || undefined;
  const canonicalSlug = svc.slug || slug;

  return {
    title,
    description,
    keywords,
    alternates: { canonical: serviceCanonical(canonicalSlug) },
    openGraph: {
      title, description, type: 'website',
      url: serviceCanonical(canonicalSlug),
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      card: 'summary_large_image', title, description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = await prisma.service.findUnique({ where: { slug } });

  if (!service || !service.isActive) {
    return (
      <div style={{ maxWidth: '980px', margin: '0 auto', padding: '48px 24px 120px', fontFamily: 'Poppins, sans-serif' }}>
        <h1 style={{ color: '#fff', fontSize: '26px', fontWeight: 800, marginBottom: '8px' }}>Service not found</h1>
        <p style={{ color: '#777', fontSize: '14px', marginBottom: '18px' }}>
          This service may be unavailable or the link is incorrect.
        </p>
        <Link href="/services" className="btn-outline">Back to services</Link>
      </div>
    );
  }

  const defaults = getServiceContent(service.category);
  const overrideFaqs = asFaqs(service.faqs);
  const faqs = overrideFaqs.length ? overrideFaqs : defaults.faqs;

  const longCopy = (service.longDescription?.trim() || '') || defaults.descriptionParagraphs.join('\n\n');
  const benefitsCopy = (service.benefits?.trim() || '') || defaults.includedBullets.map(b => `- ${b}`).join('\n');
  const longParsed = longCopy ? parseBullets(longCopy) : { bullets: [], paragraphs: [] };
  const benefitsParsed = benefitsCopy ? parseBullets(benefitsCopy) : { bullets: [], paragraphs: [] };

  const related = await prisma.service.findMany({
    where: { isActive: true, category: service.category, NOT: { id: service.id } },
    orderBy: { displayOrder: 'asc' },
    take: 4,
    select: { id: true, name: true, slug: true, priceLabel: true, imageUrl: true },
  });

  const canonical = serviceCanonical(service.slug || slug);
  const offerPrice = service.startingAtPrice ?? Math.round(service.priceFrom || 0);
  const categoryLabel = service.category.charAt(0).toUpperCase() + service.category.slice(1);

  // ── JSON-LD: Service schema ──
  const jsonLdService = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.name,
    description: (service.seoDescription || service.description || longCopy || '').slice(0, 500) || undefined,
    provider: {
      '@type': 'BeautySalon',
      name: 'Glitz & Glamour Studio',
      url: 'https://glitzandglamours.com',
      address: {
        '@type': 'PostalAddress',
        streetAddress: '812 Frances Dr',
        addressLocality: 'Vista',
        addressRegion: 'CA',
        postalCode: '92084',
        addressCountry: 'US',
      },
    },
    areaServed: ['Vista, CA', 'San Marcos, CA', 'North County San Diego'],
    url: canonical,
    offers: offerPrice ? {
      '@type': 'Offer',
      priceCurrency: 'USD',
      price: offerPrice,
      url: canonical,
      availability: 'https://schema.org/InStock',
    } : undefined,
  };

  // ── JSON-LD: FAQ schema ──
  const jsonLdFaq = faqs.length === 0 ? null : {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(f => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  // ── JSON-LD: Breadcrumb ──
  const jsonLdBreadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://glitzandglamours.com' },
      { '@type': 'ListItem', position: 2, name: 'Services', item: 'https://glitzandglamours.com/services' },
      { '@type': 'ListItem', position: 3, name: service.name, item: canonical },
    ],
  };

  return (
    <div style={{ minHeight: '100vh' }}>
      <style>{`
        .sp-wrap { max-width: 860px; margin: 0 auto; padding: 22px 20px 120px; font-family: Poppins, sans-serif; }
        .sp-breadcrumb { display: flex; align-items: center; gap: 6px; font-size: 12px; color: #555; margin-bottom: 24px; flex-wrap: wrap; }
        .sp-breadcrumb a { color: #777; text-decoration: none; transition: color 0.2s; }
        .sp-breadcrumb a:hover { color: #FF2D78; }
        .sp-breadcrumb-sep { color: #333; }
        .sp-breadcrumb-current { color: #FF2D78; font-weight: 600; }

        .sp-hero { border-radius: 28px; overflow: hidden; border: 1px solid rgba(255,255,255,0.08); position: relative; margin-bottom: 28px; }
        .sp-hero-img { position: relative; height: 340px; background: #0f0f0f; }
        .sp-hero-overlay { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(10,10,10,0.15) 0%, rgba(10,10,10,0.75) 60%, rgba(10,10,10,0.95) 100%); }
        .sp-hero-content { position: absolute; inset: 0; display: flex; align-items: flex-end; padding: 28px; }
        .sp-hero-inner { max-width: 720px; }
        .sp-hero-badge { display: inline-flex; align-items: center; gap: 6px; background: rgba(255,45,120,0.15); border: 1px solid rgba(255,45,120,0.3); border-radius: 50px; padding: 4px 12px; font-size: 10px; font-weight: 800; color: #FF2D78; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 12px; }
        .sp-hero h1 { font-weight: 900; color: #fff; font-size: clamp(1.8rem, 4vw, 2.8rem); letter-spacing: -0.7px; margin: 0 0 8px; line-height: 1.1; }
        .sp-hero-desc { color: #ccc; font-size: 14px; line-height: 1.65; margin: 0 0 16px; max-width: 560px; }
        .sp-hero-meta { display: flex; gap: 16px; flex-wrap: wrap; align-items: center; }
        .sp-hero-pill { display: inline-flex; align-items: center; gap: 5px; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.12); border-radius: 50px; padding: 6px 14px; font-size: 13px; font-weight: 700; color: #fff; }
        .sp-hero-pill .price { color: #FF2D78; }

        .sp-section { background: rgba(255,255,255,0.025); border: 1px solid rgba(255,255,255,0.06); border-radius: 20px; padding: 24px; margin-bottom: 16px; }
        .sp-section-title { font-size: 18px; font-weight: 800; color: #fff; margin: 0 0 14px; display: flex; align-items: center; gap: 10px; }
        .sp-section-icon { width: 32px; height: 32px; border-radius: 10px; background: rgba(255,45,120,0.1); border: 1px solid rgba(255,45,120,0.2); display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 15px; }
        .sp-p { color: #bbb; font-size: 14px; line-height: 1.75; margin: 0 0 12px; }
        .sp-p:last-child { margin-bottom: 0; }
        .sp-ul { margin: 0; padding-left: 0; list-style: none; }
        .sp-ul li { position: relative; padding-left: 20px; color: #ddd; font-size: 14px; line-height: 1.8; margin-bottom: 6px; }
        .sp-ul li::before { content: '✦'; position: absolute; left: 0; color: #FF2D78; font-size: 10px; top: 5px; }

        .sp-faq { border-radius: 14px; background: rgba(255,255,255,0.025); border: 1px solid rgba(255,255,255,0.06); overflow: hidden; margin-bottom: 8px; }
        .sp-faq summary { list-style: none; cursor: pointer; padding: 16px 18px; display: flex; align-items: center; justify-content: space-between; gap: 12px; }
        .sp-faq summary::-webkit-details-marker { display: none; }
        .sp-faq summary span:first-child { color: #fff; font-weight: 700; font-size: 14px; line-height: 1.4; }
        .sp-faq-chevron { width: 24px; height: 24px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); background: rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: #FF2D78; flex-shrink: 0; transition: transform 180ms ease; font-size: 14px; }
        details[open] .sp-faq-chevron { transform: rotate(180deg); }
        .sp-faq-answer { padding: 0 18px 16px; color: #aaa; font-size: 14px; line-height: 1.75; }

        .sp-related-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
        .sp-related-card { display: flex; gap: 12px; align-items: center; padding: 12px; border-radius: 14px; border: 1px solid rgba(255,255,255,0.06); background: rgba(0,0,0,0.2); text-decoration: none; transition: all 0.25s; }
        .sp-related-card:hover { border-color: rgba(255,45,120,0.3); background: rgba(255,45,120,0.04); }
        .sp-related-img { width: 44px; height: 44px; border-radius: 10px; overflow: hidden; position: relative; flex-shrink: 0; }
        .sp-related-name { color: #eee; font-weight: 700; font-size: 13px; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .sp-related-price { color: #FF2D78; font-weight: 700; font-size: 12px; margin: 0; }

        .sp-cta-section { background: linear-gradient(135deg, rgba(255,45,120,0.08), rgba(121,40,202,0.06)); border: 1px solid rgba(255,45,120,0.15); border-radius: 20px; padding: 28px 24px; text-align: center; margin-bottom: 16px; }
        .sp-cta-section h2 { font-size: 22px; font-weight: 800; color: #fff; margin: 0 0 8px; }
        .sp-cta-section p { color: #aaa; font-size: 14px; line-height: 1.6; margin: 0 0 18px; max-width: 480px; margin-left: auto; margin-right: auto; }

        .sp-links { display: flex; gap: 12px; flex-wrap: wrap; justify-content: center; margin-top: 14px; }
        .sp-links a { color: #666; font-size: 12px; text-decoration: none; transition: color 0.2s; }
        .sp-links a:hover { color: #FF2D78; }

        .sp-sticky { position: fixed; left: 0; right: 0; bottom: 0; z-index: 60; padding: 10px 14px; background: rgba(10,10,10,0.88); border-top: 1px solid rgba(255,255,255,0.06); backdrop-filter: blur(24px); }
        .sp-sticky-inner { max-width: 860px; margin: 0 auto; display: flex; gap: 10px; align-items: center; }
        .sp-sticky-info { flex: 1; min-width: 0; }
        .sp-sticky-name { margin: 0; color: #fff; font-weight: 800; font-size: 13px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .sp-sticky-price { margin: 0; color: #777; font-size: 12px; }

        @media (max-width: 640px) {
          .sp-hero-img { height: 260px; }
          .sp-hero-content { padding: 20px; }
          .sp-related-grid { grid-template-columns: 1fr; }
          .sp-sticky { padding-bottom: calc(10px + 64px); }
        }
      `}</style>

      {/* ── JSON-LD ── */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdService) }} />
      {jsonLdFaq && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFaq) }} />}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumb) }} />

      <div className="sp-wrap">
        {/* ── Breadcrumb ── */}
        <nav className="sp-breadcrumb" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span className="sp-breadcrumb-sep">›</span>
          <Link href="/services">Services</Link>
          <span className="sp-breadcrumb-sep">›</span>
          <Link href={`/services#${service.category}`}>{categoryLabel}</Link>
          <span className="sp-breadcrumb-sep">›</span>
          <span className="sp-breadcrumb-current">{service.name}</span>
        </nav>

        {/* ── Hero ── */}
        <section className="sp-hero">
          <div className="sp-hero-img">
            {service.imageUrl && (
              <Image src={service.imageUrl} alt={`${service.name} at Glitz & Glamour Studio in Vista, CA`} fill priority style={{ objectFit: 'cover', objectPosition: 'center' }} />
            )}
            <div className="sp-hero-overlay" />
            <div className="sp-hero-content">
              <div className="sp-hero-inner">
                <div className="sp-hero-badge">{categoryLabel}</div>
                <h1>{service.name}</h1>
                <p className="sp-hero-desc">
                  {(service.description || defaults.headline || `Premium ${service.name.toLowerCase()} by JoJany at Glitz & Glamour Studio in Vista, CA.`).trim()}
                </p>
                <div className="sp-hero-meta">
                  <span className="sp-hero-pill">
                    <span className="price">{service.priceLabel}</span>
                  </span>
                  {service.durationMins ? (
                    <span className="sp-hero-pill">⏱ {service.durationMins} min</span>
                  ) : null}
                  <Link href={`/book?service=${service.id}`} className="btn-primary" style={{ padding: '10px 20px', fontSize: '14px', fontWeight: 700 }}>
                    Book This Service
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Pricing ── */}
        <section className="sp-section" id="pricing">
          <h2 className="sp-section-title">
            <span className="sp-section-icon">💰</span> Pricing
          </h2>
          <p style={{ color: '#FF2D78', fontWeight: 800, fontSize: '22px', margin: '0 0 6px' }}>
            {service.priceLabel}
          </p>
          <p className="sp-p">
            Prices shown are starting points. Final pricing is discussed and confirmed in person before your appointment begins, based on length, complexity, and any add-ons you'd like.
          </p>
        </section>

        {/* ── What's Included ── */}
        {(benefitsParsed.bullets.length > 0 || benefitsParsed.paragraphs.length > 0) && (
          <section className="sp-section">
            <h2 className="sp-section-title">
              <span className="sp-section-icon">✨</span> What's Included
            </h2>
            {benefitsParsed.paragraphs.map((p, i) => (
              <p key={i} className="sp-p">{p}</p>
            ))}
            {benefitsParsed.bullets.length > 0 && (
              <ul className="sp-ul">
                {benefitsParsed.bullets.map((b, i) => <li key={i}>{b}</li>)}
              </ul>
            )}
          </section>
        )}

        {/* ── Overview / Long Description ── */}
        {(longParsed.paragraphs.length > 0 || longParsed.bullets.length > 0) && (
          <section className="sp-section">
            <h2 className="sp-section-title">
              <span className="sp-section-icon">📋</span> About This Service
            </h2>
            {longParsed.paragraphs.map((p, i) => (
              <p key={i} className="sp-p">{p}</p>
            ))}
            {longParsed.bullets.length > 0 && (
              <ul className="sp-ul">
                {longParsed.bullets.map((b, i) => <li key={i}>{b}</li>)}
              </ul>
            )}
            <p className="sp-p" style={{ marginTop: '12px', color: '#888', fontSize: '13px' }}>
              All {service.name.toLowerCase()} services are performed by JoJany at{' '}
              <Link href="/" style={{ color: '#FF2D78', textDecoration: 'none' }}>Glitz & Glamour Studio</Link>
              {' '}in Vista, CA — serving clients across North County San Diego including San Marcos, Oceanside, and Carlsbad.
            </p>
          </section>
        )}

        {/* ── FAQs ── */}
        {faqs.length > 0 && (
          <section className="sp-section" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.015))' }}>
            <h2 className="sp-section-title">
              <span className="sp-section-icon">❓</span> Frequently Asked Questions
            </h2>
            <div style={{ display: 'grid', gap: '8px' }}>
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

        {/* ── Related Services ── */}
        {related.length > 0 && (
          <section className="sp-section">
            <h2 className="sp-section-title">
              <span className="sp-section-icon">💅</span> More {categoryLabel} Services
            </h2>
            <div className="sp-related-grid">
              {related.map(r => (
                <Link key={r.id} href={`/services/${r.slug}`} className="sp-related-card">
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

        {/* ── Bottom CTA ── */}
        <section className="sp-cta-section">
          <h2>Ready for {service.name}?</h2>
          <p>
            Book online and we'll confirm the details. Pricing is finalized in person before we begin.
          </p>
          <Link href={`/book?service=${service.id}`} className="btn-primary" style={{ padding: '14px 28px', fontSize: '15px', fontWeight: 700 }}>
            Book Your Appointment
          </Link>
          <div className="sp-links">
            <Link href="/services">All Services</Link>
            <span style={{ color: '#333' }}>·</span>
            <Link href="/reviews">Reviews</Link>
            <span style={{ color: '#333' }}>·</span>
            <Link href="/gallery">Gallery</Link>
            <span style={{ color: '#333' }}>·</span>
            <Link href="/policy">Policies</Link>
            <span style={{ color: '#333' }}>·</span>
            <Link href="/faq">FAQ</Link>
          </div>
        </section>
      </div>

      {/* ── Mobile Sticky Bar ── */}
      <div className="sp-sticky">
        <div className="sp-sticky-inner">
          <div className="sp-sticky-info">
            <p className="sp-sticky-name">{service.name}</p>
            <p className="sp-sticky-price">{service.priceLabel}</p>
          </div>
          <Link href={`/book?service=${service.id}`} className="btn-primary" style={{ padding: '10px 18px', fontWeight: 800, whiteSpace: 'nowrap', fontSize: '13px' }}>
            Book Now
          </Link>
        </div>
        <div style={{ height: 'env(safe-area-inset-bottom)' }} />
      </div>
    </div>
  );
}
