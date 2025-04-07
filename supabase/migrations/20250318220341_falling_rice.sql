/*
  # Add Storage Bucket and Policies

  1. New Storage
    - Create 'peakly' storage bucket for user avatars
    - Enable RLS on the bucket
    - Add policies for authenticated users to:
      - Upload their own avatars
      - Read any avatar
      - Update their own avatars
      - Delete their own avatars

  2. Security
    - Ensure users can only manage their own files
    - Allow public read access to all avatars
*/

-- Enable storage by inserting bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('peakly', 'peakly', true)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for storage
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'peakly');

CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'peakly' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'peakly' AND
  (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'peakly' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'peakly' AND
  (storage.foldername(name))[1] = auth.uid()::text
);