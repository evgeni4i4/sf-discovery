-- Migration: Set up Supabase Storage for spot photos
-- This migration creates RLS policies for the spot-photos bucket.
--
-- PREREQUISITE: The "spot-photos" bucket must be created first.
-- Run this command (or use the Supabase dashboard):
--
--   curl -X POST 'https://pnvnszpxulycgcmdpgdg.supabase.co/storage/v1/bucket' \
--     -H "apikey: <SERVICE_ROLE_KEY>" \
--     -H "Authorization: Bearer <SERVICE_ROLE_KEY>" \
--     -H "Content-Type: application/json" \
--     -d '{"id": "spot-photos", "name": "spot-photos", "public": true}'

-- Allow anyone to read photos (public bucket)
CREATE POLICY "Public read access" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'spot-photos');

-- Allow authenticated users to upload photos
CREATE POLICY "Users can upload photos" ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'spot-photos' AND auth.uid() IS NOT NULL);

-- Allow users to delete their own photos (photos are stored under userId/ prefix)
CREATE POLICY "Users can delete own photos" ON storage.objects
  FOR DELETE
  USING (bucket_id = 'spot-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
