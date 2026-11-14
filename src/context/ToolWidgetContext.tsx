'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

export type ToolMode = 'iframe' | 'api';

export interface PredictionData {
  tableName?: string;
  provider?: string;
  lastNumbers?: number[];
  predictedPocket?: string | number;
  confidence?: string;
  updatedAt?: number;
}

interface ToolWidgetContextType {
  isOpen: boolean;            // Whether drawer window is open
  isMinimized: boolean;       // Whether collapsed as a floating Messenger bubble
  isWidgetActive: boolean;    // Whether the floating widget system is enabled
  toolMode: ToolMode;         // 'iframe' (index.html) or 'api' (future API system)
  predictionData: PredictionData;
  hasAccess: boolean;
  // Side tool window (Document Picture-in-Picture or fallback popup)
  openToolSideWindow: () => void;
  openToolWidget: () => void;
  minimizeToolWidget: () => void;
  toggleToolWidget: () => void;
  closeToolWidget: () => void;
  setToolMode: (mode: ToolMode) => void;
  updatePredictionData: (data: Partial<PredictionData>) => void;
  setHasAccess: (access: boolean) => void;
}

const ToolWidgetContext = createContext<ToolWidgetContextType | undefined>(undefined);

export function ToolWidgetProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(true);
  // Default to active so floating Messenger bubble is ALWAYS visible across tabs & pages
  const [isWidgetActive, setIsWidgetActive] = useState(true);
  const [toolMode, setToolModeState] = useState<ToolMode>('iframe');
  const [hasAccess, setHasAccess] = useState(true);
  const sideWindowRef = useRef<any>(null);
  const [predictionData, setPredictionData] = useState<PredictionData>({
    // Empty until the real API returns a table/prediction. No mock numbers or
    // fabricated confidence values are placed in the widget state.
    tableName: 'Waiting for live API',
    provider: undefined,
    lastNumbers: [],
    predictedPocket: undefined,
    confidence: undefined,
    updatedAt: undefined
  });

  // Cross-tab broadcast helper
  const broadcastMessage = useCallback((type: string, payload: any) => {
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const bc = new BroadcastChannel('sloot_tool_channel');
        bc.postMessage({ type, payload });
        bc.close();
      }
    } catch {}
  }, []);

  // Restore preferences from localStorage and listen to cross-tab updates
  useEffect(() => {
    try {
      const savedActive = localStorage.getItem('sloot_widget_active');
      const savedOpen = localStorage.getItem('sloot_widget_open');
      const savedMode = localStorage.getItem('sloot_widget_mode') as ToolMode | null;

      // Keep active by default unless explicitly dismissed by user
      if (savedActive === 'false') {
        setIsWidgetActive(false);
      } else {
        setIsWidgetActive(true);
      }

      if (savedOpen === 'true') {
        setIsOpen(true);
        setIsMinimized(false);
      } else {
        setIsOpen(false);
        setIsMinimized(true);
      }

      if (savedMode === 'iframe' || savedMode === 'api') {
        setToolModeState(savedMode);
      }

    } catch {}

    // Cross-tab sync listener
    let channel: BroadcastChannel | null = null;
    try {
      if ('BroadcastChannel' in window) {
        channel = new BroadcastChannel('sloot_tool_channel');
        channel.onmessage = (event) => {
          if (!event.data) return;
          const { type, payload } = event.data;
          if (type === 'STATE_SYNC') {
            if (typeof payload.isOpen === 'boolean') setIsOpen(payload.isOpen);
            if (typeof payload.isMinimized === 'boolean') setIsMinimized(payload.isMinimized);
            if (typeof payload.isWidgetActive === 'boolean') setIsWidgetActive(payload.isWidgetActive);
            if (payload.toolMode) setToolModeState(payload.toolMode);
          } else if (type === 'PREDICTION_SYNC') {
            setPredictionData((prev) => ({ ...prev, ...payload, updatedAt: Date.now() }));
          }
        };
      }
    } catch {}

    // Storage event listener fallback for older browsers
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'sloot_widget_active') {
        setIsWidgetActive(e.newValue !== 'false');
      } else if (e.key === 'sloot_widget_open') {
        const open = e.newValue === 'true';
        setIsOpen(open);
        setIsMinimized(!open);
      } else if (e.key === 'sloot_widget_mode') {
        if (e.newValue === 'iframe' || e.newValue === 'api') {
          setToolModeState(e.newValue);
        }
      }
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      channel?.close();
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  // Listen for postMessage from the roulette tool iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (!event.data || typeof event.data !== 'object') return;

      if (event.data.type === 'ROULETTE_TOOL_MINIMIZE') {
        setIsWidgetActive(true);
        setIsOpen(false);
        setIsMinimized(true);
        try {
          localStorage.setItem('sloot_widget_active', 'true');
          localStorage.setItem('sloot_widget_open', 'false');
        } catch {}
        broadcastMessage('STATE_SYNC', { isOpen: false, isMinimized: true, isWidgetActive: true });
      }

      if (event.data.type === 'ROULETTE_PREDICTION_UPDATE') {
        const update = {
          tableName: event.data.tableName,
          provider: event.data.provider,
          lastNumbers: event.data.lastNumbers,
          predictedPocket: event.data.predictedPocket,
          confidence: event.data.confidence,
        };
        setPredictionData((prev) => ({
          ...prev,
          ...update,
          updatedAt: Date.now(),
        }));
        broadcastMessage('PREDICTION_SYNC', update);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [broadcastMessage]);

  const openToolWidget = useCallback(() => {
    setIsWidgetActive(true);
    setIsOpen(true);
    setIsMinimized(false);
    try {
      localStorage.setItem('sloot_widget_active', 'true');
      localStorage.setItem('sloot_widget_open', 'true');
    } catch {}
    broadcastMessage('STATE_SYNC', { isOpen: true, isMinimized: false, isWidgetActive: true, toolMode });
  }, [broadcastMessage, toolMode]);

  const minimizeToolWidget = useCallback(() => {
    setIsWidgetActive(true);
    setIsOpen(false);
    setIsMinimized(true);
    try {
      localStorage.setItem('sloot_widget_active', 'true');
      localStorage.setItem('sloot_widget_open', 'false');
    } catch {}
    broadcastMessage('STATE_SYNC', { isOpen: false, isMinimized: true, isWidgetActive: true, toolMode });
  }, [broadcastMessage, toolMode]);

  const toggleToolWidget = useCallback(() => {
    setIsWidgetActive(true);
    setIsOpen((prevOpen) => {
      const nextOpen = !prevOpen;
      setIsMinimized(!nextOpen);
      try {
        localStorage.setItem('sloot_widget_active', 'true');
        localStorage.setItem('sloot_widget_open', String(nextOpen));
      } catch {}
      broadcastMessage('STATE_SYNC', { isOpen: nextOpen, isMinimized: !nextOpen, isWidgetActive: true, toolMode });
      return nextOpen;
    });
  }, [broadcastMessage, toolMode]);

  const closeToolWidget = useCallback(() => {
    setIsOpen(false);
    setIsMinimized(false);
    setIsWidgetActive(false);
    try {
      localStorage.setItem('sloot_widget_active', 'false');
      localStorage.setItem('sloot_widget_open', 'false');
    } catch {}
    broadcastMessage('STATE_SYNC', { isOpen: false, isMinimized: false, isWidgetActive: false, toolMode });
  }, [broadcastMessage, toolMode]);

  const setToolMode = useCallback((mode: ToolMode) => {
    setToolModeState(mode);
    try {
      localStorage.setItem('sloot_widget_mode', mode);
    } catch {}
    broadcastMessage('STATE_SYNC', { isOpen, isMinimized, isWidgetActive, toolMode: mode });
  }, [broadcastMessage, isOpen, isMinimized, isWidgetActive]);

  const updatePredictionData = useCallback((data: Partial<PredictionData>) => {
    setPredictionData((prev) => {
      const updated = {
        ...prev,
        ...data,
        updatedAt: Date.now(),
      };
      broadcastMessage('PREDICTION_SYNC', data);
      return updated;
    });
  }, [broadcastMessage]);

  /**
   * Opens the actual prediction tool in a persistent side window.
   *
   * Document Picture-in-Picture is always-on-top and remains visible when the
   * user switches browser tabs. Browsers without it get a normal popup window
   * fallback, which also remains open across tab switches.
   */
  const openToolSideWindow = useCallback(async () => {
    if (typeof window === 'undefined') return;

    const existing = sideWindowRef.current;
    if (existing && !existing.closed) {
      try {
        existing.focus();
        return;
      } catch {
        sideWindowRef.current = null;
      }
    }

    const pip = (window as any).documentPictureInPicture;
    if (pip?.requestWindow) {
      try {
        const pipWindow: Window = await pip.requestWindow({
          width: 480,
          height: 760
        });

        pipWindow.document.documentElement.style.height = '100%';
        pipWindow.document.body.style.height = '100%';
        pipWindow.document.body.style.margin = '0';
        pipWindow.document.body.style.background = '#05080f';
        pipWindow.document.body.style.overflow = 'hidden';

        const container = pipWindow.document.createElement('div');
        container.style.cssText =
          'display:flex;flex-direction:column;width:100%;height:100%;background:#05080f;color:#fff;';

        const header = pipWindow.document.createElement('div');
        header.style.cssText =
          'display:flex;align-items:center;justify-content:space-between;gap:8px;padding:8px 10px;background:#08111c;border-bottom:1px solid rgba(255,255,255,0.12);font-family:-apple-system,BlinkMacSystemFont,sans-serif;flex-shrink:0;';
        header.innerHTML =
          '<div style="display:flex;align-items:center;gap:7px;min-width:0;">' +
          '<span style="width:7px;height:7px;border-radius:50%;background:#22c55e;box-shadow:0 0 8px #22c55e;"></span>' +
          '<span style="font-size:10px;font-weight:900;letter-spacing:0.08em;color:#f5b301;white-space:nowrap;">ROULETTE COMPUTER</span>' +
          '<span style="font-size:9px;color:#94a3b8;white-space:nowrap;">SIDE TOOL</span>' +
          '</div>' +
          '<button id="side-close" style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.16);color:#cbd5e1;border-radius:6px;padding:4px 8px;font-size:10px;font-weight:700;cursor:pointer;">Close ✕</button>';

        const frame = pipWindow.document.createElement('iframe');
        frame.src = '/dashboard/tool?popup=1&side=1';
        frame.style.cssText = 'flex:1;width:100%;height:100%;border:0;display:block;background:#05080f;';

        container.appendChild(header);
        container.appendChild(frame);
        pipWindow.document.body.appendChild(container);

        const closeBtn = pipWindow.document.getElementById('side-close');
        if (closeBtn) closeBtn.onclick = () => pipWindow.close();

        sideWindowRef.current = pipWindow;
        pipWindow.addEventListener('pagehide', () => {
          sideWindowRef.current = null;
        });
        return;
      } catch {
        // Fall through to the popup implementation below.
      }
    }

    const width = 480;
    const height = 760;
    const left = Math.max(0, window.screen.availWidth - width - 24);
    const top = 48;
    const features = `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes,status=no,toolbar=no,menubar=no,location=no`;
    const popup = window.open(
      '/dashboard/tool?popup=1&side=1',
      'RouletteToolSide',
      features
    );
    sideWindowRef.current = popup;
  }, []);

  return (
    <ToolWidgetContext.Provider
      value={{
        isOpen,
        isMinimized,
        isWidgetActive,
        toolMode,
        predictionData,
        hasAccess,
        openToolSideWindow,
        openToolWidget,
        minimizeToolWidget,
        toggleToolWidget,
        closeToolWidget,
        setToolMode,
        updatePredictionData,
        setHasAccess,
      }}
    >
      {children}
    </ToolWidgetContext.Provider>
  );
}

export function useToolWidget() {
  const context = useContext(ToolWidgetContext);
  if (!context) {
    throw new Error('useToolWidget must be used within a ToolWidgetProvider');
  }
  return context;
}
