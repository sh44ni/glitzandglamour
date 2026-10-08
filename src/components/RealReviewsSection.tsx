import Link from 'next/link';
import { Star, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';
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
  // Grammar fix: "What Our [City] Brides & Clients Say"
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
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 18px;
          padding: 22px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          transition: transform 0.2s ease, border-color 0.2s ease;
        }
        .real-rev-card:hover {
          border-color: rgba(255, 45, 120, 0.3);
          transform: translateY(-2px);
        }
        .real-rev-cta {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: #FF2D78;
          font-size: 13px;
          font-weight: 600;
          text-decoration: none;
          transition: gap 0.2s ease, color 0.2s ease;
        }
        .real-rev-cta:hover {
          color: #ff5b97;
          gap: 10px;
        }
      `}</style>

      {/* Eyebrow */}
      <p
        style={{
          color: '#FF2D78',
          fontSize: '11px',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '2px',
          marginBottom: '6px',
        }}
      >
        {eyebrow}
      </p>

      {/* Section Heading with Fixed Grammar */}
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
                <div style={{ display: 'flex', gap: '3px' }}>
                  {[...Array(rev.rating || 5)].map((_, i) => (
                    <Star key={i} size={14} fill="#FFD700" color="#FFD700" />
                  ))}
                </div>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '10px',
                    fontWeight: 600,
                    color: '#22c55e',
                    background: 'rgba(34, 197, 94, 0.1)',
                    padding: '3px 8px',
                    borderRadius: '20px',
                    border: '1px solid rgba(34, 197, 94, 0.2)',
                  }}
                >
                  <CheckCircle2 size={11} color="#22c55e" />
                  {rev.source}
                </span>
              </div>

              {/* Authentic Client Quote */}
              <p
                style={{
                  fontSize: '13px',
                  color: '#e0e0e0',
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
                borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                paddingTop: '14px',
                marginTop: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#fff', display: 'block' }}>
                  {rev.author}
                </span>
                <span style={{ fontSize: '11px', color: '#FF6BA8' }}>
                  {rev.serviceTag}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Link to see all reviews */}
      <div style={{ textAlign: 'left', marginTop: '4px' }}>
        <Link href="/reviews" className="real-rev-cta">
          <span>Read all verified 5-star client reviews</span>
          <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}
