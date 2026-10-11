'use client';

import React, { useState } from 'react';
import { X, Calendar, Clock, Sparkles, Check, ArrowRight } from 'lucide-react';

export interface DateRangeSelection {
    type: 'preset' | 'custom';
    presetKey?: string; // '1h' | '24h' | '7d' | '14d' | '30d' | '90d'
    startDate?: string; // ISO string
    endDate?: string;   // ISO string
    label: string;
}

interface AnalyticsDateRangeModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentSelection: DateRangeSelection;
    onApply: (sel: DateRangeSelection) => void;
}

const PRESETS = [
    { key: '1h', label: 'Last 1 Hour', badge: 'Realtime ⚡', durationMs: 60 * 60 * 1000 },
    { key: '24h', label: 'Last 24 Hours', badge: 'Hourly 🕒', durationMs: 24 * 60 * 60 * 1000 },
    { key: 'today', label: 'Today (Since 12 AM)', badge: null },
    { key: 'yesterday', label: 'Yesterday (Full Day)', badge: null },
    { key: '7d', label: 'Last 7 Days', badge: null, durationMs: 7 * 24 * 60 * 60 * 1000 },
    { key: '14d', label: 'Last 14 Days', badge: null, durationMs: 14 * 24 * 60 * 60 * 1000 },
    { key: '30d', label: 'Last 30 Days', badge: 'Standard', durationMs: 30 * 24 * 60 * 60 * 1000 },
    { key: '90d', label: 'Last 90 Days', badge: 'Quarter', durationMs: 90 * 24 * 60 * 60 * 1000 },
];

