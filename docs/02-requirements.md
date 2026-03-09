# Requirements Document

## Introduction

This document defines the functional and non-functional requirements for the SF District Discovery Tool. Each requirement maps to one or more components from the architectural blueprint. Acceptance criteria use the format: WHEN [trigger], THE **[Component]** SHALL [testable behavior].

## Glossary

- **Spot**: A point of interest discovered during a walk (cafe, viewpoint, mural, park, etc.)
- **District**: One of San Francisco's recognized neighborhoods/districts
- **Route**: A walking path connecting two or more spots
- **Pin**: A marker on the map representing a spot

---

## Requirements

### Requirement 1: Interactive Map Display

The map shall render an interactive, zoomable view of San Francisco with the user's current location and all saved spots.

#### Acceptance Criteria

1.1 WHEN the app loads, THE **MapView** SHALL display a MapLibre GL JS map centered on San Francisco with vector tile basemap from MapTiler.

1.2 WHEN the user grants location permission, THE **MapView** SHALL show the user's current position as a pulsing dot updated via `watchPosition()`.

1.3 WHEN spots exist in the database, THE **MapView** SHALL render each spot as a color-coded pin based on its category.

1.4 WHEN the user taps a spot pin, THE **MapView** SHALL display a popup with the spot's name, category, rating, and thumbnail photo.

1.5 WHEN the user long-presses a map location, THE **SpotManager** SHALL open the "Add Spot" form pre-filled with those coordinates.

### Requirement 2: Spot Management

The user shall be able to create, view, edit, and delete spots with rich metadata.

#### Acceptance Criteria

2.1 WHEN the user submits the "Add Spot" form, THE **SpotManager** SHALL save a new spot record to **DataStore** with: name, coordinates (lat/lng), district, category, rating (1-5), notes (text), visit date, and photo URLs.

2.2 WHEN a spot is saved, THE **SpotManager** SHALL reverse-geocode the coordinates to auto-assign the SF district name.

2.3 WHEN the user opens an existing spot, THE **SpotManager** SHALL display all metadata fields in an editable detail view.

2.4 WHEN the user edits a spot and saves, THE **SpotManager** SHALL update the record in **DataStore** and refresh the pin on **MapView**.

2.5 WHEN the user deletes a spot, THE **SpotManager** SHALL remove the record from **DataStore**, remove the pin from **MapView**, and delete associated photos from **PhotoService**.

2.6 WHEN creating a spot, THE **SpotManager** SHALL require at minimum: name, coordinates, and category. All other fields are optional.

### Requirement 3: Photo Capture and Storage

The user shall be able to attach photos to spots directly from their phone camera or gallery.

#### Acceptance Criteria

3.1 WHEN the user taps "Add Photo" on a spot form, THE **PhotoService** SHALL open the device camera or photo gallery picker.

3.2 WHEN a photo is selected, THE **PhotoService** SHALL compress it client-side to max 2MB and upload to Cloudflare R2.

3.3 WHEN displaying a photo in the spot list or map popup, THE **PhotoService** SHALL serve a thumbnail (400px wide, WebP) via Cloudflare Images transform URL.

3.4 WHEN displaying a photo in the spot detail view, THE **PhotoService** SHALL serve a full-size image (1200px wide, WebP) via Cloudflare Images transform URL.

3.5 WHEN a spot has multiple photos, THE **PhotoService** SHALL display them in a swipeable gallery carousel.

3.6 WHEN a spot is deleted, THE **PhotoService** SHALL delete all associated photo objects from Cloudflare R2.

### Requirement 4: Search and Filtering

The user shall be able to find spots by district, category, rating, text search, and proximity.

#### Acceptance Criteria

4.1 WHEN the user selects a district from the filter panel, THE **SearchEngine** SHALL return only spots within that district and update **MapView** to show only those pins.

4.2 WHEN the user selects one or more categories, THE **SearchEngine** SHALL filter spots to only matching categories.

4.3 WHEN the user sets a minimum rating, THE **SearchEngine** SHALL return only spots with rating >= the threshold.

4.4 WHEN the user types a text query, THE **SearchEngine** SHALL search spot names and notes using case-insensitive substring matching.

4.5 WHEN the user taps "Near Me", THE **SearchEngine** SHALL query **DataStore** using `ST_DWithin()` to return spots within 1km of the user's current position, sorted by distance.

4.6 WHEN multiple filters are active simultaneously, THE **SearchEngine** SHALL apply all filters with AND logic.

### Requirement 5: Walking Route Planning

The user shall be able to plan a walking route through selected spots within a district.

