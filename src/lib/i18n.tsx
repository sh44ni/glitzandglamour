'use client';

import React, {
    createContext, useContext, useState, useEffect,
    useMemo, useCallback, ReactNode
} from 'react';
import en from '@/locales/en.json';
import es from '@/locales/es.json';

export type Locale = 'en' | 'es';

const dicts: Record<Locale, Record<string, unknown>> = {
    en: en as unknown as Record<string, unknown>,
    es: es as unknown as Record<string, unknown>,
};

interface I18nContext {
    locale: Locale;
    setLocale: (l: Locale) => void;
    t: (key: string, vars?: Record<string, string | number>) => string;
}

const I18nCtx = createContext<I18nContext | null>(null);

const STORAGE_KEY = 'glitz-lang';

function resolve(obj: Record<string, unknown>, key: string): string {
    const parts = key.split('.');
    let cur: unknown = obj;
    for (const p of parts) {
        if (cur == null || typeof cur !== 'object') return key;
        cur = (cur as Record<string, unknown>)[p];
    }
    return typeof cur === 'string' ? cur : key;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
    // Always start with 'en' to match SSR — effect corrects it immediately client-side
    const [locale, setLocaleRaw] = useState<Locale>('en');

    useEffect(() => {
        // Detect correct locale on client only
        const saved = localStorage.getItem(STORAGE_KEY) as Locale | null;
        if (saved === 'en' || saved === 'es') {
            setLocaleRaw(saved);
        } else {
            const lang = (navigator.language || navigator.languages?.[0] || 'en').toLowerCase();
            setLocaleRaw(lang.startsWith('es') ? 'es' : 'en');
        }
    }, []);

    const setLocale = useCallback((l: Locale) => {
        localStorage.setItem(STORAGE_KEY, l);
        setLocaleRaw(l);
        if (typeof document !== 'undefined') {
            document.documentElement.lang = l;
        }
    }, []);

    const t = useCallback((key: string, vars?: Record<string, string | number>): string => {
        let str = resolve(dicts[locale], key);
        // Fallback to English if key missing in current locale
        if (str === key) {
            str = resolve(dicts['en'], key);
        }
        if (vars) {
            Object.entries(vars).forEach(([k, v]) => {
                str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
            });
        }
        return str;
    }, [locale]);

    const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t]);

    return <I18nCtx.Provider value={value}>{children}</I18nCtx.Provider>;
}

export function useTranslation() {
    const ctx = useContext(I18nCtx);
    if (!ctx) {
        // Safe fallback when used outside provider (avoids crash)
        const fallback: I18nContext = {
            locale: 'en',
            setLocale: () => {},
            t: (key: string) => resolve(dicts['en'], key),
        };
        return fallback;
    }
    return ctx;
}
