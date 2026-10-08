export default function SpecialEventSlugLoading() {
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px 80px' }}>
      <style>{`
        .ses-skel-pricing {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
          margin-bottom: 24px;
        }
        @media (min-width: 768px) {
          .ses-skel-pricing {
            grid-template-columns: repeat(3, 1fr);
          }
        }
        .ses-skel-influencers {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }
        @media (min-width: 768px) {
          .ses-skel-influencers {
            grid-template-columns: repeat(4, 1fr);
          }
        }
      `}</style>

      {/* Back button skeleton */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', margin: '20px 0 24px' }}>
        <div className="skeleton" style={{ width: '120px', height: '16px', borderRadius: '4px' }} />
      </div>

      {/* Hero Header Wireframe */}
      <div
        style={{
          borderRadius: '24px',
          padding: '48px 32px',
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          marginBottom: '36px',
        }}
      >
        <div className="skeleton" style={{ width: '150px', height: '24px', borderRadius: '50px', marginBottom: '16px' }} />
        <div className="skeleton" style={{ width: '65%', height: '42px', borderRadius: '10px', marginBottom: '16px' }} />
        <div className="skeleton" style={{ width: '85%', height: '18px', borderRadius: '6px', marginBottom: '10px' }} />
        <div className="skeleton" style={{ width: '60%', height: '18px', borderRadius: '6px', marginBottom: '24px' }} />
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <div className="skeleton" style={{ width: '210px', height: '46px', borderRadius: '50px' }} />
          <div className="skeleton" style={{ width: '160px', height: '46px', borderRadius: '50px' }} />
        </div>
      </div>

      {/* Services Breakdown Grid Wireframe */}
      <div style={{ marginBottom: '44px' }}>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div className="skeleton" style={{ width: '140px', height: '14px', borderRadius: '4px', margin: '0 auto 8px' }} />
          <div className="skeleton" style={{ width: '40%', height: '26px', borderRadius: '8px', margin: '0 auto' }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className="skeleton"
              style={{
                height: '130px',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.05)',
              }}
            />
          ))}
        </div>
      </div>

      {/* Pricing Guide Skeleton */}
      <div style={{ marginBottom: '44px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div className="skeleton" style={{ width: '130px', height: '14px', borderRadius: '4px', margin: '0 auto 8px' }} />
          <div className="skeleton" style={{ width: '50%', height: '28px', borderRadius: '8px', margin: '0 auto' }} />
        </div>
        <div className="ses-skel-pricing">
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

      {/* Pricing Influencers Wireframe */}
      <div style={{ marginBottom: '44px' }}>
        <div className="ses-skel-influencers">
          {[1, 2, 3, 4].map((inf) => (
            <div
              key={inf}
              className="skeleton"
              style={{
                height: '90px',
                borderRadius: '14px',
                border: '1px solid rgba(255, 255, 255, 0.04)',
              }}
            />
          ))}
        </div>
      </div>

      {/* Reviews Wireframe */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px', marginBottom: '36px' }}>
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
  );
}
