'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { X, Sparkles } from 'lucide-react';
import InquiryForm from '@/app/special-events/InquiryForm';

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

      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="quote-modal-title"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            backgroundColor: 'rgba(0, 0, 0, 0.82)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            animation: 'fadeIn 0.2s ease-out',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) closeQuoteModal();
          }}
        >
          <div
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '660px',
              maxHeight: '92vh',
              overflowY: 'auto',
              backgroundColor: 'rgba(14, 10, 16, 0.98)',
              border: '1px solid rgba(255, 45, 120, 0.3)',
              borderRadius: '24px',
              boxShadow: '0 24px 64px rgba(0, 0, 0, 0.85), 0 0 30px rgba(255, 45, 120, 0.15)',
              padding: '24px 20px',
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: '12px',
                marginBottom: '20px',
                paddingBottom: '16px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <div>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '11px',
                    fontFamily: 'Poppins, sans-serif',
                    fontWeight: 700,
                    color: '#FF2D78',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    marginBottom: '4px',
                  }}
                >
                  <Sparkles size={13} /> Custom Proposals &amp; Bookings
                </div>
                <h2
                  id="quote-modal-title"
                  style={{
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: '22px',
                    fontWeight: 800,
                    color: '#ffffff',
                    margin: 0,
                    lineHeight: 1.25,
                  }}
                >
                  Request Your Custom Quote
                </h2>
                <p
                  style={{
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: '13px',
                    color: '#aaa',
                    margin: '6px 0 0',
                    lineHeight: 1.5,
                  }}
                >
                  Share your date and styling vision. Jojo will review and reply with an itemized quote within 48 hours.
                </p>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={closeQuoteModal}
                aria-label="Close quote modal"
                style={{
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  cursor: 'pointer',
                  flexShrink: 0,
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 45, 120, 0.2)';
                  e.currentTarget.style.borderColor = '#FF2D78';
                  e.currentTarget.style.color = '#FF2D78';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.06)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
                  e.currentTarget.style.color = '#fff';
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Render Form with default values & modal flag */}
            <InquiryForm
              isModal={true}
              onClose={closeQuoteModal}
              defaultEventType={defaults.eventType}
              defaultLocation={defaults.location}
            />
          </div>
        </div>
      )}
    </QuoteModalContext.Provider>
  );
}
