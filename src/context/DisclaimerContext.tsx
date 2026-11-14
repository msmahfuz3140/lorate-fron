'use client';

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { DisclaimerModal } from '../components/DisclaimerModal';
import { useAuth } from './AuthContext';
import {
  acknowledgeDisclaimer,
  clearDisclaimerPendingAfterLogin,
  hasAcknowledgedDisclaimer,
  isDisclaimerPendingAfterLogin
} from '../lib/disclaimer-storage';

interface DisclaimerContextType {
  requestToolAccess: (action: () => void) => void;
}

const DisclaimerContext = createContext<DisclaimerContextType | undefined>(undefined);

/**
 * Application-level disclaimer gate.
 *
 * Behaviour:
 *  - shown once per account/browser
 *  - not shown again on every Open Tools click
 *  - reset after logout/login, so a fresh login sees it once again
 */
export function DisclaimerProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const pendingActionRef = useRef<(() => void) | null>(null);

  // A successful login marks this flag. The modal is shown once on the next
  // authenticated render, even if the user lands directly on the tool page.
  useEffect(() => {
    if (!user?.id) return;
    if (!isDisclaimerPendingAfterLogin()) return;
    if (hasAcknowledgedDisclaimer(user.id)) return;
    setIsOpen(true);
  }, [user?.id]);

  // Same-tab login event, including a re-login with the same user id.
  useEffect(() => {
    const handleLogin = () => {
      if (isDisclaimerPendingAfterLogin()) setIsOpen(true);
    };
    window.addEventListener('roulette-disclaimer-login', handleLogin);
    return () =>
      window.removeEventListener('roulette-disclaimer-login', handleLogin);
  }, []);

  const requestToolAccess = useCallback(
    (action: () => void) => {
      if (hasAcknowledgedDisclaimer(user?.id)) {
        action();
        return;
      }
      pendingActionRef.current = action;
      setIsOpen(true);
    },
    [user?.id]
  );

  const handleProceed = useCallback(() => {
    const action = pendingActionRef.current;
    pendingActionRef.current = null;
    acknowledgeDisclaimer(user?.id);
    clearDisclaimerPendingAfterLogin();
    setIsOpen(false);

    // Execute synchronously from the click handler so Document Picture-in-Picture
    // retains the required transient user activation.
    if (action) {
      action();
    }
  }, [user?.id]);

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
