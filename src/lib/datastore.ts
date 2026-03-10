import { supabase } from './supabase';
import type { Spot, CreateSpotInput, UpdateSpotInput, SearchFilters, SpotCategory } from '@/types';
import type { SpotWithCoords } from '@/types/database';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Convert a SpotWithCoords row from the database view into the
 * application-level Spot interface used by the UI.
 */
function toSpot(row: SpotWithCoords): Spot {
  return {
    id: row.id,
    name: row.name,
    location: { lng: row.lng, lat: row.lat },
    district: row.district,
    category: row.category as SpotCategory,
    customCategory: row.custom_category ?? undefined,
    rating: row.rating ?? undefined,
    notes: row.notes ?? undefined,
    visitDate: row.visit_date,
    photoUrls: row.photo_urls ?? [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ---------------------------------------------------------------------------
// DataStore
// ---------------------------------------------------------------------------

export const DataStore = {
  // -----------------------------------------------------------------------
  // CREATE
  // -----------------------------------------------------------------------

  /**
   * Create a new spot via the `create_spot` RPC function.
   * The RPC handles PostGIS ST_MakePoint conversion and sets user_id
   * from the authenticated session (auth.uid()).
   */
  async createSpot(input: CreateSpotInput): Promise<Spot> {
    const rpcParams: Record<string, unknown> = {
      p_name: input.name,
      p_lng: input.location.lng,
      p_lat: input.location.lat,
      p_district: '', // will be resolved by the caller or a future geocoding step
      p_category: input.category,
      p_custom_category: input.customCategory ?? null,
      p_rating: input.rating ? (input.rating as number) : null,
      p_notes: input.notes ?? null,
      p_visit_date: input.visitDate ?? new Date().toISOString().slice(0, 10),
      p_photo_urls: input.photoUrls ?? [],
    };
    const { data, error } = await supabase.rpc('create_spot', rpcParams as never);

    if (error) throw new Error(`createSpot failed: ${error.message}`);
    if (!data) throw new Error('createSpot returned no data');

    // The RPC returns a spots row (with WKB location). We know the coords
    // because we just supplied them, so construct the Spot directly.
    const row = data as unknown as SpotWithCoords;
    return {
      id: row.id,
      name: row.name,
      location: { lng: input.location.lng, lat: input.location.lat },
      district: row.district,
      category: row.category as SpotCategory,
      customCategory: row.custom_category ?? undefined,
      rating: row.rating ?? undefined,
      notes: row.notes ?? undefined,
      visitDate: row.visit_date,
      photoUrls: row.photo_urls ?? [],
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  },

  /**
   * Overload that accepts an explicit district (used when the caller has
   * already resolved the district from geocoding or the district polygon).
   */
  async createSpotWithDistrict(
    input: CreateSpotInput,
    district: string,
  ): Promise<Spot> {
    const rpcParams2: Record<string, unknown> = {
      p_name: input.name,
      p_lng: input.location.lng,
      p_lat: input.location.lat,
      p_district: district,
      p_category: input.category,
      p_custom_category: input.customCategory ?? null,
      p_rating: input.rating ? (input.rating as number) : null,
      p_notes: input.notes ?? null,
      p_visit_date: input.visitDate ?? new Date().toISOString().slice(0, 10),
      p_photo_urls: input.photoUrls ?? [],
    };
    const { data, error } = await supabase.rpc('create_spot', rpcParams2 as never);

    if (error) throw new Error(`createSpotWithDistrict failed: ${error.message}`);
    if (!data) throw new Error('createSpotWithDistrict returned no data');

    const row = data as unknown as SpotWithCoords;
    return {
      id: row.id,
      name: row.name,
      location: { lng: input.location.lng, lat: input.location.lat },
      district: row.district,
      category: row.category as SpotCategory,
      customCategory: row.custom_category ?? undefined,
      rating: row.rating ?? undefined,
      notes: row.notes ?? undefined,
      visitDate: row.visit_date,
      photoUrls: row.photo_urls ?? [],
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  },

  // -----------------------------------------------------------------------
  // READ (single)
  // -----------------------------------------------------------------------

  /**
   * Fetch a single spot by ID.
   * Uses the spots_with_coords view so we get lat/lng directly.
   */
  async getSpot(id: string): Promise<Spot | null> {
    const { data, error } = await supabase
      .from('spots_with_coords')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // not found
      throw new Error(`getSpot failed: ${error.message}`);
    }
    return data ? toSpot(data as SpotWithCoords) : null;
  },

  // -----------------------------------------------------------------------
  // UPDATE
  // -----------------------------------------------------------------------

  /**
   * Update a spot via the `update_spot` RPC function.
   * Only the provided fields are updated (COALESCE in SQL).
   */
  async updateSpot(id: string, input: UpdateSpotInput): Promise<Spot> {
    const updateParams: Record<string, unknown> = {
      p_id: id,
      p_name: input.name ?? null,
      p_lng: null, // location updates not yet exposed via UpdateSpotInput
      p_lat: null,
      p_category: input.category ?? null,
      p_custom_category: input.customCategory ?? null,
      p_rating: input.rating ? (input.rating as number) : null,
      p_notes: input.notes ?? null,
      p_visit_date: input.visitDate ?? null,
      p_photo_urls: input.photoUrls ?? null,
    };
    const { data, error } = await supabase.rpc('update_spot', updateParams as never);

    if (error) throw new Error(`updateSpot failed: ${error.message}`);
    if (!data) throw new Error('updateSpot returned no data');

    // Re-fetch from the view to get proper lat/lng
    const refreshed = await DataStore.getSpot(id);
    if (!refreshed) throw new Error('updateSpot: spot not found after update');
    return refreshed;
  },

  // -----------------------------------------------------------------------
  // DELETE
  // -----------------------------------------------------------------------

  /**
   * Delete a spot by ID.
   * RLS ensures only the owner can delete their spots.
   */
  async deleteSpot(id: string): Promise<void> {
    const { error } = await supabase
      .from('spots')
      .delete()
      .eq('id', id);

    if (error) throw new Error(`deleteSpot failed: ${error.message}`);
  },

  // -----------------------------------------------------------------------
  // LIST (with optional filters)
  // -----------------------------------------------------------------------

  /**
   * List spots for the authenticated user with optional filters.
   * Uses the spots_with_coords view for easy lat/lng access.
   */
  async listSpots(filters?: SearchFilters): Promise<Spot[]> {
    let query = supabase
      .from('spots_with_coords')
      .select('*');

    if (filters?.district) {
      query = query.eq('district', filters.district);
    }

    if (filters?.categories && filters.categories.length > 0) {
      query = query.in('category', filters.categories);
    }

    if (filters?.minRating) {
      query = query.gte('rating', filters.minRating);
    }

    if (filters?.query) {
      query = query.or(
        `name.ilike.%${filters.query}%,notes.ilike.%${filters.query}%`,
      );
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) throw new Error(`listSpots failed: ${error.message}`);
    return (data as SpotWithCoords[]).map(toSpot);
  },

  // -----------------------------------------------------------------------
  // NEARBY (spatial query)
  // -----------------------------------------------------------------------

  /**
   * Find spots within `radiusM` meters of the given coordinates.
   * Uses the `spots_within_radius` RPC backed by PostGIS ST_DWithin.
   */
  async findNearby(
    lng: number,
    lat: number,
    radiusM: number = 1000,
  ): Promise<Spot[]> {
    const nearbyParams: Record<string, unknown> = {
      user_lng: lng,
      user_lat: lat,
      radius_m: radiusM,
    };
    const { data, error } = await supabase.rpc('spots_within_radius', nearbyParams as never);

    if (error) throw new Error(`findNearby failed: ${error.message}`);
    if (!data || !Array.isArray(data)) return [];

    // The RPC returns raw spots rows (WKB location). We need to re-fetch
    // from the view to get lat/lng, or we can parse WKB. For simplicity,
    // batch-fetch by IDs from the view.
    const ids = (data as { id: string }[]).map((r) => r.id);
    if (ids.length === 0) return [];

    const { data: viewData, error: viewError } = await supabase
      .from('spots_with_coords')
      .select('*')
      .in('id', ids);

    if (viewError) throw new Error(`findNearby view fetch failed: ${viewError.message}`);
    return (viewData as SpotWithCoords[]).map(toSpot);
  },
};
