import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// PATCH /api/tasks/[id] — update status, priority, or add an update note
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await req.json();
        const { status, priority, note } = body;

        // Build update payload
        const data: Record<string, unknown> = {};
        if (status) data.status = status;
        if (priority) data.priority = priority;

        if (Object.keys(data).length > 0) {
            await (prisma as any).task.update({
                where: { id },
                data,
            });
        }

        // Add an update log entry if note provided
        if (note?.trim()) {
            await (prisma as any).taskUpdate.create({
                data: { taskId: id, note: note.trim() },
            });
        }

        // Always return the fresh task
        const freshTask = await (prisma as any).task.findUnique({
            where: { id },
            include: { updates: { orderBy: { createdAt: 'desc' } } },
        });

        return NextResponse.json({ task: freshTask });
    } catch (error) {
        console.error('[tasks PATCH]', error);
        return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
    }
}

// DELETE /api/tasks/[id] — delete a task (updates cascade)
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        await (prisma as any).task.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[tasks DELETE]', error);
        return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
    }
}
