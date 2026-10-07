import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { rateLimit, getClientIp } from '@/lib/rateLimit';
import { TOOL_DEFINITIONS, executeTool, type BookingCardData } from '@/lib/chatTools';
import { getMobileOrWebUser } from '@/lib/mobileAuth';

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
            { label: '📞 Contact Jojo', message: 'What\'s Jojo\'s phone number?' },
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

    // After human transfer
    if (toolsUsed.has('transfer_to_human')) {
        return [
            { label: '📞 Call Jojo', message: "What's Jojo's phone number?" },
        ];
    }

    // After availability check
    if (toolsUsed.has('check_availability')) {
        return [
            { label: '✅ Book This Date', message: 'I\'d like to book on that date' },
            { label: '📅 Different Date', message: 'Can I check a different date?' },
        ];
    }

    // After special events info or mentioning special events
    if (toolsUsed.has('get_special_events') || lower.includes('special event') || lower.includes('wedding') || lower.includes('bridal') || lower.includes('quince') || lower.includes('prom') || lower.includes('bachelorette')) {
        if (lower.includes('wedding') || lower.includes('bridal')) {
            return [
                { label: '👰 Bridal Packages', message: 'What is included in bridal hair and makeup?' },
                { label: '💍 Inquire for Wedding', message: 'How do I submit an inquiry for a wedding?' },
                { label: '📞 Call Jojo', message: "What's Jojo's phone number?" },
            ];
        }
        if (lower.includes('quince')) {
            return [
                { label: '👑 Quinceañera Glam', message: 'Tell me about Quinceañera hair and makeup packages' },
                { label: '👗 Damas & Court', message: 'Do you style damas and court of honor?' },
                { label: '📞 Call Jojo', message: "What's Jojo's phone number?" },
            ];
        }
        return [
            { label: '💍 Inquire Online', message: 'How do I submit a special event inquiry?' },
            { label: '👰 Bridal Glam', message: 'Tell me about bridal hair and makeup' },
            { label: '🚗 On-Location Travel', message: 'Do you travel on-location for events?' },
            { label: '📞 Call Jojo', message: "What's Jojo's phone number?" },
        ];
    }

    // After loyalty info
    if (toolsUsed.has('get_loyalty_info')) {
        return [
            { label: '📅 Book & Earn Stamps', message: 'I\'d like to book an appointment' },
            { label: '⭐ See Reviews', message: 'What do your clients say about you?' },
        ];
    }

    // After reviews info
    if (toolsUsed.has('get_reviews_summary')) {
        return [
            { label: '📅 Book Now', message: 'I\'d like to book an appointment' },
            { label: '💅 View Services', message: 'Show me your services' },
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
            { label: '📅 Available Slots', message: 'When is the next open appointment?' },
            { label: '💍 Special Events', message: 'Tell me about your special event & bridal services' },
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

    return `You are Hello Kitty 2.0 🐱✨, the cute, super fast, and helpful VIP assistant for Glitz & Glamour Studio!
CURRENT DATE & TIME: ${dateStr} at ${timeStr}

${userName ? `You're chatting with ${userName}. Use their name naturally! 💕` : "Be warm and welcoming!"}

═══════════════════════════════════════════
VERIFIED STUDIO FACTS (USE DIRECTLY — NEVER CALL TOOLS FOR THESE)
═══════════════════════════════════════════
• Location: 935 W San Marcos Blvd, Suite 101, San Marcos, CA 92078 (North County San Diego). We moved here from Vista — Vista is permanently closed.
• Artist & Owner: JoJany (Jojo) — Call/Text: (760) 290-5910 | Email: info@glitzandglamours.com | Web: glitzandglamours.com
• Family & Team: Lava is Jojo's husband (helps with tech & studio), Jayden is their son. Jojo is bilingual (English & Spanish).
• Operating Hours: Tuesday–Saturday, 8:30 AM to 7:00 PM. Closed Sunday & Monday.
• Cancellation Policy: 48-hour notice required to reschedule or transfer retainer without penalty.
• Deposit Policy: $25 deposit required to confirm all bookings.
• VIP Loyalty Stamp Card: 1 stamp per visit. 10 stamps = FREE full nail set ($65 value). Digital pass on Apple Wallet & Google Wallet (glitzandglamours.com/card). Free birthday month gift.
• Special Events & Luxury Mobile Glam (9 Dedicated Offerings):
  - In-Studio (San Marcos salon) & On-Location Mobile Service (we travel with full kit, lighting & chairs across San Diego County & Temecula).
  - 1. Weddings & Bridal Glam: In-studio 2-hour trials, wedding day bride, bridal party (bridesmaids, maid of honor, moms), groom grooming, custom mink lashes, veil pinning & touch-up kit. (glitzandglamours.com/special-events/weddings-bridal)
  - 2. Quinceañeras & Sweet 15: Royal quinceañera hair/makeup, tiara pinning, damas & court of honor packages, all-day dance-proof hold. (glitzandglamours.com/special-events/quinceaneras)
  - 3. Prom & Homecoming: Hollywood waves, updos, airbrush finish, North County high schools. (glitzandglamours.com/special-events/prom-homecoming)
  - 4. On-Location Mobile Squad: Full on-site beauty team at venues, estates, hotels, or homes. (glitzandglamours.com/special-events/on-location-hair-makeup)
  - 5. Bridal Showers & Bachelorette Parties: Group glam sessions & bride tribe glow. (glitzandglamours.com/special-events/bridal-showers-bachelorettes)
  - 6. Baby Showers & Gender Reveals: Luminous expectant-mom beauty & soft waves. (glitzandglamours.com/special-events/baby-showers)
  - 7. Sweet 16 & Milestone Birthdays: Milestone glam, 21st/30th/40th birthdays, custom nail sets. (glitzandglamours.com/special-events/sweet-16-birthdays)
  - 8. Corporate Galas & Headshots: Executive headshots, award galas, camera-ready matte finish. (glitzandglamours.com/special-events/corporate-gala)
  - 9. Photo & Video Shoots: Editorial, modeling portfolios, engagement shoots at Lake San Marcos & Carlsbad beaches. (glitzandglamours.com/special-events/photo-video-shoots)
  - Top Venues Frequently Served: Twin Oaks House & Gardens, Lakehouse Resort at Lake San Marcos, The Vistonian (Vista), Leo Carrillo Ranch (Carlsbad), Bandy Canyon Ranch (Escondido), Shadowridge Golf Club.
  - Special Events Booking & Pricing: Custom quotes based on party size, services, and travel. Never try to auto-book special events via regular calendar slots. Instead, direct clients to submit the questionnaire at glitzandglamours.com/special-events or call/text Jojo directly at (760) 290-5910! Recommend booking bridal/quinceañeras 1–3 months ahead, groups 2–4 weeks ahead.
• Verified Starting Prices:
  - Manicure (Rubber base structure + gel polish): from $40
  - Gel Pedicure: from $40
  - Full Set Acrylic: from $65
  - Acrylic Fill: from $45
  - Gel-X Extensions: from $65
  - Haircut & Blowdry: from $45
  - Hair Color / Balayage / Highlights: from $120
  - Eyebrow Wax: from $15 | Lip Wax: from $10
  - European Facial: from $75
  (Explain that final price is agreed upon in person based on length, shape, and custom nail art designs.)

═══════════════════════════════════════════
SPEED & CONCISENESS RULES (CRITICAL)
═══════════════════════════════════════════
1. Keep responses PUNCHY & CONCISE: 2 to 3 sentences MAX! Never write long essays or duplicate facts.
2. For questions about location, hours, starting prices, phone number, loyalty rules, cancellation policy, or special events: ANSWER IMMEDIATELY from your verified facts in 1–2 punchy sentences WITHOUT calling any tool! This makes your response instant!

═══════════════════════════════════════════
ZERO-HALLUCINATION & STRICT TOOL RULES
═══════════════════════════════════════════
1. LIVE CALENDAR & SLOTS: Whenever the client asks about open times, specific dates, or wants to check availability, you MUST call check_availability for that date. NEVER guess or make up time slots! If a date is blocked or check_availability returns available: false, you MUST immediately say: "This date is unavailable. Please choose another date."
2. BOOKING SUBMISSION: ONLY call create_booking after the client has confirmed their service, date, time, and full name. Remind them: "This will be a pending request — our team will reach out to finalize your price and collect a deposit to confirm."
3. HUMAN TAKEOVER: If the user asks to speak with a human or you cannot help them, call transfer_to_human.
4. REVIEWS: Call get_reviews_summary ONLY if the user specifically asks for reviews or client testimonials.
5. NEVER invent services we don't offer (no tattoos, microblading, or laser). If asked, politely say we don't offer that and suggest our nails, hair, waxing, or facials.
6. SPECIAL EVENTS QUESTIONS: For questions about weddings, quinceañeras, proms, or group events, answer immediately from your verified facts or call get_special_events (passing eventType if specific, e.g. "weddings-bridal"). Always share the relevant link (glitzandglamours.com/special-events or specific slug) and Jojo's direct number (760) 290-5910.`;
}

// ── Types ────────────────────────────────────────────────────────────
type OpenAIMessage = {
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

        // Parallelize session auth and conversation lookup
        const [session, existingConv] = await Promise.all([
            auth().catch(() => null),
            conversationId
                ? prisma.chatConversation.findUnique({
                    where: { id: conversationId },
                    select: { id: true, isTakenOver: true, takenOverBy: true },
                }).catch(() => null)
                : Promise.resolve(null),
        ]);

        const mobileUser = await getMobileOrWebUser(req, session?.user?.email);
        let dbUser: { id: string; name: string; email: string } | null = null;
        let finalUserName = guestName || null;

        if (mobileUser) {
            dbUser = await prisma.user.findUnique({
                where: { id: mobileUser.id },
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

        // ── Check if conversation is taken over by a human agent ─────
        if (existingConv?.isTakenOver) {
            // Store the user message for the agent to see, do NOT call AI
            const latestUserMessage = messages[messages.length - 1];
            if (latestUserMessage?.role === 'user') {
                await prisma.chatMessage.create({
                    data: {
                        conversationId: currentConversationId!,
                        role: 'user',
                        content: latestUserMessage.content,
                    },
                });
            }

            return NextResponse.json({
                reply: null,
                conversationId: currentConversationId,
                userName: finalUserName,
                bookingCard: null,
                quickReplies: [],
                isTakenOver: true,
                agentName: existingConv.takenOverBy || 'Team Member',
            });
        }

        // API resolution: Prefer OpenAI, fallback to DeepSeek
        const isOpenAI = Boolean(process.env.OPENAI_API_KEY);
        const apiKey = process.env.OPENAI_API_KEY || process.env.DEEPSEEK_API_KEY;
        const apiUrl = isOpenAI
            ? 'https://api.openai.com/v1/chat/completions'
            : 'https://api.deepseek.com/chat/completions';
        const model = isOpenAI
            ? (process.env.OPENAI_MODEL || 'gpt-4o-mini')
            : 'deepseek-v4-flash';

        if (!apiKey) {
            console.error('[chat] Missing OPENAI_API_KEY or DEEPSEEK_API_KEY');
            return NextResponse.json({ error: 'Chatbot is currently offline.' }, { status: 500 });
        }

        // Build message history for the API
        const apiMessages: OpenAIMessage[] = [
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
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model,
                    messages: apiMessages,
                    tools: TOOL_DEFINITIONS,
                    tool_choice: 'auto',
                    temperature: 0.2, // Lower temperature for high factual accuracy and zero hallucination
                    max_tokens: 350, // Snappy, concise responses
                }),
            });

            if (!response.ok) {
                const err = await response.text();
                console.error(`[chat] ${isOpenAI ? 'OpenAI' : 'DeepSeek'} error:`, response.status, err);
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
                const historyMsg: OpenAIMessage = {
                    role: 'assistant',
                    content: assistantMsg.content || null,
                    tool_calls: assistantMsg.tool_calls,
                };
                apiMessages.push(historyMsg);

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
            transferInitiated: toolsUsed.has('transfer_to_human'),
            isTakenOver: false,
            agentName: null,
        });
    } catch (error) {
        console.error('[chat] Error:', error);
        return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
    }
}

