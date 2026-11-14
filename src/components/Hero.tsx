'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, ArrowRight, ShieldCheck, Zap, Lock, Terminal, Activity } from 'lucide-react';
import { PremiumLockModal } from './PremiumLockModal';
import { useAuth } from '../context/AuthContext';

export function Hero() {
  const router = useRouter();
  const [lockModalOpen, setLockModalOpen] = useState(false);
  const { user, isAuthenticated } = useAuth();

  const handleOpenTool = () => {
    if (user?.hasActiveSubscription || user?.role === 'SUPER_ADMIN') {
      router.push('/dashboard/tool');
    } else if (!isAuthenticated) {
      router.push('/golin?redirect=/dashboard/tool');
    } else {
      setLockModalOpen(true);
    }
  };

  return (
    <>
      <section className="relative overflow-hidden py-16 sm:py-20 lg:py-28">
        {/* Ambient atmospheric light orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-[450px] h-[350px] bg-rose-500/10 rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-[350px] h-[250px] bg-emerald-500/10 rounded-full blur-[130px] pointer-events-none" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-8">
            {/* Left Column: Headline and Call to Actions */}
            <div className="lg:col-span-7 text-center lg:text-left">
              {/* Live Status Pill */}
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-transparent px-4 py-1.5 mb-6 shadow-[0_0_15px_rgba(245,158,11,0.15)]">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400" />
                </span>
                <span className="font-display text-xs font-black uppercase tracking-widest text-amber-300">
                  LIVE ALGORITHMIC PREDICTION ENGINE v2.4
                </span>
              </div>

              {/* Main Headline */}
              <h1 className="font-display text-3xl font-black uppercase tracking-tight text-white sm:text-5xl lg:text-6xl leading-[1.08] mb-6">
                The Most Powerful <br />
                <span className="text-gold-shimmer">Prediction Tool</span> <br />
                <span className="text-slate-300">for European Roulette</span>
              </h1>

              {/* Description */}
              <p className="max-w-2xl mx-auto lg:mx-0 text-sm sm:text-base lg:text-lg text-slate-300 font-body leading-relaxed mb-8">
                Engineered with advanced ball travel trajectory analysis, offset pocket calculations, and croupier motor rhythm modeling.
                Monitor 20+ live tables simultaneously with verified mathematical probabilistic edge.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 mb-10">
                {/* Primary OPEN TOOL Button with Shimmer */}
                <button
                  onClick={handleOpenTool}
                  className="group relative flex items-center gap-2 overflow-hidden rounded-xl border border-emerald-400/60 bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-500 px-6 py-3.5 font-display text-xs font-black uppercase tracking-wider text-black shadow-[0_0_30px_rgba(16,185,129,0.4)] transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(16,185,129,0.55)] active:scale-95"
                >
                  <Terminal className="h-4 w-4" />
                  <span>OPEN TOOL</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent group-hover:translate-x-full transition-transform duration-700" />
                </button>

                <a
                  href="#plans"
                  className="flex items-center gap-2 rounded-xl border border-amber-500/40 bg-gradient-to-r from-amber-500/15 via-amber-600/10 to-black/40 px-5 py-3.5 font-display text-xs font-bold uppercase tracking-wider text-amber-300 backdrop-blur-md transition-all hover:border-amber-400 hover:bg-amber-500/25 hover:text-white active:scale-95 shadow-[0_0_20px_rgba(245,158,11,0.15)]"
                >
                  <Sparkles className="h-4 w-4 text-amber-400" />
                  <span>VIEW PLANS</span>
                </a>
              </div>

              {/* Security & System Metric Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-lg mx-auto lg:mx-0 text-xs font-display text-slate-400">
                <div className="flex items-center gap-2 rounded-lg border border-white/5 bg-white/[0.02] p-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span className="truncate">NOWPayments Crypto</span>
                </div>
                <div className="flex items-center gap-2 rounded-lg border border-white/5 bg-white/[0.02] p-2">
                  <Zap className="h-4 w-4 text-amber-400 shrink-0" />
                  <span className="truncate">Instant Access</span>
                </div>
                <div className="col-span-2 sm:col-span-1 flex items-center justify-center sm:justify-start gap-2 rounded-lg border border-white/5 bg-white/[0.02] p-2">
                  <Activity className="h-4 w-4 text-teal-400 shrink-0" />
                  <span className="truncate">20+ Live Tables</span>
                </div>
              </div>
            </div>

            {/* Right Column: Honest Engine Pipeline (no fake live values) */}
            <div className="lg:col-span-5 w-full">
              <div className="relative rounded-2xl border border-amber-500/30 bg-gradient-to-b from-[#111728] via-[#0c101c] to-[#080b12] p-5 shadow-[0_25px_60px_rgba(0,0,0,0.85)] backdrop-blur-2xl sm:p-6">
                <div className="absolute left-1/4 right-1/4 top-0 h-[1px] bg-gradient-to-r from-transparent via-amber-400/60 to-transparent" />

                <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center gap-2.5">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
                    </span>
                    <span className="font-display text-xs font-black uppercase tracking-wider text-white">
                      Dealer Signature Pipeline
                    </span>
                  </div>
                  <span className="rounded-md border border-emerald-500/40 bg-emerald-500/15 px-2 py-0.5 font-display text-[10px] font-black uppercase tracking-widest text-emerald-300">
                    Server-side
                  </span>
                </div>

                <div className="space-y-2.5">
                  <PipelineStep
                    number="01"
                    title="Authenticated provider feed"
                    detail="The backend proxy requests live tables with HMAC-SHA256 signed headers. The SK key never reaches this page."
                  />
                  <PipelineStep
                    number="02"
                    title="Deterministic travel math"
                    detail="Travel distances, the rolling average and the ±7 rhythm band are calculated from received spins only."
                  />
                  <PipelineStep
                    number="03"
                    title="Main · n9 · OVER · UNDER"
                    detail="The main pocket, 19-number n9 sector, Top Over n4 and Top Under n4 are derived by the same engine for CW and CCW."
                  />
                  <PipelineStep
                    number="04"
                    title="Wheel · Travel · Live Graph"
                    detail="All charts render the same response together. CW/CCW switching recalculates immediately without a page reload."
                  />
                </div>

                <div className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/5 px-3.5 py-2.5">
                  <div className="flex items-start gap-2">
                    <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400" />
                    <p className="font-body text-[11px] leading-relaxed text-slate-300">
                      This card explains the pipeline; it does not display demo
                      spins or a fake confidence score. Open the member tool to
                      view authenticated live values.
                    </p>
                  </div>
                  <button
                    onClick={() => setLockModalOpen(true)}
                    className="mt-2 font-display text-[10px] font-bold uppercase tracking-wider text-amber-400 transition-colors hover:text-amber-300 hover:underline"
                  >
                    View access options →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Lock Screen Modal */}
      <PremiumLockModal isOpen={lockModalOpen} onClose={() => setLockModalOpen(false)} />
    </>
  );
}

function PipelineStep({
  number,
  title,
  detail
}: {
  number: string;
  title: string;
  detail: string;
}) {
  return (
    <div className="flex gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3">
      <span className="font-mono text-[10px] font-black text-amber-400">{number}</span>
      <div>
        <p className="font-display text-[11px] font-bold uppercase tracking-wider text-slate-200">
          {title}
        </p>
        <p className="mt-1 font-body text-[11px] leading-relaxed text-slate-400">{detail}</p>
      </div>
    </div>
  );
}
