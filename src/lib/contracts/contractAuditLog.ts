import { prisma } from '@/lib/prisma';

export async function logContractAudit(
    inviteId: string,
    action: string,
    details?: Record<string, unknown> | null,
    actorIp?: string | null
): Promise<void> {
    try {
        await prisma.contractAuditLog.create({
            data: {
                inviteId,
                action,
                details: details === undefined || details === null ? undefined : (details as object),
                actorIp: actorIp ?? undefined,
            },
        });
    } catch (e) {
        console.error('[contract-audit]', action, e);
    }
}
