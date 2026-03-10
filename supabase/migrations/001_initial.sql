-- SF Discovery: Initial Schema
-- Requires PostGIS extension for spatial queries

-- ============================================
-- 1. Enable PostGIS
-- ============================================
CREATE EXTENSION IF NOT EXISTS postgis;

-- ============================================
-- 2. Spots table
-- ============================================
CREATE TABLE spots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  name TEXT NOT NULL,
  location GEOGRAPHY(POINT, 4326) NOT NULL,
  district TEXT NOT NULL,
  category TEXT NOT NULL,
  custom_category TEXT,
  rating SMALLINT CHECK (rating >= 1 AND rating <= 5),
  notes TEXT,
  visit_date DATE DEFAULT CURRENT_DATE,
  photo_urls TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 3. Indexes
-- ============================================

-- Spatial index for proximity queries
CREATE INDEX spots_location_idx ON spots USING GIST (location);

-- Indexes for common filter columns
CREATE INDEX spots_district_idx ON spots (district);
CREATE INDEX spots_category_idx ON spots (category);
CREATE INDEX spots_user_id_idx ON spots (user_id);

-- ============================================
-- 4. Auto-update updated_at trigger
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER spots_updated_at
  BEFORE UPDATE ON spots
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- 5. Row Level Security
-- ============================================
ALTER TABLE spots ENABLE ROW LEVEL SECURITY;

CREATE POLICY spots_owner_select ON spots
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY spots_owner_insert ON spots
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY spots_owner_update ON spots
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY spots_owner_delete ON spots
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- 6. RPC: Find spots within a radius (meters)
-- ============================================
CREATE OR REPLACE FUNCTION spots_within_radius(
  user_lng FLOAT,
  user_lat FLOAT,
  radius_m FLOAT
)
RETURNS SETOF spots AS $$
  SELECT * FROM spots
  WHERE ST_DWithin(
    location,
    ST_MakePoint(user_lng, user_lat)::geography,
    radius_m
  )
  ORDER BY location <-> ST_MakePoint(user_lng, user_lat)::geography;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ============================================
-- 7. RPC: Create a spot (handles PostGIS geography)
-- ============================================
CREATE OR REPLACE FUNCTION create_spot(
  p_name TEXT,
  p_lng FLOAT,
  p_lat FLOAT,
  p_district TEXT,
  p_category TEXT,
  p_custom_category TEXT DEFAULT NULL,
  p_rating SMALLINT DEFAULT NULL,
  p_notes TEXT DEFAULT NULL,
  p_visit_date DATE DEFAULT CURRENT_DATE,
  p_photo_urls TEXT[] DEFAULT '{}'
) RETURNS spots AS $$
  INSERT INTO spots (
    user_id, name, location, district, category,
    custom_category, rating, notes, visit_date, photo_urls
  )
  VALUES (
    auth.uid(),
    p_name,
    ST_MakePoint(p_lng, p_lat)::geography,
    p_district,
    p_category,
    p_custom_category,
    p_rating,
    p_notes,
    p_visit_date,
    p_photo_urls
  )
  RETURNING *;
$$ LANGUAGE sql SECURITY DEFINER;

-- ============================================
-- 8. RPC: Update a spot (handles PostGIS geography)
-- ============================================
CREATE OR REPLACE FUNCTION update_spot(
  p_id UUID,
  p_name TEXT DEFAULT NULL,
  p_lng FLOAT DEFAULT NULL,
  p_lat FLOAT DEFAULT NULL,
  p_district TEXT DEFAULT NULL,
  p_category TEXT DEFAULT NULL,
  p_custom_category TEXT DEFAULT NULL,
  p_rating SMALLINT DEFAULT NULL,
  p_notes TEXT DEFAULT NULL,
  p_visit_date DATE DEFAULT NULL,
  p_photo_urls TEXT[] DEFAULT NULL
) RETURNS spots AS $$
  UPDATE spots SET
    name = COALESCE(p_name, name),
    location = CASE
      WHEN p_lng IS NOT NULL AND p_lat IS NOT NULL
      THEN ST_MakePoint(p_lng, p_lat)::geography
      ELSE location
    END,
    district = COALESCE(p_district, district),
    category = COALESCE(p_category, category),
    custom_category = COALESCE(p_custom_category, custom_category),
    rating = COALESCE(p_rating, rating),
    notes = COALESCE(p_notes, notes),
    visit_date = COALESCE(p_visit_date, visit_date),
    photo_urls = COALESCE(p_photo_urls, photo_urls),
    updated_at = NOW()
  WHERE id = p_id AND user_id = auth.uid()
  RETURNING *;
$$ LANGUAGE sql SECURITY DEFINER;

-- ============================================
-- 9. View: spots with extracted lat/lng
--    (the geography column returns WKB hex;
--     this view exposes human-readable coords)
-- ============================================
CREATE OR REPLACE VIEW spots_with_coords AS
SELECT
  id,
  user_id,
  name,
  ST_X(location::geometry) AS lng,
  ST_Y(location::geometry) AS lat,
  district,
  category,
  custom_category,
  rating,
  notes,
  visit_date,
  photo_urls,
  created_at,
  updated_at
FROM spots;
