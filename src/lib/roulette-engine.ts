/**
 * Deterministic European roulette travel / dealer-signature mathematics.
 *
 * These routines mirror the reference tool exactly:
 *   RING order, jumpsOf, signature, backtest, WIN_MIN=25, BAND=7.
 *
 * The live API remains the primary source of truth. This module is used for
 * resilient fallbacks and for chart math when a field is missing from an API
 * response; it never invents numbers or random predictions.
 */

export const RING = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5,
  24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
] as const;

export const N = RING.length;
export const WIN_MIN = 25;
export const BAND = 7;

export const POS: Record<number, number> = {};
RING.forEach((n, i) => {
  POS[n] = i;
});

export const RED_NUMS = new Set([
  1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36
]);
export const BLACK_NUMS = new Set([
  2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35
]);

export type Direction = 'CW' | 'CCW';

export interface Jump {
  i: number;
  a: number;
  b: number;
  m: number;
  dir: -1 | 0 | 1;
}

export interface SignatureResult {
  ok: boolean;
  need?: number;
  j: number;
  D: 1 | -1;
  X: number;
  k: number;
  last: number;
  main: number;
  n9: number[];
  status: 'OVER' | 'UNDER' | 'EXACT';
  half: number | null;
  n4: number[] | null;
  win: number;
  mLast: number;
  vLast: number;
  line: number;
}

export interface BacktestRow {
  t: number;
  actual: number;
  main: number;
  win9: boolean;
  status: 'OVER' | 'UNDER' | 'EXACT';
  win4: boolean | null;
  n4: number[] | null;
}

export function at(pos: number): number {
  return RING[((pos % N) + N) % N];
}

export function dsp(n: number | null | undefined): string {
  if (n === null || n === undefined || Number.isNaN(Number(n))) return '--';
  return String(Math.trunc(Number(n)));
}

export function mag(a: number, b: number): number {
  const d = Math.abs(POS[a] - POS[b]);
  return Math.min(d, N - d);
}

export function dirOf(a: number, b: number): -1 | 0 | 1 {
  const d = (((POS[b] - POS[a]) % N) + N) % N;
  return d === 0 ? 0 : d <= 18 ? 1 : -1;
}

export function sector(center: number, k: number): number[] {
  const out: number[] = [];
  for (let i = -k; i <= k; i++) out.push(at(POS[center] + i));
  return out;
}

export function mean(values: number[]): number {
  return values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
}

export function r1(value: number): number {
  return Math.round(value * 10) / 10;
}

export function pct(value: number | null | undefined): string {
  return typeof value === 'number' && Number.isFinite(value)
    ? `${(value * 100).toFixed(1)}%`
    : '—';
}

export function directionValue(direction: Direction | string | number): 1 | -1 {
  if (
    direction === -1 ||
    direction === '-1' ||
    direction === 'CCW' ||
    direction === 'ccw'
  ) {
    return -1;
  }
  return 1;
}

export function normalizeDirection(value: unknown): Direction {
  if (value === -1 || value === '-1' || value === 1 || value === '1') {
    return Number(value) === -1 ? 'CCW' : 'CW';
  }
  return String(value ?? '').trim().toUpperCase() === 'CCW' ? 'CCW' : 'CW';
}

/** Convert a raw provider value into a valid European wheel number. */
export function toSpinNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  const num = Number(value);
  if (!Number.isFinite(num)) return null;
  const int = Math.trunc(num);
  return int >= 0 && int <= 36 ? int : null;
}

export function normalizeSpins(values: unknown): number[] {
  if (!Array.isArray(values)) return [];
  return values.map(toSpinNumber).filter((n): n is number => n !== null);
}

/** API spins arrive newest-first; the reference engine needs oldest-first. */
export function toOldestFirst(spinsNewestFirst: unknown): number[] {
  return [...normalizeSpins(spinsNewestFirst)].reverse();
}

export function jumpsOf(spinsOldestFirst: number[]): Jump[] {
  const out: Jump[] = [];
  for (let i = 1; i < spinsOldestFirst.length; i++) {
    const a = spinsOldestFirst[i - 1];
    const b = spinsOldestFirst[i];
    if (POS[a] === undefined || POS[b] === undefined) continue;
    out.push({
      i,
      a,
      b,
      m: mag(a, b),
      dir: dirOf(a, b)
    });
  }
  return out;
}

