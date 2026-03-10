import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import {
  Serwist,
  CacheFirst,
  NetworkFirst,
  ExpirationPlugin,
  CacheableResponsePlugin,
} from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope & typeof globalThis;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    // -----------------------------------------------------------------------
    // 1. App shell (default Next.js caching from Serwist)
    //    Includes HTML pages, JS chunks, CSS, etc.
    // -----------------------------------------------------------------------
    ...defaultCache,

    // -----------------------------------------------------------------------
    // 2. Supabase API calls — Network First with cache fallback
    //    When offline, the cached response is returned so the app can
    //    still display data. Cached responses expire after 24 hours.
    // -----------------------------------------------------------------------
    {
      matcher({ url }) {
        return url.hostname.endsWith('.supabase.co');
      },
      handler: new NetworkFirst({
        cacheName: 'supabase-api',
        plugins: [
          new ExpirationPlugin({
            maxEntries: 100,
            maxAgeSeconds: 24 * 60 * 60, // 24 hours
          }),
          new CacheableResponsePlugin({
            statuses: [0, 200],
          }),
        ],
        networkTimeoutSeconds: 10,
      }),
    },

    // -----------------------------------------------------------------------
    // 3. Map tiles — Cache First with expiration
    //    Tiles rarely change, so caching aggressively is fine.
    //    Covers common tile providers (MapTiler, Mapbox, OSM, etc.).
    // -----------------------------------------------------------------------
    {
      matcher({ url }) {
        return (
          url.hostname.includes('tiles.') ||
          url.hostname.includes('tile.') ||
          url.hostname.includes('api.maptiler.com') ||
          url.hostname.includes('api.mapbox.com') ||
          url.pathname.match(/\/\d+\/\d+\/\d+\.(png|jpg|jpeg|webp|pbf|mvt)$/) !== null
        );
      },
      handler: new CacheFirst({
        cacheName: 'map-tiles',
        plugins: [
          new ExpirationPlugin({
            maxEntries: 2000,
            maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
          }),
          new CacheableResponsePlugin({
            statuses: [0, 200],
          }),
        ],
      }),
    },

    // -----------------------------------------------------------------------
    // 4. Images and photos — Cache First with expiration
    //    Spot photos and other images are immutable once uploaded.
    // -----------------------------------------------------------------------
    {
      matcher({ url }) {
        return (
          url.pathname.match(/\.(png|jpg|jpeg|gif|webp|svg|ico)$/i) !== null ||
          url.hostname.includes('.supabase.co') && url.pathname.includes('/storage/')
        );
      },
      handler: new CacheFirst({
        cacheName: 'images',
        plugins: [
          new ExpirationPlugin({
            maxEntries: 500,
            maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
          }),
          new CacheableResponsePlugin({
            statuses: [0, 200],
          }),
        ],
      }),
    },
  ],
});

serwist.addEventListeners();
