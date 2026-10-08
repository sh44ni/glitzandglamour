'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import InteractiveQuoteModal from './InteractiveQuoteModal';

interface QuoteModalDefaults {
  eventType?: string;
  location?: string;
}

interface QuoteModalContextType {
  isOpen: boolean;
  openQuoteModal: (defaults?: QuoteModalDefaults) => void;
  closeQuoteModal: () => void;
}

const QuoteModalContext = createContext<QuoteModalContextType>({
  isOpen: false,
  openQuoteModal: () => {},
  closeQuoteModal: () => {},
});

export function useQuoteModal() {
  return useContext(QuoteModalContext);
}

export default function QuoteModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [defaults, setDefaults] = useState<QuoteModalDefaults>({});

  const openQuoteModal = useCallback((newDefaults?: QuoteModalDefaults) => {
    if (newDefaults) {
      setDefaults(newDefaults);
    } else {
      setDefaults({});
    }
    setIsOpen(true);
  }, []);

  const closeQuoteModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        closeQuoteModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeQuoteModal]);

  // Global click interception for any button or link targeting quote modal
  useEffect(() => {
    function handleDocumentClick(e: MouseEvent) {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      // Check if target or parent has [data-open-quote] or is an anchor to #inquire
      const trigger = target.closest('[data-open-quote="true"], a[href$="#inquire"]') as HTMLElement | null;
      if (!trigger) return;

      // Prevent navigation / anchor jump
      e.preventDefault();
      e.stopPropagation();

      const eventType = trigger.getAttribute('data-event-type') || undefined;
      const location = trigger.getAttribute('data-location') || trigger.getAttribute('data-city') || undefined;

      openQuoteModal({ eventType, location });
    }

    document.addEventListener('click', handleDocumentClick, { capture: true });
    return () => document.removeEventListener('click', handleDocumentClick, { capture: true });
  }, [openQuoteModal]);

  return (
    <QuoteModalContext.Provider value={{ isOpen, openQuoteModal, closeQuoteModal }}>
      {children}

      <InteractiveQuoteModal
        isOpen={isOpen}
        onClose={closeQuoteModal}
        defaultEventType={defaults.eventType}
        defaultLocation={defaults.location}
      />
    </QuoteModalContext.Provider>
  );
}
