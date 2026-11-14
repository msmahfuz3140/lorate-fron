'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

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
  bettingOverlayOpen: boolean;
  bettingOverlayUrl: string;

  // Actions
  openBettingOverlay: (url?: string) => void;
  closeBettingOverlay: () => void;
  setBettingOverlayUrl: (url: string) => void;
  openToolWidget: () => void;
  minimizeToolWidget: () => void;
  toggleToolWidget: () => void;
  closeToolWidget: () => void;
  setToolMode: (mode: ToolMode) => void;
  updatePredictionData: (data: Partial<PredictionData>) => void;
  setHasAccess: (access: boolean) => void;
  popoutToolWindow: () => void;
}

const ToolWidgetContext = createContext<ToolWidgetContextType | undefined>(undefined);

export function ToolWidgetProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(true);
  // Default to active so floating Messenger bubble is ALWAYS visible across tabs & pages
  const [isWidgetActive, setIsWidgetActive] = useState(true);
  const [toolMode, setToolModeState] = useState<ToolMode>('iframe');
  const [hasAccess, setHasAccess] = useState(true);
  const [bettingOverlayOpen, setBettingOverlayOpen] = useState(false);
  const [bettingOverlayUrl, setBettingOverlayUrlState] = useState('');
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

      const savedBettingUrl = sessionStorage.getItem('sloot_betting_overlay_url');
      if (savedBettingUrl) setBettingOverlayUrlState(savedBettingUrl);
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

  const openBettingOverlay = useCallback((url?: string) => {
    if (url && url.trim()) {
      const clean = url.trim();
      setBettingOverlayUrlState(clean);
      try {
        sessionStorage.setItem('sloot_betting_overlay_url', clean);
      } catch {}
    }
    setBettingOverlayOpen(true);
  }, []);

  const closeBettingOverlay = useCallback(() => {
    setBettingOverlayOpen(false);
  }, []);

  const setBettingOverlayUrl = useCallback((url: string) => {
    const clean = url.trim();
    setBettingOverlayUrlState(clean);
    try {
      if (clean) sessionStorage.setItem('sloot_betting_overlay_url', clean);
      else sessionStorage.removeItem('sloot_betting_overlay_url');
    } catch {}
  }, []);

  const popoutToolWindow = useCallback(() => {
    if (typeof window === 'undefined') return;
    const width = 450;
    const height = 700;
    const left = Math.max(0, window.screen.availWidth - width - 20);
    const top = 50;
    const features = `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes,status=no,toolbar=no,menubar=no,location=no`;
    window.open('/dashboard/tool?popup=1', 'RouletteFloatingPredictor', features);
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
        bettingOverlayOpen,
        bettingOverlayUrl,
        openBettingOverlay,
        closeBettingOverlay,
        setBettingOverlayUrl,
        openToolWidget,
        minimizeToolWidget,
        toggleToolWidget,
        closeToolWidget,
        setToolMode,
        updatePredictionData,
        setHasAccess,
        popoutToolWindow,
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
