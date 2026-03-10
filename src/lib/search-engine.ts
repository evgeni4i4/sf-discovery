import type { Spot, SearchFilters, GeoLocation } from '@/types';
import { DataStore } from './datastore';
import { searchCachedSpots, getCachedSpots } from './offline-cache';

// ---------------------------------------------------------------------------
// SF Districts – used by the FilterPanel dropdown.
// These are the commonly referenced SF neighborhoods.
// ---------------------------------------------------------------------------

export const SF_DISTRICTS = [
  'Alamo Square',
  'Bayview',
  'Bernal Heights',
  'Castro',
  'Chinatown',
  'Civic Center',
  'Cole Valley',
  'Cow Hollow',
  'Dogpatch',
  'Embarcadero',
  'Excelsior',
  'Financial District',
  'Fisherman\'s Wharf',
  'Glen Park',
  'Golden Gate Park',
  'Haight-Ashbury',
  'Hayes Valley',
  'Inner Richmond',
  'Inner Sunset',
  'Japantown',
  'Lower Haight',
  'Marina',
  'Mission',
  'Mission Bay',
  'Nob Hill',
  'Noe Valley',
  'North Beach',
  'Outer Richmond',
  'Outer Sunset',
  'Pacific Heights',
  'Panhandle',
  'Potrero Hill',
  'Presidio',
  'Russian Hill',
  'SoMa',
  'Tenderloin',
  'Twin Peaks',
  'Union Square',
  'Western Addition',
] as const;

export type SFDistrict = (typeof SF_DISTRICTS)[number];

// ---------------------------------------------------------------------------
// SearchEngine
// ---------------------------------------------------------------------------

export interface SearchResult {
  spots: Spot[];
  total: number;
  appliedFilters: SearchFilters;
}

/**
 * SearchEngine orchestrates search and filter operations.
 *
 * It delegates server-side filtering to DataStore.listSpots() and
 * DataStore.findNearby(), composing the two when the user enables
 * proximity search alongside other filters.
 */
export const SearchEngine = {
  /**
   * Main search entry point.
   *
   * 1. If `nearMe` is true **and** a userLocation is provided, we first
   *    fetch IDs within the radius via DataStore.findNearby, then apply
   *    the remaining filters client-side so we get the intersection.
   * 2. Otherwise we pass all filters straight to DataStore.listSpots()
   *    which applies them server-side in Supabase.
   * 3. If any network request fails **and** the browser is offline,
   *    we fall back to searching the IndexedDB cache.
   */
  async search(
    filters: SearchFilters,
    userLocation?: GeoLocation | null,
  ): Promise<SearchResult> {
    try {
      // ------ Proximity path ------
      if (filters.nearMe && userLocation) {
        const radius = filters.radius ?? 1000; // default 1 km
        const nearbySpots = await DataStore.findNearby(
          userLocation.lng,
          userLocation.lat,
          radius,
        );

        // Apply remaining filters client-side on the nearby set
        const filtered = applyClientFilters(nearbySpots, filters);

        return {
          spots: filtered,
          total: filtered.length,
          appliedFilters: filters,
        };
      }

      // ------ Standard path (server-side filters) ------
      const spots = await DataStore.listSpots(filters);

      return {
        spots,
        total: spots.length,
        appliedFilters: filters,
      };
    } catch (err) {
      // ------ Offline fallback ------
      // When offline (or network fails), search the IndexedDB cache
      // using the same filter interface.
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        return this.searchOffline(filters, userLocation);
      }
      throw err;
    }
  },

  /**
   * Search the IndexedDB offline cache.
   * Applies all filters client-side against the cached spots.
   * For proximity search, calculates distance using the Haversine formula.
   */
  async searchOffline(
    filters: SearchFilters,
    userLocation?: GeoLocation | null,
  ): Promise<SearchResult> {
    let spots: Spot[];

    if (filters.nearMe && userLocation) {
      // Get all cached spots and filter by distance client-side
      const allSpots = await getCachedSpots();
      const radius = filters.radius ?? 1000; // meters
      spots = allSpots.filter((s) => {
        const dist = haversineDistance(
          userLocation.lat,
          userLocation.lng,
          s.location.lat,
          s.location.lng,
        );
        return dist <= radius;
      });
      // Apply remaining filters
      spots = applyClientFilters(spots, filters);
    } else {
      spots = await searchCachedSpots(filters);
    }

    return {
      spots,
      total: spots.length,
      appliedFilters: filters,
    };
  },
};

// ---------------------------------------------------------------------------
// Client-side filter helpers
// (Used when proximity results need further narrowing.)
// ---------------------------------------------------------------------------

/**
 * Haversine distance between two lat/lng points in meters.
 * Used for client-side proximity filtering when offline.
 */
function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371000; // Earth's radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function applyClientFilters(spots: Spot[], filters: SearchFilters): Spot[] {
  let result = spots;

  if (filters.district) {
    result = result.filter(
      (s) => s.district.toLowerCase() === filters.district!.toLowerCase(),
    );
  }

  if (filters.categories && filters.categories.length > 0) {
    const catSet = new Set(filters.categories);
    result = result.filter((s) => catSet.has(s.category));
  }

  if (filters.minRating) {
    result = result.filter(
      (s) => s.rating !== undefined && s.rating >= filters.minRating!,
    );
  }

  if (filters.query) {
    const q = filters.query.toLowerCase();
    result = result.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        (s.notes && s.notes.toLowerCase().includes(q)),
    );
  }

  return result;
}
