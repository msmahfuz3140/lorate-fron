'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { OtpPurpose } from '../../shared/auth';
import { KeyRound, ShieldCheck, Activity, AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react';

function VerifyOtpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { verifyOtp, resendOtp } = useAuth();

  const targetParam = searchParams.get('target') || '';
  const purposeParam = (searchParams.get('purpose') as OtpPurpose) || OtpPurpose.REGISTRATION;

  const [target, setTarget] = useState(targetParam);
  const [code, setCode] = useState('');
  const [cooldown, setCooldown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const devCodeParam = searchParams.get('devCode') || '';

  useEffect(() => {
    if (targetParam) {
      setTarget(targetParam);
    }
    if (devCodeParam) {
      setCode(devCodeParam);
      setInfoMessage(`Development OTP code: ${devCodeParam} (Auto-filled for testing)`);
    }
  }, [targetParam, devCodeParam]);

  // Countdown timer for 60s cooldown
  useEffect(() => {
    if (cooldown <= 0) {
      setCanResend(true);
      return;
    }

    setCanResend(false);
    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldown]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfoMessage(null);

    const cleanCode = code.trim();
    if (cleanCode.length !== 6) {
      setError('Please enter the complete 6-digit verification code');
      return;
    }

    if (!target.trim()) {
      setError('Target email or phone number is missing');
      return;
    }

    setLoading(true);

    try {
      const res = await verifyOtp({
        target: target.trim(),
        code: cleanCode,
        purpose: purposeParam
      });

      setInfoMessage('Verification successful! Redirecting...');
      setTimeout(() => {
        router.push('/');
      }, 1200);
    } catch (err: any) {
      setError(err?.message || 'Verification failed. Please check the code and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend || resending || !target.trim()) return;
    setError(null);
    setInfoMessage(null);
    setResending(true);

    try {
      const res = await resendOtp({
        target: target.trim(),
        purpose: purposeParam
      });

      setCooldown(res.cooldownSeconds || 60);
      setCanResend(false);
      setInfoMessage('A new verification code has been dispatched.');
    } catch (err: any) {
      setError(err?.message || 'Could not resend code. Please try again shortly.');
    } finally {
      setResending(false);
    }
  };

  const isEmail = target.includes('@');

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden bg-[#06080d]">
      {/* Background glow */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />

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
          Enter Verification Code
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          A 6-digit one-time code was dispatched to:
        </p>
        <div className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 font-mono text-xs font-bold text-amber-400">
          {isEmail ? '✉️ ' : '📱 '}
          {target || 'Your registered contact'}
        </div>
      </div>

      {/* Verification Card */}
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0c1017]/90 p-6 sm:p-8 backdrop-blur-xl shadow-2xl relative z-10">
        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-lg border border-red-500/30 bg-red-500/10 p-3.5 text-xs text-red-300">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {infoMessage && (
          <div className="mb-6 flex items-start gap-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs text-emerald-300">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
            <span>{infoMessage}</span>
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-5">
          {!targetParam && (
            <div>
              <label className="block font-display text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Target Email or Phone
              </label>
              <input
                type="text"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                placeholder="name@example.com or +14155552671"
                className="w-full rounded-lg border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-colors"
                required
              />
            </div>
          )}

          <div>
            <label className="block font-display text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 text-center">
              6-Digit One-Time Code
            </label>
            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="••••••"
                autoFocus
                className="w-full rounded-xl border-2 border-white/15 bg-black/60 py-3.5 text-center font-mono text-2xl font-black tracking-[0.5em] text-amber-400 placeholder-slate-700 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40 transition-all"
                required
              />
            </div>
            <p className="mt-2 text-center text-[11px] text-slate-500">
              Valid for 10 minutes • Single-use only • Maximum 5 attempts
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || code.length !== 6}
            className="w-full flex items-center justify-center gap-2 rounded-lg border border-amber-500/50 bg-gradient-to-r from-amber-500 to-amber-600 py-3 font-display text-xs font-black uppercase tracking-wider text-black shadow-[0_0_20px_rgba(245,158,11,0.25)] transition-all hover:brightness-110 active:scale-[0.99] disabled:opacity-40"
          >
            {loading ? (
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent" />
            ) : (
              <>
                <KeyRound className="h-4 w-4" />
                Verify & Activate Account
              </>
            )}
          </button>
        </form>

        {/* Resend Section with Cooldown */}
        <div className="mt-6 pt-5 border-t border-white/10 flex flex-col items-center gap-2 text-xs">
          <p className="text-slate-400">Didn&apos;t receive the code?</p>
          <button
            type="button"
            onClick={handleResend}
            disabled={!canResend || resending}
            className={`inline-flex items-center gap-1.5 font-display text-xs font-bold uppercase tracking-wider transition-colors ${
              canResend
                ? 'text-amber-400 hover:text-amber-300'
                : 'text-slate-600 cursor-not-allowed'
            }`}
          >
            <RefreshCw className={`h-3 w-3 ${resending ? 'animate-spin' : ''}`} />
            {canResend ? 'Resend Code Now' : `Resend in ${cooldown}s`}
          </button>
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 text-[11px] text-slate-500">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
          <span>Brute-force protection & sliding-window rate limit active</span>
        </div>
      </div>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#06080d]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
      </div>
    }>
      <VerifyOtpContent />
    </Suspense>
  );
}
