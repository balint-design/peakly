/*
  # Add Profile Fields and Public Access

  1. New Fields
    - Add full_name, age, gender, location to profiles table
    - Add avatar_url for profile pictures
    - Add bio text field
    - Add language preferences with default to German

  2. Security
    - Add policy for public profile viewing
    - Note: Update policy already exists from previous migration
*/

-- Add new columns to profiles table
ALTER TABLE profiles
ADD COLUMN full_name text,
ADD COLUMN age integer,
ADD COLUMN gender text,
ADD COLUMN location text,
ADD COLUMN avatar_url text,
ADD COLUMN bio text,
ADD COLUMN languages text[] DEFAULT ARRAY['DE']::text[];

-- Add policy for public profile viewing
CREATE POLICY "Profiles are viewable by everyone"
ON profiles
FOR SELECT
TO public
USING (true);