import React from 'react';
import { Cpu, BarChart3, Radio, Clock } from 'lucide-react';

export function StatsBar() {
  const stats = [
    {
      icon: <Cpu className="h-5 w-5 text-amber-400" />,
      label: 'Core Strategies',
      value: '3 Active',
      sub: '+1 Experimental',
      highlightColor: 'text-amber-400'
    },
    {
      icon: <BarChart3 className="h-5 w-5 text-emerald-400" />,
      label: 'Predictions Formulated',
      value: '82,450,000+',
      sub: 'Algorithmic hits',
      highlightColor: 'text-emerald-400'
    },
    {
      icon: <Radio className="h-5 w-5 text-rose-400" />,
      label: 'Monitored Tables',
      value: '20+ Tables',
      sub: 'Evolution & Pragmatic',
      highlightColor: 'text-rose-400'
    },
    {
      icon: <Clock className="h-5 w-5 text-teal-400" />,
      label: 'Engine Uptime',
      value: '99.98%',
      sub: '24/7 Real-Time Data',
      highlightColor: 'text-teal-400'
    }
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="flex items-center gap-4 rounded-xl border border-white/5 bg-gradient-to-br from-slate-900/60 to-slate-950/80 p-4 shadow-lg backdrop-blur-md transition-all hover:border-white/15 hover:translate-y-[-2px]"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.02]">
              {stat.icon}
            </div>
            <div>
              <p className="font-display text-[10px] uppercase tracking-widest text-slate-500">
                {stat.label}
              </p>
              <div className="flex items-baseline gap-2">
                <span className={`font-display text-lg font-bold sm:text-xl ${stat.highlightColor}`}>
                  {stat.value}
                </span>
              </div>
              <p className="font-display text-[10px] text-slate-400 tracking-wider">
                {stat.sub}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
