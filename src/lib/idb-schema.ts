import type { DBSchema } from 'idb';
import { openDB, type IDBPDatabase } from 'idb';
import type { Spot, SpotMutation } from '@/types';

// ---------------------------------------------------------------------------
// IndexedDB Schema
// ---------------------------------------------------------------------------

/**
 * A queued mutation entry with an auto-incremented key so multiple
 * mutations for the same spot can coexist in the queue.
 */
export interface QueuedMutation extends SpotMutation {
  /** Auto-incremented queue key (assigned by IndexedDB). */
  queueId?: number;
}

/**
 * Schema definition for the SF Discovery offline database.
 *
 * - `spots` store: caches Spot objects keyed by their UUID.
 * - `mutations` store: queues pending create/update/delete operations
 *   that were performed while offline. Uses auto-incremented queueId
 *   so they can be replayed in order.
 * - `meta` store: stores sync metadata (e.g. last sync timestamp).
 */
export interface SFDiscoveryDB extends DBSchema {
  spots: {
    key: string; // Spot.id (UUID)
    value: Spot;
    indexes: {
      'by-district': string;
      'by-category': string;
      'by-rating': number;
      'by-updatedAt': string;
    };
  };
  mutations: {
    key: number; // auto-incremented queueId
    value: QueuedMutation;
    indexes: {
      'by-timestamp': number;
    };
  };
  meta: {
    key: string;
    value: {
      key: string;
      value: string | number;
    };
  };
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DB_NAME = 'sf-discovery';
const DB_VERSION = 1;

// ---------------------------------------------------------------------------
// Database singleton
// ---------------------------------------------------------------------------

let dbPromise: Promise<IDBPDatabase<SFDiscoveryDB>> | null = null;

/**
 * Get (or create) the IndexedDB database instance.
 * Returns a singleton promise so the DB is only opened once.
 */
export function getDB(): Promise<IDBPDatabase<SFDiscoveryDB>> {
  if (typeof indexedDB === 'undefined') {
    return Promise.reject(new Error('IndexedDB is not available'));
  }

  if (!dbPromise) {
    dbPromise = openDB<SFDiscoveryDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // ----- spots store -----
        if (!db.objectStoreNames.contains('spots')) {
          const spotStore = db.createObjectStore('spots', { keyPath: 'id' });
          spotStore.createIndex('by-district', 'district');
          spotStore.createIndex('by-category', 'category');
          spotStore.createIndex('by-rating', 'rating');
          spotStore.createIndex('by-updatedAt', 'updatedAt');
        }

        // ----- mutations queue store -----
        if (!db.objectStoreNames.contains('mutations')) {
          const mutationStore = db.createObjectStore('mutations', {
            keyPath: 'queueId',
            autoIncrement: true,
          });
          mutationStore.createIndex('by-timestamp', 'timestamp');
        }

        // ----- meta store -----
        if (!db.objectStoreNames.contains('meta')) {
          db.createObjectStore('meta', { keyPath: 'key' });
        }
      },
    });
  }

  return dbPromise;
}
