'use client';
import { useState } from 'react';
import { ChevronDown, ChevronUp, Clock, ShieldOff, ShieldCheck, Pencil, Trash2 } from 'lucide-react';
import { ClientBlock, S, isActive, formatExpiry } from './types';

const PINK = '#FF2D78';

function Avatar({ name, image }: { name: string, image?: string | null }) {
    return image
        ? <img src={image} alt={name} style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
        : <div style={{ width: 40, height: 40, borderRadius: '50%', flexShrink: 0, background: 'linear-gradient(135deg,#FF2D78,#7928CA)', display: 'flex', alignItems: 'center', justifyContent: 'center', ...S, fontWeight: 700, color: '#fff', fontSize: 16 }}>{(name || '?').charAt(0).toUpperCase()}</div>;
}

export default function BlockCard({
    block, onLift, onEdit, onDelete
}: {
    block: ClientBlock;
    onLift: (b: ClientBlock) => void;
    onEdit: (b: ClientBlock) => void;
    onDelete: (b: ClientBlock) => void;
}) {
    const [logsOpen, setLogsOpen] = useState(false);
    const active = isActive(block);
    const expiry = formatExpiry(block);

    const displayName = block.user?.name || block.guestName || 'Guest User';
    const displayEmail = block.user?.email || block.guestEmail;
    const displayPhone = block.user?.phone || block.guestPhone;
    const isGuest = !block.user;

    return (
        <div style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${active ? 'rgba(255,45,120,0.2)' : 'rgba(255,255,255,0.07)'}`, borderRadius: 16, overflow: 'hidden' }}>
            <div style={{ padding: '16px 18px' }}>
                {/* Top row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                    <Avatar name={displayName} image={block.user?.image} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                            <span style={{ ...S, fontWeight: 700, color: '#fff', fontSize: 14 }}>{displayName}</span>
                            {isGuest && <span style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 50, padding: '2px 8px', fontSize: 9, ...S, fontWeight: 600, color: '#bbb' }}>GUEST</span>}
                            {active
                                ? <span style={{ background: 'rgba(255,45,120,0.15)', border: '1px solid rgba(255,45,120,0.4)', borderRadius: 50, padding: '2px 8px', fontSize: 9, ...S, fontWeight: 700, color: PINK }}>■ BLOCKED</span>
                                : <span style={{ background: 'rgba(100,200,100,0.12)', border: '1px solid rgba(100,200,100,0.35)', borderRadius: 50, padding: '2px 8px', fontSize: 9, ...S, fontWeight: 700, color: '#4ade80' }}>✓ LIFTED</span>
                            }
                        </div>
                        <p style={{ ...S, color: PINK, fontSize: 13, fontWeight: 600, marginTop: 2 }}>{block.reason}</p>
                    </div>
                    {/* Actions */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
                        {active && (
                            <button onClick={() => onLift(block)} style={{ background: 'linear-gradient(135deg,#FF2D78,#7928CA)', border: 'none', borderRadius: 8, padding: '6px 12px', ...S, fontSize: 11, fontWeight: 700, color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                                <ShieldCheck size={11} /> Lift Block
                            </button>
                        )}
                        <div style={{ display: 'flex', gap: 5 }}>
                            <button onClick={() => onEdit(block)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 7, padding: '5px 9px', cursor: 'pointer', color: '#aaa', display: 'flex', alignItems: 'center', gap: 4, ...S, fontSize: 11 }}>
                                <Pencil size={10} /> Edit
                            </button>
                            <button onClick={() => onDelete(block)} style={{ background: 'rgba(255,45,60,0.07)', border: '1px solid rgba(255,45,60,0.2)', borderRadius: 7, padding: '5px 9px', cursor: 'pointer', color: '#ff6b6b', display: 'flex', alignItems: 'center', gap: 4, ...S, fontSize: 11 }}>
                                <Trash2 size={10} /> Delete
                            </button>
                        </div>
                    </div>
                </div>

                {/* Meta */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 16px' }}>
                    <span style={{ ...S, color: '#555', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={10} /> Added {new Date(block.createdAt).toLocaleDateString()}</span>
                    {displayEmail && <span style={{ ...S, color: '#555', fontSize: 11 }}>✉ {displayEmail}</span>}
                    {displayPhone && <span style={{ ...S, color: '#555', fontSize: 11 }}>✆ {displayPhone}</span>}
                    <span style={{ ...S, color: active ? '#FF2D78' : '#4ade80', fontSize: 11, fontWeight: 600 }}>{expiry}</span>
                </div>

                {/* Lift reason */}
                {block.liftReason && (
                    <p style={{ ...S, fontSize: 11, color: '#666', marginTop: 8, padding: '6px 10px', background: 'rgba(74,222,128,0.05)', border: '1px solid rgba(74,222,128,0.15)', borderRadius: 8 }}>
                        Lift note: {block.liftReason}
                    </p>
                )}
            </div>

            {/* Audit log toggle */}
            <button onClick={() => setLogsOpen(v => !v)} style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: 'none', borderTop: '1px solid rgba(255,255,255,0.05)', padding: '8px 18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', ...S, fontSize: 11, color: '#555' }}>
                <span>Audit Log ({block.logs.length})</span>
                {logsOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </button>

            {logsOpen && (
                <div style={{ padding: '0 18px 14px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {block.logs.length === 0
                        ? <p style={{ ...S, color: '#333', fontSize: 11 }}>No log entries.</p>
                        : block.logs.map((log, i) => (
                            <div key={log.id} style={{ background: 'rgba(0,0,0,0.25)', borderRadius: 8, padding: '8px 10px', borderLeft: `2px solid ${log.action === 'blocked' ? PINK : log.action === 'lifted' ? '#4ade80' : '#888'}` }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ ...S, fontWeight: 700, fontSize: 11, color: log.action === 'blocked' ? PINK : log.action === 'lifted' ? '#4ade80' : '#aaa', textTransform: 'uppercase' }}>
                                        {log.action === 'blocked' ? '🔒 Blocked' : log.action === 'lifted' ? '🔓 Lifted' : '✏️ Edited'}
                                    </span>
                                    <span style={{ ...S, color: '#444', fontSize: 10 }}>{new Date(log.createdAt).toLocaleString()}</span>
                                </div>
                                <p style={{ ...S, color: '#bbb', fontSize: 11, marginTop: 3 }}>{log.reason}</p>
                                {log.adminNote && <p style={{ ...S, color: '#555', fontSize: 10, marginTop: 2 }}>Note: {log.adminNote}</p>}
                            </div>
                        ))
                    }
                </div>
            )}
        </div>
    );
}
