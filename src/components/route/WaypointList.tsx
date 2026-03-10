'use client';

import type { Spot } from '@/types';
import { getCategoryConfig } from '@/lib/categories';
import { legDistances } from '@/lib/route-planner';

interface WaypointListProps {
  waypoints: Spot[];
  activeWaypointIndex?: number;
  isNavigating?: boolean;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  onRemove: (index: number) => void;
}

export default function WaypointList({
  waypoints,
  activeWaypointIndex = 0,
  isNavigating = false,
  onMoveUp,
  onMoveDown,
  onRemove,
}: WaypointListProps) {
  const distances = legDistances(waypoints);

  if (waypoints.length === 0) {
    return (
      <div className="px-4 py-8 text-center text-sm text-gray-400">
        No waypoints yet. Tap spots on the map to add them to your route.
      </div>
    );
  }

  return (
    <ol className="divide-y divide-gray-100">
      {waypoints.map((wp, index) => {
        const config = getCategoryConfig(wp.category);
        const isActive = isNavigating && index === activeWaypointIndex;
        const isPast = isNavigating && index < activeWaypointIndex;

        return (
          <li
            key={wp.id}
            className={`flex items-center gap-3 px-4 py-3 transition-colors ${
              isActive
                ? 'bg-blue-50 border-l-4 border-l-blue-500'
                : isPast
                  ? 'opacity-50'
                  : ''
            }`}
          >
            {/* Waypoint number badge */}
            <div
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${
                isActive ? 'bg-blue-500' : 'bg-gray-400'
              }`}
            >
              {index + 1}
            </div>

            {/* Category icon + name */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-sm">{config.icon}</span>
                <span className="truncate text-sm font-medium text-gray-900">
                  {wp.name}
                </span>
              </div>
              {index < distances.length && (
                <p className="mt-0.5 text-xs text-gray-400">
                  {formatDistance(distances[index])} to next
                </p>
              )}
            </div>

            {/* Reorder + remove controls */}
            {!isNavigating && (
              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  aria-label="Move up"
                  disabled={index === 0}
                  onClick={() => onMoveUp(index)}
                  className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-30 disabled:hover:bg-transparent"
                >
                  <ArrowUpIcon />
                </button>
                <button
                  type="button"
                  aria-label="Move down"
                  disabled={index === waypoints.length - 1}
                  onClick={() => onMoveDown(index)}
                  className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-30 disabled:hover:bg-transparent"
                >
                  <ArrowDownIcon />
                </button>
                <button
                  type="button"
                  aria-label="Remove waypoint"
                  onClick={() => onRemove(index)}
                  className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500"
                >
                  <RemoveIcon />
                </button>
              </div>
            )}
          </li>
        );
      })}
    </ol>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)} m`;
  }
  return `${km.toFixed(1)} km`;
}

// ---------------------------------------------------------------------------
// Inline SVG icons (small, no external dependency)
// ---------------------------------------------------------------------------

function ArrowUpIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8 12V4M4 7l4-3 4 3" />
    </svg>
  );
}

function ArrowDownIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8 4v8M4 9l4 3 4-3" />
    </svg>
  );
}

function RemoveIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 4l8 8M12 4l-8 8" />
    </svg>
  );
}
