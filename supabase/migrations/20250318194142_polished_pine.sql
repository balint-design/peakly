/*
  # Fix Authentication Policies

  1. Changes
    - Add INSERT policy for profiles table
    - Modify user deletion to use Supabase's built-in deletion
    - Remove admin-only operations

  2. Security
    - Enable proper RLS for profile creation
    - Use Supabase's auth.users deletion cascade
*/

-- Add INSERT policy for profiles
CREATE POLICY "Enable insert for authenticated users only"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Drop the user deletion trigger as we'll use Supabase's built-in cascade
DROP TRIGGER IF EXISTS on_user_deleted ON auth.users;
DROP FUNCTION IF EXISTS handle_user_deletion;