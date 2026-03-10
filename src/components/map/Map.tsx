'use client';

import { useRef, useCallback, useState } from 'react';
import Map, {
  MapRef,
  NavigationControl,
  MapLayerMouseEvent,
  MapLayerTouchEvent,
} from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Spot, GeoLocation } from '@/types';
import SpotMarkers from './SpotMarkers';
import UserLocationDot from './UserLocation';
import SpotPopup from './SpotPopup';

const MAPTILER_KEY = process.env.NEXT_PUBLIC_MAPTILER_KEY;
const MAP_STYLE = `https://api.maptiler.com/maps/streets-v2/style.json?key=${MAPTILER_KEY}`;

const SF_CENTER = { longitude: -122.4194, latitude: 37.7749 };
const DEFAULT_ZOOM = 12;

/** Duration in ms to qualify as a long press */
const LONG_PRESS_MS = 500;

interface MapViewProps {
  spots: Spot[];
  userLocation: GeoLocation | null;
  selectedDistrict: string | null;
  onMapLongPress: (coords: { lng: number; lat: number }) => void;
  onSpotTap: (spotId: string) => void;
}

export default function MapView({
  spots,
  userLocation,
  selectedDistrict: _selectedDistrict,
  onMapLongPress,
  onSpotTap,
}: MapViewProps) {
  const mapRef = useRef<MapRef>(null);
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null);
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pressCoords = useRef<{ lng: number; lat: number } | null>(null);

  // SpotMarkers passes a spot ID string; look up the Spot to show popup
  const handleSpotTap = useCallback(
    (spotId: string) => {
      const spot = spots.find((s) => s.id === spotId) ?? null;
      setSelectedSpot(spot);
      onSpotTap(spotId);
    },
    [spots, onSpotTap],
  );

  const handleClosePopup = useCallback(() => {
    setSelectedSpot(null);
  }, []);

  // ---- Long-press detection helpers ----

  const clearPressTimer = useCallback(() => {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
  }, []);

  const startPressTimer = useCallback(
    (lng: number, lat: number) => {
      pressCoords.current = { lng, lat };
      pressTimer.current = setTimeout(() => {
        if (pressCoords.current) {
          onMapLongPress(pressCoords.current);
        }
      }, LONG_PRESS_MS);
    },
    [onMapLongPress],
  );

  // Mouse long-press (desktop)
  const handleMouseDown = useCallback(
    (e: MapLayerMouseEvent) => {
      startPressTimer(e.lngLat.lng, e.lngLat.lat);
    },
    [startPressTimer],
  );

  const handleMouseUp = useCallback(() => {
    clearPressTimer();
  }, [clearPressTimer]);

  // Cancel long-press when user starts dragging
  const handleDragStart = useCallback(() => {
    clearPressTimer();
  }, [clearPressTimer]);

  // Touch long-press (mobile)
  const handleTouchStart = useCallback(
    (e: MapLayerTouchEvent) => {
      startPressTimer(e.lngLat.lng, e.lngLat.lat);
    },
    [startPressTimer],
  );

  const handleTouchEnd = useCallback(() => {
    clearPressTimer();
  }, [clearPressTimer]);

  const handleTouchMove = useCallback(() => {
    clearPressTimer();
  }, [clearPressTimer]);

  return (
    <Map
      ref={mapRef}
      initialViewState={{
        ...SF_CENTER,
        zoom: DEFAULT_ZOOM,
      }}
      style={{ width: '100%', height: '100%' }}
      mapStyle={MAP_STYLE}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onDragStart={handleDragStart}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove}
    >
      <NavigationControl position="top-right" />

      <SpotMarkers spots={spots} onSpotTap={handleSpotTap} />

      {userLocation && <UserLocationDot location={userLocation} />}

      {selectedSpot && (
        <SpotPopup spot={selectedSpot} onClose={handleClosePopup} />
      )}
    </Map>
  );
}
