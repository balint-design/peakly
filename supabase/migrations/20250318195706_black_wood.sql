/*
  # Update profiles table schema

  1. Changes
    - Add new columns to profiles table:
      - full_name (text, nullable)
      - age (integer, nullable)
      - gender (text, nullable)
      - location (text, nullable)
      - avatar_url (text, nullable)
      - bio (text, nullable)
      - languages (text array, default ['DE'])

  2. Security
    - Update RLS policies for profile access
*/

-- Add new columns to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS full_name text,
ADD COLUMN IF NOT EXISTS age integer,
ADD COLUMN IF NOT EXISTS gender text,
ADD COLUMN IF NOT EXISTS location text,
ADD COLUMN IF NOT EXISTS avatar_url text,
ADD COLUMN IF NOT EXISTS bio text,
ADD COLUMN IF NOT EXISTS languages text[] DEFAULT ARRAY['DE']::text[];

-- Ensure RLS is enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policy for public profile viewing if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profiles' 
        AND policyname = 'Profiles are viewable by everyone'
    ) THEN
        CREATE POLICY "Profiles are viewable by everyone"
        ON profiles
        FOR SELECT
        TO public
        USING (true);
    END IF;
END $$;