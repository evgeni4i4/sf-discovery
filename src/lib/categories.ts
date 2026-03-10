import { SpotCategory } from '@/types';

export interface CategoryConfig {
  id: SpotCategory;
  label: string;
  icon: string;  // emoji
  color: string; // hex color for map pins
}

export const CATEGORIES: CategoryConfig[] = [
  { id: 'cafe', label: 'Cafe', icon: '☕', color: '#8B4513' },
  { id: 'restaurant', label: 'Restaurant', icon: '🍽️', color: '#FF6347' },
  { id: 'bar', label: 'Bar', icon: '🍸', color: '#9B59B6' },
  { id: 'viewpoint', label: 'Viewpoint', icon: '🌉', color: '#3498DB' },
  { id: 'park', label: 'Park', icon: '🌳', color: '#27AE60' },
  { id: 'street-art', label: 'Street Art', icon: '🎨', color: '#E74C3C' },
  { id: 'architecture', label: 'Architecture', icon: '🏛️', color: '#95A5A6' },
  { id: 'shop', label: 'Shop', icon: '🛍️', color: '#F39C12' },
  { id: 'hidden-gem', label: 'Hidden Gem', icon: '💎', color: '#1ABC9C' },
  { id: 'other', label: 'Other', icon: '📌', color: '#7F8C8D' },
];

export function getCategoryConfig(id: SpotCategory): CategoryConfig {
  return CATEGORIES.find(c => c.id === id) ?? CATEGORIES[CATEGORIES.length - 1];
}
