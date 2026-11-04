'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { authClient } from '../../../lib/auth-client';
import { useToast } from '../../../components/admin/ToastContext';
import { AdminLoadingSkeleton } from '../../../components/admin/AdminLoadingSkeleton';
import { AdminEmptyState } from '../../../components/admin/AdminEmptyState';
import { AdminErrorState } from '../../../components/admin/AdminErrorState';
import {
  Bell,
  Send,
  Users,
  CheckCircle2,
  Clock,
  Sparkles,
  RefreshCw,
  ShieldAlert,
  Sliders,
  AlertTriangle
} from 'lucide-react';

export default function AdminNotificationsPage() {
  const { showToast } = useToast();
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Composer State
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetType, setTargetType] = useState('ALL_USERS');
  const [targetUserId, setTargetUserId] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [isSending, setIsSending] = useState(false);

  const fetchMetrics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await authClient.getAdminNotificationMetrics();
      setMetrics(res);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch notification metrics.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  const handleSendCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      showToast('warning', 'Please provide both title and message.');
      return;
    }

    if (targetType === 'SINGLE_USER' && !targetUserId.trim()) {
      showToast('warning', 'Please enter a target User ID.');
      return;
    }

    setIsSending(true);
    try {
      const res = await authClient.sendAdminTargetedNotification({
        title: title.trim(),
        message: message.trim(),
        targetType,
        targetUserId: targetUserId.trim() || undefined,
        link: linkUrl.trim() || undefined
      });

      showToast('success', `Announcement delivered to ${res.recipientsCount} recipient(s).`);
      setTitle('');
      setMessage('');
      setLinkUrl('');
      setTargetUserId('');
      fetchMetrics();
    } catch (err: any) {
      showToast('error', err?.message || 'Failed to broadcast announcement.');
    } finally {
      setIsSending(false);
    }
  };

  if (loading) {
    return <AdminLoadingSkeleton rows={5} message="Loading Notification Telemetry & Campaign History..." />;
  }

  if (error || !metrics) {
    return <AdminErrorState message={error || 'Failed to load telemetry.'} onRetry={fetchMetrics} />;
  }

  const { totalCount, unreadCount, readRatePercent, recentNotifications } = metrics;

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-black uppercase tracking-tight text-white flex items-center gap-2.5">
            <Bell className="h-6 w-6 text-amber-400" />
            In-App Announcement Campaigns & Delivery
          </h1>
          <p className="font-display text-xs uppercase tracking-wider text-slate-400 mt-1">
            Broadcast platform updates, maintenance advisories, and targeted subscription alerts
          </p>
        </div>

        <button
          onClick={fetchMetrics}
          className="self-start sm:self-auto flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 font-display text-xs font-semibold uppercase tracking-wider text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl border border-white/10 bg-[#070b14] space-y-1">
          <span className="font-display text-xs uppercase tracking-wider text-slate-400">Total Notifications Sent</span>
          <div className="text-2xl font-black font-display text-white">{totalCount}</div>
          <p className="text-[11px] text-slate-500 font-mono">Platform-wide historical dispatch</p>
        </div>

        <div className="p-5 rounded-2xl border border-white/10 bg-[#070b14] space-y-1">
          <span className="font-display text-xs uppercase tracking-wider text-slate-400">Unread Inboxes</span>
          <div className="text-2xl font-black font-display text-amber-400">{unreadCount}</div>
          <p className="text-[11px] text-slate-500 font-mono">Awaiting customer review</p>
        </div>

        <div className="p-5 rounded-2xl border border-white/10 bg-[#070b14] space-y-1">
          <span className="font-display text-xs uppercase tracking-wider text-slate-400">Overall Read Rate</span>
          <div className="text-2xl font-black font-display text-emerald-400">{readRatePercent}%</div>
          <p className="text-[11px] text-slate-500 font-mono">High customer engagement</p>
        </div>
      </div>

      {/* Composer Card */}
      <div className="p-6 rounded-2xl border border-white/10 bg-[#070b14] space-y-6">
        <div className="pb-4 border-b border-white/5">
          <h2 className="font-display text-base font-bold uppercase tracking-wider text-white">
            Compose New In-App Announcement Campaign
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Dispatches high-priority in-app alerts directly to customer notification bells
          </p>
        </div>

        <form onSubmit={handleSendCampaign} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-display text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Target Audience <span className="text-amber-400">*</span>
              </label>
              <select
                value={targetType}
                onChange={(e) => setTargetType(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-xs text-white focus:border-amber-500/50 focus:outline-none"
              >
                <option value="ALL_USERS">All Platform Users (Global Broadcast)</option>
                <option value="PREMIUM_ONLY">Active Premium Subscribers Only</option>
                <option value="EXPIRING_SOON">Expiring Subscriptions (Next 7 Days)</option>
                <option value="SINGLE_USER">Single Specific User (By User ID)</option>
              </select>
            </div>

            {targetType === 'SINGLE_USER' ? (
              <div>
                <label className="block font-display text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Target User ID <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. 6adfca080c579ee26574789d"
                  value={targetUserId}
                  onChange={(e) => setTargetUserId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-xs text-white font-mono placeholder:text-slate-500 focus:border-amber-500/50 focus:outline-none"
                />
              </div>
            ) : (
              <div>
                <label className="block font-display text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Destination Link (Optional)
                </label>
                <input
                  type="text"
                  placeholder="/plans or /dashboard/tool"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-xs text-white placeholder:text-slate-500 focus:border-amber-500/50 focus:outline-none"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block font-display text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Announcement Title <span className="text-amber-400">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Platform Engine V2.5 Rollout Complete"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-xs text-white placeholder:text-slate-500 focus:border-amber-500/50 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-display text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Message Content <span className="text-amber-400">*</span>
            </label>
            <textarea
              rows={3}
              placeholder="Provide clear, concise information for the targeted members..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full p-3 rounded-xl border border-white/10 bg-white/5 text-xs text-white placeholder:text-slate-500 focus:border-amber-500/50 focus:outline-none resize-none"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSending}
              className="flex items-center gap-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 px-5 py-2.5 font-display text-xs font-bold uppercase tracking-wider text-black shadow-[0_0_15px_rgba(245,158,11,0.25)] transition-all disabled:opacity-50"
            >
              <Send className="h-3.5 w-3.5" />
              {isSending ? 'Dispatching Campaign...' : 'Send Campaign'}
            </button>
          </div>
        </form>
      </div>

      {/* Recent Dispatches Log */}
      <div className="p-6 rounded-2xl border border-white/10 bg-[#070b14] space-y-4">
        <h2 className="font-display text-base font-bold uppercase tracking-wider text-white">
          Recent Notification History
        </h2>

        {recentNotifications.length === 0 ? (
          <p className="text-xs text-slate-500">No recent notifications logged.</p>
        ) : (
          <div className="divide-y divide-white/5">
            {recentNotifications.map((n: any) => (
              <div key={n._id} className="py-3 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-display text-xs font-bold text-white">{n.title}</span>
                    <span className="rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5 text-[9px] font-display uppercase font-semibold text-slate-400">
                      {n.type}
                    </span>
                    {n.isRead ? (
                      <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono">
                        <CheckCircle2 className="h-3 w-3" /> Read
                      </span>
                    ) : (
                      <span className="text-[10px] text-amber-400 font-mono">Unread</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300">{n.message}</p>
                </div>
                <span className="text-[11px] font-mono text-slate-500 shrink-0">
                  {new Date(n.createdAt).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
