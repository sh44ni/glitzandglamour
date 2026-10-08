export default function BlogsLoading() {
  return (
    <div style={{ minHeight: '100vh', paddingTop: '90px', paddingBottom: '80px', maxWidth: '1200px', margin: '0 auto', paddingLeft: '24px', paddingRight: '24px' }}>
      {/* Hero Badge */}
      <div className="skeleton" style={{ width: '130px', height: '24px', borderRadius: '50px', marginBottom: '22px' }} />
      {/* Title */}
      <div className="skeleton" style={{ width: '60%', height: '52px', borderRadius: '12px', marginBottom: '16px' }} />
      {/* Subtitle */}
      <div className="skeleton" style={{ width: '80%', height: '20px', borderRadius: '6px', marginBottom: '36px' }} />

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '48px' }}>
        {[1, 2, 3, 4, 5].map((t) => (
          <div key={t} className="skeleton" style={{ width: '90px', height: '36px', borderRadius: '50px' }} />
        ))}
      </div>

      {/* Featured Blog Card */}
      <div
        className="skeleton"
        style={{
          height: '360px',
          borderRadius: '24px',
          marginBottom: '56px',
          border: '1px solid rgba(255, 255, 255, 0.05)',
        }}
      />

      {/* 3-Column Blog Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '28px' }}>
        {[1, 2, 3, 4, 5, 6].map((b) => (
          <div
            key={b}
            style={{
              borderRadius: '20px',
              padding: '16px',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
            }}
          >
            <div className="skeleton" style={{ height: '200px', borderRadius: '14px' }} />
            <div className="skeleton" style={{ width: '40%', height: '14px', borderRadius: '4px' }} />
            <div className="skeleton" style={{ width: '85%', height: '24px', borderRadius: '6px' }} />
            <div className="skeleton" style={{ width: '100%', height: '40px', borderRadius: '6px' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '10px' }}>
              <div className="skeleton" style={{ width: '80px', height: '12px', borderRadius: '4px' }} />
              <div className="skeleton" style={{ width: '60px', height: '12px', borderRadius: '4px' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
