/*
  # Fix Profile Creation

  1. Changes
    - Create a secure function for profile creation
    - Add proper error handling and validation
    - Ensure proper security context

  2. Security
    - Use security definer to bypass RLS
    - Validate user existence
    - Maintain data integrity
*/

-- Create a secure function for profile creation
CREATE OR REPLACE FUNCTION create_profile(
  user_id uuid,
  user_username text,
  user_full_name text DEFAULT NULL,
  user_age integer DEFAULT NULL,
  user_gender text DEFAULT NULL,
  user_location text DEFAULT NULL,
  user_bio text DEFAULT NULL,
  user_languages text[] DEFAULT ARRAY['DE']::text[]
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verify the user exists in auth.users
  IF NOT EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = user_id
    AND email IS NOT NULL
  ) THEN
    RAISE EXCEPTION 'User does not exist in auth.users';
  END IF;

  -- Check if username is taken
  IF EXISTS (
    SELECT 1 FROM profiles
    WHERE username = user_username
  ) THEN
    RAISE EXCEPTION 'Username is already taken';
  END IF;

  -- Insert the profile
  INSERT INTO profiles (
    id,
    username,
    full_name,
    age,
    gender,
    location,
    bio,
    languages
  ) VALUES (
    user_id,
    user_username,
    user_full_name,
    user_age,
    user_gender,
    user_location,
    user_bio,
    user_languages
  );
END;
$$;