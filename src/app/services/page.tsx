'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { ChevronRight, Info, Search, Sparkles, X } from 'lucide-react';

import { useTranslation } from '@/lib/i18n';
import { SERVICES_DETAILED } from '@/data/servicesDetailed';

const CATEGORY_KEYS = ['nails', 'pedicures', 'haircolor', 'haircuts', 'waxing', 'facials'];

type Service = {
    id: string; name: string; category: string; priceFrom: number; priceLabel: string;
    description?: string | null; imageUrl?: string | null;
    slug?: string | null;
};

const INITIAL_SERVICES: Service[] = SERVICES_DETAILED.map(s => ({
    id: s.id,
    name: s.name,
    category: s.category,
    priceFrom: s.startingAtPrice,
    priceLabel: s.priceLabel,
    description: s.seoDescription,
    imageUrl: s.imageUrl,
    slug: s.slug,
}));

const CANONICAL_BY_ID = new Map(SERVICES_DETAILED.map(s => [s.id, s]));
const CANONICAL_BY_NAME = new Map(SERVICES_DETAILED.map(s => [s.name.toLowerCase(), s]));

const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.glitzandglamours.com' },
        { '@type': 'ListItem', position: 2, name: 'Services', item: 'https://www.glitzandglamours.com/services' },
    ],
};

