'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authClient } from '../../lib/auth-client';
import { Mail, Lock, Eye, EyeOff, KeyRound, ArrowRight, ShieldCheck, Activity, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [step, setStep] = useState<1 | 2>(1);
  const [target, setTarget] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Step 1: Request OTP for password reset
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const cleanTarget = target.trim();
    if (!cleanTarget) {
      setError('Please provide your registered email or phone number');
      return;
    }

    setLoading(true);

    try {
      const res = await authClient.forgotPassword({ target: cleanTarget });
      setSuccessMsg(res.message);
      setStep(2);
    } catch (err: any) {
      setError(err?.message || 'Could not process request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Submit OTP and set new password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (code.trim().length !== 6) {
      setError('Please enter the 6-digit reset code');
      return;
    }

    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters long');
      return;
    }

    if (newPassword !== newPasswordConfirm) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const res = await authClient.resetPassword({
        target: target.trim(),
        code: code.trim(),
        newPassword
      });

      setSuccessMsg(res.message || 'Password reset successfully! Redirecting to login...');
      setTimeout(() => {
        router.push('/golin');
      }, 1500);
    } catch (err: any) {
      setError(err?.message || 'Password reset failed. Please verify your code and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden bg-[#06080d]">
      {/* Background ambient lighting */}
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
          {step === 1 ? 'Reset Password' : 'Enter Reset Code'}
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          {step === 1
            ? 'We will dispatch a secure one-time verification code'
            : 'Enter the 6-digit code sent to your contact and create your new password'}
        </p>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0c1017]/90 p-6 sm:p-8 backdrop-blur-xl shadow-2xl relative z-10">
        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-lg border border-red-500/30 bg-red-500/10 p-3.5 text-xs text-red-300">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-6 flex items-start gap-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs text-emerald-300">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleRequestOtp} className="space-y-4">
            <div>
              <label className="block font-display text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Registered Email or Phone Number
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  placeholder="name@example.com or +14155552671"
                  className="w-full rounded-lg border border-white/10 bg-black/40 pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-600 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-colors"
                  required
                />
              </div>
              <p className="mt-1 text-[11px] text-slate-500">
                Generic enumeration protection: we never confirm or deny account presence.
              </p>
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
                  Send Password Reset Code
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="block font-display text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 text-center">
                6-Digit Reset Code
              </label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="••••••"
                autoFocus
                className="w-full rounded-xl border-2 border-white/15 bg-black/60 py-3 text-center font-mono text-xl font-bold tracking-[0.5em] text-amber-400 placeholder-slate-700 focus:border-amber-500 focus:outline-none transition-all"
                required
              />
            </div>

            <div>
              <label className="block font-display text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                New Password <span className="text-[10px] text-slate-500 font-normal">(min 8 characters)</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
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
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPasswordConfirm}
                  onChange={(e) => setNewPasswordConfirm(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-white/10 bg-black/40 pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-600 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-colors"
                  required
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
                  <KeyRound className="h-4 w-4" />
                  Save New Password & Login
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => { setStep(1); setError(null); }}
              className="w-full text-center text-xs text-slate-500 hover:text-slate-300 transition-colors pt-2"
            >
              ← Back to enter different email or phone
            </button>
          </form>
        )}

        <div className="mt-6 pt-6 border-t border-white/10 text-center">
          <Link href="/golin" className="font-display text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors">
            ← Return to Sign In
          </Link>
        </div>

        <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-slate-500">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
          <span>Account enumeration guard & attempt tracking active</span>
        </div>
      </div>
    </div>
  );
}
