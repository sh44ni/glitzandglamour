'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight, Info, Search } from 'lucide-react';

const categories = [
    { key: 'nails', label: 'Nail Services' },
    { key: 'pedicures', label: 'Pedicures' },
    { key: 'haircolor', label: 'Hair Color' },
    { key: 'haircuts', label: 'Haircuts' },
    { key: 'waxing', label: 'Waxing' },
    { key: 'facials', label: 'Facials' },
];

type Service = {
    id: string; name: string; category: string; priceFrom: number; priceLabel: string;
    description?: string | null; imageUrl?: string | null;
};

export default function ServicesPage() {
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetch('/api/services').then(r => r.json()).then(data => {
            setServices(data.services || []);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    // Filter services by search query
    const filteredServices = useMemo(() => {
        if (!searchQuery.trim()) return services;
        const q = searchQuery.toLowerCase();
        return services.filter(s =>
            s.name.toLowerCase().includes(q) ||
            (s.description && s.description.toLowerCase().includes(q))
        );
    }, [services, searchQuery]);

    // Group filtered services
    const grouped = useMemo(() => {
        const g: Record<string, Service[]> = {};
        filteredServices.forEach((s: Service) => { if (!g[s.category]) g[s.category] = []; g[s.category].push(s); });
        return g;
    }, [filteredServices]);

    const availableCategories = categories.filter(c => grouped[c.key]?.length);

    return (
        <div style={{ minHeight: '100vh', position: 'relative', zIndex: 1 }}>
            {/* Header */}
            <div style={{ padding: '48px 24px 0', maxWidth: '900px', margin: '0 auto', textAlign: 'center', marginBottom: '0' }}>
                <p style={{ fontFamily: 'Poppins, sans-serif', color: '#FF2D78', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '10px' }}>
                    All Services
                </p>
                <h1 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', color: '#fff', letterSpacing: '-0.5px', marginBottom: '10px' }}>
                    What I Offer
                </h1>
                <p style={{ fontFamily: 'Poppins, sans-serif', color: '#bbb', fontSize: '14px', maxWidth: '500px', margin: '0 auto', marginBottom: '24px' }}>
                    Prices shown are starting points — I'll finalize everything with you before confirming.
                </p>

                {/* Search Bar */}
                <div style={{ position: 'relative', maxWidth: '400px', margin: '0 auto 12px' }}>
                    <Search size={18} color="#aaa" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                        type="text"
                        placeholder="Search for a service..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                            width: '100%', padding: '14px 16px 14px 44px',
                            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '50px', color: '#fff', fontFamily: 'Poppins, sans-serif',
                            fontSize: '14px', outline: 'none', transition: 'border-color 0.2s',
                        }}
                        onFocus={e => e.currentTarget.style.borderColor = 'rgba(255,45,120,0.5)'}
                        onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
                    />
                </div>
            </div>

            {/* Category tabs */}
            {!loading && availableCategories.length > 0 && (
                <div style={{ position: 'sticky', top: 0, zIndex: 20, background: 'rgba(10,10,10,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '12px 0' }}>
                    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 24px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {availableCategories.map(cat => (
                            <a key={cat.key} href={`#${cat.key}`}
                                onClick={() => setActiveCategory(cat.key)}
                                style={{
                                    display: 'inline-block', flexShrink: 0,
                                    padding: '7px 16px', borderRadius: '50px', textDecoration: 'none',
                                    fontFamily: 'Poppins, sans-serif', fontSize: '13px', fontWeight: 500,
                                    background: activeCategory === cat.key ? '#FF2D78' : 'rgba(255,255,255,0.06)',
                                    color: activeCategory === cat.key ? '#fff' : '#ccc',
                                    border: activeCategory === cat.key ? '1px solid #FF2D78' : '1px solid rgba(255,255,255,0.08)',
                                    transition: 'all 0.2s',
                                }}>
                                {cat.label}
                            </a>
                        ))}
                    </div>
                </div>
            )}

            <div style={{ maxWidth: '900px', margin: '0 auto', padding: '32px 24px 120px' }}>
                {loading ? (
                    <div style={{ display: 'grid', gap: '10px' }}>
                        {Array.from({ length: 8 }).map((_, i) => <div key={i} className="skeleton" style={{ height: '68px', borderRadius: '12px' }} />)}
                    </div>
                ) : filteredServices.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px 20px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <p style={{ fontFamily: 'Poppins, sans-serif', color: '#aaa', fontSize: '15px' }}>
                            No services found matching "{searchQuery}".
                        </p>
                        <button onClick={() => setSearchQuery('')} className="btn-outline" style={{ marginTop: '16px' }}>Clear Search</button>
                    </div>
                ) : (
                    availableCategories.map(cat => {
                        const catServices = grouped[cat.key];
                        if (!catServices?.length) return null;
                        return (
                            <div key={cat.key} id={cat.key} style={{ marginBottom: '48px' }}>
                                {/* Category header — text only, no emoji */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px', paddingBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '16px', color: '#fff', flex: 1 }}>
                                        {cat.label}
                                    </h2>
                                    <span style={{ fontFamily: 'Poppins, sans-serif', color: '#aaa', fontSize: '12px' }}>{catServices.length} services</span>
                                </div>
                                <div style={{ display: 'grid', gap: '8px' }}>
                                    {catServices.map(service => (
                                        <div key={service.id} style={{
                                            display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '14px', padding: '16px',
                                            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)',
                                            borderRadius: '12px', transition: 'all 0.25s',
                                        }}
                                            onMouseOver={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,45,120,0.2)'; (e.currentTarget as HTMLElement).style.background = 'rgba(255,45,120,0.03)'; }}
                                            onMouseOut={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.05)'; (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)'; }}>

                                            {/* Image & Text Grouping */}
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: '1 1 200px', minWidth: 0 }}>
                                                {service.imageUrl && (
                                                    <div style={{ width: '52px', height: '52px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0 }}>
                                                        <Image src={service.imageUrl} alt={service.name} width={52} height={52} style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
                                                    </div>
                                                )}
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 500, color: '#e0e0e0', fontSize: '15px', marginBottom: '4px' }}>
                                                        {service.name}
                                                    </p>
                                                    {service.description && (
                                                        <p style={{ fontFamily: 'Poppins, sans-serif', color: '#bbb', fontSize: '13px', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                            {service.description}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Price & Button Grouping */}
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flex: '1 0 auto', width: 'auto', gap: '16px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <span style={{ fontFamily: 'Poppins, sans-serif', color: '#FF2D78', fontWeight: 700, fontSize: '15px' }}>
                                                        {service.priceLabel}
                                                    </span>
                                                    <div className="tooltip-container">
                                                        <Info size={14} color="#aaa" style={{ cursor: 'help' }} />
                                                        <div className="tooltip">Final price discussed before I confirm your appointment</div>
                                                    </div>
                                                </div>
                                                <Link href={`/book?service=${service.id}`} className="btn-primary" style={{ fontSize: '13px', padding: '8px 16px', display: 'inline-flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}>
                                                    Book <ChevronRight size={14} />
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })
                )}

                <div style={{ textAlign: 'center', paddingTop: '16px' }}>
                    <Link href="/book" className="btn-primary" style={{ fontSize: '15px', padding: '14px 36px' }}>
                        Book an Appointment <ChevronRight size={15} />
                    </Link>
                </div>
            </div>
        </div>
    );
}
