# Implementation Plan

## Phase 1: Foundation

- [ ] 1. Project scaffolding and configuration
  - [ ] 1.1 Initialize Next.js 15 App Router project with TypeScript in `sf-discovery/`
  - [ ] 1.2 Install core dependencies: `maplibre-gl`, `react-map-gl`, `@supabase/supabase-js`, `@turf/boolean-point-in-polygon`, `@turf/bbox`, `idb`, `serwist`
  - [ ] 1.3 Configure `next.config.ts` with Serwist PWA plugin
  - [ ] 1.4 Create `public/manifest.json` with app name, icons, standalone display, theme color
  - [ ] 1.5 Create `src/types/index.ts` with all TypeScript interfaces (`Spot`, `GeoLocation`, `SearchFilters`, `Route`, `DistrictProgress`, `SpotCategory`)
  - [ ] 1.6 Create `src/lib/categories.ts` with predefined categories, colors, and icons
  - _Requirements: 10.1, 10.2_

- [ ] 2. Set up Supabase database and DataStore
  - [ ] 2.1 Create Supabase project and enable PostGIS extension
  - [ ] 2.2 Write and run migration `supabase/migrations/001_initial.sql`: spots table with `GEOGRAPHY(POINT)` column, GIST index, district/category indexes, RLS policies, `updated_at` trigger
  - [ ] 2.3 Create `spots_within_radius` RPC function for proximity queries
  - [ ] 2.4 Create `src/lib/supabase.ts` — Supabase client initialization with env vars
  - [ ] 2.5 Implement `src/lib/datastore.ts` — `createSpot()`, `getSpot()`, `updateSpot()`, `deleteSpot()`, `listSpots()`, `findNearby()`
  - [ ] 2.6 Configure Supabase Auth with magic link sign-in
  - [ ] 2.7 Add auth UI: sign-in page and session provider in root layout
  - _Requirements: 9.1, 9.2, 9.3, 9.4_

- [ ] 3. Set up Cloudflare R2 and PhotoService
  - [ ] 3.1 Create Cloudflare R2 bucket for photo storage
  - [ ] 3.2 Create Supabase Edge Function to generate presigned PUT URLs for R2
  - [ ] 3.3 Implement `src/lib/photo-service.ts` — `capturePhoto()`, `uploadPhoto()` (client-side compress + presigned upload), `getThumbnailUrl()`, `getFullUrl()`, `deletePhotos()`
  - [ ] 3.4 Configure Cloudflare Images transform rules for the R2 bucket
  - _Requirements: 3.2, 3.3, 3.4, 3.6_

## Phase 2: Core Map Experience

- [ ] 4. Implement MapView component
  - [ ] 4.1 Create `src/components/map/Map.tsx` — initialize MapLibre GL JS with MapTiler style, centered on SF at zoom 12
  - [ ] 4.2 Create `src/components/map/UserLocation.tsx` — pulsing dot using `watchPosition()` with `enableHighAccuracy: true`
  - [ ] 4.3 Create `src/components/map/SpotMarker.tsx` — GeoJSON source + symbol layer rendering spots as category-colored pins
  - [ ] 4.4 Implement spot pin tap handler — show popup with name, category, rating, thumbnail
  - [ ] 4.5 Implement map long-press handler — detect long-press, extract coordinates, trigger "Add Spot" navigation
  - [ ] 4.6 Create `src/lib/geolocation.ts` and `src/hooks/useLocation.ts` — geolocation wrapper with reactive state
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [ ] 5. Implement SpotManager — Create and View
  - [ ] 5.1 Create `src/components/spots/SpotForm.tsx` — form with name, category picker, rating (1-5 stars), notes textarea, visit date, photo upload area
  - [ ] 5.2 Create `src/components/spots/CategoryPicker.tsx` — predefined categories (Cafe, Restaurant, Bar, Viewpoint, Park, Street Art, Architecture, Shop, Hidden Gem, Other) + custom input
  - [ ] 5.3 Create `src/app/spots/new/page.tsx` — new spot page, pre-fill coordinates from map long-press
  - [ ] 5.4 Implement district auto-assignment — load SF districts GeoJSON, use `booleanPointInPolygon()` to detect district from coordinates
  - [ ] 5.5 Create `src/components/spots/SpotPopup.tsx` — map popup component for pin tap
  - [ ] 5.6 Create `src/hooks/useSpots.ts` — hook wrapping DataStore CRUD with loading/error state
  - _Requirements: 2.1, 2.2, 2.6, 8.1, 8.2, 8.3_

