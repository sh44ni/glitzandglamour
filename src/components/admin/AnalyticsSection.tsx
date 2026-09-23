'use client';

import { useEffect, useState } from 'react';
import {
    TrendingUp, TrendingDown, Users, Star, Gift, Share2,
    DollarSign, BarChart2, Clock, XCircle, CheckCircle2, Sparkles,
    Globe, MousePointerClick, Monitor, Smartphone, Tablet, ExternalLink, CalendarRange,
    Layers, ArrowUpRight, Activity, Zap
} from 'lucide-react';

export const RANGE_OPTIONS = [7, 14, 30, 60, 90, 180, 365] as const;

export type WebsiteActivityRow = {
    path: string;
    createdAt: string;
    device: string | null;
    duration: number | null;
    referrerHost: string | null;
    referrerSnippet: string | null;
    utmSource: string | null;
    utmMedium: string | null;
    utmCampaign: string | null;
};

export type WebsiteData = {
    totalPageViews: number;
    pageViewsThisMonth: number;
    uniqueVisitorsThisMonth: number;
    visitorTrend: number;
    avgDuration: number;
    bounceRate: number;
    pagesPerSession: number;
    topPages: { path: string; views: number }[];
    deviceCounts: Record<string, number>;
    topReferrers: { source: string; visits: number }[];
    pvByDay: Record<string, number>;
    firstRecordedViewAt: string | null;
    lastRecordedViewAt: string | null;
    recentActivity: WebsiteActivityRow[];
};

export type AnalyticsData = {
    meta: {
        rangeDays: number;
        periodStart: string;
        periodEnd: string;
        serverTime: string;
    };
    overview: {
        totalBookings: number; bookingsThisMonth: number; periodChange: number;
        totalRevenue: number; revenueThisMonth: number;
        totalCustomers: number; newCustomersThisMonth: number;
        cancellationRate: number; conversionRate: number; avgConfirmHours: number;
    };
    statusCounts: Record<string, number>;
    guestVsMember: { guest: number; member: number };
    bookingsByDay: Record<string, number>;
    byDayOfWeek: number[];
    topServices: { name: string; bookings: number; priceFrom: number }[];
    loyalty: { totalCards: number; totalStamps: number; lifetimeStamps: number; spinsRedeemed: number; referralRewards: number };
    referrals: { total: number; converted: number; rewarded: number };
    reviews: { total: number; avgRating: number; ratingDist: Record<number, number>; bySource: Record<string, number> };
    weeklyGrowth: Record<string, number>;
    website: WebsiteData;
};

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function formatTs(iso: string, withTime = true) {
    const d = new Date(iso);
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        ...(withTime ? { hour: 'numeric', minute: '2-digit', second: '2-digit' } : {}),
    }).format(d);
}

function fmtDuration(s: number) {
    if (s < 60) return `${s}s`;
    return `${Math.floor(s / 60)}m ${s % 60}s`;
}

function fmtPath(p: string) {
    const labels: Record<string, string> = {
        '/': 'Home',
        '/services': 'Services',
        '/book': 'Book',
        '/gallery': 'Gallery',
        '/reviews': 'Reviews',
        '/card': 'Loyalty Card',
        '/profile': 'Profile',
        '/sign-in': 'Sign In',
        '/policy': 'Policy',
    };
    return labels[p] || p;
}

/* ──────────────────────────────────────────────────────────────────────────
   Liquid Metric Card with Specular Shine & Micro-interactions
   ────────────────────────────────────────────────────────────────────────── */
function LiquidMetricCard({
    label,
    value,
    sub,
    icon: Icon,
    color = '#FF2D78',
    trend,
    badge,
}: {
    label: string;
    value: string;
    sub?: string;
    icon: React.ElementType;
    color?: string;
    trend?: number;
    badge?: string;
}) {
    const [hovered, setHovered] = useState(false);

    return (
        <div
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                position: 'relative',
                background: hovered
                    ? 'linear-gradient(135deg, rgba(30, 30, 42, 0.75) 0%, rgba(20, 20, 28, 0.85) 100%)'
                    : 'linear-gradient(135deg, rgba(22, 22, 30, 0.55) 0%, rgba(14, 14, 20, 0.65) 100%)',
                backdropFilter: 'blur(24px) saturate(180%)',
                WebkitBackdropFilter: 'blur(24px) saturate(180%)',
                border: `1px solid ${hovered ? `${color}44` : 'rgba(255,255,255,0.08)'}`,
                borderRadius: '20px',
                padding: '18px 20px',
                boxShadow: hovered
                    ? `0 12px 32px -4px rgba(0, 0, 0, 0.5), 0 0 24px -4px ${color}25`
                    : '0 4px 20px -2px rgba(0, 0, 0, 0.3)',
                transform: hovered ? 'translateY(-3px)' : 'none',
                transition: 'all 0.28s cubic-bezier(0.16, 1, 0.3, 1)',
                overflow: 'hidden',
            }}
        >
            {/* Top specular reflection shimmer */}
            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    left: '10%',
                    right: '10%',
                    height: '1px',
                    background: `linear-gradient(90deg, transparent, ${color}88, rgba(255,255,255,0.3), transparent)`,
                    opacity: hovered ? 1 : 0.4,
                    transition: 'opacity 0.3s ease',
                }}
            />

            {/* Ambient liquid glow behind icon */}
            <div
                style={{
                    position: 'absolute',
                    top: '-15px',
                    right: '-15px',
                    width: '90px',
                    height: '90px',
                    borderRadius: '50%',
                    background: color,
                    filter: 'blur(38px)',
                    opacity: hovered ? 0.16 : 0.08,
                    pointerEvents: 'none',
                    transition: 'opacity 0.3s ease',
                }}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 2 }}>
                <div
                    style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '12px',
                        background: `linear-gradient(135deg, ${color}24 0%, ${color}08 100%)`,
                        border: `1px solid ${color}35`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: `0 4px 12px ${color}18`,
                    }}
                >
                    <Icon size={18} color={color} strokeWidth={2.2} />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {badge && (
                        <span
                            style={{
                                fontSize: '10px',
                                fontWeight: 600,
                                fontFamily: 'Poppins, sans-serif',
                                color: color,
                                background: `${color}18`,
                                border: `1px solid ${color}30`,
                                padding: '2px 8px',
                                borderRadius: '12px',
                                letterSpacing: '0.4px',
                            }}
                        >
                            {badge}
                        </span>
                    )}
                    {trend !== undefined && (
                        <span
                            style={{
                                fontSize: '11px',
                                fontWeight: 600,
                                fontFamily: 'Poppins, sans-serif',
                                color: trend >= 0 ? '#00D478' : '#FF6B6B',
                                background: trend >= 0 ? 'rgba(0,212,120,0.1)' : 'rgba(255,107,107,0.1)',
                                border: `1px solid ${trend >= 0 ? 'rgba(0,212,120,0.25)' : 'rgba(255,107,107,0.25)'}`,
                                padding: '3px 7px',
                                borderRadius: '12px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '3px',
                            }}
                        >
                            {trend >= 0 ? <TrendingUp size={11} strokeWidth={2.5} /> : <TrendingDown size={11} strokeWidth={2.5} />}
                            {Math.abs(trend)}%
                        </span>
                    )}
                </div>
            </div>

            <div style={{ marginTop: '14px', position: 'relative', zIndex: 2 }}>
                <p
                    style={{
                        fontFamily: 'Poppins, sans-serif',
                        fontWeight: 700,
                        fontSize: '24px',
                        color: '#fff',
                        lineHeight: 1.1,
                        letterSpacing: '-0.3px',
                    }}
                >
                    {value}
                </p>
                <p
                    style={{
                        fontFamily: 'Poppins, sans-serif',
                        fontSize: '11px',
                        fontWeight: 600,
                        color: '#999',
                        marginTop: '5px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.6px',
                    }}
                >
                    {label}
                </p>
                {sub && (
                    <p
                        style={{
                            fontFamily: 'Poppins, sans-serif',
                            fontSize: '11px',
                            color: '#666',
                            marginTop: '3px',
                        }}
                    >
                        {sub}
                    </p>
                )}
            </div>
        </div>
    );
}

