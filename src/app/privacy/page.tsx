'use client';

import React from 'react';
import Link from 'next/link';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { ShieldCheck, Lock, EyeOff, Server, FileText } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#06080d] text-slate-100 flex flex-col selection:bg-amber-500 selection:text-black">
      <Navbar />

      <main className="flex-1 py-16 sm:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-12 border-b border-white/10 pb-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 mb-4 text-xs font-bold text-emerald-400 font-display uppercase tracking-widest">
              <ShieldCheck className="h-3.5 w-3.5" />
              USER DATA PROTECTION
            </div>
            <h1 className="font-display text-3xl sm:text-5xl font-black uppercase text-white mb-2">
              Privacy Policy
            </h1>
            <p className="text-xs text-slate-400 font-mono">
              Last Updated: January 2026 • Global Standard Compliance
            </p>
          </div>

          {/* Privacy Content */}
          <div className="space-y-8 text-sm text-slate-300 leading-relaxed font-body">
            <section className="space-y-3">
              <h2 className="font-display text-lg font-bold uppercase text-white tracking-wide">
                1. Information We Collect
              </h2>
              <p>
                To provide authenticated access and ensure system security, Roulette.tools collects minimal necessary account identifiers:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-400">
                <li><strong className="text-slate-200">Contact Method:</strong> Your email address or international E.164 phone number.</li>
                <li><strong className="text-slate-200">Security Credentials:</strong> One-way cryptographic password hashes (Bcrypt, minimum 10 rounds). Plaintext passwords are never stored or logged.</li>
                <li><strong className="text-slate-200">Verification Codes:</strong> Cryptographic SHA-256 hashes of one-time codes (OTPs), which expire automatically after 10 minutes via MongoDB TTL indexes.</li>
                <li><strong className="text-slate-200">Payment Order Records:</strong> Order IDs, cryptocurrency payment hashes, and subscription tier snapshots via NOWPayments.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="font-display text-lg font-bold uppercase text-white tracking-wide">
                2. How We Use Your Data
              </h2>
              <p>
                Collected data is utilized strictly to:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-400">
                <li>Authenticate your access to the prediction platform.</li>
                <li>Dispatch one-time verification and password reset codes.</li>
                <li>Verify on-chain cryptocurrency transactions through signed NOWPayments IPN webhooks.</li>
                <li>Prevent abusive automated account creation, brute-force attacks, and API tampering.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="font-display text-lg font-bold uppercase text-white tracking-wide">
                3. Zero Sale or Third-Party Monetization
              </h2>
              <p>
                We do not sell, rent, monetize, or broker your personal information to advertising networks, third-party casino operators, or data brokers. Data is processed exclusively by our server infrastructure and essential verified delivery providers (e.g. Resend for email, Twilio for SMS, and NOWPayments for cryptocurrency billing).
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-display text-lg font-bold uppercase text-white tracking-wide">
                4. Cookies and Session Storage
              </h2>
              <p>
                We use secure, HTTP-only session tokens and localStorage keys (<code>sloot_token</code>) strictly to maintain your authenticated state across page refreshes. We do not use third-party tracking pixels or cross-site tracking cookies.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-display text-lg font-bold uppercase text-white tracking-wide">
                5. Data Security & Storage Architecture
              </h2>
              <p>
                All network transmissions are encrypted with TLS 1.3 / HTTPS. Database schemas feature restricted index constraints and encrypted connection pooling. Rate limiting and IP monitoring are applied at the network edge to prevent denial-of-service and brute-force enumeration.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-display text-lg font-bold uppercase text-white tracking-wide">
                6. Your Rights
              </h2>
              <p>
                Regardless of your location, you have the right to request review, correction, or permanent erasure of your account and associated contact identifiers. You can submit requests via our <Link href="/contact" className="text-amber-400 underline hover:text-amber-300">Contact Desk</Link>.
              </p>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-white/10 flex flex-wrap gap-4 text-xs font-display uppercase tracking-wider text-slate-400">
            <Link href="/terms" className="hover:text-amber-400 transition-colors">Terms & Conditions</Link>
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
