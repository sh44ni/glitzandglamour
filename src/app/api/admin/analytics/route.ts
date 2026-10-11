import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminCookie } from '@/app/api/admin/auth/route';
import { classifyTrafficSource } from '@/lib/trafficClassifier';

export async function GET(request: NextRequest) {
    if (!await verifyAdminCookie(request)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = request.nextUrl;
    const rangeParam = url.searchParams.get('range')?.toLowerCase() || '30d';
    const startDateParam = url.searchParams.get('startDate');
    const endDateParam = url.searchParams.get('endDate');

    const now = new Date();
    let periodStart: Date;
    let periodEnd: Date = now;

    // ── 1. Parse flexible date/time range ──
    if (startDateParam && endDateParam) {
        const s = new Date(startDateParam);
        const e = new Date(endDateParam);
        if (!isNaN(s.getTime()) && !isNaN(e.getTime()) && e > s) {
            periodStart = s;
            periodEnd = e;
        } else {
            periodStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        }
    } else if (rangeParam === '1h') {
        periodStart = new Date(now.getTime() - 60 * 60 * 1000);
    } else if (rangeParam === '24h') {
        periodStart = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    } else {
        const num = parseInt(rangeParam.replace(/[^\d]/g, ''), 10);
        const days = Number.isFinite(num) && num > 0 ? Math.min(366, num) : 30;
        periodStart = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    }

    const durationMs = periodEnd.getTime() - periodStart.getTime();
    const prevPeriodEnd = new Date(periodStart.getTime());
    const prevPeriodStart = new Date(periodStart.getTime() - durationMs);
    const rangeDays = Math.max(1, Math.round(durationMs / (24 * 60 * 60 * 1000)));

    // ── 2. Determine bucket resolution for charts ──
    const durationHours = durationMs / (3600 * 1000);
    let bucketResolution: '5m' | '1h' | '1d' = '1d';
    let bucketStepMs = 24 * 3600 * 1000;

    if (durationHours <= 2.5) {
        bucketResolution = '5m';
        bucketStepMs = 5 * 60 * 1000;
    } else if (durationHours <= 72) {
        bucketResolution = '1h';
        bucketStepMs = 3600 * 1000;
    }

    function formatBucketKey(d: Date, res: '5m' | '1h' | '1d'): string {
        if (res === '5m') {
            const h = String(d.getHours()).padStart(2, '0');
            const m = String(Math.floor(d.getMinutes() / 5) * 5).padStart(2, '0');
            return `${h}:${m}`;
        }
        if (res === '1h') {
            const month = d.getMonth() + 1;
            const date = d.getDate();
            const h = d.getHours();
            const ampm = h >= 12 ? 'PM' : 'AM';
            const h12 = h % 12 || 12;
            return `${month}/${date} ${h12}${ampm}`;
        }
        return d.toISOString().split('T')[0];
    }

    const bucketKeys: string[] = [];
    const curBucket = new Date(periodStart);
    if (bucketResolution === '5m') {
        curBucket.setMinutes(Math.floor(curBucket.getMinutes() / 5) * 5, 0, 0);
    } else if (bucketResolution === '1h') {
        curBucket.setMinutes(0, 0, 0);
    } else {
        curBucket.setHours(0, 0, 0, 0);
    }

    while (curBucket <= periodEnd) {
        const k = formatBucketKey(curBucket, bucketResolution);
        if (!bucketKeys.includes(k)) {
            bucketKeys.push(k);
        }
        curBucket.setTime(curBucket.getTime() + bucketStepMs);
        if (bucketKeys.length > 200) break; // safety guard
    }

    // ── 3. Parallel database queries ──
    const [
        allBookings,
        recentBookings,
        prevPeriodBookings,
        allUsers,
        recentUsers,
        allReviews,
        loyaltyStats,
        stampCount,
        referralStats,
        allServices,
        recentPageViews,
        prevPageViews,
        allTimePageViews,
        pageViewBounds,
        recentPageViewFeed,
    ] = await Promise.all([
        prisma.booking.findMany({
            include: { service: { select: { name: true, priceFrom: true } } },
            orderBy: { createdAt: 'asc' },
        }),
        prisma.booking.findMany({
            where: { createdAt: { gte: periodStart, lte: periodEnd } },
            include: { service: { select: { name: true, priceFrom: true } } },
            orderBy: { createdAt: 'asc' },
        }),
        prisma.booking.findMany({
            where: { createdAt: { gte: prevPeriodStart, lt: periodStart } },
        }),
        prisma.user.findMany({ select: { createdAt: true } }),
        prisma.user.findMany({
            where: { createdAt: { gte: periodStart, lte: periodEnd } },
            select: { createdAt: true },
        }),
        prisma.review.findMany({ select: { rating: true, source: true, createdAt: true } }),
        prisma.loyaltyCard.aggregate({
            _count: true,
            _sum: { lifetimeStamps: true, spinsRedeemed: true, referralRewards: true },
            where: {},
        }),
        prisma.stamp.count(),
        prisma.referral.findMany({ select: { rewardGiven: true, bookingId: true } }),
        prisma.service.findMany({
            where: { isActive: true },
            include: { _count: { select: { bookings: true } } },
            orderBy: { bookings: { _count: 'desc' } },
        }),
        prisma.pageView.findMany({
            where: { createdAt: { gte: periodStart, lte: periodEnd } },
            select: {
                path: true,
                sessionId: true,
                referrer: true,
                referrerHost: true,
                utmSource: true,
                utmCampaign: true,
                device: true,
                duration: true,
                createdAt: true,
            },
        }),
        prisma.pageView.findMany({
            where: { createdAt: { gte: prevPeriodStart, lt: periodStart } },
            select: {
                path: true,
                sessionId: true,
                referrer: true,
                referrerHost: true,
                utmSource: true,
                utmCampaign: true,
                device: true,
                duration: true,
                createdAt: true,
            },
        }),
        prisma.pageView.count(),
        prisma.pageView.aggregate({
            _min: { createdAt: true },
            _max: { createdAt: true },
        }),
        prisma.pageView.findMany({
            orderBy: { createdAt: 'desc' },
            take: 35,
            select: {
                path: true,
                createdAt: true,
                device: true,
                duration: true,
                referrerHost: true,
                referrer: true,
                utmSource: true,
                utmMedium: true,
                utmCampaign: true,
            },
        }),
    ]);

    // ── 4. Booking volume by day / bucket ──
    const bookingsByDay: Record<string, number> = {};
    for (const bKey of bucketKeys) {
        bookingsByDay[bKey] = 0;
    }
    for (const b of recentBookings) {
        const bKey = formatBucketKey(new Date(b.createdAt), bucketResolution);
        if (bookingsByDay[bKey] !== undefined) {
            bookingsByDay[bKey]++;
        }
    }

    // ── Status breakdown ──
    const statusCounts = allBookings.reduce((acc: Record<string, number>, b) => {
        acc[b.status] = (acc[b.status] || 0) + 1;
        return acc;
    }, {});

    // ── Booking by day of week ──
    const byDayOfWeek = [0, 0, 0, 0, 0, 0, 0]; // Sun–Sat
    for (const b of allBookings) {
        byDayOfWeek[new Date(b.createdAt).getDay()]++;
    }

    // ── Booking by hour of day ──
    const byHour: Record<number, number> = {};
    for (const b of allBookings) {
        const h = new Date(b.createdAt).getHours();
        byHour[h] = (byHour[h] || 0) + 1;
    }

    // ── Guest vs signed-in ──
    const guestBookings = allBookings.filter(b => !b.userId).length;
    const memberBookings = allBookings.filter(b => b.userId).length;

    // ── Cancellation rate ──
    const cancelled = statusCounts['CANCELLED'] || 0;
    const cancellationRate = allBookings.length > 0
        ? Math.round((cancelled / allBookings.length) * 100)
        : 0;

    // ── Conversion rate (pending+confirmed+completed / total) ──
    const converted = allBookings.filter(b => b.status !== 'CANCELLED').length;
    const conversionRate = allBookings.length > 0
        ? Math.round((converted / allBookings.length) * 100)
        : 0;

    // ── Avg time to confirm ──
    const confirmedBookings = allBookings.filter(b => b.status === 'CONFIRMED' || b.status === 'COMPLETED');
    const avgConfirmHours = confirmedBookings.length > 0
        ? Math.round(
            confirmedBookings.reduce((sum, b) => {
                const diffMs = new Date(b.updatedAt).getTime() - new Date(b.createdAt).getTime();
                return sum + diffMs / 3600000;
            }, 0) / confirmedBookings.length
          )
        : 0;

    // ── Top services ──
    const topServices = allServices.slice(0, 6).map(s => ({
        name: s.name,
        bookings: s._count.bookings,
        priceFrom: s.priceFrom,
    }));

    // ── Revenue estimate ──
    const revenueEstimate = allBookings
        .filter(b => b.status === 'COMPLETED')
        .reduce((sum, b) => sum + (b.service.priceFrom || 0), 0);

    const revenueThisMonth = recentBookings
        .filter(b => b.status === 'COMPLETED')
        .reduce((sum, b) => sum + (b.service.priceFrom || 0), 0);

    // ── Reviews breakdown ──
    const ratingDist: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let totalRating = 0;
    for (const r of allReviews) {
        ratingDist[r.rating] = (ratingDist[r.rating] || 0) + 1;
        totalRating += r.rating;
    }
    const avgRating = allReviews.length > 0
        ? Math.round((totalRating / allReviews.length) * 10) / 10
        : 0;
    const reviewsBySource = allReviews.reduce((acc: Record<string, number>, r) => {
        acc[r.source] = (acc[r.source] || 0) + 1; return acc;
    }, {});

    // ── Customer growth (last 8 weeks) ──
    const weeklyGrowth: Record<string, number> = {};
    for (let i = 7; i >= 0; i--) {
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - i * 7);
        weeklyGrowth[weekStart.toISOString().split('T')[0]] = 0;
    }
    for (const u of allUsers) {
        for (let i = 7; i >= 0; i--) {
            const weekStart = new Date(now); weekStart.setDate(now.getDate() - i * 7);
            const weekEnd = new Date(now); weekEnd.setDate(now.getDate() - (i - 1) * 7);
            if (new Date(u.createdAt) >= weekStart && new Date(u.createdAt) < weekEnd) {
                weeklyGrowth[weekStart.toISOString().split('T')[0]]++;
            }
        }
    }

    // ── Period comparison for bookings ──
    const periodChange = prevPeriodBookings.length > 0
        ? Math.round(((recentBookings.length - prevPeriodBookings.length) / prevPeriodBookings.length) * 100)
        : 100;

    // ── Page Views timeline by bucket ──
    const pvByDay: Record<string, number> = {};
    for (const bKey of bucketKeys) {
        pvByDay[bKey] = 0;
    }
    for (const p of recentPageViews) {
        const bKey = formatBucketKey(new Date(p.createdAt), bucketResolution);
        if (pvByDay[bKey] !== undefined) {
            pvByDay[bKey]++;
        }
    }

    // Top pages
    const pageCounts: Record<string, number> = {};
    for (const p of recentPageViews) {
        pageCounts[p.path] = (pageCounts[p.path] || 0) + 1;
    }
    const topPages = Object.entries(pageCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 8)
        .map(([path, views]) => ({ path, views }));

    // Device split
    const deviceCounts: Record<string, number> = {};
    for (const p of recentPageViews) {
        const d = p.device || 'unknown';
        deviceCounts[d] = (deviceCounts[d] || 0) + 1;
    }

    // Avg duration
    const withDuration = recentPageViews.filter(p => p.duration && p.duration > 0);
    const avgDuration = withDuration.length > 0
        ? Math.round(withDuration.reduce((s, p) => s + (p.duration || 0), 0) / withDuration.length)
        : 0;

    // Bounce rate
    const sessionPageCounts: Record<string, number> = {};
    for (const p of recentPageViews) {
        sessionPageCounts[p.sessionId] = (sessionPageCounts[p.sessionId] || 0) + 1;
    }
    const totalSessions = Object.keys(sessionPageCounts).length;
    const bouncedSessions = Object.values(sessionPageCounts).filter(c => c === 1).length;
    const bounceRate = totalSessions > 0 ? Math.round((bouncedSessions / totalSessions) * 100) : 0;

    const pagesPerSession = totalSessions > 0
        ? Math.round((recentPageViews.length / totalSessions) * 10) / 10
        : 0;

    // ── 5. Advanced Traffic Source Intelligence & Comparison ──
    type SourceAccumulator = {
        canonicalSite: string;
        displayName: string;
        category: string;
        iconType: string;
        brandColor: string;
        visits: number;
        sessions: Set<string>;
        durations: number[];
        sessionCounts: Record<string, number>;
        highIntentSessions: Set<string>;
        subdomains: Record<string, number>;
        timeline: Record<string, { visits: number; sessions: Set<string> }>;
    };

    const sourceMap = new Map<string, SourceAccumulator>();
    const prevSourceVisitors = new Map<string, Set<string>>();
    const prevSourceVisits = new Map<string, number>();

    const HIGH_INTENT_PATHS = ['/book', '/special-events', '/services'];
    const isHighIntentPath = (p: string) => HIGH_INTENT_PATHS.some(hip => p.toLowerCase().startsWith(hip));

    // Process current period traffic
    for (const p of recentPageViews) {
        const classified = classifyTrafficSource({
            referrer: p.referrer,
            referrerHost: p.referrerHost,
            utmSource: p.utmSource,
            utmCampaign: p.utmCampaign,
        });

        // Filter out internal system & OAuth logins from inbound marketing
        if (classified.isInternalOrAuth) continue;

        let acc = sourceMap.get(classified.canonicalSite);
        if (!acc) {
            acc = {
                canonicalSite: classified.canonicalSite,
                displayName: classified.displayName,
                category: classified.category,
                iconType: classified.iconType,
                brandColor: classified.brandColor,
                visits: 0,
                sessions: new Set(),
                durations: [],
                sessionCounts: {},
                highIntentSessions: new Set(),
                subdomains: {},
                timeline: {},
            };
            sourceMap.set(classified.canonicalSite, acc);
        }

        acc.visits++;
        acc.sessions.add(p.sessionId);
        if (p.duration && p.duration > 0) {
            acc.durations.push(p.duration);
        }
        acc.sessionCounts[p.sessionId] = (acc.sessionCounts[p.sessionId] || 0) + 1;

        if (isHighIntentPath(p.path)) {
            acc.highIntentSessions.add(p.sessionId);
        }

        if (classified.rawHost) {
            acc.subdomains[classified.rawHost] = (acc.subdomains[classified.rawHost] || 0) + 1;
        }

        const bKey = formatBucketKey(new Date(p.createdAt), bucketResolution);
        if (!acc.timeline[bKey]) {
            acc.timeline[bKey] = { visits: 0, sessions: new Set() };
        }
        acc.timeline[bKey].visits++;
        acc.timeline[bKey].sessions.add(p.sessionId);
    }

    // Process previous comparison period traffic
    for (const p of prevPageViews) {
        const classified = classifyTrafficSource({
            referrer: p.referrer,
            referrerHost: p.referrerHost,
            utmSource: p.utmSource,
            utmCampaign: p.utmCampaign,
        });

        if (classified.isInternalOrAuth) continue;

        if (!prevSourceVisitors.has(classified.canonicalSite)) {
            prevSourceVisitors.set(classified.canonicalSite, new Set());
            prevSourceVisits.set(classified.canonicalSite, 0);
        }
        prevSourceVisitors.get(classified.canonicalSite)!.add(p.sessionId);
        prevSourceVisits.set(classified.canonicalSite, (prevSourceVisits.get(classified.canonicalSite) || 0) + 1);
    }

    // Total unique marketing visitors in current and prior windows
    const totalMarketingVisitors = Array.from(sourceMap.values()).reduce((sum, s) => sum + s.sessions.size, 0);
    const prevTotalMarketingVisitors = Array.from(prevSourceVisitors.values()).reduce((sum, set) => sum + set.size, 0);

    const trafficSourcesList = Array.from(sourceMap.values()).map(s => {
        const currentVisitors = s.sessions.size;
        const currentVisits = s.visits;
        const prevVisitorsSet = prevSourceVisitors.get(s.canonicalSite);
        const prevVisitors = prevVisitorsSet ? prevVisitorsSet.size : 0;
        const prevVisits = prevSourceVisits.get(s.canonicalSite) || 0;

        const currentSharePct = totalMarketingVisitors > 0
            ? Math.round((currentVisitors / totalMarketingVisitors) * 1000) / 10
            : 0;

        const prevSharePct = prevTotalMarketingVisitors > 0
            ? Math.round((prevVisitors / prevTotalMarketingVisitors) * 1000) / 10
            : 0;

        let visitorGrowthPct = 0;
        if (prevVisitors === 0) {
            visitorGrowthPct = currentVisitors > 0 ? 100 : 0;
        } else {
            visitorGrowthPct = Math.round(((currentVisitors - prevVisitors) / prevVisitors) * 1000) / 10;
        }

        const shareShiftPct = Math.round((currentSharePct - prevSharePct) * 10) / 10;

        const avgDurationSec = s.durations.length > 0
            ? Math.round(s.durations.reduce((a, b) => a + b, 0) / s.durations.length)
            : 0;

        const sTotalSessions = Object.keys(s.sessionCounts).length;
        const sBouncedSessions = Object.values(s.sessionCounts).filter(c => c === 1).length;
        const bounceRatePct = sTotalSessions > 0
            ? Math.round((sBouncedSessions / sTotalSessions) * 100)
            : 0;

        const highIntentCount = s.highIntentSessions.size;
        const conversionRatePct = currentVisitors > 0
            ? Math.round((highIntentCount / currentVisitors) * 1000) / 10
            : 0;

        const subdomains = Object.entries(s.subdomains)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 6)
            .map(([rawHost, count]) => ({ rawHost, count }));

        const timeline = bucketKeys.map(bKey => ({
            timeLabel: bKey,
            visits: s.timeline[bKey]?.visits || 0,
            visitors: s.timeline[bKey]?.sessions ? s.timeline[bKey].sessions.size : 0,
        }));

        return {
            canonicalSite: s.canonicalSite,
            displayName: s.displayName,
            category: s.category,
            iconType: s.iconType,
            brandColor: s.brandColor,
            currentVisits,
            currentVisitors,
            currentSharePct,
            prevVisits,
            prevVisitors,
            prevSharePct,
            visitorGrowthPct,
            shareShiftPct,
            avgDurationSec,
            bounceRatePct,
            highIntentCount,
            conversionRatePct,
            subdomains,
            timeline,
            isLeader: false,
            isFastestGrowing: false,
        };
    });

    // Rank sources by unique visitors, then visits
    trafficSourcesList.sort((a, b) => b.currentVisitors - a.currentVisitors || b.currentVisits - a.currentVisits);

    // Identify #1 Market Leader
    if (trafficSourcesList.length > 0 && trafficSourcesList[0].currentVisitors > 0) {
        trafficSourcesList[0].isLeader = true;
    }

    // Identify Fastest Growing source with at least 2 visitors
    let fastestClimber = null;
    let maxGrowth = 0;
    for (const s of trafficSourcesList) {
        if (s.currentVisitors >= 2 && s.visitorGrowthPct > maxGrowth) {
            maxGrowth = s.visitorGrowthPct;
            fastestClimber = s;
        }
    }
    if (fastestClimber) {
        fastestClimber.isFastestGrowing = true;
    }

    // Top referrers (backwards compatibility for legacy components)
    const topReferrers = trafficSourcesList
        .slice(0, 8)
        .map(s => ({ source: s.canonicalSite, visits: s.currentVisits }));

    const recentActivity = recentPageViewFeed.map((row) => ({
        path: row.path,
        createdAt: row.createdAt.toISOString(),
        device: row.device,
        duration: row.duration,
        referrerHost: row.referrerHost,
        referrerSnippet: row.referrer ? row.referrer.slice(0, 80) : null,
        utmSource: row.utmSource,
        utmMedium: row.utmMedium,
        utmCampaign: row.utmCampaign,
    }));

    const uniqueVisitorsThisMonth = new Set(recentPageViews.map(p => p.sessionId)).size;
    const uniqueVisitorsPrev = new Set(prevPageViews.map(p => p.sessionId)).size;
    const visitorTrend = uniqueVisitorsPrev > 0
        ? Math.round(((uniqueVisitorsThisMonth - uniqueVisitorsPrev) / uniqueVisitorsPrev) * 100)
        : 100;

    return NextResponse.json({
        meta: {
            range: rangeParam,
            rangeDays,
            periodStart: periodStart.toISOString(),
            periodEnd: periodEnd.toISOString(),
            prevPeriodStart: prevPeriodStart.toISOString(),
            prevPeriodEnd: prevPeriodEnd.toISOString(),
            serverTime: now.toISOString(),
            bucketResolution,
            timeBuckets: bucketKeys,
        },
        overview: {
            totalBookings: allBookings.length,
            bookingsThisMonth: recentBookings.length,
            periodChange,
            totalRevenue: Math.round(revenueEstimate),
            revenueThisMonth: Math.round(revenueThisMonth),
            totalCustomers: allUsers.length,
            newCustomersThisMonth: recentUsers.length,
            cancellationRate,
            conversionRate,
            avgConfirmHours,
        },
        statusCounts,
        guestVsMember: { guest: guestBookings, member: memberBookings },
        bookingsByDay,
        byDayOfWeek,
        byHour,
        topServices,
        loyalty: {
            totalCards: loyaltyStats._count,
            totalStamps: stampCount,
            lifetimeStamps: loyaltyStats._sum.lifetimeStamps || 0,
            spinsRedeemed: loyaltyStats._sum.spinsRedeemed || 0,
            referralRewards: loyaltyStats._sum.referralRewards || 0,
        },
        referrals: {
            total: referralStats.length,
            converted: referralStats.filter(r => r.bookingId).length,
            rewarded: referralStats.filter(r => r.rewardGiven).length,
        },
        reviews: {
            total: allReviews.length,
            avgRating,
            ratingDist,
            bySource: reviewsBySource,
        },
        weeklyGrowth,
        trafficSources: {
            totalTrafficVisitors: totalMarketingVisitors,
            prevTotalTrafficVisitors: prevTotalMarketingVisitors,
            bucketResolution,
            timeBuckets: bucketKeys,
            sources: trafficSourcesList,
        },
        website: {
            totalPageViews: allTimePageViews,
            pageViewsThisMonth: recentPageViews.length,
            uniqueVisitorsThisMonth,
            visitorTrend,
            avgDuration,
            bounceRate,
            pagesPerSession,
            topPages,
            deviceCounts,
            topReferrers,
            pvByDay,
            firstRecordedViewAt: pageViewBounds._min.createdAt?.toISOString() ?? null,
            lastRecordedViewAt: pageViewBounds._max.createdAt?.toISOString() ?? null,
            recentActivity,
        },
    });
}
