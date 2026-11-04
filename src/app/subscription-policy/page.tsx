'use client';

import React from 'react';
import Link from 'next/link';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { CreditCard, Calendar, AlertCircle, RefreshCw, Zap, Shield } from 'lucide-react';

export default function SubscriptionPolicyPage() {
  return (
    <div className="min-h-screen bg-[#06080d] text-slate-100 flex flex-col selection:bg-amber-500 selection:text-black">
      <Navbar />

      <main className="flex-1 py-16 sm:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-12 border-b border-white/10 pb-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 mb-4 text-xs font-bold text-amber-400 font-display uppercase tracking-widest">
              <Calendar className="h-3.5 w-3.5" />
              BILLING & ACCESS TERMS
            </div>
            <h1 className="font-display text-3xl sm:text-5xl font-black uppercase text-white mb-2">
              Subscription Policy
            </h1>
            <p className="text-xs text-slate-400 font-mono">
              Last Updated: January 2026 • Explicit Duration & Calendar-Month Precision
            </p>
          </div>

          {/* Subscription Policy Content */}
          <div className="space-y-8 text-sm text-slate-300 leading-relaxed font-body">
            <section className="space-y-3">
              <h2 className="font-display text-lg font-bold uppercase text-white tracking-wide">
                1. Authoritative Subscription Tiers & Pricing
              </h2>
              <p>
                Roulette.tools maintains five authoritative subscription plans stored in decimal-safe integer cents:
              </p>
              <div className="rounded-xl border border-white/10 bg-[#0c1017] p-4 font-mono text-xs space-y-2">
                <div className="flex justify-between border-b border-white/5 pb-1 text-slate-200">
                  <span>15 Days Pass</span>
                  <span className="text-amber-400 font-bold">$150.00 USD (15,000 cents)</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-1 text-slate-200">
                  <span>1 Month Pro</span>
                  <span className="text-amber-400 font-bold">$200.00 USD (20,000 cents)</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-1 text-slate-200">
                  <span>3 Months Master</span>
                  <span className="text-amber-400 font-bold">$450.00 USD (45,000 cents)</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-1 text-slate-200">
                  <span>6 Months Elite</span>
                  <span className="text-amber-400 font-bold">$700.00 USD (70,000 cents)</span>
                </div>
                <div className="flex justify-between text-slate-200">
                  <span>1 Year VIP Annual</span>
                  <span className="text-purple-400 font-bold">$1,000.00 USD (100,000 cents)</span>
                </div>
              </div>
            </section>

            <section className="space-y-3">
              <h2 className="font-display text-lg font-bold uppercase text-white tracking-wide">
                2. Calendar-Month Expiration Calculation
              </h2>
              <p>
                Subscription durations are stored as explicit units (DAYS or MONTHS). Rather than relying on generic 30-day cycles, monthly and annual tiers are calculated using true calendar month math:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-400">
                <li><strong className="text-slate-200">15 Days:</strong> Exactly 15 consecutive 24-hour periods from the moment of activation.</li>
                <li><strong className="text-slate-200">1 Month:</strong> 1 full calendar month (e.g. Jan 15 to Feb 15, or Jan 31 to Feb 28/29 in leap years).</li>
                <li><strong className="text-slate-200">3 &amp; 6 Months:</strong> 3 and 6 consecutive calendar months respectively.</li>
                <li><strong className="text-slate-200">1 Year:</strong> 12 full calendar months (365 or 366 days).</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="font-display text-lg font-bold uppercase text-white tracking-wide">
                3. Order Snapshotting & Price Protection
              </h2>
              <p>
                When a subscriber creates a purchase order, our backend generates an immutable snapshot of the plan price in integer cents, duration, and order ID. Even if platform administrators adjust future plan pricing, already-created orders and active subscriptions remain strictly unaffected.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-display text-lg font-bold uppercase text-white tracking-wide">
                4. Cryptocurrency Payment Confirmation
              </h2>
              <p>
                All subscription orders are settled via the NOWPayments crypto gateway. Subscriptions are activated only after the payment transaction is fully verified and confirmed on the blockchain with signed IPN validation. Simply navigating to a completion URL without completed payment does not activate tool access.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-display text-lg font-bold uppercase text-white tracking-wide">
                5. Non-Refundable Digital Services
              </h2>
              <p>
                Because subscription access unlocks immediate real-time European Roulette prediction streams, API feeds, and server computing power, all cryptocurrency subscription purchases are final and non-refundable once activated.
              </p>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-white/10 flex flex-wrap gap-4 text-xs font-display uppercase tracking-wider text-slate-400">
            <Link href="/terms" className="hover:text-amber-400 transition-colors">Terms & Conditions</Link>
            <span>•</span>
            <Link href="/privacy" className="hover:text-amber-400 transition-colors">Privacy Policy</Link>
            <span>•</span>
            <Link href="/referral-policy" className="hover:text-amber-400 transition-colors">Referral Policy</Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