/* ──────────────────────────────────────────────────────────────────────────
   Section Header with Liquid Glow Accent
   ────────────────────────────────────────────────────────────────────────── */
function LiquidSectionHeader({
    title,
    subtitle,
    icon: Icon,
    color = '#FF2D78',
    action,
}: {
    title: string;
    subtitle?: string;
    icon?: React.ElementType;
    color?: string;
    action?: React.ReactNode;
}) {
    return (
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '16px', marginTop: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {Icon && (
                    <div
                        style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '10px',
                            background: `linear-gradient(135deg, ${color}20, ${color}06)`,
                            border: `1px solid ${color}30`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <Icon size={16} color={color} strokeWidth={2.2} />
                    </div>
                )}
                <div>
                    <h3
                        style={{
                            fontFamily: 'Poppins, sans-serif',
                            fontWeight: 700,
                            fontSize: '15px',
                            color: '#fff',
                            letterSpacing: '0.2px',
                            margin: 0,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                        }}
                    >
                        {title}
                    </h3>
                    {subtitle && (
                        <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '11px', color: '#666', marginTop: '2px', margin: 0 }}>
                            {subtitle}
                        </p>
                    )}
                </div>
            </div>
            {action && <div>{action}</div>}
        </div>
    );
}

/* ──────────────────────────────────────────────────────────────────────────
   Main Analytics Component
   ────────────────────────────────────────────────────────────────────────── */
