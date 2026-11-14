'use client';

import React, { useMemo, useState } from 'react';
import { Download, Image as ImageIcon, Loader2 } from 'lucide-react';

const W = 1672;
const H = 941;

interface PatternItem {
  name: string;
  sequences: string[][];
  description: string[];
  accent?: string;
}

const BASIC_PATTERNS: PatternItem[] = [
  {
    name: 'Straight Win Streak',
    sequences: [['W', 'W', 'W', 'L'], ['W', 'W', 'W', 'L']],
    description: ['3 wins then 1 loss,', 'repeats. Switch or', 'wait before the L.']
  },
  {
    name: 'Alternating',
    sequences: [['W', 'L', 'W', 'L'], ['W', 'L', 'W', 'L']],
    description: ['Alternates every time.', 'Very predictable.']
  },
  {
    name: 'Double Win',
    sequences: [['W', 'W', 'L'], ['W', 'W', 'L']],
    description: ['2 wins then 1 loss,', 'repeats. Switch', 'before the L.']
  },
  {
    name: 'Step Pattern',
    sequences: [['W', 'W', 'L', 'W', 'L'], ['W', 'W', 'L', 'W', 'L']],
    description: ['This exact 5-step', 'pattern repeats.']
  },
  {
    name: 'Cluster Pattern',
    sequences: [
      ['W', 'W', 'L', 'W', 'L', 'W', 'W'],
      ['W', 'W', 'L', 'W', 'L', 'W', 'W']
    ],
    description: ['After WL → 2 WINS', 'come because the', 'pattern is playing out.', 'Trust the structure.']
  }
];

const TREND_PATTERNS = [
  {
    name: 'Rising Trend',
    subtitle: '(1W then L, 2W then L, 3W then L)',
    sequences: [
      ['W', 'L'],
      ['W', 'W', 'L'],
      ['W', 'W', 'W', 'L'],
      ['W', 'W', 'W', 'W', 'L']
    ],
    description: [
      'Wins are increasing with an L in between each group:',
      '1, 2, 3 then a loss. Trend goes up.',
      'Switch before the L.'
    ],
    arrow: 'RISING',
    arrowColor: '#00ff88'
  },
  {
    name: 'Dying Trend',
    subtitle: '(3W then L, 2W then L, 1W then L)',
    sequences: [
      ['W', 'W', 'W', 'L'],
      ['W', 'W', 'L'],
      ['W', 'L'],
      ['L']
    ],
    description: [
      'Wins are decreasing with an L in between each group:',
      '3, 2, 1 then a loss.',
      'After this, most probably a big loss streak will come.',
      'Be very careful.'
    ],
    arrow: 'DYING',
    arrowColor: '#ff3344'
  }
];

const OTHER_PATTERNS: PatternItem[] = [
  {
    name: 'The Roller',
    sequences: [['W', 'L', 'W', 'L', 'W', 'L'], ['W', 'L', 'W', 'L', 'W', 'L']],
    description: ['Back and forth.', 'Very common.', 'No long streaks.']
  },
  {
    name: 'The Wave',
    sequences: [['W', 'W', 'L', 'L'], ['W', 'W', 'L', 'L']],
    description: ['2 good, 2 bad.', 'Repeats. Stay alert', 'before the 2 losses.']
  },
  {
    name: 'The Bamboo',
    sequences: [['W', 'W', 'W', 'L', 'L'], ['W', 'W', 'W', 'L', 'L']],
    description: ['3 up, 2 down.', 'Then again. After', '2 losses, watch for', 'next rise.']
  },
  {
    name: 'The Spike',
    sequences: [['W', 'W', 'W', 'W', 'L'], ['W', 'W', 'W', 'W', 'L']],
    description: ['Long win run then', '1 sharp loss. Big', 'loss can follow.']
  },
  {
    name: 'The Trap',
    sequences: [['W', 'L', 'L', 'W', 'L', 'L'], ['W', 'L', 'L', 'W', 'L', 'L']],
    description: ['Gives a win, then', 'traps you in losses.', 'Be careful after', 'the W.']
  }
];

