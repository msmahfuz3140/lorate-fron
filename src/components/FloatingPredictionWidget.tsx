'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useToolWidget } from '../context/ToolWidgetContext';
import { ApiRouletteTool } from './tool/ApiRouletteTool';
import {
  Minus,
  Maximize2,
  X,
  Radio,
  Sparkles,
  Layers,
  ChevronDown,
  Terminal,
  RefreshCw,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';

export function FloatingPredictionWidget() {
  const router = useRouter();
  const pathname = usePathname();
  const {
    isOpen,
    isMinimized,
    isWidgetActive,
    toolMode,
    predictionData,
    openToolWidget,
    minimizeToolWidget,
    toggleToolWidget,
    closeToolWidget,
    setToolMode,
  } = useToolWidget();

  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [hasNewPrediction, setHasNewPrediction] = useState(false);
  const [pulseKey, setPulseKey] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // If we are currently directly on the full-page /dashboard/tool, don't show floating drawer over it
  const isFullPageTool = pathname === '/dashboard/tool';

  // Trigger Messenger-style bounce / ripple whenever new predictions arrive
  useEffect(() => {
    if (predictionData?.updatedAt) {
      setHasNewPrediction(true);
      setPulseKey((k) => k + 1);
      const timer = setTimeout(() => setHasNewPrediction(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [predictionData?.updatedAt]);

  // If widget is not active or user is viewing full tool page, keep bubble hidden
  if (!isWidgetActive || isFullPageTool) {
    return null;
  }

  return (
    <>
      {/* ==================================================================== */}
      {/* 1. MESSENGER FLOATING BUBBLE (COLLAPSED STATE)                        */}
      {/* ==================================================================== */}
      {isMinimized && (
        <div
          className="fixed bottom-6 right-6 z-[9999] select-none"
          style={{ isolation: 'isolate' }}
        >
          {/* Animated incoming prediction ripple rings */}
          {hasNewPrediction && (
            <motion.div
              key={pulseKey}
              initial={{ scale: 0.8, opacity: 0.9 }}
              animate={{ scale: 1.8, opacity: 0 }}
              transition={{ duration: 1.4, repeat: Infinity, ease: 'easeOut' }}
              className="absolute inset-0 rounded-full border-2 border-emerald-400 pointer-events-none"
            />
          )}

          <motion.button
            onClick={openToolWidget}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            className="group relative flex h-16 w-16 items-center justify-center rounded-full bg-[#070b14] p-1 shadow-[0_10px_35px_rgba(0,0,0,0.85)] border-2 border-amber-500/80 hover:border-amber-400 focus:outline-none transition-all cursor-pointer"
            title="Roulette.tools Live Prediction Terminal (Click to open floating drawer)"
          >
            {/* Outer spinning gradient ring */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-amber-500 via-teal-400 to-amber-600 opacity-60 blur-[3px] group-hover:opacity-100 transition-opacity" />

            {/* Inner Avatar / Logo */}
            <div className="relative h-full w-full rounded-full overflow-hidden bg-black p-1 flex items-center justify-center border border-white/10">
              <img
                src="/logo.png"
                alt="Roulette.tools"
                className="h-full w-full object-cover rounded-full"
              />
            </div>

            {/* Live Indicator Beacon (Top-Right Badge) */}
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[9px] font-black font-display text-black shadow-md border border-black">
              <span className="absolute h-full w-full rounded-full bg-emerald-400 animate-ping opacity-75" />
              <span className="relative">●</span>
            </span>

            {/* Prediction Pocket Chip (Floating Below Bubble) */}
            {predictionData?.predictedPocket && (
              <span className="absolute -bottom-2 font-display text-[9px] font-black uppercase tracking-wider text-black bg-gradient-to-r from-amber-400 to-amber-500 px-2 py-0.5 rounded-full shadow-lg border border-black/40 whitespace-nowrap">
                {predictionData.predictedPocket}
              </span>
            )}
          </motion.button>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 2. FLOATING DRAWER / WINDOW (EXPANDED MESSENGER POPUP STATE)         */}
      {/* ==================================================================== */}
      <div
        className={`fixed z-[9999] transition-all duration-300 ease-out ${
          isOpen && !isMinimized
            ? 'pointer-events-auto opacity-100 scale-100'
            : 'pointer-events-none opacity-0 scale-90 translate-y-8'
        } bottom-4 sm:bottom-6 right-2 sm:right-6 w-[96vw] sm:w-[490px] md:w-[580px] h-[82vh] max-h-[720px] rounded-3xl border border-amber-500/40 bg-[#070b14]/95 shadow-[0_25px_70px_rgba(0,0,0,0.9)] backdrop-blur-2xl flex flex-col overflow-hidden`}
        style={{
          boxShadow: '0 20px 60px -15px rgba(245, 158, 11, 0.2), 0 25px 70px rgba(0, 0, 0, 0.95)',
        }}
      >
        {/* Floating Drawer Top Header */}
        <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b border-white/10 bg-[#0a0f1d]/90 backdrop-blur-xl">
          {/* Left: Brand & Live Beacon */}
          <div className="flex items-center gap-2.5">
            <div className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full p-0.5 bg-gradient-to-br from-amber-400 via-amber-600 to-amber-950 shadow-md">
              <img
                src="/logo.png"
                alt="Logo"
                className="h-full w-full rounded-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-display text-xs font-black tracking-wider text-white">
                  ROULETTE<span className="text-amber-400">.TOOLS</span>
                </span>
                <span className="flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-1.5 py-0.2 text-[9px] font-mono text-emerald-400 font-bold">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  LIVE
                </span>
              </div>
              <p className="text-[10px] text-slate-400 truncate max-w-[180px]">
                {predictionData?.tableName || 'Live Telemetry Terminal'}
              </p>
            </div>
          </div>

          {/* Right: Controls (Mode Toggle, Minimize, Fullscreen, Close) */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            {/* Mode Switcher: Iframe (Current file) vs API (Future API System) */}
            <div className="flex items-center rounded-lg border border-slate-700 bg-black/60 p-0.5 text-[10px] font-display font-bold">
              <button
                type="button"
                onClick={() => setToolMode('iframe')}
                className={`rounded px-1.5 py-0.5 transition-colors ${
                  toolMode === 'iframe'
                    ? 'bg-amber-500 text-black shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Use current embedded roulette index tool"
              >
                File Tool
              </button>
              <button
                type="button"
                onClick={() => setToolMode('api')}
                className={`rounded px-1.5 py-0.5 transition-colors ${
                  toolMode === 'api'
                    ? 'bg-amber-500 text-black shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Switch to direct API prediction mode"
              >
                API Tool
              </button>
            </div>

            {/* MINIMIZE BUTTON (Smoothly collapses into Messenger Bubble) */}
            <button
              type="button"
              onClick={minimizeToolWidget}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 text-slate-300 hover:bg-white/10 hover:text-amber-400 transition-colors"
              title="Minimize into floating Messenger bubble"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>

            {/* FULLSCREEN BUTTON */}
            <Link
              href="/dashboard/tool"
              onClick={() => {
                // When navigating to full page, close the floating drawer
                minimizeToolWidget();
              }}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 text-slate-300 hover:bg-white/10 hover:text-emerald-400 transition-colors"
              title="Expand to Fullscreen View"
            >
              <Maximize2 className="h-3.5 w-3.5" />
            </Link>

            {/* CLOSE BUTTON */}
            <button
              type="button"
              onClick={closeToolWidget}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 text-slate-400 hover:bg-rose-500/20 hover:text-rose-400 transition-colors"
              title="Close floating tool widget"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
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
                // Keep bubble badge updated with latest predictions
                if (data.predictedPocket) {
                  useToolWidget; // Context will update
                }
              }}
              onMinimize={minimizeToolWidget}
            />
          )}
        </div>
      </div>
    </>
  );
}

