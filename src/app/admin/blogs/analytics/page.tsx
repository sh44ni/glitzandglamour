'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, TrendingUp, Users, Eye, Globe, Monitor, Smartphone, Tablet, RefreshCw } from 'lucide-react';

type Analytics = {
    rangeDays: number;
    since: string;
    overview: { blogPageViews: number; uniqueVisitors: number; blogPostViews: number };
    pvByDay: Record<string, number>;
    deviceCounts: Record<string, number>;
    topPosts: { slug: string; title: string; published: boolean; views: number; uniqueVisitors: number; avgDurationSec: number }[];
    topSources: { source: string; visits: number }[];
    topCampaigns: { campaign: string; visits: number }[];
    totals: { totalBlogPosts: number; publishedPosts: number; allTimeViewsCounter: number };
};

function Metric({ label, value, icon: Icon, color }: { label: string; value: string; icon: any; color: string }) {
    return (
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: `${color}1a`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={16} color={color} />
                </div>
            </div>
            <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: '22px', color: '#fff', marginTop: 10, marginBottom: 2 }}>{value}</p>
            <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '11px', color: '#444', textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0 }}>{label}</p>
        </div>
    );
}

function fmtDuration(sec: number) {
    if (!sec) return '—';
    if (sec < 60) return `${sec}s`;
    return `${Math.floor(sec / 60)}m ${sec % 60}s`;
}

