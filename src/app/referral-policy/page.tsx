'use client';

import React from 'react';
import Link from 'next/link';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { Share2, Percent, ShieldAlert, Award, FileText } from 'lucide-react';

export default function ReferralPolicyPage() {
  return (
    <div className="min-h-screen bg-[#06080d] text-slate-100 flex flex-col selection:bg-amber-500 selection:text-black">
      <Navbar />

      <main className="flex-1 py-16 sm:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-12 border-b border-white/10 pb-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 mb-4 text-xs font-bold text-purple-400 font-display uppercase tracking-widest">
              <Share2 className="h-3.5 w-3.5" />
              PARTNER ATTRIBUTION RULES
            </div>
            <h1 className="font-display text-3xl sm:text-5xl font-black uppercase text-white mb-2">
              Referral Policy
            </h1>
            <p className="text-xs text-slate-400 font-mono">
              Last Updated: January 2026 • Section 11 Platform Governance
            </p>
          </div>

          {/* Referral Policy Content */}
          <div className="space-y-8 text-sm text-slate-300 leading-relaxed font-body">
            {/* Callout */}
            <div className="rounded-xl border border-purple-500/30 bg-purple-500/10 p-5 text-purple-200">
              <div className="flex items-center gap-2 font-display text-xs font-bold uppercase tracking-wider text-purple-400 mb-2">
                <Percent className="h-4 w-4" />
                Moderator 50% Commission Qualification
              </div>
              <p className="text-xs leading-relaxed text-purple-300/90">
                Per Section 11 of the platform specifications, qualifying 50% referral commissions are designated exclusively for approved Moderator accounts. Standard member referrals do not accumulate monetary commission attribution.
              </p>
            </div>

            <section className="space-y-3">
              <h2 className="font-display text-lg font-bold uppercase text-white tracking-wide">
                1. Program Structure & Roles
              </h2>
              <p>
                The Roulette.tools referral system operates under strict role-based authorization:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-400">
                <li><strong className="text-slate-200">Moderator Partners:</strong> Authorized community managers and affiliate creators who have received the <code>MODERATOR</code> role from a Main Admin. They earn a 50% commission on every valid subscription purchased through their referral link.</li>
                <li><strong className="text-slate-200">Standard Users:</strong> May share invitation links with peers for community growth, but do not receive monetary attribution.</li>
                <li><strong className="text-slate-200">Main Admins:</strong> Exactly four designated <code>SUPER_ADMIN</code> accounts oversee platform operations and manage Moderator relationships.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="font-display text-lg font-bold uppercase text-white tracking-wide">
                2. Strict Zero-Withdrawal Platform Architecture
              </h2>
              <p>
                Roulette.tools does not hold user balances or provide automated client withdrawal endpoints. There is no in-app custodial wallet or withdrawal request button. Commission statements and arrangements are managed offline directly between designated Main Admins and verified Moderators.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-display text-lg font-bold uppercase text-white tracking-wide">
                3. Attribution Tracking & Order Snapshots
              </h2>
              <p>
                When a user registers using a Moderator&apos;s referral code (e.g. <code>?ref=MOD_CODE</code>), the relationship is permanently bound in the database upon account verification. When that referred subscriber purchases any subscription tier, the purchase record snapshots the referrer&apos;s ID and records 50% of the plan&apos;s integer cent value.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-display text-lg font-bold uppercase text-white tracking-wide">
                4. Prohibited Practices & Self-Referral
              </h2>
              <p>
                Moderators are strictly prohibited from creating duplicate accounts to refer themselves. Any attempts to manipulate referral attribution, deploy automated bot clicks, or misrepresent the platform through false claims of guaranteed gambling winnings will result in immediate role revocation and account termination.
              </p>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-white/10 flex flex-wrap gap-4 text-xs font-display uppercase tracking-wider text-slate-400">
            <Link href="/terms" className="hover:text-amber-400 transition-colors">Terms & Conditions</Link>
            <span>•</span>
            <Link href="/privacy" className="hover:text-amber-400 transition-colors">Privacy Policy</Link>
            <span>•</span>
            <Link href="/subscription-policy" className="hover:text-amber-400 transition-colors">Subscription Policy</Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
