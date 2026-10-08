export default function ServiceAreasLoading() {
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px 80px' }}>
      <style>{`
        .sas-skel-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 20px;
          margin-bottom: 48px;
        }
        @media (min-width: 640px) {
          .sas-skel-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (min-width: 1024px) {
          .sas-skel-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }
      `}</style>

      {/* Hero Skeleton */}
      <div
        style={{
          borderRadius: '24px',
          padding: '48px 32px',
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          textAlign: 'center',
          margin: '24px 0 40px',
        }}
      >
        <div className="skeleton" style={{ width: '130px', height: '24px', borderRadius: '50px', margin: '0 auto 16px' }} />
        <div className="skeleton" style={{ width: '60%', height: '40px', borderRadius: '10px', margin: '0 auto 16px' }} />
        <div className="skeleton" style={{ width: '75%', height: '18px', borderRadius: '6px', margin: '0 auto 10px' }} />
        <div className="skeleton" style={{ width: '50%', height: '18px', borderRadius: '6px', margin: '0 auto 28px' }} />
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <div className="skeleton" style={{ width: '180px', height: '44px', borderRadius: '50px' }} />
          <div className="skeleton" style={{ width: '140px', height: '44px', borderRadius: '50px' }} />
        </div>
      </div>

      {/* 5 City Cards Grid */}
      <div className="sas-skel-grid">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            style={{
              borderRadius: '20px',
              padding: '24px',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
            }}
          >
            <div className="skeleton" style={{ width: '45%', height: '24px', borderRadius: '6px' }} />
            <div className="skeleton" style={{ width: '30%', height: '14px', borderRadius: '4px' }} />
            <div className="skeleton" style={{ width: '100%', height: '50px', borderRadius: '8px' }} />
            <div className="skeleton" style={{ width: '100%', height: '38px', borderRadius: '50px', marginTop: 'auto' }} />
          </div>
        ))}
      </div>

      {/* Travel Guide Callout Wireframe */}
      <div
        className="skeleton"
        style={{
          height: '140px',
          borderRadius: '20px',
          border: '1px solid rgba(255, 255, 255, 0.05)',
        }}
      />
    </div>
  );
}
