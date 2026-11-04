'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { Mail, Phone, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, Activity, AlertCircle } from 'lucide-react';
import { COUNTRY_CODES, formatToE164 } from '../../data/countries';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [method, setMethod] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState('');
  const [countryDialCode, setCountryDialCode] = useState('+880');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    let identifier = '';
    if (method === 'email') {
      identifier = email.trim();
    } else {
      identifier = formatToE164(countryDialCode, phone);
      if (!identifier || identifier.length < 8) {
        setError('Please enter a valid phone number with country code');
        setLoading(false);
        return;
      }
    }

    if (!identifier) {
      setError(method === 'email' ? 'Please enter your email address' : 'Please enter your phone number');
      setLoading(false);
      return;
    }

    if (!password) {
      setError('Please enter your password');
      setLoading(false);
      return;
    }

    try {
      const res = await login({ identifier, password });
      if (res.requiresVerification && res.verificationTarget) {
        router.push(`/verify-otp?target=${encodeURIComponent(res.verificationTarget)}&purpose=${res.verificationPurpose || 'REGISTRATION'}`);
      } else {
        const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
        const redirectParam = urlParams?.get('redirect');
        if (redirectParam) {
          router.push(redirectParam);
        } else {
          router.push('/');
        }
      }
    } catch (err: any) {
      setError(err?.message || 'Invalid credentials. Please verify and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden bg-[#06080d]">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Brand logo header */}
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
          Account Login
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Sign in using your verified email or mobile phone
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

        {/* Method selector tabs */}
        <div className="mb-6 grid grid-cols-2 gap-2 rounded-xl border border-white/10 bg-white/5 p-1">
          <button
            type="button"
            onClick={() => { setMethod('email'); setError(null); }}
            className={`flex items-center justify-center gap-2 rounded-lg py-2 font-display text-xs font-bold uppercase tracking-wider transition-all ${
              method === 'email'
                ? 'bg-amber-500 text-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Mail className="h-3.5 w-3.5" />
            Email Login
          </button>
          <button
            type="button"
            onClick={() => { setMethod('phone'); setError(null); }}
            className={`flex items-center justify-center gap-2 rounded-lg py-2 font-display text-xs font-bold uppercase tracking-wider transition-all ${
              method === 'phone'
                ? 'bg-amber-500 text-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Phone className="h-3.5 w-3.5" />
            Phone Login
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {method === 'email' ? (
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
                  required={method === 'email'}
                />
              </div>
            </div>
          ) : (
            <div>
              <label className="block font-display text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Country & Phone Number
              </label>
              <div className="flex gap-2">
                {/* Country Code Dropdown */}
                <div className="relative w-[130px] shrink-0">
                  <select
                    value={countryDialCode}
                    onChange={(e) => setCountryDialCode(e.target.value)}
                    className="w-full appearance-none rounded-lg border border-white/10 bg-[#121824] px-2.5 py-2.5 text-xs text-white focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-colors cursor-pointer"
                  >
                    {COUNTRY_CODES.map((c) => (
                      <option key={`${c.code}-${c.dialCode}`} value={c.dialCode} className="bg-[#0c1017] text-white">
                        {c.flag} {c.dialCode} ({c.name})
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 text-[10px]">
                    ▼
                  </div>
                </div>

                {/* Local Phone Number Input */}
                <div className="relative flex-1">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="1712345678"
                    className="w-full rounded-lg border border-white/10 bg-black/40 pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-600 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-colors"
                    required={method === 'phone'}
                  />
                </div>
              </div>
              <p className="mt-1 text-[11px] text-slate-500">
                International: <span className="text-amber-400/90 font-mono font-medium">{formatToE164(countryDialCode, phone) || `${countryDialCode}...`}</span>
              </p>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-display text-xs font-bold uppercase tracking-wider text-slate-300">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="font-display text-xs text-amber-400 hover:text-amber-300 transition-colors"
              >
                Forgot Password?
              </Link>
            </div>
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

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 flex items-center justify-center gap-2 rounded-lg border border-amber-500/50 bg-gradient-to-r from-amber-500 to-amber-600 py-3 font-display text-xs font-black uppercase tracking-wider text-black shadow-[0_0_20px_rgba(245,158,11,0.25)] transition-all hover:brightness-110 active:scale-[0.99] disabled:opacity-50"
          >
            {loading ? (
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent" />
            ) : (
              <>
                Sign In to Platform
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-white/10 text-center">
          <p className="text-xs text-slate-400">
            Don&apos;t have an account yet?{' '}
            <Link href="/gerister" className="font-display font-bold text-amber-400 hover:text-amber-300 transition-colors">
              Create an account
            </Link>
          </p>
        </div>

        <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-slate-500">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
          <span>Encrypted with Better Auth session security</span>
        </div>
      </div>
    </div>
  );
}
