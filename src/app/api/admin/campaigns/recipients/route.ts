import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdminRequest } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
    if (!(await isAdminRequest(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const campaignId = searchParams.get('campaignId');

    // ── Per-campaign recipient list (analytics view) ─────────────────────────
    if (campaignId) {
        const recipients = await (prisma as any).smsCampaignRecipient.findMany({
            where: { campaignId },
            orderBy: { createdAt: 'asc' },
        });
        return NextResponse.json({ recipients });
    }

    // ── Audience picker — all contacts with a phone number ───────────────────
    // Registered users
    const users = await (prisma as any).user.findMany({
        where: { phone: { not: null } },
        select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            bookings: {
                select: { consents: { select: { consentType: true, granted: true } } },
            },
        },
        orderBy: { name: 'asc' },
    });

    // Guest bookings with phone
    const guestBookings = await (prisma as any).booking.findMany({
        where: {
            userId: null,
            guestPhone: { not: null },
            guestName: { not: null },
        },
        select: {
            id: true,
            guestName: true,
            guestEmail: true,
            guestPhone: true,
            consents: { select: { consentType: true, granted: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 300,
    });

    // Build registered user entries
    const registeredContacts = users.map((u: any) => {
        const allConsents = u.bookings.flatMap((b: any) => b.consents);
        const hasSmsConsent = allConsents.some(
            (c: any) => c.consentType === 'promo_sms' && c.granted,
        );
        return {
            id: u.id,
            name: u.name,
            email: u.email,
            phone: u.phone,
            hasConsent: hasSmsConsent,
            isGuest: false,
        };
    });

    // Deduplicate guests by phone; skip if phone already in registered set
    const registeredPhones = new Set(registeredContacts.map((c: any) => c.phone));
    const guestMap = new Map<string, any>();
    for (const b of guestBookings) {
        const phone = b.guestPhone;
        if (!phone || registeredPhones.has(phone)) continue;
        const hasSmsConsent = b.consents.some(
            (c: any) => c.consentType === 'promo_sms' && c.granted,
        );
        if (!guestMap.has(phone)) {
            guestMap.set(phone, {
                id: `guest-${phone}`,
                name: b.guestName || 'Guest',
                email: b.guestEmail || null,
                phone,
                hasConsent: hasSmsConsent,
                isGuest: true,
            });
        } else if (hasSmsConsent) {
            guestMap.get(phone)!.hasConsent = true;
        }
    }

    const contacts = [...registeredContacts, ...Array.from(guestMap.values())];

    const consentedCount = contacts.filter((c: any) => c.hasConsent).length;
    const totalWithPhone = contacts.length;

    return NextResponse.json({ contacts, consentedCount, totalWithPhone });
}
