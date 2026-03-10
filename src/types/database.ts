/**
 * Supabase Database type definitions for SF Discovery.
 *
 * These types mirror the schema defined in supabase/migrations/001_initial.sql.
 * If you regenerate types with `supabase gen types typescript`, replace this file.
 */

export interface Database {
  public: {
    Tables: {
      spots: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          location: string; // PostGIS geography stored as WKB hex
          district: string;
          category: string;
          custom_category: string | null;
          rating: number | null;
          notes: string | null;
          visit_date: string;
          photo_urls: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          location: string; // PostGIS geography
          district: string;
          category: string;
          custom_category?: string | null;
          rating?: number | null;
          notes?: string | null;
          visit_date?: string;
          photo_urls?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          location?: string;
          district?: string;
          category?: string;
          custom_category?: string | null;
          rating?: number | null;
          notes?: string | null;
          visit_date?: string;
          photo_urls?: string[];
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      spots_with_coords: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          lng: number;
          lat: number;
          district: string;
          category: string;
          custom_category: string | null;
          rating: number | null;
          notes: string | null;
          visit_date: string;
          photo_urls: string[];
          created_at: string;
          updated_at: string;
        };
      };
    };
    Functions: {
      create_spot: {
        Args: {
          p_name: string;
          p_lng: number;
          p_lat: number;
          p_district: string;
          p_category: string;
          p_custom_category?: string | null;
          p_rating?: number | null;
          p_notes?: string | null;
          p_visit_date?: string;
          p_photo_urls?: string[];
        };
        Returns: Database['public']['Tables']['spots']['Row'];
      };
      update_spot: {
        Args: {
          p_id: string;
          p_name?: string | null;
          p_lng?: number | null;
          p_lat?: number | null;
          p_district?: string | null;
          p_category?: string | null;
          p_custom_category?: string | null;
          p_rating?: number | null;
          p_notes?: string | null;
          p_visit_date?: string | null;
          p_photo_urls?: string[] | null;
        };
        Returns: Database['public']['Tables']['spots']['Row'];
      };
      spots_within_radius: {
        Args: {
          user_lng: number;
          user_lat: number;
          radius_m: number;
        };
        Returns: Database['public']['Tables']['spots']['Row'][];
      };
    };
    Enums: Record<string, never>;
  };
}

/**
 * Convenience aliases
 */
export type SpotRow = Database['public']['Tables']['spots']['Row'];
export type SpotInsert = Database['public']['Tables']['spots']['Insert'];
export type SpotUpdate = Database['public']['Tables']['spots']['Update'];
export type SpotWithCoords = Database['public']['Views']['spots_with_coords']['Row'];
