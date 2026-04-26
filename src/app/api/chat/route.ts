import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { rateLimit, getClientIp } from '@/lib/rateLimit';
import { TOOL_DEFINITIONS, executeTool, type BookingCardData } from '@/lib/chatTools';

// ── Quick reply suggestions based on context ────────────────────────
type QuickReply = { label: string; message: string };

function getQuickReplies(
    reply: string,
    hasBookingCard: boolean,
    toolsUsed: Set<string>,
): QuickReply[] {
    const lower = reply.toLowerCase();

    // After booking confirmation
    if (hasBookingCard) {
        return [
            { label: '📞 Contact Studio', message: 'How can I contact the studio?' },
            { label: '💅 Browse Services', message: 'Show me all your services' },
        ];
    }

    // After showing services
    if (toolsUsed.has('get_services')) {
        return [
            { label: '📅 Book Now', message: 'I\'d like to book an appointment' },
            { label: '🕐 Check Availability', message: 'What times are available?' },
        ];
    }

    // After availability check
    if (toolsUsed.has('check_availability')) {
        return [
            { label: '✅ Book This Date', message: 'I\'d like to book on that date' },
            { label: '📅 Different Date', message: 'Can I check a different date?' },
        ];
    }

    // Bot is asking for confirmation before booking
    if (lower.includes('should i book') || lower.includes('shall i go ahead') || lower.includes('want me to confirm') || lower.includes('look correct') || lower.includes('look good')) {
        return [
            { label: '✅ Yes, Book It!', message: 'Yes, please book it!' },
            { label: '✏️ Change Something', message: 'I\'d like to change something' },
        ];
    }

    // Welcome / general
    if (lower.includes('how can i help') || lower.includes('what can i help') || lower.includes('what are you looking for')) {
        return [
            { label: '💅 View Services', message: 'Show me your services' },
            { label: '📅 Book Appointment', message: 'I\'d like to book an appointment' },
            { label: 'ℹ️ Studio Info', message: 'Tell me about the studio' },
        ];
    }

    return [];
}

