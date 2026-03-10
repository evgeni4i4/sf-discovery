'use client';

import { Marker } from 'react-map-gl/maplibre';
import { Spot } from '@/types';
import { getCategoryConfig } from '@/lib/categories';

interface SpotMarkersProps {
  spots: Spot[];
  onSpotTap: (spotId: string) => void;
}

export default function SpotMarkers({ spots, onSpotTap }: SpotMarkersProps) {
  return (
    <>
      {spots.map((spot) => {
        const config = getCategoryConfig(spot.category);

        return (
          <Marker
            key={spot.id}
            longitude={spot.location.lng}
            latitude={spot.location.lat}
            anchor="bottom"
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              onSpotTap(spot.id);
            }}
          >
            <div
              className="spot-marker"
              style={{ '--marker-color': config.color } as React.CSSProperties}
              title={spot.name}
            >
              <div className="spot-marker-pin">
                <span className="spot-marker-emoji">{config.icon}</span>
              </div>
              <div className="spot-marker-shadow" />
            </div>
          </Marker>
        );
      })}

      <style>{`
        .spot-marker {
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          transition: transform 0.15s ease;
        }

        .spot-marker:hover {
          transform: scale(1.15);
        }

        .spot-marker-pin {
          width: 36px;
          height: 36px;
          border-radius: 50% 50% 50% 0;
          background: var(--marker-color, #7F8C8D);
          transform: rotate(-45deg);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
          border: 2px solid #ffffff;
        }

        .spot-marker-emoji {
          transform: rotate(45deg);
          font-size: 16px;
          line-height: 1;
        }

        .spot-marker-shadow {
          width: 10px;
          height: 4px;
          background: rgba(0, 0, 0, 0.2);
          border-radius: 50%;
          margin-top: 2px;
        }
      `}</style>
    </>
  );
}
