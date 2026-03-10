'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import type { Spot } from '@/types';
import {
  computeDistrictStats,
  computeOverallCompletion,
  findDistrictForPoint,
  type DistrictStats,
} from '@/lib/district-tracker';

interface UseDistrictsOptions {
  spots: Spot[];
}

interface UseDistrictsReturn {
  /** Per-district statistics (spot counts, visited status, bounds, bbox). */
  districts: DistrictStats[];
  /** Percentage of districts visited (0-100). */
  overallCompletion: number;
  /** Currently selected district name (for map highlighting / zoom). */
  selectedDistrict: string | null;
  /** Select a district by name — triggers map zoom. */
  selectDistrict: (name: string | null) => void;
  /** Resolve a coordinate to a district name. */
  districtForPoint: (lng: number, lat: number) => string;
}

/**
 * useDistricts manages district tracking state.
 *
 * It recomputes stats whenever the `spots` array changes, so callers only
 * need to pass in the current spot list.
 */
export function useDistricts({ spots }: UseDistrictsOptions): UseDistrictsReturn {
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);

  const districts = useMemo(() => computeDistrictStats(spots), [spots]);
  const overallCompletion = useMemo(() => computeOverallCompletion(districts), [districts]);

  // Re-select null if the selected district no longer exists (safety guard)
  useEffect(() => {
    if (
      selectedDistrict &&
      !districts.some((d) => d.name === selectedDistrict)
    ) {
      setSelectedDistrict(null);
    }
  }, [districts, selectedDistrict]);

  const selectDistrict = useCallback((name: string | null) => {
    setSelectedDistrict(name);
  }, []);

  const districtForPoint = useCallback((lng: number, lat: number) => {
    return findDistrictForPoint(lng, lat);
  }, []);

  return {
    districts,
    overallCompletion,
    selectedDistrict,
    selectDistrict,
    districtForPoint,
  };
}
