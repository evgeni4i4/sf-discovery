# SF Discovery — Development Team

## Team Lead

**Eugene Levitin** — CEO / Product Owner
- Defines priorities, approves deliverables, walks the districts

---

## Team Members

### Luna
**Role**: Frontend & Map Engineer
**Focus**: Interactive maps, UI components, React state, mobile UX
**Skills**:
- MapLibre GL JS / react-map-gl
- Next.js 15 App Router
- TypeScript / React hooks
- GeoJSON rendering (markers, layers, polygons)
- Turf.js (spatial analysis)
- Touch gestures, drag-and-drop
- Responsive mobile-first layouts
- Bottom sheets, carousels, filter panels

**Assigned Tasks**: 4, 5, 6, 7, 9, 10, 13

---

### Atlas
**Role**: Backend & Data Engineer
**Focus**: Database schema, spatial queries, auth, API integrations, project setup
**Skills**:
- Supabase (PostgreSQL, Auth, Edge Functions, RLS)
- PostGIS (GEOGRAPHY, GIST indexes, ST_DWithin, proximity queries)
- SQL migrations and RPC functions
- Mapbox Directions API
- Next.js project scaffolding
- TypeScript type definitions
- CI/CD, Vercel deployment

**Assigned Tasks**: 1, 2, 8, 14

---

### Cache
**Role**: Platform & Infra Engineer
**Focus**: Cloud storage, offline sync, PWA, service workers
**Skills**:
- Cloudflare R2 (S3-compatible object storage)
- Cloudflare Images (on-demand transforms)
- Presigned URL flows
- Serwist / Workbox (service worker tooling)
- IndexedDB (idb library)
- Offline-first architecture (mutation queues, background sync)
- PWA manifest, install prompts
- Screen Wake Lock API
- Client-side image compression (Canvas API)
- Lighthouse audits

**Assigned Tasks**: 3, 11, 12

---

## Task Assignment Matrix

| Task | Title | Owner | Blocked By |
|------|-------|-------|------------|
| 1 | Project scaffolding | **Atlas** | — |
| 2 | Supabase database & DataStore | **Atlas** | 1 |
| 3 | Cloudflare R2 & PhotoService | **Cache** | 1 |
| 4 | MapView component | **Luna** | 1 |
| 5 | SpotManager — Create & View | **Luna** | 2, 4 |
| 6 | SpotManager — Edit & Delete | **Luna** | 5 |
| 7 | PhotoCapture & PhotoGallery UI | **Luna** | 3, 5 |
| 8 | SearchEngine | **Atlas** | 2, 4 |
| 9 | RoutePlanner | **Luna** | 4, 5 |
| 10 | DistrictTracker | **Luna** | 4, 5 |
| 11 | OfflineCache & service worker | **Cache** | 2, 8 |
| 12 | PWA installation & Wake Lock | **Cache** | 11 |
| 13 | Home page & navigation | **Luna** | 5, 8, 9, 10 |
| 14 | Integration testing & deployment | **Atlas** | all (1-13) |

## Execution Order

```
Phase 1 (parallel start):
  Atlas: [1] ──→ [2] ──────────────→ [8] ──────────────────────→ [14]
  Cache:        [3] ──────────────────────→ [11] ──→ [12]         ↑
  Luna:         [4] ──→ [5] ──→ [6]                               ↑
                         ↓       ↓                                 ↑
                        [7] ←── (3)                                ↑
                        [9]                                        ↑
                        [10] ─────────→ [13] ──────────────────────↑
```

**Critical path**: 1 → 2 → 5 → 10 → 13 → 14
