'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { authClient } from '../../lib/auth-client';
import {
  Activity,
  Radio,
  RefreshCw,
  Sliders,
  ChevronDown,
  Layers,
  Sparkles,
  Zap,
  ShieldCheck,
  AlertTriangle,
  ArrowRightLeft,
  Info
} from 'lucide-react';

// =============================================================================
// EUROPEAN ROULETTE WHEEL CONSTANTS & MATH
// =============================================================================
const RING = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5,
  24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
];
const N = RING.length;
const POS: Record<number, number> = {};
RING.forEach((n, i) => {
  POS[n] = i;
});

const RED_NUMS = new Set([1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]);
const BLACK_NUMS = new Set([2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35]);

function getNumberColor(num: number): 'red' | 'black' | 'green' {
  if (num === 0) return 'green';
  return RED_NUMS.has(num) ? 'red' : 'black';
}

function at(pos: number): number {
  return RING[((pos % N) + N) % N];
}

function dsp(n: any): string {
  if (n === null || n === undefined) return '--';
  return n === -1 ? '00' : String(n);
}

function arc(cx: number, cy: number, r1: number, r2: number, a1: number, a2: number): string {
  const x1 = cx + Math.cos(a1) * r1, y1 = cy + Math.sin(a1) * r1;
  const x2 = cx + Math.cos(a2) * r1, y2 = cy + Math.sin(a2) * r1;
  const x3 = cx + Math.cos(a2) * r2, y3 = cy + Math.sin(a2) * r2;
  const x4 = cx + Math.cos(a1) * r2, y4 = cy + Math.sin(a1) * r2;
  return `M${x1} ${y1} A${r1} ${r1} 0 0 1 ${x2} ${y2} L${x3} ${y3} A${r2} ${r2} 0 0 0 ${x4} ${y4} Z`;
}

export interface RouletteEngineToolProps {
  compact?: boolean;
}

