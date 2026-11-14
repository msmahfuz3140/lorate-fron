'use client';

import React from 'react';
import { AlertTriangle, ArrowRight, ShieldAlert, X } from 'lucide-react';

interface DisclaimerModalProps {
  isOpen: boolean;
  onProceed: () => void;
}

const WARNINGS = [
  {
    number: '01',
    title: 'Rhythm Match',
    body: 'Make sure the game’s Rhythm Match is at least 70% or higher before following a prediction.',
    highlight: '70%+'
  },
  {
    number: '02',
    title: 'Dealer Observation',
    body: 'Observe the dealer carefully and make sure the dealer is spinning while seated. Only follow the game when this behavior is consistent.',
    highlight: null
  },
  {
    number: '03',
    title: 'Pattern Image',
    body: 'Always follow the provided Pattern Image when making betting decisions. Do not ignore the displayed pattern.',
    highlight: null
  },
  {
    number: '04',
    title: 'Game Win Rate',
    body: 'Focus on and follow games that currently show a good win rate. Prioritize games with stronger historical performance rather than choosing randomly.',
    highlight: null
  }
];

/**
 * Mandatory pre-tool disclaimer.
 *
 * This component deliberately has no localStorage/sessionStorage/cookie
 * persistence. The parent context opens it on every Open Tools click.
 */
export function DisclaimerModal({ isOpen, onProceed }: DisclaimerModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/85 p-3 backdrop-blur-md sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="disclaimer-title"
    >
      <div className="relative max-h-[92dvh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-amber-500/40 bg-[#080d18] p-5 shadow-[0_30px_100px_rgba(0,0,0,0.95)] sm:p-7">
        <button
          type="button"
          onClick={onProceed}
          aria-label="Close disclaimer and continue to tools"
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300 transition-colors hover:border-rose-500/40 hover:bg-rose-500/15 hover:text-rose-300"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="mb-5 flex items-start gap-3 pr-10">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-amber-500/40 bg-amber-500/15 text-amber-400">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div>
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-amber-400">
              Mandatory Pre-Tool Briefing
            </span>
            <h2
              id="disclaimer-title"
              className="mt-1 font-display text-lg font-black uppercase leading-tight tracking-wide text-white sm:text-xl"
            >
              Important — Please Read Before Using the Tools
            </h2>
            <p className="mt-1 font-body text-xs leading-relaxed text-slate-400">
              This warning is shown on every Open Tools click. Confirm each item
              before following any live prediction.
            </p>
          </div>
        </div>

        <div className="space-y-2.5">
          {WARNINGS.map((warning) => (
            <div
              key={warning.number}
              className="rounded-2xl border border-white/8 bg-white/[0.025] p-3.5 sm:p-4"
            >
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-amber-500/30 bg-amber-500/10 font-mono text-[10px] font-black text-amber-300">
                  {warning.number}
                </span>
                <div>
                  <h3 className="font-display text-xs font-black uppercase tracking-wider text-white">
                    {warning.title}
                  </h3>
                  <p className="mt-1 font-body text-xs leading-relaxed text-slate-300">
                    {warning.body}
                  </p>
                  {warning.highlight && (
                    <span className="mt-2 inline-flex rounded-full border border-amber-500/40 bg-amber-500/15 px-2 py-0.5 font-mono text-[10px] font-black text-amber-300">
                      {warning.highlight} recommended minimum
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-start gap-2 rounded-xl border border-rose-500/20 bg-rose-500/5 px-3 py-2.5 font-mono text-[10px] leading-relaxed text-rose-200/80">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>
            No outcome is guaranteed. Rhythm Match and patterns are analytical
            signals, not a promise of profit. Follow responsible bankroll
            limits at all times.
          </span>
        </div>

        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={onProceed}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 font-display text-xs font-bold uppercase tracking-wider text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
          >
            Close
          </button>
          <button
            type="button"
            onClick={onProceed}
            className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-2.5 font-display text-xs font-black uppercase tracking-wider text-black shadow-lg shadow-amber-500/20 transition-all hover:brightness-110 active:scale-[0.99]"
          >
            I Understand — Continue to Tools
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
