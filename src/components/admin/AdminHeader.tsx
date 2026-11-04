'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { AdminBreadcrumbs } from './AdminBreadcrumbs';
import { NotificationBell } from '../NotificationBell';
import {
  Menu,
  ArrowLeft,
  LogOut,
  Settings,
  Shield,
  User,
  ChevronDown,
  Sparkles,
  ExternalLink
} from 'lucide-react';

interface HeaderProps {
  onOpenMobile: () => void;
}

export function AdminHeader({ onOpenMobile }: HeaderProps) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push('/golin');
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-amber-500/20 bg-[#070b14]/90 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
      {/* Left: Hamburger (mobile) + Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobile}
          className="lg:hidden flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300 hover:text-white"
          aria-label="Open sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>

        <AdminBreadcrumbs />
      </div>

      {/* Right: Telemetry pill + Notification Bell + Profile Menu */}
      <div className="flex items-center gap-3">
        {/* Live Security Status Pill */}
        <div className="hidden md:flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1">
          <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">
            SYSTEM SECURED
          </span>
        </div>

        {/* In-App Notifications */}
        <NotificationBell />

        {/* Member Portal Link */}
        <Link
          href="/dashboard"
          className="hidden sm:flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-slate-300 hover:bg-white/10 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5 text-amber-400" />
          <span>Member Portal</span>
        </Link>

        {/* Admin Account Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 p-1.5 pr-2.5 hover:bg-white/10 transition-all text-left"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-amber-500/40 bg-amber-500/20 text-amber-300 text-xs font-bold">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
            </div>
            <div className="hidden md:flex flex-col">
              <span className="text-xs font-bold text-white leading-tight">
                {user?.name || 'Main Admin'}
              </span>
              <span className="font-mono text-[9px] text-amber-400/80 leading-tight">
                SUPER_ADMIN
              </span>
            </div>
            <ChevronDown className="h-3 w-3 text-slate-400" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-white/10 bg-[#070b14] p-2 shadow-2xl backdrop-blur-2xl animate-fade-in z-50">
              <div className="px-3 py-2.5 border-b border-white/5">
                <p className="text-xs font-bold text-white">{user?.name}</p>
                <p className="font-mono text-[10px] text-slate-400 truncate">{user?.email}</p>
                <div className="mt-1.5 inline-flex items-center gap-1 rounded border border-amber-500/40 bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-bold text-amber-400 uppercase tracking-wider">
                  <Shield className="h-2.5 w-2.5" />
                  Main Admin Account
                </div>
              </div>

              <div className="py-1">
                <Link
                  href="/heda/ai-assistant"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-display uppercase tracking-wider text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                  <span>AI Admin Assistant</span>
                </Link>

                <Link
                  href="/heda/settings"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-display uppercase tracking-wider text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <Settings className="h-3.5 w-3.5 text-slate-400" />
                  <span>Platform Settings</span>
                </Link>

                <Link
                  href="/dashboard"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-display uppercase tracking-wider text-slate-300 hover:text-white hover:bg-white/5 transition-colors sm:hidden"
                >
                  <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
                  <span>Member Portal</span>
                </Link>
              </div>

              <div className="pt-1 border-t border-white/5">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-display uppercase tracking-wider text-rose-400 hover:bg-rose-500/10 transition-colors"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Sign Out Session</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
