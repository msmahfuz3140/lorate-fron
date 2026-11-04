'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { authClient } from '../../../lib/auth-client';
import { useToast } from '../../../components/admin/ToastContext';
import { ConfirmDialog } from '../../../components/admin/ConfirmDialog';
import { AdminLoadingSkeleton } from '../../../components/admin/AdminLoadingSkeleton';
import { AdminErrorState } from '../../../components/admin/AdminErrorState';
import {
  Terminal,
  Power,
  ShieldAlert,
  ShieldCheck,
  Activity,
  Layers,
  Users,
  AlertTriangle,
  RefreshCw,
  Save,
  CheckCircle2,
  Clock,
  Radio,
  Sliders
} from 'lucide-react';

export default function AdminToolPage() {
  const { showToast } = useToast();
  const [telemetry, setTelemetry] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form states for settings update
  const [isToolEnabled, setIsToolEnabled] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [publicStatusMessage, setPublicStatusMessage] = useState('');
  const [toolAccessPolicy, setToolAccessPolicy] = useState('PREMIUM_ONLY');
  const [isSaving, setIsSaving] = useState(false);

  // Confirmation dialogs
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    variant: 'danger' | 'warning' | 'primary';
    action: () => Promise<void>;
  }>({
    isOpen: false,
    title: '',
    message: '',
    variant: 'warning',
    action: async () => {}
  });

  const fetchTelemetry = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await authClient.getAdminToolTelemetry();
      setTelemetry(res);
      if (res.settings) {
        setIsToolEnabled(res.settings.isToolEnabled);
        setMaintenanceMode(res.settings.maintenanceMode);
        setPublicStatusMessage(res.settings.publicStatusMessage || '');
        setToolAccessPolicy(res.settings.toolAccessPolicy || 'PREMIUM_ONLY');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch roulette tool telemetry.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTelemetry();
  }, [fetchTelemetry]);

  const handleSaveSettings = async (auditReason?: string) => {
    setIsSaving(true);
    try {
      await authClient.updateAdminToolSettings({
        isToolEnabled,
        maintenanceMode,
        publicStatusMessage,
        toolAccessPolicy,
        reason: auditReason || 'Admin updated tool operational parameters'
      });
      showToast('success', 'Roulette tool parameters updated successfully.');
      fetchTelemetry();
    } catch (err: any) {
      showToast('error', err?.message || 'Failed to update tool settings.');
    } finally {
      setIsSaving(false);
    }
  };

  const triggerSaveWithConfirm = (isCircuitBreaker = false) => {
    setConfirmDialog({
      isOpen: true,
      title: isCircuitBreaker ? 'Emergency Tool Circuit Breaker' : 'Update Tool Parameters',
      message: isCircuitBreaker
        ? 'Toggling tool availability impacts all active subscribers. Are you sure you wish to proceed?'
        : 'Update the live roulette tool configuration, access policy, and public status announcement?',
      variant: isCircuitBreaker ? 'danger' : 'warning',
      action: async (reason?: string) => {
        await handleSaveSettings(reason);
      }
    });
  };

  if (loading) {
    return <AdminLoadingSkeleton rows={5} message="Aggregating Real-Time Roulette Telemetry & Table Feeds..." />;
  }

  if (error || !telemetry) {
    return <AdminErrorState message={error || 'Telemetry unavailable.'} onRetry={fetchTelemetry} />;
  }

  const { settings, liveTablesCount, activeSubscribersWithAccess, uniqueUsersWithAccess, strategyDistribution, tables, telemetryNotice } = telemetry;

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-black uppercase tracking-tight text-white flex items-center gap-2.5">
            <Terminal className="h-6 w-6 text-amber-400" />
            Roulette Tool Operations & Telemetry
          </h1>
          <p className="font-display text-xs uppercase tracking-wider text-slate-400 mt-1">
            Algorithmic prediction engine controls, live table monitoring, and access controls
          </p>
        </div>

        <button
          onClick={fetchTelemetry}
          className="self-start sm:self-auto flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 font-display text-xs font-semibold uppercase tracking-wider text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh Feeds
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl border border-white/10 bg-[#070b14] space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="font-display text-xs uppercase tracking-wider">Engine Status</span>
            {isToolEnabled ? (
              <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 font-display uppercase">
                <Radio className="h-3 w-3 animate-pulse" /> Online
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[11px] font-bold text-rose-400 font-display uppercase">
                <Power className="h-3 w-3" /> Offline
              </span>
            )}
          </div>
          <div className="text-2xl font-black font-display text-white">
            {settings.toolVersion}
          </div>
          <p className="text-[11px] text-slate-400 font-mono">
            Policy: {toolAccessPolicy}
          </p>
        </div>

        <div className="p-5 rounded-2xl border border-white/10 bg-[#070b14] space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="font-display text-xs uppercase tracking-wider">Live Tables Streamed</span>
            <Activity className="h-4 w-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black font-display text-white">
            {liveTablesCount} Tables
          </div>
          <p className="text-[11px] text-slate-400 font-mono">
            Evolution & Pragmatic Feeds
          </p>
        </div>

        <div className="p-5 rounded-2xl border border-white/10 bg-[#070b14] space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="font-display text-xs uppercase tracking-wider">Authorized Active Sessions</span>
            <Users className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black font-display text-emerald-400">
            {activeSubscribersWithAccess} Subscriptions
          </div>
          <p className="text-[11px] text-slate-400 font-mono">
            {uniqueUsersWithAccess} Unique Eligible Accounts
          </p>
        </div>

        <div className="p-5 rounded-2xl border border-white/10 bg-[#070b14] space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="font-display text-xs uppercase tracking-wider">Active Models</span>
            <Layers className="h-4 w-4 text-sky-400" />
          </div>
          <div className="text-2xl font-black font-display text-white">
            3 Core Algorithms
          </div>
          <p className="text-[11px] text-slate-400 font-mono">
            Offset, Target, Dealer Signature
          </p>
        </div>
      </div>

      {/* Operational Controls Card */}
      <div className="p-6 rounded-2xl border border-white/10 bg-[#070b14] space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-white/5">
          <div>
            <h2 className="font-display text-base font-bold uppercase tracking-wider text-white">
              Master Engine Circuit Breaker & Maintenance Controls
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Instantly toggle prediction suite access or schedule maintenance windows
            </p>
          </div>
          <button
            onClick={() => triggerSaveWithConfirm(true)}
            disabled={isSaving}
            className="flex items-center gap-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 px-4 py-2 font-display text-xs font-bold uppercase tracking-wider text-black shadow-[0_0_15px_rgba(245,158,11,0.25)] transition-all disabled:opacity-50"
          >
            <Save className="h-3.5 w-3.5" />
            {isSaving ? 'Applying Changes...' : 'Save Parameters'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Master Toggles */}
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/[0.02]">
              <div>
                <p className="font-display text-xs font-bold uppercase tracking-wider text-white">
                  Prediction Suite Engine Enabled
                </p>
                <p className="text-[11px] text-slate-400">
                  Master killswitch to disable all table prediction computations
                </p>
              </div>
              <input
                type="checkbox"
                checked={isToolEnabled}
                onChange={(e) => setIsToolEnabled(e.target.checked)}
                className="h-5 w-5 rounded border-white/20 bg-white/10 text-amber-500 focus:ring-0 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/[0.02]">
              <div>
                <p className="font-display text-xs font-bold uppercase tracking-wider text-white">
                  Maintenance Mode Mode
                </p>
                <p className="text-[11px] text-slate-400">
                  Displays maintenance notice to subscribers while reserving inspection access for Main Admins
                </p>
              </div>
              <input
                type="checkbox"
                checked={maintenanceMode}
                onChange={(e) => setMaintenanceMode(e.target.checked)}
                className="h-5 w-5 rounded border-white/20 bg-white/10 text-amber-500 focus:ring-0 cursor-pointer"
              />
            </div>

            <div>
              <label className="block font-display text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Tool Access Policy
              </label>
              <select
                value={toolAccessPolicy}
                onChange={(e) => setToolAccessPolicy(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-xs text-white focus:border-amber-500/50 focus:outline-none"
              >
                <option value="PREMIUM_ONLY">PREMIUM ONLY (Paid Subscribers & Admins)</option>
                <option value="OPEN_BETA">OPEN BETA (All Registered Users)</option>
                <option value="MAINTENANCE">MAINTENANCE (Admin Exclusive)</option>
              </select>
            </div>
          </div>

          {/* Public Status Message */}
          <div className="space-y-2">
            <label className="block font-display text-xs font-semibold uppercase tracking-wider text-slate-300">
              Public Status Announcement
            </label>
            <p className="text-[11px] text-slate-400 mb-1.5">
              Served to clients visiting `/dashboard/tool` and public status endpoints
            </p>
            <textarea
              value={publicStatusMessage}
              onChange={(e) => setPublicStatusMessage(e.target.value)}
              rows={5}
              placeholder="All roulette prediction systems and real-time feeds are operating normally."
              className="w-full p-3 rounded-xl border border-white/10 bg-white/5 text-xs text-white placeholder:text-slate-500 focus:border-amber-500/50 focus:outline-none resize-none"
            />
          </div>
        </div>
      </div>

      {/* Live Table Feeds Monitor */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-base font-bold uppercase tracking-wider text-white flex items-center gap-2">
            <Radio className="h-4 w-4 text-emerald-400 animate-pulse" />
            Live Monitored Casino Tables & Wheel Physics
          </h2>
          <span className="text-xs text-slate-400 font-mono">
            Updated: Real-time telemetry stream
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tables.map((tbl: any) => (
            <div
              key={tbl.id}
              className="p-4 rounded-2xl border border-white/10 bg-[#070b14] space-y-3 hover:border-amber-500/30 transition-all"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display text-sm font-bold text-white">{tbl.name}</h3>
                  <span className="text-[10px] text-slate-400 font-mono">{tbl.provider}</span>
                </div>
                <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold font-display uppercase text-emerald-300">
                  LIVE
                </span>
              </div>

              <div>
                <span className="text-[10px] font-display uppercase tracking-wider text-slate-400 block mb-1">
                  Active Algorithmic Strategy:
                </span>
                <span className="font-mono text-xs font-bold text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded">
                  {tbl.activeStrategy}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-display uppercase tracking-wider text-slate-400 block mb-1">
                  Recent Spin History:
                </span>
                <div className="flex flex-wrap gap-1">
                  {tbl.recentNumbers.slice(0, 10).map((n: number, idx: number) => {
                    const isZero = n === 0;
                    const isRed = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36].includes(n);
                    return (
                      <span
                        key={idx}
                        className={`h-6 w-6 flex items-center justify-center rounded-md font-mono text-xs font-black text-white ${
                          isZero ? 'bg-emerald-600' : isRed ? 'bg-rose-600' : 'bg-slate-800'
                        }`}
                      >
                        {n}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Honest Analytics Disclosure Card */}
      <div className="p-5 rounded-2xl border border-amber-500/20 bg-amber-500/5 space-y-2">
        <div className="flex items-center gap-2 text-amber-400 font-display text-xs font-bold uppercase tracking-wider">
          <ShieldAlert className="h-4 w-4" />
          Regulatory & Algorithmic Disclosure (Zero-Deception Mandate)
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          {telemetryNotice.disclaimer}
        </p>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        variant={confirmDialog.variant}
        requireReason={true}
        onConfirm={async (reason) => {
          await confirmDialog.action();
        }}
        onClose={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
