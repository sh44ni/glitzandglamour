import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdminRequest } from '@/lib/adminAuth';
import { updateGoogleWalletPass } from '@/lib/wallet';
import { pushAppleWalletUpdate } from '@/lib/applePush';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
    if (!(await isAdminRequest(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const qRaw = searchParams.get('q') || '';
    const q = qRaw.trim();
    const filter = searchParams.get('filter') || ''; // sms_leads | photo_consent | se_clients

    // ── Consent-based filters are applied post-query to also capture guest bookings ──
    // SE clients filter is handled post-query (same as before)

    const where: any = {};
    if (q.length > 0) {
        where.OR = [
            { name: { contains: q, mode: 'insensitive' } },
            { email: { contains: q, mode: 'insensitive' } },
            { phone: { contains: q, mode: 'insensitive' } },
        ];
    }

    const customers = await (prisma as any).user.findMany({
        where: Object.keys(where).length > 0 ? where : undefined,
        select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            image: true,
            dateOfBirth: true,
            createdAt: true,
            googleId: true,
            appleId: true,
            password: true,
            loyaltyCard: {
                include: { stamps: { orderBy: { earnedAt: 'desc' } } },
            },
            bookings: {
                include: {
                    service: { select: { name: true } },
                    consents: { orderBy: { createdAt: 'asc' } },
                },
                orderBy: { createdAt: 'desc' },
                take: 50,
            },
            notes: { orderBy: { createdAt: 'desc' } },
            _count: { select: { bookings: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: q.length > 0 ? 50 : 200,
    });

    // Attach referral stats to each customer's loyalty card
    const customersWithReferrals = await Promise.all(
        customers.map(async (c: any) => {
            if (!c.loyaltyCard) return c;
            const referrals = await (prisma as any).referral.findMany({
                where: { referrerId: c.loyaltyCard.id },
            });
            return {
                ...c,
                loyaltyCard: {
                    ...c.loyaltyCard,
                    referralStats: {
                        totalReferrals: referrals.length,
                        pendingRewards: referrals.filter((r: any) => !r.rewardGiven).length,
                        completedReferrals: referrals.filter((r: any) => r.rewardGiven).length,
                    },
                },
            };
        })
    );

    // ── Check which customers are also special event clients ─────────────
    const customerIds = customers.map((c: any) => c.id);
    const customerEmails = customers.map((c: any) => c.email).filter(Boolean);

    // Linked via userId on SpecialEventClient
    const seLinks = customerIds.length
        ? await prisma.specialEventClient.findMany({
              where: { linkedUserId: { in: customerIds } },
              select: { linkedUserId: true },
          })
        : [];
    const seLinkedUserIds = new Set(seLinks.map((l) => l.linkedUserId));

    // Also match SE clients by email/phone (may not have linkedUserId yet)
    const seByEmail = customerEmails.length
        ? await prisma.specialEventClient.findMany({
              where: { email: { in: customerEmails } },
              select: { email: true },
          })
        : [];
    const seEmailSet = new Set(seByEmail.map((s) => s.email?.toLowerCase()));

    // ── Compute consent flags by checking BOTH user-linked and guest bookings ──
    // 1. Consents from bookings linked to userId
    // 2. Consents from guest bookings where guestEmail matches user's email
    const smsConsentFromLinked = await (prisma as any).bookingConsent.findMany({
        where: { consentType: 'promo_sms', granted: true, booking: { userId: { in: customerIds } } },
        select: { booking: { select: { userId: true } } },
    });
    const smsUserIds = new Set(smsConsentFromLinked.map((c: any) => c.booking.userId));

    const smsConsentFromGuest = customerEmails.length
        ? await (prisma as any).bookingConsent.findMany({
              where: { consentType: 'promo_sms', granted: true, booking: { userId: null, guestEmail: { in: customerEmails } } },
              select: { booking: { select: { guestEmail: true } } },
          })
        : [];
    const smsGuestEmails = new Set(smsConsentFromGuest.map((c: any) => c.booking.guestEmail?.toLowerCase()));

    const photoConsentFromLinked = await (prisma as any).bookingConsent.findMany({
        where: { consentType: 'image_usage', granted: true, booking: { userId: { in: customerIds } } },
        select: { booking: { select: { userId: true } } },
    });
    const photoUserIds = new Set(photoConsentFromLinked.map((c: any) => c.booking.userId));

    const photoConsentFromGuest = customerEmails.length
        ? await (prisma as any).bookingConsent.findMany({
              where: { consentType: 'image_usage', granted: true, booking: { userId: null, guestEmail: { in: customerEmails } } },
              select: { booking: { select: { guestEmail: true } } },
          })
        : [];
    const photoGuestEmails = new Set(photoConsentFromGuest.map((c: any) => c.booking.guestEmail?.toLowerCase()));

    const finalCustomers = customersWithReferrals.map((c: any) => {
        const emailLower = c.email?.toLowerCase();
        return {
            ...c,
            isSpecialEventClient: seLinkedUserIds.has(c.id) || seEmailSet.has(emailLower),
            hasSmsConsent: smsUserIds.has(c.id) || smsGuestEmails.has(emailLower),
            hasPhotoConsent: photoUserIds.has(c.id) || photoGuestEmails.has(emailLower),
        };
    });

    // ── Build virtual guest entries for consents from unregistered users ──
    // Find all guest bookings with SMS or photo consent where guestEmail does NOT
    // match any registered user — these are true unlinked guests.
    const registeredEmailSet = new Set(customerEmails.map((e: string) => e.toLowerCase()));

    const guestConsentBookings = await (prisma as any).bookingConsent.findMany({
        where: {
            granted: true,
            consentType: { in: ['promo_sms', 'image_usage'] },
            booking: {
                userId: null,
                guestEmail: { not: null },
            },
        },
        select: {
            consentType: true,
            createdAt: true,
            booking: {
                select: { guestName: true, guestEmail: true, guestPhone: true, preferredDate: true },
            },
        },
    });

    // Deduplicate by guestEmail and aggregate which consents they have
    const guestMap = new Map<string, any>();
    for (const gc of guestConsentBookings) {
        const email = gc.booking.guestEmail?.toLowerCase();
        if (!email || registeredEmailSet.has(email)) continue; // skip if registered user
        if (!guestMap.has(email)) {
            guestMap.set(email, {
                id: `guest-${email}`,
                name: gc.booking.guestName || 'Guest',
                email: gc.booking.guestEmail,
                phone: gc.booking.guestPhone || null,
                createdAt: gc.createdAt,
                image: null,
                dateOfBirth: null,
                googleId: null,
                appleId: null,
                password: null,
                loyaltyCard: null,
                bookings: [],
                notes: [],
                _count: { bookings: 0 },
                isGuest: true,
                isSpecialEventClient: false,
                hasSmsConsent: false,
                hasPhotoConsent: false,
            });
        }
        const entry = guestMap.get(email)!;
        if (gc.consentType === 'promo_sms') entry.hasSmsConsent = true;
        if (gc.consentType === 'image_usage') entry.hasPhotoConsent = true;
    }
    const guestEntries = Array.from(guestMap.values());

    // Post-filter for consent / SE tabs
    let result: any[] = finalCustomers;
    if (filter === 'se_clients') {
        result = finalCustomers.filter((c: any) => c.isSpecialEventClient);
    } else if (filter === 'sms_leads') {
        const registeredSms = finalCustomers.filter((c: any) => c.hasSmsConsent);
        const guestSms = guestEntries.filter((g: any) => g.hasSmsConsent);
        result = [...registeredSms, ...guestSms];
    } else if (filter === 'photo_consent') {
        const registeredPhoto = finalCustomers.filter((c: any) => c.hasPhotoConsent);
        const guestPhoto = guestEntries.filter((g: any) => g.hasPhotoConsent);
        result = [...registeredPhoto, ...guestPhoto];
    }

    // ── Segment counts (for tab badges) ──────────────────────────────────
    let counts: { smsLeads: number; photoConsent: number; seClients: number } | undefined;
    if (!filter && !q) {
        counts = {
            smsLeads: finalCustomers.filter((c: any) => c.hasSmsConsent).length + guestEntries.filter((g: any) => g.hasSmsConsent).length,
            photoConsent: finalCustomers.filter((c: any) => c.hasPhotoConsent).length + guestEntries.filter((g: any) => g.hasPhotoConsent).length,
            seClients: finalCustomers.filter((c: any) => c.isSpecialEventClient).length,
        };
    }

    return NextResponse.json({ customers: result, counts });
}

export async function POST(req: NextRequest) {
    if (!(await isAdminRequest(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { customerId, action, note } = body;

    // ── set-dob ─────────────────────────────────────────────────────
    if (action === 'set-dob') {
        const { dob } = body;
        if (!dob) return NextResponse.json({ error: 'Date of birth is required' }, { status: 400 });
        await (prisma as any).user.update({
            where: { id: customerId },
            data: { dateOfBirth: new Date(dob) },
        });
        return NextResponse.json({ success: true });
    }

    // ── Note actions (no loyaltyCard needed) ──────────────────────
    if (action === 'add-note') {
        const { noteText, imageUrl } = body;
        if (!noteText?.trim()) return NextResponse.json({ error: 'Note text is required' }, { status: 400 });
        const created = await (prisma as any).customerNote.create({
            data: { userId: customerId, text: noteText.trim(), imageUrl: imageUrl || null },
        });
        return NextResponse.json({ success: true, note: created });
    }

    if (action === 'delete-note') {
        const { noteId } = body;
        if (!noteId) return NextResponse.json({ error: 'Note ID is required' }, { status: 400 });
        await (prisma as any).customerNote.delete({ where: { id: noteId } });
        return NextResponse.json({ success: true });
    }

    const user = await prisma.user.findUnique({ where: { id: customerId } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    let loyaltyCard = await prisma.loyaltyCard.findUnique({ where: { userId: customerId } });
    if (!loyaltyCard) {
        loyaltyCard = await prisma.loyaltyCard.create({ data: { userId: customerId } });
    }

    if (action === 'add-stamp') {
        const newStampCount = loyaltyCard.currentStamps + 1;
        const spinAvailable = newStampCount >= 10;
        const finalStamps = newStampCount % 10;

        await prisma.loyaltyCard.update({
            where: { id: loyaltyCard.id },
            data: {
                currentStamps: finalStamps,
                lifetimeStamps: loyaltyCard.lifetimeStamps + 1,
                spinAvailable: spinAvailable || loyaltyCard.spinAvailable,
            },
        });

        await prisma.stamp.create({
            data: { loyaltyCardId: loyaltyCard.id, note: note || 'Manual stamp by admin' },
        });

        updateGoogleWalletPass(loyaltyCard.id, finalStamps).catch(console.error);
        pushAppleWalletUpdate(loyaltyCard.id).catch(console.error);

        return NextResponse.json({ success: true, message: 'Stamp added' });
    }

    if (action === 'redeem-spin') {
        if (!loyaltyCard.spinAvailable) {
            return NextResponse.json({ error: 'No nail set reward available' }, { status: 400 });
        }

        await prisma.loyaltyCard.update({
            where: { id: loyaltyCard.id },
            data: {
                spinAvailable: false,
                spinsRedeemed: loyaltyCard.spinsRedeemed + 1,
            },
        });

        updateGoogleWalletPass(loyaltyCard.id, loyaltyCard.currentStamps).catch(console.error);

        return NextResponse.json({ success: true, message: 'Free reward redeemed' });
    }

    if (action === 'redeem-birthday-spin') {
        const hasSpin = (loyaltyCard as any).birthdaySpinAvailable;
        if (!hasSpin) {
            return NextResponse.json({ error: 'No birthday spin available' }, { status: 400 });
        }
        await (prisma as any).loyaltyCard.update({
            where: { id: loyaltyCard.id },
            data: { birthdaySpinAvailable: false },
        });
        return NextResponse.json({ success: true, message: 'Birthday spin redeemed' });
    }

    // ── Insider toggle ─────────────────────────────────────────────
    if (action === 'grant-insider' || action === 'revoke-insider') {
        const isInsider = action === 'grant-insider';

        let referralCode = (loyaltyCard as any).referralCode;

        if (isInsider && !referralCode) {
            const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
            let code = 'GLAM-';
            for (let i = 0; i < 6; i++) {
                code += chars[Math.floor(Math.random() * chars.length)];
            }
            referralCode = code;
        }

        await (prisma as any).loyaltyCard.update({
            where: { id: loyaltyCard.id },
            data: { isInsider, ...(isInsider ? { referralCode } : {}) },
        });

        return NextResponse.json({
            success: true,
            message: isInsider ? 'Insider status granted' : 'Insider status revoked',
            referralCode: isInsider ? referralCode : null,
        });
    }

    if (action === 'redeem-reward') {
        const currentRewards = (loyaltyCard as any).referralRewards ?? 0;
        if (currentRewards <= 0) {
            return NextResponse.json({ error: 'No rewards to redeem' }, { status: 400 });
        }
        await (prisma as any).loyaltyCard.update({
            where: { id: loyaltyCard.id },
            data: { referralRewards: currentRewards - 1 },
        });
        return NextResponse.json({ success: true, message: 'Reward redeemed' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}

export async function DELETE(req: NextRequest) {
    if (!(await isAdminRequest(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { searchParams } = new URL(req.url);
        const customerId = searchParams.get('id');

        if (!customerId) {
            return NextResponse.json({ error: 'Customer ID is required' }, { status: 400 });
        }

        const user = await prisma.user.findUnique({ where: { id: customerId } });
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        await prisma.$transaction(async (tx) => {
            await tx.review.deleteMany({ where: { userId: customerId } });

            const bookings = await tx.booking.findMany({ where: { userId: customerId }, select: { id: true } });
            const bookingIds = bookings.map(b => b.id);
            if (bookingIds.length > 0) {
                await tx.notificationLog.deleteMany({ where: { bookingId: { in: bookingIds } } });
            }

            await tx.booking.deleteMany({ where: { userId: customerId } });

            const card = await tx.loyaltyCard.findUnique({ where: { userId: customerId }, select: { id: true } });
            if (card) {
                await tx.stamp.deleteMany({ where: { loyaltyCardId: card.id } });
                await (tx as any).referral.deleteMany({ where: { referrerId: card.id } });
                await tx.loyaltyCard.delete({ where: { id: card.id } });
            }
            // Cascade delete customer notes
            await (tx as any).customerNote.deleteMany({ where: { userId: customerId } });
            await (tx as any).user.updateMany({ where: { referredById: customerId }, data: { referredById: null } });
            await tx.user.delete({ where: { id: customerId } });
        });

        return NextResponse.json({ success: true, message: 'Customer deleted successfully' });
    } catch (error) {
        console.error('Error deleting customer:', error);
        return NextResponse.json({ error: 'Failed to delete customer' }, { status: 500 });
    }
}