function toLocalDatetimeInput(date: Date): string {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export default function AnalyticsDateRangeModal({
    isOpen,
    onClose,
    currentSelection,
    onApply,
}: AnalyticsDateRangeModalProps) {
    if (!isOpen) return null;

    const now = new Date();
    const defaultStart = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const [selectedPreset, setSelectedPreset] = useState<string | null>(
        currentSelection.type === 'preset' ? currentSelection.presetKey || '30d' : null
    );
    const [customStart, setCustomStart] = useState<string>(
        currentSelection.startDate
            ? toLocalDatetimeInput(new Date(currentSelection.startDate))
            : toLocalDatetimeInput(defaultStart)
    );
    const [customEnd, setCustomEnd] = useState<string>(
        currentSelection.endDate
            ? toLocalDatetimeInput(new Date(currentSelection.endDate))
            : toLocalDatetimeInput(now)
    );
    const [error, setError] = useState<string | null>(null);

    const handlePresetClick = (presetKey: string) => {
        setSelectedPreset(presetKey);
        setError(null);

        const nowDate = new Date();
        if (presetKey === '1h') {
            const s = new Date(nowDate.getTime() - 60 * 60 * 1000);
            setCustomStart(toLocalDatetimeInput(s));
            setCustomEnd(toLocalDatetimeInput(nowDate));
        } else if (presetKey === '24h') {
            const s = new Date(nowDate.getTime() - 24 * 60 * 60 * 1000);
            setCustomStart(toLocalDatetimeInput(s));
            setCustomEnd(toLocalDatetimeInput(nowDate));
        } else if (presetKey === 'today') {
            const s = new Date(nowDate);
            s.setHours(0, 0, 0, 0);
            setCustomStart(toLocalDatetimeInput(s));
            setCustomEnd(toLocalDatetimeInput(nowDate));
        } else if (presetKey === 'yesterday') {
            const s = new Date(nowDate);
            s.setDate(s.getDate() - 1);
            s.setHours(0, 0, 0, 0);
            const e = new Date(s);
            e.setHours(23, 59, 59, 999);
            setCustomStart(toLocalDatetimeInput(s));
            setCustomEnd(toLocalDatetimeInput(e));
        } else {
            const days = parseInt(presetKey.replace('d', ''), 10) || 30;
            const s = new Date(nowDate.getTime() - days * 24 * 60 * 60 * 1000);
            setCustomStart(toLocalDatetimeInput(s));
            setCustomEnd(toLocalDatetimeInput(nowDate));
        }
    };

    const handleApply = () => {
        if (selectedPreset && (selectedPreset === '1h' || selectedPreset === '24h' || selectedPreset.endsWith('d'))) {
            const p = PRESETS.find(pr => pr.key === selectedPreset);
            onApply({
                type: 'preset',
                presetKey: selectedPreset,
                label: p?.label || selectedPreset.toUpperCase(),
            });
            onClose();
            return;
        }

        const s = new Date(customStart);
        const e = new Date(customEnd);

        if (isNaN(s.getTime()) || isNaN(e.getTime())) {
            setError('Please provide valid start and end dates.');
            return;
        }

        if (s >= e) {
            setError('Start date/time must be strictly earlier than end date/time.');
            return;
        }

        const formatDateShort = (d: Date) =>
            d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });

        onApply({
            type: 'custom',
            startDate: s.toISOString(),
            endDate: e.toISOString(),
            label: `${formatDateShort(s)} – ${formatDateShort(e)}`,
        });
        onClose();
    };

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 9999,
                background: 'rgba(0, 0, 0, 0.75)',
                backdropFilter: 'blur(12px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '16px',
            }}
            onClick={onClose}
        >
            <div
                style={{
                    background: 'linear-gradient(135deg, rgba(26, 26, 36, 0.95) 0%, rgba(16, 16, 24, 0.98) 100%)',
                    border: '1px solid rgba(255, 45, 120, 0.25)',
                    borderRadius: '24px',
                    width: '100%',
                    maxWidth: '560px',
                    boxShadow: '0 24px 60px rgba(0, 0, 0, 0.6), 0 0 30px rgba(255, 45, 120, 0.1)',
                    overflow: 'hidden',
                    animation: 'scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <style>{`
                    @keyframes scaleIn {
                        from { opacity: 0; transform: scale(0.96); }
                        to { opacity: 1; transform: scale(1); }
                    }
                `}</style>

                {/* Modal Header */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '20px 24px',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div
                            style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '10px',
                                background: 'rgba(255, 45, 120, 0.15)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#FF2D78',
                            }}
                        >
                            <Calendar size={18} />
                        </div>
                        <div>
                            <h3
                                style={{
                                    fontFamily: 'Poppins, sans-serif',
                                    fontSize: '16px',
                                    fontWeight: 700,
                                    color: '#fff',
                                    margin: 0,
                                }}
                            >
                                Custom Date & Time Filter
                            </h3>
                            <p
                                style={{
                                    fontFamily: 'Poppins, sans-serif',
                                    fontSize: '11px',
                                    color: '#888',
                                    margin: '2px 0 0',
                                }}
                            >
                                Track analytics from last hour to custom date & time windows
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'rgba(255, 255, 255, 0.06)',
                            border: 'none',
                            color: '#aaa',
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                        }}
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Modal Body */}
                <div style={{ padding: '24px', maxHeight: '75vh', overflowY: 'auto' }}>
                    {/* Quick Presets Grid */}
                    <div style={{ marginBottom: '24px' }}>
                        <label
                            style={{
                                display: 'block',
                                fontFamily: 'Poppins, sans-serif',
                                fontSize: '11px',
                                fontWeight: 600,
                                color: '#FF2D78',
                                textTransform: 'uppercase',
                                letterSpacing: '0.8px',
                                marginBottom: '12px',
                            }}
                        >
                            ⚡ Quick Timeframe Presets
                        </label>
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                                gap: '8px',
                            }}
                        >
                            {PRESETS.map((p) => {
                                const active = selectedPreset === p.key;
                                return (
                                    <button
                                        key={p.key}
                                        type="button"
                                        onClick={() => handlePresetClick(p.key)}
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'flex-start',
                                            padding: '10px 14px',
                                            borderRadius: '12px',
                                            background: active
                                                ? 'rgba(255, 45, 120, 0.16)'
                                                : 'rgba(255, 255, 255, 0.03)',
                                            border: active
                                                ? '1.5px solid #FF2D78'
                                                : '1px solid rgba(255, 255, 255, 0.08)',
                                            color: active ? '#fff' : '#ccc',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease',
                                            textAlign: 'left',
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: '4px' }}>
                                            <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px', fontWeight: active ? 700 : 500 }}>
                                                {p.label}
                                            </span>
                                            {active && <Check size={14} color="#FF2D78" />}
                                        </div>
                                        {p.badge && (
                                            <span
                                                style={{
                                                    fontSize: '9px',
                                                    fontWeight: 600,
                                                    color: active ? '#FF2D78' : '#00D478',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.5px',
                                                }}
                                            >
                                                {p.badge}
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Custom Range Picker */}
                    <div
                        style={{
                            background: 'rgba(0, 0, 0, 0.3)',
                            border: '1px solid rgba(255, 255, 255, 0.06)',
                            borderRadius: '16px',
                            padding: '16px',
                            marginBottom: '16px',
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                            <Clock size={15} color="#00D478" />
                            <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px', fontWeight: 600, color: '#fff' }}>
                                Precise Date & Time Range
                            </span>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <div>
                                <label
                                    style={{
                                        display: 'block',
                                        fontFamily: 'Poppins, sans-serif',
                                        fontSize: '11px',
                                        color: '#888',
                                        marginBottom: '6px',
                                    }}
                                >
                                    Start Time (From)
                                </label>
                                <input
                                    type="datetime-local"
                                    value={customStart}
                                    onChange={(e) => {
                                        setCustomStart(e.target.value);
                                        setSelectedPreset(null);
                                        setError(null);
                                    }}
                                    style={{
                                        width: '100%',
                                        background: 'rgba(255, 255, 255, 0.05)',
                                        border: '1px solid rgba(255, 255, 255, 0.12)',
                                        borderRadius: '10px',
                                        padding: '10px 12px',
                                        color: '#fff',
                                        fontFamily: 'Poppins, sans-serif',
                                        fontSize: '12px',
                                        outline: 'none',
                                    }}
                                />
                            </div>

                            <div>
                                <label
                                    style={{
                                        display: 'block',
                                        fontFamily: 'Poppins, sans-serif',
                                        fontSize: '11px',
                                        color: '#888',
                                        marginBottom: '6px',
                                    }}
                                >
                                    End Time (To)
                                </label>
                                <input
                                    type="datetime-local"
                                    value={customEnd}
                                    onChange={(e) => {
                                        setCustomEnd(e.target.value);
                                        setSelectedPreset(null);
                                        setError(null);
                                    }}
                                    style={{
                                        width: '100%',
                                        background: 'rgba(255, 255, 255, 0.05)',
                                        border: '1px solid rgba(255, 255, 255, 0.12)',
                                        borderRadius: '10px',
                                        padding: '10px 12px',
                                        color: '#fff',
                                        fontFamily: 'Poppins, sans-serif',
                                        fontSize: '12px',
                                        outline: 'none',
                                    }}
                                />
                            </div>
                        </div>

                        {error && (
                            <p
                                style={{
                                    fontFamily: 'Poppins, sans-serif',
                                    fontSize: '11px',
                                    color: '#FF2D78',
                                    marginTop: '10px',
                                    marginBottom: 0,
                                }}
                            >
                                ⚠️ {error}
                            </p>
                        )}
                    </div>
                </div>

                {/* Modal Footer */}
                <div
                    style={{
                        padding: '16px 24px',
                        background: 'rgba(0, 0, 0, 0.3)',
                        borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: '10px',
                    }}
                >
                    <button
                        type="button"
                        onClick={onClose}
                        style={{
                            background: 'transparent',
                            border: '1px solid rgba(255, 255, 255, 0.12)',
                            borderRadius: '12px',
                            color: '#aaa',
                            fontFamily: 'Poppins, sans-serif',
                            fontSize: '13px',
                            fontWeight: 500,
                            padding: '10px 20px',
                            cursor: 'pointer',
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleApply}
                        style={{
                            background: 'linear-gradient(135deg, #FF2D78 0%, #CC1E5A 100%)',
                            border: 'none',
                            borderRadius: '12px',
                            color: '#fff',
                            fontFamily: 'Poppins, sans-serif',
                            fontSize: '13px',
                            fontWeight: 600,
                            padding: '10px 24px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            boxShadow: '0 4px 15px rgba(255, 45, 120, 0.35)',
                        }}
                    >
                        Apply Timeframe <ArrowRight size={15} />
                    </button>
                </div>
            </div>
        </div>
    );
}
