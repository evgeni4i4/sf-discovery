'use client';

import { Source, Layer } from 'react-map-gl/maplibre';
import type { Route } from '@/types';

interface RouteLayerProps {
  route: Route;
}

/**
 * Renders the route as a GeoJSON polyline on the MapLibre map.
 * Must be placed as a child of the `<Map>` component.
 *
 * The route is drawn as a blue line with a semi-transparent casing
 * for better visibility against varying map backgrounds.
 */
export default function RouteLayer({ route }: RouteLayerProps) {
  const { geometry } = route;

  // Don't render if there are fewer than 2 coordinates
  if (!geometry || geometry.coordinates.length < 2) {
    return null;
  }

  const geojson: GeoJSON.Feature<GeoJSON.LineString> = {
    type: 'Feature',
    properties: {},
    geometry,
  };

  return (
    <Source id="route-source" type="geojson" data={geojson}>
      {/* Casing (wider, semi-transparent line behind the main line) */}
      <Layer
        id="route-casing"
        type="line"
        layout={{
          'line-join': 'round',
          'line-cap': 'round',
        }}
        paint={{
          'line-color': '#1a73e8',
          'line-width': 8,
          'line-opacity': 0.25,
        }}
      />
      {/* Main route line */}
      <Layer
        id="route-line"
        type="line"
        layout={{
          'line-join': 'round',
          'line-cap': 'round',
        }}
        paint={{
          'line-color': '#1a73e8',
          'line-width': 4,
          'line-opacity': 0.85,
        }}
      />
    </Source>
  );
}
