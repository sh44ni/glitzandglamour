'use client';

import { useEffect, useState } from 'react';
import {
    TrendingUp, TrendingDown, Users, Star, Gift, Share2,
    DollarSign, BarChart2, Clock, XCircle, CheckCircle2, Sparkles
} from 'lucide-react';

type AnalyticsData = {
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
};

function MetricTile({ label, value, sub, icon: Icon, color = '#555', trend }: {
    label: string; value: string; sub?: string;
    icon: React.ElementType; color?: string; trend?: number;
}) {
    return (
        <div style={{
            background: 'rgba(255,255,255,0.025)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '14px', padding: '16px',
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{
                    width: '32px', height: '32px', borderRadius: '8px',
                    background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    <Icon size={15} color={color} />
                </div>
                {trend !== undefined && (
                    <span style={{
                        fontSize: '11px', fontWeight: 600, fontFamily: 'Poppins, sans-serif',
                        color: trend >= 0 ? '#00D478' : '#FF6B6B',
                        display: 'flex', alignItems: 'center', gap: '2px',
                    }}>
                        {trend >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                        {Math.abs(trend)}%
                    </span>
                )}
            </div>
            <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '22px', color: '#fff', marginTop: '10px', lineHeight: 1.1 }}>{value}</p>
            <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '11px', color: '#444', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</p>
            {sub && <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '11px', color: '#555', marginTop: '2px' }}>{sub}</p>}
        </div>
    );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
    return (
        <h3 style={{
            fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '13px',
            color: '#888', textTransform: 'uppercase', letterSpacing: '0.8px',
            marginBottom: '12px', marginTop: '28px',
            paddingBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.05)',
        }}>
            {children}
        </h3>
    );
}

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function AnalyticsSection() {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/admin/analytics')
            .then(r => r.json())
            .then(d => { setData(d); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    if (loading) return (
        <div style={{ padding: '40px 0', textAlign: 'center', color: '#444', fontFamily: 'Poppins, sans-serif', fontSize: '13px' }}>
            Loading analytics…
        </div>
    );

    if (!data) return null;

    const { overview, topServices, guestVsMember, byDayOfWeek, bookingsByDay, loyalty, referrals, reviews, weeklyGrowth } = data;

    // Booking sparkline
    const dayValues = Object.values(bookingsByDay);
    const maxDay = Math.max(...dayValues, 1);

    // Weekly growth
    const weekValues = Object.values(weeklyGrowth);
    const maxWeek = Math.max(...weekValues, 1);

    // Day of week max
    const maxDow = Math.max(...byDayOfWeek, 1);

    // Rating bar max
    const maxRating = Math.max(...Object.values(reviews.ratingDist), 1);

    const memberTotal = guestVsMember.guest + guestVsMember.member || 1;
    const memberPct = Math.round((guestVsMember.member / memberTotal) * 100);

    return (
        <div>
            {/* ── Overview Tiles ── */}
            <SectionTitle>📊 Business Overview</SectionTitle>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>
                <MetricTile label="Total Bookings" value={String(overview.totalBookings)} sub={`+${overview.bookingsThisMonth} this month`} icon={BarChart2} color="#FF2D78" trend={overview.periodChange} />
                <MetricTile label="Revenue Est." value={`$${overview.totalRevenue.toLocaleString()}`} sub={`$${overview.revenueThisMonth.toLocaleString()} this month`} icon={DollarSign} color="#00D478" />
                <MetricTile label="Total Customers" value={String(overview.totalCustomers)} sub={`+${overview.newCustomersThisMonth} this month`} icon={Users} color="#4FC3F7" />
                <MetricTile label="Conversion Rate" value={`${overview.conversionRate}%`} sub="bookings not cancelled" icon={CheckCircle2} color="#AB47BC" />
                <MetricTile label="Avg Confirm Time" value={`${overview.avgConfirmHours}h`} sub="pending → confirmed" icon={Clock} color="#FF9800" />
                <MetricTile label="Cancellation Rate" value={`${overview.cancellationRate}%`} sub="of all bookings" icon={XCircle} color="#EF5350" />
            </div>

            {/* ── Booking Trend (last 30 days) ── */}
            <SectionTitle>📈 Bookings — Last 30 Days</SectionTitle>
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '14px', padding: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2px', height: '60px' }}>
                    {dayValues.map((v, i) => (
                        <div key={i} style={{
                            flex: 1, background: v > 0 ? '#FF2D78' : 'rgba(255,255,255,0.04)',
                            height: `${(v / maxDay) * 100}%`, minHeight: '3px',
                            borderRadius: '2px 2px 0 0', opacity: 0.8 + (i / dayValues.length) * 0.2,
                        }} title={`${Object.keys(bookingsByDay)[i]}: ${v} booking${v !== 1 ? 's' : ''}`} />
                    ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontFamily: 'Poppins, sans-serif', fontSize: '10px', color: '#333' }}>
                    <span>30 days ago</span><span>Today</span>
                </div>
            </div>

            {/* ── Booking Status + Guest vs Member ── */}
            <SectionTitle>🎯 Booking Breakdown</SectionTitle>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {/* Status */}
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '14px', padding: '16px' }}>
                    <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px', color: '#666', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>By Status</p>
                    {[
                        { key: 'PENDING', color: '#FFB300' },
                        { key: 'CONFIRMED', color: '#4FC3F7' },
                        { key: 'COMPLETED', color: '#00D478' },
                        { key: 'CANCELLED', color: '#EF5350' },
                    ].map(({ key, color }) => {
                        const count = data.statusCounts[key] || 0;
                        const total = overview.totalBookings || 1;
                        return (
                            <div key={key} style={{ marginBottom: '8px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                                    <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '11px', color: '#888', textTransform: 'capitalize' }}>{key.toLowerCase()}</span>
                                    <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '11px', color }}>{count}</span>
                                </div>
                                <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px' }}>
                                    <div style={{ height: '100%', width: `${(count / total) * 100}%`, background: color, borderRadius: '2px', transition: 'width 0.6s ease' }} />
                                </div>
                            </div>
                        );
                    })}
                </div>
                {/* Guest vs member */}
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '14px', padding: '16px' }}>
                    <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px', color: '#666', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Guest vs Member</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                        <div style={{ flex: memberPct, height: '8px', background: '#FF2D78', borderRadius: '4px 0 0 4px' }} />
                        <div style={{ flex: 100 - memberPct, height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '0 4px 4px 0' }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <div>
                            <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '18px', fontWeight: 700, color: '#FF2D78' }}>{memberPct}%</p>
                            <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '10px', color: '#444' }}>Members ({guestVsMember.member})</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '18px', fontWeight: 700, color: '#888' }}>{100 - memberPct}%</p>
                            <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '10px', color: '#444' }}>Guests ({guestVsMember.guest})</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Day of Week Heatmap ── */}
            <SectionTitle>📅 Busiest Days of the Week</SectionTitle>
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '14px', padding: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: '6px' }}>
                    {byDayOfWeek.map((count, i) => (
                        <div key={i} style={{ textAlign: 'center' }}>
                            <div style={{
                                height: '40px', borderRadius: '6px', marginBottom: '6px',
                                background: `rgba(255,45,120,${0.07 + (count / maxDow) * 0.85})`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '13px', fontWeight: 700, color: count > 0 ? '#FF2D78' : '#333' }}>{count}</span>
                            </div>
                            <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '10px', color: '#444' }}>{DAY_LABELS[i]}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Top Services ── */}
            <SectionTitle>💅 Top Services by Bookings</SectionTitle>
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '14px', padding: '16px', display: 'grid', gap: '10px' }}>
                {topServices.map((s, i) => {
                    const maxS = topServices[0]?.bookings || 1;
                    return (
                        <div key={s.name}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '13px', color: '#ccc' }}>
                                    <span style={{ color: '#444', marginRight: '6px' }}>#{i + 1}</span>{s.name}
                                </span>
                                <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px', color: '#FF2D78', fontWeight: 600 }}>{s.bookings}</span>
                            </div>
                            <div style={{ height: '4px', background: 'rgba(255,255,255,0.04)', borderRadius: '2px' }}>
                                <div style={{ height: '100%', width: `${(s.bookings / maxS) * 100}%`, background: 'linear-gradient(90deg,#FF2D78,#FF6BA8)', borderRadius: '2px' }} />
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* ── Customer Growth ── */}
            <SectionTitle>👥 Customer Growth (Last 8 Weeks)</SectionTitle>
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '14px', padding: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '48px' }}>
                    {weekValues.map((v, i) => (
                        <div key={i} style={{
                            flex: 1, background: '#4FC3F7',
                            height: `${(v / maxWeek) * 100}%`, minHeight: '3px',
                            borderRadius: '2px 2px 0 0', opacity: 0.5 + (i / weekValues.length) * 0.5,
                        }} title={`Week ${i + 1}: ${v} new users`} />
                    ))}
                </div>
                <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '11px', color: '#444', marginTop: '8px', textAlign: 'center' }}>
                    {overview.newCustomersThisMonth} new customers in the last 30 days
                </p>
            </div>

            {/* ── Loyalty + Referrals ── */}
            <SectionTitle>🎀 Loyalty & Referrals</SectionTitle>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px,1fr))', gap: '10px' }}>
                <MetricTile label="Loyalty Cards" value={String(loyalty.totalCards)} sub="active members" icon={Sparkles} color="#FF2D78" />
                <MetricTile label="Stamps Issued" value={String(loyalty.lifetimeStamps)} sub="lifetime total" icon={Star} color="#FFB300" />
                <MetricTile label="Spins Redeemed" value={String(loyalty.spinsRedeemed)} sub="free spin rewards" icon={Gift} color="#AB47BC" />
                <MetricTile label="Referrals Sent" value={String(referrals.total)} sub={`${referrals.converted} converted · ${referrals.rewarded} rewarded`} icon={Share2} color="#00D478" />
            </div>

            {/* ── Reviews ── */}
            <SectionTitle>⭐ Review Analytics</SectionTitle>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '14px', padding: '16px' }}>
                    <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px', color: '#666', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Rating breakdown</p>
                    {[5, 4, 3, 2, 1].map(r => {
                        const count = reviews.ratingDist[r] || 0;
                        return (
                            <div key={r} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                                <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '11px', color: '#555', width: '6px' }}>{r}</span>
                                <div style={{ flex: 1, height: '4px', background: 'rgba(255,255,255,0.04)', borderRadius: '2px' }}>
                                    <div style={{ height: '100%', width: `${(count / maxRating) * 100}%`, background: '#FFB300', borderRadius: '2px' }} />
                                </div>
                                <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '11px', color: '#444', width: '20px', textAlign: 'right' }}>{count}</span>
                            </div>
                        );
                    })}
                </div>
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '14px', padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '6px' }}>
                    <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '40px', fontWeight: 800, color: '#FFB300' }}>{reviews.avgRating}</p>
                    <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '11px', color: '#444' }}>avg rating · {reviews.total} total</p>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
                        {Object.entries(reviews.bySource).map(([src, count]) => (
                            <span key={src} style={{
                                fontFamily: 'Poppins, sans-serif', fontSize: '10px',
                                padding: '2px 8px', borderRadius: '20px',
                                background: 'rgba(255,179,0,0.1)', color: '#FFB300',
                            }}>{src}: {count}</span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
