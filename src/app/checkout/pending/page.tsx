'use client';

import React, { useEffect, useState, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Navbar } from '../../../components/Navbar';
import { Footer } from '../../../components/Footer';
import { authClient, OrderDetails } from '../../../lib/auth-client';
import { formatCentsToUsd } from '../../../shared/plans';
import {
  Clock,
  Sparkles,
  ShieldAlert,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  RefreshCw,
  Terminal,
  Activity,
  AlertTriangle
} from 'lucide-react';

function PendingCheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrder = useCallback(async (isBackground = false) => {
    if (!orderId) {
      setError('No Order ID was supplied.');
      setLoading(false);
      return;
    }

    if (isBackground) setRefreshing(true);
    else setLoading(true);

    try {
      const data = await authClient.getOrder(orderId);
      setOrder(data);
      setError(null);
    } catch (err: any) {
      setError(err?.message || 'Could not retrieve order details.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchOrder();

    // Auto-poll status every 6 seconds if waiting or confirming
    const interval = setInterval(() => {
      if (order && (order.status === 'WAITING' || order.status === 'CONFIRMING' || order.status === 'SENDING')) {
        fetchOrder(true);
      }
    }, 6000);

    return () => clearInterval(interval);
  }, [fetchOrder, order?.status]);

  const isConfirmed = order?.status === 'FINISHED' || order?.status === 'CONFIRMED';
  const isFailed = order?.status === 'FAILED' || order?.status === 'EXPIRED';
  const isReview = order?.status === 'PARTIALLY_PAID' || order?.status === 'REVIEW_REQUIRED';

  return (
    <div className="min-h-screen bg-[#06080d] text-slate-100 flex flex-col selection:bg-amber-500 selection:text-black">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-xl rounded-2xl border border-white/10 bg-[#0c1017]/90 p-6 sm:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
          {/* Ambient glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-[90px] pointer-events-none" />

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
              <p className="font-display text-xs uppercase tracking-widest text-slate-400">
                Fetching Order Status...
              </p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="h-12 w-12 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto mb-4 text-red-400">
                <ShieldAlert className="h-6 w-6" />
              </div>
              <h1 className="font-display text-xl font-bold uppercase text-white mb-2">
                Order Verification Error
              </h1>
              <p className="text-sm text-slate-400 mb-6">{error}</p>
              <Link
                href="/plans"
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-2.5 font-display text-xs font-bold uppercase tracking-wider text-white hover:bg-white/10"
              >
                Return to Plans
              </Link>
            </div>
          ) : order ? (
            <div>
              {/* Header Status */}
              <div className="text-center mb-8">
                {isConfirmed ? (
                  <>
                    <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-4 py-1.5 mb-4 text-xs font-bold text-emerald-400 font-display uppercase tracking-widest">
                      <CheckCircle2 className="h-4 w-4" />
                      PAYMENT CONFIRMED — ACCESS UNLOCKED
                    </div>
                    <h1 className="font-display text-2xl sm:text-3xl font-black uppercase text-white mb-2">
                      Subscription Successfully Activated!
                    </h1>
                    <p className="text-xs text-slate-400 max-w-md mx-auto">
                      Your crypto payment has cleared on the blockchain. You now have full access to live European Roulette prediction feeds.
                    </p>
                  </>
                ) : isReview ? (
                  <>
                    <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-amber-500/10 px-4 py-1.5 mb-4 text-xs font-bold text-amber-400 font-display uppercase tracking-widest">
                      <AlertTriangle className="h-4 w-4" />
                      UNDERPAYMENT / REVIEW REQUIRED
                    </div>
                    <h1 className="font-display text-2xl sm:text-3xl font-black uppercase text-white mb-2">
                      Manual Review Required
                    </h1>
                    <p className="text-xs text-slate-400 max-w-md mx-auto">
                      A partial payment or unexpected amount was detected. Please contact support or complete the remaining balance.
                    </p>
                  </>
                ) : isFailed ? (
                  <>
                    <div className="inline-flex items-center gap-2 rounded-full border border-rose-500/40 bg-rose-500/10 px-4 py-1.5 mb-4 text-xs font-bold text-rose-400 font-display uppercase tracking-widest">
                      <ShieldAlert className="h-4 w-4" />
                      PAYMENT {order.status}
                    </div>
                    <h1 className="font-display text-2xl sm:text-3xl font-black uppercase text-white mb-2">
                      Order Cancelled or Expired
                    </h1>
                    <p className="text-xs text-slate-400 max-w-md mx-auto">
                      The payment window expired or the transaction failed on the blockchain.
                    </p>
                  </>
                ) : (
                  <>
                    <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 mb-4 text-xs font-bold text-amber-400 font-display uppercase tracking-widest">
                      <Clock className="h-3.5 w-3.5 animate-pulse" />
                      PAYMENT CONFIRMATION PENDING
                    </div>
                    <h1 className="font-display text-2xl sm:text-3xl font-black uppercase text-white mb-2">
                      Order Awaiting Blockchain Clearance
                    </h1>
                    <p className="text-xs text-slate-400 max-w-md mx-auto">
                      Your purchase order is recorded with immutable decimal-safe pricing.
                    </p>
                  </>
                )}
              </div>

              {/* Order Snapshot Card */}
              <div className="rounded-xl border border-white/10 bg-black/40 p-5 space-y-3 font-mono text-xs mb-6">
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <span className="text-slate-400">Order ID:</span>
                  <span className="text-white font-bold">{order.orderId}</span>
                </div>
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <span className="text-slate-400">Selected Plan:</span>
                  <span className="text-amber-400 font-bold">{order.planName}</span>
                </div>
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <span className="text-slate-400">Amount Due:</span>
                  <span className="text-emerald-400 font-bold">
                    {formatCentsToUsd(order.priceCents || order.priceUsd * 100)} USD
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <span className="text-slate-400">Duration:</span>
                  <span className="text-slate-300">
                    {order.duration
                      ? `${order.duration.value} ${order.duration.unit.toLowerCase()}`
                      : `${order.durationDays} days`}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Payment Status:</span>
                  <div className="flex items-center gap-2">
                    <span className={`rounded px-2.5 py-0.5 text-[10px] font-bold border ${
                      isConfirmed
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                        : isFailed
                        ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                        : isReview
                        ? 'bg-purple-500/20 text-purple-400 border-purple-500/30'
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                    }`}>
                      {order.status}
                    </span>
                    <button
                      onClick={() => fetchOrder(true)}
                      disabled={refreshing}
                      title="Refresh status"
                      className="p-1 text-slate-400 hover:text-white transition-colors"
                    >
                      <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin text-amber-400' : ''}`} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Lifecycle Policy Notice */}
              {!isConfirmed && (
                <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-xs text-slate-400 leading-relaxed mb-6">
                  <div className="flex items-center gap-1.5 font-display font-bold text-amber-400 uppercase tracking-wider mb-1">
                    <Activity className="h-3.5 w-3.5" />
                    Lifecycle Policy Notice
                  </div>
                  Subscriptions are not activated merely by visiting this confirmation screen. Tool activation occurs strictly after complete blockchain confirmation and signed NOWPayments IPN verification.
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3">
                {isConfirmed ? (
                  <>
                    <Link
                      href="/dashboard/tool"
                      className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-emerald-500/50 bg-gradient-to-r from-emerald-500 to-emerald-600 py-3.5 font-display text-xs font-black uppercase tracking-wider text-black shadow-lg shadow-emerald-500/20 hover:brightness-110 active:scale-95"
                    >
                      <Terminal className="h-4 w-4" />
                      Open Prediction Tool
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                    <Link
                      href="/dashboard"
                      className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-3.5 font-display text-xs font-bold uppercase tracking-wider text-slate-300 hover:bg-white/10"
                    >
                      Member Dashboard
                    </Link>
                  </>
                ) : isFailed ? (
                  <>
                    <Link
                      href="/plans"
                      className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-amber-500/50 bg-gradient-to-r from-amber-500 to-amber-600 py-3 font-display text-xs font-black uppercase tracking-wider text-black shadow-lg shadow-amber-500/20 hover:brightness-110"
                    >
                      Choose a Plan
                    </Link>
                    <Link
                      href="/dashboard"
                      className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-3 font-display text-xs font-bold uppercase tracking-wider text-slate-300 hover:bg-white/10"
                    >
                      Member Dashboard
                    </Link>
                  </>
                ) : (
                  <>
                    {order.checkoutUrl && order.checkoutUrl.startsWith('http') && !order.checkoutUrl.includes('localhost') && (
                      <a
                        href={order.checkoutUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-amber-500/50 bg-gradient-to-r from-amber-500 to-amber-600 py-3 font-display text-xs font-black uppercase tracking-wider text-black shadow-lg shadow-amber-500/20 hover:brightness-110 active:scale-95"
                      >
                        Open Crypto Checkout
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                    <Link
                      href="/dashboard"
                      className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-3 font-display text-xs font-bold uppercase tracking-wider text-slate-300 hover:bg-white/10"
                    >
                      Go to Member Dashboard
                    </Link>
                  </>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function PendingCheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#06080d]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
      </div>
    }>
      <PendingCheckoutContent />
    </Suspense>
  );
}
