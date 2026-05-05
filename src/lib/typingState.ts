// In-memory typing state for agent → customer real-time typing indicators.
// No DB needed — typing state is ephemeral and only relevant for a few seconds.

const typingMap = new Map<string, { agentName: string; at: number }>();

const TYPING_TTL_MS = 4000; // consider "typing" for 4s after last ping

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
