'use client';

import { useEffect, useState } from 'react';
import { X, Download } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

type BeforeInstallPromptEvent = Event & {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

export default function PWAInstallPrompt() {
    const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [show, setShow] = useState(false);
    const [dismissed, setDismissed] = useState(false);
    const { t } = useTranslation();

    useEffect(() => {
        // Don't show if already installed (standalone mode)
        if (window.matchMedia('(display-mode: standalone)').matches) return;
        // Don't show if dismissed this session
        if (sessionStorage.getItem('pwa-dismissed')) return;

        const handler = (e: Event) => {
            e.preventDefault();
            setPrompt(e as BeforeInstallPromptEvent);
            // Show after 3 seconds to not interrupt first impression
            setTimeout(() => setShow(true), 3000);
        };

        window.addEventListener('beforeinstallprompt', handler);
        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    async function install() {
        if (!prompt) return;
        await prompt.prompt();
        const result = await prompt.userChoice;
        if (result.outcome === 'accepted') setShow(false);
        setPrompt(null);
    }

    function dismiss() {
        setShow(false);
        setDismissed(true);
        sessionStorage.setItem('pwa-dismissed', '1');
    }

    if (!show || dismissed) return null;

    return (
        <>
            <style>{`
                @keyframes slideUpBounce {
                    0% { transform: translateY(100%); opacity: 0; }
                    70% { transform: translateY(-6px); }
                    100% { transform: translateY(0); opacity: 1; }
                }
                .pwa-prompt {
                    animation: slideUpBounce 0.45s cubic-bezier(0.34,1.56,0.64,1) both;
                }
            `}</style>
            <div
                className="pwa-prompt"
                style={{
                    position: 'fixed',
                    bottom: 'calc(72px + env(safe-area-inset-bottom) + 12px)',
                    left: '16px', right: '16px',
                    zIndex: 999,
                    background: 'linear-gradient(135deg, #1a0a12 0%, #200d1a 100%)',
                    border: '1.5px solid rgba(255,45,120,0.35)',
                    borderRadius: '20px',
                    padding: '16px 18px',
                    boxShadow: '0 8px 40px rgba(0,0,0,0.7), 0 0 30px rgba(255,45,120,0.12)',
                    display: 'flex', alignItems: 'center', gap: '14px',
                }}
            >
                {/* App icon */}
                <div style={{
                    width: '48px', height: '48px', borderRadius: '12px', flexShrink: 0,
                    background: 'linear-gradient(135deg, #FF2D78, #CC1E5A)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 4px 16px rgba(255,45,120,0.4)',
                }}>
                    <img src="/new_bowdesign.svg" alt="Bow" width={32} height={32} style={{ objectFit: 'contain' }} />
                </div>

                {/* Text */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, color: '#fff', fontSize: '14px', marginBottom: '2px' }}>
                        {t('pwa.addToHome')}
                    </p>
                    <p style={{ fontFamily: 'Poppins, sans-serif', color: '#888', fontSize: '12px' }}>
                        {t('pwa.description')}
                    </p>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                    <button
                        onClick={install}
                        style={{
                            background: 'linear-gradient(135deg, #FF2D78, #CC1E5A)',
                            color: '#fff', border: 'none', borderRadius: '10px',
                            padding: '8px 14px', cursor: 'pointer',
                            fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '12px',
                            display: 'flex', alignItems: 'center', gap: '4px',
                            boxShadow: '0 4px 12px rgba(255,45,120,0.4)',
                        }}
                    >
                        <Download size={13} />
                        {t('common.install')}
                    </button>
                    <button
                        onClick={dismiss}
                        style={{
                            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '10px', padding: '8px', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                    >
                        <X size={14} color="#666" />
                    </button>
                </div>
            </div>
        </>
    );
}
