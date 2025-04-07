/*
  # Fix Profile Creation and User Deletion

  1. Changes
    - Fix profile creation policy to properly check username uniqueness
    - Add cascade delete trigger for auth users
    - Remove problematic NEW reference in policy

  2. Security
    - Maintain proper RLS policies
    - Ensure clean user deletion
    - Prevent duplicate usernames
*/

-- Drop existing policies that might conflict
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON profiles;

-- Create new insert policy with proper checks
CREATE POLICY "Enable insert for authenticated users only"
ON profiles
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = id
);

-- Create unique index for username if it doesn't exist
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'profiles_username_key'
  ) THEN
    CREATE UNIQUE INDEX profiles_username_key ON profiles(username);
  END IF;
END $$;

-- Create function to handle user deletions
CREATE OR REPLACE FUNCTION handle_deleted_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete the user's profile (will cascade to skills)
  DELETE FROM profiles WHERE id = OLD.id;
  RETURN OLD;
END;
$$;

-- Create trigger for auth user deletions
DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users;
CREATE TRIGGER on_auth_user_deleted
  AFTER DELETE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_deleted_user();