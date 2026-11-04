'use client';

import React from 'react';
import Link from 'next/link';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import {
  Activity,
  Layers,
  Compass,
  Cpu,
  Target,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Terminal,
  Zap,
  TrendingUp,
  Radio
} from 'lucide-react';

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-[#06080d] text-slate-100 flex flex-col selection:bg-amber-500 selection:text-black">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 lg:py-28 border-b border-white/5">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />

          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 mb-6">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              <span className="font-display text-[11px] font-bold uppercase tracking-widest text-amber-400">
                ALGORITHMIC METHODOLOGY & TELEMETRY
              </span>
            </div>

            <h1 className="font-display text-4xl sm:text-6xl font-black uppercase tracking-tight text-white mb-6">
              Precision Intelligence for <span className="text-amber-400">European Roulette</span>
            </h1>

            <p className="mx-auto max-w-3xl text-base sm:text-lg text-slate-400 leading-relaxed">
              Roulette.tools monitors live casino wheel dynamics across 20+ tables from Evolution Gaming and Pragmatic Play.
              Our algorithmic engine processes wheel sector velocity, historical pocket dispersal, and croupier ball-release cadence.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/plans"
                className="flex items-center gap-2 rounded-xl border border-amber-500/50 bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-3 font-display text-xs font-black uppercase tracking-wider text-black shadow-[0_0_25px_rgba(245,158,11,0.3)] transition-all hover:brightness-110 active:scale-95"
              >
                <Sparkles className="h-4 w-4" />
                View Subscription Plans
              </Link>
              <Link
                href="/how-it-works"
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3 font-display text-xs font-bold uppercase tracking-wider text-slate-300 hover:bg-white/10 transition-colors"
              >
                Learn How It Works
              </Link>
            </div>
          </div>
        </section>

        {/* Core Strategy Deep-Dive */}
        <section className="py-20 lg:py-28 relative">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="font-display text-3xl sm:text-4xl font-extrabold uppercase tracking-tight text-white mb-4">
                Three Distinct Analytical Frameworks
              </h2>
              <p className="text-sm sm:text-base text-slate-400">
                Unlike simplistic martingale systems, our engine evaluates physical wheel physics and sequence metrics in real-time.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Strategy 1: Offset */}
              <div className="rounded-2xl border border-white/10 bg-[#0c1017]/80 p-8 backdrop-blur-xl relative group hover:border-amber-500/40 transition-colors">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-400 mb-6">
                  <Compass className="h-6 w-6" />
                </div>
                <div className="inline-block rounded bg-amber-500/10 px-2 py-0.5 font-mono text-[10px] font-bold text-amber-400 uppercase tracking-widest mb-2">
                  Strategy 01
                </div>
                <h3 className="font-display text-xl font-bold uppercase text-white mb-3">
                  Offset Strategy
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed mb-6">
                  Measures pocket displacement variance between consecutive spin outcomes. By calculating sector distance metrics (0 to 3 pockets), the engine tracks whether ball decay is concentrating within specific wheel arcs.
                </p>
                <ul className="space-y-2.5 text-xs text-slate-300 border-t border-white/10 pt-6">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-amber-400" />
                    <span>Real-time pocket distance (0-3) telemetry</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-amber-400" />
                    <span>European single-zero wheel offset tracking</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-amber-400" />
                    <span>Arc clustering detection</span>
                  </li>
                </ul>
              </div>

              {/* Strategy 2: Target */}
              <div className="rounded-2xl border-2 border-amber-500/50 bg-[#101522]/90 p-8 backdrop-blur-xl relative group shadow-[0_0_30px_rgba(245,158,11,0.15)]">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-amber-500/40 bg-amber-500/20 text-amber-400 mb-6">
                  <Target className="h-6 w-6" />
                </div>
                <div className="inline-block rounded bg-amber-500/20 px-2 py-0.5 font-mono text-[10px] font-bold text-amber-400 uppercase tracking-widest mb-2">
                  Strategy 02
                </div>
                <h3 className="font-display text-xl font-bold uppercase text-white mb-3">
                  Target Strategy
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed mb-6">
                  Focuses on sequence pattern recognition across Win/Loss (W/L) streaks and momentum indicators. Identifies when a table enters high-probability consistency windows or when to exit a weakening sequence.
                </p>
                <ul className="space-y-2.5 text-xs text-slate-300 border-t border-white/10 pt-6">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-amber-400" />
                    <span>W/L sequence streak counters</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-amber-400" />
                    <span>Table momentum weakening warnings</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-amber-400" />
                    <span>Automated hot table ranking</span>
                  </li>
                </ul>
              </div>

              {/* Strategy 3: Dealer Signature */}
              <div className="rounded-2xl border border-white/10 bg-[#0c1017]/80 p-8 backdrop-blur-xl relative group hover:border-amber-500/40 transition-colors">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-purple-500/30 bg-purple-500/10 text-purple-400 mb-6">
                  <Layers className="h-6 w-6" />
                </div>
                <div className="inline-block rounded bg-purple-500/10 px-2 py-0.5 font-mono text-[10px] font-bold text-purple-400 uppercase tracking-widest mb-2">
                  Strategy 03
                </div>
                <h3 className="font-display text-xl font-bold uppercase text-white mb-3">
                  Dealer Signature
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed mb-6">
                  Surveils individual croupier release consistency. Physical croupiers often develop muscle memory cadences affecting ball revolutions and rotor interaction patterns (e.g. ball travel line triggers and TOP number projections).
                </p>
                <ul className="space-y-2.5 text-xs text-slate-300 border-t border-white/10 pt-6">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-purple-400" />
                    <span>Ball travel line (Over/Under) triggers</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-purple-400" />
                    <span>TOP number placement projections (e.g. 0n4)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-purple-400" />
                    <span>Croupier shift change tracking</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Live Casino Surveillance Grid */}
        <section className="py-20 border-t border-white/5 bg-[#0a0d14]/60">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 mb-4">
                  <Radio className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
                  <span className="font-display text-[10px] font-bold uppercase tracking-widest text-emerald-400">
                    24/7 LIVE STREAM TELEMETRY
                  </span>
                </div>
                <h2 className="font-display text-3xl sm:text-4xl font-extrabold uppercase tracking-tight text-white mb-4">
                  20+ Live Casino Tables Covered Continuously
                </h2>
                <p className="text-sm text-slate-400 leading-relaxed mb-6">
                  Our low-latency crawler captures real-time roulette spin outputs from top providers including Evolution Gaming and Pragmatic Play Live. Every outcome is processed in less than 500 milliseconds.
                </p>

                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl border border-white/10 bg-black/40 p-4">
                    <div className="font-display text-2xl font-black text-amber-400">20+</div>
                    <div className="text-xs text-slate-400 uppercase font-semibold mt-1">Live Tables</div>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-black/40 p-4">
                    <div className="font-display text-2xl font-black text-emerald-400">&lt;500ms</div>
                    <div className="text-xs text-slate-400 uppercase font-semibold mt-1">Telemetry Latency</div>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-black/40 p-4">
                    <div className="font-display text-2xl font-black text-white">100%</div>
                    <div className="text-xs text-slate-400 uppercase font-semibold mt-1">Single-Zero European</div>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-black/40 p-4">
                    <div className="font-display text-2xl font-black text-purple-400">37</div>
                    <div className="text-xs text-slate-400 uppercase font-semibold mt-1">Pocket Wheel Map</div>
                  </div>
                </div>
              </div>

              {/* Graphical Representation of Table Stream */}
              <div className="rounded-2xl border border-white/10 bg-[#06080d] p-6 shadow-2xl relative overflow-hidden">
                <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping" />
                    <span className="font-display text-xs font-bold uppercase text-white tracking-wider">
                      Live Telemetry Stream
                    </span>
                  </div>
                  <span className="font-mono text-xs text-slate-500">FEED_STATUS: ACTIVE</span>
                </div>

                <div className="space-y-3 font-mono text-xs">
                  <div className="rounded-lg bg-white/5 p-3 flex items-center justify-between">
                    <span className="text-slate-300">Lightning Roulette (Evo)</span>
                    <span className="text-emerald-400 font-bold">Pocket 32 • Red • Voisins</span>
                  </div>
                  <div className="rounded-lg bg-white/5 p-3 flex items-center justify-between">
                    <span className="text-slate-300">Immersive Roulette</span>
                    <span className="text-red-400 font-bold">Pocket 1 • Red • Orphelins</span>
                  </div>
                  <div className="rounded-lg bg-white/5 p-3 flex items-center justify-between">
                    <span className="text-slate-300">Speed Roulette A</span>
                    <span className="text-slate-400 font-bold">Pocket 26 • Black • Tiers</span>
                  </div>
                  <div className="rounded-lg bg-white/5 p-3 flex items-center justify-between">
                    <span className="text-slate-300">Roulette Macao (Pragmatic)</span>
                    <span className="text-emerald-400 font-bold">Pocket 0 • Green • Zero Spiel</span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-white/10 text-center">
                  <p className="text-[11px] text-slate-500">
                    Predictions and sequence patterns are computed independently without table state tampering.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
