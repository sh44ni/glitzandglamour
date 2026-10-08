export default function ReviewsLoading() {
  return (
    <div style={{ minHeight: '100vh', padding: '48px 20px 120px', maxWidth: '900px', margin: '0 auto' }}>
      {/* Header Skeleton */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <div className="skeleton" style={{ width: '180px', height: '16px', borderRadius: '4px', margin: '0 auto 12px' }} />
        <div className="skeleton" style={{ width: '70%', height: '38px', borderRadius: '10px', margin: '0 auto 16px' }} />
        <div className="skeleton" style={{ width: '220px', height: '22px', borderRadius: '6px', margin: '0 auto 24px' }} />
        {/* Description box wireframe */}
        <div
          className="skeleton"
          style={{
            height: '120px',
            borderRadius: '16px',
            maxWidth: '780px',
            margin: '0 auto 24px',
            border: '1px solid rgba(255, 255, 255, 0.05)',
          }}
        />
        <div className="skeleton" style={{ width: '200px', height: '38px', borderRadius: '50px', margin: '0 auto' }} />
      </div>

      {/* Review Cards Grid Wireframe */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '16px' }}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            style={{
              padding: '24px',
              borderRadius: '20px',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            {/* Header: avatar + name + source */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div className="skeleton" style={{ width: '36px', height: '36px', borderRadius: '50%' }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div className="skeleton" style={{ width: '100px', height: '14px', borderRadius: '4px' }} />
                  <div className="skeleton" style={{ width: '70px', height: '10px', borderRadius: '3px' }} />
                </div>
              </div>
              <div className="skeleton" style={{ width: '60px', height: '20px', borderRadius: '50px' }} />
            </div>

            {/* Stars */}
            <div className="skeleton" style={{ width: '80px', height: '14px', borderRadius: '4px' }} />

            {/* Review text */}
            <div className="skeleton" style={{ width: '100%', height: '14px', borderRadius: '4px' }} />
            <div className="skeleton" style={{ width: '92%', height: '14px', borderRadius: '4px' }} />
            <div className="skeleton" style={{ width: '60%', height: '14px', borderRadius: '4px' }} />
          </div>
        ))}
      </div>
    </div>
  );
}
