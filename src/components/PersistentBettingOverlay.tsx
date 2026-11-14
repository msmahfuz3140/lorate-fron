'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Globe2,
  Maximize2,
  Minimize2,
  Move,
  X
} from 'lucide-react';
import { useToolWidget } from '../context/ToolWidgetContext';

type OverlaySize = 'compact' | 'normal' | 'large';

const SIZE_MAP: Record<OverlaySize, { width: number; height: number }> = {
  compact: { width: 380, height: 500 },
  normal: { width: 500, height: 650 },
  large: { width: 720, height: 760 }
};

function normalizeUrl(raw: string): string {
  const value = raw.trim();
  if (!value) return '';
  if (/^https?:\/\//i.test(value)) return value;
  return `https://${value}`;
}

/**
 * Persistent application-level betting-site overlay.
 *
 * It lives in the root layout, so Next.js route changes do not unmount the
 * iframe or reload the betting site. The user can resize, drag, collapse and
 * close it. It sits below the prediction drawer so it never blocks the tool.
 */
export function PersistentBettingOverlay() {
  const {
    bettingOverlayOpen,
    bettingOverlayUrl,
    bettingOverlayCollapsed,
    closeBettingOverlay,
    toggleBettingOverlayCollapsed,
    setBettingOverlayUrl
  } = useToolWidget();

  const [inputUrl, setInputUrl] = useState(bettingOverlayUrl);
  const [size, setSize] = useState<OverlaySize>('normal');
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
  } | null>(null);

  useEffect(() => {
    setInputUrl(bettingOverlayUrl);
  }, [bettingOverlayUrl]);

  const handleLoad = useCallback(() => {
    const normalized = normalizeUrl(inputUrl);
    if (!normalized) return;
    setInputUrl(normalized);
    setBettingOverlayUrl(normalized);
  }, [inputUrl, setBettingOverlayUrl]);

  const handlePointerDown = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (!panelRef.current) return;
    const rect = panelRef.current.getBoundingClientRect();
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: rect.left,
      originY: rect.top
    };
    // Capture on the header itself so pointermove continues to reach the
    // header's handler while dragging.
    event.currentTarget.setPointerCapture?.(event.pointerId);
  }, []);

  const handlePointerMove = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || !panelRef.current) return;
    const width = panelRef.current.offsetWidth;
    const height = panelRef.current.offsetHeight;
    const nextX = Math.min(
      Math.max(8, drag.originX + event.clientX - drag.startX),
      Math.max(8, window.innerWidth - width - 8)
    );
    const nextY = Math.min(
      Math.max(8, drag.originY + event.clientY - drag.startY),
      Math.max(8, window.innerHeight - height - 8)
    );
    setPosition({ x: nextX, y: nextY });
  }, []);

  const handlePointerUp = useCallback(() => {
    dragRef.current = null;
  }, []);

  if (!bettingOverlayOpen) return null;

  if (bettingOverlayCollapsed) {
    return (
      <button
        type="button"
        onClick={toggleBettingOverlayCollapsed}
        className="fixed bottom-4 right-4 z-[99997] flex items-center gap-2 rounded-xl border border-teal-500/40 bg-[#07121a]/95 px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-wider text-teal-300 shadow-[0_12px_35px_rgba(0,0,0,0.85)] backdrop-blur-xl hover:bg-teal-500/15"
      >
        <Globe2 className="h-3.5 w-3.5" />
        Betting Overlay
        <ChevronUp className="h-3.5 w-3.5" />
      </button>
    );
  }

  const dimensions = SIZE_MAP[size];

  return (
    <div
      ref={panelRef}
      className="fixed z-[99997] flex flex-col overflow-hidden rounded-2xl border border-teal-500/35 bg-[#050d14]/98 shadow-[0_25px_80px_rgba(0,0,0,0.95)] backdrop-blur-xl"
      style={{
        width: `min(${dimensions.width}px, calc(100vw - 16px))`,
        height: `min(${dimensions.height}px, calc(100dvh - 16px))`,
        ...(position
          ? { left: position.x, top: position.y, right: 'auto', bottom: 'auto' }
          : { right: 12, bottom: 12 })
      }}
    >
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="flex shrink-0 cursor-move touch-none items-center justify-between gap-2 border-b border-white/10 bg-[#08131d] px-3 py-2"
      >
        <div className="flex min-w-0 items-center gap-2">
          <Move className="h-3.5 w-3.5 shrink-0 text-slate-500" />
          <Globe2 className="h-4 w-4 shrink-0 text-teal-400" />
          <div className="min-w-0">
            <p className="font-display text-[11px] font-black uppercase tracking-wider text-white">
              Betting Site Overlay
            </p>
            <p className="max-w-[260px] truncate font-mono text-[9px] text-slate-400">
              {bettingOverlayUrl || 'Choose a betting site URL'}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={() => setSize(size === 'compact' ? 'normal' : size === 'normal' ? 'large' : 'compact')}
            className="rounded-md border border-white/10 bg-white/5 p-1.5 text-slate-300 hover:bg-white/10 hover:text-white"
            title="Resize overlay"
          >
            {size === 'large' ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
          </button>
          {bettingOverlayUrl && (
            <button
              type="button"
              onClick={() => window.open(bettingOverlayUrl, '_blank', 'noopener,noreferrer')}
              className="rounded-md border border-white/10 bg-white/5 p-1.5 text-slate-300 hover:bg-white/10 hover:text-white"
              title="Open betting site in a new tab"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={toggleBettingOverlayCollapsed}
            className="rounded-md border border-white/10 bg-white/5 p-1.5 text-slate-300 hover:bg-white/10 hover:text-white"
            title="Collapse overlay"
          >
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={closeBettingOverlay}
            className="rounded-md border border-white/10 bg-white/5 p-1.5 text-slate-300 hover:bg-rose-500/20 hover:text-rose-300"
            title="Close overlay"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {!bettingOverlayUrl ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 p-5 text-center">
          <Globe2 className="h-8 w-8 text-teal-400" />
          <div>
            <p className="font-display text-xs font-black uppercase tracking-wider text-white">
              Load your betting site
            </p>
            <p className="mt-1 max-w-sm font-body text-xs leading-relaxed text-slate-400">
              Enter the exact betting-site URL. The iframe stays mounted while
              you move between dashboard tabs, so its session is not reloaded.
            </p>
          </div>
          <div className="flex w-full max-w-sm gap-2">
            <input
              value={inputUrl}
              onChange={(event) => setInputUrl(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') handleLoad();
              }}
              placeholder="https://www.stake.com"
              className="min-w-0 flex-1 rounded-lg border border-white/10 bg-black/40 px-3 py-2 font-mono text-[11px] text-white placeholder:text-slate-600 focus:border-teal-500 focus:outline-none"
            />
            <button
              type="button"
              onClick={handleLoad}
              className="rounded-lg bg-teal-500 px-3 py-2 font-display text-[10px] font-black uppercase tracking-wider text-black hover:bg-teal-400"
            >
              Load
            </button>
          </div>
          <p className="max-w-sm font-mono text-[9px] leading-relaxed text-slate-500">
            Note: some casinos block third-party embedding with X-Frame-Options.
            The overlay itself remains persistent; use the external-link button
            for those sites.
          </p>
        </div>
      ) : (
        <div className="relative flex-1 bg-white">
          <iframe
            src={bettingOverlayUrl}
            title="Persistent betting site overlay"
            className="absolute inset-0 h-full w-full border-0"
            allow="fullscreen; clipboard-read; clipboard-write"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      )}
    </div>
  );
}
