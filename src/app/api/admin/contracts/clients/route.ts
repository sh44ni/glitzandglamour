import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/adminAuth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/admin/contracts/clients?q=searchTerm
 * Returns special-event clients with their linked contracts.
 */
export async function GET(req: NextRequest) {
    if (!(await isAdminRequest(req))) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const q = req.nextUrl.searchParams.get('q')?.trim() || '';

    const where = q
        ? {
              OR: [
                  { name: { contains: q, mode: 'insensitive' as const } },
                  { email: { contains: q, mode: 'insensitive' as const } },
                  { phone: { contains: q, mode: 'insensitive' as const } },
              ],
          }
        : {};

    const clients = await prisma.specialEventClient.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: 100,
        include: {
            contracts: {
                include: {
                    // We don't have a Prisma relation to ContractSigningInvite from the join table,
                    // so we'll manually fetch invite details below.
                },
                orderBy: { createdAt: 'desc' },
            },
        },
    });

    // Fetch invite details for all contract links in one query
    const allInviteIds = clients.flatMap((c) => c.contracts.map((cc) => cc.inviteId));
    const invites = allInviteIds.length
        ? await prisma.contractSigningInvite.findMany({
              where: { id: { in: allInviteIds } },
              select: {
                  id: true,
                  label: true,
                  contractVersion: true,
                  lifecycleStatus: true,
                  pdfKey: true,
                  adminPayload: true,
                  clientPayload: true,
                  adminFinalizePayload: true,
                  clientSignedAt: true,
                  adminSignedAt: true,
                  sentAt: true,
                  createdAt: true,
                  submittedIp: true,
                  submittedUa: true,
              },
          })
        : [];

    const inviteMap = new Map(invites.map((i) => [i.id, i]));

    const result = clients.map((c) => ({
        id: c.id,
        name: c.name,
        email: c.email,
        phone: c.phone,
        linkedUserId: c.linkedUserId,
        notes: c.notes,
        createdAt: c.createdAt.toISOString(),
        contracts: c.contracts.map((cc) => {
            const inv = inviteMap.get(cc.inviteId);
            const ap = inv?.adminPayload as Record<string, unknown> | null;
            const cp = inv?.clientPayload as Record<string, unknown> | null;
            const fp = inv?.adminFinalizePayload as Record<string, unknown> | null;
            return {
                linkId: cc.id,
                inviteId: cc.inviteId,
                label: inv?.label || null,
                contractNumber: (ap?.contractNumber as string) || null,
                contractType: (ap?.contractType as string) || null,
                lifecycleStatus: inv?.lifecycleStatus || null,
                pdfKey: inv?.pdfKey || null,
                clientSignedAt: inv?.clientSignedAt?.toISOString() || null,
                adminSignedAt: inv?.adminSignedAt?.toISOString() || null,
                sentAt: inv?.sentAt?.toISOString() || null,
                createdAt: inv?.createdAt?.toISOString() || cc.createdAt.toISOString(),
                // Execution record
                execution: ap ? {
                    eventType: ap.eventType || null,
                    eventDate: ap.eventDate || null,
                    startTime: ap.startTime || null,
                    venue: ap.venue || null,
                    headcount: ap.headcount || null,
                    services: Array.isArray(ap.services) ? ap.services : [],
                    retainer: ap.retainer || null,
                    balance: ap.balance || null,
                    travelEnabled: ap.travelEnabled || false,
                    travelFee: ap.travelFee || null,
                    travelDest: ap.travelDest || null,
                    ppActive: ap.ppActive || null,
                    minors: ap.minors || null,
                    guardian: ap.guardian || null,
                    // Client disclosures
                    allergySelect: cp?.allergySelect || null,
                    allergyDetail: cp?.allergyDetail || null,
                    skinSelect: cp?.skinSelect || null,
                    skinDetail: cp?.skinDetail || null,
                    photoValue: cp?.photoValue || null,
                    photoRestrict: cp?.photoRestrict || null,
                    clientPrintedName: cp?.printedName || null,
                    clientSignDate: cp?.clientSignDateDisplay || null,
                    signatureMethod: cp?.signatureMethod || null,
                    // Admin finalize
                    adminPrintedName: fp?.adminPrintedName || null,
                    adminSignDate: fp?.adminSignDateDisplay || null,
                    retainerReceived: fp?.retainerReceived || false,
                    // Audit / execution metadata
                    clientIp: inv?.submittedIp || null,
                    clientUserAgent: inv?.submittedUa || null,
                    clientSignedAt: inv?.clientSignedAt?.toISOString() || null,
                    adminSignedAt: inv?.adminSignedAt?.toISOString() || null,
                } : null,
            };
        }),
    }));

    return NextResponse.json({ ok: true, clients: result });
}
