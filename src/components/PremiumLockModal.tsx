'use client';

import React from 'react';
import Link from 'next/link';
import { Lock, Sparkles, Check, ArrowRight, X, ShieldAlert } from 'lucide-react';
import { PLANS_ARRAY } from '../shared/plans';

interface PremiumLockModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PremiumLockModal({ isOpen, onClose }: PremiumLockModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-fade-in">
      <div className="relative w-full max-w-2xl rounded-2xl border border-amber-500/30 bg-gradient-to-b from-[#131926] via-[#0c1018] to-[#070a0f] p-6 sm:p-8 shadow-[0_0_60px_rgba(245,158,11,0.2)]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          aria-label="Close dialog"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Animated Lock Icon */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-500/40 bg-gradient-to-br from-amber-500/20 to-amber-900/10 shadow-[0_0_30px_rgba(245,158,11,0.3)] mb-5">
          <Lock className="h-8 w-8 text-amber-400 animate-pulse" />
        </div>

        {/* Message */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/30 bg-rose-500/10 px-3 py-0.5 text-[10px] font-display font-bold uppercase tracking-widest text-rose-400 mb-2">
            <ShieldAlert className="h-3 w-3" />
            Active Subscription Required
          </div>
          <h3 className="font-display text-2xl font-black uppercase tracking-tight text-white mb-2">
            Premium Access Required
          </h3>
          <p className="font-body text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
            The European Roulette prediction engine and live trajectory models are exclusively accessible to verified premium subscribers.
          </p>
        </div>

        {/* Blurred tool preview background simulation */}
        <div className="relative rounded-xl border border-white/10 bg-slate-950/80 p-4 mb-6 overflow-hidden">
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-md z-10 flex items-center justify-center">
            <span className="font-display text-xs font-bold uppercase tracking-widest text-amber-400/80">
              [ 20+ Live Tables • Real-Time Engine Encrypted ]
            </span>
          </div>
          <div className="opacity-30 filter blur-sm space-y-2 pointer-events-none">
            <div className="h-4 bg-slate-700 rounded w-3/4"></div>
            <div className="h-8 bg-slate-800 rounded"></div>
            <div className="flex gap-2">
              <div className="h-6 w-12 bg-rose-600 rounded"></div>
              <div className="h-6 w-12 bg-slate-700 rounded"></div>
              <div className="h-6 w-12 bg-emerald-600 rounded"></div>
            </div>
          </div>
        </div>

        {/* Quick Plan Highlights */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
          {PLANS_ARRAY.slice(0, 3).map((plan) => (
            <div
              key={plan.id}
              className={`rounded-xl border p-3 text-center ${
                plan.isPopular
                  ? 'border-amber-500/50 bg-amber-500/10'
                  : 'border-white/10 bg-white/[0.02]'
              }`}
            >
              <p className="font-display text-xs font-bold text-white truncate">{plan.name}</p>
              <p className="font-display text-base font-extrabold text-amber-400 mt-1">${plan.priceUsd}</p>
              <p className="font-display text-[9px] text-slate-400">{plan.durationDays} Days Access</p>
            </div>
          ))}
        </div>

        {/* Action Button */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/plans"
            onClick={onClose}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 py-3 font-display text-xs font-bold uppercase tracking-wider text-black shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:brightness-110 transition-all"
          >
            <Sparkles className="h-4 w-4" />
            View All 5 Premium Plans
            <ArrowRight className="h-4 w-4" />
          </Link>
          <button
            onClick={onClose}
            className="rounded-xl border border-white/10 bg-slate-900/60 px-5 py-3 font-display text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-white hover:bg-slate-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
