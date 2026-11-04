'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { authClient } from '../../../lib/auth-client';
import { SubscriptionPlan } from '../../../shared/plans';
import {
  Settings,
  Terminal,
  Shield,
  Layers,
  Globe,
  Bell,
  Save,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Edit2,
  Eye,
  EyeOff,
  Power,
  ShieldAlert,
  Sparkles,
  DollarSign,
  Palette,
  Share2,
  FileText,
  HelpCircle,
  Plus,
  Trash2,
  Send,
  Lock,
  ArrowUpDown
} from 'lucide-react';

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<'tool' | 'plans' | 'website' | 'announcements'>('tool');
  const [loading, setLoading] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Tool Settings State
  const [toolSettings, setToolSettings] = useState<any>({
    isToolEnabled: true,
    maintenanceMode: false,
    publicStatusMessage: '',
    toolVersion: 'v2.5.0-pro',
    toolAccessPolicy: 'PREMIUM_ONLY',
    premiumRequirements: ''
  });
  const [savingTool, setSavingTool] = useState(false);

  // Plans Management State
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [editPriceUsd, setEditPriceUsd] = useState<number>(0);
  const [editDescription, setEditDescription] = useState<string>('');
  const [editFeatures, setEditFeatures] = useState<string>('');
  const [editIsActive, setEditIsActive] = useState<boolean>(true);
  const [editIsVisible, setEditIsVisible] = useState<boolean>(true);
  const [editDisplayOrder, setEditDisplayOrder] = useState<number>(0);
  const [savingPlan, setSavingPlan] = useState(false);

  // Website Settings State
  const [websiteSettings, setWebsiteSettings] = useState<any>(null);
  const [savingWebsite, setSavingWebsite] = useState(false);

  // In-App Broadcast Announcement State
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastRole, setBroadcastRole] = useState<'ALL' | 'USER' | 'MODERATOR'>('ALL');
  const [broadcasting, setBroadcasting] = useState(false);
  const [broadcastResult, setBroadcastResult] = useState<string | null>(null);

  const fetchAllSettings = useCallback(async () => {
    setLoading(true);
    setSaveError(null);
    try {
      const [toolRes, plansRes, webRes] = await Promise.all([
        authClient.getAdminToolSettings(),
        authClient.getAdminPlans(),
        authClient.getAdminWebsiteSettings()
      ]);

      if (toolRes) setToolSettings(toolRes);
      if (plansRes) setPlans(plansRes);
      if (webRes) setWebsiteSettings(webRes);
    } catch (err: any) {
      setSaveError(err?.message || 'Failed to load system settings.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllSettings();
  }, [fetchAllSettings]);

  // Clear notifications after 4s
  useEffect(() => {
    if (saveSuccess) {
      const timer = setTimeout(() => setSaveSuccess(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [saveSuccess]);

  // Handlers for Tool Settings
  const handleSaveToolSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingTool(true);
    setSaveError(null);
    setSaveSuccess(null);
    try {
      const updated = await authClient.updateAdminToolSettings({
        isToolEnabled: toolSettings.isToolEnabled,
        maintenanceMode: toolSettings.maintenanceMode,
        publicStatusMessage: toolSettings.publicStatusMessage,
        toolVersion: toolSettings.toolVersion,
        toolAccessPolicy: toolSettings.toolAccessPolicy,
        premiumRequirements: toolSettings.premiumRequirements
      });
      setToolSettings(updated);
      setSaveSuccess('Tool parameters saved and server policies synchronized.');
    } catch (err: any) {
      setSaveError(err?.message || 'Failed to update tool settings.');
    } finally {
      setSavingTool(false);
    }
  };

  // Handlers for Plan Editing
  const openEditPlan = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    setEditPriceUsd(plan.priceUsd);
    setEditDescription(plan.description);
    setEditFeatures((plan.features || []).join('\n'));
    setEditIsActive(plan.isActive);
    setEditIsVisible(plan.isVisible);
    setEditDisplayOrder(plan.displayOrder || 0);
  };

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan) return;
    setSavingPlan(true);
    setSaveError(null);
    setSaveSuccess(null);

    try {
      const featuresArray = editFeatures
        .split('\n')
        .map((f) => f.trim())
        .filter(Boolean);

      const updated = await authClient.updateAdminPlan(editingPlan.id, {
        priceUsd: editPriceUsd,
        description: editDescription,
        features: featuresArray,
        isActive: editIsActive,
        isVisible: editIsVisible,
        displayOrder: editDisplayOrder
      });

      setPlans((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      setEditingPlan(null);
      setSaveSuccess(`Plan "${updated.name}" updated successfully. Existing payment orders are preserved.`);
    } catch (err: any) {
      setSaveError(err?.message || 'Failed to save subscription plan.');
    } finally {
      setSavingPlan(false);
    }
  };

  // Handlers for Website Settings
  const handleSaveWebsiteSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingWebsite(true);
    setSaveError(null);
    setSaveSuccess(null);
    try {
      const updated = await authClient.updateAdminWebsiteSettings(websiteSettings);
      setWebsiteSettings(updated);
      setSaveSuccess('Website configuration and content sanitized and persisted successfully.');
    } catch (err: any) {
      setSaveError(err?.message || 'Failed to save website configuration.');
    } finally {
      setSavingWebsite(false);
    }
  };

  // Handlers for Broadcast Announcement
  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle || !broadcastMessage) {
      setSaveError('Please enter both title and message for broadcast.');
      return;
    }
    setBroadcasting(true);
    setSaveError(null);
    setBroadcastResult(null);

    try {
      const res = await authClient.broadcastAnnouncement({
        title: broadcastTitle,
        message: broadcastMessage,
        targetRole: broadcastRole === 'ALL' ? undefined : broadcastRole
      });
      setBroadcastResult(`Successfully delivered announcement to ${res.recipientCount || 'all'} registered user inboxes.`);
      setBroadcastTitle('');
      setBroadcastMessage('');
    } catch (err: any) {
      setSaveError(err?.message || 'Failed to deliver broadcast announcement.');
    } finally {
      setBroadcasting(false);
    }
  };

  // Helper for adding/removing FAQs in website settings
  const handleAddFaq = () => {
    const currentFaqs = websiteSettings?.faqItems || [];
    setWebsiteSettings({
      ...websiteSettings,
      faqItems: [
        ...currentFaqs,
        { question: 'New Question', answer: 'Answer content here...', order: currentFaqs.length + 1 }
      ]
    });
  };

  const handleRemoveFaq = (index: number) => {
    const currentFaqs = [...(websiteSettings?.faqItems || [])];
    currentFaqs.splice(index, 1);
    setWebsiteSettings({
      ...websiteSettings,
      faqItems: currentFaqs
    });
  };

  const handleUpdateFaq = (index: number, field: 'question' | 'answer', value: string) => {
    const currentFaqs = [...(websiteSettings?.faqItems || [])];
    currentFaqs[index] = { ...currentFaqs[index], [field]: value };
    setWebsiteSettings({
      ...websiteSettings,
      faqItems: currentFaqs
    });
  };

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl sm:text-3xl font-black uppercase tracking-wider text-white">
              Platform Governance & Settings
            </h1>
            <span className="rounded-full border border-amber-500/40 bg-amber-500/10 px-2.5 py-0.5 font-display text-[10px] font-bold uppercase tracking-widest text-amber-400">
              Admin Console
            </span>
          </div>
          <p className="font-body text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl">
            Configure real-time tool operational modes, manage subscription pricing tiers, edit sanitized brand and legal content, and transmit in-app platform alerts.
          </p>
        </div>

        <button
          onClick={fetchAllSettings}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 font-display text-xs font-bold uppercase tracking-wider text-slate-300 hover:bg-white/10 hover:text-white transition-all disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          Reload Settings
        </button>
      </div>

      {/* Global Alerts / Messages */}
      {saveSuccess && (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-emerald-400 font-display text-xs font-bold uppercase tracking-wider animate-fade-in">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <span>{saveSuccess}</span>
        </div>
      )}

      {saveError && (
        <div className="flex items-center gap-3 rounded-2xl border border-rose-500/40 bg-rose-500/10 p-4 text-rose-400 font-display text-xs font-bold uppercase tracking-wider animate-fade-in">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <span>{saveError}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('tool')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-display text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
            activeTab === 'tool'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Terminal className="h-4 w-4" />
          Tool Management
        </button>

        <button
          onClick={() => setActiveTab('plans')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-display text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
            activeTab === 'plans'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Layers className="h-4 w-4" />
          Premium Plans ({plans.length})
        </button>

        <button
          onClick={() => setActiveTab('website')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-display text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
            activeTab === 'website'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Globe className="h-4 w-4" />
          Website & Branding
        </button>

        <button
          onClick={() => setActiveTab('announcements')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-display text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
            activeTab === 'announcements'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Bell className="h-4 w-4" />
          In-App Broadcasts
        </button>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
          <p className="font-display text-xs uppercase tracking-widest text-slate-400">
            Synchronizing administrative configurations...
          </p>
        </div>
      ) : (
        <>
          {/* TAB 1: TOOL MANAGEMENT */}
          {activeTab === 'tool' && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-white/10 bg-[#070c16]/80 p-6 backdrop-blur-xl">
                <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-6">
                  <div>
                    <h2 className="font-display text-base font-bold uppercase tracking-wider text-white">
                      Roulette Prediction Engine Controls
                    </h2>
                    <p className="font-body text-xs text-slate-400 mt-0.5">
                      Server-side gatekeeping for live table telemetry. Disabling tool access never deletes user subscriptions or invalidates session tokens.
                    </p>
                  </div>
                  <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-mono font-bold text-emerald-400">
                    Engine {toolSettings.toolVersion}
                  </span>
                </div>

                <form onSubmit={handleSaveToolSettings} className="space-y-6">
                  {/* Status Toggles Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Tool Enabled Toggle */}
                    <div className="rounded-xl border border-white/10 bg-black/30 p-4 flex items-center justify-between">
                      <div>
                        <span className="font-display text-xs font-bold uppercase tracking-wider text-white block">
                          Engine Master State
                        </span>
                        <p className="font-body text-[11px] text-slate-400 mt-1">
                          When disabled, subscribers see a safe offline notification banner.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setToolSettings({
                            ...toolSettings,
                            isToolEnabled: !toolSettings.isToolEnabled
                          })
                        }
                        className={`flex items-center gap-2 rounded-xl px-4 py-2 font-display text-xs font-bold uppercase tracking-wider transition-all ${
                          toolSettings.isToolEnabled
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                            : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                        }`}
                      >
                        <Power className="h-3.5 w-3.5" />
                        {toolSettings.isToolEnabled ? 'Enabled' : 'Disabled'}
                      </button>
                    </div>

                    {/* Maintenance Mode Toggle */}
                    <div className="rounded-xl border border-white/10 bg-black/30 p-4 flex items-center justify-between">
                      <div>
                        <span className="font-display text-xs font-bold uppercase tracking-wider text-white block">
                          Scheduled Maintenance Mode
                        </span>
                        <p className="font-body text-[11px] text-slate-400 mt-1">
                          Locks non-admin users with maintenance status message.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setToolSettings({
                            ...toolSettings,
                            maintenanceMode: !toolSettings.maintenanceMode
                          })
                        }
                        className={`flex items-center gap-2 rounded-xl px-4 py-2 font-display text-xs font-bold uppercase tracking-wider transition-all ${
                          toolSettings.maintenanceMode
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                            : 'bg-slate-500/10 text-slate-400 border border-white/10'
                        }`}
                      >
                        <AlertTriangle className="h-3.5 w-3.5" />
                        {toolSettings.maintenanceMode ? 'Active (Locked)' : 'Normal (Unlocked)'}
                      </button>
                    </div>
                  </div>

                  {/* Public Status Message */}
                  <div>
                    <label className="font-display text-xs font-bold uppercase tracking-wider text-slate-300 block mb-2">
                      Public Status Announcement
                    </label>
                    <textarea
                      rows={2}
                      value={toolSettings.publicStatusMessage}
                      onChange={(e) =>
                        setToolSettings({ ...toolSettings, publicStatusMessage: e.target.value })
                      }
                      placeholder="e.g. All roulette prediction systems and real-time feeds are operating normally."
                      className="w-full rounded-xl border border-white/10 bg-black/40 p-3 font-body text-xs text-white placeholder-slate-600 focus:border-amber-500 focus:outline-none"
                    />
                    <p className="font-mono text-[10px] text-slate-500 mt-1">
                      Rendered on the public tool status API and user lock overlays.
                    </p>
                  </div>

                  {/* Configuration Details Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="font-display text-xs font-bold uppercase tracking-wider text-slate-300 block mb-2">
                        Tool Engine Version
                      </label>
                      <input
                        type="text"
                        value={toolSettings.toolVersion}
                        onChange={(e) =>
                          setToolSettings({ ...toolSettings, toolVersion: e.target.value })
                        }
                        className="w-full rounded-xl border border-white/10 bg-black/40 p-3 font-mono text-xs text-white focus:border-amber-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="font-display text-xs font-bold uppercase tracking-wider text-slate-300 block mb-2">
                        Tool Access Policy
                      </label>
                      <select
                        value={toolSettings.toolAccessPolicy}
                        onChange={(e) =>
                          setToolSettings({
                            ...toolSettings,
                            toolAccessPolicy: e.target.value as any
                          })
                        }
                        className="w-full rounded-xl border border-white/10 bg-black/40 p-3 font-display text-xs text-white focus:border-amber-500 focus:outline-none"
                      >
                        <option value="PREMIUM_ONLY">PREMIUM_ONLY (Strict Subscriber Authorization)</option>
                        <option value="OPEN_BETA">OPEN_BETA (Unrestricted Authenticated Access)</option>
                        <option value="MAINTENANCE">MAINTENANCE (Super Admins Only)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="font-display text-xs font-bold uppercase tracking-wider text-slate-300 block mb-2">
                      Premium Requirements Notice
                    </label>
                    <input
                      type="text"
                      value={toolSettings.premiumRequirements}
                      onChange={(e) =>
                        setToolSettings({ ...toolSettings, premiumRequirements: e.target.value })
                      }
                      className="w-full rounded-xl border border-white/10 bg-black/40 p-3 font-body text-xs text-white focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={savingTool}
                      className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-3 font-display text-xs font-bold uppercase tracking-wider text-black shadow-lg shadow-amber-500/20 hover:brightness-110 transition-all disabled:opacity-50"
                    >
                      <Save className="h-4 w-4" />
                      {savingTool ? 'Saving...' : 'Apply Tool Settings'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* TAB 2: PREMIUM PLAN MANAGEMENT */}
          {activeTab === 'plans' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display text-base font-bold uppercase tracking-wider text-white">
                    Subscription Plans & Pricing Tiers
                  </h2>
                  <p className="font-body text-xs text-slate-400 mt-0.5">
                    Main Admins can adjust prices, reorder tiers, and update display highlights. Existing payment orders retain immutable snapshots.
                  </p>
                </div>
              </div>

              {/* Plans Table / Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {plans.map((plan) => (
                  <div
                    key={plan.id}
                    className={`rounded-2xl border p-5 flex flex-col justify-between transition-all ${
                      plan.isActive
                        ? 'border-white/10 bg-[#070c16]/90'
                        : 'border-white/5 bg-black/40 opacity-70'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-display text-sm font-bold uppercase tracking-wider text-white">
                              {plan.name}
                            </span>
                            {plan.isPopular && (
                              <span className="rounded-full bg-amber-500/20 border border-amber-500/40 px-2 py-0.5 text-[9px] font-display font-bold text-amber-400 uppercase">
                                Popular
                              </span>
                            )}
                          </div>
                          <p className="font-body text-xs text-slate-400 mt-1 line-clamp-2">
                            {plan.description}
                          </p>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openEditPlan(plan)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20"
                            title="Edit Plan"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="mt-4 flex items-baseline gap-2 border-b border-white/5 pb-3">
                        <span className="font-display text-2xl font-black text-white">
                          ${plan.priceUsd}
                        </span>
                        <span className="font-mono text-xs text-slate-500">
                          / {plan.durationDays} days
                        </span>
                        <span className="ml-auto font-mono text-[10px] text-slate-500">
                          Order #{plan.displayOrder || 0}
                        </span>
                      </div>

                      <div className="mt-3 space-y-1">
                        <span className="font-display text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Display Features:
                        </span>
                        <ul className="space-y-1 text-xs text-slate-300 font-body">
                          {(plan.features || []).slice(0, 4).map((feat, idx) => (
                            <li key={idx} className="flex items-center gap-1.5 text-[11px]">
                              <CheckCircle2 className="h-3 w-3 text-emerald-400 shrink-0" />
                              <span className="truncate">{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="mt-5 flex items-center justify-between border-t border-white/5 pt-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-block h-2 w-2 rounded-full ${
                            plan.isActive ? 'bg-emerald-400' : 'bg-rose-400'
                          }`}
                        />
                        <span className="font-display text-[10px] uppercase font-bold text-slate-400">
                          {plan.isActive ? 'Active' : 'Disabled'}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 text-[10px] font-mono text-slate-500">
                        {plan.isVisible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                        <span>{plan.isVisible ? 'Public' : 'Hidden'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Edit Plan Modal */}
              {editingPlan && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
                  <div className="relative w-full max-w-lg rounded-3xl border border-amber-500/40 bg-[#0d131f] p-6 shadow-2xl">
                    <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
                      <div>
                        <h3 className="font-display text-base font-bold uppercase tracking-wider text-white">
                          Configure {editingPlan.name}
                        </h3>
                        <p className="font-mono text-xs text-amber-400">
                          ID: {editingPlan.id} • {editingPlan.durationDays} Days Duration
                        </p>
                      </div>
                      <button
                        onClick={() => setEditingPlan(null)}
                        className="rounded-lg p-1.5 text-slate-400 hover:text-white"
                      >
                        ✕
                      </button>
                    </div>

                    <form onSubmit={handleSavePlan} className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="font-display text-xs font-bold uppercase tracking-wider text-slate-300 block mb-1">
                            Price (USD)
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-2.5 text-slate-500 text-xs font-mono">$</span>
                            <input
                              type="number"
                              min={1}
                              step={1}
                              value={editPriceUsd}
                              onChange={(e) => setEditPriceUsd(Number(e.target.value))}
                              className="w-full rounded-xl border border-white/10 bg-black/40 pl-7 p-2.5 font-mono text-xs text-white focus:border-amber-500 focus:outline-none"
                            />
                          </div>
                          <span className="text-[10px] font-mono text-slate-500 mt-1 block">
                            Stored as {editPriceUsd * 100} cents
                          </span>
                        </div>

                        <div>
                          <label className="font-display text-xs font-bold uppercase tracking-wider text-slate-300 block mb-1">
                            Display Order
                          </label>
                          <input
                            type="number"
                            value={editDisplayOrder}
                            onChange={(e) => setEditDisplayOrder(Number(e.target.value))}
                            className="w-full rounded-xl border border-white/10 bg-black/40 p-2.5 font-mono text-xs text-white focus:border-amber-500 focus:outline-none"
                          />
                          <span className="text-[10px] font-mono text-slate-500 mt-1 block">
                            Lower numbers display first
                          </span>
                        </div>
                      </div>

                      <div>
                        <label className="font-display text-xs font-bold uppercase tracking-wider text-slate-300 block mb-1">
                          Plan Description
                        </label>
                        <input
                          type="text"
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          className="w-full rounded-xl border border-white/10 bg-black/40 p-2.5 font-body text-xs text-white focus:border-amber-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="font-display text-xs font-bold uppercase tracking-wider text-slate-300 block mb-1">
                          Display Features (One per line)
                        </label>
                        <textarea
                          rows={4}
                          value={editFeatures}
                          onChange={(e) => setEditFeatures(e.target.value)}
                          className="w-full rounded-xl border border-white/10 bg-black/40 p-2.5 font-body text-xs text-white focus:border-amber-500 focus:outline-none"
                        />
                      </div>

                      {/* Status Checkboxes */}
                      <div className="flex items-center gap-6 pt-1">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editIsActive}
                            onChange={(e) => setEditIsActive(e.target.checked)}
                            className="rounded border-white/20 bg-black/40 text-amber-500"
                          />
                          <span className="font-display text-xs uppercase font-bold text-slate-300">
                            Purchasable (Active)
                          </span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editIsVisible}
                            onChange={(e) => setEditIsVisible(e.target.checked)}
                            className="rounded border-white/20 bg-black/40 text-amber-500"
                          />
                          <span className="font-display text-xs uppercase font-bold text-slate-300">
                            Publicly Visible
                          </span>
                        </label>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-4 border-t border-white/10">
                        <button
                          type="button"
                          onClick={() => setEditingPlan(null)}
                          className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 font-display text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-white"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={savingPlan}
                          className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-2 font-display text-xs font-bold uppercase tracking-wider text-black shadow-lg hover:brightness-110 disabled:opacity-50"
                        >
                          <Save className="h-3.5 w-3.5" />
                          {savingPlan ? 'Saving...' : 'Save Plan'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: WEBSITE & BRANDING */}
          {activeTab === 'website' && websiteSettings && (
            <form onSubmit={handleSaveWebsiteSettings} className="space-y-6">
              {/* Security Banner */}
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4 flex items-center gap-3">
                <Shield className="h-5 w-5 text-emerald-400 shrink-0" />
                <span className="font-body text-xs text-slate-300">
                  Strict HTML sanitization active. Arbitrary script tags, embedded objects, and event handlers are automatically neutralized to prevent XSS.
                </span>
              </div>

              {/* Branding Section */}
              <div className="rounded-2xl border border-white/10 bg-[#070c16]/80 p-6 backdrop-blur-xl space-y-4">
                <div className="flex items-center gap-2 border-b border-white/5 pb-3">
                  <Palette className="h-4 w-4 text-amber-400" />
                  <h3 className="font-display text-sm font-bold uppercase tracking-wider text-white">
                    Branding & Core Identity
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="font-display text-xs font-bold uppercase tracking-wider text-slate-300 block mb-1">
                      Website Name
                    </label>
                    <input
                      type="text"
                      value={websiteSettings.siteName || ''}
                      onChange={(e) =>
                        setWebsiteSettings({ ...websiteSettings, siteName: e.target.value })
                      }
                      className="w-full rounded-xl border border-white/10 bg-black/40 p-2.5 font-body text-xs text-white focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-display text-xs font-bold uppercase tracking-wider text-slate-300 block mb-1">
                      Logo Asset URL
                    </label>
                    <input
                      type="text"
                      value={websiteSettings.logoUrl || ''}
                      onChange={(e) =>
                        setWebsiteSettings({ ...websiteSettings, logoUrl: e.target.value })
                      }
                      className="w-full rounded-xl border border-white/10 bg-black/40 p-2.5 font-mono text-xs text-white focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-display text-xs font-bold uppercase tracking-wider text-slate-300 block mb-1">
                      Favicon Asset URL
                    </label>
                    <input
                      type="text"
                      value={websiteSettings.faviconUrl || ''}
                      onChange={(e) =>
                        setWebsiteSettings({ ...websiteSettings, faviconUrl: e.target.value })
                      }
                      className="w-full rounded-xl border border-white/10 bg-black/40 p-2.5 font-mono text-xs text-white focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Brand Colors */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div>
                    <label className="font-display text-xs font-bold uppercase tracking-wider text-slate-300 block mb-1">
                      Primary Brand Color
                    </label>
                    <input
                      type="text"
                      value={websiteSettings.brandColors?.primary || '#f59e0b'}
                      onChange={(e) =>
                        setWebsiteSettings({
                          ...websiteSettings,
                          brandColors: { ...websiteSettings.brandColors, primary: e.target.value }
                        })
                      }
                      className="w-full rounded-xl border border-white/10 bg-black/40 p-2.5 font-mono text-xs text-white focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-display text-xs font-bold uppercase tracking-wider text-slate-300 block mb-1">
                      Accent Color
                    </label>
                    <input
                      type="text"
                      value={websiteSettings.brandColors?.accent || '#10b981'}
                      onChange={(e) =>
                        setWebsiteSettings({
                          ...websiteSettings,
                          brandColors: { ...websiteSettings.brandColors, accent: e.target.value }
                        })
                      }
                      className="w-full rounded-xl border border-white/10 bg-black/40 p-2.5 font-mono text-xs text-white focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-display text-xs font-bold uppercase tracking-wider text-slate-300 block mb-1">
                      Background Color
                    </label>
                    <input
                      type="text"
                      value={websiteSettings.brandColors?.background || '#06080d'}
                      onChange={(e) =>
                        setWebsiteSettings({
                          ...websiteSettings,
                          brandColors: { ...websiteSettings.brandColors, background: e.target.value }
                        })
                      }
                      className="w-full rounded-xl border border-white/10 bg-black/40 p-2.5 font-mono text-xs text-white focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Support & Social Links */}
              <div className="rounded-2xl border border-white/10 bg-[#070c16]/80 p-6 backdrop-blur-xl space-y-4">
                <div className="flex items-center gap-2 border-b border-white/5 pb-3">
                  <Share2 className="h-4 w-4 text-amber-400" />
                  <h3 className="font-display text-sm font-bold uppercase tracking-wider text-white">
                    Support Channels & Official Socials
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="font-display text-xs font-bold uppercase tracking-wider text-slate-300 block mb-1">
                      Support Email
                    </label>
                    <input
                      type="email"
                      value={websiteSettings.supportContact?.email || ''}
                      onChange={(e) =>
                        setWebsiteSettings({
                          ...websiteSettings,
                          supportContact: { ...websiteSettings.supportContact, email: e.target.value }
                        })
                      }
                      className="w-full rounded-xl border border-white/10 bg-black/40 p-2.5 font-mono text-xs text-white focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-display text-xs font-bold uppercase tracking-wider text-slate-300 block mb-1">
                      Support Telegram
                    </label>
                    <input
                      type="text"
                      value={websiteSettings.supportContact?.telegram || ''}
                      onChange={(e) =>
                        setWebsiteSettings({
                          ...websiteSettings,
                          supportContact: { ...websiteSettings.supportContact, telegram: e.target.value }
                        })
                      }
                      className="w-full rounded-xl border border-white/10 bg-black/40 p-2.5 font-mono text-xs text-white focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-display text-xs font-bold uppercase tracking-wider text-slate-300 block mb-1">
                      Support Discord
                    </label>
                    <input
                      type="text"
                      value={websiteSettings.supportContact?.discord || ''}
                      onChange={(e) =>
                        setWebsiteSettings({
                          ...websiteSettings,
                          supportContact: { ...websiteSettings.supportContact, discord: e.target.value }
                        })
                      }
                      className="w-full rounded-xl border border-white/10 bg-black/40 p-2.5 font-mono text-xs text-white focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Homepage & Footer Text */}
              <div className="rounded-2xl border border-white/10 bg-[#070c16]/80 p-6 backdrop-blur-xl space-y-4">
                <div className="flex items-center gap-2 border-b border-white/5 pb-3">
                  <FileText className="h-4 w-4 text-amber-400" />
                  <h3 className="font-display text-sm font-bold uppercase tracking-wider text-white">
                    Homepage & Footer Content
                  </h3>
                </div>

                <div>
                  <label className="font-display text-xs font-bold uppercase tracking-wider text-slate-300 block mb-1">
                    Hero Headline
                  </label>
                  <input
                    type="text"
                    value={websiteSettings.homepageContent?.heroTitle || ''}
                    onChange={(e) =>
                      setWebsiteSettings({
                        ...websiteSettings,
                        homepageContent: { ...websiteSettings.homepageContent, heroTitle: e.target.value }
                      })
                    }
                    className="w-full rounded-xl border border-white/10 bg-black/40 p-2.5 font-body text-xs text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-display text-xs font-bold uppercase tracking-wider text-slate-300 block mb-1">
                    Hero Subtitle
                  </label>
                  <textarea
                    rows={2}
                    value={websiteSettings.homepageContent?.heroSubtitle || ''}
                    onChange={(e) =>
                      setWebsiteSettings({
                        ...websiteSettings,
                        homepageContent: { ...websiteSettings.homepageContent, heroSubtitle: e.target.value }
                      })
                    }
                    className="w-full rounded-xl border border-white/10 bg-black/40 p-2.5 font-body text-xs text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-display text-xs font-bold uppercase tracking-wider text-slate-300 block mb-1">
                    Footer Legal Disclaimer
                  </label>
                  <textarea
                    rows={2}
                    value={websiteSettings.footerContent?.disclaimerText || ''}
                    onChange={(e) =>
                      setWebsiteSettings({
                        ...websiteSettings,
                        footerContent: { ...websiteSettings.footerContent, disclaimerText: e.target.value }
                      })
                    }
                    className="w-full rounded-xl border border-white/10 bg-black/40 p-2.5 font-body text-xs text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* FAQ Management */}
              <div className="rounded-2xl border border-white/10 bg-[#070c16]/80 p-6 backdrop-blur-xl space-y-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <div className="flex items-center gap-2">
                    <HelpCircle className="h-4 w-4 text-amber-400" />
                    <h3 className="font-display text-sm font-bold uppercase tracking-wider text-white">
                      Frequently Asked Questions ({websiteSettings.faqItems?.length || 0})
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddFaq}
                    className="flex items-center gap-1 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-1 font-display text-xs font-bold uppercase text-amber-400 hover:bg-amber-500/20"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add FAQ
                  </button>
                </div>

                <div className="space-y-3">
                  {(websiteSettings.faqItems || []).map((faq: any, idx: number) => (
                    <div key={idx} className="rounded-xl border border-white/10 bg-black/30 p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-display text-[10px] font-bold uppercase text-amber-400">
                          FAQ Item #{idx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveFaq(idx)}
                          className="text-rose-400 hover:text-rose-300"
                          title="Remove item"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <input
                        type="text"
                        value={faq.question}
                        onChange={(e) => handleUpdateFaq(idx, 'question', e.target.value)}
                        placeholder="Question title"
                        className="w-full rounded-lg border border-white/10 bg-black/40 p-2 font-display text-xs text-white focus:border-amber-500 focus:outline-none"
                      />
                      <textarea
                        rows={2}
                        value={faq.answer}
                        onChange={(e) => handleUpdateFaq(idx, 'answer', e.target.value)}
                        placeholder="Detailed answer text"
                        className="w-full rounded-lg border border-white/10 bg-black/40 p-2 font-body text-xs text-slate-300 focus:border-amber-500 focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Legal Policies */}
              <div className="rounded-2xl border border-white/10 bg-[#070c16]/80 p-6 backdrop-blur-xl space-y-4">
                <div className="flex items-center gap-2 border-b border-white/5 pb-3">
                  <Shield className="h-4 w-4 text-amber-400" />
                  <h3 className="font-display text-sm font-bold uppercase tracking-wider text-white">
                    Legal Policy Documents
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-display text-xs font-bold uppercase tracking-wider text-slate-300 block mb-1">
                      Terms and Conditions Summary
                    </label>
                    <textarea
                      rows={4}
                      value={websiteSettings.legalPolicies?.termsAndConditions || ''}
                      onChange={(e) =>
                        setWebsiteSettings({
                          ...websiteSettings,
                          legalPolicies: {
                            ...websiteSettings.legalPolicies,
                            termsAndConditions: e.target.value
                          }
                        })
                      }
                      className="w-full rounded-xl border border-white/10 bg-black/40 p-2.5 font-body text-xs text-white focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-display text-xs font-bold uppercase tracking-wider text-slate-300 block mb-1">
                      Privacy Policy Summary
                    </label>
                    <textarea
                      rows={4}
                      value={websiteSettings.legalPolicies?.privacyPolicy || ''}
                      onChange={(e) =>
                        setWebsiteSettings({
                          ...websiteSettings,
                          legalPolicies: {
                            ...websiteSettings.legalPolicies,
                            privacyPolicy: e.target.value
                          }
                        })
                      }
                      className="w-full rounded-xl border border-white/10 bg-black/40 p-2.5 font-body text-xs text-white focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-display text-xs font-bold uppercase tracking-wider text-slate-300 block mb-1">
                      Subscription Policy
                    </label>
                    <textarea
                      rows={4}
                      value={websiteSettings.legalPolicies?.subscriptionPolicy || ''}
                      onChange={(e) =>
                        setWebsiteSettings({
                          ...websiteSettings,
                          legalPolicies: {
                            ...websiteSettings.legalPolicies,
                            subscriptionPolicy: e.target.value
                          }
                        })
                      }
                      className="w-full rounded-xl border border-white/10 bg-black/40 p-2.5 font-body text-xs text-white focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-display text-xs font-bold uppercase tracking-wider text-slate-300 block mb-1">
                      Referral Policy
                    </label>
                    <textarea
                      rows={4}
                      value={websiteSettings.legalPolicies?.referralPolicy || ''}
                      onChange={(e) =>
                        setWebsiteSettings({
                          ...websiteSettings,
                          legalPolicies: {
                            ...websiteSettings.legalPolicies,
                            referralPolicy: e.target.value
                          }
                        })
                      }
                      className="w-full rounded-xl border border-white/10 bg-black/40 p-2.5 font-body text-xs text-white focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={savingWebsite}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-3 font-display text-xs font-bold uppercase tracking-wider text-black shadow-lg shadow-amber-500/20 hover:brightness-110 transition-all disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  {savingWebsite ? 'Persisting...' : 'Save Website Settings'}
                </button>
              </div>
            </form>
          )}

          {/* TAB 4: IN-APP BROADCAST ANNOUNCEMENTS */}
          {activeTab === 'announcements' && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-white/10 bg-[#070c16]/80 p-6 backdrop-blur-xl">
                <div className="border-b border-white/5 pb-4 mb-6">
                  <h2 className="font-display text-base font-bold uppercase tracking-wider text-white">
                    Transmit Platform Announcement
                  </h2>
                  <p className="font-body text-xs text-slate-400 mt-0.5">
                    Instantly deliver urgent notifications to the in-app notification inboxes of registered members, moderators, or all platform users.
                  </p>
                </div>

                {broadcastResult && (
                  <div className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-emerald-400 font-display text-xs font-bold uppercase tracking-wider">
                    <CheckCircle2 className="h-5 w-5 shrink-0" />
                    <span>{broadcastResult}</span>
                  </div>
                )}

                <form onSubmit={handleSendBroadcast} className="space-y-5">
                  <div>
                    <label className="font-display text-xs font-bold uppercase tracking-wider text-slate-300 block mb-2">
                      Recipient Audience
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {[
                        { role: 'ALL', label: 'All Registered Accounts' },
                        { role: 'USER', label: 'Subscribers & Normal Users' },
                        { role: 'MODERATOR', label: 'Moderators & Partners' }
                      ].map((item) => (
                        <button
                          key={item.role}
                          type="button"
                          onClick={() => setBroadcastRole(item.role as any)}
                          className={`rounded-xl border p-3 text-left font-display text-xs font-bold uppercase tracking-wider transition-all ${
                            broadcastRole === item.role
                              ? 'border-amber-500/60 bg-amber-500/15 text-amber-300 shadow-sm'
                              : 'border-white/10 bg-black/30 text-slate-400 hover:text-white'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="font-display text-xs font-bold uppercase tracking-wider text-slate-300 block mb-2">
                      Announcement Title
                    </label>
                    <input
                      type="text"
                      value={broadcastTitle}
                      onChange={(e) => setBroadcastTitle(e.target.value)}
                      placeholder="e.g. Scheduled Engine Upgrade at 04:00 UTC"
                      className="w-full rounded-xl border border-white/10 bg-black/40 p-3 font-display text-xs text-white focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-display text-xs font-bold uppercase tracking-wider text-slate-300 block mb-2">
                      Detailed Message Body
                    </label>
                    <textarea
                      rows={4}
                      value={broadcastMessage}
                      onChange={(e) => setBroadcastMessage(e.target.value)}
                      placeholder="Enter the broadcast notification message to be delivered to member inboxes..."
                      className="w-full rounded-xl border border-white/10 bg-black/40 p-3 font-body text-xs text-white focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <p className="font-mono text-[10px] text-slate-500">
                      Notifications appear immediately in recipient top navigation bell menus.
                    </p>
                    <button
                      type="submit"
                      disabled={broadcasting}
                      className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-3 font-display text-xs font-bold uppercase tracking-wider text-black shadow-lg shadow-amber-500/20 hover:brightness-110 transition-all disabled:opacity-50"
                    >
                      <Send className="h-4 w-4" />
                      {broadcasting ? 'Broadcasting...' : 'Broadcast Announcement'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
