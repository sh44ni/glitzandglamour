export default function Loading() {
    return (
        <div style={{ padding: '40px 20px 120px', maxWidth: '600px', margin: '0 auto' }}>
            {/* Avatar + name */}
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <div className="skeleton" style={{ width: '80px', height: '80px', borderRadius: '50%', margin: '0 auto 12px' }} />
                <div className="skeleton" style={{ height: '22px', width: '140px', margin: '0 auto 8px', borderRadius: '8px' }} />
                <div className="skeleton" style={{ height: '14px', width: '200px', margin: '0 auto', borderRadius: '6px' }} />
            </div>
            {/* Fields */}
            {[1, 2, 3].map(i => (
                <div key={i} style={{ marginBottom: '16px' }}>
                    <div className="skeleton" style={{ height: '12px', width: '80px', borderRadius: '6px', marginBottom: '8px' }} />
                    <div className="skeleton" style={{ height: '48px', borderRadius: '12px' }} />
                </div>
            ))}
        </div>
    );
}
