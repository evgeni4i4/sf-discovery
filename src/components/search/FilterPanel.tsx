'use client';

import { useCallback, useState } from 'react';
import type { SpotCategory, SearchFilters } from '@/types';
import { CATEGORIES } from '@/lib/categories';
import { SF_DISTRICTS } from '@/lib/search-engine';

interface FilterPanelProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  /** Whether the user's location is available (enables the "Near Me" toggle) */
  hasLocation: boolean;
}

/**
 * Collapsible filter panel with:
 * - Category chip toggles
 * - Minimum rating slider (1-5)
 * - District dropdown
 * - "Near Me" proximity toggle (with radius slider when active)
 */
export default function FilterPanel({
  filters,
  onFiltersChange,
  hasLocation,
}: FilterPanelProps) {
  const [open, setOpen] = useState(false);

  // Derived state
  const selectedCategories = new Set(filters.categories ?? []);
  const activeFilterCount = countActiveFilters(filters);

  // ---- Category toggle ----
  const toggleCategory = useCallback(
    (cat: SpotCategory) => {
      const current = new Set(filters.categories ?? []);
      if (current.has(cat)) {
        current.delete(cat);
      } else {
        current.add(cat);
      }
      onFiltersChange({
        ...filters,
        categories: current.size > 0 ? Array.from(current) : undefined,
      });
    },
    [filters, onFiltersChange],
  );

  // ---- District change ----
  const handleDistrictChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const value = e.target.value;
      onFiltersChange({
        ...filters,
        district: value || undefined,
      });
    },
    [filters, onFiltersChange],
  );

  // ---- Rating change ----
  const handleRatingChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = Number(e.target.value);
      onFiltersChange({
        ...filters,
        minRating: value > 0 ? value : undefined,
      });
    },
    [filters, onFiltersChange],
  );

  // ---- Near Me toggle ----
  const toggleNearMe = useCallback(() => {
    onFiltersChange({
      ...filters,
      nearMe: !filters.nearMe,
      radius: !filters.nearMe ? (filters.radius ?? 1000) : filters.radius,
    });
  }, [filters, onFiltersChange]);

  // ---- Radius change ----
  const handleRadiusChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onFiltersChange({
        ...filters,
        radius: Number(e.target.value),
      });
    },
    [filters, onFiltersChange],
  );

  // ---- Clear all ----
  const clearAll = useCallback(() => {
    onFiltersChange({});
  }, [onFiltersChange]);

  return (
    <div className="rounded-xl bg-white/90 backdrop-blur shadow-sm border border-gray-200 overflow-hidden">
      {/* Header / Toggle bar */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        aria-expanded={open}
        aria-controls="filter-panel-content"
      >
        <span className="flex items-center gap-2">
          {/* Filter icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-4 w-4"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M2.628 1.601C5.028 1.206 7.49 1 10 1s4.973.206 7.372.601a.75.75 0 0 1 .628.74v2.288a2.25 2.25 0 0 1-.659 1.59l-4.682 4.683a2.25 2.25 0 0 0-.659 1.59v3.037c0 .684-.31 1.33-.844 1.757l-1.937 1.55A.75.75 0 0 1 8 18.25v-5.757a2.25 2.25 0 0 0-.659-1.591L2.659 6.22A2.25 2.25 0 0 1 2 4.629V2.34a.75.75 0 0 1 .628-.74Z"
              clipRule="evenodd"
            />
          </svg>
          Filters
          {activeFilterCount > 0 && (
            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-500 px-1.5 text-xs font-semibold text-white">
              {activeFilterCount}
            </span>
          )}
        </span>

        {/* Chevron */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {/* Collapsible content */}
      {open && (
        <div id="filter-panel-content" className="border-t border-gray-100 px-4 py-3 space-y-4">
          {/* ---- Categories ---- */}
          <div>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
              Categories
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((cat) => {
                const active = selectedCategories.has(cat.id);
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => toggleCategory(cat.id)}
                    className={`
                      inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium
                      border transition-colors
                      ${
                        active
                          ? 'border-blue-300 bg-blue-50 text-blue-700'
                          : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                      }
                    `}
                    aria-pressed={active}
                  >
                    <span aria-hidden="true">{cat.icon}</span>
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ---- Min Rating ---- */}
          <div>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
              Minimum Rating
            </h3>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={0}
                max={5}
                step={1}
                value={filters.minRating ?? 0}
                onChange={handleRatingChange}
                className="flex-1 accent-blue-500"
                aria-label="Minimum rating"
              />
              <span className="w-12 text-center text-sm font-medium text-gray-700">
                {filters.minRating ? `${filters.minRating}+` : 'Any'}
              </span>
            </div>
          </div>

          {/* ---- District ---- */}
          <div>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
              District
            </h3>
            <select
              value={filters.district ?? ''}
              onChange={handleDistrictChange}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              aria-label="Filter by district"
            >
              <option value="">All Districts</option>
              {SF_DISTRICTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* ---- Near Me ---- */}
          <div>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
              Proximity
            </h3>
            <button
              type="button"
              onClick={toggleNearMe}
              disabled={!hasLocation}
              className={`
                inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium
                border transition-colors
                ${
                  filters.nearMe
                    ? 'border-blue-300 bg-blue-50 text-blue-700'
                    : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                }
                ${!hasLocation ? 'opacity-50 cursor-not-allowed' : ''}
              `}
              aria-pressed={!!filters.nearMe}
            >
              {/* Location pin icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-4 w-4"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="m9.69 18.933.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 0 0 .281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 1 0 3 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 0 0 2.273 1.765 11.842 11.842 0 0 0 .976.544l.062.029.018.008.006.003ZM10 11.25a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5Z"
                  clipRule="evenodd"
                />
              </svg>
              Near Me
            </button>

            {!hasLocation && (
              <p className="mt-1 text-xs text-gray-400">
                Enable location to use proximity search
              </p>
            )}

            {filters.nearMe && hasLocation && (
              <div className="mt-2 flex items-center gap-3">
                <input
                  type="range"
                  min={100}
                  max={5000}
                  step={100}
                  value={filters.radius ?? 1000}
                  onChange={handleRadiusChange}
                  className="flex-1 accent-blue-500"
                  aria-label="Search radius in meters"
                />
                <span className="w-16 text-center text-sm font-medium text-gray-700">
                  {formatRadius(filters.radius ?? 1000)}
                </span>
              </div>
            )}
          </div>

          {/* ---- Clear all ---- */}
          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={clearAll}
              className="w-full rounded-lg border border-gray-200 bg-white py-2 text-center text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors"
            >
              Clear All Filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function countActiveFilters(filters: SearchFilters): number {
  let count = 0;
  if (filters.categories && filters.categories.length > 0) count++;
  if (filters.minRating) count++;
  if (filters.district) count++;
  if (filters.nearMe) count++;
  return count;
}

function formatRadius(meters: number): string {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1)} km`;
  }
  return `${meters} m`;
}
