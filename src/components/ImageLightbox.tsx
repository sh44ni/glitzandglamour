'use client';

import { useEffect, useCallback, useState, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize2, Minimize2, Download } from 'lucide-react';

interface ImageLightboxProps {
  images: string[];
  startIndex?: number;
  onClose: () => void;
}

export default function ImageLightbox({ images, startIndex = 0, onClose }: ImageLightboxProps) {
  const [current, setCurrent] = useState(startIndex);
  const [zoom, setZoom] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [loaded, setLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);

  const resetView = () => { setZoom(1); setOffset({ x: 0, y: 0 }); setLoaded(false); };

  const prev = useCallback(() => {
    setCurrent(c => (c - 1 + images.length) % images.length);
    resetView();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [images.length]);

  const next = useCallback(() => {
    setCurrent(c => (c + 1) % images.length);
    resetView();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [images.length]);

  const zoomIn  = () => setZoom(z => Math.min(z + 0.5, 4));
  const zoomOut = () => setZoom(z => { const nz = Math.max(z - 0.5, 1); if (nz === 1) setOffset({ x: 0, y: 0 }); return nz; });

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Keyboard
  useEffect(() => {
    function handle(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
      if (e.key === '+') zoomIn();
      if (e.key === '-') zoomOut();
    }
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, [onClose, prev, next]);

  // Fullscreen change listener
  useEffect(() => {
    function handle() { setIsFullscreen(!!document.fullscreenElement); }
    document.addEventListener('fullscreenchange', handle);
    return () => document.removeEventListener('fullscreenchange', handle);
  }, []);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  // Mouse drag for panning when zoomed
  function onMouseDown(e: React.MouseEvent) {
    if (zoom === 1) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  }
  function onMouseMove(e: React.MouseEvent) {
    if (!isDragging) return;
    setOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  }
  function onMouseUp() { setIsDragging(false); }

  // Touch swipe
  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  }
  function onTouchEnd(e: React.TouchEvent) {
    if (zoom > 1) return; // don't swipe when zoomed
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = Math.abs(e.changedTouches[0].clientY - touchStartY.current);
    if (Math.abs(dx) > 50 && dy < 80) {
      if (dx < 0) next(); else prev();
    }
  }

  const url = images[current];

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.97)',
        display: 'flex', flexDirection: 'column',
        userSelect: 'none',
      }}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
    >
      {/* ── Top Bar ─────────────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 16px', flexShrink: 0,
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.8), transparent)',
        zIndex: 2,
      }}>
        {/* Counter */}
        <span style={{ fontFamily: 'Poppins, sans-serif', color: 'rgba(255,255,255,0.6)', fontSize: '13px', fontWeight: 500 }}>
          {current + 1} / {images.length}
        </span>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <ActionBtn onClick={zoomOut} disabled={zoom === 1} title="Zoom Out"><ZoomOut size={18} /></ActionBtn>
          <span style={{ fontFamily: 'Poppins,sans-serif', fontSize: '12px', color: '#aaa', minWidth: '32px', textAlign: 'center' }}>
            {Math.round(zoom * 100)}%
          </span>
          <ActionBtn onClick={zoomIn} disabled={zoom >= 4} title="Zoom In"><ZoomIn size={18} /></ActionBtn>
          <ActionBtn onClick={toggleFullscreen} title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}>
            {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </ActionBtn>
          <a href={url} download target="_blank" rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: 8, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', cursor: 'pointer' }}
            title="Download">
            <Download size={18} />
          </a>
          <ActionBtn onClick={onClose} title="Close" style={{ background: 'rgba(255,45,120,0.15)', borderColor: 'rgba(255,45,120,0.3)' }}>
            <X size={18} color="#FF2D78" />
          </ActionBtn>
        </div>
      </div>

      {/* ── Image Area ──────────────────────────────────────── */}
      <div
        style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {/* Prev */}
        {images.length > 1 && (
          <button onClick={prev} style={navBtnStyle('left')}>
            <ChevronLeft size={28} color="#fff" />
          </button>
        )}

        {/* Image */}
        {!loaded && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid rgba(255,45,120,0.3)', borderTopColor: '#FF2D78', animation: 'spin 0.7s linear infinite' }} />
          </div>
        )}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={url}
          src={url}
          alt={`Image ${current + 1}`}
          draggable={false}
          onLoad={() => setLoaded(true)}
          style={{
            maxWidth: '100%', maxHeight: '100%',
            objectFit: 'contain',
            transform: `scale(${zoom}) translate(${offset.x / zoom}px, ${offset.y / zoom}px)`,
            opacity: loaded ? 1 : 0,
            transition: loaded
              ? (isDragging ? 'transform none, opacity 0.3s' : 'transform 0.2s ease, opacity 0.3s')
              : 'opacity 0.3s',
          } as React.CSSProperties}
        />

        {/* Next */}
        {images.length > 1 && (
          <button onClick={next} style={navBtnStyle('right')}>
            <ChevronRight size={28} color="#fff" />
          </button>
        )}
      </div>

      {/* ── Thumbnail Strip ─────────────────────────────────── */}
      {images.length > 1 && (
        <div style={{
          display: 'flex', gap: '8px', padding: '12px 16px', overflowX: 'auto',
          background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
          justifyContent: 'center', flexShrink: 0,
        }}>
          {images.map((img, i) => (
            <button key={i} onClick={() => { setCurrent(i); resetView(); }}
              style={{
                width: 52, height: 52, flexShrink: 0, borderRadius: 8, overflow: 'hidden', padding: 0, cursor: 'pointer',
                border: i === current ? '2px solid #FF2D78' : '2px solid rgba(255,255,255,0.1)',
                transition: 'border-color 0.2s', background: '#111',
              }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img} alt={`thumb-${i}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </button>
          ))}
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function ActionBtn({ onClick, disabled, title, children, style }: {
  onClick?: () => void; disabled?: boolean; title?: string;
  children: React.ReactNode; style?: React.CSSProperties;
}) {
  return (
    <button onClick={onClick} disabled={disabled} title={title} style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      width: 36, height: 36, borderRadius: 8,
      background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
      color: disabled ? '#444' : '#fff', cursor: disabled ? 'not-allowed' : 'pointer',
      transition: 'background 0.2s', ...style,
    }}>
      {children}
    </button>
  );
}

function navBtnStyle(side: 'left' | 'right'): React.CSSProperties {
  return {
    position: 'absolute', top: '50%', transform: 'translateY(-50%)',
    [side]: 12, zIndex: 2,
    background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
    border: '1px solid rgba(255,255,255,0.15)', borderRadius: '50%',
    width: 48, height: 48,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', transition: 'background 0.2s',
  };
}
