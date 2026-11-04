'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../context/AuthContext';
import { authClient } from '../../../lib/auth-client';
import { AccessStatusResponse, SubscriptionStatus } from '../../../shared/subscriptions';
import { PremiumLockOverlay } from '../../../components/PremiumLockOverlay';
import {
  Activity,
  ArrowLeft,
  ShieldCheck,
  Clock,
  Sparkles,
  RefreshCw,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
  Lock
} from 'lucide-react';

export default function DashboardToolPage() {
  const router = useRouter();
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();

  const [accessStatus, setAccessStatus] = useState<AccessStatusResponse | null>(null);
  const [accessLoading, setAccessLoading] = useState(true);
  const [accessError, setAccessError] = useState<string | null>(null);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState<number | null>(null);
  const [toolKey, setToolKey] = useState<number>(0);

  useEffect(() => {
    setToolKey(Date.now());
  }, []);

  // Authoritative server-side verification check
  const verifyAccess = useCallback(async () => {
    setAccessLoading(true);
    setAccessError(null);
    try {
      const status = await authClient.getAccessStatus();
      setAccessStatus(status);
    } catch (err: any) {
      setAccessError(err?.message || 'Failed to authenticate subscription access with server.');
    } finally {
      setAccessLoading(false);
    }
  }, []);

  const handleRefresh = useCallback(() => {
    setToolKey(Date.now());
    setIframeLoaded(false);
    verifyAccess();
  }, [verifyAccess]);

  // Real-time dynamic ticking expiration monitor
  useEffect(() => {
    if (!accessStatus?.endDate) {
      setSecondsRemaining(null);
      return;
    }

    const updateCountdown = () => {
      const endMs = new Date(accessStatus.endDate!).getTime();
      const nowMs = Date.now();
      const diffSec = Math.floor((endMs - nowMs) / 1000);

      if (diffSec <= 0) {
        setSecondsRemaining(0);
        // Expiration reached while inside the tool -> lock the tool immediately!
        if (accessStatus.hasAccess) {
          setAccessStatus((prev) =>
            prev
              ? {
                  ...prev,
                  hasAccess: false,
                  code: 'SUBSCRIPTION_EXPIRED',
                  status: SubscriptionStatus.EXPIRED,
                  daysRemaining: 0,
                  reason: 'Subscription period has expired. Please renew your plan.'
                }
              : null
          );
        }
      } else {
        setSecondsRemaining(diffSec);
      }
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [accessStatus?.endDate, accessStatus?.hasAccess]);

  const formatRemaining = () => {
    if (secondsRemaining === null) {
      if (accessStatus?.daysRemaining !== undefined) {
        return `${accessStatus.daysRemaining} days left`;
      }
      return null;
    }
    if (secondsRemaining <= 0) return 'Expired (0d)';

    const days = Math.floor(secondsRemaining / 86400);
    const hours = Math.floor((secondsRemaining % 86400) / 3600);
    const mins = Math.floor((secondsRemaining % 3600) / 60);
    const secs = secondsRemaining % 60;

    if (days > 1) {
      return `${days} days left`;
    }
    if (days === 1) {
      return `1 day ${hours}h left`;
    }
    if (hours > 0) {
      return `${hours}h ${mins}m left`;
    }
    return `${mins}m ${secs}s left`;
  };

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push('/golin?redirect=/dashboard/tool');
      } else {
        verifyAccess();
      }
    }
  }, [authLoading, isAuthenticated, router, verifyAccess]);

  // Loading state
  if (authLoading || accessLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#05080f] text-slate-100">
        <div className="flex flex-col items-center gap-4 text-center p-6">
          <div className="relative">
            <div className="h-14 w-14 rounded-full border-2 border-amber-500/30 border-t-amber-400 animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Activity className="h-5 w-5 text-amber-400 animate-pulse" />
            </div>
          </div>
          <div>
            <h2 className="font-display text-sm font-black uppercase tracking-widest text-white">
              Validating Server Authorization...
            </h2>
            <p className="font-display text-[11px] uppercase tracking-wider text-slate-500 mt-1">
              Checking cryptographically verified subscription status
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (accessError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#05080f] p-4 text-slate-100">
        <div className="max-w-md w-full rounded-2xl border border-rose-500/30 bg-[#0d121c] p-6 sm:p-8 text-center shadow-2xl">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-rose-500/40 bg-rose-500/10 text-rose-400 mb-4">
            <AlertCircle className="h-8 w-8" />
          </div>
          <h2 className="font-display text-xl font-black uppercase tracking-tight text-white mb-2">
            Verification Unavailable
          </h2>
          <p className="text-sm text-slate-300 font-body mb-6 leading-relaxed">
            {accessError}
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={verifyAccess}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 py-3 font-display text-xs font-bold uppercase tracking-wider text-black shadow-lg shadow-amber-500/20 hover:brightness-110 transition-all"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Retry Verification
            </button>
            <Link
              href="/dashboard"
              className="flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 py-3 px-4 font-display text-xs font-bold uppercase tracking-wider text-slate-300 hover:bg-white/10 transition-all"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Return
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const hasActiveAccess =
    accessStatus?.hasAccess === true &&
    (secondsRemaining === null || secondsRemaining > 0);

  return (
    <div className="dashboard-root h-screen h-[100dvh] w-full bg-[#05080f] text-slate-100 flex flex-col overflow-hidden">
      {/* Platform Header with Subscription Status */}
      <header className="sticky top-0 z-30 flex-shrink-0 border-b border-white/10 bg-[#070b13]/90 backdrop-blur-xl px-4 py-2.5 sm:px-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
          {/* Left: Brand & Return Navigation */}
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 font-display text-xs font-semibold uppercase tracking-wider text-slate-300 hover:bg-white/10 hover:text-white transition-all"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Member Dashboard</span>
              <span className="sm:hidden">Back</span>
            </Link>

            <div className="h-4 w-px bg-white/10 hidden sm:block" />

            <div className="flex items-center gap-2.5">
              <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full p-0.5 bg-gradient-to-br from-amber-400 via-amber-600 to-amber-950 shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                <img
                  src="/logo.png"
                  alt="Roulette.tools Official Logo"
                  className="h-full w-full rounded-full object-cover"
                />
              </div>
              <div>
                <span className="font-display text-xs sm:text-sm font-black tracking-wider text-white">
                  ROULETTE<span className="text-amber-400">.TOOLS</span>
                </span>
                <span className="hidden md:inline-block ml-2 text-[10px] font-display uppercase tracking-widest text-slate-500">
                  Live Engine
                </span>
              </div>
            </div>
          </div>

          {/* Right: Real-Time Subscription Status Pill */}
          <div className="flex items-center gap-2 sm:gap-3">
            {hasActiveAccess ? (
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-[11px] font-display font-bold uppercase tracking-wider text-emerald-400">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Active:</span>
                  <span>{accessStatus?.planName || 'VIP Pass Active'}</span>
                </div>

                {formatRemaining() && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-300 bg-slate-900/80 border border-amber-500/30 rounded-full px-2.5 py-1 font-mono shadow-sm">
                    <Clock className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                    <span className="font-semibold text-amber-300">{formatRemaining()}</span>
                    {accessStatus?.expiresAtFormatted && (
                      <span className="text-slate-500 hidden sm:inline text-[11px]">({accessStatus.expiresAtFormatted})</span>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-[11px] font-display font-bold uppercase tracking-wider text-amber-400">
                  <Lock className="h-3.5 w-3.5" />
                  <span>Access Locked</span>
                </div>
                <Link
                  href="/plans"
                  className="rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 px-3 py-1.5 font-display text-[11px] font-black uppercase tracking-wider text-black hover:brightness-110 transition-all shadow-sm"
                >
                  Upgrade
                </Link>
              </div>
            )}

            <button
              onClick={handleRefresh}
              title="Refresh access & tool"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container taking 100% of viewport below header */}
      <main className="flex-1 relative w-full h-full min-h-0 overflow-hidden">
        <AnimatePresence mode="wait">
          {!hasActiveAccess ? (
            /* Animated Premium Lock for Inactive/Expired/Revoked Users */
            <motion.div
              key="locked"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-20 overflow-y-auto"
            >
              <PremiumLockOverlay
                accessStatus={accessStatus}
                onRefreshAccess={verifyAccess}
              />
            </motion.div>
          ) : (
            /* Authenticated Sandboxed Tool Execution with Guaranteed 100% Full Viewport Coverage */
            <motion.div
              key="unlocked"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="absolute inset-0 w-full h-full flex flex-col bg-[#05090f] overflow-hidden"
            >
              {/* Optional loader while iframe initializes */}
              {!iframeLoaded && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#05090f] text-slate-400">
                  <div className="h-10 w-10 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent mb-3" />
                  <p className="font-display text-xs uppercase tracking-widest text-slate-500">
                    Initializing Real-Time Stream...
                  </p>
                </div>
              )}

              {/* Dynamic Sandboxed Tool Execution with Guaranteed Instant Updates */}
              <iframe
                key={toolKey}
                src={`/api/roulette-tool?v=${toolKey}`}
                title="Roulette Prediction Engine"
                className="w-full h-full flex-1 border-0 block"
                style={{
                  width: '100%',
                  height: '100%',
                  minHeight: '100%',
                  display: 'block',
                  border: 'none'
                }}
                allow="fullscreen"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
                onLoad={() => setIframeLoaded(true)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
