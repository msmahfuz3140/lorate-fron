'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  CheckCheck,
  Sparkles,
  AlertTriangle,
  AlertCircle,
  CreditCard,
  ShieldAlert,
  Info,
  ExternalLink,
  CheckCircle2
} from 'lucide-react';
import { authClient } from '../lib/auth-client';

interface NotificationItem {
  _id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  link?: string;
  createdAt: string;
}

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const res = await authClient.getUserNotifications({ limit: 10 });
      if (res) {
        setNotifications(res.notifications || []);
        setUnreadCount(res.unreadCount || 0);
      }
    } catch {
      // Ignored for unauthenticated guests
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // 30s poll
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      await authClient.markNotificationAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      // Best effort
    }
  };

  const handleMarkAllRead = async () => {
    try {
      setIsLoading(true);
      await authClient.markAllNotificationsAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {
      // Best effort
    } finally {
      setIsLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'SUBSCRIPTION_ACTIVATED':
        return <Sparkles className="h-4 w-4 text-emerald-400" />;
      case 'PAYMENT_FAILED':
        return <CreditCard className="h-4 w-4 text-red-400" />;
      case 'SUBSCRIPTION_REVOKED':
      case 'SUBSCRIPTION_EXPIRED':
        return <AlertTriangle className="h-4 w-4 text-amber-400" />;
      case 'SECURITY_ALERT':
        return <ShieldAlert className="h-4 w-4 text-cyan-400" />;
      case 'PLATFORM_ANNOUNCEMENT':
        return <Info className="h-4 w-4 text-blue-400" />;
      default:
        return <Bell className="h-4 w-4 text-slate-400" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) fetchNotifications();
        }}
        className="relative p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500/50 shrink-0"
        title="Notifications"
        aria-label="View notifications"
      >
        <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-black text-black">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-x-3 sm:inset-x-auto sm:right-0 mt-2 w-auto sm:w-96 max-w-sm sm:max-w-none rounded-2xl border border-white/10 bg-[#0d121f]/95 backdrop-blur-xl shadow-2xl z-50 overflow-hidden mx-auto sm:mx-0"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 p-4">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-amber-400" />
                <span className="font-display text-xs font-bold uppercase tracking-wider text-white">
                  Notifications
                </span>
                {unreadCount > 0 && (
                  <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-400 border border-amber-500/20">
                    {unreadCount} unread
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  disabled={isLoading}
                  className="flex items-center gap-1 text-[11px] font-medium text-slate-400 hover:text-white transition-colors"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  Mark all read
                </button>
              )}
            </div>

            {/* Notification List */}
            <div className="max-h-80 overflow-y-auto divide-y divide-white/5">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500">
                  <CheckCircle2 className="h-8 w-8 text-slate-600 mx-auto mb-2 opacity-50" />
                  No notifications yet. You are all caught up!
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n._id}
                    onClick={() => !n.isRead && handleMarkAsRead(n._id)}
                    className={`p-3.5 transition-colors cursor-pointer flex gap-3 ${
                      n.isRead ? 'bg-transparent opacity-75 hover:bg-white/5' : 'bg-amber-500/[0.04] hover:bg-amber-500/[0.08]'
                    }`}
                  >
                    <div className="mt-0.5 shrink-0 rounded-lg bg-white/5 p-2 border border-white/10">
                      {getTypeIcon(n.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className={`text-xs truncate ${n.isRead ? 'font-medium text-slate-300' : 'font-bold text-white'}`}>
                          {n.title}
                        </h4>
                        {!n.isRead && (
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5 leading-relaxed">
                        {n.message}
                      </p>
                      <div className="flex items-center justify-between mt-2 pt-1 border-t border-white/5">
                        <span className="text-[10px] text-slate-500">
                          {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {n.link && (
                          <Link
                            href={n.link}
                            onClick={() => setIsOpen(false)}
                            className="inline-flex items-center gap-1 text-[10px] text-amber-400 hover:text-amber-300 font-medium"
                          >
                            View details
                            <ExternalLink className="h-2.5 w-2.5" />
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
