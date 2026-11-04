'use client';

import React from 'react';
import Link from 'next/link';
import { Activity, ShieldCheck, Send, Lock, Zap, ArrowUpRight } from 'lucide-react';

export function Footer() {
  return (
    <footer className="relative border-t border-amber-500/10 bg-[#040609] pt-16 pb-12 overflow-hidden">
      {/* Top Gold Shimmer Accent Line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />
      
      {/* Background ambient lighting */}
      <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-[500px] h-[200px] bg-amber-500/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-14">
          {/* Brand Info */}
          <div className="space-y-4">
            <Link href="/" className="inline-flex items-center gap-3 group">
              <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full p-0.5 bg-gradient-to-br from-amber-400 via-amber-600 to-amber-950 shadow-[0_0_15px_rgba(245,158,11,0.3)] transition-transform group-hover:scale-105">
                <img
                  src="/logo.png"
                  alt="Roulette.tools Official Logo"
                  className="h-full w-full rounded-full object-cover"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-display text-base font-black tracking-wider text-white">
                  ROULETTE<span className="text-amber-400">.TOOLS</span>
                </span>
                <span className="font-display text-[9px] uppercase tracking-widest text-amber-400/80 -mt-0.5">
                  PREDICTION INTELLIGENCE
                </span>
              </div>
            </Link>
            <p className="font-body text-xs text-slate-400 leading-relaxed">
              Advanced European Roulette predictive analytics software. Designed for disciplined systematic pattern recognition across 20+ live casino tables.
            </p>
            <div className="space-y-2 pt-1 font-display text-[11px] text-slate-500">
              <div className="flex items-center gap-2 text-emerald-400/90">
                <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
                <span>Non-custodial SaaS • Strict Zero Withdrawal</span>
              </div>
              <div className="flex items-center gap-2 text-amber-400/90">
                <Lock className="h-3.5 w-3.5 shrink-0" />
                <span>256-bit Cryptographic Session Integrity</span>
              </div>
            </div>
          </div>

          {/* Platform Navigation */}
          <div>
            <h4 className="font-display text-xs font-black uppercase tracking-wider text-white mb-4 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
              Platform
            </h4>
            <ul className="space-y-2.5 text-xs font-display text-slate-400">
              <li>
                <Link href="/" className="hover:text-amber-400 transition-colors inline-flex items-center gap-1">
                  Home Intelligence
                </Link>
              </li>
              <li>
                <Link href="/features" className="hover:text-amber-400 transition-colors inline-flex items-center gap-1">
                  Features &amp; Strategies
                </Link>
              </li>
              <li>
                <Link href="/plans" className="hover:text-amber-400 transition-colors inline-flex items-center gap-1">
                  Subscription Plans
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="hover:text-amber-400 transition-colors inline-flex items-center gap-1">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-amber-400 transition-colors inline-flex items-center gap-1">
                  Frequently Asked Questions
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Governance */}
          <div>
            <h4 className="font-display text-xs font-black uppercase tracking-wider text-white mb-4 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
              Legal &amp; Policies
            </h4>
            <ul className="space-y-2.5 text-xs font-display text-slate-400">
              <li><Link href="/terms" className="hover:text-amber-400 transition-colors">Terms and Conditions</Link></li>
              <li><Link href="/privacy" className="hover:text-amber-400 transition-colors">Privacy Policy</Link></li>
              <li><Link href="/subscription-policy" className="hover:text-amber-400 transition-colors">Subscription Policy</Link></li>
              <li><Link href="/referral-policy" className="hover:text-amber-400 transition-colors">Referral Policy (Moderators)</Link></li>
              <li><Link href="/contact" className="hover:text-amber-400 transition-colors">Contact Support Desk</Link></li>
            </ul>
          </div>

          {/* Member Access & Community */}
          <div>
            <h4 className="font-display text-xs font-black uppercase tracking-wider text-white mb-4 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-teal-400" />
              Access &amp; Community
            </h4>
            <p className="font-body text-xs text-slate-400 mb-4 leading-relaxed">
              Connect with our official team for live telemetry discussions and verified alerts:
            </p>
            <div className="space-y-3">
              <a
                href="https://t.me/shadowroulette"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-between rounded-xl border border-teal-500/30 bg-teal-500/10 px-4 py-2.5 font-display text-xs font-bold text-teal-300 transition-all hover:bg-teal-500/20 hover:border-teal-400 hover:text-white"
              >
                <div className="flex items-center gap-2">
                  <Send className="h-3.5 w-3.5" />
                  <span>Official Telegram</span>
                </div>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </a>

              <div className="flex items-center gap-2 pt-2">
                <Link
                  href="/golin"
                  className="w-1/2 text-center rounded-lg border border-white/10 bg-white/5 py-1.5 font-display text-[11px] font-bold uppercase text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/gerister"
                  className="w-1/2 text-center rounded-lg border border-amber-500/40 bg-amber-500/10 py-1.5 font-display text-[11px] font-bold uppercase text-amber-400 hover:bg-amber-500/20 transition-colors"
                >
                  Join Pro
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Disclaimer & Copyright */}
        <div className="border-t border-white/5 pt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] font-display text-slate-500 gap-4">
          <p>© 2026 Roulette.tools. All rights reserved.</p>
          <p className="tracking-widest uppercase text-slate-600 text-center sm:text-right">
            Single-Zero European Roulette Intelligence • Strict Zero-Custody Architecture
          </p>
        </div>
      </div>
    </footer>
  );
}
