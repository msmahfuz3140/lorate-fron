'use client';

import React from 'react';
import {
  NormalizedPrediction,
  RED_NUMS,
  BLACK_NUMS,
  dsp
} from '../../lib/roulette-engine';

interface RacetrackOvalProps {
  prediction: NormalizedPrediction;
  neighborCount: number;
  onAdjustNeighbor: (delta: number) => void;
}

const OVAL_NUMBERS = [
  24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35,
  3, 26, 0,
  32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30,
  8, 23, 10, 5
];

/** French oval racetrack, preserving the reference table layout. */
export function RacetrackOval({
  prediction,
  neighborCount,
  onAdjustNeighbor
}: RacetrackOvalProps) {
  const mainNum = prediction.main;
  const overSet = new Set(prediction.topOver);
  const underSet = new Set(prediction.topUnder);
  const lastSpin = prediction.lastSpin;

  const xLeft = 140;
  const xRight = 780;
  const yTop = 64;
  const yBottom = 258;
  const cellW = (xRight - xLeft) / 15;
  const cellH = 36;

  const renderCell = (n: number, x: number, y: number, w: number, h: number) => {
    let fill = '#0a0f18';
    let stroke = 'rgba(255,255,255,0.18)';
    let strokeW = 1;
    let textFill = '#fff';

    if (RED_NUMS.has(n)) fill = '#b91c1c';
    else if (BLACK_NUMS.has(n)) fill = '#090d14';
    else if (n === 0) fill = '#475569';

    if (overSet.has(n)) {
      stroke = '#FF8C00';
      strokeW = 2.2;
      fill = 'rgba(255, 140, 0, 0.55)';
    }
    if (underSet.has(n)) {
      stroke = '#00CED1';
      strokeW = 2.2;
      fill = 'rgba(0, 206, 209, 0.55)';
    }
    if (n === mainNum) {
      fill = '#FFD166';
      stroke = '#fff';
      strokeW = 2.8;
      textFill = '#000';
    }
    if (n === lastSpin && n !== mainNum) {
      stroke = '#ffffff';
      strokeW = 3;
    }

    return (
      <g key={`${n}-${x}-${y}`} transform={`translate(${x}, ${y})`}>
        <rect width={w} height={h} rx={3} fill={fill} stroke={stroke} strokeWidth={strokeW} />
        <text
          x={w / 2}
          y={h / 2 + 4.5}
          textAnchor="middle"
          fontFamily="'JetBrains Mono', monospace"
          fontSize="12"
          fontWeight="800"
          fill={textFill}
        >
          {dsp(n)}
        </text>
      </g>
    );
  };

  return (
    <svg viewBox="0 0 940 352" className="block h-auto w-full select-none" role="img" aria-label="European roulette racetrack">
      <path
        d={`M ${xLeft} ${yTop + cellH} L ${xRight} ${yTop + cellH} A 90 90 0 0 1 ${xRight} ${yBottom} L ${xLeft} ${yBottom} A 90 90 0 0 1 ${xLeft} ${yTop + cellH} Z`}
        fill="#05080e"
        stroke="rgba(255,255,255,0.14)"
        strokeWidth="1.2"
      />

      <line x1="320" y1={yTop + cellH} x2="380" y2={yBottom} stroke="rgba(255,255,255,0.25)" strokeWidth="1.4" />
      <line x1="510" y1={yTop + cellH} x2="510" y2={yBottom} stroke="rgba(255,255,255,0.25)" strokeWidth="1.4" />
      <path
        d={`M 680 ${yTop + cellH} A 65 65 0 0 1 680 ${yBottom}`}
        fill="none"
        stroke="rgba(255,255,255,0.25)"
        strokeWidth="1.4"
      />

      <text x="240" y="184" textAnchor="middle" fontFamily="sans-serif" fontSize="19" fontWeight="700" letterSpacing="3" fill="#cbd5e1">
        TIER
      </text>
      <text x="430" y="184" textAnchor="middle" fontFamily="sans-serif" fontSize="17" fontWeight="700" letterSpacing="3" fill="#cbd5e1">
        ORPHELINS
      </text>
      <text x="590" y="184" textAnchor="middle" fontFamily="sans-serif" fontSize="18" fontWeight="700" letterSpacing="3" fill="#cbd5e1">
        VOISINS
      </text>
      <text x="740" y="184" textAnchor="middle" fontFamily="sans-serif" fontSize="18" fontWeight="700" letterSpacing="3" fill="#cbd5e1">
        ZERO
      </text>

      <g transform="translate(885, 120)">
        <circle
          cx="20"
          cy="15"
          r="16"
          fill="#0d1424"
          stroke="rgba(255,255,255,0.3)"
          strokeWidth="1.5"
          className="cursor-pointer hover:stroke-amber-400"
          onClick={() => onAdjustNeighbor(1)}
        />
        <text x="20" y="21" textAnchor="middle" fontFamily="monospace" fontSize="20" fontWeight="800" fill="#fff" pointerEvents="none">
          +
        </text>
        <text x="20" y="72" textAnchor="middle" fontFamily="monospace" fontSize="24" fontWeight="900" fill="#fff">
          {neighborCount}
        </text>
        <circle
          cx="20"
          cy="118"
          r="16"
          fill="#0d1424"
          stroke="rgba(255,255,255,0.3)"
          strokeWidth="1.5"
          className="cursor-pointer hover:stroke-amber-400"
          onClick={() => onAdjustNeighbor(-1)}
        />
        <text x="20" y="124" textAnchor="middle" fontFamily="monospace" fontSize="22" fontWeight="800" fill="#fff" pointerEvents="none">
          −
        </text>
      </g>

      {OVAL_NUMBERS.slice(0, 15).map((n, i) => renderCell(n, xLeft + i * cellW, yTop, cellW, cellH))}

      {OVAL_NUMBERS.slice(15, 18).map((n, i) => {
        const angle = -Math.PI / 2 + (i + 1) * (Math.PI / 4);
        const cx = xRight + 10;
        const cy = (yTop + yBottom + cellH) / 2;
        const rx = 65;
        const ry = (yBottom - yTop) / 2 + 10;
        return renderCell(n, cx + Math.cos(angle) * rx - 18, cy + Math.sin(angle) * ry - 14, 36, cellH);
      })}

      {OVAL_NUMBERS.slice(18, 33).map((n, i) => renderCell(n, xRight - (i + 1) * cellW, yBottom, cellW, cellH))}

      {OVAL_NUMBERS.slice(33, 37).map((n, i) => {
        const angle = Math.PI / 2 + (i + 1) * (Math.PI / 5);
        const cx = xLeft - 10;
        const cy = (yTop + yBottom + cellH) / 2;
        const rx = 65;
        const ry = (yBottom - yTop) / 2 + 10;
        return renderCell(n, cx + Math.cos(angle) * rx - 18, cy + Math.sin(angle) * ry - 14, 36, cellH);
      })}
    </svg>
  );
}
