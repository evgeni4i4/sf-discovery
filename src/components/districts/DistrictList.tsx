'use client';

import { useMemo, useState } from 'react';
import type { DistrictStats } from '@/lib/district-tracker';
import DistrictCard from './DistrictCard';

type SortMode = 'name' | 'spots' | 'status';

interface DistrictListProps {
  districts: DistrictStats[];
  onSelectDistrict: (districtName: string) => void;
}

export default function DistrictList({
  districts,
  onSelectDistrict,
}: DistrictListProps) {
  const [sortMode, setSortMode] = useState<SortMode>('name');

  const sorted = useMemo(() => {
    const copy = [...districts];
    switch (sortMode) {
      case 'name':
        return copy.sort((a, b) => a.name.localeCompare(b.name));
      case 'spots':
        return copy.sort((a, b) => b.spotCount - a.spotCount);
      case 'status':
        return copy.sort((a, b) => {
          // Unvisited first so they stand out
          if (a.visited !== b.visited) return a.visited ? 1 : -1;
          return a.name.localeCompare(b.name);
        });
      default:
        return copy;
    }
  }, [districts, sortMode]);

  const visitedCount = districts.filter((d) => d.visited).length;
  const totalSpots = districts.reduce((sum, d) => sum + d.spotCount, 0);

  return (
    <div className="flex flex-col h-full">
      {/* Summary bar */}
      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">
            <span className="font-semibold text-gray-900">{visitedCount}</span>
            {' / '}
            {districts.length} districts explored
          </span>
          <span className="text-gray-500">
            {totalSpots} total spots
          </span>
        </div>
        {/* Overall progress bar */}
        <div className="mt-2 h-2 w-full rounded-full bg-gray-200 overflow-hidden">
          <div
            className="h-full rounded-full bg-green-500 transition-all duration-500"
            style={{
              width: districts.length > 0
                ? `${Math.round((visitedCount / districts.length) * 100)}%`
                : '0%',
            }}
          />
        </div>
      </div>

      {/* Sort controls */}
      <div className="px-4 py-2 flex gap-2 border-b border-gray-100">
        {(['name', 'spots', 'status'] as SortMode[]).map((mode) => (
          <button
            key={mode}
            onClick={() => setSortMode(mode)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors
              ${sortMode === mode
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
          >
            {mode === 'name' ? 'A-Z' : mode === 'spots' ? 'Most Spots' : 'Unvisited'}
          </button>
        ))}
      </div>

      {/* Scrollable list */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {sorted.map((district) => (
          <DistrictCard
            key={district.name}
            district={district}
            onSelect={onSelectDistrict}
          />
        ))}
      </div>
    </div>
  );
}
