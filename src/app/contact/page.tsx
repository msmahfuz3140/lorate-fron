'use client';

import React, { useState } from 'react';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { authClient } from '../../lib/auth-client';
import {
  Mail,
  User,
  MessageSquare,
  Send,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Clock
} from 'lucide-react';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('General Platform Inquiry');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const res = await authClient.submitContact({
        name: name.trim(),
        email: email.trim(),
        subject: subject.trim(),
        message: message.trim()
      });

      setSuccess(res.message || 'Your inquiry has been received. Our team will reply within 24 hours.');
      setName('');
      setEmail('');
      setMessage('');
    } catch (err: any) {
      setError(err?.message || 'Could not send your message. Please verify the information and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#06080d] text-slate-100 flex flex-col selection:bg-amber-500 selection:text-black">
      <Navbar />

      <main className="flex-1">
        {/* Header */}
        <section className="relative overflow-hidden py-16 lg:py-24 border-b border-white/5 text-center">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />

          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 mb-6">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              <span className="font-display text-[11px] font-bold uppercase tracking-widest text-amber-400">
                CLIENT SUPPORT & MODERATOR INQUIRIES
              </span>
            </div>

            <h1 className="font-display text-4xl sm:text-6xl font-black uppercase tracking-tight text-white mb-4">
              Get in Touch with Our <span className="text-amber-400">Team</span>
            </h1>

            <p className="mx-auto max-w-2xl text-base text-slate-400 leading-relaxed">
              Have questions about subscription activation, live table crawler telemetry, or moderator partnership? Send us a message below.
            </p>
          </div>
        </section>

        {/* Contact Form & Support Details */}
        <section className="py-16 lg:py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
              {/* Form Card */}
              <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-[#0c1017]/90 p-8 backdrop-blur-xl shadow-2xl">
                <h2 className="font-display text-xl font-bold uppercase tracking-wider text-white mb-6">
                  Submit an Inquiry
                </h2>

                {error && (
                  <div className="mb-6 flex items-start gap-3 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-xs text-red-300">
                    <AlertCircle className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                {success && (
                  <div className="mb-6 flex items-start gap-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs text-emerald-300">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
                    <span>{success}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-display text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                        Your Full Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Jordan Bennett"
                          className="w-full rounded-lg border border-white/10 bg-black/40 pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-600 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-colors"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-display text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="jordan@example.com"
                          className="w-full rounded-lg border border-white/10 bg-black/40 pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-600 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-colors"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block font-display text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                      Inquiry Category
                    </label>
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full rounded-lg border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-white focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-colors"
                    >
                      <option value="General Platform Inquiry">General Platform Inquiry</option>
                      <option value="Subscription & Plan Access">Subscription & Plan Access</option>
                      <option value="NOWPayments Crypto Billing Issue">NOWPayments Crypto Billing Issue</option>
                      <option value="Moderator Partner Application">Moderator Partner Application</option>
                      <option value="Technical Support & Telemetry">Technical Support & Telemetry</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-display text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                      Detailed Message
                    </label>
                    <textarea
                      rows={5}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Please describe your question or issue in detail..."
                      className="w-full rounded-lg border border-white/10 bg-black/40 p-4 text-sm text-white placeholder-slate-600 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-colors"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center justify-center gap-2 rounded-xl border border-amber-500/50 bg-gradient-to-r from-amber-500 to-amber-600 px-8 py-3 font-display text-xs font-black uppercase tracking-wider text-black shadow-[0_0_20px_rgba(245,158,11,0.25)] hover:brightness-110 active:scale-95 disabled:opacity-50 transition-all"
                  >
                    {loading ? (
                      <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent" />
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Send Support Message
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Support Info Sidebar */}
              <div className="space-y-6">
                <div className="rounded-2xl border border-white/10 bg-[#0c1017]/80 p-6 backdrop-blur-xl">
                  <div className="flex items-center gap-2 text-amber-400 font-display text-xs font-bold uppercase tracking-wider mb-3">
                    <Clock className="h-4 w-4" />
                    Support Desk SLA
                  </div>
                  <h3 className="font-display text-lg font-bold text-white mb-2">
                    Response Within 24h
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Our technical and billing teams monitor tickets continuously. VIP Annual and High-Roller plan subscribers receive prioritized handling.
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-[#0c1017]/80 p-6 backdrop-blur-xl">
                  <div className="flex items-center gap-2 text-purple-400 font-display text-xs font-bold uppercase tracking-wider mb-3">
                    <HelpCircle className="h-4 w-4" />
                    Moderator Applications
                  </div>
                  <h3 className="font-display text-lg font-bold text-white mb-2">
                    50% Referral Commission
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4">
                    Active casino streamers and community leaders can apply for a Moderator partner role to receive 50% attribution on subscription referrals.
                  </p>
                  <span className="text-[10px] text-slate-500 block">
                    Select &quot;Moderator Partner Application&quot; in the inquiry dropdown above.
                  </span>
                </div>

                <div className="rounded-2xl border border-white/10 bg-[#0c1017]/80 p-6 backdrop-blur-xl">
                  <div className="flex items-center gap-2 text-emerald-400 font-display text-xs font-bold uppercase tracking-wider mb-2">
                    <ShieldCheck className="h-4 w-4" />
                    No Custody Policy
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Please do not contact us requesting gambling balances or withdrawals. Roulette.tools does not hold user funds.
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
