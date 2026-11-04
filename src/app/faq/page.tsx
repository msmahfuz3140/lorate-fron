'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { Sparkles, ChevronDown, HelpCircle, ShieldAlert, CreditCard, Cpu, Lock } from 'lucide-react';

interface FaqItem {
  q: string;
  a: string;
  category: 'Platform' | 'Subscriptions' | 'Payments' | 'Referrals';
}

const FAQ_LIST: FaqItem[] = [
  {
    category: 'Platform',
    q: 'Does Roulette.tools guarantee winnings or 100% win rate?',
    a: 'Absolutely not. We strictly refuse to make false claims of guaranteed winnings or infallible accuracy. European Roulette remains a probabilistic casino game with an inherent house edge (2.7% on single-zero wheels). Our platform provides pattern recognition, pocket distance dispersion telemetry (0-3), and dealer signature tracking to assist disciplined session play, but cannot eliminate house edge or eliminate financial risk.'
  },
  {
    category: 'Platform',
    q: 'Which live casino providers and tables are monitored?',
    a: 'The platform actively crawls and surveils over 20 European single-zero live roulette tables from tier-one providers including Evolution Gaming (Lightning Roulette, Immersive, Speed Roulette, Classic) and Pragmatic Play Live (Roulette Macao, Speed Roulette, Azure).'
  },
  {
    category: 'Platform',
    q: 'What is the Offset Strategy?',
    a: 'The Offset Strategy measures consecutive ball landing variance on the physical European roulette wheel cylinder. It analyzes whether outcomes are clustering within short pocket arcs (distances of 0, 1, 2, or 3 pockets from prior projections) indicating stable wheel rotor and deceleration physics.'
  },
  {
    category: 'Subscriptions',
    q: 'What subscription plans are available?',
    a: 'We offer exactly five authoritative plans: 15 Days Pass ($150), 1 Month Pro ($200), 3 Months Master ($450), 6 Months Elite ($700), and 1 Year VIP Annual ($1,000). Prices are calculated in decimal-safe integer cents with explicit duration tracking.'
  },
  {
    category: 'Subscriptions',
    q: 'How does calendar-month expiration work?',
    a: 'Unlike platforms that approximate every month as 30 days, our backend calculates true calendar-month expirations. For example, a 1-month subscription purchased on January 31 ends on February 28 (or February 29 in a leap year). A 1-year plan spans all 12 full calendar months.'
  },
  {
    category: 'Payments',
    q: 'What cryptocurrencies can I pay with?',
    a: 'Payments are processed through the NOWPayments gateway. You can pay with USDT (TRC-20 and ERC-20), Bitcoin (BTC), Ethereum (ETH), Solana (SOL), Litecoin (LTC), and over 150 other major cryptocurrencies.'
  },
  {
    category: 'Payments',
    q: 'Can I deposit money or withdraw funds from this platform?',
    a: 'No. Roulette.tools is exclusively an analytical software platform (SaaS). We do not provide casino gaming services, gambling accounts, wallet custody, or client deposit/withdrawal functionality. You purchase a digital subscription to access prediction telemetry.'
  },
  {
    category: 'Referrals',
    q: 'How does the Moderator Referral Program work?',
    a: 'Per Section 11 of the platform architecture, approved Moderator partners receive a qualifying 50% referral commission on subscription purchases made through their unique referral link. Because the platform does not custody client wallets, commission reconciliation is handled directly by Main Admins.'
  },
  {
    category: 'Subscriptions',
    q: 'How do I access the prediction tool after subscribing?',
    a: 'Once your cryptocurrency transaction achieves required blockchain confirmations, your subscription status switches to active. You can then click the "OPEN TOOL" button on the navigation bar or dashboard to launch the real-time prediction engine.'
  }
];

export default function FaqPage() {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const categories = ['All', 'Platform', 'Subscriptions', 'Payments', 'Referrals'];

  const filteredFaqs = activeCategory === 'All'
    ? FAQ_LIST
    : FAQ_LIST.filter(item => item.category === activeCategory);

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
                KNOWLEDGE BASE & TRANSPARENCY
              </span>
            </div>

            <h1 className="font-display text-4xl sm:text-6xl font-black uppercase tracking-tight text-white mb-6">
              Frequently Asked <span className="text-amber-400">Questions</span>
            </h1>

            <p className="mx-auto max-w-2xl text-base sm:text-lg text-slate-400 leading-relaxed">
              Transparent answers regarding our European Roulette algorithmic telemetry, subscription tiers, and crypto payments.
            </p>

            {/* Category Filter Pills */}
            <div className="mt-8 flex flex-wrap justify-center gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => { setActiveCategory(cat); setOpenIndex(null); }}
                  className={`rounded-lg px-4 py-2 font-display text-xs font-bold uppercase tracking-wider transition-all ${
                    activeCategory === cat
                      ? 'bg-amber-500 text-black shadow-md'
                      : 'border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Accordion List */}
        <section className="py-20">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="space-y-4">
              {filteredFaqs.map((faq, idx) => {
                const isOpen = openIndex === idx;

                return (
                  <div
                    key={idx}
                    className="rounded-xl border border-white/10 bg-[#0c1017]/80 backdrop-blur-xl transition-colors hover:border-amber-500/30 overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenIndex(isOpen ? null : idx)}
                      className="w-full flex items-center justify-between p-6 text-left transition-colors"
                      aria-expanded={isOpen}
                    >
                      <span className="font-display text-base font-bold text-white pr-4">
                        {faq.q}
                      </span>
                      <ChevronDown
                        className={`h-5 w-5 shrink-0 text-amber-400 transition-transform duration-200 ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {isOpen && (
                      <div className="px-6 pb-6 pt-2 text-sm text-slate-400 leading-relaxed border-t border-white/5">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Need More Assistance Banner */}
            <div className="mt-16 rounded-xl border border-white/10 bg-[#0a0d14] p-8 text-center">
              <h3 className="font-display text-xl font-bold uppercase text-white mb-2">
                Have a Question Not Answered Here?
              </h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto mb-6">
                Our support desk is available to assist with subscription issues, account security, or moderator inquiries.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-xl border border-amber-500/50 bg-amber-500 px-6 py-2.5 font-display text-xs font-bold uppercase tracking-wider text-black hover:bg-amber-400 transition-colors"
              >
                Submit Support Inquiry
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
