'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { authClient } from '../../../lib/auth-client';
import { useDebounce } from '../../../hooks/useDebounce';
import {
  Sliders,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Search,
  PlusCircle,
  RefreshCw,
  X,
  AlertTriangle,
  Calendar,
  Layers,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Tag,
  ShieldCheck,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Sparkles,
  Plus,
  Copy,
  Check
} from 'lucide-react';
import { SUBSCRIPTION_PLANS, SubscriptionPlan } from '../../../shared/plans';

interface SubscriptionRecord {
  _id: string;
  planId: string;
  planName?: string;
  planPriceUsd?: number;
  status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED' | 'REVOKED' | 'PENDING';
  startDate: string;
  endDate: string;
  daysRemaining?: number;
  isManualGrant: boolean;
  grantReason?: string;
  extensionReason?: string;
  revocationReason?: string;
  extendedAt?: string;
  revokedAt?: string;
  secretCode?: string;
  isSecretCodeClaimed?: boolean;
  secretCodeClaimedAt?: string;
  isApprovedByAdmin?: boolean;
  approvedAt?: string;
  createdAt: string;
  userId?: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    role: string;
    accountStatus: string;
  };
  grantedByAdminId?: {
    _id: string;
    name: string;
    email: string;
  };
}

export default function AdminSubscriptionsPage() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<'SUBSCRIPTIONS' | 'PLANS'>('SUBSCRIPTIONS');

  // Subscriptions Table State
  const [subscriptions, setSubscriptions] = useState<SubscriptionRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 350);
  const [isLoading, setIsLoading] = useState(true);

  // Sync with URL query parameters for nested sidebar items
  useEffect(() => {
    const statusParam = searchParams.get('status') || 'ALL';
    const tabParam = searchParams.get('tab');
    if (tabParam === 'PLANS') {
      setActiveTab('PLANS');
    } else {
      setActiveTab('SUBSCRIPTIONS');
      setStatusFilter(statusParam);
    }
    setPage(1);
  }, [searchParams]);

  // Plans State
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isPlansLoading, setIsPlansLoading] = useState(false);

  // Edit Plan State
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [editPriceUsd, setEditPriceUsd] = useState(0);
  const [editName, setEditName] = useState('');
  const [editBadge, setEditBadge] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editDurationUnit, setEditDurationUnit] = useState<'DAYS' | 'MONTHS'>('DAYS');
  const [editDurationValue, setEditDurationValue] = useState(30);
  const [editFeatures, setEditFeatures] = useState<string[]>([]);
  const [editFeatureInput, setEditFeatureInput] = useState('');
  const [editIsPopular, setEditIsPopular] = useState(false);
  const [editIsActive, setEditIsActive] = useState(true);
  const [editIsVisible, setEditIsVisible] = useState(true);

  // Create Plan State
  const [createName, setCreateName] = useState('');
  const [createId, setCreateId] = useState('');
  const [createBadge, setCreateBadge] = useState('');
  const [createPriceUsd, setCreatePriceUsd] = useState(49);
  const [createDurationUnit, setCreateDurationUnit] = useState<'DAYS' | 'MONTHS'>('DAYS');
  const [createDurationValue, setCreateDurationValue] = useState(30);
  const [createDescription, setCreateDescription] = useState('');
  const [createFeatures, setCreateFeatures] = useState<string[]>([
    'Full VIP Roulette Prediction Engine Access',
    'Real-time Live Casino Wheel Tracking',
    'Bankroll & Risk Multiplier Calculator',
    'Dedicated Priority Support Desk'
  ]);
  const [createFeatureInput, setCreateFeatureInput] = useState('');
  const [createIsPopular, setCreateIsPopular] = useState(false);
  const [createIsActive, setCreateIsActive] = useState(true);
  const [createIsVisible, setCreateIsVisible] = useState(true);

  // Delete Plan State
  const [deletingPlan, setDeletingPlan] = useState<SubscriptionPlan | null>(null);

  // Modals & Action State
  const [selectedSub, setSelectedSub] = useState<SubscriptionRecord | null>(null);
  const [modalType, setModalType] = useState<'GRANT' | 'EXTEND' | 'REVOKE' | 'EDIT_PLAN' | 'CREATE_PLAN' | 'DELETE_PLAN' | null>(null);
  const [grantEmail, setGrantEmail] = useState('');
  const [grantPlanId, setGrantPlanId] = useState('15_days');
  const [extValue, setExtValue] = useState(30);
  const [extUnit, setExtUnit] = useState<'days' | 'months' | 'years'>('days');
  const [reasonInput, setReasonInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const fetchSubscriptions = useCallback(async () => {
    setIsLoading(true);
    setActionError('');
    try {
      const res = await authClient.getAdminSubscriptions({
        page,
        limit: 20,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        search: debouncedSearch.trim() || undefined
      });
      if (res && res.subscriptions) {
        setSubscriptions(res.subscriptions);
        setTotal(res.total || 0);
        setTotalPages(res.totalPages || 1);
      }
    } catch (err: any) {
      setActionError(err.message || 'Failed to load subscriptions list');
    } finally {
      setIsLoading(false);
    }
  }, [page, statusFilter, debouncedSearch]);

  const fetchPlans = useCallback(async () => {
    setIsPlansLoading(true);
    try {
      const res = await authClient.getAdminPlans();
      if (res) {
        setPlans(res);
      }
    } catch (err: any) {
      setActionError(err.message || 'Failed to load plans configuration');
    } finally {
      setIsPlansLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  useEffect(() => {
    if (activeTab === 'PLANS') {
      fetchPlans();
    }
  }, [activeTab, fetchPlans]);

  const closeModal = () => {
    setModalType(null);
    setSelectedSub(null);
    setEditingPlan(null);
    setDeletingPlan(null);
    setReasonInput('');
    setActionError('');
  };

  const openEditPlanModal = (p: SubscriptionPlan) => {
    setEditingPlan(p);
    setEditName(p.name);
    setEditBadge(p.badge || '');
    setEditPriceUsd(p.priceUsd || (p.priceCents / 100));
    setEditDurationUnit(p.duration?.unit || 'DAYS');
    setEditDurationValue(p.duration?.value || p.durationDays || 30);
    setEditDescription(p.description || '');
    setEditFeatures([...(p.features || [])]);
    setEditFeatureInput('');
    setEditIsPopular(!!p.isPopular);
    setEditIsActive(p.isActive !== false);
    setEditIsVisible(p.isVisible !== false);
    setModalType('EDIT_PLAN');
  };

  const openCreatePlanModal = () => {
    setCreateName('');
    setCreateId('');
    setCreateBadge('');
    setCreatePriceUsd(49);
    setCreateDurationUnit('DAYS');
    setCreateDurationValue(30);
    setCreateDescription('');
    setCreateFeatures([
      'Full VIP Roulette Prediction Engine Access',
      'Real-time Live Casino Wheel Tracking',
      'Bankroll & Risk Multiplier Calculator',
      'Dedicated Priority Support Desk'
    ]);
    setCreateFeatureInput('');
    setCreateIsPopular(false);
    setCreateIsActive(true);
    setCreateIsVisible(true);
    setModalType('CREATE_PLAN');
  };

  const handleGrant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reasonInput.trim()) {
      setActionError('Mandatory reason required for manual subscription grant.');
      return;
    }
    setIsSubmitting(true);
    try {
      await authClient.grantAdminManualSubscription({
        targetEmail: grantEmail.trim(),
        planId: grantPlanId,
        reason: reasonInput.trim()
      });
      setActionSuccess(`Manual subscription successfully granted to ${grantEmail}. Excluded from sales.`);
      closeModal();
      fetchSubscriptions();
    } catch (err: any) {
      setActionError(err.message || 'Grant operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExtend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSub) return;
    if (!reasonInput.trim()) {
      setActionError('Mandatory reason required to extend subscription.');
      return;
    }
    setIsSubmitting(true);
    try {
      await authClient.extendAdminSubscription({
        subscriptionId: selectedSub._id,
        extensionValue: extValue,
        extensionUnit: extUnit,
        reason: reasonInput.trim()
      });
      setActionSuccess(`Subscription extended by ${extValue} ${extUnit}.`);
      closeModal();
      fetchSubscriptions();
    } catch (err: any) {
      setActionError(err.message || 'Extension failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRevoke = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSub) return;
    if (!reasonInput.trim()) {
      setActionError('Mandatory reason required to revoke subscription.');
      return;
    }
    setIsSubmitting(true);
    try {
      await authClient.revokeAdminSubscription({
        subscriptionId: selectedSub._id,
        reason: reasonInput.trim()
      });
      setActionSuccess('Subscription access revoked and access terminated.');
      closeModal();
      fetchSubscriptions();
    } catch (err: any) {
      setActionError(err.message || 'Revocation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApproveSubscription = async (sub: SubscriptionRecord) => {
    setIsSubmitting(true);
    setActionError('');
    try {
      await authClient.approveAdminSubscription(sub._id);
      setActionSuccess(`Subscription approved! Congratulatory email with Secret Code dispatched to ${sub.userId?.email || 'customer'}.`);
      fetchSubscriptions();
    } catch (err: any) {
      setActionError(err.message || 'Failed to approve subscription');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleManualUnlock = async (sub: SubscriptionRecord) => {
    setIsSubmitting(true);
    setActionError('');
    try {
      await authClient.manualUnlockAdminSubscription(sub._id);
      setActionSuccess(`Tool access manually unlocked for ${sub.userId?.email || 'customer'}!`);
      fetchSubscriptions();
    } catch (err: any) {
      setActionError(err.message || 'Failed to manually unlock tool');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan) return;
    if (!editName.trim()) {
      setActionError('Plan name is required.');
      return;
    }
    if (editPriceUsd <= 0) {
      setActionError('Plan price must be greater than $0.');
      return;
    }
    setIsSubmitting(true);
    try {
      await authClient.updateAdminPlan(editingPlan.id, {
        name: editName.trim(),
        priceCents: Math.round(editPriceUsd * 100),
        badge: editBadge.trim() || undefined,
        description: editDescription.trim(),
        durationUnit: editDurationUnit,
        durationValue: Number(editDurationValue),
        features: editFeatures,
        isPopular: editIsPopular,
        isActive: editIsActive,
        isVisible: editIsVisible
      });
      setActionSuccess(`Plan "${editName}" updated successfully. Audit log recorded.`);
      closeModal();
      fetchPlans();
    } catch (err: any) {
      setActionError(err.message || 'Failed to update plan configuration');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createName.trim()) {
      setActionError('Plan name is required.');
      return;
    }
    if (createPriceUsd <= 0) {
      setActionError('Price must be greater than $0.');
      return;
    }
    setIsSubmitting(true);
    try {
      const generatedId = createId.trim()
        ? (createId.trim().startsWith('PLAN_') ? createId.trim() : `PLAN_${createId.trim().toUpperCase().replace(/[^A-Z0-9_]/g, '_')}`)
        : `PLAN_${createName.trim().toUpperCase().replace(/[^A-Z0-9_]/g, '_')}`;

      await authClient.createAdminPlan({
        id: generatedId,
        name: createName.trim(),
        badge: createBadge.trim() || undefined,
        priceCents: Math.round(createPriceUsd * 100),
        durationUnit: createDurationUnit,
        durationValue: Number(createDurationValue),
        description: createDescription.trim(),
        features: createFeatures.length > 0 ? createFeatures : ['Full Prediction Access'],
        isPopular: createIsPopular,
        isActive: createIsActive,
        isVisible: createIsVisible
      });
      setActionSuccess(`New plan "${createName}" created and active!`);
      closeModal();
      fetchPlans();
    } catch (err: any) {
      setActionError(err.message || 'Failed to create plan');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePlan = async () => {
    if (!deletingPlan) return;
    setIsSubmitting(true);
    try {
      await authClient.deleteAdminPlan(deletingPlan.id);
      setActionSuccess(`Plan "${deletingPlan.name}" removed / archived successfully.`);
      closeModal();
      fetchPlans();
    } catch (err: any) {
      setActionError(err.message || 'Failed to delete plan');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTogglePlanActive = async (plan: SubscriptionPlan) => {
    setIsSubmitting(true);
    try {
      await authClient.updateAdminPlan(plan.id, {
        isActive: !plan.isActive
      });
      setActionSuccess(`Plan "${plan.name}" status changed to ${!plan.isActive ? 'ACTIVE' : 'INACTIVE'}.`);
      fetchPlans();
    } catch (err: any) {
      setActionError(err.message || 'Failed to toggle plan status');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-black uppercase tracking-wider text-white">
            Subscription Administration
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Audit platform access entitlements, manage manual comp tiers, and configure authoritative pricing.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setGrantEmail('');
              setGrantPlanId('15_days');
              setReasonInput('');
              setModalType('GRANT');
            }}
            className="flex items-center gap-2 rounded-xl border border-amber-500/50 bg-amber-500 px-4 py-2 text-xs font-bold uppercase tracking-wider text-black hover:bg-amber-400 transition-colors shadow-[0_0_15px_rgba(245,158,11,0.2)]"
          >
            <PlusCircle className="h-4 w-4" />
            Grant Manual Access
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800">
        <button
          onClick={() => setActiveTab('SUBSCRIPTIONS')}
          className={`flex items-center gap-2 px-5 py-3 font-display text-xs font-bold uppercase tracking-wider border-b-2 transition-colors ${
            activeTab === 'SUBSCRIPTIONS'
              ? 'border-amber-500 text-amber-400 bg-amber-500/5'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Layers className="h-4 w-4" />
          Subscription Registry ({total})
        </button>
        <button
          onClick={() => setActiveTab('PLANS')}
          className={`flex items-center gap-2 px-5 py-3 font-display text-xs font-bold uppercase tracking-wider border-b-2 transition-colors ${
            activeTab === 'PLANS'
              ? 'border-amber-500 text-amber-400 bg-amber-500/5'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Tag className="h-4 w-4" />
          Plan Pricing & Tiers
        </button>
      </div>

      {/* Alerts */}
      {actionSuccess && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess('')} className="text-emerald-400 hover:text-emerald-200">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {actionError && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-rose-400 shrink-0" />
            <span>{actionError}</span>
          </div>
          <button onClick={() => setActionError('')} className="text-rose-400 hover:text-rose-200">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* TAB 1: SUBSCRIPTIONS REGISTRY */}
      {activeTab === 'SUBSCRIPTIONS' && (
        <div className="space-y-4">
          {/* Quick Category Filter Tabs */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'ALL', label: 'All Passes' },
              { id: 'ACTIVE', label: '⭐ Active Passes' },
              { id: 'EXPIRED', label: '⌛ Expired Passes' },
              { id: 'CLAIM_PENDING', label: '🔐 Awaiting Tool Unlock' },
              { id: 'REVOKED', label: '🚫 Revoked Passes' }
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

          {/* Filters Bar */}
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
                  placeholder="Search by user email, name, phone, secret code, or plan ID..."
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
                  <option value="ALL">All Entitlement Statuses</option>
                  <option value="ACTIVE">Active Entitlements Only</option>
                  <option value="EXPIRED">Expired Subscriptions</option>
                  <option value="CLAIM_PENDING">Awaiting Tool Unlock</option>
                  <option value="REVOKED">Revoked Subscriptions</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-hidden rounded-2xl border border-slate-800 bg-[#070b14] shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="border-b border-slate-800 bg-slate-900/40 font-display text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="px-4 py-3.5">User</th>
                    <th className="px-4 py-3.5">Plan Tier</th>
                    <th className="px-4 py-3.5">Entitlement Period</th>
                    <th className="px-4 py-3.5">VIP Secret Code</th>
                    <th className="px-4 py-3.5">Source</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-4 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {isLoading ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <div className="h-6 w-6 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
                          <p className="font-display text-xs uppercase tracking-wider text-slate-400">
                            Querying subscription records...
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : subscriptions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                        No subscription entitlements found matching the query.
                      </td>
                    </tr>
                  ) : (
                    subscriptions.map((s) => {
                      const isActive = s.status === 'ACTIVE';
                      const isExpired = s.status === 'EXPIRED';
                      const isRevoked = s.status === 'REVOKED';

                      return (
                        <tr key={s._id} className="hover:bg-slate-800/30 transition-colors">
                          <td className="px-4 py-4">
                            <div className="font-semibold text-white">{s.userId?.name || 'Unknown User'}</div>
                            <div className="text-xs text-slate-400">{s.userId?.email || '—'}</div>
                            {s.userId?.phone && (
                              <div className="text-[11px] font-mono text-emerald-400 mt-0.5">
                                📞 {s.userId.phone}
                              </div>
                            )}
                            <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                              UID: {s.userId?._id?.substring(0, 8)}...
                            </div>
                          </td>

                          <td className="px-4 py-4">
                            <div className="font-display text-xs font-black uppercase tracking-wider text-amber-400">
                              {s.planName || s.planId.replace(/_/g, ' ')}
                            </div>
                            {s.planPriceUsd !== undefined && (
                              <div className="text-[11px] font-mono text-emerald-400 mt-0.5 font-bold">
                                ${s.planPriceUsd} USD
                              </div>
                            )}
                          </td>

                          <td className="px-4 py-4">
                            <div className="text-xs text-slate-300 font-mono">
                              Start: {new Date(s.startDate).toLocaleDateString()}
                            </div>
                            <div className="text-xs font-semibold text-white font-mono">
                              Expiry: {new Date(s.endDate).toLocaleDateString()}
                            </div>
                            <div className="mt-1">
                              {s.daysRemaining !== undefined && s.daysRemaining > 0 ? (
                                <span className="inline-flex items-center gap-1 rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-500/30">
                                  <Clock className="h-2.5 w-2.5" /> {s.daysRemaining} Days Left
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 rounded bg-rose-500/20 px-2 py-0.5 text-[10px] font-bold text-rose-300 border border-rose-500/30">
                                  Expired (0 Days)
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Secret Code Column */}
                          <td className="px-4 py-4">
                            <div className="space-y-1">
                              {s.secretCode ? (
                                <div className="flex items-center gap-1.5">
                                  <span className="font-mono text-xs font-bold text-amber-300 bg-amber-500/10 px-2 py-1 rounded border border-amber-500/20 inline-block">
                                    {s.secretCode}
                                  </span>
                                  <button
                                    onClick={() => handleCopyCode(s.secretCode!)}
                                    className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                                    title="Copy VIP Secret Activation Code"
                                  >
                                    {copiedCode === s.secretCode ? (
                                      <Check className="h-3 w-3 text-emerald-400" />
                                    ) : (
                                      <Copy className="h-3 w-3" />
                                    )}
                                  </button>
                                </div>
                              ) : (
                                <span className="text-xs text-slate-500">Pending Code</span>
                              )}
                              <div>
                                {s.isSecretCodeClaimed ? (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400">
                                    <CheckCircle2 className="h-3 w-3" /> Unlocked in Tool
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-400">
                                    <Clock className="h-3 w-3" /> Awaiting User Activation
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-4">
                            {s.isManualGrant ? (
                              <div>
                                <span className="inline-flex rounded border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-300">
                                  MANUAL COMP
                                </span>
                                {s.grantedByAdminId && (
                                  <div className="mt-1 text-[10px] text-slate-500">
                                    By: {s.grantedByAdminId.name || s.grantedByAdminId.email}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="inline-flex rounded border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-300">
                                NOWPAYMENTS CRYPTO
                              </span>
                            )}
                          </td>

                          <td className="px-4 py-4">
                            {isActive ? (
                              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400 uppercase">
                                <CheckCircle2 className="h-3 w-3" /> Active
                              </span>
                            ) : isExpired ? (
                              <span className="inline-flex items-center gap-1 rounded-full border border-slate-700 bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-400 uppercase">
                                <Clock className="h-3 w-3" /> Expired
                              </span>
                            ) : isRevoked ? (
                              <span className="inline-flex items-center gap-1 rounded-full border border-rose-500/30 bg-rose-500/10 px-2 py-0.5 text-[10px] font-bold text-rose-400 uppercase">
                                <ShieldAlert className="h-3 w-3" /> Revoked
                              </span>
                            ) : (
                              <span className="text-xs text-slate-400 uppercase font-bold">{s.status}</span>
                            )}
                          </td>

                          <td className="px-4 py-4 text-right">
                            <div className="flex items-center justify-end gap-1.5 flex-wrap">
                              {/* Approve & Send Code button */}
                              {isActive && (!s.isApprovedByAdmin || !s.secretCode) && (
                                <button
                                  onClick={() => handleApproveSubscription(s)}
                                  disabled={isSubmitting}
                                  className="rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-1 text-[10px] font-bold uppercase hover:bg-amber-500/30"
                                  title="Approve and send congratulations email with Secret Code"
                                >
                                  Approve & Code
                                </button>
                              )}

                              {/* Manual Unlock button */}
                              {isActive && !s.isSecretCodeClaimed && (
                                <button
                                  onClick={() => handleManualUnlock(s)}
                                  disabled={isSubmitting}
                                  className="rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-1 text-[10px] font-bold uppercase hover:bg-emerald-500/30"
                                  title="Manually unlock predictor tool for this customer immediately"
                                >
                                  Instant Unlock
                                </button>
                              )}

                              {isActive && (
                                <>
                                  <button
                                    onClick={() => {
                                      setSelectedSub(s);
                                      setExtValue(30);
                                      setExtUnit('days');
                                      setReasonInput('');
                                      setModalType('EXTEND');
                                    }}
                                    className="rounded-lg p-1.5 text-amber-400 hover:bg-amber-500/10"
                                    title="Extend Entitlement"
                                  >
                                    <Sliders className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      setSelectedSub(s);
                                      setReasonInput('');
                                      setModalType('REVOKE');
                                    }}
                                    className="rounded-lg p-1.5 text-rose-400 hover:bg-rose-500/10"
                                    title="Revoke Entitlement"
                                  >
                                    <ShieldAlert className="h-4 w-4" />
                                  </button>
                                </>
                              )}
                            </div>
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
                Showing <span className="font-semibold text-white">{subscriptions.length}</span> of{' '}
                <span className="font-semibold text-white">{total}</span> subscriptions
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
      )}

      {/* TAB 2: PLANS MANAGEMENT */}
      {activeTab === 'PLANS' && (
        <div className="space-y-6">
          {/* Header Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border border-slate-800 bg-[#070b14] p-5 shadow-xl">
            <div>
              <h2 className="font-display text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Tag className="h-5 w-5 text-amber-400" />
                Subscription Plans Catalog & Entitlements
              </h2>
              <p className="mt-1 text-xs text-slate-400">
                All pricing, durations, promotional badges, and feature sets are synchronized dynamically from MongoDB in real-time.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={fetchPlans}
                disabled={isPlansLoading}
                className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700 transition-colors"
                title="Refresh Plans from Database"
              >
                <RefreshCw className={`h-4 w-4 ${isPlansLoading ? 'animate-spin text-amber-400' : ''}`} />
                Refresh
              </button>
              <button
                onClick={openCreatePlanModal}
                className="flex items-center gap-2 rounded-xl border border-amber-500/50 bg-amber-500 px-4 py-2 text-xs font-bold uppercase tracking-wider text-black hover:bg-amber-400 transition-all shadow-[0_0_20px_rgba(245,158,11,0.25)]"
              >
                <Plus className="h-4 w-4" />
                Create New Plan
              </button>
            </div>
          </div>

          {/* Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {isPlansLoading ? (
              <div className="col-span-full py-16 text-center rounded-2xl border border-slate-800 bg-[#070b14]">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent mx-auto" />
                <p className="mt-3 font-display text-xs uppercase tracking-wider text-slate-400">Loading plan catalog from database...</p>
              </div>
            ) : plans.length === 0 ? (
              <div className="col-span-full py-16 text-center rounded-2xl border border-slate-800 bg-[#070b14]">
                <Tag className="h-10 w-10 text-slate-600 mx-auto mb-2" />
                <p className="text-sm font-semibold text-white">No subscription plans found</p>
                <p className="mt-1 text-xs text-slate-400">Click &ldquo;Create New Plan&rdquo; to define your first subscription tier.</p>
                <button
                  onClick={openCreatePlanModal}
                  className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold uppercase text-black"
                >
                  <Plus className="h-4 w-4" /> Create Plan
                </button>
              </div>
            ) : (
              plans.map((p) => {
                const isActive = p.isActive !== false;
                const isVisible = p.isVisible !== false;

                return (
                  <div
                    key={p.id}
                    className={`rounded-2xl border ${
                      p.isPopular
                        ? 'border-amber-500/50 shadow-[0_0_25px_rgba(245,158,11,0.15)] bg-gradient-to-b from-[#0b1020] to-[#070b14]'
                        : 'border-slate-800 bg-[#070b14] shadow-xl'
                    } p-6 flex flex-col justify-between transition-all hover:border-slate-700`}
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {isActive ? (
                            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-400">
                              <CheckCircle2 className="h-2.5 w-2.5" /> Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full border border-slate-700 bg-slate-800 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-400">
                              Disabled
                            </span>
                          )}

                          {isVisible ? (
                            <span className="inline-flex items-center gap-1 rounded-full border border-sky-500/40 bg-sky-500/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-sky-400">
                              <Eye className="h-2.5 w-2.5" /> Visible
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full border border-slate-700 bg-slate-800 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-400">
                              <EyeOff className="h-2.5 w-2.5" /> Hidden
                            </span>
                          )}

                          {p.isPopular && (
                            <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/50 bg-amber-500/20 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-300">
                              <Sparkles className="h-2.5 w-2.5" /> Most Popular
                            </span>
                          )}
                        </div>

                        {p.badge && (
                          <span className="rounded-lg bg-amber-500 text-black px-2 py-0.5 text-[10px] font-black uppercase tracking-wider">
                            {p.badge}
                          </span>
                        )}
                      </div>

                      {/* Plan Title & Price */}
                      <div className="mt-2 flex items-baseline justify-between gap-2">
                        <h3 className="font-display text-lg font-black uppercase tracking-wide text-white">
                          {p.name}
                        </h3>
                        <div className="text-right">
                          <span className="text-2xl font-black text-amber-400 font-display">
                            ${p.priceUsd || (p.priceCents / 100)}
                          </span>
                          <span className="text-xs text-slate-400 font-semibold ml-1">USD</span>
                        </div>
                      </div>

                      <p className="mt-2 text-xs text-slate-300 leading-relaxed min-h-[36px]">
                        {p.description}
                      </p>

                      {/* Duration Info */}
                      <div className="mt-4 flex items-center gap-4 rounded-xl border border-slate-800/80 bg-slate-900/50 p-3 text-xs">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-500 block">Duration</span>
                          <span className="font-bold text-white">
                            {p.duration?.value || p.durationDays} {p.duration?.unit || 'DAYS'}
                          </span>
                        </div>
                        <div className="border-l border-slate-800 pl-4">
                          <span className="text-[10px] uppercase font-bold text-slate-500 block">Effective</span>
                          <span className="font-bold text-slate-300">{p.durationDays} Total Calendar Days</span>
                        </div>
                      </div>

                      {/* Features Bullet List */}
                      <div className="mt-4 space-y-1.5">
                        <span className="text-[10px] uppercase font-bold text-slate-500 block tracking-wider">
                          Included Privileges ({p.features?.length || 0})
                        </span>
                        <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                          {p.features?.map((f, i) => (
                            <div key={i} className="flex items-start gap-2 text-xs text-slate-300">
                              <CheckCircle2 className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
                              <span className="leading-tight">{f}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Footer Controls */}
                    <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between gap-2">
                      <div className="text-[10px] font-mono text-slate-500 truncate max-w-[120px]" title={p.id}>
                        {p.id}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleTogglePlanActive(p)}
                          className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold border transition-colors ${
                            isActive
                              ? 'border-slate-700 bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                              : 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20'
                          }`}
                          title={isActive ? 'Disable plan from purchases' : 'Enable plan for purchases'}
                        >
                          {isActive ? 'Disable' : 'Enable'}
                        </button>

                        <button
                          onClick={() => openEditPlanModal(p)}
                          className="flex items-center gap-1.5 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 text-xs font-bold text-amber-300 hover:bg-amber-500/20 transition-colors"
                        >
                          <Edit className="h-3.5 w-3.5" /> Edit
                        </button>

                        <button
                          onClick={() => {
                            setDeletingPlan(p);
                            setModalType('DELETE_PLAN');
                          }}
                          className="rounded-lg p-1.5 text-rose-400 hover:bg-rose-500/10 transition-colors"
                          title="Delete / Archive Plan"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* --- MODALS --- */}

      {/* 1. GRANT MANUAL ACCESS MODAL */}
      {modalType === 'GRANT' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <form
            onSubmit={handleGrant}
            className="w-full max-w-md rounded-2xl border border-slate-800 bg-[#070b14] p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-display text-base font-bold uppercase tracking-wider text-white">
                Grant Manual Complimentary Subscription
              </h3>
              <button type="button" onClick={closeModal} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-300">
              <p className="font-bold">Strict Accounting Notice:</p>
              <p className="mt-0.5">
                Manual grants do not represent financial receipts. They will NOT be credited to gross sales or moderator commissions.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                Recipient User Email *
              </label>
              <input
                type="email"
                value={grantEmail}
                onChange={(e) => setGrantEmail(e.target.value)}
                required
                placeholder="user@example.com"
                className="w-full rounded-xl border border-slate-800 bg-slate-900/80 px-3.5 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Select Plan</label>
              <select
                value={grantPlanId}
                onChange={(e) => setGrantPlanId(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-900/80 px-3.5 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
              >
                {Object.values(SUBSCRIPTION_PLANS).map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.durationDays} Days) — ${(p.priceCents / 100).toFixed(0)} Normal Value
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-amber-400 mb-1">
                Mandatory Operational Reason *
              </label>
              <textarea
                value={reasonInput}
                onChange={(e) => setReasonInput(e.target.value)}
                required
                rows={3}
                placeholder="Legitimate administrative purpose for manual grant..."
                className="w-full rounded-xl border border-slate-800 bg-slate-900/80 px-3.5 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={closeModal}
                className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold uppercase text-black hover:bg-amber-400 disabled:opacity-50"
              >
                {isSubmitting ? 'Granting...' : 'Confirm Grant'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 2. EXTEND MODAL */}
      {modalType === 'EXTEND' && selectedSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <form
            onSubmit={handleExtend}
            className="w-full max-w-md rounded-2xl border border-slate-800 bg-[#070b14] p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-display text-base font-bold uppercase tracking-wider text-white">
                Extend Active Subscription
              </h3>
              <button type="button" onClick={closeModal} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Account: <span className="font-semibold text-white">{selectedSub.userId?.email}</span>
            </p>
            <p className="text-xs text-slate-400">
              Current Expiry: <span className="font-semibold text-white">{new Date(selectedSub.endDate).toLocaleDateString()}</span>
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                  Extension Value
                </label>
                <input
                  type="number"
                  min={1}
                  max={365}
                  value={extValue}
                  onChange={(e) => setExtValue(parseInt(e.target.value, 10) || 1)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900/80 px-3.5 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Unit</label>
                <select
                  value={extUnit}
                  onChange={(e) => setExtUnit(e.target.value as any)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900/80 px-3.5 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
                >
                  <option value="days">Days</option>
                  <option value="months">Months</option>
                  <option value="years">Years</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-amber-400 mb-1">
                Mandatory Extension Reason *
              </label>
              <textarea
                value={reasonInput}
                onChange={(e) => setReasonInput(e.target.value)}
                required
                rows={3}
                placeholder="Reason for extending subscription..."
                className="w-full rounded-xl border border-slate-800 bg-slate-900/80 px-3.5 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={closeModal}
                className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold uppercase text-black hover:bg-amber-400 disabled:opacity-50"
              >
                {isSubmitting ? 'Extending...' : 'Confirm Extension'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 3. REVOKE MODAL */}
      {modalType === 'REVOKE' && selectedSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <form
            onSubmit={handleRevoke}
            className="w-full max-w-md rounded-2xl border border-rose-900/50 bg-[#070b14] p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-rose-900/30 pb-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-rose-500" />
                <h3 className="font-display text-base font-bold uppercase tracking-wider text-rose-400">
                  Revoke Subscription
                </h3>
              </div>
              <button type="button" onClick={closeModal} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              User: <span className="font-semibold text-white">{selectedSub.userId?.email}</span>
            </p>

            <div>
              <label className="block text-xs font-bold uppercase text-rose-400 mb-1">
                Mandatory Revocation Reason *
              </label>
              <textarea
                value={reasonInput}
                onChange={(e) => setReasonInput(e.target.value)}
                required
                rows={3}
                placeholder="State verified basis for immediate subscription access termination..."
                className="w-full rounded-xl border border-slate-800 bg-slate-900/80 px-3.5 py-2 text-sm text-white focus:border-rose-500 focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={closeModal}
                className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold uppercase text-white hover:bg-rose-500 disabled:opacity-50"
              >
                {isSubmitting ? 'Revoking...' : 'Confirm Revocation'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 4. EDIT PLAN MODAL */}
      {modalType === 'EDIT_PLAN' && editingPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <form
            onSubmit={handleEditPlan}
            className="w-full max-w-xl rounded-2xl border border-slate-800 bg-[#070b14] p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Tag className="h-5 w-5 text-amber-400" />
                <h3 className="font-display text-base font-bold uppercase tracking-wider text-white">
                  Modify Plan Configuration & Pricing
                </h3>
              </div>
              <button type="button" onClick={closeModal} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-3 flex items-center justify-between text-xs font-mono text-slate-400">
              <span>Plan Identifier: <strong className="text-amber-400">{editingPlan.id}</strong></span>
              <span className="text-[10px] text-slate-500">MongoDB Direct Synchronization</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Plan Name *</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                  placeholder="e.g. 1 Month VIP Access"
                  className="w-full rounded-xl border border-slate-800 bg-slate-900/80 px-3.5 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-amber-400 mb-1">
                  Price in USD ($) *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input
                    type="number"
                    min={1}
                    step="any"
                    value={editPriceUsd}
                    onChange={(e) => setEditPriceUsd(parseFloat(e.target.value) || 0)}
                    required
                    className="w-full rounded-xl border border-slate-800 bg-slate-900/80 pl-9 pr-3.5 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Duration Unit</label>
                <select
                  value={editDurationUnit}
                  onChange={(e) => setEditDurationUnit(e.target.value as any)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900/80 px-3.5 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
                >
                  <option value="DAYS">Days</option>
                  <option value="MONTHS">Months</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Duration Value</label>
                <input
                  type="number"
                  min={1}
                  value={editDurationValue}
                  onChange={(e) => setEditDurationValue(parseInt(e.target.value, 10) || 1)}
                  required
                  className="w-full rounded-xl border border-slate-800 bg-slate-900/80 px-3.5 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                Promotional Badge (Optional)
              </label>
              <input
                type="text"
                value={editBadge}
                onChange={(e) => setEditBadge(e.target.value)}
                placeholder="e.g. MOST POPULAR, VIP TRIAL, MAX SAVINGS"
                className="w-full rounded-xl border border-slate-800 bg-slate-900/80 px-3.5 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Description *</label>
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                rows={2}
                required
                className="w-full rounded-xl border border-slate-800 bg-slate-900/80 px-3.5 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
              />
            </div>

            {/* Features Builder */}
            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                Included Features & Privileges
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={editFeatureInput}
                  onChange={(e) => setEditFeatureInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (editFeatureInput.trim()) {
                        setEditFeatures([...editFeatures, editFeatureInput.trim()]);
                        setEditFeatureInput('');
                      }
                    }
                  }}
                  placeholder="Type a feature and press Enter or Add..."
                  className="flex-1 rounded-xl border border-slate-800 bg-slate-900/80 px-3.5 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (editFeatureInput.trim()) {
                      setEditFeatures([...editFeatures, editFeatureInput.trim()]);
                      setEditFeatureInput('');
                    }
                  }}
                  className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-bold text-slate-200 hover:bg-slate-700"
                >
                  Add
                </button>
              </div>

              <div className="mt-2 space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {editFeatures.map((f, i) => (
                  <div key={i} className="flex items-center justify-between gap-2 rounded-lg border border-slate-800/80 bg-slate-900/40 px-3 py-1.5 text-xs text-slate-300">
                    <span className="truncate">{f}</span>
                    <button
                      type="button"
                      onClick={() => setEditFeatures(editFeatures.filter((_, idx) => idx !== i))}
                      className="text-slate-500 hover:text-rose-400 shrink-0"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Toggles */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <label className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/40 p-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editIsActive}
                  onChange={(e) => setEditIsActive(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-amber-500"
                />
                <span className="text-xs font-semibold text-slate-300">Active</span>
              </label>

              <label className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/40 p-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editIsVisible}
                  onChange={(e) => setEditIsVisible(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-amber-500"
                />
                <span className="text-xs font-semibold text-slate-300">Visible</span>
              </label>

              <label className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/40 p-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editIsPopular}
                  onChange={(e) => setEditIsPopular(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-amber-500"
                />
                <span className="text-xs font-semibold text-slate-300">Popular</span>
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={closeModal}
                className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-xl bg-amber-500 px-5 py-2 text-xs font-bold uppercase text-black hover:bg-amber-400 disabled:opacity-50 transition-colors"
              >
                {isSubmitting ? 'Saving...' : 'Save Plan Changes'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 5. CREATE PLAN MODAL */}
      {modalType === 'CREATE_PLAN' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <form
            onSubmit={handleCreatePlan}
            className="w-full max-w-xl rounded-2xl border border-slate-800 bg-[#070b14] p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <PlusCircle className="h-5 w-5 text-amber-400" />
                <h3 className="font-display text-base font-bold uppercase tracking-wider text-white">
                  Create New Subscription Plan
                </h3>
              </div>
              <button type="button" onClick={closeModal} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Plan Name *</label>
                <input
                  type="text"
                  value={createName}
                  onChange={(e) => {
                    setCreateName(e.target.value);
                    if (!createId) {
                      setCreateId(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '_'));
                    }
                  }}
                  required
                  placeholder="e.g. 7 Days VIP Pass"
                  className="w-full rounded-xl border border-slate-800 bg-slate-900/80 px-3.5 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-amber-400 mb-1">
                  Price in USD ($) *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input
                    type="number"
                    min={1}
                    step="any"
                    value={createPriceUsd}
                    onChange={(e) => setCreatePriceUsd(parseFloat(e.target.value) || 0)}
                    required
                    className="w-full rounded-xl border border-slate-800 bg-slate-900/80 pl-9 pr-3.5 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                  Plan Slug / Identifier
                </label>
                <input
                  type="text"
                  value={createId}
                  onChange={(e) => setCreateId(e.target.value)}
                  placeholder="e.g. 7_days or weekend_pass"
                  className="w-full rounded-xl border border-slate-800 bg-slate-900/80 px-3.5 py-2 text-sm text-white font-mono focus:border-amber-500 focus:outline-none"
                />
                <span className="text-[10px] text-slate-500 mt-0.5 block">Will be prefixed with PLAN_ automatically</span>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                  Promotional Badge
                </label>
                <input
                  type="text"
                  value={createBadge}
                  onChange={(e) => setCreateBadge(e.target.value)}
                  placeholder="e.g. NEW, VIP, POPULAR"
                  className="w-full rounded-xl border border-slate-800 bg-slate-900/80 px-3.5 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Duration Unit</label>
                <select
                  value={createDurationUnit}
                  onChange={(e) => setCreateDurationUnit(e.target.value as any)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900/80 px-3.5 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
                >
                  <option value="DAYS">Days</option>
                  <option value="MONTHS">Months</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Duration Value</label>
                <input
                  type="number"
                  min={1}
                  value={createDurationValue}
                  onChange={(e) => setCreateDurationValue(parseInt(e.target.value, 10) || 1)}
                  required
                  className="w-full rounded-xl border border-slate-800 bg-slate-900/80 px-3.5 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Description *</label>
              <textarea
                value={createDescription}
                onChange={(e) => setCreateDescription(e.target.value)}
                rows={2}
                required
                placeholder="Brief summary of entitlement benefits..."
                className="w-full rounded-xl border border-slate-800 bg-slate-900/80 px-3.5 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
              />
            </div>

            {/* Features Builder */}
            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                Included Features & Privileges
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={createFeatureInput}
                  onChange={(e) => setCreateFeatureInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (createFeatureInput.trim()) {
                        setCreateFeatures([...createFeatures, createFeatureInput.trim()]);
                        setCreateFeatureInput('');
                      }
                    }
                  }}
                  placeholder="Type a feature and press Enter..."
                  className="flex-1 rounded-xl border border-slate-800 bg-slate-900/80 px-3.5 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (createFeatureInput.trim()) {
                      setCreateFeatures([...createFeatures, createFeatureInput.trim()]);
                      setCreateFeatureInput('');
                    }
                  }}
                  className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-bold text-slate-200 hover:bg-slate-700"
                >
                  Add
                </button>
              </div>

              <div className="mt-2 space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {createFeatures.map((f, i) => (
                  <div key={i} className="flex items-center justify-between gap-2 rounded-lg border border-slate-800/80 bg-slate-900/40 px-3 py-1.5 text-xs text-slate-300">
                    <span className="truncate">{f}</span>
                    <button
                      type="button"
                      onClick={() => setCreateFeatures(createFeatures.filter((_, idx) => idx !== i))}
                      className="text-slate-500 hover:text-rose-400 shrink-0"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Toggles */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <label className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/40 p-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={createIsActive}
                  onChange={(e) => setCreateIsActive(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-amber-500"
                />
                <span className="text-xs font-semibold text-slate-300">Active</span>
              </label>

              <label className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/40 p-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={createIsVisible}
                  onChange={(e) => setCreateIsVisible(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-amber-500"
                />
                <span className="text-xs font-semibold text-slate-300">Visible</span>
              </label>

              <label className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/40 p-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={createIsPopular}
                  onChange={(e) => setCreateIsPopular(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-amber-500"
                />
                <span className="text-xs font-semibold text-slate-300">Popular</span>
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={closeModal}
                className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-xl bg-amber-500 px-5 py-2 text-xs font-bold uppercase text-black hover:bg-amber-400 disabled:opacity-50 transition-colors"
              >
                {isSubmitting ? 'Creating...' : 'Create Plan'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 6. DELETE / ARCHIVE PLAN CONFIRMATION MODAL */}
      {modalType === 'DELETE_PLAN' && deletingPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-rose-900/50 bg-[#070b14] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-rose-900/30 pb-3">
              <div className="flex items-center gap-2">
                <Trash2 className="h-5 w-5 text-rose-500" />
                <h3 className="font-display text-base font-bold uppercase tracking-wider text-rose-400">
                  Delete / Archive Plan
                </h3>
              </div>
              <button type="button" onClick={closeModal} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-sm text-slate-300">
              Are you sure you want to remove plan <strong className="text-white font-mono">{deletingPlan.name}</strong> ({deletingPlan.id})?
            </p>

            <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-300">
              <p className="font-bold">Database Safeguard Notice:</p>
              <p className="mt-1">
                If active customer subscriptions are linked to this plan, it will be automatically converted to <em>archived / disabled</em> so customer access is strictly preserved without interruption.
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={closeModal}
                className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeletePlan}
                disabled={isSubmitting}
                className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold uppercase text-white hover:bg-rose-500 disabled:opacity-50"
              >
                {isSubmitting ? 'Archiving...' : 'Confirm Remove'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
