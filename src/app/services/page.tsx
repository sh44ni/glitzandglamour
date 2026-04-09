'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight, Info, Search, X } from 'lucide-react';
import { isAprilPromoActive, getPromoDeal, getPromoDealByServiceName, PROMO_END_DATE } from '@/lib/aprilPromo';
import { useTranslation } from '@/lib/i18n';

const CATEGORY_KEYS = ['nails', 'pedicures', 'haircolor', 'haircuts', 'waxing', 'facials'];

type Service = {
    id: string; name: string; category: string; priceFrom: number; priceLabel: string;
    description?: string | null; imageUrl?: string | null;
};

// ── Countdown hook ──────────────────────────────────────────────────────────
function useCountdown(target: Date) {
    const calc = useCallback(() => {
        const diff = Math.max(0, target.getTime() - Date.now());
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((diff % (1000 * 60)) / 1000);
        return { days, hours, mins, secs, done: diff === 0 };
    }, [target]);

    const [time, setTime] = useState(calc);
    useEffect(() => {
        const id = setInterval(() => setTime(calc()), 1000);
        return () => clearInterval(id);
    }, [calc]);
    return time;
}

// ── April Banner ────────────────────────────────────────────────────────────
function AprilBanner() {
    const { days, hours, mins, secs, done } = useCountdown(PROMO_END_DATE);
    if (!isAprilPromoActive() || done) return null;

    const pad = (n: number) => String(n).padStart(2, '0');

    const unit = (n: number, label: string) => (
        <div style={{ textAlign: 'center', minWidth: '44px' }}>
            <div style={{
                background: 'rgba(0,0,0,0.35)', borderRadius: '10px', padding: '8px 10px',
                fontFamily: 'Poppins, sans-serif', fontSize: '22px', fontWeight: 800, color: '#fff',
                lineHeight: 1, letterSpacing: '-0.5px',
            }}>{pad(n)}</div>
            <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: '10px', color: 'rgba(255,255,255,0.6)', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
        </div>
    );

    return (
        <div style={{
            background: 'linear-gradient(135deg, #FF2D78 0%, #CC1E5A 60%, #8B0043 100%)',
            borderRadius: '20px', padding: '24px 28px',
            marginBottom: '32px',
            boxShadow: '0 12px 48px rgba(255,45,120,0.35)',
            position: 'relative', overflow: 'hidden',
        }}>
            {/* Background sparkles */}
            <div style={{ position: 'absolute', inset: 0, opacity: 0.08, backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '28px 28px', pointerEvents: 'none' }} />

            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '20px', position: 'relative' }}>
                <div>
                    <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '6px' }}>
                        🌸 April Special 2026
                    </div>
                    <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: 'clamp(1.2rem, 3vw, 1.7rem)', color: '#fff', lineHeight: 1.2, margin: 0 }}>
                        Fixed Prices This Month Only
                    </h2>
                    <p style={{ fontFamily: 'Poppins, sans-serif', color: 'rgba(255,255,255,0.8)', fontSize: '14px', marginTop: '6px' }}>
                        Women's Haircuts $45 · Pedicures $50 · Any style · No surprises
                    </p>
                </div>

                {/* Countdown */}
                <div>
                    <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '11px', color: 'rgba(255,255,255,0.6)', textAlign: 'center', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        Offer ends in
                    </p>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                        {unit(days, 'days')}
                        <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '22px', fontWeight: 800, color: 'rgba(255,255,255,0.5)', marginTop: '6px' }}>:</span>
                        {unit(hours, 'hrs')}
                        <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '22px', fontWeight: 800, color: 'rgba(255,255,255,0.5)', marginTop: '6px' }}>:</span>
                        {unit(mins, 'min')}
                        <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '22px', fontWeight: 800, color: 'rgba(255,255,255,0.5)', marginTop: '6px' }}>:</span>
                        {unit(secs, 'sec')}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ── Promo badge on each service card ────────────────────────────────────────
function PromoBadge({ price }: { price: number }) {
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '4px',
            background: 'linear-gradient(135deg, #FF2D78, #CC1E5A)',
            color: '#fff', fontFamily: 'Poppins, sans-serif',
            fontSize: '11px', fontWeight: 700,
            borderRadius: '50px', padding: '3px 10px',
            letterSpacing: '0.3px', flexShrink: 0,
            boxShadow: '0 2px 10px rgba(255,45,120,0.4)',
        }}>
            🌸 April — ${price} flat
        </span>
    );
}

