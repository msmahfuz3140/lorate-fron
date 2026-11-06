'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, User, ArrowRight, ShieldCheck, AlertCircle, Gift, Sparkles } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (password !== passwordConfirm) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      await register({
        name: name.trim() || 'Member',
        email: email.trim().toLowerCase(),
        password,
        referralCode: referralCode.trim() || undefined
      });

      // Immediate redirect to dashboard/tool - no OTP or verification step needed!
      router.push('/dashboard/tool');
    } catch (err: any) {
      setError(err?.message || 'Registration failed. Please check your information and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden bg-[#06080d]">
      {/* Background ambient glow */}
      <div className="absolute top-1/4 -right-20 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 -left-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Brand header */}
      <div className="mb-8 text-center relative z-10">
        <Link href="/" className="inline-flex items-center gap-3 group">
          <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full p-0.5 bg-gradient-to-br from-amber-400 via-amber-600 to-amber-950 shadow-[0_0_25px_rgba(245,158,11,0.4)] transition-transform group-hover:scale-105">
            <img
              src="/logo.png"
              alt="Roulette.tools Official Logo"
              className="h-full w-full rounded-full object-cover"
            />
          </div>
          <div className="text-left">
            <span className="font-display text-lg font-black tracking-wider text-white">
              ROULETTE<span className="text-amber-400">.TOOLS</span>
            </span>
            <p className="font-display text-[10px] uppercase tracking-widest text-slate-500">
              European Roulette Intelligence
            </p>
          </div>
        </Link>
        <h1 className="mt-6 font-display text-2xl font-black uppercase tracking-wider text-white sm:text-3xl">
          Create Member Account
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Enter your email and password to instantly create your account
        </p>
      </div>

      {/* Main Form Card */}
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0c1017]/90 p-6 sm:p-8 backdrop-blur-xl shadow-2xl relative z-10">
        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-lg border border-red-500/30 bg-red-500/10 p-3.5 text-xs text-red-300">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-display text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Morgan"
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
                placeholder="name@example.com"
                className="w-full rounded-lg border border-white/10 bg-black/40 pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-600 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-colors"
                required
              />
            </div>
          </div>

          <div>
            <label className="block font-display text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Password <span className="text-[10px] text-slate-500 font-normal">(min 6 characters)</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-white/10 bg-black/40 pl-10 pr-10 py-2.5 text-sm text-white placeholder-slate-600 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-colors"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block font-display text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-white/10 bg-black/40 pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-600 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-colors"
                required
              />
            </div>
          </div>

          <div>
            <label className="block font-display text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Referral Code <span className="text-[10px] text-slate-500 font-normal">(Optional Moderator Code)</span>
            </label>
            <div className="relative">
              <Gift className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                type="text"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                placeholder="MODERATOR_CODE"
                className="w-full rounded-lg border border-white/10 bg-black/40 pl-10 pr-4 py-2.5 text-sm uppercase text-white placeholder-slate-600 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 flex items-center justify-center gap-2 rounded-lg border border-amber-500/50 bg-gradient-to-r from-amber-500 to-amber-600 py-3 font-display text-xs font-black uppercase tracking-wider text-black shadow-[0_0_20px_rgba(245,158,11,0.25)] transition-all hover:brightness-110 active:scale-[0.99] disabled:opacity-50"
          >
            {loading ? (
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent" />
            ) : (
              <>
                <Sparkles className="h-4 w-4 fill-black" />
                Create Account &amp; Access Platform
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-white/10 text-center">
          <p className="text-xs text-slate-400">
            Already have an active account?{' '}
            <Link href="/golin" className="font-display font-bold text-amber-400 hover:text-amber-300 transition-colors">
              Sign In
            </Link>
          </p>
        </div>

        <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-slate-500">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
          <span>Instant activation • Direct access to intelligence platform</span>
        </div>
      </div>
    </div>
  );
}