function esc(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function chips(sequence: string[], x: number, y: number, size = 26): string {
  return sequence
    .map((value, index) => {
      const cx = x + index * (size + 4);
      const win = value === 'W';
      return `
        <rect x="${cx}" y="${y}" width="${size}" height="${size}" rx="4"
          fill="${win ? '#16c96b' : '#ff2f45'}" stroke="${win ? '#8dffc0' : '#ff9aa5'}" stroke-width="1"/>
        <text x="${cx + size / 2}" y="${y + size / 2 + 5}" text-anchor="middle"
          font-family="Arial, sans-serif" font-size="${size * 0.55}" font-weight="900" fill="#ffffff">${value}</text>`;
    })
    .join('');
}

function textLines(lines: string[], x: number, y: number, color = '#dbe7ff', size = 14, gap = 19): string {
  return lines
    .map(
      (line, index) =>
        `<text x="${x}" y="${y + index * gap}" font-family="Arial, sans-serif" font-size="${size}" fill="${color}">${esc(line)}</text>`
    )
    .join('');
}

function buildPatternGuideSvg(): string {
  const leftX = 28;
  const midX = 572;
  const rightX = 1116;
  const colW = 528;

  let basic = '';
  let basicY = 232;
  for (const item of BASIC_PATTERNS) {
    basic += `
      <text x="${leftX + 18}" y="${basicY}" font-family="Arial, sans-serif" font-size="20" font-weight="900" fill="#ffe34d">${esc(item.name)}</text>
      ${item.sequences
        .map((seq, index) => chips(seq, leftX + 18, basicY + 14 + index * 36, 27))
        .join('')}
      ${textLines(item.description, leftX + 300, basicY + 22, '#e8f0ff', 14, 18)}
      <line x1="${leftX + 12}" y1="${basicY + 98}" x2="${leftX + colW - 12}" y2="${basicY + 98}" stroke="rgba(0,255,130,0.18)" stroke-width="1"/>
    `;
    basicY += 112;
  }

  let trends = '';
  let trendY = 226;
  for (const item of TREND_PATTERNS) {
    const seq = item.sequences;
    let chipX = midX + 20;
    let trendChips = '';
    for (const group of seq) {
      trendChips += chips(group, chipX, trendY + 34, 24);
      chipX += group.length * 28 + 14;
    }
    const arrowY = trendY + 78;
    trends += `
      <text x="${midX + 20}" y="${trendY}" font-family="Arial, sans-serif" font-size="21" font-weight="900" fill="#61ff8d">${esc(item.name)}</text>
      <text x="${midX + 20}" y="${trendY + 22}" font-family="Arial, sans-serif" font-size="13" fill="#c8d8ef">${esc(item.subtitle)}</text>
      ${trendChips}
      <line x1="${midX + 28}" y1="${arrowY}" x2="${midX + 360}" y2="${arrowY}" stroke="${item.arrowColor}" stroke-width="3"/>
      <polygon points="${midX + 360},${arrowY - 8} ${midX + 378},${arrowY} ${midX + 360},${arrowY + 8}" fill="${item.arrowColor}"/>
      <text x="${midX + 185}" y="${arrowY + 21}" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" font-weight="900" fill="${item.arrowColor}">${item.arrow}</text>
      ${textLines(item.description, midX + 20, arrowY + 46, '#e8f0ff', 13.5, 18)}
      <line x1="${midX + 12}" y1="${trendY + 185}" x2="${midX + colW - 12}" y2="${trendY + 185}" stroke="rgba(168,85,247,0.25)" stroke-width="1"/>
    `;
    trendY += 200;
  }

  let other = '';
  let otherY = 232;
  for (const item of OTHER_PATTERNS) {
    other += `
      <text x="${rightX + 18}" y="${otherY}" font-family="Arial, sans-serif" font-size="20" font-weight="900" fill="#ffe34d">${esc(item.name)}</text>
      ${item.sequences
        .map((seq, index) => chips(seq, rightX + 18, otherY + 14 + index * 36, 27))
        .join('')}
      ${textLines(item.description, rightX + 300, otherY + 22, '#e8f0ff', 14, 18)}
      <line x1="${rightX + 12}" y1="${otherY + 98}" x2="${rightX + colW - 12}" y2="${otherY + 98}" stroke="rgba(0,200,255,0.18)" stroke-width="1"/>
    `;
    otherY += 112;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#06111c"/>
        <stop offset="50%" stop-color="#03070d"/>
        <stop offset="100%" stop-color="#050b13"/>
      </linearGradient>
      <linearGradient id="greenBorder" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#00ff88"/>
        <stop offset="55%" stop-color="#00c8ff"/>
        <stop offset="100%" stop-color="#00ff88"/>
      </linearGradient>
      <linearGradient id="purpleBorder" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#a855f7"/>
        <stop offset="100%" stop-color="#4f7cff"/>
      </linearGradient>
      <filter id="glow"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    </defs>
    <rect width="${W}" height="${H}" fill="url(#bg)"/>

    <!-- Header -->
    <rect x="250" y="14" width="1172" height="102" rx="14" fill="#071a10" stroke="url(#greenBorder)" stroke-width="3"/>
    <rect x="258" y="22" width="1156" height="86" rx="10" fill="none" stroke="rgba(0,255,136,0.18)" stroke-width="1"/>
    <text x="${W / 2}" y="70" text-anchor="middle" font-family="Arial, sans-serif" font-size="50" font-weight="900" fill="#d7f6ff" letter-spacing="2">PATTERN GUIDE</text>
    <rect x="610" y="82" width="30" height="30" rx="4" fill="#16c96b"/>
    <text x="625" y="104" text-anchor="middle" font-family="Arial, sans-serif" font-size="19" font-weight="900" fill="#fff">W</text>
    <text x="648" y="105" font-family="Arial, sans-serif" font-size="22" font-weight="900" fill="#ffffff">= WIN</text>
    <rect x="790" y="82" width="30" height="30" rx="4" fill="#ff2f45"/>
    <text x="805" y="104" text-anchor="middle" font-family="Arial, sans-serif" font-size="19" font-weight="900" fill="#fff">L</text>
    <text x="828" y="105" font-family="Arial, sans-serif" font-size="22" font-weight="900" fill="#ffffff">= LOSS</text>
    <text x="20" y="55" font-family="Arial, sans-serif" font-size="12" font-weight="700" fill="#4f7f9f" letter-spacing="2">ROULETTE COMPUTER</text>
    <text x="${W - 20}" y="55" text-anchor="end" font-family="Arial, sans-serif" font-size="12" font-weight="700" fill="#4f7f9f" letter-spacing="2">W/L STRUCTURE REFERENCE</text>

    <!-- Main rule -->
    <rect x="28" y="128" width="1616" height="46" rx="8" fill="#07120d" stroke="#ffd400" stroke-width="2"/>
    <text x="58" y="158" font-family="Arial, sans-serif" font-size="22" font-weight="900" fill="#ffd400">💡 MAIN RULE:</text>
    <text x="225" y="158" font-family="Arial, sans-serif" font-size="17" font-weight="700" fill="#ffffff">Patterns repeat themselves. By looking at the pattern, switch <tspan fill="#ffe34d">RIGHT BEFORE</tspan> a loss should come or wait.</text>

    <!-- Column 1 -->
    <rect x="${leftX}" y="184" width="${colW}" height="650" rx="12" fill="#04110b" stroke="url(#greenBorder)" stroke-width="2.5"/>
    <text x="${leftX + colW / 2}" y="216" text-anchor="middle" font-family="Arial, sans-serif" font-size="20" font-weight="900" fill="#ffffff">1. BASIC REPEATING PATTERNS</text>
    ${basic}

    <!-- Column 2 -->
    <rect x="${midX}" y="184" width="${colW}" height="650" rx="12" fill="#0a0616" stroke="url(#purpleBorder)" stroke-width="2.5"/>
    <text x="${midX + colW / 2}" y="216" text-anchor="middle" font-family="Arial, sans-serif" font-size="20" font-weight="900" fill="#ffffff">2. TREND PATTERNS</text>
    ${trends}

    <!-- Column 3 -->
    <rect x="${rightX}" y="184" width="${colW}" height="650" rx="12" fill="#041018" stroke="url(#greenBorder)" stroke-width="2.5"/>
    <text x="${rightX + colW / 2}" y="216" text-anchor="middle" font-family="Arial, sans-serif" font-size="20" font-weight="900" fill="#ffffff">3. OTHER POWERFUL PATTERNS</text>
    ${other}

    <!-- Footer -->
    <rect x="28" y="846" width="760" height="78" rx="10" fill="#04110b" stroke="rgba(0,255,136,0.5)" stroke-width="2"/>
    <text x="48" y="874" font-family="Arial, sans-serif" font-size="19" font-weight="900" fill="#00ff88">★ SUMMARY</text>
    <text x="48" y="896" font-family="Arial, sans-serif" font-size="13" fill="#e8f0ff">Patterns repeat. Identify → Anticipate → Switch or Wait before the loss.</text>
    <text x="48" y="914" font-family="Arial, sans-serif" font-size="13" fill="#e8f0ff">Protect your streaks. Don't fight the pattern, follow it!</text>

    <rect x="808" y="846" width="836" height="78" rx="10" fill="#041018" stroke="rgba(0,200,255,0.5)" stroke-width="2"/>
    <text x="1226" y="875" text-anchor="middle" font-family="Arial, sans-serif" font-size="19" font-weight="900" fill="#00c8ff">REMEMBER:</text>
    <text x="1226" y="899" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" fill="#e8f0ff">Discipline + Patience + Pattern Recognition</text>
    <text x="1226" y="918" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" font-weight="900" fill="#ffe34d">= Long Term Success</text>
  </svg>`;
}

/**
 * Pattern Guide replacement for the old Travel Chart tab.
 *
 * The supplied reference image is a Pattern Guide (not a travel chart), so it
 * has been recreated as a self-contained SVG. The download action serializes
 * the same SVG to a high-resolution PNG in the browser.
 */
export function PatternGuide() {
  const svgMarkup = useMemo(() => buildPatternGuideSvg(), []);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDownload = async () => {
    setDownloading(true);
    setError(null);
    try {
      const svg = buildPatternGuideSvg();
      const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
      const objectUrl = URL.createObjectURL(blob);

      await new Promise<void>((resolve, reject) => {
        const image = new Image();
        image.onload = () => {
          try {
            const scale = 2;
            const canvas = document.createElement('canvas');
            canvas.width = W * scale;
            canvas.height = H * scale;
            const context = canvas.getContext('2d');
            if (!context) throw new Error('Canvas is not available.');
            context.scale(scale, scale);
            context.fillStyle = '#04080f';
            context.fillRect(0, 0, W, H);
            context.drawImage(image, 0, 0, W, H);
            canvas.toBlob((png) => {
              if (!png) {
                reject(new Error('Could not create PNG.'));
                return;
              }
              const url = URL.createObjectURL(png);
              const link = document.createElement('a');
              link.href = url;
              link.download = `roulette-computer-pattern-guide-${new Date()
                .toISOString()
                .slice(0, 10)}.png`;
              document.body.appendChild(link);
              link.click();
              link.remove();
              URL.revokeObjectURL(url);
              resolve();
            }, 'image/png');
          } catch (err) {
            reject(err);
          }
        };
        image.onerror = () => reject(new Error('Could not render the pattern guide.'));
        image.src = objectUrl;
      });

      URL.revokeObjectURL(objectUrl);
    } catch (err: any) {
      setError(err?.message || 'Image download failed.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 font-mono text-[10px] text-slate-400">
          <ImageIcon className="h-3.5 w-3.5 text-cyan-400" />
          Supplied reference layout · full pattern guide
        </div>
        <button
          type="button"
          onClick={handleDownload}
          disabled={downloading}
          className="flex items-center gap-1.5 rounded-lg border border-cyan-500/40 bg-cyan-500/15 px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-cyan-300 transition-colors hover:bg-cyan-500/25 disabled:opacity-50"
        >
          {downloading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Download className="h-3.5 w-3.5" />
          )}
          {downloading ? 'Preparing…' : 'Download Image'}
        </button>
      </div>

      <div
        className="w-full overflow-hidden rounded-xl border border-white/5 bg-[#020408] p-1 sm:p-2 [&>svg]:block [&>svg]:h-auto [&>svg]:w-full"
        dangerouslySetInnerHTML={{ __html: svgMarkup }}
      />

      {error && (
        <p className="mt-2 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 font-mono text-[10px] text-rose-300">
          {error}
        </p>
      )}

      <p className="mt-2 font-mono text-[10px] leading-relaxed text-slate-500">
        The old Travel Chart has been removed from this tab. The chart is
        downloadable as a 2× resolution PNG with the same labels and colors.
      </p>
    </div>
  );
}
