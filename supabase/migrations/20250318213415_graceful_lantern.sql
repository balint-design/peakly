/*
  # Fix Profile Creation and RLS Policies

  1. Changes
    - Drop and recreate RLS policies with proper permissions
    - Add bypass RLS policy for initial profile creation
    - Update manage_profile function to handle profile creation

  2. Security
    - Maintain RLS while allowing proper profile creation during signup
    - Ensure secure profile management
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON profiles;
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON profiles;

-- Create bypass RLS policy for initial profile creation
CREATE POLICY "Allow initial profile creation"
ON profiles
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = id OR
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = profiles.id
    AND auth.users.email IS NOT NULL
  )
);

-- Recreate other policies
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

-- Update manage_profile function to handle profile creation
CREATE OR REPLACE FUNCTION manage_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Allow profile creation for new users
  IF TG_OP = 'INSERT' THEN
    -- Verify the user exists in auth.users
    IF EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = NEW.id
      AND auth.users.email IS NOT NULL
    ) THEN
      RETURN NEW;
    END IF;
  END IF;

  -- For updates, ensure the user owns the profile
  IF TG_OP = 'UPDATE' THEN
    IF auth.uid() = NEW.id THEN
      RETURN NEW;
    END IF;
  END IF;

  RETURN NULL;
END;
$$;