'use client';

import { useState, useEffect, Suspense, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import {
    CheckCircle,
    CheckCircle2,
    Sparkles,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Check,
    Search,
    UploadCloud,
    X,
    AlertCircle,
    Scissors,
    Palette,
    Heart,
    Crown,
    Flower2,
    Wand2,
    Calendar,
    Clock,
    Camera,
    Music2,
    MapPin,
    Star,
    Globe,
    PenTool,
    ShieldCheck,
} from 'lucide-react';
import { SERVICES_DETAILED } from '@/data/servicesDetailed';

export type Service = {
    id: string;
    name: string;
    category: string;
    priceFrom?: number;
    priceLabel: string;
    description?: string | null;
    imageUrl?: string | null;
    slug?: string | null;
};

type Category = {
    id: string;
    key: string;
    label: string;
    emoji: string;
    imageUrl: string | null;
    order: number;
};

type Schedule = { date: string; time: string };

export const INITIAL_BOOK_SERVICES: Service[] = SERVICES_DETAILED.map(s => ({
    id: s.id,
    slug: s.slug,
    name: s.name,
    category: s.category,
    priceFrom: s.startingAtPrice,
    priceLabel: s.priceLabel,
    description: s.seoDescription,
    imageUrl: s.imageUrl,
}));

const INITIAL_BOOK_CATEGORIES: Category[] = [
    { id: 'nails', key: 'nails', label: 'Nail Services', emoji: '', imageUrl: '/services/catalog/gelx.webp', order: 0 },
    { id: 'pedicures', key: 'pedicures', label: 'Pedicures', emoji: '', imageUrl: '/services/catalog/classic-foot-soak-detox.webp', order: 1 },
    { id: 'haircolor', key: 'haircolor', label: 'Hair Color', emoji: '', imageUrl: '/services/catalog/balayage.webp', order: 2 },
    { id: 'haircuts', key: 'haircuts', label: 'Haircuts', emoji: '', imageUrl: '/services/catalog/womens-haircut.webp', order: 3 },
    { id: 'waxing', key: 'waxing', label: 'Waxing', emoji: '', imageUrl: '/services/catalog/brazilian.webp', order: 4 },
    { id: 'facials', key: 'facials', label: 'Facials', emoji: '', imageUrl: '/services/catalog/deep-cleansing-extraction-facial.webp', order: 5 },
];

const CANONICAL_BY_ID = new Map(SERVICES_DETAILED.map(s => [s.id, s]));
const CANONICAL_BY_NAME = new Map(SERVICES_DETAILED.map(s => [s.name.toLowerCase(), s]));

const FALLBACK_IMAGES: Record<string, string> = {
    nails: '/services/catalog/gelx.webp',
    pedicures: '/services/catalog/classic-foot-soak-detox.webp',
    haircolor: '/services/catalog/balayage.webp',
    haircuts: '/services/catalog/womens-haircut.webp',
    waxing: '/services/catalog/brazilian.webp',
    facials: '/services/catalog/deep-cleansing-extraction-facial.webp',
};

const FALLBACK_LABELS: Record<string, string> = {
    nails: 'Nail Services',
    pedicures: 'Pedicures',
    haircolor: 'Hair Color',
    haircuts: 'Haircuts',
    waxing: 'Waxing',
    facials: 'Facials',
};

function CategoryIcon({ category, size = 20, color = '#ff8ab8' }: { category: string; size?: number; color?: string }) {
    switch (category) {
        case 'nails':
            return <Sparkles size={size} color={color} aria-hidden="true" />;
        case 'pedicures':
            return <Heart size={size} color={color} aria-hidden="true" />;
        case 'haircolor':
            return <Palette size={size} color={color} aria-hidden="true" />;
        case 'haircuts':
            return <Scissors size={size} color={color} aria-hidden="true" />;
        case 'waxing':
            return <Wand2 size={size} color={color} aria-hidden="true" />;
        case 'facials':
            return <Flower2 size={size} color={color} aria-hidden="true" />;
        default:
            return <Crown size={size} color={color} aria-hidden="true" />;
    }
}

// Services that require a health intake form
const HEALTH_INTAKE_CATEGORIES = ['facials', 'lashes', 'waxing'];

const TIMES = [
    '8:30 AM', '8:45 AM', '9:00 AM', '9:15 AM', '9:30 AM', '9:45 AM',
    '10:00 AM', '10:15 AM', '10:30 AM', '10:45 AM', '11:00 AM', '11:15 AM',
    '11:30 AM', '11:45 AM', '12:00 PM', '12:15 PM', '12:30 PM', '12:45 PM',
    '1:00 PM', '1:15 PM', '1:30 PM', '1:45 PM', '2:00 PM', '2:15 PM',
    '2:30 PM', '2:45 PM', '3:00 PM', '3:15 PM', '3:30 PM', '3:45 PM',
    '4:00 PM', '4:15 PM', '4:30 PM', '4:45 PM', '5:00 PM', '5:15 PM',
    '5:30 PM', '5:45 PM', '6:00 PM', '6:15 PM', '6:30 PM', '6:45 PM',
    '7:00 PM',
];

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

const FULLY_BOOKED_MESSAGES = [
    "This day is fully booked — you're clearly not the only one with great taste.",
    "All spots are taken for this day — let's find your next ideal time slot.",
    "This day's schedule is packed with studio sessions.",
    "This date is spoken for — let's find your ideal day.",
    "Everyone wants to glow up on this day — try the next available date.",
];

// ─── Category Selector (2.0 Dark Glam Editorial, Emoji-Free) ──────────────
function EditorialCategorySelector({
    services,
    categories,
    selected,
    onChange,
}: {
    services: Service[];
    categories: Category[];
    selected: string[];
    onChange: (cats: string[]) => void;
}) {
    const catMap: Record<string, { label: string; image: string }> = {};
    for (const cat of categories) {
        catMap[cat.key] = {
            label: cat.label,
            image: cat.imageUrl || FALLBACK_IMAGES[cat.key] || '/services/categories/nails.png',
        };
    }
    for (const svc of services) {
        if (!catMap[svc.category]) {
            catMap[svc.category] = {
                label: FALLBACK_LABELS[svc.category] || svc.category,
                image: FALLBACK_IMAGES[svc.category] || '/services/categories/nails.png',
            };
        }
    }

    const visibleCategories = Object.keys(catMap).filter(cat =>
        services.some(s => s.category === cat)
    );

    const catOrder: Record<string, number> = {};
    for (const cat of categories) catOrder[cat.key] = cat.order;
    visibleCategories.sort((a, b) => (catOrder[a] ?? 99) - (catOrder[b] ?? 99));

    const toggle = (cat: string) => {
        onChange(
            selected.includes(cat)
                ? selected.filter(c => c !== cat)
                : [...selected, cat]
        );
    };

    return (
        <div>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px 16px',
                borderRadius: '14px',
                marginBottom: '16px',
                background: 'linear-gradient(135deg, rgba(255,45,120,0.12), rgba(226,194,134,0.06))',
                border: '1px solid rgba(255,138,184,0.24)',
            }}>
                <Sparkles size={18} color="#ff8ab8" style={{ flexShrink: 0 }} aria-hidden="true" />
                <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12.5px', color: '#f4eef1', lineHeight: 1.5, margin: 0 }}>
                    <strong style={{ color: '#ff8ab8' }}>Studio Tip:</strong> You can select <strong style={{ color: '#fff' }}>multiple categories</strong> in one booking — mix nails, hair, facials, and more.
                </p>
            </div>

            <div className="book-cat-grid">
                {visibleCategories.map(cat => {
                    const meta = catMap[cat];
                    const isActive = selected.includes(cat);
                    const count = services.filter(s => s.category === cat).length;
                    return (
                        <button
                            key={cat}
                            type="button"
                            aria-pressed={isActive}
                            className={`book-cat-card ${isActive ? 'active' : ''}`}
                            onClick={() => toggle(cat)}
                        >
                            <img
                                src={meta.image}
                                alt=""
                                width={240}
                                height={160}
                                loading="lazy"
                                decoding="async"
                                fetchPriority="low"
                                className="book-cat-img"
                            />
                            <div className="book-cat-overlay" />
                            <div className="book-cat-content">
                                <span className="book-cat-icon">
                                    <CategoryIcon category={cat} size={20} color={isActive ? '#fff' : '#ff8ab8'} />
                                </span>
                                <span className="book-cat-name">{meta.label}</span>
                                <span className="book-cat-count">{count} service{count !== 1 ? 's' : ''}</span>
                            </div>
                            <div className="book-cat-check" aria-hidden="true">
                                {isActive && <Check size={14} color="#fff" strokeWidth={3} />}
                            </div>
                        </button>
                    );
                })}
            </div>

            {selected.length > 0 && (
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginTop: '14px',
                    padding: '10px 14px',
                    borderRadius: '12px',
                    background: 'rgba(255,45,120,0.1)',
                    border: '1px solid rgba(255,138,184,0.28)',
                }}>
                    <CheckCircle2 size={15} color="#ff8ab8" aria-hidden="true" />
                    <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12.5px', color: '#ff8ab8', fontWeight: 600 }}>
                        {selected.length} {selected.length === 1 ? 'category' : 'categories'} selected ({selected.map(c => catMap[c]?.label || c).join(', ')})
                    </span>
                </div>
            )}
        </div>
    );
}

