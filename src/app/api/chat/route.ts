import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { rateLimit, getClientIp } from '@/lib/rateLimit';
import {
    TOOL_DEFINITIONS,
    executeTool,
    type AttributionSavedData,
    type AvailabilityWidgetData,
    type BookingCardData,
} from '@/lib/chatTools';
import { policyPromptBlock } from '@/lib/studioPolicies';
import { getMobileOrWebUser } from '@/lib/mobileAuth';
import { minioGetBuffer } from '@/lib/minioGetBuffer';
import {
    extractKittyEmote,
    extractUploadKey,
    sanitizeChatAttachments,
} from '@/lib/kittyEmotes';

// Kitty is pinned to Claude Sonnet 5.5; tools/check-faq-policy.mjs fails if this changes.
const KITTY_MODEL = 'claude-sonnet-5-5';

// ── Quick reply suggestions based on context ────────────────────────
type QuickReply = { label: string; message: string };

function getQuickReplies(
    reply: string,
    hasBookingCard: boolean,
    toolsUsed: Set<string>,
): QuickReply[] {
    const lower = reply.toLowerCase();

    // After booking creation -> offer 1-tap discovery attribution presets
    if (hasBookingCard) {
        return [
            { label: '🔍 Google', message: 'I found you on Google' },
            { label: '📸 Instagram', message: 'I found you on Instagram' },
            { label: '🌐 Facebook', message: 'I found you on Facebook' },
            { label: '🎵 TikTok', message: 'I found you on TikTok' },
            { label: '⭐ Yelp', message: 'I found you on Yelp' },
            { label: '💕 Friend / Word of Mouth', message: 'A friend recommended Glitz & Glamour' },
            { label: '🚶 Walked / Drove By', message: 'I walked or drove by the studio' },
        ];
    }

    // After saving discovery attribution
    if (toolsUsed.has('save_booking_discovery_source')) {
        return [
            { label: '💎 VIP Stamp Card', message: 'How does the VIP stamp card work?' },
            { label: '📍 Studio Directions', message: 'Where is the studio located?' },
            { label: '📞 Contact Jojo', message: "What's Jojo's phone number?" },
        ];
    }

    // After showing services
    if (toolsUsed.has('get_services')) {
        return [
            { label: '📅 Book Now', message: "I'd like to book an appointment" },
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
            { label: '✅ Book This Date', message: "I'd like to book on that date" },
            { label: '📅 Different Date', message: 'Can I check a different date?' },
        ];
    }

    // After special events info or mentioning special events (skip generic service-list greetings)
    const mentionsSpecificEvent = /\b(wedding|bridal|quince|prom|bachelorette)\b/i.test(lower);
    const mentionsSpecialEventDirectly =
        lower.includes('special event') && !/\bnails,\s*hair\b/i.test(lower);
    if (toolsUsed.has('get_special_events') || mentionsSpecificEvent || mentionsSpecialEventDirectly) {
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
            { label: '📅 Book & Earn Stamps', message: "I'd like to book an appointment" },
            { label: '⭐ See Reviews', message: 'What do your clients say about you?' },
        ];
    }

    // After reviews info
    if (toolsUsed.has('get_reviews_summary')) {
        return [
            { label: '📅 Book Now', message: "I'd like to book an appointment" },
            { label: '💅 View Services', message: 'Show me your services' },
        ];
    }

    // Bot is asking for confirmation before booking
    if (lower.includes('should i book') || lower.includes('shall i go ahead') || lower.includes('want me to confirm') || lower.includes('look correct') || lower.includes('look good')) {
        return [
            { label: '✅ Yes, Book It!', message: 'Yes, please book it!' },
            { label: '✏️ Change Something', message: "I'd like to change something" },
        ];
    }

    // Bot is asking about design details / inspo prior to booking
    if (
        lower.includes('inspo') ||
        lower.includes('shape') ||
        lower.includes('nail length') ||
        lower.includes('soak-off') ||
        lower.includes('hair history') ||
        lower.includes('sensitivit')
    ) {
        return [
            { label: '✨ Decide details in person', message: "I'm not sure yet — I'd like to decide details in person with Jojo!" },
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
• Artist & Owner: Jojo — Call/Text: (760) 290-5910 | Email: info@glitzandglamours.com | Web: glitzandglamours.com
• Family & Team: Lava is Jojo's husband (helps with tech & studio), Jayden is their son. Jojo is bilingual (English & Spanish).
• Operating Hours: Monday–Sunday, 9:00 AM to 7:00 PM. Open 7 days a week by appointment.
${policyPromptBlock()}
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
  - Special Events Booking & Pricing: SPECIAL OCCASION HAIR & MAKEUP STARTS AROUND $185 (hair and makeup together; exact quote confirmed by Jojo based on party size, services, and travel). Special occasion work uses a different technique and approach than everyday salon services so the hair and makeup withstand the whole night. Never auto-book special events via regular calendar slots. Instead, direct clients to submit the questionnaire at glitzandglamours.com/special-events or call/text Jojo directly at (760) 290-5910! Recommend booking bridal/quinceañeras 1–3 months ahead, groups 2–4 weeks ahead.
• EVERYDAY SALON SERVICES — Verified Starting Prices (regular appointments ONLY, NOT special occasion pricing):
  - Nails: Acrylic Full Set from $65 | Gel-X Extensions from $60 | Acrylic Fill from $35 | Acrylic Rebalance from $55 | Classic & Gel Manicure (rubber base + gel polish) from $40 | Safe Soak-Off (our work) from $30 | Foreign Soak-Off from $50
  - Pedicures: Classic Foot Soak Detox from $65 | Jelly Hydrating Foot Detox from $75 | Full Set Acrylic Toes from $45
  - Hair Color: Solid One-Tone from $120 | Creative Color & Color Melt from $150 | Gloss & Toner from $65 | Highlights, Balayage & Vivid/Fashion Color from $380
  - Haircuts: Women's Haircut & Blowout from $65 | Kids Haircut (Girls or Boys) from $35
  - Waxing: Upper Lip from $10 | Eyebrow from $12 | Sideburns from $15 | Underarm from $20 | Brazilian, bikini & other full waxing services from $60
  - Facials: Express Mini Facial (30 min) from $30 | Custom Nourishing Facial from $75 | Deep Cleansing + Extraction Facial from $85 | Anti-Aging & Enzyme Facial from $100
  (Explain that final price is agreed upon in person based on length, shape, and custom nail art designs.)

═══════════════════════════════════════════
KITTY EMOTE EXPRESSIONS (AUTO-STRIPPED MARKER)
═══════════════════════════════════════════
Begin EVERY reply with ONE mood tag on the first line (the server strips it before showing text and animates your avatar):
[emote:happy] (warm default) | [emote:sparkle] (excited, inspo art, promos, VIP card) | [emote:love] (adoring inspo, greeting returning clients, thanking for referral source) | [emote:celebrate] (booking submitted or referral saved) | [emote:apologetic] (unavailable date, policy limits, human transfer) | [emote:thinking] (clarifying questions).
Never mention "[emote:...]" in prose.

═══════════════════════════════════════════
SPEED & CONCISENESS RULES (CRITICAL)
═══════════════════════════════════════════
1. Keep responses PUNCHY & CONCISE: 2 to 3 sentences MAX! Never write long essays or duplicate facts. If the client just says "hi"/"hello"/"hey", reply in ONE warm, short sentence asking how you can help today (the chat widget already showed them the studio intro!).
2. For questions about location, hours, starting prices, phone number, loyalty rules, or special events: ANSWER IMMEDIATELY from your verified facts in 1–2 punchy sentences WITHOUT calling any tool! This makes your response instant!
   POLICY QUESTIONS (cancellation, late arrival, payment, retainer, refunds, walk-ins, fixes, prep): answer from STUDIO POLICIES above in 2–4 sentences, for the service type asked only (ask which service if unclear). Never merge nail terms with hair/makeup terms, and never round or soften the numbers.

═══════════════════════════════════════════
ZERO-HALLUCINATION, VISION & BOOKING FLOW RULES
═══════════════════════════════════════════
1. LIVE CALENDAR & SLOTS: Whenever the client asks about open times, specific dates, or wants to check availability, you MUST call check_availability for that date. NEVER guess or make up time slots! If a date is blocked or check_availability returns available: false, you MUST immediately say: "This date is unavailable. Please choose another date." (and if nextAvailableDate is returned, offer that date!). When a date has open slots, tell the client they can tap any available time slot below (any taken times are automatically shown with an "Already Booked" label). If create_booking returns conflict: true, let the client know that time is already booked and ask them to pick one of the available slots.
2. PRE-BOOKING REQUIREMENTS (ASK BEFORE BOOKING): Do NOT call create_booking on just a name + phone unless the client prefers to decide in person! Once they choose a service/date/time, warmly ask in 1 short step for their look details + mention they can tap the 📷 photo button to upload inspo:
   - Nails/Pedicures: desired shape & length, design/art vibe (French, chrome, 3D, solid), and whether they currently have gel/acrylic needing removal/soak-off.
   - Hair Color/Cuts: current color + box-dye/bleach history, target color/cut & hair length.
   - Facials/Waxing: skin goals/areas + any allergies, sensitivities, or retinol/AHA use.
   - Keep friction zero: if they reply "not sure yet" or "decide in person", accept warmly!
3. INSPO PHOTO VISION RULES: When a client sends inspo photo(s), use [emote:love] or [emote:sparkle], warmly describe concrete visual details you observe (nail shape/length, French/chrome/aura/charms/rhinestones, or hair color/dimension/layers), suggest the matching service(s) via get_services, remind gently that final art/complexity pricing is confirmed in person by Jojo, and ask 1 quick follow-up question (like soak-off/removal or keeping that length) if not yet answered.
4. BOOKING SUBMISSION: ONLY call create_booking after confirming service, date, time, full name, phone number, AND their beauty requirements (or "decide in person"). Write a clean structured requirements summary into notes (combine text answers + Vision observations from inspo photos; NEVER put "Booked via Hello Kitty" in notes). Pass any validated /api/images/uploads/... inspo URLs from the chat in inspoImageUrls. Remind them: "This will be a pending request — our team will reach out to finalize your price and collect a retainer to confirm."
5. POST-BOOKING ATTRIBUTION ("HOW DID YOU FIND US?"): Right after create_booking returns success, use [emote:celebrate], celebrate warmly, and ask ONE friendly closing question: "One quick question before you go — how did you find out about us? (Google, Instagram, Facebook, TikTok, Yelp, a friend, or walked by?)" When they answer, immediately call save_booking_discovery_source with their answer and thank them warmly with [emote:love]. Never nag twice if they skip or ask something else.
6. HUMAN TAKEOVER: If the user asks to speak with a human or you cannot help them, call transfer_to_human.
7. REVIEWS: Call get_reviews_summary ONLY if the user specifically asks for reviews or client testimonials.
8. SERVICES NOT ON OUR MENU: tattoos, microblading, laser, and massage are definitely not offered, so say so and suggest nails, hair, waxing, or facials. For ANYTHING else that is not on the price menu (keratin, hair extensions, men's cuts, beard trims, lash extensions, classes, gift cards, etc.), do NOT flatly say we don't offer it and do NOT quote a price: say it isn't on our online menu and offer to have Jojo confirm, with her number.
9. SPECIAL EVENTS QUESTIONS: For questions about weddings, quinceañeras, proms, or group events, answer immediately from your verified facts or call get_special_events (passing eventType if specific, e.g. "weddings-bridal"). Always share the relevant link (glitzandglamours.com/special-events or specific slug) and Jojo's direct number (760) 290-5910.
9b. TWO SEPARATE PRICING TRACKS: Special occasion hair & makeup (weddings, quinceañeras, prom, galas, shoots, any event) STARTS AROUND $185 and is quoted by Jojo. Everyday salon prices (e.g. a $65 women's haircut, $40 manicure) apply ONLY to regular appointments. NEVER quote an everyday price for a special occasion and never blend the two. When someone asks about hair and/or makeup for an event, give the special occasion starting price first (~$185, custom quote) and briefly explain why: a different technique and approach is used so the hair and makeup last the whole night. If they also want regular services, mention those SEPARATELY with their everyday prices. Special occasion makeup is not a regular bookable service, so direct them to the special events questionnaire or Jojo.
9c. WHEN A FACT IS NOT IN YOUR VERIFIED FACTS OR TOOL RESULTS: say you don't have it on file, never guess, and send the client to Jojo at (760) 290-5910 (offer transfer_to_human if they want a person). This includes military or first-time discounts, gift cards, payment plans, holiday hours, what the $185 includes, makeup-only or hair-only event prices, non-event makeup prices, group discounts, and any travel fee amounts. Never invent a policy, a dollar amount, or a promise.
9d. SPECIAL EVENT WORDING: say special occasion hair and makeup "starts around $185 (hair and makeup together)" and that Jojo gives the exact quote. Never say "per person" or "per package", never describe what the price includes, and never say everyday or night-out makeup counts as special occasion work. Mobile services are based in Oceanside and travel fees may apply outside the area. Do not confirm travel or discounts for Camp Pendleton or military clients: say Jojo confirms.
10. ACTION BUTTONS & LINKS: Whenever you mention or recommend any website page or form, ALWAYS format it as a markdown link with an exciting, descriptive button label so the chat automatically renders it as a clickable button!
   Examples:
   - For special events: [✨ View Special Events Page](https://www.glitzandglamours.com/special-events)
   - For weddings: [👰 Weddings & Bridal Glam](https://www.glitzandglamours.com/special-events/weddings-bridal)
   - For quinceañeras: [👑 Quinceañeras Packages](https://www.glitzandglamours.com/special-events/quinceaneras)
   - For prom: [💃 Prom & Homecoming](https://www.glitzandglamours.com/special-events/prom-homecoming)
   - For booking: [📅 Book Appointment](https://www.glitzandglamours.com/book)
   - For loyalty: [💎 VIP Loyalty Stamp Card](https://www.glitzandglamours.com/card)
   - For phone: [📞 Call/Text Jojo: (760) 290-5910](tel:7602905910)
   NEVER write plain text words like "[here]" or bare unlinked URLs. Always use clear action button labels!`;
}

// ── Anthropic Types & Vision Message Builder ─────────────────────────
type AnthropicImageMediaType = 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp';

type AnthropicContentBlock =
    | { type: 'text'; text: string }
    | { type: 'image'; source: { type: 'base64'; media_type: AnthropicImageMediaType; data: string } }
    | { type: 'thinking'; thinking: string; signature?: string }
    | { type: 'redacted_thinking'; data: string }
    | { type: 'tool_use'; id: string; name: string; input: Record<string, unknown> }
    | { type: 'tool_result'; tool_use_id: string; content: string };

type AnthropicMessage = {
    role: 'user' | 'assistant';
    content: string | AnthropicContentBlock[];
};

type IncomingChatMessage = {
    role: string;
    content: string;
    attachments?: unknown;
};

const MAX_VISION_IMAGES = 4;
const MAX_VISION_TOTAL_BYTES = 4 * 1024 * 1024; // 4MB aggregate raw buffer ceiling

function inferMediaType(url: string, contentType?: string): AnthropicImageMediaType {
    const ct = (contentType || '').toLowerCase();
    if (ct === 'image/jpeg' || ct === 'image/jpg') return 'image/jpeg';
    if (ct === 'image/png') return 'image/png';
    if (ct === 'image/gif') return 'image/gif';
    if (ct === 'image/webp') return 'image/webp';
    const lower = url.toLowerCase();
    if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
    if (lower.endsWith('.png')) return 'image/png';
    if (lower.endsWith('.gif')) return 'image/gif';
    return 'image/webp';
}

const ANTHROPIC_TOOLS = TOOL_DEFINITIONS.map((t) => ({
    name: t.function.name,
    description: t.function.description,
    input_schema: t.function.parameters,
}));

async function buildAnthropicMessagesWithVision(rawMessages: IncomingChatMessage[]): Promise<{
    apiMessages: AnthropicMessage[];
    conversationInspoUrls: string[];
}> {
    // 1. Collect all sanitized inspo URLs across the conversation (unique, max 5)
    const perMessageAttachments = rawMessages.map((m) =>
        m.role === 'user' ? sanitizeChatAttachments(m.attachments, 4) : []
    );

    const allUniqueUrls: string[] = [];
    const seenAll = new Set<string>();
    for (const list of perMessageAttachments) {
        for (const url of list) {
            if (seenAll.has(url)) continue;
            seenAll.add(url);
            allUniqueUrls.push(url);
        }
    }
    const conversationInspoUrls = allUniqueUrls.slice(0, 5);

    // 2. Hydrate only the most recent 4 images from MinIO for Claude Vision
    const visionUrls = allUniqueUrls.slice(-MAX_VISION_IMAGES);
    const hydratedImages = new Map<string, { media_type: AnthropicImageMediaType; data: string }>();

    if (visionUrls.length > 0) {
        const fetched = await Promise.all(
            visionUrls.map(async (url) => {
                const key = extractUploadKey(url);
                if (!key) return null;
                const obj = await minioGetBuffer(key);
                if (!obj || obj.buffer.length === 0) return null;
                return { url, buffer: obj.buffer, contentType: obj.contentType };
            })
        );

        let runningBytes = 0;
        for (const item of fetched) {
            if (!item) continue;
            if (runningBytes + item.buffer.length > MAX_VISION_TOTAL_BYTES) continue;
            runningBytes += item.buffer.length;
            hydratedImages.set(item.url, {
                media_type: inferMediaType(item.url, item.contentType),
                data: item.buffer.toString('base64'),
            });
        }
    }

    // 3. Assemble alternating user/assistant messages with multimodal image blocks
    const out: AnthropicMessage[] = [];
    for (let i = 0; i < rawMessages.length; i++) {
        const m = rawMessages[i];
        if (m.role !== 'user' && m.role !== 'assistant') continue;

        const text = typeof m.content === 'string' ? m.content.trim() : '';
        const attachments = perMessageAttachments[i];
        if (!text && attachments.length === 0) continue;

        // Anthropic Messages API requires the first message to use the 'user' role
        if (out.length === 0 && m.role !== 'user') continue;

        if (m.role === 'user' && attachments.length > 0) {
            const blocks: AnthropicContentBlock[] = [];
            const fallbackRefs: string[] = [];

            for (const url of attachments) {
                const img = hydratedImages.get(url);
                if (img) {
                    blocks.push({
                        type: 'image',
                        source: { type: 'base64', media_type: img.media_type, data: img.data },
                    });
                } else {
                    fallbackRefs.push(url);
                }
            }

            const refNote = fallbackRefs.length > 0 ? `\n[Uploaded inspo photo URL(s): ${fallbackRefs.join(', ')}]` : '';
            const combinedText = `${text || 'Shared inspiration photo(s).'}${refNote}`.trim();
            blocks.push({ type: 'text', text: combinedText });

            const prev = out[out.length - 1];
            if (prev && prev.role === 'user') {
                const prevBlocks: AnthropicContentBlock[] =
                    typeof prev.content === 'string'
                        ? [{ type: 'text', text: prev.content }]
                        : prev.content;
                prev.content = [...prevBlocks, ...blocks];
            } else {
                out.push({ role: 'user', content: blocks });
            }
            continue;
        }

        const prev = out[out.length - 1];
        if (prev && prev.role === m.role) {
            if (typeof prev.content === 'string') {
                prev.content = `${prev.content}\n\n${text}`;
            } else {
                prev.content.push({ type: 'text', text });
            }
        } else {
            out.push({ role: m.role, content: text });
        }
    }

    return { apiMessages: out, conversationInspoUrls };
}

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

        const latestUserMessage = messages[messages.length - 1] as IncomingChatMessage | undefined;
        const latestAttachments = latestUserMessage?.role === 'user'
            ? sanitizeChatAttachments(latestUserMessage.attachments, 4)
            : [];
        const latestText = typeof latestUserMessage?.content === 'string' ? latestUserMessage.content.trim() : '';

        // ── Check if conversation is taken over by a human agent ─────
        if (existingConv?.isTakenOver) {
            if (latestUserMessage?.role === 'user' && (latestText || latestAttachments.length > 0)) {
                await prisma.chatMessage.create({
                    data: {
                        conversationId: currentConversationId!,
                        role: 'user',
                        content: latestText || '📷 Uploaded inspiration photo(s)',
                        attachments: latestAttachments,
                    },
                });
            }

            return NextResponse.json({
                reply: null,
                emote: 'happy',
                conversationId: currentConversationId,
                userName: finalUserName,
                bookingCard: null,
                attributionSaved: null,
                quickReplies: [],
                isTakenOver: true,
                agentName: existingConv.takenOverBy || 'Team Member',
            });
        }

        // Anthropic Claude Sonnet 5.5 API resolution
        const apiKey = process.env.ANTHROPIC_API_KEY;
        const model = KITTY_MODEL;
        if (process.env.ANTHROPIC_MODEL && process.env.ANTHROPIC_MODEL !== KITTY_MODEL) {
            console.warn(`[chat] ANTHROPIC_MODEL=${process.env.ANTHROPIC_MODEL} ignored; Kitty is pinned to ${KITTY_MODEL}`);
        }

        if (!apiKey) {
            console.error('[chat] Missing ANTHROPIC_API_KEY');
            return NextResponse.json({ error: 'Chatbot is currently offline.' }, { status: 500 });
        }

        // Build normalized alternating message history with Vision image blocks
        const { apiMessages, conversationInspoUrls } = await buildAnthropicMessagesWithVision(messages);
        if (apiMessages.length === 0) {
            return NextResponse.json({ error: 'No user message provided.' }, { status: 400 });
        }

        // ── Function calling loop (max 5 tool calls per turn) ────────
        let bookingCard: BookingCardData | undefined;
        let attributionSaved: AttributionSavedData | undefined;
        let availabilityWidget: AvailabilityWidgetData | undefined;
        let rawReply = '';
        const MAX_TOOL_ROUNDS = 5;
        const toolsUsed = new Set<string>();
        const systemPrompt = getSystemPrompt(finalUserName);

        for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
            const response = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                    'x-api-key': apiKey,
                    'anthropic-version': '2023-06-01',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model,
                    max_tokens: 1024,
                    output_config: { effort: 'low' },
                    system: systemPrompt,
                    messages: apiMessages,
                    tools: ANTHROPIC_TOOLS,
                }),
            });

            if (!response.ok) {
                const err = await response.text();
                console.error(`[chat] Anthropic (${model}) error:`, response.status, err);
                return NextResponse.json({ error: 'Failed to communicate with AI.' }, { status: 502 });
            }

            const data = await response.json();
            console.log(`[chat] model=${data.model || model}`);
            const contentBlocks: AnthropicContentBlock[] = Array.isArray(data.content) ? data.content : [];
            if (contentBlocks.length === 0) {
                return NextResponse.json({ error: 'Empty response from AI.' }, { status: 502 });
            }

            const toolUseBlocks = contentBlocks.filter(
                (b): b is Extract<AnthropicContentBlock, { type: 'tool_use' }> => b.type === 'tool_use'
            );

            // If the model wants to call tools
            if (toolUseBlocks.length > 0) {
                apiMessages.push({
                    role: 'assistant',
                    content: contentBlocks,
                });

                const toolResultBlocks: AnthropicContentBlock[] = [];

                for (const toolCall of toolUseBlocks) {
                    const fnName = toolCall.name;
                    toolsUsed.add(fnName);
                    const fnArgs: Record<string, unknown> =
                        toolCall.input && typeof toolCall.input === 'object' ? toolCall.input : {};

                    console.log(`[chat] Tool call: ${fnName}(${JSON.stringify(fnArgs)})`);

                    const toolResult = await executeTool(fnName, fnArgs, {
                        userId: dbUser?.id || null,
                        ip,
                        conversationId: currentConversationId,
                        conversationInspoUrls,
                    });

                    if (toolResult.bookingCard) {
                        bookingCard = toolResult.bookingCard;
                    }
                    if (toolResult.attributionSaved) {
                        attributionSaved = toolResult.attributionSaved;
                    }
                    if (toolResult.availabilityWidget) {
                        availabilityWidget = toolResult.availabilityWidget;
                    }

                    toolResultBlocks.push({
                        type: 'tool_result',
                        tool_use_id: toolCall.id,
                        content: toolResult.result,
                    });
                }

                apiMessages.push({
                    role: 'user',
                    content: toolResultBlocks,
                });

                continue;
            }

            // No tool calls — extract the final text response
            rawReply = contentBlocks
                .filter((b): b is Extract<AnthropicContentBlock, { type: 'text' }> => b.type === 'text')
                .map((b) => b.text)
                .join('\n')
                .trim();
            break;
        }

        const extracted = extractKittyEmote(
            rawReply || "[emote:apologetic] I'm sorry, I got a bit tangled up! 🐱 Could you try asking me again?"
        );
        const reply = extracted.text || "I'm sorry, I got a bit tangled up! 🐱 Could you try asking me again?";
        const emote = bookingCard
            ? 'celebrate'
            : attributionSaved && extracted.emote === 'happy'
                ? 'love'
                : extracted.emote;

        // Save to DB (strip any [emote:...] tag before storing)
        if (currentConversationId && latestUserMessage?.role === 'user') {
            await prisma.chatMessage.createMany({
                data: [
                    {
                        conversationId: currentConversationId,
                        role: 'user',
                        content: latestText || (latestAttachments.length > 0 ? '📷 Uploaded inspiration photo(s)' : ''),
                        attachments: latestAttachments,
                    },
                    { conversationId: currentConversationId, role: 'assistant', content: reply },
                ],
            });
        }

        // Generate quick reply suggestions
        const quickReplies = getQuickReplies(reply, !!bookingCard, toolsUsed);

        return NextResponse.json({
            reply,
            emote,
            conversationId: currentConversationId,
            userName: finalUserName,
            bookingCard: bookingCard || null,
            attributionSaved: attributionSaved || null,
            availabilityWidget: bookingCard ? null : (availabilityWidget || null),
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
