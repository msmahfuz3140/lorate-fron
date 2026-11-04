import React from 'react';
import { LucideIcon, Layers } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
}

export function AdminEmptyState({
  icon: Icon = Layers,
  title,
  description,
  actionText,
  onAction
}: EmptyStateProps) {
  return (
    <div className="py-16 px-4 text-center rounded-2xl border border-white/5 bg-white/[0.01]">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-400 mb-3">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="font-display text-base font-bold uppercase tracking-wider text-white mb-1.5">
        {title}
      </h3>
      <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed mb-4">
        {description}
      </p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2 font-display text-xs font-bold uppercase tracking-wider text-amber-300 hover:bg-amber-500/20 transition-colors"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}
