'use client';

import { useMemo } from 'react';
import { Source, Layer } from 'react-map-gl/maplibre';
import type { FillLayerSpecification, LineLayerSpecification } from 'maplibre-gl';
import type { FeatureCollection, Polygon } from 'geojson';
import type { DistrictStats } from '@/lib/district-tracker';
import { getDistrictGeoJSON } from '@/lib/district-tracker';

interface DistrictLayerProps {
  districtStats: DistrictStats[];
  selectedDistrict: string | null;
}

/**
 * Get a fill color based on spot count.
 * 0 spots = light gray, more spots = progressively greener.
 */
function getDistrictFillColor(spotCount: number): string {
  if (spotCount === 0) return 'rgba(156, 163, 175, 0.15)';  // gray, very translucent
  if (spotCount === 1) return 'rgba(34, 197, 94, 0.15)';
  if (spotCount <= 3) return 'rgba(34, 197, 94, 0.25)';
  if (spotCount <= 5) return 'rgba(34, 197, 94, 0.35)';
  if (spotCount <= 10) return 'rgba(34, 197, 94, 0.45)';
  return 'rgba(22, 163, 74, 0.55)';
}

/**
 * DistrictLayer renders polygon fills and outlines for SF neighborhoods.
 *
 * Each district fill color is determined by the number of spots discovered.
 * The selected district gets a highlighted stroke.
 */
export default function DistrictLayer({
  districtStats,
  selectedDistrict,
}: DistrictLayerProps) {
  // Build a lookup from district name to spot count
  const statsMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const s of districtStats) {
      map.set(s.name, s.spotCount);
    }
    return map;
  }, [districtStats]);

  // Build a colored GeoJSON by injecting fill-color properties
  const coloredGeoJSON = useMemo((): FeatureCollection<Polygon> => {
    const base = getDistrictGeoJSON();
    return {
      ...base,
      features: base.features.map((feature) => {
        const name = (feature.properties as { name: string }).name;
        const spotCount = statsMap.get(name) ?? 0;
        const isSelected = name === selectedDistrict;
        return {
          ...feature,
          properties: {
            ...feature.properties,
            fillColor: getDistrictFillColor(spotCount),
            strokeColor: isSelected ? '#2563eb' : 'rgba(107, 114, 128, 0.5)',
            strokeWidth: isSelected ? 3 : 1,
            spotCount,
          },
        };
      }),
    };
  }, [statsMap, selectedDistrict]);

  const fillStyle: FillLayerSpecification = {
    id: 'district-fills',
    type: 'fill',
    source: 'districts',
    paint: {
      'fill-color': ['get', 'fillColor'],
      'fill-opacity': 1,
    },
  };

  const lineStyle: LineLayerSpecification = {
    id: 'district-outlines',
    type: 'line',
    source: 'districts',
    paint: {
      'line-color': ['get', 'strokeColor'],
      'line-width': ['get', 'strokeWidth'],
    },
  };

  return (
    <Source id="districts" type="geojson" data={coloredGeoJSON}>
      <Layer {...fillStyle} />
      <Layer {...lineStyle} />
    </Source>
  );
}
