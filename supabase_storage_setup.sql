-- Create storage buckets for images
-- Run this in your Supabase SQL editor

-- Create the 'memories' bucket for memory images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'memories',
  'memories',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Create the 'photos' bucket for polaroid photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'photos',
  'photos',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Enable public access to memories bucket
CREATE POLICY "Public Access" ON storage.objects
  FOR SELECT USING (bucket_id = 'memories');

CREATE POLICY "Authenticated users can upload to memories" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'memories' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users can delete their own memory images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'memories' 
    AND (auth.uid()::text = owner OR auth.role() = 'service_role')
  );

-- Enable public access to photos bucket
CREATE POLICY "Public Access" ON storage.objects
  FOR SELECT USING (bucket_id = 'photos');

CREATE POLICY "Authenticated users can upload to photos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'photos' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users can delete their own photos" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'photos' 
    AND (auth.uid()::text = owner OR auth.role() = 'service_role')
  );
