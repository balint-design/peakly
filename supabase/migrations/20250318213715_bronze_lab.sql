/*
  # Fix Profile Creation Permissions

  1. Changes
    - Grant necessary permissions to authenticated users
    - Update profile management function
    - Simplify RLS policies

  2. Security
    - Maintain proper access control
    - Ensure secure profile creation
    - Keep existing security measures
*/

-- Drop existing function and trigger
DROP TRIGGER IF EXISTS on_profile_change ON profiles;
DROP FUNCTION IF EXISTS manage_profile();
DROP FUNCTION IF EXISTS create_profile(uuid, text, text, integer, text, text, text, text[]);

-- Create a more permissive profile management function
CREATE OR REPLACE FUNCTION manage_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- For inserts, allow if the user is authenticated and matches the ID
  IF TG_OP = 'INSERT' THEN
    IF auth.uid() = NEW.id THEN
      RETURN NEW;
    END IF;
  END IF;

  -- For updates, allow if the user owns the profile
  IF TG_OP = 'UPDATE' THEN
    IF auth.uid() = NEW.id THEN
      RETURN NEW;
    END IF;
  END IF;

  RETURN NULL;
END;
$$;

-- Recreate trigger
CREATE TRIGGER on_profile_change
  BEFORE INSERT OR UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION manage_profile();

-- Drop existing policies
DROP POLICY IF EXISTS "Allow initial profile creation" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON profiles;
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON profiles;

-- Create simplified policies
CREATE POLICY "Enable profile management"
ON profiles
FOR ALL
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Allow public profile viewing"
ON profiles
FOR SELECT
TO public
USING (true);