'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { authClient } from '../../../lib/auth-client';
import { useDebounce } from '../../../hooks/useDebounce';
import {
  Search,
  Users,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Ban,
  CheckCircle2,
  Clock,
  Trash2,
  Edit,
  Eye,
  Sliders,
  AlertTriangle,
  RefreshCw,
  X,
  CreditCard,
  UserCheck,
  Calendar,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  History,
  Crown,
  UserPlus,
  Lock,
  EyeOff,
  Sparkles
} from 'lucide-react';
import { SUBSCRIPTION_PLANS } from '../../../shared/plans';

interface UserItem {
  id: string;
  _id?: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  accountStatus: 'ACTIVE' | 'SUSPENDED' | 'BLOCKED' | 'DELETED';
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  isActive?: boolean;
  isDeleted: boolean;
  statusReason?: string;
  suspendedUntil?: string;
  referralCode?: string;
  referredBy?: string;
  moderatorCommissionRate?: number;
  createdAt: string;
  orderCount: number;
  totalSpentUsd: number;
  activeSubscription?: {
    id?: string;
    _id?: string;
    planId: string;
    planName?: string;
    status: string;
    startDate?: string;
    endDate: string;
    isManualGrant?: boolean;
    daysRemaining?: number;
    isExpired?: boolean;
    secretCode?: string;
    isSecretCodeClaimed?: boolean;
    isApprovedByAdmin?: boolean;
  };
}

