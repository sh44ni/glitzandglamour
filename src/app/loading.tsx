export default function Loading() {
    return (
        <div style={{ padding: '40px 20px 120px', maxWidth: '900px', margin: '0 auto' }}>
            {/* Hero skeleton */}
            <div className="skeleton" style={{ height: '280px', borderRadius: '24px', marginBottom: '20px' }} />
            {/* Cards row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '20px' }}>
                {[1, 2, 3, 4].map(i => <div key={i} className="skeleton" style={{ height: '160px', borderRadius: '18px' }} />)}
            </div>
            <div className="skeleton" style={{ height: '100px', borderRadius: '18px' }} />
        </div>
    );
}
