'use client';

import type { DistrictStats } from '@/lib/district-tracker';

interface DistrictCardProps {
  district: DistrictStats;
  onSelect: (districtName: string) => void;
}

/**
 * Get a fill color based on completion.
 * 0 spots = gray, increasing spots get progressively greener.
 */
function getCompletionColor(spotCount: number): string {
  if (spotCount === 0) return '#d1d5db'; // gray-300
  if (spotCount === 1) return '#bbf7d0'; // green-200
  if (spotCount <= 3) return '#86efac'; // green-300
  if (spotCount <= 5) return '#4ade80'; // green-400
  if (spotCount <= 10) return '#22c55e'; // green-500
  return '#16a34a'; // green-600
}

export default function DistrictCard({ district, onSelect }: DistrictCardProps) {
  const color = getCompletionColor(district.spotCount);

  return (
    <button
      onClick={() => onSelect(district.name)}
      className="w-full text-left rounded-xl border border-gray-200 bg-white p-4
                 shadow-sm transition-all hover:shadow-md hover:border-gray-300
                 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      <div className="flex items-center gap-3">
        {/* Color indicator */}
        <div
          className="h-10 w-10 flex-shrink-0 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: color }}
        >
          <span className="text-sm font-bold text-white drop-shadow-sm">
            {district.spotCount}
          </span>
        </div>

        {/* Text content */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-900 truncate">
            {district.name}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {district.spotCount === 0
              ? 'Not yet explored'
              : district.spotCount === 1
                ? '1 spot discovered'
                : `${district.spotCount} spots discovered`}
          </p>
        </div>

        {/* Status badge */}
        <div className="flex-shrink-0">
          {district.visited ? (
            <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1
                           text-xs font-medium text-green-700">
              Visited
            </span>
          ) : (
            <span className="inline-flex items-center rounded-full bg-gray-50 px-2 py-1
                           text-xs font-medium text-gray-500">
              Explore
            </span>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-3 h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${Math.min(district.spotCount * 10, 100)}%`,
            backgroundColor: color,
          }}
        />
      </div>
    </button>
  );
}
