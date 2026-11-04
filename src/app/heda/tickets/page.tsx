'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { authClient } from '../../../lib/auth-client';
import { useToast } from '../../../components/admin/ToastContext';
import { AdminLoadingSkeleton } from '../../../components/admin/AdminLoadingSkeleton';
import { AdminEmptyState } from '../../../components/admin/AdminEmptyState';
import { AdminErrorState } from '../../../components/admin/AdminErrorState';
import {
  LifeBuoy,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Send,
  Lock,
  User,
  CreditCard,
  Sliders,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  ShieldCheck,
  RefreshCw,
  X
} from 'lucide-react';

interface Ticket {
  _id: string;
  ticketNumber: string;
  userName: string;
  userEmail: string;
  subject: string;
  description: string;
  category: 'BILLING' | 'TOOL_ACCESS' | 'ACCOUNT' | 'OTHER';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  assignedToAdminEmail?: string;
  assignedToAdminId?: { _id: string; name: string; email: string };
  messages: Array<{
    _id: string;
    senderId: string;
    senderEmail: string;
    senderRole: string;
    message: string;
    isInternalNote: boolean;
    createdAt: string;
  }>;
  relatedPaymentId?: { _id: string; priceAmount: number; currency: string; status: string };
  relatedSubscriptionId?: { _id: string; planId: string; status: string; endDate: string };
  createdAt: string;
  updatedAt: string;
}

