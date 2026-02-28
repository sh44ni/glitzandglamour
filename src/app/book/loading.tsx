export default function Loading() {
    return (
        <div style={{ padding: '40px 20px 120px', maxWidth: '580px', margin: '0 auto' }}>
            <div className="skeleton" style={{ height: '40px', width: '60%', margin: '0 auto 12px', borderRadius: '12px' }} />
            <div className="skeleton" style={{ height: '20px', width: '40%', margin: '0 auto 32px', borderRadius: '8px' }} />
            {/* Step bar */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '28px', justifyContent: 'center' }}>
                {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: '4px', flex: 1, maxWidth: '80px', borderRadius: '2px' }} />)}
            </div>
            <div className="skeleton" style={{ height: '340px', borderRadius: '24px' }} />
        </div>
    );
}
