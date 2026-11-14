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

interface TravelChartProps {
  data: NormalizedTravelChart | null;
  prediction?: NormalizedPrediction | null;
  fallbackSpins?: number[];
  direction: 'CW' | 'CCW';
  window: number;
}

const W = 920;
const H = 500;
const X0 = 66;
const X1 = 898;
const Y_TOP = 52;
const Y_BOTTOM = 256;

/**
 * Reference travel chart:
 *   Row 1 — signed travel line, X mean line, ±7 band, direction flips, big jumps
 *   Row 2 — W/L n9, latest 40 causal results
 *   Row 3 — W/L n4, latest 40 causal results
 */
export function TravelChart({
  data,
  prediction,
  fallbackSpins = [],
  direction,
  window
}: TravelChartProps) {
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
          Building travel data
        </span>
        <p className="max-w-md font-mono text-[11px] text-slate-400">
          The travel chart needs at least 25 jumps (26 spins).{' '}
          {chart?.spinsNeeded
            ? `${chart.spinsNeeded} more spin(s) required.`
            : 'Waiting for the provider feed.'}
        </p>
      </div>
    );
  }

  const min = chart.axis.min;
  const max = chart.axis.max;
  const span = Math.max(1, max - min);

  const y = (value: number) =>
    Y_TOP + ((max - Math.min(max, Math.max(min, value))) / span) * (Y_BOTTOM - Y_TOP);

  const x = (index: number) =>
    X0 + (index / Math.max(1, chart.points.length - 1)) * (X1 - X0);

  const lineY = y(chart.line.signedAverage);
  const bandTop = y(chart.line.upper);
  const bandBottom = y(chart.line.lower);
  const bandHeight = Math.max(2, bandBottom - bandTop);

  const path = chart.points
    .map((point, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(2)} ${y(point.signed).toFixed(2)}`)
    .join(' ');

  // Display newest first, oldest last: (NEW W/L) ← ← ← (OLD W/L)
  // The underlying backtest rows stay chronological; only the visual order is
  // reversed so the newest result is always on the left.
  const rows = chart.wlRows.slice(-40).reverse();
  const rowWidth = Math.min(18, (X1 - X0) / Math.max(1, rows.length) - 2);
  const rowStep = (X1 - X0) / Math.max(1, rows.length);

  const latest = chart.points[chart.points.length - 1];

  return (
    <div className="w-full">
      <div className="mb-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 font-mono text-[10px] text-slate-400">
        <Legend color="#00CED1" label="Travel (signed jump)" />
        <Legend color="#FF8C00" label={`Average ${chart.direction} X = ${chart.direction === 'CW' ? '+' : '−'}${r1(chart.line.travelAverage)}`} />
        <Legend color="rgba(255,140,0,0.20)" label={`±${chart.line.band} band`} swatch />
        <Legend color="#FF3333" label="Direction flip" dot />
        <Legend color="#FF3333" label="Big jump" ring />
        <span className="ml-auto text-slate-500">
          {chart.points.length} jumps · {chart.spins} spins
          {usingFallback ? ' · local reconstruction' : ''}
        </span>
      </div>

      <div className="w-full overflow-hidden rounded-xl border border-white/5 bg-[#020408]">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="xMidYMid meet"
          className="block h-auto w-full select-none"
          role="img"
          aria-label="Travel chart with n9 and n4 win/loss rows"
        >
          <rect width={W} height={H} fill="#080c13" />

          {/* Travel plot grid */}
          {chart.axis.grid.map((value) => (
            <g key={value}>
              <line
                x1={X0}
                y1={y(value)}
                x2={X1}
                y2={y(value)}
                stroke="rgba(255,255,255,0.075)"
                strokeWidth="1"
              />
              <text
                x={X0 - 8}
                y={y(value) + 3}
                textAnchor="end"
                fontFamily="'JetBrains Mono', monospace"
                fontSize="8"
                fill="#546176"
              >
                {value > 0 ? `+${value}` : value}
              </text>
            </g>
          ))}

          {/* ±7 rhythm band */}
          <rect
            x={X0}
            y={bandTop}
            width={X1 - X0}
            height={bandHeight}
            fill="rgba(255,140,0,0.09)"
          />
          <line
            x1={X0}
            y1={bandTop}
            x2={X1}
            y2={bandTop}
            stroke="rgba(255,140,0,0.28)"
            strokeDasharray="4 4"
          />
          <line
            x1={X0}
            y1={bandBottom}
            x2={X1}
            y2={bandBottom}
            stroke="rgba(255,140,0,0.28)"
            strokeDasharray="4 4"
          />

          {/* Mean reference line */}
          <line
            x1={X0}
            y1={lineY}
            x2={X1}
            y2={lineY}
            stroke="#FF8C00"
            strokeWidth="1.9"
          />
          <text
            x={X1}
            y={lineY - 6}
            textAnchor="end"
            fontFamily="'JetBrains Mono', monospace"
            fontSize="9"
            fontWeight="700"
            fill="#FF8C00"
          >
            X = {chart.direction === 'CW' ? '+' : '−'}
            {r1(chart.line.travelAverage)} ({chart.direction})
          </text>

          {/* Travel line */}
          <path
            d={path}
            fill="none"
            stroke="#00CED1"
            strokeWidth="1.85"
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {/* Markers */}
          {chart.points.map((point, i) => (
            <g key={`pt-${i}`}>
              {point.directionChanged && (
                <circle cx={x(i)} cy={y(point.signed)} r="3.1" fill="#FF3333" />
              )}
              {point.big && (
                <circle
                  cx={x(i)}
                  cy={y(point.signed)}
                  r="4.8"
                  fill="none"
                  stroke="#FF3333"
                  strokeWidth="1.5"
                />
              )}
            </g>
          ))}

          {/* Latest point */}
          <circle
            cx={x(chart.points.length - 1)}
            cy={y(latest.signed)}
            r="5"
            fill="#FFD166"
            stroke="#ffffff"
            strokeWidth="1.5"
          />

          {/* Row labels */}
          <text x={X0} y={22} fontFamily="'JetBrains Mono', monospace" fontSize="9" fill="#8b97a8" letterSpacing="2">
            ROW 1 · TRAVEL {chart.direction === 'CW' ? 'CW +' : 'CCW −'} · LAST {chart.points.length} JUMPS
          </text>
          <text x={X1} y={22} textAnchor="end" fontFamily="'JetBrains Mono', monospace" fontSize="9" fill="#546176">
            red dot = direction flip · ○ = BIG JUMP (&gt; ±{chart.line.band})
          </text>

          <text x={X0} y={Y_BOTTOM + 26} fontFamily="'JetBrains Mono', monospace" fontSize="9" fill="#8b97a8" letterSpacing="2">
            ROW 2 · W/L n9 (19 numbers)
          </text>
          <text x={X1} y={Y_BOTTOM + 26} textAnchor="end" fontFamily="'JetBrains Mono', monospace" fontSize="9" fill="#546176">
            {chart.summary.n9Wins}/{chart.summary.predictions} W · {pct(chart.summary.n9Accuracy)}
          </text>

          <text x={X0} y={Y_BOTTOM + 92} fontFamily="'JetBrains Mono', monospace" fontSize="9" fill="#8b97a8" letterSpacing="2">
            ROW 3 · W/L n4 (9 numbers)
          </text>
          <text x={X1} y={Y_BOTTOM + 92} textAnchor="end" fontFamily="'JetBrains Mono', monospace" fontSize="9" fill="#546176">
            {chart.summary.n4Wins}/{chart.summary.n4Predictions} W · {pct(chart.summary.n4Accuracy)}
          </text>

          {/* Latest 40 W/L cells */}
          {rows.map((row, i) => {
            const xx = X0 + i * rowStep;
            const n9Color =
              row.n9 === 'W' ? '#18C07A' : row.n9 === 'L' ? '#FF4D5E' : '#2A3340';
            const n4Color =
              row.n4 === 'W' ? '#18C07A' : row.n4 === 'L' ? '#FF4D5E' : '#2A3340';

            return (
              <g key={`wl-${i}`}>
                <rect
                  x={xx}
                  y={Y_BOTTOM + 36}
                  width={rowWidth}
                  height="18"
                  rx="3"
                  fill={n9Color}
                  opacity={row.n9 ? 0.82 : 0.4}
                />
                <text
                  x={xx + rowWidth / 2}
                  y={Y_BOTTOM + 48.5}
                  textAnchor="middle"
                  fontFamily="'JetBrains Mono', monospace"
                  fontSize="8"
                  fontWeight="700"
                  fill="#ffffff"
                >
                  {row.n9 ?? '·'}
                </text>

                <rect
                  x={xx}
                  y={Y_BOTTOM + 102}
                  width={rowWidth}
                  height="18"
                  rx="3"
                  fill={n4Color}
                  opacity={row.n4 ? 0.82 : 0.4}
                />
                <text
                  x={xx + rowWidth / 2}
                  y={Y_BOTTOM + 114.5}
                  textAnchor="middle"
                  fontFamily="'JetBrains Mono', monospace"
                  fontSize="8"
                  fontWeight="700"
                  fill="#ffffff"
                >
                  {row.n4 ?? '–'}
                </text>
              </g>
            );
          })}

          {rows.length === 0 && (
            <text
              x={W / 2}
              y={Y_BOTTOM + 75}
              textAnchor="middle"
              fontFamily="'JetBrains Mono', monospace"
              fontSize="10"
              fill="#546176"
            >
              W/L results appear after the 25-jump warm-up (27+ spins)
            </text>
          )}

          <text x={X1} y={H - 8} textAnchor="end" fontFamily="'JetBrains Mono', monospace" fontSize="8" fill="#3f4c5e">
            NEW W/L → → → OLD W/L · latest 40 causal results
          </text>
        </svg>
      </div>

      <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 font-mono text-[10px] text-slate-400">
        <span>
          Latest signed travel: <b className="text-cyan-300">{r1(latest.signed)}</b>
        </span>
        <span>
          Mean: <b className="text-amber-300">{r1(chart.line.signedAverage)}</b>
        </span>
        <span>
          Δ from mean: <b className="text-white">{r1(latest.signed - chart.line.signedAverage)}</b>
        </span>
        <span>
          Travel prediction:{' '}
          <b
            className={
              prediction?.status === 'OVER'
                ? 'text-orange-400'
                : prediction?.status === 'UNDER'
                  ? 'text-cyan-300'
                  : 'text-slate-300'
            }
          >
            {prediction?.status ?? '—'}
          </b>
        </span>
        <span>
          n9 accuracy: <b className="text-emerald-400">{pct(chart.summary.n9Accuracy)}</b>
        </span>
        <span>
          n4 accuracy: <b className="text-emerald-400">{pct(chart.summary.n4Accuracy)}</b>
        </span>
        {prediction?.main !== null && prediction?.main !== undefined && (
          <span>
            Main prediction: <b className="text-amber-300">{dsp(prediction.main)}</b>
          </span>
        )}
      </div>
    </div>
  );
}

function Legend({
  color,
  label,
  dot,
  ring,
  swatch
}: {
  color: string;
  label: string;
  dot?: boolean;
  ring?: boolean;
  swatch?: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      {dot ? (
        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
      ) : ring ? (
        <span className="h-2.5 w-2.5 rounded-full border" style={{ borderColor: color }} />
      ) : swatch ? (
        <span className="h-2.5 w-4 rounded-[2px] border border-white/10" style={{ backgroundColor: color }} />
      ) : (
        <span className="h-[2px] w-4 rounded-full" style={{ backgroundColor: color }} />
      )}
      <span>{label}</span>
    </span>
  );
}
