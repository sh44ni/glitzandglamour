import { prisma } from '@/lib/prisma';
import type { AdminContractPayload } from '@/lib/contracts/adminContractPayload';
import { logContractAudit } from '@/lib/contracts/contractAuditLog';
import { emailAdminContractSent, emailContractInviteToClient } from '@/lib/contracts/contractEmails';

/** Persist SENT state and client hints from the admin payload. */
export async function markSpecialInviteSent(opts: { inviteId: string; admin: AdminContractPayload }): Promise<void> {
    await prisma.contractSigningInvite.update({
        where: { id: opts.inviteId },
        data: {
            lifecycleStatus: 'SENT',
            sentAt: new Date(),
            clientHintName: opts.admin.clientLegalName,
            clientHintEmail: opts.admin.email,
        },
    });
}

/** Send branded invite email to client, optional owner copy, and audit log. */
export async function dispatchContractInviteEmails(
    inviteId: string,
    signUrl: string,
    admin: AdminContractPayload
): Promise<{ clientEmailed: boolean }> {
    await logContractAudit(inviteId, 'admin_sent_to_client', { signUrl }, null);

    const clientEmailed = await emailContractInviteToClient({
        to: admin.email,
        clientName: admin.clientLegalName,
        contractNumber: admin.contractNumber,
        eventDateLabel: admin.eventDate || '—',
        signUrl,
    });

    const owner = process.env.OWNER_NOTIFICATION_ID;
    if (owner) {
        await emailAdminContractSent({
            to: owner,
            contractNumber: admin.contractNumber,
            clientEmail: admin.email,
        });
    }

    return { clientEmailed };
}