- [ ] 6. Implement SpotManager — Edit and Delete
  - [ ] 6.1 Create `src/app/spots/[id]/page.tsx` — spot detail view showing all metadata and photo gallery
  - [ ] 6.2 Implement edit mode — toggle SpotForm into edit mode with pre-filled values
  - [ ] 6.3 Implement spot deletion — confirm dialog, delete from DataStore, remove associated photos via PhotoService, refresh MapView
  - [ ] 6.4 After save/delete, navigate back to map and refresh spot markers
  - _Requirements: 2.3, 2.4, 2.5_

- [ ] 7. Implement PhotoCapture and PhotoGallery UI
  - [ ] 7.1 Create `src/components/photos/PhotoCapture.tsx` — `<input type="file" accept="image/*" capture="environment">` with camera/gallery fallback
  - [ ] 7.2 Implement client-side compression — canvas resize to max 2048px, JPEG quality 0.8, enforce <= 2MB
  - [ ] 7.3 Wire upload flow into SpotForm — capture, compress, upload to R2, store URL in spot record
  - [ ] 7.4 Create `src/components/photos/PhotoGallery.tsx` — swipeable carousel with thumbnail and full-size views
  - _Requirements: 3.1, 3.2, 3.5_

## Phase 3: Search, Routes, and Districts

- [ ] 8. Implement SearchEngine
  - [ ] 8.1 Create `src/lib/search-engine.ts` — `search()` function that builds Supabase query from filters
  - [ ] 8.2 Create `src/components/search/FilterPanel.tsx` — slide-up panel with district dropdown, category multi-select, rating slider, "Near Me" toggle
  - [ ] 8.3 Create `src/components/search/SearchBar.tsx` — text input with debounced search on name and notes
  - [ ] 8.4 Implement proximity search — call `spots_within_radius` RPC when "Near Me" is active, pass user's current coordinates and 1km radius
  - [ ] 8.5 Wire filters to MapView — when filters change, update visible spot markers to show only matching results
  - [ ] 8.6 Create `src/hooks/useSearch.ts` — search state management, combine all filters with AND logic
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

- [ ] 9. Implement RoutePlanner
  - [ ] 9.1 Create `src/lib/route-planner.ts` — `calculateRoute()` calling Mapbox Directions API with walking profile
  - [ ] 9.2 Create `src/app/route/page.tsx` — route planning page with spot selection
  - [ ] 9.3 Create `src/components/route/WaypointList.tsx` — draggable list to reorder waypoints
  - [ ] 9.4 Create `src/components/route/RouteStats.tsx` — display total distance (km) and estimated walking time (minutes)
  - [ ] 9.5 Create `src/components/map/RouteLayer.tsx` — render GeoJSON polyline on map as colored line overlay
  - [ ] 9.6 Implement navigation mode — track user position, highlight next waypoint when within 50m, update bearing
  - [ ] 9.7 Implement clear route — remove route overlay and waypoint highlights
  - [ ] 9.8 Implement waypoint reorder — recalculate route on drag-and-drop reorder
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

