import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

type Faq = { q: string; a: string };

function asFaqs(value: unknown): Faq[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((x: any) => ({ q: String(x?.q || '').trim(), a: String(x?.a || '').trim() }))
    .filter(x => x.q && x.a);
}

function parseBullets(text: string) {
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

function canonical(slug: string) {
  return `https://glitzandglamours.com/special-events/${slug}`;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const cat = await prisma.specialEventCategory.findFirst({
    where: { slug, isActive: true },
    select: { name: true, slug: true, description: true, imageUrl: true, tag: true },
  });
  if (!cat) return { title: 'Event not found | Glitz & Glamour Studio', robots: { index: false, follow: false } };

  const title = `${cat.name} — Special Events | Glitz & Glamour Studio`;
  const description = cat.description || `Explore ${cat.name} event services at Glitz & Glamour Studio in Vista, CA.`;
  return {
    title,
    description,
    alternates: { canonical: canonical(cat.slug || slug) },
    openGraph: { title, description, type: 'website', url: canonical(cat.slug || slug), images: cat.imageUrl ? [{ url: cat.imageUrl }] : undefined },
    twitter: { card: 'summary_large_image', title, description, images: cat.imageUrl ? [cat.imageUrl] : undefined },
  };
}

export default async function SpecialEventCategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = await prisma.specialEventCategory.findFirst({
    where: { slug, isActive: true },
  });

  if (!category) {
    return (
      <div style={{ maxWidth: '980px', margin: '0 auto', padding: '48px 24px 120px', fontFamily: 'Poppins, sans-serif' }}>
        <h1 style={{ color: '#fff', fontSize: '26px', fontWeight: 800, marginBottom: '8px' }}>Event not found</h1>
        <p style={{ color: '#777', fontSize: '14px', marginBottom: '18px' }}>This event type may be unavailable or the link is incorrect.</p>
        <Link href="/special-events" className="btn-outline">Back to Special Events</Link>
      </div>
    );
  }

  const faqs = asFaqs(category.faqs);
  const longCopy = category.longDescription?.trim() || '';
  const benefitsCopy = category.benefits?.trim() || '';
  const longParsed = longCopy ? parseBullets(longCopy) : { bullets: [], paragraphs: [] };
  const benefitsParsed = benefitsCopy ? parseBullets(benefitsCopy) : { bullets: [], paragraphs: [] };
  const pills = category.pills.split(',').filter(Boolean).map(p => p.trim());

  // Get other categories for "Related events"
  const related = await prisma.specialEventCategory.findMany({
    where: { isActive: true, NOT: { id: category.id } },
    orderBy: { displayOrder: 'asc' },
    take: 4,
    select: { id: true, name: true, slug: true, imageUrl: true, tag: true },
  });

  const jsonLdService = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: category.name,
    description: (category.description || longCopy || '').slice(0, 500),
    provider: { '@type': 'BeautySalon', name: 'Glitz & Glamour Studio', url: 'https://glitzandglamours.com', areaServed: ['Vista, CA', 'North County, San Diego'] },
    url: canonical(category.slug || slug),
  };

  const jsonLdFaq = faqs.length === 0 ? null : {
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: faqs.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  };

  return (
    <div style={{ minHeight: '100vh' }}>
      <style>{`
        .seGrid { display: grid; grid-template-columns: 1.25fr 0.75fr; gap: 14px; }
        .seHero { border-radius: 24px; overflow: hidden; border: 1px solid rgba(255,255,255,0.08); background: rgba(255,255,255,0.02); box-shadow: 0 28px 80px rgba(0,0,0,0.75); margin-bottom: 16px; }
        .seHeroMedia { position: relative; height: 340px; background: #0f0f0f; }
        .faqItem { border-radius: 16px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); overflow: hidden; }
        .faqSummary { list-style: none; cursor: pointer; padding: 14px; display: flex; align-items: center; justify-content: space-between; gap: 10px; }
        .faqSummary::-webkit-details-marker { display: none; }
        .faqChevron { width: 22px; height: 22px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.10); background: rgba(0,0,0,0.25); display: flex; align-items: center; justify-content: center; color: #FF2D78; flex-shrink: 0; transition: transform 160ms ease; }
        details[open] .faqChevron { transform: rotate(180deg); }
        @media (max-width: 900px) { .seGrid { grid-template-columns: 1fr; } aside { display: none; } }
        @media (max-width: 768px) { .seHero { border-radius: 20px; } .seHeroMedia { height: 280px; } }
      `}</style>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdService) }} />
      {jsonLdFaq && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFaq) }} />}

      <div style={{ maxWidth: '980px', margin: '0 auto', padding: '22px 16px 100px', fontFamily: 'Poppins, sans-serif' }}>
        {/* Breadcrumb */}
        <div style={{ marginBottom: '14px', display: 'flex', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          <Link href="/special-events" style={{ color: '#888', textDecoration: 'none', fontSize: '13px' }}>← Back to Special Events</Link>
          <span style={{ fontSize: '11px', fontWeight: 800, color: '#FF2D78', letterSpacing: '0.4px', textTransform: 'uppercase' }}>{category.tag}</span>
        </div>

        {/* Hero */}
        <section className="seHero">
          <div className="seHeroMedia">
            {category.imageUrl ? <Image src={category.imageUrl} alt={category.name} fill priority style={{ objectFit: 'cover', objectPosition: 'center' }} /> : (
              <div style={{ position: 'absolute', inset: 0, background: category.gradient }} />
            )}
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(10,10,10,0.2) 0%, rgba(10,10,10,0.75) 65%, rgba(10,10,10,0.92) 100%)' }} />
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'flex-end', padding: '22px' }}>
              <div style={{ maxWidth: '720px' }}>
                <h1 style={{ fontWeight: 900, color: '#fff', fontSize: 'clamp(1.9rem, 4.2vw, 3.1rem)', letterSpacing: '-0.8px', marginBottom: '10px', lineHeight: 1.05 }}>{category.name}</h1>
                <p style={{ color: '#ddd', fontSize: '14px', lineHeight: 1.65, marginBottom: '14px' }}>{category.description}</p>
                {pills.length > 0 && (
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '14px' }}>
                    {pills.map(p => (
                      <span key={p} style={{ fontSize: '10px', letterSpacing: '0.5px', textTransform: 'uppercase', border: '1px solid rgba(255,255,255,0.25)', color: 'rgba(255,255,255,0.7)', padding: '3px 10px', borderRadius: '50px' }}>{p}</span>
                    ))}
                  </div>
                )}
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <Link href="/special-events#inquire" className="btn-primary" style={{ padding: '12px 20px', fontSize: '14px', fontWeight: 800 }}>Start Your Inquiry</Link>
                  <a href="#faqs" className="btn-outline" style={{ padding: '12px 18px', fontSize: '14px', fontWeight: 800 }}>View FAQs</a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Content grid */}
        <div className="seGrid">
          <main style={{ minWidth: 0 }}>
            {/* What's included */}
            {(benefitsParsed.bullets.length > 0 || benefitsParsed.paragraphs.length > 0) && (
              <section style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '18px', padding: '18px', marginBottom: '14px' }}>
                <h2 style={{ color: '#fff', fontSize: '14px', fontWeight: 900, marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.7px' }}>What&apos;s Included</h2>
                {benefitsParsed.paragraphs.map((p, i) => <p key={i} style={{ color: '#bbb', fontSize: '13px', lineHeight: 1.7, marginBottom: '10px' }}>{p}</p>)}
                {benefitsParsed.bullets.length > 0 && (
                  <ul style={{ margin: 0, paddingLeft: '18px' }}>
                    {benefitsParsed.bullets.map((b, i) => <li key={i} style={{ color: '#ddd', fontSize: '13px', lineHeight: 1.8, marginBottom: '6px' }}>{b}</li>)}
                  </ul>
                )}
              </section>
            )}

            {/* Overview */}
            {(longParsed.paragraphs.length > 0 || longParsed.bullets.length > 0) && (
              <section style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '18px', padding: '18px', marginBottom: '14px' }}>
                <h2 style={{ color: '#fff', fontSize: '14px', fontWeight: 900, marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.7px' }}>Overview</h2>
                {longParsed.paragraphs.map((p, i) => <p key={i} style={{ color: '#bbb', fontSize: '13px', lineHeight: 1.75, marginBottom: '10px' }}>{p}</p>)}
                {longParsed.bullets.length > 0 && (
                  <ul style={{ margin: 0, paddingLeft: '18px' }}>
                    {longParsed.bullets.map((b, i) => <li key={i} style={{ color: '#ddd', fontSize: '13px', lineHeight: 1.8, marginBottom: '6px' }}>{b}</li>)}
                  </ul>
                )}
              </section>
            )}

            {/* Default overview if no long content */}
            {longParsed.paragraphs.length === 0 && longParsed.bullets.length === 0 && benefitsParsed.paragraphs.length === 0 && benefitsParsed.bullets.length === 0 && (
              <section style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '18px', padding: '18px', marginBottom: '14px' }}>
                <h2 style={{ color: '#fff', fontSize: '14px', fontWeight: 900, marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.7px' }}>About This Event</h2>
                <p style={{ color: '#bbb', fontSize: '13px', lineHeight: 1.75, marginBottom: '10px' }}>{category.description}</p>
                <p style={{ color: '#bbb', fontSize: '13px', lineHeight: 1.75 }}>
                  At Glitz &amp; Glamour Studio, we bring professional hair, makeup, and beauty services to your special occasion. Whether at our Vista studio or on-location at your venue, our team ensures every detail is picture-perfect. Fill out our inquiry form and we&apos;ll get back to you within 48 hours with a custom quote tailored to your event.
                </p>
              </section>
            )}

            {/* FAQs */}
            {faqs.length > 0 && (
              <section id="faqs" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.015))', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '18px', padding: '18px', marginBottom: '14px', boxShadow: '0 18px 50px rgba(0,0,0,0.35)' }}>
                <h2 style={{ color: '#fff', fontSize: '14px', fontWeight: 900, marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.7px' }}>FAQs</h2>
                <div style={{ display: 'grid', gap: '10px' }}>
                  {faqs.map((f, i) => (
                    <details key={i} className="faqItem">
                      <summary className="faqSummary">
                        <span style={{ color: '#fff', fontWeight: 900, fontSize: '13px', lineHeight: 1.35 }}>{f.q}</span>
                        <span className="faqChevron" aria-hidden>⌄</span>
                      </summary>
                      <div style={{ padding: '0 14px 14px' }}>
                        <p style={{ marginTop: '2px', color: '#bbb', fontSize: '13px', lineHeight: 1.75 }}>{f.a}</p>
                      </div>
                    </details>
                  ))}
                </div>
              </section>
            )}

            {/* CTA */}
            <section style={{ background: 'linear-gradient(135deg, rgba(255,45,120,0.10), rgba(121,40,202,0.08))', border: '1px solid rgba(255,45,120,0.18)', borderRadius: '18px', padding: '18px', marginBottom: '14px' }}>
              <h2 style={{ color: '#fff', fontSize: '14px', fontWeight: 900, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.7px' }}>Ready to Book Your {category.name}?</h2>
              <p style={{ color: '#ddd', fontSize: '13px', lineHeight: 1.7, marginBottom: '14px' }}>
                Submit your inquiry and we&apos;ll reach out within 48 hours with a custom quote. No commitment required.
              </p>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                <Link href="/special-events#inquire" className="btn-primary" style={{ padding: '12px 18px', fontWeight: 900 }}>Start Inquiry</Link>
                <Link href="/special-events" className="btn-outline" style={{ padding: '12px 16px', fontWeight: 900 }}>Browse All Events</Link>
              </div>
              <div style={{ marginTop: '14px', display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center', justifyContent: 'space-between' }}>
                <p style={{ margin: 0, fontSize: '11px', color: '#666' }}>Vista, CA · Serving North County · On-location available</p>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <Link href="/policy" style={{ color: '#777', fontSize: '11px', textDecoration: 'none' }}>Policies</Link>
                  <Link href="/reviews" style={{ color: '#777', fontSize: '11px', textDecoration: 'none' }}>Reviews</Link>
                </div>
              </div>
            </section>
          </main>

          <aside style={{ minWidth: 0 }}>
            <div style={{ position: 'sticky', top: '84px', display: 'grid', gap: '12px' }}>
              <div style={{ background: 'linear-gradient(135deg, rgba(255,45,120,0.10), rgba(121,40,202,0.08))', border: '1px solid rgba(255,45,120,0.18)', borderRadius: '18px', padding: '16px' }}>
                <p style={{ fontSize: '11px', color: '#FF6BA8', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Ready when you are</p>
                <p style={{ fontSize: '13px', color: '#ddd', lineHeight: 1.65, marginBottom: '12px' }}>Submit your inquiry for {category.name} in Vista, CA. We&apos;ll create a custom quote for your event.</p>
                <Link href="/special-events#inquire" className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px 14px', fontWeight: 900 }}>Start Inquiry</Link>
              </div>

              {related.length > 0 && (
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '18px', padding: '16px' }}>
                  <p style={{ fontSize: '12px', fontWeight: 900, color: '#fff', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.7px' }}>Other Events</p>
                  <div style={{ display: 'grid', gap: '10px' }}>
                    {related.map(r => (
                      <Link key={r.id} href={r.slug ? `/special-events/${r.slug}` : '/special-events'} style={{ textDecoration: 'none' }}>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', padding: '10px 12px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.22)' }}>
                          {r.imageUrl ? (
                            <div style={{ width: 40, height: 40, borderRadius: 10, overflow: 'hidden', position: 'relative', flexShrink: 0 }}>
                              <Image src={r.imageUrl} alt={r.name} fill style={{ objectFit: 'cover' }} />
                            </div>
                          ) : null}
                          <div style={{ minWidth: 0 }}>
                            <p style={{ margin: 0, color: '#eee', fontSize: '13px', fontWeight: 800, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.name}</p>
                            <p style={{ margin: 0, color: '#FF2D78', fontSize: '11px', fontWeight: 700 }}>{r.tag}</p>
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
      </div>
    </div>
  );
}
