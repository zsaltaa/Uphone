'use client';

import { useEffect, useState } from 'react';

/**
 * Provides real system Date synchronized cleanly on minute boundaries.
 */
export function useSystemClock(): Date {
  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    const sync = () => setNow(new Date());
    const interval = window.setInterval(sync, 10_000);
    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        sync();
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return now;
}
