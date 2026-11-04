import React from 'react';

interface SkeletonProps {
  rows?: number;
  message?: string;
}

export function AdminLoadingSkeleton({ rows = 5, message = 'Loading Telemetry...' }: SkeletonProps) {
  return (
    <div className="space-y-4 animate-pulse py-4">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-4 w-4 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
        <p className="font-display text-xs uppercase tracking-widest text-slate-400">
          {message}
        </p>
      </div>

      <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 space-y-3">
        {Array.from({ length: rows }).map((_, idx) => (
          <div key={idx} className="h-10 rounded-xl bg-white/5 w-full flex items-center px-4 gap-4">
            <div className="h-4 w-1/4 rounded bg-white/10" />
            <div className="h-4 w-1/3 rounded bg-white/5" />
            <div className="h-4 w-1/6 rounded bg-white/10 ml-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}
