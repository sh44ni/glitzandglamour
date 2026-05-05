'use client';

import { useState } from 'react';
import { Check, Search, Sparkles } from 'lucide-react';
import Image from 'next/image';

type Service = { id: string; name: string; category: string; priceLabel: string };

// Map service IDs to known images (not all services have images)
const SERVICE_IMAGES: Record<string, string> = {
  'acrylic-set': '/services/Full_Set_GelX.jpeg',
  'gelx': '/services/Full_Set_GelX.jpeg',
  'fill': '/services/Fill_Rebalance.jpeg',
  'rebalance': '/services/Fill_Rebalance.jpeg',
  'manicure': '/services/Nail_Design_New_Design.jpeg',
  'soak-off-my-work': '/services/Soak_Off.jpeg',
  'foreign-soak-off': '/services/Soak_Off.jpeg',
  'classic-foot-detox': '/services/Classic_Foot_Soak_Detox.jpeg',
  'jelly-hydrating-detox': '/services/Jelly_Hydrating_Foot_Detox.jpeg',
  'acrylic-toes': '/services/Acrylic_Toes.jpeg',
  'mini-facials': '/services/Mini_Facials.jpeg',
  'basic-facial': '/services/Basic_Facial.jpeg',
  'deep-cleansing-facial': '/services/Deep_Cleansing_and_Extraction_Facial.jpeg',
  'anti-aging-facial': '/services/Anti-Aging_&_Enzyme_Facial.jpeg',
};

const CATEGORY_IMAGES: Record<string, string> = {
  nails: '/services/categories/nails.png',
  pedicures: '/services/categories/pedicures.png',
  haircolor: '/services/categories/haircolor.png',
  haircuts: '/services/categories/haircuts.png',
  waxing: '/services/categories/waxing.png',
  facials: '/services/categories/facials.png',
};

const CATEGORY_LABELS: Record<string, string> = {
  nails: 'Nail Services', pedicures: 'Pedicures', haircolor: 'Hair Color',
  haircuts: 'Haircuts', waxing: 'Waxing', facials: 'Facials',
};

