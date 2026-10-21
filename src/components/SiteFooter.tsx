'use client';

import { usePathname } from 'next/navigation';
import { ChevronRight, MapPin, Phone, Mail, Instagram, Sparkles, Clock } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

const MAIN_NAV_LINKS: [string, string][] = [
  ['/', 'Home'],
  ['/services', 'Services'],
  ['/special-events', 'Special Events'],
  ['/book', 'Book'],
  ['/gallery', 'Gallery'],
  ['/blogs', 'Blog'],
  ['/reviews', 'Reviews'],
  ['/faq', 'FAQ'],
  ['/service-areas', 'Service Areas'],
];

const POLICY_NAV_LINKS: [string, string][] = [
  ['/policy', 'Studio Policies'],
  ['/waiver', 'Liability Waiver'],
  ['/terms', 'Terms & Conditions'],
  ['/privacy', 'Privacy Policy'],
  ['/image-policy', 'Image Usage & Release Policy'],
];

const NAIL_SPA_SERVICE_LINKS: [string, string][] = [
  ['/services/gelx', 'Gel-X Nails'],
  ['/services/acrylic-set', 'Acrylic Nails'],
  ['/services/fill', 'Nail Fill'],
  ['/services/rebalance', 'Nail Rebalance'],
  ['/services/manicure', 'Gel Manicure'],
  ['/services/classic-foot-soak-detox', 'Detox Pedicure'],
  ['/services/jelly-hydrating-foot-detox', 'Jelly Foot Detox'],
];

const HAIR_SKIN_BRIDAL_LINKS: [string, string][] = [
  ['/services/balayage', 'Balayage'],
  ['/services/highlights', 'Highlights'],
  ['/services/womens-haircut', "Women's Haircut"],
  ['/services/mens-haircut', "Men's Haircut"],
  ['/services/deep-cleansing-extraction-facial', 'Deep Cleansing Facial'],
  ['/services/brazilian', 'Brazilian Wax'],
  ['/special-events/weddings-bridal', 'Wedding Hair & Makeup'],
];

const GEO_AREA_LINKS: [string, string][] = [
  ['/service-areas/san-marcos-ca', 'San Marcos'],
  ['/service-areas/vista-ca', 'Vista'],
  ['/service-areas/escondido-ca', 'Escondido'],
  ['/service-areas/carlsbad-ca', 'Carlsbad'],
  ['/service-areas/oceanside-ca', 'Oceanside'],
  ['/service-areas/encinitas-ca', 'Encinitas'],
  ['/service-areas/la-jolla-ca', 'La Jolla'],
  ['/service-areas/san-diego-ca', 'San Diego'],
];

/** Routes where the footer should be hidden */
const HIDDEN_PREFIXES = ['/admin', '/sign'];

