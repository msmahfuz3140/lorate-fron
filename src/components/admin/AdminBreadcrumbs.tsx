'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Shield } from 'lucide-react';

const ROUTE_LABELS: Record<string, string> = {
  admin: 'Dashboard',
  heda: 'Dashboard',
  users: 'User Management',
  subscriptions: 'Subscriptions & Plans',
  payments: 'Payment Orders',
  referrals: 'Moderators & Commissions',
  reports: 'Financial Reports',
  settings: 'Website Settings',
  tool: 'Roulette Tool Operations',
  'audit-logs': 'Security Audit Logs',
  'dual-approvals': 'Dual-Approval Gate',
  tickets: 'Support Tickets',
  security: 'Security Center',
  'ai-assistant': 'AI Admin Assistant',
  notifications: 'Announcement Campaigns'
};

export function AdminBreadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);

  if (segments.length <= 1) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-slate-400">
        <Shield className="h-3 w-3 text-amber-400" />
        <span className="text-white font-bold">Admin Console</span>
        <ChevronRight className="h-3 w-3 text-slate-600" />
        <span className="text-amber-400 font-semibold">Overview</span>
      </div>
    );
  }

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs">
      <Link
        href="/heda"
        className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
      >
        <Shield className="h-3 w-3 text-amber-400" />
        <span>Admin</span>
      </Link>

      {segments.slice(1).map((seg, idx) => {
        const path = `/${segments.slice(0, idx + 2).join('/')}`;
        const isLast = idx === segments.length - 2;
        const label = ROUTE_LABELS[seg] || seg.replace(/-/g, ' ');

        return (
          <React.Fragment key={path}>
            <ChevronRight className="h-3 w-3 text-slate-600 shrink-0" />
            {isLast ? (
              <span className="text-amber-400 font-semibold truncate max-w-[200px]">
                {label}
              </span>
            ) : (
              <Link
                href={path}
                className="text-slate-400 hover:text-white transition-colors truncate max-w-[150px]"
              >
                {label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
