import { Metadata } from 'next';
import Link from 'next/link';
import { MapPin, Sparkles, ChevronRight, Phone, Calendar } from 'lucide-react';
import { SERVICE_AREAS, ALL_SERVICE_AREA_SLUGS } from '@/data/serviceAreas';

export const metadata: Metadata = {
  title: 'North County & San Diego Service Areas | Glitz & Glamour',
  description:
    'Explore Glitz & Glamour Studio service areas across North County & San Diego. Visit our San Marcos nail, hair & facial salon or book mobile bridal HMUA.',
  alternates: {
    canonical: 'https://www.glitzandglamours.com/service-areas',
  },
};

export default function ServiceAreasIndexPage() {
  return (
    <>
      <style>{`
        .sai-page {
          min-height: 100vh;
          color: #f7f1f4;
          font-family: var(--font-sans, 'Plus Jakarta Sans'), sans-serif;
          position: relative;
          z-index: 1;
          padding-bottom: 100px;
        }
        .sai-nav-bar {
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(18, 7, 14, 0.78);
          backdrop-filter: blur(12px);
        }
        .sai-nav-inner {
          max-width: 1180px;
          margin: 0 auto;
          padding: 14px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 10px;
        }
        .sai-breadcrumbs {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: #dfd2d9;
          list-style: none;
          margin: 0;
          padding: 0;
          flex-wrap: wrap;
        }
        .sai-breadcrumbs a {
          color: #e2d6dc;
          text-decoration: none;
          transition: color 0.2s;
        }
        .sai-breadcrumbs a:hover {
          color: #ff8ab8;
        }
        .sai-breadcrumbs-sep {
          color: rgba(255, 255, 255, 0.45);
          font-size: 12px;
        }
        .sai-breadcrumbs-cur {
          color: #ff8ab8;
          font-weight: 700;
        }
        .sai-nav-meta {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: #e2d6dc;
          font-weight: 500;
        }
        .sai-hero {
          max-width: 900px;
          margin: 44px auto 40px;
          text-align: center;
          padding: 0 20px;
        }
        .sai-badge {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          background: rgba(255, 45, 120, 0.14);
          border: 1px solid rgba(255, 107, 168, 0.38);
          border-radius: 999px;
          padding: 7px 18px;
          color: #ff8ab8;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.14em;
          margin-bottom: 18px;
        }
        .sai-title {
          font-family: var(--font-serif, 'Cormorant Garamond'), Georgia, serif;
          font-size: clamp(2.1rem, 4.8vw, 3.35rem);
          font-weight: 600;
          color: #fff;
          line-height: 1.12;
          letter-spacing: -0.01em;
          margin: 0 0 18px;
        }
        .sai-subtitle {
          font-size: clamp(14.5px, 1.8vw, 16.5px);
          color: #e2d6dc;
          line-height: 1.75;
          margin: 0 auto 24px;
          max-width: 760px;
        }
        .sai-hq-pill {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: linear-gradient(145deg, rgba(255, 255, 255, 0.06), rgba(22, 8, 18, 0.85));
          border: 1px solid rgba(255, 107, 168, 0.28);
          border-radius: 14px;
          padding: 10px 18px;
          font-size: 13px;
          color: #f4eef1;
          max-width: 100%;
          text-align: left;
        }
        .sai-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 24px;
          max-width: 1180px;
          margin: 0 auto 56px;
          padding: 0 20px;
        }
        .sai-card {
          background: linear-gradient(155deg, rgba(255, 255, 255, 0.05) 0%, rgba(20, 7, 16, 0.9) 100%);
          border: 1px solid rgba(255, 255, 255, 0.09);
          border-radius: 22px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
        }
        .sai-card:hover {
          border-color: rgba(255, 107, 168, 0.42);
          transform: translateY(-3px);
          box-shadow: 0 18px 42px rgba(0, 0, 0, 0.55);
        }
        .sai-card-img-wrap {
          position: relative;
          height: 205px;
          width: 100%;
          overflow: hidden;
          background: #1b0a15;
        }
        .sai-card-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          opacity: 0.62;
          display: block;
          transition: transform 0.4s ease;
        }
        .sai-card:hover .sai-card-img {
          transform: scale(1.03);
        }
        .sai-card-img-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(15, 5, 11, 0.12) 0%, rgba(15, 5, 11, 0.9) 100%);
        }
        .sai-card-badges {
          position: absolute;
          bottom: 14px;
          left: 16px;
          right: 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }
        .sai-region-badge {
          background: rgba(18, 7, 14, 0.85);
          border: 1px solid rgba(255, 107, 168, 0.45);
          color: #ff8ab8;
          font-size: 11px;
          font-weight: 700;
          padding: 4px 11px;
          border-radius: 999px;
          letter-spacing: 0.04em;
        }
        .sai-dist-badge {
          background: rgba(12, 4, 9, 0.82);
          border: 1px solid rgba(255, 255, 255, 0.12);
          color: #f4eef1;
          font-size: 11px;
          font-weight: 600;
          padding: 4px 10px;
          border-radius: 999px;
        }
        .sai-card-body {
          padding: 24px;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        .sai-card-title {
          font-family: var(--font-serif, 'Cormorant Garamond'), Georgia, serif;
          font-size: 26px;
          font-weight: 600;
          color: #fff;
          margin: 0 0 8px;
          line-height: 1.2;
          transition: color 0.2s;
        }
        .sai-card:hover .sai-card-title {
          color: #ff8ab8;
        }
        .sai-card-tagline {
          font-size: 13.5px;
          color: #e2d6dc;
          line-height: 1.65;
          margin: 0 0 16px;
        }
        .sai-venue-snippet {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          padding: 12px 14px;
          font-size: 12px;
          color: #dfd2d9;
          line-height: 1.55;
          margin-bottom: 18px;
        }
        .sai-venue-label {
          color: #ff8ab8;
          font-weight: 700;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          display: block;
          margin-bottom: 4px;
        }
        .sai-card-footer {
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          padding-top: 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          flex-wrap: wrap;
        }
        .sai-card-meta {
          font-size: 12px;
          color: #dfd2d9;
          font-weight: 500;
        }
        .sai-card-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: #ff8ab8;
          font-size: 13px;
          font-weight: 700;
          text-decoration: none;
          transition: gap 0.2s ease, color 0.2s ease;
        }
        .sai-card:hover .sai-card-link {
          gap: 9px;
          color: #ffd1e4;
        }
        .sai-banner {
          max-width: 1180px;
          margin: 0 auto;
          padding: 0 20px;
        }
        .sai-banner-inner {
          background: linear-gradient(135deg, rgba(255, 45, 120, 0.16) 0%, rgba(30, 10, 24, 0.92) 60%, rgba(212, 165, 116, 0.14) 100%);
          border: 1px solid rgba(255, 107, 168, 0.35);
          border-radius: 26px;
          padding: 44px 28px;
          text-align: center;
          box-shadow: 0 24px 60px rgba(0, 0, 0, 0.45);
        }
        .sai-banner-title {
          font-family: var(--font-serif, 'Cormorant Garamond'), Georgia, serif;
          font-size: clamp(1.75rem, 3.5vw, 2.45rem);
          font-weight: 600;
          color: #fff;
          margin: 0 0 12px;
          line-height: 1.2;
        }
        .sai-banner-desc {
          color: #e2d6dc;
          font-size: 14.5px;
          max-width: 640px;
          margin: 0 auto 26px;
          line-height: 1.7;
        }
        .sai-banner-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          justify-content: center;
        }
        @media (max-width: 720px) {
          .sai-grid {
            grid-template-columns: 1fr;
          }
          .sai-hero {
            margin: 32px auto 28px;
          }
          .sai-banner-inner {
            padding: 32px 20px;
          }
        }
      `}</style>

      <div className="sai-page">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="sai-nav-bar">
          <div className="sai-nav-inner">
            <ol className="sai-breadcrumbs">
              <li>
                <Link href="/">Home</Link>
              </li>
              <li className="sai-breadcrumbs-sep">/</li>
              <li>
                <Link href="/special-events">Special Events</Link>
              </li>
              <li className="sai-breadcrumbs-sep">/</li>
              <li className="sai-breadcrumbs-cur" aria-current="page">
                Service Areas
              </li>
            </ol>

            <div className="sai-nav-meta">
              <MapPin size={13} color="#ff8ab8" />
              <span>San Marcos Studio &bull; Mobile Across San Diego</span>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <header className="sai-hero">
          <span className="sai-badge">
            <Sparkles size={13} color="#ff8ab8" />
            Flagship San Marcos Salon &amp; Mobile Bridal Coverage
          </span>
          <h1 className="sai-title">North County &amp; San Diego Salon and Bridal Service Areas</h1>
          <p className="sai-subtitle">
            Headquartered at our flagship luxury salon in San Marcos (formerly on Frances Dr in Vista), Glitz &amp; Glamour Studio welcomes clients across North County for Gel-X nails, detox pedicures, dimensional balayage, haircuts, facials, and waxing—plus mobile, on-location wedding hair and makeup across all 8 service areas.
          </p>

          <div className="sai-hq-pill">
            <MapPin size={15} color="#ff8ab8" style={{ flexShrink: 0 }} />
            <span>
              <strong>Flagship Studio:</strong> 935 W San Marcos Blvd, Suite 101, San Marcos, CA 92078
            </span>
          </div>
        </header>

        {/* City Directory Grid */}
        <section className="sai-grid" aria-label="Service Areas Directory">
          {ALL_SERVICE_AREA_SLUGS.map((slug) => {
            const area = SERVICE_AREAS[slug];
            return (
              <article key={slug} className="sai-card">
                <div className="sai-card-img-wrap">
                  <img
                    src={area.heroImage}
                    alt={area.heroTitle}
                    width={600}
                    height={400}
                    loading="lazy"
                    decoding="async"
                    fetchPriority="low"
                    className="sai-card-img"
                  />
                  <div className="sai-card-img-overlay" />
                  <div className="sai-card-badges">
                    <span className="sai-region-badge">{area.region}</span>
                    <span className="sai-dist-badge">{area.distanceFromStudio}</span>
                  </div>
                </div>

                <div className="sai-card-body">
                  <div>
                    <h2 className="sai-card-title">{area.city}, CA</h2>
                    <p className="sai-card-tagline">{area.heroTagline}</p>

                    <div className="sai-venue-snippet">
                      <strong className="sai-venue-label">Venues Served:</strong>
                      {area.venues.map((v) => v.name).join(' • ')}
                    </div>
                  </div>

                  <div className="sai-card-footer">
                    <span className="sai-card-meta">Flagship Salon &amp; Mobile Bridal</span>
                    <Link href={`/service-areas/${slug}`} className="sai-card-link">
                      Explore {area.city} <ChevronRight size={14} />
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </section>

        {/* Direct Call to Action Banner */}
        <section className="sai-banner">
          <div className="sai-banner-inner">
            <h2 className="sai-banner-title">
              Book a Salon Appointment or Request a Bridal Quote
            </h2>
            <p className="sai-banner-desc">
              Visit our flagship San Marcos studio for Gel-X nails, pedicures, balayage, facials, and waxing—or request an itemized custom quote for mobile wedding hair and makeup across San Diego County.
            </p>
            <div className="sai-banner-actions">
              <Link
                href="/book"
                className="btn-primary"
                style={{ padding: '12px 26px', fontSize: '14px', gap: '8px' }}
              >
                <Calendar size={14} />
                Book Salon Appointment
              </Link>
              <button
                type="button"
                data-open-quote="true"
                data-event-type="Wedding / Bridal"
                className="btn-outline"
                style={{ padding: '12px 26px', fontSize: '14px', cursor: 'pointer' }}
              >
                Request Custom Bridal Quote
              </button>
              <a
                href="tel:7602905910"
                className="btn-outline"
                style={{ padding: '12px 24px', fontSize: '14px', gap: '8px' }}
              >
                <Phone size={14} color="#ff8ab8" />
                (760) 290-5910
              </a>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
