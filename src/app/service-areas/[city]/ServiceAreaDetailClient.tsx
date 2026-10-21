'use client';

import { SERVICE_AREAS, ALL_SERVICE_AREA_SLUGS } from '@/data/serviceAreas';
import RealReviewsSection from '@/components/RealReviewsSection';
import { RealReviewItem } from '@/lib/realReviews';

interface ServiceAreaDetailClientProps {
  slug: string;
  realReviews: RealReviewItem[];
}

export default function ServiceAreaDetailClient({
  slug,
  realReviews,
}: ServiceAreaDetailClientProps) {
  const area = SERVICE_AREAS[slug];
  if (!area) return null;

  return (
    <div className="sa-page">
      <style>{`
        .sa-page {
          min-height: 100vh;
          color: #f7f1f4;
          font-family: 'Poppins', sans-serif;
          position: relative;
          z-index: 1;
          padding-bottom: 100px;
        }
        .sa-nav-bar {
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(18, 7, 14, 0.78);
          backdrop-filter: blur(12px);
        }
        .sa-nav-inner {
          max-width: 1180px;
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
          color: #dfd2d9;
          list-style: none;
          margin: 0;
          padding: 0;
          flex-wrap: wrap;
        }
        .sa-breadcrumbs a {
          color: #e2d6dc;
          text-decoration: none;
          transition: color 0.2s;
        }
        .sa-breadcrumbs a:hover {
          color: #ff8ab8;
        }
        .sa-breadcrumbs-sep {
          color: rgba(255, 255, 255, 0.45);
          font-size: 12px;
        }
        .sa-breadcrumbs-cur {
          color: #ff8ab8;
          font-weight: 700;
        }
        .sa-nav-meta {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: #e2d6dc;
          font-weight: 500;
        }
        .sa-container {
          max-width: 1180px;
          margin: 24px auto 0;
          padding: 0 20px;
        }
        .sa-hero-wrap {
          border-radius: 28px;
          overflow: hidden;
          position: relative;
          background:
            radial-gradient(circle at 14% 18%, rgba(255, 45, 120, 0.2), transparent 52%),
            radial-gradient(circle at 86% 82%, rgba(212, 165, 116, 0.15), transparent 50%),
            linear-gradient(145deg, rgba(30, 10, 22, 0.95) 0%, rgba(15, 5, 11, 0.98) 100%);
          border: 1px solid rgba(255, 107, 168, 0.3);
          box-shadow: 0 24px 70px rgba(0, 0, 0, 0.65);
          margin-bottom: 36px;
        }
        .sa-hero-layout {
          display: grid;
          grid-template-columns: minmax(0, 1.38fr) minmax(260px, 0.62fr);
          gap: 28px;
          align-items: center;
          padding: 40px 36px;
        }
        .sa-hero-content {
          position: relative;
          z-index: 2;
          width: 100%;
        }
        .sa-hero-thumb {
          position: relative;
          border-radius: 22px;
          overflow: hidden;
          aspect-ratio: 4 / 4.4;
          border: 1px solid rgba(255, 255, 255, 0.14);
          box-shadow: 0 18px 44px rgba(0, 0, 0, 0.55);
          background: #1b0a15;
        }
        .sa-hero-thumb-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center 25%;
          display: block;
        }
        .sa-hero-thumb-caption {
          position: absolute;
          left: 12px;
          right: 12px;
          bottom: 12px;
          padding: 10px 14px;
          border-radius: 14px;
          background: rgba(15, 5, 11, 0.85);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 107, 168, 0.3);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          font-size: 11.5px;
          color: #f4eef1;
        }
        .sa-badge {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          background: rgba(255, 45, 120, 0.14);
          border: 1px solid rgba(255, 107, 168, 0.38);
          border-radius: 999px;
          padding: 6px 16px;
          color: #ff8ab8;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          margin-bottom: 16px;
        }
        .sa-hero-title {
          font-size: clamp(1.9rem, 4.3vw, 2.95rem);
          font-weight: 800;
          color: #fff;
          line-height: 1.12;
          letter-spacing: -0.025em;
          margin: 0 0 14px;
        }
        .sa-hero-tagline {
          font-size: clamp(14.5px, 1.8vw, 16.5px);
          color: #e2d6dc;
          line-height: 1.7;
          margin: 0 0 24px;
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
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 12px;
          padding: 9px 16px;
          font-size: 12.5px;
          color: #e2d6dc;
          max-width: 100%;
        }
        .sa-content-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.32fr) minmax(290px, 0.68fr);
          gap: 28px;
          margin-bottom: 44px;
        }
        .sa-content-grid > div > *:not(:first-child),
        .sa-sidebar,
        .sa-bottom-block {
          content-visibility: auto;
          contain-intrinsic-size: auto 500px;
        }
        .sa-card {
          background: linear-gradient(155deg, rgba(255, 255, 255, 0.045) 0%, rgba(20, 7, 16, 0.9) 100%);
          border: 1px solid rgba(255, 255, 255, 0.09);
          border-radius: 22px;
          padding: 28px;
          margin-bottom: 26px;
        }
        .sa-eyebrow {
          color: #ff8ab8;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.16em;
          margin: 0 0 6px;
        }
        .sa-sec-title {
          font-size: clamp(1.35rem, 2.5vw, 1.75rem);
          font-weight: 800;
          color: #fff;
          margin: 0 0 14px;
          line-height: 1.22;
          letter-spacing: -0.02em;
        }
        .sa-value-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 14px;
          margin-top: 24px;
        }
        .sa-value-item {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          padding: 18px;
        }
        .sa-value-head {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 6px;
        }
        .sa-value-head::before {
          content: "✓";
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 18px;
          height: 18px;
          border-radius: 999px;
          background: rgba(255, 45, 120, 0.18);
          color: #ff8ab8;
          font-size: 11px;
          font-weight: 700;
          flex-shrink: 0;
        }
        .sa-venue-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
          margin-bottom: 32px;
        }
        .sa-venue-card {
          background: linear-gradient(155deg, rgba(255, 255, 255, 0.045) 0%, rgba(20, 7, 16, 0.9) 100%);
          border: 1px solid rgba(255, 255, 255, 0.09);
          border-radius: 18px;
          padding: 22px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          transition: border-color 0.25s ease;
        }
        .sa-venue-card:hover {
          border-color: rgba(255, 107, 168, 0.38);
        }
        .sa-tip-box {
          background: rgba(255, 45, 120, 0.07);
          border: 1px solid rgba(255, 107, 168, 0.24);
          border-radius: 12px;
          padding: 12px 14px;
          margin-top: 14px;
          font-size: 12.5px;
          color: #f4eef1;
          line-height: 1.6;
        }
        .sa-service-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 16px;
          margin-bottom: 32px;
        }
        .sa-service-card {
          background: linear-gradient(155deg, rgba(255, 255, 255, 0.045) 0%, rgba(20, 7, 16, 0.9) 100%);
          border: 1px solid rgba(255, 255, 255, 0.09);
          border-radius: 18px;
          padding: 22px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        .sa-check-list {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .sa-check-list li {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          font-size: 12.5px;
          color: #f4eef1;
        }
        .sa-check-list li::before {
          content: "✓";
          color: #ff8ab8;
          font-weight: 700;
          font-size: 12px;
          flex-shrink: 0;
          line-height: 1.4;
        }
        .sa-driver-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 14px;
          margin: 18px 0 24px;
        }
        .sa-driver-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          padding: 18px;
          text-align: center;
        }
        .sa-driver-num {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(255, 45, 120, 0.16);
          border: 1px solid rgba(255, 107, 168, 0.35);
          color: #ff8ab8;
          font-weight: 700;
          font-size: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 10px;
        }
        .sa-faq-card {
          background: linear-gradient(155deg, rgba(255, 255, 255, 0.04) 0%, rgba(20, 7, 16, 0.88) 100%);
          border: 1px solid rgba(255, 255, 255, 0.09);
          border-radius: 16px;
          overflow: hidden;
          margin-bottom: 12px;
          transition: all 0.25s ease;
        }
        .sa-faq-card[open] {
          border-color: rgba(255, 107, 168, 0.4);
          background: rgba(255, 45, 120, 0.06);
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
        .sa-faq-summary::after {
          content: "▾";
          color: #ff8ab8;
          font-size: 15px;
          margin-left: 12px;
          flex-shrink: 0;
        }
        .sa-sidebar {
          position: sticky;
          top: 88px;
        }
        .sa-sidebar-card {
          background: linear-gradient(165deg, rgba(32, 11, 24, 0.95) 0%, rgba(16, 5, 12, 0.98) 100%);
          border: 1px solid rgba(255, 107, 168, 0.32);
          border-radius: 24px;
          padding: 28px;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.55);
        }
        .sa-crosslink-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 12px;
          margin: 20px 0;
        }
        .sa-city-chip {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 12px 14px;
          border-radius: 14px;
          background: rgba(255, 255, 255, 0.035);
          border: 1px solid rgba(255, 255, 255, 0.09);
          color: #f4eef1;
          text-decoration: none;
          text-align: center;
          transition: all 0.2s ease;
        }
        .sa-city-chip:hover {
          border-color: rgba(255, 107, 168, 0.45);
          color: #ff8ab8;
          background: rgba(255, 45, 120, 0.07);
        }
        .sa-city-chip.active {
          border-color: #ff8ab8;
          background: rgba(255, 45, 120, 0.16);
          color: #fff;
          font-weight: 700;
          pointer-events: none;
        }
        .sa-salon-menu-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
          margin-top: 18px;
        }
        .sa-salon-cat-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.09);
          border-radius: 16px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          transition: border-color 0.25s ease;
        }
        .sa-salon-cat-card:hover {
          border-color: rgba(255, 107, 168, 0.38);
        }
        .sa-salon-link-list {
          list-style: none;
          margin: 12px 0 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .sa-salon-link-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          padding: 8px 11px;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.025);
          border: 1px solid rgba(255, 255, 255, 0.06);
          color: #f4eef1;
          text-decoration: none;
          font-size: 12.5px;
          transition: all 0.2s ease;
        }
        .sa-salon-link-row:hover {
          background: rgba(255, 45, 120, 0.12);
          border-color: rgba(255, 107, 168, 0.38);
          color: #fff;
        }
        .sa-salon-price {
          font-size: 11.5px;
          font-weight: 700;
          color: #ff8ab8;
          white-space: nowrap;
        }
        @media (max-width: 960px) {
          .sa-hero-layout {
            display: flex;
            flex-direction: column-reverse;
            align-items: flex-start;
            gap: 16px;
            padding: 28px 22px;
          }
          .sa-hero-thumb {
            display: none;
          }
          .sa-hero-thumb-caption {
            display: none;
          }
          .sa-content-grid {
            grid-template-columns: 1fr;
          }
          .sa-sidebar {
            position: static;
            margin-top: 8px;
          }
          .sa-crosslink-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }
        @media (max-width: 640px) {
          .sa-hero-wrap {
            border-radius: 22px;
          }
          .sa-hero-layout {
            padding: 24px 18px;
          }
          .sa-card {
            padding: 22px 18px;
          }
          .sa-value-grid,
          .sa-venue-grid,
          .sa-driver-grid,
          .sa-salon-menu-grid {
            grid-template-columns: 1fr;
          }
          .sa-cta-row {
            flex-direction: column;
            align-items: stretch;
          }
          .sa-cta-row a,
          .sa-cta-row button {
            text-align: center;
            justify-content: center;
          }
        }
      `}</style>

      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="sa-nav-bar">
        <div className="sa-nav-inner">
          <ol className="sa-breadcrumbs">
            <li>
              <a href="/">Home</a>
            </li>
            <li className="sa-breadcrumbs-sep">/</li>
            <li>
              <a href="/special-events">Special Events</a>
            </li>
            <li className="sa-breadcrumbs-sep">/</li>
            <li>
              <a href="/special-events/weddings-bridal">Weddings &amp; Bridal</a>
            </li>
            <li className="sa-breadcrumbs-sep">/</li>
            <li className="sa-breadcrumbs-cur" aria-current="page">
              {area.city}, CA
            </li>
          </ol>

          <div className="sa-nav-meta">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#ff8ab8" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span>San Marcos Studio &bull; Mobile Across San Diego</span>
          </div>
        </div>
      </nav>

      {/* Main Page Container */}
      <div className="sa-container">
        {/* Editorial Split Hero Card */}
        <section className="sa-hero-wrap">
          <div className="sa-hero-layout">
            <div className="sa-hero-content">
              <span className="sa-badge">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ff8ab8" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3Z" />
                </svg>
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
                  Request Custom Wedding Quote &rarr;
                </button>

                <a
                  href="tel:7602905910"
                  className="btn-outline"
                  style={{ padding: '12px 22px', fontSize: '14px', gap: '8px' }}
                >
                  Call (760) 290-5910
                </a>
              </div>

              {/* Proximity Pill */}
              <div className="sa-studio-pill">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ff8ab8" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }} aria-hidden="true">
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <span>
                  <strong>Flagship Studio:</strong> 935 W San Marcos Blvd, Suite 101, San Marcos, CA 92078 &bull;{' '}
                  <span style={{ color: '#ff8ab8', fontWeight: 700 }}>{area.distanceFromStudio}</span>
                </span>
              </div>
            </div>

            <div className="sa-hero-thumb">
              <img
                src={area.heroImage}
                alt={`${area.heroTitle} wedding hair and makeup`}
                width={380}
                height={420}
                loading="lazy"
                decoding="async"
                fetchPriority="low"
                className="sa-hero-thumb-img"
              />
              <div className="sa-hero-thumb-caption">
                <span>{area.city}, {area.state}</span>
                <span style={{ color: '#ff8ab8', fontWeight: 700 }}>{area.region}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Main 2-Column Grid */}
        <div className="sa-content-grid">
        {/* Left Main Column */}
        <div>
          {/* Detailed Intro Card */}
          <div className="sa-card">
            <p className="sa-eyebrow">Artistry &amp; Heritage</p>
            <h2 className="sa-sec-title">
              Premier Nail Salon, Hair Color &amp; Bridal Artistry for {area.city}, California
            </h2>
            {area.introParagraphs.map((paragraph, index) => (
              <p key={index} style={{ fontSize: '14.5px', lineHeight: 1.8, color: '#e2d6dc', marginBottom: '16px' }}>
                {paragraph}
              </p>
            ))}

            {/* 4 Value Pillars */}
            <div className="sa-value-grid">
              {area.valueProps.map((prop, idx) => (
                <div key={idx} className="sa-value-item">
                  <div className="sa-value-head">
                    <h3 style={{ fontSize: '14.5px', fontWeight: 700, color: '#fff', margin: 0 }}>
                      {prop.title}
                    </h3>
                  </div>
                  <p style={{ fontSize: '12.5px', color: '#dfd2d9', lineHeight: 1.65, margin: 0, paddingLeft: '26px' }}>
                    {prop.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* In-Studio Salon Services for {area.city} Residents */}
          <div className="sa-card" style={{ border: '1px solid rgba(255, 107, 168, 0.28)' }}>
            <p className="sa-eyebrow">
              Flagship San Marcos Salon &bull; 935 W San Marcos Blvd, Suite 101
            </p>
            <h2 className="sa-sec-title">
              In-Studio Salon Services for {area.city} Residents (Nails, Hair, Facials &amp; Waxing)
            </h2>
            <p style={{ color: '#e2d6dc', fontSize: '14px', lineHeight: 1.7, margin: 0 }}>
              Visit our flagship North County studio ({area.distanceFromStudio}) for everyday luxury nail care, custom hair color, haircuts, facials, lash lifts, and full-body waxing. Click any service below to view details and starting rates:
            </p>

            <div className="sa-salon-menu-grid">
              {/* Category 1: Nails & Pedicures */}
              <div className="sa-salon-cat-card">
                <div>
                  <span
                    style={{
                      fontSize: '10.5px',
                      fontWeight: 700,
                      color: '#ff8ab8',
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                    }}
                  >
                    Nail Artistry &amp; Foot Care
                  </span>
                  <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#fff', margin: '4px 0 0' }}>
                    Nails &amp; Pedicures
                  </h3>
                  <ul className="sa-salon-link-list">
                    <li>
                      <a href="/services/gelx" className="sa-salon-link-row">
                        <span>Gel-X Extensions</span>
                        <span className="sa-salon-price">$60+</span>
                      </a>
                    </li>
                    <li>
                      <a href="/services/acrylic-set" className="sa-salon-link-row">
                        <span>Acrylic Full Set</span>
                        <span className="sa-salon-price">$65+</span>
                      </a>
                    </li>
                    <li>
                      <a href="/services/rebalance" className="sa-salon-link-row">
                        <span>Acrylic Nail Rebalance</span>
                        <span className="sa-salon-price">$55+</span>
                      </a>
                    </li>
                    <li>
                      <a href="/services/fill" className="sa-salon-link-row">
                        <span>Acrylic Nail Fill</span>
                        <span className="sa-salon-price">$35+</span>
                      </a>
                    </li>
                    <li>
                      <a href="/services/classic-foot-soak-detox" className="sa-salon-link-row">
                        <span>Classic Foot Soak &amp; Detox Pedicure</span>
                        <span className="sa-salon-price">$65+</span>
                      </a>
                    </li>
                    <li>
                      <a href="/services/jelly-hydrating-foot-detox" className="sa-salon-link-row">
                        <span>Jelly Hydrating Foot Detox</span>
                        <span className="sa-salon-price">$75+</span>
                      </a>
                    </li>
                    <li>
                      <a href="/services/manicure" className="sa-salon-link-row">
                        <span>Classic &amp; Gel Manicure</span>
                        <span className="sa-salon-price">$40+</span>
                      </a>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Category 2: Hair Color, Cuts & Smoothing */}
              <div className="sa-salon-cat-card">
                <div>
                  <span
                    style={{
                      fontSize: '10.5px',
                      fontWeight: 700,
                      color: '#ff8ab8',
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                    }}
                  >
                    Dimensional Color &amp; Styling
                  </span>
                  <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#fff', margin: '4px 0 0' }}>
                    Hair Color &amp; Precision Cuts
                  </h3>
                  <ul className="sa-salon-link-list">
                    <li>
                      <a href="/services/balayage" className="sa-salon-link-row">
                        <span>Custom Lived-In Balayage</span>
                        <span className="sa-salon-price">$380+</span>
                      </a>
                    </li>
                    <li>
                      <a href="/services/highlights" className="sa-salon-link-row">
                        <span>Dimensional Foil Highlights</span>
                        <span className="sa-salon-price">$380+</span>
                      </a>
                    </li>
                    <li>
                      <a href="/services/womens-haircut" className="sa-salon-link-row">
                        <span>Women&apos;s Haircut &amp; Blowout</span>
                        <span className="sa-salon-price">$65+</span>
                      </a>
                    </li>
                    <li>
                      <a href="/services/mens-haircut" className="sa-salon-link-row">
                        <span>Men&apos;s Haircut &amp; Grooming</span>
                        <span className="sa-salon-price">$45+</span>
                      </a>
                    </li>
                    <li>
                      <a href="/services/solid-one-tone" className="sa-salon-link-row">
                        <span>Solid One-Tone Hair Color</span>
                        <span className="sa-salon-price">$120+</span>
                      </a>
                    </li>
                    <li>
                      <a href="/services/gloss" className="sa-salon-link-row">
                        <span>Hair Gloss &amp; Toner Refresh</span>
                        <span className="sa-salon-price">$65+</span>
                      </a>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Category 3: Facials & Waxing */}
              <div className="sa-salon-cat-card">
                <div>
                  <span
                    style={{
                      fontSize: '10.5px',
                      fontWeight: 700,
                      color: '#ff8ab8',
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                    }}
                  >
                    Esthetics &amp; Smooth Skin
                  </span>
                  <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#fff', margin: '4px 0 0' }}>
                    Facials &amp; Gentle Waxing
                  </h3>
                  <ul className="sa-salon-link-list">
                    <li>
                      <a href="/services/deep-cleansing-extraction-facial" className="sa-salon-link-row">
                        <span>Deep Cleansing + Extraction Facial</span>
                        <span className="sa-salon-price">$85+</span>
                      </a>
                    </li>
                    <li>
                      <a href="/services/basic-facial" className="sa-salon-link-row">
                        <span>Custom Nourishing Facial</span>
                        <span className="sa-salon-price">$75+</span>
                      </a>
                    </li>
                    <li>
                      <a href="/services/anti-aging-and-enzyme-facial" className="sa-salon-link-row">
                        <span>Anti-Aging &amp; Enzyme Facial</span>
                        <span className="sa-salon-price">$100+</span>
                      </a>
                    </li>
                    <li>
                      <a href="/services/brazilian" className="sa-salon-link-row">
                        <span>Female Brazilian Wax</span>
                        <span className="sa-salon-price">$60+</span>
                      </a>
                    </li>
                    <li>
                      <a href="/services/eyebrow-wax" className="sa-salon-link-row">
                        <span>Eyebrow Wax &amp; Shaping</span>
                        <span className="sa-salon-price">$12+</span>
                      </a>
                    </li>
                    <li>
                      <a href="/services/underarm" className="sa-salon-link-row">
                        <span>Underarm Wax</span>
                        <span className="sa-salon-price">$20+</span>
                      </a>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Category 4: Bridal & Special Events */}
              <div className="sa-salon-cat-card">
                <div>
                  <span
                    style={{
                      fontSize: '10.5px',
                      fontWeight: 700,
                      color: '#ff8ab8',
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                    }}
                  >
                    In-Studio &amp; On-Location Glam
                  </span>
                  <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#fff', margin: '4px 0 0' }}>
                    Bridal &amp; Special Events
                  </h3>
                  <ul className="sa-salon-link-list">
                    <li>
                      <a href="/special-events/weddings-bridal" className="sa-salon-link-row">
                        <span>Weddings &amp; Bridal</span>
                        <span className="sa-salon-price">Custom Quote</span>
                      </a>
                    </li>
                    <li>
                      <a href="/special-events/quinceaneras" className="sa-salon-link-row">
                        <span>Quincea&ntilde;era Glam</span>
                        <span className="sa-salon-price">Custom Quote</span>
                      </a>
                    </li>
                    <li>
                      <a href="/special-events/prom-homecoming" className="sa-salon-link-row">
                        <span>Prom &amp; Homecoming</span>
                        <span className="sa-salon-price">Custom Quote</span>
                      </a>
                    </li>
                    <li>
                      <a href="/special-events/photo-video-shoots" className="sa-salon-link-row">
                        <span>Engagement &amp; Photo Shoots</span>
                        <span className="sa-salon-price">Custom Quote</span>
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div
              style={{
                marginTop: '20px',
                paddingTop: '16px',
                borderTop: '1px solid rgba(255,255,255,0.08)',
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
              }}
            >
              <span style={{ fontSize: '13px', color: '#e2d6dc' }}>
                Walk-ins &amp; appointments welcome at <strong>935 W San Marcos Blvd, Suite 101</strong>
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                <a
                  href="/book"
                  className="btn-primary"
                  style={{ padding: '9px 18px', fontSize: '12.5px', gap: '6px' }}
                >
                  Book Salon Appointment
                </a>
                <a
                  href="/services"
                  className="btn-outline"
                  style={{ padding: '9px 16px', fontSize: '12.5px', gap: '6px' }}
                >
                  View All Services &rarr;
                </a>
              </div>
            </div>
          </div>

          {/* Local Wedding Venues Spotlight */}
          <div style={{ marginBottom: '28px' }}>
            <p className="sa-eyebrow">Local Venue Expertise</p>
            <h2 className="sa-sec-title" style={{ marginBottom: '8px' }}>
              Top Wedding Venues We Love in {area.city}
            </h2>
            <p style={{ color: '#e2d6dc', fontSize: '14px', lineHeight: 1.65, marginBottom: '18px' }}>
              Our mobile bridal team has deep experience with venue layouts, natural lighting conditions, and morning setup logistics across {area.city}.
            </p>

            <div className="sa-venue-grid">
              {area.venues.map((venue, idx) => (
                <div key={idx} className="sa-venue-card">
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '6px' }}>
                      <span
                        style={{
                          background: 'rgba(255, 45, 120, 0.14)',
                          border: '1px solid rgba(255, 107, 168, 0.3)',
                          color: '#ff8ab8',
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '3px 10px',
                          borderRadius: '6px',
                        }}
                      >
                        {venue.type}
                      </span>
                      <span style={{ fontSize: '11.5px', color: '#dfd2d9', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {venue.neighborhood}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '16.5px', fontWeight: 700, color: '#fff', margin: '0 0 8px' }}>
                      {venue.name}
                    </h3>
                    <p style={{ fontSize: '13.5px', color: '#e2d6dc', lineHeight: 1.65, margin: 0 }}>
                      {venue.description}
                    </p>
                  </div>

                  <div className="sa-tip-box">
                    <strong style={{ color: '#ff8ab8' }}>Stylist Tip:</strong> {venue.hmuaTip}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dedicated Services Provided */}
          <div style={{ marginBottom: '28px' }}>
            <p className="sa-eyebrow">Bespoke Options</p>
            <h2 className="sa-sec-title" style={{ marginBottom: '18px' }}>
              Tailored Wedding Hair &amp; Makeup Services for {area.city}
            </h2>

            <div className="sa-service-grid">
              {area.servicesProvided.map((service, idx) => (
                <div key={idx} className="sa-service-card">
                  <div>
                    <h3 style={{ fontSize: '16.5px', fontWeight: 700, color: '#fff', margin: '0 0 8px' }}>
                      {service.title}
                    </h3>
                    <p style={{ fontSize: '13.5px', color: '#e2d6dc', lineHeight: 1.65, marginBottom: '14px' }}>
                      {service.description}
                    </p>
                  </div>

                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '12px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#ff8ab8', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '8px' }}>
                      Included Features:
                    </span>
                    <ul className="sa-check-list">
                      {service.deliverables.map((item, itemIdx) => (
                        <li key={itemIdx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Custom Quote Pricing Breakdown */}
          <div className="sa-card" style={{ border: '1px solid rgba(255, 107, 168, 0.28)' }}>
            <p className="sa-eyebrow">Transparent Investment</p>
            <h2 className="sa-sec-title" style={{ marginBottom: '6px' }}>
              {area.pricingGuide.heading}
            </h2>
            <p style={{ color: '#ff8ab8', fontSize: '13.5px', fontWeight: 600, margin: '0 0 10px' }}>
              {area.pricingGuide.subheading}
            </p>
            <p style={{ fontSize: '14px', color: '#e2d6dc', lineHeight: 1.75, margin: '0 0 16px' }}>
              {area.pricingGuide.explanation}
            </p>

            {/* 4 Cost Drivers */}
            <div className="sa-driver-grid">
              {area.pricingGuide.drivers.map((driver, idx) => (
                <div key={idx} className="sa-driver-card">
                  <div className="sa-driver-num">0{idx + 1}</div>
                  <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#fff', margin: '0 0 6px' }}>
                    {driver.title}
                  </h3>
                  <p style={{ fontSize: '12.5px', color: '#dfd2d9', lineHeight: 1.55, margin: 0 }}>
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
                background: 'linear-gradient(135deg, rgba(255,45,120,0.16), rgba(30,10,24,0.88))',
                border: '1px solid rgba(255,107,168,0.35)',
              }}
            >
              <div>
                <h3 style={{ fontSize: '15.5px', fontWeight: 700, color: '#fff', margin: '0 0 4px' }}>
                  Ready for Your Personalized {area.city} Wedding Quote?
                </h3>
                <p style={{ fontSize: '13px', color: '#e2d6dc', margin: 0 }}>
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
                Request Custom Quote &rarr;
              </button>
            </div>
          </div>

          {/* Real Bride & Client Testimonials */}
          <div>
            <RealReviewsSection
              city={area.city}
              reviews={realReviews}
            />
          </div>

          {/* FAQs Accordion */}
          <div>
            <p className="sa-eyebrow">Help &amp; Logistics</p>
            <h2 className="sa-sec-title" style={{ marginBottom: '16px' }}>
              Frequently Asked Questions &bull; {area.city} Weddings
            </h2>

            <div>
              {area.faqs.map((faq, idx) => (
                <details key={idx} className="sa-faq-card">
                  <summary className="sa-faq-summary">
                    <span>{faq.question}</span>
                  </summary>
                  <div style={{ padding: '0 20px 18px', color: '#e2d6dc', fontSize: '13.5px', lineHeight: 1.75 }}>
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
                  color: '#ff8ab8',
                  textTransform: 'uppercase',
                  letterSpacing: '0.14em',
                }}
              >
                Booking Inquiries
              </span>
              <h3 style={{ fontSize: '21px', fontWeight: 800, color: '#fff', margin: '6px 0 16px' }}>
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
                  fontSize: '12.5px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
                  <span style={{ color: '#dfd2d9' }}>Coverage Area:</span>
                  <span style={{ color: '#fff', fontWeight: 600 }}>{area.city}, CA</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
                  <span style={{ color: '#dfd2d9' }}>Studio HQ Distance:</span>
                  <span style={{ color: '#ff8ab8', fontWeight: 600 }}>{area.distanceFromStudio}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
                  <span style={{ color: '#dfd2d9' }}>On-Location Travel:</span>
                  <span style={{ color: '#fff', fontWeight: 600 }}>Full Mobile Glam Squad</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
                  <span style={{ color: '#dfd2d9' }}>Pricing Model:</span>
                  <span style={{ color: '#f0c97a', fontWeight: 600 }}>Itemized Custom Quotes</span>
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
                  Get Your Custom Proposal
                </button>
                <a
                  href="/book"
                  className="btn-outline"
                  style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: '13px' }}
                >
                  Book In-Studio Trial
                </a>
              </div>

              <div style={{ textAlign: 'center' }}>
                <a
                  href="tel:7602905910"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: '#e2d6dc',
                    fontSize: '12.5px',
                    textDecoration: 'none',
                  }}
                >
                  Or call us directly at <strong>(760) 290-5910</strong>
                </a>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Cross-Linking Hub: Other San Diego Service Areas */}
      <div
        className="sa-bottom-block"
        style={{
          background: 'linear-gradient(155deg, rgba(255, 255, 255, 0.04) 0%, rgba(20, 7, 16, 0.9) 100%)',
          border: '1px solid rgba(255, 255, 255, 0.09)',
          borderRadius: '22px',
          padding: '32px 24px',
          marginBottom: '32px',
          textAlign: 'center',
        }}
      >
        <span className="sa-eyebrow" style={{ display: 'block' }}>
          Regional Coverage Network
        </span>
        <h2 className="sa-sec-title" style={{ margin: '6px 0 10px' }}>
          Explore Bridal Hair &amp; Makeup Services Across San Diego County
        </h2>
        <p style={{ color: '#e2d6dc', fontSize: '13.5px', maxWidth: '640px', margin: '0 auto 18px', lineHeight: 1.65 }}>
          We travel throughout Southern California to bring couture bridal beauty directly to your bridal suite or hotel.
        </p>

        <div className="sa-crosslink-grid">
          {ALL_SERVICE_AREA_SLUGS.map((slug) => {
            const item = SERVICE_AREAS[slug];
            const isCurrent = slug === area.slug;
            return (
              <a
                key={slug}
                href={`/service-areas/${slug}`}
                className={`sa-city-chip ${isCurrent ? 'active' : ''}`}
              >
                <span style={{ fontSize: '13px', fontWeight: 600 }}>{item.city}, CA</span>
                <span style={{ fontSize: '11px', color: '#dfd2d9', marginTop: '2px' }}>{item.region}</span>
              </a>
            );
          })}
        </div>

        <div style={{ marginTop: '16px' }}>
          <a
            href="/special-events/weddings-bridal"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              color: '#ff8ab8',
              fontSize: '13px',
              fontWeight: 700,
              textDecoration: 'none',
            }}
          >
            <span>View Full San Diego Weddings &amp; Bridal Services Page &rarr;</span>
          </a>
        </div>
      </div>

      {/* Bottom Banner CTA */}
      <div
        className="sa-bottom-block"
        style={{
          background: 'linear-gradient(135deg, rgba(255, 45, 120, 0.16) 0%, rgba(30, 10, 24, 0.92) 60%, rgba(212, 165, 116, 0.14) 100%)',
          border: '1px solid rgba(255, 107, 168, 0.35)',
          borderRadius: '26px',
          padding: '42px 24px',
          textAlign: 'center',
        }}
      >
        <h2 className="sa-sec-title" style={{ margin: '0 0 10px' }}>
          Reserve Your {area.city} Wedding Date
        </h2>
        <p style={{ color: '#e2d6dc', fontSize: '14.5px', maxWidth: '580px', margin: '0 auto 22px', lineHeight: 1.7 }}>
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
          <a
            href="/book"
            className="btn-outline"
            style={{ padding: '12px 24px', fontSize: '14px' }}
          >
            Schedule Preview Trial
          </a>
        </div>
      </div>
      </div>
    </div>
  );
}
