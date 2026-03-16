import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET /api/tasks — fetch all tasks with their update logs
export async function GET() {
    try {
        const tasks = await (prisma as any).task.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                updates: { orderBy: { createdAt: 'desc' } },
            },
        });
        return NextResponse.json({ tasks });
    } catch (error) {
        console.error('[tasks GET]', error);
        return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
    }
}

// POST /api/tasks — create a new task
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { title, description, priority } = body;
        if (!title?.trim()) {
            return NextResponse.json({ error: 'Title is required' }, { status: 400 });
        }
        const task = await (prisma as any).task.create({
            data: {
                title: title.trim(),
                description: description?.trim() || null,
                priority: priority || 'MEDIUM',
                status: 'TODO',
            },
            include: { updates: true },
        });
        return NextResponse.json({ task });
    } catch (error) {
        console.error('[tasks POST]', error);
        return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
    }
}
