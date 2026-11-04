'use client';

import React, { useState } from 'react';
import { Lock, Radio, Shield, Sparkles, ExternalLink, ArrowRight } from 'lucide-react';

interface TablePreview {
  id: string;
  name: string;
  provider: string;
  strategy: string;
  isHot: boolean;
  history: number[];
}

const TABLES_DATA: TablePreview[] = [
  {
    id: 'evo-lightning',
    name: 'Lightning Roulette',
    provider: 'Evolution Gaming',
    strategy: 'Dealer Signature',
    isHot: true,
    history: [14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26]
  },
  {
    id: 'evo-speed',
    name: 'Speed Roulette 1',
    provider: 'Evolution Gaming',
    strategy: 'Target Strategy',
    isHot: true,
    history: [0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27]
  },
  {
    id: 'prag-azure',
    name: 'Azure Roulette',
    provider: 'Pragmatic Play',
    strategy: 'Offset Strategy',
    isHot: false,
    history: [23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22]
  },
  {
    id: 'evo-vip',
    name: 'VIP Roulette',
    provider: 'Evolution Gaming',
    strategy: 'Offset Strategy',
    isHot: true,
    history: [7, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20]
  },
  {
    id: 'prag-ruby',
    name: 'Ruby Roulette',
    provider: 'Pragmatic Play',
    strategy: 'Dealer Signature',
    isHot: false,
    history: [26, 3, 35, 12, 28, 7, 29, 18, 22, 9, 31, 14]
  },
  {
    id: 'evo-immersive',
    name: 'Immersive Roulette',
    provider: 'Evolution Gaming',
    strategy: 'Target Strategy',
    isHot: true,
    history: [17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5]
  }
];

export function LiveLobbyPreview() {
  const [selectedTable, setSelectedTable] = useState<TablePreview | null>(null);

  const getNumberColorClass = (num: number) => {
    if (num === 0) return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    const reds = [32, 19, 21, 25, 27, 34, 36, 30, 23, 5, 16, 1, 14, 9, 18, 7, 12, 3];
    if (reds.includes(num)) return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
    return 'bg-slate-800 text-slate-200 border-slate-700';
  };

  return (
    <section id="lobby" className="py-20 border-t border-white/5 bg-[#05070b]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 mb-3">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-ping" />
              <span className="font-display text-[10px] font-bold uppercase tracking-widest text-amber-400">
                MULTI-TABLE SURVEILLANCE
              </span>
            </div>
            <h2 className="font-display text-2xl sm:text-4xl font-extrabold uppercase tracking-tight text-white">
              Live European Roulette Tables
            </h2>
            <p className="font-body text-base text-slate-400 mt-2">
              Streaming real-time spin outcomes directly from Evolution Gaming & Pragmatic Play studios.
            </p>
          </div>

          <div className="mt-4 sm:mt-0 flex items-center gap-2 font-display text-xs text-slate-400">
            <Radio className="h-4 w-4 text-emerald-400 animate-pulse" />
            <span>20+ Tables Live Online</span>
          </div>
        </div>

        {/* Tables Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {TABLES_DATA.map((table) => (
            <div
              key={table.id}
              onClick={() => setSelectedTable(table)}
              className="cursor-pointer group rounded-xl border border-white/10 bg-slate-900/60 p-5 transition-all duration-300 hover:border-amber-500/40 hover:bg-slate-900/90 hover:translate-y-[-4px] shadow-xl backdrop-blur-md relative overflow-hidden"
            >
              {/* Subtle top accent line */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-500/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

              {/* Table Header */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-display text-base font-bold text-white group-hover:text-amber-400 transition-colors">
                    {table.name}
                  </h3>
                  <span className="font-display text-[10px] uppercase tracking-wider text-slate-400">
                    {table.provider}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {table.isHot && (
                    <span className="rounded bg-rose-500/20 border border-rose-500/40 px-2 py-0.5 font-display text-[9px] font-bold text-rose-400 uppercase tracking-widest">
                      HOT
                    </span>
                  )}
                  <div className="flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="font-display text-[9px] font-bold text-emerald-400 uppercase">
                      Live
                    </span>
                  </div>
                </div>
              </div>

              {/* Number History Pills */}
              <div className="mb-5">
                <div className="flex items-center justify-between text-[10px] font-display uppercase tracking-wider text-slate-500 mb-2">
                  <span>Last 12 Spins</span>
                  <span className="text-amber-400">Latest Left</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {table.history.map((num, idx) => (
                    <span
                      key={idx}
                      className={`flex h-6 w-6 items-center justify-center rounded border font-display text-[11px] font-bold ${
                        idx === 0 ? 'ring-1 ring-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.4)]' : ''
                      } ${getNumberColorClass(num)}`}
                    >
                      {num}
                    </span>
                  ))}
                </div>
              </div>

              {/* Footer Info */}
              <div className="flex items-center justify-between border-t border-white/5 pt-3">
                <span className="font-display text-[10px] uppercase tracking-wider text-slate-400">
                  Mode: <strong className="text-slate-200">{table.strategy}</strong>
                </span>
                <span className="flex items-center gap-1 font-display text-[10px] font-bold uppercase tracking-wider text-amber-400 group-hover:underline">
                  Analyze Table <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Selected Table Modal / Detail Drawer Simulation */}
        {selectedTable && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-[#0c1017] p-6 shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
                <div>
                  <h3 className="font-display text-lg font-bold text-white">
                    {selectedTable.name}
                  </h3>
                  <span className="font-display text-xs text-slate-400">
                    {selectedTable.provider} • Strategy: {selectedTable.strategy}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedTable(null)}
                  className="rounded-lg p-1 text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              {/* Recent Spins */}
              <div className="mb-6">
                <p className="font-display text-xs text-slate-400 uppercase tracking-wider mb-2">
                  Chronological Spin Outcomes
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedTable.history.map((num, i) => (
                    <span
                      key={i}
                      className={`flex h-8 w-8 items-center justify-center rounded-lg border font-display text-xs font-bold ${getNumberColorClass(num)}`}
                    >
                      {num}
                    </span>
                  ))}
                </div>
              </div>

              {/* Locked Demo Banner */}
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 mb-6">
                <div className="flex items-center gap-2 text-amber-400 font-display text-xs font-bold uppercase tracking-wider mb-1">
                  <Lock className="h-4 w-4" />
                  Premium Prediction Engine Locked
                </div>
                <p className="font-body text-xs text-slate-300 leading-relaxed mb-3">
                  Live real-time predictive outputs for {selectedTable.name} are restricted to active subscribers.
                  Subscribe to any of the 5 platform tiers to unlock high-precision targets, pocket distances, and dealer signatures.
                </p>
                <a
                  href="#plans"
                  onClick={() => setSelectedTable(null)}
                  className="flex items-center justify-center gap-2 rounded-lg bg-amber-500 py-2.5 font-display text-xs font-bold uppercase tracking-wider text-black hover:bg-amber-400 transition-colors"
                >
                  <Sparkles className="h-4 w-4" />
                  Unlock Full Access Now
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