export default function ServicesPage() {
    const [services, setServices] = useState<Service[]>(INITIAL_SERVICES);
    const [loading, setLoading] = useState(false);
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const { t } = useTranslation();

    const categories = CATEGORY_KEYS.map(key => ({
        key,
        label: t(`services.categories.${key}` as any),
    }));

    useEffect(() => {
        fetch('/api/services').then(r => r.json()).then(data => {
            if (data.services && data.services.length > 0) {
                setServices(data.services.map((s: Service) => {
                    const canonical = CANONICAL_BY_ID.get(s.id) || CANONICAL_BY_NAME.get(s.name?.toLowerCase() || '');
                    return {
                        ...s,
                        imageUrl: canonical?.imageUrl || s.imageUrl,
                        slug: canonical?.slug || s.slug,
                        description: s.description || canonical?.seoDescription,
                    };
                }));
            }
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
        <div className="services-hub-page" style={{ minHeight: '100vh', position: 'relative', zIndex: 1 }}>
            <style>{`
                .services-hub-shell {
                    width: min(1180px, calc(100% - 2rem));
                    margin: 0 auto;
                }
                .services-hero-card {
                    position: relative;
                    overflow: hidden;
                    border-radius: 28px;
                    padding: clamp(24px, 4vw, 44px);
                    background:
                        radial-gradient(circle at 18% 0%, rgba(255, 45, 120, 0.18), transparent 52%),
                        radial-gradient(circle at 85% 10%, rgba(226, 194, 134, 0.12), transparent 48%),
                        linear-gradient(160deg, rgba(28, 13, 22, 0.92), rgba(12, 6, 11, 0.96));
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    box-shadow: 0 28px 70px rgba(0, 0, 0, 0.55);
                }
                .services-hero-card::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 8%;
                    right: 8%;
                    height: 1px;
                    background: linear-gradient(90deg, transparent, rgba(255, 143, 188, 0.65), rgba(226, 194, 134, 0.55), transparent);
                }
                .services-sticky-bar {
                    position: sticky;
                    top: 76px;
                    z-index: 25;
                    background: rgba(12, 6, 11, 0.88);
                    backdrop-filter: blur(22px);
                    -webkit-backdrop-filter: blur(22px);
                    border-top: 1px solid rgba(255, 255, 255, 0.07);
                    border-bottom: 1px solid rgba(255, 255, 255, 0.09);
                    padding: 12px 0;
                    margin-top: 24px;
                }
                @media (max-width: 768px) {
                    .services-sticky-bar {
                        top: 64px;
                    }
                }
                .services-cat-grid {
                    display: grid;
                    grid-template-columns: repeat(2, minmax(0, 1fr));
                    gap: 14px;
                }
                @media (max-width: 860px) {
                    .services-cat-grid {
                        grid-template-columns: minmax(0, 1fr);
                    }
                }
                .service-catalog-card {
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    gap: 14px;
                    padding: 18px;
                    border-radius: 20px;
                    background: linear-gradient(155deg, rgba(32, 15, 26, 0.82), rgba(15, 8, 13, 0.92));
                    border: 1px solid rgba(255, 255, 255, 0.09);
                    box-shadow: 0 14px 34px rgba(0, 0, 0, 0.32);
                    transition: transform 0.22s ease, border-color 0.22s ease, box-shadow 0.22s ease;
                }
                .service-catalog-card:hover {
                    transform: translateY(-2px);
                    border-color: rgba(255, 45, 120, 0.38);
                    box-shadow: 0 18px 42px rgba(255, 45, 120, 0.14);
                }
                .service-card-footer {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 12px;
                    padding-top: 12px;
                    border-top: 1px solid rgba(255, 255, 255, 0.07);
                    flex-wrap: wrap;
                }
            `}</style>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
            />

            {/* Editorial Hero Section */}
            <div className="services-hub-shell" style={{ paddingTop: '28px' }}>
                <div className="services-hero-card">
                    <div style={{ textAlign: 'center', maxWidth: '860px', margin: '0 auto' }}>
                        <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '6px 14px',
                            borderRadius: '999px',
                            background: 'rgba(255, 45, 120, 0.14)',
                            border: '1px solid rgba(255, 122, 174, 0.35)',
                            marginBottom: '14px',
                        }}>
                            <Sparkles size={13} color="#ff7aae" aria-hidden="true" />
                            <span style={{
                                fontFamily: 'Poppins, sans-serif',
                                color: '#ff8ab8',
                                fontWeight: 700,
                                fontSize: '11px',
                                textTransform: 'uppercase',
                                letterSpacing: '2.4px',
                            }}>
                                {t('services.allServicesLabel')}
                            </span>
                        </div>

                        <h1 style={{
                            fontFamily: 'Poppins, sans-serif',
                            fontWeight: 800,
                            fontSize: 'clamp(1.75rem, 4.2vw, 2.85rem)',
                            lineHeight: 1.15,
                            color: '#fff',
                            letterSpacing: '-0.03em',
                            marginBottom: '18px',
                        }}>
                            Our Services | Hair, Nails, Waxing &amp; Facials in San Marcos &amp; Vista, CA
                        </h1>

                        <div style={{
                            fontFamily: 'Poppins, sans-serif',
                            color: '#e2d6dc',
                            fontSize: '14px',
                            maxWidth: '820px',
                            margin: '0 auto 22px',
                            lineHeight: 1.72,
                            textAlign: 'left',
                            background: 'rgba(255, 255, 255, 0.035)',
                            padding: 'clamp(16px, 2.5vw, 22px) clamp(18px, 3vw, 26px)',
                            borderRadius: '18px',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                        }}>
                            <p style={{ marginBottom: '12px' }}>
                                Welcome to <strong style={{ color: '#fff' }}>Glitz &amp; Glamour Studio</strong>, North County San Diego&apos;s premier boutique destination for precision hair styling, luxury nail enhancements, rejuvenating pedicures, gentle waxing, and corrective facials. Located at <strong style={{ color: '#fff' }}>935 W San Marcos Blvd, Suite 101, San Marcos, CA 92078</strong>, our private studio was founded by master beauty artisan JoJany with a singular commitment: every guest receives dedicated one-on-one attention, hospital-grade sanitation, and premium, non-damaging formulas in an unhurried, relaxing atmosphere.
                            </p>
                            <p style={{ marginBottom: '12px' }}>
                                Whether you are visiting us for a custom full set of sculpted acrylics, feather-light Gel-X extensions, a lived-in dimensional balayage, gray coverage, or a deep pore-clearing extraction facial, we tailor every technique to your unique anatomy, hair texture, and lifestyle. We proudly welcome clients from throughout North County San Diego, including <strong style={{ color: '#fff' }}>San Marcos, Vista, Carlsbad, Oceanside, and Escondido</strong>.
                            </p>
                            <p style={{ margin: 0 }}>
                                All services are offered by appointment to guarantee our undivided focus during your visit. The prices below represent transparent starting points; we consult with you in person and confirm all final details before work begins. Explore our complete 29-service catalog below and book your appointment online.
                            </p>
                        </div>

                        {/* Quick SEO/service highlights */}
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '22px' }}>
                            {[
                                'Acrylic & Gel‑X sets',
                                'Pedicures',
                                'Balayage & hair color',
                                "Women's haircuts",
                                'Waxing',
                                'Facials',
                            ].map(x => (
                                <span key={x} style={{
                                    fontFamily: 'Poppins, sans-serif',
                                    fontSize: '12px',
                                    fontWeight: 600,
                                    color: '#f0e4ea',
                                    background: 'rgba(255, 255, 255, 0.06)',
                                    border: '1px solid rgba(255, 255, 255, 0.12)',
                                    borderRadius: '999px',
                                    padding: '6px 14px',
                                }}>{x}</span>
                            ))}
                        </div>

                        {/* Search Bar */}
                        <div style={{ position: 'relative', maxWidth: '540px', margin: '0 auto' }}>
                            <Search size={18} color="#d4c3cc" aria-hidden="true" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                            <input
                                type="search"
                                inputMode="search"
                                aria-label="Search for a service"
                                placeholder={t('services.searchPlaceholder')}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '14px 46px 14px 46px',
                                    background: 'rgba(15, 7, 13, 0.78)',
                                    border: '1px solid rgba(255, 255, 255, 0.16)',
                                    borderRadius: '999px',
                                    color: '#fff',
                                    fontFamily: 'Poppins, sans-serif',
                                    fontSize: '14px',
                                    outline: 'none',
                                    transition: 'border-color 0.2s, box-shadow 0.2s',
                                    boxShadow: '0 12px 34px rgba(0, 0, 0, 0.4)',
                                }}
                                onFocus={e => {
                                    e.currentTarget.style.borderColor = 'rgba(255, 45, 120, 0.65)';
                                    e.currentTarget.style.boxShadow = '0 12px 44px rgba(255, 45, 120, 0.18)';
                                }}
                                onBlur={e => {
                                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.16)';
                                    e.currentTarget.style.boxShadow = '0 12px 34px rgba(0, 0, 0, 0.4)';
                                }}
                            />
                            {searchQuery.trim() && (
                                <button
                                    type="button"
                                    aria-label="Clear search"
                                    onClick={() => setSearchQuery('')}
                                    style={{
                                        position: 'absolute',
                                        right: '8px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'rgba(255, 255, 255, 0.1)',
                                        border: '1px solid rgba(255, 255, 255, 0.14)',
                                        borderRadius: '999px',
                                        width: '34px',
                                        height: '34px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <X size={16} color="#f5ecf0" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Sticky Category Filter Bar */}
            {!loading && availableCategories.length > 0 && (
                <nav aria-label="Service categories" className="services-sticky-bar">
                    <div className="services-hub-shell">
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center' }}>
                            {availableCategories.map(cat => {
                                const isActive = activeCategory === cat.key;
                                const count = grouped[cat.key]?.length || 0;
                                return (
                                    <a
                                        key={cat.key}
                                        href={`#${cat.key}`}
                                        onClick={() => setActiveCategory(cat.key)}
                                        style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            padding: '8px 15px',
                                            borderRadius: '999px',
                                            textDecoration: 'none',
                                            fontFamily: 'Poppins, sans-serif',
                                            fontSize: '13px',
                                            fontWeight: 700,
                                            background: isActive
                                                ? 'linear-gradient(135deg, #FF2D78, #c9185b)'
                                                : 'rgba(255, 255, 255, 0.06)',
                                            color: isActive ? '#fff' : '#f0e4ea',
                                            border: isActive
                                                ? '1px solid rgba(255, 130, 180, 0.65)'
                                                : '1px solid rgba(255, 255, 255, 0.11)',
                                            boxShadow: isActive ? '0 10px 28px rgba(255, 45, 120, 0.28)' : 'none',
                                            transition: 'all 0.2s',
                                        }}
                                    >
                                        <span>{cat.label}</span>
                                        <span style={{
                                            fontSize: '11px',
                                            fontWeight: 700,
                                            padding: '1px 7px',
                                            borderRadius: '999px',
                                            background: isActive ? 'rgba(0, 0, 0, 0.25)' : 'rgba(255, 45, 120, 0.18)',
                                            color: isActive ? '#fff' : '#ff8ab8',
                                        }}>
                                            {count}
                                        </span>
                                    </a>
                                );
                            })}
                        </div>
                    </div>
                </nav>
            )}

            {/* Main Service Catalog */}
            <div className="services-hub-shell" style={{ padding: '32px 0 120px' }}>
                {loading ? (
                    <div className="services-cat-grid">
                        {Array.from({ length: 8 }).map((_, i) => <div key={i} className="skeleton" style={{ height: '140px', borderRadius: '20px' }} />)}
                    </div>
                ) : filteredServices.length === 0 ? (
                    <div style={{
                        textAlign: 'center',
                        padding: '48px 24px',
                        background: 'linear-gradient(155deg, rgba(32, 15, 26, 0.78), rgba(15, 8, 13, 0.9))',
                        borderRadius: '24px',
                        border: '1px solid rgba(255, 255, 255, 0.09)',
                    }}>
                        <p style={{ fontFamily: 'Poppins, sans-serif', color: '#e2d6dc', fontSize: '15px' }}>
                            {t('services.noResults', { query: searchQuery })}
                        </p>
                        <button onClick={() => setSearchQuery('')} className="btn-outline" style={{ marginTop: '16px' }}>
                            {t('common.clearSearch')}
                        </button>
                    </div>
                ) : (
                    availableCategories.map(cat => {
                        const catServices = grouped[cat.key];
                        if (!catServices?.length) return null;
                        return (
                            <section key={cat.key} id={cat.key} style={{ marginBottom: '48px', scrollMarginTop: '145px' }}>
                                {/* Category Header */}
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    gap: '12px',
                                    marginBottom: '18px',
                                    paddingBottom: '12px',
                                    borderBottom: '1px solid rgba(255, 255, 255, 0.09)',
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <span style={{
                                            width: '8px',
                                            height: '22px',
                                            borderRadius: '999px',
                                            background: 'linear-gradient(180deg, #FF2D78, #E2C286)',
                                            display: 'inline-block',
                                        }} aria-hidden="true" />
                                        <h2 style={{
                                            fontFamily: 'Poppins, sans-serif',
                                            fontWeight: 800,
                                            fontSize: 'clamp(1.15rem, 2.2vw, 1.4rem)',
                                            color: '#fff',
                                            margin: 0,
                                            letterSpacing: '-0.02em',
                                        }}>
                                            {cat.label}
                                        </h2>
                                    </div>
                                    <span style={{
                                        fontFamily: 'Poppins, sans-serif',
                                        color: '#e2d6dc',
                                        fontSize: '12px',
                                        fontWeight: 600,
                                        padding: '4px 12px',
                                        borderRadius: '999px',
                                        background: 'rgba(255, 255, 255, 0.06)',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                    }}>
                                        {catServices.length} {catServices.length === 1 ? 'service' : 'services'}
                                    </span>
                                </div>

                                <div className="services-cat-grid">
                                    {catServices.map(service => {
                                        const detailHref = `/services/${service.slug || service.id}`;
                                        return (
                                            <article key={service.id} className="service-catalog-card">
                                                {/* Image & Text */}
                                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', minWidth: 0 }}>
                                                    {service.imageUrl && (
                                                        <Link href={detailHref} style={{ display: 'block', flexShrink: 0, textDecoration: 'none' }}>
                                                            <div style={{
                                                                width: '72px',
                                                                height: '72px',
                                                                borderRadius: '14px',
                                                                overflow: 'hidden',
                                                                border: '1px solid rgba(255, 255, 255, 0.12)',
                                                                background: 'rgba(255, 255, 255, 0.04)',
                                                            }}>
                                                                <img
                                                                    src={service.imageUrl}
                                                                    alt={service.name}
                                                                    width={72}
                                                                    height={72}
                                                                    loading="lazy"
                                                                    decoding="async"
                                                                    style={{ objectFit: 'cover', width: '100%', height: '100%', display: 'block' }}
                                                                />
                                                            </div>
                                                        </Link>
                                                    )}
                                                    <div style={{ flex: 1, minWidth: 0 }}>
                                                        <Link href={detailHref} style={{ textDecoration: 'none' }}>
                                                            <h3 style={{
                                                                fontFamily: 'Poppins, sans-serif',
                                                                fontWeight: 700,
                                                                color: '#fff',
                                                                fontSize: '16px',
                                                                lineHeight: 1.3,
                                                                margin: '0 0 6px',
                                                            }}>
                                                                {service.name}
                                                            </h3>
                                                            {service.description && (
                                                                <p style={{
                                                                    fontFamily: 'Poppins, sans-serif',
                                                                    color: '#d6c8cf',
                                                                    fontSize: '13px',
                                                                    lineHeight: 1.55,
                                                                    margin: 0,
                                                                    display: '-webkit-box',
                                                                    WebkitLineClamp: 2,
                                                                    WebkitBoxOrient: 'vertical',
                                                                    overflow: 'hidden',
                                                                }}>
                                                                    {service.description}
                                                                </p>
                                                            )}
                                                        </Link>
                                                    </div>
                                                </div>

                                                {/* Price & Book */}
                                                <div className="service-card-footer">
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                        <span style={{
                                                            fontFamily: 'Poppins, sans-serif',
                                                            color: '#ff6ba0',
                                                            fontWeight: 700,
                                                            fontSize: '15px',
                                                        }}>
                                                            {service.priceLabel}
                                                        </span>
                                                        <div className="tooltip-container">
                                                            <Info
                                                                size={14}
                                                                color="#d4c3cc"
                                                                aria-label="Final price discussed before we confirm your appointment"
                                                                style={{ cursor: 'help', display: 'block' }}
                                                            />
                                                            <div className="tooltip">Final price discussed before we confirm your appointment</div>
                                                        </div>
                                                    </div>
                                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                        <Link
                                                            href={detailHref}
                                                            className="btn-outline"
                                                            style={{
                                                                fontSize: '12px',
                                                                padding: '8px 14px',
                                                                borderRadius: '999px',
                                                                whiteSpace: 'nowrap',
                                                                color: '#f5ecf0',
                                                                borderColor: 'rgba(255, 255, 255, 0.16)',
                                                            }}
                                                        >
                                                            Details
                                                        </Link>
                                                        <Link
                                                            href={`/book?service=${service.id}`}
                                                            className="btn-primary"
                                                            style={{
                                                                fontSize: '13px',
                                                                padding: '8px 16px',
                                                                borderRadius: '999px',
                                                                display: 'inline-flex',
                                                                alignItems: 'center',
                                                                gap: '5px',
                                                                whiteSpace: 'nowrap',
                                                            }}
                                                        >
                                                            Book <ChevronRight size={14} aria-hidden="true" />
                                                        </Link>
                                                    </div>
                                                </div>
                                            </article>
                                        );
                                    })}
                                </div>
                            </section>
                        );
                    })
                )}

                <div style={{ textAlign: 'center', paddingTop: '16px' }}>
                    <Link href="/book" className="btn-primary" style={{ fontSize: '15px', padding: '14px 36px', borderRadius: '999px' }}>
                        Book an Appointment <ChevronRight size={15} aria-hidden="true" />
                    </Link>
                </div>
            </div>
        </div>
    );
}
