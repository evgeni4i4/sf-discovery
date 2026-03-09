# Verifiable Research and Technology Proposal

## 1. Core Problem Analysis

Build a personal city discovery tool for systematically exploring San Francisco district by district. The tool must handle interactive mapping, geospatial spot storage with rich metadata, proximity-based search, walking route planning, and photo management — all in a mobile-first PWA that works reliably while walking outdoors.

## 2. Verifiable Technology Recommendations

| Technology/Pattern | Rationale & Evidence |
|---|---|
| **MapLibre GL JS** (Map Rendering) | Free, open-source fork of Mapbox GL JS v1 with BSD-3 license — zero licensing cost regardless of usage [cite:1]. Provides WebGL-based vector tile rendering with 3D terrain and building support [cite:2]. Best offline ecosystem via PMTiles/Protomaps — a single PMTiles file can be stored locally and served via HTTP range requests with no tile server needed [cite:3]. Bundle size ~220KB gzipped, comparable to Mapbox [cite:1]. |
| **MapTiler** (Tile Provider) | Free tier provides 5,000 sessions/month and 100,000 requests/month [cite:4]. Provides pre-built vector tile styles compatible with MapLibre GL JS. Alternative: self-host PMTiles on Cloudflare R2 for zero ongoing cost [cite:3]. |
| **Supabase + PostGIS** (Database) | Managed PostgreSQL with PostGIS extension enabled via dashboard toggle [cite:5]. Free tier includes 500MB database storage [cite:6]. Native spatial queries: `ST_DWithin()` for radius search, `<->` operator for nearest-neighbor sorting [cite:5]. GIST spatial indexing for fast geospatial queries [cite:5]. Built-in REST API and JS client eliminates need for custom backend [cite:6]. pgRouting extension available for graph-based routing within the database [cite:7]. |
| **Next.js** (PWA Framework) | SSR/SSG capabilities for SEO when sharing district guides [cite:8]. PWA support via `next-pwa` or Serwist plugin with Workbox-based service worker caching [cite:9]. React ecosystem provides largest selection of map integration libraries [cite:8]. |
| **Mapbox Directions API** (Route Planning) | 100,000 free walking route requests/month [cite:10]. Walking profile follows sidewalks and trails [cite:10]. Easy integration with MapLibre GL JS maps. Alternative: self-hosted Valhalla for elevation-aware routing with per-request costing adjustments (prefer parks, avoid stairs) at zero API cost [cite:11]. |
| **Cloudflare R2 + Images** (Photo Storage) | Zero egress fees — critical for image-heavy map browsing [cite:12]. 10GB free storage, $0.015/GB-month after [cite:12]. On-demand image transforms via URL pattern (resize, WebP conversion, quality) with 5,000 free unique transforms/month [cite:13]. Global CDN caching at Cloudflare edge [cite:12]. |
| **Browser Geolocation API** (Location) | `watchPosition()` provides continuous location updates with 5-15 meter accuracy using GPS + Wi-Fi hybrid [cite:14]. Works in all modern browsers over HTTPS [cite:15]. Screen Wake Lock API (iOS 18.4+, Chrome, Edge) keeps screen on during active navigation [cite:16]. Key limitation: no background tracking when screen is off — acceptable for active walking discovery [cite:16]. |
| **PMTiles + Service Worker + IndexedDB** (Offline) | PMTiles stores vector tiles as a single file accessible via HTTP range requests [cite:3]. Service Worker (Workbox) caches app shell and static assets with CacheFirst strategy [cite:9]. IndexedDB caches geospatial spot data for offline querying [cite:9]. Enables full offline map browsing during walks in areas with poor signal. |

## 3. Browsed Sources

- [1] [Geoapify: Map Libraries Comparison](https://www.geoapify.com/map-libraries-comparison-leaflet-vs-maplibre-gl-vs-openlayers-trends-and-statistics/)
- [2] [Jawg Blog: MapLibre GL vs Leaflet](https://blog.jawg.io/maplibre-gl-vs-leaflet-choosing-the-right-tool-for-your-interactive-map/)
- [3] [Protomaps PMTiles for MapLibre](https://docs.protomaps.com/pmtiles/maplibre)
- [4] [MapTiler Cloud Pricing](https://www.maptiler.com/cloud/pricing/)
- [5] [Supabase PostGIS Docs](https://supabase.com/docs/guides/database/extensions/postgis)
- [6] [Supabase Pricing](https://supabase.com/pricing)
- [7] [Supabase pgRouting Blog](https://supabase.com/blog/pgrouting-postgres-graph-database)
- [8] [AlphaBold: Top PWA Frameworks 2026](https://www.alphabold.com/top-frameworks-and-tools-to-build-progressive-web-apps/)
- [9] [Next.js PWA Guide](https://nextjs.org/docs/app/guides/progressive-web-apps)
- [10] [Mapbox Directions API Docs](https://docs.mapbox.com/api/navigation/directions/)
- [11] [Valhalla GitHub](https://github.com/valhalla/valhalla)
- [12] [Cloudflare R2 Pricing](https://developers.cloudflare.com/r2/pricing/)
- [13] [Cloudflare: Transform Images](https://developers.cloudflare.com/images/transform-images/)
- [14] [Andy Gup: HTML5 Geolocation Accuracy](https://www.andygup.net/how-accurate-is-html5-geolocation-really-part-2-mobile-web/)
- [15] [MDN: Geolocation API](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API)
- [16] [MobilOud: PWAs on iOS Complete Guide 2026](https://www.mobiloud.com/blog/progressive-web-apps-ios)

## 4. Cost Summary (Free Tier)

| Service | Free Allowance | Overage |
|---------|---------------|---------|
| MapLibre GL JS | Unlimited | N/A (open source) |
| MapTiler tiles | 5K sessions/mo | $25/mo Flex |
| Supabase | 500MB DB, 1GB storage, 2GB egress | $25/mo Pro |
| Mapbox Directions | 100K requests/mo | $2/1K requests |
| Cloudflare R2 | 10GB storage, zero egress | $0.015/GB-mo |
| Cloudflare Images | 5K transforms/mo | $0.50/1K |
| **Total monthly cost** | **$0** (within free tiers) | |
