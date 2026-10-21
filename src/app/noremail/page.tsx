'use client';

import { useState, useRef, useEffect } from 'react';
import {
    Send,
    Lock,
    Bold,
    Italic,
    Link as LinkIcon,
    CheckCircle2,
    ChevronLeft,
    Sparkles,
    ShieldCheck,
    Mail,
    Code2,
    Eye,
} from 'lucide-react';
import Link from 'next/link';

export default function NoremailComposerPage() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isChecking, setIsChecking] = useState(true);
    const [error, setError] = useState('');

    const [to, setTo] = useState('');
    const [subject, setSubject] = useState('');
    const [html, setHtml] = useState('');

    const [activeTab, setActiveTab] = useState<'source' | 'preview'>('source');

    const [isSending, setIsSending] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Check admin session on load — validates JWT server-side via a protected admin endpoint
    useEffect(() => {
        fetch('/api/admin/auth', { method: 'GET', credentials: 'include' })
            .then((r) => {
                setIsAuthenticated(r.ok);
                setIsChecking(false);
            })
            .catch(() => {
                setIsAuthenticated(false);
                setIsChecking(false);
            });
    }, []);

    const insertTag = (openTag: string, closeTag: string) => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = html.substring(start, end);
        const newText =
            html.substring(0, start) + openTag + selectedText + closeTag + html.substring(end);

        setHtml(newText);

        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + openTag.length, end + openTag.length);
        }, 0);
    };

    const handleInsertLink = () => {
        const url = prompt('Enter the full URL (e.g., https://www.glitzandglamours.com):');
        if (url) {
            insertTag(`<a href="${url}" style="color: #FF2D78; text-decoration: underline;">`, '</a>');
        }
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!to || !subject || !html) {
            setError('Please fill out all fields.');
            return;
        }

        setIsSending(true);
        setError('');
        setSuccessMessage('');

        try {
            const res = await fetch('/api/noremail', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ to, subject, html }),
            });

            const data = await res.json();

            if (res.ok) {
                setSuccessMessage('Email dispatched successfully!');
                setTo('');
                setSubject('');
                setHtml('');
            } else {
                setError(data.error || 'Failed to send email.');
            }
        } catch {
            setError('An unexpected error occurred.');
        } finally {
            setIsSending(false);
        }
    };

    const inputStyle: React.CSSProperties = {
        width: '100%',
        padding: '14px 16px',
        borderRadius: '12px',
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 138, 184, 0.28)',
        color: '#ffffff',
        outline: 'none',
        fontFamily: 'Poppins, sans-serif',
        fontSize: '14px',
        marginBottom: '16px',
        boxSizing: 'border-box',
    };

    return (
        <section
            style={{
                minHeight: 'calc(100dvh - 80px)',
                background:
                    'radial-gradient(circle at 50% 0%, rgba(255, 45, 120, 0.14) 0%, rgba(32, 15, 26, 0.4) 42%, #0a0609 100%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'flex-start',
                padding: 'clamp(36px, 7vw, 72px) 16px 80px',
                fontFamily: 'Poppins, sans-serif',
                boxSizing: 'border-box',
                width: '100%',
                overflowX: 'hidden',
            }}
        >
            <style>{`
                @keyframes nrSpin { to { transform: rotate(360deg); } }
                .nr-input:focus { border-color: #ff8ab8 !important; box-shadow: 0 0 0 3px rgba(255, 138, 184, 0.15); }
            `}</style>

            {/* 2.0 Dark Glam Editorial Header — Always present for SSR, SEO & Accessibility */}
            <header
                style={{
                    maxWidth: '640px',
                    width: '100%',
                    textAlign: 'center',
                    marginBottom: '28px',
                }}
            >
                <div
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '6px 14px',
                        borderRadius: '999px',
                        background: 'rgba(255, 45, 120, 0.12)',
                        border: '1px solid rgba(255, 138, 184, 0.3)',
                        color: '#ff8ab8',
                        fontSize: '11px',
                        fontWeight: 700,
                        letterSpacing: '0.14em',
                        textTransform: 'uppercase',
                        marginBottom: '14px',
                    }}
                >
                    <Sparkles size={13} color="#E2C286" />
                    Studio Communications Console
                </div>

                <h1
                    style={{
                        fontFamily: 'Poppins, sans-serif',
                        fontWeight: 800,
                        fontSize: 'clamp(24px, 5.5vw, 34px)',
                        lineHeight: 1.2,
                        color: '#ffffff',
                        letterSpacing: '-0.02em',
                        margin: '0 0 10px',
                    }}
                >
                    Official Studio Email Composer{' '}
                    <span
                        style={{
                            display: 'block',
                            fontSize: 'clamp(15px, 3.6vw, 19px)',
                            fontWeight: 600,
                            color: '#ff8ab8',
                            marginTop: '4px',
                        }}
                    >
                        Glitz &amp; Glamour Studio
                    </span>
                </h1>

                <p
                    style={{
                        fontFamily: 'Poppins, sans-serif',
                        color: '#e2d6dc',
                        fontSize: '14px',
                        lineHeight: 1.65,
                        margin: '0 auto',
                        maxWidth: '48ch',
                    }}
                >
                    Protected administrative HTML dispatch portal for client notifications, special event follow-ups,
                    and studio announcements.
                </p>
            </header>

            {isChecking && (
                <div
                    role="status"
                    aria-live="polite"
                    style={{
                        position: 'relative',
                        overflow: 'hidden',
                        background: 'linear-gradient(155deg, rgba(32, 15, 26, 0.92), rgba(14, 7, 12, 0.96))',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '24px',
                        padding: '44px 28px',
                        width: '100%',
                        maxWidth: '440px',
                        textAlign: 'center',
                        boxShadow: '0 24px 60px rgba(0, 0, 0, 0.5)',
                    }}
                >
                    <div
                        aria-hidden="true"
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: '10%',
                            right: '10%',
                            height: '1px',
                            background:
                                'linear-gradient(90deg, transparent, rgba(255, 138, 184, 0.6), rgba(226, 194, 134, 0.5), transparent)',
                        }}
                    />
                    <div
                        style={{
                            width: '44px',
                            height: '44px',
                            borderRadius: '50%',
                            border: '3px solid rgba(255, 138, 184, 0.22)',
                            borderTopColor: '#ff8ab8',
                            animation: 'nrSpin 0.8s linear infinite',
                            margin: '0 auto 16px',
                        }}
                    />
                    <h2
                        style={{
                            color: '#ffffff',
                            fontSize: '18px',
                            fontWeight: 700,
                            margin: '0 0 6px',
                        }}
                    >
                        Checking Authentication
                    </h2>
                    <p style={{ color: '#e2d6dc', fontSize: '14px', margin: 0 }}>
                        Verifying active studio administrator session…
                    </p>
                </div>
            )}

            {!isChecking && !isAuthenticated && (
                <div
                    style={{
                        position: 'relative',
                        overflow: 'hidden',
                        background: 'linear-gradient(155deg, rgba(32, 15, 26, 0.92), rgba(14, 7, 12, 0.96))',
                        padding: 'clamp(32px, 6vw, 44px) clamp(22px, 5vw, 34px)',
                        borderRadius: '24px',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        width: '100%',
                        maxWidth: '440px',
                        textAlign: 'center',
                        boxShadow: '0 24px 60px rgba(0, 0, 0, 0.5)',
                    }}
                >
                    <div
                        aria-hidden="true"
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: '10%',
                            right: '10%',
                            height: '1px',
                            background:
                                'linear-gradient(90deg, transparent, rgba(255, 138, 184, 0.6), rgba(226, 194, 134, 0.5), transparent)',
                        }}
                    />

                    <div
                        style={{
                            width: '60px',
                            height: '60px',
                            borderRadius: '18px',
                            background: 'rgba(255, 45, 120, 0.14)',
                            border: '1px solid rgba(255, 138, 184, 0.35)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 18px',
                            color: '#ff8ab8',
                        }}
                    >
                        <Lock size={26} />
                    </div>

                    <h2
                        style={{
                            color: '#ffffff',
                            fontSize: '22px',
                            fontWeight: 800,
                            margin: '0 0 8px',
                        }}
                    >
                        Admin Access Required
                    </h2>
                    <p
                        style={{
                            color: '#e2d6dc',
                            fontSize: '14px',
                            lineHeight: 1.65,
                            margin: '0 0 24px',
                        }}
                    >
                        You must be signed in with an authorized studio administrator account to access the HTML email
                        composer.
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <a
                            href="/admin/login"
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                width: '100%',
                                padding: '14px 20px',
                                fontSize: '15px',
                                fontWeight: 700,
                                color: '#ffffff',
                                background: 'linear-gradient(135deg, #d81b60 0%, #a01347 100%)',
                                border: '1px solid rgba(255, 138, 184, 0.4)',
                                borderRadius: '14px',
                                textDecoration: 'none',
                                boxSizing: 'border-box',
                            }}
                        >
                            <Lock size={16} /> Go to Admin Login
                        </a>

                        <Link
                            href="/"
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '6px',
                                padding: '10px 16px',
                                color: '#dfd2d9',
                                textDecoration: 'none',
                                fontSize: '13px',
                                fontWeight: 600,
                            }}
                        >
                            <ChevronLeft size={15} /> Back to Glitz &amp; Glamour Studio
                        </Link>
                    </div>
                </div>
            )}

            {!isChecking && isAuthenticated && (
                <div
                    style={{
                        position: 'relative',
                        overflow: 'hidden',
                        maxWidth: '820px',
                        width: '100%',
                        margin: '0 auto',
                        background: 'linear-gradient(155deg, rgba(32, 15, 26, 0.92), rgba(14, 7, 12, 0.96))',
                        borderRadius: '24px',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        padding: 'clamp(22px, 5vw, 36px)',
                        boxShadow: '0 24px 60px rgba(0, 0, 0, 0.5)',
                        boxSizing: 'border-box',
                    }}
                >
                    <div
                        aria-hidden="true"
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: '10%',
                            right: '10%',
                            height: '1px',
                            background:
                                'linear-gradient(90deg, transparent, rgba(255, 138, 184, 0.6), rgba(226, 194, 134, 0.5), transparent)',
                        }}
                    />

                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            flexWrap: 'wrap',
                            gap: '12px',
                            marginBottom: '28px',
                            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                            paddingBottom: '20px',
                        }}
                    >
                        <div>
                            <Link
                                href="/"
                                style={{
                                    color: '#dfd2d9',
                                    textDecoration: 'none',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    fontSize: '13px',
                                    fontWeight: 600,
                                    marginBottom: '8px',
                                }}
                            >
                                <ChevronLeft size={14} /> Back to Site
                            </Link>
                            <h2
                                style={{
                                    color: '#ffffff',
                                    fontSize: 'clamp(20px, 4vw, 24px)',
                                    fontWeight: 800,
                                    margin: 0,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                }}
                            >
                                <Mail size={22} color="#ff8ab8" /> Dispatch Message
                            </h2>
                            <p style={{ color: '#e2d6dc', fontSize: '13px', margin: '4px 0 0' }}>
                                Sending strictly from:{' '}
                                <strong style={{ color: '#ff8ab8' }}>pakvisa.noreply@glitzandglamours.com</strong>
                            </p>
                        </div>
                    </div>

                    {successMessage && (
                        <div
                            role="status"
                            style={{
                                background: 'rgba(0, 212, 120, 0.12)',
                                border: '1px solid rgba(0, 212, 120, 0.35)',
                                color: '#6ee7b7',
                                padding: '16px',
                                borderRadius: '12px',
                                marginBottom: '24px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                fontSize: '14px',
                                fontWeight: 600,
                            }}
                        >
                            <CheckCircle2 size={18} /> {successMessage}
                        </div>
                    )}

                    {error && (
                        <div
                            role="alert"
                            style={{
                                background: 'rgba(255, 45, 120, 0.12)',
                                border: '1px solid rgba(255, 138, 184, 0.35)',
                                color: '#ff8ab8',
                                padding: '16px',
                                borderRadius: '12px',
                                marginBottom: '24px',
                                fontSize: '14px',
                                fontWeight: 600,
                            }}
                        >
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSend}>
                        <div style={{ display: 'grid', gap: '6px' }}>
                            <label
                                htmlFor="noremail-to"
                                style={{ fontSize: '13px', color: '#dfd2d9', fontWeight: 600, marginLeft: '4px' }}
                            >
                                To (comma separated for multiple)
                            </label>
                            <input
                                id="noremail-to"
                                className="nr-input"
                                type="text"
                                placeholder="recipient@example.com"
                                value={to}
                                onChange={(e) => setTo(e.target.value)}
                                style={inputStyle}
                            />
                        </div>

                        <div style={{ display: 'grid', gap: '6px' }}>
                            <label
                                htmlFor="noremail-subject"
                                style={{ fontSize: '13px', color: '#dfd2d9', fontWeight: 600, marginLeft: '4px' }}
                            >
                                Subject
                            </label>
                            <input
                                id="noremail-subject"
                                className="nr-input"
                                type="text"
                                placeholder="Email Subject"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                style={inputStyle}
                            />
                        </div>

                        <div style={{ display: 'grid', gap: '6px', marginBottom: '24px' }}>
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    flexWrap: 'wrap',
                                    gap: '8px',
                                    marginBottom: '8px',
                                }}
                            >
                                <label
                                    htmlFor="noremail-body"
                                    style={{ fontSize: '13px', color: '#dfd2d9', fontWeight: 600, marginLeft: '4px' }}
                                >
                                    Message Body (HTML Supported)
                                </label>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('source')}
                                        style={{
                                            background:
                                                activeTab === 'source'
                                                    ? 'rgba(255, 45, 120, 0.22)'
                                                    : 'rgba(255, 255, 255, 0.05)',
                                            color: activeTab === 'source' ? '#ff8ab8' : '#dfd2d9',
                                            border: '1px solid',
                                            borderColor:
                                                activeTab === 'source'
                                                    ? 'rgba(255, 138, 184, 0.4)'
                                                    : 'rgba(255, 255, 255, 0.1)',
                                            borderRadius: '8px',
                                            padding: '6px 12px',
                                            fontSize: '12px',
                                            fontWeight: 600,
                                            cursor: 'pointer',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            fontFamily: 'Poppins, sans-serif',
                                        }}
                                    >
                                        <Code2 size={14} /> Source Code
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('preview')}
                                        style={{
                                            background:
                                                activeTab === 'preview'
                                                    ? 'rgba(255, 45, 120, 0.22)'
                                                    : 'rgba(255, 255, 255, 0.05)',
                                            color: activeTab === 'preview' ? '#ff8ab8' : '#dfd2d9',
                                            border: '1px solid',
                                            borderColor:
                                                activeTab === 'preview'
                                                    ? 'rgba(255, 138, 184, 0.4)'
                                                    : 'rgba(255, 255, 255, 0.1)',
                                            borderRadius: '8px',
                                            padding: '6px 12px',
                                            fontSize: '12px',
                                            fontWeight: 600,
                                            cursor: 'pointer',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            fontFamily: 'Poppins, sans-serif',
                                        }}
                                    >
                                        <Eye size={14} /> Live Preview
                                    </button>
                                </div>
                            </div>

                            <div
                                style={{
                                    border: '1px solid rgba(255, 138, 184, 0.28)',
                                    borderRadius: '14px',
                                    overflow: 'hidden',
                                }}
                            >
                                {/* Toolbar */}
                                <div
                                    style={{
                                        background: 'rgba(255, 45, 120, 0.1)',
                                        padding: '8px 10px',
                                        borderBottom: '1px solid rgba(255, 138, 184, 0.2)',
                                        display: 'flex',
                                        flexWrap: 'wrap',
                                        gap: '8px',
                                    }}
                                >
                                    <button
                                        type="button"
                                        onClick={() => insertTag('<b>', '</b>')}
                                        aria-label="Insert Bold Tag"
                                        title="Bold"
                                        style={{
                                            background: 'rgba(255, 255, 255, 0.06)',
                                            border: '1px solid rgba(255, 255, 255, 0.1)',
                                            color: '#ffffff',
                                            width: '34px',
                                            height: '34px',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <Bold size={16} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => insertTag('<i>', '</i>')}
                                        aria-label="Insert Italic Tag"
                                        title="Italic"
                                        style={{
                                            background: 'rgba(255, 255, 255, 0.06)',
                                            border: '1px solid rgba(255, 255, 255, 0.1)',
                                            color: '#ffffff',
                                            width: '34px',
                                            height: '34px',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <Italic size={16} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleInsertLink}
                                        aria-label="Insert Link Tag"
                                        title="Insert Link"
                                        style={{
                                            background: 'rgba(255, 255, 255, 0.06)',
                                            border: '1px solid rgba(255, 255, 255, 0.1)',
                                            color: '#ffffff',
                                            gap: '5px',
                                            padding: '0 12px',
                                            height: '34px',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '12px',
                                            fontWeight: 600,
                                            fontFamily: 'Poppins, sans-serif',
                                        }}
                                    >
                                        <LinkIcon size={14} /> Link
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => insertTag('<br/>', '')}
                                        aria-label="Insert Line Break Tag"
                                        title="Line Break"
                                        style={{
                                            background: 'rgba(255, 255, 255, 0.06)',
                                            border: '1px solid rgba(255, 255, 255, 0.1)',
                                            color: '#ffffff',
                                            fontSize: '12px',
                                            fontWeight: 700,
                                            padding: '0 10px',
                                            height: '34px',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            fontFamily: 'Poppins, sans-serif',
                                        }}
                                    >
                                        &lt;br&gt;
                                    </button>
                                </div>

                                {activeTab === 'source' ? (
                                    <textarea
                                        id="noremail-body"
                                        ref={textareaRef}
                                        placeholder="Paste your raw HTML here... It will send exactly as is."
                                        value={html}
                                        onChange={(e) => setHtml(e.target.value)}
                                        style={{
                                            ...inputStyle,
                                            border: 'none',
                                            borderRadius: '0',
                                            margin: 0,
                                            minHeight: '300px',
                                            resize: 'vertical',
                                            background: 'rgba(0, 0, 0, 0.28)',
                                        }}
                                    />
                                ) : (
                                    <div
                                        style={{
                                            minHeight: '300px',
                                            padding: '16px',
                                            background: '#ffffff',
                                            color: '#140810',
                                            overflowY: 'auto',
                                        }}
                                        dangerouslySetInnerHTML={{
                                            __html:
                                                html ||
                                                '<p style="color: #4a3842; text-align: center; margin-top: 40px;">Live preview of your HTML will render here.</p>',
                                        }}
                                    />
                                )}
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isSending}
                            style={{
                                width: '100%',
                                padding: '16px',
                                fontSize: '15px',
                                fontWeight: 700,
                                color: '#ffffff',
                                background: 'linear-gradient(135deg, #d81b60 0%, #a01347 100%)',
                                border: '1px solid rgba(255, 138, 184, 0.4)',
                                borderRadius: '14px',
                                cursor: isSending ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '10px',
                                opacity: isSending ? 0.7 : 1,
                                fontFamily: 'Poppins, sans-serif',
                            }}
                        >
                            {isSending ? (
                                'Sending Email…'
                            ) : (
                                <>
                                    Send Email <Send size={18} />
                                </>
                            )}
                        </button>
                    </form>
                </div>
            )}

            <div
                style={{
                    marginTop: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    color: '#c8b8c2',
                    fontSize: '12px',
                    textAlign: 'center',
                }}
            >
                <ShieldCheck size={15} color="#E2C286" style={{ flexShrink: 0 }} />
                <span>Authenticated Studio Dispatch · Glitz &amp; Glamour Studio</span>
            </div>
        </section>
    );
}