#### Acceptance Criteria

5.1 WHEN the user selects 2 or more spots, THE **RoutePlanner** SHALL send their coordinates to the Mapbox Directions API with the walking profile.

5.2 WHEN the API returns a route, THE **RoutePlanner** SHALL render the GeoJSON polyline on **MapView** as a colored route overlay.

5.3 WHEN a route is displayed, THE **RoutePlanner** SHALL show total walking distance (km) and estimated time (minutes).

5.4 WHEN the user taps "Start Navigation", THE **RoutePlanner** SHALL track the user's position on **MapView** and highlight the next spot in sequence.

5.5 WHEN the user taps "Clear Route", THE **RoutePlanner** SHALL remove the route overlay and waypoint highlights from **MapView**.

5.6 WHEN the user reorders waypoints via drag-and-drop, THE **RoutePlanner** SHALL recalculate the route with the new sequence.

### Requirement 6: District Progress Tracking

The user shall see their exploration progress across all SF districts.

#### Acceptance Criteria

6.1 WHEN the user opens the district overview, THE **DistrictTracker** SHALL display a list of all SF districts with: name, spot count, visited/unvisited status, and a progress indicator.

6.2 WHEN at least one spot exists in a district, THE **DistrictTracker** SHALL mark that district as "visited".

6.3 WHEN the user taps a district in the overview, THE **DistrictTracker** SHALL zoom **MapView** to that district's bounds and filter to show only its spots.

6.4 WHEN viewed on the map, THE **DistrictTracker** SHALL render district boundary polygons with fill color indicating visited (green) vs. unvisited (gray).

6.5 WHEN the user adds or deletes a spot, THE **DistrictTracker** SHALL recalculate and update the affected district's stats immediately.

### Requirement 7: Offline Support

The app shall remain usable without internet connection for core map browsing and spot viewing.

#### Acceptance Criteria

7.1 WHEN the app loads with an internet connection, THE **OfflineCache** SHALL cache the app shell (HTML, CSS, JS) via service worker using a CacheFirst strategy.

7.2 WHEN the user has previously browsed map areas, THE **OfflineCache** SHALL serve cached vector tiles from IndexedDB when offline.

7.3 WHEN the app goes online, THE **OfflineCache** SHALL sync all spot data from **DataStore** (Supabase) into IndexedDB.

7.4 WHEN the app is offline, THE **SearchEngine** SHALL query spots from IndexedDB instead of **DataStore**.

7.5 WHEN the user creates or edits a spot while offline, THE **OfflineCache** SHALL queue the mutation and sync it to **DataStore** when connectivity resumes.

7.6 WHEN the PWA is installed to the home screen, THE **OfflineCache** SHALL ensure the app launches with a cached shell even without connectivity.

### Requirement 8: Spot Categories

The system shall provide a predefined set of spot categories with the ability to add custom ones.

#### Acceptance Criteria

8.1 WHEN creating or editing a spot, THE **SpotManager** SHALL present a category picker with predefined options: Cafe, Restaurant, Bar, Viewpoint, Park, Street Art, Architecture, Shop, Hidden Gem, Other.

8.2 WHEN the user selects a category, THE **MapView** SHALL display the spot pin with a category-specific color and icon.

8.3 WHEN the user needs a category not in the list, THE **SpotManager** SHALL allow entering a custom category name.

### Requirement 9: Data Persistence

All spot data shall be durably stored in a cloud database with spatial indexing.

#### Acceptance Criteria

9.1 WHEN a spot is created, THE **DataStore** SHALL insert a row into the `spots` table with a PostGIS `GEOGRAPHY(POINT)` column and GIST spatial index.

9.2 WHEN a proximity query is executed, THE **DataStore** SHALL use `ST_DWithin()` and the `<->` operator for efficient nearest-neighbor searches.

9.3 WHEN the app loads, THE **DataStore** SHALL authenticate via Supabase Auth and enforce Row-Level Security so only the owner can access their spots.

9.4 WHEN a spot record is modified, THE **DataStore** SHALL update the `updated_at` timestamp for sync ordering.

### Requirement 10: PWA Installation

The app shall be installable as a Progressive Web App on mobile devices.

#### Acceptance Criteria

10.1 WHEN the user visits the app in a mobile browser, THE **OfflineCache** SHALL serve a valid web app manifest with name, icons, theme color, and `display: standalone`.

10.2 WHEN installed to the home screen, the app SHALL launch in standalone mode without browser chrome.

10.3 WHEN running as an installed PWA, THE **MapView** SHALL request and use the Screen Wake Lock API to keep the screen on during active navigation.
