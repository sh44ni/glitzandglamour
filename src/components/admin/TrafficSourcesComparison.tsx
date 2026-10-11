'use client';

import React, { useState, useMemo } from 'react';
import {
    TrendingUp, TrendingDown, Users, Globe, ExternalLink,
    ChevronDown, ChevronUp, Sparkles, Zap, Flame, Crown,
    Search, ArrowUpDown, Clock, MousePointerClick, ShieldCheck,
    Check, Layers
} from 'lucide-react';

export interface TrafficSourceMetric {
    canonicalSite: string;
    displayName: string;
    category: string;
    iconType: string;
    brandColor: string;
    currentVisits: number;
    currentVisitors: number;
    currentSharePct: number;
    prevVisits: number;
    prevVisitors: number;
    prevSharePct: number;
    visitorGrowthPct: number;
    shareShiftPct: number;
    avgDurationSec: number;
    bounceRatePct: number;
    highIntentCount: number;
    conversionRatePct: number;
    isLeader: boolean;
    isFastestGrowing: boolean;
    timeline: { timeLabel: string; visits: number; visitors: number }[];
    subdomains: { rawHost: string; count: number }[];
}

export interface TrafficAnalyticsData {
    totalTrafficVisitors: number;
    prevTotalTrafficVisitors: number;
    bucketResolution: '5m' | '1h' | '1d';
    timeBuckets: string[];
    sources: TrafficSourceMetric[];
}

interface TrafficSourcesComparisonProps {
    data: TrafficAnalyticsData;
    timeLabel?: string;
}

