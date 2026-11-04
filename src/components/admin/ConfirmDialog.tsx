'use client';

import React, { useState } from 'react';
import { AlertTriangle, X, Loader2 } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'primary';
  requireReason?: boolean;
  reasonPlaceholder?: string;
  onConfirm: (reason?: string) => Promise<void> | void;
  onClose: () => void;
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = 'Confirm Action',
  cancelText = 'Cancel',
  variant = 'danger',
  requireReason = false,
  reasonPlaceholder = 'Mandatory administrative audit reason...',
  onConfirm,
  onClose
}: ConfirmDialogProps) {
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    if (requireReason && (!reason || reason.trim().length < 3)) {
      setError('Please provide a descriptive reason (minimum 3 characters) for the audit trail.');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      await onConfirm(reason.trim() || undefined);
      setReason('');
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Operation failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const isDanger = variant === 'danger';
  const isWarning = variant === 'warning';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-[#070b14] p-6 shadow-2xl">
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute right-4 top-4 text-slate-400 hover:text-white transition-colors disabled:opacity-50"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-xl border shrink-0 ${
              isDanger
                ? 'border-rose-500/30 bg-rose-500/10 text-rose-400'
                : isWarning
                ? 'border-amber-500/30 bg-amber-500/10 text-amber-400'
                : 'border-sky-500/30 bg-sky-500/10 text-sky-400'
            }`}
          >
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-display text-base font-bold uppercase tracking-wide text-white">
              {title}
            </h3>
            <p className="text-xs text-slate-400">Main Admin Verification</p>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed mb-4">
          {message}
        </p>

        {requireReason && (
          <div className="mb-4">
            <label className="block font-display text-[11px] font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Audit Reason <span className="text-rose-400">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={reasonPlaceholder}
              disabled={isLoading}
              rows={2}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/50 resize-none"
            />
          </div>
        )}

        {error && (
          <div className="mb-4 p-2.5 rounded-lg border border-rose-500/30 bg-rose-500/10 text-xs text-rose-300">
            {error}
          </div>
        )}

        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-white/5">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 font-display text-xs font-semibold uppercase tracking-wider text-slate-300 hover:bg-white/10 transition-colors disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isLoading}
            className={`flex items-center gap-1.5 rounded-xl px-4 py-2 font-display text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 ${
              isDanger
                ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-[0_0_15px_rgba(244,63,94,0.3)]'
                : isWarning
                ? 'bg-amber-600 hover:bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]'
            }`}
          >
            {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
