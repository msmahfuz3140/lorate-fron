'use client';

import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { DisclaimerModal } from '../components/DisclaimerModal';

interface DisclaimerContextType {
  requestToolAccess: (action: () => void) => void;
}

const DisclaimerContext = createContext<DisclaimerContextType | undefined>(undefined);

/**
 * Application-level disclaimer gate.
 *
 * The pending action is held only in memory. There is intentionally no
 * localStorage, sessionStorage, or cookie flag, so every Open Tools click
 * displays a fresh disclaimer.
 */
export function DisclaimerProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const pendingActionRef = useRef<(() => void) | null>(null);

  const requestToolAccess = useCallback((action: () => void) => {
    pendingActionRef.current = action;
    setIsOpen(true);
  }, []);

  const handleProceed = useCallback(() => {
    const action = pendingActionRef.current;
    pendingActionRef.current = null;
    setIsOpen(false);

    // Let the modal close before navigating/opening the tool.
    if (action) {
      window.setTimeout(action, 0);
    }
  }, []);

  return (
    <DisclaimerContext.Provider value={{ requestToolAccess }}>
      {children}
      <DisclaimerModal isOpen={isOpen} onProceed={handleProceed} />
    </DisclaimerContext.Provider>
  );
}

export function useDisclaimer(): DisclaimerContextType {
  const context = useContext(DisclaimerContext);
  if (!context) {
    throw new Error('useDisclaimer must be used within a DisclaimerProvider');
  }
  return context;
}