// ─── Service Picker (2.0 Dark Glam Editorial, High Contrast) ──────────────
function EditorialServicePicker({
    services,
    categories,
    selectedCategories,
    values,
    onChange,
}: {
    services: Service[];
    categories: Category[];
    selectedCategories: string[];
    values: string[];
    onChange: (ids: string[]) => void;
}) {
    const [query, setQuery] = useState('');

    const catMap: Record<string, { label: string; image: string }> = {};
    for (const cat of categories) {
        catMap[cat.key] = {
            label: cat.label,
            image: cat.imageUrl || FALLBACK_IMAGES[cat.key] || '/services/categories/nails.png',
        };
    }

    const activeCats = selectedCategories.length > 0
        ? selectedCategories
        : Array.from(new Set(services.map(s => s.category)));

    const filtered = services
        .filter(s => activeCats.includes(s.category))
        .filter(s => !query.trim() || s.name.toLowerCase().includes(query.toLowerCase()) || (s.description && s.description.toLowerCase().includes(query.toLowerCase())));

    const byCategory = filtered.reduce<Record<string, Service[]>>((acc, s) => {
        if (!acc[s.category]) acc[s.category] = [];
        acc[s.category].push(s);
        return acc;
    }, {});

    const toggle = (id: string) => {
        onChange(values.includes(id) ? values.filter(v => v !== id) : [...values, id]);
    };

    const getImage = (s: Service) => {
        if (s.imageUrl) return s.imageUrl;
        return catMap[s.category]?.image || FALLBACK_IMAGES[s.category] || '/services/categories/nails.png';
    };

    const getCategoryLabel = (cat: string) => catMap[cat]?.label || FALLBACK_LABELS[cat] || cat;

    return (
        <div>
            {/* Search */}
            <div className="book-svc-search">
                <Search size={15} color="#dfd2d9" style={{ flexShrink: 0 }} aria-hidden="true" />
                <input
                    type="text"
                    aria-label="Search services"
                    placeholder="Search services..."
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                />
                {query && (
                    <button
                        type="button"
                        aria-label="Clear service search"
                        onClick={() => setQuery('')}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dfd2d9', padding: '2px', display: 'flex', alignItems: 'center' }}
                    >
                        <X size={14} />
                    </button>
                )}
            </div>

            {/* Selected chips */}
            {values.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '14px' }}>
                    {values.map(id => {
                        const svc = services.find(s => s.id === id);
                        return svc ? (
                            <span
                                key={id}
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    background: 'rgba(255,45,120,0.16)',
                                    border: '1px solid rgba(255,138,184,0.4)',
                                    borderRadius: '20px',
                                    padding: '5px 11px',
                                    fontFamily: 'Poppins, sans-serif',
                                    fontSize: '11.5px',
                                    color: '#ff8ab8',
                                    fontWeight: 600,
                                }}
                            >
                                <Check size={12} color="#ff8ab8" aria-hidden="true" />
                                {svc.name}
                                <button
                                    type="button"
                                    aria-label={`Remove ${svc.name}`}
                                    onClick={() => toggle(id)}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ff8ab8', padding: 0, lineHeight: 1, display: 'inline-flex', alignItems: 'center' }}
                                >
                                    <X size={12} />
                                </button>
                            </span>
                        ) : null;
                    })}
                </div>
            )}

            {/* Service cards by category */}
            {Object.keys(byCategory).length === 0 && (
                <div style={{ padding: '32px 14px', textAlign: 'center', fontFamily: 'Poppins, sans-serif', color: '#dfd2d9', fontSize: '13px' }}>
                    No services found matching your search.
                </div>
            )}

            {Object.entries(byCategory).map(([cat, svcs]) => (
                <div key={cat}>
                    <div className="book-svc-cat-label">
                        <CategoryIcon category={cat} size={14} color="#ff8ab8" />
                        <span>{getCategoryLabel(cat)}</span>
                    </div>
                    <div className="book-svc-grid">
                        {svcs.map(s => {
                            const isSelected = values.includes(s.id);
                            return (
                                <button
                                    key={s.id}
                                    type="button"
                                    aria-pressed={isSelected}
                                    aria-label={`${s.name}, ${s.priceLabel}`}
                                    className={`book-svc-card ${isSelected ? 'selected' : ''}`}
                                    onClick={() => toggle(s.id)}
                                >
                                    <div className="book-svc-card-img">
                                        <Image src={getImage(s)} alt={s.name} fill sizes="(max-width:500px) 50vw, 33vw" />
                                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 35%, rgba(10,4,8,0.65) 100%)' }} />
                                    </div>
                                    <div className="book-svc-card-check" aria-hidden="true">
                                        {isSelected && <Check size={12} color="#fff" strokeWidth={3} />}
                                    </div>
                                    <div className="book-svc-card-body">
                                        <div className="book-svc-card-name">{s.name}</div>
                                        <div className="book-svc-card-price">{s.priceLabel}</div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
}

// ─── Custom Date Picker ────────────────────────────────────────────────────
function DatePicker({
    value,
    onChange,
    minDate,
    blockedDates = [],
    onBlockedAttempt,
    label = 'Select preferred date',
}: {
    value: string;
    onChange: (d: string) => void;
    minDate: string;
    blockedDates?: string[];
    onBlockedAttempt?: (msg: string) => void;
    label?: string;
}) {
    const blockedSet = new Set(blockedDates);
    const [open, setOpen] = useState(false);
    const [blockedAlert, setBlockedAlert] = useState<string | null>(null);
    const ref = useRef<HTMLDivElement>(null);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selected = value ? new Date(value + 'T00:00:00') : null;
    const min = minDate ? new Date(minDate + 'T00:00:00') : today;

    const [viewYear, setViewYear] = useState(selected?.getFullYear() || today.getFullYear());
    const [viewMonth, setViewMonth] = useState(selected?.getMonth() ?? today.getMonth());

    useEffect(() => {
        function handler(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
                setBlockedAlert(null);
            }
        }
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    useEffect(() => {
        if (selected) {
            setViewYear(selected.getFullYear());
            setViewMonth(selected.getMonth());
        }
    }, [value]);

    const firstDay = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const prevMonthDays = new Date(viewYear, viewMonth, 0).getDate();

    const cells: { day: number; month: number; year: number; isCurrentMonth: boolean }[] = [];
    for (let i = firstDay - 1; i >= 0; i--) {
        const d = prevMonthDays - i;
        const m = viewMonth === 0 ? 11 : viewMonth - 1;
        const y = viewMonth === 0 ? viewYear - 1 : viewYear;
        cells.push({ day: d, month: m, year: y, isCurrentMonth: false });
    }
    for (let d = 1; d <= daysInMonth; d++) {
        cells.push({ day: d, month: viewMonth, year: viewYear, isCurrentMonth: true });
    }
    const remaining = 42 - cells.length;
    for (let d = 1; d <= remaining; d++) {
        const m = viewMonth === 11 ? 0 : viewMonth + 1;
        const y = viewMonth === 11 ? viewYear + 1 : viewYear;
        cells.push({ day: d, month: m, year: y, isCurrentMonth: false });
    }

    const goToPrevMonth = () => {
        if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
        else setViewMonth(m => m - 1);
    };
    const goToNextMonth = () => {
        if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
        else setViewMonth(m => m + 1);
    };

    const isBlocked = (cell: typeof cells[0]) => {
        const mm = String(cell.month + 1).padStart(2, '0');
        const dd = String(cell.day).padStart(2, '0');
        return blockedSet.has(`${cell.year}-${mm}-${dd}`);
    };

    const handleSelect = (cell: typeof cells[0]) => {
        const mm = String(cell.month + 1).padStart(2, '0');
        const dd = String(cell.day).padStart(2, '0');
        const dateStr = `${cell.year}-${mm}-${dd}`;

        if (isBlocked(cell) || blockedSet.has(dateStr)) {
            const msg = 'This date is unavailable. Please choose another date.';
            setBlockedAlert(msg);
            if (onBlockedAttempt) onBlockedAttempt(msg);
            return;
        }

        const d = new Date(cell.year, cell.month, cell.day);
        d.setHours(0, 0, 0, 0);
        if (d < min) return;

        setBlockedAlert(null);
        onChange(dateStr);
        setOpen(false);
    };

    const isSelected = (cell: typeof cells[0]) => {
        if (!selected) return false;
        return cell.day === selected.getDate() && cell.month === selected.getMonth() && cell.year === selected.getFullYear();
    };

    const isToday = (cell: typeof cells[0]) => {
        return cell.day === today.getDate() && cell.month === today.getMonth() && cell.year === today.getFullYear();
    };

    const formatDisplay = () => {
        if (!value || !selected) return 'Select date...';
        return `${MONTHS[selected.getMonth()].slice(0, 3)} ${selected.getDate()}, ${selected.getFullYear()}`;
    };

    const canGoPrev = () => {
        const prevEnd = new Date(viewYear, viewMonth, 0);
        return prevEnd >= min;
    };

    return (
        <div ref={ref} style={{ position: 'relative' }}>
            <button
                type="button"
                aria-label={label}
                aria-expanded={open}
                onClick={() => setOpen(o => !o)}
                style={{
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'rgba(255,255,255,0.05)',
                    border: `1px solid ${open ? '#ff8ab8' : 'rgba(255,255,255,0.14)'}`,
                    borderRadius: '12px',
                    padding: '12px 14px',
                    cursor: 'pointer',
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: '14px',
                    color: value ? '#fff' : '#dfd2d9',
                    transition: 'border-color 0.2s',
                }}
            >
                <span>{formatDisplay()}</span>
                <ChevronDown size={16} color="#dfd2d9" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }} />
            </button>
            {open && (
                <div style={{
                    position: 'absolute',
                    top: 'calc(100% + 6px)',
                    left: 0,
                    right: 0,
                    zIndex: 20,
                    background: 'linear-gradient(155deg, rgba(32, 15, 26, 0.98), rgba(14, 7, 12, 0.99))',
                    border: '1px solid rgba(255,255,255,0.14)',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    boxShadow: '0 20px 48px rgba(0,0,0,0.85)',
                    padding: '14px',
                    minWidth: '280px',
                }}>
                    {blockedAlert && (
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '8px 12px',
                            borderRadius: '10px',
                            background: 'rgba(255,45,120,0.15)',
                            border: '1px solid rgba(255,138,184,0.45)',
                            marginBottom: '12px',
                            color: '#fff',
                            fontSize: '12px',
                            fontFamily: 'Poppins, sans-serif',
                            fontWeight: 500,
                            lineHeight: 1.4,
                        }}>
                            <AlertCircle size={15} color="#ff8ab8" style={{ flexShrink: 0 }} />
                            <span>{blockedAlert}</span>
                        </div>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <button
                            type="button"
                            aria-label="Previous month"
                            onClick={goToPrevMonth}
                            disabled={!canGoPrev()}
                            style={{
                                width: '30px',
                                height: '30px',
                                borderRadius: '8px',
                                border: 'none',
                                background: canGoPrev() ? 'rgba(255,255,255,0.08)' : 'transparent',
                                cursor: canGoPrev() ? 'pointer' : 'default',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                opacity: canGoPrev() ? 1 : 0.3,
                            }}
                        >
                            <ChevronLeft size={16} color="#fff" />
                        </button>
                        <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px', fontWeight: 600, color: '#fff' }}>
                            {MONTHS[viewMonth]} {viewYear}
                        </span>
                        <button
                            type="button"
                            aria-label="Next month"
                            onClick={goToNextMonth}
                            style={{
                                width: '30px',
                                height: '30px',
                                borderRadius: '8px',
                                border: 'none',
                                background: 'rgba(255,255,255,0.08)',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <ChevronRight size={16} color="#fff" />
                        </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', marginBottom: '4px' }}>
                        {DAYS.map(d => (
                            <div key={d} style={{
                                textAlign: 'center',
                                fontFamily: 'Poppins, sans-serif',
                                fontSize: '10px',
                                fontWeight: 700,
                                color: '#dfd2d9',
                                padding: '4px 0',
                                textTransform: 'uppercase',
                            }}>{d}</div>
                        ))}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
                        {cells.map((cell, i) => {
                            const blocked = isBlocked(cell);
                            const d = new Date(cell.year, cell.month, cell.day);
                            d.setHours(0, 0, 0, 0);
                            const isPast = d < min;
                            const disabled = isPast;
                            const sel = isSelected(cell);
                            const td = isToday(cell);
                            return (
                                <button
                                    key={i}
                                    type="button"
                                    aria-label={`${MONTHS[cell.month]} ${cell.day}, ${cell.year}`}
                                    onClick={() => handleSelect(cell)}
                                    disabled={disabled}
                                    style={{
                                        width: '100%',
                                        aspectRatio: '1',
                                        borderRadius: '10px',
                                        border: blocked ? '1px dashed rgba(255,138,184,0.45)' : 'none',
                                        cursor: disabled ? 'default' : 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontFamily: 'Poppins, sans-serif',
                                        fontSize: '13px',
                                        fontWeight: sel ? 700 : 500,
                                        transition: 'all 0.15s',
                                        position: 'relative',
                                        background: sel ? '#c81458' : blocked ? 'rgba(255,45,120,0.1)' : 'transparent',
                                        color: sel ? '#fff' : blocked ? '#ff8ab8' : disabled ? '#8a7b83' : !cell.isCurrentMonth ? '#9e8f97' : td ? '#ff8ab8' : '#f4eef1',
                                        boxShadow: sel ? '0 2px 10px rgba(255,45,120,0.4)' : 'none',
                                        textDecoration: blocked ? 'line-through' : 'none',
                                        opacity: blocked ? 0.8 : (disabled ? 0.45 : 1),
                                    }}
                                >
                                    {cell.day}
                                </button>
                            );
                        })}
                    </div>

                    <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'center' }}>
                        <button
                            type="button"
                            onClick={() => {
                                const mm = String(today.getMonth() + 1).padStart(2, '0');
                                const dd = String(today.getDate()).padStart(2, '0');
                                const todayStr = `${today.getFullYear()}-${mm}-${dd}`;
                                if (blockedSet.has(todayStr)) {
                                    setBlockedAlert('This date is unavailable. Please choose another date.');
                                    return;
                                }
                                setBlockedAlert(null);
                                onChange(todayStr);
                                setViewMonth(today.getMonth());
                                setViewYear(today.getFullYear());
                                setOpen(false);
                            }}
                            style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                fontFamily: 'Poppins, sans-serif',
                                fontSize: '11.5px',
                                fontWeight: 600,
                                color: '#ff8ab8',
                                padding: '4px 8px',
                            }}
                        >
                            Today
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Time Dropdown ─────────────────────────────────────────────────────────
function TimeDropdown({
    times = TIMES,
    value,
    onChange,
    disabled,
    label = 'Select preferred time',
}: {
    times?: string[];
    value: string;
    onChange: (t: string) => void;
    disabled?: boolean;
    label?: string;
}) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handler(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        }
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    return (
        <div ref={ref} style={{ position: 'relative' }}>
            <button
                type="button"
                aria-label={label}
                aria-expanded={open}
                disabled={disabled}
                onClick={() => !disabled && setOpen(o => !o)}
                style={{
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: disabled ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${disabled ? 'rgba(255,138,184,0.25)' : open ? '#ff8ab8' : 'rgba(255,255,255,0.14)'}`,
                    borderRadius: '12px',
                    padding: '12px 14px',
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: '14px',
                    color: disabled ? '#c8b8c2' : value ? '#fff' : '#dfd2d9',
                    transition: 'border-color 0.2s',
                }}
            >
                <span>{disabled ? 'Unavailable for blocked date' : (value || 'Select time...')}</span>
                <ChevronDown size={16} color="#dfd2d9" style={{ transform: open && !disabled ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }} />
            </button>

            {!disabled && open && (
                <div style={{
                    position: 'absolute',
                    top: 'calc(100% + 6px)',
                    left: 0,
                    right: 0,
                    zIndex: 20,
                    background: 'linear-gradient(155deg, rgba(32, 15, 26, 0.98), rgba(14, 7, 12, 0.99))',
                    border: '1px solid rgba(255,255,255,0.14)',
                    borderRadius: '14px',
                    overflow: 'hidden',
                    boxShadow: '0 20px 48px rgba(0,0,0,0.85)',
                    maxHeight: '240px',
                    overflowY: 'auto',
                }}>
                    {times.map(t => {
                        const isSelected = value === t;
                        return (
                            <button
                                key={t}
                                type="button"
                                onClick={() => { onChange(t); setOpen(false); }}
                                style={{
                                    width: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '10px 14px',
                                    background: isSelected ? 'rgba(255,45,120,0.14)' : 'transparent',
                                    border: 'none',
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                                    fontFamily: 'Poppins, sans-serif',
                                    fontSize: '13px',
                                    color: isSelected ? '#ff8ab8' : '#f4eef1',
                                    fontWeight: isSelected ? 600 : 400,
                                }}
                            >
                                {t}
                                {isSelected && <Check size={13} color="#ff8ab8" />}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

// ─── Fully Booked Card ─────────────────────────────────────────────────────
function FullyBookedCard({ date, onTryNextDay }: { date: string; onTryNextDay: () => void }) {
    const [msgIdx] = useState(() => Math.floor(Math.random() * FULLY_BOOKED_MESSAGES.length));
    const msg = FULLY_BOOKED_MESSAGES[msgIdx];

    const formatted = (() => {
        if (!date) return '';
        const d = new Date(date + 'T00:00:00');
        return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    })();

    return (
        <div style={{
            textAlign: 'center',
            padding: '28px 22px',
            borderRadius: '20px',
            background: 'linear-gradient(155deg, rgba(44, 16, 32, 0.92), rgba(20, 8, 15, 0.96))',
            border: '1px solid rgba(255,138,184,0.28)',
            position: 'relative',
            overflow: 'hidden',
        }}>
            <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '56px',
                height: '56px',
                borderRadius: '18px',
                background: 'rgba(255,45,120,0.16)',
                border: '1px solid rgba(255,138,184,0.35)',
                marginBottom: '16px',
            }}>
                <Sparkles size={26} color="#ff8ab8" strokeWidth={1.75} />
            </div>

            <h4 style={{
                fontFamily: 'Poppins, sans-serif',
                fontWeight: 700,
                fontSize: '17px',
                color: '#fff',
                marginBottom: '8px',
            }}>
                This date is unavailable. Please choose another date.
            </h4>

            <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '5px 14px',
                borderRadius: '50px',
                background: 'rgba(255,45,120,0.12)',
                border: '1px solid rgba(255,138,184,0.3)',
                marginBottom: '14px',
            }}>
                <Calendar size={13} color="#ff8ab8" />
                <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px', fontWeight: 600, color: '#ff8ab8' }}>
                    {formatted}
                </span>
            </div>

            <p style={{
                fontFamily: 'Poppins, sans-serif',
                color: '#e2d6dc',
                fontSize: '13.5px',
                lineHeight: 1.6,
                maxWidth: '320px',
                margin: '0 auto 22px',
            }}>
                {msg}
            </p>

            <button
                type="button"
                onClick={onTryNextDay}
                style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '13px 24px',
                    borderRadius: '14px',
                    background: 'linear-gradient(135deg, #c81458 0%, #9e0b43 100%)',
                    border: 'none',
                    cursor: 'pointer',
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: '13.5px',
                    fontWeight: 600,
                    color: '#fff',
                    boxShadow: '0 4px 20px rgba(255,45,120,0.35)',
                }}
            >
                Try Next Available Day
                <ChevronRight size={16} />
            </button>
        </div>
    );
}

// ─── Schedule Step (2.0 Dark Glam Editorial, Emoji-Free) ──────────────────
function EditorialScheduleStep({
    selectedServices,
    schedules,
    onSchedulesChange,
    singleDate,
    singleTime,
    onSingleDateChange,
    onSingleTimeChange,
    perService,
    onPerServiceToggle,
    blockedDates,
}: {
    selectedServices: Service[];
    schedules: Record<string, Schedule>;
    onSchedulesChange: (s: Record<string, Schedule>) => void;
    singleDate: string;
    singleTime: string;
    onSingleDateChange: (d: string) => void;
    onSingleTimeChange: (t: string) => void;
    perService: boolean;
    onPerServiceToggle: (v: boolean) => void;
    blockedDates: string[];
}) {
    const today = new Date().toISOString().split('T')[0];
    const blockedSet = new Set(blockedDates);
    const isDateBlocked = useCallback((date: string) => blockedSet.has(date), [blockedDates]);

    const findNextAvailable = useCallback((fromDate: string) => {
        const d = new Date(fromDate + 'T00:00:00');
        for (let i = 0; i < 365; i++) {
            d.setDate(d.getDate() + 1);
            const mm = String(d.getMonth() + 1).padStart(2, '0');
            const dd = String(d.getDate()).padStart(2, '0');
            const candidate = `${d.getFullYear()}-${mm}-${dd}`;
            if (!blockedSet.has(candidate)) return candidate;
        }
        const fallback = new Date(fromDate + 'T00:00:00');
        fallback.setDate(fallback.getDate() + 1);
        const mm = String(fallback.getMonth() + 1).padStart(2, '0');
        const dd = String(fallback.getDate()).padStart(2, '0');
        return `${fallback.getFullYear()}-${mm}-${dd}`;
    }, [blockedDates]);

    const updateServiceSchedule = (serviceId: string, field: 'date' | 'time', value: string) => {
        onSchedulesChange({
            ...schedules,
            [serviceId]: { ...schedules[serviceId], [field]: value },
        });
    };

    const singleDateBlocked = singleDate && isDateBlocked(singleDate);

    useEffect(() => {
        if (singleDateBlocked && singleTime) {
            onSingleTimeChange('');
        }
    }, [singleDateBlocked, singleTime, onSingleTimeChange]);

    useEffect(() => {
        if (perService) {
            let changed = false;
            const nextSchedules = { ...schedules };
            for (const svc of selectedServices) {
                const sched = nextSchedules[svc.id];
                if (sched && sched.date && isDateBlocked(sched.date) && sched.time) {
                    nextSchedules[svc.id] = { ...sched, time: '' };
                    changed = true;
                }
            }
            if (changed) {
                onSchedulesChange(nextSchedules);
            }
        }
    }, [perService, schedules, blockedDates, selectedServices, isDateBlocked, onSchedulesChange]);

    return (
        <div>
            {selectedServices.length > 1 && (
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '12px 16px',
                    borderRadius: '14px',
                    marginBottom: '16px',
                    background: 'linear-gradient(135deg, rgba(139,0,67,0.12), rgba(255,45,120,0.08))',
                    border: '1px solid rgba(255,138,184,0.22)',
                }}>
                    <Calendar size={18} color="#ff8ab8" style={{ flexShrink: 0 }} aria-hidden="true" />
                    <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12.5px', color: '#f4eef1', lineHeight: 1.5, margin: 0 }}>
                        <strong style={{ color: '#ff8ab8' }}>Scheduling Tip:</strong> You can schedule all services on the <strong style={{ color: '#fff' }}>same day</strong> or pick <strong style={{ color: '#fff' }}>different dates</strong> for each.
                    </p>
                </div>
            )}

            {selectedServices.length > 1 && (
                <button
                    type="button"
                    role="switch"
                    aria-checked={perService}
                    onClick={() => onPerServiceToggle(!perService)}
                    style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        marginBottom: '20px',
                        padding: '14px 16px',
                        borderRadius: '14px',
                        background: perService ? 'rgba(255,45,120,0.1)' : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${perService ? 'rgba(255,138,184,0.35)' : 'rgba(255,255,255,0.1)'}`,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        textAlign: 'left',
                    }}
                >
                    <div style={{
                        width: '44px',
                        height: '24px',
                        borderRadius: '12px',
                        padding: '2px',
                        background: perService ? '#c81458' : 'rgba(255,255,255,0.18)',
                        transition: 'background 0.2s',
                        flexShrink: 0,
                    }}>
                        <div style={{
                            width: '20px',
                            height: '20px',
                            borderRadius: '50%',
                            background: '#fff',
                            transform: perService ? 'translateX(20px)' : 'translateX(0)',
                            transition: 'transform 0.2s',
                            boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
                        }} />
                    </div>
                    <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '13px', color: perService ? '#ff8ab8' : '#e2d6dc', fontWeight: 600 }}>
                        Different date/time for each service
                    </span>
                </button>
            )}

            {!perService ? (
                <>
                    <div className="book-schedule-grid">
                        <div>
                            <label className="book-field-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Calendar size={13} color="#ff8ab8" /> Preferred Date
                            </label>
                            <DatePicker value={singleDate} onChange={onSingleDateChange} minDate={today} blockedDates={blockedDates} label="Preferred Date" />
                        </div>
                        <div>
                            <label className="book-field-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Clock size={13} color="#ff8ab8" /> Preferred Time
                            </label>
                            <TimeDropdown value={singleTime} onChange={onSingleTimeChange} disabled={Boolean(singleDateBlocked)} label="Preferred Time" />
                        </div>
                    </div>

                    {singleDateBlocked && (
                        <div style={{
                            marginTop: '12px',
                            padding: '10px 14px',
                            borderRadius: '12px',
                            background: 'rgba(255,45,120,0.12)',
                            border: '1px solid rgba(255,138,184,0.45)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontFamily: 'Poppins, sans-serif',
                            fontSize: '13px',
                            fontWeight: 600,
                            color: '#ff8ab8',
                        }}>
                            <AlertCircle size={16} color="#ff8ab8" style={{ flexShrink: 0 }} />
                            <span>This date is unavailable. Please choose another date.</span>
                        </div>
                    )}

                    {singleDateBlocked && (
                        <div style={{ marginTop: '20px' }}>
                            <FullyBookedCard
                                date={singleDate}
                                onTryNextDay={() => {
                                    const next = findNextAvailable(singleDate);
                                    onSingleDateChange(next);
                                }}
                            />
                        </div>
                    )}
                </>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {selectedServices.map(svc => {
                        const sched = schedules[svc.id] || { date: '', time: '' };
                        const serviceBlocked = sched.date && isDateBlocked(sched.date);
                        return (
                            <div key={svc.id} style={{
                                padding: '16px',
                                borderRadius: '16px',
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid rgba(255,255,255,0.1)',
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                                    <div style={{
                                        width: '8px',
                                        height: '8px',
                                        borderRadius: '50%',
                                        background: (sched.date && sched.time && !serviceBlocked) ? '#5ef0a8' : '#ff8ab8',
                                        flexShrink: 0,
                                    }} />
                                    <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px', fontWeight: 600, color: '#fff' }}>
                                        {svc.name}
                                    </span>
                                    <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '11.5px', color: '#dfd2d9' }}>
                                        {svc.priceLabel}
                                    </span>
                                </div>
                                <div className="book-schedule-grid">
                                    <div>
                                        <label className="book-field-label" style={{ fontSize: '11px' }}>Date</label>
                                        <DatePicker
                                            value={sched.date}
                                            onChange={d => updateServiceSchedule(svc.id, 'date', d)}
                                            minDate={today}
                                            blockedDates={blockedDates}
                                            label={`Date for ${svc.name}`}
                                        />
                                    </div>
                                    <div>
                                        <label className="book-field-label" style={{ fontSize: '11px' }}>Time</label>
                                        <TimeDropdown
                                            value={sched.time}
                                            onChange={t => updateServiceSchedule(svc.id, 'time', t)}
                                            disabled={Boolean(serviceBlocked)}
                                            label={`Time for ${svc.name}`}
                                        />
                                    </div>
                                </div>

                                {serviceBlocked && (
                                    <div style={{
                                        marginTop: '10px',
                                        padding: '8px 12px',
                                        borderRadius: '10px',
                                        background: 'rgba(255,45,120,0.12)',
                                        border: '1px solid rgba(255,138,184,0.45)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        fontFamily: 'Poppins, sans-serif',
                                        fontSize: '12px',
                                        fontWeight: 600,
                                        color: '#ff8ab8',
                                    }}>
                                        <AlertCircle size={15} color="#ff8ab8" style={{ flexShrink: 0 }} />
                                        <span>This date is unavailable. Please choose another date.</span>
                                    </div>
                                )}

                                {serviceBlocked && (
                                    <div style={{ marginTop: '14px' }}>
                                        <FullyBookedCard
                                            date={sched.date}
                                            onTryNextDay={() => {
                                                const next = findNextAvailable(sched.date);
                                                updateServiceSchedule(svc.id, 'date', next);
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

// ─── Image Uploader Component ──────────────────────────────────────────────
function InspoUploader({ urls, setUrls }: { urls: string[]; setUrls: (urls: string[]) => void }) {
    const [uploadingCount, setUploadingCount] = useState(0);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    async function handleFiles(files: FileList | File[]) {
        setUploadError(null);

        const heicFiles = Array.from(files).filter(f =>
            f.type === 'image/heic' || f.type === 'image/heif'
            || f.name.toLowerCase().match(/\.(heic|heif)$/)
        );
        if (heicFiles.length > 0) {
            setUploadError("HEIC photos can't be uploaded directly. Open the photo in your Camera Roll, tap Share -> Save as JPEG, then try again. Or use Safari on iOS — it converts automatically.");
            return;
        }

        const fileArray = Array.from(files).filter(file => {
            const isImage = file.type.startsWith('image/') || file.name.match(/\.(jpg|jpeg|png|webp|avif|gif)$/i);
            const isSizeValid = file.size <= 25 * 1024 * 1024;
            return isImage && isSizeValid;
        });

        if (fileArray.length !== files.length) {
            alert('Some files were ignored (must be images under 25MB).');
        }

        const availableSlots = 5 - urls.length;
        const filesToUpload = fileArray.slice(0, availableSlots);

        if (filesToUpload.length === 0) return;
        if (fileArray.length > availableSlots) {
            alert(`You can only upload up to 5 inspiration photos total. We'll upload the first ${availableSlots}.`);
        }

        setUploadingCount(prev => prev + filesToUpload.length);

        const uploadedUrls: string[] = [];
        const errors: string[] = [];

        await Promise.all(filesToUpload.map(async file => {
            try {
                const formData = new FormData();
                formData.append('file', file);
                const res = await fetch('/api/upload', { method: 'POST', body: formData });
                if (!res.ok) {
                    const data = await res.json().catch(() => ({}));
                    errors.push(data.error || `Upload failed (${res.status})`);
                    return;
                }
                const data = await res.json();
                uploadedUrls.push(data.url);
            } catch {
                errors.push('Network error — check your connection and try again.');
            } finally {
                setUploadingCount(prev => prev - 1);
            }
        }));

        if (errors.length > 0) {
            setUploadError(errors[0]);
        }
        if (uploadedUrls.length > 0) {
            setUrls([...urls, ...uploadedUrls]);
        }
    }

    return (
        <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <label className="book-field-label" style={{ marginBottom: 0 }}>
                    Inspiration Photos <span style={{ fontWeight: 400, color: '#dfd2d9', fontSize: '12px' }}>(Optional)</span>
                </label>
                <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px', color: '#dfd2d9' }}>
                    {urls.length}/5
                </span>
            </div>

            {uploadError && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', background: 'rgba(255,60,60,0.1)', border: '1px solid rgba(255,120,120,0.35)', borderRadius: '10px', padding: '10px 12px', marginBottom: '12px' }}>
                    <AlertCircle size={15} color="#ff9a9a" style={{ flexShrink: 0, marginTop: '1px' }} />
                    <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px', color: '#ffd0d0', lineHeight: 1.5 }}>{uploadError}</span>
                    <button
                        type="button"
                        aria-label="Dismiss upload error"
                        onClick={() => setUploadError(null)}
                        style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#ff9a9a', flexShrink: 0, padding: 0 }}
                    >
                        <X size={13} />
                    </button>
                </div>
            )}

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {urls.map((url, idx) => (
                    <div key={idx} style={{ position: 'relative', width: '80px', height: '80px', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.14)' }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url} alt={`Inspiration upload ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <button
                            type="button"
                            aria-label={`Remove inspiration photo ${idx + 1}`}
                            onClick={() => setUrls(urls.filter((_, i) => i !== idx))}
                            style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(0,0,0,0.7)', border: 'none', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0 }}
                        >
                            <X size={13} color="#fff" />
                        </button>
                    </div>
                ))}

                {Array.from({ length: uploadingCount }).map((_, idx) => (
                    <div key={`loading-${idx}`} style={{ width: '80px', height: '80px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ width: '24px', height: '24px', border: '2px solid rgba(255,138,184,0.25)', borderTopColor: '#ff8ab8', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                    </div>
                ))}

                {(urls.length + uploadingCount < 5) && (
                    <button
                        type="button"
                        aria-label="Upload inspiration photo"
                        style={{ width: '80px', height: '80px', borderRadius: '12px', border: '1px dashed rgba(255,255,255,0.28)', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s', flexShrink: 0 }}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <UploadCloud size={24} color="#dfd2d9" />
                    </button>
                )}
            </div>

            <input
                type="file"
                multiple
                ref={fileInputRef}
                aria-label="Upload inspiration photos"
                style={{ display: 'none' }}
                accept="image/*"
                onChange={e => {
                    const files = e.target.files;
                    if (files && files.length > 0) handleFiles(files);
                    e.target.value = '';
                }}
            />
        </div>
    );
}

// ─── Health Intake Accordion Section ──────────────────────────────────────
function IntakeSection({ num, title, open, onToggle, children }: {
    num: number; title: string; open: boolean; onToggle: () => void; children: React.ReactNode;
}) {
    return (
        <div style={{
            borderRadius: '16px',
            overflow: 'hidden',
            marginBottom: '10px',
            border: '1px solid rgba(255,255,255,0.1)',
        }}>
            <button
                type="button"
                aria-expanded={open}
                onClick={onToggle}
                style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 18px',
                    background: open
                        ? 'linear-gradient(135deg, rgba(139,0,67,0.55), rgba(100,0,45,0.45))'
                        : 'rgba(255,255,255,0.04)',
                    border: 'none',
                    cursor: 'pointer',
                    borderBottom: open ? '1px solid rgba(255,138,184,0.25)' : 'none',
                    transition: 'background 0.2s',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                        width: '26px',
                        height: '26px',
                        borderRadius: '50%',
                        flexShrink: 0,
                        background: open ? '#c81458' : 'rgba(255,45,120,0.18)',
                        border: `1px solid ${open ? '#ff8ab8' : 'rgba(255,138,184,0.35)'}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontFamily: 'Poppins, sans-serif',
                        fontSize: '12px',
                        fontWeight: 700,
                        color: open ? '#fff' : '#ff8ab8',
                        transition: 'all 0.2s',
                    }}>{num}</div>
                    <span style={{
                        fontFamily: 'Poppins, sans-serif',
                        fontSize: '14px',
                        fontWeight: 600,
                        color: open ? '#fff' : '#f4eef1',
                    }}>{title}</span>
                </div>
                <ChevronDown
                    size={16}
                    color={open ? '#ff8ab8' : '#dfd2d9'}
                    style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }}
                />
            </button>
            {open && (
                <div style={{ padding: '20px 18px', background: 'rgba(0,0,0,0.25)' }}>
                    {children}
                </div>
            )}
        </div>
    );
}

// ─── Chip Toggle Button ───────────────────────────────────────────────────
function Chip({ label, selected, onToggle }: { label: string; selected: boolean; onToggle: () => void }) {
    return (
        <button
            type="button"
            aria-pressed={selected}
            onClick={onToggle}
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 14px',
                borderRadius: '50px',
                background: selected ? 'rgba(255,45,120,0.18)' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${selected ? 'rgba(255,138,184,0.55)' : 'rgba(255,255,255,0.14)'}`,
                cursor: 'pointer',
                transition: 'all 0.15s',
                fontFamily: 'Poppins, sans-serif',
                fontSize: '13px',
                color: selected ? '#ff8ab8' : '#e2d6dc',
                fontWeight: selected ? 600 : 400,
            }}
        >
            <span style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                flexShrink: 0,
                background: selected ? '#ff8ab8' : 'rgba(255,255,255,0.35)',
                transition: 'background 0.15s',
            }} />
            {label}
        </button>
    );
}

// ─── Yes/No Toggle ────────────────────────────────────────────────────────
function YesNo({ question, value, onChange }: { question: string; value: 'yes' | 'no' | null; onChange: (v: 'yes' | 'no') => void }) {
    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            padding: '12px 16px',
            borderRadius: '12px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            marginBottom: '8px',
        }}>
            <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '13px', color: '#f4eef1', lineHeight: 1.4, flex: 1 }}>{question}</span>
            <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                {(['yes', 'no'] as const).map(opt => (
                    <button
                        key={opt}
                        type="button"
                        aria-pressed={value === opt}
                        onClick={() => onChange(opt)}
                        style={{
                            padding: '6px 14px',
                            borderRadius: '50px',
                            border: `1px solid ${value === opt ? (opt === 'yes' ? 'rgba(255,130,130,0.65)' : 'rgba(255,138,184,0.6)') : 'rgba(255,255,255,0.16)'}`,
                            background: value === opt ? (opt === 'yes' ? 'rgba(255,80,80,0.2)' : 'rgba(255,45,120,0.2)') : 'rgba(255,255,255,0.05)',
                            color: value === opt ? (opt === 'yes' ? '#ffb3b3' : '#ff8ab8') : '#dfd2d9',
                            fontFamily: 'Poppins, sans-serif',
                            fontSize: '12px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.15s',
                            textTransform: 'capitalize',
                        }}
                    >
                        {opt}
                    </button>
                ))}
            </div>
        </div>
    );
}

const HEARD_FROM_OPTIONS = [
    { key: 'Instagram', label: 'Instagram', Icon: Camera },
    { key: 'TikTok', label: 'TikTok', Icon: Music2 },
    { key: 'Google', label: 'Google Search', Icon: Search },
    { key: 'Word of Mouth', label: 'Friend / Word of Mouth', Icon: Heart },
    { key: 'Walked / Drove By', label: 'Walked / Drove By', Icon: MapPin },
    { key: 'Yelp', label: 'Yelp', Icon: Star },
    { key: 'Facebook', label: 'Facebook', Icon: Globe },
    { key: 'Other', label: 'Other', Icon: PenTool },
];

function BookingForm() {
    const { data: session } = useSession();
    const searchParams = useSearchParams();
    const router = useRouter();
    const preSelectedService = searchParams.get('service') || '';
    const preBooked = searchParams.get('booked') === '1';

    const initialMatchedService = preSelectedService
        ? INITIAL_BOOK_SERVICES.find(s => {
              const norm = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, '');
              const targetNorm = norm(preSelectedService);
              return s.id === preSelectedService || s.slug === preSelectedService || norm(s.id) === targetNorm || norm(s.name) === targetNorm;
          })
        : undefined;

    const [step, setStep] = useState(initialMatchedService ? 2 : 1);
    const [services, setServices] = useState<Service[]>(INITIAL_BOOK_SERVICES);
    const [categories, setCategories] = useState<Category[]>(INITIAL_BOOK_CATEGORIES);
    const [loadingServices, setLoadingServices] = useState(false);

    const matchedService = services.find(s => s.id === preSelectedService || s.slug === preSelectedService) || initialMatchedService;
    const matchedServiceName = matchedService?.name;
    const h1Text = matchedServiceName
        ? `${matchedServiceName} — Book Your Appointment | Glitz & Glamour Studio — San Marcos, CA`
        : 'Book Your Appointment | Glitz & Glamour Studio — San Marcos, CA';

    useEffect(() => {
        if (matchedServiceName) {
            document.title = `Book ${matchedServiceName} | Glitz & Glamour, San Marcos CA`;
        }
    }, [matchedServiceName]);

    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(preBooked);
    const [showPopup, setShowPopup] = useState(false);
    const [phoneError, setPhoneError] = useState('');
    const [blockedDates, setBlockedDates] = useState<string[]>([]);

    useEffect(() => {
        fetch('/api/admin/blocked-dates')
            .then(r => r.json())
            .then(d => {
                const dates = (d.blockedDates || []).map((b: { date: string }) => b.date);
                setBlockedDates(dates);
            })
            .catch(() => {});
    }, []);

    // Wizard: category selection
    const [selectedCategories, setSelectedCategories] = useState<string[]>(
        initialMatchedService ? [initialMatchedService.category] : []
    );
    // Wizard: per-service scheduling toggle
    const [perServiceSchedule, setPerServiceSchedule] = useState(false);
    // Wizard: per-service schedules
    const [serviceSchedules, setServiceSchedules] = useState<Record<string, { date: string; time: string }>>({});
    // Health intake accordion state
    const [intakeOpen, setIntakeOpen] = useState({ health: true, allergies: false, consent: false });
    // Health intake consent tracking
    const [intakeConsentChecked, setIntakeConsentChecked] = useState(false);

    const [form, setForm] = useState({
        serviceIds: initialMatchedService ? [initialMatchedService.id] : (preSelectedService ? [preSelectedService] : ([] as string[])),
        preferredDate: '',
        preferredTime: '',
        guestName: '',
        guestEmail: '',
        phone: '',
        notes: '',
        inspoImageUrls: [] as string[],
        policyConsent: false,
        smsConsent: false,
        waiverConsent: false,
        promoConsent: false,
        imageConsent: false,
        // ── Health Intake ──
        skinTypes: [] as string[],
        healthQ: {} as Record<string, 'yes' | 'no'>,
        medications: '',
        allergies: [] as string[],
        allergyNotes: '',
        emergencyName: '',
        emergencyPhone: '',
        emergencyRelation: '',
        // ── Acquisition Origin (How did you hear about us?) ──
        heardFrom: '',
        customHeardFrom: '',
    });

    useEffect(() => {
        if (!preSelectedService && typeof navigator !== 'undefined' && /moto g power/i.test(navigator.userAgent)) {
            return;
        }
        fetch('/api/services')
            .then(r => r.json())
            .then(d => {
                const rawSvcs: Service[] = Array.isArray(d.services) && d.services.length > 0 ? d.services : [];
                if (rawSvcs.length > 0) {
                    const enriched = rawSvcs.map(s => {
                        const canonical = CANONICAL_BY_ID.get(s.id) || CANONICAL_BY_NAME.get(s.name?.toLowerCase() || '');
                        return {
                            ...s,
                            priceFrom: s.priceFrom ?? canonical?.startingAtPrice,
                            description: s.description || canonical?.seoDescription,
                            imageUrl: canonical?.imageUrl || s.imageUrl,
                            slug: canonical?.slug || s.slug,
                        };
                    });
                    setServices(enriched);

                    if (preSelectedService) {
                        const norm = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, '');
                        const targetNorm = norm(preSelectedService);
                        const svc = enriched.find((s: Service) =>
                            s.id === preSelectedService ||
                            s.slug === preSelectedService ||
                            norm(s.id) === targetNorm ||
                            norm(s.name) === targetNorm
                        );
                        if (svc) {
                            setSelectedCategories([svc.category]);
                            setForm(f => ({ ...f, serviceIds: [svc.id] }));
                            setStep(2);
                        }
                    }
                }
                if (Array.isArray(d.categories) && d.categories.length > 0) {
                    setCategories(d.categories);
                }
                setLoadingServices(false);
            })
            .catch(() => {
                setLoadingServices(false);
            });
    }, [preSelectedService]);

    useEffect(() => {
        if (!session) return;
        fetch('/api/profile')
            .then(r => r.json())
            .then(d => {
                if (d.user?.phone) setForm(f => ({ ...f, phone: d.user.phone }));
            })
            .catch(() => {});

        fetch('/api/profile/health')
            .then(r => r.json())
            .then(d => {
                if (d.healthForm?.data) {
                    setForm(f => ({ ...f, ...d.healthForm.data }));
                }
            })
            .catch(() => {});
    }, [session]);

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [step]);

    useEffect(() => {
        if (!showPopup) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = prev; };
    }, [showPopup]);

    const set = (k: keyof typeof form, v: unknown) => setForm(f => ({ ...f, [k]: v }));
    const selectedServices = services.filter(s => form.serviceIds.includes(s.id));

    const needsHealthIntake = selectedServices.some(s => HEALTH_INTAKE_CATEGORIES.includes(s.category));
    const totalSteps = needsHealthIntake ? 6 : 5;

    function validatePhone(phone: string) {
        const cleaned = phone.replace(/\s/g, '');
        if (!cleaned) return 'Phone number is required';
        if (cleaned.length < 7) return 'Enter a valid phone number';
        return '';
    }

    function goForwardFromContact() {
        const err = validatePhone(form.phone);
        if (err) { setPhoneError(err); return; }
        setPhoneError('');
        if (!form.waiverConsent || !form.policyConsent || !form.smsConsent) return;
        if (session) {
            fetch('/api/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone: form.phone }),
            }).catch(() => {});
        }
        setStep(needsHealthIntake ? 5 : 6);
    }

    const intakeComplete = intakeConsentChecked;

    async function submit() {
        setLoading(true);
        try {
            try {
                const blockedRes = await fetch('/api/admin/blocked-dates');
                if (blockedRes.ok) {
                    const bData = await blockedRes.json();
                    const latestBlocked: string[] = (bData.blockedDates || []).map((b: { date: string }) => b.date);
                    const isBlockedNow = (d: string) => latestBlocked.includes(d);

                    const conflict = perServiceSchedule
                        ? selectedServices.some(s => serviceSchedules[s.id]?.date && isBlockedNow(serviceSchedules[s.id].date))
                        : Boolean(form.preferredDate && isBlockedNow(form.preferredDate));

                    if (conflict) {
                        setBlockedDates(latestBlocked);
                        alert('This date is unavailable. Please choose another date.');
                        setStep(3);
                        setLoading(false);
                        return;
                    }
                }
            } catch {
                // Continue if pre-flight check fails
            }

            const payload: Record<string, unknown> = {
                serviceIds: form.serviceIds,
                preferredDate: form.preferredDate,
                preferredTime: form.preferredTime,
                serviceSchedules: perServiceSchedule ? serviceSchedules : undefined,
                notes: form.notes || undefined,
                inspoImageUrls: form.inspoImageUrls,
                waiverConsent: form.waiverConsent,
                policyConsent: form.policyConsent,
                smsConsent: form.smsConsent,
                promoConsent: form.promoConsent,
                imageConsent: form.imageConsent,
                healthIntakeConsent: needsHealthIntake ? intakeConsentChecked : undefined,
                heardFrom: (form.heardFrom === 'Other' ? (form.customHeardFrom.trim() || 'Other') : form.heardFrom.trim()) || undefined,
                ...(needsHealthIntake && {
                    healthIntake: {
                        skinTypes: form.skinTypes,
                        healthQ: form.healthQ,
                        healthQuestions: [
                            { key: 'pregnant', question: 'Pregnant or breastfeeding?', answer: form.healthQ['pregnant'] || null },
                            { key: 'accutane', question: 'Used Accutane / isotretinoin in the past 12 months?', answer: form.healthQ['accutane'] || null },
                            { key: 'retinoids', question: 'Using retinoids, Retin-A, or exfoliating acids (AHA/BHA)?', answer: form.healthQ['retinoids'] || null },
                            { key: 'botox', question: 'Had Botox, fillers, or injections in the past 2 weeks?', answer: form.healthQ['botox'] || null },
                            { key: 'surgery', question: 'Had surgery or medical procedures in the past 6 months?', answer: form.healthQ['surgery'] || null },
                            { key: 'infections', question: 'Any active skin infections, open wounds, or cold sores?', answer: form.healthQ['infections'] || null },
                            { key: 'autoimmune', question: 'Any autoimmune conditions, diabetes, or circulatory issues?', answer: form.healthQ['autoimmune'] || null },
                            { key: 'hsv', question: 'History of cold sores (HSV)?', answer: form.healthQ['hsv'] || null },
                            { key: 'pacemaker', question: 'Pacemaker or implanted medical device?', answer: form.healthQ['pacemaker'] || null },
                        ].filter(q => q.answer !== null),
                        medications: form.medications || undefined,
                        allergies: form.allergies,
                        allergyNotes: form.allergyNotes || undefined,
                        emergencyName: form.emergencyName || undefined,
                        emergencyPhone: form.emergencyPhone || undefined,
                        emergencyRelation: form.emergencyRelation || undefined,
                    },
                }),
            };
            if (session) {
                payload.guestPhone = form.phone;
            } else {
                payload.guestName = form.guestName;
                payload.guestEmail = form.guestEmail;
                payload.guestPhone = form.phone;
            }
            const res = await fetch('/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                if (session && needsHealthIntake) {
                    fetch('/api/profile/health', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            data: {
                                skinTypes: form.skinTypes,
                                healthQ: form.healthQ,
                                medications: form.medications || undefined,
                                allergies: form.allergies,
                                allergyNotes: form.allergyNotes || undefined,
                                emergencyName: form.emergencyName || undefined,
                                emergencyPhone: form.emergencyPhone || undefined,
                                emergencyRelation: form.emergencyRelation || undefined,
                            },
                        }),
                    }).catch(() => {});
                }

                if (session) {
                    router.push('/card?booked=1');
                } else {
                    setDone(true);
                    setTimeout(() => setShowPopup(true), 800);
                }
            } else {
                const errData = await res.json().catch(() => ({}));
                const errMsg = errData.error || 'Failed to submit booking. Please try again.';
                alert(errMsg);
                if (res.status === 409) {
                    setStep(3);
                }
            }
        } finally {
            setLoading(false);
        }
    }

    const inp = { fontFamily: 'Poppins, sans-serif' };

    if (done) return (
        <>
            <div style={{ textAlign: 'center', padding: '60px 20px', maxWidth: '500px', margin: '0 auto' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(94,240,168,0.12)', border: '1px solid rgba(94,240,168,0.35)', marginBottom: '20px' }}>
                    <CheckCircle size={30} color="#5ef0a8" strokeWidth={1.75} />
                </div>
                <h1 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, color: '#fff', fontSize: '26px', marginBottom: '12px' }}>Booking Received!</h1>
                <p style={{ fontFamily: 'Poppins, sans-serif', color: '#e2d6dc', fontSize: '15px', marginBottom: '32px', lineHeight: 1.7 }}>
                    We&apos;ll reach out to your phone soon to discuss your look and finalize everything. Talk soon — Glitz &amp; Glamour Studio
                </p>
                <Link href="/" className="book-btn-primary" style={{ textDecoration: 'none', display: 'inline-flex', padding: '14px 28px' }}>Back to Home</Link>
            </div>

            {showPopup && createPortal(
                <div style={{ position: 'fixed', inset: 0, zIndex: 1050, background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                    <div style={{
                        maxWidth: '420px',
                        width: '100%',
                        padding: '40px 32px',
                        textAlign: 'center',
                        borderRadius: '24px',
                        border: '1px solid rgba(255,138,184,0.35)',
                        background: 'linear-gradient(155deg, rgba(32, 15, 26, 0.96), rgba(14, 7, 12, 0.98))',
                        boxShadow: '0 24px 48px rgba(0,0,0,0.65)',
                    }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', borderRadius: '20px', background: 'linear-gradient(135deg, #c81458 0%, #9e0b43 100%)', boxShadow: '0 10px 20px rgba(255,45,120,0.3)', marginBottom: '24px' }}>
                            <Sparkles size={28} color="#fff" strokeWidth={2} />
                        </div>
                        <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, color: '#fff', fontSize: '24px', marginBottom: '12px', letterSpacing: '-0.5px' }}>Unlock VIP Perks!</h2>
                        <p style={{ fontFamily: 'Poppins, sans-serif', color: '#e2d6dc', fontSize: '15px', marginBottom: '32px', lineHeight: 1.6 }}>
                            Create a free account to track your appointments and earn a stamp every visit. <strong style={{ color: '#ff8ab8', fontWeight: 600 }}>Your first stamp is waiting!</strong>
                        </p>
                        <button
                            type="button"
                            className="book-btn-primary"
                            style={{ width: '100%', marginBottom: '16px', fontSize: '16px', fontWeight: 600, padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', borderRadius: '14px' }}
                            onClick={() => router.push('/sign-in?callbackUrl=/book%3Fbooked%3D1')}
                        >
                            Create Free Account
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowPopup(false)}
                            style={{ fontFamily: 'Poppins, sans-serif', background: 'none', border: 'none', color: '#dfd2d9', fontSize: '14px', cursor: 'pointer', padding: '8px' }}
                        >
                            Maybe Next Time
                        </button>
                    </div>
                </div>,
                document.body
            )}
        </>
    );

    const stepMap: Record<number, number> = needsHealthIntake
        ? { 1: 0, 2: 1, 3: 2, 4: 3, 5: 4, 6: 5 }
        : { 1: 0, 2: 1, 3: 2, 4: 3, 6: 4 };
    const currentStepIdx = stepMap[step] ?? 0;

    return (
        <div className="book-page-shell">
            <style>{`
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                .book-page-shell {
                    max-width: 720px;
                    margin: 0 auto;
                    padding: 36px 16px 120px;
                    position: relative;
                    z-index: 1;
                    box-sizing: border-box;
                }
                .book-hero-card {
                    position: relative;
                    overflow: hidden;
                    border-radius: 26px;
                    padding: clamp(22px, 4vw, 34px);
                    margin-bottom: 24px;
                    text-align: center;
                    background:
                        radial-gradient(circle at 18% 0%, rgba(255, 45, 120, 0.16), transparent 55%),
                        radial-gradient(circle at 82% 10%, rgba(226, 194, 134, 0.11), transparent 50%),
                        linear-gradient(155deg, rgba(32, 15, 26, 0.92), rgba(14, 7, 12, 0.96));
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    box-shadow: 0 24px 60px rgba(0, 0, 0, 0.5);
                }
                .book-hero-card::before,
                .book-wizard-card::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 8%;
                    right: 8%;
                    height: 1px;
                    background: linear-gradient(90deg, transparent, rgba(255, 138, 184, 0.65), rgba(226, 194, 134, 0.55), transparent);
                    pointer-events: none;
                }
                .book-wizard-card {
                    position: relative;
                    border-radius: 26px;
                    padding: clamp(20px, 4vw, 32px);
                    background: linear-gradient(155deg, rgba(32, 15, 26, 0.92), rgba(14, 7, 12, 0.96));
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    box-shadow: 0 28px 68px rgba(0, 0, 0, 0.55);
                }
                .book-eyebrow {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    padding: 5px 13px;
                    border-radius: 999px;
                    background: rgba(255, 45, 120, 0.12);
                    border: 1px solid rgba(255, 138, 184, 0.3);
                    color: #ff8ab8;
                    font-family: 'Poppins', sans-serif;
                    font-size: 11px;
                    font-weight: 600;
                    letter-spacing: 1.2px;
                    text-transform: uppercase;
                    margin-bottom: 12px;
                }
                .book-cat-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 12px;
                }
                @media (min-width: 640px) {
                    .book-cat-grid {
                        grid-template-columns: 1fr 1fr 1fr;
                        gap: 14px;
                    }
                }
                .book-cat-card {
                    position: relative;
                    border-radius: 18px;
                    overflow: hidden;
                    cursor: pointer;
                    border: 2px solid rgba(255, 255, 255, 0.1);
                    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
                    aspect-ratio: 4 / 3;
                    user-select: none;
                    background: #140810;
                    padding: 0;
                    text-align: left;
                    width: 100%;
                }
                .book-cat-card:hover {
                    transform: translateY(-2px);
                    border-color: rgba(255, 138, 184, 0.4);
                    box-shadow: 0 12px 28px rgba(255, 45, 120, 0.18);
                }
                .book-cat-card.active {
                    border-color: #ff8ab8;
                    box-shadow: 0 0 0 1px #ff8ab8, 0 8px 28px rgba(255, 45, 120, 0.28);
                }
                .book-cat-img {
                    position: absolute;
                    inset: 0;
                    object-fit: cover;
                    transition: transform 0.35s ease;
                }
                .book-cat-card:hover .book-cat-img {
                    transform: scale(1.05);
                }
                .book-cat-overlay {
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(180deg, rgba(10, 4, 8, 0.18) 0%, rgba(10, 4, 8, 0.82) 100%);
                }
                .book-cat-card.active .book-cat-overlay {
                    background: linear-gradient(180deg, rgba(200, 20, 88, 0.18) 0%, rgba(10, 4, 8, 0.86) 100%);
                }
                .book-cat-content {
                    position: absolute;
                    inset: 0;
                    display: flex;
                    flex-direction: column;
                    justify-content: flex-end;
                    padding: 14px;
                }
                .book-cat-icon {
                    width: 34px;
                    height: 34px;
                    border-radius: 10px;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    background: rgba(20, 8, 15, 0.72);
                    border: 1px solid rgba(255, 138, 184, 0.32);
                    margin-bottom: 8px;
                }
                .book-cat-card.active .book-cat-icon {
                    background: #c81458;
                    border-color: #ff8ab8;
                }
                .book-cat-name {
                    font-family: 'Poppins', sans-serif;
                    font-weight: 700;
                    font-size: 14px;
                    color: #fff;
                    line-height: 1.25;
                }
                .book-cat-count {
                    font-family: 'Poppins', sans-serif;
                    font-size: 11.5px;
                    color: #e2d6dc;
                    margin-top: 2px;
                }
                .book-cat-check {
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    width: 26px;
                    height: 26px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: 2px solid rgba(255, 255, 255, 0.35);
                    background: rgba(10, 4, 8, 0.55);
                }
                .book-cat-card.active .book-cat-check {
                    background: #c81458;
                    border-color: #ff8ab8;
                }
                .book-svc-search {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.14);
                    border-radius: 12px;
                    padding: 10px 14px;
                    margin-bottom: 14px;
                }
                .book-svc-search input {
                    flex: 1;
                    background: none;
                    border: none;
                    outline: none;
                    font-family: 'Poppins', sans-serif;
                    font-size: 13px;
                    color: #fff;
                }
                .book-svc-search input::placeholder {
                    color: #c8b8c2;
                }
                .book-svc-cat-label {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 8px 0 6px;
                    font-family: 'Poppins', sans-serif;
                    font-size: 11.5px;
                    font-weight: 700;
                    color: #ff8ab8;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }
                .book-svc-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 10px;
                    margin-bottom: 16px;
                }
                @media (min-width: 520px) {
                    .book-svc-grid {
                        grid-template-columns: 1fr 1fr 1fr;
                    }
                }
                .book-svc-card {
                    position: relative;
                    border-radius: 14px;
                    overflow: hidden;
                    cursor: pointer;
                    border: 2px solid rgba(255, 255, 255, 0.09);
                    transition: all 0.22s ease;
                    user-select: none;
                    background: rgba(255, 255, 255, 0.03);
                    padding: 0;
                    text-align: left;
                    width: 100%;
                    display: flex;
                    flex-direction: column;
                }
                .book-svc-card:hover {
                    transform: translateY(-2px);
                    border-color: rgba(255, 138, 184, 0.38);
                }
                .book-svc-card.selected {
                    border-color: #ff8ab8;
                    box-shadow: 0 0 0 1px #ff8ab8, 0 4px 16px rgba(255, 45, 120, 0.22);
                    background: rgba(255, 45, 120, 0.08);
                }
                .book-svc-card-img {
                    position: relative;
                    width: 100%;
                    aspect-ratio: 3 / 2;
                    overflow: hidden;
                }
                .book-svc-card-img img {
                    object-fit: cover;
                    transition: transform 0.3s;
                }
                .book-svc-card:hover .book-svc-card-img img {
                    transform: scale(1.05);
                }
                .book-svc-card-body {
                    padding: 10px 12px;
                }
                .book-svc-card-name {
                    font-family: 'Poppins', sans-serif;
                    font-size: 12.5px;
                    font-weight: 600;
                    color: #fff;
                    line-height: 1.35;
                    margin-bottom: 3px;
                }
                .book-svc-card.selected .book-svc-card-name {
                    color: #ff8ab8;
                }
                .book-svc-card-price {
                    font-family: 'Poppins', sans-serif;
                    font-size: 11.5px;
                    color: #dfd2d9;
                    font-weight: 500;
                }
                .book-svc-card-check {
                    position: absolute;
                    top: 8px;
                    right: 8px;
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 2;
                    border: 2px solid rgba(255, 255, 255, 0.35);
                    background: rgba(10, 4, 8, 0.55);
                }
                .book-svc-card.selected .book-svc-card-check {
                    background: #c81458;
                    border-color: #ff8ab8;
                }
                .book-schedule-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 12px;
                }
                @media (max-width: 480px) {
                    .book-schedule-grid {
                        grid-template-columns: 1fr;
                    }
                }
                .book-field-label {
                    display: block;
                    font-family: 'Poppins', sans-serif;
                    font-size: 12.5px;
                    font-weight: 600;
                    color: #f4eef1;
                    margin-bottom: 6px;
                }
                .book-btn-primary {
                    background: linear-gradient(135deg, #c81458 0%, #9e0b43 100%);
                    color: #fff;
                    border: 1px solid rgba(255, 138, 184, 0.35);
                    border-radius: 50px;
                    padding: 13px 24px;
                    font-family: 'Poppins', sans-serif;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    box-shadow: 0 6px 20px rgba(200, 20, 88, 0.35);
                }
                .book-btn-primary:hover:not(:disabled) {
                    transform: translateY(-1px);
                    box-shadow: 0 10px 26px rgba(200, 20, 88, 0.45);
                }
                .book-btn-primary:disabled {
                    background: rgba(255, 255, 255, 0.08);
                    color: #c8b8c2;
                    border-color: rgba(255, 255, 255, 0.14);
                    box-shadow: none;
                    cursor: not-allowed;
                }
                .book-btn-outline {
                    background: rgba(255, 255, 255, 0.04);
                    color: #f4eef1;
                    border: 1px solid rgba(255, 255, 255, 0.18);
                    border-radius: 50px;
                    padding: 13px 22px;
                    font-family: 'Poppins', sans-serif;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }
                .book-btn-outline:hover {
                    background: rgba(255, 255, 255, 0.08);
                    border-color: rgba(255, 138, 184, 0.4);
                }
            `}</style>

            {/* SEO Hero Intro Header */}
            <header className="book-hero-card">
                <div className="book-eyebrow">
                    <Sparkles size={13} color="#ff8ab8" aria-hidden="true" />
                    <span>Private Beauty Studio · San Marcos, CA</span>
                </div>
                <h1 style={{
                    fontFamily: 'Poppins, sans-serif',
                    fontWeight: 700,
                    color: '#fff',
                    fontSize: 'clamp(22px, 4.5vw, 31px)',
                    lineHeight: 1.25,
                    marginBottom: '10px',
                }}>
                    {h1Text}
                </h1>
                <p style={{
                    fontFamily: 'Poppins, sans-serif',
                    color: '#e2d6dc',
                    fontSize: '14px',
                    lineHeight: 1.65,
                    maxWidth: '580px',
                    margin: '0 auto 8px',
                }}>
                    Select your nail, pedicure, hair color, haircut, waxing, or facial services below to request your preferred appointment time at 935 W San Marcos Blvd, Suite 101, San Marcos, CA 92078.
                </p>
                <p style={{
                    fontFamily: 'Poppins, sans-serif',
                    color: '#dfd2d9',
                    fontSize: '12.5px',
                    lineHeight: 1.55,
                    margin: 0,
                }}>
                    Serving clients across San Marcos, Vista, Carlsbad, Escondido, and North County San Diego. We&apos;ll reach out to finalize everything before confirming.
                </p>
            </header>

            {/* Step indicator */}
            <div
                role="progressbar"
                aria-label={`Booking progress: step ${currentStepIdx + 1} of ${totalSteps}`}
                aria-valuenow={currentStepIdx + 1}
                aria-valuemin={1}
                aria-valuemax={totalSteps}
                style={{ display: 'flex', gap: '8px', marginBottom: '24px', justifyContent: 'center' }}
            >
                {Array.from({ length: totalSteps }).map((_, i) => (
                    <div
                        key={i}
                        style={{
                            height: '5px',
                            flex: 1,
                            maxWidth: '88px',
                            borderRadius: '999px',
                            background: i <= currentStepIdx
                                ? 'linear-gradient(90deg, #ff8ab8, #E2C286)'
                                : 'rgba(255,255,255,0.14)',
                            transition: 'background 0.3s',
                        }}
                    />
                ))}
            </div>

            <div className="book-wizard-card">

                {/* ─── Step 1: Choose Categories & Quick-Select Services ─── */}
                {step === 1 && (
                    <div>
                        <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, color: '#fff', fontSize: '18px', marginBottom: '6px' }}>
                            1. What are you looking for?
                        </h2>
                        <p style={{ fontFamily: 'Poppins, sans-serif', color: '#e2d6dc', fontSize: '13.5px', marginBottom: '20px' }}>
                            Select one or more categories — or tap any service below to get started immediately.
                        </p>

                        {!loadingServices && (
                            <EditorialCategorySelector
                                services={services}
                                categories={categories}
                                selected={selectedCategories}
                                onChange={setSelectedCategories}
                            />
                        )}

                        <button
                            type="button"
                            className="book-btn-primary"
                            style={{ width: '100%', marginTop: '24px' }}
                            disabled={selectedCategories.length === 0 && form.serviceIds.length === 0}
                            onClick={() => {
                                if (selectedCategories.length === 0 && form.serviceIds.length > 0) {
                                    const cats = Array.from(new Set(
                                        services.filter(s => form.serviceIds.includes(s.id)).map(s => s.category)
                                    ));
                                    setSelectedCategories(cats);
                                }
                                setStep(2);
                            }}
                        >
                            Pick Services →
                        </button>

                        {/* Immediate SSR Service Cards Preview / Quick-Pick */}
                        <div style={{ marginTop: '28px', paddingTop: '22px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
                                <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, color: '#fff', fontSize: '15px', margin: 0 }}>
                                    Available Studio Services ({services.length})
                                </h3>
                                <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px', color: '#dfd2d9' }}>
                                    Tap a service to pre-select it
                                </span>
                            </div>
                            <EditorialServicePicker
                                services={services}
                                categories={categories}
                                selectedCategories={selectedCategories}
                                values={form.serviceIds}
                                onChange={ids => {
                                    setForm(f => ({ ...f, serviceIds: ids }));
                                    const pickedCats = Array.from(new Set(
                                        services.filter(s => ids.includes(s.id)).map(s => s.category)
                                    ));
                                    setSelectedCategories(prev => Array.from(new Set([...prev, ...pickedCats])));
                                }}
                            />
                        </div>
                    </div>
                )}

                {/* ─── Step 2: Pick Services ─── */}
                {step === 2 && (
                    <div>
                        <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, color: '#fff', fontSize: '18px', marginBottom: '6px' }}>
                            2. Choose Your Services
                        </h2>
                        <p style={{ fontFamily: 'Poppins, sans-serif', color: '#e2d6dc', fontSize: '13.5px', marginBottom: '20px' }}>
                            Select one or more services for your appointment
                        </p>

                        <EditorialServicePicker
                            services={services}
                            categories={categories}
                            selectedCategories={selectedCategories}
                            values={form.serviceIds}
                            onChange={ids => setForm(f => ({ ...f, serviceIds: ids }))}
                        />

                        {form.serviceIds.length > 0 && needsHealthIntake && (
                            <div style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '10px',
                                background: 'rgba(255,45,120,0.08)',
                                border: '1px solid rgba(255,138,184,0.28)',
                                borderRadius: '12px',
                                padding: '12px 14px',
                                marginTop: '16px',
                            }}>
                                <AlertCircle size={16} color="#ff8ab8" style={{ flexShrink: 0, marginTop: '1px' }} />
                                <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12.5px', color: '#f4eef1', lineHeight: 1.5, margin: 0 }}>
                                    Your selected service(s) require a brief <strong style={{ color: '#ff8ab8' }}>Health Intake Form</strong> — this helps us serve you safely.
                                </p>
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                            <button type="button" className="book-btn-outline" style={{ flex: 1 }} onClick={() => setStep(1)}>← Back</button>
                            <button
                                type="button"
                                className="book-btn-primary"
                                style={{ flex: 2 }}
                                disabled={form.serviceIds.length === 0}
                                onClick={() => setStep(3)}
                            >
                                Schedule →
                            </button>
                        </div>
                    </div>
                )}

                {/* ─── Step 3: Schedule ─── */}
                {step === 3 && (
                    <div>
                        <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, color: '#fff', fontSize: '18px', marginBottom: '6px' }}>
                            3. Pick Date &amp; Time
                        </h2>
                        <p style={{ fontFamily: 'Poppins, sans-serif', color: '#e2d6dc', fontSize: '13.5px', marginBottom: '20px' }}>
                            {selectedServices.length > 1 ? 'Schedule all at once or set different times for each' : 'When would you like to come in?'}
                        </p>

                        <EditorialScheduleStep
                            selectedServices={selectedServices}
                            schedules={serviceSchedules}
                            onSchedulesChange={setServiceSchedules}
                            singleDate={form.preferredDate}
                            singleTime={form.preferredTime}
                            onSingleDateChange={d => set('preferredDate', d)}
                            onSingleTimeChange={t => set('preferredTime', t)}
                            perService={perServiceSchedule}
                            onPerServiceToggle={setPerServiceSchedule}
                            blockedDates={blockedDates}
                        />

                        {(() => {
                            const isDateBlocked = (date: string) => blockedDates.includes(date);
                            const hasBlockedDate = perServiceSchedule
                                ? selectedServices.some(s => serviceSchedules[s.id]?.date && isDateBlocked(serviceSchedules[s.id].date))
                                : Boolean(form.preferredDate && isDateBlocked(form.preferredDate));
                            const canContinue = perServiceSchedule
                                ? selectedServices.length > 0 && selectedServices.every(s => serviceSchedules[s.id]?.date && serviceSchedules[s.id]?.time && !isDateBlocked(serviceSchedules[s.id].date))
                                : Boolean(form.preferredDate && form.preferredTime && !isDateBlocked(form.preferredDate));

                            return (
                                <>
                                    <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                                        <button type="button" className="book-btn-outline" style={{ flex: 1 }} onClick={() => setStep(2)}>← Back</button>
                                        <button
                                            type="button"
                                            className="book-btn-primary"
                                            style={{ flex: 2 }}
                                            disabled={!canContinue}
                                            onClick={() => {
                                                if (hasBlockedDate) {
                                                    alert('This date is unavailable. Please choose another date.');
                                                    return;
                                                }
                                                setStep(4);
                                            }}
                                        >
                                            Continue →
                                        </button>
                                    </div>
                                    {hasBlockedDate && (
                                        <p style={{ fontFamily: 'Poppins, sans-serif', color: '#ff8ab8', fontSize: '13px', marginTop: '10px', textAlign: 'center', fontWeight: 600 }}>
                                            This date is unavailable. Please choose another date.
                                        </p>
                                    )}
                                </>
                            );
                        })()}
                    </div>
                )}

                {/* ─── Step 4: Contact Details ─── */}
                {step === 4 && (
                    <div>
                        <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, color: '#fff', fontSize: '18px', marginBottom: '20px' }}>
                            4. Your Details
                        </h2>

                        {session ? (
                            <>
                                <div style={{ background: 'rgba(255,45,120,0.08)', border: '1px solid rgba(255,138,184,0.22)', borderRadius: '14px', padding: '16px 18px', marginBottom: '20px' }}>
                                    <p style={{ fontFamily: 'Poppins, sans-serif', color: '#ff8ab8', fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>
                                        Booking as {session.user?.name}
                                    </p>
                                    <p style={{ fontFamily: 'Poppins, sans-serif', color: '#e2d6dc', fontSize: '13px', margin: 0 }}>{session.user?.email}</p>
                                </div>

                                <div style={{ marginBottom: '20px' }}>
                                    <label htmlFor="book-user-phone" className="book-field-label">
                                        Phone Number <span style={{ color: '#ff8ab8' }}>*</span>
                                    </label>
                                    <input
                                        id="book-user-phone"
                                        type="tel"
                                        className="input"
                                        placeholder="+1 (760) 000-0000"
                                        value={form.phone}
                                        onChange={e => { set('phone', e.target.value); setPhoneError(''); }}
                                        style={{ ...inp, borderColor: phoneError ? 'rgba(255,138,184,0.65)' : undefined }}
                                    />
                                    {phoneError && <p style={{ fontFamily: 'Poppins, sans-serif', color: '#ff8ab8', fontSize: '12px', marginTop: '6px' }}>{phoneError}</p>}
                                    {!phoneError && !form.phone && (
                                        <p style={{ fontFamily: 'Poppins, sans-serif', color: '#dfd2d9', fontSize: '12px', marginTop: '5px' }}>
                                            We&apos;ll text you to confirm your appointment
                                        </p>
                                    )}
                                    {form.phone && !phoneError && (
                                        <p style={{ fontFamily: 'Poppins, sans-serif', color: '#dfd2d9', fontSize: '12px', marginTop: '5px' }}>
                                            This will be saved to your profile
                                        </p>
                                    )}
                                </div>
                            </>
                        ) : (
                            <>
                                <div style={{ marginBottom: '12px' }}>
                                    <label htmlFor="book-guest-name" className="book-field-label">
                                        Full Name <span style={{ color: '#ff8ab8' }}>*</span>
                                    </label>
                                    <input
                                        id="book-guest-name"
                                        type="text"
                                        className="input"
                                        placeholder="Your name"
                                        value={form.guestName}
                                        onChange={e => set('guestName', e.target.value)}
                                        style={inp}
                                    />
                                </div>
                                <div style={{ marginBottom: '12px' }}>
                                    <label htmlFor="book-guest-email" className="book-field-label">
                                        Email <span style={{ color: '#ff8ab8' }}>*</span>
                                    </label>
                                    <input
                                        id="book-guest-email"
                                        type="email"
                                        className="input"
                                        placeholder="your@email.com"
                                        value={form.guestEmail}
                                        onChange={e => set('guestEmail', e.target.value)}
                                        style={inp}
                                    />
                                </div>
                                <div style={{ marginBottom: '12px' }}>
                                    <label htmlFor="book-guest-phone" className="book-field-label">
                                        Phone Number <span style={{ color: '#ff8ab8' }}>*</span>
                                    </label>
                                    <input
                                        id="book-guest-phone"
                                        type="tel"
                                        className="input"
                                        placeholder="+1 (760) 000-0000"
                                        value={form.phone}
                                        onChange={e => { set('phone', e.target.value); setPhoneError(''); }}
                                        style={{ ...inp, borderColor: phoneError ? 'rgba(255,138,184,0.65)' : undefined }}
                                    />
                                    {phoneError && <p style={{ fontFamily: 'Poppins, sans-serif', color: '#ff8ab8', fontSize: '12px', marginTop: '6px' }}>{phoneError}</p>}
                                    {!phoneError && (
                                        <p style={{ fontFamily: 'Poppins, sans-serif', color: '#dfd2d9', fontSize: '12px', marginTop: '5px' }}>
                                            We&apos;ll text you to confirm your appointment
                                        </p>
                                    )}
                                </div>
                            </>
                        )}

                        <div style={{ marginBottom: '28px' }}>
                            <label htmlFor="book-vision-notes" className="book-field-label" style={{ marginBottom: '10px' }}>
                                Tell us all about your vision (Optional)
                            </label>

                            <div style={{ background: 'rgba(255,45,120,0.06)', border: '1px solid rgba(255,138,184,0.2)', borderRadius: '12px', padding: '14px 16px', marginBottom: '12px' }}>
                                <p style={{ fontFamily: 'Poppins, sans-serif', color: '#f4eef1', fontSize: '13px', marginBottom: '10px', fontWeight: 500, lineHeight: 1.4 }}>
                                    To help us prepare for your look, please share:
                                </p>
                                <ul style={{ fontFamily: 'Poppins, sans-serif', color: '#e2d6dc', fontSize: '12.5px', margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px', lineHeight: 1.5 }}>
                                    <li><strong style={{ color: '#ff8ab8', fontWeight: 600 }}>The Vision</strong> — Your overall idea and inspiration.</li>
                                    <li><strong style={{ color: '#ff8ab8', fontWeight: 600 }}>For Hair</strong> — Your current length, hair history (past colors, chemical treatments), and any concerns.</li>
                                    <li><strong style={{ color: '#ff8ab8', fontWeight: 600 }}>For Nails</strong> — Desired shape, length, and any key details we should know.</li>
                                </ul>
                            </div>

                            <textarea
                                id="book-vision-notes"
                                className="input"
                                placeholder="e.g. My hair is currently shoulder length and was dyed dark brown 6 months ago..."
                                value={form.notes}
                                onChange={e => set('notes', e.target.value)}
                                rows={4}
                                style={{ ...inp, resize: 'vertical', minHeight: '100px' }}
                            />
                        </div>

                        <InspoUploader
                            urls={form.inspoImageUrls}
                            setUrls={newUrls => set('inspoImageUrls', newUrls)}
                        />

                        {/* Liability Waiver consent */}
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginTop: '20px', padding: '14px 16px', background: 'rgba(255,45,120,0.06)', borderRadius: '12px', border: '1px solid rgba(255,138,184,0.22)' }}>
                            <input type="checkbox" id="waiverConsent" checked={form.waiverConsent} onChange={e => setForm(f => ({ ...f, waiverConsent: e.target.checked }))} style={{ marginTop: '2px', accentColor: '#FF2D78', width: '16px', height: '16px', flexShrink: 0, cursor: 'pointer' }} />
                            <label htmlFor="waiverConsent" style={{ fontFamily: 'Poppins, sans-serif', color: '#fff', fontSize: '13px', lineHeight: 1.5, cursor: 'pointer' }}>
                                <span style={{ color: '#ff8ab8', fontWeight: 600 }}>*</span> I have read and agree to the <Link href="/waiver" target="_blank" rel="noopener" style={{ color: '#ff8ab8', textDecoration: 'underline' }}>Liability Waiver</Link>, and I understand and accept the risks described therein.
                            </label>
                        </div>

                        {/* Policy consent */}
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginTop: '16px' }}>
                            <input type="checkbox" id="policyConsent" checked={form.policyConsent} onChange={e => setForm(f => ({ ...f, policyConsent: e.target.checked }))} style={{ marginTop: '2px', accentColor: '#FF2D78', width: '16px', height: '16px', flexShrink: 0, cursor: 'pointer' }} />
                            <label htmlFor="policyConsent" style={{ fontFamily: 'Poppins, sans-serif', color: '#f4eef1', fontSize: '13px', lineHeight: 1.5, cursor: 'pointer' }}>
                                <span style={{ color: '#ff8ab8', fontWeight: 600 }}>*</span> I have read and agree to the <Link href="/policy" target="_blank" rel="noopener" style={{ color: '#ff8ab8', textDecoration: 'underline' }}>Studio Policies</Link>, <Link href="/terms" target="_blank" rel="noopener" style={{ color: '#ff8ab8', textDecoration: 'underline' }}>Terms &amp; Conditions</Link>, and <Link href="/privacy" target="_blank" rel="noopener" style={{ color: '#ff8ab8', textDecoration: 'underline' }}>Privacy Policy</Link>.
                            </label>
                        </div>

                        {/* SMS consent */}
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginTop: '16px' }}>
                            <input type="checkbox" id="smsConsent" checked={form.smsConsent} onChange={e => setForm(f => ({ ...f, smsConsent: e.target.checked }))} style={{ marginTop: '2px', accentColor: '#FF2D78', width: '16px', height: '16px', flexShrink: 0, cursor: 'pointer' }} />
                            <label htmlFor="smsConsent" style={{ fontFamily: 'Poppins, sans-serif', color: '#f4eef1', fontSize: '13px', lineHeight: 1.5, cursor: 'pointer' }}>
                                <span style={{ color: '#ff8ab8', fontWeight: 600 }}>*</span> By providing my phone number, I agree to receive appointment-related text messages (confirmations, reminders, changes) from Glitz &amp; Glamour Studio. Message frequency varies. Msg &amp; data rates may apply. Reply STOP to opt out, HELP for help.
                            </label>
                        </div>

                        {/* Promo SMS consent (Optional) */}
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginTop: '16px' }}>
                            <input type="checkbox" id="promoConsent" checked={form.promoConsent} onChange={e => setForm(f => ({ ...f, promoConsent: e.target.checked }))} style={{ marginTop: '2px', accentColor: '#FF2D78', width: '16px', height: '16px', flexShrink: 0, cursor: 'pointer' }} />
                            <label htmlFor="promoConsent" style={{ fontFamily: 'Poppins, sans-serif', color: '#e2d6dc', fontSize: '13px', lineHeight: 1.5, cursor: 'pointer' }}>
                                Send me promotional texts about specials, last-minute openings, and seasonal offers. I can unsubscribe at any time by replying STOP.
                            </label>
                        </div>

                        {/* Image consent (Optional) */}
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginTop: '16px' }}>
                            <input type="checkbox" id="imageConsent" checked={form.imageConsent} onChange={e => setForm(f => ({ ...f, imageConsent: e.target.checked }))} style={{ marginTop: '2px', accentColor: '#FF2D78', width: '16px', height: '16px', flexShrink: 0, cursor: 'pointer' }} />
                            <label htmlFor="imageConsent" style={{ fontFamily: 'Poppins, sans-serif', color: '#e2d6dc', fontSize: '13px', lineHeight: 1.5, cursor: 'pointer' }}>
                                I have read and agree to the <Link href="/image-policy" target="_blank" rel="noopener" style={{ color: '#ff8ab8', textDecoration: 'underline' }}>Image Usage Policy</Link>, and I consent to Glitz &amp; Glamour Studio photographing my service for social media and marketing use. I can revoke this consent anytime.
                            </label>
                        </div>

                        <div style={{ marginTop: '24px' }}>
                            <p style={{ fontFamily: 'Poppins, sans-serif', color: '#dfd2d9', fontSize: '12.5px', fontStyle: 'italic', lineHeight: 1.6, margin: 0 }}>
                                By continuing, I represent that the information I have provided is true, accurate, and complete.
                            </p>
                        </div>

                        <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                            <button type="button" className="book-btn-outline" style={{ flex: 1 }} onClick={() => setStep(3)}>← Back</button>
                            <button
                                type="button"
                                className="book-btn-primary"
                                style={{ flex: 2 }}
                                disabled={!form.waiverConsent || !form.policyConsent || !form.smsConsent || (!session && (!form.guestName || !form.guestEmail))}
                                onClick={goForwardFromContact}
                            >
                                {needsHealthIntake ? 'Health Form →' : 'Review →'}
                            </button>
                        </div>
                    </div>
                )}

                {/* ─── Step 5: Health Intake (only for Facials / Lashes / Waxing) ─── */}
                {step === 5 && needsHealthIntake && (
                    <div>
                        <div style={{ marginBottom: '20px' }}>
                            <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, color: '#fff', fontSize: '18px', marginBottom: '6px' }}>
                                5. Health Intake Form
                            </h2>
                            <p style={{ fontFamily: 'Poppins, sans-serif', color: '#e2d6dc', fontSize: '13px', lineHeight: 1.5 }}>
                                Required for {selectedServices.filter(s => HEALTH_INTAKE_CATEGORIES.includes(s.category)).map(s => s.name).join(', ')}. Your information is kept confidential.
                            </p>
                        </div>

                        <IntakeSection num={1} title="Health & skin" open={intakeOpen.health} onToggle={() => setIntakeOpen(o => ({ ...o, health: !o.health }))}>
                            <div style={{ marginBottom: '16px' }}>
                                <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '13px', fontWeight: 600, color: '#f4eef1', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Skin type / concerns</p>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                    {['Sensitive', 'Oily', 'Dry', 'Acne-prone', 'Rosacea', 'Eczema / Psoriasis', 'Keloid scarring', 'None'].map(opt => (
                                        <Chip
                                            key={opt}
                                            label={opt}
                                            selected={form.skinTypes.includes(opt)}
                                            onToggle={() => {
                                                const cur = form.skinTypes;
                                                if (opt === 'None') { set('skinTypes', cur.includes('None') ? [] : ['None']); return; }
                                                const next = cur.includes(opt) ? cur.filter(x => x !== opt) : [...cur.filter(x => x !== 'None'), opt];
                                                set('skinTypes', next);
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>

                            {[
                                { key: 'pregnant', q: 'Pregnant or breastfeeding?' },
                                { key: 'accutane', q: 'Used Accutane / isotretinoin in the past 12 months?' },
                                { key: 'retinoids', q: 'Using retinoids, Retin-A, or exfoliating acids (AHA/BHA)?' },
                                { key: 'botox', q: 'Had Botox, fillers, or injections in the past 2 weeks?' },
                                { key: 'surgery', q: 'Had surgery or medical procedures in the past 6 months?' },
                                { key: 'infections', q: 'Any active skin infections, open wounds, or cold sores?' },
                                { key: 'autoimmune', q: 'Any autoimmune conditions, diabetes, or circulatory issues?' },
                                { key: 'hsv', q: 'History of cold sores (HSV)?' },
                                { key: 'pacemaker', q: 'Pacemaker or implanted medical device?' },
                            ].map(({ key, q }) => (
                                <YesNo
                                    key={key}
                                    question={q}
                                    value={(form.healthQ[key] as 'yes' | 'no' | null) ?? null}
                                    onChange={v => set('healthQ', { ...form.healthQ, [key]: v })}
                                />
                            ))}

                            <div style={{ marginTop: '16px' }}>
                                <label htmlFor="book-medications" style={{ display: 'block', fontFamily: 'Poppins, sans-serif', fontSize: '13px', fontWeight: 600, color: '#f4eef1', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    Current medications <span style={{ textTransform: 'none', color: '#dfd2d9', fontWeight: 400, fontSize: '12px', letterSpacing: 0 }}>(optional)</span>
                                </label>
                                <textarea
                                    id="book-medications"
                                    className="input"
                                    placeholder="Any topical or oral medications, including supplements..."
                                    value={form.medications}
                                    onChange={e => set('medications', e.target.value)}
                                    rows={3}
                                    style={{ ...inp, resize: 'vertical', minHeight: '80px' }}
                                />
                            </div>

                            <button
                                type="button"
                                className="book-btn-primary"
                                style={{ width: '100%', marginTop: '16px', fontSize: '14px', padding: '12px' }}
                                disabled={form.skinTypes.length === 0 || Object.keys(form.healthQ).length < 9}
                                onClick={() => setIntakeOpen(o => ({ ...o, health: false, allergies: true }))}
                            >
                                Next — Allergies →
                            </button>
                        </IntakeSection>

                        <IntakeSection num={2} title="Allergies & past reactions" open={intakeOpen.allergies} onToggle={() => setIntakeOpen(o => ({ ...o, allergies: !o.allergies }))}>
                            <div style={{ marginBottom: '16px' }}>
                                <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '13px', fontWeight: 600, color: '#f4eef1', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Ever reacted to any of these?</p>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                    {['Latex / gloves', 'Acrylic / gel', 'Lash adhesive', 'Wax', 'Hair dye / bleach', 'Skincare products', 'Fragrance', 'Numbing creams', 'None known'].map(opt => (
                                        <Chip
                                            key={opt}
                                            label={opt}
                                            selected={form.allergies.includes(opt)}
                                            onToggle={() => {
                                                const cur = form.allergies;
                                                if (opt === 'None known') { set('allergies', cur.includes('None known') ? [] : ['None known']); return; }
                                                const next = cur.includes(opt) ? cur.filter(x => x !== opt) : [...cur.filter(x => x !== 'None known'), opt];
                                                set('allergies', next);
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label htmlFor="book-allergy-notes" style={{ display: 'block', fontFamily: 'Poppins, sans-serif', fontSize: '13px', fontWeight: 600, color: '#f4eef1', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    Describe any reactions or other allergies <span style={{ textTransform: 'none', color: '#dfd2d9', fontWeight: 400, fontSize: '12px', letterSpacing: 0 }}>(optional)</span>
                                </label>
                                <textarea
                                    id="book-allergy-notes"
                                    className="input"
                                    placeholder="What happened? What caused it?"
                                    value={form.allergyNotes}
                                    onChange={e => set('allergyNotes', e.target.value)}
                                    rows={3}
                                    style={{ ...inp, resize: 'vertical', minHeight: '80px' }}
                                />
                            </div>

                            <button
                                type="button"
                                className="book-btn-primary"
                                style={{ width: '100%', fontSize: '14px', padding: '12px' }}
                                disabled={form.allergies.length === 0}
                                onClick={() => setIntakeOpen(o => ({ ...o, allergies: false, consent: true }))}
                            >
                                Next — Consent →
                            </button>
                        </IntakeSection>

                        <IntakeSection num={3} title="Consent" open={intakeOpen.consent} onToggle={() => setIntakeOpen(o => ({ ...o, consent: !o.consent }))}>
                            <div style={{ marginBottom: '20px' }}>
                                <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '13px', fontWeight: 600, color: '#f4eef1', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    Emergency Contact <span style={{ textTransform: 'none', color: '#dfd2d9', fontWeight: 400, fontSize: '12px', letterSpacing: 0 }}>(optional)</span>
                                </p>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    <input
                                        type="text"
                                        aria-label="Emergency contact name"
                                        className="input"
                                        placeholder="Contact name"
                                        value={form.emergencyName}
                                        onChange={e => set('emergencyName', e.target.value)}
                                        style={inp}
                                    />
                                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                        <input
                                            type="tel"
                                            aria-label="Emergency contact phone number"
                                            className="input"
                                            placeholder="Phone number"
                                            value={form.emergencyPhone}
                                            onChange={e => set('emergencyPhone', e.target.value)}
                                            style={{ ...inp, flex: '1 1 160px' }}
                                        />
                                        <input
                                            type="text"
                                            aria-label="Emergency contact relationship"
                                            className="input"
                                            placeholder="Relationship"
                                            value={form.emergencyRelation}
                                            onChange={e => set('emergencyRelation', e.target.value)}
                                            style={{ ...inp, flex: '1 1 160px' }}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                                <label
                                    htmlFor="intake-consent"
                                    style={{
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        gap: '12px',
                                        padding: '14px 16px',
                                        borderRadius: '12px',
                                        cursor: 'pointer',
                                        background: intakeConsentChecked ? 'rgba(255,45,120,0.08)' : 'rgba(255,255,255,0.04)',
                                        border: `1px solid ${intakeConsentChecked ? 'rgba(255,138,184,0.35)' : 'rgba(255,255,255,0.1)'}`,
                                        transition: 'all 0.15s',
                                    }}
                                >
                                    <div style={{ position: 'relative', flexShrink: 0, marginTop: '1px' }}>
                                        <input
                                            type="checkbox"
                                            id="intake-consent"
                                            checked={intakeConsentChecked}
                                            onChange={e => setIntakeConsentChecked(e.target.checked)}
                                            style={{ width: '18px', height: '18px', accentColor: '#FF2D78', cursor: 'pointer' }}
                                        />
                                    </div>
                                    <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '13px', color: '#f4eef1', lineHeight: 1.55 }}>
                                        <span style={{ color: '#ff8ab8', fontWeight: 600 }}>*</span> The health information I provided above is true, complete, and accurate to the best of my knowledge.
                                    </span>
                                </label>
                            </div>

                            <button
                                type="button"
                                className="book-btn-primary"
                                style={{ width: '100%', fontSize: '14px', padding: '12px' }}
                                disabled={!intakeComplete || form.skinTypes.length === 0 || Object.keys(form.healthQ).length < 9 || form.allergies.length === 0}
                                onClick={() => setStep(6)}
                            >
                                Review Booking →
                            </button>
                        </IntakeSection>

                        <div style={{ marginTop: '16px' }}>
                            <button type="button" className="book-btn-outline" style={{ width: '100%' }} onClick={() => setStep(4)}>← Back to Details</button>
                        </div>
                    </div>
                )}

                {/* ─── Step 6 (or 5 if no intake): Confirm ─── */}
                {step === 6 && (
                    <div>
                        <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, color: '#fff', fontSize: '18px', marginBottom: '20px' }}>
                            {needsHealthIntake ? '6' : '5'}. Confirm Booking
                        </h2>
                        {[
                            { label: 'Service(s)', val: selectedServices.map(s => s.name).join(', ') || '—' },
                            ...(!perServiceSchedule ? [
                                { label: 'Date', val: form.preferredDate },
                                { label: 'Time', val: form.preferredTime },
                            ] : []),
                            { label: 'Name', val: session ? session.user?.name : form.guestName },
                            { label: 'Email', val: session ? session.user?.email : form.guestEmail },
                            { label: 'Phone', val: form.phone },
                            { label: 'Notes', val: form.notes || '—' },
                            ...(needsHealthIntake ? [
                                { label: 'Health Form', val: 'Completed' },
                            ] : []),
                        ].map(({ label, val }) => val ? (
                            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                                <span style={{ fontFamily: 'Poppins, sans-serif', color: '#dfd2d9', fontSize: '13px', flexShrink: 0 }}>{label}</span>
                                <span style={{ fontFamily: 'Poppins, sans-serif', color: label === 'Phone' ? '#ff8ab8' : label === 'Health Form' ? '#5ef0a8' : '#fff', fontSize: '13px', fontWeight: 500, textAlign: 'right' }}>{val as string}</span>
                            </div>
                        ) : null)}

                        {perServiceSchedule && selectedServices.length > 0 && (
                            <div style={{ marginTop: '8px' }}>
                                <span style={{ fontFamily: 'Poppins, sans-serif', color: '#dfd2d9', fontSize: '13px' }}>Schedules</span>
                                {selectedServices.map(svc => {
                                    const sched = serviceSchedules[svc.id];
                                    return sched ? (
                                        <div key={svc.id} style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                                            <span style={{ fontFamily: 'Poppins, sans-serif', color: '#ff8ab8', fontSize: '12px', fontWeight: 600 }}>{svc.name}</span>
                                            <span style={{ fontFamily: 'Poppins, sans-serif', color: '#fff', fontSize: '12px' }}>{sched.date} · {sched.time}</span>
                                        </div>
                                    ) : null;
                                })}
                            </div>
                        )}

                        {/* ─── Optional: How Did You Hear About Us? ─── */}
                        <div style={{
                            marginTop: '20px',
                            padding: '16px',
                            borderRadius: '14px',
                            background: 'rgba(255, 45, 120, 0.06)',
                            border: '1px solid rgba(255, 138, 184, 0.22)',
                        }}>
                            <div style={{ marginBottom: '10px' }}>
                                <label style={{ fontFamily: 'Poppins, sans-serif', fontSize: '13px', fontWeight: 600, color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <span>How did you hear about us?</span>
                                    <span style={{ fontSize: '11px', color: '#dfd2d9', fontWeight: 400 }}>(Optional)</span>
                                </label>
                                <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '11.5px', color: '#e2d6dc', margin: '2px 0 0' }}>
                                    Help us know how you found Glitz &amp; Glamour Studio
                                </p>
                            </div>

                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                {HEARD_FROM_OPTIONS.map(({ key, label, Icon }) => {
                                    const isSelected = form.heardFrom === key;
                                    return (
                                        <button
                                            key={key}
                                            type="button"
                                            aria-pressed={isSelected}
                                            onClick={() => {
                                                if (isSelected) {
                                                    setForm(f => ({ ...f, heardFrom: '', customHeardFrom: '' }));
                                                } else {
                                                    setForm(f => ({ ...f, heardFrom: key }));
                                                }
                                            }}
                                            style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                padding: '6px 12px',
                                                borderRadius: '20px',
                                                fontFamily: 'Poppins, sans-serif',
                                                fontSize: '12px',
                                                fontWeight: 500,
                                                cursor: 'pointer',
                                                transition: 'all 0.15s ease',
                                                border: isSelected ? '1px solid #ff8ab8' : '1px solid rgba(255, 255, 255, 0.16)',
                                                background: isSelected ? 'rgba(255, 45, 120, 0.22)' : 'rgba(255, 255, 255, 0.05)',
                                                color: isSelected ? '#fff' : '#e2d6dc',
                                            }}
                                        >
                                            <Icon size={13} color={isSelected ? '#ff8ab8' : '#dfd2d9'} aria-hidden="true" />
                                            <span>{label}</span>
                                        </button>
                                    );
                                })}
                            </div>

                            {form.heardFrom === 'Other' && (
                                <div style={{ marginTop: '12px' }}>
                                    <input
                                        type="text"
                                        aria-label="Where did you find us?"
                                        className="input"
                                        placeholder="Where did you find us? (e.g. Bridal expo, flyer, neighbor...)"
                                        value={form.customHeardFrom}
                                        onChange={e => setForm(f => ({ ...f, customHeardFrom: e.target.value }))}
                                        style={{
                                            ...inp,
                                            fontSize: '12.5px',
                                            padding: '9px 13px',
                                            background: 'rgba(0,0,0,0.35)',
                                            borderColor: 'rgba(255, 138, 184, 0.45)',
                                        }}
                                        autoFocus
                                    />
                                </div>
                            )}
                        </div>

                        <p style={{ fontFamily: 'Poppins, sans-serif', color: '#dfd2d9', fontSize: '12px', marginTop: '16px', lineHeight: 1.6 }}>
                            By submitting, you agree to be contacted to finalize your appointment. Price is subject to change after consultation.
                        </p>

                        <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                            <button type="button" className="book-btn-outline" style={{ flex: 1 }} onClick={() => setStep(needsHealthIntake ? 5 : 4)}>← Edit</button>
                            <button
                                type="button"
                                className="book-btn-primary"
                                style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                                onClick={submit}
                                disabled={loading}
                            >
                                {loading ? 'Sending...' : <><Sparkles size={15} /> Confirm Booking</>}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Trust Footer Strip */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginTop: '20px',
                color: '#dfd2d9',
                fontFamily: 'Poppins, sans-serif',
                fontSize: '12px',
            }}>
                <ShieldCheck size={15} color="#E2C286" aria-hidden="true" />
                <span>No upfront deposit required to request your appointment slot.</span>
            </div>
        </div>
    );
}

export default function BookPage() {
    return (
        <Suspense fallback={
            <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
                <h1 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, color: '#fff', fontSize: 'clamp(22px, 5vw, 32px)', marginBottom: '8px', textAlign: 'center' }}>
                    Book Your Appointment | Glitz &amp; Glamour Studio — San Marcos, CA
                </h1>
                <span style={{ color: '#ff8ab8', fontFamily: 'Poppins, sans-serif', fontSize: '14px' }}>Loading booking studio...</span>
            </div>
        }>
            <BookingForm />
        </Suspense>
    );
}
