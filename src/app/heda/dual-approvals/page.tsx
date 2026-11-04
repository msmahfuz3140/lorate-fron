'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { authClient } from '../../../lib/auth-client';
import { useAuth } from '../../../context/AuthContext';
import {
  FileCheck2,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  PlusCircle,
  X,
  AlertTriangle,
  Lock,
  UserCheck
} from 'lucide-react';

interface DualApprovalRequest {
  _id: string;
  action: string;
  requestedByAdminId: string;
  requestedByAdminEmail: string;
  targetUserId?: string;
  targetUserEmail?: string;
  payload: Record<string, any>;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED';
  confirmedByAdminId?: string;
  confirmedByAdminEmail?: string;
  confirmedAt?: string;
  rejectionReason?: string;
  rejectedByAdminEmail?: string;
  rejectedAt?: string;
  expiresAt: string;
  createdAt: string;
}

export default function AdminDualApprovalsPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<DualApprovalRequest[]>([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createAction, setCreateAction] = useState('ROLE_PROMOTION_SUPER_ADMIN');
  const [targetEmail, setTargetEmail] = useState('');
  const [reasonInput, setReasonInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reject modal
  const [rejectingRequest, setRejectingRequest] = useState<DualApprovalRequest | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const fetchRequests = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await authClient.getAdminDualApprovals(
        statusFilter !== 'ALL' ? statusFilter : undefined
      );
      if (res) {
        setRequests(res);
      }
    } catch (err: any) {
      console.error('Failed to load dual approval requests:', err);
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reasonInput.trim()) {
      setActionError('A verifiable operational reason is required.');
      return;
    }
    setIsSubmitting(true);
    setActionError('');
    try {
      await authClient.requestAdminDualApproval({
        action: createAction,
        targetUserEmail: targetEmail.trim() || undefined,
        reason: reasonInput.trim(),
        payload: { targetUserEmail: targetEmail.trim() }
      });
      setActionSuccess('High-risk operation queued. Awaiting confirmation by a second Main Admin.');
      setIsCreateOpen(false);
      setTargetEmail('');
      setReasonInput('');
      fetchRequests();
    } catch (err: any) {
      setActionError(err.message || 'Failed to initiate dual approval request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApprove = async (r: DualApprovalRequest) => {
    if (!confirm(`Are you sure you want to approve this high-risk action: ${r.action}?`)) {
      return;
    }
    setIsSubmitting(true);
    setActionError('');
    try {
      await authClient.approveAdminDualApproval(r._id);
      setActionSuccess(`Dual approval request confirmed and executed by ${user?.email}.`);
      fetchRequests();
    } catch (err: any) {
      setActionError(err.message || 'Approval rejected by governance policy');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingRequest) return;
    if (!rejectReason.trim()) {
      setActionError('Rejection justification is required.');
      return;
    }
    setIsSubmitting(true);
    try {
      await authClient.rejectAdminDualApproval(rejectingRequest._id, rejectReason.trim());
      setActionSuccess('Dual approval request officially rejected.');
      setRejectingRequest(null);
      setRejectReason('');
      fetchRequests();
    } catch (err: any) {
      setActionError(err.message || 'Failed to reject request');
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
            Dual Approval Governance (Four-Eyes Principle)
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Enforces mutual administrative consensus for high-risk financial, role promotion, and ownership mutations.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-2 rounded-xl border border-amber-500/50 bg-amber-500 px-4 py-2 text-xs font-bold uppercase tracking-wider text-black hover:bg-amber-400 transition-colors shadow-[0_0_15px_rgba(245,158,11,0.2)]"
          >
            <PlusCircle className="h-4 w-4" />
            Initiate High-Risk Request
          </button>
          <button
            onClick={() => fetchRequests()}
            disabled={isLoading}
            className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-semibold uppercase tracking-wider text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Governance Notice */}
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-xs text-amber-300 flex items-start gap-3">
        <Lock className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
        <div>
          <span className="font-bold uppercase tracking-wider">Four-Eyes Security Mandate:</span> Under platform policy, an initiating Main Admin cannot approve their own high-risk proposal. Every approval must be independently verified and confirmed by a distinct designated owner.
        </div>
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

      {/* Filter Bar */}
      <div className="rounded-2xl border border-slate-800 bg-[#070b14] p-4 shadow-xl">
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold uppercase text-slate-400">Filter By Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-800 bg-slate-900/60 px-3.5 py-2 text-xs text-slate-300 focus:border-amber-500 focus:outline-none"
          >
            <option value="ALL">All Governance Requests</option>
            <option value="PENDING">Pending Review (Action Required)</option>
            <option value="APPROVED">Approved & Executed</option>
            <option value="REJECTED">Rejected Requests</option>
          </select>
        </div>
      </div>

      {/* Requests Grid */}
      <div className="grid grid-cols-1 gap-4">
        {isLoading ? (
          <div className="rounded-2xl border border-slate-800 bg-[#070b14] p-12 text-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-amber-500 border-t-transparent mx-auto" />
            <p className="mt-2 text-xs uppercase text-slate-400">Loading governance proposals...</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="rounded-2xl border border-slate-800 bg-[#070b14] p-12 text-center text-slate-500">
            No dual approval requests found matching the current filter.
          </div>
        ) : (
          requests.map((r) => {
            const isPending = r.status === 'PENDING';
            const isApproved = r.status === 'APPROVED';
            const isRejected = r.status === 'REJECTED';
            const isSelfRequest = user?.id === r.requestedByAdminId;

            return (
              <div
                key={r._id}
                className={`rounded-2xl border p-5 shadow-xl transition-colors ${
                  isPending
                    ? 'border-amber-500/30 bg-[#070b14]'
                    : isApproved
                    ? 'border-emerald-500/20 bg-[#070b14]/80'
                    : 'border-slate-800 bg-[#070b14]/50'
                }`}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-display text-sm font-bold uppercase tracking-wider text-white">
                        {r.action.replace(/_/g, ' ')}
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                          isPending
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : isApproved
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        }`}
                      >
                        {r.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400">
                      Initiated by:{' '}
                      <span className="font-semibold text-slate-200">{r.requestedByAdminEmail}</span> on{' '}
                      {new Date(r.createdAt).toLocaleString()}
                    </p>

                    {r.targetUserEmail && (
                      <p className="text-xs text-slate-400">
                        Target Account:{' '}
                        <span className="font-semibold text-amber-300">{r.targetUserEmail}</span>
                      </p>
                    )}

                    <div className="mt-2 rounded-xl border border-slate-800 bg-slate-900/50 p-3 text-xs text-slate-300">
                      <p className="text-[10px] uppercase font-bold text-slate-500 mb-0.5">
                        Operational Justification:
                      </p>
                      {r.reason}
                    </div>

                    {isApproved && (
                      <div className="mt-2 text-xs text-emerald-400 flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Confirmed & executed by {r.confirmedByAdminEmail} on{' '}
                        {new Date(r.confirmedAt!).toLocaleString()}
                      </div>
                    )}

                    {isRejected && (
                      <div className="mt-2 text-xs text-rose-400">
                        Rejected by {r.rejectedByAdminEmail}: {r.rejectionReason}
                      </div>
                    )}
                  </div>

                  {/* Actions for PENDING requests */}
                  {isPending && (
                    <div className="flex flex-col sm:items-end gap-2 shrink-0">
                      {isSelfRequest ? (
                        <div className="rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-[11px] text-amber-400 font-semibold text-center">
                          Awaiting 2nd Admin confirmation
                          <div className="text-[9px] text-slate-400">Self-approval strictly prohibited</div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setRejectingRequest(r);
                              setRejectReason('');
                            }}
                            disabled={isSubmitting}
                            className="rounded-xl border border-rose-600/40 bg-rose-600/10 px-3.5 py-1.5 text-xs font-bold uppercase text-rose-300 hover:bg-rose-600/20"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => handleApprove(r)}
                            disabled={isSubmitting}
                            className="rounded-xl border border-emerald-500/50 bg-emerald-500 px-3.5 py-1.5 text-xs font-bold uppercase text-black hover:bg-emerald-400"
                          >
                            Confirm & Execute
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* INITIATE REQUEST MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <form
            onSubmit={handleCreateRequest}
            className="w-full max-w-md rounded-2xl border border-slate-800 bg-[#070b14] p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-display text-base font-bold uppercase tracking-wider text-white">
                Initiate High-Risk Operation
              </h3>
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                Operation Type *
              </label>
              <select
                value={createAction}
                onChange={(e) => setCreateAction(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-900/80 px-3.5 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
              >
                <option value="ROLE_PROMOTION_SUPER_ADMIN">Promote Account to Main Admin (SUPER_ADMIN)</option>
                <option value="GLOBAL_COMMISSION_OVERRIDE">Global Commission Rate Override</option>
                <option value="FINANCIAL_REFUND_MANUAL">Authorize Manual Financial Refund</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                Target User Email (If applicable)
              </label>
              <input
                type="email"
                value={targetEmail}
                onChange={(e) => setTargetEmail(e.target.value)}
                placeholder="user@example.com"
                className="w-full rounded-xl border border-slate-800 bg-slate-900/80 px-3.5 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-amber-400 mb-1">
                Reason for High-Risk Mutation *
              </label>
              <textarea
                value={reasonInput}
                onChange={(e) => setReasonInput(e.target.value)}
                required
                rows={3}
                placeholder="Provide comprehensive justification for the four-eyes review board..."
                className="w-full rounded-xl border border-slate-800 bg-slate-900/80 px-3.5 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold uppercase text-black hover:bg-amber-400 disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Proposal'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* REJECT MODAL */}
      {rejectingRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <form
            onSubmit={handleReject}
            className="w-full max-w-md rounded-2xl border border-rose-900/50 bg-[#070b14] p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-rose-900/30 pb-3">
              <h3 className="font-display text-base font-bold uppercase tracking-wider text-rose-400">
                Reject High-Risk Proposal
              </h3>
              <button
                type="button"
                onClick={() => setRejectingRequest(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-rose-400 mb-1">
                Rejection Justification *
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                required
                rows={3}
                placeholder="Reason why this high-risk proposal cannot be confirmed..."
                className="w-full rounded-xl border border-slate-800 bg-slate-900/80 px-3.5 py-2 text-sm text-white focus:border-rose-500 focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setRejectingRequest(null)}
                className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold uppercase text-white hover:bg-rose-500 disabled:opacity-50"
              >
                {isSubmitting ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
