'use client';

import { useState, useCallback, useMemo } from 'react';
import type { Spot, Route } from '@/types';
import { computeRoute, distanceToNextWaypoint } from '@/lib/route-planner';

interface UseRouteReturn {
  /** Current ordered list of waypoints */
  waypoints: Spot[];
  /** Computed route (geometry, distance, duration) */
  route: Route;
  /** Index of the current "active" waypoint during navigation */
  activeWaypointIndex: number;
  /** Whether navigation mode is active */
  isNavigating: boolean;
  /** Add a spot to the end of the route */
  addWaypoint: (spot: Spot) => void;
  /** Remove a waypoint by its index */
  removeWaypoint: (index: number) => void;
  /** Move a waypoint from one index to another */
  reorderWaypoint: (fromIndex: number, toIndex: number) => void;
  /** Move a waypoint up by one position */
  moveWaypointUp: (index: number) => void;
  /** Move a waypoint down by one position */
  moveWaypointDown: (index: number) => void;
  /** Clear all waypoints */
  clearRoute: () => void;
  /** Start navigation mode */
  startNavigation: () => void;
  /** Stop navigation mode */
  stopNavigation: () => void;
  /** Advance to the next waypoint during navigation */
  advanceToNextWaypoint: () => void;
  /** Get distance from current position to the next waypoint (km) */
  getDistanceToNext: (
    currentPosition: { lng: number; lat: number },
  ) => number | null;
}

export function useRoute(): UseRouteReturn {
  const [waypoints, setWaypoints] = useState<Spot[]>([]);
  const [activeWaypointIndex, setActiveWaypointIndex] = useState(0);
  const [isNavigating, setIsNavigating] = useState(false);

  const route = useMemo(() => computeRoute(waypoints), [waypoints]);

  const addWaypoint = useCallback((spot: Spot) => {
    setWaypoints((prev) => {
      // Prevent duplicate waypoints
      if (prev.some((wp) => wp.id === spot.id)) return prev;
      return [...prev, spot];
    });
  }, []);

  const removeWaypoint = useCallback((index: number) => {
    setWaypoints((prev) => {
      if (index < 0 || index >= prev.length) return prev;
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  const reorderWaypoint = useCallback(
    (fromIndex: number, toIndex: number) => {
      setWaypoints((prev) => {
        if (
          fromIndex < 0 ||
          fromIndex >= prev.length ||
          toIndex < 0 ||
          toIndex >= prev.length ||
          fromIndex === toIndex
        ) {
          return prev;
        }
        const updated = [...prev];
        const [moved] = updated.splice(fromIndex, 1);
        updated.splice(toIndex, 0, moved);
        return updated;
      });
    },
    [],
  );

  const moveWaypointUp = useCallback((index: number) => {
    setWaypoints((prev) => {
      if (index <= 0 || index >= prev.length) return prev;
      const updated = [...prev];
      [updated[index - 1], updated[index]] = [
        updated[index],
        updated[index - 1],
      ];
      return updated;
    });
  }, []);

  const moveWaypointDown = useCallback((index: number) => {
    setWaypoints((prev) => {
      if (index < 0 || index >= prev.length - 1) return prev;
      const updated = [...prev];
      [updated[index], updated[index + 1]] = [
        updated[index + 1],
        updated[index],
      ];
      return updated;
    });
  }, []);

  const clearRoute = useCallback(() => {
    setWaypoints([]);
    setActiveWaypointIndex(0);
    setIsNavigating(false);
  }, []);

  const startNavigation = useCallback(() => {
    if (waypoints.length === 0) return;
    setActiveWaypointIndex(0);
    setIsNavigating(true);
  }, [waypoints.length]);

  const stopNavigation = useCallback(() => {
    setIsNavigating(false);
    setActiveWaypointIndex(0);
  }, []);

  const advanceToNextWaypoint = useCallback(() => {
    setActiveWaypointIndex((prev) => {
      const next = prev + 1;
      if (next >= waypoints.length) {
        // Reached the end -- stop navigation
        setIsNavigating(false);
        return 0;
      }
      return next;
    });
  }, [waypoints.length]);

  const getDistanceToNext = useCallback(
    (currentPosition: { lng: number; lat: number }): number | null => {
      return distanceToNextWaypoint(
        currentPosition,
        waypoints,
        activeWaypointIndex,
      );
    },
    [waypoints, activeWaypointIndex],
  );

  return {
    waypoints,
    route,
    activeWaypointIndex,
    isNavigating,
    addWaypoint,
    removeWaypoint,
    reorderWaypoint,
    moveWaypointUp,
    moveWaypointDown,
    clearRoute,
    startNavigation,
    stopNavigation,
    advanceToNextWaypoint,
    getDistanceToNext,
  };
}
