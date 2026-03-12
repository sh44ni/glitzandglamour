import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminCookie } from '@/app/api/admin/auth/route';

export async function GET(request: NextRequest) {
    if (!await verifyAdminCookie(request)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();
    const thirtyDaysAgo = new Date(now); thirtyDaysAgo.setDate(now.getDate() - 30);
    const sixtyDaysAgo = new Date(now); sixtyDaysAgo.setDate(now.getDate() - 60);
    const sevenDaysAgo = new Date(now); sevenDaysAgo.setDate(now.getDate() - 7);

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
    ] = await Promise.all([
        // All bookings ever
        prisma.booking.findMany({
            include: { service: { select: { name: true, priceFrom: true } } },
            orderBy: { createdAt: 'asc' },
        }),
        // Last 30 days bookings
        prisma.booking.findMany({
            where: { createdAt: { gte: thirtyDaysAgo } },
            include: { service: { select: { name: true, priceFrom: true } } },
            orderBy: { createdAt: 'asc' },
        }),
        // Previous 30 days (for comparison)
        prisma.booking.findMany({
            where: { createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } },
        }),
        // All users
        prisma.user.findMany({ select: { createdAt: true } }),
        // Last 30 days new users
        prisma.user.findMany({
            where: { createdAt: { gte: thirtyDaysAgo } },
            select: { createdAt: true },
        }),
        // All reviews
        prisma.review.findMany({ select: { rating: true, source: true, createdAt: true } }),
        // Loyalty card aggregate
        prisma.loyaltyCard.aggregate({
            _count: true,
            _sum: { lifetimeStamps: true, spinsRedeemed: true, referralRewards: true },
            where: {},
        }),
        // Total stamps issued
        prisma.stamp.count(),
        // Referral stats
        prisma.referral.findMany({ select: { rewardGiven: true, bookingId: true } }),
        // Services with booking counts
        prisma.service.findMany({
            where: { isActive: true },
            include: { _count: { select: { bookings: true } } },
            orderBy: { bookings: { _count: 'desc' } },
        }),
    ]);

    // ── Booking volume by day (last 30 days) ──
    const bookingsByDay: Record<string, number> = {};
    for (let i = 29; i >= 0; i--) {
        const d = new Date(now); d.setDate(now.getDate() - i);
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

    return NextResponse.json({
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
    });
}
