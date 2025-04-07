/*
  # Fix Profile Creation RLS Policies

  1. Changes
    - Drop and recreate insert policy for profiles table
    - Add bypass RLS option for the handle_deleted_user function
    - Ensure proper security context for trigger function

  2. Security
    - Maintain RLS while allowing proper profile creation
    - Ensure secure user deletion process
*/

-- Drop existing policies that might conflict
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON profiles;

-- Create new insert policy that allows profile creation during signup
CREATE POLICY "Enable insert for authenticated users only"
ON profiles
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = id OR 
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = profiles.id
    AND auth.users.id = auth.uid()
  )
);

-- Recreate the deletion function with proper security context
CREATE OR REPLACE FUNCTION handle_deleted_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Delete the user's profile (will cascade to skills)
  DELETE FROM profiles WHERE id = OLD.id;
  RETURN OLD;
END;
$$;

-- Recreate trigger for auth user deletions
DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users;
CREATE TRIGGER on_auth_user_deleted
  AFTER DELETE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_deleted_user();