'use client';

import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import {
    Calendar, Mail, Smartphone, X, Edit2, Plus, ChevronDown, ChevronLeft, ChevronRight,
    Check, Copy, Eye, Search, Loader2, Trash2, Clock, Sparkles, Phone, MessageSquare,
    AlertTriangle, Tag, ExternalLink, User, CheckCircle2
} from 'lucide-react';
import BookingDetailModal from '@/components/admin/BookingDetailModal';
import AdminModal from '../AdminModal';

type Service = { id: string; name: string; category: string; priceLabel: string; };

type Booking = {
    id: string;
    guestName?: string;
    guestEmail?: string;
    guestPhone?: string;
    preferredDate: string;
    preferredTime: string;
    status: string;
    notes?: string;
    createdAt: string;
    userId?: string | null;
    user?: {
        name: string;
        email: string;
        phone?: string;
        image?: string | null;
        totalVisits?: number;
    };
    service: {
        name: string;
        priceLabel: string;
        duration?: number;
        category?: string;
    };
    additionalServiceIds?: string | null;
    inspoImageUrls?: string[];
    isPromoBooking?: boolean;
    promoPrice?: number | null;
    bookingIp?: string | null;
    bookingUserAgent?: string | null;
    bookingCountry?: string | null;
    bookingRegion?: string | null;
    bookingCity?: string | null;
    bookingLatitude?: string | null;
    bookingLongitude?: string | null;
    healthIntake?: {
        skinTypes?: string[];
        healthQ?: Record<string, 'yes' | 'no'>;
        healthQuestions?: { key: string; question: string; answer: 'yes' | 'no' }[];
        medications?: string;
        allergies?: string[];
        allergyNotes?: string;
        emergencyName?: string;
        emergencyPhone?: string;
        emergencyRelation?: string;
    } | null;
    staffLogs?: { id: string; label: string; text: string; createdAt: string }[];
};

const FILTERS = ['ALL', 'PENDING', 'CONTACTED', 'IN_TALKS', 'CONFIRMED', 'COMPLETED', 'CANCELLED'] as const;
type Filter = typeof FILTERS[number];

const statusColor: Record<string, string> = {
    PENDING: '#FFB700',
    CONTACTED: '#FF8C42',
    IN_TALKS: '#38BDF8',
    CONFIRMED: '#00D478',
    COMPLETED: '#FF2D78',
    CANCELLED: '#888888',
};

const statusBg: Record<string, string> = {
    PENDING: 'rgba(255, 183, 0, 0.12)',
    CONTACTED: 'rgba(255, 140, 66, 0.12)',
    IN_TALKS: 'rgba(56, 189, 248, 0.12)',
    CONFIRMED: 'rgba(0, 212, 120, 0.12)',
    COMPLETED: 'rgba(255, 45, 120, 0.12)',
    CANCELLED: 'rgba(255, 255, 255, 0.05)',
};

const STATUS_OPTIONS = ['PENDING', 'CONTACTED', 'IN_TALKS', 'CONFIRMED', 'COMPLETED', 'CANCELLED'] as const;
const statusLabel = (s: string) => s === 'IN_TALKS' ? 'In Talks' : s.charAt(0) + s.slice(1).toLowerCase();

