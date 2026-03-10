'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { Spot, CreateSpotInput, UpdateSpotInput, SearchFilters } from '@/types';
import {
  syncSpots,
  flushMutationQueue,
  getPendingMutationCount,
  getCachedSpots,
  searchCachedSpots,
  offlineCreateSpot,
  offlineUpdateSpot,
  offlineDeleteSpot,
} from '@/lib/offline-cache';
import { DataStore } from '@/lib/datastore';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface UseOfflineReturn {
  /** Whether the browser currently has network connectivity. */
  isOnline: boolean;
  /** Whether a sync operation is currently in progress. */
  isSyncing: boolean;
  /** Number of mutations waiting to be pushed to the server. */
  pendingChanges: number;
  /** Manually trigger a full sync (flush queue + pull fresh data). */
  sync: () => Promise<void>;
  /**
   * Create a spot. When online, goes through DataStore directly.
   * When offline, writes to IndexedDB and queues the mutation.
   */
  createSpot: (input: CreateSpotInput) => Promise<Spot>;
  /**
   * Update a spot. When online, goes through DataStore directly.
   * When offline, applies locally and queues the mutation.
   */
  updateSpot: (id: string, input: UpdateSpotInput) => Promise<Spot>;
  /**
   * Delete a spot. When online, goes through DataStore directly.
   * When offline, removes locally and queues the mutation.
   */
  deleteSpot: (id: string) => Promise<void>;
  /**
   * Search spots. When online, delegates to the provided onlineSearch.
   * When offline, filters from the IndexedDB cache.
   */
  searchSpots: (filters: SearchFilters) => Promise<Spot[]>;
  /**
   * Get all spots (for map display, etc.). Reads from cache when offline.
   */
  getSpots: (filters?: SearchFilters) => Promise<Spot[]>;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * useOffline manages the online/offline lifecycle:
 *
 * 1. Tracks navigator.onLine and listens for online/offline events.
 * 2. When the app comes back online, automatically flushes the mutation
 *    queue and refreshes the local cache from Supabase.
 * 3. Provides offline-aware wrappers for CRUD operations.
 * 4. Exposes sync status so the UI can show indicators.
 */
export function useOffline(): UseOfflineReturn {
  const [isOnline, setIsOnline] = useState(() =>
    typeof navigator !== 'undefined' ? navigator.onLine : true,
  );
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingChanges, setPendingChanges] = useState(0);

  // Prevent concurrent syncs
  const syncingRef = useRef(false);

  // ------ Online/offline listeners ------
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // ------ Refresh pending count ------
  const refreshPendingCount = useCallback(async () => {
    try {
      const count = await getPendingMutationCount();
      setPendingChanges(count);
    } catch {
      // IndexedDB may not be available (SSR)
    }
  }, []);

  // Check pending count on mount and when online status changes
  useEffect(() => {
    refreshPendingCount();
  }, [refreshPendingCount, isOnline]);

  // ------ Full sync: flush queue then pull ------
  const sync = useCallback(async () => {
    if (syncingRef.current) return;
    syncingRef.current = true;
    setIsSyncing(true);

    try {
      // 1. Push: replay any queued offline mutations
      await flushMutationQueue();
      // 2. Pull: download fresh data from Supabase
      await syncSpots();
      // 3. Update pending count (should be 0 after successful flush)
      await refreshPendingCount();
    } catch (err) {
      console.error('[useOffline] sync failed:', err);
      // Refresh count in case some mutations succeeded
      await refreshPendingCount();
      throw err;
    } finally {
      syncingRef.current = false;
      setIsSyncing(false);
    }
  }, [refreshPendingCount]);

  // ------ Auto-sync when coming back online ------
  useEffect(() => {
    if (isOnline) {
      sync().catch(() => {
        // swallow — the user can retry manually via sync()
      });
    }
  }, [isOnline, sync]);

  // ------ Offline-aware CRUD ------

  const createSpot = useCallback(
    async (input: CreateSpotInput): Promise<Spot> => {
      if (isOnline) {
        try {
          const spot = await DataStore.createSpotWithDistrict(input, '');
          return spot;
        } catch {
          // Network error at runtime — fall through to offline path
        }
      }
      const spot = await offlineCreateSpot(input);
      await refreshPendingCount();
      return spot;
    },
    [isOnline, refreshPendingCount],
  );

  const updateSpot = useCallback(
    async (id: string, input: UpdateSpotInput): Promise<Spot> => {
      if (isOnline) {
        try {
          return await DataStore.updateSpot(id, input);
        } catch {
          // Fall through to offline path
        }
      }
      const spot = await offlineUpdateSpot(id, input);
      await refreshPendingCount();
      return spot;
    },
    [isOnline, refreshPendingCount],
  );

  const deleteSpot = useCallback(
    async (id: string): Promise<void> => {
      if (isOnline) {
        try {
          await DataStore.deleteSpot(id);
          return;
        } catch {
          // Fall through to offline path
        }
      }
      await offlineDeleteSpot(id);
      await refreshPendingCount();
    },
    [isOnline, refreshPendingCount],
  );

  const searchSpots = useCallback(
    async (filters: SearchFilters): Promise<Spot[]> => {
      if (isOnline) {
        try {
          return await DataStore.listSpots(filters);
        } catch {
          // Fall through to cached search
        }
      }
      return searchCachedSpots(filters);
    },
    [isOnline],
  );

  const getSpots = useCallback(
    async (filters?: SearchFilters): Promise<Spot[]> => {
      if (isOnline) {
        try {
          return await DataStore.listSpots(filters);
        } catch {
          // Fall through to cache
        }
      }
      if (filters) {
        return searchCachedSpots(filters);
      }
      return getCachedSpots();
    },
    [isOnline],
  );

  return {
    isOnline,
    isSyncing,
    pendingChanges,
    sync,
    createSpot,
    updateSpot,
    deleteSpot,
    searchSpots,
    getSpots,
  };
}
