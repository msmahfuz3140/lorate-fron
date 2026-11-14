'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { ExternalLink, Radio } from 'lucide-react';
import { useToolWidget } from '../context/ToolWidgetContext';
import { useDisclaimer } from '../context/DisclaimerContext';

/**
 * Single floating tool icon.
 *
 * Clicking it opens the actual prediction tool in a persistent side window
 * (Document Picture-in-Picture where supported, otherwise a popup). The side
 * window remains open while the user switches browser tabs.
 *
 * The old betting-site overlay, overlay guide, bookmarklet and minimize
 * controls have been removed.
 */
export function FloatingPredictionWidget() {
  const pathname = usePathname();
  const { openToolSideWindow } = useToolWidget();
  const { requestToolAccess } = useDisclaimer();

  // The full tool page already provides its own side-window icon.
  if (pathname === '/dashboard/tool') return null;

  return (
    <button
      type="button"
      onClick={() => requestToolAccess(openToolSideWindow)}
      title="Open prediction tool in a persistent side window"
      aria-label="Open prediction tool in a persistent side window"
      className="group fixed bottom-5 right-4 z-[99999] flex h-14 w-14 items-center justify-center rounded-full border-2 border-amber-500/90 bg-[#070b14] p-1 shadow-[0_12px_40px_rgba(0,0,0,0.9)] transition-all hover:border-amber-400 active:scale-95 sm:bottom-6 sm:right-6 sm:h-16 sm:w-16"
    >
      <span className="absolute inset-0 rounded-full bg-gradient-to-tr from-amber-500 via-teal-400 to-amber-600 opacity-50 blur-[3px] transition-opacity group-hover:opacity-80" />
      <span className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-full border border-white/10 bg-black p-0.5">
        <img
          src="/logo.png"
          alt="Roulette Computer"
          className="h-full w-full rounded-full object-cover"
        />
        <span className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full border border-[#070b14] bg-emerald-500 text-black">
          <ExternalLink className="h-2.5 w-2.5" />
        </span>
      </span>
      <span className="pointer-events-none absolute -top-1 left-1/2 hidden -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-md border border-white/10 bg-black/95 px-2 py-1 font-mono text-[9px] font-bold uppercase tracking-wider text-amber-300 shadow-lg group-hover:block">
        <Radio className="mr-1 inline h-2.5 w-2.5" />
        Side Tool
      </span>
    </button>
  );
}
