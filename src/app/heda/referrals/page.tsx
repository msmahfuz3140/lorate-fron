'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { authClient } from '../../../lib/auth-client';
import {
  Users2,
  Share2,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Download,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  KeyRound,
  Percent,
  Copy,
  Check,
  Shield,
  Eye,
  Clock,
  RefreshCw,
  Lock,
  ArrowUpRight,
  FileSpreadsheet
} from 'lucide-react';

export default function AdminReferralsPage() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<'overview' | 'moderators' | 'commissions' | 'fraud'>('overview');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Sync with URL query parameters for nested sidebar items
  useEffect(() => {
    const tabParam = searchParams.get('tab') as 'overview' | 'moderators' | 'commissions' | 'fraud' | null;
    if (tabParam && ['overview', 'moderators', 'commissions', 'fraud'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  // Data states
  const [overview, setOverview] = useState<any>(null);
  const [moderators, setModerators] = useState<any[]>([]);
  const [commissions, setCommissions] = useState<any[]>([]);
  const [fraudAlerts, setFraudAlerts] = useState<any[]>([]);

  // Search & Filter
  const [modSearch, setModSearch] = useState('');
  const [modStatusFilter, setModStatusFilter] = useState('ALL');
  const [commSearch, setCommSearch] = useState('');
  const [commStatusFilter, setCommStatusFilter] = useState('ALL');

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [resetPassModalOpen, setResetPassModalOpen] = useState(false);
  const [rateModalOpen, setRateModalOpen] = useState(false);
  const [commStatusModalOpen, setCommStatusModalOpen] = useState(false);
  const [policyModalOpen, setPolicyModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

  // Selected targets
  const [selectedModerator, setSelectedModerator] = useState<any>(null);
  const [selectedCommission, setSelectedCommission] = useState<any>(null);
  const [selectedDetails, setSelectedDetails] = useState<any>(null);

  // Forms
  const [newModName, setNewModName] = useState('');
  const [newModEmail, setNewModEmail] = useState('');
  const [newModPhone, setNewModPhone] = useState('');
  const [newModPassword, setNewModPassword] = useState('');
  const [newModRate, setNewModRate] = useState('0.50');
  const [newModNotes, setNewModNotes] = useState('');

  const [newStatus, setNewStatus] = useState('ACTIVE');
  const [auditReason, setAuditReason] = useState('');
  const [tempPasswordResult, setTempPasswordResult] = useState<string | null>(null);
  const [editRate, setEditRate] = useState('0.50');
  const [newCommStatus, setNewCommStatus] = useState<'APPROVED' | 'REVERSED'>('APPROVED');
  const [newDefaultRate, setNewDefaultRate] = useState('0.50');

  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      if (activeTab === 'overview') {
        const ov = await authClient.getAdminReferralOverview();
        setOverview(ov);
        const mods = await authClient.getAdminModerators({ limit: 5 });
        setModerators(mods.moderators || []);
      } else if (activeTab === 'moderators') {
        const mods = await authClient.getAdminModerators({
          search: modSearch,
          status: modStatusFilter,
          limit: 50
        });
        setModerators(mods.moderators || []);
      } else if (activeTab === 'commissions') {
        const comms = await authClient.getAdminCommissions({
          search: commSearch,
          status: commStatusFilter,
          limit: 50
        });
        setCommissions(comms.commissions || []);
      } else if (activeTab === 'fraud') {
        const alerts = await authClient.getAdminReferralFraudAlerts();
        setFraudAlerts(alerts || []);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to load referral data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTab, modStatusFilter, commStatusFilter]);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleCreateModerator = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setError(null);
    try {
      const res = await authClient.createAdminModerator({
        name: newModName,
        email: newModEmail,
        phone: newModPhone || undefined,
        password: newModPassword,
        commissionRate: newModRate ? parseFloat(newModRate) : 0.50,
        notes: newModNotes || undefined
      });
      setSuccessMsg(`Moderator created! Code: ${res.referralCode}`);
      setCreateModalOpen(false);
      setNewModName('');
      setNewModEmail('');
      setNewModPhone('');
      setNewModPassword('');
      setNewModNotes('');
      loadData();
    } catch (err: any) {
      setError(err?.message || 'Failed to create moderator');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedModerator || !auditReason) return;
    setActionLoading(true);
    setError(null);
    try {
      await authClient.updateAdminModeratorStatus(selectedModerator.moderatorId, {
        status: newStatus,
        reason: auditReason
      });
      setSuccessMsg(`Moderator status updated to ${newStatus}`);
      setStatusModalOpen(false);
      setAuditReason('');
      loadData();
    } catch (err: any) {
      setError(err?.message || 'Failed to update moderator status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedModerator || !auditReason) return;
    setActionLoading(true);
    setError(null);
    try {
      const res = await authClient.resetAdminModeratorPassword(selectedModerator.moderatorId, {
        reason: auditReason
      });
      setTempPasswordResult(res.temporaryPassword || 'Password reset successfully');
      setAuditReason('');
      loadData();
    } catch (err: any) {
      setError(err?.message || 'Failed to reset password');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateRate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedModerator || !auditReason) return;
    setActionLoading(true);
    setError(null);
    try {
      await authClient.updateAdminModeratorCommissionRate(selectedModerator.moderatorId, {
        commissionRate: parseFloat(editRate),
        reason: auditReason
      });
      setSuccessMsg(`Commission rate updated to ${(parseFloat(editRate) * 100).toFixed(0)}% for future sales`);
      setRateModalOpen(false);
      setAuditReason('');
      loadData();
    } catch (err: any) {
      setError(err?.message || 'Failed to update commission rate');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateCommissionStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCommission || !auditReason) return;
    setActionLoading(true);
    setError(null);
    try {
      await authClient.updateAdminCommissionStatus(selectedCommission._id, {
        status: newCommStatus,
        reason: auditReason
      });
      setSuccessMsg(`Commission status changed to ${newCommStatus}`);
      setCommStatusModalOpen(false);
      setAuditReason('');
      loadData();
    } catch (err: any) {
      setError(err?.message || 'Failed to adjust commission record');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateGlobalPolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auditReason) return;
    setActionLoading(true);
    setError(null);
    try {
      await authClient.updateAdminCommissionPolicy({
        defaultRate: parseFloat(newDefaultRate),
        reason: auditReason
      });
      setSuccessMsg(`Global default commission rate updated to ${(parseFloat(newDefaultRate) * 100).toFixed(0)}%`);
      setPolicyModalOpen(false);
      setAuditReason('');
      loadData();
    } catch (err: any) {
      setError(err?.message || 'Failed to update global policy');
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenDetails = async (mod: any) => {
    setSelectedModerator(mod);
    setDetailsModalOpen(true);
    try {
      const details = await authClient.getAdminModeratorDetails(mod.moderatorId);
      setSelectedDetails(details);
    } catch (err: any) {
      setError(err?.message || 'Failed to load details');
    }
  };

  const handleExportCsv = () => {
    const token = typeof window !== 'undefined'
      ? (localStorage.getItem('sloot_token') || localStorage.getItem('auth_token'))
      : null;
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050/api/v1';
    const tokenParam = token ? `?token=${encodeURIComponent(token)}` : '';
    window.open(`${backendUrl}/admin/referrals/export${tokenParam}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/5 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 font-display text-[11px] font-bold uppercase tracking-wider text-amber-400">
              Phase 7 Telemetry
            </span>
            <span className="text-xs text-slate-500">Non-Custodial Accounting</span>
          </div>
          <h1 className="mt-1 font-display text-2xl font-black uppercase tracking-wider text-white sm:text-3xl">
            Moderators & Referral Attribution
          </h1>
          <p className="mt-0.5 text-xs text-slate-400">
            Provision Moderators, monitor qualifying subscription sales attribution, snapshot commission records, and review fraud alerts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold uppercase tracking-wider text-slate-300 hover:bg-white/10 transition-colors"
          >
            <Download className="h-3.5 w-3.5 text-slate-400" />
            Export CSV
          </button>
          <button
            onClick={() => setCreateModalOpen(true)}
            className="flex items-center gap-1.5 rounded-lg border border-amber-500/50 bg-amber-500 px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-black shadow-[0_0_15px_rgba(245,158,11,0.3)] transition-all hover:brightness-110 active:scale-95"
          >
            <Plus className="h-3.5 w-3.5 text-black" />
            Create Moderator
          </button>
        </div>
      </div>

      {/* Alert Notices */}
      {error && (
        <div className="flex items-center justify-between rounded-xl border border-red-500/30 bg-red-500/10 p-3.5 text-xs text-red-300">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}
      {successMsg && (
        <div className="flex items-center justify-between rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs text-emerald-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 font-display text-xs font-bold uppercase tracking-wider transition-all ${
            activeTab === 'overview'
              ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <TrendingUp className="h-3.5 w-3.5" />
          Overview & Policy
        </button>
        <button
          onClick={() => setActiveTab('moderators')}
          className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 font-display text-xs font-bold uppercase tracking-wider transition-all ${
            activeTab === 'moderators'
              ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users2 className="h-3.5 w-3.5" />
          Moderators Roster
        </button>
        <button
          onClick={() => setActiveTab('commissions')}
          className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 font-display text-xs font-bold uppercase tracking-wider transition-all ${
            activeTab === 'commissions'
              ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <DollarSign className="h-3.5 w-3.5" />
          Commissions Ledger
        </button>
        <button
          onClick={() => setActiveTab('fraud')}
          className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 font-display text-xs font-bold uppercase tracking-wider transition-all ${
            activeTab === 'fraud'
              ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Shield className="h-3.5 w-3.5" />
          Attribution Fraud Alerts
        </button>
      </div>

      {/* TAB 1: OVERVIEW & POLICY */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Metric Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="rounded-xl border border-white/5 bg-[#0b0f19] p-4">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Active Moderators
              </span>
              <p className="mt-1 font-display text-2xl font-black text-white">
                {overview?.activeModerators || 0}{' '}
                <span className="text-xs font-normal text-slate-500">/ {overview?.totalModerators || 0}</span>
              </p>
              <span className="mt-1 block text-[10px] text-slate-500">Authorized partners</span>
            </div>

            <div className="rounded-xl border border-white/5 bg-[#0b0f19] p-4">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Attributed Sales
              </span>
              <p className="mt-1 font-display text-2xl font-black text-emerald-400">
                ${(overview?.totalAttributedRevenueUsd || 0).toLocaleString()}
              </p>
              <span className="mt-1 block text-[10px] text-slate-500">
                {overview?.totalAttributedOrders || 0} qualifying orders
              </span>
            </div>

            <div className="rounded-xl border border-white/5 bg-[#0b0f19] p-4">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Commission Credited
              </span>
              <p className="mt-1 font-display text-2xl font-black text-amber-400">
                ${(overview?.totalApprovedCommissionUsd || 0).toLocaleString()}
              </p>
              <span className="mt-1 block text-[10px] text-slate-500">Accounting liability</span>
            </div>

            <div className="rounded-xl border border-white/5 bg-[#0b0f19] p-4">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Reversed Commissions
              </span>
              <p className="mt-1 font-display text-2xl font-black text-red-400">
                ${(overview?.totalReversedCommissionUsd || 0).toLocaleString()}
              </p>
              <span className="mt-1 block text-[10px] text-slate-500">Refunds & adjustments</span>
            </div>
          </div>

          {/* Authoritative Commission Policy Banner */}
          <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-r from-amber-500/10 via-[#0b0f19] to-amber-950/10 p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Percent className="h-5 w-5 text-amber-400" />
                  <h3 className="font-display text-base font-bold uppercase tracking-wider text-white">
                    Platform Commission Policy & Basis Guarantee
                  </h3>
                </div>
                <p className="mt-2 text-xs text-slate-300 max-w-2xl leading-relaxed">
                  Default Platform Commission Rate:{' '}
                  <span className="font-bold text-amber-400">
                    {((overview?.globalCommissionPolicy?.defaultRate || 0.5) * 100).toFixed(0)}%
                  </span>
                  . Basis is strictly defined as gross confirmed on-chain subscription revenue in USD. Zero commissions apply to unconfirmed, failed, or refunded transactions. Snapshot immutability guarantees historical records remain untouched when policies are adjusted.
                </p>
              </div>
              <button
                onClick={() => {
                  setNewDefaultRate(String(overview?.globalCommissionPolicy?.defaultRate || 0.5));
                  setPolicyModalOpen(true);
                }}
                className="shrink-0 rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-2 font-display text-xs font-bold uppercase tracking-wider text-amber-400 hover:bg-amber-500/20 transition-all"
              >
                Configure Future Policy
              </button>
            </div>
          </div>

          {/* Leaderboard preview */}
          <div className="rounded-2xl border border-white/5 bg-[#0b0f19] p-5">
            <h3 className="font-display text-sm font-bold uppercase tracking-wider text-slate-300 mb-4">
              Top Referring Moderators
            </h3>
            {moderators.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">No active moderators provisioned yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/5 text-[10px] uppercase tracking-wider text-slate-500">
                      <th className="py-2.5 px-3">Moderator</th>
                      <th className="py-2.5 px-3">Referral Code</th>
                      <th className="py-2.5 px-3">Registrations</th>
                      <th className="py-2.5 px-3">Attributed Sales</th>
                      <th className="py-2.5 px-3">Total Volume</th>
                      <th className="py-2.5 px-3">Earned Commission</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {moderators.map((m) => (
                      <tr key={m.moderatorId} className="hover:bg-white/5 transition-colors">
                        <td className="py-2.5 px-3 font-semibold text-white">
                          {m.name}{' '}
                          <span className="block text-[10px] font-normal text-slate-400">{m.email}</span>
                        </td>
                        <td className="py-2.5 px-3">
                          <code className="rounded bg-black/40 px-1.5 py-0.5 font-mono text-[11px] text-amber-400 border border-amber-500/20">
                            {m.referralCode}
                          </code>
                        </td>
                        <td className="py-2.5 px-3 text-slate-300">{m.totalReferrals}</td>
                        <td className="py-2.5 px-3 text-slate-300">{m.totalSalesCount}</td>
                        <td className="py-2.5 px-3 font-semibold text-emerald-400">
                          ${m.totalAttributedRevenueUsd.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-amber-400">
                          ${m.approvedCommissionUsd.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: MODERATORS ROSTER */}
      {activeTab === 'moderators' && (
        <div className="space-y-4">
          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search by name, email, phone, or referral code..."
                value={modSearch}
                onChange={(e) => setModSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && loadData()}
                className="w-full rounded-xl border border-white/10 bg-[#0b0f19] pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
              />
            </div>
            <select
              value={modStatusFilter}
              onChange={(e) => setModStatusFilter(e.target.value)}
              className="rounded-xl border border-white/10 bg-[#0b0f19] px-3 py-2 text-xs text-slate-300 focus:border-amber-500 focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="SUSPENDED">SUSPENDED</option>
              <option value="BLOCKED">BLOCKED</option>
            </select>
            <button
              onClick={loadData}
              className="rounded-xl border border-white/10 bg-white/5 p-2 text-slate-400 hover:text-white"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>

          {/* Table */}
          <div className="rounded-2xl border border-white/5 bg-[#0b0f19] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/5 text-[10px] uppercase tracking-wider text-slate-500 bg-white/[0.02]">
                    <th className="py-3 px-4">Moderator</th>
                    <th className="py-3 px-3">Referral Code</th>
                    <th className="py-3 px-3">Rate</th>
                    <th className="py-3 px-3">Registrations</th>
                    <th className="py-3 px-3">Sales</th>
                    <th className="py-3 px-3">Volume</th>
                    <th className="py-3 px-3">Commissions</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {moderators.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-slate-500">
                        No moderators match the current query.
                      </td>
                    </tr>
                  ) : (
                    moderators.map((m) => (
                      <tr key={m.moderatorId} className="hover:bg-white/5 transition-colors">
                        <td className="py-3 px-4">
                          <p className="font-semibold text-white">{m.name}</p>
                          <p className="text-[11px] text-slate-400">{m.email}</p>
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-1.5">
                            <code className="rounded bg-black/40 px-1.5 py-0.5 font-mono text-[11px] text-amber-400 border border-amber-500/20">
                              {m.referralCode}
                            </code>
                            <button
                              onClick={() => handleCopyCode(m.referralCode)}
                              className="text-slate-400 hover:text-white"
                              title="Copy referral code"
                            >
                              {copiedCode === m.referralCode ? (
                                <Check className="h-3 w-3 text-emerald-400" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </button>
                          </div>
                        </td>
                        <td className="py-3 px-3 font-semibold text-slate-300">
                          {(m.commissionRate * 100).toFixed(0)}%
                        </td>
                        <td className="py-3 px-3 text-slate-300">{m.totalReferrals}</td>
                        <td className="py-3 px-3 text-slate-300">{m.totalSalesCount}</td>
                        <td className="py-3 px-3 font-semibold text-emerald-400">
                          ${m.totalAttributedRevenueUsd.toLocaleString()}
                        </td>
                        <td className="py-3 px-3 font-bold text-amber-400">
                          ${m.approvedCommissionUsd.toLocaleString()}
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                              m.accountStatus === 'ACTIVE'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : m.accountStatus === 'SUSPENDED'
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                : 'bg-red-500/10 text-red-400 border border-red-500/20'
                            }`}
                          >
                            {m.accountStatus}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenDetails(m)}
                              title="View performance details"
                              className="rounded border border-white/10 bg-white/5 p-1.5 text-slate-300 hover:bg-white/10"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedModerator(m);
                                setNewStatus(m.accountStatus);
                                setStatusModalOpen(true);
                              }}
                              title="Change status"
                              className="rounded border border-white/10 bg-white/5 p-1.5 text-slate-300 hover:bg-white/10"
                            >
                              <Shield className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedModerator(m);
                                setResetPassModalOpen(true);
                              }}
                              title="Reset credentials"
                              className="rounded border border-white/10 bg-white/5 p-1.5 text-slate-300 hover:bg-white/10"
                            >
                              <KeyRound className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedModerator(m);
                                setEditRate(String(m.commissionRate));
                                setRateModalOpen(true);
                              }}
                              title="Edit future commission rate"
                              className="rounded border border-white/10 bg-white/5 p-1.5 text-slate-300 hover:bg-white/10"
                            >
                              <Percent className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: COMMISSIONS LEDGER */}
      {activeTab === 'commissions' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search by order ID or plan..."
                value={commSearch}
                onChange={(e) => setCommSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && loadData()}
                className="w-full rounded-xl border border-white/10 bg-[#0b0f19] pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
              />
            </div>
            <select
              value={commStatusFilter}
              onChange={(e) => setCommStatusFilter(e.target.value)}
              className="rounded-xl border border-white/10 bg-[#0b0f19] px-3 py-2 text-xs text-slate-300 focus:border-amber-500 focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="CREDITED">CREDITED / APPROVED</option>
              <option value="ELIGIBLE">ELIGIBLE</option>
              <option value="PENDING">PENDING</option>
              <option value="REVERSED">REVERSED</option>
            </select>
          </div>

          <div className="rounded-2xl border border-white/5 bg-[#0b0f19] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/5 text-[10px] uppercase tracking-wider text-slate-500 bg-white/[0.02]">
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-3">Order ID</th>
                    <th className="py-3 px-3">Moderator</th>
                    <th className="py-3 px-3">Customer</th>
                    <th className="py-3 px-3">Plan</th>
                    <th className="py-3 px-3">Sale ($)</th>
                    <th className="py-3 px-3">Rate</th>
                    <th className="py-3 px-3">Commission</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-4 text-right">Adjustment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {commissions.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-8 text-center text-slate-500">
                        No commission line items found.
                      </td>
                    </tr>
                  ) : (
                    commissions.map((c) => (
                      <tr key={c._id} className="hover:bg-white/5 transition-colors">
                        <td className="py-3 px-4 text-slate-400">
                          {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="py-3 px-3 font-mono text-[11px] text-slate-300">
                          {c.purchaseId || c.paymentId?.orderId || 'N/A'}
                        </td>
                        <td className="py-3 px-3 text-slate-300">
                          {c.moderatorId?.name || 'Moderator'}
                          <span className="block text-[10px] text-slate-500">{c.moderatorId?.email}</span>
                        </td>
                        <td className="py-3 px-3 text-slate-300">
                          {c.referredUserId?.email || 'Customer'}
                        </td>
                        <td className="py-3 px-3 text-slate-300 font-semibold">
                          {c.subscriptionPlan || c.paymentId?.planId || 'Premium'}
                        </td>
                        <td className="py-3 px-3 font-semibold text-white">
                          ${c.originalPurchaseAmount || c.paymentId?.priceAmount || 0}
                        </td>
                        <td className="py-3 px-3 text-slate-400">
                          {(c.commissionRate * 100).toFixed(0)}%
                        </td>
                        <td className="py-3 px-3 font-bold text-amber-400">
                          ${c.amountUsd}
                        </td>
                        <td className="py-3 px-3">
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
                        <td className="py-3 px-4 text-right">
                          {c.status !== 'REVERSED' ? (
                            <button
                              onClick={() => {
                                setSelectedCommission(c);
                                setNewCommStatus('REVERSED');
                                setCommStatusModalOpen(true);
                              }}
                              className="rounded border border-red-500/30 bg-red-500/10 px-2 py-1 text-[11px] font-semibold text-red-300 hover:bg-red-500/20"
                            >
                              Reverse
                            </button>
                          ) : (
                            <span className="text-[10px] text-slate-500 italic" title={c.reversalDetails?.reason}>
                              Reversed
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: FRAUD ALERTS */}
      {activeTab === 'fraud' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-white/5 bg-[#0b0f19] p-5">
            <h3 className="font-display text-sm font-bold uppercase tracking-wider text-white mb-2">
              Referral Integrity & Fraud Prevention Log
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Real-time audit log of self-referral attempts, multi-account creations, and moderator status restrictions.
            </p>

            {fraudAlerts.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">No referral fraud alerts recorded.</p>
            ) : (
              <div className="space-y-3">
                {fraudAlerts.map((log) => (
                  <div
                    key={log._id}
                    className="flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3.5"
                  >
                    <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                    <div className="flex-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-amber-300 uppercase tracking-wider text-[11px]">
                          {log.action}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {new Date(log.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-slate-300 mt-1">{log.reason}</p>
                      {log.details && (
                        <pre className="mt-2 rounded bg-black/50 p-2 font-mono text-[10px] text-slate-400 overflow-x-auto">
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL 1: CREATE MODERATOR */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0d121f] p-6 shadow-2xl">
            <h3 className="font-display text-lg font-bold uppercase tracking-wider text-white">
              Provision New Moderator
            </h3>
            <p className="mt-1 text-xs text-slate-400">
              Generates an unguessable unique referral code and grants access to the Moderator Portal.
            </p>

            <form onSubmit={handleCreateModerator} className="mt-4 space-y-3">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Partner"
                  value={newModName}
                  onChange={(e) => setNewModName(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="alex@partner.com"
                  value={newModEmail}
                  onChange={(e) => setNewModEmail(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Phone (Optional)
                </label>
                <input
                  type="text"
                  placeholder="+8801700000000"
                  value={newModPhone}
                  onChange={(e) => setNewModPhone(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Initial Password (Min 8 chars)
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  placeholder="SecurePass123!"
                  value={newModPassword}
                  onChange={(e) => setNewModPassword(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Commission Rate (Default: 0.50 = 50%)
                </label>
                <input
                  type="number"
                  step="0.05"
                  min="0.05"
                  max="0.90"
                  value={newModRate}
                  onChange={(e) => setNewModRate(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Internal Notes
                </label>
                <input
                  type="text"
                  placeholder="Marketing affiliate contract partner"
                  value={newModNotes}
                  onChange={(e) => setNewModNotes(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="rounded-lg border border-amber-500/50 bg-amber-500 px-4 py-2 text-xs font-bold uppercase tracking-wider text-black hover:brightness-110 disabled:opacity-50"
                >
                  {actionLoading ? 'Creating...' : 'Provision Moderator'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: CHANGE STATUS */}
      {statusModalOpen && selectedModerator && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0d121f] p-6 shadow-2xl">
            <h3 className="font-display text-lg font-bold uppercase tracking-wider text-white">
              Update Moderator Status
            </h3>
            <p className="mt-1 text-xs text-slate-400">
              Modifying status for <span className="text-white font-semibold">{selectedModerator.name}</span> ({selectedModerator.email}).
            </p>

            <form onSubmit={handleUpdateStatus} className="mt-4 space-y-3">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  New Account Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                >
                  <option value="ACTIVE">ACTIVE (Authorized to refer)</option>
                  <option value="SUSPENDED">SUSPENDED (Temporarily disabled)</option>
                  <option value="BLOCKED">BLOCKED (Terminated)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Mandatory Audit Reason
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Explain the rationale for changing this Moderator's status..."
                  value={auditReason}
                  onChange={(e) => setAuditReason(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setStatusModalOpen(false)}
                  className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="rounded-lg border border-amber-500/50 bg-amber-500 px-4 py-2 text-xs font-bold uppercase tracking-wider text-black hover:brightness-110 disabled:opacity-50"
                >
                  {actionLoading ? 'Updating...' : 'Save Status'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: RESET PASSWORD */}
      {resetPassModalOpen && selectedModerator && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0d121f] p-6 shadow-2xl">
            <h3 className="font-display text-lg font-bold uppercase tracking-wider text-white">
              Reset Moderator Credentials
            </h3>
            <p className="mt-1 text-xs text-slate-400">
              Reset access for <span className="text-white font-semibold">{selectedModerator.name}</span>.
            </p>

            {tempPasswordResult ? (
              <div className="mt-4 space-y-3">
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block mb-1">
                    Temporary Password Generated
                  </span>
                  <code className="text-sm font-mono font-bold text-white select-all">
                    {tempPasswordResult}
                  </code>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setTempPasswordResult(null);
                    setResetPassModalOpen(false);
                  }}
                  className="w-full rounded-lg bg-amber-500 py-2 text-xs font-bold uppercase text-black"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleResetPassword} className="mt-4 space-y-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Mandatory Audit Reason
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="User reported lost credentials / requested credential rotation..."
                    value={auditReason}
                    onChange={(e) => setAuditReason(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setResetPassModalOpen(false)}
                    className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="rounded-lg border border-amber-500/50 bg-amber-500 px-4 py-2 text-xs font-bold uppercase tracking-wider text-black hover:brightness-110 disabled:opacity-50"
                  >
                    {actionLoading ? 'Resetting...' : 'Generate New Credentials'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODAL 4: EDIT COMMISSION RATE */}
      {rateModalOpen && selectedModerator && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0d121f] p-6 shadow-2xl">
            <h3 className="font-display text-lg font-bold uppercase tracking-wider text-white">
              Update Commission Rate Override
            </h3>
            <p className="mt-1 text-xs text-slate-400">
              Modifying rate for <span className="text-white font-semibold">{selectedModerator.name}</span>. Historical commission records remain immutable.
            </p>

            <form onSubmit={handleUpdateRate} className="mt-4 space-y-3">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  New Rate (e.g. 0.40 = 40%, 0.50 = 50%)
                </label>
                <input
                  type="number"
                  step="0.05"
                  min="0.05"
                  max="0.90"
                  value={editRate}
                  onChange={(e) => setEditRate(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Mandatory Audit Reason
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Promotional rate tier agreed in marketing contract..."
                  value={auditReason}
                  onChange={(e) => setAuditReason(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setRateModalOpen(false)}
                  className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="rounded-lg border border-amber-500/50 bg-amber-500 px-4 py-2 text-xs font-bold uppercase tracking-wider text-black hover:brightness-110 disabled:opacity-50"
                >
                  {actionLoading ? 'Saving...' : 'Apply Future Rate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: ADJUST COMMISSION STATUS */}
      {commStatusModalOpen && selectedCommission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0d121f] p-6 shadow-2xl">
            <h3 className="font-display text-lg font-bold uppercase tracking-wider text-white">
              Adjust Commission Status
            </h3>
            <p className="mt-1 text-xs text-slate-400">
              Order: <code className="text-white font-mono">{selectedCommission.purchaseId}</code> — Amount: ${selectedCommission.amountUsd}
            </p>

            <form onSubmit={handleUpdateCommissionStatus} className="mt-4 space-y-3">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Action
                </label>
                <select
                  value={newCommStatus}
                  onChange={(e) => setNewCommStatus(e.target.value as any)}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                >
                  <option value="REVERSED">REVERSE (Refund or Dispute)</option>
                  <option value="APPROVED">APPROVE</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Mandatory Audit Reason
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Explain why this commission is being adjusted..."
                  value={auditReason}
                  onChange={(e) => setAuditReason(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setCommStatusModalOpen(false)}
                  className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="rounded-lg border border-red-500/50 bg-red-600 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white hover:brightness-110 disabled:opacity-50"
                >
                  {actionLoading ? 'Processing...' : 'Confirm Adjustment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 6: CONFIGURE GLOBAL POLICY */}
      {policyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0d121f] p-6 shadow-2xl">
            <h3 className="font-display text-lg font-bold uppercase tracking-wider text-white">
              Platform Default Commission Policy
            </h3>
            <p className="mt-1 text-xs text-slate-400">
              Sets the baseline rate for future eligible sales where no individual moderator override exists.
            </p>

            <form onSubmit={handleUpdateGlobalPolicy} className="mt-4 space-y-3">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Default Platform Commission Rate
                </label>
                <input
                  type="number"
                  step="0.05"
                  min="0.05"
                  max="0.90"
                  value={newDefaultRate}
                  onChange={(e) => setNewDefaultRate(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Mandatory Audit Reason
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Platform-wide partner commission restructuring..."
                  value={auditReason}
                  onChange={(e) => setAuditReason(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setPolicyModalOpen(false)}
                  className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="rounded-lg border border-amber-500/50 bg-amber-500 px-4 py-2 text-xs font-bold uppercase tracking-wider text-black hover:brightness-110 disabled:opacity-50"
                >
                  {actionLoading ? 'Updating...' : 'Save Global Policy'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 7: MODERATOR DETAILS DRAWER */}
      {detailsModalOpen && selectedDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10 bg-[#0d121f] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div>
                <h3 className="font-display text-lg font-bold text-white">
                  {selectedDetails.moderator?.name}
                </h3>
                <p className="text-xs text-slate-400">{selectedDetails.moderator?.email}</p>
              </div>
              <button
                onClick={() => setDetailsModalOpen(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-lg bg-white/5 p-3">
                <span className="text-[10px] text-slate-400 uppercase">Referral Code</span>
                <p className="font-mono text-sm font-bold text-amber-400">
                  {selectedDetails.moderator?.referralCode}
                </p>
              </div>
              <div className="rounded-lg bg-white/5 p-3">
                <span className="text-[10px] text-slate-400 uppercase">Commission Rate</span>
                <p className="text-sm font-bold text-white">
                  {(selectedDetails.moderator?.commissionRate * 100).toFixed(0)}%
                </p>
              </div>
              <div className="rounded-lg bg-white/5 p-3">
                <span className="text-[10px] text-slate-400 uppercase">Attributed Sales</span>
                <p className="text-sm font-bold text-emerald-400">
                  ${selectedDetails.metrics?.totalAttributedRevenueUsd || 0}
                </p>
              </div>
              <div className="rounded-lg bg-white/5 p-3">
                <span className="text-[10px] text-slate-400 uppercase">Credited Commissions</span>
                <p className="text-sm font-bold text-amber-400">
                  ${selectedDetails.metrics?.approvedCommissionUsd || 0}
                </p>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                Referred Accounts ({selectedDetails.referredUsers?.length || 0})
              </h4>
              <div className="max-h-40 overflow-y-auto rounded-lg border border-white/5 bg-black/30 p-2 text-xs">
                {selectedDetails.referredUsers?.length === 0 ? (
                  <p className="text-slate-500 text-center py-2">No referred users yet.</p>
                ) : (
                  <ul className="divide-y divide-white/5">
                    {selectedDetails.referredUsers?.map((u: any) => (
                      <li key={u._id} className="py-1.5 flex justify-between items-center text-[11px]">
                        <span className="text-slate-300">{u.name} ({u.email || u.phone})</span>
                        <span className="text-slate-500">{new Date(u.createdAt).toLocaleDateString()}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                Commission Records ({selectedDetails.commissions?.length || 0})
              </h4>
              <div className="max-h-40 overflow-y-auto rounded-lg border border-white/5 bg-black/30 p-2 text-xs">
                {selectedDetails.commissions?.length === 0 ? (
                  <p className="text-slate-500 text-center py-2">No commissions attributed yet.</p>
                ) : (
                  <ul className="divide-y divide-white/5">
                    {selectedDetails.commissions?.map((c: any) => (
                      <li key={c._id} className="py-1.5 flex justify-between items-center text-[11px]">
                        <span className="font-mono text-slate-400">{c.purchaseId || 'N/A'}</span>
                        <span className="text-white font-semibold">${c.amountUsd}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] ${c.status === 'REVERSED' ? 'text-red-400' : 'text-emerald-400'}`}>
                          {c.status}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