export default function ServicePicker({
  services, selectedCategories, values, onChange,
}: {
  services: Service[];
  selectedCategories: string[];
  values: string[];
  onChange: (ids: string[]) => void;
}) {
  const [query, setQuery] = useState('');

  const filtered = services
    .filter(s => selectedCategories.includes(s.category))
    .filter(s => !query.trim() || s.name.toLowerCase().includes(query.toLowerCase()));

  const byCategory = filtered.reduce<Record<string, Service[]>>((acc, s) => {
    if (!acc[s.category]) acc[s.category] = [];
    acc[s.category].push(s);
    return acc;
  }, {});

  const toggle = (id: string) => {
    onChange(values.includes(id) ? values.filter(v => v !== id) : [...values, id]);
  };

  const getImage = (s: Service) => SERVICE_IMAGES[s.id] || CATEGORY_IMAGES[s.category] || '/services/categories/nails.png';

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        .svc-search{display:flex;align-items:center;gap:8px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:10px 14px;margin-bottom:14px}
        .svc-search input{flex:1;background:none;border:none;outline:none;font-family:'Poppins',sans-serif;font-size:13px;color:#fff}
        .svc-search input::placeholder{color:#666}
        .svc-cat-label{display:flex;align-items:center;gap:8px;padding:8px 0 6px;font-family:'Poppins',sans-serif;font-size:11px;font-weight:700;color:#FF2D78;text-transform:uppercase;letter-spacing:1px}
        .svc-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px}
        @media(min-width:500px){.svc-grid{grid-template-columns:1fr 1fr 1fr}}
        .svc-card{position:relative;border-radius:14px;overflow:hidden;cursor:pointer;border:2px solid rgba(255,255,255,0.06);transition:all .25s cubic-bezier(.4,0,.2,1);user-select:none}
        .svc-card:hover{transform:translateY(-2px);border-color:rgba(255,255,255,0.15)}
        .svc-card.selected{border-color:#FF2D78;box-shadow:0 0 0 1px #FF2D78,0 4px 16px rgba(255,45,120,0.2)}
        .svc-card-img{position:relative;width:100%;aspect-ratio:3/2;overflow:hidden}
        .svc-card-img img{object-fit:cover;transition:transform .3s}
        .svc-card:hover .svc-card-img img{transform:scale(1.05)}
        .svc-card-body{padding:10px 12px}
        .svc-card-name{font-family:'Poppins',sans-serif;font-size:12px;font-weight:600;color:#fff;line-height:1.3;margin-bottom:2px}
        .svc-card.selected .svc-card-name{color:#FF2D78}
        .svc-card-price{font-family:'Poppins',sans-serif;font-size:11px;color:#888}
        .svc-card-check{position:absolute;top:8px;right:8px;width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;transition:all .2s;z-index:2;border:2px solid rgba(255,255,255,0.3);background:rgba(0,0,0,0.35);backdrop-filter:blur(4px)}
        .svc-card.selected .svc-card-check{background:#FF2D78;border-color:#FF2D78;box-shadow:0 2px 8px rgba(255,45,120,0.5)}
        @keyframes svcPop{0%{transform:scale(0)}60%{transform:scale(1.2)}100%{transform:scale(1)}}
        .svc-card.selected .svc-card-check svg{animation:svcPop .25s ease-out}
      `}} />

      {/* Search */}
      <div className="svc-search">
        <Search size={14} color="#777" style={{ flexShrink: 0 }} />
        <input type="text" placeholder="Search services…" value={query} onChange={e => setQuery(e.target.value)} />
        {query && <button type="button" onClick={() => setQuery('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666', padding: 0 }}>✕</button>}
      </div>

      {/* Selected chips */}
      {values.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '14px' }}>
          {values.map(id => {
            const svc = services.find(s => s.id === id);
            return svc ? (
              <span key={id} style={{
                display: 'inline-flex', alignItems: 'center', gap: '5px',
                background: 'rgba(255,45,120,0.12)', border: '1px solid rgba(255,45,120,0.3)',
                borderRadius: '20px', padding: '4px 10px',
                fontFamily: 'Poppins, sans-serif', fontSize: '11px', color: '#FF2D78', fontWeight: 500,
              }}>
                ✓ {svc.name}
                <button type="button" onClick={() => toggle(id)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#FF2D78', padding: 0, lineHeight: 1, fontSize: '13px' }}>×</button>
              </span>
            ) : null;
          })}
        </div>
      )}

      {/* Service cards by category */}
      {Object.keys(byCategory).length === 0 && (
        <div style={{ padding: '32px 14px', textAlign: 'center', fontFamily: 'Poppins, sans-serif', color: '#555', fontSize: '13px' }}>
          No services found
        </div>
      )}

      {Object.entries(byCategory).map(([cat, svcs]) => (
        <div key={cat}>
          <div className="svc-cat-label">
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#FF2D78' }} />
            {CATEGORY_LABELS[cat] || cat}
          </div>
          <div className="svc-grid">
            {svcs.map(s => {
              const isSelected = values.includes(s.id);
              return (
                <div key={s.id} className={`svc-card ${isSelected ? 'selected' : ''}`} onClick={() => toggle(s.id)}>
                  <div className="svc-card-img">
                    <Image src={getImage(s)} alt={s.name} fill sizes="(max-width:500px) 50vw, 33vw" />
                    {/* Gradient overlay for readability */}
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.3) 100%)' }} />
                  </div>
                  <div className="svc-card-check">
                    {isSelected && <Check size={12} color="#fff" strokeWidth={3} />}
                  </div>
                  <div className="svc-card-body">
                    <div className="svc-card-name">{s.name}</div>
                    <div className="svc-card-price">{s.priceLabel}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </>
  );
}
