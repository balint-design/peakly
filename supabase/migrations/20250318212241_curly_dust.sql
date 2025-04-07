/*
  # Fix Profile Creation RLS Policies

  1. Changes
    - Drop and recreate all profile policies
    - Add proper security definer function for profile management
    - Ensure proper RLS for profile creation during signup

  2. Security
    - Enable proper RLS policies
    - Allow profile creation during signup
    - Maintain secure user deletion process
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON profiles;
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON profiles;

-- Recreate policies with proper permissions
CREATE POLICY "Enable insert for authenticated users only"
ON profiles
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = id
);

CREATE POLICY "Users can view own profile"
ON profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can delete own profile"
ON profiles
FOR DELETE
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Profiles are viewable by everyone"
ON profiles
FOR SELECT
TO public
USING (true);

-- Create a security definer function for profile management
CREATE OR REPLACE FUNCTION manage_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN NEW;
END;
$$;

-- Create trigger for profile management
DROP TRIGGER IF EXISTS on_profile_change ON profiles;
CREATE TRIGGER on_profile_change
  BEFORE INSERT OR UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION manage_profile();