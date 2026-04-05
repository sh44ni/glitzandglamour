'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import en from '@/locales/en.json';
import es from '@/locales/es.json';

type Locale = 'en' | 'es';
type Translations = typeof en;

const dictionaries: Record<Locale, Translations> = { en, es };

interface I18nContext {
    locale: Locale;
    setLocale: (l: Locale) => void;
    t: (key: string, vars?: Record<string, string | number>) => string;
}

const I18nCtx = createContext<I18nContext>({
    locale: 'en',
    setLocale: () => {},
    t: (key) => key,
});

function detectLocale(): Locale {
    if (typeof window === 'undefined') return 'en';
    // 1. Check localStorage (user explicit choice takes priority)
    const saved = localStorage.getItem('glitz-lang') as Locale | null;
    if (saved === 'en' || saved === 'es') return saved;
    // 2. Detect from browser/phone language
    const lang = navigator.language || (navigator as any).userLanguage || 'en';
    return lang.toLowerCase().startsWith('es') ? 'es' : 'en';
}

function getNestedValue(obj: Record<string, unknown>, key: string): string {
    const parts = key.split('.');
    let current: unknown = obj;
    for (const part of parts) {
        if (current == null || typeof current !== 'object') return key;
        current = (current as Record<string, unknown>)[part];
    }
    return typeof current === 'string' ? current : key;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [locale, setLocaleState] = useState<Locale>('en');

    useEffect(() => {
        setLocaleState(detectLocale());
    }, []);

    const setLocale = (l: Locale) => {
        localStorage.setItem('glitz-lang', l);
        setLocaleState(l);
        // Update html lang attribute
        if (typeof document !== 'undefined') {
            document.documentElement.lang = l;
        }
    };

    const t = (key: string, vars?: Record<string, string | number>): string => {
        const dict = dictionaries[locale] as unknown as Record<string, unknown>;
        let str = getNestedValue(dict, key);
        if (str === key) {
            // Fallback to English
            const enDict = dictionaries['en'] as unknown as Record<string, unknown>;
            str = getNestedValue(enDict, key);
        }
        if (vars) {
            Object.entries(vars).forEach(([k, v]) => {
                str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
            });
        }
        return str;
    };

    return (
        <I18nCtx.Provider value={{ locale, setLocale, t }}>
            {children}
        </I18nCtx.Provider>
    );
}

export function useTranslation() {
    return useContext(I18nCtx);
}
