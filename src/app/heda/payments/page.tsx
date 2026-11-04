'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { authClient } from '../../../lib/auth-client';
import { useDebounce } from '../../../hooks/useDebounce';
import {
  CreditCard,
  Search,
  Download,
  RefreshCw,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  TrendingUp,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  ArrowUpRight,
  Info
} from 'lucide-react';

interface PaymentOrder {
  _id: string;
  orderId: string;
  orderDescription?: string;
  priceAmountUsd?: number;
  priceAmount?: number;
  priceCurrency: string;
  payAmountCrypto?: number;
  payAmount?: number;
  payCurrency: string;
  paymentStatus?: 'WAITING' | 'CONFIRMING' | 'CONFIRMED' | 'SENDING' | 'PARTIALLY_PAID' | 'FINISHED' | 'FAILED' | 'REFUNDED' | 'EXPIRED';
  status?: string;
  planName?: string;
  userId?: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
  planId: string;
  paymentId?: string;
  payAddress?: string;
  network?: string;
  createdAt: string;
  updatedAt: string;
}

interface FinancialSummary {
  grossSalesUsd?: number;
  totalGrossUsd?: number;
  refundsUsd?: number;
  paymentFeesUsd?: number;
  netRevenueUsd?: number;
  outstandingCommissionLiabilitiesUsd?: number;
  confirmedCount?: number;
  completedOrders?: number;
  pendingCount?: number;
  pendingOrders?: number;
  failedCount?: number;
  failedOrders?: number;
  totalOrders: number;
}

