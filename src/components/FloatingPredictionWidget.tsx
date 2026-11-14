'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useToolWidget } from '../context/ToolWidgetContext';
import { RouletteEngineTool } from './tool/RouletteEngineTool';
import {
  Minus,
  Maximize2,
  X,
  Radio,
  Sparkles,
  ExternalLink,
  ChevronDown,
  RefreshCw,
  Zap,
  Copy,
  Check,
  Bookmark,
  Layers,
  HelpCircle,
  Smartphone
} from 'lucide-react';

export function FloatingPredictionWidget() {
  const pathname = usePathname();
  const {
    isOpen,
    isMinimized,
    isWidgetActive,
    toolMode,
    predictionData,
    openToolWidget,
    minimizeToolWidget,
    closeToolWidget,
    setToolMode,
    updatePredictionData,
    popoutToolWindow,
  } = useToolWidget();

  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [hasNewPrediction, setHasNewPrediction] = useState(false);
  const [pulseKey, setPulseKey] = useState(0);
  const [showOverlayGuide, setShowOverlayGuide] = useState(false);
  const [copiedBookmarklet, setCopiedBookmarklet] = useState(false);
  const [pipActive, setPipActive] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // If user is directly on the dedicated full-page /dashboard/tool, suppress the duplicate floating container
  const isFullPageTool = pathname === '/dashboard/tool';

  // Bookmarklet code for 1-click injection on ANY external betting site (Stake, Bet365, Roobet, etc.)
  const bookmarkletCode = `javascript:(function(){if(window.__ROULETTE_OVERLAY_LOADED__){window.__ROULETTE_OVERLAY_TOGGLE__&&window.__ROULETTE_OVERLAY_TOGGLE__();return;}var s=document.createElement('script');s.src='https://roulettecomputer.com/overlay.js?v='+Date.now();document.head.appendChild(s);})();`;

  const handleCopyBookmarklet = () => {
    navigator.clipboard.writeText(bookmarkletCode);
    setCopiedBookmarklet(true);
    setTimeout(() => setCopiedBookmarklet(false), 2500);
  };

  // Launch OS-level Always-on-top Picture-in-Picture window over betting sites
  const launchAlwaysOnTopPiP = async () => {
    if (typeof window === 'undefined') return;

    if ('documentPictureInPicture' in window) {
      try {
        const pipWindow = await (window as any).documentPictureInPicture.requestWindow({
          width: 480,
          height: 720,
        });

        // Ensure both HTML and Body occupy 100% of the PiP window to prevent flex collapse
        pipWindow.document.documentElement.style.height = '100%';
        pipWindow.document.documentElement.style.width = '100%';
        pipWindow.document.body.style.height = '100%';
        pipWindow.document.body.style.width = '100%';
        pipWindow.document.body.style.margin = '0';
        pipWindow.document.body.style.padding = '0';
        pipWindow.document.body.style.background = '#05080f';
        pipWindow.document.body.style.overflow = 'hidden';

        const container = pipWindow.document.createElement('div');
        container.style.cssText =
          'width:100%;height:100%;display:flex;flex-direction:column;position:relative;background:#05080f;font-family:-apple-system,BlinkMacSystemFont,sans-serif;color:#fff;overflow:hidden;';

        const header = pipWindow.document.createElement('div');
        header.style.cssText =
          'flex-shrink:0;display:flex;align-items:center;justify-content:space-between;padding:8px 12px;background:#0a0f1d;border-bottom:1px solid rgba(255,255,255,0.12);user-select:none;';
        header.innerHTML = `
          <div style="display:flex;align-items:center;gap:8px;">
            <img src="/logo.png" style="width:24px;height:24px;border-radius:50%;object-fit:cover;" />
            <span style="font-size:12px;font-weight:900;letter-spacing:0.04em;">ROULETTE<span style="color:#f5b301">.TOOLS</span></span>
            <span style="font-size:9px;color:#22c55e;font-weight:700;background:rgba(34,197,94,0.15);padding:1px 6px;border-radius:999px;">● ALWAYS ON TOP</span>
          </div>
          <div style="display:flex;gap:6px;">
            <button id="pip-min" style="background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.2);color:#f5b301;border-radius:6px;padding:3px 8px;font-size:11px;font-weight:bold;cursor:pointer;">🗕 Compact</button>
            <button id="pip-exp" style="background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.2);color:#1fc8a9;border-radius:6px;padding:3px 8px;font-size:11px;font-weight:bold;cursor:pointer;">⛶ Expand</button>
          </div>
        `;
        container.appendChild(header);

        // Absolute wrapper ensures iframe fills 100% height without any flex min-height collapsing
        const frameWrap = pipWindow.document.createElement('div');
        frameWrap.style.cssText = 'flex:1;width:100%;height:100%;min-height:0;position:relative;overflow:hidden;';

        const frame = pipWindow.document.createElement('iframe');
        frame.src = '/api/roulette-tool?overlay=1';
        frame.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;border:none;display:block;';
        frame.allow = 'fullscreen';
        frameWrap.appendChild(frame);
        container.appendChild(frameWrap);

        pipWindow.document.body.appendChild(container);

        const minBtn = pipWindow.document.getElementById('pip-min');
        const expBtn = pipWindow.document.getElementById('pip-exp');

        minBtn.onclick = () => {
          pipWindow.resizeTo(360, 540);
        };
        expBtn.onclick = () => {
          pipWindow.resizeTo(520, 780);
        };

        setPipActive(true);
        minimizeToolWidget();

        pipWindow.addEventListener('pagehide', () => {
          setPipActive(false);
        });
        return;
      } catch (err) {
        console.warn('PiP window launch failed:', err);
      }
    }

    // Fallback: dedicated browser popout window
    popoutToolWindow();
  };

  // Trigger Messenger-style bounce / ripple whenever new predictions arrive
  useEffect(() => {
    if (predictionData?.updatedAt) {
      setHasNewPrediction(true);
      setPulseKey((k) => k + 1);
      const timer = setTimeout(() => setHasNewPrediction(false), 3500);
      return () => clearTimeout(timer);
    }
  }, [predictionData?.updatedAt]);

  // If widget is explicitly closed by user or we are already on full tool page, hide it
  if (!isWidgetActive || isFullPageTool) {
    return null;
  }

  return (
    <>
      {/* ==================================================================== */}
      {/* 1. MOBILE BACKDROP (TAP TO MINIMIZE ON MOBILE)                        */}
      {/* ==================================================================== */}
      {isOpen && !isMinimized && (
        <div
          onClick={minimizeToolWidget}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm sm:hidden z-[99998] transition-opacity duration-200"
          aria-label="Close prediction drawer"
        />
      )}

      {/* ==================================================================== */}
      {/* 2. MESSENGER FLOATING BUBBLE (COLLAPSED / MINIMIZED STATE)           */}
      {/* ==================================================================== */}
      {isMinimized && (
        <motion.div
          drag
          dragMomentum={false}
          dragElastic={0.1}
          className="fixed bottom-5 right-4 sm:bottom-6 sm:right-6 z-[99999] touch-none select-none"
          style={{ isolation: 'isolate' }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 280, damping: 22 }}
        >
          {/* Animated ripple rings for incoming live spin predictions */}
          {hasNewPrediction && (
            <motion.div
              key={pulseKey}
              initial={{ scale: 0.8, opacity: 0.95 }}
              animate={{ scale: 2.1, opacity: 0 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
              className="absolute inset-0 rounded-full border-2 border-emerald-400 pointer-events-none"
            />
          )}

          <div className="relative group">
            <button
              type="button"
              onClick={openToolWidget}
              className="relative flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-[#070b14] p-1 shadow-[0_12px_40px_rgba(0,0,0,0.9)] border-2 border-amber-500/90 hover:border-amber-400 active:scale-95 focus:outline-none transition-all cursor-pointer"
              title="Roulette Live Prediction Engine (Click to open floating drawer)"
            >
              {/* Outer spinning gradient glow */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-amber-500 via-teal-400 to-amber-600 opacity-60 blur-[3px] group-hover:opacity-100 transition-opacity" />

              {/* Inner Logo */}
              <div className="relative h-full w-full rounded-full overflow-hidden bg-black p-0.5 flex items-center justify-center border border-white/10">
                <img
                  src="/logo.png"
                  alt="Roulette.tools"
                  className="h-full w-full object-cover rounded-full"
                />
              </div>

              {/* Live Status Beacon Dot (Top-Right Badge) */}
              <span className="absolute -top-1 -right-1 flex h-4 w-4 sm:h-5 sm:w-5 items-center justify-center rounded-full bg-emerald-500 text-[8px] sm:text-[9px] font-black font-display text-black shadow-md border-2 border-[#070b14]">
                <span className="absolute h-full w-full rounded-full bg-emerald-400 animate-ping opacity-75" />
                <span className="relative">●</span>
              </span>

              {/* Prediction Pocket Chip (Floating Below Bubble) */}
              {predictionData?.predictedPocket && (
                <span className="absolute -bottom-2 font-display text-[8px] sm:text-[9px] font-black uppercase tracking-wider text-black bg-gradient-to-r from-amber-400 to-amber-500 px-2 py-0.5 rounded-full shadow-lg border border-black/40 whitespace-nowrap">
                  {predictionData.predictedPocket}
                </span>
              )}
            </button>
          </div>
        </motion.div>
      )}

      {/* ==================================================================== */}
      {/* 3. FLOATING DRAWER / WINDOW (EXPANDED POPUP STATE)                   */}
      {/* ==================================================================== */}
      <div
        className={`fixed z-[99999] transition-all duration-300 ease-out flex flex-col overflow-hidden ${
          isOpen && !isMinimized
            ? 'pointer-events-auto opacity-100 scale-100'
            : 'pointer-events-none opacity-0 scale-90 translate-y-8'
        } 
        /* Mobile: Bottom-Sheet Drawer */
        bottom-0 left-0 right-0 w-full h-[90vh] max-h-[92vh] rounded-t-3xl rounded-b-none border-t border-amber-500/40 bg-[#070b14]/98 shadow-[0_-20px_60px_rgba(0,0,0,0.95)] backdrop-blur-2xl
        /* Desktop: Floating Window */
        sm:bottom-6 sm:right-6 sm:left-auto sm:w-[520px] md:w-[600px] sm:h-[82vh] sm:max-h-[720px] sm:rounded-3xl sm:border sm:border-amber-500/40 sm:shadow-[0_25px_70px_rgba(0,0,0,0.95)]
        `}
        style={{
          boxShadow: '0 20px 60px -15px rgba(245, 158, 11, 0.25), 0 25px 70px rgba(0, 0, 0, 0.95)',
        }}
      >
        {/* Mobile Swipe / Drag Handle Indicator */}
        <div
          className="w-12 h-1.5 rounded-full bg-slate-600/80 mx-auto my-2 sm:hidden shrink-0 cursor-pointer"
          onClick={minimizeToolWidget}
        />

        {/* Floating Drawer Top Header */}
        <div className="flex-shrink-0 flex items-center justify-between px-3.5 sm:px-4 py-2.5 sm:py-3 border-b border-white/10 bg-[#0a0f1d]/95 backdrop-blur-xl">
          {/* Left: Brand & Live Beacon */}
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <div className="relative flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-full p-0.5 bg-gradient-to-br from-amber-400 via-amber-600 to-amber-950 shadow-md">
              <img
                src="/logo.png"
                alt="Logo"
                className="h-full w-full rounded-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-display text-xs sm:text-sm font-black tracking-wider text-white truncate">
                  ROULETTE<span className="text-amber-400">.TOOLS</span>
                </span>
                <span className="flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-1.5 py-0.2 text-[9px] font-mono text-emerald-400 font-bold shrink-0">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  LIVE
                </span>
              </div>
              <p className="text-[10px] text-slate-400 truncate max-w-[150px] sm:max-w-[220px]">
                {predictionData?.tableName || 'Live Telemetry Terminal'}
              </p>
            </div>
          </div>

          {/* Right: Controls (Betting Site PiP, Overlay Guide, Minimize, Fullscreen, Close) */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            {/* OVERLAY ON BETTING SITE BUTTON */}
            <button
              type="button"
              onClick={() => setShowOverlayGuide(true)}
              className="flex items-center gap-1 rounded-lg border border-amber-500/40 bg-amber-500/15 px-2 py-1 text-[10px] font-display font-bold uppercase tracking-wider text-amber-300 hover:bg-amber-500/25 transition-all cursor-pointer shadow-sm"
              title="Float directly over betting sites (Stake, Bet365, etc.)"
            >
              <Zap className="h-3 w-3 text-amber-400" />
              <span className="hidden md:inline">Betting Site Overlay</span>
              <span className="md:hidden">Betting Overlay</span>
            </button>

            {/* ALWAYS-ON-TOP PiP BUTTON */}
            <button
              type="button"
              onClick={launchAlwaysOnTopPiP}
              className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg border border-teal-500/40 bg-teal-500/10 text-teal-300 hover:bg-teal-500/20 transition-colors cursor-pointer"
              title="Float Always-On-Top over other browser tabs & casino windows"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </button>

            {/* MINIMIZE TO MESSENGER BUBBLE BUTTON */}
            <button
              type="button"
              onClick={minimizeToolWidget}
              className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg border border-white/10 text-slate-300 hover:bg-white/10 hover:text-amber-400 transition-colors cursor-pointer"
              title="Minimize into floating Messenger bubble"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>

            {/* FULLSCREEN BUTTON */}
            <Link
              href="/dashboard/tool"
              onClick={() => {
                minimizeToolWidget();
              }}
              className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg border border-white/10 text-slate-300 hover:bg-white/10 hover:text-emerald-400 transition-colors cursor-pointer"
              title="Expand to Fullscreen Page"
            >
              <Maximize2 className="h-3.5 w-3.5" />
            </Link>

            {/* CLOSE BUTTON */}
            <button
              type="button"
              onClick={closeToolWidget}
              className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg border border-white/10 text-slate-400 hover:bg-rose-500/20 hover:text-rose-400 transition-colors cursor-pointer"
              title="Close floating tool widget"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Content Body: Native Real-Time Roulette Prediction Engine */}
        <div className="flex-1 relative w-full h-full min-h-0 bg-[#05090f] overflow-y-auto">
          <RouletteEngineTool compact={true} />
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 4. BETTING SITE OVERLAY GUIDE & 1-CLICK LAUNCHER MODAL               */}
      {/* ==================================================================== */}
      {showOverlayGuide && (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-3xl border border-amber-500/40 bg-[#080d19] p-6 shadow-2xl space-y-5 text-slate-100">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <Zap className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-display text-base font-black uppercase text-white">
                    Direct Betting Site Overlay
                  </h3>
                  <p className="text-xs text-amber-400/90 font-mono">
                    Works directly on Stake, Bet365, Roobet, Evolution & more
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowOverlayGuide(false)}
                className="rounded-lg p-1 text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Description */}
            <p className="text-xs text-slate-300 leading-relaxed">
              You can float this Messenger bubble directly on top of your betting site. When you click the bubble on your betting site, it opens the live prediction drawer right beside your roulette table!
            </p>

            {/* Method A: Always On Top Window */}
            <div className="rounded-2xl border border-teal-500/30 bg-teal-500/10 p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-display text-xs font-bold uppercase text-teal-300 flex items-center gap-1.5">
                  <ExternalLink className="h-3.5 w-3.5 text-teal-400" />
                  Method 1: Always-On-Top Floating Window (PC)
                </span>
                <span className="text-[10px] bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded-full font-bold">
                  Instant
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                Creates an OS-level mini floating window that hovers over other browser tabs and casino windows automatically.
              </p>
              <button
                type="button"
                onClick={() => {
                  setShowOverlayGuide(false);
                  launchAlwaysOnTopPiP();
                }}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-teal-500 hover:bg-teal-400 py-2.5 font-display text-xs font-black uppercase tracking-wider text-black transition-all shadow-md cursor-pointer"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Launch Floating Window Now
              </button>
            </div>

            {/* Method B: Bookmarklet for Mobile & Desktop */}
            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-display text-xs font-bold uppercase text-amber-300 flex items-center gap-1.5">
                  <Bookmark className="h-3.5 w-3.5 text-amber-400" />
                  Method 2: 1-Click Betting Site Bookmarklet
                </span>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-bold">
                  Mobile & PC
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                Drag this bookmark button to your browser bookmarks bar (or copy the code). While on your betting site, tap the bookmark: the floating Messenger bubble will appear right on your betting site!
              </p>

              <div className="flex flex-col sm:flex-row gap-2">
                {/* Draggable Bookmark Link */}
                <a
                  href={bookmarkletCode}
                  onClick={(e) => {
                    e.preventDefault();
                    handleCopyBookmarklet();
                  }}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-amber-400 bg-amber-500/20 hover:bg-amber-500/30 py-2.5 px-3 text-xs font-bold text-amber-300 transition-all cursor-grab active:cursor-grabbing text-center"
                  title="Drag to Bookmarks bar or click to copy"
                >
                  <Bookmark className="h-3.5 w-3.5 text-amber-400" />
                  <span>🎡 Drag to Bookmarks</span>
                </a>

                {/* Copy Bookmarklet Button */}
                <button
                  type="button"
                  onClick={handleCopyBookmarklet}
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 py-2.5 px-4 font-display text-xs font-black uppercase tracking-wider text-black transition-all cursor-pointer shadow-md"
                >
                  {copiedBookmarklet ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedBookmarklet ? 'Copied!' : 'Copy Code'}</span>
                </button>
              </div>
            </div>

            {/* Close Modal */}
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowOverlayGuide(false)}
                className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold uppercase text-slate-300 hover:bg-slate-700 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
