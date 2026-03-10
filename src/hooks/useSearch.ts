'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { Spot, SearchFilters, GeoLocation } from '@/types';
import { SearchEngine } from '@/lib/search-engine';

const DEBOUNCE_MS = 300;

interface UseSearchOptions {
  /** User location for proximity search. Pass null when unavailable. */
  userLocation?: GeoLocation | null;
}

interface UseSearchReturn {
  /** Current text query (updated on every keystroke). */
  query: string;
  /** Update the text query. Triggers a debounced search. */
  setQuery: (q: string) => void;
  /** Current non-text filters. */
  filters: SearchFilters;
  /** Replace all filters (the text query is merged automatically). */
  setFilters: (f: SearchFilters) => void;
  /** Filtered spots returned by the search engine. */
  results: Spot[];
  /** Whether a search request is in flight. */
  loading: boolean;
  /** Error message from the most recent search, if any. */
  error: string | null;
  /** Force a re-fetch with the current filters. */
  refresh: () => void;
}

/**
 * useSearch manages the full search state:
 *   - text query with 300ms debounce
 *   - structured filters (categories, district, rating, proximity)
 *   - calls SearchEngine.search() and exposes results
 *
 * Usage:
 * ```tsx
 * const { query, setQuery, filters, setFilters, results, loading } = useSearch({
 *   userLocation,
 * });
 * ```
 */
export function useSearch(options: UseSearchOptions = {}): UseSearchReturn {
  const { userLocation } = options;

  // Raw text the user is typing (immediate)
  const [query, setQuery] = useState('');
  // Debounced text query that actually triggers a search
  const [debouncedQuery, setDebouncedQuery] = useState('');
  // Structured (non-text) filters
  const [filters, setFilters] = useState<SearchFilters>({});
  // Results
  const [results, setResults] = useState<Spot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Ref to track the latest request and discard stale responses
  const requestIdRef = useRef(0);

  // ---- Debounce the text query ----
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [query]);

  // ---- Execute search when debounced query or filters change ----
  const executeSearch = useCallback(async () => {
    const id = ++requestIdRef.current;

    const mergedFilters: SearchFilters = {
      ...filters,
      query: debouncedQuery || undefined,
    };

    setLoading(true);
    setError(null);

    try {
      const result = await SearchEngine.search(mergedFilters, userLocation);
      // Only apply if this is still the latest request
      if (id === requestIdRef.current) {
        setResults(result.spots);
      }
    } catch (err) {
      if (id === requestIdRef.current) {
        const message =
          err instanceof Error ? err.message : 'Search failed';
        setError(message);
      }
    } finally {
      if (id === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, [debouncedQuery, filters, userLocation]);

  useEffect(() => {
    executeSearch();
  }, [executeSearch]);

  const refresh = useCallback(() => {
    executeSearch();
  }, [executeSearch]);

  return {
    query,
    setQuery,
    filters,
    setFilters,
    results,
    loading,
    error,
    refresh,
  };
}
