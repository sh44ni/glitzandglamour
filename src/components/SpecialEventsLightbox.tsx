'use client';

import React, { useEffect, useCallback, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Maximize2, 
  Minimize2, 
  Sparkles, 
  Info,
  Calendar
} from 'lucide-react';

export interface SpecialEventPhotoItem {
  id: string;
  url: string;
  title?: string;
  description?: string;
  order?: number;
}

interface SpecialEventsLightboxProps {
  photos: SpecialEventPhotoItem[];
  startIndex?: number;
  onClose: () => void;
  onInquire?: (photo: SpecialEventPhotoItem) => void;
}

export default function SpecialEventsLightbox({
  photos,
  startIndex = 0,
  onClose,
  onInquire,
}: SpecialEventsLightboxProps) {
  const [current, setCurrent] = useState(startIndex);
  const [zoom, setZoom] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [loaded, setLoaded] = useState(false);
  const [showDetails, setShowDetails] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);
  const touchLastDist = useRef<number>(0);
  const lastTapTime = useRef<number>(0);
  const thumbnailsRef = useRef<HTMLDivElement>(null);

  const total = photos.length;
  const currentPhoto = photos[current] || photos[0];

  const resetView = useCallback(() => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
    setIsDragging(false);
  }, []);

  // Update current when startIndex changes
  useEffect(() => {
    setCurrent(startIndex);
    resetView();
  }, [startIndex, resetView]);

  // Image loading listener
  useEffect(() => {
    setLoaded(false);
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth > 0) {
      setLoaded(true);
      return;
    }
    const timeout = setTimeout(() => setLoaded(true), 2500);
    return () => clearTimeout(timeout);
  }, [current, currentPhoto?.url]);

  // Scroll active thumbnail into view
  useEffect(() => {
    if (!thumbnailsRef.current) return;
    const activeThumb = thumbnailsRef.current.children[current] as HTMLElement | undefined;
    if (activeThumb) {
      activeThumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [current]);

  const prev = useCallback(() => {
    if (total <= 1) return;
    setCurrent(c => (c - 1 + total) % total);
    resetView();
  }, [total, resetView]);

  const next = useCallback(() => {
    if (total <= 1) return;
    setCurrent(c => (c + 1) % total);
    resetView();
  }, [total, resetView]);

  const zoomIn = () => {
    setZoom(z => Math.min(Number((z + 0.5).toFixed(1)), 3.5));
  };

  const zoomOut = () => {
    setZoom(z => {
      const nz = Math.max(Number((z - 0.5).toFixed(1)), 1);
      if (nz === 1) setOffset({ x: 0, y: 0 });
      return nz;
    });
  };

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await containerRef.current?.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch {
      // Fullscreen not supported or restricted
    }
  };

  // Keyboard controls
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowLeft') prev();
      else if (e.key === 'ArrowRight') next();
      else if (e.key === '+' || e.key === '=') zoomIn();
      else if (e.key === '-' || e.key === '_') zoomOut();
      else if (e.key === '0' || e.key.toLowerCase() === 'r') resetView();
      else if (e.key.toLowerCase() === 'f') toggleFullscreen();
      else if (e.key.toLowerCase() === 'i') setShowDetails(d => !d);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose, prev, next, resetView]);

  // Fullscreen change listener
  useEffect(() => {
    const handleFs = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFs);
    return () => document.removeEventListener('fullscreenchange', handleFs);
  }, []);

  // Lock body scroll
  useEffect(() => {
    const originalStyle = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  // Mouse pan handling
  const onMouseDown = (e: React.MouseEvent) => {
    if (zoom <= 1) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const onMouseUp = () => setIsDragging(false);

  // Double click / Double tap handler
  const handleDoubleAction = () => {
    if (zoom > 1) {
      resetView();
    } else {
      setZoom(2);
    }
  };

  // Touch swipe & pinch gestures
  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      touchStartX.current = e.touches[0].clientX;
      touchStartY.current = e.touches[0].clientY;
      if (zoom > 1) {
        setIsDragging(true);
        setDragStart({ x: e.touches[0].clientX - offset.x, y: e.touches[0].clientY - offset.y });
      }
    } else if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      touchLastDist.current = Math.hypot(dx, dy);
    }
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && isDragging && zoom > 1) {
      setOffset({ x: e.touches[0].clientX - dragStart.x, y: e.touches[0].clientY - dragStart.y });
    } else if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.hypot(dx, dy);
      if (touchLastDist.current > 0) {
        const factor = dist / touchLastDist.current;
        setZoom(z => Math.max(1, Math.min(3.5, Number((z * factor).toFixed(2)))));
      }
      touchLastDist.current = dist;
    }
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    setIsDragging(false);
    touchLastDist.current = 0;

    // Double tap detection
    const now = Date.now();
    if (now - lastTapTime.current < 300) {
      handleDoubleAction();
      lastTapTime.current = 0;
      return;
    }
    lastTapTime.current = now;

    // Swipe navigation when not zoomed
    if (zoom === 1 && e.changedTouches.length === 1) {
      const dx = e.changedTouches[0].clientX - touchStartX.current;
      const dy = Math.abs(e.changedTouches[0].clientY - touchStartY.current);
      if (Math.abs(dx) > 45 && dy < 75) {
        if (dx < 0) next();
        else prev();
      }
    }
  };

  if (!currentPhoto || typeof document === 'undefined') return null;

  return createPortal(
    <div
      ref={containerRef}
      role="dialog"
      aria-modal="true"
      aria-label="Image gallery viewer"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: 'rgba(6, 6, 8, 0.96)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        display: 'flex',
        flexDirection: 'column',
        userSelect: 'none',
        animation: 'lightboxFadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        overscrollBehavior: 'contain',
      }}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
    >
      {/* ── TOP CONTROLS BAR ────────────────────────────────────── */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 18px',
          flexShrink: 0,
          background: 'linear-gradient(180deg, rgba(10,10,12,0.92) 0%, rgba(10,10,12,0.4) 70%, transparent 100%)',
          zIndex: 10,
          gap: '12px',
        }}
      >
        {/* Left: Look counter & Glam pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'linear-gradient(135deg, rgba(255,45,120,0.2), rgba(255,45,120,0.05))',
              border: '1px solid rgba(255,45,120,0.35)',
              borderRadius: '50px',
              padding: '5px 12px',
            }}
          >
            <Sparkles size={13} color="#FF2D78" />
            <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '11px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: '#fff' }}>
              Glam Showcase
            </span>
          </div>

          <span style={{ fontFamily: 'Poppins, sans-serif', color: 'rgba(255,255,255,0.7)', fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap' }}>
            {current + 1} <span style={{ color: 'rgba(255,255,255,0.3)' }}>/</span> {total}
          </span>
        </div>

        {/* Right: Actions */}
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          {/* Zoom controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(255,255,255,0.05)', padding: '2px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)' }} className="zoom-group">
            <ActionBtn onClick={zoomOut} disabled={zoom <= 1} title="Zoom Out (-)">
              <ZoomOut size={16} />
            </ActionBtn>
            
            <button
              onClick={resetView}
              disabled={zoom === 1}
              title="Reset Zoom (0 / R)"
              style={{
                background: 'none',
                border: 'none',
                color: zoom > 1 ? '#FF2D78' : 'rgba(255,255,255,0.5)',
                fontFamily: 'Poppins, sans-serif',
                fontSize: '11px',
                fontWeight: 600,
                padding: '0 6px',
                minWidth: '42px',
                cursor: zoom > 1 ? 'pointer' : 'default',
              }}
            >
              {Math.round(zoom * 100)}%
            </button>

            <ActionBtn onClick={zoomIn} disabled={zoom >= 3.5} title="Zoom In (+)">
              <ZoomIn size={16} />
            </ActionBtn>
          </div>

          {zoom > 1 && (
            <ActionBtn onClick={resetView} title="Reset to Fit View (0 / R)" style={{ color: '#FF2D78' }}>
              <RotateCcw size={16} />
            </ActionBtn>
          )}

          {/* Details toggle */}
          {(currentPhoto.title || currentPhoto.description) && (
            <ActionBtn
              onClick={() => setShowDetails(d => !d)}
              title={showDetails ? 'Hide details (I)' : 'Show details (I)'}
              style={{
                background: showDetails ? 'rgba(255,45,120,0.15)' : 'rgba(255,255,255,0.06)',
                borderColor: showDetails ? 'rgba(255,45,120,0.4)' : 'rgba(255,255,255,0.12)',
                color: showDetails ? '#FF2D78' : '#fff',
              }}
            >
              <Info size={16} />
            </ActionBtn>
          )}

          {/* Fullscreen toggle */}
          <ActionBtn onClick={toggleFullscreen} title={isFullscreen ? 'Exit Fullscreen (F)' : 'Fullscreen (F)'} className="hide-mobile">
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </ActionBtn>

          {/* Close button */}
          <button
            onClick={onClose}
            title="Close (ESC)"
            aria-label="Close image viewer"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'linear-gradient(135deg, rgba(255,45,120,0.25), rgba(255,45,120,0.12))',
              border: '1px solid rgba(255,45,120,0.4)',
              color: '#FF2D78',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              marginLeft: '4px',
            }}
            onMouseOver={e => {
              (e.currentTarget as HTMLElement).style.background = '#FF2D78';
              (e.currentTarget as HTMLElement).style.color = '#fff';
            }}
            onMouseOut={e => {
              (e.currentTarget as HTMLElement).style.background = 'linear-gradient(135deg, rgba(255,45,120,0.25), rgba(255,45,120,0.12))';
              (e.currentTarget as HTMLElement).style.color = '#FF2D78';
            }}
          >
            <X size={18} strokeWidth={2.5} />
          </button>
        </div>
      </header>

      {/* ── MAIN IMAGE VIEWPORT (UNCROPPED FIT) ──────────────────── */}
      <main
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
          cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default',
          padding: '10px',
        }}
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onDoubleClick={handleDoubleAction}
      >
        {/* Navigation - Prev */}
        {total > 1 && (
          <button
            onClick={prev}
            aria-label="Previous look"
            title="Previous Look (←)"
            style={navBtnStyle('left')}
            onMouseOver={e => {
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,45,120,0.6)';
              (e.currentTarget as HTMLElement).style.boxShadow = '0 0 20px rgba(255,45,120,0.3)';
              (e.currentTarget as HTMLElement).style.background = 'rgba(20,10,15,0.85)';
            }}
            onMouseOut={e => {
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.15)';
              (e.currentTarget as HTMLElement).style.boxShadow = 'none';
              (e.currentTarget as HTMLElement).style.background = 'rgba(0,0,0,0.6)';
            }}
          >
            <ChevronLeft size={28} color="#fff" />
          </button>
        )}

        {/* Loading Spinner */}
        {!loaded && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                border: '3px solid rgba(255,45,120,0.2)',
                borderTopColor: '#FF2D78',
                animation: 'lightboxSpin 0.7s linear infinite',
              }}
            />
          </div>
        )}

        {/* Uncropped Full Image Canvas */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={imgRef}
            key={`se-lightbox-${current}-${currentPhoto.url}`}
            src={currentPhoto.url}
            alt={currentPhoto.title || `Special Event Glam Look ${current + 1}`}
            draggable={false}
            onLoad={() => setLoaded(true)}
            onError={() => setLoaded(true)}
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              width: 'auto',
              height: 'auto',
              objectFit: 'contain',
              pointerEvents: 'auto',
              borderRadius: '12px',
              transform: `scale(${zoom}) translate(${offset.x / zoom}px, ${offset.y / zoom}px)`,
              opacity: loaded ? 1 : 0,
              boxShadow: loaded ? '0 20px 60px rgba(0,0,0,0.8)' : 'none',
              transition: loaded
                ? (isDragging ? 'transform 0s, opacity 0.2s' : 'transform 0.22s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.25s ease')
                : 'opacity 0.2s',
            }}
          />
        </div>

        {/* Navigation - Next */}
        {total > 1 && (
          <button
            onClick={next}
            aria-label="Next look"
            title="Next Look (→)"
            style={navBtnStyle('right')}
            onMouseOver={e => {
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,45,120,0.6)';
              (e.currentTarget as HTMLElement).style.boxShadow = '0 0 20px rgba(255,45,120,0.3)';
              (e.currentTarget as HTMLElement).style.background = 'rgba(20,10,15,0.85)';
            }}
            onMouseOut={e => {
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.15)';
              (e.currentTarget as HTMLElement).style.boxShadow = 'none';
              (e.currentTarget as HTMLElement).style.background = 'rgba(0,0,0,0.6)';
            }}
          >
            <ChevronRight size={28} color="#fff" />
          </button>
        )}
      </main>

      {/* ── BOTTOM CAPTION & INQUIRY BAR ────────────────────────── */}
      {showDetails && (currentPhoto.title || currentPhoto.description || onInquire) && (
        <div
          style={{
            flexShrink: 0,
            padding: '12px 20px',
            background: 'linear-gradient(180deg, transparent 0%, rgba(12,8,12,0.85) 30%, rgba(12,8,12,0.98) 100%)',
            zIndex: 10,
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              maxWidth: '720px',
              width: '100%',
              background: 'rgba(25, 12, 20, 0.75)',
              border: '1px solid rgba(255, 45, 120, 0.25)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              borderRadius: '18px',
              padding: '14px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
              flexWrap: 'wrap',
              boxShadow: '0 12px 36px rgba(0,0,0,0.5)',
            }}
          >
            <div style={{ flex: 1, minWidth: '220px' }}>
              {currentPhoto.title && (
                <h3
                  style={{
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: '16px',
                    fontWeight: 700,
                    color: '#fff',
                    margin: '0 0 3px 0',
                    lineHeight: 1.25,
                    letterSpacing: '-0.2px',
                  }}
                >
                  {currentPhoto.title}
                </h3>
              )}
              {currentPhoto.description && (
                <p
                  style={{
                    fontFamily: 'Poppins, sans-serif',
                    color: '#bbb',
                    fontSize: '12px',
                    lineHeight: 1.5,
                    margin: 0,
                  }}
                >
                  {currentPhoto.description}
                </p>
              )}
            </div>

            {onInquire && (
              <button
                onClick={() => onInquire(currentPhoto)}
                className="btn-primary"
                style={{
                  fontSize: '12px',
                  padding: '9px 18px',
                  borderRadius: '30px',
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Calendar size={13} />
                Inquire About This Look
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── THUMBNAIL FILMSTRIP ──────────────────────────────────── */}
      {total > 1 && (
        <div
          ref={thumbnailsRef}
          style={{
            display: 'flex',
            gap: '8px',
            padding: '10px 16px 14px',
            overflowX: 'auto',
            background: 'rgba(8, 8, 10, 0.95)',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            justifyContent: total < 10 ? 'center' : 'flex-start',
            flexShrink: 0,
            zIndex: 10,
            scrollbarWidth: 'none',
          }}
        >
          {photos.map((p, i) => (
            <button
              key={p.id || i}
              onClick={() => {
                setCurrent(i);
                resetView();
              }}
              title={p.title || `Look ${i + 1}`}
              aria-label={`View photo ${i + 1}`}
              style={{
                width: 50,
                height: 50,
                flexShrink: 0,
                borderRadius: 10,
                overflow: 'hidden',
                padding: 0,
                cursor: 'pointer',
                border: i === current ? '2px solid #FF2D78' : '2px solid rgba(255,255,255,0.12)',
                boxShadow: i === current ? '0 0 16px rgba(255,45,120,0.5)' : 'none',
                transform: i === current ? 'scale(1.06)' : 'scale(1)',
                transition: 'all 0.2s ease',
                background: '#141416',
                position: 'relative',
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.url}
                alt={p.title || `Thumbnail ${i + 1}`}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  opacity: i === current ? 1 : 0.65,
                  transition: 'opacity 0.2s',
                }}
              />
            </button>
          ))}
        </div>
      )}

      {/* ── STYLES ──────────────────────────────────────────────── */}
      <style jsx global>{`
        @keyframes lightboxFadeIn {
          from { opacity: 0; transform: scale(0.98); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes lightboxSpin {
          to { transform: rotate(360deg); }
        }
        @media (max-width: 640px) {
          .hide-mobile { display: none !important; }
        }
      `}</style>
    </div>,
    document.body
  );
}

function ActionBtn({
  onClick,
  disabled,
  title,
  children,
  style,
  className,
}: {
  onClick?: () => void;
  disabled?: boolean;
  title?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={className}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 36,
        height: 36,
        borderRadius: 10,
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.12)',
        color: disabled ? 'rgba(255,255,255,0.2)' : '#fff',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s ease',
        ...style,
      }}
      onMouseOver={e => {
        if (!disabled) {
          (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.12)';
          (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,45,120,0.3)';
        }
      }}
      onMouseOut={e => {
        if (!disabled) {
          (e.currentTarget as HTMLElement).style.background = (style?.background as string) || 'rgba(255,255,255,0.06)';
          (e.currentTarget as HTMLElement).style.borderColor = (style?.borderColor as string) || 'rgba(255,255,255,0.12)';
        }
      }}
    >
      {children}
    </button>
  );
}

function navBtnStyle(side: 'left' | 'right'): React.CSSProperties {
  return {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    [side]: 16,
    zIndex: 5,
    background: 'rgba(0,0,0,0.6)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: '50%',
    width: 48,
    height: 48,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  };
}
