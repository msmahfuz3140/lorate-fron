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

  // Actions
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
  const [isWidgetActive, setIsWidgetActive] = useState(false);
  const [toolMode, setToolModeState] = useState<ToolMode>('iframe');
  const [hasAccess, setHasAccess] = useState(true);
  const [predictionData, setPredictionData] = useState<PredictionData>({
    tableName: 'Live European Roulette',
    provider: 'Evolution Gaming',
    lastNumbers: [25, 17, 34, 6],
    predictedPocket: '25n1',
    confidence: '94%',
    updatedAt: undefined,
  });

  // Restore preferences from localStorage on mount
  useEffect(() => {
    setPredictionData((prev) => ({ ...prev, updatedAt: Date.now() }));
    try {
      const savedActive = localStorage.getItem('sloot_widget_active');
      const savedMode = localStorage.getItem('sloot_widget_mode') as ToolMode | null;
      if (savedActive === 'true') {
        setIsWidgetActive(true);
        setIsMinimized(true);
      }
      if (savedMode === 'iframe' || savedMode === 'api') {
        setToolModeState(savedMode);
      }
    } catch {
      // Ignore localStorage errors
    }
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
        } catch {}
      }

      if (event.data.type === 'ROULETTE_PREDICTION_UPDATE') {
        setPredictionData((prev) => ({
          ...prev,
          tableName: event.data.tableName || prev.tableName,
          provider: event.data.provider || prev.provider,
          lastNumbers: event.data.lastNumbers || prev.lastNumbers,
          predictedPocket: event.data.predictedPocket || prev.predictedPocket,
          confidence: event.data.confidence || prev.confidence,
          updatedAt: Date.now(),
        }));
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const openToolWidget = useCallback(() => {
    setIsWidgetActive(true);
    setIsOpen(true);
    setIsMinimized(false);
    try {
      localStorage.setItem('sloot_widget_active', 'true');
    } catch {}
  }, []);

  const minimizeToolWidget = useCallback(() => {
    setIsWidgetActive(true);
    setIsOpen(false);
    setIsMinimized(true);
    try {
      localStorage.setItem('sloot_widget_active', 'true');
    } catch {}
  }, []);

  const toggleToolWidget = useCallback(() => {
    setIsWidgetActive(true);
    setIsOpen((prevOpen) => {
      const nextOpen = !prevOpen;
      setIsMinimized(!nextOpen);
      return nextOpen;
    });
    try {
      localStorage.setItem('sloot_widget_active', 'true');
    } catch {}
  }, []);

  const closeToolWidget = useCallback(() => {
    setIsOpen(false);
    setIsMinimized(false);
    setIsWidgetActive(false);
    try {
      localStorage.setItem('sloot_widget_active', 'false');
    } catch {}
  }, []);

  const setToolMode = useCallback((mode: ToolMode) => {
    setToolModeState(mode);
    try {
      localStorage.setItem('sloot_widget_mode', mode);
    } catch {}
  }, []);

  const updatePredictionData = useCallback((data: Partial<PredictionData>) => {
    setPredictionData((prev) => ({
      ...prev,
      ...data,
      updatedAt: Date.now(),
    }));
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

