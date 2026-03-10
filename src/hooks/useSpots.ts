'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Spot, CreateSpotInput, UpdateSpotInput, SearchFilters } from '@/types';
import { DataStore } from '@/lib/datastore';
import { findDistrictForPoint } from '@/lib/district-tracker';

export function useSpots(filters?: SearchFilters) {
  const [spots, setSpots] = useState<Spot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSpots = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await DataStore.listSpots(filters);
      setSpots(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load spots';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadSpots();
  }, [loadSpots]);

  const createSpot = useCallback(async (input: CreateSpotInput): Promise<Spot> => {
    setError(null);
    try {
      // Resolve district from coordinates via point-in-polygon testing
      const district = findDistrictForPoint(input.location.lng, input.location.lat);
      const spot = await DataStore.createSpotWithDistrict(input, district);
      setSpots((prev) => [spot, ...prev]);
      return spot;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create spot';
      setError(message);
      throw err;
    }
  }, []);

  const updateSpot = useCallback(async (id: string, input: UpdateSpotInput): Promise<Spot> => {
    setError(null);
    try {
      const updated = await DataStore.updateSpot(id, input);
      setSpots((prev) => prev.map((s) => (s.id === id ? updated : s)));
      return updated;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update spot';
      setError(message);
      throw err;
    }
  }, []);

  const deleteSpot = useCallback(async (id: string): Promise<void> => {
    setError(null);
    try {
      await DataStore.deleteSpot(id);
      setSpots((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete spot';
      setError(message);
      throw err;
    }
  }, []);

  return {
    spots,
    loading,
    error,
    refresh: loadSpots,
    createSpot,
    updateSpot,
    deleteSpot,
  };
}
