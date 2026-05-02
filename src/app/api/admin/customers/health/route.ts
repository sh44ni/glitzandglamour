import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdminRequest } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    if (!(await isAdminRequest(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
        return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const healthForm = await prisma.healthForm.findUnique({
        where: { userId },
        include: {
            logs: {
                orderBy: { createdAt: 'desc' },
                take: 50 // Show latest 50 logs
            }
        }
    });

    return NextResponse.json({ healthForm });
}

export async function POST(req: NextRequest) {
    if (!(await isAdminRequest(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const body = await req.json();
        const { userId, data } = body;

        if (!userId || !data || typeof data !== 'object') {
            return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
        }

        const ipAddress = req.headers.get('x-forwarded-for') || 'Unknown';
        const userAgent = req.headers.get('user-agent') || 'Unknown';

        const updatedForm = await prisma.$transaction(async (tx) => {
            const form = await tx.healthForm.upsert({
                where: { userId },
                update: { data },
                create: { userId, data }
            });

            // Create audit log
            await tx.healthFormLog.create({
                data: {
                    healthFormId: form.id,
                    updatedBy: 'Admin',
                    ipAddress,
                    userAgent,
                    diff: data // Snapshot of current state
                }
            });

            return await tx.healthForm.findUnique({
                where: { id: form.id },
                include: {
                    logs: {
                        orderBy: { createdAt: 'desc' },
                        take: 50
                    }
                }
            });
        });

        return NextResponse.json({ success: true, healthForm: updatedForm });
    } catch (error) {
        console.error('Error updating health form via admin:', error);
        return NextResponse.json({ error: 'Failed to update health form' }, { status: 500 });
    }
}
