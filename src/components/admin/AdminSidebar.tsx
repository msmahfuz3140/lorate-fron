'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Sliders,
  CreditCard,
  Share2,
  Settings,
  History,
  FileCheck2,
  BarChart3,
  ShieldAlert,
  Sparkles,
  LifeBuoy,
  ShieldCheck,
  Bell,
  Terminal,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
  UserCheck,
  UserX,
  Lock,
  Crown,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Layers,
  FileSpreadsheet
} from 'lucide-react';

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

interface SubMenuItem {
  name: string;
  href: string;
  badge?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface NavItem {
  name: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  subItems?: SubMenuItem[];
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: 'Overview',
    items: [
      { name: 'Dashboard', href: '/heda', icon: LayoutDashboard },
      { name: 'AI Assistant', href: '/heda/ai-assistant', icon: Sparkles, badge: 'PRO' }
    ]
  },
  {
    title: 'User Control',
    items: [
      {
        name: 'User Management',
        icon: Users,
        subItems: [
          { name: 'All Users', href: '/heda/users' },
          { name: 'All Admins', href: '/heda/users?role=SUPER_ADMIN', badge: 'ROOT' },
          { name: 'All Moderators', href: '/heda/users?role=MODERATOR', badge: 'MOD' },
          { name: 'Premium Subscribers', href: '/heda/users?sub=ACTIVE', badge: 'VIP' },
          { name: 'Blocked Accounts', href: '/heda/users?status=BLOCKED' },
          { name: 'Suspended Accounts', href: '/heda/users?status=SUSPENDED' }
        ]
      }
    ]
  },
  {
    title: 'Financial & Subs',
    items: [
      {
        name: 'Subscriptions',
        icon: Sliders,
        subItems: [
          { name: 'All Subscriptions', href: '/heda/subscriptions' },
          { name: 'Active Passes', href: '/heda/subscriptions?status=ACTIVE' },
          { name: 'Expired Passes', href: '/heda/subscriptions?status=EXPIRED' },
          { name: 'Manage Plan Catalog', href: '/heda/subscriptions?tab=PLANS' }
        ]
      },
      {
        name: 'Payment Orders',
        icon: CreditCard,
        subItems: [
          { name: 'All Payment Orders', href: '/heda/payments' },
          { name: 'Confirmed / Finished', href: '/heda/payments?status=FINISHED' },
          { name: 'Pending Confirmation', href: '/heda/payments?status=WAITING' },
          { name: 'Failed & Expired', href: '/heda/payments?status=FAILED' }
        ]
      },
      {
        name: 'Referrals & Mods',
        icon: Share2,
        subItems: [
          { name: 'Affiliate Overview', href: '/heda/referrals?tab=overview' },
          { name: 'Active Moderators', href: '/heda/referrals?tab=moderators' },
          { name: 'Commission Ledger', href: '/heda/referrals?tab=commissions' },
          { name: 'Fraud Telemetry', href: '/heda/referrals?tab=fraud' }
        ]
      }
    ]
  },
  {
    title: 'Engine & Platform',
    items: [
      {
        name: 'Roulette Tool',
        icon: Terminal,
        subItems: [
          { name: 'Live Tool Operations', href: '/heda/tool' },
          { name: 'Website CMS Settings', href: '/heda/settings' },
          { name: 'Announcement Campaigns', href: '/heda/notifications' }
        ]
      }
    ]
  },
  {
    title: 'Governance & Security',
    items: [
      {
        name: 'Security Center',
        icon: ShieldCheck,
        subItems: [
          { name: 'SOC Overview & Alerts', href: '/heda/security' },
          { name: 'Audit Logs', href: '/heda/audit-logs' },
          { name: 'Dual-Approval Gate', href: '/heda/dual-approvals' }
        ]
      }
    ]
  },
  {
    title: 'Support & Reports',
    items: [
      {
        name: 'Support & Reports',
        icon: LifeBuoy,
        subItems: [
          { name: 'Support Tickets', href: '/heda/tickets' },
          { name: 'Financial Reports & CSV', href: '/heda/reports' }
        ]
      }
    ]
  }
];

