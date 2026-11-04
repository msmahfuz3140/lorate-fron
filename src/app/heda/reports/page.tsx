'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { authClient } from '../../../lib/auth-client';
import {
  BarChart3,
  DollarSign,
  TrendingUp,
  CreditCard,
  Download,
  Calendar,
  Filter,
  Users,
  ShieldAlert,
  AlertTriangle,
  RefreshCw,
  CheckCircle2,
  FileSpreadsheet,
  PieChart,
  ArrowUpRight,
  Info,
  Clock,
  Share2,
  FileCheck2
} from 'lucide-react';

export default function AdminReportsPage() {
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [planFilter, setPlanFilter] = useState('');
  const [downloadingType, setDownloadingType] = useState<string | null>(null);

  const fetchSummary = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await authClient.getReportsSummary({
        startDate: startDate || undefined,
        endDate: endDate || undefined
      });
      setSummary(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to aggregate administrative report data.');
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  const handleExportCsv = async (reportType: string) => {
    setDownloadingType(reportType);
    try {
      const token = typeof window !== 'undefined'
        ? (localStorage.getItem('sloot_token') || localStorage.getItem('auth_token'))
        : null;

      const url = authClient.getReportExportUrl(reportType, {
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        planId: planFilter || undefined
      });

      const res = await fetch(url, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        credentials: 'include'
      });

      if (!res.ok) {
        const errorJson = await res.json().catch(() => null);
        throw new Error(errorJson?.message || 'Failed to export CSV report');
      }

      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `report_${reportType.toLowerCase()}_${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err: any) {
      alert(`Export error: ${err?.message || 'Download failed'}`);
    } finally {
      setDownloadingType(null);
    }
  };

  const handleResetFilters = () => {
    setStartDate('');
    setEndDate('');
    setPlanFilter('');
  };

  const fin = summary?.financials;
  const ops = summary?.operational;

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl sm:text-3xl font-black uppercase tracking-wider text-white">
              Financial & Operational Reports
            </h1>
            <span className="rounded-full border border-amber-500/40 bg-amber-500/10 px-2.5 py-0.5 font-display text-[10px] font-bold uppercase tracking-widest text-amber-400">
              Formula Safe
            </span>
          </div>
          <p className="font-body text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl">
            Authoritative ledgers, non-custodial commission liability tracking, real-time subscriber distributions, and injection-neutralized CSV exports.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchSummary}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 font-display text-xs font-bold uppercase tracking-wider text-slate-300 hover:bg-white/10 hover:text-white transition-all disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Date Range & Parameter Filtering Bar */}
      <div className="rounded-2xl border border-white/10 bg-[#070c16]/80 p-4 sm:p-5 backdrop-blur-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-slate-400 font-display text-xs font-bold uppercase tracking-wider">
              <Calendar className="h-4 w-4 text-amber-400" />
              <span>Date Filter:</span>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                placeholder="Start Date"
                className="rounded-lg border border-white/10 bg-black/40 px-3 py-1.5 font-mono text-xs text-white focus:border-amber-500 focus:outline-none"
              />
              <span className="text-slate-500 text-xs">to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                placeholder="End Date"
                className="rounded-lg border border-white/10 bg-black/40 px-3 py-1.5 font-mono text-xs text-white focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={planFilter}
                onChange={(e) => setPlanFilter(e.target.value)}
                className="rounded-lg border border-white/10 bg-black/40 px-3 py-1.5 font-display text-xs text-slate-300 focus:border-amber-500 focus:outline-none"
              >
                <option value="">All Subscription Plans</option>
                <option value="15-days">15 Days ($150)</option>
                <option value="1-month">1 Month ($200)</option>
                <option value="3-months">3 Months ($450)</option>
                <option value="6-months">6 Months ($700)</option>
                <option value="1-year">1 Year ($1,000)</option>
              </select>
            </div>

            {(startDate || endDate || planFilter) && (
              <button
                onClick={handleResetFilters}
                className="text-xs font-display text-amber-400 hover:text-amber-300 underline uppercase tracking-wider ml-1"
              >
                Clear Filters
              </button>
            )}
          </div>

          {/* Quick CSV Export Group */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-display text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Direct CSV:
            </span>
            <button
              onClick={() => handleExportCsv('SALES')}
              disabled={downloadingType === 'SALES'}
              className="flex items-center gap-1 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 font-display text-xs font-bold uppercase tracking-wider text-amber-400 hover:bg-amber-500/20 transition-all disabled:opacity-50"
            >
              <Download className="h-3 w-3" />
              {downloadingType === 'SALES' ? 'Exporting...' : 'Sales CSV'}
            </button>
            <button
              onClick={() => handleExportCsv('SUBSCRIPTIONS')}
              disabled={downloadingType === 'SUBSCRIPTIONS'}
              className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 font-display text-xs font-bold uppercase tracking-wider text-slate-300 hover:bg-white/10 hover:text-white transition-all disabled:opacity-50"
            >
              <Download className="h-3 w-3" />
              {downloadingType === 'SUBSCRIPTIONS' ? 'Exporting...' : 'Subscriptions CSV'}
            </button>
            <button
              onClick={() => handleExportCsv('MODERATORS')}
              disabled={downloadingType === 'MODERATORS'}
              className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 font-display text-xs font-bold uppercase tracking-wider text-slate-300 hover:bg-white/10 hover:text-white transition-all disabled:opacity-50"
            >
              <Download className="h-3 w-3" />
              {downloadingType === 'MODERATORS' ? 'Exporting...' : 'Moderators CSV'}
            </button>
          </div>
        </div>
      </div>

      {/* Mandatory Accounting Disclaimer Banner */}
      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 sm:p-5 backdrop-blur-md">
        <div className="flex items-start gap-3.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-amber-500/40 bg-amber-500/10 text-amber-400">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-display text-xs font-bold uppercase tracking-wider text-amber-400">
              Strict Accounting Integrity & Non-Custodial Protocol
            </h3>
            <p className="font-body text-xs text-slate-300 mt-1 leading-relaxed">
              Gross sales reflect total verified cryptocurrency purchase volume before transaction processing fees and refunds.
              Gross sales must never be conflated with net profit. Moderator commission liabilities are tracking balances only;
              they are not recorded as payments already made. The platform operates with zero automated or manual withdrawal functionality.
            </p>
          </div>
        </div>
      </div>

      {loading && !summary ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
          <p className="font-display text-xs uppercase tracking-widest text-slate-400">
            Aggregating authoritative financial and subscriber ledgers...
          </p>
        </div>
      ) : error ? (
        <div className="py-16 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-400 mb-3">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <h2 className="font-display text-xl font-bold uppercase text-white mb-2">Report Error</h2>
          <p className="text-sm text-slate-400 mb-4">{error}</p>
          <button
            onClick={fetchSummary}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 font-display text-xs font-bold uppercase tracking-wider text-slate-200 hover:bg-white/10"
          >
            Retry Aggregation
          </button>
        </div>
      ) : (
        <>
          {/* Section 1: Financial Definitions & Ledgers */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-amber-400" />
                <h2 className="font-display text-lg font-black uppercase tracking-wider text-white">
                  1. Financial Ledger Breakdown
                </h2>
              </div>
              <span className="font-mono text-xs text-slate-500">
                Authoritative Database Reconciled
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Gross Sales */}
              <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-[#0e1626]/90 to-[#070b14]/90 p-5 shadow-lg">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="font-display text-xs font-bold uppercase tracking-wider">Gross Sales</span>
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30">
                    <TrendingUp className="h-4 w-4" />
                  </div>
                </div>
                <div className="font-display text-2xl sm:text-3xl font-black text-white">
                  ${fin?.grossSalesUsd?.toFixed(2) || '0.00'}
                </div>
                <p className="text-[11px] text-slate-400 mt-2">
                  Total incoming cryptocurrency volume from confirmed purchase orders.
                </p>
              </div>

              {/* Refunds & Chargebacks */}
              <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-[#0e1626]/90 to-[#070b14]/90 p-5 shadow-lg">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="font-display text-xs font-bold uppercase tracking-wider">Refunds</span>
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/30">
                    <AlertTriangle className="h-4 w-4" />
                  </div>
                </div>
                <div className="font-display text-2xl sm:text-3xl font-black text-rose-400">
                  -${fin?.refundsUsd?.toFixed(2) || '0.00'}
                </div>
                <p className="text-[11px] text-slate-400 mt-2">
                  Total refunded volume reversed via manual admin procedures.
                </p>
              </div>

              {/* Payment Processor Fees */}
              <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-[#0e1626]/90 to-[#070b14]/90 p-5 shadow-lg">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="font-display text-xs font-bold uppercase tracking-wider">Processor Fees (Est.)</span>
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-500/10 text-slate-300 border border-white/10">
                    <CreditCard className="h-4 w-4" />
                  </div>
                </div>
                <div className="font-display text-2xl sm:text-3xl font-black text-slate-300">
                  -${fin?.estimatedPaymentFeesUsd?.toFixed(2) || '0.00'}
                </div>
                <p className="text-[11px] text-slate-400 mt-2">
                  Estimated merchant and blockchain settlement fees (~1.0%).
                </p>
              </div>

              {/* Net Revenue */}
              <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-b from-emerald-500/10 via-[#070b14]/90 to-[#070b14]/90 p-5 shadow-lg">
                <div className="flex items-center justify-between text-emerald-400 mb-2">
                  <span className="font-display text-xs font-bold uppercase tracking-wider">Net Revenue</span>
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                </div>
                <div className="font-display text-2xl sm:text-3xl font-black text-emerald-400">
                  ${fin?.netRevenueUsd?.toFixed(2) || '0.00'}
                </div>
                <p className="text-[11px] text-slate-400 mt-2">
                  Gross Sales minus direct refunds and merchant processing fees.
                </p>
              </div>
            </div>

            {/* Non-Custodial Commission Liabilities Row */}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-2xl border border-white/10 bg-[#070c16]/70 p-4">
                <span className="font-display text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Pending Commission Liabilities
                </span>
                <div className="font-display text-xl font-bold text-amber-400 mt-1">
                  ${fin?.pendingCommissionLiabilitiesUsd?.toFixed(2) || '0.00'}
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  Referred sales under active cooling-off / fraud hold period.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#070c16]/70 p-4">
                <span className="font-display text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Approved Commission Liabilities
                </span>
                <div className="font-display text-xl font-bold text-emerald-400 mt-1">
                  ${fin?.approvedCommissionLiabilitiesUsd?.toFixed(2) || '0.00'}
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  Verified commission claims owed to moderators (Not disbursements).
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#070c16]/70 p-4">
                <span className="font-display text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Operating Expenses & Net Profit
                </span>
                <div className="font-display text-xs font-mono font-bold text-slate-400 mt-2">
                  {fin?.netProfitUsd !== null && fin?.netProfitUsd !== undefined
                    ? `$${fin.netProfitUsd.toFixed(2)}`
                    : 'Requires Off-Chain Operational Input'}
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  Operating costs (servers, data feeds) require explicit input before calculating net profit.
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: Platform Operational Volume */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Users className="h-5 w-5 text-amber-400" />
              <h2 className="font-display text-lg font-black uppercase tracking-wider text-white">
                2. Operational & Subscription Metrics
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="rounded-xl border border-white/10 bg-[#070c16]/80 p-4 text-center">
                <span className="font-display text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                  Registered Users
                </span>
                <span className="font-display text-2xl font-black text-white mt-1 block">
                  {ops?.totalUsersRegistered || 0}
                </span>
              </div>

              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-center">
                <span className="font-display text-[10px] uppercase font-bold tracking-wider text-emerald-400 block">
                  Active Subs
                </span>
                <span className="font-display text-2xl font-black text-emerald-400 mt-1 block">
                  {ops?.activeSubscriptionsCount || 0}
                </span>
              </div>

              <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-center">
                <span className="font-display text-[10px] uppercase font-bold tracking-wider text-amber-400 block">
                  Expired Subs
                </span>
                <span className="font-display text-2xl font-black text-amber-400 mt-1 block">
                  {ops?.expiredSubscriptionsCount || 0}
                </span>
              </div>

              <div className="rounded-xl border border-white/10 bg-[#070c16]/80 p-4 text-center">
                <span className="font-display text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                  Confirmed Orders
                </span>
                <span className="font-display text-2xl font-black text-white mt-1 block">
                  {ops?.confirmedOrdersCount || 0}
                </span>
              </div>

              <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-4 text-center">
                <span className="font-display text-[10px] uppercase font-bold tracking-wider text-rose-400 block">
                  Failed Orders
                </span>
                <span className="font-display text-2xl font-black text-rose-400 mt-1 block">
                  {ops?.failedOrdersCount || 0}
                </span>
              </div>

              <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-4 text-center">
                <span className="font-display text-[10px] uppercase font-bold tracking-wider text-purple-400 block">
                  Referral Sales
                </span>
                <span className="font-display text-2xl font-black text-purple-400 mt-1 block">
                  {ops?.referralSalesCount || 0}
                </span>
                <span className="font-mono text-[10px] text-slate-400 block mt-0.5">
                  (${ops?.referralSalesVolumeUsd?.toFixed(0) || '0'})
                </span>
              </div>
            </div>
          </div>

          {/* Section 3: Plan Distribution Breakdown */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <PieChart className="h-5 w-5 text-amber-400" />
              <h2 className="font-display text-lg font-black uppercase tracking-wider text-white">
                3. Subscription Plan Distribution
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              {[
                { id: '15-days', label: '15 Days', price: '$150' },
                { id: '1-month', label: '1 Month', price: '$200' },
                { id: '3-months', label: '3 Months', price: '$450' },
                { id: '6-months', label: '6 Months', price: '$700' },
                { id: '1-year', label: '1 Year', price: '$1,000' }
              ].map((tier) => {
                const count = ops?.planDistribution?.[tier.id] || 0;
                const totalActive = ops?.activeSubscriptionsCount || 1;
                const percentage = totalActive > 0 ? ((count / totalActive) * 100).toFixed(0) : '0';

                return (
                  <div
                    key={tier.id}
                    className="rounded-2xl border border-white/10 bg-gradient-to-b from-[#0d1424] to-[#070b14] p-4 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-display text-xs font-bold uppercase tracking-wider text-white">
                          {tier.label}
                        </span>
                        <span className="font-mono text-xs text-amber-400 font-bold">
                          {tier.price}
                        </span>
                      </div>
                      <div className="font-display text-2xl font-black text-white mt-3">
                        {count} <span className="text-xs font-normal text-slate-400">subs</span>
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="flex justify-between text-[10px] font-mono text-slate-400 mb-1">
                        <span>Share</span>
                        <span>{percentage}%</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-500"
                          style={{ width: `${Math.min(100, Math.max(0, Number(percentage)))}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 4: Top Moderator Referral Performance */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Share2 className="h-5 w-5 text-amber-400" />
                <h2 className="font-display text-lg font-black uppercase tracking-wider text-white">
                  4. Moderator Referral Performance
                </h2>
              </div>
              <button
                onClick={() => handleExportCsv('MODERATORS')}
                disabled={downloadingType === 'MODERATORS'}
                className="flex items-center gap-1.5 text-xs font-display font-bold uppercase tracking-wider text-amber-400 hover:text-amber-300"
              >
                <Download className="h-3.5 w-3.5" />
                Export Partner Data
              </button>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#070c16]/80 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-body text-slate-300">
                  <thead className="border-b border-white/10 bg-white/[0.02] text-[10px] font-display font-bold uppercase tracking-wider text-slate-400">
                    <tr>
                      <th className="px-4 py-3">Partner / Moderator</th>
                      <th className="px-4 py-3">Referral Code</th>
                      <th className="px-4 py-3 text-center">Paid Referrals</th>
                      <th className="px-4 py-3 text-right">Sales Volume</th>
                      <th className="px-4 py-3 text-right">Pending Liability</th>
                      <th className="px-4 py-3 text-right">Approved Liability</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-mono">
                    {ops?.topModerators && ops.topModerators.length > 0 ? (
                      ops.topModerators.map((mod: any) => (
                        <tr key={mod.moderatorId} className="hover:bg-white/[0.02] transition-colors">
                          <td className="px-4 py-3 font-display">
                            <div className="font-bold text-white text-xs">{mod.name}</div>
                            <div className="text-[11px] font-mono text-slate-500">{mod.email}</div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="rounded bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 text-amber-400 font-bold">
                              {mod.code || 'N/A'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center text-white font-bold">
                            {mod.referralCount || 0}
                          </td>
                          <td className="px-4 py-3 text-right font-bold text-emerald-400">
                            ${mod.salesVolumeUsd?.toFixed(2) || '0.00'}
                          </td>
                          <td className="px-4 py-3 text-right text-amber-400">
                            ${mod.pendingCommissionUsd?.toFixed(2) || '0.00'}
                          </td>
                          <td className="px-4 py-3 text-right text-emerald-400 font-bold">
                            ${mod.approvedCommissionUsd?.toFixed(2) || '0.00'}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-slate-500 font-display text-xs uppercase tracking-wider">
                          No active moderator referral data in selected range.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Section 5: Direct CSV Export Hub */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <FileSpreadsheet className="h-5 w-5 text-amber-400" />
              <h2 className="font-display text-lg font-black uppercase tracking-wider text-white">
                5. Secure Spreadsheet Export Hub
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Sales Export */}
              <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-[#0c1220] to-[#070b14] p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-display text-xs font-bold uppercase tracking-wider text-white">
                      Confirmed Sales Ledger
                    </span>
                    <span className="rounded bg-amber-500/10 px-2 py-0.5 text-[9px] font-mono text-amber-400 uppercase">
                      Financial
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-body leading-relaxed">
                    Complete transaction logs with provider payment IDs, immutable snapshot rates, order status, and customer identifiers.
                  </p>
                </div>
                <button
                  onClick={() => handleExportCsv('SALES')}
                  disabled={downloadingType === 'SALES'}
                  className="mt-4 flex items-center justify-center gap-1.5 rounded-xl border border-amber-500/40 bg-amber-500/10 py-2.5 px-4 font-display text-xs font-bold uppercase tracking-wider text-amber-400 hover:bg-amber-500/20 transition-all disabled:opacity-50"
                >
                  <Download className="h-3.5 w-3.5" />
                  {downloadingType === 'SALES' ? 'Downloading...' : 'Export Sales CSV'}
                </button>
              </div>

              {/* Subscriptions Export */}
              <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-[#0c1220] to-[#070b14] p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-display text-xs font-bold uppercase tracking-wider text-white">
                      Subscriptions Audit
                    </span>
                    <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[9px] font-mono text-emerald-400 uppercase">
                      Access
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-body leading-relaxed">
                    Comprehensive ledger of active, expired, and revoked subscription records with precise start and expiry timestamps.
                  </p>
                </div>
                <button
                  onClick={() => handleExportCsv('SUBSCRIPTIONS')}
                  disabled={downloadingType === 'SUBSCRIPTIONS'}
                  className="mt-4 flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 py-2.5 px-4 font-display text-xs font-bold uppercase tracking-wider text-slate-200 hover:bg-white/10 transition-all disabled:opacity-50"
                >
                  <Download className="h-3.5 w-3.5" />
                  {downloadingType === 'SUBSCRIPTIONS' ? 'Downloading...' : 'Export Subscriptions CSV'}
                </button>
              </div>

              {/* Activity Logs Export */}
              <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-[#0c1220] to-[#070b14] p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-display text-xs font-bold uppercase tracking-wider text-white">
                      Administrative Activity Logs
                    </span>
                    <span className="rounded bg-purple-500/10 px-2 py-0.5 text-[9px] font-mono text-purple-400 uppercase">
                      Security
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-body leading-relaxed">
                    Searchable audit trail of admin actions, moderator assignments, permission grants, and security events.
                  </p>
                </div>
                <button
                  onClick={() => handleExportCsv('ACTIVITY')}
                  disabled={downloadingType === 'ACTIVITY'}
                  className="mt-4 flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 py-2.5 px-4 font-display text-xs font-bold uppercase tracking-wider text-slate-200 hover:bg-white/10 transition-all disabled:opacity-50"
                >
                  <Download className="h-3.5 w-3.5" />
                  {downloadingType === 'ACTIVITY' ? 'Downloading...' : 'Export Activity CSV'}
                </button>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2 rounded-xl border border-white/5 bg-white/[0.02] p-3 text-[11px] font-mono text-slate-500">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>Spreadsheet formula injection neutralized. Passwords, session tokens, and cryptographic secrets are strictly omitted.</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