// ── Mini countdown for the service card ────────────────────────────────────
function MiniCountdown() {
    const { days, hours, mins } = useCountdown(PROMO_END_DATE);
    return (
        <span style={{
            fontFamily: 'Poppins, sans-serif', fontSize: '10px', color: '#FF6BA8',
            fontWeight: 500,
        }}>
            ⏱ {days}d {String(hours).padStart(2, '0')}h {String(mins).padStart(2, '0')}m left
        </span>
    );
}

export default function ServicesPage() {
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const promoActive = isAprilPromoActive();
    const { t } = useTranslation();

    const categories = CATEGORY_KEYS.map(key => ({
        key,
        label: t(`services.categories.${key}` as any),
    }));

    useEffect(() => {
        fetch('/api/services').then(r => r.json()).then(data => {
            setServices(data.services || []);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    const filteredServices = useMemo(() => {
        if (!searchQuery.trim()) return services;
        const q = searchQuery.toLowerCase();
        return services.filter(s =>
            s.name.toLowerCase().includes(q) ||
            (s.description && s.description.toLowerCase().includes(q))
        );
    }, [services, searchQuery]);

    const grouped = useMemo(() => {
        const g: Record<string, Service[]> = {};
        filteredServices.forEach((s: Service) => { if (!g[s.category]) g[s.category] = []; g[s.category].push(s); });
        return g;
    }, [filteredServices]);

    const availableCategories = categories.filter(c => grouped[c.key]?.length);

    return (
        <div style={{ minHeight: '100vh', position: 'relative', zIndex: 1 }}>
            {/* Header */}
            <div style={{ padding: '52px 24px 0', maxWidth: '980px', margin: '0 auto', textAlign: 'center' }}>
                <p style={{ fontFamily: 'Poppins, sans-serif', color: '#FF2D78', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '10px' }}>
                    {t('services.allServicesLabel')}
                </p>
                <h1 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: 'clamp(2.0rem, 4.6vw, 3.0rem)', color: '#fff', letterSpacing: '-0.7px', marginBottom: '10px' }}>
                    {t('services.heading')}
                </h1>
                <p style={{ fontFamily: 'Poppins, sans-serif', color: '#bbb', fontSize: '14px', maxWidth: '720px', margin: '0 auto 18px', lineHeight: 1.6 }}>
                    {t('services.subtext')} Explore nails, pedicures, hair color, haircuts, waxing, and facials in Vista, CA — serving North County.
                </p>

                {/* Quick SEO/service highlights */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '18px' }}>
                    {[
                        'Acrylic & Gel‑X sets',
                        'Pedicures',
                        'Balayage & hair color',
                        'Women’s haircuts',
                        'Waxing',
                        'Facials',
                    ].map(x => (
                        <span key={x} style={{
                            fontFamily: 'Poppins, sans-serif',
                            fontSize: '12px',
                            color: '#aaa',
                            background: 'rgba(255,255,255,0.04)',
                            border: '1px solid rgba(255,255,255,0.07)',
                            borderRadius: '999px',
                            padding: '6px 12px',
                        }}>{x}</span>
                    ))}
                </div>

                {/* Search Bar */}
                <div style={{ position: 'relative', maxWidth: '520px', margin: '0 auto 18px' }}>
                    <Search size={18} color="#777" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                        type="search"
                        inputMode="search"
                        aria-label="Search for a service"
                        placeholder={t('services.searchPlaceholder')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '14px 44px 14px 44px',
                            background: 'linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03))',
                            border: '1px solid rgba(255,255,255,0.12)',
                            borderRadius: '16px',
                            color: '#fff',
                            fontFamily: 'Poppins, sans-serif',
                            fontSize: '14px',
                            outline: 'none',
                            transition: 'border-color 0.2s, box-shadow 0.2s',
                            boxShadow: '0 10px 40px rgba(0,0,0,0.35)',
                        }}
                        onFocus={e => {
                            e.currentTarget.style.borderColor = 'rgba(255,45,120,0.55)';
                            e.currentTarget.style.boxShadow = '0 12px 60px rgba(255,45,120,0.12)';
                        }}
                        onBlur={e => {
                            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
                            e.currentTarget.style.boxShadow = '0 10px 40px rgba(0,0,0,0.35)';
                        }}
                    />
                    {searchQuery.trim() && (
                        <button
                            type="button"
                            aria-label="Clear search"
                            onClick={() => setSearchQuery('')}
                            style={{
                                position: 'absolute',
                                right: '10px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                background: 'rgba(255,255,255,0.07)',
                                border: '1px solid rgba(255,255,255,0.09)',
                                borderRadius: '12px',
                                padding: '8px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <X size={16} color="#bbb" />
                        </button>
                    )}
                </div>
            </div>

            {/* Category tabs */}
            {!loading && availableCategories.length > 0 && (
                <div style={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 20,
                    background: 'rgba(10,10,10,0.86)',
                    backdropFilter: 'blur(22px)',
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                    padding: '12px 0',
                }}>
                    <div style={{ maxWidth: '980px', margin: '0 auto', padding: '0 24px' }}>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            {availableCategories.map(cat => {
                                const deal = getPromoDeal(cat.key);
                                const isActive = activeCategory === cat.key;
                                return (
                                    <a
                                        key={cat.key}
                                        href={`#${cat.key}`}
                                        onClick={() => setActiveCategory(cat.key)}
                                        style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            padding: '8px 14px',
                                            borderRadius: '999px',
                                            textDecoration: 'none',
                                            fontFamily: 'Poppins, sans-serif',
                                            fontSize: '13px',
                                            fontWeight: 700,
                                            background: isActive
                                                ? 'linear-gradient(135deg,#FF2D78,#7928CA)'
                                                : deal
                                                  ? 'rgba(255,45,120,0.10)'
                                                  : 'rgba(255,255,255,0.05)',
                                            color: isActive ? '#fff' : deal ? '#FF2D78' : '#cfcfcf',
                                            border: isActive
                                                ? '1px solid rgba(255,45,120,0.55)'
                                                : deal
                                                  ? '1px solid rgba(255,45,120,0.25)'
                                                  : '1px solid rgba(255,255,255,0.08)',
                                            boxShadow: isActive ? '0 10px 30px rgba(255,45,120,0.18)' : 'none',
                                            transition: 'all 0.2s',
                                        }}
                                    >
                                        {deal && <span aria-hidden>🌸</span>}
                                        <span>{cat.label}</span>
                                        {deal && (
                                            <span style={{
                                                fontSize: '11px',
                                                fontWeight: 900,
                                                color: isActive ? 'rgba(255,255,255,0.95)' : '#FF2D78',
                                                background: isActive ? 'rgba(0,0,0,0.25)' : 'rgba(255,45,120,0.10)',
                                                border: `1px solid ${isActive ? 'rgba(255,255,255,0.18)' : 'rgba(255,45,120,0.22)'}`,
                                                borderRadius: '999px',
                                                padding: '2px 8px',
                                            }}>${deal.price}</span>
                                        )}
                                    </a>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            <div style={{ maxWidth: '980px', margin: '0 auto', padding: '30px 24px 120px' }}>

                {/* April Banner */}
                {promoActive && <AprilBanner />}

                {loading ? (
                    <div style={{ display: 'grid', gap: '10px' }}>
                        {Array.from({ length: 8 }).map((_, i) => <div key={i} className="skeleton" style={{ height: '68px', borderRadius: '12px' }} />)}
                    </div>
                ) : filteredServices.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px 20px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <p style={{ fontFamily: 'Poppins, sans-serif', color: '#aaa', fontSize: '15px' }}>
                            {t('services.noResults', { query: searchQuery })}
                        </p>
                        <button onClick={() => setSearchQuery('')} className="btn-outline" style={{ marginTop: '16px' }}>{t('common.clearSearch')}</button>
                    </div>
                ) : (
                    availableCategories.map(cat => {
                        const catServices = grouped[cat.key];
                        if (!catServices?.length) return null;
                        const deal = getPromoDeal(cat.key);
                        return (
                            <div key={cat.key} id={cat.key} style={{ marginBottom: '48px' }}>
                                {/* Category header */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px', paddingBottom: '12px', borderBottom: `1px solid ${deal ? 'rgba(255,45,120,0.2)' : 'rgba(255,255,255,0.05)'}` }}>
                                    <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '16px', color: '#fff', flex: 1 }}>
                                        {cat.label}
                                    </h2>
                                    {deal && promoActive && (
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '3px' }}>
                                            <span style={{
                                                fontFamily: 'Poppins, sans-serif', fontSize: '12px', fontWeight: 700,
                                                color: '#FF2D78', background: 'rgba(255,45,120,0.1)',
                                                border: '1px solid rgba(255,45,120,0.25)', borderRadius: '8px',
                                                padding: '3px 10px',
                                            }}>
                                                🌸 April Special — ${deal.price} any style
                                            </span>
                                            <MiniCountdown />
                                        </div>
                                    )}
                                    {!deal && (
                                        <span style={{ fontFamily: 'Poppins, sans-serif', color: '#aaa', fontSize: '12px' }}>{catServices.length} services</span>
                                    )}
                                </div>

                                <div style={{ display: 'grid', gap: '8px' }}>
                                    {catServices.map(service => {
                                        const svcDeal = promoActive
                                            ? getPromoDealByServiceName(service.name, service.category)
                                            : null;
                                        return (
                                        <div key={service.id} style={{
                                            display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '14px', padding: '16px',
                                            background: svcDeal ? 'rgba(255,45,120,0.03)' : 'rgba(255,255,255,0.03)',
                                            border: svcDeal ? '1px solid rgba(255,45,120,0.12)' : '1px solid rgba(255,255,255,0.05)',
                                            borderRadius: '12px', transition: 'all 0.25s',
                                        }}
                                            onMouseOver={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,45,120,0.25)'; (e.currentTarget as HTMLElement).style.background = 'rgba(255,45,120,0.05)'; }}
                                            onMouseOut={e => { (e.currentTarget as HTMLElement).style.borderColor = svcDeal ? 'rgba(255,45,120,0.12)' : 'rgba(255,255,255,0.05)'; (e.currentTarget as HTMLElement).style.background = svcDeal ? 'rgba(255,45,120,0.03)' : 'rgba(255,255,255,0.03)'; }}>

                                            {/* Image & Text */}
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: '1 1 200px', minWidth: 0 }}>
                                                {service.imageUrl && (
                                                    <div style={{ width: '52px', height: '52px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0 }}>
                                                        <Image src={service.imageUrl} alt={service.name} width={52} height={52} style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
                                                    </div>
                                                )}
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <Link href={`/services/${(service as any).slug || service.id}`} style={{ textDecoration: 'none' }}>
                                                        <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, color: '#fff', fontSize: '15px', marginBottom: '4px' }}>
                                                            {service.name}
                                                        </p>
                                                    </Link>
                                                    {service.description && (
                                                        <p style={{ fontFamily: 'Poppins, sans-serif', color: '#bbb', fontSize: '13px', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                            {service.description}
                                                        </p>
                                                    )}
                                                    {/* Promo badge inline */}
                                                    {svcDeal && (
                                                        <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                                            <PromoBadge price={svcDeal.price} />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Price & Book */}
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flex: '1 0 auto', width: 'auto', gap: '16px' }}>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                                    {svcDeal ? (
                                                        <>
                                                            <span style={{ fontFamily: 'Poppins, sans-serif', color: '#888', fontWeight: 400, fontSize: '12px', textDecoration: 'line-through' }}>
                                                                {service.priceLabel}
                                                            </span>
                                                            <span style={{ fontFamily: 'Poppins, sans-serif', color: '#FF2D78', fontWeight: 800, fontSize: '18px' }}>
                                                                ${svcDeal.price}
                                                            </span>
                                                        </>
                                                    ) : (
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                            <span style={{ fontFamily: 'Poppins, sans-serif', color: '#FF2D78', fontWeight: 700, fontSize: '15px' }}>
                                                                {service.priceLabel}
                                                            </span>
                                                            <div className="tooltip-container">
                                                                <Info size={14} color="#aaa" style={{ cursor: 'help' }} />
                                                                <div className="tooltip">Final price discussed before we confirm your appointment</div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                    <Link
                                                        href={`/services/${(service as any).slug || service.id}`}
                                                        className="btn-outline"
                                                        style={{ fontSize: '12px', padding: '8px 12px', whiteSpace: 'nowrap' }}
                                                    >
                                                        Details
                                                    </Link>
                                                    <Link
                                                        href={`/book?service=${service.id}`}
                                                        className="btn-primary"
                                                        style={{ fontSize: '13px', padding: '8px 16px', display: 'inline-flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}>
                                                        Book <ChevronRight size={14} />
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                        );
                                    })}
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
