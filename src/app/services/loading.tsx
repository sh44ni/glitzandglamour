export default function Loading() {
    return (
        <div style={{ padding: '40px 20px 120px', maxWidth: '900px', margin: '0 auto' }}>
            <div className="skeleton" style={{ height: '36px', width: '50%', margin: '0 auto 24px', borderRadius: '10px' }} />
            {/* Services grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '12px', marginBottom: '20px' }}>
                {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="skeleton" style={{ height: '180px', borderRadius: '18px' }} />)}
            </div>
        </div>
    );
}
