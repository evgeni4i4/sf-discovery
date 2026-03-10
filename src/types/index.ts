export interface GeoLocation {
  lat: number;
  lng: number;
  accuracy: number;
  heading: number | null;
  speed: number | null;
  timestamp: number;
}

export type SpotCategory =
  | 'cafe' | 'restaurant' | 'bar' | 'viewpoint' | 'park'
  | 'street-art' | 'architecture' | 'shop' | 'hidden-gem' | 'other';

export interface Spot {
  id: string;
  name: string;
  location: { lng: number; lat: number };
  district: string;
  category: SpotCategory;
  customCategory?: string;
  rating?: number;  // 1-5
  notes?: string;
  visitDate: string;
  photoUrls: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateSpotInput {
  name: string;
  location: { lng: number; lat: number };
  category: SpotCategory;
  customCategory?: string;
  rating?: number;
  notes?: string;
  visitDate?: string;
  photoUrls?: string[];
}

export interface UpdateSpotInput {
  name?: string;
  category?: SpotCategory;
  customCategory?: string;
  rating?: number;
  notes?: string;
  visitDate?: string;
  photoUrls?: string[];
}

export interface SearchFilters {
  district?: string;
  categories?: SpotCategory[];
  minRating?: number;
  query?: string;
  nearMe?: boolean;
  radius?: number;
}

export interface Route {
  geometry: GeoJSON.LineString;
  distanceKm: number;
  durationMin: number;
  waypoints: Spot[];
}

export interface DistrictProgress {
  name: string;
  bounds: GeoJSON.Polygon;
  spotCount: number;
  visited: boolean;
}

export interface DistrictBoundary {
  name: string;
  geometry: GeoJSON.Polygon | GeoJSON.MultiPolygon;
}

export interface SpotMutation {
  id: string;
  type: 'create' | 'update' | 'delete';
  data?: CreateSpotInput | UpdateSpotInput;
  timestamp: number;
}
