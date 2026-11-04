'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { authClient } from '../../lib/auth-client';
import { UserRole } from '../../shared/roles';
import {
  Activity,
  Share2,
  Copy,
  Check,
  TrendingUp,
  DollarSign,
  Users,
  CheckCircle2,
  Clock,
  AlertCircle,
  Shield,
  ArrowRight,
  LogOut,
  Info,
  ExternalLink,
  Percent
} from 'lucide-react';

export default function ModeratorDashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'commissions' | 'customers'>('commissions');
  const [commissions, setCommissions] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [copiedLink, setCopiedLink] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await authClient.getModeratorSelfDashboard();
      setDashboardData(data);
      const commData = await authClient.getModeratorSelfCommissions({ limit: 50 });
      setCommissions(commData.commissions || []);
      const custData = await authClient.getModeratorSelfReferredUsers({ limit: 50 });
      setCustomers(custData.customers || []);
    } catch (err: any) {
      setError(err?.message || 'Failed to load moderator dashboard telemetry');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/golin?redirect=/moredator');
      return;
    }

    if (!isLoading && user && user.role !== UserRole.MODERATOR && user.role !== UserRole.SUPER_ADMIN) {
      router.push('/dashboard');
      return;
    }

    if (isAuthenticated) {
      loadDashboard();
    }
  }, [isAuthenticated, isLoading, user]);

  const handleCopyLink = () => {
    if (!dashboardData?.profile?.referralLink) return;
    navigator.clipboard.writeText(dashboardData.profile.referralLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  if (isLoading || loading) {
    return (
      <div className="dashboard-root min-h-screen bg-[#06080d] flex items-center justify-center text-slate-400">
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
          <span className="font-display text-xs uppercase tracking-wider">Loading Moderator Portal...</span>
        </div>
      </div>
    );
  }

  const profile = dashboardData?.profile;
  const metrics = dashboardData?.metrics;

  return (
    <div className="dashboard-root min-h-screen bg-[#06080d] text-slate-100 flex flex-col">
      {/* Top Header */}
      <header className="sticky top-0 z-40 border-b border-white/5 bg-[#06080d]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full p-0.5 bg-gradient-to-br from-amber-400 via-amber-600 to-amber-950 shadow-[0_0_15px_rgba(245,158,11,0.3)] transition-transform group-hover:scale-105">
              <img
                src="/logo.png"
                alt="Roulette.tools Official Logo"
                className="h-full w-full rounded-full object-cover"
              />
            </div>
            <div>
              <span className="font-display text-base font-black tracking-wider text-white">
                ROULETTE<span className="text-amber-400">.TOOLS</span>
              </span>
              <p className="font-display text-[10px] uppercase tracking-widest text-slate-500">
                Moderator Partner Portal
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 font-display text-xs font-semibold uppercase tracking-wider text-slate-300 hover:bg-white/10 transition-colors"
            >
              Member Dashboard
            </Link>
            <button
              onClick={() => logout().then(() => router.push('/'))}
              className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2 font-display text-xs font-semibold uppercase tracking-wider text-slate-300 hover:bg-white/10 transition-colors"
            >
              <LogOut className="h-3.5 w-3.5 text-slate-400" />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        {/* Welcome & Status Banner */}
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#0c121e] to-[#070b13] p-6 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-md border border-amber-500/40 bg-amber-500/10 px-2.5 py-0.5 font-display text-[11px] font-bold uppercase tracking-wider text-amber-400">
                  Authorized Partner
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  Rate: {((profile?.commissionRate || 0.5) * 100).toFixed(0)}% Revenue Share
                </span>
              </div>
              <h1 className="mt-2 font-display text-2xl font-black text-white uppercase tracking-wider sm:text-3xl">
                Welcome, {profile?.name}
              </h1>
              <p className="mt-1 text-xs text-slate-400 max-w-xl">
                Earn 50% commission on qualifying paid premium subscription purchases made by your referred customers.
              </p>
            </div>

            {/* Referral Link Box */}
            <div className="rounded-xl border border-amber-500/30 bg-black/40 p-4 max-w-md w-full">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                Your Unique Referral Link
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={profile?.referralLink || ''}
                  className="flex-1 rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-xs font-mono text-amber-300 focus:outline-none select-all"
                />
                <button
                  onClick={handleCopyLink}
                  className="flex items-center gap-1.5 rounded-lg border border-amber-500/50 bg-amber-500 px-3.5 py-2 text-xs font-bold uppercase text-black hover:brightness-110 active:scale-95 transition-all"
                >
                  {copiedLink ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  {copiedLink ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Strict Non-Custodial Legal Notice */}
        <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-4 text-xs text-slate-400">
          <Info className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="text-white">Accounting & Transparency Policy:</strong> All commission reporting on this dashboard is strictly for internal accounting, performance tracking, and transparency. The platform operates a non-custodial model with zero withdrawal features. Commission reporting does not imply that a payment has been made.
          </p>
        </div>

        {/* 8 Metric Telemetry Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="rounded-xl border border-white/5 bg-[#0b0f19] p-4">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Referral Registrations
            </span>
            <p className="mt-1 font-display text-2xl font-black text-white">
              {metrics?.referralRegistrations || 0}
            </p>
            <span className="mt-1 block text-[10px] text-slate-500">Accounts registered</span>
          </div>

          <div className="rounded-xl border border-white/5 bg-[#0b0f19] p-4">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Qualified Customers
            </span>
            <p className="mt-1 font-display text-2xl font-black text-white">
              {metrics?.qualifiedCustomers || 0}
            </p>
            <span className="mt-1 block text-[10px] text-slate-500">Paid premium buyers</span>
          </div>

          <div className="rounded-xl border border-white/5 bg-[#0b0f19] p-4">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Attributed Sales
            </span>
            <p className="mt-1 font-display text-2xl font-black text-white">
              {metrics?.successfulAttributedSales || 0}
            </p>
            <span className="mt-1 block text-[10px] text-slate-500">Confirmed orders</span>
          </div>

          <div className="rounded-xl border border-white/5 bg-[#0b0f19] p-4">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Attributed Revenue
            </span>
            <p className="mt-1 font-display text-2xl font-black text-emerald-400">
              ${(metrics?.totalAttributedRevenueUsd || 0).toLocaleString()}
            </p>
            <span className="mt-1 block text-[10px] text-slate-500">Gross sales volume</span>
          </div>

          <div className="rounded-xl border border-white/5 bg-[#0b0f19] p-4">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Pending Commission
            </span>
            <p className="mt-1 font-display text-2xl font-black text-slate-300">
              ${(metrics?.pendingCommissionUsd || 0).toLocaleString()}
            </p>
            <span className="mt-1 block text-[10px] text-slate-500">Settling transactions</span>
          </div>

          <div className="rounded-xl border border-white/5 bg-[#0b0f19] p-4">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Eligible Commission
            </span>
            <p className="mt-1 font-display text-2xl font-black text-slate-300">
              ${(metrics?.eligibleCommissionUsd || 0).toLocaleString()}
            </p>
            <span className="mt-1 block text-[10px] text-slate-500">Confirmed qualified</span>
          </div>

          <div className="rounded-xl border border-white/5 bg-[#0b0f19] p-4">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Approved Commission
            </span>
            <p className="mt-1 font-display text-2xl font-black text-amber-400">
              ${(metrics?.approvedCommissionUsd || 0).toLocaleString()}
            </p>
            <span className="mt-1 block text-[10px] text-slate-500">Total credited earnings</span>
          </div>

          <div className="rounded-xl border border-white/5 bg-[#0b0f19] p-4">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Reversed Commission
            </span>
            <p className="mt-1 font-display text-2xl font-black text-red-400">
              ${(metrics?.reversedCommissionUsd || 0).toLocaleString()}
            </p>
            <span className="mt-1 block text-[10px] text-slate-500">Refunds or disputes</span>
          </div>
        </div>

        {/* Tabs for Detailed History */}
        <div className="rounded-2xl border border-white/5 bg-[#0b0f19] p-5 space-y-4">
          <div className="flex items-center gap-3 border-b border-white/10 pb-3">
            <button
              onClick={() => setActiveTab('commissions')}
              className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 font-display text-xs font-bold uppercase tracking-wider transition-all ${
                activeTab === 'commissions'
                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <DollarSign className="h-3.5 w-3.5" />
              Commission History ({commissions.length})
            </button>
            <button
              onClick={() => setActiveTab('customers')}
              className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 font-display text-xs font-bold uppercase tracking-wider transition-all ${
                activeTab === 'customers'
                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Users className="h-3.5 w-3.5" />
              Referred Customers ({customers.length})
            </button>
          </div>

          {/* Tab 1: Commission History Table */}
          {activeTab === 'commissions' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/5 text-[10px] uppercase tracking-wider text-slate-500">
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Order ID</th>
                    <th className="py-2.5 px-3">Subscription Plan</th>
                    <th className="py-2.5 px-3">Sale Amount</th>
                    <th className="py-2.5 px-3">Rate Snapshot</th>
                    <th className="py-2.5 px-3">Commission Earned</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {commissions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-500">
                        No attributed commission records yet. Share your referral link to earn commissions on subscription purchases.
                      </td>
                    </tr>
                  ) : (
                    commissions.map((c) => (
                      <tr key={c.id} className="hover:bg-white/5 transition-colors">
                        <td className="py-2.5 px-3 text-slate-400">
                          {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-slate-300">
                          {c.orderId}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-white">
                          {c.plan}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-slate-200">
                          ${c.originalPurchaseAmount}
                        </td>
                        <td className="py-2.5 px-3 text-slate-400">
                          {(c.commissionRate * 100).toFixed(0)}%
                        </td>
                        <td className="py-2.5 px-3 font-bold text-amber-400">
                          ${c.amountUsd}
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                              c.status === 'REVERSED'
                                ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                                : c.status === 'PENDING'
                                ? 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            }`}
                          >
                            {c.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Tab 2: Referred Customers Table (Privacy Masked) */}
          {activeTab === 'customers' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/5 text-[10px] uppercase tracking-wider text-slate-500">
                    <th className="py-2.5 px-3">Customer Identifier</th>
                    <th className="py-2.5 px-3">Registration Date</th>
                    <th className="py-2.5 px-3">Premium Status</th>
                    <th className="py-2.5 px-3">Active Tier</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {customers.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-slate-500">
                        No customer registrations recorded under your referral link yet.
                      </td>
                    </tr>
                  ) : (
                    customers.map((cust) => (
                      <tr key={cust.id} className="hover:bg-white/5 transition-colors">
                        <td className="py-2.5 px-3 font-mono text-slate-300">
                          {cust.maskedIdentifier}
                        </td>
                        <td className="py-2.5 px-3 text-slate-400">
                          {cust.registeredAt ? new Date(cust.registeredAt).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                              cust.hasActiveSubscription
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                            }`}
                          >
                            {cust.hasActiveSubscription ? 'Subscribed' : 'Registered'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-white">
                          {cust.subscriptionPlan || '—'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
