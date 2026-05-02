import Link from 'next/link';

const LINKS = [
  { label: 'Services', href: '/services' },
  { label: 'Special Events', href: '/special-events' },
  { label: 'Book Now', href: '/book' },
  { label: 'Gallery', href: '/gallery' },
  { label: 'Blog', href: '/blogs' },
  { label: 'Reviews', href: '/reviews' },
  { label: 'FAQ', href: '/faq' },
];

const LEGAL = [
  { label: 'Policies', href: '/policy' },
  { label: 'Privacy', href: '/privacy' },
  { label: 'Terms', href: '/terms' },
  { label: 'Waiver', href: '/waiver' },
];

export default function SiteFooter() {
  return (
    <footer
      style={{
        width: '100%',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        background: 'rgba(0,0,0,0.35)',
        backdropFilter: 'blur(16px)',
        padding: '40px 20px 100px',
        marginTop: '60px',
        position: 'relative',
        zIndex: 2,
      }}
    >
      <div
        style={{
          maxWidth: '980px',
          margin: '0 auto',
          display: 'grid',
          gap: '28px',
        }}
      >
        {/* Brand */}
        <div style={{ textAlign: 'center' }}>
          <p
            style={{
              fontFamily: 'Poppins, sans-serif',
              fontWeight: 900,
              fontSize: '18px',
              background: 'linear-gradient(135deg, #FF2D78, #FF6BA8)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              marginBottom: '4px',
            }}
          >
            Glitz & Glamour Studio
          </p>
          <p
            style={{
              fontFamily: 'Poppins, sans-serif',
              color: '#777',
              fontSize: '12px',
              lineHeight: 1.6,
              maxWidth: '400px',
              margin: '0 auto',
            }}
          >
            Premium nail, hair & beauty services in Vista, CA — serving North County San Diego. By appointment only.
          </p>
        </div>

        {/* Main links */}
        <nav
          aria-label="Footer navigation"
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '8px 16px',
          }}
        >
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              style={{
                fontFamily: 'Poppins, sans-serif',
                fontSize: '13px',
                fontWeight: 600,
                color: '#bbb',
                textDecoration: 'none',
                transition: 'color 0.2s',
              }}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Legal links */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '8px 16px',
          }}
        >
          {LEGAL.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              style={{
                fontFamily: 'Poppins, sans-serif',
                fontSize: '11px',
                color: '#555',
                textDecoration: 'none',
                transition: 'color 0.2s',
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Contact + location */}
        <div
          style={{
            textAlign: 'center',
            fontFamily: 'Poppins, sans-serif',
            fontSize: '11px',
            color: '#555',
            lineHeight: 1.8,
          }}
        >
          <p style={{ margin: 0 }}>
            812 Frances Dr, Vista, CA 92084 ·{' '}
            <a href="tel:+17602905910" style={{ color: '#FF2D78', textDecoration: 'none' }}>
              (760) 290-5910
            </a>
          </p>
          <p style={{ margin: 0 }}>
            Mon–Fri 9am–6pm · Sat 9am–4pm ·{' '}
            <a
              href="https://www.instagram.com/glitzandglamourstudio/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#FF2D78', textDecoration: 'none' }}
            >
              @glitzandglamourstudio
            </a>
          </p>
        </div>

        {/* Copyright */}
        <p
          style={{
            textAlign: 'center',
            fontFamily: 'Poppins, sans-serif',
            fontSize: '10px',
            color: '#333',
            margin: 0,
          }}
        >
          © {new Date().getFullYear()} Glitz & Glamour Studio. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
