import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/adminAuth';
import { setAgentTyping, clearAgentTyping } from '@/lib/typingState';

// POST: Agent is typing — ping this while typing (debounced from admin UI)
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const admin = await isAdminRequest(req);
        if (!admin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const { agentName } = await req.json();

        setAgentTyping(id, agentName || 'Team Member');

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error('[admin/chats/typing] POST error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// DELETE: Agent stopped typing / sent message
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const admin = await isAdminRequest(req);
        if (!admin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        clearAgentTyping(id);

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error('[admin/chats/typing] DELETE error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
