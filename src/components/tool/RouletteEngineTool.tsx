'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  Activity,
  AlertTriangle,
  ArrowRightLeft,
  ChevronDown,
  Info,
  Layers,
  Radio,
  RefreshCw,
  Settings2,
  ShieldCheck,
  Sparkles,
  Zap
} from 'lucide-react';
import { authClient } from '../../lib/auth-client';
import { useAuth } from '../../context/AuthContext';
import { useToolWidget } from '../../context/ToolWidgetContext';
import {
  Direction,
  NormalizedPrediction,
  NormalizedTravelChart,
  dsp,
  getNumberColor,
  normalizeDirection,
  normalizePrediction,
  normalizeSpins,
  normalizeTravelChart,
  pct,
  r1,
  unwrapPayload
} from '../../lib/roulette-engine';
import { PredictionWheel } from './PredictionWheel';
import { TravelChart } from './TravelChart';
import { LiveGraphChart } from './LiveGraphChart';
import { RacetrackOval } from './RacetrackOval';

export interface RouletteEngineToolProps {
  compact?: boolean;
}

type ViewMode = 'racetrack' | 'wheel' | 'livegraph' | 'travel';
type ToolStatus = 'idle' | 'loading' | 'live' | 'stale' | 'error' | 'unconfigured' | 'auth';

interface DsTableRow {
  id: string;
  name?: string;
  provider?: string;
  dealer?: string;
  spins?: number[];
  spin_count?: number;
  ready?: boolean;
  accuracy_cw?: number;
  accuracy_ccw?: number;
  best_accuracy?: number;
  best_direction?: string;
  wl_last_10?: string[];
  pattern?: any;
  updated_at?: string;
}

interface ApiErrorShape {
  code?: string;
  message: string;
  status?: number;
}

// 6s keeps the dashboard responsive while staying friendly to the provider's
// default 60 requests/minute per-key quota (the backend also dedupes/caches).
const POLL_MS = 6000;
const TABLE_POLL_MS = 45000;

function friendlyError(err: any): ApiErrorShape {
  const code = err?.code || err?.details?.code;
  const status = err?.status;
  const rawMessage = err?.message || 'The API request failed.';

  const messages: Record<string, string> = {
    DS_NOT_CONFIGURED:
      'The Dealer Signature API is not configured. Ask an administrator to save the Public API URL and Server SK Key in Admin → Settings → API Settings.',
    DS_INVALID_CONFIG:
      'The saved API URL or API key is invalid. Update it in Admin → Settings → API Settings.',
    DS_AUTH_FAILED:
      'The provider rejected the API key or its permissions. Check the Server SK Key and endpoint permissions.',
    INVALID_API_KEY: 'The provider rejected the Server SK Key. Save a valid key in API Settings.',
    SIGNATURE_REQUIRED:
      'The provider requires signed server requests. The configured key must be a Server SK Key (sk_live_...), not a browser key.',
    INVALID_SIGNATURE:
      'The provider rejected the request signature. Check the Server SK Key and server clock.',
    ENDPOINT_NOT_ALLOWED:
      'This API key does not have the tables.prediction permission. Enable it in the provider admin panel.',
    ORIGIN_REQUIRED:
      'The provider requires an allowed origin. Use a Server SK Key from the backend proxy.',
    ORIGIN_NOT_ALLOWED:
      'The provider rejected the server origin. Check the key domain mode or provider settings.',
    RATE_LIMITED:
      'The provider rate limit was reached. Automatic polling is paused briefly and then retried; the last valid data is kept.',
    DS_RATE_LIMITED:
      'The provider rate limit was reached. Automatic polling is paused briefly and then retried; the last valid data is kept.',
    FEED_UNAVAILABLE:
      'The provider live feed is unavailable or stale. Existing data is kept until the feed recovers.',
    DS_FEED_UNAVAILABLE:
      'The provider live feed is unavailable or stale. Existing data is kept until the feed recovers.',
    TABLE_NOT_FOUND:
      'The selected table is no longer available. Choose another live table.',
    VALIDATION_FAILED:
      'The provider rejected the request parameters. The dashboard will retry with the current table and window.',
    UNPROCESSABLE:
      'The provider could not analyse the current spin sequence yet.',
    MAINTENANCE_MODE:
      'The provider API is in maintenance mode. Existing data is kept while the dashboard retries.',
    API_DISABLED:
      'The provider API is temporarily disabled.',
    IP_NOT_ALLOWED:
      'The provider API rejected the backend server IP. Add the server IP to the key allowlist.',
    ACCOUNT_INACTIVE:
      'The provider account or API key is suspended, expired, or inactive.',
    DS_UPSTREAM_ERROR:
      'The provider returned an unexpected server error. A bounded retry was attempted.',
    DS_PROXY_ERROR:
      'The backend proxy could not complete the provider request.',
    DS_API_TIMEOUT:
      'The provider API timed out. A bounded retry was attempted; the next poll will try again.',
    DS_NETWORK_ERROR:
      'The backend could not reach the provider API. Check the API URL and server network access.',
    DS_INVALID_RESPONSE:
      'The provider returned an invalid response. No data was rendered from that response.',
    SUBSCRIPTION_REQUIRED:
      'An active subscription is required to access the private prediction engine.',
    SUBSCRIPTION_EXPIRED:
      'Your subscription has expired. Renew it to restore live predictions.',
    UNAUTHORIZED:
      'Your session has expired. Please sign in again.',
    CLIENT_TIMEOUT: 'The request timed out. The previous valid data is still displayed.'
  };

  return {
    code,
    status,
    message: messages[code] || rawMessage
  };
}

