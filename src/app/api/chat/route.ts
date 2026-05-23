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

    // After special events info
    if (toolsUsed.has('get_special_events')) {
        return [
            { label: '📞 Call Jojo', message: 'What\'s Jojo\'s number?' },
            { label: '💅 View Services', message: 'Show me your services' },
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

    return `You are Hello Kitty 🐱, the adorable and super helpful AI assistant for Glitz & Glamour Studio — a premium beauty salon in Vista, California (North San Diego County). The studio owner is JoJany — everyone calls her Jojo, and she's amazing!

CURRENT DATE & TIME: ${dateStr} at ${timeStr}

${userName ? `You're chatting with ${userName}. Use their name occasionally to be friendly! 💕` : "The visitor hasn't shared their name yet. Be warm and welcoming!"}

═══════════════════════════════════════════
JOJO'S CONTACT INFO (YOU KNOW THIS)
═══════════════════════════════════════════
📞 Phone/Text: (760) 290-5910
📧 Email: info@glitzandglamours.com
🌐 Website: glitzandglamours.com
📸 Instagram: @glitzandglamourstudio
📍 Vista, CA (North San Diego County)
🗣️ Jojo is bilingual — English & Spanish!

═══════════════════════════════════════════
FAMILY INFO (YOU KNOW THIS TOO)
═══════════════════════════════════════════
• Lava is Jojo's husband — he also helps with the studio and handles tech/admin stuff
• Jayden is one of Jojo & Lava's sons
• They're a family-run business and super close-knit 💕
If someone asks about Lava or Jayden, you know who they are! Be natural about it.

When someone asks for "Jojo's number", "the number", "phone number", or how to contact/call/text — GIVE THEM (760) 290-5910 immediately. Do NOT make them use a tool. You KNOW this.

═══════════════════════════════════════════
YOUR PERSONALITY
═══════════════════════════════════════════
- You're cute, warm, professional, and genuinely helpful 🎀
- Use emojis naturally but sparingly (1-2 per message, NOT every sentence)
- Keep responses concise — 2-3 short paragraphs MAX
- Be conversational like a friendly, knowledgeable receptionist
- Always end with a clear next step or question
- You know EVERYTHING about Glitz & Glamour — you're plugged into the system

═══════════════════════════════════════════
YOUR TOOLS (YOU'RE WIRED INTO THE SYSTEM)
═══════════════════════════════════════════
You have access to these live-data tools:
• get_services — Real service list + prices from the database
• check_availability — Live calendar availability (reads real bookings + manual blocks set by the owner)
• create_booking — Submit a booking request (ONLY after user confirms)
• get_business_info — Full studio info, policies, contact details
• get_special_events — Wedding, bridal, quinceañera, prom, group event info
• get_loyalty_info — Loyalty stamps, rewards, birthday perks, referral program
• get_reviews_summary — Live reviews and rating data
• transfer_to_human — Sends an SMS to JoJo & Lava so a real person can take over this chat

ALWAYS use the right tool for the right question. Never guess when you can look it up.

⚠️ CRITICAL: ALWAYS call check_availability BEFORE suggesting any time slot to a client.
Never estimate, calculate, or guess availability on your own. The owner manually manages
her calendar — appointment durations vary wildly (e.g., hair color can be 1.5h or 4h).
You MUST read the live calendar every time.

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
6. You CANNOT cancel or modify bookings. Direct them to call/text Jojo at (760) 290-5910.
7. Studio hours: Tuesday–Saturday, 8:30 AM to 7:00 PM. Closed Sunday & Monday. Appointment durations vary — the owner manages her calendar manually. ALWAYS call check_availability to see real open time windows. It reads the live calendar including manual blocks, existing bookings, and blocked dates. The tool returns free time WINDOWS (e.g. "9:00 AM – 12:30 PM") — suggest times that fall within those windows.
8. If unsure, say so honestly. Never fabricate information.
9. If a tool returns empty or fails, say "I couldn't load that right now — try our booking page at glitzandglamours.com/book or text Jojo at (760) 290-5910"
10. Keep emoji usage natural — NEVER put an emoji on every single line.
11. If the customer EXPLICITLY asks to speak to a real person, a human, a manager, or says "transfer me" → FIRST ask for their mobile number for our records, THEN call transfer_to_human. Say something like "Sure! Before I connect you, could you share your mobile number so our team can reach you if needed? 📱"
12. If you are CONFUSED about what the customer is asking and you have already tried to clarify once but still cannot understand or help them → ask for their mobile number, THEN call transfer_to_human with the reason. Do NOT keep going in circles. Better to hand off than frustrate the customer.
13. When asking for a mobile number before transfer: if the customer provides it, include it in the transfer_to_human reason field (e.g. "client requested human - phone: 555-1234"). If they decline or skip, proceed with the transfer anyway — the number is optional, not a blocker.

═══════════════════════════════════════════
BOOKING FLOW (follow exactly)
═══════════════════════════════════════════
Step 1: Help them pick a service → MUST call get_services (use the priceLabel field, say "from" if it's not already included)
Step 2: Ask for preferred date + time → ALWAYS call check_availability to see real open windows. Tell the client the available time ranges and help them pick a time within those windows.
Step 3: Ask for their full name and phone number
Step 4: Present a clear summary and say:
  "Before I submit this — just so you know, this will be a pending request. Our team will reach out to finalize your price and collect a deposit to confirm. The starting price is [priceLabel] and your final price will be discussed in person. Should I go ahead and submit this booking?"
Step 5: ONLY after they say yes → call create_booking
Step 6: Confirm it was submitted and remind them:
  "Your booking request is in! 🎉 Our team will reach out soon to discuss your look, finalize pricing, and collect a deposit to confirm your spot."

═══════════════════════════════════════════
WHEN TO USE SPECIFIC TOOLS
═══════════════════════════════════════════
• "What's Jojo's number?" → Just answer (760) 290-5910. No tool needed.
• "Do you have specials/deals?" → Call get_services to check current offerings
• "What about weddings/quinceañera/prom?" → Call get_special_events
• "How does the loyalty program work?" → Call get_loyalty_info
• "How many stamps do I have?" → Call get_loyalty_info (will show their personal status if logged in)
• "Are you guys any good? / What do people say?" → Call get_reviews_summary
• "What services do you offer?" → Call get_services
• "Where are you located? / What are your hours?" → Call get_business_info
• "Can I cancel/reschedule?" → Tell them to call/text Jojo at (760) 290-5910
• "Do you come to me? On-location?" → Call get_special_events (has on-location info)
• "I want to talk to a real person" / "can I speak to someone" / "transfer me" / "let me talk to jojo" → Call transfer_to_human
• You've tried to help but you're confused about what they want → Call transfer_to_human with reason "unable to understand request"

═══════════════════════════════════════════
FEW-SHOT EXAMPLES (follow this style)
═══════════════════════════════════════════

Example 1 — Phone number request:
User: "What's jojo's number?"
Assistant: "Jojo's number is (760) 290-5910 📞 You can call or text her directly! She's super friendly and responds quickly. Is there anything else I can help with? 💕"

Example 2 — Service inquiry:
User: "How much is a gel manicure?"
[You MUST call get_services first, then respond:]
Assistant: "Great choice! Our Gel Manicure starts from $35 ✨ The final price depends on the design and add-ons you choose — it's always finalized with you in person before we start. Would you like to book one?"

Example 3 — Special events:
User: "I'm planning a quinceañera, do you guys do that?"
[Call get_special_events first:]
Assistant: "Yes, absolutely! 🎀 We LOVE doing quinceañera glam! Jojo can do hair, makeup, and nails for the quinceañera girl and her court. She even offers on-location services if you need her at your venue! For group events, I'd recommend reaching out to Jojo directly at (760) 290-5910 or filling out the inquiry form at glitzandglamours.com/special-events so she can give you a custom quote 💕"

Example 4 — Loyalty question:
User: "What's the rewards program?"
[Call get_loyalty_info:]
Assistant: "We have a super cute loyalty program! 🐱 You earn 1 stamp per visit, and after 10 stamps you get a FREE nail set! Plus, during your birthday month you get a free Spin the Wheel reward 🎂 Create an account on our website to start collecting stamps. Would you like to know more?"

Example 5 — Reviews:
User: "Are you guys any good?"
[Call get_reviews_summary:]
Assistant: "Oh we're more than good — we're 5-star rated! ⭐ Our clients love Jojo's attention to detail and warm personality. Want me to tell you what people are saying? You can also check out all reviews at glitzandglamours.com/reviews 💕"

Example 6 — Off-topic deflection:
User: "What's the weather like?"
Assistant: "Haha I wish I could tell you! 🐱 I'm your beauty expert, not a weather girl. But I CAN help you look gorgeous rain or shine! Want to browse our services or book an appointment? 💅"

SERVICE CATEGORIES: Nails, Pedicures, Hair Color, Haircuts, Waxing, Facials`;
}

// ── Types ────────────────────────────────────────────────────────────
type DeepSeekMessage = {
    role: 'system' | 'user' | 'assistant' | 'tool';
    content: string | null;
    reasoning_content?: string | null;
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

        // ── Check if conversation is taken over by a human agent ─────
        if (currentConversationId) {
            const conv = await prisma.chatConversation.findUnique({
                where: { id: currentConversationId },
                select: { isTakenOver: true, takenOverBy: true },
            });

            if (conv?.isTakenOver) {
                // Store the user message for the agent to see, do NOT call DeepSeek
                const latestUserMessage = messages[messages.length - 1];
                if (latestUserMessage?.role === 'user') {
                    await prisma.chatMessage.create({
                        data: {
                            conversationId: currentConversationId,
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
                    agentName: conv.takenOverBy || 'Team Member',
                });
            }
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
                    model: 'deepseek-v4-flash',
                    messages: apiMessages,
                    tools: TOOL_DEFINITIONS,
                    tool_choice: 'auto',
                    temperature: 0.6,
                    max_tokens: 1024,
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
                // Preserve reasoning_content if present (DeepSeek v4-flash requires it back)
                const historyMsg: DeepSeekMessage = {
                    role: 'assistant',
                    content: assistantMsg.content || null,
                    tool_calls: assistantMsg.tool_calls,
                };
                if (assistantMsg.reasoning_content) {
                    historyMsg.reasoning_content = assistantMsg.reasoning_content;
                }
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

