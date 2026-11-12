'use client';

import React, { useRef } from 'react';
import { AlertCircle, ImagePlus, Loader2, Mic, MicOff, Send, X } from 'lucide-react';
import type { PendingAttachment } from './types';

type ChatComposerProps = {
  input: string;
  onInputChange: (val: string) => void;
  onSubmit: (e?: React.FormEvent) => void;
  onPickFiles: (files: FileList | File[]) => void;
  onRemoveAttachment: (id: string) => void;
  pendingAttachments: PendingAttachment[];
  totalConversationPhotos: number;
  maxBookingPhotos?: number;
  uploadError: string | null;
  onDismissUploadError: () => void;
  isListening: boolean;
  voiceSupported: boolean;
  onToggleVoice: () => void;
  isLoading: boolean;
  isExhausted: boolean;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
};

export default function ChatComposer({
  input,
  onInputChange,
  onSubmit,
  onPickFiles,
  onRemoveAttachment,
  pendingAttachments,
  totalConversationPhotos,
  maxBookingPhotos = 5,
  uploadError,
  onDismissUploadError,
  isListening,
  voiceSupported,
  onToggleVoice,
  isLoading,
  isExhausted,
  textareaRef,
}: ChatComposerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isUploadingAny = pendingAttachments.some((a) => a.status === 'uploading');
  const hasReadyAttachments = pendingAttachments.some((a) => a.status === 'ready');
  const activeCount = totalConversationPhotos + pendingAttachments.length;
  const slotsRemaining = Math.max(0, maxBookingPhotos - activeCount);
  const canSend =
    (input.trim().length > 0 || hasReadyAttachments) &&
    !isUploadingAny &&
    !isLoading &&
    !isExhausted;

  const resizeTextarea = (el: HTMLTextAreaElement) => {
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 96)}px`;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (canSend) {
        onSubmit();
        if (textareaRef.current) {
          textareaRef.current.style.height = 'auto';
        }
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    const files: File[] = [];
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith('image/')) {
        const f = items[i].getAsFile();
        if (f) files.push(f);
      }
    }
    if (files.length > 0) {
      e.preventDefault();
      onPickFiles(files);
    }
  };

  return (
    <div className="hk-input-area">
      {uploadError && (
        <div className="hk-upload-error" role="alert">
          <AlertCircle size={14} color="#ff9a9a" style={{ flexShrink: 0, marginTop: '1px' }} />
          <span>{uploadError}</span>
          <button
            type="button"
            onClick={onDismissUploadError}
            aria-label="Dismiss upload error"
            className="hk-upload-err-close"
          >
            <X size={12} />
          </button>
        </div>
      )}

      {pendingAttachments.length > 0 && (
        <div className="hk-attach-tray">
          <div className="hk-attach-meta">
            <span>Inspo Photos ({Math.min(activeCount, maxBookingPhotos)}/{maxBookingPhotos})</span>
            {slotsRemaining === 0 && <span className="hk-attach-cap">Limit reached</span>}
          </div>
          <div className="hk-attach-row">
            {pendingAttachments.map((item) => (
              <div key={item.id} className={`hk-attach-thumb ${item.status}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.previewUrl} alt="Pending inspo preview" />
                {item.status === 'uploading' && (
                  <div className="hk-attach-overlay">
                    <Loader2 size={14} className="hk-spin" color="#fff" />
                  </div>
                )}
                {item.status === 'error' && (
                  <div className="hk-attach-overlay err" title={item.error || 'Upload failed'}>
                    <AlertCircle size={14} color="#ff9a9a" />
                  </div>
                )}
                <button
                  type="button"
                  className="hk-attach-remove"
                  onClick={() => onRemoveAttachment(item.id)}
                  aria-label="Remove inspo photo"
                >
                  <X size={10} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <form
        id="hk-chat-form"
        onSubmit={(e) => {
          onSubmit(e);
          if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
          }
        }}
        className="hk-input-wrap"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.heic,.heif"
          multiple
          hidden
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              onPickFiles(e.target.files);
              e.target.value = '';
            }
          }}
        />

        <button
          type="button"
          className="hk-icon-btn hk-photo-btn"
          onClick={() => fileInputRef.current?.click()}
          disabled={isExhausted || slotsRemaining <= 0 || isListening}
          aria-label={
            slotsRemaining <= 0
              ? `Maximum ${maxBookingPhotos} inspo photos reached`
              : `Upload inspo photo (${slotsRemaining} left)`
          }
          title={
            slotsRemaining <= 0
              ? `Maximum ${maxBookingPhotos} inspo photos reached`
              : 'Upload inspo photo'
          }
        >
          <ImagePlus size={16} />
        </button>

        {isListening ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, padding: '8px 0' }}>
            <div className="hk-waveform">
              <span />
              <span />
              <span />
              <span />
            </div>
            <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '13px', color: '#FF7EB3', fontWeight: 600 }}>
              Listening to you…
            </span>
          </div>
        ) : (
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => {
              onInputChange(e.target.value);
              resizeTextarea(e.currentTarget);
            }}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            placeholder={
              pendingAttachments.length > 0
                ? 'Add notes about your inspo (optional)…'
                : 'Message Kitty or drop inspo photo…'
            }
            className="hk-input"
            disabled={isExhausted}
            aria-label="Message Hello Kitty"
          />
        )}

        {voiceSupported && (
          <button
            type="button"
            className={`hk-icon-btn hk-mic ${isListening ? 'active' : ''}`}
            onClick={onToggleVoice}
            disabled={isExhausted}
            aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
            title={isListening ? 'Stop listening' : 'Voice input'}
          >
            {isListening ? <MicOff size={16} /> : <Mic size={16} />}
          </button>
        )}

        <button
          type="submit"
          aria-label="Send message"
          className="hk-icon-btn hk-send"
          disabled={!canSend}
        >
          <Send size={15} style={{ marginLeft: '-1px' }} />
        </button>
      </form>

      <p className="hk-footer-credit">
        Hello Kitty 2.0 AI • powered by{' '}
        <a
          href="https://projektsvision.com"
          target="_blank"
          rel="noopener noreferrer"
          className="hk-footer-link"
        >
          PROJEKTS
        </a>
      </p>
    </div>
  );
}
