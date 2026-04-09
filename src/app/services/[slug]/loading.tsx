export default function LoadingServicePage() {
  return (
    <div style={{ maxWidth: '980px', margin: '0 auto', padding: '48px 24px 120px' }}>
      <div className="skeleton" style={{ height: '220px', borderRadius: '22px', marginBottom: '18px' }} />
      <div className="skeleton" style={{ height: '22px', width: '55%', borderRadius: '10px', marginBottom: '10px' }} />
      <div className="skeleton" style={{ height: '14px', width: '85%', borderRadius: '10px', marginBottom: '8px' }} />
      <div className="skeleton" style={{ height: '14px', width: '78%', borderRadius: '10px', marginBottom: '24px' }} />

      <div style={{ display: 'grid', gap: '10px' }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="skeleton" style={{ height: '70px', borderRadius: '16px' }} />
        ))}
      </div>
    </div>
  );
}

