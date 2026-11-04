'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Lock,
  Sparkles,
  ShieldAlert,
  ArrowRight,
  Clock,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Zap
} from 'lucide-react';
import { PLANS_ARRAY } from '../shared/plans';
import { AccessStatusResponse } from '../shared/subscriptions';
import { authClient } from '../lib/auth-client';
import { KeyRound } from 'lucide-react';

interface PremiumLockOverlayProps {
  accessStatus?: AccessStatusResponse | null;
  onRefreshAccess?: () => void;
}

export function PremiumLockOverlay({
  accessStatus,
  onRefreshAccess
}: PremiumLockOverlayProps) {
  const isSecretCodeRequired = accessStatus?.code === 'SECRET_CODE_REQUIRED' || !!accessStatus?.needsSecretCode;
  const isExpired = accessStatus?.code === 'SUBSCRIPTION_EXPIRED';
  const isRevoked = accessStatus?.code === 'SUBSCRIPTION_REVOKED';
  const isMaintenance = accessStatus?.code === 'TOOL_MAINTENANCE';
  const isToolDisabled = accessStatus?.code === 'TOOL_DISABLED';

  const [secretCodeInput, setSecretCodeInput] = useState('');
  const [unlockLoading, setUnlockLoading] = useState(false);
  const [unlockError, setUnlockError] = useState('');
  const [unlockSuccess, setUnlockSuccess] = useState('');

  const handleUnlockSecretCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!secretCodeInput.trim()) {
      setUnlockError('Please enter your VIP Secret Activation Code.');
      return;
    }
    setUnlockLoading(true);
    setUnlockError('');
    try {
      const res = await authClient.unlockToolWithSecretCode(secretCodeInput.trim().toUpperCase());
      setUnlockSuccess(res.message || 'Tool access unlocked successfully!');
      setTimeout(() => {
        onRefreshAccess?.();
      }, 1000);
    } catch (err: any) {
      setUnlockError(err?.message || 'Invalid activation code. Please check your email or contact support.');
    } finally {
      setUnlockLoading(false);
    }
  };

  const title = isSecretCodeRequired
    ? 'VIP Secret Code Required'
    : isMaintenance
    ? 'Maintenance In Progress'
    : isToolDisabled
    ? 'Tool Offline'
    : isRevoked
    ? 'Access Revoked'
    : isExpired
    ? 'Subscription Expired'
    : 'Premium Access Required';

  const badgeText = isSecretCodeRequired
    ? 'Plan Approved • Enter Secret Code to Unlock'
    : isMaintenance
    ? 'Scheduled Tool Maintenance'
    : isToolDisabled
    ? 'Tool Disabled By Administration'
    : isRevoked
    ? 'Revoked by Administration'
    : isExpired
    ? `Expired on ${accessStatus?.expiresAtFormatted || 'Past Expiry'}`
    : 'Active Subscription Required';

  const description = isSecretCodeRequired
    ? 'Your payment has been approved! We sent a congratulatory email with your VIP Secret Activation Code. Enter it below to unlock the Live Roulette Predictor Engine.'
    : isMaintenance
    ? accessStatus?.reason || 'The prediction engine is temporarily offline for scheduled upgrades. Subscriptions remain active.'
    : isToolDisabled
    ? accessStatus?.reason || 'The prediction engine has been temporarily deactivated by administrators. User accounts and subscriptions remain safe.'
    : isRevoked
    ? accessStatus?.reason || 'Your subscription access was revoked by platform administration. Please contact our support team.'
    : isExpired
    ? `Your premium subscription ended on ${accessStatus?.expiresAtFormatted || 'recently'}. Renew today to immediately restore live telemetry and AI consensus tracking.`
    : 'The European Roulette prediction engine, dealer signature tracker, and real-time walk-forward algorithm are exclusively accessible to verified premium subscribers.';

  return (
    <div className="relative min-h-[calc(100vh-65px)] w-full flex items-center justify-center p-4 sm:p-6 lg:p-8 overflow-hidden bg-[#05080f]">
      {/* Obfuscated Blurred Tool Preview in Background */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden opacity-25 filter blur-md">
        <div className="p-6 max-w-7xl mx-auto space-y-6">
          <div className="flex justify-between items-center border-b border-white/10 pb-4">
            <div className="h-8 w-48 bg-slate-700/50 rounded-lg"></div>
            <div className="h-6 w-32 bg-amber-500/30 rounded-full"></div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-44 rounded-xl border border-white/10 bg-slate-900/60 p-4 space-y-3">
                <div className="h-5 w-24 bg-slate-800 rounded"></div>
                <div className="flex gap-1.5">
                  <div className="h-7 w-7 rounded-full bg-rose-600/60"></div>
                  <div className="h-7 w-7 rounded-full bg-slate-700/60"></div>
                  <div className="h-7 w-7 rounded-full bg-emerald-600/60"></div>
                </div>
                <div className="h-4 w-full bg-amber-500/20 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Ambient Gradient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Glass Lock Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-3xl rounded-3xl border border-amber-500/30 bg-gradient-to-b from-[#0d131f]/95 via-[#080d16]/95 to-[#04060b]/95 p-6 sm:p-10 shadow-[0_0_80px_rgba(0,0,0,0.8),0_0_40px_rgba(245,158,11,0.15)] backdrop-blur-2xl"
      >
        {/* Animated Lock Icon */}
        <div className="relative mx-auto mb-6 flex h-20 w-20 items-center justify-center">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-amber-500/30 to-amber-700/10 blur-md animate-pulse" />
          <div className="relative flex h-full w-full items-center justify-center rounded-2xl border border-amber-500/50 bg-[#0d1424] shadow-[0_0_25px_rgba(245,158,11,0.3)]">
            <Lock className="h-10 w-10 text-amber-400 animate-[bounce_3s_infinite]" />
          </div>
          <div className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border border-amber-400 bg-amber-500 text-black">
            <Zap className="h-3.5 w-3.5 fill-black" />
          </div>
        </div>

        {/* Status Badge & Header */}
        <div className="text-center mb-8">
          <div
            className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1 text-xs font-display font-bold uppercase tracking-wider mb-3 ${
              isRevoked || isToolDisabled
                ? 'border-rose-500/40 bg-rose-500/10 text-rose-400'
                : isMaintenance
                ? 'border-amber-500/40 bg-amber-500/10 text-amber-400'
                : isExpired
                ? 'border-amber-500/40 bg-amber-500/10 text-amber-400'
                : 'border-amber-500/30 bg-amber-500/10 text-amber-300'
            }`}
          >
            {isRevoked || isToolDisabled ? (
              <AlertTriangle className="h-3.5 w-3.5" />
            ) : isExpired || isMaintenance ? (
              <Clock className="h-3.5 w-3.5" />
            ) : (
              <ShieldAlert className="h-3.5 w-3.5" />
            )}
            {badgeText}
          </div>

          <h2 className="font-display text-2xl sm:text-3xl font-black uppercase tracking-tight text-white mb-3">
            {title}
          </h2>

          <p className="font-body text-sm sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed">
            {description}
          </p>
        </div>

        {/* VIP Secret Code Unlock Box or Plan Comparison Cards */}
        {isSecretCodeRequired ? (
          <form onSubmit={handleUnlockSecretCode} className="mb-8 space-y-4 max-w-lg mx-auto">
            <div className="rounded-2xl border border-amber-500/40 bg-gradient-to-b from-amber-500/10 via-slate-900/60 to-slate-950/80 p-6 shadow-2xl backdrop-blur-md">
              <div className="flex items-center gap-2 mb-3">
                <KeyRound className="h-5 w-5 text-amber-400" />
                <label className="font-display text-xs font-black uppercase tracking-wider text-amber-300">
                  Enter Your VIP Secret Activation Code
                </label>
              </div>

              <div className="relative">
                <input
                  type="text"
                  value={secretCodeInput}
                  onChange={(e) => setSecretCodeInput(e.target.value.toUpperCase())}
                  placeholder="VIP-XXXX-XXXX"
                  maxLength={20}
                  className="w-full text-center tracking-[0.25em] font-mono text-lg font-black uppercase rounded-xl border border-amber-500/50 bg-[#070b13] px-4 py-3.5 text-white placeholder-slate-600 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 shadow-inner"
                />
              </div>

              {unlockError && (
                <div className="mt-3 flex items-center gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400" />
                  <span>{unlockError}</span>
                </div>
              )}

              {unlockSuccess && (
                <div className="mt-3 flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-300">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                  <span>{unlockSuccess}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={unlockLoading || !secretCodeInput.trim()}
                className="mt-4 w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 py-3.5 font-display text-xs font-black uppercase tracking-wider text-black shadow-[0_0_25px_rgba(245,158,11,0.35)] hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Sparkles className="h-4 w-4 fill-black" />
                {unlockLoading ? 'Verifying Activation Code...' : 'Activate & Unlock Prediction Engine'}
              </button>
            </div>

            <p className="text-center text-[11px] text-slate-400">
              Haven&apos;t received your code yet? Check your spam folder or wait for admin approval notification.
            </p>
          </form>
        ) : !isMaintenance && !isToolDisabled ? (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3 px-1">
              <span className="font-display text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Select an Active Tier to Unlock Instantly
              </span>
              <Link
                href="/plans"
                className="font-display text-[11px] font-bold uppercase tracking-wider text-amber-400 hover:text-amber-300 transition-colors inline-flex items-center gap-1"
              >
                Compare All Details <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {PLANS_ARRAY.slice(0, 3).map((plan) => (
              <Link
                key={plan.id}
                href={`/plans#plan-${plan.id}`}
                className={`group relative rounded-2xl border p-4 transition-all hover:scale-[1.02] ${
                  plan.isPopular
                    ? 'border-amber-500/60 bg-gradient-to-b from-amber-500/15 to-transparent shadow-[0_0_20px_rgba(245,158,11,0.15)]'
                    : 'border-white/10 bg-white/[0.02] hover:border-white/20'
                }`}
              >
                {plan.isPopular && (
                  <span className="absolute -top-2.5 right-3 rounded-full border border-amber-500/50 bg-amber-500 px-2 py-0.5 font-display text-[9px] font-black uppercase tracking-widest text-black">
                    RECOMMENDED
                  </span>
                )}
                <p className="font-display text-xs font-bold uppercase tracking-wider text-slate-300 group-hover:text-amber-400 transition-colors">
                  {plan.name}
                </p>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="font-display text-2xl font-black text-white">
                    ${plan.priceUsd}
                  </span>
                  <span className="font-display text-[11px] text-slate-400">
                    /{plan.durationDays}d
                  </span>
                </div>
                <ul className="mt-3 space-y-1.5 text-[11px] text-slate-400 font-body">
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3 w-3 text-emerald-400 shrink-0" />
                    <span>20+ Live Tables Stream</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3 w-3 text-emerald-400 shrink-0" />
                    <span>8 Prediction Models</span>
                  </li>
                </ul>
              </Link>
            ))}
          </div>
        </div>
        ) : null}

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {isSecretCodeRequired ? (
            <button
              onClick={onRefreshAccess}
              className="w-full sm:flex-1 flex items-center justify-center gap-2 rounded-xl border border-amber-500/60 bg-white/5 py-3.5 px-6 font-display text-xs font-bold uppercase tracking-wider text-amber-300 hover:bg-white/10 transition-all"
            >
              <Zap className="h-4 w-4" />
              Refresh Access Status
            </button>
          ) : !isMaintenance && !isToolDisabled ? (
            <Link
              href="/plans"
              className="w-full sm:flex-1 flex items-center justify-center gap-2 rounded-xl border border-amber-500/60 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 py-3.5 px-6 font-display text-xs font-black uppercase tracking-wider text-black shadow-[0_0_25px_rgba(245,158,11,0.35)] transition-all hover:brightness-110 active:scale-95"
            >
              <Sparkles className="h-4 w-4" />
              View Premium Plans
              <ArrowRight className="h-4 w-4" />
            </Link>
          ) : (
            <button
              onClick={onRefreshAccess}
              className="w-full sm:flex-1 flex items-center justify-center gap-2 rounded-xl border border-amber-500/60 bg-gradient-to-r from-amber-500 to-amber-600 py-3.5 px-6 font-display text-xs font-bold uppercase tracking-wider text-black shadow-lg shadow-amber-500/20 hover:brightness-110 transition-all"
            >
              <Zap className="h-4 w-4" />
              Check Status Again
            </button>
          )}

          {onRefreshAccess && !isMaintenance && !isToolDisabled && !isSecretCodeRequired && (
            <button
              onClick={onRefreshAccess}
              className="w-full sm:w-auto rounded-xl border border-white/10 bg-white/5 py-3.5 px-5 font-display text-xs font-bold uppercase tracking-wider text-slate-300 hover:bg-white/10 hover:text-white transition-all"
            >
              Verify Payment
            </button>
          )}

          <Link
            href="/dashboard"
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-transparent py-3.5 px-5 font-display text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-white hover:bg-white/5 transition-all"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Dashboard
          </Link>
        </div>

        {/* Strict Security Notice */}
        <p className="mt-6 text-center font-display text-[10px] uppercase tracking-widest text-slate-500">
          Cryptographically Signed • Server-Side Subscription Verification • Zero Simulated Fallbacks
        </p>
      </motion.div>
    </div>
  );
}
