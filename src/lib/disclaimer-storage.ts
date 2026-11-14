/**
 * Disclaimer acknowledgement storage.
 *
 * The disclaimer is shown once per user account (or once per guest browser)
 * until the user logs out and logs in again. Login resets the acknowledgement
 * and marks a fresh login so the modal is shown again exactly once.
 */

const ACK_PREFIX = 'roulette_computer_disclaimer_ack_v1_';
const LOGIN_PENDING_KEY = 'roulette_computer_disclaimer_login_pending_v1';

function ackKey(userId?: string | null): string {
  return `${ACK_PREFIX}${userId || 'guest'}`;
}

export function hasAcknowledgedDisclaimer(userId?: string | null): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(ackKey(userId)) === '1';
  } catch {
    return false;
  }
}

export function acknowledgeDisclaimer(userId?: string | null): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ackKey(userId), '1');
  } catch {
    // Storage can be unavailable in hardened/private contexts.
  }
}

export function resetDisclaimerAcknowledgement(userId?: string | null): void {
  if (typeof window === 'undefined') return;
  try {
    if (userId) {
      localStorage.removeItem(ackKey(userId));
      return;
    }
    // Logout/guest reset: remove every acknowledgement key.
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      if (key?.startsWith(ACK_PREFIX)) keys.push(key);
    }
    keys.forEach((key) => localStorage.removeItem(key));
  } catch {
    // Ignore storage errors.
  }
}

/** Called after a successful login/register/OTP verification. */
export function markDisclaimerPendingAfterLogin(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOGIN_PENDING_KEY, '1');
  } catch {
    // Ignore storage errors.
  }
}

export function isDisclaimerPendingAfterLogin(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(LOGIN_PENDING_KEY) === '1';
  } catch {
    return false;
  }
}

export function clearDisclaimerPendingAfterLogin(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(LOGIN_PENDING_KEY);
  } catch {
    // Ignore storage errors.
  }
}