export function signature(
  spinsOldestFirst: number[],
  direction: Direction | string | number,
  win: number
): SignatureResult {
  const D = directionValue(direction);
  const empty: SignatureResult = {
    ok: false,
    need: WIN_MIN,
    j: 0,
    D,
    X: 0,
    k: 0,
    last: 0,
    main: 0,
    n9: [],
    status: 'EXACT',
    half: null,
    n4: null,
    win: 0,
    mLast: 0,
    vLast: 0,
    line: 0
  };

  if (!Array.isArray(spinsOldestFirst) || spinsOldestFirst.length < 2) {
    return empty;
  }

  const jumps = jumpsOf(spinsOldestFirst);
  if (jumps.length < WIN_MIN) {
    return { ...empty, need: WIN_MIN - jumps.length, j: jumps.length };
  }

  const windowJumps =
    win === 0 || win >= jumps.length ? jumps : jumps.slice(-win);
  const X = mean(windowJumps.map((j) => j.m));
  const k = Math.round(X);
  const last = spinsOldestFirst[spinsOldestFirst.length - 1];
  const main = at(POS[last] + D * k);
  const n9 = sector(main, 9);
  const mLast = jumps[jumps.length - 1].m;
  const vLast = D * mLast;
  const line = D * X;
  const status: SignatureResult['status'] =
    vLast > line ? 'OVER' : vLast < line ? 'UNDER' : 'EXACT';
  const shift = status === 'OVER' ? 5 : status === 'UNDER' ? -5 : 0;
  const half = shift ? at(POS[main] + shift) : null;
  const n4 = half === null ? null : sector(half, 4);

  return {
    ok: true,
    j: jumps.length,
    D,
    X,
    k,
    last,
    main,
    n9,
    status,
    half,
    n4,
    win: windowJumps.length,
    mLast,
    vLast,
    line
  };
}

/** Causal backtest: prediction for spin t only uses spins[0..t-1]. */
export function backtest(
  spinsOldestFirst: number[],
  direction: Direction | string | number,
  win: number
): BacktestRow[] {
  const rows: BacktestRow[] = [];
  for (let t = WIN_MIN + 1; t < spinsOldestFirst.length; t++) {
    const s = signature(spinsOldestFirst.slice(0, t), direction, win);
    if (!s.ok || s.n4 === null) continue;
    const actual = spinsOldestFirst[t];
    rows.push({
      t,
      actual,
      main: s.main,
      win9: s.n9.includes(actual),
      status: s.status,
      win4: s.n4.includes(actual),
      n4: s.n4
    });
  }
  return rows;
}

export function rhythmFlags(spinsOldestFirst: number[]): boolean[] {
  const jumps = jumpsOf(spinsOldestFirst);
  const out: boolean[] = [];
  for (let i = WIN_MIN; i < jumps.length; i++) {
    const X = mean(jumps.slice(i - WIN_MIN, i).map((j) => j.m));
    out.push(Math.abs(jumps[i].m - X) <= BAND);
  }
  return out;
}

export function getNumberColor(num: number): 'red' | 'black' | 'green' {
  if (num === 0) return 'green';
  return RED_NUMS.has(num) ? 'red' : 'black';
}

/** SVG donut segment used by the circular prediction wheel. */
export function arcPath(
  cx: number,
  cy: number,
  r1: number,
  r2: number,
  a1: number,
  a2: number
): string {
  const x1 = cx + Math.cos(a1) * r1;
  const y1 = cy + Math.sin(a1) * r1;
  const x2 = cx + Math.cos(a2) * r1;
  const y2 = cy + Math.sin(a2) * r1;
  const x3 = cx + Math.cos(a2) * r2;
  const y3 = cy + Math.sin(a2) * r2;
  const x4 = cx + Math.cos(a1) * r2;
  const y4 = cy + Math.sin(a1) * r2;
  return `M${x1} ${y1} A${r1} ${r1} 0 0 1 ${x2} ${y2} L${x3} ${y3} A${r2} ${r2} 0 0 0 ${x4} ${y4} Z`;
}

/**
 * Provider envelopes may be nested by an older proxy version. This unwraps
 * either shape without assuming a single response format.
 */
export function unwrapPayload<T = any>(raw: any): T | null {
  if (!raw || typeof raw !== 'object') return null;
  if (raw.success === false) return null;
  if (raw.data && typeof raw.data === 'object') {
    // Some responses wrap the analysis payload one more time.
    if (raw.data.data && typeof raw.data.data === 'object' && !('prediction' in raw.data)) {
      return raw.data.data as T;
    }
    return raw.data as T;
  }
  return raw as T;
}

