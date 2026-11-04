'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { authClient } from '../../../lib/auth-client';
import { useToast } from '../../../components/admin/ToastContext';
import { ConfirmDialog } from '../../../components/admin/ConfirmDialog';
import { AdminLoadingSkeleton } from '../../../components/admin/AdminLoadingSkeleton';
import { AdminEmptyState } from '../../../components/admin/AdminEmptyState';
import { AdminErrorState } from '../../../components/admin/AdminErrorState';
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  UserX,
  Lock,
  KeyRound,
  History,
  RefreshCw,
  LogOut,
  Clock,
  Radio,
  FileCheck2,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';

export default function AdminSecurityPage() {
  const { showToast } = useToast();
  const [overview, setOverview] = useState<any>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Session Revocation Dialog State
  const [revokeTargetUserId, setRevokeTargetUserId] = useState('');
  const [revokeModalOpen, setRevokeModalOpen] = useState(false);

  const fetchSecurityData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [ov, al] = await Promise.all([
        authClient.getAdminSecurityOverview(),
        authClient.getAdminSecurityAlerts()
      ]);
      setOverview(ov);
      setAlerts(al);
    } catch (err: any) {
      setError(err?.message || 'Failed to query security center telemetry.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSecurityData();
  }, [fetchSecurityData]);

  const handleRevokeSessions = async (reason?: string) => {
    if (!revokeTargetUserId.trim()) {
      showToast('warning', 'Target User ID is required.');
      return;
    }

    try {
      await authClient.revokeAdminUserSessions(
        revokeTargetUserId.trim(),
        reason || 'Administrative emergency security session revocation'
      );
      showToast('success', `All active sessions revoked for User ${revokeTargetUserId}.`);
      setRevokeTargetUserId('');
      fetchSecurityData();
    } catch (err: any) {
      showToast('error', err?.message || 'Failed to revoke sessions.');
    }
  };

  if (loading) {
    return <AdminLoadingSkeleton rows={6} message="Scanning Security Infrastructure & Threat Logs..." />;
  }

  if (error || !overview) {
    return <AdminErrorState message={error || 'Security data unavailable.'} onRetry={fetchSecurityData} />;
  }

  const { blockedCount, suspendedCount, otpAttempts24h, expiredOtps24h, recentAuditLogs, recentFailedPayments, suspiciousReferrals, systemHealth } = overview;

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-black uppercase tracking-tight text-white flex items-center gap-2.5">
            <ShieldCheck className="h-6 w-6 text-emerald-400" />
            Security Operations Center (SOC)
          </h1>
          <p className="font-display text-xs uppercase tracking-wider text-slate-400 mt-1">
            Real-time brute force detection, session revocation, and immutable privilege audit logs
          </p>
        </div>

        <button
          onClick={fetchSecurityData}
          className="self-start sm:self-auto flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 font-display text-xs font-semibold uppercase tracking-wider text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Rescan Security State
        </button>
      </div>

      {/* Security Health Scorecard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl border border-white/10 bg-[#070b14] space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="font-display text-xs uppercase tracking-wider">Blocked Accounts</span>
            <UserX className="h-4 w-4 text-rose-400" />
          </div>
          <div className="text-2xl font-black font-display text-rose-400">{blockedCount}</div>
          <p className="text-[11px] text-slate-500 font-mono">Excluded from platform access</p>
        </div>

        <div className="p-5 rounded-2xl border border-white/10 bg-[#070b14] space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="font-display text-xs uppercase tracking-wider">Suspended Accounts</span>
            <Lock className="h-4 w-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black font-display text-amber-400">{suspendedCount}</div>
          <p className="text-[11px] text-slate-500 font-mono">Temporary hold pending audit</p>
        </div>

        <div className="p-5 rounded-2xl border border-white/10 bg-[#070b14] space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="font-display text-xs uppercase tracking-wider">OTP Brute Attempts (24h)</span>
            <KeyRound className="h-4 w-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black font-display text-white">{otpAttempts24h}</div>
          <p className="text-[11px] text-slate-500 font-mono">Flagged identifier attempts</p>
        </div>

        <div className="p-5 rounded-2xl border border-white/10 bg-[#070b14] space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="font-display text-xs uppercase tracking-wider">Cryptographic Guard</span>
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-sm font-bold font-display text-emerald-400 uppercase">
            SHA-512 + TimingSafe
          </div>
          <p className="text-[11px] text-slate-500 font-mono">Webhook & token validation</p>
        </div>
      </div>

      {/* Emergency Session Revocation Card */}
      <div className="p-6 rounded-2xl border border-white/10 bg-[#070b14] space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-400">
            <LogOut className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-display text-base font-bold uppercase tracking-wider text-white">
              Targeted Session Revocation (Immediate JWT Termination)
            </h2>
            <p className="text-xs text-slate-400">
              Invalidates all active browser tokens for a compromised user account immediately
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <input
            type="text"
            placeholder="Enter Target User ID (e.g. 6adfca080c579ee26574789d)..."
            value={revokeTargetUserId}
            onChange={(e) => setRevokeTargetUserId(e.target.value)}
            className="flex-1 w-full p-2.5 rounded-xl border border-white/10 bg-white/5 text-xs text-white font-mono placeholder:text-slate-500 focus:border-rose-500/50 focus:outline-none"
          />
          <button
            onClick={() => {
              if (!revokeTargetUserId.trim()) {
                showToast('warning', 'Please enter a target User ID first.');
                return;
              }
              setRevokeModalOpen(true);
            }}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 px-5 py-2.5 font-display text-xs font-bold uppercase tracking-wider text-white shadow-[0_0_15px_rgba(244,63,94,0.3)] transition-all"
          >
            <LogOut className="h-3.5 w-3.5" />
            Revoke Sessions
          </button>
        </div>
      </div>

      {/* Security Alerts Stream */}
      <div className="p-6 rounded-2xl border border-white/10 bg-[#070b14] space-y-4">
        <h2 className="font-display text-base font-bold uppercase tracking-wider text-white flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-400" />
          Active Incident & Anomaly Alerts
        </h2>

        {alerts.length === 0 ? (
          <p className="text-xs text-slate-500">No active security alerts in the past 48 hours.</p>
        ) : (
          <div className="space-y-3">
            {alerts.map((al) => {
              const isHigh = al.severity === 'HIGH';
              return (
                <div
                  key={al.id}
                  className={`p-4 rounded-xl border flex items-start justify-between gap-4 ${
                    isHigh
                      ? 'border-rose-500/30 bg-rose-500/5 text-rose-200'
                      : 'border-amber-500/30 bg-amber-500/5 text-amber-200'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-display text-xs font-bold uppercase text-white">
                        {al.title}
                      </span>
                      <span
                        className={`rounded px-1.5 py-0.5 text-[9px] font-display uppercase font-bold ${
                          isHigh ? 'bg-rose-500/20 text-rose-300' : 'bg-amber-500/20 text-amber-300'
                        }`}
                      >
                        {al.severity}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300">{al.description}</p>
                  </div>
                  <span className="text-[11px] font-mono text-slate-500 shrink-0">
                    {new Date(al.createdAt).toLocaleString()}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Confirmation Dialog for Session Revocation */}
      <ConfirmDialog
        isOpen={revokeModalOpen}
        title="Confirm Session Revocation"
        message={`Are you sure you want to terminate all active sessions for User ID: ${revokeTargetUserId}? The user will be immediately logged out and must re-authenticate.`}
        variant="danger"
        confirmText="Revoke User Tokens"
        requireReason={true}
        reasonPlaceholder="State the security violation or administrative reason..."
        onConfirm={handleRevokeSessions}
        onClose={() => setRevokeModalOpen(false)}
      />
    </div>
  );
}