export function AdminSidebar({
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile
}: SidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Full URL representation including query params for exact sub-item matching
  const currentFullUrl = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;

  // Keep track of which accordion menus are open
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    'User Management': true,
    Subscriptions: false,
    'Payment Orders': false,
    'Referrals & Mods': false,
    'Roulette Tool': false,
    'Security Center': false,
    'Support & Reports': false
  });

  // Automatically open accordion corresponding to current active path
  useEffect(() => {
    NAV_SECTIONS.forEach((section) => {
      section.items.forEach((item) => {
        if (item.subItems) {
          const hasActiveSub = item.subItems.some((sub) => {
            const [subPath] = sub.href.split('?');
            return pathname === subPath;
          });
          if (hasActiveSub) {
            setOpenMenus((prev) => ({ ...prev, [item.name]: true }));
          }
        }
      });
    });
  }, [pathname]);

  const toggleMenu = (name: string) => {
    setOpenMenus((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden animate-fade-in"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`dashboard-sidebar fixed top-0 bottom-0 left-0 z-50 flex flex-col border-r border-amber-500/20 bg-[#070b14] transition-all duration-300 lg:static ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${isCollapsed ? 'w-20' : 'w-72'}`}
      >
        {/* Brand Header */}
        <div className="flex h-16 shrink-0 items-center justify-between px-4 border-b border-white/5">
          <Link href="/heda" className="flex items-center gap-2.5 overflow-hidden">
            <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full p-0.5 bg-gradient-to-br from-amber-400 via-amber-600 to-amber-950 shadow-[0_0_15px_rgba(245,158,11,0.3)]">
              <img
                src="/logo.png"
                alt="Roulette.tools Official Logo"
                className="h-full w-full rounded-full object-cover"
              />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col truncate">
                <span className="text-sm font-bold tracking-tight text-white">
                  ROULETTE<span className="text-amber-400">.TOOLS</span>
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                  ADMIN CONSOLE
                </span>
              </div>
            )}
          </Link>

          {/* Close on mobile */}
          <button
            onClick={onCloseMobile}
            className="lg:hidden text-slate-400 hover:text-white"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5 scrollbar-thin scrollbar-thumb-white/10">
          {NAV_SECTIONS.map((section) => (
            <div key={section.title} className="space-y-1">
              {!isCollapsed && (
                <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  {section.title}
                </p>
              )}

              {section.items.map((item) => {
                const Icon = item.icon;

                // Case 1: Standalone Direct Link (no sub-items)
                if (!item.subItems) {
                  const isActive = pathname === item.href;

                  return (
                    <Link
                      key={item.name}
                      href={item.href!}
                      onClick={onCloseMobile}
                      title={isCollapsed ? item.name : undefined}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                        isActive
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.15)] font-bold'
                          : 'text-slate-400 hover:text-white hover:bg-white/5'
                      } ${isCollapsed ? 'justify-center' : ''}`}
                    >
                      <Icon
                        className={`h-4 w-4 shrink-0 transition-colors ${
                          isActive ? 'text-amber-400' : 'text-slate-400 group-hover:text-amber-400'
                        }`}
                      />
                      {!isCollapsed && <span className="truncate flex-1">{item.name}</span>}
                      {!isCollapsed && item.badge && (
                        <span className="rounded-md border border-amber-500/30 bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-bold text-amber-300 font-mono">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                }

                // Case 2: Nested Submenu Accordion Dropdown
                const isMenuOpen = !!openMenus[item.name];
                const hasActiveChild = item.subItems.some((sub) => {
                  const [subPath] = sub.href.split('?');
                  return pathname === subPath;
                });

                return (
                  <div key={item.name} className="space-y-1">
                    {/* Parent Accordion Trigger */}
                    <button
                      type="button"
                      onClick={() => toggleMenu(item.name)}
                      title={isCollapsed ? item.name : undefined}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all text-left ${
                        hasActiveChild
                          ? 'text-white bg-white/[0.04]'
                          : 'text-slate-400 hover:text-white hover:bg-white/5'
                      } ${isCollapsed ? 'justify-center' : ''}`}
                    >
                      <Icon
                        className={`h-4 w-4 shrink-0 transition-colors ${
                          hasActiveChild ? 'text-amber-400' : 'text-slate-400 group-hover:text-amber-400'
                        }`}
                      />
                      {!isCollapsed && (
                        <>
                          <span className="truncate flex-1">{item.name}</span>
                          <ChevronDown
                            className={`h-3.5 w-3.5 shrink-0 text-slate-400 transition-transform duration-200 ${
                              isMenuOpen ? 'rotate-180 text-amber-400' : ''
                            }`}
                          />
                        </>
                      )}
                    </button>

                    {/* Submenu Children Dropdown */}
                    {!isCollapsed && isMenuOpen && (
                      <div className="pl-6 pr-1 py-1 space-y-0.5 border-l border-amber-500/20 ml-4 animate-slide-up">
                        {item.subItems.map((sub) => {
                          const [subPath, subQuery] = sub.href.split('?');
                          const isPathMatch = pathname === subPath;
                          let isExactMatch = false;

                          if (isPathMatch) {
                            if (subQuery) {
                              const subParams = new URLSearchParams(subQuery);
                              isExactMatch = Array.from(subParams.entries()).every(
                                ([key, val]) => searchParams.get(key) === val
                              );
                            } else {
                              const anySiblingMatched = item.subItems?.some((sibling) => {
                                const [, sibQuery] = sibling.href.split('?');
                                if (!sibQuery) return false;
                                const sibParams = new URLSearchParams(sibQuery);
                                return Array.from(sibParams.entries()).every(
                                  ([key, val]) => searchParams.get(key) === val
                                );
                              });
                              isExactMatch = !anySiblingMatched;
                            }
                          }

                          return (
                            <Link
                              key={sub.name}
                              href={sub.href}
                              onClick={onCloseMobile}
                              className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                                isExactMatch
                                  ? 'text-amber-300 font-bold bg-amber-500/10 border border-amber-500/20'
                                  : isPathMatch
                                  ? 'text-slate-200 hover:text-amber-300 hover:bg-white/5 font-semibold'
                                  : 'text-slate-400 hover:text-white hover:bg-white/5'
                              }`}
                            >
                              <div className="flex items-center gap-2 truncate">
                                <span
                                  className={`h-1.5 w-1.5 rounded-full ${
                                    isExactMatch ? 'bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)]' : 'bg-slate-600'
                                  }`}
                                />
                                <span className="truncate">{sub.name}</span>
                              </div>
                              {sub.badge && (
                                <span className="rounded px-1.5 py-0.2 text-[9px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                  {sub.badge}
                                </span>
                              )}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Collapse Toggle Footer (Desktop only) */}
        <div className="hidden lg:flex shrink-0 items-center justify-between p-3 border-t border-white/5">
          <button
            onClick={onToggleCollapse}
            className="flex items-center justify-center w-full py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/5 transition-colors gap-2"
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4 text-amber-400" />
            ) : (
              <>
                <ChevronLeft className="h-4 w-4 text-amber-400" />
                <span>Collapse Sidebar</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
