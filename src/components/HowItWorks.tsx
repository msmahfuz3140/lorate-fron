import React from 'react';
import { Layers, Radio, Cpu, Award } from 'lucide-react';

export function HowItWorks() {
  const steps = [
    {
      num: '01',
      icon: <Layers className="h-6 w-6 text-amber-400" />,
      title: 'Select Strategy',
      desc: 'Pick between Offset Pocket Calculation, Target Streak Pattern, or Dealer Signature Trajectory.'
    },
    {
      num: '02',
      icon: <Radio className="h-6 w-6 text-emerald-400" />,
      title: 'Monitor Live Table',
      desc: 'Connect to any of the 20+ tracked Evolution Gaming and Pragmatic Play tables in the live lobby.'
    },
    {
      num: '03',
      icon: <Cpu className="h-6 w-6 text-rose-400" />,
      title: 'Receive Predictions',
      desc: 'Get immediate sector placements with neighbor ranges (e.g. 25n1, 0n4) and confirmed spin metrics.'
    },
    {
      num: '04',
      icon: <Award className="h-6 w-6 text-amber-400" />,
      title: 'Execute with Edge',
      desc: 'Follow the mathematical edge, observe momentum changes, and stop whenever weakening signals fire.'
    }
  ];

  return (
    <section id="how-it-works" className="py-20 border-t border-white/5 bg-[#05070b]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 mb-3">
            <span className="font-display text-[10px] font-bold uppercase tracking-widest text-slate-400">
              FOUR-STEP WORKFLOW
            </span>
          </div>
          <h2 className="font-display text-2xl sm:text-4xl font-extrabold uppercase tracking-tight text-white">
            How The Prediction Engine Operates
          </h2>
          <p className="font-body text-base text-slate-400 mt-2">
            No guesswork. A structured systematic methodology powered by live spin telemetry.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="relative flex flex-col items-center text-center rounded-2xl border border-white/10 bg-slate-900/40 p-6 transition-all hover:border-amber-500/30 hover:bg-slate-900/80"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] mb-4">
                {step.icon}
              </div>
              <span className="font-display text-xs font-bold text-amber-400 mb-1">
                STEP {step.num}
              </span>
              <h3 className="font-display text-base font-bold text-white mb-2">
                {step.title}
              </h3>
              <p className="font-body text-xs text-slate-400 leading-relaxed">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
