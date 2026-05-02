import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const healthForm = await prisma.healthForm.findUnique({
        where: { userId: user.id },
        include: {
            logs: {
                orderBy: { createdAt: 'desc' },
                take: 50
            }
        }
    });

    return NextResponse.json({ healthForm });
}

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    try {
        const { data } = await req.json();
        
        if (!data || typeof data !== 'object') {
            return NextResponse.json({ error: 'Invalid data payload' }, { status: 400 });
        }

        // Get request metadata for audit log
        const ipAddress = req.headers.get('x-forwarded-for') || 'Unknown';
        const userAgent = req.headers.get('user-agent') || 'Unknown';

        // Upsert the health form
        const updatedForm = await prisma.$transaction(async (tx) => {
            const form = await tx.healthForm.upsert({
                where: { userId: user.id },
                update: { data },
                create: { userId: user.id, data }
            });

            // Create audit log
            await tx.healthFormLog.create({
                data: {
                    healthFormId: form.id,
                    updatedBy: 'User',
                    ipAddress,
                    userAgent,
                    diff: data // Snapshot of current state
                }
            });

            const fullForm = await tx.healthForm.findUnique({
                where: { id: form.id },
                include: { logs: { orderBy: { createdAt: 'desc' }, take: 50 } }
            });

            return fullForm;
        });

        return NextResponse.json({ success: true, healthForm: updatedForm });
    } catch (error) {
        console.error('Error updating health form:', error);
        return NextResponse.json({ error: 'Failed to update health form' }, { status: 500 });
    }
}
