'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { authClient } from '../../lib/auth-client';
import { formatCentsToUsd } from '../../shared/plans';
import { useDebounce } from '../../hooks/useDebounce';
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
  ArrowRight,
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Plus,
  Receipt,
  Search,
  Wallet,
  X
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Payout modal
  const [payoutOpen, setPayoutOpen] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState('');
  const [payoutDescription, setPayoutDescription] = useState('');
  const [payoutMethod, setPayoutMethod] = useState('USDT');
  const [payoutReference, setPayoutReference] = useState('');
  const [payoutIdempotencyKey, setPayoutIdempotencyKey] = useState('');
  const [payoutSubmitting, setPayoutSubmitting] = useState(false);
  const [payoutError, setPayoutError] = useState<string | null>(null);
  const [payoutSuccess, setPayoutSuccess] = useState<string | null>(null);

  // Transaction history
  const [transactions, setTransactions] = useState<any[]>([]);
  const [transactionSummary, setTransactionSummary] = useState<any>(null);
  const [transactionLoading, setTransactionLoading] = useState(false);
  const [transactionError, setTransactionError] = useState<string | null>(null);
  const [transactionPage, setTransactionPage] = useState(1);
  const [transactionTotalPages, setTransactionTotalPages] = useState(1);
  const [transactionType, setTransactionType] = useState('ALL');
  const [transactionSearch, setTransactionSearch] = useState('');
  const [transactionStart, setTransactionStart] = useState('');
  const [transactionEnd, setTransactionEnd] = useState('');
  const debouncedTransactionSearch = useDebounce(transactionSearch, 350);

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

  const refreshFinancialsQuietly = useCallback(async () => {
    try {
      const data = await authClient.getAdminDashboardMetrics(true);
      if (data) setMetrics(data);
    } catch {
      // Keep the last successful metrics visible.
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      void refreshFinancialsQuietly();
    }, 30000);
    return () => clearInterval(timer);
  }, [refreshFinancialsQuietly]);

  const fetchTransactions = useCallback(async () => {
    setTransactionLoading(true);
    setTransactionError(null);
    try {
      const result = await authClient.getAdminFinancialTransactions({
        type: transactionType,
        search: debouncedTransactionSearch,
        startDate: transactionStart || undefined,
        endDate: transactionEnd || undefined,
        page: transactionPage,
        limit: 10
      });
      setTransactions(result?.transactions || []);
      setTransactionTotalPages(result?.totalPages || 1);
      setTransactionSummary(result?.summary || null);
    } catch (err: any) {
      setTransactionError(err?.message || 'Could not load transaction history.');
    } finally {
      setTransactionLoading(false);
    }
  }, [
    transactionType,
    debouncedTransactionSearch,
    transactionStart,
    transactionEnd,
    transactionPage
  ]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const openPayoutModal = () => {
    setPayoutAmount('');
    setPayoutDescription('');
    setPayoutMethod('USDT');
    setPayoutReference('');
    setPayoutError(null);
    setPayoutSuccess(null);
    setPayoutIdempotencyKey(
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `payout-${Date.now()}-${Math.random().toString(36).slice(2)}`
    );
    setPayoutOpen(true);
    void refreshFinancialsQuietly();
  };

  const closePayoutModal = () => {
    if (payoutSubmitting) return;
    setPayoutOpen(false);
    setPayoutError(null);
  };

  const handlePayoutSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setPayoutError(null);
    setPayoutSuccess(null);

    const normalized = payoutAmount.trim();
    if (!/^\d+(\.\d{1,2})?$/.test(normalized) || Number(normalized) <= 0) {
      setPayoutError('Enter a valid payout amount greater than zero (max 2 decimal places).');
      return;
    }

    setPayoutSubmitting(true);
    try {
      const result = await authClient.createAdminPayout({
        amountUsd: normalized,
        description: payoutDescription.trim() || 'Manual platform payout',
        method: payoutMethod.trim() || 'MANUAL',
        reference: payoutReference.trim(),
        idempotencyKey: payoutIdempotencyKey
      });

      const amount = Number(normalized).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
      setPayoutSuccess(
        result?.duplicate
          ? `This payout was already recorded as ${result.payout?.transactionId}.`
          : `Payout ${result?.payout?.transactionId || ''} recorded for $${amount}.`
      );
      setPayoutOpen(false);
      setPayoutAmount('');
      setPayoutDescription('');
      setPayoutReference('');
      await Promise.all([refreshFinancialsQuietly(), fetchTransactions()]);
    } catch (err: any) {
      setPayoutError(err?.message || 'Payout could not be recorded.');
    } finally {
      setPayoutSubmitting(false);
    }
  };

  const updateTransactionFilter = (updater: () => void) => {
    setTransactionPage(1);
    updater();
  };

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
  const totalIncomeUsd =
    typeof fin.totalIncomeUsd === 'number' ? fin.totalIncomeUsd : fin.grossSalesUsd || 0;
  const totalPayoutsUsd =
    typeof fin.totalPayoutsUsd === 'number' ? fin.totalPayoutsUsd : 0;
  const currentBalanceUsd =
    typeof fin.currentBalanceUsd === 'number'
      ? fin.currentBalanceUsd
      : totalIncomeUsd - totalPayoutsUsd;
  const payoutCount = fin.completedPayoutCount || 0;
  const money = (value: number) =>
    Number(value || 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });

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

      {payoutSuccess && (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-4 font-mono text-[11px] text-emerald-300">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{payoutSuccess}</span>
          <button
            type="button"
            onClick={() => setPayoutSuccess(null)}
            className="ml-auto rounded-md border border-white/10 bg-white/5 p-1 text-slate-300 hover:text-white"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Section 1: Non-Custodial Financial Ledger (Explicitly Not Labeled Profit) */}
      <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-b from-[#111624] via-[#090e18] to-[#05080f] p-6 shadow-xl relative overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-amber-400" />
            <h2 className="font-display text-sm font-black uppercase tracking-wider text-white">
              Financial Accounting & Revenue Breakdown
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500">
              Immutable Transaction Ledger
            </span>
            <button
              type="button"
              onClick={openPayoutModal}
              className="flex items-center gap-1.5 rounded-lg border border-rose-500/40 bg-rose-500/15 px-3 py-1.5 font-display text-[10px] font-black uppercase tracking-wider text-rose-300 transition-all hover:bg-rose-500/25 active:scale-95"
            >
              <Plus className="h-3.5 w-3.5" />
              PAYOUT
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
          <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/5 p-4">
            <p className="font-display text-[10px] uppercase tracking-widest text-emerald-300/75">
              Total Income
            </p>
            <p className="mt-1 font-display text-2xl font-black text-emerald-300">
              ${money(totalIncomeUsd)}
            </p>
            <p className="mt-1 font-mono text-[10px] text-slate-500">
              Lifetime confirmed · payouts never reduce this
            </p>
          </div>

          <div className={`rounded-xl border p-4 ${
            currentBalanceUsd < 0
              ? 'border-rose-500/35 bg-rose-500/10'
              : 'border-amber-500/25 bg-amber-500/5'
          }`}>
            <p className={`font-display text-[10px] uppercase tracking-widest ${
              currentBalanceUsd < 0 ? 'text-rose-300/80' : 'text-amber-300/80'
            }`}>
              Current Balance
            </p>
            <p className={`mt-1 font-display text-2xl font-black ${
              currentBalanceUsd < 0 ? 'text-rose-400' : 'text-amber-300'
            }`}>
              {currentBalanceUsd < 0 ? '−' : ''}${money(Math.abs(currentBalanceUsd))}
            </p>
            <p className="mt-1 font-mono text-[10px] text-slate-500">
              Income − completed payouts
            </p>
          </div>

          <div className="rounded-xl border border-rose-500/25 bg-rose-500/5 p-4">
            <p className="font-display text-[10px] uppercase tracking-widest text-rose-300/80">
              Total Payouts
            </p>
            <p className="mt-1 font-display text-2xl font-black text-rose-300">
              ${money(totalPayoutsUsd)}
            </p>
            <p className="mt-1 font-mono text-[10px] text-slate-500">
              {payoutCount} completed transaction{payoutCount === 1 ? '' : 's'}
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-black/40 p-4">
            <p className="font-display text-[10px] uppercase tracking-widest text-slate-400">
              Est. Gateway Fees
            </p>
            <p className="mt-1 font-display text-2xl font-black text-slate-300">
              ${money(fin.estimatedPaymentFeesUsd)}
            </p>
            <p className="mt-1 font-mono text-[10px] text-slate-500">
              ~1% network / NOWPayments
            </p>
          </div>

          <div className="rounded-xl border border-purple-500/30 bg-purple-500/10 p-4">
            <p className="font-display text-[10px] uppercase tracking-widest text-purple-300">
              Commission Liabilities
            </p>
            <p className="mt-1 font-display text-2xl font-black text-purple-400">
              ${money(fin.outstandingCommissionLiabilitiesUsd)}
            </p>
            <p className="mt-1 font-mono text-[10px] text-purple-300/60">
              Unreversed partner pool
            </p>
          </div>

          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
            <p className="font-display text-[10px] uppercase tracking-widest text-emerald-400">
              Net Platform Revenue
            </p>
            <p className="mt-1 font-display text-2xl font-black text-emerald-400">
              ${money(fin.netRevenueUsd)}
            </p>
            <p className="mt-1 font-mono text-[10px] text-emerald-300/60">
              Less refunds, fees & liabilities
            </p>
          </div>
        </div>

        {/* Governance Disclaimer */}
        <p className="mt-4 text-[11px] font-mono text-slate-500 border-t border-white/5 pt-3 leading-relaxed">
          <strong>Accounting Notice:</strong> Total Income is lifetime confirmed
          gross income and is never reduced by payouts. Current Balance equals
          Total Income minus completed payouts and may be negative. Gross sales
          are not profit; gateway fees, refunds and affiliate liabilities remain
          separate. Every payout is stored as an immutable transaction with the
          initiating admin, timestamp and running balance.
        </p>
      </div>

      {/* Section 1B: Immutable Transaction & Payout History */}
      <div className="rounded-2xl border border-white/10 bg-[#070c16]/90 p-5 sm:p-6">
        <div className="flex flex-col justify-between gap-3 border-b border-white/5 pb-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <Receipt className="h-4 w-4 text-cyan-400" />
            <div>
              <h2 className="font-display text-sm font-black uppercase tracking-wider text-white">
                Transaction History
              </h2>
              <p className="font-mono text-[10px] text-slate-500">
                Income and completed payouts · newest first · immutable records
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 font-mono text-[10px] text-slate-400">
            <Wallet className="h-3.5 w-3.5 text-amber-400" />
            Current balance:{' '}
            <b className={currentBalanceUsd < 0 ? 'text-rose-400' : 'text-amber-300'}>
              {currentBalanceUsd < 0 ? '−' : ''}${money(Math.abs(currentBalanceUsd))}
            </b>
            <button
              type="button"
              onClick={fetchTransactions}
              disabled={transactionLoading}
              className="ml-2 rounded-md border border-white/10 bg-white/5 p-1.5 text-slate-300 hover:bg-white/10 hover:text-white disabled:opacity-50"
              title="Refresh transaction history"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${transactionLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-2 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
            <input
              value={transactionSearch}
              onChange={(event) =>
                updateTransactionFilter(() => setTransactionSearch(event.target.value))
              }
              placeholder="Search transaction ID or reference…"
              className="w-full rounded-xl border border-white/10 bg-black/40 py-2 pl-9 pr-3 font-mono text-[11px] text-white placeholder:text-slate-600 focus:border-cyan-500/50 focus:outline-none"
            />
          </div>

          <select
            value={transactionType}
            onChange={(event) =>
              updateTransactionFilter(() => setTransactionType(event.target.value))
            }
            className="rounded-xl border border-white/10 bg-black/40 px-3 py-2 font-mono text-[11px] text-white focus:border-cyan-500/50 focus:outline-none"
          >
            <option value="ALL">All types</option>
            <option value="INCOME">Income</option>
            <option value="PAYOUT">Payout</option>
          </select>

          <input
            type="date"
            value={transactionStart}
            onChange={(event) =>
              updateTransactionFilter(() => setTransactionStart(event.target.value))
            }
            className="rounded-xl border border-white/10 bg-black/40 px-3 py-2 font-mono text-[11px] text-white focus:border-cyan-500/50 focus:outline-none"
            aria-label="Start date"
          />
          <input
            type="date"
            value={transactionEnd}
            onChange={(event) =>
              updateTransactionFilter(() => setTransactionEnd(event.target.value))
            }
            className="rounded-xl border border-white/10 bg-black/40 px-3 py-2 font-mono text-[11px] text-white focus:border-cyan-500/50 focus:outline-none"
            aria-label="End date"
          />

          {(transactionSearch || transactionType !== 'ALL' || transactionStart || transactionEnd) && (
            <button
              type="button"
              onClick={() => {
                setTransactionPage(1);
                setTransactionSearch('');
                setTransactionType('ALL');
                setTransactionStart('');
                setTransactionEnd('');
              }}
              className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-2 font-mono text-[10px] font-bold uppercase text-slate-400 hover:text-white"
            >
              Clear
            </button>
          )}
        </div>

        {transactionError && (
          <div className="mt-3 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 font-mono text-[10px] text-rose-300">
            {transactionError}
          </div>
        )}

        <div className="mt-4 overflow-x-auto rounded-xl border border-white/5">
          <table className="w-full min-w-[1120px] border-collapse text-left">
            <thead>
              <tr className="border-b border-white/10 bg-black/40 font-mono text-[9px] uppercase tracking-wider text-slate-500">
                <th className="px-3 py-2.5">Date</th>
                <th className="px-3 py-2.5">Transaction ID</th>
                <th className="px-3 py-2.5">Type</th>
                <th className="px-3 py-2.5 text-right">Amount</th>
                <th className="px-3 py-2.5 text-right">Previous</th>
                <th className="px-3 py-2.5 text-right">New</th>
                <th className="px-3 py-2.5">Description / Reference</th>
                <th className="px-3 py-2.5">Method</th>
                <th className="px-3 py-2.5">Admin</th>
                <th className="px-3 py-2.5">Status</th>
              </tr>
            </thead>
            <tbody>
              {transactionLoading && transactions.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-3 py-10 text-center">
                    <Loader2 className="mx-auto h-5 w-5 animate-spin text-cyan-400" />
                    <p className="mt-2 font-mono text-[10px] text-slate-500">Loading immutable ledger…</p>
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-3 py-10 text-center font-mono text-[10px] text-slate-500">
                    No transactions match the current filters.
                  </td>
                </tr>
              ) : (
                transactions.map((transaction) => {
                  const isPayout = transaction.type === 'PAYOUT';
                  return (
                    <tr
                      key={`${transaction.type}-${transaction.id}`}
                      className="border-b border-white/5 font-mono text-[10px] text-slate-300 last:border-0 hover:bg-white/[0.025]"
                    >
                      <td className="whitespace-nowrap px-3 py-2.5 text-slate-400">
                        {new Date(transaction.createdAt).toLocaleString()}
                      </td>
                      <td className="max-w-[150px] truncate px-3 py-2.5 text-cyan-300" title={transaction.transactionId}>
                        {transaction.transactionId}
                      </td>
                      <td className="px-3 py-2.5">
                        <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-black uppercase ${
                          isPayout
                            ? 'border-rose-500/30 bg-rose-500/10 text-rose-300'
                            : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                        }`}>
                          {isPayout ? <ArrowDownRight className="h-3 w-3" /> : <ArrowUpRight className="h-3 w-3" />}
                          {transaction.type}
                        </span>
                      </td>
                      <td className={`whitespace-nowrap px-3 py-2.5 text-right font-black ${
                        isPayout ? 'text-rose-300' : 'text-emerald-300'
                      }`}>
                        {isPayout ? '−' : '+'}${money(transaction.amountUsd)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-right text-slate-400">
                        {transaction.previousBalanceUsd < 0 ? '−' : ''}${money(Math.abs(transaction.previousBalanceUsd))}
                      </td>
                      <td className={`whitespace-nowrap px-3 py-2.5 text-right font-bold ${
                        transaction.newBalanceUsd < 0 ? 'text-rose-400' : 'text-white'
                      }`}>
                        {transaction.newBalanceUsd < 0 ? '−' : ''}${money(Math.abs(transaction.newBalanceUsd))}
                      </td>
                      <td className="max-w-[260px] px-3 py-2.5">
                        <p className="truncate text-slate-300" title={transaction.description}>{transaction.description}</p>
                        {transaction.reference && (
                          <p className="truncate text-[9px] text-slate-500" title={transaction.reference}>
                            Ref: {transaction.reference}
                          </p>
                        )}
                      </td>
                      <td className="px-3 py-2.5 text-slate-400">{transaction.method}</td>
                      <td className="max-w-[160px] px-3 py-2.5 text-slate-400">
                        <p className="truncate" title={transaction.adminName}>{transaction.adminName}</p>
                        {transaction.adminId && transaction.adminId !== 'system' && (
                          <p className="truncate text-[9px] text-slate-600" title={transaction.adminId}>
                            ID: {transaction.adminId.slice(-8)}
                          </p>
                        )}
                      </td>
                      <td className="px-3 py-2.5">
                        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold uppercase text-emerald-300">
                          <CheckCircle2 className="h-2.5 w-2.5" />
                          {transaction.status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 font-mono text-[10px] text-slate-500">
          <span>
            Page {transactionPage} of {transactionTotalPages}
            {transactionSummary?.totalIncomeCents !== undefined && (
              <>
                {' '}· Income ${money(transactionSummary.totalIncomeUsd)} · Payouts $
                {money(transactionSummary.totalPayoutsUsd)}
              </>
            )}
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setTransactionPage((page) => Math.max(1, page - 1))}
              disabled={transactionPage <= 1 || transactionLoading}
              className="rounded-md border border-white/10 bg-white/5 p-1.5 text-slate-300 hover:bg-white/10 disabled:opacity-40"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setTransactionPage((page) => Math.min(transactionTotalPages, page + 1))}
              disabled={transactionPage >= transactionTotalPages || transactionLoading}
              className="rounded-md border border-white/10 bg-white/5 p-1.5 text-slate-300 hover:bg-white/10 disabled:opacity-40"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
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

      {/* Payout Modal */}
      {payoutOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/85 p-4 backdrop-blur-md">
          <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-rose-500/35 bg-[#080d16] shadow-[0_30px_100px_rgba(0,0,0,0.95)]">
            <div className="flex items-center justify-between border-b border-white/10 bg-rose-500/5 px-5 py-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-rose-500/40 bg-rose-500/15 text-rose-300">
                  <ArrowDownRight className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-display text-sm font-black uppercase tracking-wider text-white">
                    Record Payout
                  </h3>
                  <p className="font-mono text-[10px] text-slate-400">
                    Total Income will not change
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={closePayoutModal}
                disabled={payoutSubmitting}
                className="rounded-lg border border-white/10 bg-white/5 p-1.5 text-slate-300 hover:bg-white/10 hover:text-white disabled:opacity-40"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handlePayoutSubmit} className="space-y-4 p-5">
              <div className="rounded-xl border border-white/10 bg-black/35 p-3">
                <div className="flex items-center justify-between font-mono text-[10px] uppercase text-slate-400">
                  <span>Current Balance</span>
                  <b className={currentBalanceUsd < 0 ? 'text-rose-400' : 'text-amber-300'}>
                    {currentBalanceUsd < 0 ? '−' : ''}${money(Math.abs(currentBalanceUsd))}
                  </b>
                </div>
                <p className="mt-1 font-mono text-[9px] text-slate-500">
                  A payout may exceed this balance; negative balances are allowed and shown correctly.
                </p>
              </div>

              <div>
                <label className="mb-1.5 block font-display text-xs font-bold uppercase tracking-wider text-slate-300">
                  Payout Amount (USD) <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-sm text-slate-400">$</span>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    required
                    value={payoutAmount}
                    onChange={(event) => setPayoutAmount(event.target.value)}
                    placeholder="500.00"
                    className="w-full rounded-xl border border-white/10 bg-black/50 py-2.5 pl-7 pr-3 font-mono text-sm text-white placeholder:text-slate-600 focus:border-rose-500/60 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block font-display text-xs font-bold uppercase tracking-wider text-slate-300">
                    Payout Method
                  </label>
                  <select
                    value={payoutMethod}
                    onChange={(event) => setPayoutMethod(event.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-black/50 px-3 py-2.5 font-mono text-xs text-white focus:border-rose-500/60 focus:outline-none"
                  >
                    <option value="USDT">USDT</option>
                    <option value="BTC">Bitcoin</option>
                    <option value="ETH">Ethereum</option>
                    <option value="BANK">Bank Transfer</option>
                    <option value="MANUAL">Manual / Other</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block font-display text-xs font-bold uppercase tracking-wider text-slate-300">
                    Transaction Reference
                  </label>
                  <input
                    value={payoutReference}
                    onChange={(event) => setPayoutReference(event.target.value)}
                    placeholder="Optional reference"
                    className="w-full rounded-xl border border-white/10 bg-black/50 px-3 py-2.5 font-mono text-xs text-white placeholder:text-slate-600 focus:border-rose-500/60 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block font-display text-xs font-bold uppercase tracking-wider text-slate-300">
                  Description / Note
                </label>
                <textarea
                  rows={2}
                  value={payoutDescription}
                  onChange={(event) => setPayoutDescription(event.target.value)}
                  placeholder="Optional description for the payout record"
                  className="w-full resize-none rounded-xl border border-white/10 bg-black/50 px-3 py-2.5 font-body text-xs text-white placeholder:text-slate-600 focus:border-rose-500/60 focus:outline-none"
                />
              </div>

              {payoutError && (
                <div className="flex items-start gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 font-mono text-[10px] text-rose-300">
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  {payoutError}
                </div>
              )}

              <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2 font-mono text-[9px] leading-relaxed text-amber-200/70">
                Confirming creates an immutable payout transaction, records your
                admin identity, and immediately recalculates the Current Balance.
                Duplicate submissions are prevented with an idempotency key.
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-white/10 pt-4">
                <button
                  type="button"
                  onClick={closePayoutModal}
                  disabled={payoutSubmitting}
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 font-display text-xs font-bold uppercase tracking-wider text-slate-300 hover:bg-white/10 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={payoutSubmitting}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 px-5 py-2.5 font-display text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-rose-500/20 hover:brightness-110 disabled:opacity-50"
                >
                  {payoutSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4" />
                  )}
                  {payoutSubmitting ? 'Recording…' : 'Confirm Payout'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
