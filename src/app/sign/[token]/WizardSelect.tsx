'use client';
import { useEffect, useRef, useState } from 'react';

export default function WizardSelect({
    options,
    value,
    onChange,
    placeholder = 'Select…',
}: {
    options: string[];
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
}) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [open]);

    const display = value || placeholder;
    const isPlaceholder = !value;

    return (
        <div className="wsWrap" ref={ref}>
            <button
                type="button"
                className={`wsTrigger${open ? ' wsOpen' : ''}`}
                onClick={() => setOpen((o) => !o)}
                aria-haspopup="listbox"
                aria-expanded={open}
            >
                <span className={isPlaceholder ? 'wsPlaceholder' : 'wsValue'}>{display}</span>
                <svg className={`wsChev${open ? ' wsChevUp' : ''}`} width="12" height="8" viewBox="0 0 12 8" fill="none">
                    <path d="M1 1.5L6 6.5L11 1.5" stroke="#FF6BA8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </button>
            {open && (
                <div className="wsMenu" role="listbox">
                    {options.map((opt) => {
                        const isActive = opt === value;
                        const label = opt || placeholder;
                        return (
                            <button
                                key={opt}
                                type="button"
                                role="option"
                                aria-selected={isActive}
                                className={`wsItem${isActive ? ' wsItemActive' : ''}${!opt ? ' wsItemPlaceholder' : ''}`}
                                onClick={() => {
                                    onChange(opt);
                                    setOpen(false);
                                }}
                            >
                                {label}
                                {isActive && <span className="wsCheck">✓</span>}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
