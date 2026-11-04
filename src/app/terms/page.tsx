'use client';

import React from 'react';
import Link from 'next/link';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { ShieldAlert, FileText, Scale, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#06080d] text-slate-100 flex flex-col selection:bg-amber-500 selection:text-black">
      <Navbar />

      <main className="flex-1 py-16 sm:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-12 border-b border-white/10 pb-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 mb-4 text-xs font-bold text-amber-400 font-display uppercase tracking-widest">
              <Scale className="h-3.5 w-3.5" />
              LEGAL TERMS OF SERVICE
            </div>
            <h1 className="font-display text-3xl sm:text-5xl font-black uppercase text-white mb-2">
              Terms & Conditions
            </h1>
            <p className="text-xs text-slate-400 font-mono">
              Last Updated: January 2026 • Effective Immediately
            </p>
          </div>

          {/* Legal Content */}
          <div className="prose prose-invert max-w-none space-y-8 text-sm text-slate-300 leading-relaxed font-body">
            {/* Disclaimer Callout */}
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-5 text-red-200">
              <div className="flex items-center gap-2 font-display text-xs font-bold uppercase tracking-wider text-red-400 mb-2">
                <ShieldAlert className="h-4 w-4" />
                Critical Gambling Risk & Prediction Disclaimer
              </div>
              <p className="text-xs leading-relaxed text-red-300/90">
                Roulette.tools provides algorithmic, statistical pattern recognition software for European single-zero roulette wheels. We do NOT provide gambling advice, financial guarantees, or promises of monetary returns. European Roulette remains a probabilistic casino game with an inherent house edge (2.70%). You assume sole financial responsibility for any wagers you place with external third-party casino operators.
              </p>
            </div>

            <section className="space-y-3">
              <h2 className="font-display text-lg font-bold uppercase text-white tracking-wide">
                1. Nature of the Software as a Service (SaaS)
              </h2>
              <p>
                Roulette.tools is purely a specialized information and analytical tool. The platform does not operate a casino, accept gaming bets, or hold player deposits. All live wheel telemetry is captured via public streaming interfaces from recognized software providers (including Evolution Gaming and Pragmatic Play) for real-time mathematical analysis.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-display text-lg font-bold uppercase text-white tracking-wide">
                2. User Eligibility and Local Compliance
              </h2>
              <p>
                You must be at least 18 years of age (or the legal age of majority in your jurisdiction) to register an account. It is your sole responsibility to ensure that accessing analytical gambling software is lawful in your country or province of residence.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-display text-lg font-bold uppercase text-white tracking-wide">
                3. Subscriptions & Cryptocurrency Payments
              </h2>
              <p>
                Platform access requires an active subscription tier (15 Days, 1 Month, 3 Months, 6 Months, or 1 Year) with exact prices stored in decimal-safe integer cents. All payments are processed on-chain in cryptocurrency via the NOWPayments gateway. Because digital subscription access is rendered immediately upon transaction confirmation, cryptocurrency payments are final and strictly non-refundable.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-display text-lg font-bold uppercase text-white tracking-wide">
                4. Strict No-Custody & Zero-Withdrawal Boundary
              </h2>
              <p>
                Roulette.tools has no wallet custody, balance storage, or client fund withdrawal mechanisms. Any attempt to use the platform for money transmission, currency laundering, or financial intermediation is strictly prohibited and grounds for immediate account termination.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-display text-lg font-bold uppercase text-white tracking-wide">
                5. Intellectual Property & Reverse Engineering
              </h2>
              <p>
                All mathematical algorithms, wheel telemetry models, pocket distance tracking heuristics, user interface code, and brand trademarks belong exclusively to Roulette.tools. You may not reverse-engineer, scrape, redistribute, or resell prediction streams without prior written authorization.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-display text-lg font-bold uppercase text-white tracking-wide">
                6. Limitation of Liability
              </h2>
              <p>
                Under no circumstances shall Roulette.tools, its operators, or technical contributors be liable for any direct, indirect, incidental, or consequential losses, including but not limited to casino bankroll losses, missed opportunities, or server interruption downtime.
              </p>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-white/10 flex flex-wrap gap-4 text-xs font-display uppercase tracking-wider text-slate-400">
            <Link href="/privacy" className="hover:text-amber-400 transition-colors">Privacy Policy</Link>
            <span>•</span>
            <Link href="/subscription-policy" className="hover:text-amber-400 transition-colors">Subscription Policy</Link>
            <span>•</span>
            <Link href="/referral-policy" className="hover:text-amber-400 transition-colors">Referral Policy</Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
