'use client';

import { useState } from 'react';
import { X, Archive, Loader2, Sparkles } from 'lucide-react';

interface ArchiveContractModalProps {
    contract: {
        id: string;
        contractNumber: string | null;
        label: string | null;
        clientName: string | null;
    };
    onClose: () => void;
    onArchived: () => void;
}

const PRESETS = [
    'Event Completed 🎉',
    'Past Season Archive 🗓️',
    'Client Cancelled Event ❌',
    'Duplicate / Test Contract 🧪',
    'Client Non-Responsive ⏳',
];

export default function ArchiveContractModal({ contract, onClose, onArchived }: ArchiveContractModalProps) {
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const displayName = contract.clientName || contract.label || 'Client';
    const displayNum = contract.contractNumber || 'Agreement';

    async function handleArchive(e: React.FormEvent) {
        e.preventDefault();
        if (!reason.trim()) {
            setError('Please provide a reason to move this contract to archive.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const res = await fetch(`/api/admin/contracts/${contract.id}/archive`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    archiveReason: reason.trim(),
                }),
            });

            const data = await res.json();
            if (!res.ok || !data.ok) {
                setError(data.error || 'Failed to archive contract. Please try again.');
                return;
            }

            onArchived();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
        }}>
            <div style={{
                width: '100%',
                maxWidth: '520px',
                background: 'linear-gradient(135deg, rgba(22, 22, 30, 0.96), rgba(14, 14, 20, 0.98))',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '24px',
                boxShadow: '0 24px 80px rgba(0, 0, 0, 0.8), 0 0 30px rgba(255, 45, 120, 0.08)',
                overflow: 'hidden',
                animation: 'scaleUp 0.25s ease-out',
            }}>
                {/* Header */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '22px 26px 16px',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.07)',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{
                            width: '42px',
                            height: '42px',
                            borderRadius: '12px',
                            background: 'rgba(255, 183, 0, 0.12)',
                            border: '1px solid rgba(255, 183, 0, 0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#FFB700',
                            flexShrink: 0,
                        }}>
                            <Archive size={20} />
                        </div>
                        <div>
                            <h2 style={{
                                fontFamily: 'Poppins, sans-serif',
                                fontSize: '17px',
                                fontWeight: 700,
                                color: '#fff',
                                margin: 0,
                            }}>
                                Archive Contract
                            </h2>
                            <p style={{
                                fontFamily: 'Poppins, sans-serif',
                                fontSize: '12px',
                                color: '#888',
                                margin: '2px 0 0',
                            }}>
                                {displayNum} · {displayName}
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        style={{
                            background: 'rgba(255, 255, 255, 0.06)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '50%',
                            width: '32px',
                            height: '32px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#aaa',
                            cursor: 'pointer',
                        }}
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleArchive} style={{ padding: '22px 26px' }}>
                    <p style={{
                        fontSize: '13px',
                        color: '#aaa',
                        lineHeight: 1.5,
                        margin: '0 0 16px',
                        fontFamily: 'Poppins, sans-serif',
                    }}>
                        Archiving removes this contract from the active roster and preserves it cleanly in the <strong>Archived Tab</strong>. You can restore it anytime.
                    </p>

                    {/* Quick Reason Presets */}
                    <div style={{ marginBottom: '14px' }}>
                        <label style={{
                            display: 'block',
                            fontSize: '11px',
                            fontWeight: 600,
                            color: '#888',
                            textTransform: 'uppercase',
                            letterSpacing: '0.4px',
                            marginBottom: '8px',
                            fontFamily: 'Poppins, sans-serif',
                        }}>
                            Quick Reason Presets
                        </label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            {PRESETS.map((p) => (
                                <button
                                    key={p}
                                    type="button"
                                    onClick={() => setReason(p)}
                                    style={{
                                        fontSize: '11px',
                                        fontWeight: 600,
                                        fontFamily: 'Poppins, sans-serif',
                                        padding: '5px 12px',
                                        borderRadius: '50px',
                                        background: reason === p ? 'rgba(255, 45, 120, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                                        border: `1px solid ${reason === p ? 'rgba(255, 45, 120, 0.45)' : 'rgba(255, 255, 255, 0.08)'}`,
                                        color: reason === p ? '#FF6BA8' : '#bbb',
                                        cursor: 'pointer',
                                        transition: 'all 0.15s ease',
                                    }}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Custom Reason Text */}
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{
                            display: 'block',
                            fontFamily: 'Poppins, sans-serif',
                            fontSize: '12px',
                            fontWeight: 600,
                            color: '#ccc',
                            marginBottom: '6px',
                        }}>
                            Archive Reason <span style={{ color: '#FFB700' }}>*</span>
                        </label>
                        <textarea
                            rows={3}
                            placeholder="State why this contract is being moved to archive..."
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            disabled={loading}
                            style={{
                                width: '100%',
                                boxSizing: 'border-box',
                                background: 'rgba(255, 255, 255, 0.04)',
                                border: '1px solid rgba(255, 255, 255, 0.12)',
                                borderRadius: '12px',
                                padding: '12px 14px',
                                color: '#fff',
                                fontSize: '13px',
                                fontFamily: 'Poppins, sans-serif',
                                outline: 'none',
                                resize: 'vertical',
                            }}
                        />
                    </div>

                    {error && (
                        <div style={{
                            color: '#ff6b6b',
                            fontSize: '12px',
                            fontFamily: 'Poppins, sans-serif',
                            marginBottom: '16px',
                            padding: '10px 14px',
                            background: 'rgba(255, 60, 60, 0.1)',
                            borderRadius: '10px',
                            border: '1px solid rgba(255, 60, 60, 0.3)',
                        }}>
                            {error}
                        </div>
                    )}

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            style={{
                                padding: '11px 18px',
                                borderRadius: '12px',
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid rgba(255, 255, 255, 0.12)',
                                color: '#ccc',
                                fontSize: '13px',
                                fontWeight: 600,
                                fontFamily: 'Poppins, sans-serif',
                                cursor: 'pointer',
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                padding: '11px 22px',
                                borderRadius: '12px',
                                background: 'linear-gradient(135deg, #d97706, #b45309)',
                                border: '1px solid rgba(245, 158, 11, 0.4)',
                                color: '#fff',
                                fontSize: '13px',
                                fontWeight: 700,
                                fontFamily: 'Poppins, sans-serif',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                                boxShadow: '0 4px 16px rgba(217, 119, 6, 0.3)',
                            }}
                        >
                            {loading ? <Loader2 size={16} className="animate-spin" /> : <Archive size={15} />}
                            {loading ? 'Archiving…' : 'Move to Archive 📦'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
