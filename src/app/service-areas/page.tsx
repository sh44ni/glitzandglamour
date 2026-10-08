import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Sparkles, ChevronRight, Phone, Calendar, ArrowRight } from 'lucide-react';
import { SERVICE_AREAS, ALL_SERVICE_AREA_SLUGS } from '@/data/serviceAreas';

export const metadata: Metadata = {
  title: 'San Diego Service Areas | Wedding Hair & Makeup | Glitz & Glamour',
  description:
    'Explore bridal hair and makeup service areas across San Diego County by Glitz & Glamour Studio. In-studio trials in San Marcos and on-location glam across Vista, Carlsbad, La Jolla, and San Diego.',
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
          background: #0a0a0a;
          color: #fff;
          font-family: var(--font-poppins, 'Poppins'), sans-serif;
          position: relative;
          z-index: 1;
          padding-bottom: 90px;
        }
        .sai-nav-bar {
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          background: rgba(17, 17, 17, 0.6);
          backdrop-filter: blur(10px);
        }
        .sai-nav-inner {
          max-width: 1140px;
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
          color: #888;
          list-style: none;
          margin: 0;
          padding: 0;
        }
        .sai-breadcrumbs a {
          color: #aaa;
          text-decoration: none;
          transition: color 0.2s;
        }
        .sai-breadcrumbs a:hover {
          color: #FF2D78;
        }
        .sai-breadcrumbs-sep {
          color: #444;
          font-size: 12px;
        }
        .sai-breadcrumbs-cur {
          color: #FF2D78;
          font-weight: 600;
        }
        .sai-hero {
          max-width: 860px;
          margin: 40px auto 36px;
          text-align: center;
          padding: 0 20px;
        }
        .sai-badge {
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
          margin-bottom: 16px;
        }
        .sai-title {
          font-size: clamp(28px, 5vw, 44px);
          font-weight: 800;
          color: #fff;
          line-height: 1.2;
          letter-spacing: -0.5px;
          margin: 0 0 16px;
        }
        .sai-subtitle {
          font-size: clamp(14px, 2vw, 16px);
          color: #bbb;
          line-height: 1.7;
          margin: 0 auto 20px;
          max-width: 720px;
        }
        .sai-hq-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          padding: 8px 16px;
          font-size: 12px;
          color: #ccc;
        }
        .sai-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 24px;
          max-width: 1140px;
          margin: 0 auto 48px;
          padding: 0 20px;
        }
        .sai-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 22px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          transition: all 0.3s ease;
        }
        .sai-card:hover {
          border-color: rgba(255, 45, 120, 0.4);
          transform: translateY(-3px);
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.6);
        }
        .sai-card-img-wrap {
          position: relative;
          height: 200px;
          width: 100%;
          overflow: hidden;
        }
        .sai-card-body {
          padding: 24px;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        .sai-card-title {
          font-size: 20px;
          font-weight: 800;
          color: #fff;
          margin: 0 0 8px;
          transition: color 0.2s;
        }
        .sai-card:hover .sai-card-title {
          color: #FF2D78;
        }
        .sai-card-tagline {
          font-size: 13px;
          color: #bbb;
          line-height: 1.6;
          margin-bottom: 16px;
        }
        .sai-venue-snippet {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 10px;
          padding: 10px 12px;
          font-size: 11px;
          color: #888;
          line-height: 1.5;
          margin-bottom: 18px;
        }
        .sai-card-footer {
          border-top: 1px solid rgba(255, 255, 255, 0.06);
          padding-top: 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .sai-card-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: #FF2D78;
          font-size: 13px;
          font-weight: 700;
          text-decoration: none;
          transition: gap 0.2s ease;
        }
        .sai-card:hover .sai-card-link {
          gap: 9px;
          color: #FF6BA8;
        }
        .sai-banner {
          max-width: 1140px;
          margin: 0 auto;
          padding: 0 20px;
        }
        .sai-banner-inner {
          background: linear-gradient(135deg, rgba(255, 45, 120, 0.14) 0%, rgba(168, 85, 247, 0.1) 100%);
          border: 1px solid rgba(255, 45, 120, 0.3);
          border-radius: 24px;
          padding: 36px 24px;
          text-align: center;
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

            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#aaa' }}>
              <MapPin size={12} color="#FF2D78" />
              <span>San Marcos Studio &bull; Mobile Across San Diego</span>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <header className="sai-hero">
          <span className="sai-badge">
            <Sparkles size={12} color="#FF2D78" />
            Southern California Bridal Coverage
          </span>
          <h1 className="sai-title">San Diego Wedding Hair &amp; Makeup Service Areas</h1>
          <p className="sai-subtitle">
            Headquartered at our flagship luxury salon in San Marcos, Glitz &amp; Glamour Studio provides in-studio preview trials and mobile, on-location wedding hair and makeup artistry throughout North County and greater San Diego.
          </p>

          <div className="sai-hq-pill">
            <MapPin size={13} color="#FF2D78" />
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
                  <Image
                    src={area.heroImage}
                    alt={area.heroTitle}
                    fill
                    style={{ objectFit: 'cover', opacity: 0.55 }}
                    sizes="(max-width: 768px) 100vw, 400px"
                  />
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(180deg, rgba(10,10,10,0.1) 0%, rgba(10,10,10,0.85) 100%)',
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '12px',
                      left: '14px',
                      right: '14px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <span
                      style={{
                        background: 'rgba(255, 45, 120, 0.2)',
                        backdropFilter: 'blur(6px)',
                        border: '1px solid rgba(255, 45, 120, 0.4)',
                        color: '#fff',
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '3px 10px',
                        borderRadius: '6px',
                      }}
                    >
                      {area.region}
                    </span>
                    <span
                      style={{
                        background: 'rgba(0, 0, 0, 0.6)',
                        color: '#ddd',
                        fontSize: '11px',
                        padding: '3px 8px',
                        borderRadius: '6px',
                      }}
                    >
                      {area.distanceFromStudio}
                    </span>
                  </div>
                </div>

                <div className="sai-card-body">
                  <div>
                    <h2 className="sai-card-title">{area.city}, CA</h2>
                    <p className="sai-card-tagline">{area.heroTagline}</p>

                    <div className="sai-venue-snippet">
                      <strong style={{ color: '#aaa', display: 'block', marginBottom: '3px' }}>
                        Venues Served:
                      </strong>
                      {area.venues.map((v) => v.name).join(' &bull; ')}
                    </div>
                  </div>

                  <div className="sai-card-footer">
                    <span style={{ fontSize: '12px', color: '#888' }}>Full Mobile Glam Team</span>
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
            <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#fff', margin: '0 0 10px' }}>
              Getting Married in Southern California?
            </h2>
            <p style={{ color: '#ccc', fontSize: '14px', maxWidth: '580px', margin: '0 auto 22px', lineHeight: 1.6 }}>
              Contact our bridal coordinators with your date and venue location to receive an itemized, transparent custom quote for bridal party hair and makeup.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center' }}>
              <Link
                href="/special-events/weddings-bridal#pricing"
                className="btn-primary"
                style={{ padding: '12px 28px', fontSize: '14px' }}
              >
                Request Custom Quote
              </Link>
              <a
                href="tel:7602905910"
                className="btn-outline"
                style={{ padding: '12px 24px', fontSize: '14px', gap: '8px' }}
              >
                <Phone size={14} color="#FF2D78" />
                (760) 290-5910
              </a>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