export function extractApiError(raw: any): { code?: string; message: string } | null {
  if (!raw) return null;
  if (raw.error) {
    return {
      code: raw.error.code,
      message: raw.error.message || 'Provider API request failed'
    };
  }
  if (raw.success === false) {
    return {
      code: raw.code,
      message: raw.message || 'Provider API request failed'
    };
  }
  return null;
}

export interface NormalizedPrediction {
  ready: boolean;
  direction: Direction;
  main: number | null;
  n9: number[];
  topOver: number[];
  topUnder: number[];
  overCenter: number | null;
  underCenter: number | null;
  status: 'OVER' | 'UNDER' | 'NEUTRAL';
  lastSpin: number | null;
  lastTravel: number | null;
  signedLastTravel: number | null;
  signedMean: number | null;
  travelAverage: number | null;
  k: number | null;
  windowSize: number | null;
  spinsNeeded?: number;
  jumpsAvailable?: number;
  raw: any;
}

/** Normalize the API prediction block, keeping only valid wheel numbers. */
export function normalizePrediction(payload: any): NormalizedPrediction {
  const raw = payload?.prediction || payload || {};
  const direction = normalizeDirection(raw.direction ?? payload?.direction);
  const main = toSpinNumber(raw.main);
  const n9 = normalizeSpins(raw.n9);
  const topOver = normalizeSpins(raw.top_over);
  const topUnder = normalizeSpins(raw.top_under);
  const overCenter =
    toSpinNumber(raw.over_center) ?? (topOver.length ? topOver[Math.floor(topOver.length / 2)] : null);
  const underCenter =
    toSpinNumber(raw.under_center) ?? (topUnder.length ? topUnder[Math.floor(topUnder.length / 2)] : null);

  return {
    ready: raw.ready !== false && main !== null,
    direction,
    main,
    n9,
    topOver,
    topUnder,
    overCenter,
    underCenter,
    status:
      typeof raw.status === 'string' && raw.status.toUpperCase() === 'OVER'
        ? 'OVER'
        : typeof raw.status === 'string' && raw.status.toUpperCase() === 'UNDER'
          ? 'UNDER'
          : 'NEUTRAL',
    lastSpin: toSpinNumber(raw.last_spin) ?? toSpinNumber(payload?.last_spin),
    lastTravel:
      typeof raw.last_travel === 'number' ? raw.last_travel : null,
    signedLastTravel:
      typeof raw.signed_last_travel === 'number' ? raw.signed_last_travel : null,
    signedMean:
      typeof raw.signed_mean === 'number' ? raw.signed_mean : null,
    travelAverage:
      typeof raw.travel_average === 'number'
        ? raw.travel_average
        : typeof raw.signed_mean === 'number'
          ? Math.abs(raw.signed_mean)
          : null,
    k: typeof raw.k === 'number' ? raw.k : null,
    windowSize: typeof raw.window_size === 'number' ? raw.window_size : null,
    spinsNeeded: typeof raw.spins_needed === 'number' ? raw.spins_needed : undefined,
    jumpsAvailable:
      typeof raw.jumps_available === 'number' ? raw.jumps_available : undefined,
    raw
  };
}

export interface NormalizedTravelPoint {
  i: number;
  from: number | null;
  to: number | null;
  magnitude: number;
  signed: number;
  rollingMean: number;
  directionChanged: boolean;
  big: boolean;
}

export function normalizeTravelPoints(points: any): NormalizedTravelPoint[] {
  if (!Array.isArray(points)) return [];
  return points
    .map((p: any, index: number) => {
      const magnitude =
        typeof p?.magnitude === 'number' ? Math.abs(p.magnitude) : 0;
      const signed =
        typeof p?.signed === 'number' ? p.signed : magnitude;
      return {
        i: typeof p?.i === 'number' ? p.i : index,
        from: toSpinNumber(p?.from),
        to: toSpinNumber(p?.to),
        magnitude,
        signed,
        rollingMean:
          typeof p?.rolling_mean === 'number' ? p.rolling_mean : 0,
        directionChanged: !!p?.direction_changed,
        big: !!p?.big
      };
    })
    .filter((p: NormalizedTravelPoint) => p.magnitude >= 0);
}

export interface NormalizedWlRow {
  index: number;
  actual: number | null;
  main: number | null;
  n9: 'W' | 'L' | null;
  n4: 'W' | 'L' | null;
  status: 'OVER' | 'UNDER' | 'NEUTRAL';
}

