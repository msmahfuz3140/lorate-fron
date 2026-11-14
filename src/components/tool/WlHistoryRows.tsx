'use client';

import React from 'react';
import { NormalizedWlRow } from '../../lib/roulette-engine';

interface WlHistoryRowsProps {
  rows: NormalizedWlRow[];
  direction: 'CW' | 'CCW';
}

/**
 * Live n9 / n4 backtest rows.
 *
 * Display order is intentionally NEWEST -> OLDEST from left to right:
 *   (NEW W/L) → → → (OLD W/L)
 * The API rows remain chronological; only this visual order is reversed.
 */
export function WlHistoryRows({ rows, direction }: WlHistoryRowsProps) {
  const latest = rows.slice(-40).reverse();
  const n9Rows = latest.filter((row) => row.n9 !== null);
  const n4Rows = latest.filter((row) => row.n4 !== null);
  const n9Wins = n9Rows.filter((row) => row.n9 === 'W').length;
  const n4Wins = n4Rows.filter((row) => row.n4 === 'W').length;

  return (
    <div className="rounded-2xl border border-white/10 bg-[#070b14] p-4 shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 pb-2">
        <span className="flex items-center gap-1.5 font-display text-xs font-bold uppercase tracking-wider text-white">
          <span className="h-2 w-2 rounded-sm bg-emerald-400" />
          Live W/L Backtest · latest 40
        </span>
        <span className="font-mono text-[9px] uppercase tracking-wider text-slate-500">
          NEW → OLD · {direction}
        </span>
      </div>

      {latest.length === 0 ? (
        <p className="py-4 text-center font-mono text-[10px] text-slate-500">
          W/L rows appear after the 25-jump warm-up (27+ spins).
        </p>
      ) : (
        <div className="mt-3 space-y-3">
          <div>
            <div className="mb-1.5 flex items-center justify-between font-mono text-[9px] uppercase tracking-wider text-slate-400">
              <span>W/L n9 · 19 numbers</span>
              <span>
                {n9Wins}/{n9Rows.length} W
              </span>
            </div>
            <div className="flex flex-wrap gap-1">
              {latest.map((row, index) => (
                <span
                  key={`n9-${row.index}-${index}`}
                  title={`Row ${row.index} · actual ${row.actual ?? '—'} · main ${row.main ?? '—'}`}
                  className={`flex h-5 min-w-5 items-center justify-center rounded-[3px] px-1 font-mono text-[8px] font-black text-white ${
                    row.n9 === 'W'
                      ? 'bg-emerald-500/85'
                      : row.n9 === 'L'
                        ? 'bg-rose-500/85'
                        : 'bg-slate-700/50 text-slate-400'
                  }`}
                >
                  {row.n9 ?? '·'}
                </span>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between font-mono text-[9px] uppercase tracking-wider text-slate-400">
              <span>W/L n4 · 9 numbers</span>
              <span>
                {n4Wins}/{n4Rows.length} W
              </span>
            </div>
            <div className="flex flex-wrap gap-1">
              {latest.map((row, index) => (
                <span
                  key={`n4-${row.index}-${index}`}
                  title={`Row ${row.index} · actual ${row.actual ?? '—'} · main ${row.main ?? '—'}`}
                  className={`flex h-5 min-w-5 items-center justify-center rounded-[3px] px-1 font-mono text-[8px] font-black text-white ${
                    row.n4 === 'W'
                      ? 'bg-emerald-500/85'
                      : row.n4 === 'L'
                        ? 'bg-rose-500/85'
                        : 'bg-slate-700/50 text-slate-400'
                  }`}
                >
                  {row.n4 ?? '–'}
                </span>
              ))}
            </div>
          </div>

          <p className="font-mono text-[9px] text-slate-600">
            Latest result is the leftmost cell. Pending n4 results are neutral.
          </p>
        </div>
      )}
    </div>
  );
}
