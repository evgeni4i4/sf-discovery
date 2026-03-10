'use client';

import { useRef, useCallback, useState } from 'react';
import Link from 'next/link';
import Map, { MapRef, NavigationControl } from 'react-map-gl/maplibre';
import type { LngLatBoundsLike } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useSpots } from '@/hooks/useSpots';
import { useDistricts } from '@/hooks/useDistricts';
import DistrictList from '@/components/districts/DistrictList';
import DistrictLayer from '@/components/map/DistrictLayer';
import SpotMarkers from '@/components/map/SpotMarkers';

const MAPTILER_KEY = process.env.NEXT_PUBLIC_MAPTILER_KEY;
const MAP_STYLE = `https://api.maptiler.com/maps/streets-v2/style.json?key=${MAPTILER_KEY}`;

const SF_CENTER = { longitude: -122.4194, latitude: 37.7749 };
const DEFAULT_ZOOM = 12;

export default function DistrictsPage() {
  const mapRef = useRef<MapRef>(null);
  const { spots, loading } = useSpots();
  const { districts, overallCompletion, selectedDistrict, selectDistrict } =
    useDistricts({ spots });
  const [showList, setShowList] = useState(true);

  /** Zoom the map to the selected district's bounding box. */
  const handleSelectDistrict = useCallback(
    (districtName: string) => {
      selectDistrict(districtName);

      const district = districts.find((d) => d.name === districtName);
      if (!district || !mapRef.current) return;

      const [minLng, minLat, maxLng, maxLat] = district.bbox;
      const bounds: LngLatBoundsLike = [
        [minLng, minLat],
        [maxLng, maxLat],
      ];

      mapRef.current.fitBounds(bounds, {
        padding: 60,
        duration: 800,
      });
    },
    [districts, selectDistrict],
  );

  const handleSpotTap = useCallback(() => {
    // no-op for now; districts page focuses on district navigation
  }, []);

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-gray-200 bg-white/95 backdrop-blur-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <h1 className="text-lg font-bold text-gray-900">Districts</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              {overallCompletion}% of San Francisco explored
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700
                         hover:bg-gray-200 transition-colors"
            >
              Map
            </Link>
            <button
              onClick={() => setShowList((v) => !v)}
              className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700
                         hover:bg-blue-100 transition-colors md:hidden"
            >
              {showList ? 'Hide List' : 'Show List'}
            </button>
          </div>
        </div>
      </header>

      {/* Main content: map + list */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0">
        {/* Map */}
        <div className="flex-1 relative min-h-[300px]">
          {loading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60">
              <p className="text-sm text-gray-400">Loading spots...</p>
            </div>
          )}

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
            <DistrictLayer
              districtStats={districts}
              selectedDistrict={selectedDistrict}
            />
            <SpotMarkers spots={spots} onSpotTap={handleSpotTap} />
          </Map>

          {/* Deselect button overlay */}
          {selectedDistrict && (
            <button
              onClick={() => {
                selectDistrict(null);
                mapRef.current?.flyTo({
                  center: [SF_CENTER.longitude, SF_CENTER.latitude],
                  zoom: DEFAULT_ZOOM,
                  duration: 800,
                });
              }}
              className="absolute top-3 left-3 z-10 rounded-lg bg-white/90 shadow-md
                         px-3 py-1.5 text-xs font-medium text-gray-700
                         hover:bg-white transition-colors backdrop-blur-sm"
            >
              &larr; All Districts
            </button>
          )}
        </div>

        {/* District list panel */}
        <div
          className={`md:w-80 lg:w-96 border-t md:border-t-0 md:border-l border-gray-200
            bg-white overflow-hidden transition-all
            ${showList ? 'h-[45vh] md:h-auto' : 'h-0 md:h-auto'}
          `}
        >
          <DistrictList
            districts={districts}
            onSelectDistrict={handleSelectDistrict}
          />
        </div>
      </div>
    </div>
  );
}
