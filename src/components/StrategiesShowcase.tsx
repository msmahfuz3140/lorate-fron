'use client';

import React, { useState } from 'react';
import { Target, Compass, Gauge, CheckCircle2, TrendingUp, AlertTriangle } from 'lucide-react';

export function StrategiesShowcase() {
  const [activeStrategy, setActiveStrategy] = useState<'offset' | 'target' | 'dealer'>('offset');

  return (
    <section id="strategies" className="py-20 border-t border-white/5 relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-3 py-1 mb-4">
            <span className="h-1.5 w-1.5 rounded-full bg-teal-400" />
            <span className="font-display text-[10px] font-bold uppercase tracking-widest text-teal-400">
              TRIPLE ALGORITHMIC SUITE
            </span>
          </div>
          <h2 className="font-display text-2xl sm:text-4xl font-extrabold uppercase tracking-tight text-white mb-4">
            Three Specialized Prediction Strategies
          </h2>
          <p className="font-body text-base text-slate-400 leading-relaxed">
            Every roulette wheel and croupier operates with distinct physical tendencies. Choose the model engineered for your table’s live pattern.
          </p>
        </div>

        {/* Strategy Selector Tabs */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex rounded-xl border border-white/10 bg-slate-950/80 p-1.5 backdrop-blur-md">
            <button
              onClick={() => setActiveStrategy('offset')}
              className={`flex items-center gap-2 rounded-lg px-5 py-2.5 font-display text-xs font-bold uppercase tracking-wider transition-all ${
                activeStrategy === 'offset'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-lg shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Compass className="h-4 w-4" />
              Offset Strategy
            </button>

            <button
              onClick={() => setActiveStrategy('target')}
              className={`flex items-center gap-2 rounded-lg px-5 py-2.5 font-display text-xs font-bold uppercase tracking-wider transition-all ${
                activeStrategy === 'target'
                  ? 'bg-gradient-to-r from-rose-500 to-rose-600 text-white shadow-lg shadow-rose-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Target className="h-4 w-4" />
              Target Strategy
            </button>

            <button
              onClick={() => setActiveStrategy('dealer')}
              className={`flex items-center gap-2 rounded-lg px-5 py-2.5 font-display text-xs font-bold uppercase tracking-wider transition-all ${
                activeStrategy === 'dealer'
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-black shadow-lg shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Gauge className="h-4 w-4" />
              Dealer Signature <span className="rounded bg-black/40 px-1 py-0.2 text-[9px]">NEW</span>
            </button>
          </div>
        </div>

        {/* Dynamic Strategy Content */}
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/80 to-slate-950/90 p-6 sm:p-10 shadow-2xl backdrop-blur-xl">
          {activeStrategy === 'offset' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <div className="inline-block rounded border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 font-display text-[11px] font-bold text-amber-400 uppercase tracking-widest mb-3">
                  POCKET DISTANCE & CONFIRMATION
                </div>
                <h3 className="font-display text-2xl font-bold uppercase tracking-wide text-white mb-4">
                  Offset Strategy
                </h3>
                <p className="text-slate-300 font-body text-base leading-relaxed mb-6">
                  Analyzes chronological spin differences through dynamic addition/subtraction models (+ and -1, + and -2).
                  Identifies repeating pocket distance intervals and recommends high-probability numbers with neighbor radius (e.g. <code>25n1</code>, <code>20n3</code>).
                </p>

                <div className="space-y-3 font-display text-xs text-slate-300">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                    <span>Calculates exact pocket distance between predicted and winning outcomes</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                    <span>Flags reliable patterns with 3+ spin confirmations</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                    <span>Optimized for low volatility European Roulette sessions</span>
                  </div>
                </div>
              </div>

              {/* Visual Demo Box */}
              <div className="rounded-xl border border-white/10 bg-black/50 p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <span className="font-display text-xs font-bold text-slate-400 uppercase tracking-wider">Offset Calculation Demo</span>
                  <span className="font-display text-xs font-bold text-emerald-400">RECOMMENDED</span>
                </div>
                <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
                  <p className="font-display text-xs text-slate-400 mb-1">Calculation: Playing (+ and -1)</p>
                  <p className="font-display text-base font-bold text-white mb-2">
                    Prediction: <span className="text-amber-400">25n1, 20n3, 32n3</span>
                  </p>
                  <div className="flex justify-between text-xs text-slate-400 pt-2 border-t border-white/10">
                    <span>Confirmed by: <strong className="text-white">4 spins</strong></span>
                    <span>Pocket Distance: <strong className="text-emerald-400">1 Pocket</strong></span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeStrategy === 'target' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <div className="inline-block rounded border border-rose-500/30 bg-rose-500/10 px-2.5 py-1 font-display text-[11px] font-bold text-rose-400 uppercase tracking-widest mb-3">
                  STREAK SEQUENCES & MOMENTUM
                </div>
                <h3 className="font-display text-2xl font-bold uppercase tracking-wide text-white mb-4">
                  Target Strategy
                </h3>
                <p className="text-slate-300 font-body text-base leading-relaxed mb-6">
                  Tracks chronological Win/Loss historical streak patterns (e.g. <code>W W W L W W W</code>).
                  Detects table momentum shifts early and alerts you when a winning streak is weakening so you can exit safely.
                </p>

                <div className="space-y-3 font-display text-xs text-slate-300">
                  <div className="flex items-start gap-2.5">
                    <TrendingUp className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                    <span>Pinpoints active hot tables with low loss ratios</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                    <span>Automated exit signals when streak length begins to shrink</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                    <span>Works across both Evolution Gaming and Pragmatic Play tables</span>
                  </div>
                </div>
              </div>

              {/* Visual Demo Box */}
              <div className="rounded-xl border border-white/10 bg-black/50 p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <span className="font-display text-xs font-bold text-slate-400 uppercase tracking-wider">Streak Pattern Stream</span>
                  <span className="font-display text-xs font-bold text-rose-400">MOMENTUM: HOT</span>
                </div>
                <div className="flex gap-2">
                  {['W', 'W', 'W', 'L', 'W', 'W', 'W', 'L', 'W', 'W'].map((val, idx) => (
                    <span
                      key={idx}
                      className={`flex h-9 w-9 items-center justify-center rounded-lg font-display text-xs font-bold ${
                        val === 'W'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {val}
                    </span>
                  ))}
                </div>
                <p className="font-display text-xs text-slate-400">
                  Current Status: <strong>Streak of 3 Consecutive Wins</strong> detected. Target: <span className="text-amber-400">15n7</span>
                </p>
              </div>
            </div>
          )}

          {activeStrategy === 'dealer' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <div className="inline-block rounded border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 font-display text-[11px] font-bold text-emerald-400 uppercase tracking-widest mb-3">
                  PHYSICAL TRAJECTORY & SIGNATURE
                </div>
                <h3 className="font-display text-2xl font-bold uppercase tracking-wide text-white mb-4">
                  Dealer Signature Strategy
                </h3>
                <p className="text-slate-300 font-body text-base leading-relaxed mb-6">
                  Every human croupier has an ingrained physical motor rhythm. Our engine models the ball travel distance across wheel rotations,
                  generating TOP (OVER) and TOP (UNDER) sector triggers relative to the baseline travel line.
                </p>

                <div className="space-y-3 font-display text-xs text-slate-300">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Real-time ball travel distance chart tracking</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>TOP OVER (e.g. 0n4) & TOP UNDER (e.g. 9n4) sector recommendations</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Filters out erratic dealers with irregular travel volatility</span>
                  </div>
                </div>
              </div>

              {/* Visual Demo Box */}
              <div className="rounded-xl border border-white/10 bg-black/50 p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <span className="font-display text-xs font-bold text-slate-400 uppercase tracking-wider">Travel Line Indicator</span>
                  <span className="font-display text-xs font-bold text-emerald-400">PHASE: CONSISTENT (88.8%)</span>
                </div>
                <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-display text-slate-400">Position Relative to Baseline:</span>
                    <strong className="font-display text-amber-400">TOP (OVER)</strong>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-display text-slate-400">Recommended Placement:</span>
                    <strong className="font-display text-emerald-400">0 with 4 Neighbours (0n4)</strong>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden mt-2">
                    <div className="h-full bg-gradient-to-r from-emerald-500 to-amber-500 w-[88%]" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
