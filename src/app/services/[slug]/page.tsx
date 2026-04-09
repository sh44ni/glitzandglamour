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

  if (!svc) {
    return {
      title: 'Service not found | Glitz & Glamour Studio',
      robots: { index: false, follow: false },
    };
  }

  const title = svc.seoTitle?.trim() || `${svc.name} | Glitz & Glamour Studio`;
  const description =
    svc.seoDescription?.trim() ||
    svc.description?.trim() ||
    `Explore ${svc.name} at Glitz & Glamour Studio in Vista, CA — serving North County. View details, starting pricing, and book your appointment.`;

  const keywords = svc.seoKeywords?.trim() || `${svc.name}, ${svc.category}, Vista CA, North County`;
  const image = svc.ogImageUrl?.trim() || svc.imageUrl?.trim() || undefined;

  const canonicalSlug = svc.slug || slug;
  return {
    title,
    description,
    keywords,
    alternates: { canonical: serviceCanonical(canonicalSlug) },
    openGraph: {
      title,
      description,
      type: 'website',
      url: serviceCanonical(canonicalSlug),
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = await prisma.service.findUnique({
    where: { slug },
  });

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
    take: 6,
    select: { id: true, name: true, slug: true, priceLabel: true, imageUrl: true },
  });

  const canonical = serviceCanonical(service.slug || slug);
  const offerPrice = service.startingAtPrice ?? Math.round(service.priceFrom || 0);

  const jsonLdService = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.name,
    description: (service.seoDescription || service.description || longCopy || '').slice(0, 500) || undefined,
    provider: {
      '@type': 'BeautySalon',
      name: 'Glitz & Glamour Studio',
      url: 'https://glitzandglamours.com',
      areaServed: ['North County, San Diego', 'Vista, CA'],
    },
    areaServed: ['North County, San Diego', 'Vista, CA'],
    url: canonical,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'USD',
      price: offerPrice || undefined,
      url: canonical,
      availability: 'https://schema.org/InStock',
    },
  } as const;

  const jsonLdFaq =
    faqs.length === 0
      ? null
      : ({
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faqs.map(f => ({
            '@type': 'Question',
            name: f.q,
            acceptedAnswer: { '@type': 'Answer', text: f.a },
          })),
        } as const);

  return (
    <div style={{ minHeight: '100vh' }}>
      <style>{`
        .serviceGrid {
          display: grid;
          grid-template-columns: 1.25fr 0.75fr;
          gap: 14px;
        }
        .serviceHero {
          border-radius: 24px;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.02);
          box-shadow: 0 28px 80px rgba(0,0,0,0.75);
          margin-bottom: 16px;
        }
        .serviceHeroMedia {
          position: relative;
          height: 320px;
          background: #0f0f0f;
        }
        .serviceBottomCta {
          position: fixed;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 60;
          padding: 10px 14px;
          background: rgba(10,10,10,0.86);
          border-top: 1px solid rgba(255,255,255,0.06);
          backdrop-filter: blur(24px);
        }
        .faqItem {
          border-radius: 16px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          overflow: hidden;
        }
        .faqSummary {
          list-style: none;
          cursor: pointer;
          padding: 14px 14px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }
        .faqSummary::-webkit-details-marker { display: none; }
        .faqChevron {
          width: 22px;
          height: 22px;
          border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.10);
          background: rgba(0,0,0,0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #FF2D78;
          flex-shrink: 0;
          transition: transform 160ms ease;
        }
        details[open] .faqChevron { transform: rotate(180deg); }
        @media (max-width: 900px) {
          .serviceGrid { grid-template-columns: 1fr; }
          .serviceBottomCta { padding-bottom: calc(10px + 64px); }
          aside { display: none; }
        }
        @media (max-width: 768px) {
          .serviceHero { border-radius: 20px; }
          .serviceHeroMedia { height: 260px; }
        }
        @media (max-width: 420px) {
          .serviceHeroMedia { height: 230px; }
        }
      `}</style>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdService) }}
      />
      {jsonLdFaq && (
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFaq) }}
        />
      )}

      <div style={{ maxWidth: '980px', margin: '0 auto', padding: '22px 16px 140px', fontFamily: 'Poppins, sans-serif' }}>
        <div style={{ marginBottom: '14px', display: 'flex', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          <Link href="/services" style={{ color: '#888', textDecoration: 'none', fontFamily: 'Poppins, sans-serif', fontSize: '13px' }}>
            ← Back to services
          </Link>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '11px', fontWeight: 800, color: '#FF2D78', letterSpacing: '0.4px', textTransform: 'uppercase' }}>
              {service.category}
            </span>
            <span style={{ width: 4, height: 4, borderRadius: 999, background: '#333' }} />
            <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px', color: '#999', fontWeight: 700 }}>
              {service.priceLabel}
            </span>
            {service.durationMins ? (
              <>
                <span style={{ width: 4, height: 4, borderRadius: 999, background: '#333' }} />
                <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px', color: '#777' }}>
                  {service.durationMins} mins
                </span>
              </>
            ) : null}
          </div>
        </div>

        {/* Hero */}
        <section className="serviceHero">
          <div className="serviceHeroMedia">
            {service.imageUrl ? (
              <Image src={service.imageUrl} alt={service.name} fill priority style={{ objectFit: 'cover', objectPosition: 'center' }} />
            ) : null}
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(10,10,10,0.2) 0%, rgba(10,10,10,0.75) 65%, rgba(10,10,10,0.92) 100%)' }} />
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'flex-end', padding: '22px' }}>
              <div style={{ maxWidth: '720px' }}>
                <h1 style={{
                  fontFamily: 'Poppins, sans-serif',
                  fontWeight: 900,
                  color: '#fff',
                  fontSize: 'clamp(1.9rem, 4.2vw, 3.1rem)',
                  letterSpacing: '-0.8px',
                  marginBottom: '10px',
                  lineHeight: 1.05,
                }}>
                  {service.name}
                </h1>
                <p style={{ fontFamily: 'Poppins, sans-serif', color: '#ddd', fontSize: '14px', lineHeight: 1.65, marginBottom: '14px' }}>
                  {(service.description || service.seoDescription || defaults.headline || 'Premium service by JoJany in Vista, CA — serving North County.').trim()}
                </p>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <Link href={`/book?service=${service.id}`} className="btn-primary" style={{ padding: '12px 20px', fontSize: '14px', fontWeight: 800 }}>
                    Book now
                  </Link>
                  <a href="#pricing" className="btn-outline" style={{ padding: '12px 18px', fontSize: '14px', fontWeight: 800 }}>
                    See pricing
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Content grid */}
        <div className="serviceGrid">
          <main style={{ minWidth: 0 }}>
            <section id="pricing" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '18px', padding: '18px', marginBottom: '14px' }}>
              <h2 style={{ fontFamily: 'Poppins, sans-serif', color: '#fff', fontSize: '14px', fontWeight: 900, marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.7px' }}>
                Pricing
              </h2>
              <p style={{ fontFamily: 'Poppins, sans-serif', color: '#FF2D78', fontWeight: 900, fontSize: '20px', marginBottom: '6px' }}>
                {service.priceLabel}
              </p>
              <p style={{ fontFamily: 'Poppins, sans-serif', color: '#666', fontSize: '12px', lineHeight: 1.6 }}>
                Prices shown are starting points. Final pricing is confirmed in person before your appointment begins.
              </p>
            </section>

            {(benefitsParsed.bullets.length > 0 || benefitsParsed.paragraphs.length > 0) && (
              <section style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '18px', padding: '18px', marginBottom: '14px' }}>
                <h2 style={{ fontFamily: 'Poppins, sans-serif', color: '#fff', fontSize: '14px', fontWeight: 900, marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.7px' }}>
                  What’s included
                </h2>
                {benefitsParsed.paragraphs.map((p, i) => (
                  <p key={i} style={{ fontFamily: 'Poppins, sans-serif', color: '#bbb', fontSize: '13px', lineHeight: 1.7, marginBottom: '10px' }}>{p}</p>
                ))}
                {benefitsParsed.bullets.length > 0 && (
                  <ul style={{ margin: 0, paddingLeft: '18px' }}>
                    {benefitsParsed.bullets.map((b, i) => (
                      <li key={i} style={{ fontFamily: 'Poppins, sans-serif', color: '#ddd', fontSize: '13px', lineHeight: 1.8, marginBottom: '6px' }}>{b}</li>
                    ))}
                  </ul>
                )}
              </section>
            )}

            {(longParsed.paragraphs.length > 0 || longParsed.bullets.length > 0) && (
              <section style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '18px', padding: '18px', marginBottom: '14px' }}>
                <h2 style={{ fontFamily: 'Poppins, sans-serif', color: '#fff', fontSize: '14px', fontWeight: 900, marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.7px' }}>
                  Overview
                </h2>
                {longParsed.paragraphs.map((p, i) => (
                  <p key={i} style={{ fontFamily: 'Poppins, sans-serif', color: '#bbb', fontSize: '13px', lineHeight: 1.75, marginBottom: '10px' }}>{p}</p>
                ))}
                {longParsed.bullets.length > 0 && (
                  <ul style={{ margin: 0, paddingLeft: '18px' }}>
                    {longParsed.bullets.map((b, i) => (
                      <li key={i} style={{ fontFamily: 'Poppins, sans-serif', color: '#ddd', fontSize: '13px', lineHeight: 1.8, marginBottom: '6px' }}>{b}</li>
                    ))}
                  </ul>
                )}
              </section>
            )}

            {faqs.length > 0 && (
              <section style={{
                background: 'linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.015))',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: '18px',
                padding: '18px',
                marginBottom: '14px',
                boxShadow: '0 18px 50px rgba(0,0,0,0.35)',
              }}>
                <h2 style={{ fontFamily: 'Poppins, sans-serif', color: '#fff', fontSize: '14px', fontWeight: 900, marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.7px' }}>
                  FAQs
                </h2>
                <div style={{ display: 'grid', gap: '10px' }}>
                  {faqs.map((f, i) => (
                    <details key={i} className="faqItem">
                      <summary className="faqSummary">
                        <span style={{ color: '#fff', fontFamily: 'Poppins, sans-serif', fontWeight: 900, fontSize: '13px', lineHeight: 1.35 }}>
                          {f.q}
                        </span>
                        <span className="faqChevron" aria-hidden>⌄</span>
                      </summary>
                      <div style={{ padding: '0 14px 14px' }}>
                        <p style={{ marginTop: '2px', color: '#bbb', fontFamily: 'Poppins, sans-serif', fontSize: '13px', lineHeight: 1.75 }}>
                          {f.a}
                        </p>
                      </div>
                    </details>
                  ))}
                </div>
              </section>
            )}

            {/* CTA + footer-ish section */}
            <section style={{
              background: 'linear-gradient(135deg, rgba(255,45,120,0.10), rgba(121,40,202,0.08))',
              border: '1px solid rgba(255,45,120,0.18)',
              borderRadius: '18px',
              padding: '18px',
              marginBottom: '14px',
            }}>
              <h2 style={{ fontFamily: 'Poppins, sans-serif', color: '#fff', fontSize: '14px', fontWeight: 900, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.7px' }}>
                Book your appointment
              </h2>
              <p style={{ fontFamily: 'Poppins, sans-serif', color: '#ddd', fontSize: '13px', lineHeight: 1.7, marginBottom: '14px' }}>
                Ready for {service.name}? Book now and we’ll confirm the details. Pricing is finalized in person before we lock it in.
              </p>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                <Link href={`/book?service=${service.id}`} className="btn-primary" style={{ padding: '12px 18px', fontWeight: 900 }}>
                  Book now
                </Link>
                <Link href="/services" className="btn-outline" style={{ padding: '12px 16px', fontWeight: 900 }}>
                  Browse all services
                </Link>
              </div>
              <div style={{ marginTop: '14px', display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center', justifyContent: 'space-between' }}>
                <p style={{ margin: 0, fontFamily: 'Poppins, sans-serif', fontSize: '11px', color: '#666' }}>
                  Vista, CA · Serving North County · By appointment
                </p>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <Link href="/policy" style={{ color: '#777', fontSize: '11px', fontFamily: 'Poppins, sans-serif', textDecoration: 'none' }}>Policies</Link>
                  <Link href="/waiver" style={{ color: '#777', fontSize: '11px', fontFamily: 'Poppins, sans-serif', textDecoration: 'none' }}>Waiver</Link>
                  <Link href="/reviews" style={{ color: '#777', fontSize: '11px', fontFamily: 'Poppins, sans-serif', textDecoration: 'none' }}>Reviews</Link>
                </div>
              </div>
            </section>
          </main>

          <aside style={{ minWidth: 0 }}>
            <div style={{ position: 'sticky', top: '84px', display: 'grid', gap: '12px' }}>
              <div style={{ background: 'linear-gradient(135deg, rgba(255,45,120,0.10), rgba(121,40,202,0.08))', border: '1px solid rgba(255,45,120,0.18)', borderRadius: '18px', padding: '16px' }}>
                <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '11px', color: '#FF6BA8', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
                  Ready when you are
                </p>
                <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '13px', color: '#ddd', lineHeight: 1.65, marginBottom: '12px' }}>
                  Book your {service.name} in Vista, CA. We’ll confirm details and finalize pricing before we lock it in.
                </p>
                <Link href={`/book?service=${service.id}`} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px 14px', fontWeight: 900 }}>
                  Book now
                </Link>
                <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'space-between', color: '#666', fontSize: '11px' }}>
                  <a href="/policy" style={{ color: '#666' }}>Policies</a>
                  <a href="/waiver" style={{ color: '#666' }}>Waiver</a>
                  <a href="/reviews" style={{ color: '#666' }}>Reviews</a>
                </div>
              </div>

              {related.length > 0 && (
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '18px', padding: '16px' }}>
                  <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px', fontWeight: 900, color: '#fff', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.7px' }}>
                    Related services
                  </p>
                  <div style={{ display: 'grid', gap: '10px' }}>
                    {related.map(r => (
                      <Link key={r.id} href={`/services/${r.slug}`} style={{ textDecoration: 'none' }}>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', padding: '10px 12px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.22)' }}>
                          {r.imageUrl ? (
                            <div style={{ width: 40, height: 40, borderRadius: 10, overflow: 'hidden', position: 'relative', flexShrink: 0 }}>
                              <Image src={r.imageUrl} alt={r.name} fill style={{ objectFit: 'cover' }} />
                            </div>
                          ) : null}
                          <div style={{ minWidth: 0 }}>
                            <p style={{ margin: 0, color: '#eee', fontFamily: 'Poppins, sans-serif', fontSize: '13px', fontWeight: 800, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 260 }}>
                              {r.name}
                            </p>
                            <p style={{ margin: 0, color: '#FF2D78', fontFamily: 'Poppins, sans-serif', fontSize: '12px', fontWeight: 800 }}>{r.priceLabel}</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>

        {/* Mobile bottom CTA */}
        <div className="serviceBottomCta">
          <div style={{ maxWidth: '980px', margin: '0 auto', display: 'flex', gap: '10px', alignItems: 'center' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, color: '#fff', fontFamily: 'Poppins, sans-serif', fontWeight: 900, fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {service.name}
              </p>
              <p style={{ margin: 0, color: '#777', fontFamily: 'Poppins, sans-serif', fontSize: '12px' }}>
                {service.priceLabel}
              </p>
            </div>
            <Link href={`/book?service=${service.id}`} className="btn-primary" style={{ padding: '10px 16px', fontWeight: 900, whiteSpace: 'nowrap' }}>
              Book now
            </Link>
          </div>
          <div style={{ height: 'env(safe-area-inset-bottom)' }} />
        </div>
      </div>
    </div>
  );
}

