'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

const FAQS = [
  {
    q: 'How does the prediction engine generate numbers?',
    a: 'The engine ingests live spin feeds from Evolution Gaming and Pragmatic Play tables, analyzing historical pocket distances (Offset Strategy), win/loss sequence momentum (Target Strategy), and ball travel trajectory consistency across rotations (Dealer Signature Strategy).'
  },
  {
    q: 'Which cryptocurrencies are supported for subscription payment?',
    a: 'We integrate with NOWPayments, supporting popular crypto assets including USDT (TRC20, ERC20), Bitcoin (BTC), Ethereum (ETH), Litecoin (LTC), Solana (SOL), and Binance Coin (BNB). Payments are verified on-chain via signed instant payment notifications (IPN).'
  },
  {
    q: 'How fast does my subscription activate after payment?',
    a: 'Subscriptions activate automatically within seconds of NOWPayments receiving the required blockchain network confirmations. The backend verifies the transaction and grants immediate premium access.'
  },
  {
    q: 'How does the 50% Moderator Referral Commission work?',
    a: 'Eligible Moderators appointed by Main Admins receive unique referral links. When referred users subscribe to any of the 5 subscription plans, 50% of the subscription value is calculated and credited to the moderator’s reporting ledger.'
  },
  {
    q: 'Does this platform offer gambling or withdrawal functionality?',
    a: 'No. This application is purely a statistical prediction analytics platform. There are no betting mechanics, no user wallet custody, and no withdrawal functionality in the platform.'
  },
  {
    q: 'Can I test the platform before purchasing a full subscription?',
    a: 'Yes! The 24-Hour Pass ($19) is specifically designed as a low-cost trial allowing you to test live predictions across all tables. Additionally, our free demo preview shows live table spin histories and strategy calculation samples.'
  }
];

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-20 border-t border-white/5 bg-[#06080d]">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 mb-3">
            <HelpCircle className="h-3.5 w-3.5 text-amber-400" />
            <span className="font-display text-[10px] font-bold uppercase tracking-widest text-slate-400">
              FREQUENTLY ASKED QUESTIONS
            </span>
          </div>
          <h2 className="font-display text-2xl sm:text-4xl font-extrabold uppercase tracking-tight text-white">
            Common Questions & Answers
          </h2>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-xl border border-white/10 bg-slate-900/40 backdrop-blur-md overflow-hidden transition-colors hover:border-white/20"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="flex w-full items-center justify-between p-5 text-left font-display text-sm font-bold text-white"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`h-4 w-4 text-amber-400 transition-transform duration-300 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 font-body text-sm text-slate-300 leading-relaxed border-t border-white/5 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