export default function AdminUsersPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [users, setUsers] = useState<UserItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 350);
  const [statusFilter, setStatusFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [subFilter, setSubFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  // Sync with URL query parameters for nested sidebar items
  useEffect(() => {
    const statusParam = searchParams.get('status') || '';
    const subParam = searchParams.get('sub') || '';
    const roleParam = searchParams.get('role') || '';
    setStatusFilter(statusParam);
    setSubFilter(subParam === 'ACTIVE' || subParam === 'true' ? 'ACTIVE' : subParam === 'INACTIVE' || subParam === 'false' ? 'INACTIVE' : subParam);
    setRoleFilter(roleParam);
    setPage(1);
  }, [searchParams]);

  // Modals state
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);
  const [detailedUser, setDetailedUser] = useState<any>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [activeModal, setActiveModal] = useState<
    'VIEW' | 'EDIT_PROFILE' | 'STATUS_CHANGE' | 'DELETE' | 'GRANT_SUB' | 'EXTEND_SUB' | 'REVOKE_SUB' | 'CREATE_STAFF' | null
  >(null);

  // Form states
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editRole, setEditRole] = useState('USER');
  const [editCommissionRate, setEditCommissionRate] = useState(10);
  const [editIsEmailVerified, setEditIsEmailVerified] = useState(false);
  const [editIsPhoneVerified, setEditIsPhoneVerified] = useState(false);
  const [editIsActive, setEditIsActive] = useState(true);
  const [statusAction, setStatusAction] = useState<'BLOCK' | 'UNBLOCK' | 'SUSPEND'>('BLOCK');
  const [suspendDays, setSuspendDays] = useState(7);
  const [reasonInput, setReasonInput] = useState('');
  const [subPlanId, setSubPlanId] = useState('15_days');
  const [extValue, setExtValue] = useState(30);
  const [extUnit, setExtUnit] = useState<'days' | 'months' | 'years'>('days');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Staff creation states
  const [staffRole, setStaffRole] = useState<'SUPER_ADMIN' | 'MODERATOR'>('SUPER_ADMIN');
  const [staffName, setStaffName] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [staffPhone, setStaffPhone] = useState('');
  const [staffPassword, setStaffPassword] = useState('');
  const [staffShowPassword, setStaffShowPassword] = useState(false);
  const [staffCommissionRate, setStaffCommissionRate] = useState<number>(50);
  const [staffNotes, setStaffNotes] = useState('');
  const [staffReason, setStaffReason] = useState('');

  const [summaryCounts, setSummaryCounts] = useState<{
    totalUsers: number;
    totalAdmins: number;
    totalMods: number;
    totalActiveSubs: number;
  }>({
    totalUsers: 0,
    totalAdmins: 0,
    totalMods: 0,
    totalActiveSubs: 0
  });

  const fetchUsers = useCallback(async (bypassCache: boolean = false) => {
    setIsLoading(true);
    setActionError('');
    try {
      const res = await authClient.getAdminUsers({
        page,
        limit: 20,
        search: debouncedSearch.trim() || undefined,
        accountStatus: statusFilter || undefined,
        status: statusFilter || undefined,
        role: roleFilter || undefined,
        subscriptionStatus: subFilter || undefined,
        hasActiveSubscription: subFilter || undefined,
        sub: subFilter || undefined
      }, bypassCache);
      if (res && res.users) {
        setUsers(res.users);
        setTotal(res.total || 0);
        setTotalPages(res.totalPages || Math.ceil((res.total || 0) / 20) || 1);
        if (res.summary) {
          setSummaryCounts(res.summary);
        }
      }
    } catch (err: any) {
      setActionError(err.message || 'Failed to load user records');
    } finally {
      setIsLoading(false);
    }
  }, [page, debouncedSearch, statusFilter, roleFilter, subFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const openViewModal = async (u: UserItem) => {
    setSelectedUser(u);
    setActiveModal('VIEW');
    setIsDetailLoading(true);
    try {
      const targetId = (u.id || u._id)!;
      const res = await authClient.getAdminUserDetails(targetId);
      setDetailedUser(res);
    } catch (err: any) {
      setActionError(err.message || 'Failed to load full user details');
    } finally {
      setIsDetailLoading(false);
    }
  };

  const openEditModal = (u: UserItem) => {
    setSelectedUser(u);
    setEditName(u.name || '');
    setEditPhone(u.phone || '');
    setEditRole(u.role || 'USER');
    setEditCommissionRate(u.moderatorCommissionRate ?? 10);
    setEditIsEmailVerified(!!u.isEmailVerified);
    setEditIsPhoneVerified(!!u.isPhoneVerified);
    setEditIsActive(u.isActive !== false);
    setReasonInput('');
    setActiveModal('EDIT_PROFILE');
  };

  const openStatusModal = (u: UserItem, action: 'BLOCK' | 'UNBLOCK' | 'SUSPEND') => {
    setSelectedUser(u);
    setStatusAction(action);
    setReasonInput('');
    setSuspendDays(7);
    setActiveModal('STATUS_CHANGE');
  };

  const openDeleteModal = (u: UserItem) => {
    setSelectedUser(u);
    setReasonInput('');
    setActiveModal('DELETE');
  };

  const openGrantSubModal = (u: UserItem) => {
    setSelectedUser(u);
    setSubPlanId('15_days');
    setReasonInput('');
    setActiveModal('GRANT_SUB');
  };

  const openExtendSubModal = (u: UserItem) => {
    setSelectedUser(u);
    setExtValue(30);
    setExtUnit('days');
    setReasonInput('');
    setActiveModal('EXTEND_SUB');
  };

  const openRevokeSubModal = (u: UserItem) => {
    setSelectedUser(u);
    setReasonInput('');
    setActiveModal('REVOKE_SUB');
  };

  const closeModal = () => {
    setActiveModal(null);
    setSelectedUser(null);
    setDetailedUser(null);
    setReasonInput('');
    setActionError('');
  };

  const openCreateStaffModal = (defaultRole: 'SUPER_ADMIN' | 'MODERATOR' = 'SUPER_ADMIN') => {
    setStaffRole(defaultRole);
    setStaffName('');
    setStaffEmail('');
    setStaffPhone('');
    setStaffPassword('');
    setStaffShowPassword(false);
    setStaffCommissionRate(defaultRole === 'MODERATOR' ? 50 : 10);
    setStaffNotes('');
    setStaffReason(`Direct ${defaultRole === 'SUPER_ADMIN' ? 'Administrator' : 'Moderator'} provisioning via User Management`);
    setActionError('');
    setActiveModal('CREATE_STAFF');
  };

  const generateStaffPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%';
    let pwd = '';
    for (let i = 0; i < 12; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setStaffPassword(pwd);
    setStaffShowPassword(true);
  };

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffName.trim()) {
      setActionError('Full Name is required.');
      return;
    }
    if (!staffEmail.trim() || !staffEmail.includes('@')) {
      setActionError('A valid Email address is required.');
      return;
    }
    if (!staffPassword || staffPassword.length < 6) {
      setActionError('Password must be at least 6 characters long.');
      return;
    }
    if (!staffReason.trim()) {
      setActionError('Mandatory administrative reason is required for audit logs.');
      return;
    }

    setIsSubmitting(true);
    setActionError('');
    try {
      await authClient.createAdminStaffUser({
        name: staffName.trim(),
        email: staffEmail.trim(),
        phone: staffPhone.trim() || undefined,
        password: staffPassword,
        role: staffRole,
        commissionRate: staffRole === 'MODERATOR' ? staffCommissionRate : undefined,
        notes: staffNotes.trim() || undefined,
        reason: staffReason.trim()
      });

      const roleLabel = staffRole === 'SUPER_ADMIN' ? 'Platform Administrator' : 'Moderator Partner';
      setActionSuccess(`Staff account created successfully: ${staffEmail.trim()} (${roleLabel}) has been saved to MongoDB.`);
      closeModal();
      authClient.clearCache();
      if (roleFilter !== staffRole && roleFilter !== '') {
        setRoleFilter(staffRole);
      } else {
        await fetchUsers(true);
      }
    } catch (err: any) {
      setActionError(err.message || 'Failed to create staff account');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Form Submissions
  const handleEditProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    if (!reasonInput.trim()) {
      setActionError('A clear justification reason is mandatory for profile modification.');
      return;
    }
    setIsSubmitting(true);
    try {
      const targetId = (selectedUser.id || selectedUser._id)!;
      await authClient.updateAdminUserProfile(targetId, {
        name: editName.trim(),
        phone: editPhone.trim() || undefined,
        role: editRole,
        moderatorCommissionRate: editRole === 'MODERATOR' ? Number(editCommissionRate) : undefined,
        isEmailVerified: editIsEmailVerified,
        isPhoneVerified: editIsPhoneVerified,
        isActive: editIsActive,
        reason: reasonInput.trim()
      });
      setActionSuccess(`User account role & profile for ${selectedUser.email} updated and stored in database successfully.`);
      closeModal();
      authClient.clearCache();
      await fetchUsers(true);
    } catch (err: any) {
      setActionError(err.message || 'Failed to update user profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    if (!reasonInput.trim()) {
      setActionError('Administrative reason is required for account status changes.');
      return;
    }
    setIsSubmitting(true);
    try {
      let suspendedUntil: string | undefined;
      if (statusAction === 'SUSPEND') {
        const d = new Date();
        d.setDate(d.getDate() + suspendDays);
        suspendedUntil = d.toISOString();
      }

      const targetId = (selectedUser.id || selectedUser._id)!;
      await authClient.changeAdminUserStatus(targetId, {
        action: statusAction,
        reason: reasonInput.trim(),
        suspendedUntil
      });
      setActionSuccess(`Account status changed to ${statusAction} for ${selectedUser.email}.`);
      closeModal();
      authClient.clearCache();
      await fetchUsers(true);
    } catch (err: any) {
      setActionError(err.message || 'Status change rejected');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    if (!reasonInput.trim()) {
      setActionError('A verifiable reason is required for user account deletion.');
      return;
    }
    setIsSubmitting(true);
    try {
      const targetId = (selectedUser.id || selectedUser._id)!;
      await authClient.deleteAdminUser(targetId, reasonInput.trim());
      setActionSuccess(`User account ${selectedUser.email} has been permanently deleted from MongoDB.`);
      closeModal();
      authClient.clearCache();
      await fetchUsers(true);
    } catch (err: any) {
      setActionError(err.message || 'Failed to delete user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGrantSub = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    if (!reasonInput.trim()) {
      setActionError('Mandatory reason required for manual complimentary subscription grants.');
      return;
    }
    setIsSubmitting(true);
    try {
      await authClient.grantAdminManualSubscription({
        targetEmail: selectedUser.email,
        planId: subPlanId,
        reason: reasonInput.trim()
      });
      setActionSuccess(`Manual subscription (${subPlanId}) granted to ${selectedUser.email}. Recorded as non-revenue grant.`);
      closeModal();
      authClient.clearCache();
      await fetchUsers(true);
    } catch (err: any) {
      setActionError(err.message || 'Failed to grant subscription');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExtendSub = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !selectedUser.activeSubscription) return;
    if (!reasonInput.trim()) {
      setActionError('Mandatory reason required to extend subscription access.');
      return;
    }
    setIsSubmitting(true);
    try {
      const subId = (selectedUser.activeSubscription.id || selectedUser.activeSubscription._id)!;
      await authClient.extendAdminSubscription({
        subscriptionId: subId,
        extensionValue: extValue,
        extensionUnit: extUnit,
        reason: reasonInput.trim()
      });
      setActionSuccess(`Subscription extended by ${extValue} ${extUnit} for ${selectedUser.email}.`);
      closeModal();
      authClient.clearCache();
      await fetchUsers(true);
    } catch (err: any) {
      setActionError(err.message || 'Failed to extend subscription');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRevokeSub = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !selectedUser.activeSubscription) return;
    if (!reasonInput.trim()) {
      setActionError('Mandatory reason required to revoke active subscription.');
      return;
    }
    setIsSubmitting(true);
    try {
      const subId = (selectedUser.activeSubscription.id || selectedUser.activeSubscription._id)!;
      await authClient.revokeAdminSubscription({
        subscriptionId: subId,
        reason: reasonInput.trim()
      });
      setActionSuccess(`Subscription revoked for ${selectedUser.email}.`);
      closeModal();
      authClient.clearCache();
      await fetchUsers(true);
    } catch (err: any) {
      setActionError(err.message || 'Failed to revoke subscription');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-black uppercase tracking-wider text-white">
            User Management
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Search, inspect, and administratively govern platform accounts with immutable audit tracking.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => openCreateStaffModal('SUPER_ADMIN')}
            className="flex items-center gap-1.5 rounded-lg border border-purple-500/40 bg-purple-500/15 px-3 py-2 text-xs font-bold uppercase tracking-wider text-purple-300 hover:bg-purple-500/25 transition-all shadow-sm"
          >
            <ShieldAlert className="h-3.5 w-3.5 text-purple-400" />
            <span>+ Add Admin</span>
          </button>
          <button
            type="button"
            onClick={() => openCreateStaffModal('MODERATOR')}
            className="flex items-center gap-1.5 rounded-lg border border-blue-500/40 bg-blue-500/15 px-3 py-2 text-xs font-bold uppercase tracking-wider text-blue-300 hover:bg-blue-500/25 transition-all shadow-sm"
          >
            <Shield className="h-3.5 w-3.5 text-blue-400" />
            <span>+ Add Moderator</span>
          </button>
          <button
            onClick={() => fetchUsers(true)}
            disabled={isLoading}
            className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800/80 px-3.5 py-2 text-xs font-semibold uppercase tracking-wider text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Feedback alerts */}
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

      {/* Quick Category Filter Tabs Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          type="button"
          onClick={() => {
            router.push('/heda/users');
            setStatusFilter('');
            setSubFilter('');
            setRoleFilter('');
            setPage(1);
          }}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
            !statusFilter && !subFilter && !roleFilter
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.25)]'
              : 'border border-slate-800 bg-[#070b14] text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Users className="h-3.5 w-3.5" />
          <span>All Users</span>
          <span className="ml-1 rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-mono text-slate-300 font-bold">
            {summaryCounts.totalUsers || total}
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            router.push('/heda/users?role=SUPER_ADMIN');
            setStatusFilter('');
            setSubFilter('');
            setRoleFilter('SUPER_ADMIN');
            setPage(1);
          }}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
            roleFilter === 'SUPER_ADMIN'
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.25)] font-bold'
              : 'border border-slate-800 bg-[#070b14] text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <ShieldAlert className="h-3.5 w-3.5 text-purple-400" />
          <span>👑 All Admins</span>
          <span className={`ml-1 rounded-full px-2 py-0.5 text-[10px] font-mono font-bold ${
            roleFilter === 'SUPER_ADMIN' ? 'bg-purple-900/60 border border-purple-500/40 text-purple-200' : 'bg-slate-800 text-slate-300'
          }`}>
            {summaryCounts.totalAdmins || (roleFilter === 'SUPER_ADMIN' ? total : 0)}
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            router.push('/heda/users?sub=ACTIVE');
            setStatusFilter('');
            setSubFilter('ACTIVE');
            setRoleFilter('');
            setPage(1);
          }}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
            subFilter === 'ACTIVE'
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black font-black border border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.35)]'
              : 'border border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20'
          }`}
        >
          <Crown className="h-3.5 w-3.5" />
          <span>⭐ Premium Subscribers</span>
          {summaryCounts.totalActiveSubs > 0 && (
            <span className="ml-1 rounded-full bg-black/40 px-2 py-0.5 text-[10px] font-mono text-white font-bold">
              {summaryCounts.totalActiveSubs}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => {
            router.push('/heda/users?sub=INACTIVE');
            setStatusFilter('');
            setSubFilter('INACTIVE');
            setRoleFilter('');
            setPage(1);
          }}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
            subFilter === 'INACTIVE'
              ? 'bg-slate-700 text-white border border-slate-600 font-bold shadow-md'
              : 'border border-slate-800 bg-[#070b14] text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <UserCheck className="h-3.5 w-3.5" />
          <span>Free Tier Members</span>
        </button>

        <button
          type="button"
          onClick={() => {
            router.push('/heda/users?role=MODERATOR');
            setStatusFilter('');
            setSubFilter('');
            setRoleFilter('MODERATOR');
            setPage(1);
          }}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
            roleFilter === 'MODERATOR'
              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.25)] font-bold'
              : 'border border-slate-800 bg-[#070b14] text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Shield className="h-3.5 w-3.5" />
          <span>Moderator Partners</span>
          <span className={`ml-1 rounded-full px-2 py-0.5 text-[10px] font-mono font-bold ${
            roleFilter === 'MODERATOR' ? 'bg-blue-900/60 border border-blue-500/40 text-blue-200' : 'bg-slate-800 text-slate-300'
          }`}>
            {summaryCounts.totalMods || (roleFilter === 'MODERATOR' ? total : 0)}
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            router.push('/heda/users?status=SUSPENDED');
            setStatusFilter('SUSPENDED');
            setSubFilter('');
            setRoleFilter('');
            setPage(1);
          }}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
            statusFilter === 'SUSPENDED'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.25)] font-bold'
              : 'border border-slate-800 bg-[#070b14] text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Clock className="h-3.5 w-3.5" />
          <span>Suspended</span>
        </button>

        <button
          type="button"
          onClick={() => {
            router.push('/heda/users?status=BLOCKED');
            setStatusFilter('BLOCKED');
            setSubFilter('');
            setRoleFilter('');
            setPage(1);
          }}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
            statusFilter === 'BLOCKED'
              ? 'bg-red-500/20 text-red-300 border border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.25)] font-bold'
              : 'border border-slate-800 bg-[#070b14] text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Ban className="h-3.5 w-3.5" />
          <span>Blocked</span>
        </button>
      </div>

      {/* Contextual Action Banners for Staff Views */}
      {roleFilter === 'SUPER_ADMIN' && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-purple-500/30 bg-gradient-to-r from-purple-950/40 via-purple-900/20 to-slate-900/40 p-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-purple-500/40 bg-purple-500/10 text-purple-400">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-sm font-black uppercase tracking-wider text-purple-300">
                  Administrator Directory (Platform Governance)
                </h2>
                <span className="rounded-full bg-purple-500/20 px-2.5 py-0.5 text-[10px] font-mono font-bold text-purple-300 border border-purple-500/30">
                  {summaryCounts.totalAdmins || total} Active Admins
                </span>
              </div>
              <p className="mt-0.5 text-xs text-slate-400">
                Accounts with root administrative access to manage platform tools, billing, and system configurations.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => openCreateStaffModal('SUPER_ADMIN')}
            className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-purple-600/30 hover:from-purple-500 hover:to-indigo-500 transition-all shrink-0"
          >
            <UserPlus className="h-4 w-4" />
            <span>+ Add New Admin</span>
          </button>
        </div>
      )}

      {roleFilter === 'MODERATOR' && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-blue-500/30 bg-gradient-to-r from-blue-950/40 via-blue-900/20 to-slate-900/40 p-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-blue-500/40 bg-blue-500/10 text-blue-400">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-sm font-black uppercase tracking-wider text-blue-300">
                  Moderator Partner Network (Accredited Affiliates)
                </h2>
                <span className="rounded-full bg-blue-500/20 px-2.5 py-0.5 text-[10px] font-mono font-bold text-blue-300 border border-blue-500/30">
                  {summaryCounts.totalMods || total} Active Moderators
                </span>
              </div>
              <p className="mt-0.5 text-xs text-slate-400">
                Partner moderators accredited with custom referral commission privileges (default 50%) for deposit conversions.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => openCreateStaffModal('MODERATOR')}
            className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-blue-600/30 hover:from-blue-500 hover:to-cyan-500 transition-all shrink-0"
          >
            <UserPlus className="h-4 w-4" />
            <span>+ Add New Moderator</span>
          </button>
        </div>
      )}

      {/* Search and Filters Bar */}
      <div className="rounded-2xl border border-slate-800 bg-[#070b14] p-4 shadow-xl">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <div className="relative sm:col-span-2 lg:col-span-2">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by name, email, phone number..."
              className="w-full rounded-xl border border-slate-800 bg-slate-900/60 pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
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
              <option value="">All Account Statuses</option>
              <option value="ACTIVE">Active Accounts</option>
              <option value="SUSPENDED">Suspended Accounts</option>
              <option value="BLOCKED">Blocked Accounts</option>
              <option value="DELETED">Soft-Deleted Accounts</option>
            </select>
          </div>

          <div>
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-xl border border-slate-800 bg-slate-900/60 px-3.5 py-2.5 text-sm text-slate-300 focus:border-amber-500 focus:outline-none"
            >
              <option value="">All Account Roles</option>
              <option value="USER">VIP Members (USER)</option>
              <option value="MODERATOR">Moderator Partners</option>
              <option value="SUPER_ADMIN">Main Admins</option>
            </select>
          </div>

          <div>
            <select
              value={subFilter}
              onChange={(e) => {
                setSubFilter(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-xl border border-slate-800 bg-slate-900/60 px-3.5 py-2.5 text-sm text-slate-300 focus:border-amber-500 focus:outline-none"
            >
              <option value="">All Subscription States</option>
              <option value="ACTIVE">⭐ Active VIP Subscribers</option>
              <option value="INACTIVE">No Active Subscription</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-[#070b14] shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="border-b border-slate-800 bg-slate-900/40 font-display text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-4 py-3.5">User</th>
                <th className="px-4 py-3.5">Contact & Auth</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5">Active Subscription</th>
                <th className="px-4 py-3.5">Financials</th>
                <th className="px-4 py-3.5">Referral</th>
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
                        Querying user registry...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    No registered platform accounts match the specified criteria.
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const isBlocked = u.accountStatus === 'BLOCKED';
                  const isSuspended = u.accountStatus === 'SUSPENDED';
                  const isDeleted = u.accountStatus === 'DELETED' || u.isDeleted;
                  const hasSub = !!u.activeSubscription;

                  return (
                    <tr
                      key={u.id}
                      className={`hover:bg-slate-800/30 transition-colors ${
                        isDeleted ? 'opacity-50 bg-rose-950/10' : ''
                      }`}
                    >
                      {/* User Info */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-700 bg-slate-800 text-slate-200 font-black text-xs">
                            {u.name?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-white">{u.name}</span>
                              <span
                                className={`rounded px-1.5 py-0.2 text-[9px] font-bold uppercase ${
                                  u.role === 'SUPER_ADMIN'
                                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                    : u.role === 'MODERATOR'
                                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                    : 'bg-slate-800 text-slate-400'
                                }`}
                              >
                                {u.role === 'SUPER_ADMIN' ? 'OWNER ADMIN' : u.role}
                              </span>
                            </div>
                            <div className="text-[11px] font-mono text-slate-500">
                              ID: {u.id.substring(0, 10)}...
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Contact & Verification */}
                      <td className="px-4 py-4">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 text-xs">
                            <span className="text-slate-200">{u.email}</span>
                            {u.isEmailVerified ? (
                              <span title="Email Verified">
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                              </span>
                            ) : (
                              <span title="Email Unverified">
                                <Clock className="h-3.5 w-3.5 text-amber-400" />
                              </span>
                            )}
                          </div>
                          {u.phone && (
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono">
                              <span>{u.phone}</span>
                              {u.isPhoneVerified && (
                                <span title="Phone Verified">
                                  <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                                </span>
                              )}
                            </div>
                          )}
                          <div className="text-[10px] text-slate-500">
                            Reg: {new Date(u.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-4">
                        {isDeleted ? (
                          <span className="inline-flex items-center gap-1 rounded-full border border-rose-500/30 bg-rose-500/10 px-2 py-0.5 text-[10px] font-bold text-rose-400 uppercase">
                            Soft Deleted
                          </span>
                        ) : isBlocked ? (
                          <span className="inline-flex items-center gap-1 rounded-full border border-red-500/30 bg-red-500/10 px-2 py-0.5 text-[10px] font-bold text-red-400 uppercase">
                            <Ban className="h-3 w-3" /> Blocked
                          </span>
                        ) : isSuspended ? (
                          <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-400 uppercase">
                            <Clock className="h-3 w-3" /> Suspended
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400 uppercase">
                            <UserCheck className="h-3 w-3" /> Active
                          </span>
                        )}
                        {u.statusReason && (
                          <div className="mt-1 text-[10px] text-slate-400 max-w-[160px] truncate" title={u.statusReason}>
                            {u.statusReason}
                          </div>
                        )}
                      </td>

                      {/* Active Subscription */}
                      <td className="px-4 py-4">
                        {hasSub ? (
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-display text-xs font-bold uppercase text-amber-400">
                                {u.activeSubscription?.planName || u.activeSubscription?.planId?.replace(/_/g, ' ')}
                              </span>
                              {u.activeSubscription?.isManualGrant && (
                                <span className="rounded bg-slate-800 px-1 py-0.2 text-[8px] font-bold text-slate-300">
                                  MANUAL COMP
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400">
                              Exp: {new Date(u.activeSubscription!.endDate).toLocaleDateString()}
                            </div>
                            {/* Kotodin Baki Prominent Display */}
                            {u.activeSubscription?.isExpired || (u.activeSubscription?.daysRemaining !== undefined && u.activeSubscription.daysRemaining <= 0) ? (
                              <span className="inline-flex items-center gap-1 rounded bg-rose-500/20 px-2 py-0.5 text-[10px] font-bold text-rose-300 border border-rose-500/30">
                                Expired (0 Days)
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-500/30">
                                <Clock className="h-3 w-3" />
                                {u.activeSubscription?.daysRemaining ?? '—'} Days Left
                              </span>
                            )}
                            {/* Secret Code status */}
                            {u.activeSubscription?.secretCode && (
                              <div className="text-[10px] font-mono">
                                {u.activeSubscription.isSecretCodeClaimed ? (
                                  <span className="text-emerald-400 flex items-center gap-1">
                                    <CheckCircle2 className="h-2.5 w-2.5" /> Code Unlocked
                                  </span>
                                ) : (
                                  <span className="text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 inline-block font-semibold">
                                    Code: {u.activeSubscription.secretCode}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-500">None</span>
                        )}
                      </td>

                      {/* Financials */}
                      <td className="px-4 py-4">
                        <div className="text-xs font-semibold text-emerald-400">
                          ${(u.totalSpentUsd || 0).toLocaleString()}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {u.orderCount || 0} order{u.orderCount === 1 ? '' : 's'}
                        </div>
                      </td>

                      {/* Referral */}
                      <td className="px-4 py-4 text-xs font-mono">
                        <div className="text-slate-300">{u.referralCode || '—'}</div>
                        {u.referredBy && (
                          <div className="text-[10px] text-slate-500">Ref by: {u.referredBy}</div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openViewModal(u)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
                            title="View Full Profile & History"
                          >
                            <Eye className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() => openEditModal(u)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
                            title="Edit Permitted Profile Info"
                          >
                            <Edit className="h-4 w-4" />
                          </button>

                          {hasSub ? (
                            <>
                              <button
                                onClick={() => openExtendSubModal(u)}
                                className="rounded-lg p-1.5 text-amber-400 hover:bg-amber-500/10"
                                title="Extend Active Subscription"
                              >
                                <Sliders className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => openRevokeSubModal(u)}
                                className="rounded-lg p-1.5 text-rose-400 hover:bg-rose-500/10"
                                title="Revoke Subscription Access"
                              >
                                <ShieldAlert className="h-4 w-4" />
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => openGrantSubModal(u)}
                              className="rounded-lg p-1.5 text-emerald-400 hover:bg-emerald-500/10"
                              title="Grant Manual Premium Access"
                            >
                              <PlusCircle className="h-4 w-4" />
                            </button>
                          )}

                          {isBlocked || isSuspended ? (
                            <button
                              onClick={() => openStatusModal(u, 'UNBLOCK')}
                              className="rounded-lg p-1.5 text-emerald-400 hover:bg-emerald-500/10"
                              title="Unblock User Account"
                            >
                              <CheckCircle2 className="h-4 w-4" />
                            </button>
                          ) : (
                            <>
                              <button
                                onClick={() => openStatusModal(u, 'SUSPEND')}
                                className="rounded-lg p-1.5 text-amber-400 hover:bg-amber-500/10"
                                title="Suspend User Temporarily"
                              >
                                <Clock className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => openStatusModal(u, 'BLOCK')}
                                className="rounded-lg p-1.5 text-red-400 hover:bg-red-500/10"
                                title="Block User Account"
                              >
                                <Ban className="h-4 w-4" />
                              </button>
                            </>
                          )}

                          {!isDeleted && (
                            <button
                              onClick={() => openDeleteModal(u)}
                              className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-500/10"
                              title="Soft Delete User (Retains Financials)"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
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

        {/* Pagination Bar */}
        <div className="flex items-center justify-between border-t border-slate-800 bg-slate-900/40 px-4 py-3 sm:px-6">
          <div className="text-xs text-slate-400">
            Showing <span className="font-semibold text-white">{users.length}</span> of{' '}
            <span className="font-semibold text-white">{total}</span> accounts
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

      {/* --- MODALS --- */}

      {/* 1. VIEW DETAILED USER MODAL */}
      {activeModal === 'VIEW' && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-4xl rounded-2xl border border-slate-800 bg-[#070b14] p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="font-display text-lg font-bold uppercase tracking-wider text-white">
                  User Intelligence Profile
                </h3>
                <p className="text-xs font-mono text-slate-400">UID: {selectedUser.id}</p>
              </div>
              <button onClick={closeModal} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            {isDetailLoading ? (
              <div className="py-16 text-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent mx-auto" />
                <p className="mt-3 text-xs uppercase tracking-wider text-slate-400">
                  Compiling user financial records & audit timeline...
                </p>
              </div>
            ) : detailedUser ? (
              <div className="space-y-6">
                {/* Profile Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
                    <p className="text-xs uppercase text-slate-500 font-bold">Personal</p>
                    <p className="text-base font-semibold text-white mt-1">{detailedUser.user.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{detailedUser.user.email}</p>
                    {detailedUser.user.phone && (
                      <p className="text-xs font-mono text-slate-400">{detailedUser.user.phone}</p>
                    )}
                  </div>
                  <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
                    <p className="text-xs uppercase text-slate-500 font-bold">Account Security</p>
                    <p className="text-sm font-semibold text-white mt-1">Role: {detailedUser.user.role}</p>
                    <p className="text-xs text-slate-400">Status: {detailedUser.user.accountStatus}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Joined: {new Date(detailedUser.user.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
                    <p className="text-xs uppercase text-slate-500 font-bold">Lifetime Financials</p>
                    <p className="text-lg font-bold text-emerald-400 mt-1">
                      ${((detailedUser.payments || []).reduce((sum: number, p: any) => sum + ((p.status === 'FINISHED' || p.paymentStatus === 'FINISHED') ? (p.priceAmount ?? p.priceAmountUsd ?? 0) : 0), 0)).toLocaleString()} USD
                    </p>
                    <p className="text-xs text-slate-400">
                      {(detailedUser.payments || []).length} payment orders generated
                    </p>
                  </div>
                </div>

                {/* Subscriptions History */}
                <div>
                  <h4 className="font-display text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                    Subscription Lifecycle History ({detailedUser.subscriptions?.length || 0})
                  </h4>
                  <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/30">
                    <table className="w-full text-left text-xs">
                      <thead className="border-b border-slate-800 bg-slate-900/60 text-slate-400 uppercase text-[10px]">
                        <tr>
                          <th className="p-3">Plan</th>
                          <th className="p-3">Type</th>
                          <th className="p-3">Status</th>
                          <th className="p-3">Period</th>
                          <th className="p-3">Grant Reason</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {detailedUser.subscriptions?.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="p-4 text-center text-slate-500">
                              No subscription records found.
                            </td>
                          </tr>
                        ) : (
                          detailedUser.subscriptions.map((s: any) => (
                            <tr key={s._id || s.id}>
                              <td className="p-3 font-semibold text-white uppercase">{s.planName || s.planId?.replace(/_/g, ' ')}</td>
                              <td className="p-3">
                                {s.isManualGrant ? (
                                  <span className="rounded bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-bold text-amber-400 border border-amber-500/30">
                                    MANUAL COMP
                                  </span>
                                ) : (
                                  <span className="text-slate-400">Crypto Sale</span>
                                )}
                              </td>
                              <td className="p-3">
                                <span className={`font-bold ${s.status === 'ACTIVE' ? 'text-emerald-400' : 'text-slate-500'}`}>
                                  {s.status}
                                </span>
                              </td>
                              <td className="p-3 text-slate-400 font-mono text-[11px]">
                                {new Date(s.startDate).toLocaleDateString()} — {new Date(s.endDate).toLocaleDateString()}
                              </td>
                              <td className="p-3 text-slate-400">{s.grantReason || s.revocationReason || '—'}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Payments History */}
                <div>
                  <h4 className="font-display text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                    Payment Orders ({detailedUser.payments?.length || 0})
                  </h4>
                  <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/30">
                    <table className="w-full text-left text-xs">
                      <thead className="border-b border-slate-800 bg-slate-900/60 text-slate-400 uppercase text-[10px]">
                        <tr>
                          <th className="p-3">Order ID</th>
                          <th className="p-3">Plan</th>
                          <th className="p-3">Amount</th>
                          <th className="p-3">Currency</th>
                          <th className="p-3">Status</th>
                          <th className="p-3">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {detailedUser.payments?.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="p-4 text-center text-slate-500">
                              No payment orders registered.
                            </td>
                          </tr>
                        ) : (
                          detailedUser.payments.map((p: any) => (
                            <tr key={p._id || p.id}>
                              <td className="p-3 font-mono text-slate-400 text-[11px]">{p.orderId}</td>
                              <td className="p-3 font-semibold text-white uppercase">{p.planName || p.planId?.replace(/_/g, ' ')}</td>
                              <td className="p-3 font-semibold text-emerald-400">${p.priceAmount ?? p.priceAmountUsd ?? 0}</td>
                              <td className="p-3 uppercase text-slate-400">{p.payCurrency || p.priceCurrency}</td>
                              <td className="p-3">
                                <span className={`font-bold ${(p.status === 'FINISHED' || p.paymentStatus === 'FINISHED') ? 'text-emerald-400' : 'text-amber-400'}`}>
                                  {p.status || p.paymentStatus}
                                </span>
                              </td>
                              <td className="p-3 text-slate-500">{new Date(p.createdAt).toLocaleDateString()}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Audit Logs */}
                <div>
                  <h4 className="font-display text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                    Administrative Governance Audit Trail ({detailedUser.auditLogs?.length || 0})
                  </h4>
                  <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/30">
                    <table className="w-full text-left text-xs">
                      <thead className="border-b border-slate-800 bg-slate-900/60 text-slate-400 uppercase text-[10px]">
                        <tr>
                          <th className="p-3">Timestamp</th>
                          <th className="p-3">Action</th>
                          <th className="p-3">Acting Admin</th>
                          <th className="p-3">Reason</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {detailedUser.auditLogs?.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="p-4 text-center text-slate-500">
                              No administrative actions recorded for this account.
                            </td>
                          </tr>
                        ) : (
                          detailedUser.auditLogs.map((a: any) => (
                            <tr key={a._id}>
                              <td className="p-3 text-slate-400 font-mono text-[11px]">
                                {new Date(a.createdAt).toLocaleString()}
                              </td>
                              <td className="p-3 font-semibold text-amber-400">{a.action}</td>
                              <td className="p-3 text-slate-300">{a.adminEmail}</td>
                              <td className="p-3 text-slate-400">{a.reason}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="flex justify-end pt-4 border-t border-slate-800">
              <button
                onClick={closeModal}
                className="rounded-xl border border-slate-700 bg-slate-800 px-5 py-2 text-xs font-semibold uppercase tracking-wider text-slate-200 hover:bg-slate-700"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. EDIT PROFILE MODAL */}
      {activeModal === 'EDIT_PROFILE' && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <form
            onSubmit={handleEditProfile}
            className="w-full max-w-lg rounded-2xl border border-slate-800 bg-[#070b14] p-6 shadow-2xl space-y-4 my-8"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-display text-base font-bold uppercase tracking-wider text-white">
                Edit Account Profile & Role Access
              </h3>
              <button type="button" onClick={closeModal} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Target account: <span className="font-semibold text-white">{selectedUser.email}</span>
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Full Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-800 bg-slate-900/80 px-3.5 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="+1234567890"
                  className="w-full rounded-xl border border-slate-800 bg-slate-900/80 px-3.5 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Role & Permission Assignment */}
            <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/40 space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-amber-400">
                System Role & Access Privileges (Saved to DB)
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { role: 'USER', label: 'Member', desc: 'Standard subscriber' },
                  { role: 'MODERATOR', label: 'Moderator', desc: 'Earns referral %' },
                  { role: 'SUPER_ADMIN', label: 'Admin', desc: 'Full control' }
                ].map((item) => (
                  <button
                    key={item.role}
                    type="button"
                    onClick={() => setEditRole(item.role)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      editRole === item.role
                        ? 'border-amber-500 bg-amber-500/10 text-white shadow-lg shadow-amber-500/10'
                        : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-bold text-xs uppercase">{item.label}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{item.desc}</div>
                  </button>
                ))}
              </div>

              {editRole === 'MODERATOR' && (
                <div className="pt-2 border-t border-slate-800">
                  <label className="block text-xs font-bold uppercase text-blue-400 mb-1">
                    Moderator Lifetime Commission Rate (%)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step={1}
                    value={editCommissionRate}
                    onChange={(e) => setEditCommissionRate(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-800 bg-slate-900/80 px-3.5 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Earns this % on every deposit made by referred customers forever.
                  </p>
                </div>
              )}
            </div>

            {/* Account Status Flags */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              <label className="flex items-center gap-2 p-2 rounded-lg border border-slate-800 bg-slate-900/30 cursor-pointer text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={editIsEmailVerified}
                  onChange={(e) => setEditIsEmailVerified(e.target.checked)}
                  className="rounded text-amber-500 focus:ring-0"
                />
                Email Verified
              </label>

              <label className="flex items-center gap-2 p-2 rounded-lg border border-slate-800 bg-slate-900/30 cursor-pointer text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={editIsPhoneVerified}
                  onChange={(e) => setEditIsPhoneVerified(e.target.checked)}
                  className="rounded text-amber-500 focus:ring-0"
                />
                Phone Verified
              </label>

              <label className="flex items-center gap-2 p-2 rounded-lg border border-slate-800 bg-slate-900/30 cursor-pointer text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={editIsActive}
                  onChange={(e) => setEditIsActive(e.target.checked)}
                  className="rounded text-amber-500 focus:ring-0"
                />
                Active Account
              </label>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-amber-400 mb-1">
                Mandatory Administrative Reason *
              </label>
              <textarea
                value={reasonInput}
                onChange={(e) => setReasonInput(e.target.value)}
                required
                rows={2}
                placeholder="Specify legitimate operational purpose for changing user profile / role..."
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
                className="rounded-xl border border-amber-500/50 bg-amber-500 px-4 py-2 text-xs font-bold uppercase text-black hover:bg-amber-400 disabled:opacity-50"
              >
                {isSubmitting ? 'Saving to Database...' : 'Save Profile Changes'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 3. STATUS CHANGE MODAL (BLOCK / UNBLOCK / SUSPEND) */}
      {activeModal === 'STATUS_CHANGE' && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <form
            onSubmit={handleStatusChange}
            className="w-full max-w-md rounded-2xl border border-slate-800 bg-[#070b14] p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-amber-400" />
                <h3 className="font-display text-base font-bold uppercase tracking-wider text-white">
                  Confirm Account {statusAction}
                </h3>
              </div>
              <button type="button" onClick={closeModal} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Target account: <span className="font-semibold text-white">{selectedUser.email}</span>
            </p>

            {statusAction === 'SUSPEND' && (
              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                  Suspension Duration (Days)
                </label>
                <input
                  type="number"
                  min={1}
                  max={365}
                  value={suspendDays}
                  onChange={(e) => setSuspendDays(parseInt(e.target.value, 10) || 1)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900/80 px-3.5 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase text-amber-400 mb-1">
                Reason for {statusAction} *
              </label>
              <textarea
                value={reasonInput}
                onChange={(e) => setReasonInput(e.target.value)}
                required
                rows={3}
                placeholder={`Provide justification for ${statusAction.toLowerCase()}ing this user account...`}
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
                className={`rounded-xl px-4 py-2 text-xs font-bold uppercase text-white disabled:opacity-50 ${
                  statusAction === 'BLOCK'
                    ? 'bg-red-600 hover:bg-red-500'
                    : statusAction === 'SUSPEND'
                    ? 'bg-amber-600 hover:bg-amber-500'
                    : 'bg-emerald-600 hover:bg-emerald-500'
                }`}
              >
                {isSubmitting ? 'Processing...' : `Confirm ${statusAction}`}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 4. SOFT DELETE MODAL */}
      {activeModal === 'DELETE' && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <form
            onSubmit={handleDeleteUser}
            className="w-full max-w-md rounded-2xl border border-rose-900/50 bg-[#070b14] p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-rose-900/30 pb-3">
              <div className="flex items-center gap-2">
                <Trash2 className="h-5 w-5 text-rose-500" />
                <h3 className="font-display text-base font-bold uppercase tracking-wider text-rose-400">
                  Request Soft Deletion
                </h3>
              </div>
              <button type="button" onClick={closeModal} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-xs text-rose-300">
              <p className="font-bold">Compliance & Legal Audit Notice:</p>
              <p className="mt-1">
                Account access will be terminated immediately. In accordance with platform governance and financial regulations, all transaction ledgers, payments, and immutable audit logs will be permanently retained.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-rose-400 mb-1">
                Deletion Justification Reason *
              </label>
              <textarea
                value={reasonInput}
                onChange={(e) => setReasonInput(e.target.value)}
                required
                rows={3}
                placeholder="State verified operational or user-requested basis for account deletion..."
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
                {isSubmitting ? 'Processing...' : 'Confirm Soft Deletion'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 5. GRANT MANUAL SUBSCRIPTION MODAL */}
      {activeModal === 'GRANT_SUB' && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <form
            onSubmit={handleGrantSub}
            className="w-full max-w-md rounded-2xl border border-slate-800 bg-[#070b14] p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-display text-base font-bold uppercase tracking-wider text-white">
                Grant Complimentary Access
              </h3>
              <button type="button" onClick={closeModal} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-300">
              <p className="font-bold">Accounting Rule Enforced:</p>
              <p className="mt-0.5">
                A manually granted subscription is recorded with an administrative audit tag and is strictly excluded from gross sales and paid platform revenue.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Select Plan</label>
              <select
                value={subPlanId}
                onChange={(e) => setSubPlanId(e.target.value)}
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
                Mandatory Grant Reason *
              </label>
              <textarea
                value={reasonInput}
                onChange={(e) => setReasonInput(e.target.value)}
                required
                rows={3}
                placeholder="Reason for granting complimentary access (e.g., VIP partnership, operational testing, refund resolution)..."
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
                {isSubmitting ? 'Granting...' : 'Grant Manual Access'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 6. EXTEND SUBSCRIPTION MODAL */}
      {activeModal === 'EXTEND_SUB' && selectedUser && selectedUser.activeSubscription && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <form
            onSubmit={handleExtendSub}
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
              Current Expiry:{' '}
              <span className="font-semibold text-white">
                {new Date(selectedUser.activeSubscription.endDate).toLocaleDateString()}
              </span>
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                  Extension Amount
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
                placeholder="Reason for extending subscription term..."
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

      {/* 7. REVOKE SUBSCRIPTION MODAL */}
      {activeModal === 'REVOKE_SUB' && selectedUser && selectedUser.activeSubscription && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <form
            onSubmit={handleRevokeSub}
            className="w-full max-w-md rounded-2xl border border-rose-900/50 bg-[#070b14] p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-rose-900/30 pb-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-rose-500" />
                <h3 className="font-display text-base font-bold uppercase tracking-wider text-rose-400">
                  Revoke Subscription Access
                </h3>
              </div>
              <button type="button" onClick={closeModal} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Target account: <span className="font-semibold text-white">{selectedUser.email}</span>
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
                placeholder="State cause for immediate subscription revocation (e.g., terms violation, chargeback, fraud investigation)..."
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

      {/* 8. CREATE STAFF (ADMIN / MODERATOR) MODAL */}
      {activeModal === 'CREATE_STAFF' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg rounded-2xl border border-slate-800 bg-[#070b14] p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-xl border ${staffRole === 'SUPER_ADMIN' ? 'border-purple-500/30 bg-purple-500/10 text-purple-400' : 'border-blue-500/30 bg-blue-500/10 text-blue-400'}`}>
                  {staffRole === 'SUPER_ADMIN' ? <ShieldAlert className="h-5 w-5" /> : <Shield className="h-5 w-5" />}
                </div>
                <div>
                  <h3 className="font-display text-base font-bold uppercase tracking-wider text-white">
                    Add New {staffRole === 'SUPER_ADMIN' ? 'Platform Administrator' : 'Moderator Partner'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Directly provision credentials saved to MongoDB with verified active status
                  </p>
                </div>
              </div>
              <button type="button" onClick={closeModal} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStaff} className="space-y-4">
              {/* Role Toggle Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Assigned Account Role
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setStaffRole('SUPER_ADMIN');
                      setStaffCommissionRate(10);
                    }}
                    className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-xs font-bold uppercase tracking-wider transition-all ${
                      staffRole === 'SUPER_ADMIN'
                        ? 'border-purple-500 bg-purple-500/20 text-purple-300 shadow-md shadow-purple-500/10'
                        : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <ShieldAlert className="h-4 w-4" />
                    <span>Administrator</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setStaffRole('MODERATOR');
                      setStaffCommissionRate(50);
                    }}
                    className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-xs font-bold uppercase tracking-wider transition-all ${
                      staffRole === 'MODERATOR'
                        ? 'border-blue-500 bg-blue-500/20 text-blue-300 shadow-md shadow-blue-500/10'
                        : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <Shield className="h-4 w-4" />
                    <span>Moderator</span>
                  </button>
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={staffName}
                  onChange={(e) => setStaffName(e.target.value)}
                  placeholder="e.g. Mahfuzul Haque"
                  className="w-full rounded-xl border border-slate-800 bg-slate-900/80 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
                />
              </div>

              {/* Official Email */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Official Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={staffEmail}
                  onChange={(e) => setStaffEmail(e.target.value)}
                  placeholder="e.g. admin@rollate.com"
                  className="w-full rounded-xl border border-slate-800 bg-slate-900/80 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
                />
              </div>

              {/* Phone (Optional) */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Contact Phone Number <span className="text-slate-500 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={staffPhone}
                  onChange={(e) => setStaffPhone(e.target.value)}
                  placeholder="e.g. +8801700000000"
                  className="w-full rounded-xl border border-slate-800 bg-slate-900/80 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
                />
              </div>

              {/* Initial Password */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                    Login Password *
                  </label>
                  <button
                    type="button"
                    onClick={generateStaffPassword}
                    className="flex items-center gap-1 text-[11px] font-semibold text-amber-400 hover:text-amber-300 transition-colors"
                  >
                    <Sparkles className="h-3 w-3" />
                    <span>Generate Strong</span>
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={staffShowPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={staffPassword}
                    onChange={(e) => setStaffPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full rounded-xl border border-slate-800 bg-slate-900/80 pl-3.5 pr-10 py-2.5 text-sm text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setStaffShowPassword(!staffShowPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {staffShowPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Moderator Commission Rate (If MODERATOR) */}
              {staffRole === 'MODERATOR' && (
                <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-3 space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold uppercase tracking-wider text-blue-300">
                      Moderator Commission Rate (%) *
                    </label>
                    <span className="text-xs font-mono font-bold text-blue-200">
                      {staffCommissionRate}%
                    </span>
                  </div>
                  <input
                    type="number"
                    min={1}
                    max={90}
                    value={staffCommissionRate}
                    onChange={(e) => setStaffCommissionRate(Number(e.target.value) || 50)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-900/80 px-3.5 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
                  />
                  <p className="text-[11px] text-slate-400">
                    Earns {staffCommissionRate}% of deposit volume from every referred user.
                  </p>
                </div>
              )}

              {/* Staff Notes */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Internal Remarks / Notes <span className="text-slate-500 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={staffNotes}
                  onChange={(e) => setStaffNotes(e.target.value)}
                  placeholder="e.g. Telegram: @partner_mod, Region: BD"
                  className="w-full rounded-xl border border-slate-800 bg-slate-900/80 px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
                />
              </div>

              {/* Mandatory Reason */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-amber-400 mb-1">
                  Audit Log Justification *
                </label>
                <input
                  type="text"
                  required
                  value={staffReason}
                  onChange={(e) => setStaffReason(e.target.value)}
                  placeholder="Administrative reason for account creation..."
                  className="w-full rounded-xl border border-slate-800 bg-slate-900/80 px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
                />
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-xs font-semibold uppercase text-slate-300 hover:bg-slate-700 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-black uppercase tracking-wider text-white shadow-lg transition-all disabled:opacity-50 ${
                    staffRole === 'SUPER_ADMIN'
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-purple-600/30'
                      : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 shadow-blue-600/30'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      <span>Saving to MongoDB...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4" />
                      <span>Create {staffRole === 'SUPER_ADMIN' ? 'Administrator' : 'Moderator'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
