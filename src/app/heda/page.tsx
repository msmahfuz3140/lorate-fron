'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { authClient } from '../../lib/auth-client';
import { formatCentsToUsd } from '../../shared/plans';
import {
  Users,
  UserCheck,
  UserX,
  CreditCard,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  History,
  Clock,
  Sparkles,
  RefreshCw,
  PieChart,
  ShieldCheck,
  Activity,
  ArrowRight
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await authClient.getAdminDashboardMetrics();
      setMetrics(data);
    } catch (err: any) {
      setError(err?.message || 'Could not load administrative metrics.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-3">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
        <p className="font-display text-xs uppercase tracking-widest text-slate-400">
          Aggregating Platform Telemetry & Ledgers...
        </p>
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <div className="py-16 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-400 mb-3">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <h2 className="font-display text-xl font-bold uppercase text-white mb-2">Metrics Unavailable</h2>
        <p className="text-sm text-slate-400 mb-4">{error}</p>
        <button
          onClick={fetchMetrics}
          className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 font-display text-xs font-bold uppercase tracking-wider text-slate-200 hover:bg-white/10"
        >
          Retry
        </button>
      </div>
    );
  }

  const fin = metrics.financials;

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Title & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
            Main Admin Command Center
          </h1>
          <p className="font-display text-xs uppercase tracking-wider text-slate-400 mt-1">
            Real-time platform telemetry, user control, and non-custodial financial accounting
          </p>
        </div>

        <button
          onClick={fetchMetrics}
          className="self-start sm:self-auto flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 font-display text-xs font-semibold uppercase tracking-wider text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh Metrics
        </button>
      </div>

      {/* Section 1: Non-Custodial Financial Ledger (Explicitly Not Labeled Profit) */}
      <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-b from-[#111624] via-[#090e18] to-[#05080f] p-6 shadow-xl relative overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-amber-400" />
            <h2 className="font-display text-sm font-black uppercase tracking-wider text-white">
              Financial Accounting & Revenue Breakdown
            </h2>
          </div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500">
            Immutable Blockchain Ledger
          </span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="rounded-xl border border-white/10 bg-black/40 p-4">
            <p className="font-display text-[10px] uppercase tracking-widest text-slate-400">
              Gross Subscription Sales
            </p>
            <p className="mt-1 font-display text-2xl font-black text-white">
              ${fin.grossSalesUsd.toLocaleString()}
            </p>
            <p className="text-[10px] text-slate-500 mt-1 font-mono">
              {metrics.confirmedPaymentCount} confirmed orders
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-black/40 p-4">
            <p className="font-display text-[10px] uppercase tracking-widest text-slate-400">
              Refunds Settled
            </p>
            <p className="mt-1 font-display text-2xl font-black text-rose-400">
              ${fin.refundsUsd.toLocaleString()}
            </p>
            <p className="text-[10px] text-slate-500 mt-1 font-mono">
              Reversals & refunds
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-black/40 p-4">
            <p className="font-display text-[10px] uppercase tracking-widest text-slate-400">
              Est. Gateway Fees
            </p>
            <p className="mt-1 font-display text-2xl font-black text-slate-300">
              ${fin.estimatedPaymentFeesUsd.toLocaleString()}
            </p>
            <p className="text-[10px] text-slate-500 mt-1 font-mono">
              ~1% network / NOWPayments
            </p>
          </div>

          <div className="rounded-xl border border-purple-500/30 bg-purple-500/10 p-4">
            <p className="font-display text-[10px] uppercase tracking-widest text-purple-300">
              Commission Liabilities
            </p>
            <p className="mt-1 font-display text-2xl font-black text-purple-400">
              ${fin.outstandingCommissionLiabilitiesUsd.toLocaleString()}
            </p>
            <p className="text-[10px] text-purple-300/60 mt-1 font-mono">
              50% moderator partner pool
            </p>
          </div>

          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 col-span-2 lg:col-span-1">
            <p className="font-display text-[10px] uppercase tracking-widest text-emerald-400">
              Net Platform Revenue
            </p>
            <p className="mt-1 font-display text-2xl font-black text-emerald-400">
              ${fin.netRevenueUsd.toLocaleString()}
            </p>
            <p className="text-[10px] text-emerald-300/60 mt-1 font-mono">
              Gross less fees & liabilities
            </p>
          </div>
        </div>

        {/* Governance Disclaimer */}
        <p className="mt-4 text-[11px] font-mono text-slate-500 border-t border-white/5 pt-3 leading-relaxed">
          <strong>Accounting Notice:</strong> Gross subscription sales represent top-line receipts prior to network processing fees, customer refunds, and affiliate commission liabilities. In strict adherence to financial integrity standards, gross sales are never reported as profit.
        </p>
      </div>

      {/* Section 2: Platform Core Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="rounded-xl border border-white/10 bg-[#090d16] p-4">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="font-display text-[10px] uppercase tracking-wider">Total Users</span>
            <Users className="h-4 w-4" />
          </div>
          <p className="font-display text-2xl font-black text-white">{metrics.totalRegisteredUsers}</p>
        </div>

        <div className="rounded-xl border border-white/10 bg-[#090d16] p-4">
          <div className="flex items-center justify-between text-emerald-400 mb-1">
            <span className="font-display text-[10px] uppercase tracking-wider">Active Users</span>
            <UserCheck className="h-4 w-4" />
          </div>
          <p className="font-display text-2xl font-black text-emerald-400">{metrics.activeUsers}</p>
        </div>

        <div className="rounded-xl border border-white/10 bg-[#090d16] p-4">
          <div className="flex items-center justify-between text-rose-400 mb-1">
            <span className="font-display text-[10px] uppercase tracking-wider">Blocked / Susp.</span>
            <UserX className="h-4 w-4" />
          </div>
          <p className="font-display text-2xl font-black text-rose-400">
            {metrics.blockedUsers + metrics.suspendedUsers}
          </p>
        </div>

        <div className="rounded-xl border border-white/10 bg-[#090d16] p-4">
          <div className="flex items-center justify-between text-amber-400 mb-1">
            <span className="font-display text-[10px] uppercase tracking-wider">Active Subs</span>
            <Sparkles className="h-4 w-4" />
          </div>
          <p className="font-display text-2xl font-black text-amber-400">{metrics.activeSubscriptions}</p>
        </div>

        <div className="rounded-xl border border-white/10 bg-[#090d16] p-4">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="font-display text-[10px] uppercase tracking-wider">Expired Subs</span>
            <Clock className="h-4 w-4" />
          </div>
          <p className="font-display text-2xl font-black text-slate-300">{metrics.expiredSubscriptions}</p>
        </div>

        <div className="rounded-xl border border-white/10 bg-[#090d16] p-4">
          <div className="flex items-center justify-between text-purple-400 mb-1">
            <span className="font-display text-[10px] uppercase tracking-wider">Moderators</span>
            <TrendingUp className="h-4 w-4" />
          </div>
          <p className="font-display text-2xl font-black text-purple-400">{metrics.moderatorsCount}</p>
        </div>
      </div>

      {/* Section 3: Subscription Plan Breakdown & Quick Links */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Plan Distribution */}
        <div className="rounded-2xl border border-white/10 bg-[#090d16] p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <PieChart className="h-4 w-4 text-amber-400" />
              Active Plan Distribution
            </h3>
            <span className="font-display text-[10px] text-slate-500 uppercase tracking-widest">
              Live Subscribers
            </span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            {Object.entries(metrics.planDistribution || {}).map(([planId, count]) => (
              <div key={planId} className="flex items-center justify-between border-b border-white/5 pb-2">
                <span className="text-slate-300">{planId}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-white/5 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-amber-500 h-full rounded-full"
                      style={{
                        width: `${metrics.activeSubscriptions ? (Number(count) / metrics.activeSubscriptions) * 100 : 0}%`
                      }}
                    />
                  </div>
                  <span className="font-bold text-white w-6 text-right">{String(count)}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-white/5">
            <Link
              href="/heda/subscriptions"
              className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 py-2 font-display text-xs font-bold uppercase tracking-wider text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
            >
              Manage Subscriptions <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* Recent Admin Audit Activity */}
        <div className="rounded-2xl border border-white/10 bg-[#090d16] p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <History className="h-4 w-4 text-teal-400" />
              Recent Security & Administrative Actions
            </h3>
            <Link
              href="/heda/audit-logs"
              className="font-display text-[11px] font-bold text-amber-400 uppercase tracking-wider hover:underline"
            >
              View All Logs
            </Link>
          </div>

          <div className="space-y-2.5 overflow-x-auto">
            {metrics.recentAuditActivities.length === 0 ? (
              <p className="text-xs text-slate-500 font-mono py-4">No recent administrative events recorded.</p>
            ) : (
              metrics.recentAuditActivities.slice(0, 7).map((log: any) => (
                <div
                  key={log._id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-white/5 bg-white/[0.02] p-2.5 text-xs font-mono"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="rounded bg-amber-500/10 border border-amber-500/30 px-1.5 py-0.5 text-[10px] font-bold text-amber-300">
                      {log.action}
                    </span>
                    <span className="truncate text-slate-300">{log.reason}</span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 text-slate-500 text-[10px]">
                    <span className="hidden sm:inline">{log.adminEmail}</span>
                    <span>{new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
