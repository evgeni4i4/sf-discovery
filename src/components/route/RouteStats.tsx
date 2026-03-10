'use client';

import type { Route } from '@/types';

interface RouteStatsProps {
  route: Route;
}

export default function RouteStats({ route }: RouteStatsProps) {
  const { distanceKm, durationMin, waypoints } = route;
  const stopCount = waypoints.length;

  if (stopCount === 0) {
    return null;
  }

  return (
    <div className="flex items-center justify-around gap-2 rounded-xl bg-gray-50 px-4 py-3">
      <StatItem
        label="Distance"
        value={formatDistance(distanceKm)}
      />
      <Divider />
      <StatItem
        label="Walk time"
        value={formatDuration(durationMin)}
      />
      <Divider />
      <StatItem
        label="Stops"
        value={String(stopCount)}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-lg font-semibold text-gray-900">{value}</span>
      <span className="text-xs text-gray-500">{label}</span>
    </div>
  );
}

function Divider() {
  return <div className="h-8 w-px bg-gray-200" />;
}

// ---------------------------------------------------------------------------
// Formatters
// ---------------------------------------------------------------------------

function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)} m`;
  }
  return `${km.toFixed(1)} km`;
}

function formatDuration(minutes: number): string {
  if (minutes < 1) {
    return '< 1 min';
  }
  if (minutes < 60) {
    return `${Math.round(minutes)} min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}
