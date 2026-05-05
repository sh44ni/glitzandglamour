// In-memory typing state for agent → customer real-time typing indicators.
// Uses globalThis so the Map survives Next.js module re-initialization in production.
// Same pattern as the Prisma client singleton.

const globalForTyping = globalThis as unknown as {
    __agentTypingMap?: Map<string, { agentName: string; at: number }>;
};

if (!globalForTyping.__agentTypingMap) {
    globalForTyping.__agentTypingMap = new Map();
}

const typingMap = globalForTyping.__agentTypingMap;

const TYPING_TTL_MS = 5000; // consider "typing" for 5s after last ping

export function setAgentTyping(conversationId: string, agentName: string) {
    typingMap.set(conversationId, { agentName, at: Date.now() });
}

export function clearAgentTyping(conversationId: string) {
    typingMap.delete(conversationId);
}

export function isAgentTyping(conversationId: string): { typing: boolean; agentName: string | null } {
    const entry = typingMap.get(conversationId);
    if (!entry) return { typing: false, agentName: null };

    if (Date.now() - entry.at > TYPING_TTL_MS) {
        typingMap.delete(conversationId);
        return { typing: false, agentName: null };
    }

    return { typing: true, agentName: entry.agentName };
}
