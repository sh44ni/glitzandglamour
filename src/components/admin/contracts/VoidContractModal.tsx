'use client';

import { useState } from 'react';
import { X, AlertTriangle, Send, Phone, Mail, ShieldAlert, Loader2 } from 'lucide-react';

interface VoidContractModalProps {
    contract: {
        id: string;
        contractNumber: string | null;
        label: string | null;
        clientName: string | null;
        clientEmail: string | null;
        clientPhone: string | null;
        eventDate: string | null;
    };
    onClose: () => void;
    onVoided: () => void;
}

export default function VoidContractModal({ contract, onClose, onVoided }: VoidContractModalProps) {
    const [reasonInternal, setReasonInternal] = useState('');
    const [noteClient, setNoteClient] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const displayName = contract.clientName || contract.label || 'Client';
    const displayNum = contract.contractNumber || 'Agreement';

    async function handleVoid(e: React.FormEvent) {
        e.preventDefault();
        if (!reasonInternal.trim()) {
            setError('Please enter an internal reason for studio records.');
            return;
        }
        if (!noteClient.trim()) {
            setError('Please enter a note for the client explaining why the contract is voided.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const res = await fetch(`/api/admin/contracts/${contract.id}/void`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    reasonInternal: reasonInternal.trim(),
                    noteClient: noteClient.trim(),
                }),
            });

            const data = await res.json();
            if (!res.ok || !data.ok) {
                setError(data.error || 'Failed to void contract. Please try again.');
                return;
            }

            onVoided();
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
            background: 'rgba(0, 0, 0, 0.78)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
        }}>
            <div style={{
                width: '100%',
                maxWidth: '560px',
                background: 'linear-gradient(135deg, rgba(28, 14, 20, 0.95), rgba(16, 16, 22, 0.98))',
                border: '1px solid rgba(255, 60, 60, 0.35)',
                borderRadius: '24px',
                boxShadow: '0 24px 80px rgba(0, 0, 0, 0.8), 0 0 40px rgba(255, 45, 120, 0.15)',
                overflow: 'hidden',
                animation: 'scaleUp 0.25s ease-out',
            }}>
                {/* Header */}
                <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    padding: '24px 28px 16px',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{
                            width: '44px',
                            height: '44px',
                            borderRadius: '14px',
                            background: 'rgba(255, 60, 60, 0.12)',
                            border: '1px solid rgba(255, 60, 60, 0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#ff6b6b',
                            flexShrink: 0,
                        }}>
                            <ShieldAlert size={22} />
                        </div>
                        <div>
                            <h2 style={{
                                fontFamily: 'Poppins, sans-serif',
                                fontSize: '18px',
                                fontWeight: 700,
                                color: '#fff',
                                margin: 0,
                                letterSpacing: '-0.2px',
                            }}>
                                Void Contract
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
                <form onSubmit={handleVoid} style={{ padding: '24px 28px' }}>
                    {/* Warning Notice */}
                    <div style={{
                        background: 'rgba(255, 60, 60, 0.08)',
                        border: '1px solid rgba(255, 60, 60, 0.25)',
                        borderRadius: '14px',
                        padding: '14px 16px',
                        marginBottom: '20px',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '12px',
                    }}>
                        <AlertTriangle size={18} color="#ff6b6b" style={{ flexShrink: 0, marginTop: '2px' }} />
                        <div style={{ fontSize: '12px', color: '#ffc5c5', lineHeight: 1.5, fontFamily: 'Poppins, sans-serif' }}>
                            <strong style={{ color: '#fff', display: 'block', marginBottom: '2px' }}>This action is permanent</strong>
                            On confirmation, this agreement will be moved to the <strong>Voided Tab</strong> forever. The client&apos;s signing link will be immediately invalidated and the client will be notified via SMS and Email.
                        </div>
                    </div>

                    {/* Notification Channel Dispatch Preview */}
                    <div style={{
                        display: 'flex',
                        gap: '10px',
                        flexWrap: 'wrap',
                        marginBottom: '20px',
                    }}>
                        <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontSize: '11px',
                            fontWeight: 600,
                            padding: '6px 12px',
                            borderRadius: '50px',
                            background: contract.clientPhone ? 'rgba(0, 212, 120, 0.1)' : 'rgba(255, 255, 255, 0.04)',
                            border: `1px solid ${contract.clientPhone ? 'rgba(0, 212, 120, 0.3)' : 'rgba(255, 255, 255, 0.08)'}`,
                            color: contract.clientPhone ? '#00D478' : '#777',
                            fontFamily: 'Poppins, sans-serif',
                        }}>
                            <Phone size={12} />
                            {contract.clientPhone ? `SMS: ${contract.clientPhone}` : 'No phone on file (SMS skipped)'}
                        </div>
                        <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontSize: '11px',
                            fontWeight: 600,
                            padding: '6px 12px',
                            borderRadius: '50px',
                            background: contract.clientEmail ? 'rgba(92, 157, 237, 0.12)' : 'rgba(255, 255, 255, 0.04)',
                            border: `1px solid ${contract.clientEmail ? 'rgba(92, 157, 237, 0.35)' : 'rgba(255, 255, 255, 0.08)'}`,
                            color: contract.clientEmail ? '#5c9ded' : '#777',
                            fontFamily: 'Poppins, sans-serif',
                        }}>
                            <Mail size={12} />
                            {contract.clientEmail ? `Email: ${contract.clientEmail}` : 'No email on file (Email skipped)'}
                        </div>
                    </div>

                    {/* Field 1: Internal Reason */}
                    <div style={{ marginBottom: '18px' }}>
                        <label style={{
                            display: 'block',
                            fontFamily: 'Poppins, sans-serif',
                            fontSize: '12px',
                            fontWeight: 600,
                            color: '#ccc',
                            marginBottom: '6px',
                        }}>
                            Internal Studio Reason <span style={{ color: '#ff6b6b' }}>*</span>
                            <span style={{ fontSize: '11px', color: '#777', fontWeight: 400, marginLeft: '6px' }}>(Private · internal audit only)</span>
                        </label>
                        <input
                            type="text"
                            placeholder="e.g. Client requested cancellation due to date change"
                            value={reasonInternal}
                            onChange={(e) => setReasonInternal(e.target.value)}
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
                            }}
                        />
                    </div>

                    {/* Field 2: Client Note */}
                    <div style={{ marginBottom: '22px' }}>
                        <label style={{
                            display: 'block',
                            fontFamily: 'Poppins, sans-serif',
                            fontSize: '12px',
                            fontWeight: 600,
                            color: '#ccc',
                            marginBottom: '6px',
                        }}>
                            Note for Client <span style={{ color: '#ff6b6b' }}>*</span>
                            <span style={{ fontSize: '11px', color: '#FF6BA8', fontWeight: 400, marginLeft: '6px' }}>(Dispatched via Pingram SMS &amp; Email)</span>
                        </label>
                        <textarea
                            rows={3}
                            placeholder="e.g. As discussed, this agreement has been voided per your request. Please contact us when you are ready to book your new date!"
                            value={noteClient}
                            onChange={(e) => setNoteClient(e.target.value)}
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
                                padding: '12px 20px',
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
                                padding: '12px 24px',
                                borderRadius: '12px',
                                background: 'linear-gradient(135deg, #e11d48, #be123c)',
                                border: '1px solid rgba(255, 100, 100, 0.4)',
                                color: '#fff',
                                fontSize: '13px',
                                fontWeight: 700,
                                fontFamily: 'Poppins, sans-serif',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                                boxShadow: '0 4px 16px rgba(225, 29, 72, 0.35)',
                            }}
                        >
                            {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={15} />}
                            {loading ? 'Voiding & Disagreeing…' : 'Confirm & Void Contract 🚫'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
