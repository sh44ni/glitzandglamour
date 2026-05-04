export type BlockUser = {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
    image?: string | null;
};

export type BlockLogEntry = {
    id: string;
    action: string; // "blocked" | "lifted" | "edited"
    reason: string;
    adminNote?: string | null;
    createdAt: string;
};

export type ClientBlock = {
    id: string;
    userId: string | null;
    user: BlockUser | null;
    guestName: string | null;
    guestEmail: string | null;
    guestPhone: string | null;
    reason: string;
    timeoutDays: number;
    expiresAt: string | null;
    liftedAt: string | null;
    liftedBy: string | null;
    liftReason: string | null;
    createdAt: string;
    updatedAt: string;
    logs: BlockLogEntry[];
};

export type FilterTab = 'active' | 'lifted' | 'all';

export function isActive(b: ClientBlock): boolean {
    if (b.liftedAt) return false;
    if (b.expiresAt && new Date(b.expiresAt) < new Date()) return false;
    return true;
}

export function formatExpiry(b: ClientBlock): string {
    if (b.liftedAt) return `Lifted ${new Date(b.liftedAt).toLocaleDateString()}`;
    if (!b.expiresAt) return 'Permanent block';
    const exp = new Date(b.expiresAt);
    if (exp < new Date()) return 'Expired';
    const days = Math.ceil((exp.getTime() - Date.now()) / 86400000);
    return `Expires in ${days}d`;
}

export const S = { fontFamily: 'Poppins, sans-serif' } as React.CSSProperties;