- [ ] 10. Implement DistrictTracker
  - [ ] 10.1 Source SF district boundaries GeoJSON from DataSF / SF Planning, save as `src/lib/sf-districts.geojson`
  - [ ] 10.2 Create `src/lib/district-tracker.ts` — `getProgress()` aggregating spot count per district, `getDistrictBounds()` for map zoom
  - [ ] 10.3 Create `src/app/districts/page.tsx` — district overview page
  - [ ] 10.4 Create `src/components/districts/DistrictList.tsx` — list all ~36 districts with name, spot count, visited badge, progress bar
  - [ ] 10.5 Create `src/components/districts/DistrictCard.tsx` — single district summary card
  - [ ] 10.6 Create `src/components/map/DistrictLayer.tsx` — render district boundary polygons with fill color (green = visited, gray = unvisited)
  - [ ] 10.7 Implement district tap — zoom MapView to district bounds, filter to show only that district's spots
  - [ ] 10.8 Wire recalculation — update district stats immediately when spots are added or deleted
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

## Phase 4: Offline and PWA

- [ ] 11. Implement OfflineCache and service worker
  - [ ] 11.1 Configure Serwist service worker — CacheFirst for app shell (HTML, CSS, JS), CacheFirst with 7-day expiry for map tiles, NetworkFirst for Supabase API
  - [ ] 11.2 Implement IndexedDB schema using `idb` — stores: `spots`, `mutation-queue`, `sync-meta`
  - [ ] 11.3 Implement `src/lib/offline-cache.ts` — `syncSpots()` downloading all spots from Supabase into IndexedDB on app load
  - [ ] 11.4 Implement offline spot reading — `getOfflineSpots()` querying IndexedDB when navigator.onLine is false
  - [ ] 11.5 Implement mutation queue — `queueMutation()` storing create/update/delete operations for later sync
  - [ ] 11.6 Implement `flushMutationQueue()` — replay queued mutations to Supabase when connectivity resumes
  - [ ] 11.7 Create `src/hooks/useOffline.ts` — hook tracking online/offline status, triggering sync on reconnect
  - [ ] 11.8 Wire SearchEngine offline fallback — when offline, query IndexedDB instead of Supabase
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

- [ ] 12. PWA installation and Wake Lock
  - [ ] 12.1 Verify `public/manifest.json` passes Lighthouse PWA audit (name, icons, start_url, display, theme_color)
  - [ ] 12.2 Add PWA install prompt — detect `beforeinstallprompt` event, show "Add to Home Screen" banner
  - [ ] 12.3 Implement Screen Wake Lock in `useLocation` hook — acquire `navigator.wakeLock.request('screen')` during active navigation, release on unmount
  - [ ] 12.4 Test standalone mode — verify app launches without browser chrome when installed
  - _Requirements: 10.1, 10.2, 10.3_

## Phase 5: Polish and Home Page

- [ ] 13. Build home page and navigation
  - [ ] 13.1 Create `src/app/page.tsx` — full-screen map with bottom sheet UI (spot list, filters, district toggle)
  - [ ] 13.2 Implement bottom navigation — tabs for Map, Search, Route, Districts
  - [ ] 13.3 Add responsive layout — map fills viewport, panels slide up from bottom on mobile
  - [ ] 13.4 Add loading states and error boundaries for all async operations
  - [ ] 13.5 Add empty states — "No spots yet" with call-to-action, "No results" for empty search
  - _Requirements: 1.1, 1.3_

- [ ] 14. Integration testing and deployment
  - [ ] 14.1 Test full spot lifecycle — create with photo, view on map, edit, search, delete
  - [ ] 14.2 Test proximity search — verify spots within 1km appear sorted by distance
  - [ ] 14.3 Test route planning — select 3+ spots, verify route renders with correct distance/time
  - [ ] 14.4 Test district tracking — add spots in 3 districts, verify progress updates
  - [ ] 14.5 Test offline mode — go offline, verify cached map and spots load, create spot offline, go online, verify sync
  - [ ] 14.6 Test PWA install — install on iOS Safari and Android Chrome, verify standalone launch
  - [ ] 14.7 Deploy to Vercel (or Cloudflare Pages) with environment variables for Supabase, MapTiler, Mapbox, R2
  - _Requirements: all_