export default function AdminTicketsPage() {
  const { showToast } = useToast();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Selected Ticket Drawer / Modal
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await authClient.getAdminTickets({
        page,
        limit: 15,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        priority: priorityFilter !== 'ALL' ? priorityFilter : undefined,
        category: categoryFilter !== 'ALL' ? categoryFilter : undefined,
        search: search.trim() || undefined
      });
      setTickets(res.tickets || []);
      setTotal(res.total || 0);
    } catch (err: any) {
      setError(err?.message || 'Failed to load support tickets.');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, priorityFilter, categoryFilter, search]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const handleOpenTicket = async (ticket: Ticket) => {
    try {
      const full = await authClient.getAdminTicketDetails(ticket._id);
      setSelectedTicket(full);
      setReplyMessage('');
      setIsInternalNote(false);
    } catch (err: any) {
      showToast('error', err?.message || 'Failed to load ticket details.');
    }
  };

  const handleSendReply = async () => {
    if (!selectedTicket || !replyMessage.trim()) return;

    setIsSubmittingReply(true);
    try {
      const updated = await authClient.replyAdminTicket(selectedTicket._id, {
        message: replyMessage.trim(),
        isInternalNote
      });
      setSelectedTicket(updated);
      setReplyMessage('');
      showToast('success', isInternalNote ? 'Internal note added.' : 'Reply sent to customer.');
      fetchTickets();
    } catch (err: any) {
      showToast('error', err?.message || 'Failed to send reply.');
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    if (!selectedTicket) return;
    try {
      const updated = await authClient.updateAdminTicketStatus(selectedTicket._id, {
        status: newStatus,
        reason: `Admin updated status to ${newStatus}`
      });
      setSelectedTicket(updated);
      showToast('success', `Ticket marked as ${newStatus}.`);
      fetchTickets();
    } catch (err: any) {
      showToast('error', err?.message || 'Failed to update ticket status.');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-black uppercase tracking-tight text-white flex items-center gap-2.5">
            <LifeBuoy className="h-6 w-6 text-amber-400" />
            Support Ticket Management
          </h1>
          <p className="font-display text-xs uppercase tracking-wider text-slate-400 mt-1">
            Resolve customer billing disputes, prediction queries, and account inquiries
          </p>
        </div>

        <button
          onClick={fetchTickets}
          className="self-start sm:self-auto flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 font-display text-xs font-semibold uppercase tracking-wider text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 p-4 rounded-2xl border border-white/10 bg-[#070b14]">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search ticket #, subject, email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-white/10 bg-white/5 text-xs text-white placeholder:text-slate-500 focus:border-amber-500/50 focus:outline-none"
          />
        </div>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-xs text-slate-300 focus:border-amber-500/50 focus:outline-none"
        >
          <option value="ALL">All Statuses</option>
          <option value="OPEN">Open</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="RESOLVED">Resolved</option>
          <option value="CLOSED">Closed</option>
        </select>

        {/* Priority Filter */}
        <select
          value={priorityFilter}
          onChange={(e) => {
            setPriorityFilter(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-xs text-slate-300 focus:border-amber-500/50 focus:outline-none"
        >
          <option value="ALL">All Priorities</option>
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
          <option value="URGENT">Urgent</option>
        </select>

        {/* Category Filter */}
        <select
          value={categoryFilter}
          onChange={(e) => {
            setCategoryFilter(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-xs text-slate-300 focus:border-amber-500/50 focus:outline-none"
        >
          <option value="ALL">All Categories</option>
          <option value="BILLING">Billing & NOWPayments</option>
          <option value="TOOL_ACCESS">Roulette Tool Access</option>
          <option value="ACCOUNT">Account & 2FA</option>
          <option value="OTHER">Other Questions</option>
        </select>
      </div>

      {/* Main Table Content */}
      {loading ? (
        <AdminLoadingSkeleton rows={6} message="Querying Support Ticket Database..." />
      ) : error ? (
        <AdminErrorState message={error} onRetry={fetchTickets} />
      ) : tickets.length === 0 ? (
        <AdminEmptyState
          icon={LifeBuoy}
          title="No Support Tickets Found"
          description="There are currently no support requests matching your criteria. Active customer inquiries will appear here."
        />
      ) : (
        <div className="rounded-2xl border border-white/10 bg-[#070b14] overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-white/5 bg-white/[0.02] text-slate-400 font-display uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Ticket</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Created</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                {tickets.map((t) => {
                  const isUrgent = t.priority === 'URGENT';
                  const isHigh = t.priority === 'HIGH';
                  const isOpen = t.status === 'OPEN';
                  const isResolved = t.status === 'RESOLVED';

                  return (
                    <tr key={t._id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-amber-400">
                        {t.ticketNumber}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-white">{t.userName}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{t.userEmail}</div>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-200 max-w-xs truncate">
                        {t.subject}
                      </td>
                      <td className="py-3 px-4">
                        <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-display font-semibold uppercase text-slate-300">
                          {t.category}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-display font-bold uppercase tracking-wider ${
                            isUrgent
                              ? 'border border-rose-500/40 bg-rose-500/10 text-rose-300'
                              : isHigh
                              ? 'border border-amber-500/40 bg-amber-500/10 text-amber-300'
                              : 'border border-slate-500/30 bg-slate-500/10 text-slate-300'
                          }`}
                        >
                          {t.priority}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-display font-bold uppercase tracking-wider ${
                            isOpen
                              ? 'border border-amber-500/40 bg-amber-500/10 text-amber-300'
                              : isResolved
                              ? 'border border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                              : 'border border-sky-500/40 bg-sky-500/10 text-sky-300'
                          }`}
                        >
                          {t.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400 text-[11px] font-mono">
                        {new Date(t.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleOpenTicket(t)}
                          className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1 font-display text-[11px] font-bold uppercase tracking-wider text-amber-300 hover:bg-amber-500/20 transition-colors"
                        >
                          Inspect & Reply
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-white/5 bg-white/[0.01]">
            <p className="text-xs text-slate-400 font-display">
              Total Tickets: <span className="text-white font-bold">{total}</span>
            </p>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-slate-300 hover:bg-white/10 disabled:opacity-40"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                Previous
              </button>
              <span className="text-xs text-slate-400 font-mono px-2">Page {page}</span>
              <button
                disabled={tickets.length < 15}
                onClick={() => setPage(page + 1)}
                className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-slate-300 hover:bg-white/10 disabled:opacity-40"
              >
                Next
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ticket Details & Conversation Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl border border-white/10 bg-[#070b14] shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-white/10 bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm font-black text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-md">
                  {selectedTicket.ticketNumber}
                </span>
                <div>
                  <h3 className="font-display text-base font-bold text-white truncate max-w-md">
                    {selectedTicket.subject}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Opened by {selectedTicket.userName} ({selectedTicket.userEmail})
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedTicket(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body: Ticket Metadata + Conversation Thread */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {/* Context Pill Bar */}
              <div className="flex flex-wrap items-center gap-2 p-3 rounded-xl border border-white/5 bg-white/[0.02] text-xs">
                <div className="flex items-center gap-1.5 text-slate-300">
                  <span className="text-slate-500 uppercase font-display text-[10px]">Category:</span>
                  <span className="font-semibold text-white">{selectedTicket.category}</span>
                </div>
                <div className="h-3 w-px bg-white/10" />
                <div className="flex items-center gap-1.5 text-slate-300">
                  <span className="text-slate-500 uppercase font-display text-[10px]">Priority:</span>
                  <span className="font-semibold text-amber-300">{selectedTicket.priority}</span>
                </div>
                <div className="h-3 w-px bg-white/10" />
                <div className="flex items-center gap-1.5 text-slate-300">
                  <span className="text-slate-500 uppercase font-display text-[10px]">Status:</span>
                  <span className="font-semibold text-emerald-300">{selectedTicket.status}</span>
                </div>

                {/* Status action switches */}
                <div className="ml-auto flex items-center gap-1.5">
                  <button
                    onClick={() => handleUpdateStatus('IN_PROGRESS')}
                    className="px-2 py-0.5 rounded border border-sky-500/30 bg-sky-500/10 text-[10px] font-display uppercase font-bold text-sky-300 hover:bg-sky-500/20"
                  >
                    In Progress
                  </button>
                  <button
                    onClick={() => handleUpdateStatus('RESOLVED')}
                    className="px-2 py-0.5 rounded border border-emerald-500/30 bg-emerald-500/10 text-[10px] font-display uppercase font-bold text-emerald-300 hover:bg-emerald-500/20"
                  >
                    Resolve
                  </button>
                  <button
                    onClick={() => handleUpdateStatus('CLOSED')}
                    className="px-2 py-0.5 rounded border border-slate-500/30 bg-slate-500/10 text-[10px] font-display uppercase font-bold text-slate-300 hover:bg-slate-500/20"
                  >
                    Close
                  </button>
                </div>
              </div>

              {/* Thread Messages */}
              <div className="space-y-3">
                <h4 className="font-display text-xs font-bold uppercase tracking-wider text-slate-400">
                  Conversation Thread & Audit Notes
                </h4>

                {selectedTicket.messages.map((m, idx) => {
                  const isStaff = m.senderRole === 'SUPER_ADMIN';
                  const isInternal = m.isInternalNote;

                  return (
                    <div
                      key={m._id || idx}
                      className={`p-4 rounded-xl border leading-relaxed ${
                        isInternal
                          ? 'border-amber-500/40 bg-amber-500/5 text-amber-200'
                          : isStaff
                          ? 'border-sky-500/30 bg-sky-500/5 text-slate-100 ml-6'
                          : 'border-white/10 bg-white/5 text-slate-200 mr-6'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px] mb-1.5">
                        <span className="font-bold flex items-center gap-1.5">
                          {isInternal ? (
                            <>
                              <Lock className="h-3 w-3 text-amber-400" />
                              <span className="text-amber-300 font-display uppercase">Staff Internal Note</span>
                            </>
                          ) : (
                            <span className={isStaff ? 'text-sky-300' : 'text-slate-300'}>
                              {m.senderEmail} ({m.senderRole})
                            </span>
                          )}
                        </span>
                        <span className="text-slate-500 font-mono">
                          {new Date(m.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs whitespace-pre-wrap">{m.message}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal Footer: Reply Composer */}
            <div className="p-4 border-t border-white/10 bg-[#070b14] space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-display font-semibold uppercase tracking-wider text-slate-300">
                  Compose Message
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-display uppercase tracking-wider text-amber-300">
                  <input
                    type="checkbox"
                    checked={isInternalNote}
                    onChange={(e) => setIsInternalNote(e.target.checked)}
                    className="rounded border-amber-500/40 bg-amber-500/10 text-amber-500 focus:ring-0"
                  />
                  <span>Internal Staff Note Only (Hidden from Customer)</span>
                </label>
              </div>

              <textarea
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                placeholder={isInternalNote ? 'Write internal note for staff review...' : 'Write message to customer...'}
                rows={3}
                className={`w-full p-3 rounded-xl border text-xs text-white placeholder:text-slate-500 focus:outline-none resize-none ${
                  isInternalNote
                    ? 'border-amber-500/40 bg-amber-500/5 focus:border-amber-500'
                    : 'border-white/10 bg-white/5 focus:border-sky-500'
                }`}
              />

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedTicket(null)}
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-display uppercase tracking-wider text-slate-400 hover:bg-white/10"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={handleSendReply}
                  disabled={isSubmittingReply || !replyMessage.trim()}
                  className="flex items-center gap-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 px-4 py-2 text-xs font-display font-bold uppercase tracking-wider text-black shadow-[0_0_15px_rgba(245,158,11,0.3)] disabled:opacity-50"
                >
                  <Send className="h-3.5 w-3.5" />
                  {isSubmittingReply ? 'Posting...' : isInternalNote ? 'Post Internal Note' : 'Send Customer Reply'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
