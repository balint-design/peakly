/*
  # Fix Public Access to Profiles and Skills

  1. Changes
    - Update RLS policies to ensure public access to profiles and skills
    - Simplify policy structure for better maintainability
    - Add missing public access policies

  2. Security
    - Maintain proper authentication for write operations
    - Enable public read access for all users
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Public can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can manage their own profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view own skills" ON user_skills;
DROP POLICY IF EXISTS "Users can insert own skills" ON user_skills;
DROP POLICY IF EXISTS "Users can update own skills" ON user_skills;
DROP POLICY IF EXISTS "Users can delete own skills" ON user_skills;

-- Create new policies for profiles
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

-- Create new policies for user_skills
CREATE POLICY "Public can view all skills"
ON user_skills
FOR SELECT
TO public
USING (true);

CREATE POLICY "Users can manage their own skills"
ON user_skills
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Ensure RLS is enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_skills ENABLE ROW LEVEL SECURITY;