function fmtSec(s: number): string {
    if (!s || s <= 0) return '0s';
    if (s < 60) return `${s}s`;
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}m ${sec}s`;
}

// Brand icon mapper
function SourceBrandIcon({ iconType, color, size = 18 }: { iconType: string; color: string; size?: number }) {
    if (iconType === 'instagram') {
        return (
            <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color }}>
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
            </svg>
        );
    }
    if (iconType === 'facebook') {
        return (
            <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color }}>
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
            </svg>
        );
    }
    if (iconType === 'google') {
        return (
            <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color }}>
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 8v8"/>
                <path d="M8 12h8"/>
            </svg>
        );
    }
    if (iconType === 'tiktok') {
        return (
            <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color }}>
                <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/>
            </svg>
        );
    }
    return <Globe size={size} style={{ color }} />;
}

export default function TrafficSourcesComparison({ data, timeLabel = 'selected period' }: TrafficSourcesComparisonProps) {
    const { sources, totalTrafficVisitors, prevTotalTrafficVisitors, timeBuckets, bucketResolution } = data;

    const [viewMode, setViewMode] = useState<'leaderboard' | 'compare'>('leaderboard');
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedSource, setExpandedSource] = useState<string | null>(null);

    // Head-to-Head Selection
    const [compareSourceAKey, setCompareSourceAKey] = useState<string>(sources[0]?.canonicalSite || '');
    const [compareSourceBKey, setCompareSourceBKey] = useState<string>(sources[1]?.canonicalSite || sources[0]?.canonicalSite || '');
    const [hoveredBucket, setHoveredBucket] = useState<string | null>(null);

    // Filtered sources
    const filteredSources = useMemo(() => {
        if (!searchQuery.trim()) return sources;
        const q = searchQuery.toLowerCase().trim();
        return sources.filter(
            s => s.displayName.toLowerCase().includes(q) || s.canonicalSite.toLowerCase().includes(q)
        );
    }, [sources, searchQuery]);

    // Source A & B objects for Head-to-Head
    const sourceA = useMemo(() => sources.find(s => s.canonicalSite === compareSourceAKey) || sources[0], [sources, compareSourceAKey]);
    const sourceB = useMemo(() => sources.find(s => s.canonicalSite === compareSourceBKey) || sources[1] || sources[0], [sources, compareSourceBKey]);

    const maxVisitors = sources[0]?.currentVisitors || 1;

    // Timeline max for Head-to-Head chart
    const timelineMax = useMemo(() => {
        let max = 1;
        if (!sourceA && !sourceB) return max;
        timeBuckets.forEach(bKey => {
            const vA = sourceA?.timeline.find(t => t.timeLabel === bKey)?.visitors || 0;
            const vB = sourceB?.timeline.find(t => t.timeLabel === bKey)?.visitors || 0;
            if (vA > max) max = vA;
            if (vB > max) max = vB;
        });
        return max;
    }, [sourceA, sourceB, timeBuckets]);

    if (!sources || sources.length === 0) {
        return (
            <div style={{ padding: '30px', textAlign: 'center', color: '#888', background: 'rgba(22, 22, 30, 0.4)', borderRadius: '20px' }}>
                <p>No traffic recorded for this timeframe yet.</p>
            </div>
        );
    }

    return (
        <div
            style={{
                background: 'linear-gradient(135deg, rgba(22, 22, 30, 0.7) 0%, rgba(14, 14, 20, 0.8) 100%)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '24px',
                padding: '24px',
                marginBottom: '24px',
                boxShadow: '0 20px 50px rgba(0, 0, 0, 0.4)',
            }}
        >
            {/* Header: Title + Mode Toggle */}
            <div
                style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '16px',
                    marginBottom: '20px',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                    paddingBottom: '16px',
                }}
            >
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '18px' }}>🌐</span>
                        <h3 style={{ fontFamily: 'Poppins, sans-serif', fontSize: '16px', fontWeight: 700, color: '#fff', margin: 0 }}>
                            Inbound Traffic Sources &amp; Performance
                        </h3>
                    </div>
                    <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px', color: '#888', margin: '4px 0 0' }}>
                        Track which site delivers visitors, identify surging channels, and run head-to-head comparisons.
                    </p>
                </div>

                {/* Segmented View Switcher */}
                <div
                    style={{
                        display: 'flex',
                        background: 'rgba(0, 0, 0, 0.4)',
                        padding: '3px',
                        borderRadius: '12px',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                    }}
                >
                    <button
                        type="button"
                        onClick={() => setViewMode('leaderboard')}
                        style={{
                            fontFamily: 'Poppins, sans-serif',
                            fontSize: '11px',
                            fontWeight: viewMode === 'leaderboard' ? 700 : 500,
                            padding: '6px 14px',
                            borderRadius: '9px',
                            border: 'none',
                            cursor: 'pointer',
                            background: viewMode === 'leaderboard' ? 'linear-gradient(135deg, #FF2D78 0%, #CC1E5A 100%)' : 'transparent',
                            color: viewMode === 'leaderboard' ? '#fff' : '#888',
                            boxShadow: viewMode === 'leaderboard' ? '0 2px 8px rgba(255, 45, 120, 0.3)' : 'none',
                            transition: 'all 0.2s ease',
                        }}
                    >
                        📊 Ranked Sources
                    </button>
                    <button
                        type="button"
                        onClick={() => setViewMode('compare')}
                        style={{
                            fontFamily: 'Poppins, sans-serif',
                            fontSize: '11px',
                            fontWeight: viewMode === 'compare' ? 700 : 500,
                            padding: '6px 14px',
                            borderRadius: '9px',
                            border: 'none',
                            cursor: 'pointer',
                            background: viewMode === 'compare' ? 'linear-gradient(135deg, #FF2D78 0%, #CC1E5A 100%)' : 'transparent',
                            color: viewMode === 'compare' ? '#fff' : '#888',
                            boxShadow: viewMode === 'compare' ? '0 2px 8px rgba(255, 45, 120, 0.3)' : 'none',
                            transition: 'all 0.2s ease',
                        }}
                    >
                        ⚔️ Compare Head-to-Head
                    </button>
                </div>
            </div>

            {/* ══════════════════════════════════════════════════════════════════
               PROPORTIONAL TRAFFIC SHARE BAR (Always Visible at Top)
               ══════════════════════════════════════════════════════════════════ */}
            <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '11px', fontWeight: 600, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Visitor Share by Website ({totalTrafficVisitors.toLocaleString()} total visitors)
                    </span>
                    <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '11px', color: '#00D478' }}>
                        {sources.length} active source{sources.length === 1 ? '' : 's'}
                    </span>
                </div>

                {/* Multi-segment share progress bar */}
                <div
                    style={{
                        height: '10px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: '6px',
                        overflow: 'hidden',
                        display: 'flex',
                        border: '1px solid rgba(255, 255, 255, 0.06)',
                    }}
                >
                    {sources.map((s) => {
                        const pct = s.currentSharePct;
                        if (pct <= 0) return null;
                        return (
                            <div
                                key={s.canonicalSite}
                                title={`${s.displayName} (${s.canonicalSite}): ${s.currentVisitors} visitors (${pct}%)`}
                                style={{
                                    width: `${pct}%`,
                                    background: s.brandColor,
                                    height: '100%',
                                    transition: 'width 0.4s ease',
                                }}
                            />
                        );
                    })}
                </div>

                {/* Mini Legend */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', marginTop: '10px' }}>
                    {sources.slice(0, 5).map((s) => (
                        <div key={s.canonicalSite} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: s.brandColor }} />
                            <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '11px', color: '#ccc' }}>
                                {s.displayName} <strong style={{ color: '#fff' }}>{s.currentSharePct}%</strong>
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* ══════════════════════════════════════════════════════════════════
               VIEW 1: RANKED LEADERBOARD & PERFORMANCE DRILLDOWN
               ══════════════════════════════════════════════════════════════════ */}
            {viewMode === 'leaderboard' && (
                <div>
                    {/* Search / Filter Box */}
                    {sources.length > 4 && (
                        <div style={{ marginBottom: '16px', position: 'relative' }}>
                            <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#777' }} />
                            <input
                                type="text"
                                placeholder="Filter sources by site name (e.g. instagram, google)..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{
                                    width: '100%',
                                    background: 'rgba(0, 0, 0, 0.35)',
                                    border: '1px solid rgba(255, 255, 255, 0.08)',
                                    borderRadius: '12px',
                                    padding: '8px 12px 8px 36px',
                                    fontFamily: 'Poppins, sans-serif',
                                    fontSize: '12px',
                                    color: '#fff',
                                    outline: 'none',
                                }}
                            />
                        </div>
                    )}

                    {/* Sources Cards */}
                    <div style={{ display: 'grid', gap: '12px' }}>
                        {filteredSources.map((s, idx) => {
                            const isExpanded = expandedSource === s.canonicalSite;
                            const isPositiveGrowth = s.visitorGrowthPct > 0;
                            const isNegativeGrowth = s.visitorGrowthPct < 0;

                            return (
                                <div
                                    key={s.canonicalSite}
                                    style={{
                                        background: 'rgba(255, 255, 255, 0.025)',
                                        border: s.isLeader
                                            ? '1px solid rgba(255, 45, 120, 0.3)'
                                            : '1px solid rgba(255, 255, 255, 0.06)',
                                        borderRadius: '16px',
                                        padding: '16px 20px',
                                        transition: 'all 0.2s ease',
                                    }}
                                >
                                    {/* Main Row */}
                                    <div
                                        style={{
                                            display: 'flex',
                                            flexWrap: 'wrap',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            gap: '12px',
                                        }}
                                    >
                                        {/* Left: Rank, Icon, Site Name, Badges */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: '220px' }}>
                                            <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '13px', fontWeight: 700, color: s.isLeader ? '#FF2D78' : '#777', width: '22px' }}>
                                                #{idx + 1}
                                            </span>

                                            <div
                                                style={{
                                                    width: '36px',
                                                    height: '36px',
                                                    borderRadius: '10px',
                                                    background: `${s.brandColor}22`,
                                                    border: `1px solid ${s.brandColor}44`,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    flexShrink: 0,
                                                }}
                                            >
                                                <SourceBrandIcon iconType={s.iconType} color={s.brandColor} size={18} />
                                            </div>

                                            <div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                                                    <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '13px', fontWeight: 600, color: '#fff' }}>
                                                        {s.displayName}
                                                    </span>
                                                    <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '11px', color: '#777' }}>
                                                        ({s.canonicalSite})
                                                    </span>

                                                    {/* Status Badges */}
                                                    {s.isLeader && (
                                                        <span
                                                            style={{
                                                                display: 'inline-flex',
                                                                alignItems: 'center',
                                                                gap: '3px',
                                                                background: 'rgba(255, 45, 120, 0.15)',
                                                                border: '1px solid rgba(255, 45, 120, 0.35)',
                                                                color: '#FF2D78',
                                                                fontSize: '9px',
                                                                fontWeight: 700,
                                                                padding: '2px 7px',
                                                                borderRadius: '20px',
                                                                textTransform: 'uppercase',
                                                            }}
                                                        >
                                                            <Crown size={10} /> Market Leader
                                                        </span>
                                                    )}
                                                    {s.isFastestGrowing && (
                                                        <span
                                                            style={{
                                                                display: 'inline-flex',
                                                                alignItems: 'center',
                                                                gap: '3px',
                                                                background: 'rgba(0, 212, 120, 0.15)',
                                                                border: '1px solid rgba(0, 212, 120, 0.35)',
                                                                color: '#00D478',
                                                                fontSize: '9px',
                                                                fontWeight: 700,
                                                                padding: '2px 7px',
                                                                borderRadius: '20px',
                                                                textTransform: 'uppercase',
                                                            }}
                                                        >
                                                            <Flame size={10} /> Top Climber
                                                        </span>
                                                    )}
                                                </div>

                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
                                                    <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '11px', color: '#aaa' }}>
                                                        ⏱ Avg Time: <strong style={{ color: '#fff' }}>{fmtSec(s.avgDurationSec)}</strong>
                                                    </span>
                                                    <span style={{ color: '#444' }}>•</span>
                                                    <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '11px', color: '#aaa' }}>
                                                        Bounce: <strong style={{ color: '#fff' }}>{s.bounceRatePct}%</strong>
                                                    </span>
                                                    {s.highIntentCount > 0 && (
                                                        <>
                                                            <span style={{ color: '#444' }}>•</span>
                                                            <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '11px', color: '#00D478' }}>
                                                                🎯 <strong>{s.highIntentCount}</strong> high-intent ({s.conversionRatePct}%)
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right: Visitors Count, Share %, Self-comparison Growth % */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'flex-end', gap: '6px' }}>
                                                    <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '15px', fontWeight: 700, color: '#fff' }}>
                                                        {s.currentVisitors.toLocaleString()}
                                                    </span>
                                                    <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '11px', color: '#888' }}>
                                                        visitors ({s.currentVisits} views)
                                                    </span>
                                                </div>

                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px', marginTop: '3px' }}>
                                                    <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '11px', fontWeight: 600, color: s.brandColor }}>
                                                        {s.currentSharePct}% share
                                                    </span>

                                                    {/* Trend vs Prior Window */}
                                                    <span
                                                        style={{
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            gap: '2px',
                                                            fontFamily: 'Poppins, sans-serif',
                                                            fontSize: '11px',
                                                            fontWeight: 600,
                                                            color: isPositiveGrowth ? '#00D478' : isNegativeGrowth ? '#FF4560' : '#888',
                                                        }}
                                                    >
                                                        {isPositiveGrowth ? <TrendingUp size={12} /> : isNegativeGrowth ? <TrendingDown size={12} /> : null}
                                                        {isPositiveGrowth ? `+${s.visitorGrowthPct}%` : `${s.visitorGrowthPct}%`}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Expand/Collapse Button */}
                                            <button
                                                type="button"
                                                onClick={() => setExpandedSource(isExpanded ? null : s.canonicalSite)}
                                                style={{
                                                    background: 'rgba(255, 255, 255, 0.05)',
                                                    border: 'none',
                                                    borderRadius: '8px',
                                                    color: '#888',
                                                    padding: '6px',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                }}
                                            >
                                                {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Proportional Volume Bar */}
                                    <div style={{ marginTop: '12px', height: '4px', background: 'rgba(255, 255, 255, 0.04)', borderRadius: '2px', overflow: 'hidden' }}>
                                        <div
                                            style={{
                                                height: '100%',
                                                width: `${Math.round((s.currentVisitors / maxVisitors) * 100)}%`,
                                                background: s.brandColor,
                                                borderRadius: '2px',
                                            }}
                                        />
                                    </div>

                                    {/* Expandable Drilldown: Raw Hosts & Self-Comparison Summary */}
                                    {isExpanded && (
                                        <div
                                            style={{
                                                marginTop: '16px',
                                                paddingTop: '16px',
                                                borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                                                display: 'grid',
                                                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                                                gap: '16px',
                                            }}
                                        >
                                            {/* Self-comparison box */}
                                            <div style={{ background: 'rgba(0, 0, 0, 0.25)', padding: '12px 14px', borderRadius: '12px' }}>
                                                <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '11px', fontWeight: 600, color: '#aaa', margin: '0 0 6px', textTransform: 'uppercase' }}>
                                                    📈 Comparison vs Prior Period
                                                </p>
                                                <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px', color: '#ccc', margin: '0 0 4px' }}>
                                                    Prior Visitors: <strong style={{ color: '#fff' }}>{s.prevVisitors}</strong> ({s.prevVisits} views)
                                                </p>
                                                <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px', color: '#ccc', margin: '0 0 4px' }}>
                                                    Market Share Shift:{' '}
                                                    <strong style={{ color: s.shareShiftPct >= 0 ? '#00D478' : '#FF4560' }}>
                                                        {s.shareShiftPct >= 0 ? `+${s.shareShiftPct}%` : `${s.shareShiftPct}%`}
                                                    </strong>
                                                </p>
                                                <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '11px', color: '#888', margin: 0 }}>
                                                    {s.visitorGrowthPct >= 15
                                                        ? '🚀 Rapidly improving momentum over the previous period.'
                                                        : s.visitorGrowthPct <= -15
                                                        ? '🔻 Traffic dropped compared to previous period.'
                                                        : '⚖️ Consistent and steady visitor flow.'}
                                                </p>
                                            </div>

                                            {/* Subdomain breakdown */}
                                            {s.subdomains.length > 0 && (
                                                <div style={{ background: 'rgba(0, 0, 0, 0.25)', padding: '12px 14px', borderRadius: '12px' }}>
                                                    <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '11px', fontWeight: 600, color: '#aaa', margin: '0 0 6px', textTransform: 'uppercase' }}>
                                                        🔍 Detected Hostnames &amp; Entry Points
                                                    </p>
                                                    <div style={{ display: 'grid', gap: '4px' }}>
                                                        {s.subdomains.map(sub => (
                                                            <div key={sub.rawHost} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontFamily: 'Poppins, sans-serif' }}>
                                                                <span style={{ color: '#bbb' }}>{sub.rawHost}</span>
                                                                <span style={{ color: '#fff', fontWeight: 600 }}>{sub.count} views</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* ══════════════════════════════════════════════════════════════════
               VIEW 2: HEAD-TO-HEAD SOURCE COMPARISON (Site A vs Site B)
               ══════════════════════════════════════════════════════════════════ */}
            {viewMode === 'compare' && (
                <div>
                    {/* Source Pickers */}
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr auto 1fr',
                            alignItems: 'center',
                            gap: '12px',
                            background: 'rgba(0, 0, 0, 0.3)',
                            padding: '16px',
                            borderRadius: '16px',
                            marginBottom: '20px',
                            border: '1px solid rgba(255, 255, 255, 0.06)',
                        }}
                    >
                        <div>
                            <label style={{ display: 'block', fontFamily: 'Poppins, sans-serif', fontSize: '11px', color: '#FF2D78', fontWeight: 600, marginBottom: '6px' }}>
                                SELECT SOURCE A
                            </label>
                            <select
                                value={compareSourceAKey}
                                onChange={(e) => setCompareSourceAKey(e.target.value)}
                                style={{
                                    width: '100%',
                                    background: 'rgba(255, 255, 255, 0.06)',
                                    border: '1px solid rgba(255, 45, 120, 0.3)',
                                    borderRadius: '10px',
                                    padding: '8px 12px',
                                    color: '#fff',
                                    fontFamily: 'Poppins, sans-serif',
                                    fontSize: '13px',
                                    outline: 'none',
                                }}
                            >
                                {sources.map(s => (
                                    <option key={s.canonicalSite} value={s.canonicalSite} style={{ background: '#1a1a24', color: '#fff' }}>
                                        {s.displayName} ({s.canonicalSite})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div style={{ textAlign: 'center', padding: '0 8px' }}>
                            <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px', fontWeight: 800, color: '#FF2D78', background: 'rgba(255, 45, 120, 0.1)', padding: '4px 8px', borderRadius: '8px' }}>
                                VS
                            </span>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontFamily: 'Poppins, sans-serif', fontSize: '11px', color: '#4FC3F7', fontWeight: 600, marginBottom: '6px' }}>
                                SELECT SOURCE B
                            </label>
                            <select
                                value={compareSourceBKey}
                                onChange={(e) => setCompareSourceBKey(e.target.value)}
                                style={{
                                    width: '100%',
                                    background: 'rgba(255, 255, 255, 0.06)',
                                    border: '1px solid rgba(79, 195, 247, 0.3)',
                                    borderRadius: '10px',
                                    padding: '8px 12px',
                                    color: '#fff',
                                    fontFamily: 'Poppins, sans-serif',
                                    fontSize: '13px',
                                    outline: 'none',
                                }}
                            >
                                {sources.map(s => (
                                    <option key={s.canonicalSite} value={s.canonicalSite} style={{ background: '#1a1a24', color: '#fff' }}>
                                        {s.displayName} ({s.canonicalSite})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Side-by-Side Comparison Metrics Table */}
                    {sourceA && sourceB && (
                        <div
                            style={{
                                background: 'rgba(0, 0, 0, 0.25)',
                                borderRadius: '16px',
                                border: '1px solid rgba(255, 255, 255, 0.06)',
                                overflow: 'hidden',
                                marginBottom: '24px',
                            }}
                        >
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontFamily: 'Poppins, sans-serif' }}>
                                <thead>
                                    <tr style={{ background: 'rgba(255, 255, 255, 0.04)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                                        <th style={{ padding: '12px 16px', fontSize: '11px', color: '#888', fontWeight: 600, textTransform: 'uppercase' }}>Metric</th>
                                        <th style={{ padding: '12px 16px', fontSize: '12px', color: '#FF2D78', fontWeight: 700 }}>
                                            {sourceA.displayName}
                                        </th>
                                        <th style={{ padding: '12px 16px', fontSize: '12px', color: '#4FC3F7', fontWeight: 700 }}>
                                            {sourceB.displayName}
                                        </th>
                                        <th style={{ padding: '12px 16px', fontSize: '11px', color: '#00D478', fontWeight: 600, textAlign: 'right' }}>Winning Edge</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[
                                        {
                                            label: 'Unique Visitors',
                                            valA: sourceA.currentVisitors.toLocaleString(),
                                            valB: sourceB.currentVisitors.toLocaleString(),
                                            winner: sourceA.currentVisitors > sourceB.currentVisitors ? 'Source A' : sourceB.currentVisitors > sourceA.currentVisitors ? 'Source B' : 'Tied',
                                            note: sourceA.currentVisitors > sourceB.currentVisitors
                                                ? `+${Math.round(((sourceA.currentVisitors - sourceB.currentVisitors) / (sourceB.currentVisitors || 1)) * 100)}% more visitors`
                                                : sourceB.currentVisitors > sourceA.currentVisitors
                                                ? `+${Math.round(((sourceB.currentVisitors - sourceA.currentVisitors) / (sourceA.currentVisitors || 1)) * 100)}% more visitors`
                                                : 'Evenly matched',
                                        },
                                        {
                                            label: 'Traffic Share of Total',
                                            valA: `${sourceA.currentSharePct}%`,
                                            valB: `${sourceB.currentSharePct}%`,
                                            winner: sourceA.currentSharePct > sourceB.currentSharePct ? 'Source A' : sourceB.currentSharePct > sourceA.currentSharePct ? 'Source B' : 'Tied',
                                            note: `${Math.abs(sourceA.currentSharePct - sourceB.currentSharePct).toFixed(1)}% share lead`,
                                        },
                                        {
                                            label: 'Growth vs Prior Period',
                                            valA: `${sourceA.visitorGrowthPct >= 0 ? '+' : ''}${sourceA.visitorGrowthPct}%`,
                                            valB: `${sourceB.visitorGrowthPct >= 0 ? '+' : ''}${sourceB.visitorGrowthPct}%`,
                                            winner: sourceA.visitorGrowthPct > sourceB.visitorGrowthPct ? 'Source A' : sourceB.visitorGrowthPct > sourceA.visitorGrowthPct ? 'Source B' : 'Tied',
                                            note: sourceA.visitorGrowthPct > sourceB.visitorGrowthPct ? 'Faster growing' : 'Faster growing',
                                        },
                                        {
                                            label: 'Avg Time on Site (Quality)',
                                            valA: fmtSec(sourceA.avgDurationSec),
                                            valB: fmtSec(sourceB.avgDurationSec),
                                            winner: sourceA.avgDurationSec > sourceB.avgDurationSec ? 'Source A' : sourceB.avgDurationSec > sourceA.avgDurationSec ? 'Source B' : 'Tied',
                                            note: sourceA.avgDurationSec > sourceB.avgDurationSec ? 'Longer session engagement' : 'Longer session engagement',
                                        },
                                        {
                                            label: 'Bounce Rate (Lower is Better)',
                                            valA: `${sourceA.bounceRatePct}%`,
                                            valB: `${sourceB.bounceRatePct}%`,
                                            winner: sourceA.bounceRatePct < sourceB.bounceRatePct ? 'Source A' : sourceB.bounceRatePct < sourceA.bounceRatePct ? 'Source B' : 'Tied',
                                            note: sourceA.bounceRatePct < sourceB.bounceRatePct ? 'More sticky traffic' : 'More sticky traffic',
                                        },
                                        {
                                            label: 'High-Intent Visits (Bookings/Forms)',
                                            valA: `${sourceA.highIntentCount} (${sourceA.conversionRatePct}%)`,
                                            valB: `${sourceB.highIntentCount} (${sourceB.conversionRatePct}%)`,
                                            winner: sourceA.highIntentCount > sourceB.highIntentCount ? 'Source A' : sourceB.highIntentCount > sourceA.highIntentCount ? 'Source B' : 'Tied',
                                            note: sourceA.highIntentCount > sourceB.highIntentCount ? 'Higher conversion volume' : 'Higher conversion volume',
                                        },
                                    ].map((row, i) => (
                                        <tr key={row.label} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)', background: i % 2 === 0 ? 'transparent' : 'rgba(255, 255, 255, 0.015)' }}>
                                            <td style={{ padding: '10px 16px', fontSize: '12px', color: '#ccc' }}>{row.label}</td>
                                            <td style={{ padding: '10px 16px', fontSize: '13px', fontWeight: 600, color: row.winner === 'Source A' ? '#FF2D78' : '#fff' }}>
                                                {row.valA} {row.winner === 'Source A' && '⭐'}
                                            </td>
                                            <td style={{ padding: '10px 16px', fontSize: '13px', fontWeight: 600, color: row.winner === 'Source B' ? '#4FC3F7' : '#fff' }}>
                                                {row.valB} {row.winner === 'Source B' && '⭐'}
                                            </td>
                                            <td style={{ padding: '10px 16px', fontSize: '11px', color: '#00D478', textAlign: 'right' }}>
                                                {row.note}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Timeline Overlay Chart: Source A vs Source B */}
                    {sourceA && sourceB && timeBuckets.length > 0 && (
                        <div
                            style={{
                                background: 'rgba(0, 0, 0, 0.3)',
                                padding: '18px',
                                borderRadius: '16px',
                                border: '1px solid rgba(255, 255, 255, 0.06)',
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                                <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px', fontWeight: 600, color: '#fff' }}>
                                    📈 Timeline Comparison ({bucketResolution === '5m' ? '5-Min Intervals' : bucketResolution === '1h' ? 'Hourly' : 'Daily'})
                                </span>
                                <div style={{ display: 'flex', gap: '14px', fontSize: '11px', fontFamily: 'Poppins, sans-serif' }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#FF2D78' }}>
                                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#FF2D78' }} /> {sourceA.displayName}
                                    </span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#4FC3F7' }}>
                                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4FC3F7' }} /> {sourceB.displayName}
                                    </span>
                                </div>
                            </div>

                            {/* Dual Bar Chart */}
                            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '120px', padding: '10px 0', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                                {timeBuckets.map((bKey) => {
                                    const vA = sourceA.timeline.find(t => t.timeLabel === bKey)?.visitors || 0;
                                    const vB = sourceB.timeline.find(t => t.timeLabel === bKey)?.visitors || 0;
                                    const hA = Math.max(3, Math.round((vA / timelineMax) * 100));
                                    const hB = Math.max(3, Math.round((vB / timelineMax) * 100));
                                    const isHovered = hoveredBucket === bKey;

                                    return (
                                        <div
                                            key={bKey}
                                            onMouseEnter={() => setHoveredBucket(bKey)}
                                            onMouseLeave={() => setHoveredBucket(null)}
                                            style={{
                                                flex: 1,
                                                height: '100%',
                                                display: 'flex',
                                                alignItems: 'flex-end',
                                                justifyContent: 'center',
                                                gap: '2px',
                                                cursor: 'pointer',
                                                position: 'relative',
                                            }}
                                        >
                                            <div
                                                style={{
                                                    width: '50%',
                                                    height: `${hA}%`,
                                                    background: '#FF2D78',
                                                    borderRadius: '2px 2px 0 0',
                                                    opacity: isHovered ? 1 : 0.8,
                                                }}
                                            />
                                            <div
                                                style={{
                                                    width: '50%',
                                                    height: `${hB}%`,
                                                    background: '#4FC3F7',
                                                    borderRadius: '2px 2px 0 0',
                                                    opacity: isHovered ? 1 : 0.8,
                                                }}
                                            />

                                            {/* Tooltip on hover */}
                                            {isHovered && (
                                                <div
                                                    style={{
                                                        position: 'absolute',
                                                        bottom: '105%',
                                                        left: '50%',
                                                        transform: 'translateX(-50%)',
                                                        background: 'rgba(10, 10, 14, 0.95)',
                                                        border: '1px solid rgba(255, 255, 255, 0.2)',
                                                        borderRadius: '8px',
                                                        padding: '6px 10px',
                                                        fontSize: '10px',
                                                        whiteSpace: 'nowrap',
                                                        zIndex: 20,
                                                        color: '#fff',
                                                        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.8)',
                                                    }}
                                                >
                                                    <div style={{ color: '#888', marginBottom: '2px' }}>{bKey}</div>
                                                    <div style={{ color: '#FF2D78' }}>{sourceA.displayName}: {vA}</div>
                                                    <div style={{ color: '#4FC3F7' }}>{sourceB.displayName}: {vB}</div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* X-axis labels summary */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '10px', color: '#666', fontFamily: 'Poppins, sans-serif' }}>
                                <span>{timeBuckets[0]}</span>
                                <span>{timeBuckets[Math.floor(timeBuckets.length / 2)]}</span>
                                <span>{timeBuckets[timeBuckets.length - 1]}</span>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
