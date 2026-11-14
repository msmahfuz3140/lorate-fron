'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Activity,
  ArrowRight,
  BarChart3,
  Lock,
  Radio,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { authClient } from '../lib/auth-client';

interface PublicToolStatus {
  isToolEnabled?: boolean;
  maintenanceMode?: boolean;
  publicStatusMessage?: string;
  dsApiConfigured?: boolean;
  toolVersion?: string;
}

/**
 * Public lobby preview.
 *
 * The previous version displayed hardcoded table names, spins and "HOT" flags
 * as if they were live. Real table rows are subscription-protected, so this
 * section now shows the actual public engine status and what is available after
 * authentication instead of fabricated casino data.
 */
export function LiveLobbyPreview() {
  const [status, setStatus] = useState<PublicToolStatus | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const result = await authClient.getPublicToolStatus();
        if (!active) return;
        setStatus(result || {});
        setError(false);
      } catch {
        if (!active) return;
        setError(true);
      }
    };

    void load();
    const timer = setInterval(() => void load(), 45000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);

  const operational =
    !!status?.isToolEnabled && !status?.maintenanceMode && !!status?.dsApiConfigured && !error;

  return (
    <section id="lobby" className="border-t border-white/5 bg-[#05070b] py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1">
              <span className={`h-1.5 w-1.5 rounded-full ${operational ? 'animate-ping bg-emerald-400' : 'bg-amber-400'}`} />
              <span className="font-display text-[10px] font-bold uppercase tracking-widest text-amber-400">
                AUTHENTICATED LIVE TABLE LOBBY
              </span>
            </div>
            <h2 className="font-display text-2xl font-extrabold uppercase tracking-tight text-white sm:text-4xl">
              Live European Roulette Tables
            </h2>
            <p className="mt-2 max-w-2xl font-body text-sm text-slate-400 sm:text-base">
              Real table rows, spins, predictions and travel charts are available
              inside the member dashboard. Public pages never display fabricated
              live spins or fake win rates.
            </p>
          </div>

          <div className="flex items-center gap-2 font-display text-xs text-slate-400">
            <Radio className={`h-4 w-4 ${operational ? 'animate-pulse text-emerald-400' : 'text-amber-400'}`} />
            <span>
              {error
                ? 'Status temporarily unavailable'
                : status?.maintenanceMode
                  ? 'Maintenance mode active'
                  : status?.dsApiConfigured
                    ? 'Provider API configured'
                    : 'Provider API pending'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <StatusCard
            icon={<Radio className="h-4 w-4 text-emerald-400" />}
            label="Live engine"
            value={
              error
                ? 'Unknown'
                : status?.maintenanceMode
                  ? 'Maintenance'
                  : status?.isToolEnabled === false
                    ? 'Disabled'
                    : operational
                      ? 'Operational'
                      : 'Configuration pending'
            }
            detail={
              status?.publicStatusMessage ||
              'The public status endpoint reports the real operational state.'
            }
            color={operational ? 'emerald' : 'amber'}
          />

          <StatusCard
            icon={<Activity className="h-4 w-4 text-amber-400" />}
            label="Prediction engine"
            value="Dealer Signature"
            detail="Direction-aware travel average, n9 main sector, Top Over n4 and Top Under n4, calculated deterministically from live API data."
            color="amber"
          />

          <StatusCard
            icon={<ShieldCheck className="h-4 w-4 text-sky-400" />}
            label="Secure connection"
            value="Server-side HMAC"
            detail="The Main Server SK Key is encrypted at rest and signed only by the backend proxy. It never enters browser JavaScript or localStorage."
            color="sky"
          />
        </div>

        <div className="mt-8 flex flex-col items-start justify-between gap-4 rounded-2xl border border-amber-500/25 bg-amber-500/5 p-5 sm:flex-row sm:items-center">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-500/30 bg-amber-500/10">
              <Lock className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <h3 className="font-display text-sm font-bold uppercase tracking-wider text-white">
                Live table rows are subscriber-protected
              </h3>
              <p className="mt-1 max-w-2xl font-body text-xs leading-relaxed text-slate-400">
                Sign in with an active plan to load real tables from the provider
                API, including the Wheel / Prediction Map, Travel Chart, and Live
                Graph. If the API feed is stale, the last valid data is retained
                and clearly marked — nothing is invented.
              </p>
            </div>
          </div>

          <Link
            href="/dashboard"
            className="flex shrink-0 items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-2.5 font-display text-xs font-black uppercase tracking-wider text-black shadow-lg shadow-amber-500/20 transition-all hover:brightness-110"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Open Member Dashboard
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <MiniFeature icon={<BarChart3 className="h-3.5 w-3.5" />} text="Travel chart · last 60 jumps" />
          <MiniFeature icon={<Activity className="h-3.5 w-3.5" />} text="W/L n9 + n4 · latest 40 results" />
          <MiniFeature icon={<Radio className="h-3.5 w-3.5" />} text="Auto-refresh · no page reload" />
        </div>
      </div>
    </section>
  );
}

function StatusCard({
  icon,
  label,
  value,
  detail,
  color
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  detail: string;
  color: 'emerald' | 'amber' | 'sky';
}) {
  const colorClasses = {
    emerald: 'border-emerald-500/20 bg-emerald-500/5',
    amber: 'border-amber-500/20 bg-amber-500/5',
    sky: 'border-sky-500/20 bg-sky-500/5'
  }[color];

  return (
    <div className={`rounded-2xl border p-5 ${colorClasses}`}>
      <div className="flex items-center justify-between">
        <span className="font-display text-[10px] font-bold uppercase tracking-widest text-slate-400">
          {label}
        </span>
        {icon}
      </div>
      <div className="mt-3 font-display text-lg font-black uppercase tracking-tight text-white">
        {value}
      </div>
      <p className="mt-2 font-body text-xs leading-relaxed text-slate-400">{detail}</p>
    </div>
  );
}

function MiniFeature({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-white/5 bg-white/[0.02] px-3 py-2 font-mono text-[10px] text-slate-400">
      <span className="text-amber-400">{icon}</span>
      {text}
    </div>
  );
}