function deriveSpins(
  table: DsTableRow | undefined,
  travel: NormalizedTravelChart | null,
  prediction: NormalizedPrediction | null
): number[] {
  const fromTable = normalizeSpins(table?.spins);
  if (fromTable.length > 0) return fromTable;

  if (travel && travel.points.length > 0) {
    const fromPoints = [...travel.points]
      .reverse()
      .map((point) => point.to)
      .filter((n): n is number => n !== null);
    if (fromPoints.length > 0) {
      if (prediction?.lastSpin !== null && prediction?.lastSpin !== undefined && fromPoints[0] !== prediction.lastSpin) {
        fromPoints.unshift(prediction.lastSpin);
      }
      return fromPoints;
    }
  }

  if (prediction?.lastSpin !== null && prediction?.lastSpin !== undefined) {
    return [prediction.lastSpin];
  }
  return [];
}

export function RouletteEngineTool({ compact = false }: RouletteEngineToolProps) {
  const { user, isLoading: authLoading } = useAuth();
  const { updatePredictionData } = useToolWidget();
  const isAdmin = user?.role === 'SUPER_ADMIN';

  const [tables, setTables] = useState<DsTableRow[]>([]);
  const [currentTableId, setCurrentTableId] = useState('');
  const [currentDirection, setCurrentDirection] = useState<Direction>('CW');
  const [currentWindow, setCurrentWindow] = useState(25);
  const [neighborCount, setNeighborCount] = useState(4);
  const [activeView, setActiveView] = useState<ViewMode>('racetrack');

  const [rawAnalysis, setRawAnalysis] = useState<any>(null);
  const [prediction, setPrediction] = useState<NormalizedPrediction | null>(null);
  const [travel, setTravel] = useState<NormalizedTravelChart | null>(null);

  const [isConfigured, setIsConfigured] = useState<boolean | null>(null);
  const [feedInfo, setFeedInfo] = useState<any>(null);
  const [toolStatus, setToolStatus] = useState<ToolStatus>('loading');
  const [statusMessage, setStatusMessage] = useState('CONNECTING…');
  const [errorInfo, setErrorInfo] = useState<ApiErrorShape | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  const [showRawOutput, setShowRawOutput] = useState(false);

  const mountedRef = useRef(true);
  const fetchSeqRef = useRef(0);
  const inflightKeysRef = useRef<Set<string>>(new Set());
  const hasDataRef = useRef(false);
  const rateLimitedUntilRef = useRef(0);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      fetchSeqRef.current += 1;
    };
  }, []);

  const currentTable = useMemo(
    () => tables.find((table) => table.id === currentTableId),
    [tables, currentTableId]
  );

  /* ----------------------------------------------------------------------
   * Configuration + table list
   * -------------------------------------------------------------------- */
  const checkConfiguration = useCallback(async (): Promise<boolean> => {
    try {
      const config = await authClient.getDsConfig();
      const configured = !!config?.configured;
      setIsConfigured(configured);
      if (!configured) {
        setToolStatus('unconfigured');
        setStatusMessage('API NOT CONFIGURED');
      }
      return configured;
    } catch {
      // Do not block the table request: it will surface a more useful error.
      setIsConfigured(null);
      return true;
    }
  }, []);

  const loadTables = useCallback(async () => {
    try {
      const raw = await authClient.getDsTables({ limit: 200, sort: 'active' });
      if (!mountedRef.current) return;
      const payload = unwrapPayload<any>(raw);
      if (!payload || !Array.isArray(payload.tables)) {
        throw Object.assign(new Error('The provider response did not contain a valid tables array.'), {
          code: 'DS_INVALID_RESPONSE'
        });
      }

      const rows = payload.tables as DsTableRow[];
      setTables(rows);
      setFeedInfo(payload.feed || null);
      setIsConfigured(true);

      if (rows.length === 0) {
        setToolStatus('live');
        setStatusMessage('NO LIVE TABLES');
      } else {
        setCurrentTableId((previous) =>
          previous && rows.some((row) => row.id === previous) ? previous : rows[0].id
        );
      }
    } catch (err: any) {
      if (!mountedRef.current) return;
      const friendly = friendlyError(err);
      setErrorInfo(friendly);
      if (friendly.code === 'DS_NOT_CONFIGURED' || friendly.code === 'DS_INVALID_CONFIG') {
        setIsConfigured(false);
        setToolStatus('unconfigured');
        setStatusMessage('API NOT CONFIGURED');
      } else if (friendly.status === 401 || friendly.status === 403) {
        setToolStatus('auth');
        setStatusMessage('ACCESS DENIED');
      } else if (hasDataRef.current || tables.length > 0) {
        setToolStatus('stale');
        setStatusMessage('STALE — RETRYING');
      } else {
        setToolStatus('error');
        setStatusMessage('API ERROR');
      }
    }
  }, [tables.length]);

  /* ----------------------------------------------------------------------
   * Active table prediction (single request; travel chart is embedded)
   * -------------------------------------------------------------------- */
  const fetchActiveTable = useCallback(
    async (force = false) => {
      if (!currentTableId) return;
      if (document.visibilityState === 'hidden') return;
      if (!force && Date.now() < rateLimitedUntilRef.current) return;

      const requestKey = `${currentTableId}|${currentDirection}|${currentWindow}`;
      if (!force && inflightKeysRef.current.has(requestKey)) return;

      const sequence = ++fetchSeqRef.current;
      inflightKeysRef.current.add(requestKey);
      setIsLoading(true);

      try {
        const raw = await authClient.getDsTablePrediction(
          currentTableId,
          currentDirection,
          currentWindow
        );
        if (!mountedRef.current || sequence !== fetchSeqRef.current) return;

        const payload = unwrapPayload<any>(raw);
        if (!payload || (!payload.prediction && !payload.ready)) {
          throw Object.assign(new Error('The provider response did not contain a prediction payload.'), {
            code: 'DS_INVALID_RESPONSE'
          });
        }

        const returnedDirection = normalizeDirection(payload.direction);
        // Ignore a response that belongs to an older direction/window selection.
        if (
          payload.direction !== undefined &&
          returnedDirection !== currentDirection
        ) {
          return;
        }

        const normalizedPrediction = normalizePrediction(payload);
        const hasTravelBlock =
          !!payload.travel_chart || Array.isArray(payload.points);
        const normalizedTravel = hasTravelBlock
          ? normalizeTravelChart(payload.travel_chart || payload, currentDirection)
          : null;

        setRawAnalysis(payload);
        setPrediction(normalizedPrediction);
        // If the API omits travel points, the chart components will rebuild a
        // fallback from the received table spins. Do not pass an empty chart
        // object that would suppress that deterministic fallback.
        setTravel(normalizedTravel && normalizedTravel.points.length > 0 ? normalizedTravel : null);
        setErrorInfo(null);
        setFeedInfo((previous: any) => payload.feed || previous);
        setIsConfigured(true);
        setToolStatus('live');
        setStatusMessage(
          normalizedPrediction.ready
            ? `LIVE · ${returnedDirection}`
            : `BUILDING · ${normalizedPrediction.spinsNeeded ?? 0} MORE SPINS`
        );
        setLastUpdated(
          new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
          })
        );
        hasDataRef.current = true;
        rateLimitedUntilRef.current = 0;

        updatePredictionData({
          tableName: payload.table_name || 'Live Roulette',
          provider: payload.provider,
          lastNumbers: normalizedPrediction.lastSpin !== null ? [normalizedPrediction.lastSpin] : [],
          predictedPocket:
            normalizedPrediction.main !== null ? dsp(normalizedPrediction.main) : undefined,
          confidence: undefined
        });
      } catch (err: any) {
        if (!mountedRef.current || sequence !== fetchSeqRef.current) return;
        const friendly = friendlyError(err);
        setErrorInfo(friendly);

        if (friendly.code === 'RATE_LIMITED' || friendly.code === 'DS_RATE_LIMITED') {
          // Bounded backoff: wait 15s before the next upstream attempt. The
          // previous valid prediction remains on screen.
          rateLimitedUntilRef.current = Date.now() + 15000;
        }

        if (friendly.code === 'DS_NOT_CONFIGURED' || friendly.code === 'DS_INVALID_CONFIG') {
          setIsConfigured(false);
          setToolStatus('unconfigured');
          setStatusMessage('API NOT CONFIGURED');
        } else if (friendly.status === 401 || friendly.status === 403) {
          setToolStatus('auth');
          setStatusMessage('ACCESS DENIED');
        } else if (hasDataRef.current) {
          // Keep the last valid prediction on screen. Never blank a working
          // chart because a single poll failed.
          setToolStatus('stale');
          setStatusMessage('STALE — SHOWING LAST VALID DATA');
        } else {
          setToolStatus('error');
          setStatusMessage('API ERROR');
        }
      } finally {
        inflightKeysRef.current.delete(requestKey);
        if (mountedRef.current && sequence === fetchSeqRef.current) {
          setIsLoading(false);
          setIsSwitching(false);
        }
      }
    },
    [currentTableId, currentDirection, currentWindow, updatePredictionData]
  );

  /* Initial configuration + first table load */
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setToolStatus('auth');
      setStatusMessage('SIGN IN REQUIRED');
      return;
    }

    let cancelled = false;
    (async () => {
      const ok = await checkConfiguration();
      if (cancelled) return;
      if (ok) await loadTables();
    })();
    return () => {
      cancelled = true;
    };
    // Re-run when authentication resolves; the API is never polled anonymously.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user?.id]);

  /* Active table polling: exactly one interval, cleaned up on unmount. */
  useEffect(() => {
    if (!currentTableId || !user || authLoading) return;

    void fetchActiveTable(true);
    const timer = setInterval(() => {
      void fetchActiveTable(false);
    }, POLL_MS);

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void fetchActiveTable(false);
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [currentTableId, currentDirection, currentWindow, fetchActiveTable]);

  /* Table metadata (spins/accuracy) refresh without doubling prediction calls. */
  useEffect(() => {
    if (!currentTableId || isConfigured === false || !user || authLoading) return;
    const timer = setInterval(() => {
      if (document.visibilityState !== 'hidden') void loadTables();
    }, TABLE_POLL_MS);
    return () => clearInterval(timer);
  }, [currentTableId, isConfigured, user, authLoading, loadTables]);

  /* Manual refresh */
  const handleRefresh = useCallback(() => {
    void loadTables();
    void fetchActiveTable(true);
  }, [loadTables, fetchActiveTable]);

  const handleToggleDirection = () => {
    const next: Direction = currentDirection === 'CW' ? 'CCW' : 'CW';
    // Invalidate any in-flight response immediately so a late CW result can
    // never overwrite the new CCW selection.
    fetchSeqRef.current += 1;
    setCurrentDirection(next);
    setIsSwitching(true);
    setStatusMessage(`RECALCULATING ${next}…`);
    // Remove direction-specific output immediately; the new request is the
    // single source of truth. No page reload and no frozen controls.
    setPrediction(null);
    setTravel(null);
    setRawAnalysis(null);
  };

  const handleAdjustWindow = (delta: number) => {
    fetchSeqRef.current += 1;
    setCurrentWindow((previous) => Math.max(10, Math.min(100, previous + delta)));
    setIsSwitching(true);
    setStatusMessage('RECALCULATING WINDOW…');
    setPrediction(null);
    setTravel(null);
    setRawAnalysis(null);
  };

  const handleTableChange = (tableId: string) => {
    fetchSeqRef.current += 1;
    setCurrentTableId(tableId);
    setPrediction(null);
    setTravel(null);
    setRawAnalysis(null);
    setIsSwitching(true);
    setStatusMessage('CONNECTING TO TABLE…');
  };

  /* ----------------------------------------------------------------------
   * Derived display values
   * -------------------------------------------------------------------- */
  const statistics = rawAnalysis?.statistics || {};
  const pattern = rawAnalysis?.pattern || rawAnalysis?.structures?.selected || {};
  const fallbackTravel = travel;
  const spinsNewestFirst = deriveSpins(currentTable, travel, prediction);
  const spinsForFallback = useMemo(() => spinsNewestFirst, [spinsNewestFirst]);

  const wlOldest: string[] = useMemo(() => {
    const wlChart = rawAnalysis?.wl_chart || rawAnalysis?.backtest?.wl_chart || {};
    if (Array.isArray(wlChart?.oldest_first)) {
      return wlChart.oldest_first.filter((v: any) => v === 'W' || v === 'L');
    }
    if (Array.isArray(wlChart?.n9)) {
      return [...wlChart.n9]
        .reverse()
        .filter((v: any) => v === 'W' || v === 'L');
    }
    if (fallbackTravel?.wlRows?.length) {
      return fallbackTravel.wlRows
        .map((row) => row.n9)
        .filter((v): v is 'W' | 'L' => v === 'W' || v === 'L');
    }
    return [];
  }, [rawAnalysis, fallbackTravel]);

  const last10 = wlOldest.slice(-10);
  const wCount = last10.filter((value) => value === 'W').length;
  const lCount = last10.filter((value) => value === 'L').length;

  const n9Accuracy =
    typeof statistics.n9_accuracy === 'number'
      ? statistics.n9_accuracy
      : fallbackTravel?.summary.n9Accuracy ?? null;
  const n4Accuracy =
    typeof statistics.n4_accuracy === 'number'
      ? statistics.n4_accuracy
      : fallbackTravel?.summary.n4Accuracy ?? null;
  const n9Predictions = statistics.predictions ?? fallbackTravel?.summary.predictions ?? 0;
  const n4Predictions = statistics.n4_predictions ?? fallbackTravel?.summary.n4Predictions ?? 0;

  const p = prediction;
  const ready = !!p?.ready;
  const topOver = p?.overCenter ?? null;
  const topUnder = p?.underCenter ?? null;

  const statusClass =
    toolStatus === 'live'
      ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
      : toolStatus === 'stale'
        ? 'border-amber-500/40 bg-amber-500/10 text-amber-400'
        : toolStatus === 'unconfigured'
          ? 'border-amber-500/40 bg-amber-500/10 text-amber-300'
          : toolStatus === 'auth'
            ? 'border-rose-500/40 bg-rose-500/10 text-rose-400'
            : toolStatus === 'error'
              ? 'border-rose-500/40 bg-rose-500/10 text-rose-400'
              : 'border-slate-500/40 bg-slate-500/10 text-slate-300';

  if (authLoading) {
    return (
      <div className={`flex min-h-[240px] flex-col items-center justify-center gap-3 text-slate-300 ${compact ? 'p-4' : 'p-8'}`}>
        <RefreshCw className="h-5 w-5 animate-spin text-amber-400" />
        <span className="font-mono text-xs uppercase tracking-widest">Checking secure session…</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={`flex min-h-[260px] flex-col items-center justify-center gap-4 rounded-2xl border border-amber-500/30 bg-[#090e18] text-center ${compact ? 'p-5' : 'p-8'}`}>
        <ShieldCheck className="h-8 w-8 text-amber-400" />
        <div>
          <h3 className="font-display text-sm font-black uppercase tracking-wider text-white">
            Sign in to access live predictions
          </h3>
          <p className="mx-auto mt-2 max-w-md font-body text-xs leading-relaxed text-slate-400">
            The prediction engine requires an authenticated session and an active
            subscription. API credentials and live table data are never exposed
            to anonymous visitors.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Link
            href="/golin?redirect=/dashboard/tool"
            className="rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2 font-display text-xs font-black uppercase tracking-wider text-black"
          >
            Sign In
          </Link>
          <Link
            href="/plans"
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 font-display text-xs font-bold uppercase tracking-wider text-slate-300 hover:bg-white/10"
          >
            View Plans
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex w-full flex-col gap-3 font-sans text-slate-100 ${compact ? 'p-2 text-xs' : 'p-3 sm:p-5'}`}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[#090e18]/90 p-3 backdrop-blur-xl">
        <div className="flex min-w-0 flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 font-display text-sm font-black uppercase tracking-wider text-white">
            <Radio className="h-4 w-4 text-amber-400" />
            <span>
              ROULETTE<span className="text-amber-400">.TOOLS</span>
            </span>
          </div>

          <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase ${statusClass}`}>
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                toolStatus === 'live'
                  ? 'animate-pulse bg-emerald-400'
                  : toolStatus === 'loading' || isLoading
                    ? 'animate-pulse bg-sky-400'
                    : 'bg-current'
              }`}
            />
            {statusMessage}
          </span>

          <span className="hidden font-mono text-[10px] text-slate-500 sm:inline">
            {lastUpdated ? `Updated ${lastUpdated}` : 'Waiting for first response'}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={currentTableId}
            onChange={(event) => handleTableChange(event.target.value)}
            className="min-w-[180px] rounded-xl border border-white/10 bg-slate-900/90 px-3 py-1.5 text-xs font-semibold text-white focus:border-amber-500 focus:outline-none"
            aria-label="Select live roulette table"
          >
            {tables.length === 0 ? (
              <option value="">{isConfigured === false ? 'API not configured' : 'Loading live tables…'}</option>
            ) : (
              tables.map((table) => (
                <option key={table.id} value={table.id}>
                  {table.name || table.id}
                  {table.dealer ? ` (${table.dealer})` : ''} —{' '}
                  {table.spin_count ?? table.spins?.length ?? 0} spins
                </option>
              ))
            )}
          </select>

          <div className="inline-flex gap-1 rounded-xl border border-white/10 bg-black/40 p-1">
            {(
              [
                ['racetrack', '⬭ Racetrack'],
                ['wheel', '◯ Wheel'],
                ['livegraph', '📈 Live Graph'],
                ['travel', '📊 Travel']
              ] as Array<[ViewMode, string]>
            ).map(([mode, label]) => (
              <button
                key={mode}
                type="button"
                onClick={() => setActiveView(mode)}
                className={`rounded-lg px-2 py-1 font-display text-[10px] font-black uppercase tracking-wider transition-all ${
                  activeView === mode
                    ? 'bg-amber-500 text-black shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={isLoading}
            className="rounded-lg border border-white/10 bg-white/5 p-1.5 text-slate-300 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-50"
            title="Refresh live data"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          {isAdmin && (
            <Link
              href="/heda/settings?tab=api"
              className="inline-flex items-center gap-1 rounded-lg border border-teal-500/40 bg-teal-500/10 px-2.5 py-1.5 font-mono text-[10px] font-bold uppercase text-teal-300 hover:bg-teal-500/20"
              title="Open API Settings"
            >
              <Settings2 className="h-3 w-3" />
              API
            </Link>
          )}
        </div>
      </div>

      {/* Configuration / error banners */}
      {isConfigured === false && (
        <div className="space-y-2 rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 text-amber-200">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 shrink-0 text-amber-400" />
            <h4 className="font-display text-sm font-bold uppercase tracking-wider">
              Dealer Signature API Credentials Required
            </h4>
          </div>
          <p className="text-xs leading-relaxed text-amber-200/90">
            The website can load real predictions only after a Main Admin saves the{' '}
            <b>Public API URL</b> and <b>Server SK Key</b> in{' '}
            <code className="rounded bg-black/30 px-1 py-0.5">Admin → Settings → API Settings</code>.
            The key stays encrypted on the backend and is never sent to this browser.
          </p>
          {isAdmin && (
            <Link
              href="/heda/settings?tab=api"
              className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 px-3 py-1.5 font-display text-[10px] font-black uppercase tracking-wider text-black"
            >
              <Sparkles className="h-3 w-3" />
              Open API Settings
            </Link>
          )}
        </div>
      )}

      {toolStatus !== 'live' && errorInfo && isConfigured !== false && (
        <div className={`flex flex-wrap items-center gap-2 rounded-xl border p-3 font-mono text-[11px] ${
          toolStatus === 'stale'
            ? 'border-amber-500/30 bg-amber-500/5 text-amber-200'
            : 'border-rose-500/30 bg-rose-500/5 text-rose-200'
        }`}>
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span className="font-bold uppercase">{errorInfo.code || 'API ERROR'}</span>
          <span className="text-slate-300">{errorInfo.message}</span>
          {toolStatus === 'stale' && (
            <span className="ml-auto text-[10px] text-amber-300/80">
              Last valid prediction retained — no data was erased.
            </span>
          )}
          <button
            type="button"
            onClick={handleRefresh}
            className="ml-auto rounded-md border border-white/10 bg-white/5 px-2 py-1 text-[10px] font-bold uppercase text-white hover:bg-white/10"
          >
            Retry now
          </button>
        </div>
      )}

      {isConfigured === true && tables.length === 0 && statusMessage === 'NO LIVE TABLES' && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-sky-500/30 bg-sky-500/5 p-3 font-mono text-[11px] text-sky-200">
          <Info className="h-4 w-4 shrink-0" />
          <span>
            The provider API responded successfully but returned no live tables.
            {feedInfo?.stale ? ' Its feed is currently marked stale.' : ''}
          </span>
          <button
            type="button"
            onClick={handleRefresh}
            className="ml-auto rounded-md border border-white/10 bg-white/5 px-2 py-1 text-[10px] font-bold uppercase text-white hover:bg-white/10"
          >
            Refresh
          </button>
        </div>
      )}

      {feedInfo?.stale && tables.length > 0 && (
        <div className="rounded-xl border border-amber-500/25 bg-amber-500/5 px-3 py-2 font-mono text-[10px] text-amber-200">
          Provider feed is marked STALE. The UI keeps the last valid prediction
          and retries automatically.
        </div>
      )}

      {/* Main grid */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
        {/* Left column */}
        <div className="flex flex-col gap-3 lg:col-span-5">
          {/* Live signal */}
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#0c1220] to-[#070b14] p-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <span className="flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <span className="h-2 w-2 rounded-sm bg-sky-400" />
                Live Signal
              </span>
              <span className={`font-mono text-[10px] font-bold uppercase ${
                p?.status === 'OVER'
                  ? 'text-orange-400'
                  : p?.status === 'UNDER'
                    ? 'text-cyan-300'
                    : 'text-slate-400'
              }`}>
                {p?.status ? `Travel ${p.status}` : 'Real-time engine'}
              </span>
            </div>

            {!ready ? (
              <div className="py-5 text-center font-mono text-xs text-slate-400">
                {p
                  ? `Building prediction — ${p.spinsNeeded ?? 0} more spin(s) needed.`
                  : isSwitching || isLoading
                    ? `Calculating ${currentDirection} prediction…`
                    : 'Waiting for a valid live table response.'}
              </div>
            ) : (
              <div className="mt-3 grid grid-cols-2 gap-4">
                <div className="flex flex-col justify-center border-r border-white/10 pr-4">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Main Target
                  </span>
                  <div className="my-1 flex items-baseline gap-2">
                    <span className="font-mono text-5xl font-black leading-none text-amber-400">
                      {dsp(p.main)}
                    </span>
                    <span className="font-mono text-xs font-bold text-slate-400">n9</span>
                  </div>
                  <span className="font-mono text-[10px] font-semibold text-amber-400/90">
                    19-number sector · {p.direction}
                  </span>
                  <span className="mt-1 font-mono text-[10px] text-slate-500">
                    Last spin: {dsp(p.lastSpin)}
                  </span>
                </div>

                <div className="flex flex-col justify-around gap-2">
                  <div>
                    <span className="block font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Top Over
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xl font-black text-orange-400">{dsp(topOver)}</span>
                      <span className="font-mono text-[10px] text-slate-400">n4</span>
                      {p.status === 'OVER' && (
                        <span className="rounded-full border border-orange-500/50 bg-orange-500/20 px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase text-orange-400">
                          Last hit
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <span className="block font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Top Under
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xl font-black text-cyan-400">{dsp(topUnder)}</span>
                      <span className="font-mono text-[10px] text-slate-400">n4</span>
                      {p.status === 'UNDER' && (
                        <span className="rounded-full border border-cyan-500/50 bg-cyan-500/20 px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase text-cyan-400">
                          Last hit
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-3 grid grid-cols-3 gap-1.5 border-t border-white/5 pt-3 font-mono text-[10px]">
              <div>
                <span className="block text-slate-500">Travel avg</span>
                <b className="text-white">{p?.travelAverage !== null && p?.travelAverage !== undefined ? r1(p.travelAverage) : '—'}</b>
              </div>
              <div>
                <span className="block text-slate-500">K</span>
                <b className="text-white">{p?.k ?? '—'}</b>
              </div>
              <div>
                <span className="block text-slate-500">Window</span>
                <b className="text-white">{p?.windowSize ?? currentWindow}</b>
              </div>
            </div>
          </div>

          {/* W/L pattern */}
          <div className="space-y-3 rounded-2xl border border-white/10 bg-[#090e18] p-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <span className="block font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Detected Pattern
                </span>
                <div className="mt-0.5 flex items-center gap-1.5">
                  <span className="font-mono text-xl font-black text-sky-400">{wCount}W</span>
                  <span className="font-black text-slate-600">·</span>
                  <span className="font-mono text-xl font-black text-rose-500">{lCount}L</span>
                </div>
              </div>

              <div className="max-w-[55%] text-right">
                <span className="block truncate font-mono text-xs font-black uppercase text-white">
                  {pattern.label || pattern.code || 'WAITING'}
                </span>
                <span className={`font-mono text-[9px] uppercase tracking-wider ${
                  pattern.classification === 'READY'
                    ? 'text-emerald-400'
                    : pattern.classification === 'WAIT'
                      ? 'text-amber-400'
                      : 'text-slate-400'
                }`}>
                  {pattern.classification || (ready ? 'LIVE' : 'BUILDING')}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto py-1">
              {last10.length === 0 ? (
                <div className="py-1 font-mono text-xs text-slate-400">
                  Evaluating spins (25+ jumps needed for W/L)…
                </div>
              ) : (
                last10.map((result, index) => {
                  const isNewest = index === last10.length - 1;
                  return (
                    <div
                      key={`${result}-${index}`}
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border font-mono text-xs font-black text-white transition-transform ${
                        result === 'W'
                          ? 'border-emerald-400/40 bg-gradient-to-br from-emerald-500 to-emerald-700'
                          : 'border-rose-400/40 bg-gradient-to-br from-rose-500 to-rose-700'
                      } ${isNewest ? 'scale-110 ring-2 ring-white shadow-[0_0_10px_rgba(255,255,255,0.35)]' : ''}`}
                      title={isNewest ? 'NEWEST RESULT' : `Result ${index + 1} of last 10`}
                    >
                      {result}
                    </div>
                  );
                })
              )}
            </div>

            <div className="font-mono text-[10px] text-slate-400">
              last {last10.length} signals: {wCount}W - {lCount}L. NEW = most recent result.
            </div>
          </div>

          {/* Direction and controls */}
          <div className="space-y-3.5 rounded-2xl border border-white/10 bg-[#090e18] p-4 shadow-xl">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={handleToggleDirection}
                className="flex items-center gap-2 rounded-xl border border-white/20 bg-black px-3.5 py-2 font-display text-xs font-bold uppercase tracking-wider text-white transition-all hover:border-amber-400 hover:shadow-[0_0_12px_rgba(245,158,11,0.3)]"
              >
                <ArrowRightLeft className={`h-3.5 w-3.5 text-amber-400 ${isSwitching ? 'animate-pulse' : ''}`} />
                <span>Switch Side</span>
              </button>

              <div className="text-right">
                <span className="block font-mono text-[9px] uppercase tracking-wider text-slate-400">
                  Direction
                </span>
                <span className="flex items-center justify-end gap-1 font-mono text-base font-black text-white">
                  <span>{currentDirection === 'CW' ? '↻' : '↺'}</span>
                  <span>{currentDirection}</span>
                  {isSwitching && <span className="font-mono text-[9px] text-amber-400">…</span>}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 rounded-xl border border-white/5 bg-black/40 p-2.5">
              <div>
                <span className="block font-mono text-[9px] font-bold uppercase text-slate-400">
                  Win Rate
                </span>
                <span className="font-mono text-sm font-black text-white">{pct(n9Accuracy)}</span>
                <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-blue-500 transition-all duration-300"
                    style={{ width: `${Math.min(100, Math.max(0, (n9Accuracy ?? 0) * 100))}%` }}
                  />
                </div>
                <span className="mt-1 block font-mono text-[8px] text-slate-500">n9 · n={n9Predictions}</span>
              </div>

              <div>
                <span className="block font-mono text-[9px] font-bold uppercase text-slate-400">
                  Avg Used
                </span>
                <span className="font-mono text-sm font-black text-white">{currentWindow}</span>
              </div>

              <div>
                <span className="block font-mono text-[9px] font-bold uppercase text-slate-400">
                  n4 Hit
                </span>
                <span className="font-mono text-sm font-black text-emerald-400">{pct(n4Accuracy)}</span>
                <span className="mt-1 block font-mono text-[8px] text-slate-500">n={n4Predictions}</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowRawOutput((value) => !value)}
                className="font-mono text-[10px] font-bold uppercase text-slate-400 transition-colors hover:text-white"
              >
                {showRawOutput ? '▲ Hide Raw Output' : '▼ Show Raw Output'}
              </button>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleAdjustWindow(5)}
                  className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 font-mono text-[10px] font-bold text-slate-300 hover:bg-white/10 hover:text-white"
                >
                  + Add Avg
                </button>
                <button
                  type="button"
                  onClick={() => handleAdjustWindow(-5)}
                  className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 font-mono text-[10px] font-bold text-slate-300 hover:bg-white/10 hover:text-white"
                >
                  − Sub Avg
                </button>
              </div>
            </div>

            {showRawOutput && (
              <pre className="max-h-56 overflow-y-auto whitespace-pre-wrap rounded-xl border border-white/10 bg-black p-3 font-mono text-[10px] text-sky-400">
                {JSON.stringify(rawAnalysis || { note: 'No API response yet' }, null, 2)}
              </pre>
            )}
          </div>

          {/* Feed meta */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-xl border border-white/5 bg-black/30 px-3 py-2 font-mono text-[10px] text-slate-400">
            <span className="inline-flex items-center gap-1">
              <ShieldCheck className="h-3 w-3 text-emerald-400" />
              Server-side HMAC proxy
            </span>
            <span className="inline-flex items-center gap-1">
              <Activity className="h-3 w-3 text-sky-400" />
              Auto-refresh 6s
            </span>
            <span className="inline-flex items-center gap-1">
              <Layers className="h-3 w-3 text-amber-400" />
              {tables.length} live tables
            </span>
          </div>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-3 lg:col-span-7">
          {/* Winning strip */}
          <div className="flex items-center gap-3 overflow-x-auto rounded-2xl border border-white/10 bg-black/80 p-2.5 px-3 shadow-inner">
            <span className="shrink-0 font-mono text-[10px] font-bold uppercase text-slate-400">
              Winning Strip:
            </span>
            <div className="flex items-center gap-3">
              {spinsNewestFirst.length > 0 ? (
                spinsNewestFirst.slice(0, 14).map((num, index) => {
                  const color = getNumberColor(num);
                  const latest = index === 0;
                  return (
                    <span
                      key={`${num}-${index}`}
                      className={`shrink-0 font-mono text-sm font-black ${
                        color === 'red'
                          ? 'text-rose-500'
                          : color === 'green'
                            ? 'text-emerald-400'
                            : 'text-white'
                      } ${latest ? 'rounded-md border border-slate-400 bg-slate-800/80 px-2 py-0.5 shadow-[0_0_8px_rgba(255,255,255,0.3)]' : ''}`}
                      title={latest ? 'Latest spin' : `Older spin ${index}`}
                    >
                      {dsp(num)}
                    </span>
                  );
                })
              ) : (
                <span className="font-mono text-xs text-slate-500">No spins received yet</span>
              )}
            </div>
            <span className="ml-auto shrink-0 font-mono text-[9px] uppercase text-slate-500">
              newest → older
            </span>
          </div>

          {/* View card */}
          <div className="relative space-y-2 rounded-2xl border border-white/10 bg-[#070b14] p-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <span className="flex items-center gap-1.5 font-display text-xs font-bold uppercase tracking-wider text-white">
                <span
                  className={`h-2 w-2 rounded-sm ${
                    activeView === 'travel'
                      ? 'bg-cyan-400'
                      : activeView === 'livegraph'
                        ? 'bg-amber-400'
                        : 'bg-amber-400'
                  }`}
                />
                {activeView === 'racetrack'
                  ? 'European Roulette Oval Racetrack'
                  : activeView === 'wheel'
                    ? 'Radial Wheel Prediction Map'
                    : activeView === 'livegraph'
                      ? 'Live Graph · Fixed Yellow Reference'
                      : 'Travel Chart · W/L n9 + n4'}
              </span>
              <div className="flex items-center gap-3 font-mono text-[10px] text-slate-400">
                {activeView === 'racetrack' && (
                  <div className="flex items-center gap-1">
                    <span>NEIGHBORS:</span>
                    <span className="font-bold text-amber-400">{neighborCount}</span>
                  </div>
                )}
                <span className="uppercase">{currentDirection}</span>
                <span>N={currentWindow}</span>
              </div>
            </div>

            {activeView === 'racetrack' && (
              <div className="w-full overflow-hidden rounded-xl border border-white/5 bg-[#020408] p-2">
                <RacetrackOval
                  prediction={
                    p || {
                      ready: false,
                      direction: currentDirection,
                      main: null,
                      n9: [],
                      topOver: [],
                      topUnder: [],
                      overCenter: null,
                      underCenter: null,
                      status: 'NEUTRAL',
                      lastSpin: null,
                      lastTravel: null,
                      signedLastTravel: null,
                      signedMean: null,
                      travelAverage: null,
                      k: null,
                      windowSize: null,
                      raw: null
                    }
                  }
                  neighborCount={neighborCount}
                  onAdjustNeighbor={(delta) =>
                    setNeighborCount((previous) => Math.max(1, Math.min(9, previous + delta)))
                  }
                />
              </div>
            )}

            {activeView === 'wheel' && (
              <div className="w-full overflow-hidden rounded-xl border border-white/5 bg-[#020408] p-2">
                {p ? (
                  <PredictionWheel prediction={p} />
                ) : (
                  <div className="flex min-h-[260px] items-center justify-center font-mono text-xs text-slate-400">
                    Waiting for the first valid prediction…
                  </div>
                )}
              </div>
            )}

            {activeView === 'livegraph' && (
              <div className="w-full overflow-hidden rounded-xl border border-white/5 bg-[#020408] p-2">
                <LiveGraphChart
                  data={travel}
                  prediction={p}
                  fallbackSpins={spinsForFallback}
                  direction={currentDirection}
                  window={currentWindow}
                />
              </div>
            )}

            {activeView === 'travel' && (
              <div className="w-full overflow-hidden rounded-xl border border-white/5 bg-[#020408] p-2">
                <TravelChart
                  data={travel}
                  prediction={p}
                  fallbackSpins={spinsForFallback}
                  direction={currentDirection}
                  window={currentWindow}
                />
              </div>
            )}

            {isSwitching && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-2xl bg-[#05080f]/55 backdrop-blur-[1px]">
                <div className="flex items-center gap-2 rounded-xl border border-amber-500/40 bg-[#0b1220]/95 px-3 py-2 font-mono text-[11px] font-bold uppercase tracking-wider text-amber-300 shadow-xl">
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  Calculating {currentDirection}…
                </div>
              </div>
            )}
          </div>

          {/* Legend / model note */}
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3">
              <span className="flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase text-amber-300">
                <Zap className="h-3 w-3" /> Main prediction
              </span>
              <p className="mt-1 font-mono text-[10px] leading-relaxed text-slate-400">
                Last spin + direction × rounded travel average. The same input
                always produces the same deterministic sector.
              </p>
            </div>
            <div className="rounded-xl border border-orange-500/20 bg-orange-500/5 p-3">
              <span className="flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase text-orange-300">
                <ChevronDown className="h-3 w-3 rotate-180" /> Top over n4
              </span>
              <p className="mt-1 font-mono text-[10px] leading-relaxed text-slate-400">
                9-number sector offset +5 from the main pocket. Orange marks
                the OVER side.
              </p>
            </div>
            <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-3">
              <span className="flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase text-cyan-300">
                <ChevronDown className="h-3 w-3" /> Top under n4
              </span>
              <p className="mt-1 font-mono text-[10px] leading-relaxed text-slate-400">
                9-number sector offset −5 from the main pocket. Cyan marks the
                UNDER side.
              </p>
            </div>
          </div>

          {/* Safety / honest note */}
          <div className="flex items-start gap-2 rounded-xl border border-white/5 bg-black/20 p-3 font-mono text-[10px] leading-relaxed text-slate-500">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
            <span>
              Predictions are generated from the live provider response and the
              project&apos;s original travel mathematics. No random result,
              hardcoded number, or fabricated confidence score is used. If the
              API is offline, the last valid data is kept and marked stale.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
