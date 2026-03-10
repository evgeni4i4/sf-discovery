'use client';

import { useRef, useCallback, useState, useMemo } from 'react';
import Map, {
  MapRef,
  NavigationControl,
  Marker,
} from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';

import Link from 'next/link';
import { useSpots } from '@/hooks/useSpots';
import { useRoute } from '@/hooks/useRoute';
import { useLocation } from '@/hooks/useLocation';
import { getCategoryConfig } from '@/lib/categories';
import type { Spot } from '@/types';

import RouteLayer from '@/components/map/RouteLayer';
import RouteStats from '@/components/route/RouteStats';
import WaypointList from '@/components/route/WaypointList';
import UserLocationDot from '@/components/map/UserLocation';

const MAPTILER_KEY = process.env.NEXT_PUBLIC_MAPTILER_KEY;
const MAP_STYLE = `https://api.maptiler.com/maps/streets-v2/style.json?key=${MAPTILER_KEY}`;

const SF_CENTER = { longitude: -122.4194, latitude: 37.7749 };
const DEFAULT_ZOOM = 12;

export default function RoutePage() {
  const mapRef = useRef<MapRef>(null);
  const { spots, loading } = useSpots();
  const { location: userLocation } = useLocation();
  const [panelOpen, setPanelOpen] = useState(true);

  const {
    waypoints,
    route,
    activeWaypointIndex,
    isNavigating,
    addWaypoint,
    removeWaypoint,
    moveWaypointUp,
    moveWaypointDown,
    clearRoute,
    startNavigation,
    stopNavigation,
    advanceToNextWaypoint,
    getDistanceToNext,
  } = useRoute();

  // Set of waypoint IDs for quick lookup when rendering markers
  const waypointIds = useMemo(
    () => new Set(waypoints.map((wp) => wp.id)),
    [waypoints],
  );

  const handleSpotTap = useCallback(
    (spot: Spot) => {
      if (isNavigating) return; // Don't modify route while navigating
      if (waypointIds.has(spot.id)) {
        // Already in route -- remove it
        const idx = waypoints.findIndex((wp) => wp.id === spot.id);
        if (idx >= 0) removeWaypoint(idx);
      } else {
        addWaypoint(spot);
      }
    },
    [isNavigating, waypointIds, waypoints, removeWaypoint, addWaypoint],
  );

  // Compute distance to the active waypoint for the navigation indicator
  const distToNext =
    isNavigating && userLocation
      ? getDistanceToNext({
          lng: userLocation.lng,
          lat: userLocation.lat,
        })
      : null;

  const activeWaypoint =
    isNavigating && activeWaypointIndex < waypoints.length
      ? waypoints[activeWaypointIndex]
      : null;

  return (
    <div className="flex h-dvh flex-col bg-white">
      {/* Header */}
      <header className="flex shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100"
            aria-label="Back to map"
          >
            <BackIcon />
          </Link>
          <h1 className="text-lg font-bold text-gray-900">Route Planner</h1>
        </div>
        <div className="flex items-center gap-2">
          {waypoints.length > 0 && !isNavigating && (
            <>
              <button
                type="button"
                onClick={clearRoute}
                className="rounded-lg px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={startNavigation}
                className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 transition-colors"
              >
                Start
              </button>
            </>
          )}
          {isNavigating && (
            <button
              type="button"
              onClick={stopNavigation}
              className="rounded-lg bg-gray-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-700 transition-colors"
            >
              Stop
            </button>
          )}
        </div>
      </header>

      {/* Navigation indicator */}
      {isNavigating && activeWaypoint && (
        <div className="shrink-0 border-b border-blue-100 bg-blue-50 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium uppercase tracking-wide text-blue-600">
                Next stop
              </p>
              <p className="truncate text-sm font-semibold text-gray-900">
                {activeWaypoint.name}
              </p>
              {distToNext !== null && (
                <p className="text-xs text-gray-500">
                  {distToNext < 1
                    ? `${Math.round(distToNext * 1000)} m away`
                    : `${distToNext.toFixed(1)} km away`}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={advanceToNextWaypoint}
              className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-medium text-white hover:bg-blue-700 transition-colors"
            >
              Arrived
            </button>
          </div>
        </div>
      )}

      {/* Map */}
      <div className="relative flex-1">
        <Map
          ref={mapRef}
          initialViewState={{
            ...SF_CENTER,
            zoom: DEFAULT_ZOOM,
          }}
          style={{ width: '100%', height: '100%' }}
          mapStyle={MAP_STYLE}
        >
          <NavigationControl position="top-right" />

          {/* Spot markers */}
          {spots.map((spot) => {
            const config = getCategoryConfig(spot.category);
            const inRoute = waypointIds.has(spot.id);

            return (
              <Marker
                key={spot.id}
                longitude={spot.location.lng}
                latitude={spot.location.lat}
                anchor="bottom"
                onClick={(e) => {
                  e.originalEvent.stopPropagation();
                  handleSpotTap(spot);
                }}
              >
                <div
                  className="cursor-pointer transition-transform hover:scale-110"
                  title={spot.name}
                >
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-full border-2 shadow-md ${
                      inRoute
                        ? 'border-blue-500 ring-2 ring-blue-300'
                        : 'border-white'
                    }`}
                    style={{ backgroundColor: config.color }}
                  >
                    <span className="text-sm leading-none">{config.icon}</span>
                  </div>
                </div>
              </Marker>
            );
          })}

          {/* Route polyline */}
          <RouteLayer route={route} />

          {/* User location dot */}
          {userLocation && <UserLocationDot location={userLocation} />}
        </Map>

        {/* Toggle panel button */}
        <button
          type="button"
          onClick={() => setPanelOpen((prev) => !prev)}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-white px-4 py-2 text-xs font-medium text-gray-700 shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors md:hidden"
        >
          {panelOpen
            ? 'Hide route panel'
            : `Show route (${waypoints.length} stops)`}
        </button>
      </div>

      {/* Bottom panel: stats + waypoint list */}
      {panelOpen && (
        <div className="shrink-0 max-h-[40vh] overflow-y-auto border-t border-gray-200 bg-white">
          {loading && waypoints.length === 0 && (
            <p className="px-4 py-6 text-center text-sm text-gray-400">
              Loading spots...
            </p>
          )}

          {/* Route stats */}
          <div className="px-4 pt-3 pb-1">
            <RouteStats route={route} />
          </div>

          {/* Waypoint list */}
          <WaypointList
            waypoints={waypoints}
            activeWaypointIndex={activeWaypointIndex}
            isNavigating={isNavigating}
            onMoveUp={moveWaypointUp}
            onMoveDown={moveWaypointDown}
            onRemove={removeWaypoint}
          />
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Inline SVG icon
// ---------------------------------------------------------------------------

function BackIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 4l-6 6 6 6" />
    </svg>
  );
}