export default function BlogAnalyticsPage() {
    const [days, setDays] = useState(30);
    const [data, setData] = useState<Analytics | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/blogs/analytics?days=${days}`);
            const d = await res.json();
            setData(d);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, [days]);

    const dayValues = useMemo(() => {
        const entries = Object.entries(data?.pvByDay || {});
        return entries.sort((a, b) => a[0].localeCompare(b[0]));
    }, [data?.pvByDay]);

    const maxDay = Math.max(...dayValues.map(([, v]) => v), 1);

    const deviceIcons: Record<string, any> = { mobile: Smartphone, desktop: Monitor, tablet: Tablet, unknown: Globe };
    const deviceColors: Record<string, string> = { mobile: '#FF2D78', desktop: '#4FC3F7', tablet: '#AB47BC', unknown: '#666' };
    const totalDevices = Object.values(data?.deviceCounts || {}).reduce((s, v) => s + v, 0) || 1;

    return (
        <div style={{ padding: '0px 10px', fontFamily: 'Poppins, sans-serif' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap', marginBottom: 22 }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                        <Link href="/admin/blogs" style={{ textDecoration: 'none', color: '#888', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                            <ArrowLeft size={14} /> Back
                        </Link>
                    </div>
                    <h1 style={{ color: '#fff', fontSize: '26px', fontWeight: 800, margin: '0 0 4px' }}>Blog Analytics</h1>
                    <p style={{ color: '#555', fontSize: 13, margin: 0 }}>Traffic sources, best performers, and engagement for the last {days} days.</p>
                </div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <select value={days} onChange={e => setDays(Number(e.target.value))}
                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#ddd', padding: '10px 12px', borderRadius: 12, outline: 'none' }}>
                        <option value={7}>Last 7 days</option>
                        <option value={14}>Last 14 days</option>
                        <option value={30}>Last 30 days</option>
                        <option value={60}>Last 60 days</option>
                        <option value={90}>Last 90 days</option>
                    </select>
                    <button onClick={fetchData} disabled={loading}
                        style={{ background: '#FF2D78', border: 'none', borderRadius: 12, padding: '10px 14px', color: '#fff', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8, fontWeight: 700 }}>
                        <RefreshCw size={15} /> {loading ? 'Loading…' : 'Refresh'}
                    </button>
                </div>
            </div>

            {loading && (
                <div style={{ color: '#555', padding: '26px 0' }}>Loading analytics…</div>
            )}

            {!loading && data && (
                <>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10, marginBottom: 14 }}>
                        <Metric label="Blog page views" value={String(data.overview.blogPageViews)} icon={Eye} color="#FF2D78" />
                        <Metric label="Blog post views" value={String(data.overview.blogPostViews)} icon={TrendingUp} color="#4FC3F7" />
                        <Metric label="Unique visitors" value={String(data.overview.uniqueVisitors)} icon={Users} color="#00D478" />
                        <Metric label="Published posts" value={`${data.totals.publishedPosts}/${data.totals.totalBlogPosts}`} icon={Globe} color="#AB47BC" />
                    </div>

                    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 14, padding: 16, marginBottom: 10 }}>
                        <p style={{ color: '#666', fontSize: 12, margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                            Daily blog views — last {days} days
                        </p>
                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 58 }}>
                            {dayValues.map(([day, v]) => (
                                <div key={day} title={`${day}: ${v} views`} style={{
                                    flex: 1,
                                    height: `${(v / maxDay) * 100}%`,
                                    minHeight: 3,
                                    borderRadius: '2px 2px 0 0',
                                    background: v > 0 ? 'linear-gradient(180deg,#FF2D78,#7928CA)' : 'rgba(255,255,255,0.04)',
                                    opacity: 0.5 + (v > 0 ? 0.35 : 0),
                                }} />
                            ))}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 10, color: '#333' }}>
                            <span>{dayValues[0]?.[0]}</span>
                            <span>{dayValues[dayValues.length - 1]?.[0]}</span>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 14, padding: 16 }}>
                            <p style={{ color: '#666', fontSize: 12, margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Traffic sources</p>
                            {data.topSources.length === 0 ? (
                                <p style={{ color: '#444', fontSize: 12 }}>No data yet.</p>
                            ) : data.topSources.map((s, i) => {
                                const max = data.topSources[0].visits || 1;
                                return (
                                    <div key={s.source} style={{ marginBottom: 10 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                                            <span style={{ color: i === 0 ? '#fff' : '#aaa', fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '75%' }}>
                                                #{i + 1} {s.source}
                                            </span>
                                            <span style={{ color: '#4FC3F7', fontSize: 12, fontWeight: 700 }}>{s.visits}</span>
                                        </div>
                                        <div style={{ height: 4, background: 'rgba(255,255,255,0.04)', borderRadius: 999 }}>
                                            <div style={{ height: '100%', width: `${(s.visits / max) * 100}%`, background: 'linear-gradient(90deg,#4FC3F7,#81D4FA)', borderRadius: 999 }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 14, padding: 16 }}>
                            <p style={{ color: '#666', fontSize: 12, margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Devices</p>
                            {Object.entries(data.deviceCounts).length === 0 ? (
                                <p style={{ color: '#444', fontSize: 12 }}>No data yet.</p>
                            ) : Object.entries(data.deviceCounts).map(([dev, count]) => {
                                const Icon = deviceIcons[dev] || Globe;
                                const color = deviceColors[dev] || '#666';
                                const pct = Math.round((count / totalDevices) * 100);
                                return (
                                    <div key={dev} style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 10 }}>
                                        <Icon size={14} color={color} />
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                                                <span style={{ color: '#aaa', fontSize: 12, textTransform: 'capitalize' }}>{dev}</span>
                                                <span style={{ color, fontSize: 12, fontWeight: 700 }}>{pct}%</span>
                                            </div>
                                            <div style={{ height: 4, background: 'rgba(255,255,255,0.04)', borderRadius: 999 }}>
                                                <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 999 }} />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 14, padding: 16, marginBottom: 10 }}>
                        <p style={{ color: '#666', fontSize: 12, margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Best performers</p>
                        {data.topPosts.length === 0 ? (
                            <p style={{ color: '#444', fontSize: 12 }}>No blog post views yet.</p>
                        ) : (
                            <div style={{ display: 'grid', gap: 10 }}>
                                {data.topPosts.map((p, i) => (
                                    <div key={p.slug} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 12, padding: '12px 14px' }}>
                                        <div style={{ minWidth: 0 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                                                <span style={{ color: '#333', fontWeight: 800, fontSize: 12 }}>#{i + 1}</span>
                                                <span style={{ color: '#fff', fontWeight: 700, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 460 }}>{p.title}</span>
                                                <span style={{ color: p.published ? '#00D478' : '#FFB700', fontSize: 10, fontWeight: 800, textTransform: 'uppercase' }}>
                                                    {p.published ? 'Published' : 'Draft'}
                                                </span>
                                            </div>
                                            <span style={{ color: '#555', fontSize: 12 }}>/blogs/{p.slug}</span>
                                        </div>
                                        <div style={{ display: 'flex', gap: 14, alignItems: 'center', flexShrink: 0 }}>
                                            <div style={{ textAlign: 'right' }}>
                                                <p style={{ margin: 0, color: '#4FC3F7', fontWeight: 800, fontSize: 14 }}>{p.views}</p>
                                                <p style={{ margin: 0, color: '#444', fontSize: 11 }}>views</p>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <p style={{ margin: 0, color: '#00D478', fontWeight: 800, fontSize: 14 }}>{p.uniqueVisitors}</p>
                                                <p style={{ margin: 0, color: '#444', fontSize: 11 }}>visitors</p>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <p style={{ margin: 0, color: '#AB47BC', fontWeight: 800, fontSize: 14 }}>{fmtDuration(p.avgDurationSec)}</p>
                                                <p style={{ margin: 0, color: '#444', fontSize: 11 }}>avg time</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 14, padding: 16 }}>
                            <p style={{ color: '#666', fontSize: 12, margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Top campaigns (UTM)</p>
                            {data.topCampaigns.length === 0 ? (
                                <p style={{ color: '#444', fontSize: 12 }}>No UTM campaigns tracked yet.</p>
                            ) : data.topCampaigns.map((c, i) => (
                                <div key={c.campaign} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                                    <span style={{ color: '#aaa', fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '75%' }}>#{i + 1} {c.campaign}</span>
                                    <span style={{ color: '#4FC3F7', fontSize: 12, fontWeight: 800 }}>{c.visits}</span>
                                </div>
                            ))}
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 14, padding: 16 }}>
                            <p style={{ color: '#666', fontSize: 12, margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Notes</p>
                            <p style={{ color: '#555', fontSize: 12, lineHeight: 1.5, margin: 0 }}>
                                This dashboard uses first-party tracking (`/api/track`). Traffic sources come from the referrer host and UTM tags.
                                If a visit has no referrer and no UTM, it shows as Direct / Unknown.
                            </p>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

