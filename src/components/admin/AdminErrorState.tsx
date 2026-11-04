import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function AdminErrorState({
  title = 'Data Synchronization Error',
  message = 'An unexpected error occurred while querying administrative telemetry.',
  onRetry
}: ErrorStateProps) {
  return (
    <div className="py-16 px-4 text-center rounded-2xl border border-rose-500/20 bg-rose-500/[0.02]">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-rose-500/30 bg-rose-500/10 text-rose-400 mb-3">
        <AlertTriangle className="h-6 w-6" />
      </div>
      <h3 className="font-display text-base font-bold uppercase tracking-wider text-white mb-1.5">
        {title}
      </h3>
      <p className="text-xs text-rose-300 max-w-md mx-auto leading-relaxed mb-4">
        {message}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-4 py-2 font-display text-xs font-bold uppercase tracking-wider text-slate-200 hover:bg-white/10 transition-colors"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Retry Request
        </button>
      )}
    </div>
  );
}