function format12h(time24: string): string {
    if (!time24) return '';
    const [h, m] = time24.split(':');
    let hours = parseInt(h, 10);
    if (isNaN(hours)) return time24;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${hours}:${m || '00'} ${ampm}`;
}

function formatDate(dateStr: string): string {
    if (!dateStr) return '';
    try {
        const [year, month, day] = dateStr.split('-').map(Number);
        if (year && month && day) {
            const d = new Date(year, month - 1, day);
            return d.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric',
            });
        }
    } catch { }
    return dateStr;
}

// ─── Status Dropdown (Apple Liquid custom dark popover) ───────────────────
function StatusDropdown({ currentStatus, disabled, onSelect, onOpenChange }: {
    currentStatus: string;
    disabled?: boolean;
    onSelect: (status: string) => void;
    onOpenChange?: (open: boolean) => void;
}) {
    const [open, _setOpen] = useState(false);
    const setOpen = useCallback((v: boolean | ((prev: boolean) => boolean)) => {
        _setOpen(prev => {
            const next = typeof v === 'function' ? v(prev) : v;
            if (next !== prev) onOpenChange?.(next);
            return next;
        });
    }, [onOpenChange]);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;
        function handler(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        }
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [open]);

    const color = statusColor[currentStatus] || '#888';
    const options = STATUS_OPTIONS.filter(s => s !== currentStatus);

    return (
        <div ref={ref} style={{ position: 'relative', zIndex: open ? 50 : 'auto' }}>
            <button
                type="button"
                onClick={() => !disabled && setOpen(o => !o)}
                disabled={disabled}
                style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    background: `${color}14`, border: `1px solid ${color}44`,
                    color, borderRadius: '10px', padding: '7px 12px',
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    fontFamily: 'Poppins, sans-serif', fontSize: '12px', fontWeight: 600,
                    transition: 'all 0.18s ease', width: '100%', justifyContent: 'space-between',
                    opacity: disabled ? 0.5 : 1,
                }}
            >
                <span>Move to…</span>
                <ChevronDown size={13} style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }} />
            </button>
            {open && (
                <>
                    {/* Invisible backdrop to catch mouse events */}
                    <div style={{ position: 'fixed', inset: 0, zIndex: 9998 }} onMouseDown={() => setOpen(false)} />
                    <div style={{
                        position: 'absolute', top: 'calc(100% + 6px)', right: 0, zIndex: 9999,
                        background: '#16161f', border: '1px solid rgba(255,255,255,0.12)',
                        borderRadius: '14px', overflow: 'hidden', minWidth: '170px',
                        boxShadow: '0 16px 40px rgba(0,0,0,0.7)',
                        animation: 'adminModalScaleIn 0.18s ease',
                    }}>
                        {options.map(s => {
                            const c = statusColor[s] || '#888';
                            return (
                                <button
                                    key={s}
                                    type="button"
                                    onClick={() => { setOpen(false); onSelect(s); }}
                                    style={{
                                        width: '100%', display: 'flex', alignItems: 'center', gap: '8px',
                                        padding: '10px 14px', background: 'transparent',
                                        border: 'none', borderBottom: '1px solid rgba(255,255,255,0.05)',
                                        cursor: 'pointer', fontFamily: 'Poppins, sans-serif',
                                        fontSize: '12px', fontWeight: 500, color: '#ddd',
                                        textAlign: 'left', transition: 'background 0.15s',
                                    }}
                                    onMouseOver={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
                                    onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
                                >
                                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: c, flexShrink: 0 }} />
                                    {statusLabel(s)}
                                </button>
                            );
                        })}
                    </div>
                </>
            )}
        </div>
    );
}

const labelStyle: React.CSSProperties = {
    fontFamily: 'Poppins, sans-serif', color: '#aaa', fontSize: '11px',
    fontWeight: 600, display: 'block', marginBottom: '6px',
    textTransform: 'uppercase', letterSpacing: '0.5px',
};

// ─── Service Dropdown ──────────────────────────────────────────────────────
function ServiceDropdown({ services, value, onChange }: {
    services: Service[];
    value: string;
    onChange: (id: string) => void;
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

    const selected = services.find(s => s.id === value);
    const byCategory = services.reduce<Record<string, Service[]>>((acc, s) => {
        if (!acc[s.category]) acc[s.category] = [];
        acc[s.category].push(s);
        return acc;
    }, {});

    return (
        <div ref={ref} style={{ position: 'relative' }}>
            <button
                type="button"
                onClick={() => setOpen(o => !o)}
                style={{
                    width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    background: 'rgba(255,255,255,0.04)',
                    border: `1px solid ${open ? '#FF2D78' : 'rgba(255,255,255,0.1)'}`,
                    borderRadius: '12px', padding: '11px 14px', cursor: 'pointer',
                    fontFamily: 'Poppins, sans-serif', fontSize: '13px',
                    color: selected ? '#fff' : '#666', transition: 'border-color 0.2s',
                }}
            >
                <span>{selected ? `${selected.name} (${selected.priceLabel})` : '— Select a service —'}</span>
                <ChevronDown size={15} color="#666" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }} />
            </button>

            {open && (
                <div style={{
                    position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, zIndex: 100,
                    background: '#181822', border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: '14px', overflow: 'hidden',
                    boxShadow: '0 16px 40px rgba(0,0,0,0.7)',
                    maxHeight: '260px', overflowY: 'auto',
                }}>
                    {services.length === 0 && (
                        <div style={{ padding: '16px 14px', fontFamily: 'Poppins, sans-serif', color: '#666', fontSize: '13px' }}>
                            Loading services…
                        </div>
                    )}
                    {Object.entries(byCategory).map(([cat, svcs]) => (
                        <div key={cat}>
                            <div style={{
                                padding: '8px 14px 5px',
                                fontFamily: 'Poppins, sans-serif', fontSize: '10px', fontWeight: 700,
                                color: '#FF2D78', textTransform: 'uppercase', letterSpacing: '1px',
                                background: 'rgba(255,45,120,0.06)',
                                borderBottom: '1px solid rgba(255,255,255,0.05)',
                            }}>
                                {cat}
                            </div>
                            {svcs.map(s => {
                                const isSelected = value === s.id;
                                return (
                                    <button
                                        key={s.id}
                                        type="button"
                                        onClick={() => { onChange(s.id); setOpen(false); }}
                                        style={{
                                            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                            padding: '10px 14px',
                                            background: isSelected ? 'rgba(255,45,120,0.1)' : 'transparent',
                                            border: 'none', cursor: 'pointer', textAlign: 'left',
                                            borderBottom: '1px solid rgba(255,255,255,0.04)',
                                        }}
                                        onMouseOver={e => { if (!isSelected) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.05)'; }}
                                        onMouseOut={e => { if (!isSelected) (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
                                    >
                                        <div>
                                            <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: '13px', fontWeight: 500, color: isSelected ? '#FF2D78' : '#ddd' }}>
                                                {s.name}
                                            </div>
                                            <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: '11px', color: '#777' }}>
                                                {s.priceLabel}
                                            </div>
                                        </div>
                                        {isSelected && <Check size={14} color="#FF2D78" />}
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

// ─── Custom Date Picker ───────────────────────────────────────────────────
function DatePicker({ value, onChange, label }: { value: string; onChange: (v: string) => void; label?: string }) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const parsed = value ? new Date(`${value}T00:00:00`) : null;
    const [viewYear, setViewYear] = useState(parsed?.getFullYear() ?? new Date().getFullYear());
    const [viewMonth, setViewMonth] = useState(parsed?.getMonth() ?? new Date().getMonth());

    useEffect(() => {
        if (!open) return;
        function handler(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        }
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [open]);

    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const firstDay = new Date(viewYear, viewMonth, 1).getDay();
    const monthLabel = new Date(viewYear, viewMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    const dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
    const cells: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);

    function selectDay(d: number) {
        const iso = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        onChange(iso);
        setOpen(false);
    }

    function prevMonth() {
        if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
        else setViewMonth(m => m - 1);
    }
    function nextMonth() {
        if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
        else setViewMonth(m => m + 1);
    }

    const displayStr = parsed
        ? parsed.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
        : 'Select date';

    return (
        <div ref={ref} style={{ position: 'relative' }}>
            {label && <label style={{ ...labelStyle, fontSize: '10px' }}>{label}</label>}
            <button
                type="button"
                onClick={() => setOpen(o => !o)}
                style={{
                    width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    background: 'rgba(255,255,255,0.04)',
                    border: `1px solid ${open ? '#FF2D78' : 'rgba(255,255,255,0.1)'}`,
                    borderRadius: '12px', padding: '10px 14px', cursor: 'pointer',
                    fontFamily: 'Poppins, sans-serif', fontSize: '13px',
                    color: parsed ? '#fff' : '#666', transition: 'border-color 0.2s',
                }}
            >
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Calendar size={14} color="#FF6BA8" />
                    {displayStr}
                </span>
                <ChevronDown size={14} color="#666" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }} />
            </button>
            {open && (
                <div style={{
                    position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 200,
                    background: '#181822', border: '1px solid rgba(255,45,120,0.25)',
                    borderRadius: '16px', padding: '16px',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.7)',
                    width: '280px', animation: 'adminModalScaleIn 0.18s ease',
                }}>
                    {/* Month nav */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                        <button type="button" onClick={prevMonth} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#ccc' }}>
                            <ChevronLeft size={16} />
                        </button>
                        <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px', fontWeight: 600, color: '#fff' }}>{monthLabel}</span>
                        <button type="button" onClick={nextMonth} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#ccc' }}>
                            <ChevronRight size={16} />
                        </button>
                    </div>
                    {/* Day names */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', marginBottom: '6px' }}>
                        {dayNames.map(dn => (
                            <div key={dn} style={{ textAlign: 'center', fontFamily: 'Poppins, sans-serif', fontSize: '10px', fontWeight: 600, color: '#666', padding: '4px 0' }}>{dn}</div>
                        ))}
                    </div>
                    {/* Day grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
                        {cells.map((d, i) => {
                            if (d === null) return <div key={`e${i}`} />;
                            const iso = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                            const isSelected = value === iso;
                            const isToday = todayStr === iso;
                            return (
                                <button
                                    key={d}
                                    type="button"
                                    onClick={() => selectDay(d)}
                                    style={{
                                        width: '100%', aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        background: isSelected ? 'linear-gradient(135deg, #FF2D78, #CC1E5A)' : 'transparent',
                                        border: isToday && !isSelected ? '1px solid rgba(255,45,120,0.4)' : '1px solid transparent',
                                        borderRadius: '10px', cursor: 'pointer',
                                        fontFamily: 'Poppins, sans-serif', fontSize: '13px', fontWeight: isSelected ? 700 : 400,
                                        color: isSelected ? '#fff' : isToday ? '#FF6BA8' : '#ccc',
                                        transition: 'all 0.15s',
                                    }}
                                    onMouseOver={e => { if (!isSelected) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,45,120,0.12)'; }}
                                    onMouseOut={e => { if (!isSelected) (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
                                >{d}</button>
                            );
                        })}
                    </div>
                    {/* Quick: Today */}
                    <button type="button" onClick={() => { onChange(todayStr); setOpen(false); setViewMonth(today.getMonth()); setViewYear(today.getFullYear()); }} style={{
                        width: '100%', marginTop: '10px', padding: '8px 0', background: 'rgba(255,45,120,0.08)',
                        border: '1px solid rgba(255,45,120,0.2)', borderRadius: '10px',
                        fontFamily: 'Poppins, sans-serif', fontSize: '12px', fontWeight: 600,
                        color: '#FF6BA8', cursor: 'pointer', transition: 'all 0.15s',
                    }}>Today</button>
                </div>
            )}
        </div>
    );
}

// ─── Custom Time Picker ──────────────────────────────────────────────────
function TimePicker({ value, onChange, label }: { value: string; onChange: (v: string) => void; label?: string }) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;
        function handler(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        }
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [open]);

    // Generate time slots from 7:00 AM to 9:00 PM in 30-min increments
    const slots: string[] = [];
    for (let h = 7; h <= 21; h++) {
        slots.push(`${String(h).padStart(2, '0')}:00`);
        if (h < 21) slots.push(`${String(h).padStart(2, '0')}:30`);
    }

    const displayStr = value ? format12h(value) : 'Select time';

    return (
        <div ref={ref} style={{ position: 'relative' }}>
            {label && <label style={{ ...labelStyle, fontSize: '10px' }}>{label}</label>}
            <button
                type="button"
                onClick={() => setOpen(o => !o)}
                style={{
                    width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    background: 'rgba(255,255,255,0.04)',
                    border: `1px solid ${open ? '#FF2D78' : 'rgba(255,255,255,0.1)'}`,
                    borderRadius: '12px', padding: '10px 14px', cursor: 'pointer',
                    fontFamily: 'Poppins, sans-serif', fontSize: '13px',
                    color: value ? '#fff' : '#666', transition: 'border-color 0.2s',
                }}
            >
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Clock size={14} color="#FF6BA8" />
                    {displayStr}
                </span>
                <ChevronDown size={14} color="#666" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }} />
            </button>
            {open && (
                <div style={{
                    position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, zIndex: 200,
                    background: '#181822', border: '1px solid rgba(255,45,120,0.25)',
                    borderRadius: '16px', padding: '14px',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.7)',
                    maxHeight: '260px', overflowY: 'auto',
                    animation: 'adminModalScaleIn 0.18s ease',
                }}>
                    {(['Morning', 'Afternoon', 'Evening'] as const).map(period => {
                        const filtered = slots.filter(s => {
                            const h = parseInt(s.split(':')[0], 10);
                            if (period === 'Morning') return h >= 7 && h < 12;
                            if (period === 'Afternoon') return h >= 12 && h < 17;
                            return h >= 17;
                        });
                        if (filtered.length === 0) return null;
                        return (
                            <div key={period} style={{ marginBottom: '10px' }}>
                                <div style={{
                                    fontFamily: 'Poppins, sans-serif', fontSize: '10px', fontWeight: 700,
                                    color: '#FF6BA8', textTransform: 'uppercase', letterSpacing: '0.8px',
                                    marginBottom: '6px', paddingLeft: '2px',
                                }}>
                                    {period === 'Morning' ? '☀️ ' : period === 'Afternoon' ? '🌤️ ' : '🌙 '}{period}
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px' }}>
                                    {filtered.map(slot => {
                                        const isSelected = value === slot;
                                        return (
                                            <button
                                                key={slot}
                                                type="button"
                                                onClick={() => { onChange(slot); setOpen(false); }}
                                                style={{
                                                    padding: '8px 4px',
                                                    background: isSelected ? 'linear-gradient(135deg, #FF2D78, #CC1E5A)' : 'rgba(255,255,255,0.04)',
                                                    border: isSelected ? '1px solid #FF2D78' : '1px solid rgba(255,255,255,0.06)',
                                                    borderRadius: '8px', cursor: 'pointer',
                                                    fontFamily: 'Poppins, sans-serif', fontSize: '12px', fontWeight: isSelected ? 600 : 400,
                                                    color: isSelected ? '#fff' : '#ccc',
                                                    transition: 'all 0.15s',
                                                }}
                                                onMouseOver={e => { if (!isSelected) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,45,120,0.12)'; }}
                                                onMouseOut={e => { if (!isSelected) (e.currentTarget as HTMLButtonElement).style.background = isSelected ? 'linear-gradient(135deg, #FF2D78, #CC1E5A)' : 'rgba(255,255,255,0.04)'; }}
                                            >{format12h(slot)}</button>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                    {/* Custom time input fallback */}
                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '10px', marginTop: '4px' }}>
                        <label style={{ fontFamily: 'Poppins, sans-serif', fontSize: '10px', color: '#888', display: 'block', marginBottom: '4px' }}>Custom time</label>
                        <input
                            type="time"
                            value={value}
                            onChange={e => { onChange(e.target.value); setOpen(false); }}
                            style={{
                                width: '100%',
                                background: 'rgba(0,0,0,0.4)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '8px',
                                color: '#fff',
                                fontFamily: 'Poppins, sans-serif',
                                fontSize: '12px',
                                padding: '8px 10px',
                                outline: 'none',
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Add Appointment Modal ─────────────────────────────────────────────────
function AddAppointmentModal({ services, onClose, onSaved }: {
    services: Service[];
    onClose: () => void;
    onSaved: () => void;
}) {
    const [form, setForm] = useState({
        customerName: '', serviceId: '', preferredDate: '', preferredTime: '',
        email: '', phone: '', notes: '',
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!form.customerName.trim() || !form.serviceId || !form.preferredDate || !form.preferredTime) {
            setError('Name, service, date and time are required.');
            return;
        }
        setSaving(true);
        setError('');
        try {
            const res = await fetch('/api/admin/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customerName: form.customerName.trim(),
                    serviceId: form.serviceId,
                    preferredDate: form.preferredDate,
                    preferredTime: form.preferredTime,
                    email: form.email.trim() || undefined,
                    phone: form.phone.trim() || undefined,
                    notes: form.notes.trim() || undefined,
                }),
            });
            if (!res.ok) {
                const d = await res.json();
                setError(d.error || 'Failed to create appointment.');
            } else {
                onSaved();
                onClose();
            }
        } catch {
            setError('Network error. Please try again.');
        } finally {
            setSaving(false);
        }
    }

    return (
        <AdminModal onClose={onClose} maxWidth={480}>
            <div style={{ padding: '28px 24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px' }}>
                    <div>
                        <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, color: '#fff', fontSize: '19px', margin: '0 0 2px' }}>
                            Add Appointment
                        </h2>
                        <p style={{ fontFamily: 'Poppins, sans-serif', color: '#777', fontSize: '12px', margin: 0 }}>
                            Create a studio booking on behalf of a customer.
                        </p>
                    </div>
                    <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', cursor: 'pointer', padding: '7px', display: 'flex' }}>
                        <X size={16} color="#aaa" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {/* Customer Name */}
                    <div>
                        <label style={labelStyle}>Customer Name <span style={{ color: '#FF2D78' }}>*</span></label>
                        <input
                            type="text"
                            placeholder="e.g. Maria Lopez"
                            value={form.customerName}
                            onChange={e => set('customerName', e.target.value)}
                            style={{
                                width: '100%',
                                background: 'rgba(255,255,255,0.04)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '12px',
                                color: '#fff',
                                fontFamily: 'Poppins, sans-serif',
                                fontSize: '13px',
                                padding: '10px 14px',
                                outline: 'none',
                            }}
                        />
                    </div>

                    {/* Service */}
                    <div>
                        <label style={labelStyle}>Service <span style={{ color: '#FF2D78' }}>*</span></label>
                        <ServiceDropdown services={services} value={form.serviceId} onChange={id => set('serviceId', id)} />
                    </div>

                    {/* Date + Time */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <DatePicker label="Date *" value={form.preferredDate} onChange={v => set('preferredDate', v)} />
                        <TimePicker label="Time *" value={form.preferredTime} onChange={v => set('preferredTime', v)} />
                    </div>

                    {/* Email */}
                    <div>
                        <label style={labelStyle}>Email <span style={{ color: '#666', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
                        <input
                            type="email"
                            placeholder="customer@email.com"
                            value={form.email}
                            onChange={e => set('email', e.target.value)}
                            style={{
                                width: '100%',
                                background: 'rgba(255,255,255,0.04)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '12px',
                                color: '#fff',
                                fontFamily: 'Poppins, sans-serif',
                                fontSize: '13px',
                                padding: '10px 14px',
                                outline: 'none',
                            }}
                        />
                        <p style={{ fontFamily: 'Poppins, sans-serif', color: '#555', fontSize: '11px', margin: '4px 0 0' }}>
                            Matches existing customer accounts to link history & loyalty.
                        </p>
                    </div>

                    {/* Phone */}
                    <div>
                        <label style={labelStyle}>Phone <span style={{ color: '#666', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
                        <input
                            type="tel"
                            placeholder="+1 (760) 000-0000"
                            value={form.phone}
                            onChange={e => set('phone', e.target.value)}
                            style={{
                                width: '100%',
                                background: 'rgba(255,255,255,0.04)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '12px',
                                color: '#fff',
                                fontFamily: 'Poppins, sans-serif',
                                fontSize: '13px',
                                padding: '10px 14px',
                                outline: 'none',
                            }}
                        />
                    </div>

                    {/* Staff-only note */}
                    <div>
                        <label style={labelStyle}>Staff note <span style={{ color: '#666', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
                        <textarea
                            placeholder="Internal note for this appointment (how they booked, follow-up, etc.)…"
                            value={form.notes}
                            onChange={e => set('notes', e.target.value)}
                            rows={2}
                            style={{
                                width: '100%',
                                background: 'rgba(255,255,255,0.04)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '12px',
                                color: '#fff',
                                fontFamily: 'Poppins, sans-serif',
                                fontSize: '13px',
                                padding: '10px 14px',
                                outline: 'none',
                                resize: 'vertical',
                            }}
                        />
                    </div>

                    {error && (
                        <p style={{ fontFamily: 'Poppins, sans-serif', color: '#FF4D64', fontSize: '12px', background: 'rgba(255,60,80,0.1)', border: '1px solid rgba(255,60,80,0.25)', borderRadius: '10px', padding: '10px 14px', margin: 0 }}>
                            {error}
                        </p>
                    )}

                    <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                        <button
                            type="submit"
                            disabled={saving}
                            style={{
                                flex: 1,
                                padding: '12px',
                                borderRadius: '12px',
                                background: 'linear-gradient(135deg, #FF2D78, #CC1E5A)',
                                border: 'none',
                                color: '#fff',
                                fontFamily: 'Poppins, sans-serif',
                                fontSize: '13px',
                                fontWeight: 700,
                                cursor: saving ? 'not-allowed' : 'pointer',
                                opacity: saving ? 0.7 : 1,
                                boxShadow: '0 4px 16px rgba(255,45,120,0.3)',
                            }}
                        >
                            {saving ? 'Creating…' : 'Add Appointment'}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{
                                padding: '12px 18px',
                                borderRadius: '12px',
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                color: '#ccc',
                                fontFamily: 'Poppins, sans-serif',
                                fontSize: '13px',
                                cursor: 'pointer',
                            }}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </AdminModal>
    );
}

// ─── Mark Complete Confirm Modal ──────────────────────────────────────────
function MarkCompleteConfirmModal({
    booking, services, busy, onClose, onConfirm, onViewDetails,
}: {
    booking: Booking;
    services: Service[];
    busy: boolean;
    onClose: () => void;
    onConfirm: () => void;
    onViewDetails: () => void;
}) {
    const customerName = booking.user?.name || booking.guestName || 'Guest';
    const customerEmail = booking.user?.email || booking.guestEmail || '—';
    const customerPhone = booking.user?.phone || booking.guestPhone || '—';
    const additionalIds = booking.additionalServiceIds ? booking.additionalServiceIds.split(',') : [];
    const extraServices = additionalIds.map(id => services.find(s => s.id === id)).filter(Boolean) as Service[];
    const allServiceNames = [booking.service.name, ...extraServices.map(s => s.name)].join(', ');

    return (
        <AdminModal onClose={() => { if (!busy) onClose(); }} maxWidth={460} zIndex={400}>
            <div style={{ padding: '26px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '16px' }}>
                    <div>
                        <p style={{
                            fontFamily: 'Poppins, sans-serif',
                            fontSize: '11px', fontWeight: 700,
                            color: '#FF2D78', letterSpacing: '0.5px',
                            textTransform: 'uppercase', margin: '0 0 4px',
                        }}>
                            Confirm Completion
                        </p>
                        <h2 style={{
                            fontFamily: 'Poppins, sans-serif',
                            fontSize: '18px', fontWeight: 700, color: '#fff',
                            margin: 0, lineHeight: 1.3,
                        }}>
                            Mark this booking as complete?
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={busy}
                        style={{
                            background: 'rgba(255,255,255,0.06)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            color: '#aaa',
                            borderRadius: '10px',
                            width: '32px', height: '32px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: busy ? 'not-allowed' : 'pointer',
                            flexShrink: 0,
                        }}
                    >
                        <X size={16} />
                    </button>
                </div>

                <div style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: '16px',
                    padding: '16px',
                    marginBottom: '16px',
                }}>
                    <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '15px', fontWeight: 700, color: '#fff', margin: '0 0 4px' }}>
                        {customerName}
                    </p>
                    <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '13px', color: '#FF2D78', fontWeight: 600, margin: '0 0 10px' }}>
                        {allServiceNames} — {booking.service.priceLabel}{extraServices.length > 0 ? '+' : ''}
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px', color: '#bbb', display: 'flex', alignItems: 'center', gap: '6px', margin: 0 }}>
                            <Calendar size={12} color="#FF6BA8" /> {formatDate(booking.preferredDate)} at {format12h(booking.preferredTime)}
                        </p>
                        <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px', color: '#888', display: 'flex', alignItems: 'center', gap: '6px', margin: 0 }}>
                            <Mail size={12} /> {customerEmail}
                        </p>
                        <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px', color: '#888', display: 'flex', alignItems: 'center', gap: '6px', margin: 0 }}>
                            <Smartphone size={12} /> {customerPhone}
                        </p>
                        {booking.isPromoBooking && booking.promoPrice && (
                            <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px', color: '#00D478', fontWeight: 600, margin: '4px 0 0' }}>
                                🌸 April Special — Fixed ${booking.promoPrice}
                            </p>
                        )}
                    </div>
                </div>

                <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px', color: '#888', lineHeight: 1.5, margin: '0 0 18px' }}>
                    Completing automatically awards a studio loyalty stamp and sends the Google review request link via email/SMS.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <button
                        onClick={onConfirm}
                        disabled={busy}
                        style={{
                            padding: '12px 18px',
                            borderRadius: '12px',
                            background: 'linear-gradient(135deg, #00D478, #00A85A)',
                            border: 'none',
                            color: '#000',
                            fontFamily: 'Poppins, sans-serif',
                            fontSize: '13px',
                            fontWeight: 700,
                            cursor: busy ? 'not-allowed' : 'pointer',
                            opacity: busy ? 0.7 : 1,
                            boxShadow: '0 4px 16px rgba(0,212,120,0.25)',
                        }}
                    >
                        {busy ? 'Marking complete…' : 'Yes, mark complete 🎉'}
                    </button>
                    <button
                        onClick={onViewDetails}
                        disabled={busy}
                        style={{
                            background: 'rgba(255,255,255,0.06)',
                            border: '1px solid rgba(255,255,255,0.12)',
                            color: '#fff',
                            borderRadius: '12px',
                            padding: '11px 16px',
                            fontFamily: 'Poppins, sans-serif',
                            fontSize: '13px', fontWeight: 500,
                            cursor: busy ? 'not-allowed' : 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                        }}
                    >
                        <Eye size={14} color="#FF2D78" /> View full details instead
                    </button>
                    <button
                        onClick={onClose}
                        disabled={busy}
                        style={{
                            background: 'transparent',
                            border: '1px solid rgba(255,255,255,0.08)',
                            color: '#aaa',
                            borderRadius: '12px',
                            padding: '10px 16px',
                            fontFamily: 'Poppins, sans-serif',
                            fontSize: '12px',
                            cursor: 'pointer',
                        }}
                    >
                        Not yet — go back
                    </button>
                </div>
            </div>
        </AdminModal>
    );
}

// ─── Inline Confirm Panel ─────────────────────────────────────────────────
function ConfirmPanel({ booking, onDone, onCancel }: { booking: Booking; onDone: () => void; onCancel: () => void; }) {
    const [date, setDate] = useState(booking.preferredDate);
    const [time, setTime] = useState(booking.preferredTime);
    const [saving, setSaving] = useState(false);

    async function confirm() {
        setSaving(true);
        await fetch('/api/admin/bookings', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bookingId: booking.id, status: 'CONFIRMED', newDate: date, newTime: time }),
        });
        setSaving(false);
        onDone();
    }

    return (
        <div style={{
            marginTop: '16px',
            padding: '16px',
            borderRadius: '14px',
            background: 'rgba(0, 212, 120, 0.05)',
            border: '1px solid rgba(0, 212, 120, 0.25)',
            animation: 'adminModalScaleIn 0.2s ease',
        }}>
            {booking.isPromoBooking && booking.promoPrice && (
                <div style={{
                    background: 'rgba(255,45,120,0.12)',
                    border: '1px solid rgba(255,45,120,0.3)',
                    borderRadius: '12px', padding: '12px 14px',
                    marginBottom: '12px',
                    display: 'flex', alignItems: 'center', gap: '10px',
                }}>
                    <span style={{ fontSize: '20px', flexShrink: 0 }}>🌸</span>
                    <div>
                        <p style={{ fontFamily: 'Poppins, sans-serif', color: '#FF2D78', fontWeight: 700, fontSize: '13px', margin: '0 0 2px' }}>
                            April Special Booking — Fixed ${booking.promoPrice}
                        </p>
                        <p style={{ fontFamily: 'Poppins, sans-serif', color: '#ccc', fontSize: '12px', margin: 0 }}>
                            Client booked with special promo rate of <strong style={{ color: '#fff' }}>${booking.promoPrice}</strong>.
                        </p>
                    </div>
                </div>
            )}
            <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px', color: '#00D478', fontWeight: 600, margin: '0 0 10px' }}>
                📅 Confirm appointment — adjust scheduled date &amp; time if needed:
            </p>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '12px' }}>
                <div style={{ flex: 1, minWidth: '140px' }}>
                    <DatePicker label="Date" value={date} onChange={setDate} />
                </div>
                <div style={{ flex: 1, minWidth: '140px' }}>
                    <TimePicker label="Time" value={time} onChange={setTime} />
                </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
                <button
                    onClick={confirm}
                    disabled={saving}
                    style={{
                        padding: '9px 16px',
                        borderRadius: '10px',
                        background: 'linear-gradient(135deg, #00D478, #00A85A)',
                        border: 'none',
                        color: '#000',
                        fontFamily: 'Poppins, sans-serif',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: saving ? 'not-allowed' : 'pointer',
                        opacity: saving ? 0.7 : 1,
                        boxShadow: '0 4px 14px rgba(0,212,120,0.25)',
                    }}
                >
                    {saving ? 'Confirming…' : 'Confirm Appointment ✅'}
                </button>
                <button
                    onClick={onCancel}
                    style={{
                        padding: '9px 14px',
                        borderRadius: '10px',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: '#ccc',
                        fontFamily: 'Poppins, sans-serif',
                        fontSize: '12px',
                        cursor: 'pointer',
                    }}
                >
                    Cancel
                </button>
            </div>
        </div>
    );
}

// ─── Inline Edit Panel ────────────────────────────────────────────────────
function EditPanel({ booking, onDone, onCancel }: { booking: Booking; onDone: () => void; onCancel: () => void; }) {
    const [date, setDate] = useState(booking.preferredDate);
    const [time, setTime] = useState(booking.preferredTime);
    const [saving, setSaving] = useState(false);

    async function save() {
        setSaving(true);
        await fetch('/api/admin/bookings', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bookingId: booking.id, status: booking.status, newDate: date, newTime: time }),
        });
        setSaving(false);
        onDone();
    }

    return (
        <div style={{
            marginTop: '16px',
            padding: '16px',
            borderRadius: '14px',
            background: 'rgba(56, 189, 248, 0.05)',
            border: '1px solid rgba(56, 189, 248, 0.25)',
            animation: 'adminModalScaleIn 0.2s ease',
        }}>
            <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px', color: '#38BDF8', fontWeight: 600, margin: '0 0 10px' }}>
                ✏️ Reschedule Appointment (Customer will be notified of date/time updates):
            </p>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '12px' }}>
                <div style={{ flex: 1, minWidth: '140px' }}>
                    <DatePicker label="New Date" value={date} onChange={setDate} />
                </div>
                <div style={{ flex: 1, minWidth: '140px' }}>
                    <TimePicker label="New Time" value={time} onChange={setTime} />
                </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
                <button
                    onClick={save}
                    disabled={saving}
                    style={{
                        padding: '9px 16px',
                        borderRadius: '10px',
                        background: 'linear-gradient(135deg, #38BDF8, #0284C7)',
                        border: 'none',
                        color: '#000',
                        fontFamily: 'Poppins, sans-serif',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: saving ? 'not-allowed' : 'pointer',
                        opacity: saving ? 0.7 : 1,
                    }}
                >
                    {saving ? 'Saving…' : 'Save Changes'}
                </button>
                <button
                    onClick={onCancel}
                    style={{
                        padding: '9px 14px',
                        borderRadius: '10px',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: '#ccc',
                        fontFamily: 'Poppins, sans-serif',
                        fontSize: '12px',
                        cursor: 'pointer',
                    }}
                >
                    Cancel
                </button>
            </div>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────
export default function AdminBookingsPage() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [filter, setFilter] = useState<Filter>('ALL');
    const [loading, setLoading] = useState(true);
    const [nameSearchInput, setNameSearchInput] = useState('');
    const [debouncedNameQuery, setDebouncedNameQuery] = useState('');
    const [searchFetching, setSearchFetching] = useState(false);
    const [updating, setUpdating] = useState<string | null>(null);
    const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
    const [confirmingId, setConfirmingId] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
    const [completingBooking, setCompletingBooking] = useState<Booking | null>(null);
    const [cancellingBooking, setCancellingBooking] = useState<Booking | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [viewingBooking, setViewingBooking] = useState<Booking | null>(null);
    const initialListFetchDoneRef = useRef(false);

    useEffect(() => {
        const t = setTimeout(() => setDebouncedNameQuery(nameSearchInput.trim()), 400);
        return () => clearTimeout(t);
    }, [nameSearchInput]);

    const fetchBookings = useCallback(() => {
        const params = new URLSearchParams();
        if (filter !== 'ALL') params.set('status', filter);
        if (debouncedNameQuery) params.set('q', debouncedNameQuery);
        const qs = params.toString();
        const url = qs ? `/api/admin/bookings?${qs}` : '/api/admin/bookings';

        if (!initialListFetchDoneRef.current) {
            setLoading(true);
        } else {
            setSearchFetching(true);
        }

        return fetch(url)
            .then(r => r.json())
            .then(d => {
                setBookings(d.bookings || []);
            })
            .finally(() => {
                setLoading(false);
                setSearchFetching(false);
                initialListFetchDoneRef.current = true;
            });
    }, [filter, debouncedNameQuery]);

    useEffect(() => { fetchBookings(); }, [fetchBookings]);
    useEffect(() => {
        fetch('/api/services').then(r => r.json()).then(d => setServices(d.services || []));
    }, []);

    async function updateStatus(bookingId: string, status: string) {
        setUpdating(bookingId);
        await fetch('/api/admin/bookings', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bookingId, status }),
        });
        await fetchBookings();
        setUpdating(null);
    }

    async function deleteBooking(bookingId: string) {
        setDeletingId(bookingId);
        try {
            const res = await fetch(`/api/admin/bookings?id=${encodeURIComponent(bookingId)}`, {
                method: 'DELETE',
            });
            if (!res.ok) {
                const d = await res.json().catch(() => ({}));
                alert(d?.error || 'Failed to delete booking.');
            } else {
                setPendingDeleteId(null);
                setConfirmingId(null);
                setEditingId(null);
                if (viewingBooking?.id === bookingId) setViewingBooking(null);
                await fetchBookings();
            }
        } catch {
            alert('Network error while deleting booking.');
        } finally {
            setDeletingId(null);
        }
    }

    const searchTyping = nameSearchInput.trim() !== debouncedNameQuery;

    // Status counts
    const statusCounts = useMemo(() => {
        const c: Record<string, number> = { ALL: bookings.length };
        for (const s of STATUS_OPTIONS) c[s] = 0;
        for (const b of bookings) {
            if (c[b.status] !== undefined) c[b.status]++;
        }
        return c;
    }, [bookings]);

    const listSummary = useMemo(() => {
        const n = bookings.length;
        const unit = n === 1 ? 'booking' : 'bookings';
        if (debouncedNameQuery) {
            const scope = filter === 'ALL' ? '' : ` · ${filter.toLowerCase()}`;
            return `${n} ${unit} matching "${debouncedNameQuery}"${scope}`;
        }
        return `${n} ${filter === 'ALL' ? 'total' : filter.toLowerCase()} ${unit}`;
    }, [bookings.length, debouncedNameQuery, filter]);

    return (
        <div style={{ maxWidth: '1100px', margin: '0 auto', position: 'relative' }}>
            {/* Ambient Background Aura */}
            <div
                style={{
                    position: 'absolute',
                    top: '-60px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '600px',
                    height: '240px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(255,45,120,0.12) 0%, transparent 70%)',
                    filter: 'blur(50px)',
                    pointerEvents: 'none',
                    zIndex: 0,
                }}
            />

            {/* ─── EXECUTIVE COMMAND HEADER ───────────────────────────────── */}
            <div
                style={{
                    background: 'rgba(255, 255, 255, 0.025)',
                    backdropFilter: 'blur(24px) saturate(180%)',
                    WebkitBackdropFilter: 'blur(24px) saturate(180%)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '24px',
                    padding: '24px 28px',
                    marginBottom: '20px',
                    position: 'relative',
                    zIndex: 1,
                    boxShadow: '0 20px 50px rgba(0,0,0,0.4)',
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                        <h1
                            style={{
                                fontFamily: 'Poppins, sans-serif',
                                fontWeight: 800,
                                color: '#fff',
                                fontSize: 'clamp(22px, 3.2vw, 28px)',
                                margin: '0 0 6px',
                                letterSpacing: '-0.3px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                            }}
                        >
                            Studio Bookings & Schedule <span style={{ fontSize: '20px' }}>💅</span>
                        </h1>
                        <p style={{ fontFamily: 'Poppins, sans-serif', color: '#888', fontSize: '13px', margin: 0 }}>
                            Manage online reservations, triage pipeline stages, and dispatch client appointments.
                        </p>
                    </div>

                    <button
                        onClick={() => setShowAddModal(true)}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            background: 'linear-gradient(135deg, #FF2D78 0%, #CC1E5A 100%)',
                            border: 'none',
                            borderRadius: '14px',
                            padding: '11px 20px',
                            color: '#fff',
                            fontFamily: 'Poppins, sans-serif',
                            fontSize: '13px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            boxShadow: '0 4px 18px rgba(255,45,120,0.3)',
                            transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                        }}
                    >
                        <Plus size={16} /> Add Appointment
                    </button>
                </div>

                {/* Quick Status KPI Summary */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '18px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ padding: '6px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '11px', color: '#888', fontFamily: 'Poppins, sans-serif' }}>Total Active:</span>
                        <span style={{ fontSize: '12px', fontWeight: 700, color: '#fff', fontFamily: 'Poppins, sans-serif' }}>{bookings.length}</span>
                    </div>
                    <div style={{ padding: '6px 14px', borderRadius: '10px', background: 'rgba(255, 183, 0, 0.1)', border: '1px solid rgba(255, 183, 0, 0.25)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '11px', color: '#FFB700', fontFamily: 'Poppins, sans-serif' }}>Pending Action:</span>
                        <span style={{ fontSize: '12px', fontWeight: 700, color: '#FFB700', fontFamily: 'Poppins, sans-serif' }}>{statusCounts.PENDING || 0}</span>
                    </div>
                    <div style={{ padding: '6px 14px', borderRadius: '10px', background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.25)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '11px', color: '#38BDF8', fontFamily: 'Poppins, sans-serif' }}>In Talks:</span>
                        <span style={{ fontSize: '12px', fontWeight: 700, color: '#38BDF8', fontFamily: 'Poppins, sans-serif' }}>{statusCounts.IN_TALKS || 0}</span>
                    </div>
                    <div style={{ padding: '6px 14px', borderRadius: '10px', background: 'rgba(0, 212, 120, 0.1)', border: '1px solid rgba(0, 212, 120, 0.25)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '11px', color: '#00D478', fontFamily: 'Poppins, sans-serif' }}>Confirmed:</span>
                        <span style={{ fontSize: '12px', fontWeight: 700, color: '#00D478', fontFamily: 'Poppins, sans-serif' }}>{statusCounts.CONFIRMED || 0}</span>
                    </div>
                    <div style={{ padding: '6px 14px', borderRadius: '10px', background: 'rgba(255, 45, 120, 0.1)', border: '1px solid rgba(255, 45, 120, 0.25)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '11px', color: '#FF2D78', fontFamily: 'Poppins, sans-serif' }}>Completed:</span>
                        <span style={{ fontSize: '12px', fontWeight: 700, color: '#FF2D78', fontFamily: 'Poppins, sans-serif' }}>{statusCounts.COMPLETED || 0}</span>
                    </div>
                </div>
            </div>

            {/* ─── FILTERS & SEARCH CONTROL DECK ──────────────────────────── */}
            <div
                style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: '20px',
                    padding: '16px 20px',
                    marginBottom: '20px',
                    position: 'relative',
                    zIndex: 1,
                }}
            >
                {/* Segmented Filter Pills */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '14px' }}>
                    {FILTERS.map(f => {
                        const active = filter === f;
                        const c = statusColor[f] || '#FF2D78';
                        const count = statusCounts[f] ?? 0;
                        return (
                            <button
                                key={f}
                                onClick={() => { setFilter(f); setLoading(true); }}
                                style={{
                                    fontFamily: 'Poppins, sans-serif',
                                    fontSize: '12px',
                                    fontWeight: active ? 700 : 500,
                                    padding: '7px 16px',
                                    borderRadius: '50px',
                                    cursor: 'pointer',
                                    transition: 'all 0.18s ease',
                                    background: active
                                        ? `linear-gradient(135deg, ${c}28, ${c}10)`
                                        : 'rgba(255,255,255,0.03)',
                                    color: active ? c : '#888',
                                    border: active ? `1px solid ${c}55` : '1px solid rgba(255,255,255,0.06)',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                }}
                            >
                                <span>{f === 'IN_TALKS' ? 'In Talks' : f === 'ALL' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}</span>
                                <span
                                    style={{
                                        fontSize: '10px',
                                        padding: '1px 6px',
                                        borderRadius: '8px',
                                        background: active ? c : 'rgba(255,255,255,0.08)',
                                        color: active ? '#000' : '#888',
                                        fontWeight: 700,
                                    }}
                                >
                                    {count}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Real-time Glass Search Bar */}
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <Search size={16} color="#666" style={{ position: 'absolute', left: '16px', pointerEvents: 'none' }} />
                    <input
                        type="search"
                        value={nameSearchInput}
                        onChange={e => setNameSearchInput(e.target.value)}
                        placeholder="Search by client or guest name…"
                        autoComplete="off"
                        style={{
                            width: '100%',
                            background: 'rgba(0, 0, 0, 0.35)',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            borderRadius: '14px',
                            padding: '11px 44px',
                            fontFamily: 'Poppins, sans-serif',
                            fontSize: '13px',
                            color: '#fff',
                            outline: 'none',
                            transition: 'border-color 0.2s',
                        }}
                    />
                    <div style={{ position: 'absolute', right: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {(searchTyping || searchFetching) && (
                            <Loader2 size={16} color="#FF2D78" style={{ animation: 'pulseDot 1s infinite' }} />
                        )}
                        {nameSearchInput && (
                            <button
                                type="button"
                                aria-label="Clear search"
                                onClick={() => setNameSearchInput('')}
                                style={{
                                    background: 'rgba(255,255,255,0.08)',
                                    border: 'none',
                                    borderRadius: '8px',
                                    padding: '5px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <X size={14} color="#888" />
                            </button>
                        )}
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                    <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '11px', color: '#666', margin: 0 }}>
                        {loading ? 'Fetching bookings…' : listSummary}
                    </p>
                </div>
            </div>

            {/* ─── BOOKINGS STREAM (LIQUID GLASS CARDS) ───────────────────── */}
            <div
                style={{
                    display: 'grid',
                    gap: '14px',
                    opacity: searchFetching && !loading ? 0.6 : 1,
                    transition: 'opacity 0.2s ease',
                    pointerEvents: searchFetching && !loading ? 'none' : 'auto',
                    position: 'relative',
                    zIndex: 1,
                }}
            >
                {loading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                        <div
                            key={i}
                            style={{
                                height: '120px',
                                borderRadius: '20px',
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid rgba(255,255,255,0.06)',
                                animation: 'pulseDot 1.5s infinite',
                            }}
                        />
                    ))
                ) : bookings.length === 0 ? (
                    <div
                        style={{
                            padding: '50px 20px',
                            textAlign: 'center',
                            borderRadius: '20px',
                            background: 'rgba(255, 255, 255, 0.02)',
                            border: '1px solid rgba(255, 255, 255, 0.06)',
                        }}
                    >
                        <Calendar size={36} color="#444" style={{ margin: '0 auto 12px' }} />
                        <h4 style={{ fontFamily: 'Poppins, sans-serif', color: '#fff', fontSize: '16px', margin: '0 0 6px' }}>
                            No Bookings Found
                        </h4>
                        <p style={{ fontFamily: 'Poppins, sans-serif', color: '#777', fontSize: '13px', margin: 0 }}>
                            {debouncedNameQuery
                                ? `No appointments matched "${debouncedNameQuery}" in ${filter.toLowerCase()}.`
                                : `There are currently no ${filter === 'ALL' ? '' : filter.toLowerCase()} bookings on file.`}
                        </p>
                    </div>
                ) : (
                    bookings.map(b => {
                        const customerName = b.user?.name || b.guestName || 'Guest';
                        const customerEmail = b.user?.email || b.guestEmail || '';
                        const customerPhone = b.user?.phone || b.guestPhone || '';
                        const isGuest = !b.userId && !b.user;
                        const isConfirming = confirmingId === b.id;
                        const isEditing = editingId === b.id;
                        const canEdit = b.status === 'PENDING' || b.status === 'CONTACTED' || b.status === 'IN_TALKS' || b.status === 'CONFIRMED';

                        const additionalIds = b.additionalServiceIds ? b.additionalServiceIds.split(',') : [];
                        const extraServices = additionalIds.map(id => services.find(s => s.id === id)).filter(Boolean) as Service[];
                        const allServiceNames = [b.service.name, ...extraServices.map(s => s.name)].join(', ');
                        const color = statusColor[b.status] || '#FF2D78';

                        return (
                            <div
                                key={b.id}
                                style={{
                                    padding: '20px 24px',
                                    borderRadius: '20px',
                                    background: 'rgba(255, 255, 255, 0.025)',
                                    backdropFilter: 'blur(20px)',
                                    WebkitBackdropFilter: 'blur(20px)',
                                    border: '1px solid rgba(255, 255, 255, 0.07)',
                                    boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
                                    position: 'relative',
                                    zIndex: openDropdownId === b.id ? 100 : 1,
                                    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                                    {/* Left: Client Profile & Service Info */}
                                    <div style={{ flex: 1, minWidth: '260px' }}>
                                        {/* Client Header Row */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '8px' }}>
                                            <div
                                                style={{
                                                    width: '36px',
                                                    height: '36px',
                                                    borderRadius: '12px',
                                                    background: 'linear-gradient(135deg, rgba(255,45,120,0.2) 0%, rgba(255,107,168,0.1) 100%)',
                                                    border: '1px solid rgba(255, 45, 120, 0.3)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: '#FF2D78',
                                                    fontFamily: 'Poppins, sans-serif',
                                                    fontWeight: 700,
                                                    fontSize: '14px',
                                                    flexShrink: 0,
                                                }}
                                            >
                                                {customerName.charAt(0).toUpperCase()}
                                            </div>

                                            <div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                                    <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, color: '#fff', fontSize: '16px', margin: 0 }}>
                                                        {customerName}
                                                    </p>

                                                    <span
                                                        style={{
                                                            background: isGuest ? 'rgba(255,255,255,0.06)' : 'rgba(0, 212, 120, 0.12)',
                                                            border: `1px solid ${isGuest ? 'rgba(255,255,255,0.08)' : 'rgba(0, 212, 120, 0.25)'}`,
                                                            color: isGuest ? '#777' : '#00D478',
                                                            borderRadius: '6px',
                                                            padding: '2px 8px',
                                                            fontSize: '10px',
                                                            fontFamily: 'Poppins, sans-serif',
                                                            fontWeight: 600,
                                                        }}
                                                    >
                                                        {isGuest ? 'Guest' : 'Verified Client'}
                                                    </span>

                                                    {b.isPromoBooking && b.promoPrice && (
                                                        <span
                                                            style={{
                                                                background: 'rgba(255,45,120,0.15)',
                                                                border: '1px solid rgba(255,45,120,0.3)',
                                                                color: '#FF2D78',
                                                                borderRadius: '6px',
                                                                padding: '2px 8px',
                                                                fontFamily: 'Poppins, sans-serif',
                                                                fontSize: '10px',
                                                                fontWeight: 700,
                                                            }}
                                                        >
                                                            🌸 PROMO ${b.promoPrice}
                                                        </span>
                                                    )}

                                                    {b.healthIntake && (
                                                        <span
                                                            style={{
                                                                background: 'rgba(0,212,120,0.1)',
                                                                border: '1px solid rgba(0,212,120,0.25)',
                                                                color: '#00D478',
                                                                borderRadius: '6px',
                                                                padding: '2px 8px',
                                                                fontFamily: 'Poppins, sans-serif',
                                                                fontSize: '10px',
                                                                fontWeight: 600,
                                                            }}
                                                        >
                                                            🩺 Health Form
                                                        </span>
                                                    )}

                                                    <span
                                                        style={{
                                                            background: statusBg[b.status] || 'rgba(255,255,255,0.05)',
                                                            border: `1px solid ${color}44`,
                                                            color,
                                                            borderRadius: '8px',
                                                            padding: '2px 9px',
                                                            fontFamily: 'Poppins, sans-serif',
                                                            fontSize: '10px',
                                                            fontWeight: 700,
                                                            textTransform: 'uppercase',
                                                        }}
                                                    >
                                                        {statusLabel(b.status)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Booked Service & Price */}
                                        <p style={{
                                            fontFamily: 'Poppins, sans-serif',
                                            fontSize: '14px',
                                            fontWeight: 600,
                                            margin: '0 0 6px',
                                            color: '#FF6BA8',
                                        }}>
                                            {allServiceNames} — <span style={{ color: '#fff' }}>{b.service.priceLabel || 'Custom Quote'}{extraServices.length > 0 ? '+' : ''}</span>
                                        </p>

                                        {/* Date & Time Row */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap', marginBottom: '8px' }}>
                                            <span style={{ fontFamily: 'Poppins, sans-serif', color: '#ddd', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <Calendar size={13} color="#FF2D78" /> {formatDate(b.preferredDate)}
                                            </span>
                                            <span style={{ fontFamily: 'Poppins, sans-serif', color: '#ddd', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <Clock size={13} color="#00D478" /> {format12h(b.preferredTime)}
                                            </span>
                                        </div>

                                        {/* Contact Shortcuts */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginTop: '4px' }}>
                                            {customerPhone && (
                                                <>
                                                    <a
                                                        href={`tel:${customerPhone}`}
                                                        style={{
                                                            padding: '4px 10px',
                                                            borderRadius: '8px',
                                                            background: 'rgba(0, 212, 120, 0.08)',
                                                            border: '1px solid rgba(0, 212, 120, 0.2)',
                                                            color: '#00D478',
                                                            textDecoration: 'none',
                                                            fontFamily: 'Poppins, sans-serif',
                                                            fontSize: '11px',
                                                            fontWeight: 600,
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            gap: '4px',
                                                        }}
                                                    >
                                                        <Phone size={11} /> {customerPhone}
                                                    </a>
                                                    <a
                                                        href={`sms:${customerPhone}`}
                                                        style={{
                                                            padding: '4px 10px',
                                                            borderRadius: '8px',
                                                            background: 'rgba(56, 189, 248, 0.08)',
                                                            border: '1px solid rgba(56, 189, 248, 0.2)',
                                                            color: '#38BDF8',
                                                            textDecoration: 'none',
                                                            fontFamily: 'Poppins, sans-serif',
                                                            fontSize: '11px',
                                                            fontWeight: 600,
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            gap: '4px',
                                                        }}
                                                    >
                                                        <MessageSquare size={11} /> SMS
                                                    </a>
                                                </>
                                            )}

                                            {customerEmail && (
                                                <a
                                                    href={`mailto:${customerEmail}`}
                                                    style={{
                                                        padding: '4px 10px',
                                                        borderRadius: '8px',
                                                        background: 'rgba(255, 45, 120, 0.08)',
                                                        border: '1px solid rgba(255, 45, 120, 0.2)',
                                                        color: '#FF2D78',
                                                        textDecoration: 'none',
                                                        fontFamily: 'Poppins, sans-serif',
                                                        fontSize: '11px',
                                                        fontWeight: 600,
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '4px',
                                                    }}
                                                >
                                                    <Mail size={11} /> {customerEmail}
                                                </a>
                                            )}
                                        </div>

                                        {/* Client Notes Quotation Box */}
                                        {b.notes && (
                                            <div
                                                style={{
                                                    marginTop: '10px',
                                                    background: 'rgba(0,0,0,0.25)',
                                                    borderLeft: '2px solid #FF2D78',
                                                    padding: '8px 12px',
                                                    borderRadius: '0 8px 8px 0',
                                                }}
                                            >
                                                <p style={{ fontFamily: 'Poppins, sans-serif', color: '#ccc', fontSize: '12px', margin: 0, fontStyle: 'italic', lineHeight: 1.45 }}>
                                                    "{b.notes}"
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Right: Actions Column */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flexShrink: 0, minWidth: '140px' }}>
                                        {/* View Details */}
                                        <button
                                            type="button"
                                            onClick={() => setViewingBooking(b)}
                                            style={{
                                                background: 'rgba(255, 45, 120, 0.12)',
                                                border: '1px solid rgba(255, 45, 120, 0.3)',
                                                color: '#FF2D78',
                                                borderRadius: '10px',
                                                padding: '8px 14px',
                                                cursor: 'pointer',
                                                fontFamily: 'Poppins, sans-serif',
                                                fontSize: '12px',
                                                fontWeight: 600,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '6px',
                                                transition: 'all 0.18s ease',
                                            }}
                                        >
                                            <Eye size={13} /> View Details
                                        </button>

                                        {/* Move to… Dropdown */}
                                        {b.status !== 'COMPLETED' && b.status !== 'CANCELLED' && !isConfirming && !isEditing && (
                                            <StatusDropdown
                                                currentStatus={b.status}
                                                disabled={updating === b.id}
                                                onOpenChange={(isOpen) => setOpenDropdownId(isOpen ? b.id : null)}
                                                onSelect={(newStatus) => {
                                                    if (newStatus === 'CONFIRMED') {
                                                        setConfirmingId(b.id); setEditingId(null);
                                                    } else if (newStatus === 'COMPLETED') {
                                                        setCompletingBooking(b);
                                                    } else if (newStatus === 'CANCELLED') {
                                                        setCancellingBooking(b);
                                                    } else {
                                                        updateStatus(b.id, newStatus);
                                                    }
                                                }}
                                            />
                                        )}

                                        {/* Edit Date/Time */}
                                        {canEdit && !isConfirming && !isEditing && (
                                            <button
                                                type="button"
                                                onClick={() => { setEditingId(b.id); setConfirmingId(null); }}
                                                style={{
                                                    background: 'rgba(255,255,255,0.04)',
                                                    border: '1px solid rgba(255,255,255,0.08)',
                                                    color: '#ccc',
                                                    borderRadius: '10px',
                                                    padding: '7px 12px',
                                                    cursor: 'pointer',
                                                    fontFamily: 'Poppins, sans-serif',
                                                    fontSize: '12px',
                                                    fontWeight: 500,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '5px',
                                                    transition: 'all 0.18s ease',
                                                }}
                                            >
                                                <Edit2 size={12} /> Reschedule
                                            </button>
                                        )}

                                        {/* Delete Booking */}
                                        {!isConfirming && !isEditing && pendingDeleteId !== b.id && (
                                            <button
                                                type="button"
                                                onClick={() => { setPendingDeleteId(b.id); setConfirmingId(null); setEditingId(null); }}
                                                style={{
                                                    background: 'transparent',
                                                    border: '1px solid rgba(255,60,80,0.2)',
                                                    color: '#ff6b6b',
                                                    borderRadius: '10px',
                                                    padding: '6px 12px',
                                                    cursor: 'pointer',
                                                    fontFamily: 'Poppins, sans-serif',
                                                    fontSize: '11px',
                                                    fontWeight: 500,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '5px',
                                                    transition: 'all 0.18s ease',
                                                }}
                                            >
                                                <Trash2 size={11} /> Delete
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Inline Confirm Panel */}
                                {isConfirming && (
                                    <ConfirmPanel
                                        booking={b}
                                        onDone={async () => { setConfirmingId(null); await fetchBookings(); }}
                                        onCancel={() => setConfirmingId(null)}
                                    />
                                )}

                                {/* Inline Reschedule Panel */}
                                {isEditing && (
                                    <EditPanel
                                        booking={b}
                                        onDone={async () => { setEditingId(null); await fetchBookings(); }}
                                        onCancel={() => setEditingId(null)}
                                    />
                                )}

                                {/* Inline Delete Cascading Warning */}
                                {pendingDeleteId === b.id && (
                                    <div
                                        style={{
                                            marginTop: '16px',
                                            padding: '16px',
                                            borderRadius: '14px',
                                            background: 'rgba(255, 60, 80, 0.08)',
                                            border: '1px solid rgba(255, 60, 80, 0.28)',
                                            animation: 'adminModalScaleIn 0.2s ease',
                                        }}
                                    >
                                        <p style={{ fontFamily: 'Poppins, sans-serif', color: '#ff6b6b', fontSize: '13px', fontWeight: 700, margin: '0 0 6px' }}>
                                            Permanently delete this booking?
                                        </p>
                                        <p style={{ fontFamily: 'Poppins, sans-serif', color: '#ccc', fontSize: '12px', lineHeight: 1.5, margin: '0 0 12px' }}>
                                            This removes all notification logs, review tokens, discount codes, reviews, and staff notes tied to this booking. Loyalty stamps already earned by the customer will remain safe in their account. This cannot be undone.
                                        </p>
                                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                            <button
                                                onClick={() => deleteBooking(b.id)}
                                                disabled={deletingId === b.id}
                                                style={{
                                                    background: 'linear-gradient(135deg, #FF2D78, #FF4D64)',
                                                    color: '#fff',
                                                    border: 'none',
                                                    borderRadius: '10px',
                                                    padding: '8px 16px',
                                                    fontFamily: 'Poppins, sans-serif',
                                                    fontSize: '12px',
                                                    fontWeight: 700,
                                                    cursor: deletingId === b.id ? 'not-allowed' : 'pointer',
                                                    opacity: deletingId === b.id ? 0.7 : 1,
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '6px',
                                                }}
                                            >
                                                <Trash2 size={12} />
                                                {deletingId === b.id ? 'Deleting…' : 'Yes, delete permanently'}
                                            </button>
                                            <button
                                                onClick={() => setPendingDeleteId(null)}
                                                disabled={deletingId === b.id}
                                                style={{
                                                    background: 'rgba(255,255,255,0.06)',
                                                    border: '1px solid rgba(255,255,255,0.1)',
                                                    color: '#ccc',
                                                    borderRadius: '10px',
                                                    padding: '8px 14px',
                                                    fontFamily: 'Poppins, sans-serif',
                                                    fontSize: '12px',
                                                    cursor: 'pointer',
                                                }}
                                            >
                                                Keep booking
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>

            {/* ─── MODALS ─────────────────────────────────────────────────── */}
            {showAddModal && (
                <AddAppointmentModal
                    services={services}
                    onClose={() => setShowAddModal(false)}
                    onSaved={fetchBookings}
                />
            )}

            {viewingBooking && (
                <BookingDetailModal
                    booking={viewingBooking as any}
                    onClose={() => setViewingBooking(null)}
                    onBookingUpdated={(b) => {
                        setViewingBooking(b as Booking);
                        setBookings(prev => prev.map(x => x.id === b.id ? (b as Booking) : x));
                    }}
                />
            )}

            {completingBooking && (
                <MarkCompleteConfirmModal
                    booking={completingBooking}
                    services={services}
                    busy={updating === completingBooking.id}
                    onClose={() => setCompletingBooking(null)}
                    onConfirm={async () => {
                        const id = completingBooking.id;
                        await updateStatus(id, 'COMPLETED');
                        setCompletingBooking(null);
                    }}
                    onViewDetails={() => {
                        const b = completingBooking;
                        setCompletingBooking(null);
                        setViewingBooking(b);
                    }}
                />
            )}

            {cancellingBooking && (
                <AdminModal onClose={() => setCancellingBooking(null)} maxWidth={440} zIndex={400}>
                    <div style={{ padding: '26px' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '16px' }}>
                            <div>
                                <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '11px', fontWeight: 700, color: '#ff6b6b', letterSpacing: '0.5px', textTransform: 'uppercase', margin: '0 0 4px' }}>
                                    Cancel Booking
                                </p>
                                <h2 style={{ fontFamily: 'Poppins, sans-serif', fontSize: '18px', fontWeight: 700, color: '#fff', margin: 0, lineHeight: 1.3 }}>
                                    Are you sure?
                                </h2>
                            </div>
                            <button
                                onClick={() => setCancellingBooking(null)}
                                style={{
                                    background: 'rgba(255,255,255,0.06)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    color: '#aaa',
                                    borderRadius: '10px',
                                    width: '32px', height: '32px',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    cursor: 'pointer',
                                    flexShrink: 0,
                                }}
                            >
                                <X size={16} />
                            </button>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', padding: '14px 16px', marginBottom: '16px' }}>
                            <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '15px', fontWeight: 700, color: '#fff', margin: '0 0 4px' }}>
                                {cancellingBooking.user?.name || cancellingBooking.guestName || 'Guest'}
                            </p>
                            <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '13px', color: '#FF2D78', fontWeight: 600, margin: '0 0 8px' }}>
                                {cancellingBooking.service.name} — {cancellingBooking.service.priceLabel}
                            </p>
                            <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px', color: '#bbb', display: 'flex', alignItems: 'center', gap: '6px', margin: 0 }}>
                                <Calendar size={12} color="#FF6BA8" /> {formatDate(cancellingBooking.preferredDate)} at {format12h(cancellingBooking.preferredTime)}
                            </p>
                        </div>
                        <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px', color: '#888', lineHeight: 1.5, margin: '0 0 18px' }}>
                            Cancelling will immediately send an automated cancellation SMS notice to the client if a phone number is on file.
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <button
                                onClick={async () => { const id = cancellingBooking.id; setCancellingBooking(null); await updateStatus(id, 'CANCELLED'); }}
                                disabled={updating === cancellingBooking.id}
                                style={{
                                    background: 'rgba(255,60,80,0.15)',
                                    border: '1px solid rgba(255,60,80,0.4)',
                                    color: '#FF4D64',
                                    borderRadius: '12px',
                                    padding: '12px 18px',
                                    fontFamily: 'Poppins, sans-serif',
                                    fontSize: '13px',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    transition: 'all 0.15s',
                                    opacity: updating === cancellingBooking.id ? 0.7 : 1,
                                }}
                            >
                                {updating === cancellingBooking.id ? 'Cancelling…' : 'Yes, cancel this booking'}
                            </button>
                            <button
                                onClick={() => setCancellingBooking(null)}
                                style={{
                                    background: 'transparent',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    color: '#aaa',
                                    borderRadius: '12px',
                                    padding: '11px 16px',
                                    fontFamily: 'Poppins, sans-serif',
                                    fontSize: '12px',
                                    cursor: 'pointer',
                                }}
                            >
                                Go back
                            </button>
                        </div>
                    </div>
                </AdminModal>
            )}
        </div>
    );
}
