'use client';

import { Popup } from 'react-map-gl/maplibre';
import { Spot } from '@/types';
import { getCategoryConfig } from '@/lib/categories';

interface SpotPopupProps {
  spot: Spot;
  onClose: () => void;
}

function renderStars(rating: number): string {
  const filled = Math.round(rating);
  return '★'.repeat(filled) + '☆'.repeat(5 - filled);
}

export default function SpotPopup({ spot, onClose }: SpotPopupProps) {
  const config = getCategoryConfig(spot.category);

  return (
    <Popup
      longitude={spot.location.lng}
      latitude={spot.location.lat}
      anchor="bottom"
      offset={[0, -40] as [number, number]}
      closeOnClick={false}
      onClose={onClose}
      maxWidth="260px"
    >
      <a
        href={`/spots/${spot.id}`}
        className="spot-popup-link"
        style={{ textDecoration: 'none', color: 'inherit' }}
      >
        <div className="spot-popup">
          {spot.photoUrls.length > 0 && (
            <div className="spot-popup-thumbnail">
              <img
                src={spot.photoUrls[0]}
                alt={spot.name}
                loading="lazy"
              />
            </div>
          )}
          <div className="spot-popup-content">
            <h3 className="spot-popup-name">{spot.name}</h3>
            <div className="spot-popup-category">
              <span>{config.icon}</span>
              <span
                className="spot-popup-category-label"
                style={{ color: config.color }}
              >
                {config.label}
              </span>
            </div>
            {spot.rating != null && spot.rating > 0 && (
              <div className="spot-popup-rating" style={{ color: '#F39C12' }}>
                {renderStars(spot.rating)}
              </div>
            )}
          </div>
        </div>
      </a>

      <style>{`
        .spot-popup {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .spot-popup-thumbnail {
          width: 100%;
          height: 120px;
          overflow: hidden;
          border-radius: 6px;
          margin-bottom: 8px;
        }

        .spot-popup-thumbnail img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .spot-popup-content {
          padding: 0 2px 2px;
        }

        .spot-popup-name {
          font-size: 15px;
          font-weight: 600;
          margin: 0 0 4px;
          color: #1a1a1a;
        }

        .spot-popup-category {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 13px;
          margin-bottom: 4px;
        }

        .spot-popup-category-label {
          font-weight: 500;
        }

        .spot-popup-rating {
          font-size: 14px;
          letter-spacing: 1px;
        }

        .spot-popup-link:hover .spot-popup-name {
          color: #1a73e8;
        }
      `}</style>
    </Popup>
  );
}
