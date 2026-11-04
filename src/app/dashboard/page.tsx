'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { authClient } from '../../lib/auth-client';
import { UserRole } from '../../shared/roles';
import { formatCentsToUsd } from '../../shared/plans';
import {
  Activity,
  Shield,
  CheckCircle2,
  Lock,
  Eye,
  EyeOff,
  LogOut,
  Terminal,
  Sparkles,
  Share2,
  Copy,
  AlertCircle,
  Clock,
  User,
  KeyRound,
  LayoutDashboard,
  Crown,
  CreditCard,
  Layers,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Users,
  DollarSign,
  Menu,
  X,
  Target,
  Zap,
  Check,
  RefreshCw
} from 'lucide-react';
import { PremiumLockModal } from '../../components/PremiumLockModal';
import { NotificationBell } from '../../components/NotificationBell';
import { ProfileView } from '../../components/ProfileView';

type DashboardTab =
  | 'overview'
  | 'profile'
  | 'subscription'
  | 'tool'
  | 'referral'
  | 'security'
  | 'support'
  | 'admin-overview'
  | 'moderator-earnings';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading, isAuthenticated, logout } = useAuth();

  // Navigation tab state
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Password change form state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [changeError, setChangeError] = useState<string | null>(null);
  const [changeSuccess, setChangeSuccess] = useState<string | null>(null);
  const [changeLoading, setChangeLoading] = useState(false);

  // Clipboard & Modal state
  const [copied, setCopied] = useState(false);
  const [lockModalOpen, setLockModalOpen] = useState(false);

  // Access status telemetry
  const [accessStatus, setAccessStatus] = useState<any>(null);
  const [loadingAccess, setLoadingAccess] = useState(false);
  const [dashSecretCode, setDashSecretCode] = useState('');
  const [dashUnlockLoading, setDashUnlockLoading] = useState(false);
  const [dashUnlockSuccess, setDashUnlockSuccess] = useState('');
  const [dashUnlockError, setDashUnlockError] = useState('');

  const handleDashUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dashSecretCode.trim()) return;
    setDashUnlockLoading(true);
    setDashUnlockError('');
    setDashUnlockSuccess('');
    try {
      const res = await authClient.unlockToolWithSecretCode(dashSecretCode.trim().toUpperCase());
      setDashUnlockSuccess(res.message || 'VIP Roulette Predictor Engine unlocked successfully!');
      fetchAccess();
    } catch (err: any) {
      setDashUnlockError(err?.message || 'Invalid activation code. Please check your email.');
    } finally {
      setDashUnlockLoading(false);
    }
  };

  // Admin / Moderator specific metrics (loaded on-demand)
  const [adminMetrics, setAdminMetrics] = useState<any>(null);
  const [moderatorData, setModeratorData] = useState<any>(null);
  const [loadingRoleData, setLoadingRoleData] = useState(false);

  const isModerator = user?.role === UserRole.MODERATOR;
  const isSuperAdmin = user?.role === UserRole.SUPER_ADMIN;

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/golin?redirect=/dashboard');
    }
  }, [isLoading, isAuthenticated, router]);

  // Load authoritative subscription access status
  const fetchAccess = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoadingAccess(true);
    try {
      const res = await authClient.getAccessStatus();
      setAccessStatus(res);
    } catch {
      // Non-blocking fallback to user context
    } finally {
      setLoadingAccess(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchAccess();
  }, [fetchAccess]);

  // Read URL query parameter ?tab=... to activate corresponding tab
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlTab = new URLSearchParams(window.location.search).get('tab');
      if (urlTab === 'profile') {
        setActiveTab('profile');
      } else if (urlTab === 'subscription') {
        setActiveTab('subscription');
      } else if (urlTab === 'security') {
        setActiveTab('security');
      } else if (urlTab === 'referral') {
        setActiveTab('referral');
      }
    }
  }, []);

  // Load Admin metrics if Super Admin
  useEffect(() => {
    if (isSuperAdmin && activeTab === 'admin-overview' && !adminMetrics) {
      setLoadingRoleData(true);
      authClient
        .getAdminDashboardMetrics()
        .then((data) => setAdminMetrics(data))
        .catch(() => {})
        .finally(() => setLoadingRoleData(false));
    }
  }, [isSuperAdmin, activeTab, adminMetrics]);

  // Load Moderator data if Moderator
  useEffect(() => {
    if (isModerator && activeTab === 'moderator-earnings' && !moderatorData) {
      setLoadingRoleData(true);
      authClient
        .getModeratorSelfDashboard()
        .then((data) => setModeratorData(data))
        .catch(() => {})
        .finally(() => setLoadingRoleData(false));
    }
  }, [isModerator, activeTab, moderatorData]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#06080d]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
          <p className="font-display text-xs uppercase tracking-widest text-slate-500">
            Loading Authenticated Session...
          </p>
        </div>
      </div>
    );
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangeError(null);
    setChangeSuccess(null);

    if (newPassword.length < 8) {
      setChangeError('New password must be at least 8 characters long');
      return;
    }

    if (newPassword !== newPasswordConfirm) {
      setChangeError('Passwords do not match');
      return;
    }

    setChangeLoading(true);

    try {
      await authClient.changePassword({ oldPassword, newPassword });
      setChangeSuccess('Password changed successfully.');
      setOldPassword('');
      setNewPassword('');
      setNewPasswordConfirm('');
    } catch (err: any) {
      setChangeError(err?.message || 'Could not update password. Please check your current password.');
    } finally {
      setChangeLoading(false);
    }
  };

  const handleCopyReferral = () => {
    if (!user.referralCode) return;
    const refUrl = `${window.location.origin}/gerister?ref=${user.referralCode}`;
    navigator.clipboard.writeText(refUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenTool = () => {
    if (user.hasActiveSubscription || isSuperAdmin || isModerator) {
      router.push('/dashboard/tool');
    } else {
      setLockModalOpen(true);
    }
  };

  return (
    <div className="dashboard-root min-h-screen bg-[#05070e] text-slate-100 flex flex-col selection:bg-amber-500 selection:text-black">
      {/* Top Fixed Header */}
      <header className="sticky top-0 z-40 border-b border-amber-500/20 bg-[#070b14]/90 backdrop-blur-2xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            {/* Mobile Sidebar Toggle Button */}
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300 md:hidden hover:border-amber-500/40 hover:text-white transition-colors"
              aria-label="Toggle sidebar menu"
            >
              {mobileSidebarOpen ? <X className="h-4 w-4 text-amber-400" /> : <Menu className="h-4 w-4" />}
            </button>

            {/* Brand Logo with Official Emblem */}
            <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group">
              <div className="relative flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full p-0.5 bg-gradient-to-br from-amber-400 via-amber-600 to-amber-950 shadow-[0_0_15px_rgba(245,158,11,0.35)] transition-transform group-hover:scale-105">
                <img
                  src="/logo.png"
                  alt="Roulette.tools Official Emblem"
                  className="h-full w-full rounded-full object-cover"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-display text-sm sm:text-base font-black tracking-wider text-white">
                  ROULETTE<span className="text-amber-400">.TOOLS</span>
                </span>
                <span className="font-display text-[9px] uppercase tracking-widest text-slate-400 hidden sm:inline">
                  Member Portal
                </span>
              </div>
            </Link>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Super Admin Direct Portal */}
            {isSuperAdmin && (
              <Link
                href="/heda"
                className="hidden sm:flex items-center gap-1.5 rounded-xl border border-amber-500/50 bg-gradient-to-r from-amber-500/20 to-amber-600/15 px-3 py-1.5 font-display text-xs font-black uppercase tracking-wider text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.25)] hover:bg-amber-500/30 transition-all active:scale-95"
              >
                <Shield className="h-3.5 w-3.5 text-amber-400" />
                <span>Admin Console (/heda)</span>
              </Link>
            )}

            {/* Moderator Direct Portal */}
            {isModerator && (
              <Link
                href="/moredator"
                className="hidden sm:flex items-center gap-1.5 rounded-xl border border-purple-500/50 bg-gradient-to-r from-purple-500/20 to-purple-600/15 px-3 py-1.5 font-display text-xs font-black uppercase tracking-wider text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.25)] hover:bg-purple-500/30 transition-all active:scale-95"
              >
                <Share2 className="h-3.5 w-3.5 text-purple-400" />
                <span>Partner Portal (/moredator)</span>
              </Link>
            )}

            {/* Open Tool CTA */}
            <button
              onClick={handleOpenTool}
              className="flex items-center gap-1.5 rounded-xl border border-emerald-500/50 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 px-3 sm:px-3.5 py-1.5 font-display text-xs font-black uppercase tracking-wider text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:scale-105 transition-all active:scale-95"
            >
              <Terminal className="h-3.5 w-3.5 text-emerald-400" />
              <span>TOOL</span>
            </button>

            <NotificationBell />

            {/* Sign Out */}
            <button
              onClick={() => logout().then(() => router.push('/'))}
              title="Sign Out Session"
              className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 p-2 sm:px-3 sm:py-1.5 font-display text-xs font-bold text-slate-300 hover:bg-rose-500/10 hover:text-rose-300 hover:border-rose-500/30 transition-all"
            >
              <LogOut className="h-3.5 w-3.5 text-slate-400" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Dashboard Body with Left Sidebar + Right Main Workspace */}
      <div className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex gap-6">
        {/* Left Sidebar (Desktop Fixed / Mobile Slide-Over) */}
        <aside
          className={`dashboard-sidebar fixed inset-y-0 left-0 z-50 w-72 bg-[#070b16]/98 p-5 backdrop-blur-2xl border-r border-amber-500/20 transition-transform duration-300 md:static md:w-64 md:translate-x-0 md:bg-transparent md:p-0 md:border-0 ${
            mobileSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
          }`}
        >
          <div className="flex flex-col h-full justify-between gap-6">
            <div className="space-y-5">
              {/* Mobile Drawer Header */}
              <div className="flex items-center justify-between md:hidden pb-3 border-b border-white/10">
                <span className="text-sm font-bold text-white">
                  Dashboard Menu
                </span>
                <button
                  onClick={() => setMobileSidebarOpen(false)}
                  className="rounded-lg p-1.5 text-slate-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* User Profile Identity Chip */}
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3.5 backdrop-blur-xl">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 text-sm font-bold text-black shadow-[0_0_15px_rgba(245,158,11,0.4)]">
                    {user.name ? user.name[0]?.toUpperCase() : 'U'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                    <p className="font-mono text-[10px] text-slate-400 truncate">{user.email || user.phone}</p>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between">
                  {isSuperAdmin ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 border border-amber-500/40 px-2 py-0.5 text-[9px] font-bold text-amber-300">
                      <Shield className="h-2.5 w-2.5 text-amber-400" />
                      SUPER ADMIN
                    </span>
                  ) : isModerator ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/20 border border-purple-500/40 px-2 py-0.5 text-[9px] font-bold text-purple-300">
                      <Share2 className="h-2.5 w-2.5 text-purple-400" />
                      MODERATOR
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-white/5 border border-white/10 px-2 py-0.5 text-[9px] font-bold text-slate-400">
                      VIP MEMBER
                    </span>
                  )}

                  {user.hasActiveSubscription ? (
                    <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      VIP ACTIVE
                    </span>
                  ) : (
                    <span className="text-[9px] font-bold text-amber-400/80">INACTIVE</span>
                  )}
                </div>
              </div>

              {/* Sidebar Navigation Links */}
              <nav className="space-y-1">
                <p className="px-3 pb-1 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Member Suite
                </p>

                <button
                  onClick={() => {
                    setActiveTab('overview');
                    setMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-xs font-semibold transition-all ${
                    activeTab === 'overview'
                      ? 'bg-amber-500/15 border border-amber-500/40 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.2)] font-bold'
                      : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Overview</span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab('profile');
                    setMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-xs font-semibold transition-all ${
                    activeTab === 'profile'
                      ? 'bg-amber-500/15 border border-amber-500/40 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.2)] font-bold'
                      : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <User className="h-4 w-4" />
                  <span>My Profile</span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab('subscription');
                    setMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between rounded-xl px-3.5 py-2.5 text-left text-xs font-semibold transition-all ${
                    activeTab === 'subscription'
                      ? 'bg-amber-500/15 border border-amber-500/40 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.2)] font-bold'
                      : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Crown className="h-4 w-4" />
                    <span>My Subscription</span>
                  </div>
                  {user.hasActiveSubscription && (
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  )}
                </button>

                <button
                  onClick={() => {
                    setActiveTab('tool');
                    setMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between rounded-xl px-3.5 py-2.5 text-left text-xs font-semibold transition-all ${
                    activeTab === 'tool'
                      ? 'bg-amber-500/15 border border-amber-500/40 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.2)] font-bold'
                      : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Terminal className="h-4 w-4" />
                    <span>Roulette Tool</span>
                  </div>
                  <span className="font-mono text-[9px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/30">
                    20+ Live
                  </span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab('referral');
                    setMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-xs font-semibold transition-all ${
                    activeTab === 'referral'
                      ? 'bg-amber-500/15 border border-amber-500/40 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.2)] font-bold'
                      : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Share2 className="h-4 w-4" />
                  <span>Affiliate & Referral</span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab('security');
                    setMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-xs font-semibold transition-all ${
                    activeTab === 'security'
                      ? 'bg-amber-500/15 border border-amber-500/40 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.2)] font-bold'
                      : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <KeyRound className="h-4 w-4" />
                  <span>Account Security</span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab('support');
                    setMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-xs font-semibold transition-all ${
                    activeTab === 'support'
                      ? 'bg-amber-500/15 border border-amber-500/40 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.2)] font-bold'
                      : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <HelpCircle className="h-4 w-4" />
                  <span>Support & FAQ</span>
                </button>

                {/* SUPER ADMIN SPECIFIC SECTION */}
                {isSuperAdmin && (
                  <div className="pt-4 space-y-1">
                    <p className="px-3 pb-1 text-[11px] font-bold uppercase tracking-wider text-amber-400">
                      👑 Admin Suite
                    </p>

                    <button
                      onClick={() => {
                        setActiveTab('admin-overview');
                        setMobileSidebarOpen(false);
                      }}
                      className={`w-full flex items-center justify-between rounded-xl px-3.5 py-2.5 text-left text-xs font-semibold transition-all ${
                        activeTab === 'admin-overview'
                          ? 'bg-amber-500/20 border border-amber-500/50 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.3)] font-bold'
                          : 'text-amber-400/80 hover:bg-amber-500/10 hover:text-amber-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <TrendingUp className="h-4 w-4 text-amber-400" />
                        <span>Admin Telemetry</span>
                      </div>
                      <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                    </button>

                    <Link
                      href="/heda"
                      className="w-full flex items-center justify-between rounded-xl border border-amber-500/40 bg-gradient-to-r from-amber-500/15 to-amber-600/10 px-3.5 py-2.5 text-xs font-semibold text-amber-300 hover:bg-amber-500/25 transition-all shadow-md"
                    >
                      <div className="flex items-center gap-3">
                        <Shield className="h-4 w-4 text-amber-400" />
                        <span>Admin Console (/heda)</span>
                      </div>
                      <ExternalLink className="h-3.5 w-3.5 text-amber-400" />
                    </Link>
                  </div>
                )}

                {/* MODERATOR SPECIFIC SECTION */}
                {isModerator && (
                  <div className="pt-4 space-y-1">
                    <p className="px-3 pb-1 text-[11px] font-bold uppercase tracking-wider text-purple-400">
                      🤝 Partner Suite
                    </p>

                    <button
                      onClick={() => {
                        setActiveTab('moderator-earnings');
                        setMobileSidebarOpen(false);
                      }}
                      className={`w-full flex items-center justify-between rounded-xl px-3.5 py-2.5 text-left text-xs font-semibold transition-all ${
                        activeTab === 'moderator-earnings'
                          ? 'bg-purple-500/20 border border-purple-500/50 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.3)] font-bold'
                          : 'text-purple-400/80 hover:bg-purple-500/10 hover:text-purple-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <DollarSign className="h-4 w-4 text-purple-400" />
                        <span>Commission Hub</span>
                      </div>
                      <span className="font-mono text-[9px] font-bold text-purple-300 bg-purple-500/20 px-1.5 py-0.2 rounded border border-purple-500/30">
                        50%
                      </span>
                    </button>

                    <Link
                      href="/moredator"
                      className="w-full flex items-center justify-between rounded-xl border border-purple-500/40 bg-gradient-to-r from-purple-500/15 to-purple-600/10 px-3.5 py-2.5 text-xs font-semibold text-purple-300 hover:bg-purple-500/25 transition-all shadow-md"
                    >
                      <div className="flex items-center gap-3">
                        <Share2 className="h-4 w-4 text-purple-400" />
                        <span>Partner Portal (/moredator)</span>
                      </div>
                      <ExternalLink className="h-3.5 w-3.5 text-purple-400" />
                    </Link>
                  </div>
                )}
              </nav>
            </div>

            {/* Sidebar Bottom Banner */}
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 text-center">
              <p className="text-[11px] font-semibold text-slate-400">
                Roulette Intelligence v2.4
              </p>
              <p className="text-[9px] font-mono text-slate-500 mt-0.5">Non-Custodial • Zero KYC</p>
            </div>
          </div>
        </aside>

        {/* Right Main Content Workspace */}
        <main className="flex-1 min-w-0">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Welcome Hero Banner */}
              <div className="rounded-3xl border border-amber-500/20 bg-gradient-to-r from-amber-500/10 via-white/[0.03] to-transparent p-6 sm:p-8 backdrop-blur-2xl shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Sparkles className="h-4 w-4 text-amber-400 animate-pulse" />
                      <span className="font-display text-[10px] font-black uppercase tracking-widest text-amber-300">
                        Live Session Active
                      </span>
                    </div>
                    <h1 className="font-display text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
                      Welcome, {user.name}
                    </h1>
                    <p className="mt-1 text-xs text-slate-400 font-mono">
                      {user.email || user.phone} • Account ID: {user.id ? user.id.slice(-8) : 'ACTIVE'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={handleOpenTool}
                      className="flex items-center gap-2 rounded-xl border border-emerald-500/50 bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-2.5 font-display text-xs font-black uppercase tracking-wider text-black shadow-lg shadow-emerald-500/25 hover:brightness-110 active:scale-95 transition-all"
                    >
                      <Terminal className="h-4 w-4 text-black" />
                      <span>Launch Roulette Tool</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* 4 Stat Telemetry Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Stat 1: Pass Status */}
                <div className="rounded-2xl border border-white/10 bg-[#0b101a]/80 p-5 backdrop-blur-xl">
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="font-display text-[10px] font-black uppercase tracking-widest">
                      Pass Status
                    </span>
                    <Crown className="h-4 w-4 text-amber-400" />
                  </div>
                  <div className="font-display text-lg font-black text-white truncate">
                    {accessStatus?.hasAccess
                      ? accessStatus?.planName || 'VIP Pass Active'
                      : accessStatus?.code === 'SUBSCRIPTION_EXPIRED'
                      ? 'Pass Expired'
                      : user.hasActiveSubscription
                      ? accessStatus?.planName || 'VIP Pass Active'
                      : 'No Active Pass'}
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs">
                    {accessStatus?.hasAccess ? (
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        {accessStatus?.daysRemaining !== undefined ? `${accessStatus.daysRemaining} days left` : 'Active'}
                      </span>
                    ) : (
                      <Link href="/plans" className="text-amber-400 hover:underline font-bold text-[11px] flex items-center gap-1">
                        {accessStatus?.code === 'SUBSCRIPTION_EXPIRED' ? 'Renew Expired Pass →' : 'Get Access →'}
                      </Link>
                    )}
                  </div>
                </div>

                {/* Stat 2: Tool Status */}
                <div className="rounded-2xl border border-white/10 bg-[#0b101a]/80 p-5 backdrop-blur-xl">
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="font-display text-[10px] font-black uppercase tracking-widest">
                      Roulette Engine
                    </span>
                    <Activity className="h-4 w-4 text-emerald-400" />
                  </div>
                  <div className="font-display text-lg font-black">
                    {accessStatus?.hasAccess ? (
                      <span className="text-emerald-400">Ready & Active</span>
                    ) : (
                      <span className="text-amber-400 flex items-center gap-1.5">
                        <Lock className="h-4 w-4" /> Locked
                      </span>
                    )}
                  </div>
                  <div className="mt-2 text-slate-400 font-mono text-[10px]">
                    20+ Evolution & Pragmatic Live
                  </div>
                </div>

                {/* Stat 3: Referral / Role */}
                <div className="rounded-2xl border border-white/10 bg-[#0b101a]/80 p-5 backdrop-blur-xl">
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="font-display text-[10px] font-black uppercase tracking-widest">
                      {isModerator ? 'Commission Rate' : 'Referral Code'}
                    </span>
                    <Share2 className="h-4 w-4 text-purple-400" />
                  </div>
                  <div className="font-display text-lg font-black text-white truncate">
                    {isModerator ? '50% Per Order' : user.referralCode || 'NO_CODE'}
                  </div>
                  <div className="mt-2 text-slate-400 text-[10px] font-mono">
                    {isModerator ? 'Moderator Qualified' : 'Standard Member'}
                  </div>
                </div>

                {/* Stat 4: Security Verification */}
                <div className="rounded-2xl border border-white/10 bg-[#0b101a]/80 p-5 backdrop-blur-xl">
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="font-display text-[10px] font-black uppercase tracking-widest">
                      Security Level
                    </span>
                    <Shield className="h-4 w-4 text-amber-400" />
                  </div>
                  <div className="font-display text-lg font-black text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Protected</span>
                  </div>
                  <div className="mt-2 text-slate-400 text-[10px]">
                    {user.isEmailVerified ? 'Email Verified' : 'Standard Login'}
                  </div>
                </div>
              </div>

              {/* Roulette Live Engine Showcase Card */}
              <div className="rounded-3xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/20 via-[#0a121d] to-[#070b14] p-6 sm:p-8 backdrop-blur-2xl">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-2 max-w-xl">
                    <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1">
                      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                      <span className="font-display text-[10px] font-black uppercase tracking-widest text-emerald-300">
                        20+ Live Tables Streaming Now
                      </span>
                    </div>
                    <h3 className="font-display text-xl sm:text-2xl font-black uppercase tracking-tight text-white">
                      European Roulette Predictive Telemetry
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      Offset Strategy pocket distance algorithms (0-3), Target Sequences pattern recognition, and dealer signature momentum weakening alerts.
                    </p>
                  </div>

                  <div className="shrink-0 flex flex-col gap-2.5">
                    <button
                      onClick={handleOpenTool}
                      className="flex items-center justify-center gap-2 rounded-2xl border border-emerald-400 bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-500 px-6 py-3.5 font-display text-xs font-black uppercase tracking-wider text-black shadow-[0_0_25px_rgba(16,185,129,0.35)] hover:scale-105 active:scale-95 transition-all"
                    >
                      <Terminal className="h-4 w-4" />
                      <span>Launch Roulette Tool</span>
                    </button>
                    <Link
                      href="/plans"
                      className="text-center font-display text-[10px] font-bold uppercase tracking-wider text-amber-400 hover:text-amber-300 transition-colors"
                    >
                      View All 5 Membership Passes →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: PROFILE */}
          {activeTab === 'profile' && (
            <ProfileView />
          )}

          {/* TAB 2: SUBSCRIPTION */}
          {activeTab === 'subscription' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display text-xl sm:text-2xl font-black uppercase tracking-tight text-white">
                    Subscription & Passes
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Manage your current European Roulette intelligence pass and explore multi-month savings.
                  </p>
                </div>
                <Link
                  href="/plans"
                  className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-3.5 py-2 font-display text-xs font-bold uppercase tracking-wider text-amber-300 hover:bg-amber-500/20 transition-all"
                >
                  Explore All Passes
                </Link>
              </div>

              {/* Active Plan Detail Card */}
              <div className="rounded-3xl border border-white/10 bg-[#0c1017]/90 p-6 sm:p-8 backdrop-blur-2xl">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/10">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-amber-500/40 bg-amber-500/10 shadow-[0_0_20px_rgba(245,158,11,0.25)]">
                      <Crown className="h-6 w-6 text-amber-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-display text-lg sm:text-xl font-black uppercase text-white">
                          {user.hasActiveSubscription
                            ? accessStatus?.planName || 'Active VIP Pass'
                            : 'No Active Subscription'}
                        </h3>
                        {user.hasActiveSubscription ? (
                          <span className="rounded-full bg-emerald-500/20 border border-emerald-500/40 px-2.5 py-0.5 text-[9px] font-black text-emerald-300">
                            ACTIVE
                          </span>
                        ) : (
                          <span className="rounded-full bg-amber-500/20 border border-amber-500/40 px-2.5 py-0.5 text-[9px] font-black text-amber-300">
                            EXPIRED
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        {user.hasActiveSubscription
                          ? 'Real-time telemetry access enabled across all live roulette tables.'
                          : 'Activate a pass to start receiving real-time live spin predictions.'}
                      </p>
                    </div>
                  </div>

                  <div>
                    {user.hasActiveSubscription ? (
                      <div className="text-right">
                        <span className="text-[10px] font-display font-bold uppercase text-slate-500 block">
                          Days Remaining
                        </span>
                        <span className="font-display text-2xl font-black text-amber-400">
                          {accessStatus?.daysRemaining ? `${accessStatus.daysRemaining} Days` : 'VIP Active'}
                        </span>
                      </div>
                    ) : (
                      <Link
                        href="/plans"
                        className="inline-flex items-center gap-2 rounded-xl border border-amber-400/50 bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2.5 font-display text-xs font-black uppercase tracking-wider text-black shadow-lg"
                      >
                        <Sparkles className="h-4 w-4" />
                        <span>Activate Pass Now</span>
                      </Link>
                    )}
                  </div>
                </div>

                {/* Secret Code Activation Card if Waiting for Tool Unlock */}
                {(accessStatus?.code === 'SECRET_CODE_REQUIRED' || (user.hasActiveSubscription && !accessStatus?.hasAccess && !accessStatus?.isRevoked)) && (
                  <div className="mt-6 rounded-2xl border border-amber-500/40 bg-gradient-to-r from-amber-500/15 via-[#111927] to-amber-500/10 p-5 backdrop-blur-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <Lock className="h-4 w-4 text-amber-400" />
                      <h4 className="font-display text-sm font-black uppercase text-amber-300">
                        Unlock Your VIP Roulette Predictor Tool
                      </h4>
                    </div>
                    <p className="text-xs text-slate-300 mb-4">
                      Your VIP subscription is active! Enter the VIP Secret Activation Code sent to your registered email to unlock real-time live spin predictions.
                    </p>

                    {dashUnlockSuccess && (
                      <div className="mb-3 rounded-xl border border-emerald-500/40 bg-emerald-500/15 p-3 text-xs text-emerald-300 font-semibold flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                        <span>{dashUnlockSuccess}</span>
                      </div>
                    )}

                    {dashUnlockError && (
                      <div className="mb-3 rounded-xl border border-rose-500/40 bg-rose-500/15 p-3 text-xs text-rose-300 font-semibold flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
                        <span>{dashUnlockError}</span>
                      </div>
                    )}

                    <form onSubmit={handleDashUnlock} className="flex flex-col sm:flex-row gap-2.5">
                      <input
                        type="text"
                        value={dashSecretCode}
                        onChange={(e) => setDashSecretCode(e.target.value.toUpperCase())}
                        placeholder="ENTER VIP SECRET CODE (e.g. VIP-ABCD-1234)"
                        className="flex-1 rounded-xl border border-amber-500/30 bg-black/60 px-4 py-2.5 font-mono text-xs uppercase tracking-widest text-amber-300 placeholder-slate-600 focus:border-amber-400 focus:outline-none"
                      />
                      <button
                        type="submit"
                        disabled={dashUnlockLoading || !dashSecretCode.trim()}
                        className="rounded-xl border border-amber-400 bg-amber-500 px-5 py-2.5 font-display text-xs font-black uppercase tracking-wider text-black hover:bg-amber-400 transition-all disabled:opacity-50 shadow-[0_0_15px_rgba(245,158,11,0.3)] active:scale-95"
                      >
                        {dashUnlockLoading ? 'Verifying...' : 'Unlock Tool Access'}
                      </button>
                    </form>
                  </div>
                )}

                {/* Plan Guarantees / Features */}
                <div className="pt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 mb-2" />
                    <h4 className="font-display text-xs font-bold text-white uppercase tracking-wider">
                      Instant Crypto IPN
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Automated server activation via NOWPayments on first blockchain confirmation.
                    </p>
                  </div>
                  <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                    <Shield className="h-4 w-4 text-amber-400 mb-2" />
                    <h4 className="font-display text-xs font-bold text-white uppercase tracking-wider">
                      Zero Custody Policy
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-1">
                      No user balance deposits stored. Strict SaaS intelligence license model.
                    </p>
                  </div>
                  <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                    <Zap className="h-4 w-4 text-cyan-400 mb-2" />
                    <h4 className="font-display text-xs font-bold text-white uppercase tracking-wider">
                      Calendar-Month Logic
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-1">
                      UTC calendar boundaries evaluated correctly across leap years & varying month lengths.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ROULETTE TOOL ACCESS */}
          {activeTab === 'tool' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div>
                <h2 className="font-display text-xl sm:text-2xl font-black uppercase tracking-tight text-white">
                  Roulette Live Intelligence Terminal
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Access the live OCR telemetry stream and pattern recognition algorithms.
                </p>
              </div>

              <div className="rounded-3xl border border-emerald-500/30 bg-[#0a1019]/90 p-6 sm:p-8 backdrop-blur-2xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      <Terminal className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-display text-base font-bold text-white uppercase">
                        Terminal Status: Online
                      </h3>
                      <p className="text-xs text-emerald-400">20+ Tables Monitored in Real-Time</p>
                    </div>
                  </div>

                  <button
                    onClick={handleOpenTool}
                    className="flex items-center justify-center gap-2 rounded-xl border border-emerald-400 bg-gradient-to-r from-emerald-500 to-teal-600 px-5 py-3 font-display text-xs font-black uppercase tracking-wider text-black shadow-lg shadow-emerald-500/25 hover:scale-105 active:scale-95 transition-all"
                  >
                    <Terminal className="h-4 w-4 text-black" />
                    <span>Open Live Terminal</span>
                  </button>
                </div>

                <div className="pt-6 space-y-4">
                  <h4 className="font-display text-xs font-bold uppercase tracking-wider text-slate-400">
                    Active Algorithms in Current Build:
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3.5">
                      <span className="font-display font-bold text-amber-400 uppercase">1. Offset Strategy</span>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Pockets distance (0-3) telemetry with statistical cluster alerts.
                      </p>
                    </div>
                    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3.5">
                      <span className="font-display font-bold text-emerald-400 uppercase">2. Target Strategy</span>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Win/Loss streak sequence monitoring with momentum weakening signals.
                      </p>
                    </div>
                    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3.5">
                      <span className="font-display font-bold text-cyan-400 uppercase">3. Dealer Signature</span>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Ball travel line Over/Under tracking with croupier rhythm analysis.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: AFFILIATE & REFERRAL */}
          {activeTab === 'referral' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div>
                <h2 className="font-display text-xl sm:text-2xl font-black uppercase tracking-tight text-white">
                  Affiliate & Referral Center
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Invite players to Roulette.tools using your unique referral code.
                </p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-[#0c1017]/90 p-6 sm:p-8 backdrop-blur-2xl space-y-6">
                <div>
                  <label className="block text-xs font-display font-bold uppercase tracking-wider text-slate-300 mb-2">
                    Your Personal Registration Invite Link
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={
                        typeof window !== 'undefined'
                          ? `${window.location.origin}/gerister?ref=${user.referralCode || ''}`
                          : ''
                      }
                      className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-2.5 text-xs font-mono text-slate-200 select-all"
                    />
                    <button
                      onClick={handleCopyReferral}
                      className="shrink-0 flex items-center gap-1.5 rounded-xl border border-amber-500/40 bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2.5 font-display text-xs font-black uppercase tracking-wider text-black shadow-lg transition-all active:scale-95"
                    >
                      {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      <span>{copied ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>

                <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-xs text-slate-300">
                  <span className="font-display font-bold text-amber-300 uppercase">
                    Affiliate Commission Policy Notice:{' '}
                  </span>
                  Per Section 11 of platform specifications, 50% referral commissions are designated exclusively for accredited Moderator accounts. Standard Member accounts track referral attributions. Contact admin to apply for Moderator partner status.
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: ACCOUNT SECURITY & PASSWORD */}
          {activeTab === 'security' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div>
                <h2 className="font-display text-xl sm:text-2xl font-black uppercase tracking-tight text-white">
                  Account Security
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Update your credentials and review active session security parameters.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Change Password Card */}
                <div className="rounded-3xl border border-white/10 bg-[#0c1017]/90 p-6 sm:p-7 backdrop-blur-2xl">
                  <div className="flex items-center gap-2.5 mb-5">
                    <KeyRound className="h-5 w-5 text-amber-400" />
                    <h3 className="font-display text-sm font-bold uppercase tracking-wider text-white">
                      Change Account Password
                    </h3>
                  </div>

                  {changeError && (
                    <div className="mb-4 flex items-start gap-2 rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-300">
                      <AlertCircle className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
                      <span>{changeError}</span>
                    </div>
                  )}

                  {changeSuccess && (
                    <div className="mb-4 flex items-start gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3 text-xs text-emerald-300">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
                      <span>{changeSuccess}</span>
                    </div>
                  )}

                  <form onSubmit={handleChangePassword} className="space-y-3.5">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                        Current Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={oldPassword}
                          onChange={(e) => setOldPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full rounded-xl border border-white/10 bg-black/40 pl-9 pr-9 py-2 text-xs text-white placeholder-slate-600 focus:border-amber-500 focus:outline-none transition-colors"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                        >
                          {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                        New Password (8+ chars)
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full rounded-xl border border-white/10 bg-black/40 pl-9 pr-4 py-2 text-xs text-white placeholder-slate-600 focus:border-amber-500 focus:outline-none transition-colors"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={newPasswordConfirm}
                          onChange={(e) => setNewPasswordConfirm(e.target.value)}
                          placeholder="••••••••"
                          className="w-full rounded-xl border border-white/10 bg-black/40 pl-9 pr-4 py-2 text-xs text-white placeholder-slate-600 focus:border-amber-500 focus:outline-none transition-colors"
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={changeLoading}
                      className="w-full mt-2 rounded-xl border border-amber-500/40 bg-gradient-to-r from-amber-500 to-amber-600 py-2.5 font-display text-xs font-black uppercase tracking-wider text-black shadow-lg transition-all active:scale-95 disabled:opacity-50"
                    >
                      {changeLoading ? 'Updating Password...' : 'Save New Password'}
                    </button>
                  </form>
                </div>

                {/* Identity & Verification Parameters */}
                <div className="rounded-3xl border border-white/10 bg-[#0c1017]/90 p-6 sm:p-7 backdrop-blur-2xl space-y-4">
                  <div className="flex items-center gap-2.5 mb-2">
                    <Shield className="h-5 w-5 text-emerald-400" />
                    <h3 className="font-display text-sm font-bold uppercase tracking-wider text-white">
                      Identity & Verification
                    </h3>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="flex items-center justify-between p-3 rounded-xl border border-white/5 bg-white/[0.02]">
                      <span className="text-slate-400">Account Role</span>
                      <span className="font-mono font-bold text-amber-400">{user.role}</span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl border border-white/5 bg-white/[0.02]">
                      <span className="text-slate-400">Email Verification</span>
                      {user.isEmailVerified ? (
                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Verified
                        </span>
                      ) : (
                        <span className="text-slate-500">Unverified</span>
                      )}
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl border border-white/5 bg-white/[0.02]">
                      <span className="text-slate-400">Phone Verification</span>
                      {user.isPhoneVerified ? (
                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Verified
                        </span>
                      ) : (
                        <span className="text-slate-500">Unverified</span>
                      )}
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl border border-white/5 bg-white/[0.02]">
                      <span className="text-slate-400">Session Protocol</span>
                      <span className="font-mono text-[11px] text-slate-300">JWT Bearer • SSL Encrypted</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: SUPPORT & FAQ */}
          {activeTab === 'support' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div>
                <h2 className="font-display text-xl sm:text-2xl font-black uppercase tracking-tight text-white">
                  Support & Help Desk
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Access official assistance, community channels, and platform guidelines.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="rounded-2xl border border-white/10 bg-[#0c1017]/90 p-6 backdrop-blur-xl">
                  <h3 className="font-display text-sm font-bold uppercase tracking-wider text-white mb-2">
                    Telegram VIP Community
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4">
                    Join live discussions, strategy calibrations, and real-time announcements from administrators.
                  </p>
                  <Link
                    href="/contact"
                    className="inline-flex items-center gap-2 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-2 font-display text-xs font-bold uppercase tracking-wider text-amber-300 hover:bg-amber-500/20 transition-all"
                  >
                    Open Support Desk →
                  </Link>
                </div>

                <div className="rounded-2xl border border-white/10 bg-[#0c1017]/90 p-6 backdrop-blur-xl">
                  <h3 className="font-display text-sm font-bold uppercase tracking-wider text-white mb-2">
                    Frequently Asked Questions
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4">
                    Learn about crypto confirmations, non-custodial policies, and roulette strategy setup.
                  </p>
                  <Link
                    href="/faq"
                    className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 font-display text-xs font-bold uppercase tracking-wider text-slate-200 hover:bg-white/10 transition-all"
                  >
                    View Knowledgebase →
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: ADMIN OVERVIEW (SUPER ADMIN ONLY) */}
          {activeTab === 'admin-overview' && isSuperAdmin && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-amber-400" />
                    <h2 className="font-display text-xl sm:text-2xl font-black uppercase tracking-tight text-white">
                      Admin Administrative Telemetry
                    </h2>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    System-wide metrics and fast action gateways for platform management.
                  </p>
                </div>

                <Link
                  href="/heda"
                  className="inline-flex items-center gap-2 rounded-xl border border-amber-400 bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2.5 font-display text-xs font-black uppercase tracking-wider text-black shadow-lg shadow-amber-500/30 hover:scale-105 active:scale-95 transition-all"
                >
                  <Shield className="h-4 w-4 text-black" />
                  <span>Launch Full Admin Console (/heda)</span>
                </Link>
              </div>

              {/* Admin Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="rounded-2xl border border-amber-500/30 bg-[#0c121f]/90 p-5 backdrop-blur-xl">
                  <span className="text-[10px] font-display font-black uppercase tracking-widest text-slate-400 block mb-1">
                    Total Registered Users
                  </span>
                  <div className="font-display text-2xl font-black text-white">
                    {adminMetrics?.overview?.totalUsers ?? '...'}
                  </div>
                  <Link href="/heda/users" className="mt-2 text-xs font-bold text-amber-400 hover:underline block">
                    Manage Users →
                  </Link>
                </div>

                <div className="rounded-2xl border border-emerald-500/30 bg-[#0c121f]/90 p-5 backdrop-blur-xl">
                  <span className="text-[10px] font-display font-black uppercase tracking-widest text-slate-400 block mb-1">
                    Active VIP Passes
                  </span>
                  <div className="font-display text-2xl font-black text-emerald-400">
                    {adminMetrics?.overview?.activeSubscriptions ?? '...'}
                  </div>
                  <Link href="/heda/subscriptions" className="mt-2 text-xs font-bold text-emerald-400 hover:underline block">
                    View Subscriptions →
                  </Link>
                </div>

                <div className="rounded-2xl border border-cyan-500/30 bg-[#0c121f]/90 p-5 backdrop-blur-xl">
                  <span className="text-[10px] font-display font-black uppercase tracking-widest text-slate-400 block mb-1">
                    Gross Volume (USD)
                  </span>
                  <div className="font-display text-2xl font-black text-cyan-400">
                    {adminMetrics?.overview?.totalGrossUsd
                      ? `$${adminMetrics.overview.totalGrossUsd.toLocaleString()}`
                      : '...'}
                  </div>
                  <Link href="/heda/payments" className="mt-2 text-xs font-bold text-cyan-400 hover:underline block">
                    Payments Ledger →
                  </Link>
                </div>

                <div className="rounded-2xl border border-rose-500/30 bg-[#0c121f]/90 p-5 backdrop-blur-xl">
                  <span className="text-[10px] font-display font-black uppercase tracking-widest text-slate-400 block mb-1">
                    Pending Orders
                  </span>
                  <div className="font-display text-2xl font-black text-rose-400">
                    {adminMetrics?.overview?.pendingOrders ?? '0'}
                  </div>
                  <Link href="/heda/security" className="mt-2 text-xs font-bold text-rose-400 hover:underline block">
                    SOC Security Overview →
                  </Link>
                </div>
              </div>

              {/* Admin Gateways Grid */}
              <div className="rounded-3xl border border-white/10 bg-[#090d16]/90 p-6 backdrop-blur-2xl">
                <h3 className="font-display text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
                  Direct Operational Portals:
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <Link
                    href="/heda/users"
                    className="rounded-xl border border-white/5 bg-white/[0.02] p-3.5 hover:bg-white/5 hover:border-amber-500/30 transition-all font-display font-bold uppercase text-slate-200"
                  >
                    👥 User Registry
                  </Link>
                  <Link
                    href="/heda/subscriptions"
                    className="rounded-xl border border-white/5 bg-white/[0.02] p-3.5 hover:bg-white/5 hover:border-amber-500/30 transition-all font-display font-bold uppercase text-slate-200"
                  >
                    👑 Subscription Passes
                  </Link>
                  <Link
                    href="/heda/payments"
                    className="rounded-xl border border-white/5 bg-white/[0.02] p-3.5 hover:bg-white/5 hover:border-amber-500/30 transition-all font-display font-bold uppercase text-slate-200"
                  >
                    💳 Payment Orders
                  </Link>
                  <Link
                    href="/heda/tool"
                    className="rounded-xl border border-white/5 bg-white/[0.02] p-3.5 hover:bg-white/5 hover:border-amber-500/30 transition-all font-display font-bold uppercase text-slate-200"
                  >
                    🎮 Tool Operations
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: MODERATOR EARNINGS (MODERATOR ONLY) */}
          {activeTab === 'moderator-earnings' && isModerator && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Share2 className="h-5 w-5 text-purple-400" />
                    <h2 className="font-display text-xl sm:text-2xl font-black uppercase tracking-tight text-white">
                      Moderator Partner Dashboard
                    </h2>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    50% commission earnings on all qualifying referrals and subscriber volume.
                  </p>
                </div>

                <Link
                  href="/moredator"
                  className="inline-flex items-center gap-2 rounded-xl border border-purple-400 bg-gradient-to-r from-purple-500 to-purple-600 px-4 py-2.5 font-display text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-purple-500/30 hover:scale-105 active:scale-95 transition-all"
                >
                  <Share2 className="h-4 w-4" />
                  <span>Launch Partner Portal (/moredator)</span>
                </Link>
              </div>

              {/* Moderator Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-2xl border border-purple-500/30 bg-[#120d1f]/90 p-5 backdrop-blur-xl">
                  <span className="text-[10px] font-display font-black uppercase tracking-widest text-slate-400 block mb-1">
                    Commission Rate
                  </span>
                  <div className="font-display text-3xl font-black text-purple-400">
                    50%
                  </div>
                  <p className="mt-2 text-slate-400 text-[10px]">Authoritative platform rate</p>
                </div>

                <div className="rounded-2xl border border-emerald-500/30 bg-[#0d161a]/90 p-5 backdrop-blur-xl">
                  <span className="text-[10px] font-display font-black uppercase tracking-widest text-slate-400 block mb-1">
                    Total Commissions
                  </span>
                  <div className="font-display text-3xl font-black text-emerald-400">
                    ${moderatorData?.totalCommissionsUsd?.toFixed(2) || '0.00'}
                  </div>
                  <p className="mt-2 text-slate-400 text-[10px]">Credited earnings</p>
                </div>

                <div className="rounded-2xl border border-cyan-500/30 bg-[#0c141d]/90 p-5 backdrop-blur-xl">
                  <span className="text-[10px] font-display font-black uppercase tracking-widest text-slate-400 block mb-1">
                    Referred Customers
                  </span>
                  <div className="font-display text-3xl font-black text-cyan-400">
                    {moderatorData?.totalCustomers || '0'}
                  </div>
                  <p className="mt-2 text-slate-400 text-[10px]">Active player accounts</p>
                </div>
              </div>

              {/* Invite Link Card */}
              <div className="rounded-3xl border border-white/10 bg-[#0c1017]/90 p-6 backdrop-blur-2xl">
                <h3 className="font-display text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Your Dedicated Partner Invite Link:
                </h3>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={
                      typeof window !== 'undefined'
                        ? `${window.location.origin}/gerister?ref=${user.referralCode || ''}`
                        : ''
                    }
                    className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-2.5 text-xs font-mono text-slate-200 select-all"
                  />
                  <button
                    onClick={handleCopyReferral}
                    className="shrink-0 flex items-center gap-1.5 rounded-xl border border-purple-500/40 bg-gradient-to-r from-purple-500 to-purple-600 px-4 py-2.5 font-display text-xs font-black uppercase tracking-wider text-white shadow-lg transition-all active:scale-95"
                  >
                    {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      <PremiumLockModal isOpen={lockModalOpen} onClose={() => setLockModalOpen(false)} />
    </div>
  );
}
