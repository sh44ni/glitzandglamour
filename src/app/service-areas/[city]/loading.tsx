export default function ServiceAreaCityLoading() {
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px 80px' }}>
      <style>{`
        .sa-skel-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 24px;
          margin-bottom: 48px;
        }
        @media (min-width: 900px) {
          .sa-skel-grid {
            grid-template-columns: 1.6fr 1fr;
          }
        }
        .sa-skel-stats {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
          margin: 32px 0 40px;
        }
        @media (min-width: 768px) {
          .sa-skel-stats {
            grid-template-columns: repeat(4, 1fr);
          }
        }
        .sa-skel-pricing {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
        }
        @media (min-width: 768px) {
          .sa-skel-pricing {
            grid-template-columns: repeat(3, 1fr);
          }
        }
        .sa-skel-reviews {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
        }
        @media (min-width: 768px) {
          .sa-skel-reviews {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>

      {/* Breadcrumbs skeleton */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', margin: '20px 0 24px' }}>
        <div className="skeleton" style={{ width: '50px', height: '14px', borderRadius: '4px' }} />
        <span style={{ color: '#444' }}>/</span>
        <div className="skeleton" style={{ width: '80px', height: '14px', borderRadius: '4px' }} />
        <span style={{ color: '#444' }}>/</span>
        <div className="skeleton" style={{ width: '110px', height: '14px', borderRadius: '4px' }} />
      </div>

      {/* Hero Section Wireframe */}
      <div
        style={{
          borderRadius: '24px',
          padding: '48px 32px',
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          position: 'relative',
          overflow: 'hidden',
          marginBottom: '32px',
        }}
      >
        {/* Badge */}
        <div className="skeleton" style={{ width: '170px', height: '24px', borderRadius: '50px', marginBottom: '20px' }} />
        {/* H1 Title */}
        <div className="skeleton" style={{ width: '68%', height: '42px', borderRadius: '10px', marginBottom: '16px' }} />
        {/* Tagline */}
        <div className="skeleton" style={{ width: '88%', height: '20px', borderRadius: '6px', marginBottom: '10px' }} />
        <div className="skeleton" style={{ width: '55%', height: '20px', borderRadius: '6px', marginBottom: '28px' }} />
        {/* CTA Buttons */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '24px' }}>
          <div className="skeleton" style={{ width: '220px', height: '46px', borderRadius: '50px' }} />
          <div className="skeleton" style={{ width: '160px', height: '46px', borderRadius: '50px' }} />
        </div>
        {/* Proximity Pill */}
        <div className="skeleton" style={{ width: '310px', height: '28px', borderRadius: '50px' }} />
      </div>

      {/* 4 Stats Cards */}
      <div className="sa-skel-stats">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="skeleton"
            style={{
              height: '84px',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.04)',
            }}
          />
        ))}
      </div>

      {/* 2-Column Main Content Wireframe */}
      <div className="sa-skel-grid">
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div
            style={{
              padding: '28px',
              borderRadius: '20px',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
            }}
          >
            <div className="skeleton" style={{ width: '140px', height: '14px', borderRadius: '4px', marginBottom: '14px' }} />
            <div className="skeleton" style={{ width: '55%', height: '26px', borderRadius: '8px', marginBottom: '18px' }} />
            <div className="skeleton" style={{ width: '100%', height: '16px', borderRadius: '4px', marginBottom: '10px' }} />
            <div className="skeleton" style={{ width: '96%', height: '16px', borderRadius: '4px', marginBottom: '10px' }} />
            <div className="skeleton" style={{ width: '80%', height: '16px', borderRadius: '4px' }} />
          </div>

          <div
            style={{
              padding: '28px',
              borderRadius: '20px',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
            }}
          >
            <div className="skeleton" style={{ width: '180px', height: '22px', borderRadius: '8px', marginBottom: '20px' }} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
              {[1, 2, 3, 4].map((j) => (
                <div key={j} className="skeleton" style={{ height: '70px', borderRadius: '12px' }} />
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Venue Highlights */}
        <div>
          <div
            style={{
              padding: '24px',
              borderRadius: '20px',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
            }}
          >
            <div className="skeleton" style={{ width: '70%', height: '20px', borderRadius: '6px', marginBottom: '20px' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {[1, 2, 3].map((k) => (
                <div key={k} className="skeleton" style={{ height: '100px', borderRadius: '14px' }} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Guide Skeleton */}
      <div style={{ marginBottom: '48px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div className="skeleton" style={{ width: '120px', height: '14px', borderRadius: '4px', margin: '0 auto 10px' }} />
          <div className="skeleton" style={{ width: '45%', height: '28px', borderRadius: '8px', margin: '0 auto' }} />
        </div>
        <div className="sa-skel-pricing">
          {[1, 2, 3].map((p) => (
            <div
              key={p}
              className="skeleton"
              style={{
                height: '220px',
                borderRadius: '18px',
                border: '1px solid rgba(255, 255, 255, 0.05)',
              }}
            />
          ))}
        </div>
      </div>

      {/* Reviews Wireframe */}
      <div style={{ marginBottom: '40px' }}>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div className="skeleton" style={{ width: '260px', height: '24px', borderRadius: '6px', margin: '0 auto' }} />
        </div>
        <div className="sa-skel-reviews">
          {[1, 2].map((r) => (
            <div
              key={r}
              className="skeleton"
              style={{
                height: '140px',
                borderRadius: '18px',
                border: '1px solid rgba(255, 255, 255, 0.05)',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
