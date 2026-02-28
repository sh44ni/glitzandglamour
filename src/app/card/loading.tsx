export default function Loading() {
    return (
        <div style={{ padding: '32px 16px 120px', maxWidth: '480px', margin: '0 auto' }}>
            <div className="skeleton" style={{ height: '28px', width: '50%', margin: '0 auto 8px', borderRadius: '10px' }} />
            <div className="skeleton" style={{ height: '16px', width: '65%', margin: '0 auto 24px', borderRadius: '8px' }} />
            {/* The card skeleton */}
            <div className="skeleton" style={{ height: '420px', borderRadius: '28px', marginBottom: '16px' }} />
            {/* Stats row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '8px' }}>
                {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: '80px', borderRadius: '14px' }} />)}
            </div>
        </div>
    );
}
