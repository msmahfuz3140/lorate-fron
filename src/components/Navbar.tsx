'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  Menu,
  X,
  Terminal,
  User,
  UserCog,
  LogOut,
  Shield,
  Share2,
  Crown,
  ChevronRight,
  ChevronDown,
  Layers,
  Compass,
  Activity,
  HelpCircle,
  Headphones,
  Zap,
  Target,
  LayoutDashboard
} from 'lucide-react';
import { PremiumLockModal } from './PremiumLockModal';
import { NotificationBell } from './NotificationBell';
import { useAuth } from '../context/AuthContext';

export function Navbar() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [navDropdownOpen, setNavDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [lockModalOpen, setLockModalOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();

  const navDropdownRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Prevent background scroll when mobile drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  // Handle outside clicks and ESC key to close all dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (navDropdownRef.current && !navDropdownRef.current.contains(target)) {
        setNavDropdownOpen(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(target)) {
        setUserDropdownOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setNavDropdownOpen(false);
        setUserDropdownOpen(false);
        setMobileMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleOpenTool = () => {
    setNavDropdownOpen(false);
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
    if (user?.hasActiveSubscription) {
      router.push('/dashboard/tool');
    } else if (!isAuthenticated) {
      router.push('/golin?redirect=/dashboard/tool');
    } else {
      setLockModalOpen(true);
    }
  };

  return (
    <>
      <header
        className={`sticky top-0 z-50 w-full transition-all duration-300 ${
          scrolled
            ? 'border-b border-amber-500/25 bg-[#05070d]/95 backdrop-blur-2xl shadow-[0_10px_40px_rgba(0,0,0,0.9)]'
            : 'border-b border-white/5 bg-[#06080d]/85 backdrop-blur-xl'
        }`}
      >
        {/* Luxury Gold Shimmer Accent Line */}
        <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-amber-500/60 to-transparent" />

        <div className="mx-auto flex max-w-7xl items-center justify-between px-3 py-2.5 sm:px-6 lg:px-8 flex-nowrap">
          {/* Left: Brand Logo & Sleek Nav Menu Dropdown */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0 min-w-0">
            {/* Brand Logo with Official Luxury Emblem */}
            <Link href="/" className="flex items-center gap-2 sm:gap-2.5 group shrink-0 min-w-0">
              <div className="relative flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full p-0.5 bg-gradient-to-br from-amber-400 via-amber-600 to-amber-950 shadow-[0_0_20px_rgba(245,158,11,0.35)] group-hover:shadow-[0_0_30px_rgba(245,158,11,0.65)] group-hover:scale-105 transition-all duration-300">
                <img
                  src="/logo.png"
                  alt="Roulette.tools Official Emblem"
                  className="h-full w-full rounded-full object-cover"
                />
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="font-display text-sm sm:text-base font-black tracking-wider text-white whitespace-nowrap">
                    ROULETTE<span className="text-amber-400">.TOOLS</span>
                  </span>
                  <span className="hidden sm:inline-block rounded-full bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/40 px-1.5 py-0.2 font-display text-[8px] font-black uppercase tracking-widest text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.25)] shrink-0">
                    VIP PRO
                  </span>
                </div>
                <p className="hidden md:block font-display text-[8px] uppercase tracking-widest text-slate-400 group-hover:text-slate-300 transition-colors whitespace-nowrap">
                  European Roulette Intelligence
                </p>
              </div>
            </Link>

            {/* Navigation Menu Dropdown Trigger (Keeps Navbar Ultra Clean) */}
            <div className="relative" ref={navDropdownRef}>
              <button
                type="button"
                onClick={() => {
                  setNavDropdownOpen(!navDropdownOpen);
                  setUserDropdownOpen(false);
                }}
                className={`flex items-center gap-1.5 sm:gap-2 rounded-xl border px-2.5 sm:px-3 py-1.5 font-display text-xs font-bold uppercase tracking-wider transition-all duration-200 active:scale-95 shrink-0 whitespace-nowrap focus:outline-none ${
                  navDropdownOpen
                    ? 'border-amber-400 bg-amber-500/15 text-white shadow-[0_0_20px_rgba(245,158,11,0.25)] ring-1 ring-amber-400/50'
                    : 'border-white/10 bg-white/5 text-slate-300 hover:border-amber-500/40 hover:bg-white/10 hover:text-white'
                }`}
                title="Open platform menu"
                aria-label="Toggle navigation menu"
              >
                <Compass className={`h-4 w-4 text-amber-400 transition-transform duration-300 ${navDropdownOpen ? 'rotate-90 text-amber-300' : ''}`} />
                <span>Menu</span>
                <ChevronDown
                  className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ${
                    navDropdownOpen ? 'rotate-180 text-amber-400' : 'group-hover:text-amber-400'
                  }`}
                />
              </button>

              {/* Luxury Navigation Dropdown Panel */}
              {navDropdownOpen && (
                <div className="absolute left-0 top-full mt-2 w-[320px] sm:w-[460px] rounded-2xl border border-amber-500/30 bg-[#070b16]/98 backdrop-blur-2xl p-3 sm:p-4 shadow-[0_20px_50px_rgba(0,0,0,0.95)] z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-white/10">
                    <div className="flex items-center gap-2">
                      <Layers className="h-4 w-4 text-amber-400" />
                      <span className="font-display text-[10px] font-black uppercase tracking-widest text-slate-400">
                        Platform Navigation
                      </span>
                    </div>
                    <span className="font-mono text-[9px] text-amber-400 font-bold bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                      20+ Live Tables
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2">
                    <Link
                      href="/#strategies"
                      onClick={() => setNavDropdownOpen(false)}
                      className="group flex items-start gap-2.5 rounded-xl p-2.5 hover:bg-white/5 border border-transparent hover:border-white/10 transition-all"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 group-hover:bg-amber-500/20 group-hover:scale-105 transition-all">
                        <Target className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-display text-xs font-bold text-white group-hover:text-amber-300 transition-colors">
                          Strategies & Models
                        </p>
                        <p className="text-[10px] text-slate-400 leading-snug">
                          Offset, Target & Signature
                        </p>
                      </div>
                    </Link>

                    <Link
                      href="/#lobby"
                      onClick={() => setNavDropdownOpen(false)}
                      className="group flex items-start gap-2.5 rounded-xl p-2.5 hover:bg-white/5 border border-transparent hover:border-white/10 transition-all"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 group-hover:bg-emerald-500/20 group-hover:scale-105 transition-all">
                        <Activity className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-display text-xs font-bold text-white group-hover:text-emerald-300 transition-colors">
                          Live Casino Tables
                        </p>
                        <p className="text-[10px] text-slate-400 leading-snug">
                          Evolution & Pragmatic
                        </p>
                      </div>
                    </Link>

                    <Link
                      href="/plans"
                      onClick={() => setNavDropdownOpen(false)}
                      className="group flex items-start gap-2.5 rounded-xl p-2.5 hover:bg-white/5 border border-transparent hover:border-white/10 transition-all"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 group-hover:bg-amber-500/20 group-hover:scale-105 transition-all">
                        <Crown className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-display text-xs font-bold text-white group-hover:text-amber-300 transition-colors">
                          Subscription Plans
                        </p>
                        <p className="text-[10px] text-slate-400 leading-snug">
                          Crypto Passes • Zero KYC
                        </p>
                      </div>
                    </Link>

                    <Link
                      href="/how-it-works"
                      onClick={() => setNavDropdownOpen(false)}
                      className="group flex items-start gap-2.5 rounded-xl p-2.5 hover:bg-white/5 border border-transparent hover:border-white/10 transition-all"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 group-hover:bg-cyan-500/20 group-hover:scale-105 transition-all">
                        <Zap className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-display text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                          How It Works
                        </p>
                        <p className="text-[10px] text-slate-400 leading-snug">
                          4-Step Execution Protocol
                        </p>
                      </div>
                    </Link>

                    <Link
                      href="/faq"
                      onClick={() => setNavDropdownOpen(false)}
                      className="group flex items-start gap-2.5 rounded-xl p-2.5 hover:bg-white/5 border border-transparent hover:border-white/10 transition-all"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 group-hover:bg-indigo-500/20 group-hover:scale-105 transition-all">
                        <HelpCircle className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-display text-xs font-bold text-white group-hover:text-indigo-300 transition-colors">
                          FAQ & Guidelines
                        </p>
                        <p className="text-[10px] text-slate-400 leading-snug">
                          Rules, Limits & Support
                        </p>
                      </div>
                    </Link>

                    <Link
                      href="/contact"
                      onClick={() => setNavDropdownOpen(false)}
                      className="group flex items-start gap-2.5 rounded-xl p-2.5 hover:bg-white/5 border border-transparent hover:border-white/10 transition-all"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 group-hover:bg-rose-500/20 group-hover:scale-105 transition-all">
                        <Headphones className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-display text-xs font-bold text-white group-hover:text-rose-300 transition-colors">
                          Telegram & Support
                        </p>
                        <p className="text-[10px] text-slate-400 leading-snug">
                          24/7 Dedicated Help Desk
                        </p>
                      </div>
                    </Link>
                  </div>

                  {/* Bottom Quick Launch Shortcut */}
                  <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={handleOpenTool}
                      className="flex items-center gap-1.5 text-[11px] font-display font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
                    >
                      <Terminal className="h-3.5 w-3.5" />
                      <span>Launch Roulette Tool →</span>
                    </button>
                    <span className="text-[9px] font-mono text-slate-500">VIP Pro v2.4</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right: Action Controls (Tool, Notifications, User Dropdown / Auth) */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 flex-nowrap">
            {/* Quick Mobile Tool Button (< 640px) */}
            <button
              onClick={handleOpenTool}
              className="flex sm:hidden items-center gap-1 rounded-xl border border-emerald-500/50 bg-gradient-to-r from-emerald-500/20 via-emerald-600/15 to-teal-500/20 px-2.5 py-1.5 font-display text-[10px] font-black uppercase tracking-wider text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.3)] active:scale-95 shrink-0 whitespace-nowrap"
            >
              <Terminal className="h-3 w-3 text-emerald-400 shrink-0" />
              <span>TOOL</span>
            </button>

            {/* Desktop / Tablet Tool Launcher Button (>= 640px) */}
            <button
              onClick={handleOpenTool}
              className="hidden sm:flex group relative items-center gap-2 rounded-xl border border-emerald-500/40 bg-gradient-to-r from-emerald-500/20 via-emerald-600/10 to-teal-500/20 px-3.5 sm:px-4 py-2 font-display text-xs font-black uppercase tracking-wider text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.25)] transition-all hover:scale-[1.03] hover:border-emerald-400 hover:text-emerald-200 hover:shadow-[0_0_25px_rgba(16,185,129,0.4)] active:scale-95 shrink-0 whitespace-nowrap"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
              </span>
              <Terminal className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
              <span>OPEN TOOL</span>
            </button>

            {/* Authenticated Controls */}
            {isAuthenticated ? (
              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                <NotificationBell />

                <Link
                  href="/dashboard"
                  className="hidden md:inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 hover:border-amber-400/50 hover:bg-amber-500/10 px-3 py-1.5 font-display text-xs font-bold uppercase tracking-wider text-slate-200 hover:text-amber-300 transition-all active:scale-95 shrink-0 whitespace-nowrap"
                  title="Open Dashboard"
                >
                  <LayoutDashboard className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                  <span>Dashboard</span>
                </Link>

                {/* Profile Pill Dropdown Trigger */}
                <div className="relative" ref={userDropdownRef}>
                  <button
                    type="button"
                    onClick={() => {
                      setUserDropdownOpen(!userDropdownOpen);
                      setNavDropdownOpen(false);
                    }}
                    className={`flex items-center gap-1.5 sm:gap-2 rounded-xl border px-2 sm:px-2.5 py-1.5 transition-all duration-200 active:scale-95 shrink-0 whitespace-nowrap focus:outline-none ${
                      userDropdownOpen
                        ? 'border-amber-400 bg-amber-500/15 shadow-[0_0_20px_rgba(245,158,11,0.25)] ring-1 ring-amber-400/50'
                        : 'border-white/10 bg-white/5 hover:border-amber-500/40 hover:bg-white/10'
                    }`}
                    title="Account Menu"
                    aria-label="Toggle user menu"
                  >
                    <div className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 font-display text-xs font-black text-black shadow-[0_0_10px_rgba(245,158,11,0.35)]">
                      {user?.name ? user.name[0]?.toUpperCase() : 'U'}
                      {user?.hasActiveSubscription && (
                        <span className="absolute -top-1 -right-1 flex h-3 w-3 items-center justify-center rounded-full bg-amber-400 text-black">
                          <Crown className="h-2 w-2 text-black fill-current" />
                        </span>
                      )}
                    </div>

                    <div className="hidden sm:flex flex-col text-left leading-none">
                      <span className="font-display text-xs font-bold text-white truncate max-w-[90px] sm:max-w-[120px]">
                        {user?.name || 'Account'}
                      </span>
                      <span className="text-[9px] font-mono text-amber-400 font-semibold uppercase mt-0.5">
                        {user?.hasActiveSubscription
                          ? 'VIP ACTIVE'
                          : user?.role === 'SUPER_ADMIN'
                          ? 'ADMIN'
                          : user?.role === 'MODERATOR'
                          ? 'PARTNER'
                          : 'FREE TIER'}
                      </span>
                    </div>

                    <ChevronDown
                      className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 shrink-0 ${
                        userDropdownOpen ? 'rotate-180 text-amber-400' : 'group-hover:text-amber-400'
                      }`}
                    />
                  </button>

                  {/* Luxury Floating Glassmorphic User Dropdown */}
                  {userDropdownOpen && (
                    <div className="absolute right-0 top-full mt-2 w-64 sm:w-72 rounded-2xl border border-amber-500/30 bg-[#080d19]/98 backdrop-blur-2xl p-2 shadow-[0_20px_50px_rgba(0,0,0,0.95)] z-50 animate-in fade-in zoom-in-95 duration-150">
                      {/* User Identity Header Card */}
                      <div className="rounded-xl border border-white/5 bg-white/[0.03] p-3 mb-1.5">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 font-display text-sm font-black text-black shadow-[0_0_15px_rgba(245,158,11,0.4)]">
                            {user?.name ? user.name[0]?.toUpperCase() : 'U'}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-display text-xs font-bold text-white truncate">{user?.name}</p>
                            <p className="font-mono text-[10px] text-slate-400 truncate">{user?.email}</p>
                          </div>
                        </div>

                        <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between">
                          <span className="text-[10px] text-slate-400 font-display uppercase tracking-wider">Pass Status</span>
                          {user?.hasActiveSubscription ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/40 px-2 py-0.5 text-[9px] font-black text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.2)]">
                              <Crown className="h-2.5 w-2.5 text-amber-400 fill-current" />
                              VIP ACTIVE
                            </span>
                          ) : (
                            <Link
                              href="/plans"
                              onClick={() => setUserDropdownOpen(false)}
                              className="rounded-full bg-white/5 border border-white/10 px-2 py-0.5 text-[9px] font-bold text-amber-400 hover:bg-amber-500/10 transition-colors"
                            >
                              UPGRADE PASS →
                            </Link>
                          )}
                        </div>
                      </div>

                      {/* Dropdown Menu Items */}
                      <div className="space-y-0.5 py-1">
                        <button
                          type="button"
                          onClick={handleOpenTool}
                          className="w-full flex items-center justify-between rounded-xl px-3 py-2 text-left font-display text-xs font-bold text-emerald-300 hover:bg-emerald-500/10 border border-emerald-500/20 transition-all"
                        >
                          <div className="flex items-center gap-2.5">
                            <Terminal className="h-4 w-4 text-emerald-400" />
                            <span>Launch Live Tool</span>
                          </div>
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                        </button>

                        <Link
                          href="/dashboard"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center justify-between rounded-xl px-3 py-2 font-display text-xs font-semibold text-slate-200 hover:bg-white/5 hover:text-white transition-colors"
                        >
                          <div className="flex items-center gap-2.5">
                            <User className="h-4 w-4 text-amber-400" />
                            <span>Member Dashboard</span>
                          </div>
                          <ChevronRight className="h-3.5 w-3.5 text-slate-500" />
                        </Link>

                        <Link
                          href="/profile"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center justify-between rounded-xl px-3 py-2 font-display text-xs font-semibold text-slate-200 hover:bg-white/5 hover:text-white transition-colors"
                        >
                          <div className="flex items-center gap-2.5">
                            <UserCog className="h-4 w-4 text-amber-400" />
                            <span>My Profile</span>
                          </div>
                          <ChevronRight className="h-3.5 w-3.5 text-slate-500" />
                        </Link>

                        <Link
                          href="/plans"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center justify-between rounded-xl px-3 py-2 font-display text-xs font-semibold text-slate-200 hover:bg-white/5 hover:text-white transition-colors"
                        >
                          <div className="flex items-center gap-2.5">
                            <Crown className="h-4 w-4 text-amber-400" />
                            <span>Subscription Plans</span>
                          </div>
                          <ChevronRight className="h-3.5 w-3.5 text-slate-500" />
                        </Link>

                        {/* Super Admin Console Shortcut */}
                        {user?.role === 'SUPER_ADMIN' && (
                          <Link
                            href="/heda"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center justify-between rounded-xl px-3 py-2 font-display text-xs font-bold text-amber-300 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 transition-all"
                          >
                            <div className="flex items-center gap-2.5">
                              <Shield className="h-4 w-4 text-amber-400" />
                              <span>Admin Console (/heda)</span>
                            </div>
                            <ChevronRight className="h-3.5 w-3.5 text-amber-400" />
                          </Link>
                        )}

                        {/* Moderator Partner Portal Shortcut */}
                        {user?.role === 'MODERATOR' && (
                          <Link
                            href="/moredator"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center justify-between rounded-xl px-3 py-2 font-display text-xs font-bold text-amber-300 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 transition-all"
                          >
                            <div className="flex items-center gap-2.5">
                              <Share2 className="h-4 w-4 text-amber-400" />
                              <span>Partner Portal (/moredator)</span>
                            </div>
                            <ChevronRight className="h-3.5 w-3.5 text-amber-400" />
                          </Link>
                        )}
                      </div>

                      {/* Divider & Sign Out */}
                      <div className="pt-1.5 mt-1 border-t border-white/10">
                        <button
                          type="button"
                          onClick={() => {
                            setUserDropdownOpen(false);
                            logout();
                          }}
                          className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 font-display text-xs font-bold text-rose-300 hover:bg-rose-500/10 hover:text-rose-200 transition-colors"
                        >
                          <LogOut className="h-4 w-4 text-rose-400" />
                          <span>Sign Out Session</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Unauthenticated Controls */
              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                <Link
                  href="/golin"
                  className="hidden sm:inline-flex rounded-xl border border-white/10 bg-white/5 px-3 sm:px-3.5 py-1.5 font-display text-xs font-bold uppercase tracking-wider text-slate-300 hover:bg-white/10 hover:text-white hover:border-white/20 transition-all active:scale-95 shrink-0 whitespace-nowrap"
                >
                  Sign In
                </Link>
                <Link
                  href="/gerister"
                  className="relative group inline-flex items-center gap-1.5 overflow-hidden rounded-xl border border-amber-400/50 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 px-3 sm:px-3.5 py-1.5 font-display text-xs font-black uppercase tracking-wider text-black shadow-[0_0_15px_rgba(245,158,11,0.35)] transition-all hover:scale-105 hover:shadow-[0_0_25px_rgba(245,158,11,0.5)] active:scale-95 shrink-0 whitespace-nowrap"
                >
                  <Sparkles className="h-3 w-3 text-black shrink-0" />
                  <span>Register</span>
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent group-hover:translate-x-full transition-transform duration-700" />
                </Link>
              </div>
            )}

            {/* Mobile Drawer Hamburger Button */}
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(!mobileMenuOpen);
                setNavDropdownOpen(false);
                setUserDropdownOpen(false);
              }}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300 lg:hidden hover:text-white hover:border-amber-500/40 transition-colors shrink-0"
              aria-label="Toggle navigation drawer"
            >
              {mobileMenuOpen ? <X className="h-4 w-4 text-amber-400" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Full-Screen Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-x-0 top-[57px] sm:top-[65px] bottom-0 z-50 overflow-y-auto bg-[#070b14]/98 backdrop-blur-2xl px-4 py-5 lg:hidden animate-fade-in shadow-2xl border-b border-amber-500/25">
            <div className="max-w-md mx-auto flex flex-col gap-4 pb-12">
              {/* Tool Quick CTA Card */}
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleOpenTool();
                }}
                className="group relative flex items-center justify-between overflow-hidden rounded-2xl border border-emerald-500/60 bg-gradient-to-r from-emerald-500/25 via-emerald-600/20 to-teal-500/25 p-4 font-display text-xs font-black uppercase tracking-wider text-emerald-300 shadow-[0_0_25px_rgba(16,185,129,0.35)] active:scale-98 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/30 text-emerald-300 border border-emerald-500/40">
                    <Terminal className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <div className="flex items-center gap-2">
                      <span className="font-display font-black text-white text-sm">LAUNCH LIVE TOOL</span>
                      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    </div>
                    <p className="text-[10px] text-emerald-300/80 font-normal">Instant 20+ Live Tables Access</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-emerald-400 group-hover:translate-x-1 transition-transform" />
              </button>

              {/* User Account Controls */}
              {isAuthenticated ? (
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 space-y-2">
                  <div className="flex items-center justify-between px-2 py-1 border-b border-white/5 pb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/20 text-amber-300 font-bold text-xs">
                        {user?.name ? user.name[0]?.toUpperCase() : 'U'}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white font-display truncate max-w-[180px]">{user?.name}</p>
                        <p className="text-[10px] font-mono text-slate-400 truncate max-w-[180px]">{user?.email}</p>
                      </div>
                    </div>
                    {user?.hasActiveSubscription && (
                      <span className="rounded-full bg-amber-500/20 border border-amber-500/30 px-2 py-0.5 text-[9px] font-bold text-amber-400">
                        VIP ACTIVE
                      </span>
                    )}
                  </div>

                  {user?.role === 'SUPER_ADMIN' && (
                    <Link
                      href="/heda"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-between rounded-xl border border-amber-500/40 bg-amber-500/15 p-2.5 font-display text-xs font-bold uppercase tracking-wider text-amber-300 hover:bg-amber-500/25 transition-all"
                    >
                      <div className="flex items-center gap-2.5">
                        <Shield className="h-4 w-4 text-amber-400" />
                        <span>Admin Console (/heda)</span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-amber-400" />
                    </Link>
                  )}

                  {user?.role === 'MODERATOR' && (
                    <Link
                      href="/moredator"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-between rounded-xl border border-amber-500/40 bg-amber-500/15 p-2.5 font-display text-xs font-bold uppercase tracking-wider text-amber-300 hover:bg-amber-500/25 transition-all"
                    >
                      <div className="flex items-center gap-2.5">
                        <Share2 className="h-4 w-4 text-amber-400" />
                        <span>Partner Portal (/moredator)</span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-amber-400" />
                    </Link>
                  )}

                  <Link
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 p-2.5 font-display text-xs font-bold uppercase tracking-wider text-slate-200 hover:bg-white/10 transition-all"
                  >
                    <div className="flex items-center gap-2.5">
                      <User className="h-4 w-4 text-amber-400" />
                      <span>Member Dashboard</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  </Link>

                  <Link
                    href="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 p-2.5 font-display text-xs font-bold uppercase tracking-wider text-slate-200 hover:bg-white/10 transition-all"
                  >
                    <div className="flex items-center gap-2.5">
                      <UserCog className="h-4 w-4 text-amber-400" />
                      <span>My Profile</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  </Link>

                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 py-2.5 font-display text-xs font-bold uppercase tracking-wider text-red-300 hover:bg-red-500/20 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out Session</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <Link
                    href="/golin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center rounded-xl border border-white/10 bg-white/5 py-3 font-display text-xs font-bold uppercase tracking-wider text-slate-200 hover:bg-white/10 transition-all"
                  >
                    Sign In (/golin)
                  </Link>
                  <Link
                    href="/gerister"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-1.5 rounded-xl border border-amber-400/50 bg-gradient-to-r from-amber-500 to-amber-600 py-3 font-display text-xs font-black uppercase tracking-wider text-black shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    Register (/gerister)
                  </Link>
                </div>
              )}

              {/* Navigation Links Block */}
              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-2 space-y-1">
                <p className="px-3 pt-2 text-[10px] font-display font-bold uppercase tracking-wider text-slate-500">
                  Platform Navigation
                </p>
                <Link
                  href="/#strategies"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between rounded-xl px-3 py-2.5 font-display text-xs font-semibold uppercase tracking-wider text-slate-300 hover:bg-white/5 hover:text-amber-300 transition-colors"
                >
                  <span>Strategies & Predictions</span>
                  <ChevronRight className="h-3.5 w-3.5 text-slate-500" />
                </Link>
                <Link
                  href="/#lobby"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between rounded-xl px-3 py-2.5 font-display text-xs font-semibold uppercase tracking-wider text-slate-300 hover:bg-white/5 hover:text-amber-300 transition-colors"
                >
                  <span>Live Casino Tables</span>
                  <ChevronRight className="h-3.5 w-3.5 text-slate-500" />
                </Link>
                <Link
                  href="/plans"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between rounded-xl px-3 py-2.5 font-display text-xs font-semibold uppercase tracking-wider text-slate-300 hover:bg-white/5 hover:text-amber-300 transition-colors"
                >
                  <span>VIP Subscription Plans</span>
                  <ChevronRight className="h-3.5 w-3.5 text-slate-500" />
                </Link>
                <Link
                  href="/how-it-works"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between rounded-xl px-3 py-2.5 font-display text-xs font-semibold uppercase tracking-wider text-slate-300 hover:bg-white/5 hover:text-amber-300 transition-colors"
                >
                  <span>How It Works</span>
                  <ChevronRight className="h-3.5 w-3.5 text-slate-500" />
                </Link>
                <Link
                  href="/faq"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between rounded-xl px-3 py-2.5 font-display text-xs font-semibold uppercase tracking-wider text-slate-300 hover:bg-white/5 hover:text-amber-300 transition-colors"
                >
                  <span>FAQ & Guidelines</span>
                  <ChevronRight className="h-3.5 w-3.5 text-slate-500" />
                </Link>
                <Link
                  href="/contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between rounded-xl px-3 py-2.5 font-display text-xs font-semibold uppercase tracking-wider text-slate-300 hover:bg-white/5 hover:text-amber-300 transition-colors"
                >
                  <span>Support & Community</span>
                  <ChevronRight className="h-3.5 w-3.5 text-slate-500" />
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Animated Lock Screen Modal */}
      <PremiumLockModal isOpen={lockModalOpen} onClose={() => setLockModalOpen(false)} />
    </>
  );
}
