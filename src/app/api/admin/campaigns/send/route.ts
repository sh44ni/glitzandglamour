import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdminRequest } from '@/lib/adminAuth';
import { buildPingram } from '@/lib/pingramClient';

export const dynamic = 'force-dynamic';

// Small delay between sends to be respectful to the API
const SEND_DELAY_MS = 300;

function sleep(ms: number) {
    return new Promise((r) => setTimeout(r, ms));
}

export async function POST(req: NextRequest) {
    if (!(await isAdminRequest(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { campaignId } = await req.json();
    if (!campaignId) return NextResponse.json({ error: 'campaignId required' }, { status: 400 });

    const campaign = await (prisma as any).smsCampaign.findUnique({
        where: { id: campaignId },
        include: {
            recipients: {
                where: { status: 'pending' },
                orderBy: { createdAt: 'asc' },
            },
        },
    });

    if (!campaign) return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    if (campaign.status === 'SENDING') return NextResponse.json({ error: 'Campaign is already sending' }, { status: 409 });
    if (campaign.status === 'COMPLETED') return NextResponse.json({ error: 'Campaign already completed' }, { status: 409 });

    // Mark as SENDING
    await (prisma as any).smsCampaign.update({
        where: { id: campaignId },
        data: { status: 'SENDING', sentAt: new Date() },
    });

    const pingram = await buildPingram();
    let sentCount = campaign.sentCount;
    let failedCount = campaign.failedCount;

    for (const recipient of campaign.recipients) {
        try {
            if (pingram) {
                const response = await pingram.send({
                    type: 'campaign_sms',
                    to: { id: recipient.phone, number: recipient.phone },
                    sms: { message: campaign.message },
                }) as { trackingId?: string } | undefined;

                await (prisma as any).smsCampaignRecipient.update({
                    where: { id: recipient.id },
                    data: {
                        status: 'sent',
                        sentAt: new Date(),
                        error: null,
                    },
                });
                sentCount++;
            } else {
                // No API key — mark as failed
                await (prisma as any).smsCampaignRecipient.update({
                    where: { id: recipient.id },
                    data: { status: 'failed', error: 'no_api_key' },
                });
                failedCount++;
            }
        } catch (err: any) {
            const errMsg = err?.message || 'unknown_error';
            await (prisma as any).smsCampaignRecipient.update({
                where: { id: recipient.id },
                data: { status: 'failed', error: errMsg.slice(0, 200) },
            });
            failedCount++;
        }

        // Update running counters every recipient
        await (prisma as any).smsCampaign.update({
            where: { id: campaignId },
            data: { sentCount, failedCount },
        });

        if (SEND_DELAY_MS > 0) await sleep(SEND_DELAY_MS);
    }

    const finalStatus = failedCount === campaign.totalRecipients ? 'FAILED' : 'COMPLETED';

    await (prisma as any).smsCampaign.update({
        where: { id: campaignId },
        data: {
            status: finalStatus,
            completedAt: new Date(),
            sentCount,
            failedCount,
        },
    });

    return NextResponse.json({
        success: true,
        status: finalStatus,
        sentCount,
        failedCount,
        total: campaign.totalRecipients,
    });
}
