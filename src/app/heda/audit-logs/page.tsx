'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { authClient } from '../../../lib/auth-client';
import {
  History,
  Search,
  Filter,
  ShieldCheck,
  RefreshCw,
  Eye,
  X,
  Lock,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';

interface AuditLogEntry {
  _id: string;
  action: string;
  adminId: {
    _id: string;
    name: string;
    email: string;
  };
  adminEmail: string;
  targetUserId?: {
    _id: string;
    name: string;
    email: string;
  };
  targetUserEmail?: string;
  targetResourceId?: string;
  resourceType?: string;
  reason: string;
  previousValue?: any;
  newValue?: any;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actionFilter, setActionFilter] = useState('');
  const [adminEmailFilter, setAdminEmailFilter] = useState('');
  const [targetEmailFilter, setTargetEmailFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);

  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await authClient.getAdminAuditLogs({
        page,
        limit: 25,
        action: actionFilter || undefined,
        adminEmail: adminEmailFilter.trim() || undefined,
        targetUserEmail: targetEmailFilter.trim() || undefined
      });
      if (res && res.logs) {
        setLogs(res.logs);
        setTotal(res.total || 0);
        setTotalPages(res.totalPages || 1);
      }
    } catch (err: any) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setIsLoading(false);
    }
  }, [page, actionFilter, adminEmailFilter, targetEmailFilter]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-black uppercase tracking-wider text-white">
            Immutable Audit Trail
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Cryptographically sealed platform governance log. Records cannot be updated, erased, or manipulated.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-300">
            <Lock className="h-3.5 w-3.5 text-emerald-400" />
            Append-Only Immutability Guard Active
          </div>
          <button
            onClick={() => fetchLogs()}
            disabled={isLoading}
            className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="rounded-2xl border border-slate-800 bg-[#070b14] p-4 shadow-xl">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div>
            <select
              value={actionFilter}
              onChange={(e) => {
                setActionFilter(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-xl border border-slate-800 bg-slate-900/60 px-3.5 py-2.5 text-sm text-slate-300 focus:border-amber-500 focus:outline-none"
            >
              <option value="">All Governance Actions</option>
              <option value="USER_BLOCK">User Blocks</option>
              <option value="USER_UNBLOCK">User Unblocks</option>
              <option value="USER_SUSPEND">User Suspensions</option>
              <option value="USER_PROFILE_EDIT">Profile Modifications</option>
              <option value="USER_SOFT_DELETE">User Soft Deletions</option>
              <option value="SUBSCRIPTION_MANUAL_GRANT">Subscription Manual Grants</option>
              <option value="SUBSCRIPTION_EXTEND">Subscription Extensions</option>
              <option value="SUBSCRIPTION_REVOKE">Subscription Revocations</option>
              <option value="PLAN_PRICE_UPDATE">Plan Pricing Updates</option>
              <option value="MODERATOR_ROLE_CHANGE">Moderator Role Changes</option>
              <option value="COMMISSION_CONFIG_UPDATE">Commission Rate Changes</option>
              <option value="DUAL_APPROVAL_REQUEST">Dual Approval Requests</option>
              <option value="DUAL_APPROVAL_CONFIRM">Dual Approval Confirmations</option>
            </select>
          </div>

          <div>
            <input
              type="text"
              value={adminEmailFilter}
              onChange={(e) => {
                setAdminEmailFilter(e.target.value);
                setPage(1);
              }}
              placeholder="Filter by acting admin email..."
              className="w-full rounded-xl border border-slate-800 bg-slate-900/60 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <input
              type="text"
              value={targetEmailFilter}
              onChange={(e) => {
                setTargetEmailFilter(e.target.value);
                setPage(1);
              }}
              placeholder="Filter by target user email..."
              className="w-full rounded-xl border border-slate-800 bg-slate-900/60 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Audit Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-[#070b14] shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="border-b border-slate-800 bg-slate-900/40 font-display text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-4 py-3.5">Timestamp</th>
                <th className="px-4 py-3.5">Action Type</th>
                <th className="px-4 py-3.5">Acting Admin</th>
                <th className="px-4 py-3.5">Target Account / Resource</th>
                <th className="px-4 py-3.5">Mandatory Reason</th>
                <th className="px-4 py-3.5 text-right">Inspection</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
                      <p className="font-display text-xs uppercase tracking-wider text-slate-400">
                        Validating and reading immutable audit chain...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    No administrative audit events recorded for the selected filter parameters.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-4 font-mono text-xs text-slate-400">
                      <div>{new Date(log.createdAt).toLocaleDateString()}</div>
                      <div className="text-[10px] text-slate-500">{new Date(log.createdAt).toLocaleTimeString()}</div>
                    </td>

                    <td className="px-4 py-4">
                      <span className="font-display text-xs font-bold uppercase tracking-wider text-amber-400">
                        {log.action.replace(/_/g, ' ')}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <div className="font-semibold text-white text-xs">{log.adminEmail}</div>
                      <div className="text-[10px] font-mono text-slate-500">
                        ID: {log.adminId?._id ? log.adminId._id.substring(0, 8) : '—'}...
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      {log.targetUserEmail ? (
                        <div>
                          <div className="text-xs text-slate-200">{log.targetUserEmail}</div>
                          {log.targetUserId && (
                            <div className="text-[10px] font-mono text-slate-500">
                              UID: {typeof log.targetUserId === 'object' ? log.targetUserId._id : log.targetUserId}
                            </div>
                          )}
                        </div>
                      ) : log.targetResourceId ? (
                        <div className="text-xs font-mono text-slate-300">
                          {log.resourceType}: {log.targetResourceId}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-500">System Platform</span>
                      )}
                    </td>

                    <td className="px-4 py-4 text-xs text-slate-300 max-w-[280px] truncate" title={log.reason}>
                      {log.reason}
                    </td>

                    <td className="px-4 py-4 text-right">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
                        title="Inspect Entry Delta"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-slate-800 bg-slate-900/40 px-4 py-3 sm:px-6">
          <div className="text-xs text-slate-400">
            Showing <span className="font-semibold text-white">{logs.length}</span> of{' '}
            <span className="font-semibold text-white">{total}</span> audit entries
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

      {/* INSPECTION MODAL */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-800 bg-[#070b14] p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-amber-400" />
                <h3 className="font-display text-base font-bold uppercase tracking-wider text-white">
                  Audit Entry Delta Inspection
                </h3>
              </div>
              <button onClick={() => setSelectedLog(null)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <p className="text-slate-500 uppercase font-bold">Action</p>
                <p className="font-semibold text-amber-400 mt-0.5">{selectedLog.action}</p>
              </div>
              <div>
                <p className="text-slate-500 uppercase font-bold">Timestamp</p>
                <p className="font-mono text-slate-300 mt-0.5">
                  {new Date(selectedLog.createdAt).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-slate-500 uppercase font-bold">Acting Admin</p>
                <p className="text-white mt-0.5">{selectedLog.adminEmail}</p>
              </div>
              <div>
                <p className="text-slate-500 uppercase font-bold">Target Identity</p>
                <p className="text-white mt-0.5">
                  {selectedLog.targetUserEmail || selectedLog.targetResourceId || 'System'}
                </p>
              </div>
            </div>

            <div>
              <p className="text-xs uppercase font-bold text-slate-500">Stated Operational Reason</p>
              <div className="mt-1 rounded-xl border border-slate-800 bg-slate-900/60 p-3 text-xs text-slate-200">
                {selectedLog.reason}
              </div>
            </div>

            {/* Delta comparison */}
            {(selectedLog.previousValue || selectedLog.newValue) && (
              <div className="space-y-3 pt-2">
                <p className="text-xs uppercase font-bold text-slate-500">Value Delta (Before & After)</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-3">
                    <p className="text-[10px] uppercase font-bold text-rose-400">Previous State</p>
                    <pre className="mt-2 text-[11px] font-mono text-slate-300 overflow-x-auto whitespace-pre-wrap">
                      {JSON.stringify(selectedLog.previousValue, null, 2) || 'None / Not Applicable'}
                    </pre>
                  </div>
                  <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-3">
                    <p className="text-[10px] uppercase font-bold text-emerald-400">New State</p>
                    <pre className="mt-2 text-[11px] font-mono text-slate-300 overflow-x-auto whitespace-pre-wrap">
                      {JSON.stringify(selectedLog.newValue, null, 2) || 'None / Not Applicable'}
                    </pre>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-3 border-t border-slate-800">
              <button
                onClick={() => setSelectedLog(null)}
                className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700"
              >
                Close Inspection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
