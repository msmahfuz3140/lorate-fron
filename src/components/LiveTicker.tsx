'use client';

import React, { useState, useEffect } from 'react';
import { Flame, Radio, Zap } from 'lucide-react';

const TICKER_ITEMS = [
  { table: 'Ruleta en Español', event: 'HOT STREAK DETECTED (8/9 hits) 88.88% #DEALERSIG', time: 'Just now', type: 'hot' },
  { table: 'Lightning Roulette', event: 'Top Number Over Triggered: 0n4 Confirmed', time: '1m ago', type: 'target' },
  { table: 'Speed Roulette 1', event: 'Offset Strategy (+ and -1) Distance 1 Confirmed by 6 spins', time: '2m ago', type: 'offset' },
  { table: 'Deutsches Roulette', event: 'Dealer signature shift detected • Phase continuation', time: '4m ago', type: 'dealer' },
  { table: 'VIP Roulette', event: 'HOT STREAK (9/9 hits) 100.00% #TARGET', time: '5m ago', type: 'hot' }
];

export function LiveTicker() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % TICKER_ITEMS.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const current = TICKER_ITEMS[index];

  return (
    <div className="relative w-full border-y border-white/5 bg-[#080b11] py-2.5 px-4 overflow-hidden">
      {/* Top glowing line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />

      <div className="mx-auto flex max-w-7xl items-center gap-3">
        {/* Live badge */}
        <div className="flex items-center gap-2 border-r border-white/10 pr-4 shrink-0">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
          </span>
          <span className="font-display text-[11px] font-bold uppercase tracking-widest text-rose-400">
            LIVE FEED
          </span>
        </div>

        {/* Dynamic event text */}
        <div className="flex items-center gap-2.5 overflow-hidden text-xs sm:text-sm">
          <span className="inline-flex items-center gap-1 font-display font-bold text-amber-400 shrink-0">
            <Flame className="h-3.5 w-3.5 text-amber-400" />
            {current.table}:
          </span>
          <span className="truncate text-slate-300 font-medium">
            {current.event}
          </span>
          <span className="ml-auto hidden sm:inline-block font-display text-[10px] text-slate-500 shrink-0 uppercase tracking-wider">
            {current.time}
          </span>
        </div>
      </div>
    </div>
  );
}
