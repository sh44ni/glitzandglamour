import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdminRequest } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

function startOfDay(d: Date) {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    return x;
}

function addDays(d: Date, n: number) {
    const x = new Date(d);
    x.setDate(x.getDate() + n);
    return x;
}

function dateKey(d: Date) {
    return d.toISOString().slice(0, 10);
}

function isBlogPostPath(path: string) {
    return path.startsWith('/blogs/') && path.split('/').filter(Boolean).length === 2;
}

function getSlugFromPath(path: string) {
    if (!isBlogPostPath(path)) return null;
    return path.split('/')[2] || null;
}

function sourceLabel(p: { referrerHost: string | null; utmSource: string | null; utmMedium: string | null }) {
    if (p.utmSource) return p.utmMedium ? `${p.utmSource} / ${p.utmMedium}` : p.utmSource;
    if (!p.referrerHost) return 'Direct / Unknown';
    return p.referrerHost;
}

export async function GET(req: NextRequest) {
    if (!(await isAdminRequest(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const days = Math.max(1, Math.min(90, Number(searchParams.get('days') || '30') || 30));

    const end = new Date();
    const start = startOfDay(addDays(end, -days + 1));

    const posts = await prisma.blogPost.findMany({
        select: { id: true, title: true, slug: true, published: true, createdAt: true, views: true },
    });
    let views: {
        path: string;
        sessionId: string;
        referrerHost: string | null;
        device: string | null;
        duration: number | null;
        createdAt: Date;
        utmSource: string | null;
        utmMedium: string | null;
        utmCampaign: string | null;
    }[] = [];
    try {
        views = await prisma.pageView.findMany({
            where: {
                createdAt: { gte: start },
                path: { startsWith: '/blogs' },
            },
            select: {
                path: true,
                sessionId: true,
                referrerHost: true,
                device: true,
                duration: true,
                createdAt: true,
                utmSource: true,
                utmMedium: true,
                utmCampaign: true,
            },
        });
    } catch {
        // During deploy windows DB may not have new PageView columns yet.
        views = [];
    }

    const postBySlug = new Map(posts.map(p => [p.slug, p]));

    // Aggregate
    const pvByDay: Record<string, number> = {};
    for (let i = 0; i < days; i++) pvByDay[dateKey(addDays(start, i))] = 0;

    const uniqueSessions = new Set<string>();
    const deviceCounts: Record<string, number> = {};
    const referrers: Record<string, number> = {};
    const campaigns: Record<string, number> = {};

    const bySlug: Record<string, { views: number; uniqueVisitors: Set<string>; avgDurationSum: number; avgDurationCount: number }> = {};

    for (const v of views) {
        const day = dateKey(v.createdAt);
        if (pvByDay[day] !== undefined) pvByDay[day] += 1;

        uniqueSessions.add(v.sessionId);

        const dev = v.device || 'unknown';
        deviceCounts[dev] = (deviceCounts[dev] || 0) + 1;

        const src = sourceLabel(v);
        referrers[src] = (referrers[src] || 0) + 1;

        if (v.utmCampaign) campaigns[v.utmCampaign] = (campaigns[v.utmCampaign] || 0) + 1;

        const slug = getSlugFromPath(v.path);
        if (slug) {
            if (!bySlug[slug]) bySlug[slug] = { views: 0, uniqueVisitors: new Set(), avgDurationSum: 0, avgDurationCount: 0 };
            bySlug[slug].views += 1;
            bySlug[slug].uniqueVisitors.add(v.sessionId);
            if (typeof v.duration === 'number' && v.duration > 0) {
                bySlug[slug].avgDurationSum += v.duration;
                bySlug[slug].avgDurationCount += 1;
            }
        }
    }

    const topPosts = Object.entries(bySlug)
        .map(([slug, a]) => {
            const post = postBySlug.get(slug);
            const avgDuration =
                a.avgDurationCount > 0 ? Math.round(a.avgDurationSum / a.avgDurationCount) : 0;
            return {
                slug,
                title: post?.title || slug,
                published: post?.published ?? false,
                views: a.views,
                uniqueVisitors: a.uniqueVisitors.size,
                avgDurationSec: avgDuration,
            };
        })
        .sort((x, y) => y.views - x.views)
        .slice(0, 10);

    const topSources = Object.entries(referrers)
        .map(([source, visits]) => ({ source, visits }))
        .sort((a, b) => b.visits - a.visits)
        .slice(0, 12);

    const topCampaigns = Object.entries(campaigns)
        .map(([campaign, visits]) => ({ campaign, visits }))
        .sort((a, b) => b.visits - a.visits)
        .slice(0, 10);

    return NextResponse.json({
        rangeDays: days,
        since: start.toISOString(),
        overview: {
            blogPageViews: views.length,
            uniqueVisitors: uniqueSessions.size,
            blogPostViews: views.filter(v => isBlogPostPath(v.path)).length,
        },
        pvByDay,
        deviceCounts,
        topPosts,
        topSources,
        topCampaigns,
        totals: {
            totalBlogPosts: posts.length,
            publishedPosts: posts.filter(p => p.published).length,
            allTimeViewsCounter: posts.reduce((s, p) => s + (p.views || 0), 0),
        },
    });
}

