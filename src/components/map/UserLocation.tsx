'use client';

import { Marker } from 'react-map-gl/maplibre';
import { GeoLocation } from '@/types';

interface UserLocationDotProps {
  location: GeoLocation;
}

export default function UserLocationDot({ location }: UserLocationDotProps) {
  const showAccuracyCircle = location.accuracy > 50;

  return (
    <Marker
      longitude={location.lng}
      latitude={location.lat}
      anchor="center"
    >
      <div className="user-location-container">
        {showAccuracyCircle && (
          <div
            className="user-location-accuracy"
            style={{
              width: `${Math.min(location.accuracy, 200)}px`,
              height: `${Math.min(location.accuracy, 200)}px`,
            }}
          />
        )}
        <div className="user-location-dot">
          <div className="user-location-pulse" />
          <div className="user-location-center" />
        </div>
      </div>

      <style>{`
        .user-location-container {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .user-location-accuracy {
          position: absolute;
          border-radius: 50%;
          background: rgba(66, 133, 244, 0.1);
          border: 1px solid rgba(66, 133, 244, 0.3);
          pointer-events: none;
        }

        .user-location-dot {
          position: relative;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .user-location-pulse {
          position: absolute;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: rgba(66, 133, 244, 0.3);
          animation: user-location-pulse-animation 2s ease-out infinite;
        }

        .user-location-center {
          position: relative;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #4285F4;
          border: 2px solid #ffffff;
          box-shadow: 0 0 4px rgba(0, 0, 0, 0.3);
          z-index: 1;
        }

        @keyframes user-location-pulse-animation {
          0% {
            transform: scale(1);
            opacity: 0.8;
          }
          100% {
            transform: scale(3);
            opacity: 0;
          }
        }
      `}</style>
    </Marker>
  );
}
