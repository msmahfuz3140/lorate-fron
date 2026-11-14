import React from 'react';
import { ArrowLeftRight, BarChart3, Cpu, ShieldCheck } from 'lucide-react';

/**
 * Capability strip. Replaces previously unverifiable uptime/prediction-count
 * marketing figures with facts that are true for the shipped engine.
 */
export function StatsBar() {
  const stats = [
    {
      icon: <Cpu className="h-5 w-5 text-amber-400" />,
      label: 'Prediction Engine',
      value: 'Dealer Signature',
      sub: 'Deterministic travel math',
      highlightColor: 'text-amber-400'
    },
    {
      icon: <ArrowLeftRight className="h-5 w-5 text-emerald-400" />,
      label: 'Directions',
      value: 'CW · CCW',
      sub: 'Independent calculations',
      highlightColor: 'text-emerald-400'
    },
    {
      icon: <BarChart3 className="h-5 w-5 text-sky-400" />,
      label: 'Analysis Views',
      value: 'Wheel · Travel · Live',
      sub: 'One synchronized response',
      highlightColor: 'text-sky-400'
    },
    {
      icon: <ShieldCheck className="h-5 w-5 text-teal-400" />,
      label: 'Key Security',
      value: 'Server-side HMAC',
      sub: 'Encrypted at rest',
      highlightColor: 'text-teal-400'
    }
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="flex items-center gap-4 rounded-xl border border-white/5 bg-gradient-to-br from-slate-900/60 to-slate-950/80 p-4 shadow-lg backdrop-blur-md transition-all hover:-translate-y-0.5 hover:border-white/15"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.02]">
              {stat.icon}
            </div>
            <div>
              <p className="font-display text-[10px] uppercase tracking-widest text-slate-500">
                {stat.label}
              </p>
              <div className="flex items-baseline gap-2">
                <span className={`font-display text-sm font-bold sm:text-lg ${stat.highlightColor}`}>
                  {stat.value}
                </span>
              </div>
              <p className="font-display text-[10px] tracking-wider text-slate-400">
                {stat.sub}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
