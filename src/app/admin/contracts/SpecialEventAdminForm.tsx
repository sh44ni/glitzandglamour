'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    Copy,
    CheckCircle,
    ExternalLink,
    Plus,
    Trash2,
    ArrowLeft,
    ArrowRight,
    Send,
    FileSignature,
    MapPin,
    DollarSign,
    Shield,
    Users,
    Clock,
    Calendar,
    ChevronLeft,
    ChevronRight,
    Mail,
    Phone,
    Sparkles,
    Check,
    AlertCircle,
    RefreshCw,
    Car,
    AlertTriangle,
    CreditCard,
    FileText,
} from 'lucide-react';
import {
    validateAdminContractPayload,
    type AdminContractPayload,
    type AdminServiceLine,
} from '@/lib/contracts/adminContractPayload';
import {
    CONTRACT_TEMPLATES,
    TEMPLATE_GROUPS,
    dynamicFieldDefaults,
    type DynField,
} from './contractTemplates';

/* ── helpers ── */
const rng = () => `GGS-${String(Math.floor(Math.random() * 1e10)).padStart(10, '0')}`;
const empty = (): AdminServiceLine => ({ description: '', price: '', notes: '' });
const fmt = (n: number) => `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/** Format a phone string as (XXX) XXX-XXXX as the user types. */
function formatPhone(raw: string): string {
    const digits = raw.replace(/\D/g, '').slice(0, 10);
    if (digits.length <= 3) return digits.length ? `(${digits}` : '';
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

/* ── Custom Dropdown for Contract Template ── */
function ContractDropdown({ value, onChange }: { value: string; onChange: (v: string) => void }) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [open]);

    const label = value && CONTRACT_TEMPLATES[value] ? CONTRACT_TEMPLATES[value].title : null;
    const isES = value.endsWith('ES');

    return (
        <div style={{ position: 'relative', width: '100%', zIndex: open ? 60 : 1 }} ref={ref}>
            <button
                type="button"
                style={{
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '12px',
                    padding: '13px 18px',
                    color: '#fff',
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: '14px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    outline: 'none',
                    transition: 'all 0.2s ease',
                }}
                onClick={() => setOpen((o) => !o)}
            >
                {label ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
                        {label}
                        {isES && (
                            <span style={{
                                background: 'rgba(255, 45, 120, 0.15)',
                                color: '#FF6BA8',
                                fontSize: '10px',
                                padding: '2px 7px',
                                borderRadius: '50px',
                                border: '1px solid rgba(255, 45, 120, 0.3)',
                            }}>
                                ES
                            </span>
                        )}
                    </span>
                ) : (
                    <span style={{ color: '#777' }}>-- Choose a contract template --</span>
                )}
                <span style={{ color: '#FF6BA8', fontSize: '12px' }}>▼</span>
            </button>

            {open && (
                <div style={{
                    position: 'absolute',
                    top: 'calc(100% + 6px)',
                    left: 0,
                    right: 0,
                    zIndex: 60,
                    background: 'rgba(20, 20, 28, 0.98)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '16px',
                    padding: '10px',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.8), 0 0 30px rgba(255,45,120,0.1)',
                    backdropFilter: 'blur(20px)',
                    maxHeight: '340px',
                    overflowY: 'auto',
                }}>
                    {TEMPLATE_GROUPS.map((g) => (
                        <div key={g.label} style={{ marginBottom: '10px' }}>
                            <div style={{
                                fontSize: '11px',
                                fontWeight: 700,
                                color: '#888',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                                padding: '6px 12px',
                                fontFamily: 'Poppins, sans-serif',
                            }}>
                                {g.label}
                            </div>
                            {g.keys.map((k) => {
                                const t = CONTRACT_TEMPLATES[k];
                                const isActive = k === value;
                                const isUnavailable = !t.available;
                                return (
                                    <button
                                        key={k}
                                        type="button"
                                        disabled={isUnavailable}
                                        onClick={() => {
                                            if (!isUnavailable) {
                                                onChange(k);
                                                setOpen(false);
                                            }
                                        }}
                                        style={{
                                            width: '100%',
                                            textAlign: 'left',
                                            padding: '10px 14px',
                                            borderRadius: '10px',
                                            background: isActive ? 'rgba(255, 45, 120, 0.18)' : 'transparent',
                                            border: isActive ? '1px solid rgba(255, 45, 120, 0.35)' : '1px solid transparent',
                                            color: isUnavailable ? '#555' : isActive ? '#FF6BA8' : '#eee',
                                            fontFamily: 'Poppins, sans-serif',
                                            fontSize: '13px',
                                            fontWeight: isActive ? 600 : 400,
                                            cursor: isUnavailable ? 'not-allowed' : 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            transition: 'all 0.15s ease',
                                            marginBottom: '3px',
                                        }}
                                    >
                                        <span>
                                            {t.title}
                                            {k.endsWith('ES') && (
                                                <span style={{
                                                    marginLeft: '8px',
                                                    fontSize: '10px',
                                                    background: 'rgba(255, 45, 120, 0.15)',
                                                    color: '#FF6BA8',
                                                    padding: '2px 6px',
                                                    borderRadius: '50px',
                                                }}>
                                                    ES
                                                </span>
                                            )}
                                        </span>
                                        {isUnavailable && (
                                            <span style={{
                                                fontSize: '10px',
                                                background: 'rgba(255, 183, 0, 0.15)',
                                                color: '#FFB700',
                                                padding: '2px 8px',
                                                borderRadius: '50px',
                                                fontWeight: 600,
                                            }}>
                                                Coming Soon
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

/* ── Custom Select for Event Types and Options ── */
function CustomSelect({ options, value, onChange, placeholder }: { options: string[]; value: string; onChange: (v: string) => void; placeholder?: string }) {
    const [open, setOpen] = useState(false);
    const [openUp, setOpenUp] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;
        const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
        document.addEventListener('mousedown', h);
        return () => document.removeEventListener('mousedown', h);
    }, [open]);

    const toggleOpen = () => {
        if (!open && ref.current) {
            const rect = ref.current.getBoundingClientRect();
            const spaceBelow = window.innerHeight - rect.bottom;
            if (spaceBelow < 280 && rect.top > spaceBelow) {
                setOpenUp(true);
            } else {
                setOpenUp(false);
            }
        }
        setOpen((o) => !o);
    };

    const display = value || placeholder || 'Select...';

    return (
        <div style={{ position: 'relative', width: '100%', zIndex: open ? 80 : 1 }} ref={ref}>
            <button
                type="button"
                onClick={toggleOpen}
                style={{
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '12px',
                    padding: '12px 14px',
                    color: value ? '#fff' : '#777',
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: '13px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    outline: 'none',
                }}
            >
                <span>{display}</span>
                <span style={{ color: '#FF6BA8', fontSize: '11px' }}>{openUp ? '▲' : '▼'}</span>
            </button>

            {open && (
                <div style={{
                    position: 'absolute',
                    ...(openUp
                        ? { bottom: 'calc(100% + 6px)', top: 'auto' }
                        : { top: 'calc(100% + 4px)', bottom: 'auto' }),
                    left: 0,
                    right: 0,
                    zIndex: 100,
                    background: 'rgba(22, 22, 30, 0.98)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '14px',
                    padding: '8px',
                    boxShadow: '0 16px 40px rgba(0,0,0,0.7)',
                    backdropFilter: 'blur(16px)',
                    maxHeight: '260px',
                    overflowY: 'auto',
                }}>
                    {options.map((opt) => (
                        <button
                            key={opt}
                            type="button"
                            onClick={() => { onChange(opt); setOpen(false); }}
                            style={{
                                width: '100%',
                                textAlign: 'left',
                                padding: '9px 12px',
                                borderRadius: '8px',
                                background: opt === value ? 'rgba(255, 45, 120, 0.18)' : 'transparent',
                                border: 'none',
                                color: opt === value ? '#FF6BA8' : '#ddd',
                                fontFamily: 'Poppins, sans-serif',
                                fontSize: '13px',
                                fontWeight: opt === value ? 600 : 400,
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                                marginBottom: '2px',
                            }}
                        >
                            {opt}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

/* ── Custom Date & Time Picker Helpers ── */
function parseIsoDate(val: string): Date | null {
    if (!val || typeof val !== 'string' || !val.includes('-')) return null;
    const parts = val.split('-').map((p) => parseInt(p, 10));
    if (parts.length !== 3 || parts.some(isNaN)) return null;
    return new Date(parts[0], parts[1] - 1, parts[2]);
}

function formatIsoDate(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

function formatDateDisplay(val: string): string {
    const d = parseIsoDate(val);
    if (!d) return '';
    return d.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

function CustomDatePicker({
    id,
    value,
    onChange,
    placeholder = 'Select date...',
    style,
}: {
    id?: string;
    value: string;
    onChange: (val: string) => void;
    placeholder?: string;
    style?: React.CSSProperties;
}) {
    const [open, setOpen] = useState(false);
    const [openUp, setOpenUp] = useState(false);
    const initialDate = useMemo(() => parseIsoDate(value) || new Date(), [value]);
    const [viewYear, setViewYear] = useState(initialDate.getFullYear());
    const [viewMonth, setViewMonth] = useState(initialDate.getMonth());
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const d = parseIsoDate(value);
        if (d) {
            setViewYear(d.getFullYear());
            setViewMonth(d.getMonth());
        }
    }, [value]);

    useEffect(() => {
        if (!open) return;
        const h = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', h);
        return () => document.removeEventListener('mousedown', h);
    }, [open]);

    const toggleOpen = () => {
        if (!open && ref.current) {
            const rect = ref.current.getBoundingClientRect();
            const spaceBelow = window.innerHeight - rect.bottom;
            if (spaceBelow < 340 && rect.top > spaceBelow) {
                setOpenUp(true);
            } else {
                setOpenUp(false);
            }
        }
        setOpen((o) => !o);
    };

    const prevMonth = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (viewMonth === 0) {
            setViewMonth(11);
            setViewYear((y) => y - 1);
        } else {
            setViewMonth((m) => m - 1);
        }
    };

    const nextMonth = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (viewMonth === 11) {
            setViewMonth(0);
            setViewYear((y) => y + 1);
        } else {
            setViewMonth((m) => m + 1);
        }
    };

    const prevYear = (e: React.MouseEvent) => {
        e.stopPropagation();
        setViewYear((y) => y - 1);
    };

    const nextYear = (e: React.MouseEvent) => {
        e.stopPropagation();
        setViewYear((y) => y + 1);
    };

    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();
    const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December',
    ];

    const todayStr = formatIsoDate(new Date());

    const selectDate = (year: number, month: number, day: number) => {
        const d = new Date(year, month, day);
        const iso = formatIsoDate(d);
        onChange(iso);
        setOpen(false);
    };

    const display = formatDateDisplay(value) || placeholder;

    return (
        <div ref={ref} style={{ position: 'relative', width: '100%', zIndex: open ? 85 : 1 }}>
            <button
                id={id}
                type="button"
                onClick={toggleOpen}
                style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '12px',
                    padding: '12px 14px',
                    color: value ? '#fff' : '#777',
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: '13px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    outline: 'none',
                    transition: 'border-color 0.2s ease',
                    ...style,
                }}
            >
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {display}
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                    {value && (
                        <span
                            role="button"
                            tabIndex={0}
                            onClick={(e) => {
                                e.stopPropagation();
                                onChange('');
                            }}
                            title="Clear date"
                            style={{
                                color: '#888',
                                fontSize: '14px',
                                lineHeight: 1,
                                cursor: 'pointer',
                                padding: '2px 4px',
                                borderRadius: '4px',
                            }}
                        >
                            ✕
                        </span>
                    )}
                    <Calendar size={15} color="#FF6BA8" />
                </span>
            </button>

            {open && (
                <div style={{
                    position: 'absolute',
                    ...(openUp ? { bottom: 'calc(100% + 6px)', top: 'auto' } : { top: 'calc(100% + 6px)', bottom: 'auto' }),
                    left: 0,
                    width: '300px',
                    maxWidth: 'calc(100vw - 32px)',
                    zIndex: 100,
                    background: 'rgba(18, 18, 26, 0.98)',
                    border: '1px solid rgba(255, 255, 255, 0.14)',
                    borderRadius: '18px',
                    padding: '16px',
                    boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8), 0 0 24px rgba(255, 45, 120, 0.12)',
                    backdropFilter: 'blur(24px)',
                    WebkitBackdropFilter: 'blur(24px)',
                }}>
                    {/* Month & Year Navigation Header */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                        <div style={{ display: 'flex', gap: '4px' }}>
                            <button
                                type="button"
                                onClick={prevYear}
                                title="Previous Year"
                                style={{
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    border: '1px solid rgba(255, 255, 255, 0.08)',
                                    borderRadius: '6px',
                                    padding: '3px 6px',
                                    color: '#888',
                                    fontSize: '11px',
                                    cursor: 'pointer',
                                }}
                            >
                                «
                            </button>
                            <button
                                type="button"
                                onClick={prevMonth}
                                title="Previous Month"
                                style={{
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    border: '1px solid rgba(255, 255, 255, 0.08)',
                                    borderRadius: '6px',
                                    width: '26px',
                                    height: '24px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#ccc',
                                    cursor: 'pointer',
                                }}
                            >
                                <ChevronLeft size={14} />
                            </button>
                        </div>

                        <div style={{ fontWeight: 700, fontSize: '13px', color: '#fff', fontFamily: 'Poppins, sans-serif' }}>
                            {monthNames[viewMonth]} {viewYear}
                        </div>

                        <div style={{ display: 'flex', gap: '4px' }}>
                            <button
                                type="button"
                                onClick={nextMonth}
                                title="Next Month"
                                style={{
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    border: '1px solid rgba(255, 255, 255, 0.08)',
                                    borderRadius: '6px',
                                    width: '26px',
                                    height: '24px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#ccc',
                                    cursor: 'pointer',
                                }}
                            >
                                <ChevronRight size={14} />
                            </button>
                            <button
                                type="button"
                                onClick={nextYear}
                                title="Next Year"
                                style={{
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    border: '1px solid rgba(255, 255, 255, 0.08)',
                                    borderRadius: '6px',
                                    padding: '3px 6px',
                                    color: '#888',
                                    fontSize: '11px',
                                    cursor: 'pointer',
                                }}
                            >
                                »
                            </button>
                        </div>
                    </div>

                    {/* Day Names */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center', marginBottom: '8px' }}>
                        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
                            <span key={d} style={{ fontSize: '10px', fontWeight: 700, color: '#777', textTransform: 'uppercase' }}>
                                {d}
                            </span>
                        ))}
                    </div>

                    {/* Days Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center' }}>
                        {/* Leading days from previous month */}
                        {Array.from({ length: firstDayOfWeek }).map((_, idx) => {
                            const dayNum = daysInPrevMonth - firstDayOfWeek + idx + 1;
                            const prevMonthIdx = viewMonth === 0 ? 11 : viewMonth - 1;
                            const prevYearVal = viewMonth === 0 ? viewYear - 1 : viewYear;
                            return (
                                <button
                                    key={`prev-${idx}`}
                                    type="button"
                                    onClick={() => selectDate(prevYearVal, prevMonthIdx, dayNum)}
                                    style={{
                                        background: 'transparent',
                                        border: 'none',
                                        color: '#444',
                                        fontSize: '12px',
                                        padding: '7px 0',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                    }}
                                >
                                    {dayNum}
                                </button>
                            );
                        })}

                        {/* Current month days */}
                        {Array.from({ length: daysInMonth }).map((_, idx) => {
                            const dayNum = idx + 1;
                            const dIso = formatIsoDate(new Date(viewYear, viewMonth, dayNum));
                            const isSelected = dIso === value;
                            const isToday = dIso === todayStr;

                            return (
                                <button
                                    key={`curr-${dayNum}`}
                                    type="button"
                                    onClick={() => selectDate(viewYear, viewMonth, dayNum)}
                                    style={{
                                        background: isSelected
                                            ? 'linear-gradient(135deg, #FF2D78 0%, #E0005E 100%)'
                                            : isToday
                                            ? 'rgba(255, 45, 120, 0.15)'
                                            : 'transparent',
                                        border: isSelected
                                            ? '1px solid rgba(255, 45, 120, 0.5)'
                                            : isToday
                                            ? '1px solid rgba(255, 45, 120, 0.35)'
                                            : '1px solid transparent',
                                        color: isSelected ? '#fff' : isToday ? '#FF6BA8' : '#ddd',
                                        fontSize: '12px',
                                        fontWeight: isSelected || isToday ? 700 : 500,
                                        padding: '7px 0',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        transition: 'all 0.15s ease',
                                    }}
                                >
                                    {dayNum}
                                </button>
                            );
                        })}

                        {/* Trailing days from next month */}
                        {Array.from({ length: (7 - ((firstDayOfWeek + daysInMonth) % 7)) % 7 }).map((_, idx) => {
                            const dayNum = idx + 1;
                            const nextMonthIdx = viewMonth === 11 ? 0 : viewMonth + 1;
                            const nextYearVal = viewMonth === 11 ? viewYear + 1 : viewYear;
                            return (
                                <button
                                    key={`next-${idx}`}
                                    type="button"
                                    onClick={() => selectDate(nextYearVal, nextMonthIdx, dayNum)}
                                    style={{
                                        background: 'transparent',
                                        border: 'none',
                                        color: '#444',
                                        fontSize: '12px',
                                        padding: '7px 0',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                    }}
                                >
                                    {dayNum}
                                </button>
                            );
                        })}
                    </div>

                    {/* Quick Shortcuts */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginTop: '12px',
                        paddingTop: '10px',
                        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                    }}>
                        <button
                            type="button"
                            onClick={() => {
                                const now = new Date();
                                onChange(formatIsoDate(now));
                                setViewYear(now.getFullYear());
                                setViewMonth(now.getMonth());
                                setOpen(false);
                            }}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: '#FF6BA8',
                                fontSize: '11px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                padding: 0,
                            }}
                        >
                            Today
                        </button>
                        {value && (
                            <button
                                type="button"
                                onClick={() => {
                                    onChange('');
                                    setOpen(false);
                                }}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: '#888',
                                    fontSize: '11px',
                                    fontWeight: 500,
                                    cursor: 'pointer',
                                    padding: 0,
                                }}
                            >
                                Clear
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

/* ── Custom Time Picker ── */
function parseTime(val: string): { hour12: number; minute: number; period: 'AM' | 'PM' } {
    if (!val || !val.includes(':')) {
        return { hour12: 10, minute: 0, period: 'AM' };
    }
    const [hStr, mStr] = val.split(':');
    let h = parseInt(hStr, 10);
    if (isNaN(h)) h = 10;
    let m = parseInt(mStr, 10);
    if (isNaN(m)) m = 0;
    const period: 'AM' | 'PM' = h >= 12 ? 'PM' : 'AM';
    let hour12 = h % 12;
    if (hour12 === 0) hour12 = 12;
    return { hour12, minute: m, period };
}

function formatTimeDisplay(val: string): string {
    if (!val || !val.includes(':')) return '';
    const { hour12, minute, period } = parseTime(val);
    return `${hour12}:${String(minute).padStart(2, '0')} ${period}`;
}

function to24h(hour12: number, minute: number, period: 'AM' | 'PM'): string {
    let h = hour12 % 12;
    if (period === 'PM') h += 12;
    return `${String(h).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

function CustomTimePicker({
    id,
    value,
    onChange,
    placeholder = 'Select start time...',
    style,
}: {
    id?: string;
    value: string;
    onChange: (val: string) => void;
    placeholder?: string;
    style?: React.CSSProperties;
}) {
    const [open, setOpen] = useState(false);
    const [openUp, setOpenUp] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    const parsed = useMemo(() => parseTime(value), [value]);

    useEffect(() => {
        if (!open) return;
        const h = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', h);
        return () => document.removeEventListener('mousedown', h);
    }, [open]);

    const toggleOpen = () => {
        if (!open && ref.current) {
            const rect = ref.current.getBoundingClientRect();
            const spaceBelow = window.innerHeight - rect.bottom;
            if (spaceBelow < 320 && rect.top > spaceBelow) {
                setOpenUp(true);
            } else {
                setOpenUp(false);
            }
        }
        setOpen((o) => !o);
    };

    const updateTime = (h12: number, min: number, per: 'AM' | 'PM') => {
        const val24 = to24h(h12, min, per);
        onChange(val24);
    };

    const PRESETS = [
        { label: '8:00 AM', val: '08:00' },
        { label: '9:00 AM', val: '09:00' },
        { label: '10:00 AM', val: '10:00' },
        { label: '11:00 AM', val: '11:00' },
        { label: '12:00 PM', val: '12:00' },
        { label: '1:00 PM', val: '13:00' },
        { label: '2:00 PM', val: '14:00' },
        { label: '3:00 PM', val: '15:00' },
        { label: '4:00 PM', val: '16:00' },
        { label: '5:00 PM', val: '17:00' },
        { label: '6:00 PM', val: '18:00' },
    ];

    const display = formatTimeDisplay(value) || placeholder;

    return (
        <div ref={ref} style={{ position: 'relative', width: '100%', zIndex: open ? 85 : 1 }}>
            <button
                id={id}
                type="button"
                onClick={toggleOpen}
                style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '12px',
                    padding: '12px 14px',
                    color: value ? '#fff' : '#777',
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: '13px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    outline: 'none',
                    transition: 'border-color 0.2s ease',
                    ...style,
                }}
            >
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {display}
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                    {value && (
                        <span
                            role="button"
                            tabIndex={0}
                            onClick={(e) => {
                                e.stopPropagation();
                                onChange('');
                            }}
                            title="Clear time"
                            style={{
                                color: '#888',
                                fontSize: '14px',
                                lineHeight: 1,
                                cursor: 'pointer',
                                padding: '2px 4px',
                                borderRadius: '4px',
                            }}
                        >
                            ✕
                        </span>
                    )}
                    <Clock size={15} color="#FF6BA8" />
                </span>
            </button>

            {open && (
                <div style={{
                    position: 'absolute',
                    ...(openUp ? { bottom: 'calc(100% + 6px)', top: 'auto' } : { top: 'calc(100% + 6px)', bottom: 'auto' }),
                    left: 0,
                    width: '290px',
                    maxWidth: 'calc(100vw - 32px)',
                    zIndex: 100,
                    background: 'rgba(18, 18, 26, 0.98)',
                    border: '1px solid rgba(255, 255, 255, 0.14)',
                    borderRadius: '18px',
                    padding: '16px',
                    boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8), 0 0 24px rgba(255, 45, 120, 0.12)',
                    backdropFilter: 'blur(24px)',
                    WebkitBackdropFilter: 'blur(24px)',
                }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>
                        Popular Event Times
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', marginBottom: '14px' }}>
                        {PRESETS.map((p) => {
                            const isSelected = value === p.val;
                            return (
                                <button
                                    key={p.val}
                                    type="button"
                                    onClick={() => {
                                        onChange(p.val);
                                        setOpen(false);
                                    }}
                                    style={{
                                        background: isSelected ? 'rgba(255, 45, 120, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                                        border: isSelected ? '1px solid #FF2D78' : '1px solid rgba(255, 255, 255, 0.08)',
                                        borderRadius: '8px',
                                        padding: '6px 4px',
                                        color: isSelected ? '#FF6BA8' : '#ccc',
                                        fontSize: '11px',
                                        fontWeight: isSelected ? 700 : 500,
                                        cursor: 'pointer',
                                        transition: 'all 0.15s ease',
                                    }}
                                >
                                    {p.label}
                                </button>
                            );
                        })}
                    </div>

                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>
                        Custom Time
                    </div>

                    {/* Custom Hours / Minutes / AM-PM Picker */}
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr', gap: '8px', marginBottom: '14px' }}>
                        {/* Hour */}
                        <div>
                            <span style={{ fontSize: '10px', color: '#777', display: 'block', marginBottom: '4px' }}>Hour</span>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px' }}>
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((h) => {
                                    const isSel = parsed.hour12 === h;
                                    return (
                                        <button
                                            key={h}
                                            type="button"
                                            onClick={() => updateTime(h, parsed.minute, parsed.period)}
                                            style={{
                                                background: isSel ? '#FF2D78' : 'rgba(255, 255, 255, 0.04)',
                                                border: 'none',
                                                borderRadius: '6px',
                                                padding: '5px 0',
                                                color: isSel ? '#fff' : '#bbb',
                                                fontSize: '11px',
                                                fontWeight: isSel ? 700 : 400,
                                                cursor: 'pointer',
                                            }}
                                        >
                                            {h}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Minutes */}
                        <div>
                            <span style={{ fontSize: '10px', color: '#777', display: 'block', marginBottom: '4px' }}>Min</span>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                {[0, 15, 30, 45].map((m) => {
                                    const isSel = parsed.minute === m;
                                    return (
                                        <button
                                            key={m}
                                            type="button"
                                            onClick={() => updateTime(parsed.hour12, m, parsed.period)}
                                            style={{
                                                background: isSel ? '#FF2D78' : 'rgba(255, 255, 255, 0.04)',
                                                border: 'none',
                                                borderRadius: '6px',
                                                padding: '6px 0',
                                                color: isSel ? '#fff' : '#bbb',
                                                fontSize: '11px',
                                                fontWeight: isSel ? 700 : 400,
                                                cursor: 'pointer',
                                            }}
                                        >
                                            :{String(m).padStart(2, '0')}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* AM/PM */}
                        <div>
                            <span style={{ fontSize: '10px', color: '#777', display: 'block', marginBottom: '4px' }}>AM/PM</span>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                {(['AM', 'PM'] as const).map((p) => {
                                    const isSel = parsed.period === p;
                                    return (
                                        <button
                                            key={p}
                                            type="button"
                                            onClick={() => updateTime(parsed.hour12, parsed.minute, p)}
                                            style={{
                                                background: isSel ? '#FF2D78' : 'rgba(255, 255, 255, 0.04)',
                                                border: 'none',
                                                borderRadius: '6px',
                                                padding: '13px 0',
                                                color: isSel ? '#fff' : '#bbb',
                                                fontSize: '11px',
                                                fontWeight: isSel ? 700 : 600,
                                                cursor: 'pointer',
                                            }}
                                        >
                                            {p}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Bottom action */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingTop: '10px',
                        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                    }}>
                        <button
                            type="button"
                            onClick={() => {
                                onChange('');
                                setOpen(false);
                            }}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: '#888',
                                fontSize: '11px',
                                cursor: 'pointer',
                            }}
                        >
                            Clear
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                if (!value) {
                                    updateTime(parsed.hour12, parsed.minute, parsed.period);
                                }
                                setOpen(false);
                            }}
                            style={{
                                background: 'linear-gradient(135deg, #FF2D78 0%, #E0005E 100%)',
                                border: 'none',
                                borderRadius: '8px',
                                padding: '6px 14px',
                                color: '#fff',
                                fontSize: '11px',
                                fontWeight: 700,
                                cursor: 'pointer',
                            }}
                        >
                            Done
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

const EVENT_TYPES = [
    'Wedding / Bridal',
    'Quinceañera',
    'Prom / Homecoming',
    'Bridal Shower / Bachelorette',
    'Baby Shower',
    'Sweet 16 / Birthday',
    'Corporate / Gala',
    'Photo / Video Shoot',
    'Other Special Event',
];

/* ── Form State ── */
type FormState = {
    contractType: string;
    contractDate: string;
    contractNumber: string;
    clientLegalName: string;
    phone: string;
    email: string;
    eventType: string;
    eventDate: string;
    startTime: string;
    venue: string;
    headcount: string;
    services: AdminServiceLine[];
    travelEnabled: boolean;
    retainer: string;
    balance: string;
    // 05 · Payment Plan
    ppActive: string;
    pp2Amt: string;
    pp2Date: string;
    pp3Amt: string;
    pp3Date: string;
    ppFinal: string;
    // 06 · Minimum Booking
    minSvc: string;
    lockDays: string;
    // 11 · Prep Fee
    prepFee: string;
    // 13 · Overtime
    overtimeRate: string;
    // 19 · Trial Run
    trialFee: string;
    // 20 · Minors
    minors: string;
    guardian: string;
    guardianPhone: string;
    // Parking notes (in-studio)
    parkingNotes: string;
    dyn: Record<string, string>;
};

const initForm = (): FormState => ({
    contractType: '',
    contractDate: new Date().toISOString().slice(0, 10),
    contractNumber: rng(),
    clientLegalName: '',
    phone: '',
    email: '',
    eventType: '',
    eventDate: '',
    startTime: '',
    venue: '',
    headcount: '1',
    services: [empty()],
    travelEnabled: false,
    retainer: '',
    balance: '',
    ppActive: '',
    pp2Amt: '0.00',
    pp2Date: '',
    pp3Amt: '0.00',
    pp3Date: '',
    ppFinal: '0.00',
    minSvc: '1',
    lockDays: '14',
    prepFee: '25.00',
    overtimeRate: '75.00',
    trialFee: '',
    minors: 'N/A',
    guardian: 'N/A',
    guardianPhone: 'N/A',
    parkingNotes: '',
    dyn: dynamicFieldDefaults(),
});

function totals(f: FormState) {
    let sub = 0;
    for (const s of f.services) if (s.description.trim()) sub += parseFloat(s.price) || 0;
    const tv = f.travelEnabled ? parseFloat(f.dyn.travelFee) || 0 : 0;
    return { sub, tv, grand: sub + tv };
}

const WIZARD_STEPS = [
    { num: 1, label: 'Client & Event', desc: 'Template & Contact Details', icon: Users },
    { num: 2, label: 'Location & Services', desc: 'Venue Specs & Service Breakdown', icon: MapPin },
    { num: 3, label: 'Financials', desc: 'Totals, Deposit & Payment Plan', icon: CreditCard },
    { num: 4, label: 'Policies', desc: 'Fees, Overtime & Minors', icon: Shield },
    { num: 5, label: 'Review & Dispatch', desc: 'Final Verification & Send', icon: Send },
];

function getTargetForError(msg: string): { step: number; fieldKey: string; fieldId: string } {
    const m = msg.toLowerCase();
    if (m.includes('clientlegalname') || m.includes('legal name') || m.includes('client name')) {
        return { step: 1, fieldKey: 'clientLegalName', fieldId: 'field-clientLegalName' };
    }
    if (m.includes('email')) {
        return { step: 1, fieldKey: 'email', fieldId: 'field-email' };
    }
    if (m.includes('guardianphone')) {
        return { step: 4, fieldKey: 'guardianPhone', fieldId: 'field-guardianPhone' };
    }
    if (m.includes('guardian')) {
        return { step: 4, fieldKey: 'guardian', fieldId: 'field-guardian' };
    }
    if (m.includes('phone')) {
        return { step: 1, fieldKey: 'phone', fieldId: 'field-phone' };
    }
    if (m.includes('eventdate')) {
        return { step: 1, fieldKey: 'eventDate', fieldId: 'field-eventDate' };
    }
    if (m.includes('starttime') || m.includes('ready-by') || m.includes('start time')) {
        return { step: 1, fieldKey: 'startTime', fieldId: 'field-startTime' };
    }
    if (m.includes('eventtype')) {
        return { step: 1, fieldKey: 'eventType', fieldId: 'field-eventType' };
    }
    if (m.includes('contractdate')) {
        return { step: 1, fieldKey: 'contractDate', fieldId: 'field-contractDate' };
    }
    if (m.includes('contractnumber')) {
        return { step: 1, fieldKey: 'contractNumber', fieldId: 'field-contractNumber' };
    }
    if (m.includes('template') || m.includes('contracttype')) {
        return { step: 1, fieldKey: 'contractType', fieldId: 'field-contractType' };
    }

    if (m.includes('locationaddress') || m.includes('venue') || m.includes('destination') || m.includes('address')) {
        return { step: 2, fieldKey: 'locationAddress', fieldId: 'field-locationAddress' };
    }
    if (m.includes('miles') || m.includes('traveldistance')) {
        return { step: 2, fieldKey: 'travelDistance', fieldId: 'field-travelDistance' };
    }
    if (m.includes('travelfee')) {
        return { step: 2, fieldKey: 'travelFee', fieldId: 'field-travelFee' };
    }
    if (m.includes('travel')) {
        return { step: 2, fieldKey: 'locationAddress', fieldId: 'field-locationAddress' };
    }
    if (m.includes('headcount')) {
        return { step: 2, fieldKey: 'headcount', fieldId: 'field-headcount' };
    }
    if (m.includes('service')) {
        return { step: 2, fieldKey: 'services', fieldId: 'field-services' };
    }

    if (m.includes('retainer')) {
        return { step: 3, fieldKey: 'retainer', fieldId: 'field-retainer' };
    }
    if (m.includes('balance')) {
        return { step: 3, fieldKey: 'balance', fieldId: 'field-balance' };
    }
    if (m.includes('pp2')) {
        return { step: 3, fieldKey: 'pp2Amt', fieldId: 'field-pp2Amt' };
    }
    if (m.includes('pp3')) {
        return { step: 3, fieldKey: 'pp3Amt', fieldId: 'field-pp3Amt' };
    }
    if (m.includes('ppfinal')) {
        return { step: 3, fieldKey: 'ppFinal', fieldId: 'field-ppFinal' };
    }
    if (m.includes('payment plan') || m.includes('ppactive')) {
        return { step: 3, fieldKey: 'ppActive', fieldId: 'field-ppActive' };
    }

    if (m.includes('minsvc')) {
        return { step: 4, fieldKey: 'minSvc', fieldId: 'field-minSvc' };
    }
    if (m.includes('lockdays')) {
        return { step: 4, fieldKey: 'lockDays', fieldId: 'field-lockDays' };
    }
    if (m.includes('prepfee')) {
        return { step: 4, fieldKey: 'prepFee', fieldId: 'field-prepFee' };
    }
    if (m.includes('overtimerate') || m.includes('overtime')) {
        return { step: 4, fieldKey: 'overtimeRate', fieldId: 'field-overtimeRate' };
    }
    if (m.includes('minor')) {
        return { step: 4, fieldKey: 'minors', fieldId: 'field-minors' };
    }

    return { step: 1, fieldKey: '', fieldId: '' };
}

export default function SpecialEventAdminForm({ onCreated }: { onCreated: () => void }) {
    const [step, setStep] = useState<number>(1);
    const [f, setF] = useState<FormState>(initForm);
    const [saving, setSaving] = useState(false);
    const [inviteId, setInviteId] = useState<string | null>(null);
    const [signUrl, setSignUrl] = useState('');
    const [emailed, setEmailed] = useState<boolean | null>(null);
    const [emailClient, setEmailClient] = useState(true);
    const [copied, setCopied] = useState(false);
    const [err, setErr] = useState('');
    const [errField, setErrField] = useState<string | null>(null);
    const formRef = useRef<HTMLDivElement>(null);
    const errorRef = useRef<HTMLDivElement>(null);
    const stepCardRef = useRef<HTMLDivElement>(null);

    /* Prevent scroll-wheel from changing number input values */
    useEffect(() => {
        const el = formRef.current;
        if (!el) return;
        const handler = (e: WheelEvent) => {
            const target = e.target as HTMLElement;
            if (target.tagName === 'INPUT' && (target as HTMLInputElement).type === 'number') {
                (target as HTMLInputElement).blur();
            }
        };
        el.addEventListener('wheel', handler, { passive: true });
        return () => el.removeEventListener('wheel', handler);
    }, []);

    const t = useMemo(() => totals(f), [f]);

    /* Auto-fill retainer as 50% of grand total whenever total changes */
    useEffect(() => {
        const half = (t.grand / 2).toFixed(2);
        setF((p) => ({ ...p, retainer: half, balance: half }));
    }, [t.grand]);

    const tpl = f.contractType ? CONTRACT_TEMPLATES[f.contractType] : null;

    const set = <K extends keyof FormState>(k: K, v: FormState[K]) => {
        setF((p) => ({ ...p, [k]: v }));
        if (errField === k) {
            setErrField(null);
            setErr('');
        }
    };
    const inp = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => set(k, e.target.value as never);
    const setDyn = (k: string, v: string) => {
        setF((p) => ({ ...p, dyn: { ...p.dyn, [k]: v } }));
        if (errField === k) {
            setErrField(null);
            setErr('');
        }
    };

    const setSvc = (i: number, k: keyof AdminServiceLine, v: string) => {
        setF((p) => { const s = [...p.services]; s[i] = { ...s[i], [k]: v }; return { ...p, services: s }; });
        if (errField === 'services') {
            setErrField(null);
            setErr('');
        }
    };
    const addSvc = () => setF((p) => ({ ...p, services: [...p.services, empty()] }));
    const rmSvc = (i: number) => setF((p) => { const n = p.services.filter((_, j) => j !== i); return { ...p, services: n.length ? n : [empty()] }; });

    const onRetainer = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value;
        if (errField === 'retainer') {
            setErrField(null);
            setErr('');
        }
        setF((p) => {
            const g = totals({ ...p, retainer: raw }).grand;
            const r = parseFloat(raw.trim());
            return { ...p, retainer: raw, balance: Number.isNaN(r) ? p.balance : Math.max(0, g - r).toFixed(2) };
        });
    };
    const recalc = () => {
        const r = parseFloat(f.retainer.trim());
        set('balance', (Number.isNaN(r) ? t.grand : Math.max(0, t.grand - r)).toFixed(2));
    };

    /* Inline Field Error Component */
    const FieldError = ({ name }: { name: string }) => {
        if (errField !== name || !err) return null;
        return (
            <div style={{
                color: '#ff6b6b',
                fontSize: '11px',
                fontWeight: 600,
                marginTop: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                animation: 'errorShake 0.3s ease-in-out',
                fontFamily: 'Poppins, sans-serif',
            }}>
                <AlertCircle size={13} style={{ flexShrink: 0, color: '#ff4d4d' }} />
                <span>{err}</span>
            </div>
        );
    };

    const getInputStyle = (name: string, custom?: React.CSSProperties): React.CSSProperties => {
        const isError = errField === name;
        return {
            ...commonInputStyle,
            borderColor: isError ? '#FF2D78' : 'rgba(255, 255, 255, 0.12)',
            boxShadow: isError ? '0 0 0 2px rgba(255, 45, 120, 0.35), 0 0 16px rgba(255, 45, 120, 0.25)' : 'none',
            ...custom,
        };
    };

    /* Build payload matching original API contract */
    const buildPayload = (): AdminContractPayload => ({
        contractType: tpl?.contractType || 'on-location',
        contractDate: f.contractDate,
        contractNumber: f.contractNumber,
        clientLegalName: f.clientLegalName,
        phone: f.phone,
        email: f.email,
        eventType: f.eventType,
        eventDate: f.eventDate,
        startTime: f.startTime,
        venue: f.travelEnabled
            ? (f.dyn.locationAddress || f.venue || '')
            : 'Glitz & Glamour Studio — 935 W San Marcos Blvd, Suite 101, San Marcos, CA 92078 (In-Studio)',
        headcount: f.headcount,
        services: f.services,
        travelRequired: f.travelEnabled ? 'Yes' : 'No',
        travelFee: f.travelEnabled ? (f.dyn.travelFee || '0') : '0',
        travelDest: f.travelEnabled ? (f.dyn.locationAddress || f.venue || 'TBD') : '',
        miles: f.travelEnabled ? (f.dyn.travelDistance || '0') : '0',
        retainer: f.retainer || '0',
        balance: f.balance || '0',
        paymentPlanEnabled: !!f.ppActive && f.ppActive === 'Yes',
        travelEnabled: f.travelEnabled,
        trialFeeEnabled: !!f.trialFee && parseFloat(f.trialFee) > 0,
        ppActive: f.ppActive || 'N/A',
        pp2Amt: f.pp2Amt || '0',
        pp2Date: f.pp2Date || '',
        pp3Amt: f.pp3Amt || '0',
        pp3Date: f.pp3Date || '',
        ppFinal: f.ppFinal || '0',
        minSvc: f.minSvc || f.headcount || '1',
        lockDays: f.lockDays || '14',
        prepFee: f.prepFee || '25.00',
        overtimeRate: f.overtimeRate || '75.00',
        trialFee: f.trialFee || 'N/A',
        minors: f.minors || 'N/A',
        guardian: f.guardian || 'N/A',
        guardianPhone: f.guardianPhone || 'N/A',
        parkingNotes: !f.travelEnabled ? (f.parkingNotes || '') : '',
        internalNotes: [
            f.contractType ? `Template: ${f.contractType}` : '',
            ...Object.entries(f.dyn).filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`),
        ].filter(Boolean).join('\n'),
    });

    /* Auto-scroll & Focus on Error */
    const reportError = useCallback((message: string, targetStep?: number, fieldKey?: string, fieldId?: string) => {
        const target = getTargetForError(message);
        const destStep = targetStep ?? target.step;
        const destKey = fieldKey ?? target.fieldKey;
        const destFieldId = fieldId ?? (destKey ? `field-${destKey}` : target.fieldId);

        setErr(message);
        setErrField(destKey || null);

        if (destStep !== step) {
            setStep(destStep);
        }

        setTimeout(() => {
            let fieldFocused = false;
            if (destFieldId) {
                const el = document.getElementById(destFieldId);
                if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    const focusable = (el.tagName === 'INPUT' || el.tagName === 'SELECT' || el.tagName === 'TEXTAREA')
                        ? el
                        : el.querySelector('input, select, textarea, button') as HTMLElement | null;
                    if (focusable && typeof focusable.focus === 'function') {
                        focusable.focus();
                    } else if (typeof el.focus === 'function') {
                        el.focus();
                    }
                    el.classList.add('error-pulse');
                    setTimeout(() => el.classList.remove('error-pulse'), 3000);
                    fieldFocused = true;
                }
            }

            if (!fieldFocused) {
                if (stepCardRef.current) {
                    stepCardRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
                } else {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            }
        }, 90);
    }, [step]);

    /* Step validation */
    const validateStep = (currentStep: number): boolean => {
        setErr('');
        setErrField(null);
        if (currentStep === 1) {
            if (!f.contractType) {
                reportError('Please select a contract template to begin.', 1, 'contractType', 'field-contractType');
                return false;
            }
            if (tpl && !tpl.available) {
                reportError('This contract template is Coming Soon and is not yet available.', 1, 'contractType', 'field-contractType');
                return false;
            }
            if (!f.clientLegalName.trim()) {
                reportError("Client's full legal name is required.", 1, 'clientLegalName', 'field-clientLegalName');
                return false;
            }
            if (!f.email.trim() || !f.email.includes('@')) {
                reportError('A valid client email address is required.', 1, 'email', 'field-email');
                return false;
            }
            if (!f.phone.trim()) {
                reportError('Client phone number is required.', 1, 'phone', 'field-phone');
                return false;
            }
            if (!f.eventDate.trim()) {
                reportError('Event date is required.', 1, 'eventDate', 'field-eventDate');
                return false;
            }
            if (!f.startTime.trim()) {
                reportError('Event start time is required.', 1, 'startTime', 'field-startTime');
                return false;
            }
        } else if (currentStep === 2) {
            if (f.travelEnabled && !f.dyn.locationAddress?.trim()) {
                reportError('Event location address is required for on-location agreements.', 2, 'locationAddress', 'field-locationAddress');
                return false;
            }
            if (!f.headcount.trim() || parseInt(f.headcount, 10) < 1) {
                reportError('Estimated headcount must be at least 1.', 2, 'headcount', 'field-headcount');
                return false;
            }
            const validServices = f.services.filter((s) => s.description.trim());
            if (validServices.length === 0) {
                reportError('Please add at least one service with a description.', 2, 'services', 'field-services');
                return false;
            }
            const hasInvalidPrice = validServices.some((s) => isNaN(parseFloat(s.price)) || parseFloat(s.price) < 0);
            if (hasInvalidPrice) {
                reportError('All service line items must have a valid price (or 0).', 2, 'services', 'field-services');
                return false;
            }
        } else if (currentStep === 3) {
            const r = parseFloat(f.retainer.trim());
            if (isNaN(r) || r < 0) {
                reportError('Please enter a valid retainer / deposit amount (or 0).', 3, 'retainer', 'field-retainer');
                return false;
            }
            if (f.ppActive === 'Yes') {
                if (!f.pp2Amt.trim() || isNaN(parseFloat(f.pp2Amt))) {
                    reportError('Payment plan: 2nd payment amount is required.', 3, 'pp2Amt', 'field-pp2Amt');
                    return false;
                }
                if (!f.pp2Date.trim()) {
                    reportError('Payment plan: 2nd payment due date is required.', 3, 'pp2Date', 'field-pp2Date');
                    return false;
                }
                if (!f.pp3Amt.trim() || isNaN(parseFloat(f.pp3Amt))) {
                    reportError('Payment plan: 3rd payment amount is required.', 3, 'pp3Amt', 'field-pp3Amt');
                    return false;
                }
                if (!f.pp3Date.trim()) {
                    reportError('Payment plan: 3rd payment due date is required.', 3, 'pp3Date', 'field-pp3Date');
                    return false;
                }
                if (!f.ppFinal.trim() || isNaN(parseFloat(f.ppFinal))) {
                    reportError('Payment plan: final payment amount is required.', 3, 'ppFinal', 'field-ppFinal');
                    return false;
                }
            }
        } else if (currentStep === 4) {
            if (!f.minSvc.trim()) {
                reportError('Minimum service count is required.', 4, 'minSvc', 'field-minSvc');
                return false;
            }
            if (!f.lockDays.trim()) {
                reportError('Lock schedule days cutoff is required.', 4, 'lockDays', 'field-lockDays');
                return false;
            }
            if (!f.prepFee.trim() || isNaN(parseFloat(f.prepFee))) {
                reportError('Skin prep fee is required (e.g. 25.00).', 4, 'prepFee', 'field-prepFee');
                return false;
            }
            if (!f.overtimeRate.trim() || isNaN(parseFloat(f.overtimeRate))) {
                reportError('Overtime rate per hour is required (e.g. 75.00).', 4, 'overtimeRate', 'field-overtimeRate');
                return false;
            }
            if (f.minors === 'Yes') {
                if (!f.guardian.trim() || f.guardian === 'N/A') {
                    reportError('Parent or legal guardian name is required when services involve minors.', 4, 'guardian', 'field-guardian');
                    return false;
                }
                if (!f.guardianPhone.trim() || f.guardianPhone === 'N/A') {
                    reportError('Parent or legal guardian phone number is required when services involve minors.', 4, 'guardianPhone', 'field-guardianPhone');
                    return false;
                }
            }
        }
        return true;
    };

    const nextStep = () => {
        if (validateStep(step)) {
            setErr('');
            setStep((s) => Math.min(5, s + 1));
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const prevStep = () => {
        setErr('');
        setStep((s) => Math.max(1, s - 1));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const send = useCallback(async () => {
        setErr('');
        setCopied(false);
        const payload = buildPayload();
        const v = validateAdminContractPayload(payload);
        if (!v.ok) {
            reportError(v.message);
            return;
        }

        setSaving(true);
        try {
            const res = await fetch('/api/admin/contracts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    label: `${v.data.clientLegalName || 'Client'} — ${v.data.contractNumber}`,
                    adminPayload: v.data,
                    sendEmail: emailClient,
                }),
            });
            const d = await res.json();
            if (!res.ok) {
                reportError(d.error || 'Could not send contract');
                return;
            }
            setInviteId(d.invite?.id || null);
            setSignUrl(d.invite?.signUrl || '');
            setEmailed(typeof d.invite?.clientEmailed === 'boolean' ? d.invite.clientEmailed : null);
            onCreated();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch {
            reportError('Network error: Could not reach the server to dispatch contract.');
        } finally {
            setSaving(false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [f, emailClient, onCreated, reportError]);

    const copy = async () => {
        if (!signUrl) return;
        try {
            await navigator.clipboard.writeText(signUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            setErr('Could not copy — select the link and copy manually.');
        }
    };

    const reset = () => {
        setF(initForm());
        setInviteId(null);
        setSignUrl('');
        setEmailed(null);
        setErr('');
        setCopied(false);
        setStep(1);
    };

    const commonInputStyle: React.CSSProperties = {
        width: '100%',
        boxSizing: 'border-box',
        background: 'rgba(255, 255, 255, 0.04)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        borderRadius: '12px',
        padding: '12px 14px',
        color: '#fff',
        fontSize: '13px',
        fontFamily: 'Poppins, sans-serif',
        outline: 'none',
        transition: 'border-color 0.2s ease',
    };

    const labelStyle: React.CSSProperties = {
        display: 'block',
        fontFamily: 'Poppins, sans-serif',
        fontSize: '12px',
        fontWeight: 600,
        color: '#ccc',
        marginBottom: '6px',
    };

    const cardStyle: React.CSSProperties = {
        background: 'rgba(255, 255, 255, 0.025)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '20px',
        padding: '24px 28px',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        marginBottom: '24px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
        position: 'relative',
        zIndex: 20,
    };

    return (
        <div ref={formRef} style={{ maxWidth: '900px', margin: '0 auto', paddingBottom: '32px' }}>
            {/* ── SUCCESS BANNER (when contract generated) ── */}
            {signUrl && (
                <div style={{
                    background: 'linear-gradient(135deg, rgba(0, 212, 120, 0.12), rgba(16, 28, 20, 0.95))',
                    border: '1px solid rgba(0, 212, 120, 0.4)',
                    borderRadius: '24px',
                    padding: '28px',
                    marginBottom: '28px',
                    boxShadow: '0 20px 60px rgba(0, 212, 120, 0.15)',
                    animation: 'scaleUp 0.25s ease-out',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        <div style={{
                            width: '38px',
                            height: '38px',
                            borderRadius: '50%',
                            background: 'rgba(0, 212, 120, 0.2)',
                            color: '#00D478',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                            <CheckCircle size={22} />
                        </div>
                        <div>
                            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#fff', margin: 0, fontFamily: 'Poppins, sans-serif' }}>
                                Contract Dispatched &amp; Ready to Sign!
                            </h2>
                            <p style={{ color: '#00D478', fontSize: '12px', margin: 0, fontWeight: 600 }}>
                                #{f.contractNumber} · {f.clientLegalName}
                            </p>
                        </div>
                    </div>

                    <p style={{ color: '#ccc', fontSize: '13px', lineHeight: 1.6, margin: '12px 0 16px', fontFamily: 'Poppins, sans-serif' }}>
                        {emailed === true
                            ? '✅ An official notification email with a direct sign link has been sent to the client.'
                            : emailed === false
                            ? '⚠️ Email dispatch was skipped or pending. Please copy and share the direct contract link below.'
                            : 'Direct signing link generated successfully.'}
                    </p>

                    {/* URL Card */}
                    <div style={{
                        background: 'rgba(0, 0, 0, 0.4)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '14px',
                        padding: '12px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px',
                        flexWrap: 'wrap',
                        marginBottom: '16px',
                    }}>
                        <a
                            href={signUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                color: '#FF6BA8',
                                fontSize: '13px',
                                fontFamily: 'monospace',
                                wordBreak: 'break-all',
                                textDecoration: 'none',
                                flex: 1,
                            }}
                        >
                            {signUrl}
                        </a>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                                type="button"
                                onClick={copy}
                                style={{
                                    background: copied ? 'rgba(0, 212, 120, 0.2)' : 'rgba(255, 45, 120, 0.15)',
                                    border: `1px solid ${copied ? 'rgba(0, 212, 120, 0.4)' : 'rgba(255, 45, 120, 0.35)'}`,
                                    borderRadius: '10px',
                                    padding: '8px 14px',
                                    color: copied ? '#00D478' : '#FF6BA8',
                                    cursor: 'pointer',
                                    fontSize: '12px',
                                    fontWeight: 700,
                                    fontFamily: 'Poppins, sans-serif',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                }}
                            >
                                {copied ? <CheckCircle size={14} /> : <Copy size={14} />}
                                {copied ? 'Copied!' : 'Copy Link'}
                            </button>
                            <a
                                href={signUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    borderRadius: '10px',
                                    padding: '8px 14px',
                                    color: '#ccc',
                                    textDecoration: 'none',
                                    fontSize: '12px',
                                    fontWeight: 600,
                                    fontFamily: 'Poppins, sans-serif',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                }}
                            >
                                <ExternalLink size={13} /> Open
                            </a>
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <button
                            type="button"
                            onClick={reset}
                            style={{
                                background: 'rgba(255, 255, 255, 0.06)',
                                border: '1px solid rgba(255, 255, 255, 0.12)',
                                borderRadius: '10px',
                                padding: '8px 16px',
                                color: '#aaa',
                                fontSize: '12px',
                                fontWeight: 600,
                                fontFamily: 'Poppins, sans-serif',
                                cursor: 'pointer',
                            }}
                        >
                            + Create Another Contract
                        </button>
                    </div>
                </div>
            )}

            {/* ── APPLE LIQUID 5-STEP WIZARD PROGRESS BAR ── */}
            {!signUrl && (
                <div style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.07)',
                    borderRadius: '20px',
                    padding: '10px',
                    marginBottom: '28px',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    boxShadow: '0 8px 30px rgba(0,0,0,0.25)',
                }}>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(5, 1fr)',
                        gap: '6px',
                    }}>
                        {WIZARD_STEPS.map((s) => {
                            const isCurrent = step === s.num;
                            const isDone = step > s.num;
                            const Icon = s.icon;
                            return (
                                <button
                                    key={s.num}
                                    type="button"
                                    onClick={() => {
                                        if (s.num < step) {
                                            setErr('');
                                            setStep(s.num);
                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                        } else if (s.num > step) {
                                            if (validateStep(step)) {
                                                setErr('');
                                                setStep(s.num);
                                                window.scrollTo({ top: 0, behavior: 'smooth' });
                                            }
                                        }
                                    }}
                                    style={{
                                        background: isCurrent
                                            ? 'linear-gradient(135deg, rgba(255, 45, 120, 0.22), rgba(255, 45, 120, 0.08))'
                                            : isDone
                                            ? 'rgba(0, 212, 120, 0.08)'
                                            : 'transparent',
                                        border: isCurrent
                                            ? '1px solid rgba(255, 45, 120, 0.45)'
                                            : isDone
                                            ? '1px solid rgba(0, 212, 120, 0.25)'
                                            : '1px solid transparent',
                                        borderRadius: '14px',
                                        padding: '10px 8px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: '4px',
                                        transition: 'all 0.2s ease',
                                        outline: 'none',
                                    }}
                                >
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        width: '24px',
                                        height: '24px',
                                        borderRadius: '50%',
                                        background: isCurrent
                                            ? '#FF2D78'
                                            : isDone
                                            ? '#00D478'
                                            : 'rgba(255, 255, 255, 0.08)',
                                        color: isCurrent || isDone ? '#fff' : '#777',
                                        fontSize: '11px',
                                        fontWeight: 800,
                                        fontFamily: 'Poppins, sans-serif',
                                    }}>
                                        {isDone ? '✓' : s.num}
                                    </div>
                                    <span style={{
                                        fontSize: '11px',
                                        fontWeight: isCurrent ? 700 : 500,
                                        color: isCurrent ? '#fff' : isDone ? '#00D478' : '#777',
                                        fontFamily: 'Poppins, sans-serif',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        maxWidth: '100%',
                                    }}>
                                        {s.label}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Global Error Banner (Only shown if error cannot be mapped to a specific field) */}
            {err && !errField && (
                <div
                    ref={errorRef}
                    tabIndex={-1}
                    role="alert"
                    aria-live="assertive"
                    style={{
                        outline: 'none',
                        background: 'linear-gradient(135deg, rgba(255, 60, 60, 0.16) 0%, rgba(200, 20, 50, 0.24) 100%)',
                        border: '1px solid rgba(255, 60, 60, 0.55)',
                        borderRadius: '16px',
                        padding: '14px 20px',
                        marginBottom: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px',
                        color: '#ff6b6b',
                        fontSize: '13px',
                        fontFamily: 'Poppins, sans-serif',
                        fontWeight: 600,
                        boxShadow: '0 8px 30px rgba(255, 45, 120, 0.2), 0 0 20px rgba(255, 60, 60, 0.3)',
                        animation: 'errorShake 0.4s ease-in-out',
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <AlertCircle size={20} style={{ flexShrink: 0, color: '#ff4d4d' }} />
                        <span>{err}</span>
                    </div>
                    <button
                        type="button"
                        onClick={() => setErr('')}
                        style={{
                            background: 'rgba(255, 255, 255, 0.08)',
                            border: '1px solid rgba(255, 255, 255, 0.15)',
                            color: '#ccc',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            padding: '4px 10px',
                            fontFamily: 'Poppins, sans-serif',
                        }}
                    >
                        Dismiss
                    </button>
                </div>
            )}

            {/* ════════════════════════════════════════════════════════════
               STEP 1: TEMPLATE & CLIENT DETAILS
               ════════════════════════════════════════════════════════════ */}
            {!signUrl && step === 1 && (
                <div ref={step === 1 ? stepCardRef : undefined} id="wizard-step-1" style={cardStyle}>
                    <div style={{ marginBottom: '22px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: '#FF6BA8', textTransform: 'uppercase', letterSpacing: '0.6px', fontFamily: 'Poppins, sans-serif' }}>
                            Step 1 of 5
                        </span>
                        <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#fff', margin: '4px 0 6px', fontFamily: 'Poppins, sans-serif' }}>
                            Template &amp; Client Details
                        </h2>
                        <p style={{ color: '#888', fontSize: '13px', margin: 0, fontFamily: 'Poppins, sans-serif' }}>
                            Select the contract framework and enter client contact information
                        </p>
                    </div>

                    {/* Template Selector */}
                    <div id="field-contractType" style={{ marginBottom: '24px' }}>
                        <label style={labelStyle}>
                            Contract Template <span style={{ color: '#FF2D78' }}>*</span>
                        </label>
                        <ContractDropdown
                            value={f.contractType}
                            onChange={(v) => {
                                const selected = CONTRACT_TEMPLATES[v];
                                const isOnLocation = selected?.contractType?.startsWith('on-location') ?? false;
                                setF((p) => ({ ...p, contractType: v, travelEnabled: isOnLocation }));
                                if (errField === 'contractType') {
                                    setErrField(null);
                                    setErr('');
                                }
                            }}
                        />
                        <FieldError name="contractType" />

                        {tpl && (
                            <div style={{
                                marginTop: '12px',
                                background: 'rgba(255, 45, 120, 0.05)',
                                border: '1px solid rgba(255, 45, 120, 0.2)',
                                borderRadius: '14px',
                                padding: '14px 18px',
                            }}>
                                <h4 style={{ margin: '0 0 4px', color: '#fff', fontSize: '14px', fontFamily: 'Poppins, sans-serif' }}>
                                    {tpl.title}
                                </h4>
                                <p style={{ margin: 0, color: '#aaa', fontSize: '12px', lineHeight: 1.5, fontFamily: 'Poppins, sans-serif' }}>
                                    {tpl.description}
                                </p>
                                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '10px' }}>
                                    {tpl.tags.map((tag) => (
                                        <span key={tag} style={{
                                            fontSize: '10px',
                                            background: 'rgba(255, 255, 255, 0.06)',
                                            color: '#ccc',
                                            padding: '2px 8px',
                                            borderRadius: '50px',
                                            border: '1px solid rgba(255, 255, 255, 0.08)',
                                        }}>
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Contract Number & Date */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '20px' }}>
                        <div>
                            <label style={labelStyle}>Contract #</label>
                            <input
                                id="field-contractNumber"
                                style={{ ...commonInputStyle, opacity: 0.7, cursor: 'not-allowed', fontFamily: 'monospace', fontWeight: 600, color: '#FF6BA8' }}
                                value={f.contractNumber}
                                readOnly
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>Contract Issue Date</label>
                            <CustomDatePicker
                                id="field-contractDate"
                                value={f.contractDate}
                                onChange={(val) => set('contractDate', val)}
                                style={getInputStyle('contractDate')}
                                placeholder="Select issue date..."
                            />
                            <FieldError name="contractDate" />
                        </div>
                    </div>

                    {/* Client Name, Phone & Email */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '20px' }}>
                        <div>
                            <label style={labelStyle}>Client Legal Name <span style={{ color: '#FF2D78' }}>*</span></label>
                            <input
                                id="field-clientLegalName"
                                type="text"
                                placeholder="Full legal name"
                                style={getInputStyle('clientLegalName')}
                                value={f.clientLegalName}
                                onChange={inp('clientLegalName')}
                            />
                            <FieldError name="clientLegalName" />
                        </div>
                        <div>
                            <label style={labelStyle}>Client Phone</label>
                            <input
                                id="field-phone"
                                type="tel"
                                placeholder="(760) 000-0000"
                                style={getInputStyle('phone')}
                                value={f.phone}
                                onChange={(e) => set('phone', formatPhone(e.target.value))}
                            />
                            <FieldError name="phone" />
                        </div>
                        <div>
                            <label style={labelStyle}>Client Email <span style={{ color: '#FF2D78' }}>*</span></label>
                            <input
                                id="field-email"
                                type="email"
                                placeholder="client@example.com"
                                style={getInputStyle('email')}
                                value={f.email}
                                onChange={inp('email')}
                            />
                            <FieldError name="email" />
                        </div>
                    </div>

                    {/* Event Type, Date, Time & Headcount */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
                        <div id="field-eventType">
                            <label style={labelStyle}>Event Type</label>
                            <CustomSelect
                                options={EVENT_TYPES}
                                value={f.eventType}
                                onChange={(v) => set('eventType', v)}
                                placeholder="Select event..."
                            />
                            <FieldError name="eventType" />
                        </div>
                        <div>
                            <label style={labelStyle}>Event Date <span style={{ color: '#FF2D78' }}>*</span></label>
                            <CustomDatePicker
                                id="field-eventDate"
                                value={f.eventDate}
                                onChange={(val) => set('eventDate', val)}
                                style={getInputStyle('eventDate')}
                                placeholder="Select event date..."
                            />
                            <FieldError name="eventDate" />
                        </div>
                        <div>
                            <label style={labelStyle}>Start Time <span style={{ color: '#FF2D78' }}>*</span></label>
                            <CustomTimePicker
                                id="field-startTime"
                                value={f.startTime}
                                onChange={(val) => set('startTime', val)}
                                style={getInputStyle('startTime')}
                                placeholder="Select start time..."
                            />
                            <FieldError name="startTime" />
                        </div>
                        <div>
                            <label style={labelStyle}># People Serviced</label>
                            <input
                                id="field-headcount"
                                type="number"
                                min={1}
                                style={getInputStyle('headcount')}
                                value={f.headcount}
                                onChange={inp('headcount')}
                            />
                            <FieldError name="headcount" />
                        </div>
                    </div>
                </div>
            )}

            {/* ════════════════════════════════════════════════════════════
               STEP 2: LOCATION & SERVICES BREAKDOWN
               ════════════════════════════════════════════════════════════ */}
            {!signUrl && step === 2 && (
                <div ref={step === 2 ? stepCardRef : undefined} id="wizard-step-2" style={cardStyle}>
                    <div style={{ marginBottom: '22px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: '#FF6BA8', textTransform: 'uppercase', letterSpacing: '0.6px', fontFamily: 'Poppins, sans-serif' }}>
                            Step 2 of 5
                        </span>
                        <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#fff', margin: '4px 0 6px', fontFamily: 'Poppins, sans-serif' }}>
                            Location &amp; Service Breakdown
                        </h2>
                        <p style={{ color: '#888', fontSize: '13px', margin: 0, fontFamily: 'Poppins, sans-serif' }}>
                            Specify venue logistics, travel fees, and itemize the agreed services
                        </p>
                    </div>

                    {/* Location Logistics Card */}
                    <div style={{
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid rgba(255, 255, 255, 0.07)',
                        borderRadius: '16px',
                        padding: '18px 20px',
                        marginBottom: '24px',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                            <MapPin size={16} color="#FF6BA8" />
                            <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#fff', margin: 0, fontFamily: 'Poppins, sans-serif' }}>
                                {f.travelEnabled ? 'On-Location Venue & Travel Provisions' : 'In-Studio Arrival & Parking Provisions'}
                            </h3>
                        </div>

                        {f.travelEnabled ? (
                            <>
                                <div style={{ marginBottom: '14px' }}>
                                    <label style={labelStyle}>Event Location Address <span style={{ color: '#FF2D78' }}>*</span></label>
                                    <input
                                        id="field-locationAddress"
                                        type="text"
                                        placeholder="Complete venue address (Street, City, State, ZIP)"
                                        style={getInputStyle('locationAddress')}
                                        value={f.dyn.locationAddress ?? ''}
                                        onChange={(e) => setDyn('locationAddress', e.target.value)}
                                    />
                                    <FieldError name="locationAddress" />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div>
                                        <label style={labelStyle}>Est. Miles from Vista (One-Way)</label>
                                        <input
                                            id="field-travelDistance"
                                            type="number"
                                            placeholder="0"
                                            style={getInputStyle('travelDistance')}
                                            value={f.dyn.travelDistance ?? ''}
                                            onChange={(e) => setDyn('travelDistance', e.target.value)}
                                        />
                                        <FieldError name="travelDistance" />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Travel Fee ($)</label>
                                        <input
                                            id="field-travelFee"
                                            type="number"
                                            step="0.01"
                                            placeholder="0.00"
                                            style={getInputStyle('travelFee')}
                                            value={f.dyn.travelFee ?? ''}
                                            onChange={(e) => setDyn('travelFee', e.target.value)}
                                        />
                                        <FieldError name="travelFee" />
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <div style={{ marginBottom: '14px' }}>
                                    <label style={labelStyle}>Fixed Studio Address</label>
                                    <input
                                        style={{ ...commonInputStyle, opacity: 0.7, cursor: 'not-allowed' }}
                                        value="Glitz & Glamour Studio — 935 W San Marcos Blvd, Suite 101, San Marcos, CA 92078"
                                        readOnly
                                    />
                                </div>
                                <div>
                                    <label style={labelStyle}>Parking &amp; Access Notes for Client <span style={{ color: '#666', fontWeight: 400 }}>(optional)</span></label>
                                    <textarea
                                        id="field-parkingNotes"
                                        rows={2}
                                        placeholder="e.g. Dedicated parking lot in front of studio. Please arrive 5–10 minutes prior to session."
                                        style={{ ...getInputStyle('parkingNotes'), resize: 'vertical' }}
                                        value={f.parkingNotes}
                                        onChange={(e) => set('parkingNotes', e.target.value)}
                                    />
                                    <FieldError name="parkingNotes" />
                                </div>
                            </>
                        )}
                    </div>

                    {/* Services Itemizer */}
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                            <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#fff', margin: 0, fontFamily: 'Poppins, sans-serif' }}>
                                Service Slots &amp; Pricing ({f.services.length})
                            </h3>
                            <span style={{ fontSize: '12px', fontWeight: 700, color: '#00D478', fontFamily: 'Poppins, sans-serif' }}>
                                Services Subtotal: {fmt(t.sub)}
                            </span>
                        </div>
                        <FieldError name="services" />

                        <div id="field-services" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {f.services.map((s, i) => (
                                <div
                                    key={i}
                                    style={{
                                        background: 'rgba(255, 255, 255, 0.02)',
                                        border: '1px solid rgba(255, 255, 255, 0.06)',
                                        borderRadius: '16px',
                                        padding: '16px',
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                                        <span style={{ fontSize: '11px', fontWeight: 700, color: '#FF6BA8', textTransform: 'uppercase', letterSpacing: '0.4px', fontFamily: 'Poppins, sans-serif' }}>
                                            Service #{i + 1}
                                        </span>
                                        {f.services.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => rmSvc(i)}
                                                style={{
                                                    background: 'rgba(255, 60, 60, 0.1)',
                                                    border: '1px solid rgba(255, 60, 60, 0.25)',
                                                    borderRadius: '8px',
                                                    padding: '4px 10px',
                                                    color: '#ff6b6b',
                                                    fontSize: '11px',
                                                    fontWeight: 600,
                                                    cursor: 'pointer',
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '4px',
                                                }}
                                            >
                                                <Trash2 size={12} /> Remove
                                            </button>
                                        )}
                                    </div>

                                    <div style={{ marginBottom: '10px' }}>
                                        <textarea
                                            rows={2}
                                            placeholder="Service description (e.g. Bridal Glam Makeup with Lashes & Touch-up Kit)"
                                            style={{ ...commonInputStyle, resize: 'vertical' }}
                                            value={s.description}
                                            onChange={(e) => setSvc(i, 'description', e.target.value)}
                                        />
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: '12px' }}>
                                        <div>
                                            <input
                                                type="number"
                                                step="0.01"
                                                placeholder="Price ($)"
                                                style={commonInputStyle}
                                                value={s.price}
                                                onChange={(e) => setSvc(i, 'price', e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <input
                                                type="text"
                                                placeholder="Optional notes (e.g. Includes airbrush foundation)"
                                                style={commonInputStyle}
                                                value={s.notes}
                                                onChange={(e) => setSvc(i, 'notes', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button
                            type="button"
                            onClick={addSvc}
                            style={{
                                marginTop: '14px',
                                background: 'rgba(255, 45, 120, 0.1)',
                                border: '1px dashed rgba(255, 45, 120, 0.35)',
                                borderRadius: '12px',
                                padding: '10px 18px',
                                color: '#FF6BA8',
                                fontSize: '13px',
                                fontWeight: 600,
                                fontFamily: 'Poppins, sans-serif',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                            }}
                        >
                            <Plus size={15} /> Add Another Service Slot
                        </button>
                    </div>
                </div>
            )}

            {/* ════════════════════════════════════════════════════════════
               STEP 3: PRICING, RETAINER & PAYMENT PLAN
               ════════════════════════════════════════════════════════════ */}
            {!signUrl && step === 3 && (
                <div ref={step === 3 ? stepCardRef : undefined} id="wizard-step-3" style={cardStyle}>
                    <div style={{ marginBottom: '22px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: '#FF6BA8', textTransform: 'uppercase', letterSpacing: '0.6px', fontFamily: 'Poppins, sans-serif' }}>
                            Step 3 of 5
                        </span>
                        <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#fff', margin: '4px 0 6px', fontFamily: 'Poppins, sans-serif' }}>
                            Financials &amp; Payment Structure
                        </h2>
                        <p style={{ color: '#888', fontSize: '13px', margin: 0, fontFamily: 'Poppins, sans-serif' }}>
                            Review automated totals, establish retainer deposits, and configure optional payment schedules
                        </p>
                    </div>

                    {/* Financial Summary Bento */}
                    <div style={{
                        background: 'linear-gradient(135deg, rgba(255, 45, 120, 0.08), rgba(20, 20, 28, 0.95))',
                        border: '1px solid rgba(255, 45, 120, 0.25)',
                        borderRadius: '16px',
                        padding: '20px',
                        marginBottom: '24px',
                    }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px' }}>
                            <div>
                                <span style={{ fontSize: '11px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.4px', fontWeight: 600, fontFamily: 'Poppins, sans-serif' }}>
                                    Services Subtotal
                                </span>
                                <div style={{ fontSize: '22px', fontWeight: 800, color: '#fff', marginTop: '4px', fontFamily: 'Poppins, sans-serif' }}>
                                    {fmt(t.sub)}
                                </div>
                            </div>

                            {f.travelEnabled && (
                                <div>
                                    <span style={{ fontSize: '11px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.4px', fontWeight: 600, fontFamily: 'Poppins, sans-serif' }}>
                                        Travel &amp; Mileage Fee
                                    </span>
                                    <div style={{ fontSize: '22px', fontWeight: 800, color: '#FF6BA8', marginTop: '4px', fontFamily: 'Poppins, sans-serif' }}>
                                        {fmt(t.tv)}
                                    </div>
                                </div>
                            )}

                            <div>
                                <span style={{ fontSize: '11px', color: '#00D478', textTransform: 'uppercase', letterSpacing: '0.4px', fontWeight: 700, fontFamily: 'Poppins, sans-serif' }}>
                                    Grand Total
                                </span>
                                <div style={{ fontSize: '24px', fontWeight: 800, color: '#00D478', marginTop: '4px', fontFamily: 'Poppins, sans-serif' }}>
                                    {fmt(t.grand)}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Retainer & Remaining Balance */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '18px' }}>
                        <div>
                            <label style={labelStyle}>
                                Non-Refundable Retainer ($)
                                <span style={{ fontSize: '11px', color: '#888', fontWeight: 400, marginLeft: '6px' }}>(50% auto-fill)</span>
                            </label>
                            <input
                                id="field-retainer"
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                style={getInputStyle('retainer')}
                                value={f.retainer}
                                onChange={onRetainer}
                            />
                            <FieldError name="retainer" />
                        </div>
                        <div>
                            <label style={labelStyle}>
                                Remaining Balance ($)
                                <span style={{ fontSize: '11px', color: '#888', fontWeight: 400, marginLeft: '6px' }}>(Due on event day)</span>
                            </label>
                            <input
                                id="field-balance"
                                style={{ ...getInputStyle('balance'), opacity: 0.7, cursor: 'not-allowed', color: '#00D478', fontWeight: 700 }}
                                value={f.balance}
                                readOnly
                            />
                            <FieldError name="balance" />
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={recalc}
                        style={{
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '10px',
                            padding: '8px 14px',
                            color: '#ccc',
                            fontSize: '12px',
                            fontWeight: 600,
                            fontFamily: 'Poppins, sans-serif',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            marginBottom: '26px',
                        }}
                    >
                        <RefreshCw size={13} /> Recalculate Balance from Grand Total
                    </button>

                    {/* Payment Plan Section */}
                    <div style={{
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid rgba(255, 255, 255, 0.07)',
                        borderRadius: '16px',
                        padding: '18px 20px',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                            <div>
                                <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#fff', margin: 0, fontFamily: 'Poppins, sans-serif' }}>
                                    Multi-Stage Payment Plan (Optional)
                                </h3>
                                <p style={{ color: '#888', fontSize: '12px', margin: '2px 0 0', fontFamily: 'Poppins, sans-serif' }}>
                                    Breakdown the remaining balance across multiple scheduled installments
                                </p>
                            </div>
                            <div id="field-ppActive" style={{ minWidth: '120px' }}>
                                <CustomSelect
                                    options={['Yes', 'No', 'N/A']}
                                    value={f.ppActive}
                                    onChange={(v) => {
                                        setF((p) => ({ ...p, ppActive: v }));
                                        if (errField === 'ppActive') {
                                            setErrField(null);
                                            setErr('');
                                        }
                                    }}
                                    placeholder="Activate?"
                                />
                                <FieldError name="ppActive" />
                            </div>
                        </div>

                        {f.ppActive === 'Yes' && (
                            <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                                    <div>
                                        <label style={labelStyle}>2nd Payment Amount ($)</label>
                                        <input
                                            id="field-pp2Amt"
                                            type="number"
                                            step="0.01"
                                            placeholder="0.00"
                                            style={getInputStyle('pp2Amt')}
                                            value={f.pp2Amt}
                                            onChange={(e) => {
                                                setF((p) => ({ ...p, pp2Amt: e.target.value }));
                                                if (errField === 'pp2Amt') {
                                                    setErrField(null);
                                                    setErr('');
                                                }
                                            }}
                                        />
                                        <FieldError name="pp2Amt" />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>2nd Due Date</label>
                                        <CustomDatePicker
                                            id="field-pp2Date"
                                            value={f.pp2Date}
                                            onChange={(val) => set('pp2Date', val)}
                                            style={getInputStyle('pp2Date')}
                                            placeholder="Select 2nd due date..."
                                        />
                                        <FieldError name="pp2Date" />
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                                    <div>
                                        <label style={labelStyle}>3rd Payment Amount ($)</label>
                                        <input
                                            id="field-pp3Amt"
                                            type="number"
                                            step="0.01"
                                            placeholder="0.00"
                                            style={getInputStyle('pp3Amt')}
                                            value={f.pp3Amt}
                                            onChange={(e) => {
                                                setF((p) => ({ ...p, pp3Amt: e.target.value }));
                                                if (errField === 'pp3Amt') {
                                                    setErrField(null);
                                                    setErr('');
                                                }
                                            }}
                                        />
                                        <FieldError name="pp3Amt" />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>3rd Due Date</label>
                                        <CustomDatePicker
                                            id="field-pp3Date"
                                            value={f.pp3Date}
                                            onChange={(val) => set('pp3Date', val)}
                                            style={getInputStyle('pp3Date')}
                                            placeholder="Select 3rd due date..."
                                        />
                                        <FieldError name="pp3Date" />
                                    </div>
                                </div>

                                <div style={{ maxWidth: '300px' }}>
                                    <label style={labelStyle}>Final Payment Amount ($)</label>
                                    <input
                                        id="field-ppFinal"
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        style={getInputStyle('ppFinal')}
                                        value={f.ppFinal}
                                        onChange={(e) => {
                                            setF((p) => ({ ...p, ppFinal: e.target.value }));
                                            if (errField === 'ppFinal') {
                                                setErrField(null);
                                                setErr('');
                                            }
                                        }}
                                    />
                                    <FieldError name="ppFinal" />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ════════════════════════════════════════════════════════════
               STEP 4: POLICIES, OVERTIME & MINORS
               ════════════════════════════════════════════════════════════ */}
            {!signUrl && step === 4 && (
                <div ref={step === 4 ? stepCardRef : undefined} id="wizard-step-4" style={cardStyle}>
                    <div style={{ marginBottom: '22px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: '#FF6BA8', textTransform: 'uppercase', letterSpacing: '0.6px', fontFamily: 'Poppins, sans-serif' }}>
                            Step 4 of 5
                        </span>
                        <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#fff', margin: '4px 0 6px', fontFamily: 'Poppins, sans-serif' }}>
                            Studio Policies &amp; Specifics
                        </h2>
                        <p style={{ color: '#888', fontSize: '13px', margin: 0, fontFamily: 'Poppins, sans-serif' }}>
                            Configure minimum booking thresholds, prep fees, overtime rates, and guardian consent
                        </p>
                    </div>

                    {/* Minimum Booking & Changes Deadline */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '20px' }}>
                        <div>
                            <label style={labelStyle}>Minimum Services Required (Slots)</label>
                            <input
                                id="field-minSvc"
                                type="number"
                                min={1}
                                style={getInputStyle('minSvc')}
                                value={f.minSvc}
                                onChange={inp('minSvc')}
                            />
                            <FieldError name="minSvc" />
                        </div>
                        <div>
                            <label style={labelStyle}>Final Changes Deadline (Days Before Event)</label>
                            <input
                                id="field-lockDays"
                                type="number"
                                min={1}
                                style={getInputStyle('lockDays')}
                                value={f.lockDays}
                                onChange={inp('lockDays')}
                            />
                            <FieldError name="lockDays" />
                        </div>
                    </div>

                    {/* Prep Fee, Overtime & Trial Run */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                        <div>
                            <label style={labelStyle}>Prep Fee Per Person ($)</label>
                            <input
                                id="field-prepFee"
                                type="number"
                                min={0}
                                step="0.01"
                                style={getInputStyle('prepFee')}
                                value={f.prepFee}
                                onChange={inp('prepFee')}
                            />
                            <FieldError name="prepFee" />
                        </div>
                        <div>
                            <label style={labelStyle}>Overtime Rate Per Hour ($)</label>
                            <input
                                id="field-overtimeRate"
                                type="number"
                                min={0}
                                step="0.01"
                                style={getInputStyle('overtimeRate')}
                                value={f.overtimeRate}
                                onChange={inp('overtimeRate')}
                            />
                            <FieldError name="overtimeRate" />
                        </div>
                        <div>
                            <label style={labelStyle}>Trial Run Fee ($) <span style={{ color: '#888', fontWeight: 400 }}>(Optional)</span></label>
                            <input
                                id="field-trialFee"
                                type="number"
                                min={0}
                                step="0.01"
                                placeholder="0.00 or leave blank"
                                style={getInputStyle('trialFee')}
                                value={f.trialFee}
                                onChange={inp('trialFee')}
                            />
                            <FieldError name="trialFee" />
                        </div>
                    </div>

                    {/* Minors Policy */}
                    <div style={{
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid rgba(255, 255, 255, 0.07)',
                        borderRadius: '16px',
                        padding: '18px 20px',
                    }}>
                        <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#fff', margin: '0 0 4px', fontFamily: 'Poppins, sans-serif' }}>
                            Minors Policy &amp; Guardian Consent
                        </h3>
                        <p style={{ color: '#888', fontSize: '12px', margin: '0 0 16px', fontFamily: 'Poppins, sans-serif' }}>
                            Required if any party member receiving services is under 18 years of age
                        </p>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '14px' }}>
                            <div>
                                <label style={labelStyle}>Minor(s) Being Serviced</label>
                                <input
                                    id="field-minors"
                                    type="text"
                                    placeholder="First name(s) + age(s), or N/A"
                                    style={getInputStyle('minors')}
                                    value={f.minors}
                                    onChange={inp('minors')}
                                />
                                <FieldError name="minors" />
                            </div>
                            <div>
                                <label style={labelStyle}>Parent / Guardian Legal Name</label>
                                <input
                                    id="field-guardian"
                                    type="text"
                                    placeholder="e.g. Maria Gomez — Mother"
                                    style={getInputStyle('guardian')}
                                    value={f.guardian}
                                    onChange={inp('guardian')}
                                />
                                <FieldError name="guardian" />
                            </div>
                        </div>

                        <div style={{ maxWidth: '300px' }}>
                            <label style={labelStyle}>Parent / Guardian Phone</label>
                            <input
                                id="field-guardianPhone"
                                type="tel"
                                placeholder="(760) 000-0000"
                                style={getInputStyle('guardianPhone')}
                                value={f.guardianPhone}
                                onChange={(e) => set('guardianPhone', formatPhone(e.target.value))}
                            />
                            <FieldError name="guardianPhone" />
                        </div>
                    </div>
                </div>
            )}

            {/* ════════════════════════════════════════════════════════════
               STEP 5: EXECUTIVE REVIEW & DISPATCH
               ════════════════════════════════════════════════════════════ */}
            {!signUrl && step === 5 && (
                <div ref={step === 5 ? stepCardRef : undefined} id="wizard-step-5" style={cardStyle}>
                    <div style={{ marginBottom: '22px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: '#00D478', textTransform: 'uppercase', letterSpacing: '0.6px', fontFamily: 'Poppins, sans-serif' }}>
                            Step 5 of 5
                        </span>
                        <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#fff', margin: '4px 0 6px', fontFamily: 'Poppins, sans-serif' }}>
                            Executive Review &amp; Dispatch
                        </h2>
                        <p style={{ color: '#888', fontSize: '13px', margin: 0, fontFamily: 'Poppins, sans-serif' }}>
                            Verify all contract specifications and authorize direct client dispatch
                        </p>
                    </div>

                    {/* Summary Bento Grid */}
                    <div style={{
                        background: 'linear-gradient(135deg, rgba(20, 20, 28, 0.95), rgba(14, 14, 20, 0.98))',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '18px',
                        padding: '24px',
                        marginBottom: '24px',
                    }}>
                        {/* Header Bento: Client & Contract Header */}
                        <div style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            paddingBottom: '16px',
                            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                            marginBottom: '16px',
                            gap: '12px',
                        }}>
                            <div>
                                <span style={{ fontSize: '11px', fontWeight: 700, color: '#FF6BA8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    {tpl?.title || 'Contract Agreement'}
                                </span>
                                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#fff', margin: '2px 0 0', fontFamily: 'Poppins, sans-serif' }}>
                                    {f.clientLegalName || 'Client Name'}
                                </h3>
                                <div style={{ fontSize: '12px', color: '#888', marginTop: '2px' }}>
                                    {f.email} · {f.phone || 'No phone'}
                                </div>
                            </div>

                            <div style={{ textAlign: 'right' }}>
                                <span style={{
                                    fontSize: '11px',
                                    fontWeight: 700,
                                    fontFamily: 'monospace',
                                    color: '#FF6BA8',
                                    background: 'rgba(255, 45, 120, 0.12)',
                                    padding: '3px 10px',
                                    borderRadius: '50px',
                                    border: '1px solid rgba(255, 45, 120, 0.3)',
                                }}>
                                    #{f.contractNumber}
                                </span>
                                <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>
                                    Issue Date: {f.contractDate}
                                </div>
                            </div>
                        </div>

                        {/* Event & Logistics Grid */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                            gap: '14px',
                            paddingBottom: '16px',
                            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                            marginBottom: '16px',
                            fontSize: '12px',
                            fontFamily: 'Poppins, sans-serif',
                        }}>
                            <div>
                                <span style={{ color: '#777', display: 'block', fontSize: '11px', textTransform: 'uppercase', fontWeight: 600 }}>Event Date &amp; Time</span>
                                <strong style={{ color: '#fff', fontSize: '13px' }}>{f.eventDate || 'TBD'} @ {f.startTime || 'TBD'}</strong>
                            </div>
                            <div>
                                <span style={{ color: '#777', display: 'block', fontSize: '11px', textTransform: 'uppercase', fontWeight: 600 }}>Event Type</span>
                                <strong style={{ color: '#fff', fontSize: '13px' }}>{f.eventType || 'Special Event'}</strong>
                            </div>
                            <div>
                                <span style={{ color: '#777', display: 'block', fontSize: '11px', textTransform: 'uppercase', fontWeight: 600 }}>Headcount</span>
                                <strong style={{ color: '#fff', fontSize: '13px' }}>{f.headcount} Guests</strong>
                            </div>
                            <div>
                                <span style={{ color: '#777', display: 'block', fontSize: '11px', textTransform: 'uppercase', fontWeight: 600 }}>Location Type</span>
                                <strong style={{ color: '#fff', fontSize: '13px' }}>{f.travelEnabled ? 'On-Location Venue' : 'In-Studio Session'}</strong>
                            </div>
                        </div>

                        {/* Services Itemized Preview */}
                        <div style={{
                            paddingBottom: '16px',
                            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                            marginBottom: '16px',
                        }}>
                            <span style={{ color: '#777', display: 'block', fontSize: '11px', textTransform: 'uppercase', fontWeight: 600, marginBottom: '8px' }}>
                                Itemized Services
                            </span>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                {f.services.filter(s => s.description.trim()).map((s, idx) => (
                                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontFamily: 'Poppins, sans-serif' }}>
                                        <span style={{ color: '#ccc' }}>• {s.description} {s.notes ? `(${s.notes})` : ''}</span>
                                        <strong style={{ color: '#fff' }}>${parseFloat(s.price || '0').toFixed(2)}</strong>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Financial Reconciliation Summary */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', fontFamily: 'Poppins, sans-serif' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#aaa' }}>
                                <span>Services Subtotal:</span>
                                <span>{fmt(t.sub)}</span>
                            </div>
                            {f.travelEnabled && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#aaa' }}>
                                    <span>Travel &amp; Mileage Fee:</span>
                                    <span>{fmt(t.tv)}</span>
                                </div>
                            )}
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#fff', fontWeight: 700, fontSize: '15px', paddingTop: '4px', borderTop: '1px dashed rgba(255,255,255,0.1)' }}>
                                <span>Grand Total:</span>
                                <span style={{ color: '#00D478' }}>{fmt(t.grand)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#FF6BA8', fontWeight: 700 }}>
                                <span>Non-Refundable Retainer (50%):</span>
                                <span>${f.retainer || '0.00'}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#aaa' }}>
                                <span>Remaining Balance Due:</span>
                                <span>${f.balance || '0.00'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Email Client Option */}
                    <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        cursor: 'pointer',
                        padding: '12px 16px',
                        background: 'rgba(255, 255, 255, 0.03)',
                        borderRadius: '12px',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        marginBottom: '24px',
                    }}>
                        <input
                            type="checkbox"
                            checked={emailClient}
                            onChange={(e) => setEmailClient(e.target.checked)}
                            style={{ accentColor: '#FF2D78', width: '16px', height: '16px' }}
                        />
                        <span style={{ fontSize: '13px', color: '#eee', fontFamily: 'Poppins, sans-serif', fontWeight: 500 }}>
                            Automatically dispatch contract invite email to <strong>{f.email}</strong> upon creation
                        </span>
                    </label>

                    {/* Final Action Button */}
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                        <button
                            type="button"
                            onClick={() => setStep(4)}
                            disabled={saving}
                            style={{
                                padding: '12px 20px',
                                borderRadius: '12px',
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid rgba(255, 255, 255, 0.12)',
                                color: '#ccc',
                                fontSize: '13px',
                                fontWeight: 600,
                                fontFamily: 'Poppins, sans-serif',
                                cursor: 'pointer',
                            }}
                        >
                            ← Back to Policies
                        </button>
                        <button
                            type="button"
                            onClick={send}
                            disabled={saving}
                            style={{
                                padding: '13px 28px',
                                borderRadius: '12px',
                                background: 'linear-gradient(135deg, #FF2D78 0%, #E0005E 100%)',
                                border: '1px solid rgba(255, 45, 120, 0.5)',
                                color: '#fff',
                                fontSize: '14px',
                                fontWeight: 700,
                                fontFamily: 'Poppins, sans-serif',
                                cursor: saving ? 'not-allowed' : 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '10px',
                                boxShadow: '0 6px 24px rgba(255, 45, 120, 0.4)',
                            }}
                        >
                            {saving ? <RefreshCw size={16} className="animate-spin" /> : <Send size={16} />}
                            {saving ? 'Authorizing & Dispatching…' : 'Send Contract to Client 🚀'}
                        </button>
                    </div>
                </div>
            )}

            {/* ── INLINE BOTTOM NAVIGATION PANEL (Steps 1 to 4) ── */}
            {!signUrl && step < 5 && (
                <div style={{
                    marginTop: '20px',
                    width: '100%',
                    boxSizing: 'border-box',
                    background: 'rgba(16, 16, 22, 0.88)',
                    backdropFilter: 'blur(24px) saturate(180%)',
                    WebkitBackdropFilter: 'blur(24px) saturate(180%)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '20px',
                    padding: '14px 20px',
                    boxShadow: '0 12px 36px rgba(0, 0, 0, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '14px',
                    flexWrap: 'wrap',
                    position: 'relative',
                    zIndex: 5,
                }}>
                    <button
                        type="button"
                        onClick={prevStep}
                        disabled={step === 1}
                        style={{
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '10px',
                            padding: '10px 18px',
                            color: step === 1 ? '#555' : '#ccc',
                            cursor: step === 1 ? 'not-allowed' : 'pointer',
                            fontSize: '13px',
                            fontWeight: 600,
                            fontFamily: 'Poppins, sans-serif',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                        }}
                    >
                        <ArrowLeft size={15} /> Back
                    </button>

                    {/* Financial & Step Status Chips */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        <span style={{
                            fontSize: '12px',
                            fontWeight: 600,
                            color: '#888',
                            fontFamily: 'Poppins, sans-serif',
                        }}>
                            Step {step} of 5 · <strong style={{ color: '#fff' }}>{WIZARD_STEPS[step - 1].label}</strong>
                        </span>

                        <span style={{
                            background: 'rgba(0, 212, 120, 0.1)',
                            border: '1px solid rgba(0, 212, 120, 0.3)',
                            borderRadius: '50px',
                            padding: '3px 12px',
                            fontSize: '12px',
                            fontWeight: 700,
                            color: '#00D478',
                            fontFamily: 'Poppins, sans-serif',
                        }}>
                            Total: {fmt(t.grand)}
                        </span>
                    </div>

                    <button
                        type="button"
                        onClick={nextStep}
                        style={{
                            background: 'linear-gradient(135deg, #FF2D78 0%, #E0005E 100%)',
                            border: '1px solid rgba(255, 45, 120, 0.4)',
                            borderRadius: '10px',
                            padding: '10px 22px',
                            color: '#fff',
                            cursor: 'pointer',
                            fontSize: '13px',
                            fontWeight: 700,
                            fontFamily: 'Poppins, sans-serif',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            boxShadow: '0 4px 14px rgba(255, 45, 120, 0.3)',
                        }}
                    >
                        Continue <ArrowRight size={15} />
                    </button>
                </div>
            )}
        </div>
    );
}