export function normalizeWlRows(rows: any): NormalizedWlRow[] {
  if (!Array.isArray(rows)) return [];
  return rows.map((row: any, i: number) => {
    const n9Raw = typeof row?.n9 === 'string' ? row.n9.toUpperCase() : row?.n9;
    const n4Raw = typeof row?.n4 === 'string' ? row.n4.toUpperCase() : row?.n4;
    const statusRaw = typeof row?.status === 'string' ? row.status.toUpperCase() : row?.status;
    return {
      index: typeof row?.index === 'number' ? row.index : i,
      actual: toSpinNumber(row?.actual),
      main: toSpinNumber(row?.main),
      n9: n9Raw === 'W' || n9Raw === 'L' ? n9Raw : null,
      n4:
        n4Raw === 'W' || n4Raw === true
          ? 'W'
          : n4Raw === 'L' || n4Raw === false
            ? 'L'
            : null,
      status:
        statusRaw === 'OVER' || statusRaw === 'UNDER' ? statusRaw : 'NEUTRAL'
    };
  });
}

export interface TravelLine {
  signedAverage: number;
  travelAverage: number;
  band: number;
  upper: number;
  lower: number;
}

export interface TravelSummary {
  predictions: number;
  n9Wins: number;
  n9Accuracy: number | null;
  n4Predictions: number;
  n4Wins: number;
  n4Accuracy: number | null;
  directionChanges: number;
  bigJumps: number;
}

export interface NormalizedTravelChart {
  ready: boolean;
  direction: Direction;
  window: number;
  spins: number;
  jumps: number;
  pointCount: number;
  axis: { min: number; max: number; grid: number[] };
  line: TravelLine;
  points: NormalizedTravelPoint[];
  wlRows: NormalizedWlRow[];
  wlLast10: Array<'W' | 'L' | null>;
  wlLast10N4: Array<'W' | 'L' | null>;
  summary: TravelSummary;
  spinsNeeded?: number;
  jumpsAvailable?: number;
  message?: string;
  raw: any;
}

function normalizeLast10(values: any): Array<'W' | 'L' | null> {
  if (!Array.isArray(values)) return [];
  return values.map((v) => (v === 'W' || v === 'L' ? v : null));
}

function buildTravelSummary(
  points: NormalizedTravelPoint[],
  rows: NormalizedWlRow[],
  line: TravelLine,
  payload: any
): TravelSummary {
  const n9Rows = rows.filter((r) => r.n9 !== null);
  const n4Rows = rows.filter((r) => r.n4 !== null);
  const n9Wins = n9Rows.filter((r) => r.n9 === 'W').length;
  const n4Wins = n4Rows.filter((r) => r.n4 === 'W').length;
  const raw = payload?.summary || {};

  return {
    predictions:
      typeof raw.predictions === 'number' ? raw.predictions : n9Rows.length,
    n9Wins: typeof raw.n9_wins === 'number' ? raw.n9_wins : n9Wins,
    n9Accuracy:
      typeof raw.n9_accuracy === 'number'
        ? raw.n9_accuracy
        : n9Rows.length
          ? n9Wins / n9Rows.length
          : null,
    n4Predictions:
      typeof raw.n4_predictions === 'number' ? raw.n4_predictions : n4Rows.length,
    n4Wins: typeof raw.n4_wins === 'number' ? raw.n4_wins : n4Wins,
    n4Accuracy:
      typeof raw.n4_accuracy === 'number'
        ? raw.n4_accuracy
        : n4Rows.length
          ? n4Wins / n4Rows.length
          : null,
    directionChanges:
      typeof raw.direction_changes === 'number'
        ? raw.direction_changes
        : points.filter((p) => p.directionChanged).length,
    bigJumps:
      typeof raw.big_jumps === 'number'
        ? raw.big_jumps
        : points.filter((p) => p.big).length
  };
}

