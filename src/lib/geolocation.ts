import { GeoLocation } from '@/types';

export function watchPosition(
  onUpdate: (location: GeoLocation) => void,
  onError: (error: GeolocationPositionError) => void
): number {
  return navigator.geolocation.watchPosition(
    (position) => {
      onUpdate({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy,
        heading: position.coords.heading,
        speed: position.coords.speed,
        timestamp: position.timestamp,
      });
    },
    onError,
    { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
  );
}

export function clearWatch(watchId: number): void {
  navigator.geolocation.clearWatch(watchId);
}
