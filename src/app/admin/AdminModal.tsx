'use client';

import React from 'react';
import { X } from 'lucide-react';

/**
 * Shared admin modal overlay.
 *
 * Standard properties:
 *  - Fixed fullscreen backdrop with consistent blur & opacity
 *  - Click-on-backdrop dismisses (unless `preventBackdropClose`)
 *  - Centered content panel with consistent styling
 *  - Round close button in the header
 *  - Subtle fade + scale entry animation
 *  - z-index hierarchy: 200 (modal), 300 (lightbox), 400 (confirm), 500 (loading)
 */
export default function AdminModal({
    children,
    onClose,
    maxWidth = 480,
    zIndex = 200,
    preventBackdropClose = false,
}: {
    children: React.ReactNode;
    onClose: () => void;
    maxWidth?: number;
    zIndex?: number;
    preventBackdropClose?: boolean;
}) {
    return (
        <>
            <style>{`
                @keyframes adminModalFadeIn {
                    from { opacity: 0; }
                    to   { opacity: 1; }
                }
                @keyframes adminModalScaleIn {
                    from { opacity: 0; transform: scale(0.97) translateY(6px); }
                    to   { opacity: 1; transform: scale(1) translateY(0); }
                }
            `}</style>
            <div
                onClick={e => {
                    if (!preventBackdropClose && e.target === e.currentTarget) onClose();
                }}
                style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex,
                    background: 'rgba(0,0,0,0.75)',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '16px',
                    animation: 'adminModalFadeIn 0.2s ease',
                }}
            >
                <div
                    style={{
                        background: '#141414',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '20px',
                        width: '100%',
                        maxWidth,
                        maxHeight: '90vh',
                        overflowY: 'auto',
                        boxShadow: '0 24px 56px rgba(0,0,0,0.7)',
                        animation: 'adminModalScaleIn 0.22s ease',
                    }}
                >
                    {children}
                </div>
            </div>
        </>
    );
}

/** Standard modal header with title + round close button */
export function AdminModalHeader({
    title,
    subtitle,
    onClose,
    disabled,
}: {
    title: string;
    subtitle?: string;
    onClose: () => void;
    disabled?: boolean;
}) {
    return (
        <div
            style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '24px 24px 0',
                marginBottom: '20px',
            }}
        >
            <div>
                <h2
                    style={{
                        fontFamily: 'Poppins, sans-serif',
                        fontWeight: 700,
                        color: '#fff',
                        fontSize: '18px',
                        margin: 0,
                        lineHeight: 1.3,
                    }}
                >
                    {title}
                </h2>
                {subtitle && (
                    <p
                        style={{
                            fontFamily: 'Poppins, sans-serif',
                            color: '#555',
                            fontSize: '12px',
                            marginTop: '2px',
                        }}
                    >
                        {subtitle}
                    </p>
                )}
            </div>
            <button
                onClick={onClose}
                disabled={disabled}
                aria-label="Close"
                style={{
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    flexShrink: 0,
                    color: '#aaa',
                    transition: 'background 0.15s',
                }}
            >
                <X size={15} />
            </button>
        </div>
    );
}

/** Standard modal body padding wrapper */
export function AdminModalBody({ children, noPad }: { children: React.ReactNode; noPad?: boolean }) {
    return (
        <div style={{ padding: noPad ? 0 : '0 24px 24px' }}>
            {children}
        </div>
    );
}

/** Fullscreen image lightbox overlay */
export function AdminLightbox({
    src,
    alt,
    onClose,
}: {
    src: string;
    alt?: string;
    onClose: () => void;
}) {
    return (
        <>
            <style>{`
                @keyframes adminModalFadeIn {
                    from { opacity: 0; }
                    to   { opacity: 1; }
                }
            `}</style>
            <div
                onClick={onClose}
                style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 300,
                    background: 'rgba(0,0,0,0.92)',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '20px',
                    cursor: 'zoom-out',
                    animation: 'adminModalFadeIn 0.2s ease',
                }}
            >
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '18px',
                        right: '18px',
                        background: 'rgba(255,255,255,0.08)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '50%',
                        width: '38px',
                        height: '38px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                    }}
                >
                    <X size={18} />
                </button>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={src}
                    alt={alt || 'Full size'}
                    style={{
                        maxWidth: '100%',
                        maxHeight: '88vh',
                        objectFit: 'contain',
                        borderRadius: '12px',
                    }}
                    onClick={e => e.stopPropagation()}
                />
            </div>
        </>
    );
}
