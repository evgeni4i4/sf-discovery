'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { GeoLocation } from '@/types';
import { watchPosition, clearWatch } from '@/lib/geolocation';

// ---------------------------------------------------------------------------
// Wake Lock helpers
// ---------------------------------------------------------------------------

/** Check at runtime whether the Wake Lock API is available. */
function isWakeLockSupported(): boolean {
  return typeof navigator !== 'undefined' && 'wakeLock' in navigator;
}

/**
 * Acquire a screen Wake Lock. Returns the sentinel on success, or null if
 * the API is unavailable or the request fails (e.g. page is hidden).
 */
async function acquireWakeLock(): Promise<WakeLockSentinel | null> {
  if (!isWakeLockSupported()) return null;

  try {
    return await navigator.wakeLock.request('screen');
  } catch (err) {
    // The request can fail if the document is not visible, or if the
    // browser denies the request. This is non-critical so we log and move on.
    console.warn('[useLocation] Wake Lock request failed:', err);
    return null;
  }
}

/** Release a previously acquired Wake Lock sentinel. */
async function releaseWakeLock(sentinel: WakeLockSentinel | null): Promise<void> {
  if (!sentinel) return;
  try {
    await sentinel.release();
  } catch {
    // Already released — nothing to do
  }
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useLocation() {
  const [location, setLocation] = useState<GeoLocation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [watching, setWatching] = useState(false);
  const [wakeLockActive, setWakeLockActive] = useState(false);

  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  const startWatching = useCallback(() => {
    setWatching(true);
  }, []);

  const stopWatching = useCallback(() => {
    setWatching(false);
  }, []);

  // -----------------------------------------------------------------------
  // Geolocation watcher
  // -----------------------------------------------------------------------
  useEffect(() => {
    if (!watching) return;

    const id = watchPosition(setLocation, (err) => setError(err.message));

    return () => clearWatch(id);
  }, [watching]);

  // -----------------------------------------------------------------------
  // Wake Lock lifecycle — acquire when watching, release when not
  // -----------------------------------------------------------------------
  useEffect(() => {
    if (!watching) {
      // Release any existing Wake Lock when tracking stops
      releaseWakeLock(wakeLockRef.current);
      wakeLockRef.current = null;
      setWakeLockActive(false);
      return;
    }

    let cancelled = false;

    // Acquire the Wake Lock
    acquireWakeLock().then((sentinel) => {
      if (cancelled) {
        // Effect was cleaned up before the async call resolved
        releaseWakeLock(sentinel);
        return;
      }

      wakeLockRef.current = sentinel;
      setWakeLockActive(sentinel !== null);

      // The OS can release the lock if the tab goes hidden. Re-acquire it
      // when the page becomes visible again so walks keep the screen on.
      if (sentinel) {
        sentinel.addEventListener('release', () => {
          if (!cancelled) setWakeLockActive(false);
        });
      }
    });

    // Re-acquire when visibility changes back to "visible"
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !cancelled) {
        acquireWakeLock().then((sentinel) => {
          if (cancelled) {
            releaseWakeLock(sentinel);
            return;
          }
          wakeLockRef.current = sentinel;
          setWakeLockActive(sentinel !== null);
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      releaseWakeLock(wakeLockRef.current);
      wakeLockRef.current = null;
      setWakeLockActive(false);
    };
  }, [watching]);

  return { location, error, watching, wakeLockActive, startWatching, stopWatching };
}
