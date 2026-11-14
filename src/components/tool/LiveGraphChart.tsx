'use client';

import React from 'react';
import {
  NormalizedPrediction,
  NormalizedTravelChart,
  computeTravelChart,
  dsp,
  pct,
  r1
} from '../../lib/roulette-engine';

interface LiveGraphChartProps {
  data: NormalizedTravelChart | null;
  prediction: NormalizedPrediction | null;
  fallbackSpins?: number[];
  direction: 'CW' | 'CCW';
  window: number;
}

const W = 920;
const H = 390;
const X0 = 64;
const X1 = 896;
const Y_TOP = 58;
const Y_BOTTOM = 322;

/**
 * Separate Live Graph.
 *
 * The yellow reference line is fixed at the visual centre of the plot. Values
 * are plotted as the signed travel minus the signed mean, so "above the yellow
 * line" always means TOP OVER and "below" always means TOP UNDER for both CW
 * and CCW. The label still shows the real signed mean so no direction is hidden.
 */
export function LiveGraphChart({
  data,
  prediction,
  fallbackSpins = [],
  direction,
  window
}: LiveGraphChartProps) {
  const usingFallback = !data && fallbackSpins.length > 1;
  const chart =
    data ??
    (usingFallback
      ? computeTravelChart(fallbackSpins, direction, window)
      : null);

  if (!chart || chart.points.length === 0) {
    return (
      <div className="flex min-h-[220px] flex-col items-center justify-center gap-2 rounded-xl border border-white/5 bg-black/30 p-6 text-center">
        <span className="font-mono text-xs font-bold uppercase tracking-widest text-amber-400">
          Live graph is warming up
        </span>
        <p className="max-w-md font-mono text-[11px] text-slate-400">
          Waiting for at least 25 jumps from the live API. No synthetic points
          are drawn.
        </p>
      </div>
    );
  }

  const reference = chart.line.signedAverage;
  const deltas = chart.points.map((point) => point.signed - reference);
  const latestDelta = deltas[deltas.length - 1] ?? 0;
  const maxAbsRaw = Math.max(...deltas.map((value) => Math.abs(value)), chart.line.band, 3);
  const domain = Math.max(3, Math.ceil(maxAbsRaw * 1.15));
  const midY = Y_TOP + (Y_BOTTOM - Y_TOP) / 2;

  // A neutral corridor derived from the provider's actual rhythm band. This is
  // not a fabricated confidence score; it simply defines "near the yellow line".
  const neutralBand = Math.max(0.5, chart.line.band * 0.2);
  const liveSide: 'OVER' | 'UNDER' | 'NEUTRAL' =
    latestDelta > neutralBand
      ? 'OVER'
      : latestDelta < -neutralBand
        ? 'UNDER'
        : 'NEUTRAL';

  const y = (delta: number) => {
    const clamped = Math.max(-domain, Math.min(domain, delta));
    return midY - (clamped / domain) * ((Y_BOTTOM - Y_TOP) / 2);
  };

  const x = (index: number) =>
    X0 + (index / Math.max(1, deltas.length - 1)) * (X1 - X0);

  const path = deltas
    .map((value, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(2)} ${y(value).toFixed(2)}`)
    .join(' ');

  const areaPath = `${path} L${x(deltas.length - 1).toFixed(2)} ${midY} L${x(0).toFixed(2)} ${midY} Z`;

  const overCenter = prediction?.overCenter ?? null;
  const underCenter = prediction?.underCenter ?? null;

  const n4Rows = chart.wlRows.filter((row) => row.n4 !== null);
  const overRows = n4Rows.filter((row) => row.status === 'OVER');
  const underRows = n4Rows.filter((row) => row.status === 'UNDER');
  const overWins = overRows.filter((row) => row.n4 === 'W').length;
  const underWins = underRows.filter((row) => row.n4 === 'W').length;

  const sideColor =
    liveSide === 'OVER' ? 'text-orange-400' : liveSide === 'UNDER' ? 'text-cyan-300' : 'text-slate-300';
  const sideBg =
    liveSide === 'OVER'
      ? 'border-orange-500/50 bg-orange-500/15'
      : liveSide === 'UNDER'
        ? 'border-cyan-500/50 bg-cyan-500/15'
        : 'border-slate-500/40 bg-slate-500/10';

  return (
    <div className="w-full">
      <div className="mb-2.5 flex flex-wrap items-stretch gap-2">
        <div className={`flex min-w-[150px] flex-1 flex-col justify-center rounded-xl border px-3 py-2 ${sideBg}`}>
          <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-slate-400">
            Yellow-line signal
          </span>
          <span className={`font-mono text-lg font-black ${sideColor}`}>
            {liveSide === 'OVER'
              ? '▲ TOP OVER'
              : liveSide === 'UNDER'
                ? '▼ TOP UNDER'
                : '● NEUTRAL / WAIT'}
          </span>
          <span className="font-mono text-[10px] text-slate-400">
            Δ {latestDelta > 0 ? '+' : ''}{r1(latestDelta)} · corridor ±{r1(neutralBand)}
          </span>
        </div>

        <div className="flex min-w-[130px] flex-col justify-center rounded-xl border border-amber-500/35 bg-amber-500/10 px-3 py-2">
          <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-amber-200/70">
            Main prediction
          </span>
          <span className="font-mono text-2xl font-black leading-tight text-amber-300">
            {dsp(prediction?.main)}
          </span>
          <span className="font-mono text-[10px] text-amber-200/70">{prediction?.direction || direction}</span>
        </div>

        <div className="flex min-w-[170px] flex-col justify-center rounded-xl border border-orange-500/30 bg-orange-500/10 px-3 py-2">
          <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-orange-200/70">
            Top Over n4 {overCenter !== null ? `· ${dsp(overCenter)}` : ''}
          </span>
          <span className="font-mono text-sm font-black text-orange-300">
            {overWins}/{overRows.length} W · {pct(overRows.length ? overWins / overRows.length : null)}
          </span>
          <span className="font-mono text-[9px] text-orange-200/60">actual backtest rows</span>
        </div>

        <div className="flex min-w-[170px] flex-col justify-center rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-3 py-2">
          <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-cyan-200/70">
            Top Under n4 {underCenter !== null ? `· ${dsp(underCenter)}` : ''}
          </span>
          <span className="font-mono text-sm font-black text-cyan-300">
            {underWins}/{underRows.length} W · {pct(underRows.length ? underWins / underRows.length : null)}
          </span>
          <span className="font-mono text-[9px] text-cyan-200/60">actual backtest rows</span>
        </div>
      </div>

      <div className="w-full overflow-hidden rounded-xl border border-white/5 bg-[#020408]">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="xMidYMid meet"
          className="block h-auto w-full select-none"
          role="img"
          aria-label="Live graph with fixed yellow reference line"
        >
          <defs>
            <linearGradient id="live-over-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(255,140,0,0.14)" />
              <stop offset="100%" stopColor="rgba(255,140,0,0.01)" />
            </linearGradient>
            <linearGradient id="live-under-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(0,206,209,0.01)" />
              <stop offset="100%" stopColor="rgba(0,206,209,0.14)" />
            </linearGradient>
            <linearGradient id="live-area-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(0,206,209,0.22)" />
              <stop offset="100%" stopColor="rgba(0,206,209,0.01)" />
            </linearGradient>
          </defs>

          <rect width={W} height={H} fill="#080c13" />

          {/* Top / bottom zones */}
          <rect x={X0} y={Y_TOP} width={X1 - X0} height={midY - Y_TOP} fill="url(#live-over-gradient)" />
          <rect x={X0} y={midY} width={X1 - X0} height={Y_BOTTOM - midY} fill="url(#live-under-gradient)" />

          {/* Grid */}
          {[domain, domain / 2, 0, -domain / 2, -domain].map((value) => (
            <g key={value}>
              <line
                x1={X0}
                y1={y(value)}
                x2={X1}
                y2={y(value)}
                stroke="rgba(255,255,255,0.075)"
                strokeDasharray={value === 0 ? undefined : '3 4'}
              />
              <text
                x={X0 - 8}
                y={y(value) + 3}
                textAnchor="end"
                fontFamily="'JetBrains Mono', monospace"
                fontSize="8"
                fill="#546176"
              >
                {value > 0 ? `+${r1(value)}` : r1(value)}
              </text>
            </g>
          ))}

          {/* Fixed yellow reference line in the middle */}
          <line
            x1={X0}
            y1={midY}
            x2={X1}
            y2={midY}
            stroke="#FFD166"
            strokeWidth="2.4"
          />
          <text
            x={X1 - 2}
            y={midY - 8}
            textAnchor="end"
            fontFamily="'JetBrains Mono', monospace"
            fontSize="9"
            fontWeight="700"
            fill="#FFD166"
          >
            YELLOW REFERENCE · SIGNED MEAN {reference >= 0 ? '+' : '−'}
            {r1(Math.abs(reference))} ({chart.direction})
          </text>

          {/* Neutral corridor */}
          <rect
            x={X0}
            y={y(neutralBand)}
            width={X1 - X0}
            height={Math.max(1, y(-neutralBand) - y(neutralBand))}
            fill="rgba(255,209,102,0.07)"
            stroke="rgba(255,209,102,0.20)"
            strokeDasharray="3 4"
          />

          {/* Area + live line */}
          <path d={areaPath} fill="url(#live-area-gradient)" />
          <path
            d={path}
            fill="none"
            stroke="#00CED1"
            strokeWidth="2"
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {deltas.map((value, i) => {
            const point = chart.points[i];
            return (
              <g key={`live-${i}`}>
                {point.directionChanged && (
                  <circle cx={x(i)} cy={y(value)} r="2.7" fill="#FF4D5E" />
                )}
                {point.big && (
                  <circle
                    cx={x(i)}
                    cy={y(value)}
                    r="4.2"
                    fill="none"
                    stroke="#FF4D5E"
                    strokeWidth="1.2"
                  />
                )}
              </g>
            );
          })}

          {/* Latest point */}
          <circle
            cx={x(deltas.length - 1)}
            cy={y(latestDelta)}
            r="5.5"
            fill={liveSide === 'OVER' ? '#FF8C00' : liveSide === 'UNDER' ? '#00CED1' : '#FFD166'}
            stroke="#ffffff"
            strokeWidth="1.6"
          />

          {/* Labels */}
          <text x={X0} y={22} fontFamily="'JetBrains Mono', monospace" fontSize="9" fill="#8b97a8" letterSpacing="2">
            LIVE GRAPH · {chart.direction === 'CW' ? 'CW +' : 'CCW −'} · LEFT → RIGHT
          </text>
          <text x={X1} y={22} textAnchor="end" fontFamily="'JetBrains Mono', monospace" fontSize="9" fill="#546176">
            {deltas.length} live points · latest right
          </text>
          <text x={X0 + 10} y={Y_TOP + 18} fontFamily="'JetBrains Mono', monospace" fontSize="10" fontWeight="800" fill="rgba(255,140,0,0.75)" letterSpacing="1.5">
            ▲ TOP OVER ZONE
          </text>
          <text x={X0 + 10} y={Y_BOTTOM - 9} fontFamily="'JetBrains Mono', monospace" fontSize="10" fontWeight="800" fill="rgba(0,206,209,0.75)" letterSpacing="1.5">
            ▼ TOP UNDER ZONE
          </text>

          <text x={X1} y={H - 9} textAnchor="end" fontFamily="'JetBrains Mono', monospace" fontSize="8" fill="#3f4c5e">
            Δ = signed travel − signed mean · derived only from real API points
          </text>
        </svg>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[10px] text-slate-400">
        <span>
          Latest signed travel: <b className="text-cyan-300">{r1(chart.points[chart.points.length - 1].signed)}</b>
        </span>
        <span>
          Signed mean: <b className="text-amber-300">{r1(reference)}</b>
        </span>
        <span>
          Engine status: <b className="text-white">{prediction?.status ?? '—'}</b>
        </span>
        <span>
          n4 sample: <b className="text-white">{n4Rows.length}</b> rows
        </span>
        <span className="text-slate-500">
          {usingFallback ? 'Local reconstruction from received spins. ' : ''}
          No fabricated confidence score is displayed.
        </span>
      </div>
    </div>
  );
}
