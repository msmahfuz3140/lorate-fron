'use client';

import React from 'react';
import Link from 'next/link';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import {
  Compass,
  CheckCircle2,
  Terminal,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  KeyRound,
  Radio,
  BarChart3
} from 'lucide-react';

export default function HowItWorksPage() {
  const steps = [
    {
      num: '01',
      title: 'Create Account & Verify OTP',
      desc: 'Register with either your email address or mobile phone number. Our backend dispatches a cryptographic 6-digit one-time verification code to confirm your identity securely.',
      icon: KeyRound,
      badge: 'ACCOUNT SETUP'
    },
    {
      num: '02',
      title: 'Choose a Subscription Plan',
      desc: 'Select from our 5 authoritative plans ($150 for 15 Days up to $1,000 for 1 Year). Pay securely with crypto (USDT, BTC, ETH) via NOWPayments with automatic order snapshotting.',
      icon: CreditCard,
      badge: 'NOWPAYMENTS CRYPTO'
    },
    {
      num: '03',
      title: 'Select Live Table Stream',
      desc: 'Access our live lobby featuring over 20 European Roulette tables from Evolution Gaming and Pragmatic Play. View real-time spin histories, croupier names, and table activity indicators.',
      icon: Radio,
      badge: 'LIVE LOBBY'
    },
    {
      num: '04',
      title: 'Deploy Algorithmic Telemetry',
      desc: 'Observe Offset Strategy pocket distances (0-3), Target Strategy streak metrics, and Dealer Signature ball travel lines computed on each spin in under 500 milliseconds.',
      icon: BarChart3,
      badge: 'REAL-TIME SIGNALS'
    },
    {
      num: '05',
      title: 'Execute Disciplined Sessions',
      desc: 'Use momentum weakening alerts and table exit triggers to protect your bankroll. Avoid tilt and emotional decisions with cold, mathematically calculated probability metrics.',
      icon: ShieldCheck,
      badge: 'DISCIPLINE & CONTROL'
    }
  ];

  return (
    <div className="min-h-screen bg-[#06080d] text-slate-100 flex flex-col selection:bg-amber-500 selection:text-black">
      <Navbar />

      <main className="flex-1">
        {/* Header */}
        <section className="relative overflow-hidden py-20 lg:py-28 border-b border-white/5 text-center">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />

          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 mb-6">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              <span className="font-display text-[11px] font-bold uppercase tracking-widest text-amber-400">
                SYSTEM WORKFLOW ARCHITECTURE
              </span>
            </div>

            <h1 className="font-display text-4xl sm:text-6xl font-black uppercase tracking-tight text-white mb-6">
              How <span className="text-amber-400">Roulette.tools</span> Operates
            </h1>

            <p className="mx-auto max-w-3xl text-base sm:text-lg text-slate-400 leading-relaxed">
              From cryptographic account verification and seamless NOWPayments checkout to live European Roulette telemetry tracking.
            </p>
          </div>
        </section>

        {/* Steps Grid */}
        <section className="py-20 lg:py-28">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="space-y-8">
              {steps.map((step, idx) => {
                const Icon = step.icon;
                return (
                  <div
                    key={idx}
                    className="relative flex flex-col md:flex-row items-start gap-6 rounded-2xl border border-white/10 bg-[#0c1017]/80 p-6 sm:p-8 backdrop-blur-xl hover:border-amber-500/30 transition-all"
                  >
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-400 font-display text-xl font-black">
                      {step.num}
                    </div>

                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3 mb-2">
                        <span className="rounded bg-white/5 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest text-slate-400 border border-white/10">
                          {step.badge}
                        </span>
                        <h2 className="font-display text-lg sm:text-xl font-bold uppercase text-white">
                          {step.title}
                        </h2>
                      </div>
                      <p className="text-sm text-slate-400 leading-relaxed">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* CTA Box */}
            <div className="mt-16 rounded-2xl border border-amber-500/40 bg-gradient-to-r from-amber-500/10 via-amber-900/10 to-transparent p-8 text-center backdrop-blur-xl">
              <h3 className="font-display text-2xl font-bold uppercase text-white mb-2">
                Ready to Access Real-Time European Roulette Intelligence?
              </h3>
              <p className="text-sm text-slate-400 max-w-xl mx-auto mb-6">
                Choose your subscription tier and start surveilling live wheel telemetry across 20+ tables.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link
                  href="/plans"
                  className="inline-flex items-center gap-2 rounded-xl border border-amber-500/50 bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-3 font-display text-xs font-black uppercase tracking-wider text-black shadow-lg shadow-amber-500/20 hover:brightness-110 active:scale-95"
                >
                  <Sparkles className="h-4 w-4" />
                  View All Plans & Pricing
                </Link>
                <Link
                  href="/gerister"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3 font-display text-xs font-bold uppercase tracking-wider text-slate-300 hover:bg-white/10"
                >
                  Create Member Account
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
