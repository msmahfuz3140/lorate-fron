'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, Radio, ShieldCheck } from 'lucide-react';
import { authClient } from '../lib/auth-client';

interface PublicToolStatus {
  isToolEnabled?: boolean;
  maintenanceMode?: boolean;
  publicStatusMessage?: string;
  dsApiConfigured?: boolean;
  toolVersion?: string;
}

/**
 * Public status ticker.
 *
 * This used to rotate fabricated "hot streak" events. It now displays only
 * real values returned by the public /tool/status endpoint.
 */
export function LiveTicker() {
  const [status, setStatus] = useState<PublicToolStatus | null>(null);
  const [failed, setFailed] = useState(false);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const result = await authClient.getPublicToolStatus();
        if (!active) return;
        setStatus(result || {});
        setFailed(false);
      } catch {
        if (!active) return;
        setFailed(true);
      }
    };

    void load();
    const timer = setInterval(() => void load(), 45000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);

  const messages = useMemo(() => {
    if (failed) {
      return [
        {
          label: 'STATUS',
          text: 'Status endpoint is temporarily unreachable. Live tools continue to retry automatically.'
        }
      ];
    }

    if (!status) {
      return [{ label: 'STATUS', text: 'Checking live engine status…' }];
    }

    if (status.maintenanceMode) {
      return [
        {
          label: 'MAINTENANCE',
          text: status.publicStatusMessage || 'Scheduled maintenance is active.'
        }
      ];
    }

    if (!status.isToolEnabled) {
      return [
        {
          label: 'ENGINE',
          text: status.publicStatusMessage || 'The prediction engine is temporarily disabled.'
        }
      ];
    }

    if (!status.dsApiConfigured) {
      return [
        {
          label: 'API',
          text: 'Provider API configuration is pending. A Main Admin must save the Public API URL and Server SK Key in API Settings.'
        }
      ];
    }

    return [
      {
        label: 'ENGINE',
        text: 'Live engine is operational. Open the member dashboard to view authenticated real-time tables.'
      },
      {
        label: 'SECURITY',
        text: 'All provider requests are signed on the server. The SK key is never exposed to browsers.'
      },
      {
        label: 'STATUS',
        text: status.publicStatusMessage || 'All roulette prediction systems are operating normally.'
      }
    ];
  }, [failed, status]);

  useEffect(() => {
    if (messages.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((previous) => (previous + 1) % messages.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [messages.length]);

  const current = messages[index % messages.length];

  return (
    <div className="relative w-full overflow-hidden border-y border-white/5 bg-[#080b11] px-4 py-2.5">
      <div className="absolute left-0 right-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />

      <div className="mx-auto flex max-w-7xl items-center gap-3">
        <div className="flex shrink-0 items-center gap-2 border-r border-white/10 pr-4">
          <span className="relative flex h-2 w-2">
            <span
              className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${
                failed ? 'bg-amber-400' : 'animate-ping bg-emerald-400'
              }`}
            />
            <span
              className={`relative inline-flex h-2 w-2 rounded-full ${
                failed ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
            />
          </span>
          <span className="font-display text-[11px] font-bold uppercase tracking-widest text-slate-300">
            LIVE STATUS
          </span>
        </div>

        <div className="flex items-center gap-2.5 overflow-hidden text-xs sm:text-sm">
          <span className="inline-flex shrink-0 items-center gap-1 font-display font-bold text-amber-400">
            {failed ? (
              <AlertTriangle className="h-3.5 w-3.5" />
            ) : status?.dsApiConfigured && status?.isToolEnabled && !status?.maintenanceMode ? (
              <CheckCircle2 className="h-3.5 w-3.5" />
            ) : (
              <Radio className="h-3.5 w-3.5" />
            )}
            {current.label}:
          </span>
          <span className="truncate font-medium text-slate-300">{current.text}</span>
          <span className="ml-auto hidden shrink-0 items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-slate-500 sm:inline-flex">
            <ShieldCheck className="h-3 w-3 text-emerald-500" />
            Server-signed API
          </span>
        </div>
      </div>
    </div>
  );
}
