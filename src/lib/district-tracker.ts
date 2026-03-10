import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import bbox from '@turf/bbox';
import type { Feature, FeatureCollection, Polygon, Point } from 'geojson';
import type { Spot, DistrictProgress } from '@/types';
import districtsGeoJSON from '@/data/sf-districts.json';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DistrictFeature extends Feature<Polygon> {
  properties: { name: string };
}

export interface DistrictStats {
  name: string;
  spotCount: number;
  visited: boolean;
  bounds: GeoJSON.Polygon;
  /** Bounding box [minLng, minLat, maxLng, maxLat] */
  bbox: [number, number, number, number];
}

// ---------------------------------------------------------------------------
// GeoJSON data
// ---------------------------------------------------------------------------

const districtCollection = districtsGeoJSON as unknown as FeatureCollection<Polygon>;

/**
 * Return all district features from the static GeoJSON.
 */
export function getDistrictFeatures(): DistrictFeature[] {
  return districtCollection.features as DistrictFeature[];
}

/**
 * Return the full FeatureCollection for use with map Source components.
 */
export function getDistrictGeoJSON(): FeatureCollection<Polygon> {
  return districtCollection;
}

// ---------------------------------------------------------------------------
// Point-in-polygon
// ---------------------------------------------------------------------------

/**
 * Determine which district a given point falls within.
 * Returns the district name or an empty string if no match is found.
 */
export function findDistrictForPoint(lng: number, lat: number): string {
  const point: Feature<Point> = {
    type: 'Feature',
    properties: {},
    geometry: { type: 'Point', coordinates: [lng, lat] },
  };

  for (const feature of districtCollection.features) {
    if (booleanPointInPolygon(point, feature)) {
      return (feature.properties as { name: string }).name;
    }
  }
  return '';
}

// ---------------------------------------------------------------------------
// District stats computation
// ---------------------------------------------------------------------------

/**
 * Compute per-district progress statistics from a list of spots.
 *
 * For each district in the GeoJSON we count how many spots fall within its
 * boundary polygon. A district is considered "visited" if it has at least
 * one spot.
 */
export function computeDistrictStats(spots: Spot[]): DistrictStats[] {
  return districtCollection.features.map((feature) => {
    const name = (feature.properties as { name: string }).name;
    const polygon = feature.geometry;

    const matchingSpots = spots.filter((spot) => {
      const pt: Feature<Point> = {
        type: 'Feature',
        properties: {},
        geometry: { type: 'Point', coordinates: [spot.location.lng, spot.location.lat] },
      };
      return booleanPointInPolygon(pt, feature);
    });

    const featureBbox = bbox(feature) as [number, number, number, number];

    return {
      name,
      spotCount: matchingSpots.length,
      visited: matchingSpots.length > 0,
      bounds: polygon,
      bbox: featureBbox,
    };
  });
}

/**
 * Convert DistrictStats[] into the DistrictProgress[] type used elsewhere.
 */
export function toDistrictProgress(stats: DistrictStats[]): DistrictProgress[] {
  return stats.map((s) => ({
    name: s.name,
    bounds: s.bounds,
    spotCount: s.spotCount,
    visited: s.visited,
  }));
}

/**
 * Compute overall completion: percentage of districts that have been visited.
 */
export function computeOverallCompletion(stats: DistrictStats[]): number {
  if (stats.length === 0) return 0;
  const visitedCount = stats.filter((s) => s.visited).length;
  return Math.round((visitedCount / stats.length) * 100);
}
