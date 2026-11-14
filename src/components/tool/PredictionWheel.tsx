'use client';

import React from 'react';
import {
  NormalizedPrediction,
  RING,
  N,
  arcPath,
  dsp
} from '../../lib/roulette-engine';

interface PredictionWheelProps {
  prediction: NormalizedPrediction;
}

/**
 * Circular European wheel prediction map.
 *
 * Number order is the exact RING order used by the reference engine:
 * 0, 32, 15, ... 3, 26.
 */
export function PredictionWheel({ prediction }: PredictionWheelProps) {
  const size = 380;
  const cx = size / 2;
  const cy = size / 2;
  const rOuter = 174;
  const rInner = 116;

  const n9 = new Set(prediction.n9);
  const over = new Set(prediction.topOver);
  const under = new Set(prediction.topUnder);
  const overActive = prediction.status === 'OVER';
  const underActive = prediction.status === 'UNDER';

  const centerOver =
    prediction.overCenter ??
    (prediction.topOver.length
      ? prediction.topOver[Math.floor(prediction.topOver.length / 2)]
      : null);
  const centerUnder =
    prediction.underCenter ??
    (prediction.topUnder.length
      ? prediction.topUnder[Math.floor(prediction.topUnder.length / 2)]
      : null);

  return (
    <div className="w-full max-w-[460px] mx-auto">
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="w-full h-auto block select-none"
        role="img"
        aria-label="European roulette prediction wheel"
      >
        <defs>
          <radialGradient id="wheel-center-glow" cx="50%" cy="45%" r="60%">
            <stop offset="0%" stopColor="#172033" />
            <stop offset="100%" stopColor="#080c14" />
          </radialGradient>
          <filter id="wheel-main-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <circle
          cx={cx}
          cy={cy}
          r={rOuter + 9}
          fill="#05080f"
          stroke="rgba(255,255,255,0.10)"
          strokeWidth="1"
        />

        {RING.map((num, i) => {
          const a1 = (i / N) * Math.PI * 2 - Math.PI / 2;
          const a2 = ((i + 1) / N) * Math.PI * 2 - Math.PI / 2;

          let fill = '#141b24';
          let stroke = 'rgba(255,255,255,0.07)';
          let textColor = '#8b97a8';
          let strokeWidth = 1;
          let dash: string | undefined;

          if (n9.has(num)) {
            fill = 'rgba(255,209,102,0.10)';
            stroke = 'rgba(255,209,102,0.34)';
            textColor = '#d8bd80';
          }

          if (over.has(num)) {
            if (overActive) {
              fill = 'rgba(255,140,0,0.48)';
              stroke = '#FF8C00';
              textColor = '#ffffff';
              strokeWidth = 2.2;
            } else {
              fill = 'rgba(255,140,0,0.20)';
              stroke = 'rgba(255,140,0,0.62)';
              textColor = '#ffcf9b';
              strokeWidth = 1.35;
              dash = '4 3';
            }
          }

          if (under.has(num)) {
            if (underActive) {
              fill = 'rgba(0,206,209,0.48)';
              stroke = '#00CED1';
              textColor = '#ffffff';
              strokeWidth = 2.2;
            } else {
              fill = 'rgba(0,206,209,0.20)';
              stroke = 'rgba(0,206,209,0.62)';
              textColor = '#9fe9ea';
              strokeWidth = 1.35;
              dash = '4 3';
            }
          }

          if (num === prediction.main) {
            fill = '#FFD166';
            stroke = '#FFE6A6';
            textColor = '#1a1206';
            strokeWidth = 2.8;
            dash = undefined;
          }

          const isLast = prediction.lastSpin === num;
          if (isLast && num !== prediction.main) {
            stroke = '#ffffff';
            strokeWidth = 2.6;
            dash = undefined;
          }

          const mid = (a1 + a2) / 2;
          const r = (rInner + rOuter) / 2;
          const tx = cx + Math.cos(mid) * r;
          const ty = cy + Math.sin(mid) * r;
          const textRotation = (mid * 180) / Math.PI + 90;

          return (
            <g key={`${num}-${i}`}>
              <path
                d={arcPath(cx, cy, rInner, rOuter, a1, a2)}
                fill={fill}
                stroke={stroke}
                strokeWidth={strokeWidth}
                strokeDasharray={dash}
              />
              {/* Independent n9 marker: the 19-number sector keeps a gold
                  outer band even when its pockets are also OVER/UNDER. */}
              {n9.has(num) && (
                <path
                  d={arcPath(cx, cy, rOuter + 1.5, rOuter + 7, a1 + 0.008, a2 - 0.008)}
                  fill={num === prediction.main ? '#FFD166' : 'rgba(255,209,102,0.52)'}
                  stroke="none"
                />
              )}
              {isLast && (
                <path
                  d={arcPath(cx, cy, rOuter - 2, rOuter + 5, a1 + 0.006, a2 - 0.006)}
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="1.4"
                  strokeDasharray="2 2"
                />
              )}
              <text
                x={tx}
                y={ty}
                textAnchor="middle"
                dominantBaseline="central"
                fontFamily="'JetBrains Mono', monospace"
                fontSize="13"
                fontWeight={num === prediction.main ? 900 : 700}
                fill={textColor}
                transform={`rotate(${textRotation} ${tx} ${ty})`}
              >
                {dsp(num)}
              </text>
            </g>
          );
        })}

        {/* Center hub */}
        <circle
          cx={cx}
          cy={cy}
          r={rInner - 10}
          fill="url(#wheel-center-glow)"
          stroke="rgba(255,255,255,0.10)"
          strokeWidth="1"
        />
        <text
          x={cx}
          y={cy - 37}
          textAnchor="middle"
          fontFamily="'JetBrains Mono', monospace"
          fontSize="9"
          fill="#6b778a"
          letterSpacing="2.2"
        >
          MAIN PREDICTION
        </text>
        <text
          x={cx}
          y={cy + 1}
          textAnchor="middle"
          dominantBaseline="middle"
          fontFamily="'JetBrains Mono', monospace"
          fontSize="46"
          fontWeight="900"
          fill="#FFD166"
          filter="url(#wheel-main-glow)"
        >
          {dsp(prediction.main)}
        </text>
        <text
          x={cx}
          y={cy + 31}
          textAnchor="middle"
          fontFamily="'JetBrains Mono', monospace"
          fontSize="9"
          fill="#94a3b8"
        >
          n9 · 19 numbers
        </text>

        <g fontFamily="'JetBrains Mono', monospace" fontSize="9.5">
          <text x={cx} y={cy + 51} textAnchor="middle" fill="#FF8C00" fontWeight="700">
            ▲ OVER {dsp(centerOver)}n4
          </text>
          <text x={cx} y={cy + 66} textAnchor="middle" fill="#00CED1" fontWeight="700">
            ▼ UNDER {dsp(centerUnder)}n4
          </text>
        </g>

        {/* Last spin marker in the outer ring */}
        {prediction.lastSpin !== null && (
          <g>
            <circle
              cx={cx}
              cy={cy + rOuter + 2}
              r="1"
              fill="transparent"
            />
          </g>
        )}
      </svg>

      <div className="mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 font-mono text-[10px] text-slate-400">
        <LegendDot color="#FFD166" label={`Main ${dsp(prediction.main)}`} />
        <LegendDot color="rgba(255,209,102,0.55)" label="n9 (19) · gold outer band" />
        <LegendDot color="#FF8C00" label={`Top Over n4 (9) · ${dsp(centerOver)}`} />
        <LegendDot color="#00CED1" label={`Top Under n4 (9) · ${dsp(centerUnder)}`} />
        <LegendRing label={`Last spin ${dsp(prediction.lastSpin)}`} />
      </div>

      <p className="mt-2 text-center font-mono text-[10px] text-slate-500">
        Wheel order preserved · clockwise ring: 0 → 32 → 15 … 35 → 3 → 26
      </p>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className="h-2.5 w-2.5 rounded-[3px] border border-white/20"
        style={{ backgroundColor: color }}
      />
      <span>{label}</span>
    </span>
  );
}

function LegendRing({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="h-2.5 w-2.5 rounded-[3px] border border-dashed border-white/80" />
      <span>{label}</span>
    </span>
  );
}

/** Exported helper kept for parity with the reference `wheelSVG()` naming. */
export function wheelCentreNumber(prediction: NormalizedPrediction): number | null {
  return prediction.main;
}
