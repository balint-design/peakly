/*
  # Fix Profile Visibility and RLS Policies

  1. Changes
    - Drop existing RLS policies
    - Create new, simplified policies that ensure:
      - Public read access to all profiles
      - Authenticated users can manage their own profiles
    - Remove unnecessary complexity from profile management

  2. Security
    - Maintain proper access control
    - Allow public profile viewing
    - Restrict profile management to owners
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Enable profile management" ON profiles;
DROP POLICY IF EXISTS "Allow public profile viewing" ON profiles;

-- Create new, simplified policies
CREATE POLICY "Public can view all profiles"
ON profiles
FOR SELECT
TO public
USING (true);

CREATE POLICY "Users can manage their own profiles"
ON profiles
FOR ALL
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Drop the trigger and function as they're no longer needed
DROP TRIGGER IF EXISTS on_profile_change ON profiles;
DROP FUNCTION IF EXISTS manage_profile();

-- Ensure RLS is enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;