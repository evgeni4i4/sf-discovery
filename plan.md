# SF Discovery — Development Plan

Source of truth for task/subtask completion. Synced with [GitHub Project Board](https://github.com/users/evgeni4i4/projects/2).

## Phase 1: Foundation

### Task 1: Project scaffolding and configuration (Atlas) — DONE
- [x] 1.1 Initialize Next.js 15 App Router project with TypeScript
- [x] 1.2 Install core dependencies (maplibre-gl, react-map-gl, supabase, turf, idb, serwist)
- [x] 1.3 Configure next.config.ts with Serwist PWA plugin
- [x] 1.4 Create public/manifest.json
- [x] 1.5 Create src/types/index.ts with all TypeScript interfaces
- [x] 1.6 Create src/lib/categories.ts with predefined categories

### Task 2: Set up Supabase database and DataStore (Atlas) — DONE
- [x] 2.1 Enable PostGIS extension (in migration file)
- [x] 2.2 Write migration 001_initial.sql (spots table, indexes, RLS, trigger)
- [x] 2.3 Create spots_within_radius RPC function (in migration)
- [x] 2.4 Create src/lib/supabase.ts — client initialization
- [x] 2.5 Implement src/lib/datastore.ts — CRUD operations
- [x] 2.6 Configure Supabase Auth — auth.ts + AuthProvider.tsx created
- [x] 2.7 Add auth UI — src/app/auth/page.tsx created
- [x] 2.8 Run migrations against Supabase
- [x] 2.9 Fix TypeScript errors in datastore.ts

### Task 3: Set up Supabase Storage and PhotoService (Cache) — DONE
- [x] 3.1 Create spot-photos bucket (migration 002_storage.sql written)
- [x] 3.2 Implement src/lib/photo-service.ts — upload, compress, variants, delete
- [x] 3.3 Run storage migration against Supabase
- [x] 3.4 Verify bucket creation and RLS policies work

### Task 4: Implement MapView component (Luna) — DONE
- [x] 4.1 Create src/components/map/Map.tsx — main MapView
- [x] 4.2 Create src/components/map/UserLocation.tsx — pulsing dot
- [x] 4.3 Create src/components/map/SpotMarkers.tsx — category markers
- [x] 4.4 Create src/components/map/SpotPopup.tsx — spot info popup
- [x] 4.5 Implement map long-press handler (500ms, mouse + touch)
- [x] 4.6 Create src/lib/geolocation.ts and src/hooks/useLocation.ts

## Phase 2: Core Map Experience

### Task 5: SpotManager — Create and View (Luna) — DONE
- [x] 5.1 Create src/components/spots/SpotForm.tsx
- [x] 5.2 Create src/components/spots/CategoryPicker.tsx
- [x] 5.3 Create src/app/spots/new/page.tsx
- [x] 5.4 Implement district auto-assignment (placeholder — empty string, Task 10 will add GeoJSON)
- [x] 5.5 Verified SpotPopup.tsx works with Spot interface (no changes needed)
- [x] 5.6 Create src/hooks/useSpots.ts

### Task 6: SpotManager — Edit and Delete (Luna) — DONE
- [x] 6.1 Create src/app/spots/[id]/page.tsx
- [x] 6.2 Implement edit mode with pre-filled SpotForm (added SpotFormInitialValues + submitLabel props)
- [x] 6.3 Implement spot deletion with confirm dialog (DeleteConfirmDialog modal)
- [x] 6.4 Navigation back to map after save/delete

### Task 7: PhotoCapture and PhotoGallery UI (Luna) — DONE
- [x] 7.1 Create src/components/photos/PhotoCapture.tsx (camera + gallery + preview)
- [x] 7.2 Implement client-side compression (via photo-service.ts resizeImage)
- [x] 7.3 Wire upload flow into SpotForm (replaced placeholder, sequential upload with progress)
- [x] 7.4 Create src/components/photos/PhotoGallery.tsx (grid + lightbox + delete)

## Phase 3: Search, Routes, and Districts

### Task 8: Implement SearchEngine (Atlas) — DONE
- [x] 8.1 Create src/lib/search-engine.ts
- [x] 8.2 Create src/components/search/FilterPanel.tsx
- [x] 8.3 Create src/components/search/SearchBar.tsx
- [x] 8.4 Implement proximity search via RPC
- [x] 8.5 Wire filters to MapView (SearchResult interface)
- [x] 8.6 Create src/hooks/useSearch.ts

### Task 9: Implement RoutePlanner (Luna) — DONE
- [x] 9.1 Create src/lib/route-planner.ts (Haversine distance, route computation)
- [x] 9.2 Create src/app/route/page.tsx (full route planning UI with map)
- [x] 9.3 Create src/components/route/WaypointList.tsx (numbered list, reorder controls)
- [x] 9.4 Create src/components/route/RouteStats.tsx (distance, walk time, stops)
- [x] 9.5 Create src/components/map/RouteLayer.tsx (GeoJSON polyline via Source/Layer)
- [x] 9.6 Implement navigation mode (next waypoint indicator + Arrived button)
- [x] 9.7 Implement clear route
- [x] 9.8 Implement waypoint reorder (up/down buttons)

### Task 10: Implement DistrictTracker (Luna) — DONE
- [x] 10.1 Source SF district boundaries GeoJSON (20 neighborhoods in sf-districts.json)
- [x] 10.2 Create src/lib/district-tracker.ts (point-in-polygon, stats, completion)
- [x] 10.3 Create src/app/districts/page.tsx (map + list split layout)
- [x] 10.4 Create src/components/districts/DistrictList.tsx (sortable list with summary)
- [x] 10.5 Create src/components/districts/DistrictCard.tsx (name, count, progress bar)
- [x] 10.6 Create src/components/map/DistrictLayer.tsx (fill + outline layers)
- [x] 10.7 Implement district tap — zoom to bounds (fitBounds with padding)
- [x] 10.8 Wire recalculation on spot changes (useDistricts hook + useSpots auto-assign)

## Phase 4: Offline and PWA

### Task 11: OfflineCache and service worker (Cache) — DONE
- [x] 11.1 Configure Serwist service worker strategies (app shell, API, tiles, images)
- [x] 11.2 Implement IndexedDB schema (idb) — spots, mutations, meta stores
- [x] 11.3 Implement src/lib/offline-cache.ts — syncSpots()
- [x] 11.4 Implement offline spot reading (getCachedSpots/getCachedSpot)
- [x] 11.5 Implement mutation queue (offlineCreate/Update/DeleteSpot)
- [x] 11.6 Implement flushMutationQueue() (ordered replay with ID mapping)
- [x] 11.7 Create src/hooks/useOffline.ts (auto-sync, offline CRUD wrappers)
- [x] 11.8 Wire SearchEngine offline fallback (try/catch with IndexedDB fallback)

### Task 12: PWA installation and Wake Lock (Cache) — DONE
- [x] 12.1 Verify manifest.json passes Lighthouse PWA audit (icons, description, orientation, id)
- [x] 12.2 Add PWA install prompt (InstallPrompt.tsx with beforeinstallprompt + localStorage dismiss)
- [x] 12.3 Implement Screen Wake Lock in useLocation (acquire/release tied to watching state)
- [x] 12.4 Test standalone mode (viewport-fit cover, safe-area insets, overscroll-none)

## Phase 5: Polish and Home Page

### Task 13: Build home page and navigation (Luna) — DONE
- [x] 13.1 Create full-screen map with bottom sheet UI (page.tsx redesigned, BottomSheet.tsx)
- [x] 13.2 Implement bottom navigation tabs (BottomNav.tsx with Map/Search/Route/Districts)
- [x] 13.3 Add responsive layout (h-dvh, max-w-lg, safe-area-bottom)
- [x] 13.4 Add loading states and error boundaries (LoadingSpinner, ErrorBoundary, OfflineBanner)
- [x] 13.5 Add empty states (EmptyState component for no spots / no results)

### Task 14: Integration testing and deployment (Atlas) — DONE
- [x] 14.1 npx tsc --noEmit — 0 errors
- [x] 14.2 npm run build — successful, all 6 routes compile
- [x] 14.3 Fixed ESLint errors (6 files: Link imports, unused vars, as any → as never)
- [x] 14.4 Verified all pages: /, /auth, /districts, /route, /spots/[id], /spots/new
- [x] 14.5 Checked cross-agent conflicts — none found
- [x] 14.6 Verified service worker compiles correctly
- [x] 14.7 Deploy to Vercel — deferred to user
