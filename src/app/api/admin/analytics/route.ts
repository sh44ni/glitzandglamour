import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminCookie } from '@/app/api/admin/auth/route';

export async function GET(request: NextRequest) {
    if (!await verifyAdminCookie(request)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const rawRange = parseInt(request.nextUrl.searchParams.get('range') || '30', 10);
    const rangeDays = Number.isFinite(rawRange) ? Math.min(366, Math.max(1, rawRange)) : 30;

    const now = new Date();
    const periodStart = new Date(now);
    periodStart.setDate(periodStart.getDate() - rangeDays);
    const prevPeriodStart = new Date(now);
    prevPeriodStart.setDate(prevPeriodStart.getDate() - 2 * rangeDays);

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
            where: { createdAt: { gte: periodStart } },
            include: { service: { select: { name: true, priceFrom: true } } },
            orderBy: { createdAt: 'asc' },
        }),
        prisma.booking.findMany({
            where: { createdAt: { gte: prevPeriodStart, lt: periodStart } },
        }),
        prisma.user.findMany({ select: { createdAt: true } }),
        prisma.user.findMany({
            where: { createdAt: { gte: periodStart } },
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
            where: { createdAt: { gte: periodStart } },
            select: { path: true, sessionId: true, referrer: true, device: true, duration: true, createdAt: true },
        }),
        prisma.pageView.findMany({
            where: { createdAt: { gte: prevPeriodStart, lt: periodStart } },
            select: { sessionId: true },
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

    // ── Booking volume by day (selected range) ──
    const bookingsByDay: Record<string, number> = {};
    for (let i = rangeDays - 1; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(now.getDate() - i);
        bookingsByDay[d.toISOString().split('T')[0]] = 0;
    }
    for (const b of recentBookings) {
        const day = b.createdAt.toISOString().split('T')[0];
        if (bookingsByDay[day] !== undefined) bookingsByDay[day]++;
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

    // ── Avg time to confirm (PENDING → CONFIRMED) — approx via updatedAt ──
    const confirmedBookings = allBookings.filter(b => b.status === 'CONFIRMED' || b.status === 'COMPLETED');
    const avgConfirmHours = confirmedBookings.length > 0
        ? Math.round(
            confirmedBookings.reduce((sum, b) => {
                const diffMs = new Date(b.updatedAt).getTime() - new Date(b.createdAt).getTime();
                return sum + diffMs / 3600000;
            }, 0) / confirmedBookings.length
          )
        : 0;

    // ── Top services by bookings ──
    const topServices = allServices.slice(0, 6).map(s => ({
        name: s.name,
        bookings: s._count.bookings,
        priceFrom: s.priceFrom,
    }));

    // ── Revenue estimate (completed bookings × service price) ──
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

    // ── Customer growth (new users per week, last 8 weeks) ──
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

    // ── Period comparison ──
    const periodChange = prevPeriodBookings.length > 0
        ? Math.round(((recentBookings.length - prevPeriodBookings.length) / prevPeriodBookings.length) * 100)
        : 100;

    // ── Website analytics ──
    const uniqueVisitorsThisMonth = new Set(recentPageViews.map(p => p.sessionId)).size;
    const uniqueVisitorsPrev = new Set(prevPageViews.map(p => p.sessionId)).size;
    const visitorTrend = uniqueVisitorsPrev > 0
        ? Math.round(((uniqueVisitorsThisMonth - uniqueVisitorsPrev) / uniqueVisitorsPrev) * 100)
        : 100;

    const pvByDay: Record<string, number> = {};
    for (let i = rangeDays - 1; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(now.getDate() - i);
        pvByDay[d.toISOString().split('T')[0]] = 0;
    }
    for (const p of recentPageViews) {
        const day = p.createdAt.toISOString().split('T')[0];
        if (pvByDay[day] !== undefined) pvByDay[day]++;
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

    // Avg time on page (seconds) — only views with duration
    const withDuration = recentPageViews.filter(p => p.duration && p.duration > 0);
    const avgDuration = withDuration.length > 0
        ? Math.round(withDuration.reduce((s, p) => s + (p.duration || 0), 0) / withDuration.length)
        : 0;

    // Bounce rate — sessions with only 1 page view
    const sessionPageCounts: Record<string, number> = {};
    for (const p of recentPageViews) {
        sessionPageCounts[p.sessionId] = (sessionPageCounts[p.sessionId] || 0) + 1;
    }
    const totalSessions = Object.keys(sessionPageCounts).length;
    const bouncedSessions = Object.values(sessionPageCounts).filter(c => c === 1).length;
    const bounceRate = totalSessions > 0 ? Math.round((bouncedSessions / totalSessions) * 100) : 0;

    // Pages per session avg
    const pagesPerSession = totalSessions > 0
        ? Math.round((recentPageViews.length / totalSessions) * 10) / 10
        : 0;

    // Top referrers
    const referrerCounts: Record<string, number> = {};
    for (const p of recentPageViews) {
        if (!p.referrer) continue;
        try {
            const host = new URL(p.referrer).hostname.replace('www.', '');
            if (host && host !== 'glitzandglamours.com') {
                referrerCounts[host] = (referrerCounts[host] || 0) + 1;
            }
        } catch { /* invalid URL */ }
    }
    const topReferrers = Object.entries(referrerCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([source, visits]) => ({ source, visits }));

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

    return NextResponse.json({
        meta: {
            rangeDays,
            periodStart: periodStart.toISOString(),
            periodEnd: now.toISOString(),
            serverTime: now.toISOString(),
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
