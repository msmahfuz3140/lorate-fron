'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { authClient } from '../lib/auth-client';
import { UserRole } from '../shared/roles';
import { COUNTRY_CODES, formatToE164 } from '../data/countries';
import {
  User,
  Shield,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Eye,
  EyeOff,
  Crown,
  Share2,
  Mail,
  Phone,
  Calendar,
  Lock,
  RefreshCw,
  ExternalLink,
  Zap,
  Terminal,
  HelpCircle,
  Sparkles,
  Activity
} from 'lucide-react';

/**
 * Premium Stylized Man / Executive Avatar Icon
 * Strictly vector-based — zero file uploads permitted.
 */
export function StylizedManAvatar({ className = "h-24 w-24" }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center rounded-full bg-gradient-to-br from-amber-400 via-amber-600 to-amber-950 p-1 shadow-[0_0_35px_rgba(245,158,11,0.45)] ring-2 ring-amber-400/60 shrink-0 ${className}`}>
      {/* Outer ambient glow halo */}
      <div className="absolute inset-0 rounded-full bg-amber-400/20 blur-md -z-10 animate-pulse" />

      {/* Inner Avatar Canvas */}
      <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-[#070b14] border border-amber-400/40">
        <svg
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-3/4 w-3/4 text-amber-400 drop-shadow-[0_0_12px_rgba(245,158,11,0.55)]"
          aria-label="Executive User Avatar"
        >
          {/* Man Head */}
          <circle cx="32" cy="20" r="10" fill="url(#manGradHead)" stroke="#F59E0B" strokeWidth="1.5" />
          {/* Stylized Modern Hair Profile */}
          <path
            d="M22 19C22 13.5 26.5 9 32 9C37.5 9 42 13.5 42 19C42 16.5 39 12 32 12C25 12 22 16.5 22 19Z"
            fill="#FBBF24"
          />
          {/* Tie & Collar */}
          <path
            d="M32 30L28 35H36L32 30Z"
            fill="#D97706"
          />
          <path
            d="M31 35H33L34 44L32 47L30 44L31 35Z"
            fill="#F59E0B"
            stroke="#B45309"
            strokeWidth="0.8"
          />
          {/* Tailored Suit & Shoulders */}
          <path
            d="M14 54C14 43 22 37 28 35L32 40L36 35C42 37 50 43 50 54H14Z"
            fill="url(#manGradBody)"
            stroke="#F59E0B"
            strokeWidth="1.5"
          />
          {/* Lapel Accents */}
          <path d="M28 35L31 46" stroke="#FDE68A" strokeWidth="1.2" strokeLinecap="round" />
          <path d="M36 35L33 46" stroke="#FDE68A" strokeWidth="1.2" strokeLinecap="round" />

          {/* Gradients */}
          <defs>
            <linearGradient id="manGradHead" x1="22" y1="10" x2="42" y2="30" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FDE68A" />
              <stop offset="0.6" stopColor="#F59E0B" />
              <stop offset="1" stopColor="#B45309" />
            </linearGradient>
            <linearGradient id="manGradBody" x1="14" y1="35" x2="50" y2="54" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FBBF24" />
              <stop offset="0.5" stopColor="#D97706" />
              <stop offset="1" stopColor="#78350F" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
}

export function ProfileView() {
  const router = useRouter();
  const { user, refreshUser, isAuthenticated, isLoading } = useAuth();

  // --- Profile Edit State ---
  const [name, setName] = useState('');
  const [countryDialCode, setCountryDialCode] = useState('+880');
  const [localPhone, setLocalPhone] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // --- Change Password State ---
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // --- Reset Password via OTP State ---
  const [resetPanelOpen, setResetPanelOpen] = useState(false);
  const [otpTarget, setOtpTarget] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetNewPasswordConfirm, setResetNewPasswordConfirm] = useState('');
  const [resetShowPassword, setResetShowPassword] = useState(false);
  const [otpSending, setOtpSending] = useState(false);
  const [resetSubmitting, setResetSubmitting] = useState(false);
  const [resetMessage, setResetMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  // --- Subscription State ---
  const [subData, setSubData] = useState<{ active: any; history: any[] } | null>(null);
  const [loadingSub, setLoadingSub] = useState(false);

  // --- Copy Referral State ---
  const [copiedReferral, setCopiedReferral] = useState(false);

  // Populate user data once loaded
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setOtpTarget(user.email || user.phone || '');

      // Parse existing phone if any
      if (user.phone) {
        let matchedDial = '+880';
        let remaining = user.phone;
        for (const item of COUNTRY_CODES) {
          if (item.dialCode !== '+' && user.phone.startsWith(item.dialCode)) {
            matchedDial = item.dialCode;
            remaining = user.phone.slice(item.dialCode.length);
            break;
          }
        }
        setCountryDialCode(matchedDial);
        setLocalPhone(remaining);
      }
    }
  }, [user]);

  // Load user subscription information
  useEffect(() => {
    if (isAuthenticated) {
      setLoadingSub(true);
      authClient
        .getMySubscription()
        .then((data) => setSubData(data))
        .catch(() => {})
        .finally(() => setLoadingSub(false));
    }
  }, [isAuthenticated]);

  // Handle countdown timer for OTP resend
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  if (isLoading || !user) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-amber-500 border-t-transparent mb-3" />
        <p className="font-display text-xs uppercase tracking-widest text-slate-500">
          Loading Member Profile...
        </p>
      </div>
    );
  }

  // --- Handlers ---

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMessage(null);

    const cleanName = name.trim();
    if (!cleanName || cleanName.length < 2) {
      setProfileMessage({ type: 'error', text: 'Name must be at least 2 characters long.' });
      return;
    }

    let resolvedPhone: string | undefined = undefined;
    if (localPhone.trim()) {
      resolvedPhone = formatToE164(countryDialCode, localPhone);
      if (!resolvedPhone || resolvedPhone.length < 8) {
        setProfileMessage({ type: 'error', text: 'Please enter a valid phone number.' });
        return;
      }
    }

    setProfileSaving(true);
    try {
      await authClient.updateProfile({
        name: cleanName,
        phone: resolvedPhone || user.phone || undefined
      });
      await refreshUser();
      setProfileMessage({
        type: 'success',
        text: 'Profile details saved to database successfully!'
      });
      setTimeout(() => setProfileMessage(null), 5000);
    } catch (err: any) {
      setProfileMessage({
        type: 'error',
        text: err?.message || 'Failed to update profile. Please try again.'
      });
    } finally {
      setProfileSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage(null);

    if (newPassword.length < 8) {
      setPasswordMessage({ type: 'error', text: 'New password must be at least 8 characters long.' });
      return;
    }

    if (newPassword !== newPasswordConfirm) {
      setPasswordMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    setPasswordSaving(true);
    try {
      await authClient.changePassword({ oldPassword, newPassword });
      setPasswordMessage({
        type: 'success',
        text: 'Password updated and saved to database successfully!'
      });
      setOldPassword('');
      setNewPassword('');
      setNewPasswordConfirm('');
      setTimeout(() => setPasswordMessage(null), 5000);
    } catch (err: any) {
      setPasswordMessage({
        type: 'error',
        text: err?.message || 'Current password incorrect or update failed.'
      });
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleRequestResetOtp = async () => {
    const target = user.email || user.phone;
    if (!target) {
      setResetMessage({ type: 'error', text: 'No email or phone attached to this account.' });
      return;
    }

    setOtpSending(true);
    setResetMessage(null);
    try {
      const res = await authClient.forgotPassword({ target });
      setOtpSent(true);
      setResendCooldown(60);
      setResetMessage({
        type: 'success',
        text: res?.message || `Verification OTP code dispatched to ${target}`
      });
    } catch (err: any) {
      setResetMessage({
        type: 'error',
        text: err?.message || 'Failed to send OTP reset code.'
      });
    } finally {
      setOtpSending(false);
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetMessage(null);

    if (!otpCode || otpCode.trim().length !== 6) {
      setResetMessage({ type: 'error', text: 'Please enter the 6-digit verification code.' });
      return;
    }

    if (resetNewPassword.length < 8) {
      setResetMessage({ type: 'error', text: 'New password must be at least 8 characters long.' });
      return;
    }

    if (resetNewPassword !== resetNewPasswordConfirm) {
      setResetMessage({ type: 'error', text: 'Passwords do not match.' });
      return;
    }

    setResetSubmitting(true);
    try {
      const target = user.email || user.phone || otpTarget;
      const res = await authClient.resetPassword({
        target,
        code: otpCode.trim(),
        newPassword: resetNewPassword
      });
      setResetMessage({
        type: 'success',
        text: res?.message || 'Password has been successfully reset in database!'
      });
      setOtpCode('');
      setResetNewPassword('');
      setResetNewPasswordConfirm('');
      setOtpSent(false);
    } catch (err: any) {
      setResetMessage({
        type: 'error',
        text: err?.message || 'Failed to reset password. Code may be invalid or expired.'
      });
    } finally {
      setResetSubmitting(false);
    }
  };

  const handleCopyReferral = () => {
    if (!user.referralCode) return;
    const refUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/gerister?ref=${user.referralCode}`;
    navigator.clipboard.writeText(refUrl);
    setCopiedReferral(true);
    setTimeout(() => setCopiedReferral(false), 2000);
  };

  // Format Member Since date
  const memberSinceFormatted = useMemo(() => {
    if (!user.createdAt) return 'Recent Member';
    try {
      const d = new Date(user.createdAt);
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Active Member';
    }
  }, [user.createdAt]);

  const activeSub = subData?.active;
  const isSuperAdmin = user.role === UserRole.SUPER_ADMIN;
  const isModerator = user.role === UserRole.MODERATOR;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* ============================================================ */}
      {/* 1. HERO IDENTITY CARD (MAN AVATAR - NO UPLOADS) */}
      {/* ============================================================ */}
      <div className="relative overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-r from-[#0c101a] via-[#090d16] to-[#080b12] p-6 sm:p-8 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.85)]">
        {/* Ambient background glows */}
        <div className="absolute -top-16 -right-16 h-64 w-64 rounded-full bg-amber-500/10 blur-[90px] pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-emerald-500/10 blur-[90px] pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Avatar & User Details */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-6">
            {/* STYLIZED MAN AVATAR - STRICT NO PIC UPLOAD */}
            <div className="relative group">
              <StylizedManAvatar className="h-24 w-24 sm:h-28 sm:w-28" />
              {user.hasActiveSubscription && (
                <div
                  className="absolute -top-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-black shadow-lg shadow-amber-500/40 ring-2 ring-[#070b14]"
                  title="VIP Active Subscription"
                >
                  <Crown className="h-4 w-4 fill-current text-black" />
                </div>
              )}
            </div>

            {/* User Title & Badges */}
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-display text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
                  {user.name}
                </h1>

                {/* Role Pill */}
                {isSuperAdmin ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 border border-amber-500/50 px-2.5 py-0.5 font-display text-[10px] font-black uppercase tracking-wider text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.25)]">
                    <Shield className="h-3 w-3 text-amber-400" />
                    SUPER ADMIN
                  </span>
                ) : isModerator ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/20 border border-purple-500/50 px-2.5 py-0.5 font-display text-[10px] font-black uppercase tracking-wider text-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.25)]">
                    <Share2 className="h-3 w-3 text-purple-400" />
                    MODERATOR PARTNER
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-cyan-500/15 border border-cyan-500/40 px-2.5 py-0.5 font-display text-[10px] font-black uppercase tracking-wider text-cyan-300">
                    <User className="h-3 w-3 text-cyan-400" />
                    VIP MEMBER
                  </span>
                )}

                {/* Status Dot */}
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  ACTIVE
                </span>
              </div>

              {/* Subtitle / Identifiers */}
              <p className="font-mono text-xs text-slate-400 flex flex-wrap items-center gap-3">
                {user.email && (
                  <span className="flex items-center gap-1">
                    <Mail className="h-3.5 w-3.5 text-slate-500" />
                    {user.email}
                  </span>
                )}
                {user.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5 text-slate-500" />
                    {user.phone}
                  </span>
                )}
              </p>

              {/* Security & Verification Badges */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {user.isEmailVerified && (
                  <span className="inline-flex items-center gap-1 rounded-lg bg-blue-500/10 border border-blue-500/30 px-2 py-0.5 text-[10px] font-semibold text-blue-300">
                    <CheckCircle2 className="h-3 w-3 text-blue-400" />
                    Email Verified
                  </span>
                )}
                {user.isPhoneVerified && (
                  <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                    <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                    Phone Verified
                  </span>
                )}
                <span className="inline-flex items-center gap-1 rounded-lg bg-white/5 border border-white/10 px-2 py-0.5 text-[10px] text-slate-400">
                  <Calendar className="h-3 w-3 text-slate-500" />
                  Joined {memberSinceFormatted}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Action CTA */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <Link
              href="/dashboard/tool"
              className="flex items-center justify-center gap-2 rounded-xl border border-emerald-500/50 bg-gradient-to-r from-emerald-500/20 via-emerald-600/15 to-teal-500/20 px-4 py-2.5 font-display text-xs font-black uppercase tracking-wider text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.25)] hover:scale-[1.02] active:scale-98 transition-all"
            >
              <Terminal className="h-4 w-4 text-emerald-400" />
              <span>Launch Tool</span>
            </Link>

            <Link
              href="/plans"
              className="flex items-center justify-center gap-2 rounded-xl border border-amber-500/50 bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2.5 font-display text-xs font-black uppercase tracking-wider text-black shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:brightness-110 active:scale-98 transition-all"
            >
              <Crown className="h-4 w-4 text-black" />
              <span>VIP Plans</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. REAL-TIME VIP PASS STATUS CARD */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Pass Status Widget */}
        <div className="rounded-2xl border border-amber-500/30 bg-[#0c1017]/90 p-5 backdrop-blur-xl relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="font-display text-[10px] font-black uppercase tracking-widest text-slate-400">
              VIP Pass Status
            </span>
            <Crown className="h-4 w-4 text-amber-400" />
          </div>
          <div className="font-display text-lg font-black text-white">
            {activeSub ? activeSub.planId?.name || 'Active Subscription' : user.hasActiveSubscription ? 'VIP Active' : 'No Active Pass'}
          </div>
          <div className="mt-2 text-xs">
            {activeSub ? (
              <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5" />
                {activeSub.daysRemaining ? `${activeSub.daysRemaining} days remaining` : 'Active Pass'}
              </span>
            ) : user.hasActiveSubscription ? (
              <span className="text-emerald-400 font-bold">Access Granted</span>
            ) : (
              <Link href="/plans" className="text-amber-400 font-bold hover:underline inline-flex items-center gap-1">
                Upgrade Pass Now →
              </Link>
            )}
          </div>
          {activeSub?.currentPeriodEnd && (
            <p className="mt-2 font-mono text-[10px] text-slate-500">
              Expires: {new Date(activeSub.currentPeriodEnd).toLocaleDateString()}
            </p>
          )}
        </div>

        {/* Roulette Tool Access Status */}
        <div className="rounded-2xl border border-white/10 bg-[#0c1017]/90 p-5 backdrop-blur-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="font-display text-[10px] font-black uppercase tracking-widest text-slate-400">
              Roulette Tool Protocol
            </span>
            <Activity className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="font-display text-lg font-black text-white">
            {activeSub && !activeSub.isExpired ? (
              <span className="text-emerald-400">Unlocked & Active</span>
            ) : user.hasActiveSubscription ? (
              <span className="text-emerald-400">Unlocked & Active</span>
            ) : (
              <span className="text-amber-400 flex items-center gap-1.5">
                <Lock className="h-4 w-4" /> Pass Locked
              </span>
            )}
          </div>
          <div className="mt-2 text-xs text-slate-400">
            {user.hasActiveSubscription || isSuperAdmin || isModerator ? (
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <Zap className="h-3.5 w-3.5" />
                20+ Live Casino Tables Active
              </span>
            ) : (
              <span>Purchase pass to receive access code</span>
            )}
          </div>
        </div>

        {/* Affiliate Referral Widget */}
        <div className="rounded-2xl border border-white/10 bg-[#0c1017]/90 p-5 backdrop-blur-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="font-display text-[10px] font-black uppercase tracking-widest text-slate-400">
              Affiliate Referral Code
            </span>
            <Share2 className="h-4 w-4 text-purple-400" />
          </div>
          <div className="flex items-center justify-between">
            <span className="font-mono text-base font-bold text-amber-300">
              {user.referralCode || 'NOT_ASSIGNED'}
            </span>
            <button
              onClick={handleCopyReferral}
              className="flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-300 hover:bg-amber-500/20 active:scale-95 transition-all"
            >
              {copiedReferral ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
              <span>{copiedReferral ? 'Copied' : 'Copy Link'}</span>
            </button>
          </div>
          <p className="mt-2 text-[10px] text-slate-400">
            Earn lifetime commission on every deposit from your referrals.
          </p>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 3. EDIT PROFILE INFORMATION (NAME & PHONE) - DIRECT DB SAVE */}
      {/* ============================================================ */}
      <div className="rounded-3xl border border-white/10 bg-[#0c1017]/90 p-6 sm:p-8 backdrop-blur-2xl shadow-xl">
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <User className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-base sm:text-lg font-black uppercase tracking-wider text-white">
                Personal Information
              </h2>
              <p className="text-xs text-slate-400">
                Update your account display name and verified phone number (saves directly to database)
              </p>
            </div>
          </div>
          <span className="font-mono text-[10px] text-amber-400 font-bold bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full">
            INSTANT SYNC
          </span>
        </div>

        {/* Profile Feedback Alert */}
        {profileMessage && (
          <div
            className={`mb-6 flex items-center gap-3 rounded-2xl border p-4 text-xs font-medium ${
              profileMessage.type === 'success'
                ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                : 'border-red-500/40 bg-red-500/10 text-red-300'
            }`}
          >
            {profileMessage.type === 'success' ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
            )}
            <span>{profileMessage.text}</span>
          </div>
        )}

        <form onSubmit={handleSaveProfile} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Field 1: Full Name */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full rounded-xl border border-white/10 bg-black/40 pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-600 focus:border-amber-400 focus:outline-none transition-colors"
                  required
                />
              </div>
              <p className="mt-1 text-[10px] text-slate-500">
                Visible across your member dashboard and communications
              </p>
            </div>

            {/* Field 2: Email (Primary Account Identifier - Readonly with badge) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                  Email Address
                </label>
                {user.isEmailVerified ? (
                  <span className="font-mono text-[9px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    VERIFIED
                  </span>
                ) : (
                  <span className="font-mono text-[9px] text-slate-400 bg-white/5 px-2 py-0.5 rounded-full">
                    PRIMARY ID
                  </span>
                )}
              </div>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                <input
                  type="email"
                  value={user.email || 'No email registered'}
                  disabled
                  className="w-full rounded-xl border border-white/5 bg-white/[0.03] pl-10 pr-4 py-2.5 text-xs text-slate-400 cursor-not-allowed select-none"
                />
              </div>
              <p className="mt-1 text-[10px] text-slate-500">
                Primary security login identifier (contact support to modify)
              </p>
            </div>

            {/* Field 3: Phone Number with Country Dial Code */}
            <div className="md:col-span-2">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                  Phone Number (International)
                </label>
                {user.isPhoneVerified && (
                  <span className="font-mono text-[9px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    VERIFIED
                  </span>
                )}
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                {/* Country Code Dropdown */}
                <div className="relative sm:w-64">
                  <select
                    value={countryDialCode}
                    onChange={(e) => setCountryDialCode(e.target.value)}
                    className="w-full appearance-none rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-xs text-white focus:border-amber-400 focus:outline-none transition-colors"
                  >
                    {COUNTRY_CODES.map((c) => (
                      <option key={`${c.code}-${c.dialCode}`} value={c.dialCode} className="bg-[#0b0e17] text-white">
                        {c.flag} {c.dialCode} ({c.name})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Local Phone Input */}
                <div className="relative flex-1">
                  <Phone className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                  <input
                    type="tel"
                    value={localPhone}
                    onChange={(e) => setLocalPhone(e.target.value)}
                    placeholder="e.g. 1712345678"
                    className="w-full rounded-xl border border-white/10 bg-black/40 pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-600 focus:border-amber-400 focus:outline-none transition-colors"
                  />
                </div>
              </div>
              <p className="mt-1 text-[10px] text-slate-500">
                Current formatted database phone: <span className="font-mono text-amber-400">{user.phone || 'None'}</span>
              </p>
            </div>
          </div>

          {/* Submit Profile Button */}
          <div className="flex justify-end pt-3">
            <button
              type="submit"
              disabled={profileSaving}
              className="flex items-center gap-2 rounded-xl border border-amber-500/40 bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-2.5 font-display text-xs font-black uppercase tracking-wider text-black shadow-lg shadow-amber-500/20 hover:brightness-110 active:scale-95 disabled:opacity-50 transition-all"
            >
              {profileSaving ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Saving to Database...</span>
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  <span>Save Profile Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* ============================================================ */}
      {/* 4. CHANGE PASSWORD & IMMEDIATE SAVE */}
      {/* ============================================================ */}
      <div className="rounded-3xl border border-white/10 bg-[#0c1017]/90 p-6 sm:p-8 backdrop-blur-2xl shadow-xl">
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <KeyRound className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-base sm:text-lg font-black uppercase tracking-wider text-white">
                Change Password
              </h2>
              <p className="text-xs text-slate-400">
                Securely update your login credentials with immediate database hashing
              </p>
            </div>
          </div>
          <span className="font-mono text-[10px] text-slate-400 bg-white/5 border border-white/10 px-2.5 py-1 rounded-full">
            BCRYPT ENCRYPTED
          </span>
        </div>

        {/* Password Feedback Alert */}
        {passwordMessage && (
          <div
            className={`mb-6 flex items-center gap-3 rounded-2xl border p-4 text-xs font-medium ${
              passwordMessage.type === 'success'
                ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                : 'border-red-500/40 bg-red-500/10 text-red-300'
            }`}
          >
            {passwordMessage.type === 'success' ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
            )}
            <span>{passwordMessage.text}</span>
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Current Password */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                Current Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-white/10 bg-black/40 pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-600 focus:border-amber-400 focus:outline-none transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                New Password (Min 8 chars)
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-white/10 bg-black/40 pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-600 focus:border-amber-400 focus:outline-none transition-colors"
                  required
                />
              </div>
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPasswordConfirm}
                  onChange={(e) => setNewPasswordConfirm(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-white/10 bg-black/40 pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-600 focus:border-amber-400 focus:outline-none transition-colors"
                  required
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <span className="text-[11px] text-slate-500">
              Must be at least 8 characters with high cryptographic entropy
            </span>

            <button
              type="submit"
              disabled={passwordSaving}
              className="w-full sm:w-auto rounded-xl border border-amber-500/40 bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-2.5 font-display text-xs font-black uppercase tracking-wider text-black shadow-lg shadow-amber-500/20 hover:brightness-110 active:scale-95 disabled:opacity-50 transition-all"
            >
              {passwordSaving ? 'Updating Password...' : 'Save New Password'}
            </button>
          </div>
        </form>
      </div>

      {/* ============================================================ */}
      {/* 5. RESET PASSWORD VIA OTP OPTION ("reset ei oftion diba") */}
      {/* ============================================================ */}
      <div className="rounded-3xl border border-amber-500/20 bg-gradient-to-br from-[#0c1017]/95 via-[#080d16] to-[#070b12] p-6 sm:p-8 backdrop-blur-2xl shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-base sm:text-lg font-black uppercase tracking-wider text-white">
                Password Reset via OTP Code
              </h2>
              <p className="text-xs text-slate-400">
                Forgot your old password? Dispatch an official OTP verification code to reset immediately
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setResetPanelOpen(!resetPanelOpen)}
            className="self-start sm:self-auto rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 font-display text-xs font-bold text-amber-300 hover:bg-amber-500/10 hover:border-amber-500/40 transition-colors"
          >
            {resetPanelOpen ? 'Hide Reset Panel ▲' : 'Open Reset Option ▼'}
          </button>
        </div>

        {resetPanelOpen && (
          <div className="space-y-5 pt-2 animate-in fade-in duration-200">
            {resetMessage && (
              <div
                className={`flex items-center gap-3 rounded-2xl border p-4 text-xs font-medium ${
                  resetMessage.type === 'success'
                    ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                    : 'border-red-500/40 bg-red-500/10 text-red-300'
                }`}
              >
                {resetMessage.type === 'success' ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
                )}
                <span>{resetMessage.text}</span>
              </div>
            )}

            {!otpSent ? (
              <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-display text-sm font-bold text-white mb-1">
                    Send Verification Code
                  </h3>
                  <p className="text-xs text-slate-400">
                    We will send a 6-digit code to{' '}
                    <span className="font-mono text-amber-400 font-bold">
                      {user.email || user.phone}
                    </span>
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleRequestResetOtp}
                  disabled={otpSending}
                  className="rounded-xl border border-amber-500/40 bg-amber-500/15 px-5 py-2.5 font-display text-xs font-black uppercase tracking-wider text-amber-300 hover:bg-amber-500/25 active:scale-95 disabled:opacity-50 transition-all shrink-0"
                >
                  {otpSending ? 'Sending OTP Code...' : 'Dispatch OTP Code'}
                </button>
              </div>
            ) : (
              <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* OTP Code */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                      6-Digit OTP Code
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="123456"
                      className="w-full rounded-xl border border-amber-400/40 bg-black/50 px-4 py-2.5 font-mono text-center text-sm font-bold tracking-widest text-amber-300 focus:border-amber-400 focus:outline-none"
                      required
                    />
                  </div>

                  {/* New Password */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={resetShowPassword ? 'text' : 'password'}
                        value={resetNewPassword}
                        onChange={(e) => setResetNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-xs text-white focus:border-amber-400 focus:outline-none"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setResetShowPassword(!resetShowPassword)}
                        className="absolute right-3 top-3 text-slate-500 hover:text-slate-300"
                      >
                        {resetShowPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                      Confirm Password
                    </label>
                    <input
                      type={resetShowPassword ? 'text' : 'password'}
                      value={resetNewPasswordConfirm}
                      onChange={(e) => setResetNewPasswordConfirm(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-xs text-white focus:border-amber-400 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleRequestResetOtp}
                    disabled={resendCooldown > 0 || otpSending}
                    className="text-xs text-slate-400 hover:text-amber-400 disabled:opacity-50"
                  >
                    {resendCooldown > 0 ? `Resend Code in ${resendCooldown}s` : 'Did not receive code? Resend'}
                  </button>

                  <button
                    type="submit"
                    disabled={resetSubmitting}
                    className="w-full sm:w-auto rounded-xl border border-emerald-500/50 bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-2.5 font-display text-xs font-black uppercase tracking-wider text-black shadow-lg shadow-emerald-500/20 hover:brightness-110 active:scale-95 disabled:opacity-50 transition-all"
                  >
                    {resetSubmitting ? 'Resetting Password...' : 'Verify OTP & Reset Password'}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* 6. ACCOUNT SECURITY & METADATA OVERVIEW */}
      {/* ============================================================ */}
      <div className="rounded-3xl border border-white/10 bg-[#0c1017]/90 p-6 sm:p-7 backdrop-blur-2xl">
        <h3 className="font-display text-sm font-bold uppercase tracking-wider text-white mb-4 flex items-center gap-2">
          <Shield className="h-4 w-4 text-emerald-400" />
          Account Security & Cryptographic Safeguards
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 rounded-xl border border-white/5 bg-white/[0.02]">
            <p className="text-slate-400 text-[10px] uppercase font-display tracking-wider">Account ID</p>
            <p className="font-mono text-slate-200 mt-1 truncate">{user.id || 'ACTIVE'}</p>
          </div>

          <div className="p-3.5 rounded-xl border border-white/5 bg-white/[0.02]">
            <p className="text-slate-400 text-[10px] uppercase font-display tracking-wider">Role Permissions</p>
            <p className="font-mono text-amber-400 mt-1 font-bold">{user.role}</p>
          </div>

          <div className="p-3.5 rounded-xl border border-white/5 bg-white/[0.02]">
            <p className="text-slate-400 text-[10px] uppercase font-display tracking-wider">Session Security</p>
            <p className="font-mono text-emerald-400 mt-1 font-semibold">JWT Bearer • SSL</p>
          </div>

          <div className="p-3.5 rounded-xl border border-white/5 bg-white/[0.02]">
            <p className="text-slate-400 text-[10px] uppercase font-display tracking-wider">Storage Protocol</p>
            <p className="font-mono text-slate-200 mt-1 font-semibold">MongoDB Atlas Replica</p>
          </div>
        </div>
      </div>
    </div>
  );
}