// ── System prompt ────────────────────────────────────────────────────
function getSystemPrompt(userName?: string | null): string {
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const timeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

    return `You are Hello Kitty 🐱, the adorable and super helpful AI assistant for Glitz & Glamour Studio — a premium beauty salon in Vista, California (North San Diego County). The studio owner is JoJany, and she's amazing!

CURRENT DATE & TIME: ${dateStr} at ${timeStr}

${userName ? `You're chatting with ${userName}. Use their name occasionally to be friendly! 💕` : "The visitor hasn't shared their name yet. Be warm and welcoming!"}

═══════════════════════════════════════════
YOUR PERSONALITY
═══════════════════════════════════════════
- You're cute, warm, professional, and genuinely helpful 🎀
- Use emojis naturally but sparingly (1-2 per message, NOT every sentence)
- Keep responses concise — 2-3 short paragraphs MAX
- Be conversational like a friendly, knowledgeable receptionist
- Always end with a clear next step or question

═══════════════════════════════════════════
ABSOLUTE RULES — NEVER VIOLATE THESE
═══════════════════════════════════════════
1. NEVER guess or invent service names or prices. ALWAYS call get_services first.
2. ALL prices are STARTING POINTS. ALWAYS say "from $X" or "starting at $X", NEVER just "$X".
3. When listing services, ALWAYS use the exact priceLabel from get_services (which already says "From $X").
4. BEFORE creating any booking, you MUST clearly tell the user:
   - "This will be a PENDING booking request — not a final confirmation"
   - "Our team will reach out to you personally to discuss your look, finalize your price, and collect a deposit to fully confirm your appointment"
   - "The prices shown are starting points and the final price depends on your specific look"
5. ONLY call create_booking AFTER the user explicitly says "yes" or confirms.
6. You CANNOT cancel or modify bookings. Direct them to call/text the studio.
7. Studio time slots: 8:30 AM to 7:00 PM.
8. If unsure, say so honestly. Never fabricate information.
9. If a tool returns empty or fails, say "I couldn't load that right now — try our booking page at glitzandglamours.com/book"
10. Keep emoji usage natural — NEVER put an emoji on every single line.

═══════════════════════════════════════════
BOOKING FLOW (follow exactly)
═══════════════════════════════════════════
Step 1: Help them pick a service → MUST call get_services (use the priceLabel field, say "from" if it's not already included)
Step 2: Ask for preferred date + time → call check_availability to verify
Step 3: Ask for their full name and phone number
Step 4: Present a clear summary and say:
  "Before I submit this — just so you know, this will be a pending request. Our team will reach out to finalize your price and collect a deposit to confirm. The starting price is [priceLabel] and your final price will be discussed in person. Should I go ahead and submit this booking?"
Step 5: ONLY after they say yes → call create_booking
Step 6: Confirm it was submitted and remind them:
  "Your booking request is in! 🎉 Our team will reach out soon to discuss your look, finalize pricing, and collect a deposit to confirm your spot."

═══════════════════════════════════════════
FEW-SHOT EXAMPLES (follow this style)
═══════════════════════════════════════════

Example 1 — Service inquiry:
User: "How much is a gel manicure?"
[You MUST call get_services first, then respond:]
Assistant: "Great choice! Our Gel Manicure starts from $35 ✨ The final price depends on the design and add-ons you choose — it's always finalized with you in person before we start. Would you like to book one?"

Example 2 — Booking request:
User: "I want to book a pedicure for Friday"
[Call get_services to confirm service exists, then call check_availability for that Friday]
Assistant: "I found some openings this Friday! 📅 We have slots at 10:00 AM, 1:30 PM, and 3:00 PM. A Classic Pedicure starts from $40. Which time works for you? And I'll need your full name and phone number to submit the request 💕"

Example 3 — Before booking confirmation:
Assistant: "Here's your booking summary:
• Service: Classic Pedicure (from $40)
• Date: Friday, May 2nd
• Time: 1:30 PM
• Name: Maria Lopez
• Phone: (760) 555-0123

Just so you know — this will be a pending request. Our team will reach out to finalize your price and collect a deposit to fully confirm your appointment. The starting price is from $40 and your exact price will be discussed in person.

Should I go ahead and submit this? ✅"

Example 4 — Off-topic deflection:
User: "What's the weather like?"
Assistant: "Haha I wish I could tell you! 🐱 I'm just your beauty booking assistant. But I CAN help you book something gorgeous at Glitz & Glamour! Want to see our services? 💅"

Example 5 — Unknown service:
User: "Do you do laser treatments?"
[Call get_services, if not found:]
Assistant: "I don't see laser treatments on our menu right now. But we have amazing facials, waxing, and other beauty services! Want me to show you what's available? ✨"

SERVICE CATEGORIES: Nails, Pedicures, Hair Color, Haircuts, Waxing, Facials`;
}

// ── Types ────────────────────────────────────────────────────────────
type DeepSeekMessage = {
    role: 'system' | 'user' | 'assistant' | 'tool';
    content: string | null;
    tool_calls?: { id: string; type: 'function'; function: { name: string; arguments: string } }[];
    tool_call_id?: string;
};

// ── Main handler ─────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
    try {
        const ip = getClientIp(req);
        const rl = rateLimit(ip, 'chat', { limit: 40, windowMs: 60 * 60 * 1000 });
        if (!rl.ok) {
            return NextResponse.json(
                { error: 'Too many messages. Please try again later.' },
                { status: 429, headers: { 'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } }
            );
        }

        const body = await req.json();
        const { messages, conversationId, guestName } = body;

        if (!messages || !Array.isArray(messages)) {
            return NextResponse.json({ error: 'Invalid messages format' }, { status: 400 });
        }

        // Resolve user
        const session = await auth();
        let dbUser: { id: string; name: string; email: string } | null = null;
        let finalUserName = guestName || null;

        if (session?.user?.email) {
            dbUser = await prisma.user.findUnique({
                where: { email: session.user.email },
                select: { id: true, name: true, email: true },
            });
            if (dbUser?.name) finalUserName = dbUser.name.split(' ')[0];
        }

        // Conversation tracking
        let currentConversationId = conversationId;
        if (!currentConversationId) {
            const newConv = await prisma.chatConversation.create({
                data: { userId: dbUser?.id || null, guestName: dbUser ? null : finalUserName },
            });
            currentConversationId = newConv.id;
        }

        // DeepSeek API key
        const apiKey = process.env.DEEPSEEK_API_KEY;
        if (!apiKey) {
            console.error('[chat] Missing DEEPSEEK_API_KEY');
            return NextResponse.json({ error: 'Chatbot is currently offline.' }, { status: 500 });
        }

        // Build message history for the API
        const apiMessages: DeepSeekMessage[] = [
            { role: 'system', content: getSystemPrompt(finalUserName) },
            ...messages.map((m: { role: string; content: string }) => ({
                role: m.role as 'user' | 'assistant',
                content: m.content,
            })),
        ];

        // ── Function calling loop (max 5 tool calls per turn) ────────
        let bookingCard: BookingCardData | undefined;
        let reply = '';
        const MAX_TOOL_ROUNDS = 5;
        const toolsUsed = new Set<string>();

        for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
            const response = await fetch('https://api.deepseek.com/chat/completions', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: 'deepseek-chat',
                    messages: apiMessages,
                    tools: TOOL_DEFINITIONS,
                    temperature: 0.4,
                    max_tokens: 800,
                }),
            });

            if (!response.ok) {
                const err = await response.text();
                console.error('[chat] DeepSeek error:', response.status, err);
                return NextResponse.json({ error: 'Failed to communicate with AI.' }, { status: 502 });
            }

            const data = await response.json();
            const choice = data.choices?.[0];
            if (!choice) {
                return NextResponse.json({ error: 'Empty response from AI.' }, { status: 502 });
            }

            const assistantMsg = choice.message;

            // If the model wants to call tools
            if (assistantMsg.tool_calls && assistantMsg.tool_calls.length > 0) {
                // Add the assistant message with tool calls to history
                apiMessages.push({
                    role: 'assistant',
                    content: assistantMsg.content || null,
                    tool_calls: assistantMsg.tool_calls,
                });

                // Execute each tool call and add results
                for (const toolCall of assistantMsg.tool_calls) {
                    const fnName = toolCall.function.name;
                    toolsUsed.add(fnName);
                    let fnArgs: Record<string, unknown> = {};
                    try {
                        fnArgs = JSON.parse(toolCall.function.arguments || '{}');
                    } catch {
                        fnArgs = {};
                    }

                    console.log(`[chat] Tool call: ${fnName}(${JSON.stringify(fnArgs)})`);

                    const toolResult = await executeTool(fnName, fnArgs, {
                        userId: dbUser?.id || null,
                        ip,
                        conversationId: currentConversationId,
                    });

                    if (toolResult.bookingCard) {
                        bookingCard = toolResult.bookingCard;
                    }

                    apiMessages.push({
                        role: 'tool',
                        content: toolResult.result,
                        tool_call_id: toolCall.id,
                    });
                }

                // Continue loop — the model needs to process tool results
                continue;
            }

            // No tool calls — this is the final text response
            reply = assistantMsg.content || '';
            break;
        }

        if (!reply) {
            reply = "I'm sorry, I got a bit tangled up! 🐱 Could you try asking me again?";
        }

        // Save to DB
        const latestUserMessage = messages[messages.length - 1];
        if (currentConversationId && latestUserMessage?.role === 'user') {
            await prisma.chatMessage.createMany({
                data: [
                    { conversationId: currentConversationId, role: 'user', content: latestUserMessage.content },
                    { conversationId: currentConversationId, role: 'assistant', content: reply },
                ],
            });
        }

        // Generate quick reply suggestions
        const quickReplies = getQuickReplies(reply, !!bookingCard, toolsUsed);

        return NextResponse.json({
            reply,
            conversationId: currentConversationId,
            userName: finalUserName,
            bookingCard: bookingCard || null,
            quickReplies,
        });
    } catch (error) {
        console.error('[chat] Error:', error);
        return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
    }
}
