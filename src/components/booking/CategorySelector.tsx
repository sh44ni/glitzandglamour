'use client';

import { Check, Sparkles } from 'lucide-react';
import Image from 'next/image';

type Service = { id: string; name: string; category: string; priceLabel: string };

const CATEGORY_META: Record<string, { label: string; image: string; emoji: string }> = {
  nails:     { label: 'Nail Services',    image: '/services/categories/nails.png',     emoji: '💅' },
  pedicures: { label: 'Pedicures',        image: '/services/categories/pedicures.png', emoji: '🦶' },
  haircolor: { label: 'Hair Color',       image: '/services/categories/haircolor.png', emoji: '🎨' },
  haircuts:  { label: 'Haircuts',         image: '/services/categories/haircuts.png',  emoji: '✂️' },
  waxing:    { label: 'Waxing',           image: '/services/categories/waxing.png',    emoji: '✨' },
  facials:   { label: 'Facials',          image: '/services/categories/facials.png',   emoji: '🧖‍♀️' },
};

export default function CategorySelector({
  services, selected, onChange,
}: {
  services: Service[];
  selected: string[];
  onChange: (cats: string[]) => void;
}) {
  const categories = Object.keys(CATEGORY_META).filter(cat =>
    services.some(s => s.category === cat)
  );

  const toggle = (cat: string) => {
    onChange(
      selected.includes(cat)
        ? selected.filter(c => c !== cat)
        : [...selected, cat]
    );
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        .cat-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
        @media(min-width:640px){.cat-grid{grid-template-columns:1fr 1fr 1fr;gap:14px}}
        .cat-card{position:relative;border-radius:18px;overflow:hidden;cursor:pointer;border:2px solid rgba(255,255,255,0.06);transition:all .3s cubic-bezier(.4,0,.2,1);aspect-ratio:4/3;user-select:none}
        .cat-card:hover{transform:translateY(-3px);box-shadow:0 12px 32px rgba(255,45,120,0.15)}
        .cat-card.active{border-color:#FF2D78;box-shadow:0 0 0 1px #FF2D78,0 8px 28px rgba(255,45,120,0.25)}
        .cat-card .cat-img{position:absolute;inset:0;object-fit:cover;transition:transform .4s}
        .cat-card:hover .cat-img{transform:scale(1.06)}
        .cat-card .cat-overlay{position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,0.1) 0%,rgba(0,0,0,0.65) 100%);transition:background .3s}
        .cat-card.active .cat-overlay{background:linear-gradient(180deg,rgba(255,45,120,0.08) 0%,rgba(0,0,0,0.7) 100%)}
        .cat-card .cat-content{position:absolute;inset:0;display:flex;flex-direction:column;justify-content:flex-end;padding:14px 16px}
        .cat-card .cat-emoji{font-size:28px;margin-bottom:6px;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.4))}
        .cat-card .cat-name{font-family:'Poppins',sans-serif;font-weight:700;font-size:14px;color:#fff;text-shadow:0 1px 4px rgba(0,0,0,0.5);line-height:1.2}
        .cat-card .cat-count{font-family:'Poppins',sans-serif;font-size:11px;color:rgba(255,255,255,0.7);margin-top:2px}
        .cat-card .cat-check{position:absolute;top:10px;right:10px;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;transition:all .2s;border:2px solid rgba(255,255,255,0.25);background:rgba(0,0,0,0.3);backdrop-filter:blur(4px)}
        .cat-card.active .cat-check{background:#FF2D78;border-color:#FF2D78;box-shadow:0 2px 10px rgba(255,45,120,0.5)}
        @keyframes catPop{0%{transform:scale(0)}60%{transform:scale(1.2)}100%{transform:scale(1)}}
        .cat-card.active .cat-check svg{animation:catPop .3s ease-out}
        @keyframes tipBounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}
        .booking-tip{display:flex;align-items:center;gap:10px;padding:12px 16px;border-radius:14px;margin-bottom:16px;animation:tipBounce 3s ease-in-out infinite}
      `}} />

      {/* Cute tip */}
      <div className="booking-tip" style={{
        background: 'linear-gradient(135deg, rgba(255,45,120,0.08), rgba(139,0,67,0.06))',
        border: '1px solid rgba(255,45,120,0.15)',
      }}>
        <span style={{ fontSize: '22px', flexShrink: 0 }}>🎀</span>
        <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12.5px', color: '#eee', lineHeight: 1.5, margin: 0 }}>
          <strong style={{ color: '#FF2D78' }}>Tip!</strong> You can pick <strong style={{ color: '#fff' }}>multiple categories</strong> in one booking — mix nails, hair, facials & more!
        </p>
      </div>

      <div className="cat-grid">
        {categories.map(cat => {
          const meta = CATEGORY_META[cat];
          const isActive = selected.includes(cat);
          const count = services.filter(s => s.category === cat).length;
          return (
            <div
              key={cat}
              className={`cat-card ${isActive ? 'active' : ''}`}
              onClick={() => toggle(cat)}
            >
              <Image
                src={meta.image}
                alt={meta.label}
                fill
                sizes="(max-width:640px) 50vw, 33vw"
                className="cat-img"
              />
              <div className="cat-overlay" />
              <div className="cat-content">
                <span className="cat-emoji">{meta.emoji}</span>
                <span className="cat-name">{meta.label}</span>
                <span className="cat-count">{count} service{count !== 1 ? 's' : ''}</span>
              </div>
              <div className="cat-check">
                {isActive && <Check size={14} color="#fff" strokeWidth={3} />}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selection summary */}
      {selected.length > 0 && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px', marginTop: '14px',
          padding: '10px 14px', borderRadius: '12px',
          background: 'rgba(255,45,120,0.06)', border: '1px solid rgba(255,45,120,0.15)',
        }}>
          <Sparkles size={14} color="#FF2D78" />
          <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px', color: '#FF2D78', fontWeight: 500 }}>
            {selected.length} {selected.length === 1 ? 'category' : 'categories'} selected — {selected.map(c => CATEGORY_META[c]?.emoji || '').join(' ')}
          </span>
        </div>
      )}
    </>
  );
}
