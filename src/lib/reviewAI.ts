import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY_REVIEWS });

const SYSTEM_PROMPT = `You are JoJany, the warm and bubbly owner of Glitz & Glamour nail studio in Vista, CA.
You write heartfelt, genuine, and exciting messages to your clients after their appointments.
Your voice is personal, warm, enthusiastic, and uses emojis naturally (💅 💗 🫶 ✨ 💕 🌟 🎀).
You always make the client feel special and mention how much their review means to your small business.
Never sound corporate or generic. Write like you're personally texting a close friend.
Always include [REVIEW_LINK] exactly as written — this is where the review link will appear.`;

export async function generateReviewMessage(
    firstName: string,
    service: string,
    isFirstVisit: boolean
): Promise<{ sms: string; emailBody: string }> {
    const visitContext = isFirstVisit
        ? `This was their FIRST visit to the studio! Make them feel extra special. Mention they earned a $10 OFF code for their next visit just for leaving a review. Build real excitement about clicking the link.`
        : `This is a returning client you love. Remind them how much their review helps your small business grow and reach more clients. Make them feel appreciated and valued.`;

    const prompt = `Write a review request message for a client named ${firstName} who just got ${service || 'a service'} at Glitz & Glamour.
${visitContext}

Write TWO versions:
1. SMS: Warm and exciting, 1-3 sentences, 2-4 emojis, conversational. Must include [REVIEW_LINK] naturally in the text (e.g. "Tap here 👉 [REVIEW_LINK]"). Total length including [REVIEW_LINK] should be under 200 chars.
2. Email: 3-5 sentences in JoJany's personal voice, warm and enthusiastic with emojis. Must include [REVIEW_LINK] naturally as a clickable moment (e.g. "Click here: [REVIEW_LINK]").

Return ONLY valid JSON with no markdown: { "sms": "...", "emailBody": "..." }`;

    try {
        const chat = await groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                { role: 'user', content: prompt },
            ],
            response_format: { type: 'json_object' },
            max_tokens: 500,
            temperature: 0.9, // more creative, less formulaic
        });

        const content = JSON.parse(chat.choices[0].message.content || '{}');
        const smsRaw = content.sms || '';
        const emailRaw = content.emailBody || '';
        // Ensure [REVIEW_LINK] is present — append if AI forgot
        const ensureLink = (msg: string) =>
            msg.includes('[REVIEW_LINK]') ? msg : `${msg} \ud83d\udc49 [REVIEW_LINK]`;
        return {
            sms: ensureLink(smsRaw) || `Hey ${firstName}! \ud83d\udc97 We loved having you at Glitz & Glamour! You'd make my day by leaving a quick review \u2728 Tap here \ud83d\udc49 [REVIEW_LINK] — JoJany`,
            emailBody: ensureLink(emailRaw) || `Hey ${firstName}! \ud83d\udc97 Thank you so much for trusting me with your look. It truly means the world! If you have a moment, I'd love for you to share your experience: [REVIEW_LINK] \ud83e\udef6 — JoJany`,
        };
    } catch (err) {
        console.error('[Review AI] Groq failed, using fallback:', err);
        const discount = isFirstVisit ? ' Plus, as my first-time guest, you get $10 OFF your next visit for reviewing! \ud83c\udf80' : '';
        return {
            sms: `Hey ${firstName}! \ud83d\udc85 Thank you so much for your ${service || 'visit'} — you were an absolute vibe!${discount} Tap to leave a quick review \u2728 \ud83d\udc49 [REVIEW_LINK] - JoJany`,
            emailBody: `Hey ${firstName}! \ud83d\udc97 I\'m so grateful you chose Glitz & Glamour for your ${service || 'appointment'}! Your honest review helps my small studio grow and reach more amazing clients like you.${isFirstVisit ? ' And as a special thank-you for your first visit, you\'ll get $10 OFF your next service when you review! \ud83c\udf89' : ''} Click here to share your experience: [REVIEW_LINK] \u2728 - JoJany`,
        };
    }
}

// Also export a version for the manual generator (no service name needed)
export async function generateManualReviewMessage(
    firstName: string,
    includeDiscount: boolean,
    service?: string
): Promise<{ sms: string; emailBody: string }> {
    return generateReviewMessage(firstName, service || 'your nails', includeDiscount);
}
