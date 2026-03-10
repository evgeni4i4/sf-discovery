import type { Spot, Route } from '@/types';

/** Average walking speed in km/h */
const WALKING_SPEED_KMH = 5;

/** Earth radius in km for Haversine formula */
const EARTH_RADIUS_KM = 6371;

/**
 * Convert degrees to radians.
 */
function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/**
 * Compute the Haversine (great-circle) distance between two points in km.
 */
export function haversineDistance(
  a: { lng: number; lat: number },
  b: { lng: number; lat: number },
): number {
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);
  const h =
    sinLat * sinLat +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * sinLng * sinLng;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
}

/**
 * Compute a walking route through an ordered list of waypoints (Spots).
 *
 * Uses straight-line (Haversine) segments between consecutive waypoints.
 * Returns a Route with a GeoJSON LineString geometry, total distance in km,
 * and estimated walking duration in minutes.
 */
export function computeRoute(waypoints: Spot[]): Route {
  if (waypoints.length === 0) {
    return {
      geometry: { type: 'LineString', coordinates: [] },
      distanceKm: 0,
      durationMin: 0,
      waypoints: [],
    };
  }

  if (waypoints.length === 1) {
    const wp = waypoints[0];
    return {
      geometry: {
        type: 'LineString',
        coordinates: [[wp.location.lng, wp.location.lat]],
      },
      distanceKm: 0,
      durationMin: 0,
      waypoints,
    };
  }

  const coordinates: [number, number][] = waypoints.map((wp) => [
    wp.location.lng,
    wp.location.lat,
  ]);

  let totalDistanceKm = 0;
  for (let i = 1; i < waypoints.length; i++) {
    totalDistanceKm += haversineDistance(
      waypoints[i - 1].location,
      waypoints[i].location,
    );
  }

  const durationMin = (totalDistanceKm / WALKING_SPEED_KMH) * 60;

  return {
    geometry: { type: 'LineString', coordinates },
    distanceKm: totalDistanceKm,
    durationMin,
    waypoints,
  };
}

/**
 * Compute the distance from a point to the next waypoint in the route.
 * Returns distance in km or null if there is no next waypoint.
 */
export function distanceToNextWaypoint(
  currentPosition: { lng: number; lat: number },
  waypoints: Spot[],
  currentWaypointIndex: number,
): number | null {
  if (currentWaypointIndex >= waypoints.length) return null;
  return haversineDistance(
    currentPosition,
    waypoints[currentWaypointIndex].location,
  );
}

/**
 * Compute per-leg distances between consecutive waypoints.
 * Returns an array of distances in km (length = waypoints.length - 1).
 */
export function legDistances(waypoints: Spot[]): number[] {
  const distances: number[] = [];
  for (let i = 1; i < waypoints.length; i++) {
    distances.push(
      haversineDistance(waypoints[i - 1].location, waypoints[i].location),
    );
  }
  return distances;
}
