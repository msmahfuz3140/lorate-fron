import { useState, useEffect } from 'react';

/**
 * Custom hook to debounce rapidly changing values (like search inputs).
 * Prevents flooding the backend API and MongoDB Atlas free tier with continuous queries.
 *
 * @param value The raw input value
 * @param delay Milliseconds to wait after last change before updating (default 350ms)
 * @returns The debounced value
 */
export function useDebounce<T>(value: T, delay: number = 350): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
