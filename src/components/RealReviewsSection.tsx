import type { RealReviewItem } from '@/lib/realReviews';

interface RealReviewsSectionProps {
  title?: string;
  city?: string;
  eyebrow?: string;
  reviews: RealReviewItem[];
}

export default function RealReviewsSection({
  title,
  city,
  eyebrow = 'Real Brides & Clients',
  reviews,
}: RealReviewsSectionProps) {
  const defaultTitle = city
    ? `What Our ${city} Brides & Clients Say`
    : 'What Our Brides & Clients Say';
  const headingText = title || defaultTitle;

  return (
    <div style={{ marginBottom: '32px' }}>
      <style>{`
        .real-rev-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 16px;
          margin-bottom: 18px;
        }
        .real-rev-card {
          background: linear-gradient(155deg, rgba(32, 15, 26, 0.82), rgba(14, 7, 12, 0.92));
          border: 1px solid rgba(255, 255, 255, 0.09);
          border-radius: 20px;
          padding: 22px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          transition: transform 0.2s ease, border-color 0.2s ease;
        }
        .real-rev-card:hover {
          border-color: rgba(255, 130, 180, 0.38);
          transform: translateY(-2px);
        }
        .real-rev-cta {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 0;
          min-height: 32px;
          color: #ff7aae;
          font-size: 13px;
          font-weight: 700;
          text-decoration: none;
          transition: gap 0.2s ease, color 0.2s ease;
        }
        .real-rev-cta:hover {
          color: #ff9ec2;
          gap: 10px;
        }
      `}</style>

      {/* Eyebrow */}
      <p
        style={{
          color: '#ff8ab8',
          fontSize: '11px',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '2px',
          marginBottom: '6px',
        }}
      >
        {eyebrow}
      </p>

      {/* Section Heading */}
      <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#fff', margin: '0 0 16px' }}>
        {headingText}
      </h2>

      {/* 2 Filtered Reviews Grid */}
      <div className="real-rev-grid">
        {reviews.map((rev) => (
          <div key={rev.id} className="real-rev-card">
            <div>
              {/* 5 Stars + Verified Badge */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '12px',
                }}
              >
                <div style={{ display: 'flex', gap: '3px' }} role="img" aria-label={`${rev.rating || 5} out of 5 stars`}>
                  <svg width="82" height="14" viewBox="0 0 82 14" fill="none" aria-hidden="true">
                    <path d="M7 1l1.8 3.6L13 5.2l-3 2.9.7 4.1L7 10.3 3.3 12.2 4 8.1 1 5.2l4.2-.6L7 1z" fill="#FFD700" />
                    <path d="M24 1l1.8 3.6L30 5.2l-3 2.9.7 4.1-3.7-1.9-3.7 1.9.7-4.1-3-2.9 4.2-.6L24 1z" fill="#FFD700" />
                    <path d="M41 1l1.8 3.6L47 5.2l-3 2.9.7 4.1-3.7-1.9-3.7 1.9.7-4.1-3-2.9 4.2-.6L41 1z" fill="#FFD700" />
                    <path d="M58 1l1.8 3.6L64 5.2l-3 2.9.7 4.1-3.7-1.9-3.7 1.9.7-4.1-3-2.9 4.2-.6L58 1z" fill="#FFD700" />
                    <path d="M75 1l1.8 3.6L81 5.2l-3 2.9.7 4.1-3.7-1.9-3.7 1.9.7-4.1-3-2.9 4.2-.6L75 1z" fill="#FFD700" />
                  </svg>
                </div>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '10.5px',
                    fontWeight: 700,
                    color: '#4ade80',
                    background: 'rgba(34, 197, 94, 0.12)',
                    padding: '3px 9px',
                    borderRadius: '20px',
                    border: '1px solid rgba(74, 222, 128, 0.28)',
                  }}
                >
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                  {rev.source}
                </span>
              </div>

              {/* Authentic Client Quote */}
              <p
                style={{
                  fontSize: '13.5px',
                  color: '#f0e4ea',
                  fontStyle: 'italic',
                  lineHeight: 1.7,
                  margin: 0,
                }}
              >
                &ldquo;{rev.quote}&rdquo;
              </p>
            </div>

            {/* Author Name & Service Tag */}
            <div
              style={{
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                paddingTop: '14px',
                marginTop: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <span style={{ fontSize: '13.5px', fontWeight: 700, color: '#fff', display: 'block' }}>
                  {rev.author}
                </span>
                <span style={{ fontSize: '11.5px', color: '#ff8ab8', fontWeight: 600 }}>
                  {rev.serviceTag}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Link to see all reviews */}
      <div style={{ textAlign: 'left', marginTop: '4px' }}>
        <a href="/reviews" className="real-rev-cta">
          <span>Read all verified 5-star client reviews</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        </a>
      </div>
    </div>
  );
}
