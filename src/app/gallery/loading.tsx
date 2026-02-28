export default function Loading() {
    return (
        <div style={{ padding: '40px 20px 120px', maxWidth: '900px', margin: '0 auto' }}>
            <div className="skeleton" style={{ height: '36px', width: '40%', margin: '0 auto 24px', borderRadius: '10px' }} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '10px' }}>
                {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <div key={i} className="skeleton" style={{ height: '200px', borderRadius: '16px' }} />)}
            </div>
        </div>
    );
}