export default function AdminPaymentsPage() {
  const searchParams = useSearchParams();
  const [orders, setOrders] = useState<PaymentOrder[]>([]);
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 350);
  const [isLoading, setIsLoading] = useState(true);
  const [actionError, setActionError] = useState('');

  // Sync with URL query parameters for nested sidebar items
  useEffect(() => {
    const statusParam = searchParams.get('status') || 'ALL';
    setStatusFilter(statusParam);
    setPage(1);
  }, [searchParams]);

  const fetchSummary = useCallback(async () => {
    try {
      const res = await authClient.getAdminOrdersSummary();
      if (res) {
        setSummary(res);
      }
    } catch (err: any) {
      console.error('Failed to load financial summary:', err);
    }
  }, []);

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    setActionError('');
    try {
      const res = await authClient.getAdminOrders({
        page,
        limit: 20,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        search: debouncedSearch.trim() || undefined
      });
      if (res && res.orders) {
        setOrders(res.orders);
        setTotal(res.total || 0);
        setTotalPages(res.totalPages || 1);
      }
    } catch (err: any) {
      setActionError(err.message || 'Failed to load payment orders');
    } finally {
      setIsLoading(false);
    }
  }, [page, statusFilter, debouncedSearch]);

  useEffect(() => {
    fetchSummary();
    fetchOrders();
  }, [fetchSummary, fetchOrders]);

  const handleExportCsv = () => {
    const token = typeof window !== 'undefined'
      ? (localStorage.getItem('sloot_token') || localStorage.getItem('auth_token'))
      : null;
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050/api/v1';
    const tokenParam = token ? `&token=${encodeURIComponent(token)}` : '';
    window.open(`${backendUrl}/payments/admin/export?format=csv${tokenParam}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-black uppercase tracking-wider text-white">
            Payments & Financial Ledger
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Real-time cryptocurrency payment reconciliations, gross sales tracking, and audit-grade export logs.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-200 hover:bg-slate-700 transition-colors shadow-sm"
          >
            <Download className="h-4 w-4 text-amber-400" />
            Export Reconciliation CSV
          </button>
          <button
            onClick={() => {
              fetchSummary();
              fetchOrders();
            }}
            disabled={isLoading}
            className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-3.5 py-2 text-xs font-semibold uppercase tracking-wider text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Financial Health & Accounting Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-800 bg-[#070b14] p-5 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="font-display text-xs font-bold uppercase tracking-wider text-slate-400">
                Gross Subscription Sales
              </span>
              <DollarSign className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="mt-3 text-2xl font-black text-white">
              ${(summary.grossSalesUsd || 0).toLocaleString()}
            </div>
            <div className="mt-1 text-[11px] text-slate-400">
              Total confirmed top-line receipts ({summary.confirmedCount} orders)
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-[#070b14] p-5 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="font-display text-xs font-bold uppercase tracking-wider text-slate-400">
                Payment Fees (1% Est.)
              </span>
              <TrendingUp className="h-4 w-4 text-amber-400" />
            </div>
            <div className="mt-3 text-2xl font-black text-amber-400">
              ${(summary.paymentFeesUsd || 0).toLocaleString()}
            </div>
            <div className="mt-1 text-[11px] text-slate-400">
              NOWPayments blockchain gateway deductions
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-[#070b14] p-5 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="font-display text-xs font-bold uppercase tracking-wider text-slate-400">
                Commission Liabilities (50%)
              </span>
              <AlertTriangle className="h-4 w-4 text-purple-400" />
            </div>
            <div className="mt-3 text-2xl font-black text-purple-400">
              ${(summary.outstandingCommissionLiabilitiesUsd || 0).toLocaleString()}
            </div>
            <div className="mt-1 text-[11px] text-slate-400">
              Moderator referral ledger accrued earnings
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-[#070b14] p-5 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="font-display text-xs font-bold uppercase tracking-wider text-slate-400">
                Platform Net Revenue
              </span>
              <ShieldCheck className="h-4 w-4 text-blue-400" />
            </div>
            <div className="mt-3 text-2xl font-black text-blue-400">
              ${(summary.netRevenueUsd || 0).toLocaleString()}
            </div>
            <div className="mt-1 text-[11px] text-slate-400">
              Gross less fees & moderator liabilities
            </div>
          </div>
        </div>
      )}

      {/* Accounting Compliance Banner */}
      <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-xs text-amber-300 flex items-start gap-3">
        <Info className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
        <div>
          <span className="font-bold uppercase tracking-wider">Accounting Standard Enforced:</span> Gross subscription sales represent top-line receipts prior to payment processing fees, refund debits, and 50% moderator partner commission liabilities. Gross sales are never designated as profit.
        </div>
      </div>

      {actionError && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-300">
          {actionError}
        </div>
      )}

      {/* Quick Status Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: 'ALL', label: 'All Orders' },
          { id: 'FINISHED', label: '✅ Confirmed / Finished' },
          { id: 'WAITING', label: '⏳ Pending Confirmation' },
          { id: 'FAILED', label: '❌ Failed & Expired' },
          { id: 'REFUNDED', label: '🔄 Refunded' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setStatusFilter(tab.id);
              setPage(1);
            }}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all ${
              statusFilter === tab.id
                ? 'border border-amber-500/50 bg-amber-500/15 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                : 'border border-slate-800 bg-[#070b14] text-slate-400 hover:border-slate-700 hover:text-white'
            }`}
          >
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="rounded-2xl border border-slate-800 bg-[#070b14] p-4 shadow-xl">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by order ID, customer email, phone, or payment ID..."
              className="w-full rounded-xl border border-slate-800 bg-slate-900/60 pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-xl border border-slate-800 bg-slate-900/60 px-3.5 py-2.5 text-sm text-slate-300 focus:border-amber-500 focus:outline-none"
            >
              <option value="ALL">All Payment States</option>
              <option value="FINISHED">Confirmed / Finished Only</option>
              <option value="WAITING">Waiting Payment</option>
              <option value="CONFIRMING">Confirming on Blockchain</option>
              <option value="FAILED">Failed Payments</option>
              <option value="REFUNDED">Refunded Payments</option>
              <option value="EXPIRED">Expired Invoices</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-[#070b14] shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="border-b border-slate-800 bg-slate-900/40 font-display text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-4 py-3.5">Order ID & User</th>
                <th className="px-4 py-3.5">Plan Tier</th>
                <th className="px-4 py-3.5">USD Price</th>
                <th className="px-4 py-3.5">Crypto Settlement</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5">Provider Ref</th>
                <th className="px-4 py-3.5 text-right">Created At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
                      <p className="font-display text-xs uppercase tracking-wider text-slate-400">
                        Querying payment ledger...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    No payment orders match the specified criteria.
                  </td>
                </tr>
              ) : (
                orders.map((o) => {
                  const status = o.status || o.paymentStatus || 'WAITING';
                  const isFinished = status === 'FINISHED';
                  const isPending = ['WAITING', 'CONFIRMING', 'SENDING'].includes(status);
                  const isFailed = ['FAILED', 'EXPIRED'].includes(status);
                  const isRefunded = status === 'REFUNDED';
                  const price = o.priceAmount ?? o.priceAmountUsd ?? 0;
                  const payAmount = o.payAmount ?? o.payAmountCrypto;

                  return (
                    <tr key={o._id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-4 py-4">
                        <div className="font-mono text-xs font-semibold text-white">{o.orderId}</div>
                        <div className="text-xs text-slate-400">{o.userId?.email || '—'}</div>
                        {o.userId?.phone && (
                          <div className="text-[11px] font-mono text-emerald-400 mt-0.5">
                            📞 {o.userId.phone}
                          </div>
                        )}
                        <div className="text-[10px] text-slate-500 mt-0.5">{o.userId?.name}</div>
                      </td>

                      <td className="px-4 py-4">
                        <span className="font-display text-xs font-black uppercase text-amber-400">
                          {o.planName || o.planId.replace(/_/g, ' ')}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <div className="text-sm font-bold text-emerald-400">${price}</div>
                        <div className="text-[10px] uppercase text-slate-500">{o.priceCurrency || 'USD'}</div>
                      </td>

                      <td className="px-4 py-4">
                        <div className="text-xs font-mono text-slate-200">
                          {payAmount ? `${payAmount} ` : ''}
                          <span className="uppercase text-amber-400">{o.payCurrency}</span>
                        </div>
                        {o.payAddress && (
                          <div className="text-[10px] font-mono text-slate-500 max-w-[140px] truncate" title={o.payAddress}>
                            Addr: {o.payAddress}
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-4">
                        {isFinished ? (
                          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400 uppercase">
                            <CheckCircle2 className="h-3 w-3" /> Confirmed
                          </span>
                        ) : isPending ? (
                          <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-400 uppercase">
                            <Clock className="h-3 w-3" /> {status}
                          </span>
                        ) : isRefunded ? (
                          <span className="inline-flex items-center gap-1 rounded-full border border-purple-500/30 bg-purple-500/10 px-2 py-0.5 text-[10px] font-bold text-purple-400 uppercase">
                            Refunded
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full border border-rose-500/30 bg-rose-500/10 px-2 py-0.5 text-[10px] font-bold text-rose-400 uppercase">
                            <XCircle className="h-3 w-3" /> {status}
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-4 text-xs font-mono text-slate-400">
                        {o.paymentId || '—'}
                      </td>

                      <td className="px-4 py-4 text-right text-xs text-slate-400 font-mono">
                        {new Date(o.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-slate-800 bg-slate-900/40 px-4 py-3 sm:px-6">
          <div className="text-xs text-slate-400">
            Showing <span className="font-semibold text-white">{orders.length}</span> of{' '}
            <span className="font-semibold text-white">{total}</span> payment records
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-800 disabled:opacity-40"
            >
              <ChevronLeft className="h-3.5 w-3.5" /> Previous
            </button>
            <span className="text-xs text-slate-400">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-800 disabled:opacity-40"
            >
              Next <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
