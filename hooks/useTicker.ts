import { useEffect, useState } from 'react';

/** Re-renders on an interval so countdowns and live states stay current. */
export function useTicker(intervalMs = 1000): number {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(timer);
  }, [intervalMs]);

  return now;
}
