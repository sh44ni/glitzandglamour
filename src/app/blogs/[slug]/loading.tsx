export default function BlogPostLoading() {
  return (
    <article style={{ minHeight: '100vh', paddingTop: '90px', paddingBottom: '80px', maxWidth: '800px', margin: '0 auto', paddingLeft: '20px', paddingRight: '20px' }}>
      {/* Back button */}
      <div className="skeleton" style={{ width: '110px', height: '16px', borderRadius: '4px', marginBottom: '28px' }} />

      {/* Category tag */}
      <div className="skeleton" style={{ width: '90px', height: '22px', borderRadius: '50px', marginBottom: '16px' }} />

      {/* Article H1 Title */}
      <div className="skeleton" style={{ width: '92%', height: '42px', borderRadius: '10px', marginBottom: '12px' }} />
      <div className="skeleton" style={{ width: '65%', height: '42px', borderRadius: '10px', marginBottom: '20px' }} />

      {/* Author & Meta Row */}
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '32px' }}>
        <div className="skeleton" style={{ width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0 }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div className="skeleton" style={{ width: '120px', height: '14px', borderRadius: '4px' }} />
          <div className="skeleton" style={{ width: '180px', height: '12px', borderRadius: '4px' }} />
        </div>
      </div>

      {/* Featured Cover Image (16:9) */}
      <div
        className="skeleton"
        style={{
          width: '100%',
          height: '420px',
          borderRadius: '20px',
          marginBottom: '40px',
          border: '1px solid rgba(255, 255, 255, 0.05)',
        }}
      />

      {/* Article Paragraphs Wireframe */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '48px' }}>
        <div className="skeleton" style={{ width: '100%', height: '18px', borderRadius: '4px' }} />
        <div className="skeleton" style={{ width: '98%', height: '18px', borderRadius: '4px' }} />
        <div className="skeleton" style={{ width: '95%', height: '18px', borderRadius: '4px' }} />
        <div className="skeleton" style={{ width: '82%', height: '18px', borderRadius: '4px' }} />

        <div className="skeleton" style={{ width: '45%', height: '28px', borderRadius: '8px', margin: '24px 0 12px' }} />

        <div className="skeleton" style={{ width: '100%', height: '18px', borderRadius: '4px' }} />
        <div className="skeleton" style={{ width: '96%', height: '18px', borderRadius: '4px' }} />
        <div className="skeleton" style={{ width: '70%', height: '18px', borderRadius: '4px' }} />
      </div>

      {/* Bottom Share / CTA Box */}
      <div
        className="skeleton"
        style={{
          height: '100px',
          borderRadius: '18px',
          border: '1px solid rgba(255, 255, 255, 0.05)',
        }}
      />
    </article>
  );
}