export default function SiteFooter() {
  const { t } = useTranslation();
  const pathname = usePathname();

  // Hide footer on admin and signing pages
  if (HIDDEN_PREFIXES.some(p => pathname.startsWith(p))) return null;

  return (
    <footer
      role="contentinfo"
      itemScope
      itemType="https://schema.org/WPFooter"
      className="site-footer-v2"
    >
      <style>{`
        .site-footer-v2 {
          position: relative;
          z-index: 2;
          margin-top: 48px;
          padding: clamp(52px, 6.5vw, 80px) clamp(18px, 5vw, 64px) 104px;
          background: #10080e;
          border-top: 1.5px solid rgba(255, 45, 135, 0.38);
          border-radius: 44px 44px 0 0;
          box-shadow: 0 -20px 64px rgba(0, 0, 0, 0.65);
          overflow: hidden;
          content-visibility: auto;
          contain-intrinsic-size: auto 900px;
        }

        html.anim-ready .site-footer-v2 {
          background:
            radial-gradient(circle at 18% 0%, rgba(255, 45, 135, 0.16) 0%, transparent 48%),
            radial-gradient(circle at 85% 20%, rgba(212, 175, 55, 0.08) 0%, transparent 45%),
            linear-gradient(180deg, rgba(18, 9, 15, 0.98) 0%, rgba(8, 5, 8, 1) 100%);
        }

        .footer-top-glow {
          position: absolute;
          top: 0;
          left: 10%;
          right: 10%;
          height: 2px;
          background: linear-gradient(90deg, transparent, #ff2d87 35%, #ff85bc 50%, #ffd700 65%, transparent);
          pointer-events: none;
        }

        .footer-watermark {
          position: absolute;
          left: 50%;
          bottom: 14px;
          transform: translateX(-50%);
          font-family: 'Poppins', sans-serif;
          font-weight: 900;
          font-size: clamp(54px, 11vw, 158px);
          line-height: 0.85;
          letter-spacing: -0.05em;
          white-space: nowrap;
          color: rgba(255, 255, 255, 0.022);
          pointer-events: none;
          user-select: none;
          z-index: 0;
        }
        .footer-watermark::before {
          content: 'GLITZ & GLAMOUR';
        }

        /* Matches .section-wrap (max-width: 1180px; margin: 0 auto) in HomeClient */
        .footer-inner {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 1180px;
          margin: 0 auto;
        }

        /* 1. Top Concierge & Booking Banner Card */
        .footer-concierge-banner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          flex-wrap: wrap;
          padding: clamp(24px, 3vw, 34px) clamp(24px, 3.5vw, 38px);
          border-radius: 28px;
          background:
            radial-gradient(circle at 90% 50%, rgba(255, 45, 135, 0.22) 0%, transparent 55%),
            linear-gradient(145deg, rgba(32, 13, 24, 0.92) 0%, rgba(16, 8, 14, 0.95) 100%);
          border: 1.5px solid rgba(255, 45, 135, 0.35);
          box-shadow: 0 20px 52px rgba(0, 0, 0, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.12);
          margin-bottom: 48px;
        }

        .footer-brand-left {
          display: flex;
          align-items: center;
          gap: 18px;
          flex-wrap: wrap;
        }

        .footer-logo-badge {
          width: 62px;
          height: 62px;
          border-radius: 18px;
          background: rgba(255, 255, 255, 0.05);
          border: 1.5px solid rgba(255, 45, 135, 0.45);
          box-shadow: 0 0 24px rgba(255, 45, 135, 0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          padding: 8px;
        }

        .footer-brand-name {
          font-family: 'Poppins', sans-serif;
          font-weight: 900;
          font-size: clamp(24px, 3.2vw, 36px);
          line-height: 1.05;
          letter-spacing: -0.035em;
          background: linear-gradient(135deg, #ffffff 0%, #ffb3d5 55%, #ff2d87 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin: 0 0 5px;
        }

        .footer-tagline {
          font-family: 'Poppins', sans-serif;
          color: #d4c4cd;
          font-size: 13.5px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .footer-status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #00d478;
          box-shadow: 0 0 10px #00d478;
          display: inline-block;
        }

        .footer-cta {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          align-items: center;
        }

        .footer-btn-primary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          min-height: 48px;
          padding: 12px 26px;
          border-radius: 999px;
          background: linear-gradient(135deg, #ff2d87 0%, #d10f67 100%);
          border: 1.5px solid rgba(255, 255, 255, 0.28);
          color: #ffffff;
          font-family: 'Poppins', sans-serif;
          font-weight: 700;
          font-size: 14px;
          text-decoration: none;
          box-shadow: 0 10px 26px rgba(255, 45, 135, 0.35);
          transition: transform 0.18s ease, box-shadow 0.18s ease;
          white-space: nowrap;
        }

        .footer-btn-primary:hover {
          transform: translate(-2px, -2px);
          box-shadow: 5px 5px 0 #ffffff, 0 12px 30px rgba(255, 45, 135, 0.45);
        }

        .footer-btn-outline {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          min-height: 48px;
          padding: 12px 24px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.05);
          border: 1.5px solid rgba(255, 255, 255, 0.22);
          color: #ffffff;
          font-family: 'Poppins', sans-serif;
          font-weight: 700;
          font-size: 14px;
          cursor: pointer;
          transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
          white-space: nowrap;
        }

        .footer-btn-outline:hover {
          border-color: #ff2d87;
          transform: translate(-2px, -2px);
          box-shadow: 5px 5px 0 #ff2d87;
        }

        /* 2. 5-Column Single-List Directory Grid (Zero nested sub-columns) */
        .footer-directory-grid {
          display: grid;
          grid-template-columns: 1.45fr 1fr 1.05fr 0.9fr 0.9fr;
          gap: 28px;
          align-items: start;
          padding-bottom: 40px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        @media (max-width: 1080px) {
          .footer-directory-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 32px 24px;
          }
          .footer-col-contact {
            grid-column: span 3;
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
          }
          .footer-col-contact .footer-col-title {
            grid-column: span 2;
            margin-bottom: 4px;
          }
        }

        .footer-col-title {
          font-family: 'Poppins', sans-serif;
          color: #ff85bc;
          font-size: 11.5px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.11em;
          margin: 0 0 18px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .footer-col-title::before {
          content: '';
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #ff2d87;
          box-shadow: 0 0 8px #ff2d87;
          flex-shrink: 0;
        }

        /* Contact Cards Stack */
        .footer-contact-stack {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .footer-contact-card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 13px;
          border-radius: 14px;
          background: rgba(255, 255, 255, 0.035);
          border: 1px solid rgba(255, 255, 255, 0.1);
          font-family: 'Poppins', sans-serif;
          color: #f0e6ec;
          font-size: 13px;
          font-weight: 600;
          text-decoration: none;
          transition: transform 0.18s ease, border-color 0.18s ease, background 0.18s ease, box-shadow 0.18s ease;
        }

        .footer-contact-card:hover {
          background: rgba(255, 45, 135, 0.12);
          border-color: rgba(255, 45, 135, 0.5);
          color: #ffffff;
          transform: translateX(4px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.35);
        }

        .footer-contact-icon {
          width: 34px;
          height: 34px;
          border-radius: 10px;
          background: rgba(255, 45, 135, 0.15);
          border: 1px solid rgba(255, 45, 135, 0.38);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .footer-contact-meta {
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        .footer-contact-label {
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: #a6939e;
          line-height: 1.2;
        }

        .footer-contact-val {
          font-size: 12.5px;
          font-weight: 600;
          color: #f5edf1;
          line-height: 1.35;
        }

        /* Clean Single-Column Link Lists */
        .footer-link-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
          align-items: flex-start;
        }

        .footer-dir-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 3px 0;
          font-family: 'Poppins', sans-serif;
          color: #d2c4cc;
          font-size: 13.5px;
          font-weight: 500;
          line-height: 1.4;
          text-decoration: none;
          transition: color 0.18s ease, transform 0.18s ease;
        }

        .footer-dir-link:hover {
          color: #ffffff;
          transform: translateX(4px);
        }

        .footer-dir-link.is-accent {
          color: #ff85bc;
          font-weight: 700;
          margin-top: 2px;
        }

        .footer-dir-link.is-accent:hover {
          color: #ff2d87;
        }

        /* 3. Accepted Payments & Studio Hours Bar */
        .footer-payments-bar {
          padding: 22px 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
        }

        .footer-payments {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 8px;
        }

        .footer-pay-label {
          font-family: 'Poppins', sans-serif;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #9e8d96;
          margin-right: 4px;
        }

        .footer-pay-chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          min-height: 34px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.14);
          border-radius: 999px;
          padding: 5px 13px;
          font-family: 'Poppins', sans-serif;
          color: #ece2e8;
          font-size: 12px;
          font-weight: 600;
          text-decoration: none;
          transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
        }

        a.footer-pay-chip:hover {
          border-color: #ff2d87;
          transform: translate(-2px, -2px);
          box-shadow: 3px 3px 0 #ff2d87;
        }

        .footer-hours-pill {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 6px 14px;
          border-radius: 999px;
          background: rgba(255, 45, 135, 0.08);
          border: 1px solid rgba(255, 45, 135, 0.28);
          font-family: 'Poppins', sans-serif;
          font-size: 12px;
          font-weight: 600;
          color: #e8dae2;
        }

        /* 4. Bottom Legal, Client Policies & Attribution Bar */
        .footer-legal-bar {
          padding-top: 22px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px 24px;
          flex-wrap: wrap;
        }

        .footer-copyright {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 8px;
          font-family: 'Poppins', sans-serif;
          color: #b5a4ae;
          font-size: 12.5px;
        }

        .footer-copyright a {
          color: #ff6ba8;
          font-weight: 700;
          text-decoration: none;
        }

        .footer-copyright a:hover {
          text-decoration: underline;
        }

        .footer-policy-links {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 6px 16px;
        }

        .footer-policy-link {
          font-family: 'Poppins', sans-serif;
          color: #b5a4ae;
          font-size: 12px;
          font-weight: 500;
          text-decoration: none;
          transition: color 0.18s ease;
        }

        .footer-policy-link:hover {
          color: #ffffff;
        }

        @media (max-width: 680px) {
          .site-footer-v2 {
            padding: 32px 16px 110px;
            border-radius: 32px 32px 0 0;
            margin-top: 32px;
          }
          .footer-concierge-banner {
            padding: 20px 16px;
            gap: 16px;
            margin-bottom: 24px;
            border-radius: 22px;
          }
          .footer-brand-left {
            flex-wrap: nowrap;
            align-items: center;
            gap: 14px;
            width: 100%;
          }
          .footer-logo-badge {
            width: 52px;
            height: 52px;
            border-radius: 15px;
            padding: 6px;
          }
          .footer-brand-name {
            font-size: 22px;
            margin-bottom: 3px;
          }
          .footer-tagline {
            font-size: 12px;
            gap: 6px;
          }
          .footer-cta {
            width: 100%;
            display: grid;
            grid-template-columns: 1fr;
            gap: 10px;
          }
          .footer-btn-primary,
          .footer-btn-outline {
            width: 100%;
            min-height: 44px;
            padding: 10px 16px;
            font-size: 13.5px;
            box-sizing: border-box;
          }
          .footer-directory-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 12px;
            padding-bottom: 22px;
          }
          .footer-col-contact {
            grid-column: span 2;
            display: block;
          }
          .footer-col-contact .footer-col-title {
            margin-bottom: 12px;
          }
          .footer-contact-stack {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 8px;
          }
          .footer-contact-stack > .footer-contact-card:first-child {
            grid-column: span 3;
          }
          .footer-contact-stack > .footer-contact-card:not(:first-child) {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
            padding: 11px 10px;
            min-width: 0;
            overflow: hidden;
          }
          .footer-contact-stack > .footer-contact-card:not(:first-child) .footer-contact-meta {
            width: 100%;
            min-width: 0;
            overflow: hidden;
          }
          .footer-contact-stack > .footer-contact-card:not(:first-child) .footer-contact-icon {
            width: 30px;
            height: 30px;
            border-radius: 9px;
          }
          .footer-contact-stack > .footer-contact-card:not(:first-child) .footer-contact-label {
            font-size: 9px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            max-width: 100%;
          }
          .footer-contact-stack > .footer-contact-card:not(:first-child) .footer-contact-val {
            font-size: 10.5px;
            letter-spacing: -0.02em;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            max-width: 100%;
          }
          .footer-directory-grid > div:not(.footer-col-contact),
          .footer-directory-grid > nav {
            background: rgba(255, 255, 255, 0.025);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 18px;
            padding: 15px 13px;
            height: 100%;
            box-sizing: border-box;
          }
          .footer-col-title {
            font-size: 10.5px;
            margin: 0 0 11px;
            letter-spacing: 0.08em;
          }
          .footer-link-list {
            gap: 6px;
          }
          .footer-dir-link {
            font-size: 12.5px;
            padding: 2px 0;
          }
          .footer-payments-bar {
            padding: 18px 0;
            flex-direction: column;
            align-items: center;
            gap: 12px;
          }
          .footer-payments {
            justify-content: center;
            width: 100%;
            gap: 7px;
          }
          .footer-pay-label {
            width: 100%;
            text-align: center;
            margin-right: 0;
            margin-bottom: 2px;
          }
          .footer-pay-chip {
            padding: 4px 11px;
            font-size: 11.5px;
            min-height: 31px;
          }
          .footer-hours-pill {
            width: 100%;
            justify-content: center;
            box-sizing: border-box;
          }
          .footer-legal-bar {
            padding-top: 18px;
            flex-direction: column;
            align-items: center;
            text-align: center;
            gap: 12px;
          }
          .footer-copyright {
            justify-content: center;
            font-size: 11.5px;
          }
          .footer-policy-links {
            justify-content: center;
            gap: 6px 12px;
          }
          .footer-policy-link {
            font-size: 11.5px;
          }
        }
      `}</style>

      <div className="footer-top-glow" aria-hidden="true" />
      <div className="footer-watermark" aria-hidden="true" />

      <div className="footer-inner">
        {/* 1. Top Concierge & Booking Banner Card */}
        <div className="footer-concierge-banner">
          <div className="footer-brand-left">
            <div className="footer-logo-badge" aria-hidden="true">
              <img src="/logo-sm.webp" alt="" width={44} height={44} loading="lazy" decoding="async" style={{ objectFit: 'contain' }} />
            </div>
            <div>
              <div className="footer-brand-name">Glitz &amp; Glamour</div>
              <div className="footer-tagline">
                <span className="footer-status-dot" aria-hidden="true" />
                <span>By JoJany Lavalle · San Marcos, CA 92078</span>
              </div>
            </div>
          </div>

          <div className="footer-cta">
            <a href="/book" className="footer-btn-primary">
              {t('common.bookAppointment')} <ChevronRight size={15} />
            </a>
            <button
              type="button"
              data-open-quote="true"
              className="footer-btn-outline"
            >
              <Sparkles size={14} color="#ff85bc" />
              Request Custom Quote
            </button>
          </div>
        </div>

        {/* 2. 5-Column Single-List Directory Grid */}
        <div className="footer-directory-grid">
          {/* Column 1: Flagship Studio & Direct Contact */}
          <div className="footer-col-contact">
            <p className="footer-col-title">Flagship Studio &amp; Contact</p>
            <div className="footer-contact-stack">
              <a
                className="footer-contact-card"
                href="https://maps.google.com/?q=935+W+San+Marcos+Blvd+Suite+101+San+Marcos+CA"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="footer-contact-icon" aria-hidden="true">
                  <MapPin size={16} color="#FF2D78" />
                </span>
                <span className="footer-contact-meta">
                  <span className="footer-contact-label" aria-hidden="true">San Marcos Studio</span>
                  <span className="footer-contact-val">935 W San Marcos Blvd, Suite 101, San Marcos, CA 92078</span>
                </span>
              </a>

              <a
                className="footer-contact-card"
                href="tel:+17602905910"
              >
                <span className="footer-contact-icon" aria-hidden="true">
                  <Phone size={15} color="#FF2D78" />
                </span>
                <span className="footer-contact-meta">
                  <span className="footer-contact-label" aria-hidden="true">Call or Text</span>
                  <span className="footer-contact-val">(760) 290-5910</span>
                </span>
              </a>

              <a
                className="footer-contact-card"
                href="mailto:info@glitzandglamours.com"
              >
                <span className="footer-contact-icon" aria-hidden="true">
                  <Mail size={15} color="#FF2D78" />
                </span>
                <span className="footer-contact-meta">
                  <span className="footer-contact-label" aria-hidden="true">Concierge Email</span>
                  <span className="footer-contact-val">Email Us</span>
                </span>
              </a>

              <a
                className="footer-contact-card"
                href="https://www.instagram.com/glitzandglamourstudio/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="footer-contact-icon" aria-hidden="true">
                  <Instagram size={15} color="#FF2D78" />
                </span>
                <span className="footer-contact-meta">
                  <span className="footer-contact-label" aria-hidden="true">@glitzandglamourstudio</span>
                  <span className="footer-contact-val">Follow Us</span>
                </span>
              </a>
            </div>
          </div>

          {/* Column 2: Nail & Pedicure Services */}
          <div>
            <p className="footer-col-title">Nails &amp; Pedicures</p>
            <div className="footer-link-list">
              {NAIL_SPA_SERVICE_LINKS.map(([href, label]) => (
                <a key={href} href={href} className="footer-dir-link">
                  <span>{label}</span>
                </a>
              ))}
              <a href="/services#nails" className="footer-dir-link is-accent">
                <span>All Nail Services</span>
                <ChevronRight size={13} aria-hidden="true" />
              </a>
            </div>
          </div>

          {/* Column 3: Hair, Facial, Wax & Bridal Services */}
          <div>
            <p className="footer-col-title">Hair, Skin &amp; Bridal</p>
            <div className="footer-link-list">
              {HAIR_SKIN_BRIDAL_LINKS.map(([href, label]) => (
                <a key={href} href={href} className="footer-dir-link">
                  <span>{label}</span>
                </a>
              ))}
              <a href="/services" className="footer-dir-link is-accent">
                <span>Full Salon Menu</span>
                <ChevronRight size={13} aria-hidden="true" />
              </a>
            </div>
          </div>

          {/* Column 4: Service Areas */}
          <div>
            <p className="footer-col-title">Service Areas</p>
            <div className="footer-link-list">
              {GEO_AREA_LINKS.map(([href, label]) => (
                <a key={href} href={href} className="footer-dir-link">
                  <span>{label}</span>
                </a>
              ))}
              <a href="/service-areas" className="footer-dir-link is-accent">
                <span>All Service Areas</span>
                <ChevronRight size={13} aria-hidden="true" />
              </a>
            </div>
          </div>

          {/* Column 5: Studio Directory */}
          <nav aria-label="Footer navigation">
            <p className="footer-col-title">Studio Directory</p>
            <div className="footer-link-list">
              {MAIN_NAV_LINKS.map(([href, label]) => (
                <a key={href} href={href} className="footer-dir-link">
                  <span>{label}</span>
                </a>
              ))}
            </div>
          </nav>
        </div>

        {/* 3. Accepted Payments & Studio Hours Bar */}
        <div className="footer-payments-bar">
          <div className="footer-payments">
            <span className="footer-pay-label" aria-hidden="true">Accepted In-Studio:</span>
            <div className="footer-pay-chip">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#00D478" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="20" height="12" rx="2" /><circle cx="12" cy="12" r="2" /><path d="M6 12h.01M18 12h.01" /></svg>
              Cash
            </div>
            <a className="footer-pay-chip" href="https://venmo.com/glitzandglamours" target="_blank" rel="noopener noreferrer">
              <svg width="14" height="14" viewBox="0 0 512 512" fill="#008CFF"><path d="M444.17,32H70.28C49.85,32,32,46.7,32,66.89V441.6C32,461.91,49.85,480,70.28,480H444.06C464.6,480,480,461.8,480,441.61V66.89C480.12,46.7,464.6,32,444.17,32ZM278,387H174.32L132.75,138.44l90.75-8.62,22,176.87c20.53-33.45,45.88-86,45.88-121.87,0-19.62-3.36-33-8.61-44L365.4,124.1c9.56,15.78,13.86,32,13.86,52.57C379.25,242.17,323.34,327.26,278,387Z" /></svg>
              @glitzandglamours
            </a>
            <a className="footer-pay-chip" href="https://enroll.zellepay.com/qr-codes?data=eyJ0b2tlbiI6ImpvamFueWxhdmFsbGVAaWNsb3VkLmNvbSIsIm5hbWUiOiJKT0pBTlkifQ==" target="_blank" rel="noopener noreferrer">
              <svg width="16" height="16" viewBox="0 0 48 48"><path fill="#752EE1" d="M35,42H13c-3.866,0-7-3.134-7-7V13c0-3.866,3.134-7,7-7h22c3.866,0,7,3.134,7,7v22C42,38.866,38.866,42,35,42z" /><path fill="#fff" d="M17.5,18.5h14c0.552,0,1-0.448,1-1V15c0-0.552-0.448-1-1-1h-14c-0.552,0-1,0.448-1,1v2.5C16.5,18.052,16.948,18.5,17.5,18.5z" /><path fill="#fff" d="M17,34.5h14.5c0.552,0,1-0.448,1-1V31c0-0.552-0.448-1-1-1H17c-0.552,0-1,0.448-1,1v2.5C16,34.052,16.448,34.5,17,34.5z" /><path fill="#fff" d="M16.578,30.938H22l10.294-12.839c0.178-0.222,0.019-0.552-0.266-0.552H26.5L16.275,30.298C16.065,30.553,16.247,30.938,16.578,30.938z" /></svg>
              Zelle
            </a>
            <a className="footer-pay-chip" href="https://cash.app/$glitzandglamours" target="_blank" rel="noopener noreferrer">
              <svg width="14" height="14" viewBox="0 0 32 32" fill="#00D632"><path d="M31.453 4.625c-0.688-1.891-2.177-3.375-4.068-4.063-1.745-0.563-3.333-0.563-6.557-0.563h-9.682c-3.198 0-4.813 0-6.531 0.531-1.896 0.693-3.385 2.188-4.068 4.083-0.547 1.734-0.547 3.333-0.547 6.531v9.693c0 3.214 0 4.802 0.531 6.536 0.688 1.891 2.177 3.375 4.068 4.063 1.734 0.547 3.333 0.547 6.536 0.547h9.703c3.214 0 4.813 0 6.536-0.531 1.896-0.688 3.391-2.182 4.078-4.078 0.547-1.734 0.547-3.333 0.547-6.536v-9.667c0-3.214 0-4.813-0.547-6.547zM23.229 10.802l-1.245 1.24c-0.25 0.229-0.635 0.234-0.891 0.010-1.203-1.010-2.724-1.568-4.292-1.573-1.297 0-2.589 0.427-2.589 1.615 0 1.198 1.385 1.599 2.984 2.198 2.802 0.938 5.12 2.109 5.12 4.854 0 2.99-2.318 5.042-6.104 5.266l-0.349 1.604c-0.063 0.302-0.328 0.516-0.635 0.516h-2.391l-0.12-0.010c-0.354-0.078-0.578-0.432-0.505-0.786l0.375-1.693c-1.438-0.359-2.76-1.083-3.844-2.094v-0.016c-0.25-0.25-0.25-0.656 0-0.906l1.333-1.292c0.255-0.234 0.646-0.234 0.896 0 1.214 1.146 2.839 1.786 4.521 1.76 1.734 0 2.891-0.734 2.891-1.896s-1.172-1.464-3.385-2.292c-2.349-0.839-4.573-2.026-4.573-4.802 0-3.224 2.677-4.797 5.854-4.943l0.333-1.641c0.063-0.302 0.333-0.516 0.641-0.51h2.37l0.135 0.016c0.344 0.078 0.573 0.411 0.495 0.76l-0.359 1.828c1.198 0.396 2.333 1.026 3.302 1.849l0.031 0.031c0.25 0.266 0.25 0.667 0 0.906z" /></svg>
              $glitzandglamours
            </a>
            <div className="footer-pay-chip">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.918 3.757 7.076c0 4.257 2.636 5.934 6.894 7.392 2.718 1.05 3.654 1.748 3.654 2.813 0 1.012-.873 1.644-2.473 1.644-2.013 0-5.028-.876-7.066-2.152L3.886 22.3C5.645 23.39 8.733 24 11.562 24c2.63 0 4.773-.632 6.286-1.818 1.647-1.293 2.494-3.178 2.494-5.468.006-4.36-2.695-6.073-6.366-7.564z" fill="#635BFF"/></svg>
              Stripe
            </div>
          </div>

          <div className="footer-hours-pill">
            <Clock size={13} color="#ff85bc" aria-hidden="true" />
            <span>Mon–Fri 9am–6pm · Sat 9am–4pm</span>
          </div>
        </div>

        {/* 4. Bottom Legal, Client Policies & Attribution Bar */}
        <div className="footer-legal-bar">
          <div className="footer-copyright">
            <span>© {new Date().getFullYear()} Glitz &amp; Glamour Studio · San Marcos, CA 92078</span>
            <span aria-hidden="true">·</span>
            <span>
              Powered by <a href="https://projektsvision.com" rel="noopener noreferrer" target="_blank">PROJEKTS</a>
            </span>
          </div>

          <div className="footer-policy-links">
            {POLICY_NAV_LINKS.map(([href, label]) => (
              <a key={href} href={href} className="footer-policy-link">
                {label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