export default function AnalyticsSection({
    externalRange,
    onRangeChange,
}: {
    externalRange?: number;
    onRangeChange?: (range: number) => void;
}) {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [internalRange, setInternalRange] = useState<number>(30);
    const [activeTab, setActiveTab] = useState<'business' | 'traffic' | 'loyalty' | 'reviews' | 'activity' | 'all'>('business');
    const [hoveredDay, setHoveredDay] = useState<{ day: string; count: number } | null>(null);
    const [hoveredPvDay, setHoveredPvDay] = useState<{ day: string; count: number } | null>(null);

    const rangeDays = externalRange ?? internalRange;

    const handleRangeSelect = (days: number) => {
        if (onRangeChange) {
            onRangeChange(days);
        } else {
            setInternalRange(days);
        }
    };

    useEffect(() => {
        setLoading(true);
        fetch(`/api/admin/analytics?range=${rangeDays}`)
            .then((r) => r.json())
            .then((d) => {
                setData(d);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [rangeDays]);

    if (loading) {
        return (
            <div
                style={{
                    padding: '60px 20px',
                    textAlign: 'center',
                    background: 'rgba(22, 22, 30, 0.4)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: '24px',
                    marginTop: '24px',
                }}
            >
                <div
                    style={{
                        width: '36px',
                        height: '36px',
                        border: '3px solid rgba(255, 45, 120, 0.2)',
                        borderTopColor: '#FF2D78',
                        borderRadius: '50%',
                        margin: '0 auto 16px',
                        animation: 'spin 0.8s linear infinite',
                    }}
                />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '13px', color: '#888', fontWeight: 500 }}>
                    Synthesizing real-time analytics…
                </p>
            </div>
        );
    }

    if (!data?.meta) return null;

    const { meta, overview, topServices, guestVsMember, byDayOfWeek, bookingsByDay, loyalty, referrals, reviews, weeklyGrowth, website } = data;
    const periodSub = `last ${meta.rangeDays} days`;

    const pvDayKeys = Object.keys(website.pvByDay).sort();
    const pvMax = Math.max(...pvDayKeys.map((k) => website.pvByDay[k] ?? 0), 1);

    const totalDevices = Object.values(website.deviceCounts).reduce((s, v) => s + v, 0) || 1;
    const deviceIcons: Record<string, React.ElementType> = { mobile: Smartphone, desktop: Monitor, tablet: Tablet, unknown: Globe };
    const deviceColors: Record<string, string> = { mobile: '#FF2D78', desktop: '#4FC3F7', tablet: '#AB47BC', unknown: '#777' };

    const bookingDayKeys = Object.keys(bookingsByDay).sort();
    const dayValues = bookingDayKeys.map((k) => bookingsByDay[k] ?? 0);
    const maxDay = Math.max(...dayValues, 1);

    const weekValues = Object.values(weeklyGrowth);
    const maxWeek = Math.max(...weekValues, 1);
    const maxDow = Math.max(...byDayOfWeek, 1);
    const maxRating = Math.max(...Object.values(reviews.ratingDist), 1);

    const memberTotal = guestVsMember.guest + guestVsMember.member || 1;
    const memberPct = Math.round((guestVsMember.member / memberTotal) * 100);

    type TabItem = {
        id: 'business' | 'traffic' | 'loyalty' | 'reviews' | 'activity' | 'all';
        label: string;
        icon: React.ElementType;
        count?: number | string;
    };

    const tabs: TabItem[] = [
        { id: 'business', label: 'Business & Revenue', icon: DollarSign, count: overview.totalBookings },
        { id: 'traffic', label: 'Web Traffic & Pulse', icon: Globe, count: website.totalPageViews },
        { id: 'loyalty', label: 'Clients & Loyalty', icon: Sparkles, count: loyalty.totalCards },
        { id: 'reviews', label: 'Reviews & Reputation', icon: Star, count: reviews.total },
        { id: 'activity', label: 'Live Visitor Stream', icon: Activity, count: website.recentActivity.length },
        { id: 'all', label: 'Show All Bento', icon: Layers },
    ];

    return (
        <div style={{ marginTop: '32px' }}>
            {/* ── Apple-style Timeframe Selector Bar ── */}
            <div
                style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '14px',
                    padding: '16px 20px',
                    background: 'linear-gradient(135deg, rgba(26, 26, 36, 0.6) 0%, rgba(16, 16, 24, 0.7) 100%)',
                    backdropFilter: 'blur(24px) saturate(180%)',
                    WebkitBackdropFilter: 'blur(24px)',
                    border: '1px solid rgba(255, 45, 120, 0.18)',
                    borderRadius: '22px',
                    marginBottom: '20px',
                    boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                        style={{
                            width: '34px',
                            height: '34px',
                            borderRadius: '10px',
                            background: 'rgba(255,45,120,0.12)',
                            border: '1px solid rgba(255,45,120,0.25)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <CalendarRange size={16} color="#FF2D78" />
                    </div>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '13px', fontWeight: 700, color: '#fff' }}>
                                Executive Telemetry
                            </span>
                            <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '11px', color: '#00D478', background: 'rgba(0,212,120,0.12)', padding: '2px 8px', borderRadius: '10px', fontWeight: 600 }}>
                                Live Sync
                            </span>
                        </div>
                        <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '11px', color: '#777', margin: 0 }}>
                            {formatTs(meta.periodStart, false)} → {formatTs(meta.periodEnd, false)}
                        </p>
                    </div>
                </div>

                {/* Range Pills */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        background: 'rgba(0, 0, 0, 0.45)',
                        padding: '4px',
                        borderRadius: '14px',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                    }}
                >
                    {RANGE_OPTIONS.map((days) => {
                        const active = rangeDays === days;
                        return (
                            <button
                                key={days}
                                onClick={() => handleRangeSelect(days)}
                                style={{
                                    fontFamily: 'Poppins, sans-serif',
                                    fontSize: '11px',
                                    fontWeight: active ? 700 : 500,
                                    padding: '6px 12px',
                                    borderRadius: '10px',
                                    border: 'none',
                                    cursor: 'pointer',
                                    background: active
                                        ? 'linear-gradient(135deg, #FF2D78 0%, #CC1E5A 100%)'
                                        : 'transparent',
                                    color: active ? '#fff' : '#888',
                                    boxShadow: active ? '0 2px 10px rgba(255, 45, 120, 0.35)' : 'none',
                                    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                                }}
                            >
                                {days}D
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* ── Apple-style Segmented Domain Navigation Tabs ── */}
            <div
                style={{
                    display: 'flex',
                    gap: '8px',
                    overflowX: 'auto',
                    paddingBottom: '8px',
                    marginBottom: '20px',
                    scrollbarWidth: 'none',
                }}
            >
                {tabs.map((t) => {
                    const active = activeTab === t.id;
                    const Icon = t.icon;
                    return (
                        <button
                            key={t.id}
                            onClick={() => setActiveTab(t.id)}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '10px 18px',
                                borderRadius: '16px',
                                border: `1px solid ${active ? 'rgba(255, 45, 120, 0.35)' : 'rgba(255, 255, 255, 0.06)'}`,
                                background: active
                                    ? 'linear-gradient(135deg, rgba(255, 45, 120, 0.18) 0%, rgba(255, 45, 120, 0.06) 100%)'
                                    : 'rgba(255, 255, 255, 0.025)',
                                backdropFilter: 'blur(16px)',
                                color: active ? '#fff' : '#888',
                                fontFamily: 'Poppins, sans-serif',
                                fontSize: '12px',
                                fontWeight: active ? 600 : 500,
                                cursor: 'pointer',
                                whiteSpace: 'nowrap',
                                boxShadow: active ? '0 4px 16px rgba(255, 45, 120, 0.15)' : 'none',
                                transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                            }}
                        >
                            <Icon size={14} color={active ? '#FF2D78' : '#666'} />
                            <span>{t.label}</span>
                            {t.count !== undefined && (
                                <span
                                    style={{
                                        fontSize: '10px',
                                        padding: '1px 6px',
                                        borderRadius: '8px',
                                        background: active ? 'rgba(255, 45, 120, 0.3)' : 'rgba(255, 255, 255, 0.06)',
                                        color: active ? '#fff' : '#666',
                                    }}
                                >
                                    {typeof t.count === 'number' ? t.count.toLocaleString() : t.count}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* ══════════════════════════════════════════════════════════════════════
               TAB 1: BUSINESS & REVENUE
               ══════════════════════════════════════════════════════════════════════ */}
            {(activeTab === 'business' || activeTab === 'all') && (
                <div style={{ marginBottom: '32px' }}>
                    <LiquidSectionHeader
                        title="Business & Revenue Performance"
                        subtitle={`Executive figures for the ${periodSub}`}
                        icon={DollarSign}
                        color="#00D478"
                    />

                    {/* KPI Tiles */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '20px' }}>
                        <LiquidMetricCard
                            label="Total Bookings"
                            value={String(overview.totalBookings)}
                            sub={`+${overview.bookingsThisMonth} ${periodSub}`}
                            icon={BarChart2}
                            color="#FF2D78"
                            trend={overview.periodChange}
                        />
                        <LiquidMetricCard
                            label="Estimated Revenue"
                            value={`$${overview.totalRevenue.toLocaleString()}`}
                            sub={`$${overview.revenueThisMonth.toLocaleString()} in window`}
                            icon={DollarSign}
                            color="#00D478"
                        />
                        <LiquidMetricCard
                            label="Client Base"
                            value={String(overview.totalCustomers)}
                            sub={`+${overview.newCustomersThisMonth} new clients`}
                            icon={Users}
                            color="#4FC3F7"
                        />
                        <LiquidMetricCard
                            label="Conversion Rate"
                            value={`${overview.conversionRate}%`}
                            sub="appointments retained"
                            icon={CheckCircle2}
                            color="#AB47BC"
                        />
                        <LiquidMetricCard
                            label="Avg Confirmation"
                            value={`${overview.avgConfirmHours}h`}
                            sub="pending → confirmed"
                            icon={Clock}
                            color="#FFB700"
                        />
                        <LiquidMetricCard
                            label="Cancellation"
                            value={`${overview.cancellationRate}%`}
                            sub="total cancellation rate"
                            icon={XCircle}
                            color="#EF5350"
                        />
                    </div>

                    {/* Interactive Booking Volume Chart */}
                    <div
                        style={{
                            background: 'linear-gradient(135deg, rgba(22, 22, 30, 0.6) 0%, rgba(14, 14, 20, 0.7) 100%)',
                            backdropFilter: 'blur(24px) saturate(180%)',
                            border: '1px solid rgba(255, 45, 120, 0.15)',
                            borderRadius: '20px',
                            padding: '20px',
                            marginBottom: '16px',
                            position: 'relative',
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <div>
                                <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '13px', fontWeight: 600, color: '#fff', margin: 0 }}>
                                    Daily Booking Trajectory
                                </p>
                                <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '11px', color: '#777', margin: 0 }}>
                                    Activity over {periodSub}
                                </p>
                            </div>
                            {hoveredDay && (
                                <div style={{ background: 'rgba(255,45,120,0.15)', border: '1px solid rgba(255,45,120,0.3)', borderRadius: '10px', padding: '3px 10px', fontFamily: 'Poppins, sans-serif', fontSize: '11px', color: '#FF6BA8' }}>
                                    <strong>{hoveredDay.day}:</strong> {hoveredDay.count} booking{hoveredDay.count === 1 ? '' : 's'}
                                </div>
                            )}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: '80px', padding: '8px 0' }}>
                            {bookingDayKeys.map((dayKey, i) => {
                                const v = bookingsByDay[dayKey] ?? 0;
                                const heightPct = maxDay > 0 ? (v / maxDay) * 100 : 0;
                                const isHovered = hoveredDay?.day === dayKey;
                                return (
                                    <div
                                        key={dayKey}
                                        onMouseEnter={() => setHoveredDay({ day: dayKey, count: v })}
                                        onMouseLeave={() => setHoveredDay(null)}
                                        style={{
                                            flex: 1,
                                            height: `${Math.max(heightPct, 6)}%`,
                                            background: isHovered
                                                ? '#fff'
                                                : v > 0
                                                ? 'linear-gradient(180deg, #FF2D78 0%, #B76E79 100%)'
                                                : 'rgba(255,255,255,0.04)',
                                            borderRadius: '3px 3px 0 0',
                                            cursor: 'pointer',
                                            boxShadow: isHovered || v > 0 ? '0 0 10px rgba(255,45,120,0.3)' : 'none',
                                            transition: 'all 0.15s ease',
                                        }}
                                        title={`${dayKey}: ${v} bookings`}
                                    />
                                );
                            })}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontFamily: 'Poppins, sans-serif', fontSize: '10px', color: '#555' }}>
                            <span>{bookingDayKeys[0] || ''}</span>
                            <span>Today</span>
                        </div>
                    </div>

                    {/* Breakdown Matrix: Status Distribution & Day of Week Heatmap */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                        {/* Status breakdown */}
                        <div
                            style={{
                                background: 'linear-gradient(135deg, rgba(22, 22, 30, 0.6) 0%, rgba(14, 14, 20, 0.7) 100%)',
                                backdropFilter: 'blur(24px)',
                                border: '1px solid rgba(255, 255, 255, 0.08)',
                                borderRadius: '20px',
                                padding: '20px',
                            }}
                        >
                            <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '13px', fontWeight: 600, color: '#fff', marginBottom: '16px' }}>
                                Booking Status Matrix
                            </p>
                            {[
                                { key: 'CONFIRMED', label: 'Confirmed', color: '#00D478' },
                                { key: 'COMPLETED', label: 'Completed', color: '#FF2D78' },
                                { key: 'PENDING', label: 'Pending Action', color: '#FFB700' },
                                { key: 'CANCELLED', label: 'Cancelled', color: '#EF5350' },
                            ].map(({ key, label, color }) => {
                                const count = data.statusCounts[key] || 0;
                                const total = overview.totalBookings || 1;
                                const pct = Math.round((count / total) * 100);
                                return (
                                    <div key={key} style={{ marginBottom: '14px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                            <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px', color: '#bbb' }}>{label}</span>
                                            <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px', fontWeight: 600, color }}>{count} ({pct}%)</span>
                                        </div>
                                        <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                                            <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: '3px', transition: 'width 0.8s cubic-bezier(0.16, 1, 0.3, 1)' }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Busiest Days Heatmap */}
                        <div
                            style={{
                                background: 'linear-gradient(135deg, rgba(22, 22, 30, 0.6) 0%, rgba(14, 14, 20, 0.7) 100%)',
                                backdropFilter: 'blur(24px)',
                                border: '1px solid rgba(255, 255, 255, 0.08)',
                                borderRadius: '20px',
                                padding: '20px',
                            }}
                        >
                            <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '13px', fontWeight: 600, color: '#fff', marginBottom: '16px' }}>
                                Peak Studio Days (Sun – Sat)
                            </p>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
                                {byDayOfWeek.map((count, i) => {
                                    const intensity = count > 0 ? 0.15 + (count / maxDow) * 0.85 : 0.04;
                                    return (
                                        <div key={i} style={{ textAlign: 'center' }}>
                                            <div
                                                style={{
                                                    height: '52px',
                                                    borderRadius: '12px',
                                                    marginBottom: '8px',
                                                    background: count > 0
                                                        ? `linear-gradient(180deg, rgba(255,45,120,${intensity}) 0%, rgba(183,110,121,${intensity * 0.7}) 100%)`
                                                        : 'rgba(255,255,255,0.03)',
                                                    border: `1px solid ${count > 0 ? 'rgba(255,45,120,0.3)' : 'rgba(255,255,255,0.05)'}`,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    boxShadow: count === maxDow ? '0 0 16px rgba(255,45,120,0.4)' : 'none',
                                                    transition: 'all 0.2s',
                                                }}
                                            >
                                                <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px', fontWeight: 700, color: count > 0 ? '#fff' : '#444' }}>
                                                    {count}
                                                </span>
                                            </div>
                                            <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '11px', color: '#888', fontWeight: 500 }}>
                                                {DAY_LABELS[i]}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Top Services ranking */}
                    <div
                        style={{
                            background: 'linear-gradient(135deg, rgba(22, 22, 30, 0.6) 0%, rgba(14, 14, 20, 0.7) 100%)',
                            backdropFilter: 'blur(24px)',
                            border: '1px solid rgba(255, 45, 120, 0.15)',
                            borderRadius: '20px',
                            padding: '20px',
                        }}
                    >
                        <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '13px', fontWeight: 600, color: '#fff', marginBottom: '16px' }}>
                            Top Client Services by Popularity
                        </p>
                        <div style={{ display: 'grid', gap: '12px' }}>
                            {topServices.map((s, i) => {
                                const maxS = topServices[0]?.bookings || 1;
                                const pct = Math.round((s.bookings / maxS) * 100);
                                return (
                                    <div key={s.name}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px', fontWeight: 700, color: '#FF2D78', width: '22px' }}>
                                                    #{i + 1}
                                                </span>
                                                <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '13px', color: '#eee', fontWeight: 500 }}>
                                                    {s.name}
                                                </span>
                                                {s.priceFrom && (
                                                    <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '11px', color: '#777' }}>
                                                        from ${s.priceFrom}
                                                    </span>
                                                )}
                                            </div>
                                            <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px', color: '#FF6BA8', fontWeight: 700 }}>
                                                {s.bookings} booking{s.bookings === 1 ? '' : 's'}
                                            </span>
                                        </div>
                                        <div style={{ height: '6px', background: 'rgba(255,255,255,0.04)', borderRadius: '3px', overflow: 'hidden' }}>
                                            <div
                                                style={{
                                                    height: '100%',
                                                    width: `${pct}%`,
                                                    background: 'linear-gradient(90deg, #FF2D78 0%, #FF6BA8 100%)',
                                                    borderRadius: '3px',
                                                }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* ══════════════════════════════════════════════════════════════════════
               TAB 2: WEB TRAFFIC & PULSE
               ══════════════════════════════════════════════════════════════════════ */}
            {(activeTab === 'traffic' || activeTab === 'all') && (
                <div style={{ marginBottom: '32px' }}>
                    <LiquidSectionHeader
                        title="Web Presence & Traffic Pulse"
                        subtitle={`Digital visitors, sessions & page views for ${periodSub}`}
                        icon={Globe}
                        color="#4FC3F7"
                    />

                    {/* Website 5 Metrics */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '20px' }}>
                        <LiquidMetricCard
                            label="Unique Visitors"
                            value={String(website.uniqueVisitorsThisMonth)}
                            sub={periodSub}
                            icon={Users}
                            color="#4FC3F7"
                            trend={website.visitorTrend}
                        />
                        <LiquidMetricCard
                            label="Page Views"
                            value={String(website.pageViewsThisMonth)}
                            sub={`${website.totalPageViews.toLocaleString()} all-time`}
                            icon={Globe}
                            color="#FF2D78"
                        />
                        <LiquidMetricCard
                            label="Avg Session Time"
                            value={fmtDuration(website.avgDuration)}
                            sub="active on site"
                            icon={Clock}
                            color="#00D478"
                        />
                        <LiquidMetricCard
                            label="Bounce Rate"
                            value={`${website.bounceRate}%`}
                            sub="single-page visits"
                            icon={MousePointerClick}
                            color={website.bounceRate > 60 ? '#EF5350' : '#FFB700'}
                        />
                        <LiquidMetricCard
                            label="Pages / Session"
                            value={String(website.pagesPerSession)}
                            sub="engagement depth"
                            icon={BarChart2}
                            color="#AB47BC"
                        />
                    </div>

                    {/* Daily Page Views Sparkline Chart */}
                    <div
                        style={{
                            background: 'linear-gradient(135deg, rgba(22, 22, 30, 0.6) 0%, rgba(14, 14, 20, 0.7) 100%)',
                            backdropFilter: 'blur(24px)',
                            border: '1px solid rgba(79, 195, 247, 0.18)',
                            borderRadius: '20px',
                            padding: '20px',
                            marginBottom: '16px',
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <div>
                                <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '13px', fontWeight: 600, color: '#fff', margin: 0 }}>
                                    Daily Page Views Pulse
                                </p>
                                <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '11px', color: '#777', margin: 0 }}>
                                    Activity trend across {periodSub}
                                </p>
                            </div>
                            {hoveredPvDay && (
                                <div style={{ background: 'rgba(79,195,247,0.15)', border: '1px solid rgba(79,195,247,0.3)', borderRadius: '10px', padding: '3px 10px', fontFamily: 'Poppins, sans-serif', fontSize: '11px', color: '#4FC3F7' }}>
                                    <strong>{hoveredPvDay.day}:</strong> {hoveredPvDay.count} view{hoveredPvDay.count === 1 ? '' : 's'}
                                </div>
                            )}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: '70px', padding: '6px 0' }}>
                            {pvDayKeys.map((dayKey) => {
                                const v = website.pvByDay[dayKey] ?? 0;
                                const heightPct = (v / pvMax) * 100;
                                const isHovered = hoveredPvDay?.day === dayKey;
                                return (
                                    <div
                                        key={dayKey}
                                        onMouseEnter={() => setHoveredPvDay({ day: dayKey, count: v })}
                                        onMouseLeave={() => setHoveredPvDay(null)}
                                        style={{
                                            flex: 1,
                                            height: `${Math.max(heightPct, 5)}%`,
                                            background: isHovered
                                                ? '#fff'
                                                : v > 0
                                                ? 'linear-gradient(180deg, #4FC3F7 0%, #0288D1 100%)'
                                                : 'rgba(255,255,255,0.04)',
                                            borderRadius: '3px 3px 0 0',
                                            cursor: 'pointer',
                                            boxShadow: isHovered || v > 0 ? '0 0 10px rgba(79,195,247,0.3)' : 'none',
                                            transition: 'all 0.15s ease',
                                        }}
                                        title={`${dayKey}: ${v} views`}
                                    />
                                );
                            })}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontFamily: 'Poppins, sans-serif', fontSize: '10px', color: '#555' }}>
                            <span>{pvDayKeys[0] || ''}</span>
                            <span>Today</span>
                        </div>
                    </div>

                    {/* Top Pages + Devices Split Bento */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                        {/* Top Pages */}
                        <div
                            style={{
                                background: 'linear-gradient(135deg, rgba(22, 22, 30, 0.6) 0%, rgba(14, 14, 20, 0.7) 100%)',
                                backdropFilter: 'blur(24px)',
                                border: '1px solid rgba(255, 255, 255, 0.08)',
                                borderRadius: '20px',
                                padding: '20px',
                            }}
                        >
                            <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '13px', fontWeight: 600, color: '#fff', marginBottom: '16px' }}>
                                Most Viewed Pages
                            </p>
                            {website.topPages.length === 0 ? (
                                <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px', color: '#666', fontStyle: 'italic' }}>
                                    No tracked page visits recorded in this timeframe.
                                </p>
                            ) : (
                                website.topPages.slice(0, 5).map((p, i) => {
                                    const maxPV = website.topPages[0]?.views || 1;
                                    const pct = Math.round((p.views / maxPV) * 100);
                                    return (
                                        <div key={p.path} style={{ marginBottom: '12px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                                <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px', color: i === 0 ? '#fff' : '#aaa' }}>
                                                    <span style={{ color: '#FF2D78', marginRight: '6px', fontWeight: 600 }}>#{i + 1}</span>
                                                    {fmtPath(p.path)}
                                                </span>
                                                <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px', color: '#4FC3F7', fontWeight: 600 }}>
                                                    {p.views.toLocaleString()}
                                                </span>
                                            </div>
                                            <div style={{ height: '5px', background: 'rgba(255,255,255,0.04)', borderRadius: '3px', overflow: 'hidden' }}>
                                                <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg, #4FC3F7, #81D4FA)', borderRadius: '3px' }} />
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* Device Split */}
                        <div
                            style={{
                                background: 'linear-gradient(135deg, rgba(22, 22, 30, 0.6) 0%, rgba(14, 14, 20, 0.7) 100%)',
                                backdropFilter: 'blur(24px)',
                                border: '1px solid rgba(255, 255, 255, 0.08)',
                                borderRadius: '20px',
                                padding: '20px',
                            }}
                        >
                            <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '13px', fontWeight: 600, color: '#fff', marginBottom: '16px' }}>
                                Visitor Hardware Split
                            </p>
                            {Object.entries(website.deviceCounts).map(([device, count]) => {
                                const DevIcon = deviceIcons[device] || Globe;
                                const color = deviceColors[device] || '#555';
                                const pct = Math.round((count / totalDevices) * 100);
                                return (
                                    <div key={device} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                                        <div
                                            style={{
                                                width: '32px',
                                                height: '32px',
                                                borderRadius: '10px',
                                                background: `${color}18`,
                                                border: `1px solid ${color}30`,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                flexShrink: 0,
                                            }}
                                        >
                                            <DevIcon size={16} color={color} />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                                <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px', color: '#ccc', textTransform: 'capitalize' }}>
                                                    {device}
                                                </span>
                                                <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px', fontWeight: 600, color }}>
                                                    {pct}% ({count})
                                                </span>
                                            </div>
                                            <div style={{ height: '6px', background: 'rgba(255,255,255,0.04)', borderRadius: '3px', overflow: 'hidden' }}>
                                                <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: '3px' }} />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Top Referrers */}
                    {website.topReferrers.length > 0 && (
                        <div
                            style={{
                                background: 'linear-gradient(135deg, rgba(22, 22, 30, 0.6) 0%, rgba(14, 14, 20, 0.7) 100%)',
                                backdropFilter: 'blur(24px)',
                                border: '1px solid rgba(255, 255, 255, 0.08)',
                                borderRadius: '20px',
                                padding: '20px',
                            }}
                        >
                            <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '13px', fontWeight: 600, color: '#fff', marginBottom: '16px' }}>
                                Inbound Traffic Sources
                            </p>
                            <div style={{ display: 'grid', gap: '10px' }}>
                                {website.topReferrers.map((r, i) => {
                                    const maxR = website.topReferrers[0]?.visits || 1;
                                    const pct = Math.round((r.visits / maxR) * 100);
                                    return (
                                        <div key={r.source}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                                <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px', color: '#bbb' }}>
                                                    <span style={{ color: '#00D478', marginRight: '6px' }}>#{i + 1}</span>
                                                    {r.source}
                                                </span>
                                                <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px', color: '#00D478', fontWeight: 600 }}>
                                                    {r.visits} visit{r.visits === 1 ? '' : 's'}
                                                </span>
                                            </div>
                                            <div style={{ height: '5px', background: 'rgba(255,255,255,0.04)', borderRadius: '3px', overflow: 'hidden' }}>
                                                <div style={{ height: '100%', width: `${pct}%`, background: '#00D478', borderRadius: '3px' }} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ══════════════════════════════════════════════════════════════════════
               TAB 3: CLIENTS & LOYALTY
               ══════════════════════════════════════════════════════════════════════ */}
            {(activeTab === 'loyalty' || activeTab === 'all') && (
                <div style={{ marginBottom: '32px' }}>
                    <LiquidSectionHeader
                        title="Loyalty Rewards, Referrals & Retention"
                        subtitle="Community membership, stamp cards and customer acquisition"
                        icon={Sparkles}
                        color="#AB47BC"
                    />

                    {/* Loyalty 4 Tiles */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '20px' }}>
                        <LiquidMetricCard
                            label="Active Loyalty Cards"
                            value={String(loyalty.totalCards)}
                            sub="registered members"
                            icon={Sparkles}
                            color="#FF2D78"
                        />
                        <LiquidMetricCard
                            label="Lifetime Stamps"
                            value={String(loyalty.lifetimeStamps)}
                            sub="stamps granted"
                            icon={Star}
                            color="#FFB700"
                        />
                        <LiquidMetricCard
                            label="Wheel Spins Won"
                            value={String(loyalty.spinsRedeemed)}
                            sub="free perks redeemed"
                            icon={Gift}
                            color="#AB47BC"
                        />
                        <LiquidMetricCard
                            label="Client Referrals"
                            value={String(referrals.total)}
                            sub={`${referrals.converted} converted · ${referrals.rewarded} rewarded`}
                            icon={Share2}
                            color="#00D478"
                        />
                    </div>

                    {/* Member vs Guest Split & Customer Growth Bento */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
                        {/* Member vs Guest */}
                        <div
                            style={{
                                background: 'linear-gradient(135deg, rgba(22, 22, 30, 0.6) 0%, rgba(14, 14, 20, 0.7) 100%)',
                                backdropFilter: 'blur(24px)',
                                border: '1px solid rgba(255, 255, 255, 0.08)',
                                borderRadius: '20px',
                                padding: '20px',
                            }}
                        >
                            <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '13px', fontWeight: 600, color: '#fff', marginBottom: '14px' }}>
                                Member vs Guest Appointments
                            </p>
                            <div style={{ display: 'flex', alignItems: 'center', height: '10px', borderRadius: '5px', overflow: 'hidden', marginBottom: '16px', background: 'rgba(255,255,255,0.06)' }}>
                                <div style={{ width: `${memberPct}%`, height: '100%', background: 'linear-gradient(90deg, #FF2D78, #FF6BA8)' }} />
                                <div style={{ width: `${100 - memberPct}%`, height: '100%', background: 'rgba(255,255,255,0.15)' }} />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <div>
                                    <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '22px', fontWeight: 800, color: '#FF2D78', margin: 0 }}>
                                        {memberPct}%
                                    </p>
                                    <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '11px', color: '#888', margin: 0 }}>
                                        Loyalty Members ({guestVsMember.member})
                                    </p>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '22px', fontWeight: 800, color: '#aaa', margin: 0 }}>
                                        {100 - memberPct}%
                                    </p>
                                    <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '11px', color: '#888', margin: 0 }}>
                                        Guest Clients ({guestVsMember.guest})
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Customer Growth 8-week */}
                        <div
                            style={{
                                background: 'linear-gradient(135deg, rgba(22, 22, 30, 0.6) 0%, rgba(14, 14, 20, 0.7) 100%)',
                                backdropFilter: 'blur(24px)',
                                border: '1px solid rgba(255, 255, 255, 0.08)',
                                borderRadius: '20px',
                                padding: '20px',
                            }}
                        >
                            <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '13px', fontWeight: 600, color: '#fff', marginBottom: '8px' }}>
                                Client Inflow Trend (8 Weeks)
                            </p>
                            <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '11px', color: '#777', marginBottom: '16px' }}>
                                +{overview.newCustomersThisMonth} clients onboarded {periodSub}
                            </p>
                            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '60px' }}>
                                {weekValues.map((v, i) => (
                                    <div
                                        key={i}
                                        style={{
                                            flex: 1,
                                            height: `${Math.max((v / maxWeek) * 100, 6)}%`,
                                            background: 'linear-gradient(180deg, #4FC3F7 0%, #0288D1 100%)',
                                            borderRadius: '4px 4px 0 0',
                                            opacity: 0.6 + (i / weekValues.length) * 0.4,
                                        }}
                                        title={`Week ${i + 1}: ${v} users`}
                                    />
                                ))}
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontFamily: 'Poppins, sans-serif', fontSize: '10px', color: '#555' }}>
                                <span>8 wks ago</span>
                                <span>This week</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ══════════════════════════════════════════════════════════════════════
               TAB 4: REVIEWS & REPUTATION
               ══════════════════════════════════════════════════════════════════════ */}
            {(activeTab === 'reviews' || activeTab === 'all') && (
                <div style={{ marginBottom: '32px' }}>
                    <LiquidSectionHeader
                        title="Reviews & Studio Reputation"
                        subtitle="Verified client ratings, star breakdown & feedback channels"
                        icon={Star}
                        color="#FFB700"
                    />

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                        {/* Rating distribution 5 -> 1 */}
                        <div
                            style={{
                                background: 'linear-gradient(135deg, rgba(22, 22, 30, 0.6) 0%, rgba(14, 14, 20, 0.7) 100%)',
                                backdropFilter: 'blur(24px)',
                                border: '1px solid rgba(255, 183, 0, 0.18)',
                                borderRadius: '20px',
                                padding: '20px',
                            }}
                        >
                            <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '13px', fontWeight: 600, color: '#fff', marginBottom: '14px' }}>
                                Rating Breakdown
                            </p>
                            {[5, 4, 3, 2, 1].map((r) => {
                                const count = reviews.ratingDist[r] || 0;
                                const pct = Math.round((count / maxRating) * 100);
                                return (
                                    <div key={r} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '3px', width: '28px' }}>
                                            <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px', color: '#fff', fontWeight: 600 }}>{r}</span>
                                            <Star size={10} color="#FFB700" fill="#FFB700" />
                                        </div>
                                        <div style={{ flex: 1, height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                                            <div style={{ height: '100%', width: `${pct}%`, background: '#FFB700', borderRadius: '3px' }} />
                                        </div>
                                        <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '11px', color: '#888', width: '28px', textAlign: 'right' }}>
                                            {count}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Average Score Badge */}
                        <div
                            style={{
                                background: 'linear-gradient(135deg, rgba(22, 22, 30, 0.6) 0%, rgba(14, 14, 20, 0.7) 100%)',
                                backdropFilter: 'blur(24px)',
                                border: '1px solid rgba(255, 183, 0, 0.18)',
                                borderRadius: '20px',
                                padding: '24px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                textAlign: 'center',
                            }}
                        >
                            <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '48px', fontWeight: 900, color: '#FFB700', margin: 0, lineHeight: 1 }}>
                                {reviews.avgRating}
                            </p>
                            <div style={{ display: 'flex', gap: '4px', margin: '8px 0' }}>
                                {[1, 2, 3, 4, 5].map((s) => (
                                    <Star key={s} size={16} color="#FFB700" fill="#FFB700" />
                                ))}
                            </div>
                            <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px', color: '#999', margin: 0 }}>
                                Based on {reviews.total} verified reviews
                            </p>

                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '16px' }}>
                                {Object.entries(reviews.bySource).map(([src, count]) => (
                                    <span
                                        key={src}
                                        style={{
                                            fontFamily: 'Poppins, sans-serif',
                                            fontSize: '11px',
                                            padding: '4px 10px',
                                            borderRadius: '12px',
                                            background: 'rgba(255, 183, 0, 0.12)',
                                            border: '1px solid rgba(255, 183, 0, 0.25)',
                                            color: '#FFB700',
                                            fontWeight: 500,
                                        }}
                                    >
                                        {src}: {count}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ══════════════════════════════════════════════════════════════════════
               TAB 5: LIVE SITE ACTIVITY STREAM
               ══════════════════════════════════════════════════════════════════════ */}
            {(activeTab === 'activity' || activeTab === 'all') && (
                <div style={{ marginBottom: '24px' }}>
                    <LiquidSectionHeader
                        title="Live Site Activity Stream"
                        subtitle={`Real-time visitor logs and referrers (latest ${website.recentActivity.length} events)`}
                        icon={Activity}
                        color="#00D478"
                    />

                    {website.recentActivity.length === 0 ? (
                        <div
                            style={{
                                background: 'rgba(22, 22, 30, 0.5)',
                                border: '1px solid rgba(255, 255, 255, 0.08)',
                                borderRadius: '20px',
                                padding: '36px',
                                textAlign: 'center',
                            }}
                        >
                            <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '13px', color: '#777', margin: 0 }}>
                                No recent activity logged yet.
                            </p>
                        </div>
                    ) : (
                        <div
                            style={{
                                background: 'linear-gradient(135deg, rgba(22, 22, 30, 0.6) 0%, rgba(14, 14, 20, 0.7) 100%)',
                                backdropFilter: 'blur(24px)',
                                border: '1px solid rgba(255, 255, 255, 0.08)',
                                borderRadius: '20px',
                                overflow: 'hidden',
                                boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                            }}
                        >
                            <div style={{ maxHeight: '340px', overflowY: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'Poppins, sans-serif', fontSize: '12px' }}>
                                    <thead>
                                        <tr style={{ background: 'rgba(255, 45, 120, 0.08)', borderBottom: '1px solid rgba(255, 255, 255, 0.06)', color: '#aaa', textAlign: 'left' }}>
                                            <th style={{ padding: '12px 16px', fontWeight: 600 }}>Timestamp</th>
                                            <th style={{ padding: '12px 16px', fontWeight: 600 }}>Page</th>
                                            <th style={{ padding: '12px 16px', fontWeight: 600 }}>Device</th>
                                            <th style={{ padding: '12px 16px', fontWeight: 600 }}>Dwell Time</th>
                                            <th style={{ padding: '12px 16px', fontWeight: 600 }}>Source / Referrer</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {website.recentActivity.map((row, idx) => {
                                            const utm = row.utmCampaign || row.utmSource || row.utmMedium
                                                ? [row.utmSource, row.utmMedium, row.utmCampaign].filter(Boolean).join(' · ')
                                                : null;
                                            return (
                                                <tr
                                                    key={`${idx}-${row.createdAt}-${row.path}`}
                                                    style={{
                                                        borderTop: '1px solid rgba(255, 255, 255, 0.04)',
                                                        transition: 'background 0.15s ease',
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        (e.currentTarget as HTMLElement).style.background = 'rgba(255, 45, 120, 0.04)';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        (e.currentTarget as HTMLElement).style.background = 'transparent';
                                                    }}
                                                >
                                                    <td style={{ padding: '10px 16px', color: '#888', whiteSpace: 'nowrap' }}>
                                                        {formatTs(row.createdAt)}
                                                    </td>
                                                    <td style={{ padding: '10px 16px', color: '#fff', fontWeight: 500 }}>
                                                        {fmtPath(row.path)}
                                                    </td>
                                                    <td style={{ padding: '10px 16px', color: '#aaa', textTransform: 'capitalize' }}>
                                                        {row.device || '—'}
                                                    </td>
                                                    <td style={{ padding: '10px 16px', color: '#00D478' }}>
                                                        {row.duration && row.duration > 0 ? fmtDuration(row.duration) : '—'}
                                                    </td>
                                                    <td style={{ padding: '10px 16px', color: '#777', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                        {utm || row.referrerHost || 'Direct / Organic'}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
