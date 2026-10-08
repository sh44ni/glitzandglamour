export default function SpecialEventsLoading() {
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px 80px' }}>
      {/* Hero Skeleton */}
      <div
        style={{
          borderRadius: '24px',
          padding: '56px 24px 44px',
          textAlign: 'center',
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          margin: '24px 0 44px',
        }}
      >
        <div className="skeleton" style={{ width: '140px', height: '24px', borderRadius: '50px', margin: '0 auto 16px' }} />
        <div className="skeleton" style={{ width: '55%', height: '42px', borderRadius: '10px', margin: '0 auto 16px' }} />
        <div className="skeleton" style={{ width: '70%', height: '18px', borderRadius: '6px', margin: '0 auto 28px' }} />
        <div className="skeleton" style={{ width: '190px', height: '46px', borderRadius: '50px', margin: '0 auto' }} />
      </div>

      {/* 4 Category Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', marginBottom: '56px' }}>
        {[1, 2, 3, 4].map((c) => (
          <div
            key={c}
            style={{
              borderRadius: '20px',
              padding: '24px',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div className="skeleton" style={{ height: '180px', borderRadius: '14px', marginBottom: '8px' }} />
            <div className="skeleton" style={{ width: '60%', height: '24px', borderRadius: '6px' }} />
            <div className="skeleton" style={{ width: '90%', height: '16px', borderRadius: '4px' }} />
            <div className="skeleton" style={{ width: '40%', height: '16px', borderRadius: '4px' }} />
          </div>
        ))}
      </div>

      {/* 3 Step Timeline Cards Wireframe */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '56px' }}>
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className="skeleton"
            style={{
              height: '110px',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.04)',
            }}
          />
        ))}
      </div>

      {/* Inquiry Form Wireframe */}
      <div
        className="skeleton"
        style={{
          maxWidth: '720px',
          height: '420px',
          borderRadius: '24px',
          margin: '0 auto',
          border: '1px solid rgba(255, 255, 255, 0.06)',
        }}
      />
    </div>
  );
}
