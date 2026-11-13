'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useToolWidget } from '../context/ToolWidgetContext';
import { ApiRouletteTool } from './tool/ApiRouletteTool';
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
  Move
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
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // If user is directly on the dedicated full-page /dashboard/tool, suppress the floating duplicate
  const isFullPageTool = pathname === '/dashboard/tool';

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
        <div className="w-12 h-1.5 rounded-full bg-slate-600/80 mx-auto my-2 sm:hidden shrink-0 cursor-pointer" onClick={minimizeToolWidget} />

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

          {/* Right: Controls (Mode Switch, Popout, Minimize, Fullscreen, Close) */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            {/* Mode Switcher: Iframe (Current file) vs API (Future API System) */}
            <div className="flex items-center rounded-lg border border-slate-700 bg-black/60 p-0.5 text-[9px] sm:text-[10px] font-display font-bold">
              <button
                type="button"
                onClick={() => setToolMode('iframe')}
                className={`rounded px-1.5 py-0.5 transition-colors cursor-pointer ${
                  toolMode === 'iframe'
                    ? 'bg-amber-500 text-black shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Current embedded tool file"
              >
                File Tool
              </button>
              <button
                type="button"
                onClick={() => setToolMode('api')}
                className={`rounded px-1.5 py-0.5 transition-colors cursor-pointer ${
                  toolMode === 'api'
                    ? 'bg-amber-500 text-black shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Future direct API prediction mode"
              >
                API Tool
              </button>
            </div>

            {/* POPOUT FLOATING MINI-WINDOW BUTTON (for viewing over external casino tabs) */}
            <button
              type="button"
              onClick={popoutToolWindow}
              className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg border border-white/10 text-slate-300 hover:bg-white/10 hover:text-teal-400 transition-colors cursor-pointer"
              title="Pop out into floating window over other casino tabs"
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

        {/* Content Body (Preserves iframe & socket state 100% without disconnecting) */}
        <div className="flex-1 relative w-full h-full min-h-0 bg-[#05090f] overflow-hidden">
          {/* Mode 1: Sandboxed Iframe (Current index.html tool) */}
          <div
            className={`w-full h-full flex flex-col ${
              toolMode === 'iframe' ? 'block' : 'hidden'
            }`}
          >
            {!iframeLoaded && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#05090f] text-slate-400">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent mb-2" />
                <p className="font-display text-[11px] uppercase tracking-wider text-slate-400">
                  Loading Real-Time Terminal...
                </p>
              </div>
            )}
            <iframe
              ref={iframeRef}
              src="/api/roulette-tool"
              title="Floating Roulette Predictor"
              className="w-full h-full flex-1 border-0 block"
              allow="fullscreen"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
              onLoad={() => setIframeLoaded(true)}
            />
          </div>

          {/* Mode 2: Future API Integration Component */}
          {toolMode === 'api' && (
            <ApiRouletteTool
              onPredictionChange={(data) => {
                updatePredictionData(data);
              }}
              onMinimize={minimizeToolWidget}
            />
          )}
        </div>
      </div>
    </>
  );
}
