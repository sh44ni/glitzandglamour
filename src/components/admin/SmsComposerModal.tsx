'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
    X, Send, MessageSquare, Check, AlertCircle,
    Phone, Loader2, ExternalLink
} from 'lucide-react';

interface SmsComposerModalProps {
    isOpen: boolean;
    onClose: () => void;
    recipientName: string;
    recipientPhone: string;
    bookingId?: string;
    serviceName?: string;
    appointmentDate?: string;
    appointmentTime?: string;
    onSmsSent?: (result: { trackingId?: string; booking?: any }) => void;
}

export default function SmsComposerModal({
    isOpen,
    onClose,
    recipientName,
    recipientPhone,
    bookingId,
    serviceName,
    appointmentDate,
    appointmentTime,
    onSmsSent,
}: SmsComposerModalProps) {
    const [message, setMessage] = useState('');
    const [includeSignature, setIncludeSignature] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successInfo, setSuccessInfo] = useState<{ trackingId?: string } | null>(null);

    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Format phone display
    const formattedPhone = useMemo(() => {
        if (!recipientPhone) return '';
        const digits = recipientPhone.replace(/\D/g, '');
        if (digits.length === 10) {
            return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
        }
        if (digits.length === 11 && digits.startsWith('1')) {
            return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
        }
        return recipientPhone;
    }, [recipientPhone]);

    // Reset state and focus textarea on open
    useEffect(() => {
        if (isOpen) {
            setError(null);
            setSuccessInfo(null);
            setIsSending(false);
            setMessage('');
            setTimeout(() => {
                textareaRef.current?.focus();
            }, 100);
        }
    }, [isOpen]);

    // Calculate final message and segments
    const signature = '\n— Glitz & Glamour Studio';
    const effectiveMessage = useMemo(() => {
        const trimmed = message.trim();
        if (!trimmed) return '';
        if (includeSignature && !trimmed.includes('Glitz & Glamour')) {
            return `${trimmed}${signature}`;
        }
        return trimmed;
    }, [message, includeSignature]);

    const charCount = effectiveMessage.length;
    const smsSegments = charCount === 0 ? 0 : charCount <= 160 ? 1 : Math.ceil(charCount / 153);

    // Send handler
    const handleSend = async () => {
        if (!effectiveMessage.trim()) {
            setError('Please enter a message to send.');
            return;
        }
        if (!recipientPhone.trim()) {
            setError('Recipient phone number is missing.');
            return;
        }

        setIsSending(true);
        setError(null);

        try {
            const res = await fetch('/api/admin/sms/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    phone: recipientPhone,
                    message: effectiveMessage,
                    bookingId: bookingId || undefined,
                    recipientName,
                }),
            });

            const data = await res.json();

            if (!res.ok || !data.success) {
                setError(data.error || 'Failed to dispatch SMS via Pingram.');
            } else {
                setSuccessInfo({ trackingId: data.trackingId });
                onSmsSent?.(data);

                // Auto-close after 2.4s
                setTimeout(() => {
                    onClose();
                }, 2400);
            }
        } catch (err: any) {
            setError(err?.message || 'Network error while contacting the SMS server.');
        } finally {
            setIsSending(false);
        }
    };

    // Keyboard shortcut: Ctrl+Enter or Cmd+Enter to send
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            if (!isSending && !successInfo) {
                handleSend();
            }
        }
    };

    if (!isOpen) return null;

    return (
        <div
            onClick={(e) => {
                if (e.target === e.currentTarget && !isSending) onClose();
            }}
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 350,
                background: 'rgba(3, 4, 8, 0.85)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '16px',
                animation: 'smsModalFade 0.18s ease-out',
            }}
        >
            <style>{`
                @keyframes smsModalFade {
                    from { opacity: 0; transform: scale(0.97); }
                    to { opacity: 1; transform: scale(1); }
                }
            `}</style>

            <div
                style={{
                    background: 'linear-gradient(180deg, #151622 0%, #0d0e17 100%)',
                    border: '1px solid rgba(56, 189, 248, 0.25)',
                    borderRadius: '22px',
                    width: '100%',
                    maxWidth: '540px',
                    maxHeight: '92vh',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: '0 24px 70px rgba(0, 0, 0, 0.85), 0 0 40px rgba(56, 189, 248, 0.15)',
                    overflow: 'hidden',
                    position: 'relative',
                }}
            >
                {/* Header Ambient Glow */}
                <div
                    style={{
                        position: 'absolute',
                        top: '-50px',
                        right: '20px',
                        width: '200px',
                        height: '100px',
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(56, 189, 248, 0.18) 0%, transparent 70%)',
                        filter: 'blur(35px)',
                        pointerEvents: 'none',
                    }}
                />

                {/* ─── MODAL HEADER ─────────────────────────────────────── */}
                <div
                    style={{
                        padding: '18px 22px 14px',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px',
                        position: 'relative',
                        zIndex: 2,
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div
                            style={{
                                width: '38px',
                                height: '38px',
                                borderRadius: '12px',
                                background: 'rgba(56, 189, 248, 0.12)',
                                border: '1px solid rgba(56, 189, 248, 0.3)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#38BDF8',
                                boxShadow: '0 0 16px rgba(56, 189, 248, 0.25)',
                            }}
                        >
                            <MessageSquare size={18} />
                        </div>

                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <h3
                                    style={{
                                        fontFamily: 'Poppins, sans-serif',
                                        fontSize: '16px',
                                        fontWeight: 700,
                                        color: '#fff',
                                        margin: 0,
                                        lineHeight: 1.2,
                                    }}
                                >
                                    SMS Composer
                                </h3>
                                <span
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        padding: '2px 8px',
                                        borderRadius: '8px',
                                        background: 'rgba(0, 212, 120, 0.12)',
                                        border: '1px solid rgba(0, 212, 120, 0.25)',
                                        color: '#00D478',
                                        fontFamily: 'Poppins, sans-serif',
                                        fontSize: '10px',
                                        fontWeight: 600,
                                    }}
                                >
                                    <span
                                        style={{
                                            width: '6px',
                                            height: '6px',
                                            borderRadius: '50%',
                                            background: '#00D478',
                                            boxShadow: '0 0 6px #00D478',
                                        }}
                                    />
                                    Pingram Gateway
                                </span>
                            </div>
                            <p
                                style={{
                                    fontFamily: 'Poppins, sans-serif',
                                    fontSize: '11px',
                                    color: '#888',
                                    margin: '2px 0 0',
                                }}
                            >
                                Direct automated dispatch from admin panel
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSending}
                        style={{
                            background: 'rgba(255, 255, 255, 0.06)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '50%',
                            width: '32px',
                            height: '32px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: isSending ? 'not-allowed' : 'pointer',
                            color: '#aaa',
                            transition: 'all 0.18s ease',
                        }}
                        onMouseOver={(e) => !isSending && (e.currentTarget.style.color = '#fff')}
                        onMouseOut={(e) => !isSending && (e.currentTarget.style.color = '#aaa')}
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* ─── MODAL BODY ───────────────────────────────────────── */}
                <div
                    style={{
                        padding: '18px 22px',
                        overflowY: 'auto',
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '16px',
                    }}
                >
                    {/* Recipient Details Card */}
                    <div
                        style={{
                            background: 'rgba(255, 255, 255, 0.03)',
                            border: '1px solid rgba(255, 255, 255, 0.07)',
                            borderRadius: '14px',
                            padding: '12px 14px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            flexWrap: 'wrap',
                            gap: '10px',
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div
                                style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '10px',
                                    background: 'rgba(255, 45, 120, 0.14)',
                                    border: '1px solid rgba(255, 45, 120, 0.25)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#FF2D78',
                                    fontFamily: 'Poppins, sans-serif',
                                    fontWeight: 700,
                                    fontSize: '13px',
                                }}
                            >
                                {recipientName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <span
                                        style={{
                                            fontFamily: 'Poppins, sans-serif',
                                            fontSize: '13px',
                                            fontWeight: 600,
                                            color: '#fff',
                                        }}
                                    >
                                        {recipientName}
                                    </span>
                                    {bookingId && (
                                        <span
                                            style={{
                                                fontSize: '10px',
                                                color: '#777',
                                                fontFamily: 'monospace',
                                            }}
                                        >
                                            #{bookingId.slice(0, 8)}
                                        </span>
                                    )}
                                </div>
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        marginTop: '1px',
                                    }}
                                >
                                    <Phone size={11} color="#38BDF8" />
                                    <span
                                        style={{
                                            fontFamily: 'monospace',
                                            fontSize: '12px',
                                            color: '#38BDF8',
                                            fontWeight: 600,
                                        }}
                                    >
                                        {formattedPhone}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Optional appointment preview badge */}
                        {(serviceName || appointmentDate) && (
                            <div
                                style={{
                                    fontSize: '11px',
                                    fontFamily: 'Poppins, sans-serif',
                                    color: '#aaa',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    background: 'rgba(0, 0, 0, 0.25)',
                                    padding: '4px 10px',
                                    borderRadius: '8px',
                                    border: '1px solid rgba(255, 255, 255, 0.05)',
                                }}
                            >
                                <span>💅 {serviceName || 'Service'}</span>
                                {appointmentDate && <span>· 📅 {appointmentDate}</span>}
                                {appointmentTime && <span>@ {appointmentTime}</span>}
                            </div>
                        )}
                    </div>

                    {/* Textarea Composer */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <label
                                style={{
                                    fontFamily: 'Poppins, sans-serif',
                                    fontSize: '11px',
                                    fontWeight: 600,
                                    color: '#888',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px',
                                }}
                            >
                                Message Body
                            </label>
                            <span
                                style={{
                                    fontFamily: 'monospace',
                                    fontSize: '11px',
                                    color: charCount > 160 ? '#f59e0b' : '#777',
                                    fontWeight: charCount > 160 ? 600 : 400,
                                }}
                            >
                                {charCount} / 160 chars ({smsSegments} segment{smsSegments === 1 ? '' : 's'})
                            </span>
                        </div>

                        <textarea
                            ref={textareaRef}
                            value={message}
                            onChange={(e) => {
                                setMessage(e.target.value);
                                setError(null);
                            }}
                            onKeyDown={handleKeyDown}
                            placeholder="Type your message here..."
                            rows={6}
                            disabled={isSending || !!successInfo}
                            style={{
                                width: '100%',
                                padding: '12px 14px',
                                borderRadius: '12px',
                                background: 'rgba(0, 0, 0, 0.4)',
                                border: error
                                    ? '1px solid rgba(239, 68, 68, 0.6)'
                                    : '1px solid rgba(255, 255, 255, 0.1)',
                                color: '#fff',
                                fontFamily: 'Poppins, sans-serif',
                                fontSize: '13px',
                                lineHeight: 1.5,
                                outline: 'none',
                                resize: 'vertical',
                                boxSizing: 'border-box',
                                transition: 'border-color 0.18s ease',
                            }}
                            onFocus={(e) => {
                                if (!error) e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.6)';
                            }}
                            onBlur={(e) => {
                                if (!error) e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                            }}
                        />

                        {/* Signature toggle */}
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                marginTop: '2px',
                            }}
                        >
                            <label
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '7px',
                                    cursor: 'pointer',
                                    fontFamily: 'Poppins, sans-serif',
                                    fontSize: '11px',
                                    color: '#aaa',
                                    userSelect: 'none',
                                }}
                            >
                                <input
                                    type="checkbox"
                                    checked={includeSignature}
                                    onChange={(e) => setIncludeSignature(e.target.checked)}
                                    style={{
                                        accentColor: '#38BDF8',
                                        cursor: 'pointer',
                                        width: '14px',
                                        height: '14px',
                                    }}
                                />
                                Include signature (<em>— Glitz & Glamour Studio</em>)
                            </label>

                            <span style={{ fontSize: '10px', color: '#555', fontFamily: 'Poppins, sans-serif' }}>
                                Press <kbd style={{ padding: '1px 4px', borderRadius: '4px', background: 'rgba(255,255,255,0.08)' }}>Ctrl+Enter</kbd> to send
                            </span>
                        </div>
                    </div>

                    {/* Success Alert Banner */}
                    {successInfo && (
                        <div
                            style={{
                                padding: '12px 14px',
                                borderRadius: '12px',
                                background: 'rgba(0, 212, 120, 0.12)',
                                border: '1px solid rgba(0, 212, 120, 0.3)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                color: '#00D478',
                                fontFamily: 'Poppins, sans-serif',
                                fontSize: '12px',
                                animation: 'smsModalFade 0.2s ease',
                            }}
                        >
                            <Check size={18} style={{ flexShrink: 0 }} />
                            <div style={{ flex: 1 }}>
                                <strong>SMS Dispatched Successfully!</strong>
                                <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#a7f3d0' }}>
                                    Delivered to Pingram gateway.
                                    {successInfo.trackingId && (
                                        <span> Tracking ID: <code style={{ fontFamily: 'monospace' }}>{successInfo.trackingId.slice(0, 14)}…</code></span>
                                    )}
                                    {bookingId && <span> · Logged to booking staff history.</span>}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Error Alert Banner */}
                    {error && (
                        <div
                            style={{
                                padding: '12px 14px',
                                borderRadius: '12px',
                                background: 'rgba(239, 68, 68, 0.12)',
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '10px',
                                color: '#ef4444',
                                fontFamily: 'Poppins, sans-serif',
                                fontSize: '12px',
                                animation: 'smsModalFade 0.2s ease',
                            }}
                        >
                            <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                            <div style={{ flex: 1 }}>
                                <strong>Delivery Error</strong>
                                <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#fca5a5' }}>
                                    {error}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* ─── MODAL FOOTER ─────────────────────────────────────── */}
                <div
                    style={{
                        padding: '14px 22px',
                        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                        background: 'rgba(10, 10, 16, 0.65)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px',
                        flexWrap: 'wrap',
                    }}
                >
                    {/* Fallback to native SMS app link */}
                    <a
                        href={`sms:${recipientPhone}`}
                        style={{
                            fontFamily: 'Poppins, sans-serif',
                            fontSize: '11px',
                            color: '#666',
                            textDecoration: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            transition: 'color 0.18s ease',
                        }}
                        onMouseOver={(e) => (e.currentTarget.style.color = '#38BDF8')}
                        onMouseOut={(e) => (e.currentTarget.style.color = '#666')}
                        title="Opens your device native Messages app with this phone number"
                    >
                        <span>Open device SMS app instead</span>
                        <ExternalLink size={10} />
                    </a>

                    {/* Action buttons */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSending}
                            style={{
                                padding: '8px 16px',
                                borderRadius: '10px',
                                background: 'rgba(255, 255, 255, 0.06)',
                                border: '1px solid rgba(255, 255, 255, 0.12)',
                                color: '#ccc',
                                fontFamily: 'Poppins, sans-serif',
                                fontSize: '12px',
                                fontWeight: 500,
                                cursor: isSending ? 'not-allowed' : 'pointer',
                                transition: 'all 0.18s ease',
                            }}
                        >
                            {successInfo ? 'Close' : 'Cancel'}
                        </button>

                        {!successInfo && (
                            <button
                                type="button"
                                onClick={handleSend}
                                disabled={isSending || !message.trim()}
                                style={{
                                    padding: '8px 20px',
                                    borderRadius: '10px',
                                    background: isSending || !message.trim()
                                        ? 'rgba(56, 189, 248, 0.2)'
                                        : 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                                    border: '1px solid rgba(56, 189, 248, 0.4)',
                                    color: '#fff',
                                    fontFamily: 'Poppins, sans-serif',
                                    fontSize: '12px',
                                    fontWeight: 600,
                                    cursor: isSending || !message.trim() ? 'not-allowed' : 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    boxShadow: isSending || !message.trim()
                                        ? 'none'
                                        : '0 4px 16px rgba(2, 132, 199, 0.35)',
                                    transition: 'all 0.18s ease',
                                }}
                            >
                                {isSending ? (
                                    <>
                                        <Loader2 size={13} className="animate-spin" />
                                        <span>Dispatching...</span>
                                    </>
                                ) : (
                                    <>
                                        <Send size={13} />
                                        <span>Send SMS</span>
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