export function normalizeTravelChart(payload: any, fallbackDirection: Direction = 'CW'): NormalizedTravelChart | null {
  if (!payload || typeof payload !== 'object') return null;
  const raw = payload.travel_chart || payload;
  const direction = normalizeDirection(raw.direction ?? fallbackDirection);
  const points = normalizeTravelPoints(raw.points);
  const wlRows = normalizeWlRows(raw.wl?.rows);
  const signedAverage =
    typeof raw.line?.signed_average === 'number'
      ? raw.line.signed_average
      : directionValue(direction) *
        (typeof raw.line?.travel_average === 'number'
          ? raw.line.travel_average
          : mean(points.map((p) => p.magnitude)));
  const travelAverage =
    typeof raw.line?.travel_average === 'number'
      ? raw.line.travel_average
      : Math.abs(signedAverage);
  const band = typeof raw.line?.band === 'number' ? raw.line.band : BAND;
  const line: TravelLine = {
    signedAverage,
    travelAverage,
    band,
    upper:
      typeof raw.line?.upper === 'number'
        ? raw.line.upper
        : signedAverage + band,
    lower:
      typeof raw.line?.lower === 'number'
        ? raw.line.lower
        : signedAverage - band
  };

  const axisMin = typeof raw.axis?.min === 'number' ? raw.axis.min : -18;
  const axisMax = typeof raw.axis?.max === 'number' ? raw.axis.max : 18;
  const axisGrid = Array.isArray(raw.axis?.grid)
    ? raw.axis.grid.filter((v: any) => typeof v === 'number')
    : [-18, -12, -6, 0, 6, 12, 18];

  return {
    ready: raw.ready !== false && points.length > 0,
    direction,
    window: typeof raw.window === 'number' ? raw.window : 25,
    spins: typeof raw.spins === 'number' ? raw.spins : 0,
    jumps: typeof raw.jumps === 'number' ? raw.jumps : points.length,
    pointCount:
      typeof raw.point_count === 'number' ? raw.point_count : points.length,
    axis: { min: axisMin, max: axisMax, grid: axisGrid },
    line,
    points,
    wlRows,
    wlLast10: normalizeLast10(raw.wl?.last_10),
    wlLast10N4: normalizeLast10(raw.wl?.last_10_n4),
    summary: buildTravelSummary(points, wlRows, line, raw),
    spinsNeeded:
      typeof raw.spins_needed === 'number' ? raw.spins_needed : undefined,
    jumpsAvailable:
      typeof raw.jumps_available === 'number' ? raw.jumps_available : undefined,
    message: typeof raw.message === 'string' ? raw.message : undefined,
    raw
  };
}

/**
 * Exact local reconstruction of the provider travel chart from a spin list.
 * Used only when the corresponding API block is unavailable — never to invent
 * data that was not derived from real received spins.
 */
export function computeTravelChart(
  spinsNewestFirst: number[],
  direction: Direction,
  window: number
): NormalizedTravelChart | null {
  const spins = toOldestFirst(spinsNewestFirst);
  if (spins.length < 2) return null;
  const D = directionValue(direction);
  const jumps = jumpsOf(spins);
  const sig = signature(spins, direction, window);
  const X = sig.ok ? sig.X : mean(
    (window === 0 ? jumps : jumps.slice(-window)).map((j) => j.m)
  );
  const avg = X;
  const line: TravelLine = {
    signedAverage: D * avg,
    travelAverage: avg,
    band: BAND,
    upper: D * avg + BAND,
    lower: D * avg - BAND
  };

  const allPoints: NormalizedTravelPoint[] = jumps.map((jump, index) => {
    const windowStart = Math.max(0, index - WIN_MIN);
    const prior = jumps.slice(windowStart, index);
    const rollingMean = prior.length ? mean(prior.map((j) => j.m)) : 0;
    return {
      i: index,
      from: jump.a,
      to: jump.b,
      magnitude: jump.m,
      signed: D * jump.m,
      rollingMean,
      directionChanged:
        index > 0 && jump.dir !== 0 && jumps[index - 1].dir !== 0 && jump.dir !== jumps[index - 1].dir,
      big: prior.length >= WIN_MIN && Math.abs(jump.m - rollingMean) > BAND
    };
  });

  const points = allPoints.slice(-60);
  const rows: NormalizedWlRow[] = backtest(spins, direction, window)
    .slice(-40)
    .map((row) => ({
      index: row.t,
      actual: row.actual,
      main: row.main,
      n9: row.win9 ? 'W' : 'L',
      n4: row.win4 === null ? null : row.win4 ? 'W' : 'L',
      status: row.status === 'EXACT' ? 'NEUTRAL' : row.status
    }));

  const last10 = [...rows].slice(-10).reverse();
  const summary = buildTravelSummary(points, rows, line, null);

  return {
    ready: jumps.length >= WIN_MIN,
    direction,
    window,
    spins: spins.length,
    jumps: jumps.length,
    pointCount: points.length,
    axis: { min: -18, max: 18, grid: [-18, -12, -6, 0, 6, 12, 18] },
    line,
    points,
    wlRows: rows,
    wlLast10: last10.map((r) => r.n9),
    wlLast10N4: last10.map((r) => r.n4),
    summary,
    spinsNeeded: jumps.length < WIN_MIN ? WIN_MIN - jumps.length + 1 : undefined,
    jumpsAvailable: jumps.length,
    raw: null
  };
}
