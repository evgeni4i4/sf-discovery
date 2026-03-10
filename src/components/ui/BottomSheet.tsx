'use client';

import { useCallback, useState } from 'react';
import type { Spot } from '@/types';
import { getCategoryConfig } from '@/lib/categories';

interface BottomSheetProps {
  spots: Spot[];
  loading: boolean;
  /** Navigate to a spot detail page. */
  onSpotTap: (spotId: string) => void;
}

type SheetState = 'collapsed' | 'peek' | 'expanded';

function renderStars(rating: number): string {
  const filled = Math.round(rating);
  return '\u2605'.repeat(filled) + '\u2606'.repeat(5 - filled);
}

/**
 * Draggable bottom sheet that shows a list of nearby/filtered spots.
 *
 * States:
 * - collapsed: only the drag handle is visible (above the bottom nav)
 * - peek: shows 2-3 items
 * - expanded: takes up ~60% of the viewport
 */
export default function BottomSheet({
  spots,
  loading,
  onSpotTap,
}: BottomSheetProps) {
  const [state, setState] = useState<SheetState>('peek');

  const toggleState = useCallback(() => {
    setState((prev) => {
      if (prev === 'collapsed') return 'peek';
      if (prev === 'peek') return 'expanded';
      return 'collapsed';
    });
  }, []);

  const heightClass =
    state === 'collapsed'
      ? 'max-h-10'
      : state === 'peek'
        ? 'max-h-[35vh]'
        : 'max-h-[65vh]';

  return (
    <div
      className={`
        fixed inset-x-0 bottom-[52px] z-30
        bg-white rounded-t-2xl shadow-[0_-4px_20px_rgba(0,0,0,0.08)]
        border-t border-gray-100
        transition-all duration-300 ease-out
        ${heightClass}
        flex flex-col
      `}
    >
      {/* Drag handle */}
      <button
        type="button"
        onClick={toggleState}
        className="flex w-full items-center justify-center py-2.5 shrink-0"
        aria-label={state === 'expanded' ? 'Collapse panel' : 'Expand panel'}
      >
        <div className="h-1 w-10 rounded-full bg-gray-300" />
      </button>

      {/* Header */}
      {state !== 'collapsed' && (
        <div className="flex items-center justify-between px-4 pb-2 shrink-0">
          <h2 className="text-sm font-semibold text-gray-900">
            {loading ? 'Loading...' : `${spots.length} spot${spots.length !== 1 ? 's' : ''}`}
          </h2>
          {state === 'expanded' && (
            <button
              type="button"
              onClick={() => setState('peek')}
              className="text-xs font-medium text-blue-600 hover:text-blue-700"
            >
              Collapse
            </button>
          )}
        </div>
      )}

      {/* Spot list */}
      {state !== 'collapsed' && (
        <div className="flex-1 overflow-y-auto overscroll-contain px-2 pb-2">
          {loading && spots.length === 0 && (
            <div className="flex items-center justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-200 border-t-blue-600" />
            </div>
          )}

          {!loading && spots.length === 0 && (
            <div className="py-8 text-center">
              <p className="text-sm text-gray-500">No spots found</p>
              <p className="mt-1 text-xs text-gray-400">
                Long-press the map to add your first spot!
              </p>
            </div>
          )}

          {spots.map((spot) => {
            const config = getCategoryConfig(spot.category);
            return (
              <button
                key={spot.id}
                type="button"
                onClick={() => onSpotTap(spot.id)}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-gray-50 active:bg-gray-100 transition-colors"
              >
                {/* Category icon */}
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg"
                  style={{ backgroundColor: `${config.color}20`, color: config.color }}
                >
                  {config.icon}
                </div>

                {/* Details */}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900">
                    {spot.name}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>{config.label}</span>
                    {spot.district && (
                      <>
                        <span aria-hidden="true" className="text-gray-300">|</span>
                        <span>{spot.district}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Rating */}
                {spot.rating != null && spot.rating > 0 && (
                  <span className="shrink-0 text-xs text-amber-500" aria-label={`${spot.rating} stars`}>
                    {renderStars(spot.rating)}
                  </span>
                )}

                {/* Chevron */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-4 w-4 shrink-0 text-gray-300"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