export function RouletteEngineTool({ compact = false }: RouletteEngineToolProps) {
  const [tables, setTables] = useState<any[]>([]);
  const [currentTableId, setCurrentTableId] = useState<string>('');
  const [currentDirection, setCurrentDirection] = useState<'CW' | 'CCW'>('CW');
  const [currentWindow, setCurrentWindow] = useState<number>(25);
  const [neighborCount, setNeighborCount] = useState<number>(4);
  const [activeView, setActiveView] = useState<'racetrack' | 'circular' | 'livegraph' | 'travel'>('racetrack');
  const [predictionData, setPredictionData] = useState<any>(null);
  const [travelData, setTravelData] = useState<any>(null);
  const [isConfigured, setIsConfigured] = useState<boolean | null>(null);
  const [isLive, setIsLive] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('CONNECTING...');
  const [showRawOutput, setShowRawOutput] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const pollTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isFetchingRef = useRef<boolean>(false);

  // 1. Initial Configuration Check
  const checkConfig = useCallback(async () => {
    try {
      const config = await authClient.getDsConfig();
      if (config && config.configured) {
        setIsConfigured(true);
        return true;
      } else {
        setIsConfigured(false);
        setStatusMessage('UNCONFIGURED');
        return false;
      }
    } catch {
      setIsConfigured(true);
      return true;
    }
  }, []);

  // 2. Fetch Live Tables List
  const fetchTablesList = useCallback(async () => {
    try {
      const res = await authClient.getDsTables({ limit: 100 });
      if (res && res.success && res.data && Array.isArray(res.data.tables)) {
        setTables(res.data.tables);
        setIsLive(true);
        setStatusMessage('LIVE');

        if (!currentTableId && res.data.tables.length > 0) {
          setCurrentTableId(res.data.tables[0].id);
        }
      } else if (res && res.error && res.error.code === 'DS_NOT_CONFIGURED') {
        setIsConfigured(false);
        setStatusMessage('UNCONFIGURED');
      }
    } catch (err: any) {
      if (err?.message?.includes('DS_NOT_CONFIGURED')) {
        setIsConfigured(false);
        setStatusMessage('UNCONFIGURED');
      }
    }
  }, [currentTableId]);

  // 3. Fetch Prediction & Travel Data for Current Table
  const fetchActiveTableData = useCallback(async (force = false) => {
    if (!currentTableId) return;
    if (isFetchingRef.current && !force) return;

    isFetchingRef.current = true;
    setIsLoading(true);

    try {
      const [predRes, travelRes] = await Promise.all([
        authClient.getDsTablePrediction(currentTableId, currentDirection, currentWindow).catch(() => null),
        authClient.getDsTableTravelChart(currentTableId, currentDirection, currentWindow).catch(() => null)
      ]);

      if (predRes && predRes.success && predRes.data) {
        setPredictionData(predRes.data);
        setIsLive(true);
        setStatusMessage('LIVE');
      }

      if (travelRes && travelRes.success && travelRes.data) {
        setTravelData(travelRes.data);
      }
    } catch (err: any) {
      console.warn('Real-time poll warning:', err);
    } finally {
      isFetchingRef.current = false;
      setIsLoading(false);
    }
  }, [currentTableId, currentDirection, currentWindow]);

  // Initial Load
  useEffect(() => {
    let mounted = true;
    (async () => {
      await checkConfig();
      if (mounted) {
        await fetchTablesList();
      }
    })();
    return () => {
      mounted = false;
    };
  }, [checkConfig, fetchTablesList]);

  // When currentTableId changes, fetch immediately
  useEffect(() => {
    if (currentTableId) {
      fetchActiveTableData(true);
    }
  }, [currentTableId, fetchActiveTableData]);

  // Cyclic real-time auto-refresh without page reload (every 3 seconds)
  useEffect(() => {
    if (!currentTableId) return;

    if (pollTimerRef.current) clearInterval(pollTimerRef.current);

    pollTimerRef.current = setInterval(() => {
      fetchActiveTableData(false);
    }, 3200);

    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, [currentTableId, fetchActiveTableData]);

  // Periodic table list poll (every 30 seconds)
  useEffect(() => {
    const listTimer = setInterval(() => {
      fetchTablesList();
    }, 30000);
    return () => clearInterval(listTimer);
  }, [fetchTablesList]);

  // Toggle Direction (CW <-> CCW) with INSTANT refresh
  const handleToggleDirection = () => {
    const nextDir = currentDirection === 'CW' ? 'CCW' : 'CW';
    setCurrentDirection(nextDir);
  };

  // When direction changes, instantly re-fetch
  useEffect(() => {
    if (currentTableId) {
      fetchActiveTableData(true);
    }
  }, [currentDirection, fetchActiveTableData]);

  // Sample Window Adjust
  const handleAdjustWindow = (delta: number) => {
    const nextWin = Math.max(10, Math.min(100, currentWindow + delta));
    setCurrentWindow(nextWin);
  };

  // Helper variables from predictionData
  const p = predictionData?.prediction || {};
  const s = predictionData?.statistics || {};
  const b = predictionData?.backtest || {};
  const pat = predictionData?.pattern || (predictionData?.structures?.selected) || {};
  const wlChart = predictionData?.wl_chart || b?.wl_chart || {};

  // W/L List (oldest_first to show LEFT TO RIGHT chronologically)
  const n9List: string[] = wlChart.oldest_first || (wlChart.n9 ? [...wlChart.n9].reverse() : []);
  const wCount = n9List.filter((x) => x === 'W').length;
  const lCount = n9List.filter((x) => x === 'L').length;

  const winRate = s.n9_accuracy !== undefined ? (s.n9_accuracy * 100).toFixed(1) : '0.0';
  const lastSpin = p.last_spin;
  const spinsHistory: number[] = predictionData?.spins || travelData?.spins_history || [];

  return (
    <div className={`w-full flex flex-col gap-3 font-sans text-slate-100 ${compact ? 'p-2 text-xs' : 'p-3 sm:p-5'}`}>
      {/* Top Header & Table Selection */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl border border-white/10 bg-[#090e18]/90 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 font-display text-sm font-black uppercase tracking-wider text-white">
            <Radio className="h-4 w-4 text-amber-400 animate-pulse" />
            <span>ROULETTE<span className="text-amber-400">.TOOLS</span></span>
          </div>

          <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold uppercase border ${
            isLive
              ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
              : isConfigured === false
              ? 'border-amber-500/40 bg-amber-500/10 text-amber-400'
              : 'border-rose-500/40 bg-rose-500/10 text-rose-400'
          }`}>
            <span className={`h-1.5 w-1.5 rounded-full ${isLive ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
            <span>{statusMessage}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Table Selector */}
          <select
            value={currentTableId}
            onChange={(e) => setCurrentTableId(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-white/10 bg-slate-900/90 text-xs font-semibold text-white focus:border-amber-500 focus:outline-none min-w-[190px]"
          >
            {tables.length === 0 ? (
              <option value="">Loading live tables...</option>
            ) : (
              tables.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} {t.dealer ? `(${t.dealer})` : ''} — {t.spin_count || t.spins?.length || 0} spins
                </option>
              ))
            )}
          </select>

          {/* View Mode Tabs */}
          <div className="inline-flex rounded-xl border border-white/10 bg-black/40 p-1 gap-1">
            <button
              onClick={() => setActiveView('racetrack')}
              className={`px-2.5 py-1 rounded-lg font-display text-[10px] font-black uppercase tracking-wider transition-all ${
                activeView === 'racetrack'
                  ? 'bg-amber-500 text-black shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              ⬭ Racetrack
            </button>
            <button
              onClick={() => setActiveView('circular')}
              className={`px-2.5 py-1 rounded-lg font-display text-[10px] font-black uppercase tracking-wider transition-all ${
                activeView === 'circular'
                  ? 'bg-amber-500 text-black shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              ◯ Wheel
            </button>
            <button
              onClick={() => setActiveView('livegraph')}
              className={`px-2.5 py-1 rounded-lg font-display text-[10px] font-black uppercase tracking-wider transition-all ${
                activeView === 'livegraph'
                  ? 'bg-amber-500 text-black shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              📈 Live Graph
            </button>
            <button
              onClick={() => setActiveView('travel')}
              className={`px-2.5 py-1 rounded-lg font-display text-[10px] font-black uppercase tracking-wider transition-all ${
                activeView === 'travel'
                  ? 'bg-amber-500 text-black shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              📊 Travel
            </button>
          </div>

          <button
            onClick={() => fetchActiveTableData(true)}
            disabled={isLoading}
            className="p-1.5 rounded-lg border border-white/10 bg-white/5 text-slate-300 hover:text-white hover:bg-white/10"
            title="Refresh active feed"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Unconfigured Notice Banner */}
      {isConfigured === false && (
        <div className="p-4 rounded-2xl border border-amber-500/40 bg-amber-500/10 text-amber-200 space-y-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0" />
            <h4 className="font-display text-sm font-bold uppercase tracking-wider">
              Dealer Signature API Credentials Required
            </h4>
          </div>
          <p className="text-xs text-amber-200/90 leading-relaxed">
            Please configure your <b>Server API Key (sk_key)</b> and <b>Public API Base URL</b> in the Platform Admin Panel (<code className="bg-black/30 px-1 py-0.5 rounded">Admin Console → Settings / Tool Management</code>). Once saved, live tables and real-time predictions will automatically stream here.
          </p>
        </div>
      )}

      {/* Split Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        {/* LEFT COLUMN: Live Signals, W/L Pattern, and Controls (4 cols on lg) */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          {/* CARD 1: LIVE SIGNAL (Matching Image 2) */}
          <div className="p-4 rounded-2xl border border-white/10 bg-gradient-to-br from-[#0c1220] to-[#070b14] shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-sm bg-sky-400" />
                Live Signal
              </span>
              <span className="font-mono text-[10px] text-slate-400">Real-Time Engine</span>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-3">
              {/* Main Target Box */}
              <div className="flex flex-col justify-center border-r border-white/10 pr-4">
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Main Target
                </span>
                <div className="flex items-baseline gap-2 my-1">
                  <span className="font-mono text-5xl font-black text-amber-400 leading-none">
                    {dsp(p.main)}
                  </span>
                  <span className="font-mono text-xs font-bold text-slate-400">n9</span>
                </div>
                <span className="font-mono text-[10px] text-amber-400/90 font-semibold">
                  9 numbers sector
                </span>
              </div>

              {/* Secondary Targets (Top Over & Top Under) */}
              <div className="flex flex-col justify-around gap-2">
                <div>
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Top Over
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xl font-black text-orange-400">
                      {dsp(p.over_center || (p.top_over ? p.top_over[4] : '--'))}
                    </span>
                    <span className="font-mono text-[10px] text-slate-400">n4</span>
                    {p.status === 'OVER' && (
                      <span className="font-mono text-[9px] font-bold px-1.5 py-0.5 rounded-full border border-orange-500/50 bg-orange-500/20 text-orange-400 uppercase">
                        Last Hit
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Top Under
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xl font-black text-cyan-400">
                      {dsp(p.under_center || (p.top_under ? p.top_under[4] : '--'))}
                    </span>
                    <span className="font-mono text-[10px] text-slate-400">n4</span>
                    {p.status === 'UNDER' && (
                      <span className="font-mono text-[9px] font-bold px-1.5 py-0.5 rounded-full border border-cyan-500/50 bg-cyan-500/20 text-cyan-400 uppercase">
                        Last Hit
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CARD 2: WIN / LOSS PATTERN (Matching Image 2) */}
          <div className="p-4 rounded-2xl border border-white/10 bg-[#090e18] shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Detected Pattern
                </span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="font-mono text-xl font-black text-sky-400">{wCount}W</span>
                  <span className="text-slate-600 font-black">·</span>
                  <span className="font-mono text-xl font-black text-rose-500">{lCount}L</span>
                </div>
              </div>

              <div className="text-right">
                <span className="font-mono text-lg font-black text-white block leading-none">
                  {pat.cycle ? `${pat.cycle}×` : '1×'}
                </span>
                <span className="font-mono text-[9px] uppercase tracking-wider text-slate-400">
                  Cycle Size
                </span>
              </div>
            </div>

            {/* W/L Horizontal Strip (LEFT TO RIGHT CHRONOLOGICAL FLOW) */}
            <div className="flex items-center gap-1.5 overflow-x-auto py-1">
              {n9List.length === 0 ? (
                <div className="font-mono text-xs text-slate-400 py-1">
                  Evaluating spins (25+ jumps needed for W/L evaluation)...
                </div>
              ) : (
                n9List.slice(-10).map((res, idx, arr) => {
                  const isNewest = idx === arr.length - 1;
                  return (
                    <div
                      key={idx}
                      className={`h-8 w-8 rounded-lg flex items-center justify-center font-mono text-xs font-black text-white shrink-0 transition-transform ${
                        res === 'W'
                          ? 'bg-gradient-to-br from-emerald-500 to-emerald-700 border border-emerald-400/40'
                          : 'bg-gradient-to-br from-rose-500 to-rose-700 border border-rose-400/40'
                      } ${isNewest ? 'ring-2 ring-white scale-110 shadow-[0_0_10px_rgba(255,255,255,0.4)]' : ''}`}
                      title={isNewest ? 'NEWEST RESULT' : `Spin #${idx + 1}`}
                    >
                      {res}
                    </div>
                  );
                })
              )}
            </div>

            <div className="font-mono text-[10px] text-slate-400">
              last {n9List.length} signals: {wCount}W - {lCount}L. NEW = most recent result
            </div>
          </div>

          {/* CARD 3: DIRECTION & CONTROLS (Matching Image 2) */}
          <div className="p-4 rounded-2xl border border-white/10 bg-[#090e18] shadow-xl space-y-3.5">
            <div className="flex items-center justify-between">
              <button
                onClick={handleToggleDirection}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-black border border-white/20 text-white font-display text-xs font-bold uppercase tracking-wider hover:border-amber-400 hover:shadow-[0_0_12px_rgba(245,158,11,0.3)] transition-all cursor-pointer"
              >
                <ArrowRightLeft className="h-3.5 w-3.5 text-amber-400" />
                <span>Switch Side</span>
              </button>

              <div className="text-right">
                <span className="font-mono text-[9px] uppercase tracking-wider text-slate-400 block">
                  Direction
                </span>
                <span className="font-mono text-base font-black text-white flex items-center gap-1 justify-end">
                  <span>{currentDirection === 'CW' ? '↻' : '↺'}</span>
                  <span>{currentDirection}</span>
                </span>
              </div>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl border border-white/5 bg-black/40">
              <div>
                <span className="font-mono text-[9px] font-bold uppercase text-slate-400 block">
                  Win Rate
                </span>
                <span className="font-mono text-sm font-black text-white">{winRate}%</span>
                <div className="w-full h-1 bg-white/10 rounded-full mt-1 overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, Math.max(0, Number(winRate)))}%` }}
                  />
                </div>
              </div>

              <div>
                <span className="font-mono text-[9px] font-bold uppercase text-slate-400 block">
                  Avg Used
                </span>
                <span className="font-mono text-sm font-black text-white">{currentWindow}</span>
              </div>

              <div>
                <span className="font-mono text-[9px] font-bold uppercase text-slate-400 block">
                  Trend
                </span>
                <span className="font-mono text-sm font-black text-emerald-400">
                  {pat.classification || (p.ready ? 'READY' : 'BUILDING')}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 pt-1">
              <button
                onClick={() => setShowRawOutput(!showRawOutput)}
                className="font-mono text-[10px] font-bold uppercase text-slate-400 hover:text-white transition-colors"
              >
                {showRawOutput ? '▲ Hide Raw Output' : '▼ Show Raw Output'}
              </button>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleAdjustWindow(5)}
                  className="px-2 py-1 rounded-lg border border-white/10 bg-white/5 font-mono text-[10px] font-bold text-slate-300 hover:text-white hover:bg-white/10"
                >
                  + Add Avg
                </button>
                <button
                  onClick={() => handleAdjustWindow(-5)}
                  className="px-2 py-1 rounded-lg border border-white/10 bg-white/5 font-mono text-[10px] font-bold text-slate-300 hover:text-white hover:bg-white/10"
                >
                  - Sub Avg
                </button>
              </div>
            </div>

            {/* Raw JSON Debug Viewer */}
            {showRawOutput && (
              <pre className="p-3 rounded-xl border border-white/10 bg-black font-mono text-[10px] text-sky-400 max-h-48 overflow-y-auto whitespace-pre-wrap">
                {JSON.stringify(predictionData || {}, null, 2)}
              </pre>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Visual Elements (Racetrack, Circular Wheel, Live Graph, Travel Chart) (7 cols on lg) */}
        <div className="lg:col-span-7 flex flex-col gap-3">
          {/* Winning Numbers Strip (Matching Image 1) */}
          <div className="flex items-center gap-3 p-2.5 px-3 rounded-2xl border border-white/10 bg-black/80 overflow-x-auto shadow-inner">
            <span className="font-mono text-[10px] font-bold uppercase text-slate-400 shrink-0">
              Winning Strip:
            </span>
            <div className="flex items-center gap-3">
              {(spinsHistory.length > 0 ? spinsHistory.slice(-14) : lastSpin !== undefined ? [lastSpin] : []).map(
                (num, idx, arr) => {
                  const isLatest = idx === arr.length - 1;
                  const color = getNumberColor(num);
                  return (
                    <span
                      key={idx}
                      className={`font-mono text-sm font-black shrink-0 ${
                        color === 'red' ? 'text-rose-500' : color === 'green' ? 'text-emerald-400' : 'text-white'
                      } ${
                        isLatest
                          ? 'border border-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-md shadow-[0_0_8px_rgba(255,255,255,0.3)]'
                          : ''
                      }`}
                    >
                      {dsp(num)}
                    </span>
                  );
                }
              )}
            </div>
          </div>

          {/* VIEW 1: RACETRACK OVAL (Matching Image 1) */}
          {activeView === 'racetrack' && (
            <div className="p-4 rounded-2xl border border-white/10 bg-[#070b14] shadow-xl space-y-2">
              <div className="flex items-center justify-between pb-2 border-b border-white/5">
                <span className="font-display text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-sm bg-amber-400" />
                  European Roulette Oval Racetrack
                </span>
                <div className="flex items-center gap-1 font-mono text-[11px] text-slate-400">
                  <span>NEIGHBORS:</span>
                  <span className="font-bold text-amber-400">{neighborCount}</span>
                </div>
              </div>

              <div className="w-full bg-[#020408] rounded-xl p-2 border border-white/5 overflow-hidden">
                <RacetrackOvalSvg
                  prediction={p}
                  neighborCount={neighborCount}
                  onAdjustNeighbor={(delta) => setNeighborCount((prev) => Math.max(1, Math.min(9, prev + delta)))}
                />
              </div>
            </div>
          )}

          {/* VIEW 2: CIRCULAR WHEEL (From User Code) */}
          {activeView === 'circular' && (
            <div className="p-4 rounded-2xl border border-white/10 bg-[#070b14] shadow-xl space-y-2">
              <div className="flex items-center justify-between pb-2 border-b border-white/5">
                <span className="font-display text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-sm bg-amber-400" />
                  Radial Wheel Prediction Engine
                </span>
                <span className="font-mono text-[10px] text-slate-400">37 Pockets Mathematical Radial</span>
              </div>

              <div className="max-w-[420px] mx-auto p-2">
                <CircularWheelSvg prediction={p} />
              </div>
            </div>
          )}

          {/* VIEW 3: LIVE GRAPH WITH MIDDLE YELLOW LINE (Extra Requested Option) */}
          {activeView === 'livegraph' && (
            <div className="p-4 rounded-2xl border border-white/10 bg-[#070b14] shadow-xl space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-white/5">
                <span className="font-display text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-sm bg-amber-400" />
                  Live Graph · Middle Yellow Mean Threshold
                </span>
                <span
                  className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                    (travelData?.line?.travel_average || 0) >= 0
                      ? 'border border-orange-500/50 bg-orange-500/20 text-orange-400'
                      : 'border border-cyan-500/50 bg-cyan-500/20 text-cyan-400'
                  }`}
                >
                  {(travelData?.line?.travel_average || 0) >= 0 ? 'TOP OVER ▲' : 'TOP UNDER ▼'}
                </span>
              </div>

              <div className="flex items-center gap-4 text-[10px] font-mono text-slate-400 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <span className="h-1 w-3 bg-amber-400 rounded-full" />
                  <span>Middle Yellow Line (Mean)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-1 w-3 bg-orange-400 rounded-full" />
                  <span>Top Over Zone (Above)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-1 w-3 bg-cyan-400 rounded-full" />
                  <span>Top Under Zone (Below)</span>
                </div>
              </div>

              <div className="w-full bg-[#020408] rounded-xl border border-white/5 overflow-hidden p-2">
                <LiveThresholdGraphSvg travelData={travelData} />
              </div>
            </div>
          )}

          {/* VIEW 4: TRAVEL DATA (Direction-Aware Chart) */}
          {activeView === 'travel' && (
            <div className="p-4 rounded-2xl border border-white/10 bg-[#070b14] shadow-xl space-y-2">
              <div className="flex items-center justify-between pb-2 border-b border-white/5">
                <span className="font-display text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-sm bg-cyan-400" />
                  Travel Data &amp; W/L Historical Backtest
                </span>
                <span className="font-mono text-xs font-bold text-amber-400">
                  {travelData?.direction === 'CCW' ? '−' : '+'}
                  {(travelData?.line?.travel_average || 8.4).toFixed(1)} ({travelData?.direction || currentDirection})
                </span>
              </div>

              <div className="w-full bg-[#020408] rounded-xl border border-white/5 overflow-hidden p-2">
                <TravelChartSvg travelData={travelData} direction={currentDirection} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// SUB-COMPONENT: RACETRACK OVAL SVG (Matching Image 1)
// =============================================================================
function RacetrackOvalSvg({
  prediction,
  neighborCount,
  onAdjustNeighbor
}: {
  prediction: any;
  neighborCount: number;
  onAdjustNeighbor: (delta: number) => void;
}) {
  const mainNum = prediction?.main;
  const topOverSet = new Set(prediction?.top_over || []);
  const topUnderSet = new Set(prediction?.top_under || []);
  const lastSpin = prediction?.last_spin;

  // The 37 European numbers along the oval racetrack
  const ovalNumbers = [
    24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, // top straight (15)
    3, 26, 0, // right curve (3)
    32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, // bottom straight (15)
    8, 23, 10, 5 // left curve (4)
  ];

  const xLeft = 140, xRight = 780;
  const yTop = 60, yBottom = 260;
  const cellW = (xRight - xLeft) / 15;
  const cellH = 34;

  const renderCell = (n: number, x: number, y: number, w: number, h: number) => {
    let fill = '#0a0f18';
    let stroke = 'rgba(255,255,255,0.18)';
    let strokeW = 1;
    let textFill = '#fff';

    if (RED_NUMS.has(n)) fill = '#dc2626';
    else if (BLACK_NUMS.has(n)) fill = '#090d14';
    else if (n === 0) fill = '#475569';

    if (topOverSet.has(n)) {
      stroke = '#FF8C00';
      strokeW = 2.2;
      fill = 'rgba(255, 140, 0, 0.55)';
    }

    if (topUnderSet.has(n)) {
      stroke = '#00CED1';
      strokeW = 2.2;
      fill = 'rgba(0, 206, 209, 0.55)';
    }

    if (n === mainNum) {
      fill = '#FFD166';
      stroke = '#fff';
      strokeW = 2.8;
      textFill = '#000';
    }

    if (n === lastSpin) {
      stroke = '#ffffff';
      strokeW = 3;
    }

    return (
      <g key={`${n}-${x}-${y}`} transform={`translate(${x}, ${y})`}>
        <rect width={w} height={h} rx={3} fill={fill} stroke={stroke} strokeWidth={strokeW} />
        <text
          x={w / 2}
          y={h / 2 + 4.5}
          textAnchor="middle"
          fontFamily="'JetBrains Mono', monospace"
          fontSize="12"
          fontWeight="800"
          fill={textFill}
        >
          {dsp(n)}
        </text>
      </g>
    );
  };

  return (
    <svg viewBox="0 0 940 340" className="w-full h-auto block select-none">
      {/* Inner Background */}
      <path
        d={`M ${xLeft} ${yTop + cellH} L ${xRight} ${yTop + cellH} A 90 90 0 0 1 ${xRight} ${yBottom} L ${xLeft} ${yBottom} A 90 90 0 0 1 ${xLeft} ${yTop + cellH} Z`}
        fill="#05080e"
        stroke="rgba(255,255,255,0.14)"
        strokeWidth="1.2"
      />

      {/* Sector Separator Lines */}
      <line x1="320" y1={yTop + cellH} x2="380" y2={yBottom} stroke="rgba(255,255,255,0.25)" strokeWidth="1.4" />
      <line x1="510" y1={yTop + cellH} x2="510" y2={yBottom} stroke="rgba(255,255,255,0.25)" strokeWidth="1.4" />
      <path
        d={`M 680 ${yTop + cellH} A 65 65 0 0 1 680 ${yBottom}`}
        fill="none"
        stroke="rgba(255,255,255,0.25)"
        strokeWidth="1.4"
      />

      {/* Sector Labels (Classic French Betting Names) */}
      <text x="240" y="180" textAnchor="middle" fontFamily="sans-serif" fontSize="19" fontWeight="700" letterSpacing="3" fill="#cbd5e1">
        TIER
      </text>
      <text x="430" y="180" textAnchor="middle" fontFamily="sans-serif" fontSize="17" fontWeight="700" letterSpacing="3" fill="#cbd5e1">
        ORPHELINS
      </text>
      <text x="590" y="180" textAnchor="middle" fontFamily="sans-serif" fontSize="18" fontWeight="700" letterSpacing="3" fill="#cbd5e1">
        VOISINS
      </text>
      <text x="740" y="180" textAnchor="middle" fontFamily="sans-serif" fontSize="18" fontWeight="700" letterSpacing="3" fill="#cbd5e1">
        ZERO
      </text>

      {/* Right Controls (+, 4, -) */}
      <g transform="translate(885, 120)">
        <circle
          cx="20"
          cy="15"
          r="16"
          fill="#0d1424"
          stroke="rgba(255,255,255,0.3)"
          strokeWidth="1.5"
          className="cursor-pointer hover:stroke-amber-400"
          onClick={() => onAdjustNeighbor(1)}
        />
        <text x="20" y="21" textAnchor="middle" fontFamily="monospace" fontSize="20" fontWeight="800" fill="#fff" pointerEvents="none">
          +
        </text>

        <text x="20" y="70" textAnchor="middle" fontFamily="monospace" fontSize="24" fontWeight="900" fill="#fff">
          {neighborCount}
        </text>

        <circle
          cx="20"
          cy="115"
          r="16"
          fill="#0d1424"
          stroke="rgba(255,255,255,0.3)"
          strokeWidth="1.5"
          className="cursor-pointer hover:stroke-amber-400"
          onClick={() => onAdjustNeighbor(-1)}
        />
        <text x="20" y="121" textAnchor="middle" fontFamily="monospace" fontSize="22" fontWeight="800" fill="#fff" pointerEvents="none">
          −
        </text>
      </g>

      {/* Top Straight */}
      {ovalNumbers.slice(0, 15).map((n, i) => renderCell(n, xLeft + i * cellW, yTop, cellW, cellH))}

      {/* Right Curve */}
      {ovalNumbers.slice(15, 18).map((n, i) => {
        const angle = -Math.PI / 2 + (i + 1) * (Math.PI / 4);
        const cx = xRight + 10, cy = (yTop + yBottom + cellH) / 2;
        const rx = 65, ry = (yBottom - yTop) / 2 + 10;
        const x = cx + Math.cos(angle) * rx - 18;
        const y = cy + Math.sin(angle) * ry - 14;
        return renderCell(n, x, y, 36, cellH);
      })}

      {/* Bottom Straight */}
      {ovalNumbers.slice(18, 33).map((n, i) => renderCell(n, xRight - (i + 1) * cellW, yBottom, cellW, cellH))}

      {/* Left Curve */}
      {ovalNumbers.slice(33, 37).map((n, i) => {
        const angle = Math.PI / 2 + (i + 1) * (Math.PI / 5);
        const cx = xLeft - 10, cy = (yTop + yBottom + cellH) / 2;
        const rx = 65, ry = (yBottom - yTop) / 2 + 10;
        const x = cx + Math.cos(angle) * rx - 18;
        const y = cy + Math.sin(angle) * ry - 14;
        return renderCell(n, x, y, 36, cellH);
      })}
    </svg>
  );
}

// =============================================================================
// SUB-COMPONENT: CIRCULAR WHEEL SVG (User Code)
// =============================================================================
function CircularWheelSvg({ prediction }: { prediction: any }) {
  const size = 352, cx = 176, cy = 176, rO = 162, rI = 108;
  const n9 = new Set(prediction?.n9 || []);
  const OV = new Set(prediction?.top_over || []);
  const UN = new Set(prediction?.top_under || []);
  const ovOn = prediction?.status === 'OVER';
  const unOn = prediction?.status === 'UNDER';

  const overHalf = at((POS[prediction?.main] || 0) + 5);
  const underHalf = at((POS[prediction?.main] || 0) - 5);

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-auto block select-none">
      {/* Segments */}
      {RING.map((n, i) => {
        const a1 = (i / N) * Math.PI * 2 - Math.PI / 2;
        const a2 = ((i + 1) / N) * Math.PI * 2 - Math.PI / 2;

        let fill = 'rgba(15, 23, 42, 0.7)';
        let stroke = 'rgba(255, 255, 255, 0.08)';
        let tc = '#94a3b8';
        let strokeW = 1;
        let dash = '';

        if (n9.has(n)) {
          fill = 'rgba(255,140,0,.15)';
          stroke = 'rgba(255,140,0,.38)';
          tc = '#d9a468';
        }

        if (OV.has(n)) {
          if (ovOn) {
            fill = 'rgba(255,140,0,.46)';
            stroke = '#FF8C00';
            tc = '#fff';
            strokeW = 2.2;
          } else {
            fill = 'rgba(255,140,0,.12)';
            stroke = 'rgba(255,140,0,.55)';
            tc = '#ffcf9b';
            dash = '4 3';
            strokeW = 1.3;
          }
        }

        if (UN.has(n)) {
          if (unOn) {
            fill = 'rgba(0,206,209,.46)';
            stroke = '#00CED1';
            tc = '#fff';
            strokeW = 2.2;
          } else {
            fill = 'rgba(0,206,209,.12)';
            stroke = 'rgba(0,206,209,.55)';
            tc = '#9fe9ea';
            dash = '4 3';
            strokeW = 1.3;
          }
        }

        if (n === prediction?.main) {
          fill = '#FFD166';
          stroke = '#FFD166';
          tc = '#1a1206';
          strokeW = 2.6;
        }

        if (n === prediction?.last_spin) {
          stroke = '#fff';
          strokeW = 2.8;
        }

        const am = (a1 + a2) / 2, r = (rI + rO) / 2;
        const x = cx + Math.cos(am) * r;
        const y = cy + Math.sin(am) * r;

        return (
          <g key={n}>
            <path
              d={arc(cx, cy, rI, rO, a1, a2)}
              fill={fill}
              stroke={stroke}
              strokeWidth={strokeW}
              strokeDasharray={dash}
            />
            <text
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="central"
              fontFamily="monospace"
              fontSize="12.5"
              fontWeight="700"
              fill={tc}
              transform={`rotate(${(am * 180) / Math.PI + 90} ${x} ${y})`}
            >
              {dsp(n)}
            </text>
          </g>
        );
      })}

      {/* Center Details */}
      <circle cx={cx} cy={cy} r={rI - 9} fill="#0c1017" stroke="rgba(255,255,255,0.08)" />
      <text x={cx} y={cy - 22} textAnchor="middle" fontFamily="monospace" fontSize="9" fill="#475569" letterSpacing="2">
        MAIN PREDICTION
      </text>
      <text x={cx} y={cy + 10} textAnchor="middle" fontFamily="monospace" fontSize="32" fontWeight="900" fill="#FFD166">
        {dsp(prediction?.main)}
      </text>
      <text x={cx} y={cy + 30} textAnchor="middle" fontFamily="monospace" fontSize="9" fill="#94a3b8">
        n9 · 9 numbers
      </text>
      <text x={cx} y={cy + 50} textAnchor="middle" fontFamily="monospace" fontSize="9" fill="#FF8C00">
        ▲ OVER {dsp(overHalf)}n4
      </text>
      <text x={cx} y={cy + 64} textAnchor="middle" fontFamily="monospace" fontSize="9" fill="#00CED1">
        ▼ UNDER {dsp(underHalf)}n4
      </text>
    </svg>
  );
}

// =============================================================================
// SUB-COMPONENT: LIVE GRAPH WITH MIDDLE YELLOW LINE (Extra Requested Option)
// =============================================================================
function LiveThresholdGraphSvg({ travelData }: { travelData: any }) {
  const points = travelData?.points ? travelData.points.slice(-30) : [];
  const W = 880, H = 300;
  const padL = 50, padR = 40, padT = 30, padB = 40;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;
  const midY = padT + innerH / 2; // Middle Baseline (Yellow Line)

  const yVals = [20, 10, 0, -10, -20];

  let poly = '';
  const circles: any[] = [];

  if (points.length > 0) {
    const stepX = innerW / Math.max(1, points.length - 1);
    points.forEach((pt: any, i: number) => {
      const v = pt.signed !== undefined ? pt.signed : pt.magnitude || 0;
      const px = padL + i * stepX;
      const clampedV = Math.max(-20, Math.min(20, v));
      const py = midY - (clampedV / 20) * (innerH / 2);

      poly += (i === 0 ? 'M' : 'L') + `${px} ${py} `;

      const isCurrent = i === points.length - 1;
      const isOver = py < midY;
      const dotColor = isOver ? '#FF8C00' : '#00CED1';

      circles.push(
        <circle
          key={i}
          cx={px}
          cy={py}
          r={isCurrent ? 5.5 : 3.5}
          fill={dotColor}
          stroke="#fff"
          strokeWidth={isCurrent ? 2 : 1}
        />
      );
    });
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block select-none">
      {/* Top Over Zone Background */}
      <rect x={padL} y={padT} width={innerW} height={innerH / 2} fill="rgba(255, 140, 0, 0.08)" />
      {/* Top Under Zone Background */}
      <rect x={padL} y={midY} width={innerW} height={innerH / 2} fill="rgba(0, 206, 209, 0.08)" />

      {/* Grid Lines */}
      {yVals.map((val) => {
        const yPos = midY - (val / 20) * (innerH / 2);
        return (
          <g key={val}>
            <line x1={padL} y1={yPos} x2={W - padR} y2={yPos} stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3" />
            <text x={padL - 10} y={yPos + 4} textAnchor="end" fontFamily="monospace" fontSize="9" fill="#475569">
              {val > 0 ? `+${val}` : val}
            </text>
          </g>
        );
      })}

      {/* Middle Yellow Line */}
      <line x1={padL} y1={midY} x2={W - padR} y2={midY} stroke="#FFD166" strokeWidth={2.4} />
      <text x={W - padR + 5} y={midY + 4} fontFamily="monospace" fontSize="9" fontWeight="700" fill="#FFD166">
        0 (MEAN)
      </text>

      {/* Zone Watermark Labels */}
      <text x={padL + 15} y={padT + 22} fontFamily="monospace" fontSize="11" fontWeight="800" fill="rgba(255,140,0,0.6)" letterSpacing="1">
        ▲ TOP OVER ZONE
      </text>
      <text x={padL + 15} y={H - padB - 12} fontFamily="monospace" fontSize="11" fontWeight="800" fill="rgba(0,206,209,0.6)" letterSpacing="1">
        ▼ TOP UNDER ZONE
      </text>

      {/* Plotted Trajectory */}
      {poly && <path d={poly} fill="none" stroke="#fff" strokeWidth={2} strokeLinejoin="round" />}
      {circles}
    </svg>
  );
}

// =============================================================================
// SUB-COMPONENT: TRAVEL CHART SVG (Section 6.3)
// =============================================================================
function TravelChartSvg({ travelData, direction }: { travelData: any; direction: string }) {
  const points = travelData?.points || [];
  const line = travelData?.line || {};
  const wl = travelData?.wl || {};
  const D = (travelData?.direction || direction) === 'CCW' ? -1 : 1;
  const X = line.travel_average || 8.4;
  const lineVal = D * X;

  const W = 900, H = 450;
  const x0 = 62, x1 = 884;
  const yTop = 42, yBot = 236;

  const y = (v: number) => yTop + ((18 - v) / 36) * (yBot - yTop);
  const x = (i: number) => x0 + (i / Math.max(1, points.length - 1)) * (x1 - x0);

  let poly = '';
  const dots: any[] = [];
  const bigRings: any[] = [];

  points.forEach((it: any, i: number) => {
    const v = it.signed !== undefined ? it.signed : D * (it.magnitude || 0);
    poly += (i === 0 ? 'M' : 'L') + `${x(i)} ${y(v)} `;

    if (it.direction_changed) {
      dots.push(<circle key={`dot-${i}`} cx={x(i)} cy={y(v)} r={3.1} fill="#FF3333" />);
    }
    if (it.big) {
      bigRings.push(
        <circle key={`big-${i}`} cx={x(i)} cy={y(v)} r={4.6} fill="none" stroke="#FF3333" strokeWidth={1.4} />
      );
    }
  });

  const rows = (wl.rows || []).slice(-40);
  const sw = Math.min(18, (x1 - x0) / Math.max(1, rows.length) - 2);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block select-none">
      <rect width={W} height={H} fill="#080c13" />

      {/* Grid Lines */}
      {[-18, -12, -6, 0, 6, 12, 18].map((v) => (
        <g key={v}>
          <line x1={x0} y1={y(v)} x2={x1} y2={y(v)} stroke="rgba(255,255,255,0.08)" strokeWidth={1} />
          <text x={x0 - 7} y={y(v) + 3} textAnchor="end" fontFamily="monospace" fontSize="8" fill="#475569">
            {v > 0 ? `+${v}` : v}
          </text>
        </g>
      ))}

      {/* +/- 7 Band */}
      <rect
        x={x0}
        y={y(lineVal + 7)}
        width={x1 - x0}
        height={Math.max(2, y(lineVal - 7) - y(lineVal + 7))}
        fill="rgba(255,140,0,.055)"
      />

      {/* Mean Travel Line */}
      <line x1={x0} y1={y(lineVal)} x2={x1} y2={y(lineVal)} stroke="#FF8C00" strokeWidth={1.8} />
      <text x={x1} y={y(lineVal) - 6} textAnchor="end" fontFamily="monospace" fontSize="9" fill="#FF8C00">
        X = {D === 1 ? '+' : '−'}{X.toFixed(1)} ({D === 1 ? 'CW' : 'CCW'})
      </text>

      {/* Trajectory */}
      {poly && <path d={poly} fill="none" stroke="#00CED1" strokeWidth={1.7} strokeLinejoin="round" />}
      {dots}
      {bigRings}

      <text x={x0} y={20} fontFamily="monospace" fontSize="9" fill="#94a3b8" letterSpacing="2">
        ROW 1 · TRAVEL {D === 1 ? 'CW +' : 'CCW −'}
      </text>
      <text x={x0} y={264} fontFamily="monospace" fontSize="9" fill="#94a3b8" letterSpacing="2">
        ROW 2 · W/L n9
      </text>
      <text x={x0} y={328} fontFamily="monospace" fontSize="9" fill="#94a3b8" letterSpacing="2">
        ROW 3 · W/L n4
      </text>

      {/* W/L n9 and n4 Rows */}
      {rows.map((r: any, i: number) => {
        const xx = x0 + i * ((x1 - x0) / Math.max(1, rows.length));
        const win9 = r.n9 === 'W' || r.win9;
        const c9 = win9 ? '#18C07A' : '#FF3333';

        const win4 = r.n4;
        const c4 = win4 === null || win4 === undefined ? 'rgba(255,255,255,0.05)' : win4 === 'W' || win4 === true ? '#18C07A' : '#FF3333';

        return (
          <g key={i}>
            <rect x={xx} y={278} width={sw} height={17} rx={3} fill={c9} opacity={win9 ? 0.75 : 0.55} />
            <text x={xx + sw / 2} y={290} textAnchor="middle" fontFamily="monospace" fontSize="8" fill="#fff">
              {win9 ? 'W' : 'L'}
            </text>

            <rect x={xx} y={342} width={sw} height={17} rx={3} fill={c4} opacity={win4 === null ? 0.35 : 0.75} />
            <text x={xx + sw / 2} y={354} textAnchor="middle" fontFamily="monospace" fontSize="8" fill="#fff">
              {win4 === null || win4 === undefined ? '–' : win4 === 'W' || win4 === true ? 'W' : 'L'}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
